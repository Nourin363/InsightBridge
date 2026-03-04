from rest_framework import serializers
from .models import Issue

class IssueSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    class Meta:
        model = Issue
        fields = '__all__'
