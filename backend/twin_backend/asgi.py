import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import twin.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'twin_backend.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(twin.routing.websocket_urlpatterns)
    ),
})
