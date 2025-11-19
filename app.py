import streamlit as st
import sqlite3
import feedparser
import pandas as pd
from datetime import datetime, timedelta
import re
from typing import List, Dict
import hashlib
import requests
from bs4 import BeautifulSoup
import time
import plotly.express as px

# Configuración de la página
st.set_page_config(
    page_title="CTI Platform",
    page_icon="🔒",
    layout="wide",
    initial_sidebar_state="expanded"
)

# =======================
# AUTENTICACIÓN DE ADMIN
# =======================
def check_admin_password():
    """Verifica si el usuario ha ingresado la contraseña correcta de admin"""
    
    def password_entered():
        """Callback cuando se ingresa la contraseña"""
        if (st.session_state["username"] == st.session_state["admin_username"] and
            st.session_state["password"] == st.session_state["admin_password"]):
            st.session_state["admin_authenticated"] = True
            del st.session_state["password"]  # No guardar la contraseña
        else:
            st.session_state["admin_authenticated"] = False
    
    # Cargar credenciales desde secrets.toml o usar valores por defecto
    if "admin_username" not in st.session_state:
        try:
            st.session_state["admin_username"] = st.secrets["admin"]["username"]
            st.session_state["admin_password"] = st.secrets["admin"]["password"]
        except:
            # Valores por defecto si no hay secrets.toml (CAMBIAR EN PRODUCCIÓN)
            st.session_state["admin_username"] = "admin"
            st.session_state["admin_password"] = "cti2025"
    
    if "admin_authenticated" not in st.session_state:
        st.session_state["admin_authenticated"] = False
    
    if not st.session_state["admin_authenticated"]:
        st.markdown("### 🔐 Acceso de Administrador")
        st.text_input("Usuario", key="username")
        st.text_input("Contraseña", type="password", key="password", on_change=password_entered)
        
        if st.session_state.get("admin_authenticated") == False and "password" in st.session_state:
            st.error("❌ Usuario o contraseña incorrectos")
        
        return False
    else:
        return True

# Estilos CSS personalizados
st.markdown("""
<style>
    /* Ocultar header por defecto de Streamlit */
    header[data-testid=\"stHeader\"] { background-color: transparent; }

    /* Header personalizado */
    .main-header {
        position: fixed;
        top: 0; left: 0; right: 0;
        z-index: 999;
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%);
        padding: 25px 40px;
        color: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        text-align: center;
        border-bottom: 3px solid #0ea5e9;
    }
    .main-header h1 {
        margin: 0; font-size: 2.5em; font-weight: 800; letter-spacing: 2px;
        text-shadow: 2px 2px 8px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center; gap: 15px;
    }
    .main-header .logo { font-size: 1.2em; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3)); }
    .main-header p { margin: 8px 0 0 0; font-size: 1.1em; font-weight: 300; letter-spacing: 1px; opacity: .95; }

    /* Barra de estado bajo el título */
    .status-bar { margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: .95em; }
    .status-led { width: 10px; height: 10px; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 0 rgba(16,185,129,.7); animation: pulse 1s infinite alternate; }
    .status-led.green { background-color: #10b981; }
    @keyframes pulse { from { box-shadow: 0 0 0 0 rgba(16,185,129,.7); opacity: .6; } to { box-shadow: 0 0 12px 6px rgba(16,185,129,.25); opacity: 1; } }

    /* Espacio para el header fijo */
    .block-container { padding-top: 200px !important; }
    section[data-testid=\"stSidebar\"] { padding-top: 150px; }

    .article-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0; background: white; }
    .ioc-badge { background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin: 2px; display: inline-block; }
    .translated-badge { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .threat-critical { background:#dc2626; color:#fff; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:bold; display:inline-block; white-space:nowrap; }
    .threat-high { background:#ea580c; color:#fff; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:bold; display:inline-block; white-space:nowrap; }
    .threat-medium { background:#f59e0b; color:#fff; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:bold; display:inline-block; white-space:nowrap; }
    .threat-low { background:#3b82f6; color:#fff; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:bold; display:inline-block; white-space:nowrap; }
    .threat-info { background:#6b7280; color:#fff; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:bold; display:inline-block; white-space:nowrap; }

    /* Dashboard grid */
    .dash-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr; } }
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
</style>
""", unsafe_allow_html=True)

