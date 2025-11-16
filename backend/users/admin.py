from django.contrib import admin
from .models import UserProfile, Resume, Skill

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'years_experience', 'created_at']
    search_fields = ['user__username', 'location']

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['user', 'uploaded_at', 'updated_at']
    search_fields = ['user__username']

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'proficiency', 'extracted_from_resume']
    search_fields = ['user__username', 'name']
    list_filter = ['proficiency', 'extracted_from_resume']
