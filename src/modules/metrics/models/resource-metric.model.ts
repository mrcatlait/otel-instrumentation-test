import { Resource } from '../../shared/models'
import { ScopeMetric } from './scope-metric.model'

export interface ResourceMetric {
  resource?: Resource
  scopeMetrics: ScopeMetric[]
}
