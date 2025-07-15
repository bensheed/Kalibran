@echo off
echo "Starting Kalibran launcher..." > launcher.log
echo "Building Docker containers..." >> launcher.log
docker-compose build --no-cache >> launcher.log 2>&1
echo "Starting backend service..." >> launcher.log
docker-compose up -d --force-recreate backend >> launcher.log 2>&1
echo "Script finished. Press any key to exit."
pause
