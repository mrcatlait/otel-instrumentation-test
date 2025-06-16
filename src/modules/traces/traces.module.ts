import { Module, Global } from '@nestjs/common'

import { SpanCollector } from './collectors'
import { TracesController } from './controllers'
import { SpanVerifier } from './verifiers'

@Global()
@Module({
  imports: [],
  controllers: [TracesController],
  providers: [SpanCollector, SpanVerifier],
  exports: [SpanVerifier],
})
export class TracesModule {}
