from django.db import models
from django.conf import settings


class Insight(models.Model):
    document = models.OneToOneField(
        "documents.Document", on_delete=models.CASCADE, related_name="insight"
    )

    processed_text = models.TextField(help_text="Text extracted from the document.")

    summary = models.TextField(null=True, blank=True, help_text="AI-generated summary.")

    top_words = models.JSONField(
        null=True, blank=True, help_text="Fallback top 5 most frequent words."
    )

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Insights for {self.document.file.name}"

