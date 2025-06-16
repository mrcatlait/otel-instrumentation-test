import * as assert from 'assert'

import { Attribute, AttributeValue } from '../../shared/models'
import { Span } from '../models'
import { SpanKind } from '../enums'

export class SpanAssertionVerifier {
  constructor(
    private readonly model: Partial<Span>,
    private readonly semanticAttributes: string[],
    private readonly expectedCount: number,
    private readonly originalStack?: string,
  ) {}

  verify(spans: Span[]): void {
    const matchingSpans = spans.filter((span) => this.matchesSpan(span))

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
    const parts: string[] = []

    if (this.model.name) parts.push(`name="${this.model.name}"`)
    if (this.model.kind) parts.push(`kind=${SpanKind[this.model.kind]}`)
    if (this.model.status) parts.push(`status=${this.model.status.code}`)
    if (this.model.attributes && this.model.attributes.length > 0) {
      parts.push(
        `attributes=[${this.model.attributes.map((a) => `${a.key}=${this.formatAttributeValue(a.value)}`).join(', ')}]`,
      )
    }
    if (this.model.resourceAttributes && this.model.resourceAttributes.length > 0) {
      parts.push(
        `resourceAttributes=[${this.model.resourceAttributes.map((a) => `${a.key}=${this.formatAttributeValue(a.value)}`).join(', ')}]`,
      )
    }
    if (this.semanticAttributes.length > 0) {
      parts.push(`semanticAttributes=[${this.semanticAttributes.join(', ')}]`)
    }

    return parts.join(', ') || 'any span'
  }

  private getSpanSummary(span: Span): string {
    const attributes =
      span.attributes
        .slice(0, 3)
        .map((a) => `${a.key}=${this.formatAttributeValue(a.value)}`)
        .join(', ') || 'no attributes'

    return `"${span.name}" (${SpanKind[span.kind]}) [${attributes}]`
  }

  private matchesSpan(span: Span): boolean {
    if (this.model.name && span.name !== this.model.name) return false
    if (this.model.kind && span.kind !== this.model.kind) return false
    if (this.model.status && span.status.code !== this.model.status.code) return false

    // Check attributes
    if (this.model.attributes) {
      for (const expectedAttr of this.model.attributes) {
        if (!this.hasAttribute(span, expectedAttr)) return false
      }
    }

    // Check resource attributes
    if (this.model.resourceAttributes) {
      for (const expectedAttr of this.model.resourceAttributes) {
        if (!this.hasResourceAttribute(span, expectedAttr)) return false
      }
    }

    // Check semantic attributes
    if (this.semanticAttributes.length > 0) {
      for (const expectedAttr of this.semanticAttributes) {
        const hasAttribute = span.attributes.some((attr) => attr.key === expectedAttr)
        if (!hasAttribute) return false
      }
    }

    return true
  }

  private hasAttribute(span: Span, expectedAttr: Attribute): boolean {
    return span.attributes.some(
      (attr) => attr.key === expectedAttr.key && this.attributeValuesMatch(attr.value, expectedAttr.value),
    )
  }

  private hasResourceAttribute(span: Span, expectedAttr: Attribute): boolean {
    return (
      span.resourceAttributes?.some(
        (attr) => attr.key === expectedAttr.key && this.attributeValuesMatch(attr.value, expectedAttr.value),
      ) ?? false
    )
  }

  private attributeValuesMatch(actual: AttributeValue, expected: AttributeValue): boolean {
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

  private formatAttributeValue(value: AttributeValue): string {
    if (value.stringValue) return `"${value.stringValue}"`
    if (value.intValue != undefined) return value.intValue.toString()
    if (value.boolValue != undefined) return value.boolValue.toString()
    return 'unknown'
  }
}
