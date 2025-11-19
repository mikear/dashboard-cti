import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
        ],
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // Swagger API documentation
    const config = new DocumentBuilder()
        .setTitle('CTI Platform API')
        .setDescription('Cyber Threat Intelligence Platform REST API')
        .setVersion('0.1.0')
        .addTag('articles', 'Article management and search')
        .addTag('sources', 'RSS source configuration')
        .addTag('search', 'Search and filtering')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`🚀 CTI Backend API running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
