import { AttributeValue } from '../models'

export const formatAttributeValue = (attributeValue: AttributeValue): string => {
  if (attributeValue.stringValue) return `"${attributeValue.stringValue}"`
  if (attributeValue.intValue != undefined) return attributeValue.intValue.toString()
  if (attributeValue.boolValue != undefined) return attributeValue.boolValue.toString()

  return 'unknown'
}
