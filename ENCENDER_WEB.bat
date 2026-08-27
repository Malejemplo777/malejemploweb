@echo off
title GATE.24 Web - servidor local
cd /d "%~dp0"

echo Encendiendo la web local...
start "" cmd /c "timeout /t 3 >nul && start http://localhost:4321"

call npx astro dev --host

echo.
echo El servidor se ha apagado. Puedes cerrar esta ventana.
pause >nul
