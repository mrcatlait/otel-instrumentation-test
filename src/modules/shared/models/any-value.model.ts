/**
 * @deprecated Use AttributeValue instead
 */
export interface AnyValue {
  stringValue?: string | null
  boolValue?: boolean | null
  intValue?: number | null
  doubleValue?: number | null
  arrayValue?: AnyArrayValue
  kvlistValue?: AnyKeyValueList
  bytesValue?: Uint8Array
}

interface AnyArrayValue {
  values: AnyValue[]
}

interface AnyKeyValueList {
  values: AnyValue[]
}
