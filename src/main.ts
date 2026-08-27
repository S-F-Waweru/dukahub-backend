import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 5570;
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:4200';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('MAON : dukahub')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.use('/openapi.json', (req: any, res: any) => {
    res.json(document);
  });

  app.use(
    '/reference',
    apiReference({
      theme: 'purple',
      metaData: {
        title: 'dukahub API',
      },
      url: '/openapi.json',
      servers: [
        {
          url: 'http://localhost:5570',
          description: 'Development server',
        },
      ],
    }),
  );
  app.enableCors({
    origin: frontendUrl.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI available at: http://localhost:${port}/api/docs`);
  console.log(`Scalar UI available at: http://localhost:${port}/reference`);
}
bootstrap();
