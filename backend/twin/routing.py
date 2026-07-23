from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/twin/chat/$', consumers.TwinChatConsumer.as_asgi()),
]
