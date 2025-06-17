import { SpanAssertionVerifier } from './span.assertion-verifier'
import { SpanVerifier } from '../verifiers'
import { SpanKind } from '../enums'
import { SpanStatus, Span } from '../models'
import { AttributeValue } from '../../shared/models'

/**
 * Provides a fluent API for building assertions to verify the properties of OpenTelemetry spans.
 * This is used to define the expected characteristics of spans, such as their name, kind, status, and attributes.
 *
 * For HTTP-specific testing, consider using `HttpSpanAssertion` which provides convenience methods
 * for common HTTP attributes.
 *
 * @example
 * Basic span testing:
 * ```typescript
 * spanVerifier
 *   .toHaveSpan()
 *   .withName('user-authentication')
 *   .withKind(SpanKind.INTERNAL)
 *   .withStatus({ code: SpanStatusCode.OK })
 *   .assert()
 * ```
 *
 * @example
 * Database operation testing:
 * ```typescript
 * spanVerifier
 *   .toHaveSpan()
 *   .withName('db.query')
 *   .withAttribute('db.system', 'postgresql')
 *   .withAttribute('db.statement', 'SELECT * FROM users WHERE id = ?')
 *   .withAttribute('db.table', 'users')
 *   .assert()
 * ```
 *
 * @example
 * Service-to-service communication:
 * ```typescript
 * spanVerifier
 *   .toHaveSpan()
 *   .withName('payment-service-call')
 *   .withKind(SpanKind.CLIENT)
 *   .withAttribute('rpc.service', 'PaymentService')
 *   .withAttribute('rpc.method', 'ProcessPayment')
 *   .withResourceAttribute('service.name', 'order-service')
 *   .assert()
 * ```
 *
 * @example
 * Error handling verification:
 * ```typescript
 * spanVerifier
 *   .toHaveSpan()
 *   .withName('process-order')
 *   .withStatus({
 *     code: SpanStatusCode.ERROR,
 *     message: 'Insufficient inventory'
 *   })
 *   .withAttribute('error', true)
 *   .assert()
 * ```
 */
export class SpanAssertion {
  protected semanticAttributes: string[] = []
  private readonly schema: Partial<Span> = {}

  constructor(
    private readonly verifier: SpanVerifier,
    private readonly assertions: SpanAssertionVerifier[],
    private readonly expectedCount: number,
  ) {}

  /**
   * Sets the expected name of the span.
   * Span names should be concise, descriptive, and have low cardinality (e.g., avoid using IDs).
   *
   * @param name The expected span name.
   * @returns The `SpanAssertion` instance for chaining.
   *
   * @example
   * HTTP operations:
   * ```typescript
   * assertion.withName('HTTP GET')
   * assertion.withName('HTTP POST /api/users')
   * ```
   *
   * @example
   * Database operations:
   * ```typescript
   * assertion.withName('db.query')
   * assertion.withName('redis.get')
   * assertion.withName('mongodb.find')
   * ```
   *
   * @example
   * Custom operations:
   * ```typescript
   * assertion.withName('validate-user-input')
   * assertion.withName('send-notification')
   * assertion.withName('process-payment')
   * ```
   */
  withName(name: string): this {
    this.schema.name = name

    return this
  }

  /**
   * Sets the expected kind of the span.
   * The kind indicates the role of the span in a trace, such as `SERVER` for incoming requests
   * or `CLIENT` for outgoing requests.
   *
   * @param kind The expected span kind.
   * @returns The `SpanAssertion` instance for chaining.
   *
   * @example
   * HTTP server handling incoming requests:
   * ```typescript
   * assertion.withKind(SpanKind.SERVER)
   * ```
   *
   * @example
   * HTTP client making outgoing requests:
   * ```typescript
   * assertion.withKind(SpanKind.CLIENT)
   * ```
   *
   * @example
   * Internal application logic:
   * ```typescript
   * assertion.withKind(SpanKind.INTERNAL)
   * ```
   *
   * @example
   * Message queue operations:
   * ```typescript
   * assertion.withKind(SpanKind.PRODUCER) // Sending messages
   * assertion.withKind(SpanKind.CONSUMER) // Receiving messages
   * ```
   */
  withKind(kind: SpanKind): this {
    this.schema.kind = kind

    return this
  }

