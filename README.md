# CTI Platform - Cyber Threat Intelligence Feed

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/yourrepo/cti-platform)

**CTI Platform** is a comprehensive Cyber Threat Intelligence system that aggregates, translates, enriches, and presents security news from multiple RSS feeds in real-time.

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