# Clase para manejar la base de datos
class CTIDatabase:
    def __init__(self, db_path="cti_platform.db"):
        self.db_path = db_path
        self.has_fts = False
        self.init_database()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path, detect_types=sqlite3.PARSE_DECLTYPES|sqlite3.PARSE_COLNAMES)
        # Registrar adaptadores de fecha/hora para Python 3.12+
        sqlite3.register_adapter(datetime, lambda val: val.isoformat())
        sqlite3.register_converter("timestamp", lambda val: datetime.fromisoformat(val.decode()))
        return conn
    
    def init_database(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Tabla de fuentes RSS
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL UNIQUE,
            type TEXT DEFAULT 'threat_intel',
            region TEXT,
            enabled INTEGER DEFAULT 1,
            last_fetched TIMESTAMP
        )
        """)
        
        # Tabla de artículos
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_id INTEGER,
            title TEXT NOT NULL,
            summary TEXT,
            content TEXT,
            url TEXT UNIQUE,
            published TIMESTAMP,
            fingerprint TEXT UNIQUE,
            iocs TEXT,
            tags TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (source_id) REFERENCES sources(id)
        )
        """)
        
        # Inicializar fuentes por defecto si no existen
        cursor.execute("SELECT COUNT(*) FROM sources")
        if cursor.fetchone()[0] == 0:
            default_sources = [
                ("Krebs on Security", "https://krebsonsecurity.com/feed/", "threat_intel", "Americas"),
                ("The Hacker News", "https://feeds.feedburner.com/TheHackersNews", "threat_intel", "Global"),
                ("Schneier on Security", "https://www.schneier.com/blog/atom.xml", "threat_intel", "Americas"),
                ("Threatpost", "https://threatpost.com/feed/", "threat_intel", "Americas"),
                ("Dark Reading", "https://www.darkreading.com/rss.xml", "threat_intel", "Americas"),
            ]
            cursor.executemany(
                "INSERT INTO sources (name, url, type, region) VALUES (?, ?, ?, ?)",
                default_sources
            )
        
            # Crear tabla FTS5 para búsqueda avanzada y triggers de sincronización
            try:
                # Recrear FTS en cada arranque para asegurar tokenizer y opciones correctas
                cursor.execute("DROP TABLE IF EXISTS articles_fts")
                cursor.execute(
                    """
                    CREATE VIRTUAL TABLE articles_fts
                    USING fts5(
                        title, summary, content, tags,
                        content='articles', content_rowid='id',
                        prefix='2 3',
                        tokenize = 'unicode61 remove_diacritics 2'
                    )
                    """
                )

                # Triggers para mantener FTS sincronizado
                cursor.execute(
                    """
                    CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
                      INSERT INTO articles_fts(rowid, title, summary, content, tags)
                      VALUES (new.id, new.title, new.summary, new.content, new.tags);
                    END;
                    """
                )
                cursor.execute(
                    """
                    CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
                      DELETE FROM articles_fts WHERE rowid = old.id;
                    END;
                    """
                )
                cursor.execute(
                    """
                    CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
                      DELETE FROM articles_fts WHERE rowid = old.id;
                      INSERT INTO articles_fts(rowid, title, summary, content, tags)
                      VALUES (new.id, new.title, new.summary, new.content, new.tags);
                    END;
                    """
                )

                # Backfill inicial
                cursor.execute(
                    """
                    INSERT INTO articles_fts(rowid, title, summary, content, tags)
                    SELECT id, title, summary, content, tags FROM articles
                    """
                )
                self.has_fts = True
            except sqlite3.Error:
                # Si la compilación de SQLite no soporta FTS5, continuar sin FTS
                self.has_fts = False

        conn.commit()
        conn.close()
    
    def get_sources(self):
        conn = self.get_connection()
        df = pd.read_sql_query("SELECT * FROM sources WHERE enabled = 1", conn)
        conn.close()
        return df
    
    def get_articles(self, limit=50, source_id=None, search_query=None, days=None, offset=0):
        # Si hay término de búsqueda y FTS disponible, usar FTS para resultados relevantes
        if search_query and self.has_fts:
            try:
                conn = self.get_connection()
                # Saneamiento básico para consulta FTS: si no hay operadores, usar prefijos
                q = (search_query or '').strip()
                ops = ['"', ' AND ', ' OR ', ' NOT ', ' NEAR ', '*']
                if not any(op in q for op in ops):
                    terms = [t for t in re.split(r"\s+", q) if t]
                    if terms:
                        q = " ".join([f"{t}*" for t in terms])
                
                query = (
                    "SELECT a.*, s.name as source_name, bm25(articles_fts) as score "
                    "FROM articles_fts JOIN articles a ON a.id = articles_fts.rowid "
                    "JOIN sources s ON a.source_id = s.id "
                    "WHERE articles_fts MATCH ?"
                )
                params = [q]
                if source_id:
                    query += " AND a.source_id = ?"
                    params.append(source_id)
                if days:
                    query += " AND a.published >= datetime('now', '-' || ? || ' days')"
                    params.append(days)
                query += " ORDER BY score ASC, a.published DESC LIMIT ? OFFSET ?"
                params.extend([limit, offset])
                df = pd.read_sql_query(query, conn, params=params)
                conn.close()
                return df
            except sqlite3.Error:
                # Fallback a búsqueda simple si FTS falla
                pass

        # Fallback: búsqueda tradicional por LIKE u obtención simple
        conn = self.get_connection()
        query = """
        SELECT a.*, s.name as source_name 
        FROM articles a 
        JOIN sources s ON a.source_id = s.id
        WHERE 1=1
        """
        params = []
        
        if source_id:
            query += " AND a.source_id = ?"
            params.append(source_id)
        
        if search_query:
            query += " AND (a.title LIKE ? OR a.content LIKE ? OR a.summary LIKE ?)"
            search_term = f"%{search_query}%"
            params.extend([search_term, search_term, search_term])
        
        if days:
            query += " AND a.published >= datetime('now', '-' || ? || ' days')"
            params.append(days)
        
        query += " ORDER BY a.published DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        return df

    def count_articles(self, source_id=None, search_query=None, days=None) -> int:
        # Conteo total para paginación
        if search_query and self.has_fts:
            try:
                conn = self.get_connection()
                q = (search_query or '').strip()
                ops = ['"', ' AND ', ' OR ', ' NOT ', ' NEAR ', '*']
                if not any(op in q for op in ops):
                    terms = [t for t in re.split(r"\s+", q) if t]
                    if terms:
                        q = " ".join([f"{t}*" for t in terms])
                query = (
                    "SELECT COUNT(1) AS cnt FROM articles_fts "
                    "JOIN articles a ON a.id = articles_fts.rowid "
                    "WHERE articles_fts MATCH ?"
                )
                params = [q]
                if source_id:
                    query += " AND a.source_id = ?"
                    params.append(source_id)
                if days:
                    query += " AND a.published >= datetime('now', '-' || ? || ' days')"
                    params.append(days)
                row = pd.read_sql_query(query, conn, params=params).iloc[0]
                conn.close()
                return int(row['cnt'])
            except sqlite3.Error:
                pass

        conn = self.get_connection()
        query = "SELECT COUNT(1) AS cnt FROM articles a WHERE 1=1"
        params = []
        if source_id:
            query += " AND a.source_id = ?"
            params.append(source_id)
        if search_query:
            query += " AND (a.title LIKE ? OR a.content LIKE ? OR a.summary LIKE ?)"
            search_term = f"%{search_query}%"
            params.extend([search_term, search_term, search_term])
        if days:
            query += " AND a.published >= datetime('now', '-' || ? || ' days')"
            params.append(days)
        row = pd.read_sql_query(query, conn, params=params).iloc[0]
        conn.close()
        return int(row['cnt'])
    
    def add_article(self, article_data):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
            INSERT INTO articles (source_id, title, summary, content, url, published, fingerprint, iocs, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, article_data)
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
        finally:
            conn.close()
    
    def update_source_fetch_time(self, source_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE sources SET last_fetched = datetime('now') WHERE id = ?", 
                      (source_id,))
        conn.commit()
        conn.close()

