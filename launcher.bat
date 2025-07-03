@echo off
git pull
docker-compose build backend
docker-compose up -d backend
