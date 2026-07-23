"""
WebSocket consumer for real-time token streaming from the Digital Twin.
Connect: ws://localhost:8000/ws/twin/chat/
Send: {"message": "your question"}
Receive: {"token": "word "} ... {"done": true}
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async


class TwinChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()

    async def disconnect(self, code):
        pass

    async def receive(self, text_data):
        try:
            data    = json.loads(text_data)
            message = data.get('message', '').strip()
        except (json.JSONDecodeError, AttributeError):
            await self.send(json.dumps({'error': 'invalid JSON'}))
            return

        if not message:
            await self.send(json.dumps({'error': 'empty message'}))
            return

        response = await sync_to_async(self._infer)(message)

        words = response.split()
        for i, word in enumerate(words):
            token = word + (' ' if i < len(words) - 1 else '')
            await self.send(json.dumps({'token': token}))

        await self.send(json.dumps({'done': True}))

    @staticmethod
    def _infer(message: str) -> str:
        try:
            from .training.inference import answer
            return answer(message)
        except Exception:
            return 'inference engine offline — sandhupardeep300@gmail.com'