# Clase para extraer IOCs
class ThreatClassifier:
    @staticmethod
    def classify_threat(title: str, content: str) -> Dict[str, str]:
        """Clasifica la amenaza según palabras clave y retorna tipo y criticidad"""
        text = f"{title} {content}".lower()
        
        # Palabras clave por tipo y criticidad
        classifications = {
            'critical': {
                'types': ['Ransomware', 'Zero-Day', 'RCE', 'Vulnerabilidad Crítica'],
                'keywords': ['ransomware', 'zero-day', 'zero day', 'rce', 'remote code execution',
                            'critical vulnerability', 'actively exploited', 'exploit in the wild',
                            'vulnerabilidad crítica', 'explotación activa', '0-day']
            },
            'high': {
                'types': ['Malware', 'APT', 'Data Breach', 'Ataque Dirigido'],
                'keywords': ['malware', 'apt', 'advanced persistent', 'data breach', 'hack',
                            'breach', 'compromise', 'attack campaign', 'trojan', 'backdoor',
                            'filtración', 'violación de datos', 'compromiso', 'troyano']
            },
            'medium': {
                'types': ['Phishing', 'Vulnerabilidad', 'Exploit', 'Botnet'],
                'keywords': ['phishing', 'vulnerability', 'exploit', 'botnet', 'ddos',
                            'denial of service', 'cve-', 'security flaw', 'weakness',
                            'vulnerabilidad', 'debilidad de seguridad', 'suplantación']
            },
            'low': {
                'types': ['Actualización', 'Parche', 'Advisory', 'Advertencia'],
                'keywords': ['patch', 'update', 'advisory', 'warning', 'recommendation',
                            'parche', 'actualización', 'recomendación', 'aviso']
            }
        }
        
        # Determinar criticidad
        for severity, data in classifications.items():
            for keyword in data['keywords']:
                if keyword in text:
                    # Intentar determinar tipo específico
                    for threat_type in data['types']:
                        if threat_type.lower() in text:
                            return {'severity': severity, 'type': threat_type}
                    # Si no encuentra tipo específico, usar el primero de la lista
                    return {'severity': severity, 'type': data['types'][0]}
        
        # Por defecto: informativo
        return {'severity': 'info', 'type': 'Información'}

class ThreatClassifier:
    @staticmethod
    def classify_threat(title: str, content: str) -> Dict[str, str]:
        """Clasifica la amenaza según palabras clave y retorna tipo y criticidad"""
        text = f"{title} {content}".lower()
        
        # Palabras clave por tipo y criticidad
        classifications = {
            'critical': {
                'types': ['Ransomware', 'Zero-Day', 'RCE', 'Vulnerabilidad Crítica'],
                'keywords': ['ransomware', 'zero-day', 'zero day', 'rce', 'remote code execution',
                            'critical vulnerability', 'actively exploited', 'exploit in the wild',
                            'vulnerabilidad crítica', 'explotación activa', '0-day']
            },
            'high': {
                'types': ['Malware', 'APT', 'Data Breach', 'Ataque Dirigido'],
                'keywords': ['malware', 'apt', 'advanced persistent', 'data breach', 'hack',
                            'breach', 'compromise', 'attack campaign', 'trojan', 'backdoor',
                            'filtración', 'violación de datos', 'compromiso', 'troyano']
            },
            'medium': {
                'types': ['Phishing', 'Vulnerabilidad', 'Exploit', 'Botnet'],
                'keywords': ['phishing', 'vulnerability', 'exploit', 'botnet', 'ddos',
                            'denial of service', 'cve-', 'security flaw', 'weakness',
                            'vulnerabilidad', 'debilidad de seguridad', 'suplantación']
            },
            'low': {
                'types': ['Actualización', 'Parche', 'Advisory', 'Advertencia'],
                'keywords': ['patch', 'update', 'advisory', 'warning', 'recommendation',
                            'parche', 'actualización', 'recomendación', 'aviso']
            }
        }
        
        # Determinar criticidad
        for severity, data in classifications.items():
            for keyword in data['keywords']:
                if keyword in text:
                    # Intentar determinar tipo específico
                    for threat_type in data['types']:
                        if threat_type.lower() in text:
                            return {'severity': severity, 'type': threat_type}
                    # Si no encuentra tipo específico, usar el primero de la lista
                    return {'severity': severity, 'type': data['types'][0]}
        
        # Por defecto: informativo
        return {'severity': 'info', 'type': 'Información'}

class IOCExtractor:
    @staticmethod
    def extract_iocs(text: str) -> List[str]:
        if not text:
            return []
        
        iocs = []
        
        # IPs
        ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
        iocs.extend(re.findall(ip_pattern, text))
        
        # Dominios
        domain_pattern = r'\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b'
        domains = re.findall(domain_pattern, text)
        iocs.extend([d for d in domains if '.' in d and not d.endswith('.com.html')])
        
        # CVEs
        cve_pattern = r'CVE-\d{4}-\d{4,7}'
        iocs.extend(re.findall(cve_pattern, text, re.IGNORECASE))
        
        # Hashes MD5
        md5_pattern = r'\b[a-fA-F0-9]{32}\b'
        iocs.extend(re.findall(md5_pattern, text))
        
        # Hashes SHA256
        sha256_pattern = r'\b[a-fA-F0-9]{64}\b'
        iocs.extend(re.findall(sha256_pattern, text))
        
        return list(set(iocs))[:20]  # Limitar a 20 IOCs únicos

# Clase para traducir texto
class SimpleTranslator:
    @staticmethod
    def translate_to_spanish(text: str) -> str:
        """Traducción simple usando biblioteca translate si está disponible"""
        if not text or len(text.strip()) == 0:
            return text
        
        try:
            from deep_translator import GoogleTranslator
            translator = GoogleTranslator(source='auto', target='es')
            result = translator.translate(text[:1000])
            return result
        except:
            # Si falla, devolver el texto original
            return text

