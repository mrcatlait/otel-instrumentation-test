import { MatcherFn } from './models/matcher-fn.model'
import { Span } from '../telemetry/models/span.model'
import { Attribute } from '../telemetry/models/attribute.model'

export interface HttpSpan {
  name?: string
  method: string
  path: string
  status: number
}

export const toContainHttpSpan: MatcherFn<Span[]> = (spans, expectedSpan: HttpSpan) => {
  const hasHttpSpan = spans.some((span) => {
    const hasMethod = span.attributes.some(
      (attribute) => attribute.key === 'http.method' && attribute.value.stringValue === expectedSpan.method,
    )
    const hasPath = span.attributes.some(
      (attribute) => attribute.key === 'http.target' && attribute.value.stringValue === expectedSpan.path,
    )
    const hasStatus = span.attributes.some(
      (attribute) => attribute.key === 'http.status_code' && attribute.value.intValue === expectedSpan.status,
    )

    const name = expectedSpan.name ?? `${expectedSpan.method} ${expectedSpan.path}`
    const hasName = span.name === name

    return hasMethod && hasPath && hasStatus && hasName
  })

  return {
    pass: hasHttpSpan,
    message: () => `Expected span to have name ${expectedSpan.method} ${expectedSpan.path}`,
    actual: spans,
    expected: expectedSpan,
  }
}

export const toContainResourceAttribute: MatcherFn<Span[]> = (spans, expectedAttribute: Attribute) => {
  const hasAttribute = spans.some((span) => {
    return span.resourceAttributes?.some(
      (attribute) =>
        attribute.key === expectedAttribute.key && attribute.value.stringValue === expectedAttribute.value.stringValue,
    )
  })

  return {
    pass: hasAttribute,
    message: () => `Expected span to have attribute ${expectedAttribute.key} ${expectedAttribute.value.stringValue}`,
    actual: spans,
    expected: expectedAttribute,
  }
}
