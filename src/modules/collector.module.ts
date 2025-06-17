import { DynamicModule, Global, Module, Provider } from '@nestjs/common'

import { TracesModule } from './traces/traces.module'
import { MetricsModule } from './metrics/metrics.module'
import { CollectorOptions } from './shared/models'
import { COLLECTOR_MODULE_OPTIONS } from './shared/tokens'

@Global()
@Module({})
export class CollectorModule {
  static forRoot(options: CollectorOptions): DynamicModule {
    const collectorModuleOptions: Provider = {
      provide: COLLECTOR_MODULE_OPTIONS,
      useValue: options,
    }

    const providers: Provider[] = [collectorModuleOptions]
    const exports = [collectorModuleOptions]

    return {
      module: CollectorModule,
      imports: [TracesModule, MetricsModule],
      providers,
      exports,
    }
  }
}
