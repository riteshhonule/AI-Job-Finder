# AI Job Finder - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                                │
│                                                                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────┐   │
│  │  JobMatches.js  │  │  Profile.js      │  │  ResumeUpload.js    │   │
│  │                 │  │                  │  │                     │   │
│  │ - Run Matching  │  │ - Add Skills     │  │ - Upload Resume     │   │
│  │ - Display Jobs  │  │ - View Profile   │  │ - Parse Resume      │   │
│  │ - Show Scores   │  │ - Manage Skills  │  │ - Extract Skills    │   │
│  └────────┬────────┘  └────────┬─────────┘  └──────────┬──────────┘   │
│           │                    │                       │               │
│           └────────────────────┼───────────────────────┘               │
│                                │                                       │
│                        ┌───────▼────────┐                             │
│                        │  matchService  │                             │
│                        │  apiClient     │                             │
│                        └───────┬────────┘                             │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
                    HTTP/REST API │ (JWT Authentication)
                                 │
┌────────────────────────────────▼─────────────────────────────────────┐
│                      BACKEND (Django)                                │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    API Layer                                 │   │
│  │                                                              │   │
│  │  /api/ai/matches/run_matching/                              │   │
│  │  /api/ai/matches/parse_and_extract/                         │   │
│  │  /api/users/skills/                                         │   │
│  │  /api/users/upload_resume/                                  │   │
│  │  /api/recommendations/career-paths/                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                 │                                    │
│  ┌──────────────────────────────▼──────────────────────────────┐    │
│  │              AI Engine (ai_engine app)                      │    │
│  │                                                              │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │ MatchViewSet (views.py)                             │   │    │
│  │  │                                                     │   │    │
│  │  │ - run_matching()                                   │   │    │
│  │  │   ├─ Get user skills                              │   │    │
│  │  │   ├─ Get all jobs                                 │   │    │
│  │  │   ├─ For each job:                                │   │    │
│  │  │   │  ├─ Calculate skill match                     │   │    │
│  │  │   │  ├─ Calculate AI score                        │   │    │
│  │  │   │  └─ Create MatchResult                        │   │    │
│  │  │   └─ Return sorted matches                        │   │    │
│  │  │                                                     │   │    │
│  │  │ - parse_and_extract()                             │   │    │
│  │  │   ├─ Parse resume file                            │   │    │
│  │  │   ├─ Extract skills                               │   │    │
│  │  │   └─ Add to user profile                          │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  │                                                              │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │ NLP Utils (nlp_utils.py)                            │   │    │
│  │  │                                                     │   │    │
│  │  │ - calculate_skill_match()                          │   │    │
│  │  │   └─ Find exact matches and missing skills         │   │    │
│  │  │                                                     │   │    │
│  │  │ - calculate_similarity_score()                     │   │    │
│  │  │   └─ Check SKILL_SIMILARITY mapping               │   │    │
│  │  │                                                     │   │    │
│  │  │ - calculate_ai_match_score()                       │   │    │
│  │  │   ├─ Count exact matches                           │   │    │
│  │  │   ├─ Count partial matches                         │   │    │
│  │  │   └─ Calculate final score                         │   │    │
│  │  │                                                     │   │    │
│  │  │ SKILL_SIMILARITY:                                  │   │    │
│  │  │   Python ↔ Django, Flask, FastAPI, TensorFlow     │   │    │
│  │  │   JavaScript ↔ React, Vue, Angular, Node.js       │   │    │
│  │  │   Java ↔ Spring, Maven, Gradle, JUnit             │   │    │
│  │  │   SQL ↔ PostgreSQL, MySQL, Oracle, Database       │   │    │
│  │  │   AWS ↔ Cloud, EC2, S3, Lambda                    │   │    │
│  │  │   Docker ↔ Kubernetes, Container, DevOps          │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  │                                                              │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │ Resume Parser (resume_parser.py)                   │   │    │
│  │  │                                                     │   │    │
│  │  │ - parse_resume()                                   │   │    │
│  │  │   ├─ Extract text from PDF/file                    │   │    │
│  │  │   ├─ Extract skills using NLP                      │   │    │
│  │  │   ├─ Extract email                                 │   │    │
│  │  │   └─ Extract phone number                          │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           Recommendations App (recommendations)              │   │
│  │                                                              │   │
│  │  - recommend_career_paths()                                 │   │
│  │  - identify_skill_gaps()                                    │   │
│  │  - recommend_courses()                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Data Models (Django ORM)                        │   │
│  │                                                              │   │
│  │  ┌──────────────────┐  ┌──────────────────┐                │   │
│  │  │ User (Django)    │  │ Skill            │                │   │
│  │  ├──────────────────┤  ├──────────────────┤                │   │
│  │  │ id               │  │ id               │                │   │
│  │  │ username         │  │ user_id (FK)     │                │   │
│  │  │ email            │  │ name             │                │   │
│  │  │ password         │  │ proficiency      │                │   │
│  │  └──────────────────┘  └──────────────────┘                │   │
│  │                                                              │   │
│  │  ┌──────────────────┐  ┌──────────────────┐                │   │
│  │  │ Job              │  │ JobSkill         │                │   │
│  │  ├──────────────────┤  ├──────────────────┤                │   │
│  │  │ id               │  │ id               │                │   │
│  │  │ title            │  │ job_id (FK)      │                │   │
│  │  │ company          │  │ skill_name       │                │   │
│  │  │ description      │  │ importance       │                │   │
│  │  │ location         │  └──────────────────┘                │   │
│  │  │ salary_min/max   │                                      │   │
│  │  └──────────────────┘                                      │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────┐                  │   │
│  │  │ MatchResult                          │                  │   │
│  │  ├──────────────────────────────────────┤                  │   │
│  │  │ id                                   │                  │   │
│  │  │ user_id (FK)                         │                  │   │
│  │  │ job_id (FK)                          │                  │   │
│  │  │ match_score (0-100)                  │                  │   │
│  │  │ matched_skills (JSON)                │                  │   │
│  │  │ missing_skills (JSON)                │                  │   │
│  │  │ summary (optional)                   │                  │   │
│  │  │ created_at                           │                  │   │
│  │  └──────────────────────────────────────┘                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ SQL Queries
                                 │
