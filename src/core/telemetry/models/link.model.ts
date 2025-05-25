import { Attribute } from './attribute.model'

export interface ILink {
  traceId: string | Uint8Array
  spanId: string | Uint8Array
  traceState?: string
  attributes: Attribute[]
  droppedAttributesCount: number
}
