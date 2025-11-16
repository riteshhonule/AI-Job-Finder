@echo off
REM Quick start script for React frontend

echo.
echo ========================================
echo   AI Job Finder - Frontend
echo ========================================
echo.

cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install
)

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    (
        echo REACT_APP_API_URL=http://localhost:8000/api
    ) > .env
)

REM Start dev server
echo.
echo ========================================
echo   Frontend running on http://localhost:3000
echo ========================================
echo.
call npm start

pause
