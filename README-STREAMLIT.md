# CTI Platform - Streamlit Edition

## 🎯 Aplicación Completamente Refactorizada

Esta es una versión **100% Python** de la plataforma CTI, usando **Streamlit** para una ejecución simple y local.

## ✨ Características

- ✅ **Una sola aplicación Python** - No más frontend/backend separados
- ✅ **Sin Node.js** - Solo Python
- ✅ **Sin Docker** - Ejecución nativa
- ✅ **Base de datos SQLite** - Integrada y local
- ✅ **Interfaz web moderna** - Con Streamlit
- ✅ **Extracción automática de IOCs** - IPs, dominios, CVEs, hashes
- ✅ **5 fuentes RSS pre-configuradas** - Listas para usar
- ✅ **Búsqueda y filtros** - En tiempo real

## 📦 Requisitos

- **Python 3.8+** - [Descargar aquí](https://www.python.org/downloads/)
  - ⚠️ Durante la instalación, marca "Add Python to PATH"

## 🚀 Instalación Rápida

### Opción 1: Automática (Recomendada)

1. Ejecuta:
   ```
   setup.bat
   ```

2. Espera a que se instalen las dependencias (~1 minuto)

### Opción 2: Manual

```bash
pip install -r requirements.txt
```

## ▶️ Ejecución

### Método 1: Script (Más fácil)

Ejecuta:
```
run.bat
```

### Método 2: Línea de comandos

```bash
streamlit run app.py
```

La aplicación se abrirá automáticamente en tu navegador en: **http://localhost:8501**

## 🎮 Cómo Usar

### 1. Actualizar Feeds
- Haz clic en el botón **"🔄 Actualizar Feeds"** en el menú lateral
- Espera unos segundos mientras se procesan los feeds RSS
- Los artículos aparecerán automáticamente

### 2. Buscar Artículos
- Usa el campo **"Buscar"** para filtrar por palabras clave
- Selecciona un **período de tiempo** (24h, 7d, 30d)
- Filtra por **fuente específica**

### 3. Ver Detalles
- Haz clic en cualquier artículo para expandirlo
- Verás el contenido completo y los IOCs detectados
- Haz clic en "🔗 Ver artículo original" para abrir la fuente

### 4. Agregar Fuentes RSS
- Ve a la pestaña **"🔍 Fuentes RSS"**
- Completa el formulario
- Haz clic en **"Agregar Fuente"**

## 📊 Fuentes Pre-configuradas

1. **Krebs on Security** - krebsonsecurity.com
2. **The Hacker News** - thehackernews.com
3. **Schneier on Security** - schneier.com
4. **Threatpost** - threatpost.com
5. **Dark Reading** - darkreading.com

## 🔴 IOCs Detectados Automáticamente

- 🌐 **Direcciones IP** - IPv4
- 🔗 **Dominios** - URLs y dominios
- 🔐 **CVEs** - CVE-2023-XXXXX
- #️⃣ **Hashes** - MD5 y SHA256

## 💾 Archivos Importantes

- `app.py` - Aplicación principal
- `requirements.txt` - Dependencias Python
- `cti_platform.db` - Base de datos SQLite (se crea automáticamente)
- `run.bat` - Script de ejecución
- `setup.bat` - Script de instalación

## 🔧 Solución de Problemas

### Python no reconocido
```
Solución: Reinstala Python y marca "Add Python to PATH"
```

### Error al instalar dependencias
```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### Puerto 8501 ocupado
```bash
streamlit run app.py --server.port 8502
```

### Limpiar base de datos
```bash
del cti_platform.db
```

## 🆚 Comparación con Versión Anterior

| Característica | Versión Anterior | Versión Streamlit |
|---------------|------------------|-------------------|
| Tecnología | Node.js + React + NestJS | Python + Streamlit |
| Instalación | `npm install` x2 | `pip install` |
| Ejecución | 2 terminales | 1 comando |
| Base de datos | PostgreSQL/SQLite | SQLite |
| Búsqueda | OpenSearch | Búsqueda nativa |
| Cola de trabajos | Redis + BullMQ | Directo |
| Compilación | TypeScript | No necesaria |
| Tamaño | ~500MB node_modules | ~50MB |

## 🎯 Ventajas

1. **Más simple**: 1 archivo principal vs 50+ archivos
2. **Más rápido**: Sin compilación, ejecución inmediata
3. **Más ligero**: ~50MB vs ~500MB
4. **Más fácil**: Un solo lenguaje (Python)
5. **Más portable**: Funciona en cualquier PC con Python

## 📝 Estructura del Código

```python
app.py                 # Aplicación completa
├── CTIDatabase        # Manejo de SQLite
├── IOCExtractor       # Extracción de IOCs
├── RSSProcessor       # Procesamiento de feeds
└── Streamlit UI       # Interfaz de usuario
```

## 🚫 Qué se Eliminó

- ❌ Node.js y npm
- ❌ TypeScript y compilación
- ❌ Frontend/Backend separados
- ❌ Docker y docker-compose
- ❌ PostgreSQL
- ❌ Redis y BullMQ
- ❌ OpenSearch
- ❌ WebSockets
- ❌ Configuración compleja

## ✅ Qué se Mantuvo

- ✅ Lectura de feeds RSS
- ✅ Extracción de IOCs
- ✅ Almacenamiento de artículos
- ✅ Búsqueda y filtros
- ✅ Interfaz web
- ✅ Fuentes pre-configuradas

## 🔄 Migración desde Versión Anterior

Si tenías la versión anterior ejecutándose:

1. Detén los servicios Node.js:
   ```bash
   taskkill /F /IM node.exe
   ```

2. Ejecuta la nueva versión:
   ```bash
   run.bat
   ```

**Nota**: Los datos anteriores no se migran automáticamente. La nueva versión usa su propia base de datos SQLite.

## 📚 Tecnologías Usadas

- **Streamlit** - Framework web para Python
- **SQLite** - Base de datos embebida
- **Feedparser** - Procesamiento de RSS
- **BeautifulSoup** - Parsing de HTML
- **Pandas** - Manejo de datos
- **Regular Expressions** - Extracción de IOCs

## 🤝 Contribuir

La aplicación es un solo archivo Python (`app.py`), muy fácil de modificar y extender.

## 📄 Licencia

MIT License

---

**¡Disfruta de tu nueva CTI Platform simplificada!** 🎉
