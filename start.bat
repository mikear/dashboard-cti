@echo off
echo ====================================
echo CTI Platform - Inicio Rapido
echo ====================================
echo.
echo Iniciando servicios con Docker Compose...
echo.

docker-compose up -d

if %errorlevel% neq 0 (
    echo Error al iniciar Docker Compose
    echo.
    echo Asegurate de que Docker Desktop este ejecutandose
    pause
    exit /b 1
)

echo.
echo ====================================
echo Servicios iniciados correctamente!
echo ====================================
echo.
echo Esperando a que los servicios esten listos...
timeout /t 10 /nobreak > nul

echo.
echo Estado de los servicios:
docker-compose ps

echo.
echo ====================================
echo Plataforma CTI Lista!
echo ====================================
echo.
echo Accede a la plataforma en:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   API Docs: http://localhost:3001/api/docs
echo.
echo Los articulos comenzaran a aparecer en 5-10 minutos
echo.
echo Para ver logs:
echo   docker-compose logs -f
echo.
echo Para detener:
echo   docker-compose down
echo.
pause