  /**
   * Sets the expected status of the span.
   * The status indicates whether the operation was successful (`OK`), failed (`ERROR`), or is not set (`UNSET`).
   *
   * @param status The expected span status.
   * @returns The `SpanAssertion` instance for chaining.
   *
   * @example
   * Successful operations:
   * ```typescript
   * assertion.withStatus({ code: SpanStatusCode.OK })
   * ```
   *
   * @example
   * Failed operations with error message:
   * ```typescript
   * assertion.withStatus({
   *   code: SpanStatusCode.ERROR,
   *   message: 'Database connection timeout'
   * })
   * ```
   *
   * @example
   * HTTP error responses:
   * ```typescript
   * assertion.withStatus({
   *   code: SpanStatusCode.ERROR,
   *   message: 'HTTP 500 Internal Server Error'
   * })
   * ```
   */
  withStatus(status: SpanStatus): this {
    this.schema.status = status

    return this
  }

  /**
   * Sets an expected attribute for the span.
   * Attributes provide additional details about the operation, such as `http.method` or `db.system`.
   *
   * @param key The attribute key.
   * @param value The expected attribute value.
   * @returns The `SpanAssertion` instance for chaining.
   *
   * @example
   * HTTP attributes:
   * ```typescript
   * assertion.withAttribute('http.method', 'GET')
   * assertion.withAttribute('http.status_code', 200)
   * assertion.withAttribute('http.route', '/api/users/:id')
   * ```
   *
   * @example
   * Database attributes:
   * ```typescript
   * assertion.withAttribute('db.system', 'postgresql')
   * assertion.withAttribute('db.statement', 'SELECT * FROM users')
   * assertion.withAttribute('db.table', 'users')
   * ```
   *
   * @example
   * Custom business attributes:
   * ```typescript
   * assertion.withAttribute('user.id', '12345')
   */
  withAttribute(key: string, value: string | number | boolean): this {
    if (!this.schema.attributes) {
      this.schema.attributes = []
    }
    this.schema.attributes.push({ key, value: this.toAttributeValue(value) })

    return this
  }

  /**
   * Specifies multiple expected span attributes for verification.
   *
   * A convenience method for setting multiple attributes at once. It takes an
   * object where keys are attribute names and values are the expected attribute values.
   * This is useful for defining a set of required attributes for a span.
   *
   * @param attributes - A record of attribute keys and their expected values
   * @returns This assertion instance for method chaining
   *
   * @example
   * HTTP attributes:
   * ```typescript
   * assertion.withAttributes({
   *   'http.method': 'GET',
   *   'http.status_code': 200,
   *   'http.route': '/api/users/:id'
   * })
   * ```
   *
   * @example
   * Database attributes:
   * ```typescript
   * assertion.withAttributes({
   *   'db.system': 'postgresql',
   *   'db.statement': 'SELECT * FROM users',
   *   'db.table': 'users'
   * })
   * ```
   *
   * @example
   * Custom application attributes:
   * ```typescript
   * assertion.withAttributes({
   *   'app.version': '1.2.3',
   *   'feature.flag': 'enabled',
   *   'user.id': 'abc-123'
   * })
   * ```
   */
  withAttributes(attributes: Record<string, string | number | boolean>): this {
    if (!this.schema.attributes) {
      this.schema.attributes = []
    }
    for (const [key, value] of Object.entries(attributes)) {
      this.schema.attributes.push({ key, value: this.toAttributeValue(value) })
    }

    return this
  }

  /**
   * Specifies an expected resource attribute for verification.
   *
   * Resource attributes describe the entity producing the telemetry, such as
   * the service name, version, instance ID, or cloud provider. These attributes
   * apply to all spans emitted by a resource and are essential for identifying
   * the source of telemetry data.
   *
   * Common resource attributes:
   * - `service.name`
   * - `service.version`
   * - `service.instance.id`
   * - `telemetry.sdk.name`
   * - `cloud.provider`
   *
   * @param key - The resource attribute key
   * @param value - The expected resource attribute value
   * @returns This assertion instance for method chaining
   *
   * @example
   * Standard service attributes:
   * ```typescript
   * assertion.withResourceAttribute('service.name', 'order-service')
   * assertion.withResourceAttribute('service.version', '1.0.0')
   * ```
   *
   * @example
   * Deployment environment attributes:
   * ```typescript
   * assertion.withResourceAttribute('deployment.environment', 'production')
   * assertion.withResourceAttribute('cloud.region', 'us-east-1')
   * ```
   *
   * @example
   * Host and SDK attributes:
   * ```typescript
   * assertion.withResourceAttribute('host.name', 'prod-worker-123')
   * assertion.withResourceAttribute('telemetry.sdk.language', 'nodejs')
   * ```
   */
  withResourceAttribute(key: string, value: string | number | boolean): this {
    if (!this.schema.resourceAttributes) {
      this.schema.resourceAttributes = []
    }
    this.schema.resourceAttributes.push({
      key,
      value: this.toAttributeValue(value),
    })

    return this
  }

