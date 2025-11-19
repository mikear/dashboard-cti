# CTI Platform - Cyber Threat Intelligence Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?logo=streamlit&logoColor=white)](https://streamlit.io)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)

**CTI Platform** es un sistema de Inteligencia de Amenazas Cibernéticas que agrega, traduce, enriquece y presenta noticias de seguridad desde múltiples fuentes RSS en tiempo real.

## 🌟 Características

- **Búsqueda Full-Text** con SQLite FTS5 y soporte para español
- **Paginación Inteligente** con configuración flexible de resultados
- **Traducción Automática** a español con preservación de IOCs
- **Extracción de IOCs** (IPs, dominios, CVEs, hashes, emails)
- **Dashboard de Estadísticas** con visualizaciones profesionales
- **Filtrado de Contenido** para excluir eventos/webinars no relevantes
- **Actualización Incremental** con barras de progreso en tiempo real
- **Interfaz Responsive** construida con Streamlit

## 🚀 Despliegue en Streamlit Cloud (GRATIS)

### Opción 1: Streamlit Cloud (Recomendado - Más Fácil)

1. **Sube tu código a GitHub:**

   ```bash
   cd "c:\Users\diego\OneDrive\Documentos\app\Dashboard"
   git init
   git add .
   git commit -m "Initial commit - CTI Platform"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/cti-platform.git
   git push -u origin main
   ```

