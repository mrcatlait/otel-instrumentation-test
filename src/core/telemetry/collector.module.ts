import { Module } from '@nestjs/common'

import { CollectorController } from './controllers'
import { LogCollector, MetricCollector, SpanCollector } from './collectors'
import { SpanVerifier } from './verifiers'

@Module({
  controllers: [CollectorController],
  providers: [LogCollector, MetricCollector, SpanCollector, SpanVerifier],
})
export class CollectorModule {}
