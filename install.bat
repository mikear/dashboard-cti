@echo off
echo ====================================
echo CTI Platform - Instalacion de Dependencias
echo ====================================
echo.

echo [1/4] Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error al instalar dependencias del backend
    pause
    exit /b 1
)

echo.
echo [2/4] Instalando dependencias del frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error al instalar dependencias del frontend
    pause
    exit /b 1
)

echo.
echo [3/4] Compilando backend...
cd ..\backend
call npm run build
if %errorlevel% neq 0 (
    echo Error al compilar backend
    pause
    exit /b 1
)

echo.
echo [4/4] Compilando frontend...
cd ..\frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error al compilar frontend
    pause
    exit /b 1
)

cd ..
echo.
echo ====================================
echo Instalacion completada exitosamente!
echo ====================================
echo.
echo Para iniciar el proyecto:
echo   docker-compose up -d
echo.
echo Acceder a:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   API Docs: http://localhost:3001/api/docs
echo.
pause
