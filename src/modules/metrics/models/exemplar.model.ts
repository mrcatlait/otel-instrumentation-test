import { Attribute } from 'src/modules/shared/models'

export interface Exemplar {
  filteredAttributes?: Attribute[]
  timeUnixNano?: string
  asDouble?: number
  asInt?: number
  spanId?: string | Uint8Array
  traceId?: string | Uint8Array
}
