from rest_framework import serializers
from .models import MatchResult


class MatchResultSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    job_description = serializers.CharField(source='job.description', read_only=True)

    class Meta:
        model = MatchResult
        fields = ['id', 'job', 'job_title', 'job_company', 'job_description', 'match_score', 
                  'matched_skills', 'missing_skills', 'summary', 'created_at']
        read_only_fields = ['id', 'created_at']
