import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for Next.js frontend calls
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
