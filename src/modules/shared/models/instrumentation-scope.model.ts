import { Attribute } from './attribute.model'

export interface InstrumentationScope {
  name: string
  version?: string
  attributes?: Attribute[]
  droppedAttributesCount?: number
}
