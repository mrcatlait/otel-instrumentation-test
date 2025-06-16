import { SpanKind, SpanStatus } from '@opentelemetry/api'

import { SpanAssertionVerifier } from './span.assertion-verifier'
import { SpanVerifier } from '../../verifiers'

import { AttributeValue } from 'src/core/telemetry/models/attribute.model'
import { Span } from 'src/core/telemetry/models/span.model'
import { Attribute } from 'src/modules/shared/models'

type AnyValue = string | number | boolean | string[]

export class SpanAssertionBuilder {
  protected semanticAttributes: string[] = []
  private readonly model: Partial<Span> = {}

  constructor(
    private readonly verifier: SpanVerifier,
    private readonly assertions: SpanAssertionVerifier[],
    private readonly expectedCount: number,
  ) {}

  withName(name: string): this {
    this.model.name = name

    return this
  }

  withKind(kind: SpanKind): this {
    this.model.kind = kind

    return this
  }

  withStatus(status: SpanStatus): this {
    this.model.status = status

    return this
  }

  withAttribute(key: string, value: AnyValue): this {
    if (!this.model.attributes) {
      this.model.attributes = []
    }

    this.model.attributes.push({ key, value: this.toAttributeValue(value) })
    return this
  }

  withAttributes(attributes: Record<string, AnyValue>): this {
    Object.entries(attributes).forEach(([key, value]) => {
      this.withAttribute(key, value)
    })

    return this
  }

  withResourceAttribute(key: string, value: AnyValue): this {
    if (!this.model.resourceAttributes) {
      this.model.resourceAttributes = []
    }

    this.model.resourceAttributes.push({ key, value: this.toAttributeValue(value) })

    return this
  }

  withResourceAttributes(attributes: Record<string, AnyValue>): this {
    Object.entries(attributes).forEach(([key, value]) => {
      this.withResourceAttribute(key, value)
    })

    return this
  }

  assert(): SpanVerifier {
    const error = new Error()

    // eslint-disable-next-line @typescript-eslint/unbound-method
    Error.captureStackTrace(error, this.assert)
    const originalStack = error.stack

    this.assertions.push(
      new SpanAssertionVerifier(this.model, this.semanticAttributes, this.expectedCount, originalStack),
    )

    return this.verifier
  }

  private toAttributeValue(value: AnyValue): AttributeValue {
    if (typeof value === 'string') {
      return { stringValue: value }
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return { intValue: value }
      } else {
        return { doubleValue: value }
      }
    } else if (typeof value === 'boolean') {
      return { boolValue: value }
    } else if (Array.isArray(value)) {
      return { arrayValue: { values: value.map((v) => ({ stringValue: v })) } }
    } else {
      throw new Error(`Unsupported attribute value type: ${typeof value}`)
    }
  }
}
