import { Attribute } from '../../shared/models'

export interface Link {
  traceId: string | Uint8Array
  spanId: string | Uint8Array
  traceState?: string
  attributes: Attribute[]
  droppedAttributesCount: number
}
