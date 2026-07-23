"""
Fine-tuning pipeline for Pardeep's Digital Twin.

Usage (from backend/):
    python -m twin.training.trainer --epochs 3 --output twin/models/pardeep_twin

This script fine-tunes a causal LM (default: microsoft/phi-2) on Pardeep's
Q&A dataset using LoRA (PEFT) for efficient adaptation without full retraining.
"""

import argparse
import json
from pathlib import Path
from .dataset import QA_PAIRS, PARDEEP_CONTEXT


def build_training_samples() -> list[str]:
    """Convert Q&A pairs into instruction-tuning format."""
    samples = []
    for pair in QA_PAIRS:
        text = (
            f"<|system|>You are Pardeep Singh's digital twin. "
            f"Answer in first person, technical and direct.\n"
            f"<|user|>{pair['q']}\n"
            f"<|assistant|>{pair['a']}\n"
        )
        samples.append(text)
    return samples


def train(base_model: str = 'microsoft/phi-2', output_dir: str = 'twin/models/pardeep_twin',
          epochs: int = 3, batch_size: int = 2, lr: float = 2e-4):
    try:
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments
        from peft import LoraConfig, get_peft_model, TaskType
        from datasets import Dataset
    except ImportError as e:
        print(f"Training deps not installed: {e}")
        print("Run: pip install peft datasets accelerate bitsandbytes")
        return

    print(f"Loading base model: {base_model}")
    tokenizer = AutoTokenizer.from_pretrained(base_model, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        base_model,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        trust_remote_code=True,
    )

    # LoRA config — adapt attention layers only
    lora_cfg = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=16,
        lora_alpha=32,
        target_modules=['q_proj', 'v_proj'],
        lora_dropout=0.05,
        bias='none',
    )
    model = get_peft_model(model, lora_cfg)
    model.print_trainable_parameters()

    samples = build_training_samples()
    raw_ds = Dataset.from_dict({'text': samples})

    def tokenize(batch):
        return tokenizer(
            batch['text'],
            truncation=True,
            max_length=512,
            padding='max_length',
        )

    ds = raw_ds.map(tokenize, batched=True, remove_columns=['text'])
    ds = ds.map(lambda x: {'labels': x['input_ids']})

    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        learning_rate=lr,
        fp16=torch.cuda.is_available(),
        logging_steps=5,
        save_strategy='epoch',
        report_to='none',
    )

    from transformers import Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=ds,
    )

    print("Starting fine-tuning...")
    trainer.train()

    # Merge LoRA weights and save
    merged = model.merge_and_unload()
    merged.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Saved fine-tuned model to {output_dir}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-model', default='microsoft/phi-2')
    parser.add_argument('--output', default='twin/models/pardeep_twin')
    parser.add_argument('--epochs', type=int, default=3)
    parser.add_argument('--batch-size', type=int, default=2)
    parser.add_argument('--lr', type=float, default=2e-4)
    args = parser.parse_args()
    train(args.base_model, args.output, args.epochs, args.batch_size, args.lr)
