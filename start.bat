@echo off
cls
echo ====================================
echo CTI Platform - Streamlit
echo ====================================
echo.

REM Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python no esta instalado
    echo.
    echo Descarga Python desde: https://www.python.org/downloads/
    echo Asegurate de marcar "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo Iniciando aplicacion...
echo.
echo Accede en: http://localhost:8501
echo.

REM Abrir navegador automaticamente
start http://localhost:8501

REM Ejecutar Streamlit
python -m streamlit run app.py
