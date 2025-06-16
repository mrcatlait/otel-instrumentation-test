import { AggregationTemporality } from '../enums'
import { ExponentialHistogramDataPoint } from './exponential-histogram-data-point.model'

export interface ExponentialHistogram {
  dataPoints: ExponentialHistogramDataPoint[]
  aggregationTemporality?: AggregationTemporality
}
