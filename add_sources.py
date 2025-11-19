"""
Script para agregar nuevas fuentes RSS a la base de datos existente
"""
import sqlite3

# Nuevas fuentes a agregar
new_sources = [
    ("CISA Cybersecurity Alerts", "https://www.cisa.gov/cybersecurity-advisories/all.xml", "threat_intel", "Americas"),
    ("US-CERT Alerts", "https://www.cisa.gov/uscert/ncas/alerts.xml", "threat_intel", "Americas"),
    ("Bleeping Computer", "https://www.bleepingcomputer.com/feed/", "threat_intel", "Global"),
    ("SecurityWeek", "https://www.securityweek.com/feed/", "threat_intel", "Global"),
    ("Cyber Scoop", "https://cyberscoop.com/feed/", "threat_intel", "Americas"),
    ("The Record by Recorded Future", "https://therecord.media/feed", "threat_intel", "Global"),
    ("Ars Technica Security", "https://feeds.arstechnica.com/arstechnica/security", "threat_intel", "Americas"),
    ("Graham Cluley", "https://grahamcluley.com/feed/", "threat_intel", "Europe"),
    ("Kaspersky Securelist", "https://securelist.com/feed/", "threat_intel", "Global"),
    ("Malwarebytes Labs", "https://blog.malwarebytes.com/feed/", "threat_intel", "Global"),
    ("Talos Intelligence", "https://blog.talosintelligence.com/rss/", "threat_intel", "Americas"),
    ("Sophos News", "https://news.sophos.com/en-us/feed/", "threat_intel", "Global"),
    ("Palo Alto Networks Unit 42", "https://unit42.paloaltonetworks.com/feed/", "threat_intel", "Americas"),
    ("Microsoft Security Blog", "https://www.microsoft.com/en-us/security/blog/feed/", "threat_intel", "Global"),
    ("Google Security Blog", "https://security.googleblog.com/feeds/posts/default", "threat_intel", "Global"),
]

def add_new_sources():
    """Agrega las nuevas fuentes a la base de datos"""
    conn = sqlite3.connect("cti_platform.db")
    cursor = conn.cursor()
    
    added_count = 0
    skipped_count = 0
    
    for name, url, type_, region in new_sources:
        try:
            # Verificar si ya existe
            cursor.execute("SELECT id FROM sources WHERE url = ?", (url,))
            if cursor.fetchone():
                print(f"⏭️  Ya existe: {name}")
                skipped_count += 1
                continue
            
            # Insertar nueva fuente
            cursor.execute(
                "INSERT INTO sources (name, url, type, region) VALUES (?, ?, ?, ?)",
                (name, url, type_, region)
            )
            print(f"✅ Agregada: {name}")
            added_count += 1
            
        except sqlite3.IntegrityError as e:
            print(f"❌ Error con {name}: {e}")
            skipped_count += 1
    
    conn.commit()
    conn.close()
    
    print(f"\n📊 Resumen:")
    print(f"   - Fuentes agregadas: {added_count}")
    print(f"   - Fuentes omitidas (ya existían): {skipped_count}")
    print(f"\n✅ Proceso completado. Ahora puedes actualizar los feeds desde la app.")

if __name__ == "__main__":
    print("🔄 Agregando nuevas fuentes RSS a la base de datos...\n")
    add_new_sources()
