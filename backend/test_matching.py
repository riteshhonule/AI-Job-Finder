"""
Test script for AI Job Matching functionality
Run this script to verify the matching system works correctly
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Skill
from jobs.models import Job, JobSkill
from ai_engine.models import MatchResult
from ai_engine.nlp_utils import (
    calculate_skill_match,
    calculate_ai_match_score,
    calculate_similarity_score
)


def test_skill_similarity():
    """Test skill similarity scoring"""
    print("\n" + "="*60)
    print("TEST 1: Skill Similarity Scoring")
    print("="*60)
    
    test_cases = [
        ("python", "python", 1.0, "Exact match"),
        ("python", "django", 0.7, "Related skills"),
        ("javascript", "react", 0.7, "Related skills"),
        ("python", "javascript", 0.0, "Unrelated skills"),
    ]
    
    for user_skill, job_skill, expected, description in test_cases:
        score = calculate_similarity_score(user_skill, job_skill)
        status = "✓" if score == expected else "✗"
        print(f"{status} {description}: {user_skill} vs {job_skill} = {score} (expected {expected})")


def test_skill_match():
    """Test skill matching logic"""
    print("\n" + "="*60)
    print("TEST 2: Skill Matching Logic")
    print("="*60)
    
    user_skills = ["Python", "JavaScript", "SQL"]
    job_skills = ["Python", "Django", "PostgreSQL"]
    
    matched, missing = calculate_skill_match(user_skills, job_skills)
    
    print(f"User Skills: {user_skills}")
    print(f"Job Skills: {job_skills}")
    print(f"Matched Skills: {matched}")
    print(f"Missing Skills: {missing}")
    
    assert "python" in matched, "Python should be matched"
    assert "django" in missing, "Django should be missing"
    print("✓ Skill matching works correctly")


def test_ai_match_score():
    """Test AI match score calculation"""
    print("\n" + "="*60)
    print("TEST 3: AI Match Score Calculation")
    print("="*60)
    
    test_cases = [
        {
            "name": "Perfect Match",
            "user_skills": ["Python", "Django", "PostgreSQL"],
            "job_skills": ["Python", "Django", "PostgreSQL"],
            "min_score": 95,
        },
        {
            "name": "Partial Match",
            "user_skills": ["Python", "JavaScript"],
            "job_skills": ["Python", "Django", "PostgreSQL"],
            "min_score": 30,
        },
        {
            "name": "No Match",
            "user_skills": ["Ruby", "PHP"],
            "job_skills": ["Python", "Django"],
            "min_score": 0,
        },
    ]
    
    for test in test_cases:
        matched, missing = calculate_skill_match(test["user_skills"], test["job_skills"])
        score = calculate_ai_match_score(
            test["user_skills"],
            test["job_skills"],
            matched,
            missing
        )
        status = "✓" if score >= test["min_score"] else "✗"
        print(f"{status} {test['name']}: {score}% (min expected {test['min_score']}%)")


def test_database_integration():
    """Test database integration"""
    print("\n" + "="*60)
    print("TEST 4: Database Integration")
    print("="*60)
    
    try:
        # Check if test user exists
        test_user, created = User.objects.get_or_create(
            username='test_matcher',
            defaults={'email': 'test@matcher.com'}
        )
        print(f"✓ Test user: {test_user.username} ({'created' if created else 'existing'})")
        
        # Check skills
        skills = Skill.objects.filter(user=test_user)
        print(f"✓ User has {skills.count()} skills")
        
        # Check jobs
        jobs = Job.objects.all()
        print(f"✓ Database has {jobs.count()} jobs")
        
        # Check matches
        matches = MatchResult.objects.filter(user=test_user)
        print(f"✓ User has {matches.count()} match results")
        
    except Exception as e:
        print(f"✗ Database integration error: {str(e)}")


def test_end_to_end():
    """End-to-end matching test"""
    print("\n" + "="*60)
    print("TEST 5: End-to-End Matching")
    print("="*60)
    
    try:
        # Create test user
        test_user, _ = User.objects.get_or_create(
            username='e2e_test_user',
            defaults={'email': 'e2e@test.com'}
        )
        
        # Add test skills
        skills_to_add = ['Python', 'JavaScript', 'SQL']
        for skill_name in skills_to_add:
            Skill.objects.get_or_create(
                user=test_user,
                name=skill_name,
                defaults={'proficiency': 'intermediate'}
            )
        
        print(f"✓ Created test user with {len(skills_to_add)} skills")
        
        # Get user skills
        user_skills = list(Skill.objects.filter(user=test_user).values_list('name', flat=True))
        print(f"✓ Retrieved user skills: {user_skills}")
        
        # Get jobs and run matching
        jobs = Job.objects.all()[:3]  # Test with first 3 jobs
        
        if jobs:
            matches_created = 0
            for job in jobs:
                job_skills = list(JobSkill.objects.filter(job=job).values_list('skill_name', flat=True))
                
                if job_skills:
                    matched, missing = calculate_skill_match(user_skills, job_skills)
                    score = calculate_ai_match_score(user_skills, job_skills, matched, missing)
                    
                    if score > 0:
                        MatchResult.objects.update_or_create(
                            user=test_user,
                            job=job,
                            defaults={
                                'match_score': score,
                                'matched_skills': matched,
                                'missing_skills': missing
                            }
                        )
                        matches_created += 1
                        print(f"  ✓ Job '{job.title}': {score}% match")
            
            print(f"✓ Created {matches_created} matches")
        else:
            print("⚠ No jobs in database to test matching")
        
    except Exception as e:
        print(f"✗ End-to-end test error: {str(e)}")


def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("AI JOB MATCHING - TEST SUITE")
    print("="*60)
    
    try:
        test_skill_similarity()
        test_skill_match()
        test_ai_match_score()
        test_database_integration()
        test_end_to_end()
        
        print("\n" + "="*60)
        print("✓ ALL TESTS COMPLETED")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n✗ TEST SUITE ERROR: {str(e)}\n")


if __name__ == '__main__':
    run_all_tests()
