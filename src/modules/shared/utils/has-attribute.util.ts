import { Attribute } from '../models'
import { hasAttributeValue } from './has-attribute-value.util'

export const hasAttribute = (attributes: Attribute[], expectedAttribute: Attribute): boolean => {
  return attributes.some(
    (attribute) =>
      attribute.key === expectedAttribute.key && hasAttributeValue(attribute.value, expectedAttribute.value),
  )
}
