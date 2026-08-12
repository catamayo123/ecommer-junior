import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
/*
  // PERMITIR QUE SOLO ESAS RUTAS LLAMEN A LA API EN EL SWAGGER
  app.enableCors({
    origin: true, // orígenes del frontend, hasta el momento todos
  });
*/
  app.setGlobalPrefix('api'); // todas las rutas comenzaran con api/

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro para que el 429 (rate limit) responda en español
  app.useGlobalFilters(new ThrottlerExceptionFilter());

  // para usar el nav en vez de postman para consumir la API
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API Digital')
    .setDescription('API de productos digitales (cursos y ebooks) con pagos simulados para esta versión')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // para la subida de archivos
  const document = SwaggerModule.createDocument(app, config);
  
  // aplicar el esquema bearer a TODOS los endpoints para que Swagger UI envíe el token
  document.security = [{ bearer: [] }];
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`La app esta se esta ejecutando en: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
