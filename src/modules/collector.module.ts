import { Module } from '@nestjs/common'

import { TracesModule } from './traces/traces.module'

@Module({
  imports: [TracesModule],
})
export class CollectorModule {}