┌────────────────────────────────▼──────────────────────────────────┐
│                    PostgreSQL Database                            │
│                                                                   │
│  Tables:                                                          │
│  - auth_user                                                      │
│  - users_skill                                                    │
│  - users_resume                                                   │
│  - jobs_job                                                       │
│  - jobs_jobskill                                                  │
│  - ai_engine_matchresult                                          │
│  - recommendations_careerpath                                     │
│  - recommendations_skillgap                                       │
│  - recommendations_courserecommendation                           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Job Matching Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ User clicks "Run Job Matching"                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: handleRunMatching()                                   │
│ - POST /api/ai/matches/run_matching/                            │
│ - Include JWT token                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend: run_matching() [views.py]                              │
│ - Authenticate user                                             │
│ - Get user skills from database                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Validate: User has skills?                                      │
│ ├─ NO  → Return error: "No skills found"                        │
│ └─ YES → Continue                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Get all jobs from database                                      │
│ Validate: Jobs exist?                                           │
│ ├─ NO  → Return error: "No jobs available"                      │
│ └─ YES → Continue                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Clear previous matches for user                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ For each job:                                                   │
│                                                                 │
│  1. Get job required skills                                     │
│     └─ Skip if no skills                                        │
│                                                                 │
│  2. Calculate skill match [nlp_utils.py]                        │
│     ├─ matched_skills = user_skills ∩ job_skills              │
│     └─ missing_skills = job_skills - user_skills              │
│                                                                 │
│  3. Calculate AI score [nlp_utils.py]                           │
│     ├─ For each job skill:                                      │
│     │  ├─ Check exact match                                    │
│     │  └─ Check similarity (SKILL_SIMILARITY)                  │
│     ├─ Count exact matches                                      │
│     ├─ Count partial matches                                    │
│     └─ Score = (exact*100 + partial*50)/(total*100)*100        │
│                                                                 │
│  4. Create MatchResult if score > 0                             │
│     └─ Save to database                                         │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Sort matches by score (descending)                              │
│ Serialize results                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Return Response:                                                │
│ {                                                               │
│   "message": "Matching completed. Found X jobs.",               │
│   "matches": [                                                  │
│     {                                                           │
│       "id": 1,                                                  │
│       "job_title": "Senior Python Developer",                   │
│       "job_company": "Tech Corp",                               │
│       "match_score": 85.5,                                      │
│       "matched_skills": ["python", "sql"],                      │
│       "missing_skills": ["docker", "kubernetes"]               │
│     },                                                          │
│     ...                                                         │
│   ]                                                             │
│ }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Display matches                                       │
│ - Show match cards with scores                                  │
│ - Highlight matched skills (green)                              │
│ - Highlight missing skills (red)                                │
│ - Sort by score (highest first)                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ run_matching() called                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                    ┌────────────┐
                    │ Try Block  │
                    └────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │Success │      │Warning │      │Error   │
    └────────┘      └────────┘      └────────┘
        │                │                │
        │                │                ▼
        │                │           ┌──────────────────┐
        │                │           │ Catch Exception  │
        │                │           └────────┬─────────┘
        │                │                    │
        │                │                    ▼
        │                │           ┌──────────────────────┐
        │                │           │ Log Error Details    │
        │                │           │ logger.error(...)    │
        │                │           └────────┬─────────────┘
        │                │                    │
        │                │                    ▼
        │                │           ┌──────────────────────┐
        │                │           │ Return Error Response│
        │                │           │ Status: 500          │
        │                │           │ Message: Detailed    │
        │                │           └────────┬─────────────┘
        │                │                    │
        └────────────────┼────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Return to    │
                  │ Frontend     │
                  └──────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Frontend     │
                  │ Displays     │
                  │ Error/Result │
                  └──────────────┘
