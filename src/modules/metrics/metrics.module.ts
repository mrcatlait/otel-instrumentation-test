import { Global, Module } from '@nestjs/common'

import { MetricCollector } from './collectors'
import { MetricsController } from './controllers'
import { MetricVerifier } from './verifiers'

@Global()
@Module({
  imports: [],
  controllers: [MetricsController],
  providers: [MetricCollector, MetricVerifier],
  exports: [MetricVerifier],
})
export class MetricsModule {}
