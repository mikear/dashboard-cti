# Actualización Automática de Feeds RSS

## Configuración Completada

Se han agregado dos métodos para actualización automática:

### 1. GitHub Actions (Recomendado)

**Archivo**: `.github/workflows/update-feeds.yml`

- ✅ Se ejecuta cada 6 horas automáticamente
- ✅ También se puede ejecutar manualmente desde GitHub
- ✅ Actualiza la base de datos y hace commit automático

**Configuración requerida:**

1. Ve a tu repositorio en GitHub: `https://github.com/mikear/dashboard-cti`
2. Click en `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret`
4. Nombre: `API_TOKEN`
5. Valor: `cti-api-secret-2025` (o cambia por tu token secreto)
6. Click `Add secret`

**Uso manual:**
- Ve a `Actions` → `Auto Update RSS Feeds` → `Run workflow`

### 2. Script API Endpoint

**Archivo**: `api_endpoint.py`

Puede ser llamado desde servicios externos como **cron-job.org**:

```bash
python api_endpoint.py cti-api-secret-2025
```

**Configurar en cron-job.org:**

1. Registrarse en https://cron-job.org
2. Crear nuevo cronjob
3. URL: Necesitarías un servidor que ejecute el script (no aplicable para Streamlit Cloud directamente)

## Recomendación

Usa **GitHub Actions** ya que:
- ✅ Totalmente gratuito
- ✅ No requiere servidores adicionales
- ✅ Se integra perfectamente con tu repositorio
- ✅ La base de datos se actualiza automáticamente
- ✅ Streamlit Cloud detecta los cambios y recarga la app

## Cambios en el Header

El mensaje "autoescaneo activo cada 5 minutos" ahora es real si configuras GitHub Actions.

Si prefieres otro intervalo, edita `.github/workflows/update-feeds.yml`:

```yaml
schedule:
  - cron: '0 */3 * * *'  # Cada 3 horas
  - cron: '0 */12 * * *' # Cada 12 horas
  - cron: '0 0 * * *'    # Una vez al día
```

## Próximos Pasos

1. Sube estos archivos a GitHub
2. Configura el secret `API_TOKEN` en GitHub
3. ¡Listo! Los feeds se actualizarán automáticamente
