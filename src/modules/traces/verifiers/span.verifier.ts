import { Inject, Injectable } from '@nestjs/common'

import { SpanCollector } from '../collectors'
import { HttpSpanAssertion, SpanAssertion, SpanAssertionVerifier } from '../assertions'
import { CollectorOptions } from '../../shared/models'
import { COLLECTOR_MODULE_OPTIONS } from '../../shared/tokens'

/**
 * Provides a fluent API for asserting the state of OpenTelemetry spans.
 * Use this to verify that your application is producing the expected tracing data.
 *
 * @example
 * Basic span testing:
 * ```typescript
 * await verifiers.spans
 *   .toHaveSpan()
 *   .withName('database-query')
 *   .withAttribute('db.system', 'postgresql')
 *   .withStatus({ code: SpanStatusCode.OK })
 *   .assert()
 *   .assertAll()
 * ```
 *
 * @example
 * HTTP span testing:
 * ```typescript
 * await verifiers.spans
 *   .toHaveHttpSpan()
 *   .withMethod('POST')
 *   .withUrl('/api/users')
 *   .withHttpStatus(201)
 *   .assert()
 *   .assertAll()
 * ```
 *
 * @example
 * Testing multiple spans:
 * ```typescript
 * await verifiers.spans
 *   .toHaveSpanWithCount(3)
 *   .withName('batch-process-item')
 *   .assert()
 *   .toHaveHttpSpan()
 *   .withMethod('GET')
 *   .assert()
 *   .assertAll()
 * ```
 */
@Injectable()
export class SpanVerifier {
  private readonly options: CollectorOptions
  private readonly assertions: SpanAssertionVerifier[] = []

  constructor(
    private readonly collector: SpanCollector,
    @Inject(COLLECTOR_MODULE_OPTIONS)
    options: CollectorOptions,
  ) {
    this.options = options
  }

  /**
   * Asserts that at least one HTTP span is present.
   * This is a convenience for `toHaveHttpSpanWithCount(1)`.
   *
   * @returns An `HttpSpanAssertion` to chain further assertions.
   *
   * @example
   * ```typescript
   * spanVerifier
   *   .toHaveHttpSpan()
   *   .withMethod('GET')
   *   .withUrl('/api/users')
   *   .withHttpStatus(200)
   *   .assert()
   * ```
   */
  toHaveHttpSpan(): HttpSpanAssertion {
    return this.toHaveHttpSpanWithCount(1)
  }

  /**
   * Asserts that a specific number of HTTP spans are present.
   * Use this to verify operations that are expected to generate a certain number of HTTP requests.
   *
   * @param count The expected number of HTTP spans.
   * @returns An `HttpSpanAssertion` to chain further assertions.
   *
   * @example
   * ```typescript
   * // Test that exactly 5 HTTP requests were made
   * spanVerifier
   *   .toHaveHttpSpanWithCount(5)
   *   .withMethod('POST')
   *   .withUrl('/api/batch')
   *   .assert()
   * ```
   */
  toHaveHttpSpanWithCount(count: number): HttpSpanAssertion {
    return new HttpSpanAssertion(this, this.assertions, count)
  }

  /**
   * Asserts that at least one span is present.
   * This is a convenience for `toHaveSpanWithCount(1)`.
   *
   * @returns A `SpanAssertion` to chain further assertions.
   *
   * @example
   * ```typescript
   * spanVerifier
   *   .toHaveSpan()
   *   .withName('database-query')
   *   .withAttribute('db.system', 'redis')
   *   .assert()
   * ```
   */
  toHaveSpan(): SpanAssertion {
    return this.toHaveSpanWithCount(1)
  }

  /**
   * Asserts that a specific number of spans are present.
   * This is useful for verifying that a certain number of operations (e.g., database queries) occurred.
   *
   * @param count The expected number of spans.
   * @returns A `SpanAssertion` to chain further assertions.
   *
   * @example
   * ```typescript
   * // Test that exactly 10 database queries were made
   * spanVerifier
   *   .toHaveSpanWithCount(10)
   *   .withName('db.query')
   *   .withAttribute('db.statement', 'SELECT * FROM users')
   *   .assert()
   * ```
   */
  toHaveSpanWithCount(count: number): SpanAssertion {
    return new SpanAssertion(this, this.assertions, count)
  }

  /**
   * Executes all chained assertions.
   * This method will wait for the necessary spans to be collected,
   * retrying until all assertions pass or a timeout is reached.
   *
   * @returns A `Promise` that resolves when all assertions pass.
   * @throws {AssertionError} If any assertion fails during verification.
   * @throws {Error} If a timeout is reached before assertions can be evaluated.
   *
   * @example
   * Single assertion chain:
   * ```typescript
   * await spanVerifier
   *   .toHaveHttpSpan()
   *   .withMethod('GET')
   *   .withUrl('/health')
   *   .assert()
   *   .assertAll()
   * ```
   *
   * @example
   * Multiple assertion chain:
   * ```typescript
   * await spanVerifier
   *   .toHaveHttpSpan()
   *   .withMethod('POST')
   *   .withUrl('/api/users')
   *   .assert()
   *   .toHaveSpan()
   *   .withName('validate-user-input')
   *   .assert()
   *   .toHaveSpan()
   *   .withName('save-to-database')
   *   .assert()
   *   .assertAll()
   * ```
   */
  async assertAll(): Promise<void> {
    // Reactive approach: try assertions on each new data batch
    await this.collector.waitForAssertions((spans) => {
      // Run all assertions - if any fail, this will throw
      this.assertions.forEach((assertion) => assertion.verify(spans))
    }, this.options.timeout)
  }
}
