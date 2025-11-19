-- Script para agregar fuentes RSS a la base de datos SQLite
-- Ejecutar después de que el backend inicie por primera vez

INSERT OR IGNORE INTO source_entity (id, name, url, type, region, country, language, enabled, fetchIntervalMinutes, createdAt, updatedAt)
VALUES 
  ('1', 'Krebs on Security', 'https://krebsonsecurity.com/feed/', 'threat_intel', 'Americas', 'USA', 'en', 1, 30, datetime('now'), datetime('now')),
  ('2', 'The Hacker News', 'https://feeds.feedburner.com/TheHackersNews', 'threat_intel', 'Global', 'Global', 'en', 1, 30, datetime('now'), datetime('now')),
  ('3', 'Schneier on Security', 'https://www.schneier.com/blog/atom.xml', 'threat_intel', 'Americas', 'USA', 'en', 1, 30, datetime('now'), datetime('now')),
  ('4', 'Threatpost', 'https://threatpost.com/feed/', 'threat_intel', 'Americas', 'USA', 'en', 1, 30, datetime('now'), datetime('now')),
  ('5', 'Dark Reading', 'https://www.darkreading.com/rss.xml', 'threat_intel', 'Americas', 'USA', 'en', 1, 30, datetime('now'), datetime('now'));
