import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe.js';
import { TransformResponsInterceptor } from './interceptors/transform-respons/transform-respons.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new TransformResponsInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();