2. **Despliega en Streamlit Cloud:**

   - Ve a [share.streamlit.io](https://share.streamlit.io)
   - Inicia sesión con GitHub
   - Click en "New app"
   - Selecciona tu repositorio `cti-platform`
   - Main file: `app.py`
   - Click "Deploy"

3. **¡Listo!** Tu app estará en: `https://TU-USUARIO-cti-platform.streamlit.app`

### Opción 2: Railway.app

1. **Instala Railway CLI:**

   ```bash
   npm install -g @railway/cli
   ```

2. **Despliega:**

   ```bash
   railway login
   railway init
   railway up
   ```

3. **Configura dominio público** en el dashboard de Railway

### Opción 3: Render.com

1. Crea cuenta en [render.com](https://render.com)
2. "New" → "Web Service"
3. Conecta tu repositorio GitHub
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `streamlit run app.py --server.port=$PORT --server.address=0.0.0.0`
6. Click "Create Web Service"

## 💻 Instalación Local

### Prerrequisitos

- Python 3.11+
- pip

### Pasos

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/TU-USUARIO/cti-platform.git
   cd cti-platform
   ```

2. **Instala dependencias:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Ejecuta la aplicación:**

   ```bash
   streamlit run app.py
   ```

4. **Accede a:** http://localhost:8501

## 📚 Uso

### Feed de Noticias

- **Búsqueda:** Usa el campo de búsqueda para encontrar artículos por palabras clave
- **Filtros:** Selecciona días (1/7/30/Todos) y fuente específica
- **Paginación:** Configura resultados por página (25/50/100)
- **Navegación:** Usa los controles de página superior e inferior

### Dashboard de Estadísticas

- **Período de Tendencias:** Selecciona 7/30/90 días o todo el historial
- **KPIs:** Visualiza artículos totales, últimos 7 días, y con IOCs
- **Gráficos:** Distribución por criticidad, tipos de amenazas, IOCs, y fuentes

### Actualizar Feeds

- Click en "🔄 Actualizar Feeds" en el sidebar
- **Configuración:** Ajusta cantidad máxima por fuente (10/25/50/100)
- **Progreso:** Observa barra de progreso y estado en tiempo real
- **Filtrado:** El sistema excluye automáticamente eventos/webinars

## 🔍 Características Técnicas

### Búsqueda Full-Text (FTS5)

- Tokenizador Unicode61 con soporte para español
- Búsqueda por prefijos automática (`término*`)
- Ranking BM25 para relevancia
- Fallback a LIKE si FTS no está disponible

### Filtrado Inteligente de Contenido

**Palabras excluidas:**
- virtual event, webinar, register, conference, summit, outlook, predictions, RSVP

**Palabras requeridas (seguridad):**
- vulnerability, exploit, breach, malware, ransomware, CVE, zero-day, patch, trojan, APT, phishing, backdoor

### Validación de Fechas

- Rechaza artículos con fechas futuras (margen de 1 día)
- Evita anomalías en gráficos de tendencias

## 📦 Estructura del Proyecto

```
Dashboard/
├── app.py                 # Aplicación principal Streamlit
├── requirements.txt       # Dependencias Python
├── .streamlit/
│   └── config.toml       # Configuración de Streamlit
├── .gitignore            # Archivos excluidos de Git
└── README.md             # Este archivo
```

## 🔐 Seguridad

- **Sanitización HTML:** Todo el contenido se limpia con BeautifulSoup
- **Validación de Fechas:** Previene inyección de datos futuros
- **Preservación de IOCs:** Los indicadores técnicos nunca se modifican en traducción
- **Base de Datos Local:** SQLite con fingerprints SHA256 para prevenir duplicados

## ⚙️ Configuración

### Agregar Nuevas Fuentes RSS

Edita la tabla `sources` en la base de datos SQLite:

```python
# En app.py, dentro de init_database():
cursor.execute("""
    INSERT INTO sources (name, url, type, region, country, language)
    VALUES (?, ?, ?, ?, ?, ?)
""", ('Nueva Fuente', 'https://example.com/feed.xml', 'threat_intel', 'Americas', 'Mexico', 'es'))
```

### Fuentes Actuales

1. **Krebs on Security** - Investigación de ciberseguridad
2. **The Hacker News** - Noticias de seguridad informática
3. **Schneier on Security** - Blog de experto en criptografía
4. **Threatpost** - Inteligencia de amenazas
5. **Dark Reading** - Noticias empresariales de seguridad

## 🐛 Solución de Problemas

### La base de datos está vacía

Ejecuta "🔄 Actualizar Feeds" en el sidebar para poblar artículos.

### Error en traducción

Verifica conexión a internet. El sistema usa Google Translate gratuito.

### Búsqueda no funciona

Asegúrate de que la tabla FTS5 está inicializada. Reinicia la app.

### Gráfico de tendencias muestra fechas futuras

La última actualización agregó validación. Actualiza feeds nuevamente para filtrar artículos con fechas incorrectas.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## 🙏 Agradecimientos

- Krebs on Security
- The Hacker News
- Schneier on Security
- Threatpost
- Dark Reading

---

**Construido con ❤️ para la comunidad de ciberseguridad**

## 🌟 Features

- **Real-time RSS Ingestion** from 5 trusted cybersecurity sources
- **Automatic Translation** to Spanish with IOC preservation
- **IOC Extraction** using regex patterns (IPs, domains, CVEs, hashes, emails)
- **Full-text Search** powered by OpenSearch with Spanish analyzer
- **WebSocket Updates** for live feed notifications
- **Virtualized TreeView** for filtering by type, region, and source
- **Audit Trail** for click tracking and user actions
- **Responsive UI** built with React, TypeScript, and Tailwind CSS

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│  PostgreSQL │
│ React + WS  │         │   NestJS     │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
                                │
                                ├──────────────┐
                                ▼              ▼
                        ┌──────────────┐  ┌────────────┐
                        │  OpenSearch  │  │   Redis    │
                        │   (Search)   │  │  (Queue)   │
                        └──────────────┘  └────────────┘
                                ▲
                                │
                        ┌──────────────┐
                        │  RSS Worker  │
                        │  (BullMQ)    │
                        └──────────────┘
```

### Tech Stack

**Backend:**
- NestJS + TypeScript
- PostgreSQL (database)
- OpenSearch (full-text search)
- Redis + BullMQ (job queue)
- Socket.io (WebSocket)
- RSS Parser, franc (language detection), Google Translate API

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS
- React Query (data fetching)
- Socket.io-client (WebSocket)
- react-window (virtualization)

**Infrastructure:**
- Docker + Docker Compose
- GitHub Actions (CI/CD)

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourrepo/cti-platform.git
cd cti-platform
```

2. **Create environment file:**

```bash
cp .env.example .env
```

3. **Start services with Docker Compose:**

```bash
docker-compose up -d
```

4. **Wait for services to initialize (~30 seconds):**

```bash
docker-compose ps
```

5. **Run seed script (optional):**

```bash
bash fixtures/seed.sh
```

6. **Access the platform:**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api/docs
- **OpenSearch:** http://localhost:9200

### First-time Setup

The RSS worker will automatically fetch articles from configured sources every 30 minutes. To trigger immediate ingestion:

- Wait ~5 minutes after startup
- The worker scheduler will automatically begin fetching
- New articles will appear in the feed via WebSocket

## 📚 API Endpoints

### Articles

- `GET /v1/articles` - List articles with filters
  - Query params: `query`, `from`, `to`, `type`, `source`, `page`, `size`
  - Returns paginated list of articles

- `GET /v1/articles/:id` - Get article details
  - Returns full article with IOCs

- `POST /v1/articles/:id/click` - Track click and get source URL
  - Creates audit event
  - Returns `{ sourceUrl: string }`

### Sources

- `GET /v1/sources` - List all RSS sources
- `POST /v1/sources` - Add new RSS source (admin)

### Search

- `GET /v1/search/fields` - Get search facets and aggregations

### WebSocket

- **Endpoint:** `/v1/stream`
- **Events:**
  - `new_article` - Emitted when new article is processed
  - `article_updated` - Emitted when article is modified

## 🔍 WebSocket Event Contracts

### new_article Event

```json
{
  "event": "new_article",
  "article_id": "uuid",
  "title_es": "string",
  "summary_es": "string",
  "tags": ["threat_intel", "Americas"],
  "iocs_preview": ["192.168.1.1", "CVE-2021-44228"],
  "published_at": "2024-11-19T10:00:00Z",
  "source_name": "Krebs on Security",
  "translated": true,
  "confidence": 0.85
}
```

### audit Event (Click tracking)

```json
{
  "event": "audit",
  "entity": "article",
  "entity_id": "uuid",
  "action": "click",
  "user_id": "uuid",
  "timestamp": "2024-11-19T10:00:00Z",
  "payload": {
    "source_url": "https://example.com/article"
  }
}
```

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test
npm run test:cov
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
cd tests
npm run test:integration
```

## 📦 Project Structure

```
cti-platform/
├── backend/               # NestJS backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── articles/  # Articles CRUD + WebSocket
│   │   │   ├── sources/   # RSS sources management
│   │   │   ├── search/    # OpenSearch integration
│   │   │   ├── ingestion/ # RSS pipeline
│   │   │   └── common/    # Shared entities
│   │   ├── database/      # SQL schema
│   │   ├── main.ts        # API entry point
│   │   └── worker.ts      # Worker entry point
│   └── package.json
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API clients
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── infra/                 # Infrastructure configs
├── docs/                  # Documentation
│   └── openapi.yaml       # OpenAPI spec
├── tests/                 # Integration tests
├── fixtures/              # Test data
│   ├── articles.json
│   └── seed.sh
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔐 Security

- **TLS:** Use HTTPS in production (self-signed certs OK for demo)
- **Secrets:** Store in `.env` file, never commit
- **HTML Sanitization:** All user-facing content is sanitized
- **Audit Trail:** All clicks and actions are logged
- **IOC Preservation:** Technical indicators are never modified during translation

## ⚙️ Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key settings:
- `DATABASE_*` - PostgreSQL connection
- `OPENSEARCH_NODE` - OpenSearch endpoint
- `TRANSLATION_SERVICE` - Translation provider
- `RSS_FETCH_INTERVAL_MINUTES` - Ingestion interval
- `JWT_SECRET` - Authentication secret (production)

### Adding New RSS Sources

Via API:

```bash
curl -X POST http://localhost:3001/v1/sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Source Name",
    "url": "https://example.com/feed.xml",
    "type": "threat_intel",
    "region": "Europe",
    "country": "UK",
    "language": "en",
    "fetchIntervalMinutes": 30
  }'
```

Via database (for initial setup, already included):

```sql
INSERT INTO sources (name, url, type, region, country, language)
VALUES ('My Source', 'https://feed.url', 'threat_intel', 'Asia', 'Japan', 'ja');
```

## 📋 Acceptance Criteria Checklist

- [x] Docker Compose launches all services successfully
- [x] Frontend accessible at http://localhost:3000
- [x] Feed displays seeded articles
- [x] TreeView shows type → region → source hierarchy
- [x] Click "Abrir Fuente" creates audit event and opens URL
- [x] Search by Spanish terms returns relevant results
- [x] Date filters work (24h, 7d, 30d)
- [x] Translated articles show "Traducido" badge
- [x] CVEs and IOCs are preserved in translations
- [x] IOCs are extracted and displayed
- [x] WebSocket emits new_article events
- [x] Real-time feed updates appear automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Krebs on Security
- The Hacker News
- Schneier on Security
- Threatpost
- Dark Reading

## 📞 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ for the cybersecurity community**
