import { Attribute, Fixed64 } from '../../shared/models'

export interface Event {
  timeUnixNano: Fixed64
  name: string
  attributes: Attribute[]
  droppedAttributesCount: number
}
