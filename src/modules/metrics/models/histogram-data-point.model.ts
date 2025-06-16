import { Attribute, Fixed64 } from '../../shared/models'
import { Exemplar } from './exemplar.model'

export interface HistogramDataPoint {
  attributes?: Attribute[]
  startTimeUnixNano?: Fixed64
  timeUnixNano?: Fixed64
  count?: number
  sum?: number
  bucketCounts?: number[]
  explicitBounds?: number[]
  exemplars?: Exemplar[]
  flags?: number
  min?: number
  max?: number
}
