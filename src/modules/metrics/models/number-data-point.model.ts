import { Attribute, Fixed64 } from '../../shared/models'
import { Exemplar } from './exemplar.model'

export interface NumberDataPoint {
  attributes: Attribute[]
  startTimeUnixNano?: Fixed64
  timeUnixNano?: Fixed64
  asDouble?: number | null
  asInt?: number
  exemplars?: Exemplar[]
  flags?: number
}
