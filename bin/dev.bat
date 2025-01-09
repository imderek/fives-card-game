@echo off
REM Windows version of the dev script

where ruby >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Ruby is not installed or not in PATH
  exit /b 1
)

gem list --no-installed --exact --silent foreman
if %ERRORLEVEL% EQU 0 (
  echo Installing foreman...
  gem install foreman
)

REM Default to port 3000 if not specified
if not defined PORT set PORT=3000

foreman start -f Procfile.dev --env NUL %*