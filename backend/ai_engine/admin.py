from django.contrib import admin
from .models import MatchResult

@admin.register(MatchResult)
class MatchResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'match_score', 'created_at']
    search_fields = ['user__username', 'job__title']
    list_filter = ['match_score', 'created_at']
