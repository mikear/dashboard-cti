# CTI Platform - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Navigate to Project
```bash
cd c:\Users\diego\OneDrive\Documentos\app\Dashboard
```

### Step 2: Start All Services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (database)
- Redis (queue)
- OpenSearch (search)
- Backend API (NestJS)
- Worker (RSS ingestion)
- Frontend (React)

### Step 3: Wait for Initialization
```bash
# Check service status
docker-compose ps

# All services should show "healthy" or "running"
```

Wait approximately **30 seconds** for all services to initialize.

### Step 4: Access the Platform

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs (Swagger)**: http://localhost:3001/api/docs

### Step 5: Wait for Articles

The RSS worker will automatically:
1. Fetch articles from 5 pre-configured sources
2. Detect language
3. Translate to Spanish (if needed)
4. Extract IOCs  
5. Index to OpenSearch
6. Send WebSocket notifications

**First articles should appear within 5-10 minutes.**

## 📊 What to Expect

### Feed View
- Articles displayed in cards
- Summary, tags, IOC preview
- Translation badges with confidence
- Real-time updates via WebSocket

### TreeView (Left Panel)
- Filter by Type (threat_intel)
- Filter by Region (Americas, Global, etc.)
- Filter by Source (5 pre-configured)
- Counter badges show article count

### Search
- Full-text search in Spanish
- Date filters: 24h, 7d, 30d, custom
- Type and source filters

### Article Detail (Right Panel)
- Full article content
- Complete IOC list
- "Abrir Fuente" button (tracks clicks)
- Translation confidence indicator

## 🔍 Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f frontend
```

## 🛑 Stopping Services

```bash
docker-compose down
```

To remove all data (volumes):
```bash
docker-compose down -v
```

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check if ports are available
netstat -ano | findstr "3000 3001 5432 6379 9200"

# If ports are in use, stop conflicting services or change ports in .env
```

### No Articles Appearing
```bash
# Check worker logs
docker-compose logs worker

# Manually trigger ingestion (if admin endpoint added):
# curl -X POST http://localhost:3001/v1/admin/trigger-ingestion
```

### Database Connection Errors
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check if schema was created
docker-compose exec postgres psql -U cti -d cti_db -c "\dt"
```

### Frontend Can't Connect
```bash
# Check if backend is running
curl http://localhost:3001/v1/sources

# Check browser console for CORS errors
# Verify .env has correct URLs
```

## 📝 Default Configuration

**RSS Sources (Pre-configured):**
1. Krebs on Security
2. The Hacker News
3. Schneier on Security
4. Threatpost
5. Dark Reading

**Fetch Interval:** 30 minutes (configurable in database)

**Database:**
- Host: localhost
- Port: 5432
- User: cti
- Password: cti_password
- Database: cti_db

## 🎯 Next Steps

1. **Explore API:** http://localhost:3001/api/docs
2. **Add Sources:** POST to `/v1/sources`
3. **Query Articles:** GET `/v1/articles?query=ransomware`
4. **Check Database:**
   ```bash
   docker-compose exec postgres psql -U cti -d cti_db
   ```

## 📚 Documentation

- [README.md](file:///c:/Users/diego/OneDrive/Documentos/app/Dashboard/README.md) - Full documentation
- [OpenAPI Spec](file:///c:/Users/diego/OneDrive/Documentos/app/Dashboard/docs/openapi.yaml) - API reference
- [Walkthrough](file:///C:/Users/diego/.gemini/antigravity/brain/ebd8dff8-be41-4b7e-baa3-3eb11461eb56/walkthrough.md) - Implementation details

---

**You're all set! 🎉**

The platform is fully functional and ready to aggregate cyber threat intelligence from RSS feeds in real-time.
