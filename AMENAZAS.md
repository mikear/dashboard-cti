# 🎯 Sistema de Clasificación de Amenazas

## Etiquetas de Criticidad Implementadas

El sistema ahora clasifica automáticamente cada artículo según su tipo de amenaza y nivel de criticidad.

### Niveles de Criticidad

| Nivel | Color | Emoji | Descripción |
|-------|-------|-------|-------------|
| **CRÍTICO** | 🔴 Rojo | 🔴 | Amenazas de máxima prioridad (Ransomware, Zero-Day, RCE) |
| **ALTO** | 🟠 Naranja | 🟠 | Amenazas graves (Malware, APT, Data Breach) |
| **MEDIO** | 🟡 Amarillo | 🟡 | Amenazas moderadas (Phishing, Vulnerabilidades, Exploits) |
| **BAJO** | 🔵 Azul | 🔵 | Alertas de seguridad (Actualizaciones, Parches, Advisories) |
| **INFO** | ⚪ Gris | ⚪ | Información general |

### Tipos de Amenazas por Criticidad

#### 🔴 CRÍTICO
- **Ransomware**: Malware que cifra datos y exige rescate
- **Zero-Day**: Vulnerabilidades sin parche conocido
- **RCE**: Ejecución remota de código
- **Vulnerabilidad Crítica**: Fallos de seguridad graves

**Palabras clave**: ransomware, zero-day, rce, remote code execution, critical vulnerability, actively exploited, exploit in the wild

#### 🟠 ALTO
- **Malware**: Software malicioso
- **APT**: Amenazas persistentes avanzadas
- **Data Breach**: Filtraciones de datos
- **Ataque Dirigido**: Ataques específicos contra objetivos

**Palabras clave**: malware, apt, advanced persistent, data breach, hack, breach, compromise, trojan, backdoor

#### 🟡 MEDIO
- **Phishing**: Suplantación de identidad
- **Vulnerabilidad**: Debilidades de seguridad
- **Exploit**: Código que aprovecha vulnerabilidades
- **Botnet**: Red de equipos comprometidos

**Palabras clave**: phishing, vulnerability, exploit, botnet, ddos, denial of service, cve-, security flaw

#### 🔵 BAJO
- **Actualización**: Nuevas versiones de software
- **Parche**: Correcciones de seguridad
- **Advisory**: Avisos de seguridad
- **Advertencia**: Recomendaciones preventivas

**Palabras clave**: patch, update, advisory, warning, recommendation

### Visualización

Cada artículo muestra:
1. **Emoji de criticidad** en el título (🔴🟠🟡🔵⚪)
2. **Etiqueta de color** con nivel y tipo de amenaza
3. Información del artículo (fuente, fecha, contenido)
4. IOCs detectados (si los hay)

### Ejemplo de Visualización

```
🔴 **Critical Security Vulnerability Found in Apache Server**
┌─────────────────────────────────────┐
│ 🔴 CRÍTICO: Zero-Day               │
└─────────────────────────────────────┘
Fuente: The Hacker News
Publicado: 19 de noviembre de 2025 a las 14:30
...
```

### Soporte Multiidioma

El sistema detecta amenazas tanto en:
- ✅ **Inglés**: ransomware, malware, vulnerability, etc.
- ✅ **Español**: vulnerabilidad crítica, filtración, suplantación, etc.

### Cómo Funciona

1. **Análisis de contenido**: Examina título y contenido del artículo
2. **Detección de palabras clave**: Busca términos específicos de amenazas
3. **Clasificación automática**: Asigna tipo y criticidad
4. **Visualización**: Muestra etiqueta con color correspondiente

### Actualizar Feeds

Para ver las clasificaciones:
1. Presiona **🗑️ Reiniciar DB** (si tienes artículos antiguos)
2. Presiona **🔄 Actualizar Feeds**
3. Los nuevos artículos mostrarán sus etiquetas de amenaza
