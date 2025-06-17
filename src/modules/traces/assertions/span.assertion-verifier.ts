import * as assert from 'assert'

import { Span } from '../models'
import { SpanKind } from '../enums'
import { formatAttributeValue, hasAttribute } from '../../shared/utils'

export class SpanAssertionVerifier {
  constructor(
    private readonly schema: Partial<Span>,
    private readonly semanticAttributes: string[],
    private readonly expectedCount: number,
    private readonly originalStack?: string,
  ) {}

  verify(spans: Span[]): void {
    const matchingSpans = spans.filter((span) => this.matches(span))

    try {
      assert.strictEqual(
        matchingSpans.length,
        this.expectedCount,
        `Expected ${this.expectedCount} spans matching "${this.getDescription()}", found ${matchingSpans.length}\n` +
          `Matching spans: ${matchingSpans.map((s) => this.getSpanSummary(s)).join(', ')}`,
      )
    } catch (error) {
      if (error instanceof Error && this.originalStack) {
        error.stack = this.originalStack
      }
      throw error
    }
  }

  private getDescription(): string {
    const parts: Record<string, unknown> = { ...this.schema }

    if (this.schema.attributes && this.schema.attributes.length > 0) {
      const attributesObj: Record<string, unknown> = {}
      this.schema.attributes.forEach((attribute) => {
        attributesObj[attribute.key] = formatAttributeValue(attribute.value)
      })
      parts.attributes = attributesObj
    }
    if (this.schema.resourceAttributes && this.schema.resourceAttributes.length > 0) {
      const resourceAttributesObj: Record<string, unknown> = {}
      this.schema.resourceAttributes.forEach((attribute) => {
        resourceAttributesObj[attribute.key] = formatAttributeValue(attribute.value)
      })
      parts.resourceAttributes = resourceAttributesObj
    }
    if (this.semanticAttributes.length > 0) {
      parts.semanticAttributes = this.semanticAttributes.join(', ')
    }

    return JSON.stringify(parts, null, 2)
  }

  private getSpanSummary(span: Span): string {
    const attributes =
      span.attributes
        .slice(0, 3)
        .map((a) => `${a.key}=${formatAttributeValue(a.value)}`)
        .join(', ') || 'no attributes'

    return `"${span.name}" (${SpanKind[span.kind]}) [${attributes}]`
  }

  private matches(span: Span): boolean {
    if (this.schema.name && span.name !== this.schema.name) return false
    if (this.schema.kind && span.kind !== this.schema.kind) return false
    if (this.schema.status && span.status.code !== this.schema.status.code) return false

    // Check attributes
    if (this.schema.attributes) {
      for (const expectedAttr of this.schema.attributes) {
        if (!hasAttribute(span.attributes, expectedAttr)) return false
      }
    }

    // Check resource attributes
    if (this.schema.resourceAttributes) {
      for (const expectedAttr of this.schema.resourceAttributes) {
        if (!hasAttribute(span.resourceAttributes ?? [], expectedAttr)) return false
      }
    }

    // Check semantic attributes
    if (this.semanticAttributes.length > 0) {
      for (const expectedAttr of this.semanticAttributes) {
        const matches = span.attributes.some((attr) => attr.key === expectedAttr)
        if (!matches) return false
      }
    }

    return true
  }
}
