import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api') // todas las rutas comenzaran con api/ lo que venga

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // para usar el nav en vez de postman para hacer las peticiones y demas 
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API Digital')
    .setDescription('API de productos digitales (cursos y ebooks)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`La app esta se esta ejecutando en: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
