@echo off
REM This script downloads the latest version of a specified branch from the Kalibran repository.
REM It requires curl and tar, which are included in modern versions of Windows 10/11.

set "REPO=bensheed/Kalibran"

echo.
echo Enter the branch name to download (e.g., feature/setup-flow-fix) and press Enter:
set /p BRANCH="Branch name: "

if not defined BRANCH (
    echo No branch name entered. Exiting.
    goto :eof
)

echo.
echo Fetching the latest version of branch: %BRANCH%...

REM Construct the URL for the zip archive
set "ZIP_URL=https://github.com/%REPO%/archive/refs/heads/%BRANCH%.zip"

REM Download the zip file using curl
echo Downloading from %ZIP_URL%...
curl -L -o "%BRANCH%.zip" "%ZIP_URL%"

REM Check if the download was successful
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to download the branch.
    echo Please check the branch name and your internet connection.
    echo Make sure 'curl' is available in your system's PATH.
    del "%BRANCH%.zip" >nul 2>nul
    goto :end
)

REM Unzip the archive using tar
echo Extracting files...
tar -xf "%BRANCH%.zip"

REM Check if extraction was successful
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to extract the archive.
    echo Make sure 'tar' is available in your system's PATH.
    del "%BRANCH%.zip" >nul 2>nul
    goto :end
)

REM Clean up the downloaded zip file
echo Cleaning up...
del "%BRANCH%.zip"

echo.
echo Update complete! The latest version of the '%BRANCH%' branch has been downloaded.
echo The files are in a new folder named 'Kalibran-%BRANCH%'.

:end
echo.
pause