```

## Skill Matching Algorithm

```
Input: user_skills = [Python, JavaScript, SQL]
       job_skills = [Python, Django, PostgreSQL]

Step 1: Exact Matching
  matched_skills = [python]
  missing_skills = [django, postgresql]

Step 2: Similarity Checking
  For each missing skill:
    - django: Check SKILL_SIMILARITY["python"] → includes django → partial match
    - postgresql: Check SKILL_SIMILARITY["sql"] → includes postgresql → partial match

Step 3: Score Calculation
  exact_matches = 1
  partial_matches = 2
  total_job_skills = 3
  
  score = (1 * 100 + 2 * 50) / (3 * 100) * 100
  score = (100 + 100) / 300 * 100
  score = 200 / 300 * 100
  score = 66.67%

Output: match_score = 66.67
        matched_skills = [python]
        missing_skills = [django, postgresql]
```

## Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend Components                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  JobMatches.js ◄──────────────────────────────────────────┐ │
│  ├─ fetchMatches()                                        │ │
│  ├─ handleRunMatching()                                   │ │
│  └─ displayResults()                                      │ │
│                                                           │ │
│  matchService.js ◄─────────────────────────────────────┐  │ │
│  ├─ getMatches()                                       │  │ │
│  ├─ runMatching()                                      │  │ │
│  └─ parseAndExtract()                                  │  │ │
│                                                        │  │ │
│  apiClient.js ◄────────────────────────────────────┐  │  │ │
│  ├─ axios instance                                 │  │  │ │
│  ├─ JWT token handling                             │  │  │ │
│  └─ Error interceptors                             │  │  │ │
│                                                    │  │  │ │
└────────────────────────────────────────────────────┼──┼──┘ │
                                                    │  │    
                          HTTP/REST API             │  │    
                                                    │  │    
┌────────────────────────────────────────────────────▼──▼──┐ │
│                    Backend Components                    │ │
├──────────────────────────────────────────────────────────┤ │
│                                                          │ │
│  MatchViewSet (views.py)                                │ │
│  ├─ run_matching()                                      │ │
│  ├─ parse_and_extract()                                │ │
│  └─ get_queryset()                                      │ │
│         │                                               │ │
│         ▼                                               │ │
│  nlp_utils.py                                           │ │
│  ├─ calculate_skill_match()                             │ │
│  ├─ calculate_similarity_score()                        │ │
│  ├─ calculate_ai_match_score()                          │ │
│  └─ SKILL_SIMILARITY mapping                            │ │
│         │                                               │ │
│         ▼                                               │ │
│  Models (models.py)                                     │ │
│  ├─ MatchResult                                         │ │
│  ├─ User (Django)                                       │ │
│  ├─ Skill                                               │ │
│  ├─ Job                                                 │ │
│  └─ JobSkill                                            │ │
│         │                                               │ │
│         ▼                                               │ │
│  Database (PostgreSQL)                                  │ │
│                                                          │ │
└──────────────────────────────────────────────────────────┘ │
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Web Server (Nginx)                                   │  │
│  │ - Reverse proxy                                      │  │
│  │ - SSL/TLS termination                                │  │
│  │ - Static file serving                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                      │                                      │
│         ┌────────────┼────────────┐                        │
│         │            │            │                        │
│         ▼            ▼            ▼                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │Frontend  │  │Backend   │  │Backend   │                │
│  │(React)   │  │(Gunicorn)│  │(Gunicorn)│                │
│  │Port 3000 │  │Port 8000 │  │Port 8001 │                │
│  └──────────┘  └────┬─────┘  └────┬─────┘                │
│                     │             │                       │
│                     └──────┬──────┘                        │
│                            │                              │
│                            ▼                              │
│                  ┌──────────────────┐                     │
│                  │ PostgreSQL DB    │                     │
│                  │ - Replication    │                     │
│                  │ - Backups        │                     │
│                  │ - Indexes        │                     │
│                  └──────────────────┘                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Monitoring & Logging                                 │  │
│  │ - Sentry (error tracking)                            │  │
│  │ - ELK Stack (logging)                                │  │
│  │ - Prometheus (metrics)                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture provides a scalable, maintainable, and robust job matching system with AI-enhanced capabilities.
