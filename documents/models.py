from django.db import models
from django.conf import settings


class Document(models.Model):
    file = models.FileField(upload_to="documents/%Y/%m/")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="documents"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        try:
            return self.file.name.split("/")[-1]
        except:
            return f"Document {self.id}"

