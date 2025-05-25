export interface Attribute {
  key: string
  value: AttributeValue
}

interface AttributeValue {
  stringValue?: string | null
  boolValue?: boolean | null
  intValue?: number | null
  doubleValue?: number | null
  arrayValue?: AttributeArrayValue
  kvlistValue?: AttributeKeyValueList
  bytesValue?: Uint8Array
}

export interface AttributeArrayValue {
  values: AttributeValue[]
}

export interface AttributeKeyValueList {
  values: AttributeValue[]
}
