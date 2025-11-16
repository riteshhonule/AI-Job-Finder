from django.db import models

class Job(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True, null=True)
    salary_min = models.IntegerField(blank=True, null=True)
    salary_max = models.IntegerField(blank=True, null=True)
    job_type = models.CharField(
        max_length=50,
        choices=[('full-time', 'Full-time'), ('part-time', 'Part-time'), ('contract', 'Contract'), ('remote', 'Remote')],
        default='full-time'
    )
    url = models.URLField(blank=True, null=True)
    source = models.CharField(max_length=100, default='internal')
    posted_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-posted_date']

    def __str__(self):
        return f"{self.title} at {self.company}"


class JobSkill(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='required_skills')
    skill_name = models.CharField(max_length=255)
    importance = models.CharField(
        max_length=20,
        choices=[('required', 'Required'), ('preferred', 'Preferred'), ('nice_to_have', 'Nice to have')],
        default='required'
    )

    class Meta:
        unique_together = ('job', 'skill_name')

    def __str__(self):
        return f"{self.job.title} - {self.skill_name}"
