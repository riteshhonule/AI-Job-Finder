from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Resume, Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'proficiency', 'extracted_from_resume', 'created_at']
        read_only_fields = ['id', 'created_at']


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'file', 'raw_text', 'uploaded_at', 'updated_at']
        read_only_fields = ['id', 'raw_text', 'uploaded_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'bio', 'location', 'years_experience', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    resume = ResumeSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'resume', 'skills']
        read_only_fields = ['id']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': True}
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        UserProfile.objects.create(user=user)
        return user