# Clase para procesar RSS feeds
class RSSProcessor:
    def __init__(self, db: CTIDatabase):
        self.db = db
        self.ioc_extractor = IOCExtractor()
    
    def create_fingerprint(self, title: str, url: str) -> str:
        data = f"{title}_{url}".encode('utf-8')
        return hashlib.sha256(data).hexdigest()
    
    def get_feed_entries(self, url: str, max_articles: int = 10):
        """Obtener entradas del feed sin procesarlas"""
        try:
            feed = feedparser.parse(url)
            return feed.entries[:max_articles], None
        except Exception as e:
            return [], str(e)
    
    def process_single_entry(self, source_id: int, entry):
        """Procesar un solo artículo y agregarlo a la BD"""
        try:
            title = entry.get('title', 'Sin título')
            link = entry.get('link', '')
            summary = entry.get('summary', entry.get('description', ''))
            
            # Filtrar contenido no relevante (eventos, webinars, anuncios)
            text_to_check = f"{title} {summary}".lower()
            
            # Palabras clave que indican contenido no deseado
            excluded_keywords = [
                'virtual event', 'evento virtual', 'webinar', 'register now', 'regístrate',
                'registration', 'registro', 'view agenda', 'ver agenda', 'save the date',
                'join us', 'únete', 'conference', 'conferencia', 'summit', 'looking ahead to',
                'outlook 20', 'predictions for', 'predicciones', 'forecast', 'próximamente',
                'coming soon', 'save your spot', 'rsvp', 'attendance', 'asistencia'
            ]
            
            if any(keyword in text_to_check for keyword in excluded_keywords):
                return False, "Filtrado: evento/anuncio"
            
            # Verificar que contenga palabras clave de ciberseguridad relevantes
            relevant_keywords = [
                'vulnerability', 'vulnerabilidad', 'exploit', 'breach', 'brecha', 'hack',
                'malware', 'ransomware', 'phishing', 'attack', 'ataque', 'threat', 'amenaza',
                'cve-', 'zero-day', 'patch', 'parche', 'backdoor', 'trojan', 'apt',
                'data leak', 'filtración', 'security flaw', 'fallo de seguridad', 'compromise',
                'compromiso', 'botnet', 'ddos', 'injection', 'inyección', 'credential',
                'credencial', 'password', 'contraseña', 'authentication', 'autenticación'
            ]
            
            has_relevant_content = any(keyword in text_to_check for keyword in relevant_keywords)
            
            # Si no tiene contenido relevante, rechazar
            if not has_relevant_content and len(text_to_check) > 50:
                return False, "Filtrado: sin contenido relevante de seguridad"
            
            # Limpiar HTML del summary
            if summary:
                summary = BeautifulSoup(summary, 'html.parser').get_text()[:500]
            
            content = entry.get('content', [{}])[0].get('value', summary) if 'content' in entry else summary
            if content:
                content = BeautifulSoup(content, 'html.parser').get_text()[:2000]
            
            # Traducir título y contenido al español
            title_es = title
            summary_es = summary
            content_es = content
            
            try:
                from deep_translator import GoogleTranslator
                translator = GoogleTranslator(source='auto', target='es')
                
                # Traducir título
                if title and len(title.strip()) > 0:
                    try:
                        title_es = translator.translate(title[:500])
                        time.sleep(0.3)  # Pausa reducida
                    except:
                        title_es = title
                
                # Traducir summary
                if summary and len(summary.strip()) > 0:
                    try:
                        summary_es = translator.translate(summary[:500])
                        time.sleep(0.3)
                    except:
                        summary_es = summary
                
                # Traducir contenido
                if content and len(content.strip()) > 0:
                    try:
                        content_es = translator.translate(content[:1000])
                        time.sleep(0.3)
                    except:
                        content_es = content
                    
            except Exception as e:
                # Si falla la importación o traducción, usar texto original
                title_es = title
                summary_es = summary
                content_es = content
            
            published = entry.get('published_parsed', entry.get('updated_parsed', None))
            if published:
                from datetime import timezone, timedelta
                published = datetime(*published[:6])
                # Convertir a hora de Latinoamérica (UTC-5 para Colombia, México, Perú, etc.)
                published = published.replace(tzinfo=timezone.utc).astimezone(timezone(timedelta(hours=-5)))
                
                # Validar que la fecha no sea futura (con margen de 1 día por zonas horarias)
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
            
            # Intentar agregar artículo
            article_data = (
                source_id, title_es, summary_es, content_es, link,
                published, fingerprint, iocs_str, tags_str
            )
            
            if self.db.add_article(article_data):
                return True, title_es
            return False, None
            
        except Exception as e:
            return False, str(e)
    
    def fetch_feed(self, source_id: int, url: str, max_articles: int = 10):
        try:
            feed = feedparser.parse(url)
            new_count = 0
            
            for entry in feed.entries[:max_articles]:
                title = entry.get('title', 'Sin título')
                link = entry.get('link', '')
                summary = entry.get('summary', entry.get('description', ''))
                
                # Limpiar HTML del summary
                if summary:
                    summary = BeautifulSoup(summary, 'html.parser').get_text()[:500]
                
                content = entry.get('content', [{}])[0].get('value', summary) if 'content' in entry else summary
                if content:
                    content = BeautifulSoup(content, 'html.parser').get_text()[:2000]
                
                # Traducir título y contenido al español
                title_es = title
                summary_es = summary
                content_es = content
                
                try:
                    from deep_translator import GoogleTranslator
                    translator = GoogleTranslator(source='auto', target='es')
                    
                    # Traducir título
                    if title and len(title.strip()) > 0:
                        try:
                            title_es = translator.translate(title[:500])
                            time.sleep(0.5)  # Pausa para evitar límites de API
                        except:
                            title_es = title
                    
                    # Traducir summary
                    if summary and len(summary.strip()) > 0:
                        try:
                            summary_es = translator.translate(summary[:500])
                            time.sleep(0.5)
                        except:
                            summary_es = summary
                    
                    # Traducir contenido
                    if content and len(content.strip()) > 0:
                        try:
                            content_es = translator.translate(content[:1000])
                            time.sleep(0.5)
                        except:
                            content_es = content
                        
                except Exception as e:
                    # Si falla la importación o traducción, usar texto original
                    title_es = title
                    summary_es = summary
                    content_es = content
                
                published = entry.get('published_parsed', entry.get('updated_parsed', None))
                if published:
                    from datetime import timezone, timedelta
                    published = datetime(*published[:6])
                    # Convertir a hora de Latinoamérica (UTC-5 para Colombia, México, Perú, etc.)
                    published = published.replace(tzinfo=timezone.utc).astimezone(timezone(timedelta(hours=-5)))
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
                
                # Intentar agregar artículo
                article_data = (
                    source_id, title_es, summary_es, content_es, link,
                    published, fingerprint, iocs_str, tags_str
                )
                
                if self.db.add_article(article_data):
                    new_count += 1
            
            self.db.update_source_fetch_time(source_id)
            return new_count, None
        
        except Exception as e:
            return 0, str(e)

