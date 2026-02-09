import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('MAON : dukahub')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.use('/openapi.json', (req:any, res:any) => {
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
  app.enableCors()

  await app.listen(process.env.PORT ?? 5570);
  console.log('Application is running on: http://localhost:5570');
  console.log('Swagger UI available at: http://localhost:5570/api/docs');
  console.log('Scalar UI available at: http://localhost:5570/reference');
}
bootstrap();
