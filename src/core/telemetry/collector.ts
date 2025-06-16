import { NestFactory } from '@nestjs/core'
import { INestApplication } from '@nestjs/common'

import { CollectorModule } from './collector.module'
import { SpanVerifier } from './verifiers'

interface CollectorOptions {
  port?: number
}

export interface Verifiers {
  spans: SpanVerifier
  // metrics: MetricCollector;
  // logs: LogCollector;
}

export class Collector {
  private readonly port: number
  private app?: INestApplication

  constructor(options?: CollectorOptions) {
    this.port = options?.port ?? 4317
  }

  async start(): Promise<Verifiers> {
    this.app = await NestFactory.create(CollectorModule)
    await this.app.listen(this.port)
    console.log(`Mock collector started on port ${this.port}`)

    return { spans: this.app.get(SpanVerifier) }
  }

  async stop(): Promise<void> {
    if (this.app) {
      await this.app.close()
    }
  }
}
