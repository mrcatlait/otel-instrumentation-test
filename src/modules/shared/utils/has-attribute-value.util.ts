import { AttributeValue } from '../models'

export const hasAttributeValue = (actual: AttributeValue, expected: AttributeValue): boolean => {
  if (actual.stringValue && expected.stringValue) {
    return actual.stringValue === expected.stringValue
  }
  if (actual.intValue !== undefined && expected.intValue !== undefined) {
    return actual.intValue === expected.intValue
  }
  if (actual.boolValue !== undefined && expected.boolValue !== undefined) {
    return actual.boolValue === expected.boolValue
  }
  return false
}
