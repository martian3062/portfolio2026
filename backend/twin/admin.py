from django.contrib import admin
from .models import ChatLog

@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    list_display  = ('created_at', 'question', 'source', 'rating')
    list_filter   = ('source', 'rating')
    search_fields = ('question', 'response')
    readonly_fields = ('created_at',)
