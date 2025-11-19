import { Injectable, Logger } from '@nestjs/common';
import { translate } from '@vitalets/google-translate-api';

export interface TranslationResult {
    text: string;
    confidence: number;
    success: boolean;
}

@Injectable()
export class TranslationService {
    private readonly logger = new Logger(TranslationService.name);

    // Technical terms and patterns to preserve
    private readonly preservePatterns = [
        /CVE-\d{4}-\d+/gi,                    // CVE IDs
        /\b[A-Fa-f0-9]{32}\b/g,               // MD5 hashes
        /\b[A-Fa-f0-9]{40}\b/g,               // SHA1 hashes
        /\b[A-Fa-f0-9]{64}\b/g,               // SHA256 hashes
        /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,       // IP addresses
        /https?:\/\/[^\s]+/gi,                // URLs
        /[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)+/g, // Domains
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Emails
    ];

    async translateToSpanish(text: string, lang: string): Promise<TranslationResult> {
        // If already Spanish, return as is
        if (lang === 'es') {
            return {
                text,
                confidence: 1.0,
                success: true,
            };
        }

        try {
            // Extract and preserve technical terms
            const preserved: Map<string, string> = new Map();
            let processedText = text;
            let placeholderIndex = 0;

            for (const pattern of this.preservePatterns) {
                processedText = processedText.replace(pattern, (match) => {
                    const placeholder = `__PRESERVE_${placeholderIndex}__`;
                    preserved.set(placeholder, match);
                    placeholderIndex++;
                    return placeholder;
                });
            }

            // Truncate if too long (Google Translate has limits)
            const maxLength = 5000;
            const wasTruncated = processedText.length > maxLength;
            if (wasTruncated) {
                processedText = processedText.substring(0, maxLength);
                this.logger.warn('Text truncated for translation');
            }

            // Translate
            const result = await translate(processedText, { from: lang, to: 'es' });
            let translated = result.text;

            // Restore preserved terms
            for (const [placeholder, original] of preserved) {
                translated = translated.replace(placeholder, original);
            }

            return {
                text: translated,
                confidence: 0.85, // Estimate
                success: true,
            };
        } catch (error) {
            this.logger.error('Translation failed:', error.message);

            // Return original text on failure
            return {
                text,
                confidence: 0.0,
                success: false,
            };
        }
    }

    async translateBatch(items: { text: string; lang: string }[]): Promise<TranslationResult[]> {
        const results: TranslationResult[] = [];

        for (const item of items) {
            const result = await this.translateToSpanish(item.text, item.lang);
            results.push(result);

            // Rate limiting - small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return results;
    }
}
