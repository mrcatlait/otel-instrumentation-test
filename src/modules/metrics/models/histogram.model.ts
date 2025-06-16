import { AggregationTemporality } from '../enums'
import { HistogramDataPoint } from './histogram-data-point.model'

export interface Histogram {
  dataPoints: HistogramDataPoint[]
  aggregationTemporality?: AggregationTemporality
}
