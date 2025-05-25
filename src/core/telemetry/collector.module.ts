import { Module } from '@nestjs/common'

import { CollectorController } from './controllers'
import { LogCollector, MetricCollector, SpanCollector } from './collectors'

@Module({
  controllers: [CollectorController],
  providers: [LogCollector, MetricCollector, SpanCollector],
})
export class CollectorModule {}
