import { Attribute } from './attribute.model'

export interface Resource {
  attributes: Attribute[]
  droppedAttributesCount: number
}
