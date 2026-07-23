from django.urls import path
from . import views

urlpatterns = [
    path('chat/',   views.chat,        name='twin-chat'),
    path('stream/', views.chat_stream, name='twin-stream'),
    path('health/', views.health,      name='twin-health'),
]
