@echo off
REM Quick start script for AI Job Finder

echo.
echo ========================================
echo   AI Job Finder - Quick Start
echo ========================================
echo.

REM Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate venv
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt > nul 2>&1

REM Run migrations
echo Running database migrations...
cd backend
python manage.py migrate > nul 2>&1

REM Check if superuser exists
echo.
echo Checking for admin account...
python manage.py shell -c "from django.contrib.auth.models import User; print('Admin exists' if User.objects.filter(is_superuser=True).exists() else 'No admin')" > temp.txt
set /p admin_status=<temp.txt
del temp.txt

if "%admin_status%"=="No admin" (
    echo.
    echo No admin account found. Creating one...
    python manage.py createsuperuser
)

REM Load sample data
echo Loading sample job data...
python manage.py shell < load_sample_data.py > nul 2>&1

REM Start server
echo.
echo ========================================
echo   Backend running on http://localhost:8000
echo   Admin panel: http://localhost:8000/admin
echo ========================================
echo.
python manage.py runserver

pause
