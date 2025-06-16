import { Module } from '@nestjs/common'

import { TracesModule } from './traces/traces.module'
import { MetricsModule } from './metrics/metrics.module'

@Module({
  imports: [TracesModule, MetricsModule],
})
export class CollectorModule {}
