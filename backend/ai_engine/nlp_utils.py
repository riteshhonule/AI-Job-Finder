import re
from collections import Counter

# Common skills database for extraction
COMMON_SKILLS = {
    'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust'],
    'web': ['react', 'vue', 'angular', 'django', 'flask', 'fastapi', 'nodejs', 'express', 'html', 'css', 'sass'],
    'data': ['sql', 'postgresql', 'mysql', 'mongodb', 'elasticsearch', 'redis', 'spark', 'hadoop'],
    'ml': ['tensorflow', 'pytorch', 'scikit-learn', 'keras', 'nlp', 'computer vision', 'deep learning'],
    'devops': ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'jenkins', 'gitlab', 'github', 'terraform'],
    'other': ['git', 'linux', 'rest api', 'graphql', 'microservices', 'agile', 'scrum']
}

# Skill similarity mapping - skills that are related/similar
SKILL_SIMILARITY = {
    'python': ['python', 'django', 'flask', 'fastapi', 'scikit-learn', 'tensorflow', 'pytorch', 'pandas', 'numpy'],
    'javascript': ['javascript', 'react', 'vue', 'angular', 'nodejs', 'express', 'typescript'],
    'java': ['java', 'spring', 'maven', 'gradle', 'junit'],
    'sql': ['sql', 'postgresql', 'mysql', 'oracle', 'database'],
    'aws': ['aws', 'cloud', 'ec2', 's3', 'lambda'],
    'docker': ['docker', 'kubernetes', 'container', 'devops'],
    'react': ['react', 'javascript', 'frontend', 'web'],
    'django': ['django', 'python', 'backend', 'rest api'],
}

def extract_skills_from_text(text):
    """Extract skills from resume/job description text using keyword matching."""
    if not text:
        return []
    
    text_lower = text.lower()
    found_skills = set()
    
    for category, skills in COMMON_SKILLS.items():
        for skill in skills:
            if skill in text_lower:
                found_skills.add(skill)
    
    return sorted(list(found_skills))


def extract_email(text):
    """Extract email from text."""
    if not text:
        return None
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_phone(text):
    """Extract phone number from text."""
    if not text:
        return None
    pattern = r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}'
    match = re.search(pattern, text)
    return match.group(0) if match else None


def calculate_skill_match(user_skills, job_skills):
    """Calculate matching skills between user and job."""
    user_skills_lower = [s.lower() for s in user_skills]
    job_skills_lower = [s.lower() for s in job_skills]
    
    matched = list(set(user_skills_lower) & set(job_skills_lower))
    missing = list(set(job_skills_lower) - set(user_skills_lower))
    
    return matched, missing


def calculate_match_score(matched_skills, missing_skills, total_job_skills):
    """Calculate match score as percentage."""
    if total_job_skills == 0:
        return 0.0
    
    match_percentage = (len(matched_skills) / total_job_skills) * 100
    return round(match_percentage, 2)


def calculate_similarity_score(user_skill, job_skill):
    """Calculate similarity between two skills using skill mapping."""
    user_skill_lower = user_skill.lower()
    job_skill_lower = job_skill.lower()
    
    # Exact match
    if user_skill_lower == job_skill_lower:
        return 1.0
    
    # Check similarity mapping
    for skill, similar_skills in SKILL_SIMILARITY.items():
        similar_skills_lower = [s.lower() for s in similar_skills]
        if user_skill_lower in similar_skills_lower and job_skill_lower in similar_skills_lower:
            return 0.7  # Partial match for related skills
    
    return 0.0


def calculate_ai_match_score(user_skills, job_skills, matched_skills, missing_skills):
    """
    Calculate AI-enhanced match score considering:
    - Exact skill matches
    - Similar/related skills
    - Job requirements coverage
    """
    if not job_skills:
        return 0.0
    
    user_skills_lower = [s.lower() for s in user_skills]
    job_skills_lower = [s.lower() for s in job_skills]
    
    # Calculate exact matches
    exact_matches = len(matched_skills)
    
    # Calculate partial matches (similar skills)
    partial_matches = 0
    for job_skill in job_skills_lower:
        if job_skill not in [m.lower() for m in matched_skills]:
            for user_skill in user_skills_lower:
                similarity = calculate_similarity_score(user_skill, job_skill)
                if similarity > 0.5:  # Consider it a partial match
                    partial_matches += 1
                    break
    
    # Calculate final score
    # Exact matches count as 100%, partial matches as 50%
    total_score = (exact_matches * 100 + partial_matches * 50) / (len(job_skills) * 100)
    final_score = round(min(total_score * 100, 100), 2)
    
    return final_score
