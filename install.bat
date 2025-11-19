@echo off
echo ====================================
echo CTI Platform - Instalacion
echo ====================================
echo.

REM Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python no esta instalado
    echo.
    echo Descarga Python desde: https://www.python.org/downloads/
    echo Asegurate de marcar "Add Python to PATH"
    pause
    exit /b 1
)

echo Python detectado correctamente
echo.
echo Instalando dependencias...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion
    pause
    exit /b 1
)

echo.
echo ====================================
echo Instalacion completada!
echo ====================================
echo.
echo Para ejecutar: start.bat
echo.
pause
