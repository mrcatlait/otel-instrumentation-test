import { AggregationTemporality } from '../enums'
import { NumberDataPoint } from './number-data-point.model'

export interface Sum {
  dataPoints: NumberDataPoint[]
  aggregationTemporality: AggregationTemporality
  isMonotonic?: boolean | null
}
