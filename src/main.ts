import { NestFactory } from '@nestjs/core'

import { CollectorModule } from './core/telemetry/collector.module'

async function bootstrap() {
  const app = await NestFactory.create(CollectorModule)
  await app.listen(process.env.PORT ?? 4317)
}
bootstrap().catch(console.error)
