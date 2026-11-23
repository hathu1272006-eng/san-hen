@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Vui long cai Node.js truoc khi mo ban demo.
  pause
  exit /b 1
)
echo Mo http://127.0.0.1:4173/ tren trinh duyet.
echo Nhan Ctrl+C de dung.
node preview.mjs
pause