  /**
   * Specifies multiple expected resource attributes for verification.
   *
   * A convenience method for setting multiple resource attributes at once.
   * This is useful for ensuring that all spans from a service contain the
   * correct set of identifying resource attributes.
   *
   * @param attributes - A record of resource attribute keys and their expected values
   * @returns This assertion instance for method chaining
   *
   * @example
   * Standard service identification:
   * ```typescript
   * assertion.withResourceAttributes({
   *   'service.name': 'user-service',
   *   'service.version': '2.1.0'
   * })
   * ```
   *
   * @example
   * Detailed deployment context:
   * ```typescript
   * assertion.withResourceAttributes({
   *   'deployment.environment': 'staging',
   *   'cloud.provider': 'aws',
   *   'cloud.region': 'eu-west-1'
   * })
   * ```
   *
   * @example
   * Kubernetes resource context:
   * ```typescript
   * assertion.withResourceAttributes({
   *   'k8s.pod.name': 'user-service-pod-xyz',
   *   'k8s.namespace.name': 'production',
   *   'k8s.cluster.name': 'prod-cluster'
   * })
   * ```
   */
  withResourceAttributes(attributes: Record<string, string | number | boolean>): this {
    if (!this.schema.resourceAttributes) {
      this.schema.resourceAttributes = []
    }
    for (const [key, value] of Object.entries(attributes)) {
      this.schema.resourceAttributes.push({
        key,
        value: this.toAttributeValue(value),
      })
    }

    return this
  }

  /**
   * Finalizes the span assertion and adds it to the verification queue.
   *
   * This method captures the current call stack for better error reporting
   * and registers the assertion for execution during test verification.
   * After calling assert(), you can chain additional assertions or call
   * assertAll() to execute all registered assertions.
   *
   * The captured stack trace helps identify which assertion failed when
   * multiple assertions are chained together, making debugging easier.
   *
   * @returns The parent span verifier instance for continued test building
   *
   * @example
   * Single assertion:
   * ```typescript
   * await spanVerifier
   *   .toHaveSpan()
   *   .withName('HTTP GET')
   *   .withKind(SpanKind.SERVER)
   *   .withAttribute('http.method', 'GET')
   *   .assert()
   *   .assertAll()
   * ```
   *
   * @example
   * Multiple chained assertions:
   * ```typescript
   * await spanVerifier
   *   .toHaveSpan()
   *   .withName('process-order')
   *   .assert()
   *   .toHaveSpan()
   *   .withName('validate-payment')
   *   .assert()
   *   .toHaveSpan()
   *   .withName('update-inventory')
   *   .assert()
   *   .assertAll()
   * ```
   *
   * @example
   * Complex assertion with multiple criteria:
   * ```typescript
   * await spanVerifier
   *   .toHaveSpan()
   *   .withName('user-registration')
   *   .withKind(SpanKind.INTERNAL)
   *   .withStatus({ code: SpanStatusCode.OK })
   *   .withAttributes({
   *     'user.email': 'test@example.com',
   *     'user.source': 'web',
   *     'validation.passed': true
   *   })
   *   .withResourceAttribute('service.name', 'auth-service')
   *   .assert()
   *   .assertAll()
   * ```
   */
  assert(): SpanVerifier {
    const error = new Error()

    // eslint-disable-next-line @typescript-eslint/unbound-method
    Error.captureStackTrace(error, this.assert)
    const originalStack = error.stack

    this.assertions.push(
      new SpanAssertionVerifier(this.schema, this.semanticAttributes, this.expectedCount, originalStack),
    )

    return this.verifier
  }

  /**
   * Converts various JavaScript types to OpenTelemetry AttributeValue format.
   *
   * Internal utility method that handles type conversion for attribute values
   * to match the OpenTelemetry data model specification.
   *
   * @param value - The value to convert
   * @returns OpenTelemetry-compatible AttributeValue
   * @throws {Error} When the value type is not supported
   *
   * @private
   */
  private toAttributeValue(value: string | number | boolean): AttributeValue {
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
      throw new Error(`Unsupported attribute type: ${typeof value}`)
    }
  }
}
