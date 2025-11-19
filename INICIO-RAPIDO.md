# CTI Platform - Inicio Rápido

## 📦 Instalación (Solo la primera vez)

1. Abre CMD o PowerShell
2. Navega al proyecto:
   ```
   cd c:\Users\diego\OneDrive\Documentos\app\Dashboard
   ```
3. Ejecuta:
   ```
   install.bat
   ```
   
Esto instalará todas las dependencias de Node.js necesarias.

## 🚀 Ejecución

Simplemente ejecuta:
```
start.bat
```

O haz doble clic en `start.bat` desde el Explorador de Windows.

El script:
- Detendrá procesos anteriores
- Compilará el backend si es necesario
- Abrirá dos ventanas minimizadas (Backend y Frontend)
- Esperará 20 segundos para que el backend inicie
- Iniciará el frontend

## 🌐 Acceso

Después de ~30 segundos, abre tu navegador:

- **Aplicación Web**: http://localhost:3000
- **API Backend**: http://localhost:3001
- **Documentación API**: http://localhost:3001/api/docs

## 📊 Funcionalidad

- **Base de Datos**: SQLite (archivo `backend/database.sqlite`)
- **Fuentes RSS**: 5 fuentes pre-configuradas automáticamente:
  - Krebs on Security
  - The Hacker News
  - Schneier on Security
  - Threatpost
  - Dark Reading
- **Worker de Ingestion**: Procesa feeds cada 5 minutos
- **Artículos**: Aparecerán en 5-10 minutos después del primer inicio
- **WebSocket**: Actualizaciones en tiempo real
- **Búsqueda**: Deshabilitada en modo local (sin OpenSearch)

## 🛑 Detener la Aplicación

Cierra las dos ventanas de CMD que se abrieron:
- `CTI-Backend`
- `CTI-Frontend`

O ejecuta:
```
taskkill /F /IM node.exe
```

## 🔧 Solución de Problemas

### Puerto 3001 o 3000 ocupado
```
netstat -ano | findstr ":3001"
netstat -ano | findstr ":3000"
taskkill /F /PID [numero_proceso]
```

### Backend no responde
1. Cierra las ventanas
2. Elimina `backend/database.sqlite`
3. Ejecuta `start.bat` nuevamente

### No aparecen artículos
- Espera 5-10 minutos (el worker procesa cada 5 minutos)
- Verifica logs en la ventana `CTI-Backend`
- Verifica fuentes: http://localhost:3001/v1/sources

### Error de compilación
```
cd backend
npm run build
```
Revisa los errores mostrados.

## 📁 Archivos Importantes

- `start.bat` - Inicia la aplicación
- `install.bat` - Instala dependencias
- `backend/database.sqlite` - Base de datos SQLite
- `backend/dist/` - Código compilado del backend

## 🔄 Reiniciar desde Cero

```
taskkill /F /IM node.exe
del backend\database.sqlite
start.bat
```

## 💡 Notas

- **NO requiere Docker** - Funciona completamente en local
- **NO requiere PostgreSQL** - Usa SQLite
- **NO requiere Redis** - Worker directo sin cola
- **NO requiere OpenSearch** - Búsqueda deshabilitada

La aplicación es completamente autónoma y funciona sin dependencias externas.
