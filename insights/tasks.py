import re
from collections import Counter
from PyPDF2 import PdfReader
from django.core.files.base import ContentFile
from celery import shared_task

from documents.models import Document
from .models import Insight
import google.generativeai as genai
import os


@shared_task
def generate_insights_from_document(document_id: int):
    try:
        document = Document.objects.get(id=document_id)
        insight = document.insight
    except (Document.DoesNotExist, Insight.DoesNotExist) as e:
        print(f"Error finding document or insight: {e}")
        return

    try:
        text_content = ""
        with document.file.open("rb") as f:
            reader = PdfReader(f)
            for page in reader.pages:
                text_content += page.extract_text()

        insight.processed_text = text_content

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set.")

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"Summarize the following resume text in 3-5 bullet points, focusing on skills and experience:\n\n{text_content}"
        response = model.generate_content(prompt)

        summary = response.text

        if not summary:
            raise ValueError("AI summary generation failed or returned empty.")

        insight.summary = summary
        insight.status = Insight.Status.SUCCESS

    except Exception as e:
        print(f"AI processing failed, running fallback: {e}")
        try:
            words = re.findall(r"\b\w+\b", text_content.lower())
            word_counts = Counter(words)
            top_words = [word for word, count in word_counts.most_common(5)]
            insight.top_words = {"words": top_words}
            insight.status = Insight.Status.FAILED
        except Exception as fallback_e:
            print(f"Fallback mechanism failed: {fallback_e}")
            insight.status = Insight.Status.FAILED

    finally:
        insight.save()
