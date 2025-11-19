"""
API Endpoint para actualización automática de feeds RSS
Puede ser llamado desde cron-job.org o servicios similares
"""
import sqlite3
import feedparser
from datetime import datetime
import hashlib
import re
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import sys
import os

# Configuración
DB_PATH = "cti_platform.db"
API_TOKEN = os.getenv("API_TOKEN", "cti-api-secret-2025")  # Cambiar en producción

class IOCExtractor:
    """Extractor de Indicadores de Compromiso"""
    
    def __init__(self):
        self.patterns = {
            'ip': r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
            'domain': r'\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b',
            'cve': r'CVE-\d{4}-\d{4,7}',
            'md5': r'\b[a-fA-F0-9]{32}\b',
            'sha256': r'\b[a-fA-F0-9]{64}\b',
        }
    
    def extract_iocs(self, text: str) -> list:
        """Extrae todos los IOCs del texto"""
        iocs = []
        for ioc_type, pattern in self.patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            iocs.extend(matches)
        return list(set(iocs))

class RSSUpdater:
    """Actualiza feeds RSS automáticamente"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.ioc_extractor = IOCExtractor()
        self.translator = GoogleTranslator(source='auto', target='es')
    
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    def create_fingerprint(self, title: str, url: str) -> str:
        """Crea fingerprint único para evitar duplicados"""
        content = f"{title}{url}".lower()
        return hashlib.sha256(content.encode()).hexdigest()
    
    def process_entry(self, source_id: int, entry: dict) -> tuple:
        """Procesa una entrada RSS y la guarda en la DB"""
        try:
            title = entry.get('title', 'Sin título')
            link = entry.get('link', '')
            summary = entry.get('summary', entry.get('description', ''))
            
            # Limpiar HTML
            soup = BeautifulSoup(summary, 'html.parser')
            content = soup.get_text()
            
            # Filtrado de contenido
            excluded_keywords = [
                'virtual event', 'webinar', 'register now', 'view agenda',
                'conference', 'summit', 'outlook', 'predictions', 'rsvp',
                'join us', 'save the date', 'live event', 'registration',
                'upcoming event', 'event details'
            ]
            
            content_lower = content.lower()
            for keyword in excluded_keywords:
                if keyword in content_lower or keyword in title.lower():
                    return False, f"Filtrado: evento/anuncio ({keyword})"
            
            # Validar contenido de seguridad
            if len(content) > 50:
                relevant_keywords = [
                    'vulnerability', 'exploit', 'breach', 'malware', 'ransomware',
                    'cve', 'zero-day', 'patch', 'trojan', 'apt', 'phishing',
                    'backdoor', 'botnet', 'ddos', 'attack', 'threat', 'campaign',
                    'cybersecurity', 'security', 'hacker', 'data leak', 'compromise'
                ]
                
                has_relevant = any(kw in content_lower for kw in relevant_keywords)
                if not has_relevant:
                    return False, "Filtrado: sin contenido relevante de seguridad"
            
            # Traducir a español
            try:
                title_es = self.translator.translate(title[:500])
                summary_es = self.translator.translate(summary[:1000]) if summary else ""
                content_es = self.translator.translate(content[:2000]) if len(content) > 100 else content
            except:
                title_es = title
                summary_es = summary
                content_es = content
            
            # Fecha de publicación
            published = entry.get('published_parsed', entry.get('updated_parsed', None))
            if published:
                from datetime import timezone, timedelta
                published = datetime(*published[:6])
                published = published.replace(tzinfo=timezone.utc).astimezone(timezone(timedelta(hours=-5)))
                
                # Validar que no sea fecha futura
                now = datetime.now(timezone(timedelta(hours=-5)))
                max_date = now + timedelta(days=1)
                if published > max_date:
                    return False, f"Fecha futura rechazada: {published.strftime('%Y-%m-%d')}"
            else:
                published = datetime.now()
            
            fingerprint = self.create_fingerprint(title, link)
            
            # Extraer IOCs
            full_text = f"{title} {content}"
            iocs = self.ioc_extractor.extract_iocs(full_text)
            iocs_str = ','.join(iocs) if iocs else ''
            
            # Tags
            tags = ['threat_intel']
            if iocs:
                tags.append('iocs')
            tags_str = ','.join(tags)
            
            # Guardar en DB
            conn = self.get_connection()
            cursor = conn.cursor()
            
            try:
                cursor.execute("""
                    INSERT INTO articles (source_id, title, summary, content, url, published_at, fingerprint, iocs, tags)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (source_id, title_es, summary_es, content_es, link, published, fingerprint, iocs_str, tags_str))
                conn.commit()
                conn.close()
                return True, title_es
            except sqlite3.IntegrityError:
                conn.close()
                return False, "Duplicado"
                
        except Exception as e:
            return False, str(e)
    
    def update_all_feeds(self, max_per_source: int = 50) -> dict:
        """Actualiza todos los feeds RSS"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Obtener fuentes
        cursor.execute("SELECT id, name, url FROM sources WHERE active = 1")
        sources = cursor.fetchall()
        conn.close()
        
        results = {
            'total_sources': len(sources),
            'total_new': 0,
            'sources_updated': []
        }
        
        for source_id, name, url in sources:
            try:
                feed = feedparser.parse(url)
                entries = feed.entries[:max_per_source]
                
                new_count = 0
                for entry in entries:
                    added, _ = self.process_entry(source_id, entry)
                    if added:
                        new_count += 1
                
                # Actualizar timestamp de la fuente
                conn = self.get_connection()
                cursor = conn.cursor()
                cursor.execute("UPDATE sources SET last_fetched = ? WHERE id = ?", 
                             (datetime.now(), source_id))
                conn.commit()
                conn.close()
                
                results['total_new'] += new_count
                results['sources_updated'].append({
                    'name': name,
                    'new_articles': new_count
                })
                
            except Exception as e:
                results['sources_updated'].append({
                    'name': name,
                    'error': str(e)
                })
        
        return results

def main():
    """Endpoint principal"""
    # Verificar token de autenticación
    if len(sys.argv) > 1:
        provided_token = sys.argv[1]
        if provided_token != API_TOKEN:
            print("ERROR: Token inválido")
            sys.exit(1)
    else:
        print("ERROR: Token requerido")
        print("Uso: python api_endpoint.py <TOKEN>")
        sys.exit(1)
    
    # Ejecutar actualización
    print(f"[{datetime.now()}] Iniciando actualización automática de feeds...")
    updater = RSSUpdater(DB_PATH)
    results = updater.update_all_feeds()
    
    print(f"✅ Actualización completada:")
    print(f"   - Fuentes procesadas: {results['total_sources']}")
    print(f"   - Artículos nuevos: {results['total_new']}")
    
    for source in results['sources_updated']:
        if 'error' in source:
            print(f"   ❌ {source['name']}: {source['error']}")
        else:
            print(f"   ✓ {source['name']}: {source['new_articles']} nuevos")
    
    sys.exit(0)

if __name__ == "__main__":
    main()
