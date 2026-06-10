@echo off
echo ==============================================
echo Google Apps Script Deployment Setup
echo ==============================================
echo.

call npm install -g @google/clasp

echo.
echo Please login to your Google account:
call clasp login

echo.
echo Building the project...
call npm run build

if not exist .clasp.json (
    echo.
    echo Creating a new Apps Script project...
    call clasp create --type standalone --title "Tiem Day Nhac Tony" --rootDir ./dist
) else (
    echo.
    echo Existing .clasp.json found. Skipping project creation.
)

echo.
echo Pushing code to Google Apps Script...
call clasp push

echo.
echo Done! Please check your Google Apps Script dashboard (script.google.com) to deploy it as a web app.
echo.
pause
