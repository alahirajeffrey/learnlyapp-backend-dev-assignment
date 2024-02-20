import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // setup validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // set global api prefix
  app.setGlobalPrefix('api/v1');

  // setup swagger
  const config = new DocumentBuilder()
    .setTitle('Learnly Backend Dev Assignment')
    .setDescription('Learnly Backend Dev Assignment API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  // setup helmet for security
  app.use(helmet());

  await app.listen(Number(process.env.NODE_PORT) || 3000);
}
bootstrap();
