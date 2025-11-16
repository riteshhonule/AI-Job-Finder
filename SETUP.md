# 🚀 Setup Guide - AI Job Finder

Complete step-by-step guide to get the application running locally.

## Prerequisites

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 14+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **PDF Reader** - For testing resume upload

## Backend Setup (Django)

### Step 1: Navigate to Project Directory
```bash
cd C:\Users\Asus\CascadeProjects\ai-job-finder
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
```bash
copy .env.template .env
```

Edit `.env` file with your settings:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=your-jwt-secret-here
```

### Step 5: Run Database Migrations
```bash
cd backend
python manage.py migrate
```

### Step 6: Create Superuser (Admin Account)
```bash
python manage.py createsuperuser
```
Follow prompts to create admin account:
- Username: `admin`
- Email: `admin@example.com`
- Password: (choose a strong password)

### Step 7: Load Sample Job Data
```bash
python manage.py shell < load_sample_data.py
```

### Step 8: Start Backend Server
```bash
python manage.py runserver
```

Backend will be available at: **http://localhost:8000**

**Admin Panel**: http://localhost:8000/admin

## Frontend Setup (React)

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure API URL
Create `.env` file in frontend directory:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### Step 4: Start Development Server
```bash
npm start
```

Frontend will be available at: **http://localhost:3000**

## Testing the Application

### 1. Register a New User
- Go to http://localhost:3000/register
- Fill in registration form
- Click "Register"

### 2. Login
- Go to http://localhost:3000/login
- Use your registered credentials
- Click "Login"

### 3. Upload Resume
- Click "Resume" in navigation
- Select a PDF file (you can create a sample PDF with skills like "Python", "React", "Django")
- Click "Upload & Extract Skills"
- Verify extracted skills

### 4. View Job Matches
- Click "Job Matches"
- Click "Run Job Matching" button
- View matched jobs with scores

### 5. Get Recommendations
- Click "Recommendations"
- Select target role (e.g., "Data Scientist")
- Click "Get Recommendations"
- View career paths, skill gaps, and courses

### 6. Admin Panel
- Login as admin user
- Go to http://localhost:8000/admin
- Manage jobs, users, and skills

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
python manage.py runserver 8001
```

**Database migration errors:**
```bash
python manage.py migrate --run-syncdb
```

**Module not found errors:**
```bash
pip install -r requirements.txt --upgrade
```

### Frontend Issues

**Port 3000 already in use:**
```bash
set PORT=3001 && npm start
```

**CORS errors:**
- Ensure backend is running on http://localhost:8000
- Check CORS_ALLOWED_ORIGINS in backend .env

**API connection errors:**
- Verify REACT_APP_API_URL in frontend .env
- Check backend server is running

## Development Tips

### Backend
- Use Django admin panel: http://localhost:8000/admin
- Check logs in terminal for errors
- Use `python manage.py shell` for interactive testing

### Frontend
- Use browser DevTools (F12) to debug
- Check Network tab for API calls
- Use React DevTools extension for component debugging

## Next Steps

1. **Customize Skills Database**: Edit `backend/ai_engine/nlp_utils.py` to add more skills
2. **Add More Jobs**: Use admin panel or load_sample_data.py
3. **Integrate External APIs**: Add Indeed/LinkedIn connectors
4. **Deploy**: Follow deployment guide in README.md

## Common Commands

### Backend
```bash
# Run server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Access shell
python manage.py shell

# Run tests
python manage.py test

# Create superuser
python manage.py createsuperuser
```

### Frontend
```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Install new package
npm install package-name
```

## Support

For issues:
1. Check the README.md for detailed documentation
2. Review error messages in terminal/console
3. Check browser DevTools for frontend errors
4. Review Django logs for backend errors

---

**Ready to start? Follow the steps above and you'll be up and running in minutes!** 🎉
