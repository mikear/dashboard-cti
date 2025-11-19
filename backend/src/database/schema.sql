-- CTI Platform Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'analyst',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RSS Sources table
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'threat_intel', -- threat_intel, vulnerability, malware, general
    region VARCHAR(100), -- Americas, Europe, Asia, Global
    country VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    enabled BOOLEAN DEFAULT true,
    fetch_interval_minutes INTEGER DEFAULT 30,
    last_fetched_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    
    -- Original content
    title_raw TEXT NOT NULL,
    body_raw TEXT NOT NULL,
    summary_raw TEXT,
    source_url TEXT NOT NULL,
    published_at TIMESTAMP NOT NULL,
    language_detected VARCHAR(10),
    
    -- Translated content (Spanish)
    title_es TEXT,
    body_es TEXT,
    summary_es TEXT,
    translated_flag BOOLEAN DEFAULT false,
    confidence_translation DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Metadata
    fingerprint VARCHAR(64) UNIQUE NOT NULL, -- SHA256 for deduplication
    truncated BOOLEAN DEFAULT false,
    tags TEXT[], -- Array of tags
    
    -- Enrichment flags
    has_iocs BOOLEAN DEFAULT false,
    ioc_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    indexed_at TIMESTAMP
);

-- IOCs (Indicators of Compromise) table
CREATE TABLE IF NOT EXISTS iocs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    
    -- IOC details
    type VARCHAR(50) NOT NULL, -- ip, domain, url, hash_md5, hash_sha1, hash_sha256, cve, email
    value TEXT NOT NULL,
    normalized_value TEXT, -- Lowercased, trimmed
    
    -- Context
    context TEXT, -- Surrounding text where IOC was found
    confidence DECIMAL(3,2) DEFAULT 1.00,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate IOCs per article
    UNIQUE(article_id, type, normalized_value)
);

-- Audit Events table
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- click, view, search, export
    entity VARCHAR(50), -- article, source, user
    entity_id UUID,
    action VARCHAR(100) NOT NULL,
    
    -- User info
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Additional data
    payload JSONB,
    
    -- Timestamp
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_source_id ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_fingerprint ON articles(fingerprint);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_iocs_article_id ON iocs(article_id);
CREATE INDEX IF NOT EXISTS idx_iocs_type ON iocs(type);
CREATE INDEX IF NOT EXISTS idx_iocs_normalized_value ON iocs(normalized_value);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_user_id ON audit_events(user_id);

CREATE INDEX IF NOT EXISTS idx_sources_enabled ON sources(enabled) WHERE enabled = true;

-- Full-text search indexes (for PostgreSQL search, complement to OpenSearch)
CREATE INDEX IF NOT EXISTS idx_articles_title_es_fts ON articles USING GIN(to_tsvector('spanish', COALESCE(title_es, '')));
CREATE INDEX IF NOT EXISTS idx_articles_body_es_fts ON articles USING GIN(to_tsvector('spanish', COALESCE(body_es, '')));

-- Insert default admin user
INSERT INTO users (email, name, role) 
VALUES ('admin@cti.local', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert 5 trusted RSS sources
INSERT INTO sources (name, url, type, region, country, language, enabled, fetch_interval_minutes) VALUES
('Krebs on Security', 'https://krebsonsecurity.com/feed/', 'threat_intel', 'Americas', 'USA', 'en', true, 30),
('The Hacker News', 'https://feeds.feedburner.com/TheHackersNews', 'threat_intel', 'Global', 'India', 'en', true, 30),
('Schneier on Security', 'https://www.schneier.com/feed/atom/', 'threat_intel', 'Americas', 'USA', 'en', true, 60),
('Threatpost', 'https://threatpost.com/feed/', 'threat_intel', 'Americas', 'USA', 'en', true, 30),
('Dark Reading', 'https://www.darkreading.com/rss_simple.asp', 'threat_intel', 'Americas', 'USA', 'en', true, 45)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE articles IS 'Stores original and translated articles from RSS feeds';
COMMENT ON TABLE iocs IS 'Extracted indicators of compromise from articles';
COMMENT ON TABLE audit_events IS 'Audit trail for user actions and system events';
COMMENT ON TABLE sources IS 'RSS feed sources configuration';
