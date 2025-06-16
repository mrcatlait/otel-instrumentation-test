import { Attribute } from '../../shared/models'
import { ExponentialHistogram } from './exponential-histogram.model'
import { Gauge } from './gauge.model'
import { Histogram } from './histogram.model'
import { Sum } from './sum.model'
import { Summary } from './summary.model'

export interface Metric {
  name: string
  description?: string
  unit?: string
  gauge?: Gauge
  sum?: Sum
  histogram?: Histogram
  exponentialHistogram?: ExponentialHistogram
  summary?: Summary
  resourceAttributes?: Attribute[]
}
