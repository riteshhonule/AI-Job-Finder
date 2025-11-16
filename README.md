# AI-Based Job Matching System

## Overview

The AI Job Finder now includes an intelligent job matching system that uses skill-based matching with AI enhancements to find the best job opportunities for users based on their skills.

## How It Works

### 1. **Skill Extraction & Management**

Users can add skills to their profile in two ways:
- **Manual Entry**: Add skills directly through the Profile page
- **Resume Upload**: Upload a resume and the system automatically extracts skills

### 2. **AI-Enhanced Matching Algorithm**

The matching system uses a sophisticated algorithm that considers:

#### Exact Skill Matches
- Direct matches between user skills and job requirements
- Case-insensitive comparison

#### Related Skill Matching
- Recognizes skills that are related or similar
- Example: If you have Python, you get partial credit for Django/Flask jobs
- Example: If you have JavaScript, you get partial credit for React/Vue jobs

#### Match Score Calculation
```
Score = (Exact Matches × 100 + Partial Matches × 50) / (Total Job Skills × 100) × 100
```

- **Exact Matches**: Count as 100% of a skill requirement
- **Partial Matches**: Count as 50% of a skill requirement (for related skills)
- **Final Score**: Capped at 100%

### 3. **Skill Similarity Mapping**

The system recognizes these skill relationships:

```
Python → Django, Flask, FastAPI, TensorFlow, PyTorch, Scikit-learn
JavaScript → React, Vue, Angular, Node.js, Express, TypeScript
Java → Spring, Maven, Gradle, JUnit
SQL → PostgreSQL, MySQL, Oracle, Database
AWS → Cloud, EC2, S3, Lambda
Docker → Kubernetes, Container, DevOps
```

## Usage

### Step 1: Add Skills to Your Profile

1. Go to **Profile** page
2. Click **Add Skill**
3. Enter skill name (e.g., "Python", "React", "AWS")
4. Select proficiency level (Beginner, Intermediate, Advanced)
5. Click **Save**

### Step 2: Upload Resume (Optional)

1. Go to **Resume Upload** page
2. Upload your resume (PDF or text)
3. Click **Parse Resume**
4. System automatically extracts skills from your resume

### Step 3: Run Job Matching

1. Go to **Job Matches** page
2. Click **🔄 Run Job Matching**
3. System analyzes all available jobs and calculates match scores
4. View results sorted by match score (highest first)

### Step 4: Review Matches

Each job match shows:
- **Job Title** and **Company**
- **Match Score** (0-100%)
- **Matched Skills** (green badges) - Skills you have that the job requires
- **Missing Skills** (red badges) - Skills you need to learn

## Match Score Interpretation

- **80-100%**: Excellent match - You have most required skills
- **50-79%**: Good match - You have some required skills, some learning needed
- **Below 50%**: Potential match - You have foundational skills but significant learning needed

## Example Scenarios

### Scenario 1: Python Developer Applying for Django Role

**User Skills**: Python, JavaScript, SQL
**Job Requirements**: Python, Django, PostgreSQL, REST API

**Calculation**:
- Exact matches: Python (1 skill)
- Partial matches: Django (related to Python), PostgreSQL (related to SQL) (2 skills)
- Total job skills: 4
- Score: (1 × 100 + 2 × 50) / (4 × 100) × 100 = 62.5%

### Scenario 2: Full Stack Developer

**User Skills**: Python, JavaScript, React, Django, PostgreSQL
**Job Requirements**: JavaScript, React, Node.js, MongoDB

**Calculation**:
- Exact matches: JavaScript, React (2 skills)
- Partial matches: Node.js (related to JavaScript) (1 skill)
- Total job skills: 4
- Score: (2 × 100 + 1 × 50) / (4 × 100) × 100 = 62.5%

## Features

### ✅ Implemented
- Exact skill matching
- Related skill recognition
- AI-enhanced scoring algorithm
- Error handling and logging
- Resume parsing and skill extraction
- Match result persistence
- Sorted results by match score

### 🔄 Future Enhancements
- Machine learning model for better skill relationships
- Experience level consideration
- Location-based filtering
- Salary range matching
- Career path recommendations based on matches
- Skill gap analysis with learning resources

## Troubleshooting

### "No skills found" Error
**Solution**: Add at least one skill to your profile before running matching

### "No jobs available" Error
**Solution**: Admin needs to add jobs to the system first

### "Failed to run matching" Error
**Solution**: 
1. Check browser console for detailed error message
2. Ensure you're logged in
3. Try refreshing the page
4. Check backend logs for more details

## API Endpoints

### Run Matching
```
POST /api/ai/matches/run_matching/
Authorization: Bearer {token}

Response:
{
  "message": "Matching completed. Found X matching jobs.",
  "matches": [
    {
      "id": 1,
      "job": 1,
      "job_title": "Senior Python Developer",
      "job_company": "Tech Corp",
      "job_description": "...",
      "match_score": 85.5,
      "matched_skills": ["python", "sql"],
      "missing_skills": ["docker", "kubernetes"],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Matches
```
GET /api/ai/matches/?page=1
Authorization: Bearer {token}

Response:
{
  "count": 15,
  "next": "/api/ai/matches/?page=2",
  "previous": null,
  "results": [...]
}
```

## Database Models

### MatchResult
- `user`: Foreign key to User
- `job`: Foreign key to Job
- `match_score`: Float (0-100)
- `matched_skills`: JSON array of matched skill names
- `missing_skills`: JSON array of missing skill names
- `summary`: Optional AI-generated summary
- `created_at`: Timestamp

## Performance Considerations

- Matches are cached and can be retrieved without recalculation
- Previous matches are cleared before running new matching
- Efficient database queries with proper indexing
- Skill comparison is case-insensitive for better matching

## Contributing

To improve the skill matching algorithm:

1. Edit `SKILL_SIMILARITY` dictionary in `ai_engine/nlp_utils.py`
2. Add new skill relationships
3. Test with sample data
4. Submit improvements

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs
3. Check browser console for error details
4. Contact the development team
