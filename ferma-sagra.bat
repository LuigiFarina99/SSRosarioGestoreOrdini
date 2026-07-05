@echo off
echo Arresto del server e del tunnel in corso...
taskkill /F /IM cloudflared.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo Fatto. Server e tunnel arrestati.
pause
