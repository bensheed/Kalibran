@echo off
git pull origin main
docker-compose build --no-cache
docker-compose up -d --force-recreate backend
