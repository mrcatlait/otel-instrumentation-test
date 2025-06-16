import { Attribute } from '../../shared/models'
import { ValueAtQuantile } from './value-at-quantile.model'

export interface SummaryDataPoint {
  attributes?: Attribute[]
  startTimeUnixNano?: number
  timeUnixNano?: string
  count?: number
  sum?: number
  quantileValues?: ValueAtQuantile[]
  flags?: number
}
