from django.db import models


class ChatLog(models.Model):
    """Optional: log conversations for improving the model later."""
    question    = models.TextField()
    response    = models.TextField()
    source      = models.CharField(max_length=32, default='twin')
    created_at  = models.DateTimeField(auto_now_add=True)
    rating      = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.created_at:%Y-%m-%d %H:%M} — {self.question[:60]}"
