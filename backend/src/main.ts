import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT_PORT = 3000;
let pingProcessStarted = false;

function startRenderKeepAlivePing(): void {
  if (pingProcessStarted) return;

  const shouldStartPing =
    process.env.ENABLE_RENDER_PING === '1' ||
    process.env.ENABLE_RENDER_PING === 'true' ||
    process.env.NODE_ENV === 'production';

  if (!shouldStartPing) return;

  const pingScriptPath = join(process.cwd(), '..', 'railway-ping.js');
  if (!existsSync(pingScriptPath)) {
    console.warn(`⚠️ Keep-alive ping script not found at ${pingScriptPath}`);
    return;
  }

  const child = spawn(process.execPath, [pingScriptPath], {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('error', (error) => {
    console.warn('⚠️ Failed to start keep-alive ping script:', error.message);
  });

  pingProcessStarted = true;
  console.log(`🌐 Keep-alive ping process started: ${pingScriptPath}`);
}

async function bootstrap() {
  startRenderKeepAlivePing();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || DEFAULT_PORT;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend API running on port ${port}/api`);
}
bootstrap();
