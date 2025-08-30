from rest_framework import generics, status, parsers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from documents.models import Document
from insights.models import Insight
from insights.tasks import generate_insights_from_document
from .serializers import DocumentSerializer


class DocumentUploadView(generics.CreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        document = serializer.save()

        Insight.objects.create(document=document)

        generate_insights_from_document.delay(document.id)


class DocumentHistoryView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Document.objects.filter(owner=user).order_by("-created_at")
        return Document.objects.none()
