import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SourcesService } from '../sources/sources.service';

@Injectable()
export class IngestionSchedulerService implements OnModuleInit {
    private readonly logger = new Logger(IngestionSchedulerService.name);

    constructor(
        @InjectQueue('ingestion') private ingestionQueue: Queue,
        private sourcesService: SourcesService,
    ) { }

    async onModuleInit() {
        // Start periodic ingestion after module initialization
        this.logger.log('Starting ingestion scheduler...');
        await this.scheduleAllSources();

        // Schedule periodic check every 5 minutes
        setInterval(() => this.scheduleAllSources(), 5 * 60 * 1000);
    }

    async scheduleAllSources(): Promise<void> {
        try {
            const sources = await this.sourcesService.findEnabled();
            this.logger.log(`Scheduling ${sources.length} enabled sources`);

            for (const source of sources) {
                // Check if enough time has passed since last fetch
                if (source.lastFetchedAt) {
                    const minutesSinceLastFetch =
                        (Date.now() - source.lastFetchedAt.getTime()) / (1000 * 60);

                    if (minutesSinceLastFetch < source.fetchIntervalMinutes) {
                        this.logger.debug(`Skipping ${source.name}, fetched ${minutesSinceLastFetch.toFixed(1)}m ago`);
                        continue;
                    }
                }

                // Add job to queue
                await this.ingestionQueue.add('fetch-rss', {
                    sourceId: source.id,
                }, {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 5000,
                    },
                    removeOnComplete: true,
                    removeOnFail: false,
                });

                this.logger.log(`Scheduled RSS fetch for: ${source.name}`);
            }
        } catch (error) {
            this.logger.error('Error scheduling sources:', error.message);
        }
    }

    async triggerSource(sourceId: string): Promise<void> {
        await this.ingestionQueue.add('fetch-rss', { sourceId });
        this.logger.log(`Manually triggered source: ${sourceId}`);
    }
}
