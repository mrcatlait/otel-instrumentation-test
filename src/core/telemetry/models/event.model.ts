import { Attribute } from './attribute.model'
import { Fixed64 } from './common.model'

export interface Event {
  timeUnixNano: Fixed64
  name: string
  attributes: Attribute[]
  droppedAttributesCount: number
}
