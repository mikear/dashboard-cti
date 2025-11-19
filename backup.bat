@echo off
setlocal enabledelayedexpansion

:: Script de Backup - CTI Dashboard
:: Fecha: 19 de Noviembre 2025

echo ========================================
echo   CTI Dashboard - Backup Automatico
echo ========================================
echo.

:: Obtener timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=!dt:~0,8!_!dt:~8,6!"

:: Definir rutas
set "SOURCE_DIR=%~dp0"
set "BACKUP_DIR=%~dp0..\Dashboard_backup_%timestamp%"

echo [INFO] Fuente: %SOURCE_DIR%
echo [INFO] Destino: %BACKUP_DIR%
echo.

:: Crear directorio de backup
echo [1/3] Creando directorio de backup...
mkdir "%BACKUP_DIR%" 2>nul

:: Copiar archivos (excluyendo carpetas temporales)
echo [2/3] Copiando archivos...
xcopy "%SOURCE_DIR%*" "%BACKUP_DIR%\" /E /H /I /Y /EXCLUDE:%~dp0backup_exclude.txt 2>nul

:: Crear archivo de exclusiones si no existe
if not exist "%~dp0backup_exclude.txt" (
    echo node_modules > "%~dp0backup_exclude.txt"
    echo __pycache__ >> "%~dp0backup_exclude.txt"
    echo .venv >> "%~dp0backup_exclude.txt"
    echo .git >> "%~dp0backup_exclude.txt"
    echo *.db >> "%~dp0backup_exclude.txt"
    echo *.log >> "%~dp0backup_exclude.txt"
)

:: Copiar manualmente archivos importantes
echo [3/3] Verificando archivos criticos...
copy "%SOURCE_DIR%app.py" "%BACKUP_DIR%\" /Y >nul 2>&1
copy "%SOURCE_DIR%requirements.txt" "%BACKUP_DIR%\" /Y >nul 2>&1
copy "%SOURCE_DIR%*.bat" "%BACKUP_DIR%\" /Y >nul 2>&1
copy "%SOURCE_DIR%*.md" "%BACKUP_DIR%\" /Y >nul 2>&1

echo.
echo ========================================
echo   BACKUP COMPLETADO EXITOSAMENTE
echo ========================================
echo.
echo Ubicacion: %BACKUP_DIR%
echo.
echo Presiona cualquier tecla para continuar...
pause >nul
