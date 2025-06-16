import { Global, Module } from '@nestjs/common'

import { MetricCollector } from './collectors'
import { MetricsController } from './controllers'

@Global()
@Module({
  imports: [],
  controllers: [MetricsController],
  providers: [MetricCollector],
  exports: [MetricCollector],
})
export class MetricsModule {}
