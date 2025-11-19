# CTI Platform - Scripts de Utilidad

Este directorio contiene scripts para facilitar el desarrollo y despliegue.

## Scripts Disponibles

### 🚀 start.bat
Inicia la plataforma completa usando Docker Compose.

```bash
start.bat
```

**Qué hace:**
- Inicia todos los servicios (PostgreSQL, Redis, OpenSearch, Backend, Worker, Frontend)
- Espera a que estén listos
- Muestra URLs de acceso
- Muestra estado de servicios

### 📦 install.bat (Opcional - Solo para desarrollo local)
Instala dependencias y compila el proyecto localmente.

```bash
install.bat
```

**Qué hace:**
- Instala dependencias de backend (`npm install`)
- Instala dependencias de frontend (`npm install`)
- Compila backend (`npm run build`)
- Compila frontend (`npm run build`)

**Nota:** Este script es opcional. Docker Compose instalará las dependencias automáticamente.

## Uso Recomendado

### Primera Vez

1. **Iniciar con Docker:**
   ```bash
   start.bat
   ```

2. **Esperar ~30 segundos** para que todos los servicios inicialicen

3. **Acceder a la plataforma:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs

4. **Los artículos aparecerán automáticamente** en 5-10 minutos cuando el worker comience a procesar los feeds RSS

### Comandos Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f frontend

# Reiniciar un servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (borra datos)
docker-compose down -v

# Ver estado de servicios
docker-compose ps
```

### Desarrollo Local (Sin Docker)

Si prefieres desarrollar localmente sin Docker:

1. **Instalar dependencias:**
   ```bash
   install.bat
   ```

2. **Iniciar servicios de infraestructura:**
   ```bash
   docker-compose up -d postgres redis opensearch
   ```

3. **Iniciar backend en modo desarrollo:**
   ```bash
   cd backend
   npm run start:dev
   ```

4. **En otra terminal, iniciar worker:**
   ```bash
   cd backend
   npm run worker:start
   ```

5. **En otra terminal, iniciar frontend:**
   ```bash
   cd frontend
   npm start
   ```

## Verificación

### Verificar Base de Datos

```bash
docker-compose exec postgres psql -U cti -d cti_db

# Dentro de psql:
\dt                           # Ver tablas
SELECT COUNT(*) FROM articles; # Contar artículos
SELECT COUNT(*) FROM iocs;     # Contar IOCs
\q                            # Salir
```

### Verificar OpenSearch

```bash
curl http://localhost:9200/_cat/indices
curl http://localhost:9200/articles/_search?size=5
```

### Verificar Backend

```bash
curl http://localhost:3001/v1/sources
curl http://localhost:3001/v1/articles
```

## Troubleshooting

### Puerto en Uso

Si recibes error de puerto en uso:

```bash
# En PowerShell como administrador:
netstat -ano | findstr "3000 3001 5432 6379 9200"

# Detener proceso usando el puerto (reemplaza <PID>):
taskkill /F /PID <PID>
```

### Docker No Responde

```bash
# Reiniciar Docker Desktop
# O desde línea de comandos:
docker-compose restart
```

### Servicios No Saludables

```bash
# Ver logs para identificar problema
docker-compose logs <service-name>

# Reiniciar servicio específico
docker-compose restart <service-name>
```

## Estructura de Archivos

```
Dashboard/
├── start.bat          # ⭐ Script principal de inicio
├── install.bat        # Instalación local (opcional)
├── docker-compose.yml # Configuración de Docker
├── .env              # Variables de entorno
├── README.md         # Documentación completa
└── QUICKSTART.md     # Guía rápida
```

---

**¿Necesitas ayuda?** Consulta [README.md](../README.md) para documentación completa.
