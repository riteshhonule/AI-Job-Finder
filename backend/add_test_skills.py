#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Skill

user = User.objects.get(username='admin')

# Add test skills
skills = ['python', 'javascript', 'react', 'django', 'rest api', 'postgresql']

for skill_name in skills:
    skill, created = Skill.objects.get_or_create(
        user=user,
        name=skill_name,
        defaults={'proficiency': 'intermediate', 'extracted_from_resume': False}
    )
    status = 'Created' if created else 'Already exists'
    print(f"{status}: {skill_name}")

print(f"\n✅ Added {len(skills)} skills to admin user")
