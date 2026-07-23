import json
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.throttling import AnonRateThrottle
from rest_framework.response import Response
from rest_framework import status


@api_view(['POST'])
@throttle_classes([AnonRateThrottle])
def chat(request):
    """
    POST /api/twin/chat/
    Body: { "message": "..." }
    Returns: { "response": "...", "source": "model|retrieval|fallback" }
    """
    message = request.data.get('message', '').strip()
    if not message:
        return Response({'error': 'message required'}, status=status.HTTP_400_BAD_REQUEST)

    if len(message) > 1000:
        return Response({'error': 'message too long'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        from .training.inference import answer
        response_text = answer(message)
        return Response({'response': response_text, 'source': 'twin'})
    except Exception as e:
        return Response({
            'response': 'inference engine offline — reach out at sandhupardeep300@gmail.com',
            'source': 'fallback',
        })


@api_view(['GET'])
def health(request):
    """GET /api/twin/health/ — liveness check"""
    return Response({'status': 'ok', 'twin': 'pardeep'})


@csrf_exempt
def chat_stream(request):
    """
    POST /api/twin/stream/
    Returns Server-Sent Events stream for token-by-token streaming.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)

    try:
        body = json.loads(request.body)
        message = body.get('message', '').strip()
    except (json.JSONDecodeError, AttributeError):
        return JsonResponse({'error': 'invalid JSON'}, status=400)

    if not message:
        return JsonResponse({'error': 'message required'}, status=400)

    def _event_stream():
        try:
            from .training.inference import answer
            response_text = answer(message)

            # Simulate streaming by sending word-by-word
            words = response_text.split()
            for i, word in enumerate(words):
                chunk = word + (' ' if i < len(words) - 1 else '')
                yield f"data: {json.dumps({'token': chunk})}\n\n"

            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception:
            yield f"data: {json.dumps({'token': 'inference offline', 'done': True})}\n\n"

    response = StreamingHttpResponse(
        _event_stream(),
        content_type='text/event-stream',
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response
