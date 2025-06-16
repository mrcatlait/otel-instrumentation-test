import { InstrumentationScope } from '../../shared/models'
import { Metric } from './metric.model'

export interface ScopeMetric {
  scope?: InstrumentationScope
  metrics?: Metric[]
  schemaUrl?: string
}
