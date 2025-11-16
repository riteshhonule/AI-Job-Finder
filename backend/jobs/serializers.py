from rest_framework import serializers
from .models import Job, JobSkill


class JobSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSkill
        fields = ['id', 'skill_name', 'importance']
        read_only_fields = ['id']


class JobSerializer(serializers.ModelSerializer):
    required_skills = JobSkillSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = ['id', 'title', 'company', 'description', 'location', 'salary_min', 'salary_max', 
                  'job_type', 'url', 'source', 'posted_date', 'required_skills', 'created_at', 'updated_at']
        read_only_fields = ['id', 'posted_date', 'created_at', 'updated_at']
