import { NestFactory } from '@nestjs/core'
import { INestApplication } from '@nestjs/common'

import { CollectorModule } from './collector.module'
import { SpanCollector } from './collectors'

interface MockCollectorOptions {
  port?: number
}

export interface CollectorServices {
  spans: SpanCollector
  // metrics: MetricCollector;
  // logs: LogCollector;
}

export class MockCollector {
  private readonly port: number
  private app?: INestApplication

  constructor(options?: MockCollectorOptions) {
    this.port = options?.port ?? 4317
  }

  async start(): Promise<CollectorServices> {
    this.app = await NestFactory.create(CollectorModule)
    await this.app.listen(this.port)
    console.log(`Mock collector started on port ${this.port}`)

    return { spans: this.app.get(SpanCollector) }
  }

  async stop(): Promise<void> {
    if (this.app) {
      await this.app.close()
    }
  }
}
