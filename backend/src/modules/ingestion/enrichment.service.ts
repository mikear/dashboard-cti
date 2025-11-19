import { Injectable, Logger } from '@nestjs/common';

export interface ExtractedIoc {
    type: 'ip' | 'domain' | 'url' | 'hash_md5' | 'hash_sha1' | 'hash_sha256' | 'cve' | 'email';
    value: string;
    normalizedValue: string;
    context: string;
    confidence: number;
}

@Injectable()
export class EnrichmentService {
    private readonly logger = new Logger(EnrichmentService.name);

    // Regex patterns for IOC extraction
    private readonly patterns = {
        cve: /CVE-\d{4}-\d{4,7}/gi,
        ipv4: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
        md5: /\b[A-Fa-f0-9]{32}\b/g,
        sha1: /\b[A-Fa-f0-9]{40}\b/g,
        sha256: /\b[A-Fa-f0-9]{64}\b/g,
        url: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi,
        email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
        domain: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\b/gi,
    };

    // Common false positives to filter out
    private readonly falsePositives = new Set([
        'example.com',
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '255.255.255.255',
    ]);

    extractIocs(text: string): ExtractedIoc[] {
        const iocs: ExtractedIoc[] = [];
        const seen = new Set<string>();

        // Extract CVEs
        this.extractByPattern(text, this.patterns.cve, 'cve', iocs, seen);

        // Extract IPs
        this.extractByPattern(text, this.patterns.ipv4, 'ip', iocs, seen);

        // Extract hashes (prioritize longer hashes first)
        this.extractByPattern(text, this.patterns.sha256, 'hash_sha256', iocs, seen);
        this.extractByPattern(text, this.patterns.sha1, 'hash_sha1', iocs, seen);
        this.extractByPattern(text, this.patterns.md5, 'hash_md5', iocs, seen);

        // Extract URLs (before domains to avoid duplication)
        this.extractByPattern(text, this.patterns.url, 'url', iocs, seen);

        // Extract emails
        this.extractByPattern(text, this.patterns.email, 'email', iocs, seen);

        // Extract domains (filter out those already in URLs)
        const urlDomains = iocs
            .filter(ioc => ioc.type === 'url')
            .map(ioc => this.extractDomainFromUrl(ioc.value))
            .filter(Boolean);
        const urlDomainSet = new Set(urlDomains);

        this.extractByPattern(
            text,
            this.patterns.domain,
            'domain',
            iocs,
            seen,
            (value) => !urlDomainSet.has(value.toLowerCase())
        );

        this.logger.debug(`Extracted ${iocs.length} IOCs from text`);
        return iocs;
    }

    private extractByPattern(
        text: string,
        pattern: RegExp,
        type: ExtractedIoc['type'],
        iocs: ExtractedIoc[],
        seen: Set<string>,
        extraFilter?: (value: string) => boolean,
    ): void {
        const matches = text.matchAll(pattern);

        for (const match of matches) {
            const value = match[0];
            const normalizedValue = this.normalize(value);

            // Skip if already seen or is a false positive
            if (seen.has(normalizedValue) || this.isFalsePositive(normalizedValue)) {
                continue;
            }

            // Apply extra filter if provided
            if (extraFilter && !extraFilter(value)) {
                continue;
            }

            // Extract context (50 chars before and after)
            const matchIndex = match.index || 0;
            const contextStart = Math.max(0, matchIndex - 50);
            const contextEnd = Math.min(text.length, matchIndex + value.length + 50);
            const context = text.substring(contextStart, contextEnd).trim();

            iocs.push({
                type,
                value,
                normalizedValue,
                context,
                confidence: this.calculateConfidence(type, value),
            });

            seen.add(normalizedValue);
        }
    }

    private normalize(value: string): string {
        return value.toLowerCase().trim();
    }

    private isFalsePositive(value: string): boolean {
        return this.falsePositives.has(value.toLowerCase());
    }

    private calculateConfidence(type: ExtractedIoc['type'], value: string): number {
        // Simple confidence heuristics
        switch (type) {
            case 'cve':
                return 1.0; // CVEs have strict format
            case 'hash_sha256':
            case 'hash_sha1':
            case 'hash_md5':
                return /^[a-f0-9]+$/i.test(value) ? 0.95 : 0.7;
            case 'ip':
                // Check if IP is in private range (lower confidence)
                if (this.isPrivateIp(value)) return 0.5;
                return 0.9;
            case 'url':
                return 0.85;
            case 'domain':
                // Check if it looks like a real domain
                if (value.includes('.') && !value.includes(' ')) return 0.8;
                return 0.6;
            case 'email':
                return 0.75;
            default:
                return 0.7;
        }
    }

    private isPrivateIp(ip: string): boolean {
        const parts = ip.split('.').map(Number);
        if (parts[0] === 10) return true;
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
        if (parts[0] === 192 && parts[1] === 168) return true;
        return false;
    }

    private extractDomainFromUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return '';
        }
    }
}
