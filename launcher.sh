#!/bin/bash
echo "Starting Kalibran launcher..."
git pull
docker compose build
docker compose up -d
