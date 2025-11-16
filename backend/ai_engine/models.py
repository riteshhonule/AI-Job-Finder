from django.db import models
from django.contrib.auth.models import User
from jobs.models import Job

class MatchResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='match_results')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='match_results')
    match_score = models.FloatField()  # 0-100
    matched_skills = models.JSONField(default=list)  # List of matched skills
    missing_skills = models.JSONField(default=list)  # List of missing skills
    summary = models.TextField(blank=True, null=True)  # AI-generated summary
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-match_score', '-created_at']
        unique_together = ('user', 'job')

    def __str__(self):
        return f"{self.user.username} - {self.job.title} ({self.match_score}%)"
