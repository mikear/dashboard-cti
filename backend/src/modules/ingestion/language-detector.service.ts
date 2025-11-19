import { Injectable, Logger } from '@nestjs/common';
import { franc } from 'franc';

@Injectable()
export class LanguageDetectorService {
    private readonly logger = new Logger(LanguageDetectorService.name);

    detect(text: string): string {
        try {
            // Use franc for language detection
            // It returns ISO 639-3 codes, we'll map to ISO 639-1
            const detected = franc(text, { minLength: 10 });

            // Map common codes
            const langMap: Record<string, string> = {
                'eng': 'en',
                'spa': 'es',
                'fra': 'fr',
                'deu': 'de',
                'ita': 'it',
                'por': 'pt',
                'rus': 'ru',
                'jpn': 'ja',
                'kor': 'ko',
                'cmn': 'zh', // Mandarin Chinese
                'und': 'en', // Unknown defaults to English
            };

            const result = langMap[detected] || 'en';
            this.logger.debug(`Detected language: ${result} (${detected})`);
            return result;
        } catch (error) {
            this.logger.warn('Language detection failed, defaulting to English');
            return 'en';
        }
    }
}
