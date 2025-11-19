# NOTAS DE VERSIÓN - CTI Dashboard
**Versión:** 2.0.0  
**Fecha:** 19 de Noviembre 2025  
**Autor:** Sistema CTI

---

## 🎯 Características Principales

### ✅ Completado

#### 1. **Refactorización Completa a Python/Streamlit**
   - Migración de stack Node.js/React/NestJS a Python/Streamlit
   - Arquitectura simplificada: de 50+ archivos a 1 archivo principal (`app.py`)
   - Eliminación de dependencias Docker
   - Base de datos: PostgreSQL → SQLite3

#### 2. **Sistema de Traducción Automática**
   - Integración de `deep-translator` para traducción automática
   - Traducción de títulos, resúmenes y contenido de inglés a español
   - Localización para Latinoamérica (zona horaria UTC-5)
   - Traducción de fechas y meses al español

#### 3. **Sistema de Clasificación de Amenazas por Criticidad**
   - **5 niveles de criticidad** con códigos de color:
     - 🔴 **CRÍTICO** (Rojo #dc2626): Ransomware, Zero-Day, RCE, Vulnerabilidades Críticas
     - 🟠 **ALTO** (Naranja #ea580c): Malware, APT, Data Breach, Ataques Dirigidos
     - 🟡 **MEDIO** (Amarillo #f59e0b): Phishing, Vulnerabilidades, Exploits, Botnets
     - 🔵 **BAJO** (Azul #3b82f6): Actualizaciones, Parches, Advisories
     - ⚪ **INFO** (Gris #6b7280): Información General
   
   - Clasificación automática basada en palabras clave (inglés y español)
   - Etiquetas visuales tipo tarjeta en cada artículo
   - Detección de tipos específicos de amenaza

#### 4. **Procesamiento de Feeds RSS**
   - 5 fuentes RSS preconfiguradas:
     - Krebs on Security
     - The Hacker News
     - Schneier on Security
     - Threatpost
     - Dark Reading
   - Parser RSS con limpieza HTML
   - Extracción de contenido y resúmenes
   - Sistema de fingerprinting para evitar duplicados

#### 5. **Extracción de IOCs (Indicadores de Compromiso)**
   - Detección automática de:
     - Direcciones IP
     - Dominios
     - CVEs
     - Hashes MD5
     - Hashes SHA256
   - Visualización destacada de IOCs en cada artículo
   - Límite de 20 IOCs únicos por artículo

#### 6. **Interfaz de Usuario Mejorada**
   - Dashboard responsivo con Streamlit
   - Sistema de pestañas: Feed, Fuentes RSS, Ayuda
   - Filtros avanzados:
     - Búsqueda por palabras clave
     - Filtro por período (24h, 7d, 30d)
     - Filtro por fuente
   - Visualización en columnas (título + etiqueta de amenaza)
   - Expanders para detalles de artículos

#### 7. **Gestión de Base de Datos**
   - SQLite3 con adaptadores para Python 3.12+
   - Tablas: `sources` y `articles`
   - Botón de reinicio de base de datos
   - Sistema de timestamps y fingerprints

#### 8. **Scripts de Utilidad**
   - `start.bat`: Launcher simplificado
   - `install.bat`: Instalador de dependencias
   - `backup_dashboard.ps1`: Script de backup automático

---

## 🔧 Dependencias

```txt
streamlit>=1.28.0
feedparser>=6.0.10
pandas>=2.0.0
beautifulsoup4>=4.12.0
requests>=2.31.0
deep-translator>=1.11.4
```

---

## 📁 Estructura del Proyecto

```
Dashboard/
├── app.py                    # Aplicación principal (700 líneas)
├── requirements.txt          # Dependencias Python
├── start.bat                 # Launcher
├── install.bat              # Instalador
├── cti_platform.db          # Base de datos SQLite
├── AMENAZAS.md              # Documentación de clasificación
└── backup_dashboard.ps1     # Script de backup
```

---

## 🚀 Instrucciones de Uso

### Instalación
```bash
install.bat
```

### Ejecutar
```bash
start.bat
```

### Actualizar Feeds
1. Abrir aplicación en `http://localhost:8501`
2. Click en "🔄 Actualizar Feeds" (sidebar)
3. Esperar procesamiento y traducción automática

### Reiniciar Base de Datos
1. Click en "🗑️ Reiniciar DB" (sidebar)
2. Confirmar acción
3. Actualizar feeds nuevamente

---

## 🔄 Cambios Técnicos Importantes

### Python 3.12+ Compatibility
- Adaptadores SQLite para datetime registrados correctamente
- Manejo de timezones con `timezone` de `datetime`
- Conversión automática a UTC-5 para Latinoamérica

### Mejoras de Performance
- Pausas de 0.5s entre traducciones para evitar límites de API
- Limpieza HTML con BeautifulSoup
- Límite de caracteres para traducción (500 título, 500 resumen, 1000 contenido)
- Manejo de excepciones con fallback a texto original

### Sistema de Clasificación
- Algoritmo de detección por palabras clave jerárquico
- Prioridad: critical > high > medium > low > info
- Detección de tipo específico dentro de cada nivel
- Soporte multiidioma (inglés/español)

---

## 📝 Notas de Desarrollo

### Problemas Resueltos
- ✅ Compilación de backend Node.js/TypeScript
- ✅ Conflictos de puertos (3001, 3000)
- ✅ Incompatibilidad con Docker
- ✅ Warnings de deprecación SQLite en Python 3.12+
- ✅ Renderizado HTML en expanders de Streamlit
- ✅ Visualización de etiquetas de amenaza con CSS

### Archivos Eliminados
- `start_local.bat`
- `start_local_fixed.bat`
- `run_local.bat`
- `clean.bat`
- `setup.bat`
- `run.bat`

### Características Futuras (Roadmap)
- [ ] Sistema de alertas en tiempo real
- [ ] Exportación de reportes PDF
- [ ] API REST para integración externa
- [ ] Dashboard de analytics y métricas
- [ ] Notificaciones por email/Telegram
- [ ] Almacenamiento histórico de IOCs
- [ ] Gráficos de tendencias de amenazas

---

## 🛡️ Seguridad

- Base de datos local (sin exposición externa)
- Sin credenciales hardcodeadas
- Validación de URLs en fuentes RSS
- Sanitización de contenido HTML
- Límite de IOCs para prevenir sobrecarga

---

## 📊 Estadísticas del Proyecto

- **Líneas de código principal:** ~700 líneas (app.py)
- **Reducción de complejidad:** 95% (de 50+ archivos a 1)
- **Tiempo de setup:** <2 minutos
- **Dependencias:** 6 paquetes Python
- **Fuentes RSS:** 5 preconfiguradas
- **Tipos de IOCs:** 5 categorías
- **Niveles de amenaza:** 5 criticidades

---

## 📞 Soporte

Para reportar issues o sugerencias, revisar el código fuente en:
`c:\Users\diego\OneDrive\Documentos\app\Dashboard\app.py`

---

**Fin del Documento**
