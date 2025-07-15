@echo off
REM This batch file executes the update.ps1 PowerShell script.
REM It bypasses the execution policy for this single run.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0\update.ps1"
pause
