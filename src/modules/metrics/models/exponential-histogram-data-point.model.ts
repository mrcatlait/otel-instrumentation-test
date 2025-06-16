import { Attribute, Fixed64 } from '../../shared/models'
import { Buckets } from './buckets.model'
import { Exemplar } from './exemplar.model'

export interface ExponentialHistogramDataPoint {
  attributes?: Attribute[]
  startTimeUnixNano?: Fixed64
  timeUnixNano?: Fixed64
  count?: number
  sum?: number
  scale?: number
  zeroCount?: number
  positive?: Buckets
  negative?: Buckets
  flags?: number
  exemplars?: Exemplar[]
  min?: number
  max?: number
}
