"""
Digital Twin inference engine.

Architecture:
1. Semantic retrieval: sentence-transformers embeds the question,
   FAISS finds the closest Q&A pairs from Pardeep's dataset.
2. Context injection: top-k retrieved pairs + PARDEEP_CONTEXT are
   prepended as system context to the generative model.
3. Generation: fine-tuned (or prompted) causal LM produces a response
   in Pardeep's voice.

Falls back gracefully if heavy ML deps aren't installed yet.
"""

import os
import json
import numpy as np
from pathlib import Path
from django.conf import settings

from .dataset import QA_PAIRS, PARDEEP_CONTEXT

_embedder   = None
_faiss_index = None
_qa_embeddings = None
_generator  = None
_tokenizer  = None

def _load_embedder():
    global _embedder, _faiss_index, _qa_embeddings
    if _embedder is not None:
        return

    try:
        from sentence_transformers import SentenceTransformer
        import faiss

        _embedder = SentenceTransformer('all-MiniLM-L6-v2')

        questions = [p['q'] for p in QA_PAIRS]
        _qa_embeddings = _embedder.encode(questions, convert_to_numpy=True).astype('float32')

        dim = _qa_embeddings.shape[1]
        _faiss_index = faiss.IndexFlatIP(dim)

        # Normalise for cosine similarity via inner product
        norms = np.linalg.norm(_qa_embeddings, axis=1, keepdims=True)
        _faiss_index.add(_qa_embeddings / norms)
    except ImportError:
        pass  # deps not installed — fallback mode


def _load_generator():
    global _generator, _tokenizer
    if _generator is not None:
        return

    model_dir = settings.TWIN_MODEL_DIR

    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
        import torch

        # Check for fine-tuned model first, fall back to base
        model_path = str(model_dir / 'pardeep_twin') if (model_dir / 'pardeep_twin').exists() else 'microsoft/phi-2'

        _tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map='auto',
            trust_remote_code=True,
        )
        _generator = pipeline(
            'text-generation',
            model=model,
            tokenizer=_tokenizer,
            max_new_tokens=256,
            temperature=0.75,
            do_sample=True,
            repetition_penalty=1.15,
        )
    except (ImportError, OSError):
        pass  # heavy deps not installed — semantic fallback only


def _retrieve(question: str, k: int = 3) -> list[dict]:
    """Return top-k Q&A pairs most semantically similar to question."""
    if _embedder is None or _faiss_index is None:
        return []

    q_emb = _embedder.encode([question], convert_to_numpy=True).astype('float32')
    q_emb = q_emb / np.linalg.norm(q_emb, axis=1, keepdims=True)
    scores, idxs = _faiss_index.search(q_emb, k)
    return [QA_PAIRS[i] for i in idxs[0] if i < len(QA_PAIRS)]


def _format_prompt(question: str, retrieved: list[dict]) -> str:
    context_qa = '\n'.join(
        f"Q: {p['q']}\nA: {p['a']}" for p in retrieved
    )
    return (
        f"You are Pardeep's digital twin. Answer exactly as Pardeep would — "
        f"technical, direct, no filler. Use first person.\n\n"
        f"--- About Pardeep ---\n{PARDEEP_CONTEXT.strip()}\n\n"
        f"--- Relevant Q&A ---\n{context_qa}\n\n"
        f"User question: {question}\n"
        f"Pardeep's twin response:"
    )


def answer(question: str) -> str:
    """
    Main inference entry point.
    Returns a string response in Pardeep's voice.
    """
    _load_embedder()
    _load_generator()

    retrieved = _retrieve(question, k=3)

    # If generator is available, use it
    if _generator is not None:
        prompt = _format_prompt(question, retrieved)
        output = _generator(prompt)[0]['generated_text']
        # Strip the prompt, return only the new text
        response = output[len(prompt):].strip()
        # Stop at first double newline (stay concise)
        response = response.split('\n\n')[0].strip()
        if response:
            return response

    # Semantic-only fallback: return closest matching answer
    if retrieved:
        best = retrieved[0]
        return best['a']

    # Last resort: hardcoded fallback
    return (
        "I'm still warming up my inference engine. "
        "Reach out directly: sandhupardeep300@gmail.com"
    )
