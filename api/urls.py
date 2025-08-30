from django.urls import path
from .views import DocumentUploadView, DocumentHistoryView

app_name = 'api'

urlpatterns = [
    path('upload-resume/', DocumentUploadView.as_view(), name='upload-resume'),
    path('history/', DocumentHistoryView.as_view(), name='document-history'),
]
