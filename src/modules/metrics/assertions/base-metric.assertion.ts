import { Metric } from '../models'
import { AttributeValue } from '../../shared/models'
import { BaseMetricVerifier } from './base-metric.verifier'
import { MetricVerifier } from '../verifiers'

export type AnyValue = string | number | boolean | string[]

/**
 * The base class for all metric assertions.
 * It provides a fluent API for defining expected metric properties, such as name, description, unit, and attributes.
 *
 * @template Parent The parent verifier type, enabling a fluent API.
 *
 * @example
 * ```typescript
 * // Extending for specific metric types
 * class HistogramAssertion extends BaseMetricAssertion {
 *   // Implementation for histogram-specific assertions
 * }
 * ```
 */
export abstract class BaseMetricAssertion<Parent = MetricVerifier> {
  protected semanticAttributes: string[] = []
  protected abstract verifier: new (
    schema: Partial<Metric>,
    semanticAttributes: string[],
    originalStack: string,
  ) => BaseMetricVerifier

  protected readonly schema: Partial<Metric> = {}

  constructor(
    protected readonly parent: Parent,
    private readonly assertions: BaseMetricVerifier[],
  ) {}

  /**
   * Sets the expected name of the metric.
   *
   * @param name The expected metric name (e.g., `http.server.duration`).
   * @returns The `BaseMetricAssertion` instance for chaining.
   *
   * @example
   * ```typescript
   * assertion.withName('http.server.duration')
   * ```
   */
  withName(name: string): this {
    this.schema.name = name
    return this
  }

  /**
   * Sets the expected description of the metric.
   *
   * @param description The expected metric description.
   * @returns The `BaseMetricAssertion` instance for chaining.
   *
   * @example
   * ```typescript
   * assertion.withDescription('Duration of HTTP server requests')
   * ```
   */
  withDescription(description: string): this {
    this.schema.description = description
    return this
  }

  /**
   * Sets the expected unit of the metric.
   *
   * @param unit The expected metric unit (e.g., `ms` for milliseconds).
   * @returns The `BaseMetricAssertion` instance for chaining.
   *
   * @example
   * ```typescript
   * assertion.withUnit('ms')
   * ```
   */
  withUnit(unit: string): this {
    this.schema.unit = unit
    return this
  }

  /**
   * Sets an expected resource attribute for the metric.
   * Resource attributes describe the service or environment that produced the metric.
   *
   * @param key The attribute key (e.g., `service.name`).
   * @param value The expected attribute value.
   * @returns The `BaseMetricAssertion` instance for chaining.
   *
   * @example
   * ```typescript
   * assertion.withResourceAttribute('service.name', 'my-service')
   * ```
   */
  withResourceAttribute(key: string, value: string | number | boolean): this {
    if (!this.schema.resourceAttributes) {
      this.schema.resourceAttributes = []
    }

    this.schema.resourceAttributes.push({ key, value: this.toAttributeValue(value) })
    return this
  }

  /**
   * Sets multiple expected resource attributes for the metric.
   * This is a convenience for setting multiple attributes at once.
   *
   * @param attributes A record of attribute keys and their expected values.
   * @returns The `BaseMetricAssertion` instance for chaining.
   *
   * @example
   * ```typescript
   * assertion.withResourceAttributes({
   *   'service.name': 'my-service',
   *   'service.version': '1.0.0'
   * })
   * ```
   */
  withResourceAttributes(attributes: Record<string, string | number | boolean>): this {
    for (const [key, value] of Object.entries(attributes)) {
      this.withResourceAttribute(key, value)
    }

    return this
  }

  /**
   * Registers the assertion with the verifier.
   * This should be called to finalize an assertion chain.
   *
   * @returns The parent verifier, to allow for chaining multiple assertions.
   *
   * @example
   * ```typescript
   * assertion
   *   .withName('http.server.duration')
   *   .withUnit('ms')
   *   .assert() // Registers assertion and returns parent verifier
   * ```
   */
  assert(): Parent {
    const error = new Error()

    // eslint-disable-next-line @typescript-eslint/unbound-method
    Error.captureStackTrace(error, this.assert)
    const originalStack = error.stack ?? ''

    this.assertions.push(new this.verifier(this.schema, this.semanticAttributes, originalStack))

    return this.parent
  }

  /**
   * @internal
   */
  protected toAttributeValue(value: string | number | boolean): AttributeValue {
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
    } else {
      throw new Error(`Unsupported attribute value type: ${typeof value}`)
    }
  }
}
