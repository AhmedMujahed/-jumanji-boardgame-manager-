@echo off
echo 🎯 Jumanji Favicon Converter
echo ==============================
echo.
echo Opening conversion tools for you...
echo.

echo 📱 Opening favicon.io for ICO conversion...
start https://favicon.io/favicon-converter/

echo ⏳ Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo 🖼️ Opening convertio.co for PNG conversion...
start https://convertio.co/svg-png/

echo.
echo ✅ Conversion tools opened!
echo.
echo 📋 Next steps:
echo 1. Upload favicon.svg to favicon.io → Download favicon.ico
echo 2. Upload favicon-large.svg to convertio.co → Create PNG files
echo 3. Replace placeholder files in public/ folder
echo.
echo 🚀 Your app is already configured and ready!
echo.
pause
