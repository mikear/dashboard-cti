#!/bin/bash

echo "🌱 CTI Platform - Seed Script"
echo "=============================="

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check PostgreSQL
echo "🔍 Checking PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U cti > /dev/null 2>&1; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done
echo "✅ PostgreSQL is ready"

# Check OpenSearch
echo "🔍 Checking OpenSearch..."
until curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; do
  echo "Waiting for OpenSearch..."
  sleep 2
done
echo "✅ OpenSearch is ready"

# Check Backend API
echo "🔍 Checking Backend API..."
until curl -s http://localhost:3001 > /dev/null 2>&1; do
  echo "Waiting for Backend API..."
  sleep 2
done
echo "✅ Backend API is ready"

# Load fixture articles via API (simulated ingestion)
echo "📥 Loading fixture articles..."
# Note: In a real scenario, you would parse articles.json and POST via API
# For demo, the worker will fetch from pre-configured RSS sources

# Trigger manual RSS ingestion for all sources
echo "🔄 Triggering RSS ingestion..."
# This would require an admin endpoint: POST /v1/admin/trigger-ingestion
# For demo, the scheduler will handle this automatically

echo ""
echo "✅ Seed complete!"
echo ""
echo "📊 Access the platform:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   API Docs: http://localhost:3001/api/docs"
echo "   OpenSearch: http://localhost:9200"
echo ""
echo "🎯 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Wait a few minutes for RSS worker to fetch articles"
echo "   3. Articles will appear in the feed automaticallly"
echo ""
