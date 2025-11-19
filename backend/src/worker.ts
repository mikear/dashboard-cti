import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('Worker');

    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn', 'debug'],
    });

    await app.init();

    logger.log('🔧 CTI Worker started - processing RSS ingestion jobs');
    logger.log('Press Ctrl+C to stop');

    // Keep process alive
    process.on('SIGTERM', async () => {
        logger.log('SIGTERM signal received');
        await app.close();
    });

    process.on('SIGINT', async () => {
        logger.log('SIGINT signal received');
        await app.close();
    });
}

bootstrap();