# Inicializar base de datos
db = CTIDatabase()
rss_processor = RSSProcessor(db)
threat_classifier = ThreatClassifier()

# Estado de sesión: auto-scan y cuenta regresiva
if 'auto_scan' not in st.session_state:
    st.session_state.auto_scan = True
if 'scan_interval_secs' not in st.session_state:
    st.session_state.scan_interval_secs = 300  # 5 minutos
# Forzar configuración genérica: siempre auto y cada 5 minutos
st.session_state.auto_scan = True
st.session_state.scan_interval_secs = 300
from datetime import datetime as _dt
if 'next_scan_at' not in st.session_state:
    st.session_state.next_scan_at = _dt.now() + timedelta(seconds=st.session_state.scan_interval_secs)

now_ts = _dt.now()
remaining_secs = max(0, int((st.session_state.next_scan_at - now_ts).total_seconds()))
def _fmt_countdown(sec: int) -> str:
    m, s = divmod(sec, 60)
    return f"{m:02d}:{s:02d}"

# Auto-scan si corresponde
if st.session_state.auto_scan and remaining_secs == 0:
    total_new = 0
    sources = db.get_sources()
    try:
        for _, source in sources.iterrows():
            new_count, error = rss_processor.fetch_feed(
                source['id'],
                source['url'],
                max_articles=int(st.session_state.get('max_per_source', 50))
            )
            if not error:
                total_new += new_count
        if total_new > 0:
            st.success(f"🔄 Autoescaneo completado: {total_new} artículos nuevos")
        else:
            st.info("Autoescaneo completado: sin artículos nuevos")
    finally:
        st.session_state.next_scan_at = _dt.now() + timedelta(seconds=st.session_state.scan_interval_secs)
        remaining_secs = max(0, int((st.session_state.next_scan_at - _dt.now()).total_seconds()))

# Nota: si deseas una cuenta regresiva con actualización en vivo por segundo,
# puedo añadir una auto-actualización segura. Por ahora evitamos funciones
# experimentales removidas para asegurar compatibilidad.

