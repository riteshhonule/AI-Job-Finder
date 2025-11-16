from django.contrib import admin
from .models import Job, JobSkill

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'job_type', 'posted_date']
    search_fields = ['title', 'company', 'description']
    list_filter = ['job_type', 'source', 'posted_date']

@admin.register(JobSkill)
class JobSkillAdmin(admin.ModelAdmin):
    list_display = ['job', 'skill_name', 'importance']
    search_fields = ['job__title', 'skill_name']
    list_filter = ['importance']
