from rest_framework import serializers
from documents.models import Document
from insights.models import Insight


class InsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insight
        fields = [
            "id",
            "status",
            "summary",
            "top_words",
            "created_at",
            "updated_at",
        ]


class DocumentSerializer(serializers.ModelSerializer):
    insight = InsightSerializer(read_only=True)

    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Document
        fields = [
            "id",
            "file",
            "owner",
            "insight",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