# Header mejorado con estado (sin contador)
st.markdown(f"""
<div class="main-header">
    <h1>
        <span class="logo">🛡️</span>
        <span>CTI PLATFORM</span>
    </h1>
    <p>Cyber Threat Intelligence · Inteligencia de Amenazas en Tiempo Real</p>
    <div class="status-bar">
        <span class="status-led green"></span>
        <span>En línea — autoescaneo activo cada hora</span>
    </div>
</div>
""", unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.header("⚙️ Configuración")
    
    # Sección de administración protegida
    with st.expander("🔐 Administración", expanded=False):
        if check_admin_password():
            st.success("✅ Autenticado como administrador")
            
            if st.button("🚪 Cerrar Sesión"):
                st.session_state["admin_authenticated"] = False
                st.rerun()
            
            st.divider()
            
            st.caption("Autoescaneo activo cada hora")
            # Cantidad de artículos a ingerir por fuente
            if 'max_per_source' not in st.session_state:
                st.session_state.max_per_source = 50
            st.session_state.max_per_source = st.selectbox(
                "Cantidad por fuente",
                options=[10, 25, 50, 100],
                index=[10, 25, 50, 100].index(st.session_state.max_per_source)
            )
            
            # Inicializar estado de actualización incremental
            if 'feed_update_state' not in st.session_state:
                st.session_state.feed_update_state = {
                    'running': False,
                    'total_new': 0,
                    'last_source': '',
                    'progress': 0.0
                }
            
            # Botón para actualizar feeds (solo admin)
            if st.button("🔄 Actualizar Feeds", key="update_feeds"):
                # Ejecutar actualización sin bloquear
                sources = db.get_sources()
                total_new = 0
                total_articles = len(sources) * int(st.session_state.max_per_source)
                processed = 0
                
                # Contenedor para progreso
                progress_container = st.empty()
                status_container = st.empty()
                
                for idx, (_, source) in enumerate(sources.iterrows()):
                    entries, error = rss_processor.get_feed_entries(
                        source['url'],
                        max_articles=int(st.session_state.max_per_source)
                    )
                    
                    if error:
                        status_container.error(f"❌ Error en {source['name']}: {error}")
                        continue
                    
                    for entry_idx, entry in enumerate(entries):
                        # Actualizar progreso
                        processed += 1
                        progress_container.progress(processed / total_articles)
                        status_container.caption(f"📝 {source['name']}: {entry_idx+1}/{len(entries)} • ✨ {total_new} nuevos")
                        
                        # Procesar artículo
                        added, title = rss_processor.process_single_entry(source['id'], entry)
                        if added:
                            total_new += 1
                            status_container.caption(f"✅ Agregado: {title[:50]}... • Total: {total_new}")
                    
                    db.update_source_fetch_time(source['id'])
                
                progress_container.empty()
                status_container.success(f"🎉 Actualización completa: {total_new} artículos nuevos")
                time.sleep(2)
                status_container.empty()
        else:
            st.info("🔒 Inicia sesión como administrador para actualizar feeds")
    
    st.divider()
    
    # Filtros (accesibles para todos)
    st.subheader("🔍 Filtros")
    
    # Búsqueda
    search_query = st.text_input(
        "Buscar",
        placeholder="Palabras clave, frases entre comillas, AND/OR, sufijo *",
        help="Ejemplos: malware AND phishing | \"elevación de privilegios\" | ransom*"
    )
    if getattr(db, 'has_fts', False):
        st.caption("Búsqueda avanzada activada (FTS)")
    
    # Período de tiempo
    time_filter = st.selectbox(
        "Período",
        ["Todos", "Últimas 24h", "Últimos 7 días", "Últimos 30 días"]
    )
    
    days_map = {
        "Todos": None,
        "Últimas 24h": 1,
        "Últimos 7 días": 7,
        "Últimos 30 días": 30
    }
    days = days_map[time_filter]
    
    # Fuente
    sources_df = db.get_sources()
    source_options = ["Todas las fuentes"] + sources_df['name'].tolist()
    selected_source = st.selectbox("Fuente", source_options)
    
    source_id = None
    if selected_source != "Todas las fuentes":
        source_id = sources_df[sources_df['name'] == selected_source]['id'].iloc[0]
    
    # Selección de tamaño de página (solo visualización)
    if 'page_size' not in st.session_state:
        st.session_state.page_size = 25
    st.session_state.page_size = st.selectbox(
        "Resultados por página",
        options=[25, 50, 100],
        index=[25, 50, 100].index(st.session_state.page_size)
    )
    
    st.divider()
    
    # Información
    st.subheader("📊 Estadísticas")
    total_articles = len(db.get_articles(limit=10000))
    st.metric("Total Artículos", total_articles)
    st.metric("Fuentes Activas", len(sources_df))

# Main content
tab1, tab4, tab2, tab3 = st.tabs(["📰 Feed", "📈 Estadísticas", "🔍 Fuentes RSS", "ℹ️ Ayuda"])

with tab1:
    st.header("Feed de Artículos")
    
    # Estado de paginación y snapshot de filtros
    if 'page' not in st.session_state:
        st.session_state.page = 1
    snapshot = (
        (search_query or '').strip(),
        days if days is not None else None,
        int(source_id) if source_id is not None else None,
        int(st.session_state.page_size)
    )
    if st.session_state.get('filters_snapshot') != snapshot:
        st.session_state.page = 1
        st.session_state.filters_snapshot = snapshot
    page = int(st.session_state.page)
    page_size = int(st.session_state.page_size)

    total_count = db.count_articles(
        source_id=source_id,
        search_query=search_query if search_query else None,
        days=days
    )
    total_pages = max(1, (total_count + page_size - 1) // page_size)
    page = min(page, total_pages)
    offset = (page - 1) * page_size

    # Obtener artículos
    articles_df = db.get_articles(
        limit=page_size, 
        source_id=source_id,
        search_query=search_query if search_query else None,
        days=days,
        offset=offset
    )
    
    if articles_df.empty:
        st.info("👋 No hay artículos. Haz clic en '🔄 Actualizar Feeds' en el menú lateral para obtener artículos.")
    else:
        st.write(f"Página {page} de {total_pages} — {total_count} resultados")
        cols_nav = st.columns(2)
        with cols_nav[0]:
            if st.button("← Anterior", disabled=(page <= 1), key="page_prev_top"):
                st.session_state.page = max(1, page - 1)
                st.rerun()
        with cols_nav[1]:
            if st.button("Siguiente →", disabled=(page >= total_pages), key="page_next_top"):
                st.session_state.page = min(total_pages, page + 1)
                st.rerun()
        
        # Mostrar artículos
        for idx, article in articles_df.iterrows():
            # Formatear fecha
            try:
                fecha = pd.to_datetime(article['published'])
                fecha_corta = fecha.strftime("%d/%m/%Y")
                hora = fecha.strftime("%H:%M")
            except:
                fecha_corta = "Sin fecha"
                hora = ""
            
            # Clasificar amenaza
            threat_info = threat_classifier.classify_threat(
                article['title'], 
                article['content'] if article['content'] else article['summary']
            )
            severity = threat_info['severity']
            threat_type = threat_info['type']
            
            # Diseño mejorado: fecha + fuente a la izquierda, título al centro, badge a la derecha
            col_meta, col_title, col_badge = st.columns([2, 5, 1.5])
            
            with col_meta:
                st.markdown(f"""
                <div style="font-size: 0.85em; color: #666; line-height: 1.4;">
                    <div style="font-weight: 600; color: #333;">{fecha_corta}</div>
                    <div>{hora}</div>
                    <div style="color: #1f77b4; font-weight: 500; margin-top: 4px;">{article['source_name']}</div>
                </div>
                """, unsafe_allow_html=True)
            
            with col_title:
                st.markdown(f"**{article['title']}**")
            
            with col_badge:
                st.markdown(
                    f'<div style="text-align: right;"><span class="threat-{severity}">{threat_type}</span></div>',
                    unsafe_allow_html=True
                )
            
            with st.expander("📄 Ver detalles", expanded=False):
                # Formatear fecha completa para detalles
                try:
                    fecha = pd.to_datetime(article['published'])
                    fecha_completa = fecha.strftime("%d de %B de %Y a las %H:%M")
                    # Traducir meses al español
                    meses = {
                        'January': 'enero', 'February': 'febrero', 'March': 'marzo',
                        'April': 'abril', 'May': 'mayo', 'June': 'junio',
                        'July': 'julio', 'August': 'agosto', 'September': 'septiembre',
                        'October': 'octubre', 'November': 'noviembre', 'December': 'diciembre'
                    }
                    for eng, esp in meses.items():
                        fecha_completa = fecha_completa.replace(eng, esp)
                except:
                    fecha_completa = "Fecha no disponible"
                
                st.markdown(f"**📅 Publicado:** {fecha_completa}")
                st.divider()
                
                col1, col2 = st.columns([3, 1])
                
                with col1:
                    if article['summary']:
                        st.markdown("**📝 Resumen:**")
                        st.markdown(article['summary'])
                    
                    if article['iocs']:
                        st.markdown("**🔴 IOCs detectados:**")
                        iocs = article['iocs'].split(',')
                        ioc_display = " • ".join([f"`{ioc}`" for ioc in iocs[:10]])
                        st.markdown(ioc_display)
                        if len(iocs) > 10:
                            st.caption(f"+ {len(iocs) - 10} IOCs más")
                    
                    if article['url']:
                        st.markdown(f"[🔗 Ver artículo original]({article['url']})")
                
                with col2:
                    if article['tags']:
                        st.markdown("**🏷️ Tags:**")
                        tags = article['tags'].split(',')
                        for tag in tags:
                            st.markdown(f"• {tag}")
            
            # Separador sutil entre artículos
            st.markdown("<hr style='margin: 15px 0; border: none; border-top: 1px solid #eee;'>", unsafe_allow_html=True)
        
        # Paginación inferior
        st.divider()
        st.write(f"Página {page} de {total_pages} — {total_count} resultados")
        cols_nav_bottom = st.columns(2)
        with cols_nav_bottom[0]:
            if st.button("← Anterior", disabled=(page <= 1), key="page_prev_bottom"):
                st.session_state.page = max(1, page - 1)
                st.rerun()
        with cols_nav_bottom[1]:
            if st.button("Siguiente →", disabled=(page >= total_pages), key="page_next_bottom"):
                st.session_state.page = min(total_pages, page + 1)
                st.rerun()

with tab4:
    st.header("📊 Dashboard de Estadísticas")
    df_all = db.get_articles(limit=10000)
    if df_all.empty:
        st.info("Sin datos suficientes para estadísticas")
    else:
        df_all['published_dt'] = pd.to_datetime(df_all['published'], utc=True, errors='coerce')

        def _clf(row):
            info = threat_classifier.classify_threat(row.get('title',''), row.get('content') or row.get('summary',''))
            return pd.Series([info['severity'], info['type']])
        df_all[['severity','threat_type']] = df_all.apply(_clf, axis=1)
        
        # Mapeo de colores por severidad para usar en todos los gráficos
        severity_color_map = {
            'critical': '#dc3545',   # Rojo
            'high': '#fd7e14',       # Naranja
            'medium': '#ffc107',     # Amarillo
            'low': '#20c997',        # Verde azulado
            'info': '#6c757d'        # Gris
        }

        def _ioc_type(ioc):
            if re.match(r'^(?:\d{1,3}\.){3}\d{1,3}$', ioc):
                return 'IP'
            if re.match(r'^(?:[a-fA-F0-9]{32})$', ioc):
                return 'MD5'
            if re.match(r'^(?:[a-fA-F0-9]{64})$', ioc):
                return 'SHA256'
            if re.match(r'^CVE-\d{4}-\d{4,7}$', ioc, re.IGNORECASE):
                return 'CVE'
            if '.' in ioc:
                return 'Dominio'
            return 'Otro'

        ioc_rows = []
        for _, r in df_all.iterrows():
            if r.get('iocs'):
                for item in str(r['iocs']).split(','):
                    item = item.strip()
                    if item:
                        ioc_rows.append(_ioc_type(item))
        df_ioc = pd.DataFrame({'type': ioc_rows}) if ioc_rows else pd.DataFrame({'type': []})

        kcol1, kcol2, kcol3 = st.columns(3)
        with kcol1:
            st.metric("Artículos totales", len(df_all))
        with kcol2:
            now_utc = pd.Timestamp.now(tz='UTC')
            last7 = now_utc - pd.Timedelta(days=7)
            st.metric("Últimos 7 días", int((df_all['published_dt'] >= last7).sum()))
        with kcol3:
            st.metric("Con IOCs", int(df_all['iocs'].fillna('').str.len().gt(0).sum()))

        st.divider()
        
        # Selector de período para tendencia
        trend_period = st.selectbox(
            "Período de tendencia",
            ["Últimos 7 días", "Últimos 30 días", "Últimos 90 días", "Todo el historial"],
            index=1,
            key="trend_period"
        )
        
        # Gráfico principal: tendencia temporal (ancho completo)
        _df = df_all.copy()
        _df['day'] = _df['published_dt'].dt.date
        by_day = _df.groupby('day').size().reset_index(name='count')
        
        # Filtrar según selección
        if trend_period == "Últimos 7 días":
            cutoff = pd.Timestamp.now(tz='UTC') - pd.Timedelta(days=7)
            by_day = by_day[by_day['day'] >= cutoff.date()]
        elif trend_period == "Últimos 30 días":
            cutoff = pd.Timestamp.now(tz='UTC') - pd.Timedelta(days=30)
            by_day = by_day[by_day['day'] >= cutoff.date()]
        elif trend_period == "Últimos 90 días":
            cutoff = pd.Timestamp.now(tz='UTC') - pd.Timedelta(days=90)
            by_day = by_day[by_day['day'] >= cutoff.date()]
        
        fig1 = px.area(by_day, x='day', y='count', title=f'📈 Tendencia de Artículos ({trend_period})')
        fig1.update_layout(
            margin=dict(l=20,r=20,t=50,b=30),
            height=350,
            font=dict(size=12),
            title_font_size=16,
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            xaxis=dict(showgrid=True, gridcolor='LightGray', gridwidth=1),
            yaxis=dict(showgrid=True, gridcolor='LightGray', gridwidth=1)
        )
        st.plotly_chart(fig1, width='stretch')
        
        st.divider()
        
        # Grilla 2x2 para gráficos de distribución
        row1_col1, row1_col2 = st.columns(2)
        
        with row1_col1:
            top_types = df_all['threat_type'].value_counts().reset_index()
            top_types.columns = ['threat_type','count']
            # Merge con severity para obtener colores
            threat_sev = df_all.groupby('threat_type')['severity'].first().reset_index()
            top_types = top_types.merge(threat_sev, on='threat_type', how='left')
            top_types['color'] = top_types['severity'].map(severity_color_map).fillna('#6c757d')
            
            fig2 = px.bar(top_types.head(10), x='threat_type', y='count', 
                         title='🎯 Top 10 Tipos de Amenaza',
                         color='severity',
                         color_discrete_map=severity_color_map)
            fig2.update_layout(
                margin=dict(l=10,r=10,t=50,b=10),
                height=400,
                font=dict(size=11),
                title_font_size=14,
                showlegend=True,
                legend=dict(title="Criticidad", orientation="v", yanchor="top", y=0.99, xanchor="right", x=0.99),
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                xaxis=dict(showgrid=False, tickangle=-45),
                yaxis=dict(showgrid=True, gridcolor='LightGray', gridwidth=1)
            )
            st.plotly_chart(fig2, width='stretch')
        
        with row1_col2:
            sev_map = {'critical':'Crítico','high':'Alto','medium':'Medio','low':'Bajo','info':'Info'}
            sev_counts = df_all['severity'].map(sev_map).value_counts().reset_index()
            sev_counts.columns = ['severity','count']
            # Mapeo de colores por criticidad específica
            color_map = {
                'Crítico': '#dc3545',   # Rojo
                'Alto': '#fd7e14',      # Naranja
                'Medio': '#ffc107',     # Amarillo
                'Bajo': '#20c997',      # Verde azulado
                'Info': '#6c757d'       # Gris
            }
            sev_counts['color'] = sev_counts['severity'].map(color_map)
            fig3 = px.pie(sev_counts, values='count', names='severity', 
                         title='⚠️ Distribución por Criticidad',
                         hole=0.4,
                         color='severity',
                         color_discrete_map=color_map)
            fig3.update_layout(
                margin=dict(l=10,r=10,t=50,b=10),
                height=400,
                font=dict(size=11),
                title_font_size=14,
                legend=dict(orientation="v", yanchor="middle", y=0.5, xanchor="left", x=1.05)
            )
            st.plotly_chart(fig3, width='stretch')
        
        row2_col1, row2_col2 = st.columns(2)
        
        with row2_col1:
            if not df_ioc.empty:
                ioc_counts = df_ioc['type'].value_counts().reset_index()
                ioc_counts.columns = ['type','count']
                fig4 = px.bar(ioc_counts, x='type', y='count', 
                             title='🔴 Distribución de IOCs por Tipo',
                             color='type', color_discrete_sequence=px.colors.qualitative.Bold)
                fig4.update_layout(
                    margin=dict(l=10,r=10,t=50,b=10),
                    height=400,
                    font=dict(size=11),
                    title_font_size=14,
                    showlegend=False,
                    plot_bgcolor='rgba(0,0,0,0)',
                    paper_bgcolor='rgba(0,0,0,0)',
                    xaxis=dict(showgrid=False),
                    yaxis=dict(showgrid=True, gridcolor='LightGray', gridwidth=1)
                )
                st.plotly_chart(fig4, width='stretch')
            else:
                st.info("No se encontraron IOCs para graficar")
        
        with row2_col2:
            src_counts = df_all['source_name'].value_counts().reset_index()
            src_counts.columns = ['Fuente','Artículos']
            fig5 = px.bar(src_counts, x='Fuente', y='Artículos', 
                         title='📰 Artículos por Fuente',
                         color='Artículos', color_continuous_scale='Teal')
            fig5.update_layout(
                margin=dict(l=10,r=10,t=50,b=10),
                height=400,
                font=dict(size=11),
                title_font_size=14,
                showlegend=False,
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                xaxis=dict(showgrid=False, tickangle=-45),
                yaxis=dict(showgrid=True, gridcolor='LightGray', gridwidth=1)
            )
            st.plotly_chart(fig5, width='stretch')

with tab2:
    st.header("Fuentes RSS Configuradas")
    
    # Proteger gestión de fuentes solo para admin
    if not st.session_state.get("admin_authenticated", False):
        st.warning("🔒 La gestión de fuentes RSS está restringida a administradores")
        st.info("💡 Inicia sesión como administrador en el panel lateral para agregar o modificar fuentes")
        
        # Mostrar solo la lista de fuentes (sin botón de agregar)
        sources_display = sources_df.copy()
        if 'last_fetched' in sources_display.columns:
            sources_display['última_actualización'] = sources_display['last_fetched'].apply(
                lambda x: pd.to_datetime(x).strftime("%d/%m/%Y %H:%M") if pd.notna(x) else "Nunca"
            )
            sources_display = sources_display[['name', 'url', 'type', 'region', 'última_actualización']]
            sources_display.columns = ['Nombre', 'URL', 'Tipo', 'Región', 'Última Actualización']
        
        st.dataframe(sources_display, width="stretch")
    else:
        # Admin autenticado: mostrar todo
        sources_display = sources_df.copy()
        if 'last_fetched' in sources_display.columns:
            sources_display['última_actualización'] = sources_display['last_fetched'].apply(
                lambda x: pd.to_datetime(x).strftime("%d/%m/%Y %H:%M") if pd.notna(x) else "Nunca"
            )
            sources_display = sources_display[['name', 'url', 'type', 'region', 'última_actualización']]
            sources_display.columns = ['Nombre', 'URL', 'Tipo', 'Región', 'Última Actualización']
        
        st.dataframe(sources_display, width="stretch")
        
        st.subheader("➕ Agregar Nueva Fuente")
        with st.form("add_source_form"):
            col1, col2 = st.columns(2)
            with col1:
                new_name = st.text_input("Nombre")
                new_url = st.text_input("URL del RSS")
            with col2:
                new_type = st.text_input("Tipo", value="threat_intel")
                new_region = st.text_input("Región", value="Global")
            
            submitted = st.form_submit_button("Agregar Fuente")
            if submitted and new_name and new_url:
                try:
                    conn = db.get_connection()
                    cursor = conn.cursor()
                    cursor.execute(
                        "INSERT INTO sources (name, url, type, region) VALUES (?, ?, ?, ?)",
                        (new_name, new_url, new_type, new_region)
                    )
                    conn.commit()
                    conn.close()
                    st.success(f"✅ Fuente '{new_name}' agregada correctamente")
                    time.sleep(1)
                    st.rerun()
                except sqlite3.IntegrityError:
                    st.error("❌ Esta URL ya existe")

with tab3:
    st.header("ℹ️ Ayuda e Información")
    
    st.markdown("""
    ### 🚀 Cómo usar la plataforma
    
    1. **Actualizar Feeds**: Haz clic en el botón "🔄 Actualizar Feeds" en el menú lateral para obtener los últimos artículos de las fuentes RSS.
    
    2. **Buscar**: Usa el campo de búsqueda para filtrar artículos por palabras clave.
    
    3. **Filtrar por tiempo**: Selecciona un período de tiempo para ver solo artículos recientes.
    
    4. **Filtrar por fuente**: Selecciona una fuente específica para ver solo sus artículos.
    
    5. **Ver detalles**: Haz clic en cualquier artículo para expandirlo y ver su contenido completo, IOCs detectados y enlace al artículo original.
    
    ### 🔴 Indicadores de Compromiso (IOCs)
    
    La plataforma extrae automáticamente:
    - 🌐 Direcciones IP
    - 🔗 Dominios
    - 🔐 CVEs
    - #️⃣ Hashes MD5 y SHA256
    
    ### 📊 Fuentes Pre-configuradas
    
    - **Krebs on Security**: Análisis de seguridad cibernética
    - **The Hacker News**: Noticias de ciberseguridad
    - **Schneier on Security**: Comentarios sobre seguridad
    - **Threatpost**: Amenazas y vulnerabilidades
    - **Dark Reading**: Noticias empresariales de seguridad
    
    """)

# Footer
st.markdown("---")
st.markdown("**CTI Platform** v2.0 - Streamlit Edition | 🔒 Cyber Threat Intelligence")
