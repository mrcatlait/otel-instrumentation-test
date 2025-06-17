import { Inject, Injectable } from '@nestjs/common'

import { MetricCollector } from '../collectors'
import { BaseMetricVerifier } from '../assertions/base-metric.verifier'
import { COLLECTOR_MODULE_OPTIONS } from '../../shared/tokens'
import { CollectorOptions } from '../../shared/models'
import { HttpServerDurationAssertion, HistogramAssertion } from '../assertions'

/**
 * Provides a fluent API for asserting the state of OpenTelemetry metrics.
 * Use this to verify that your application is emitting the expected metrics, such as histograms.
 *
 * @example
 * Testing HTTP server duration metrics:
 * ```typescript
 * await verifiers.metrics
 *   .toHaveHttpServerDuration()
 *   .withMethod('POST')
 *   .withStatusCode(201)
 *   .withRoute('/api/users')
 *   .withCount(10)
 *   .withSum(2500) // 10 requests totaling 2.5 seconds
 *   .assert()
 *   .assertAll()
 * ```
 *
 * @example
 * Testing custom histogram metrics:
 * ```typescript
 * await verifiers.metrics
 *   .toHaveHistogram()
 *   .withName('order.processing.duration')
 *   .withAttribute('order.type', 'express')
 *   .withCount(5)
 *   .withBucketCounts([1, 3, 5, 5]) // Distribution across buckets
 *   .assert()
 *   .assertAll()
 * ```
 *
 * @example
 * Testing multiple metric types:
 * ```typescript
 * await verifiers.metrics
 *   .toHaveHttpServerDuration()
 *   .withMethod('GET')
 *   .withRoute('/health')
 *   .assert()
 *   .toHaveHistogram()
 *   .withName('database.query.duration')
 *   .withAttribute('db.system', 'postgresql')
 *   .assert()
 *   .assertAll()
 * ```
 */
@Injectable()
export class MetricVerifier {
  private readonly assertions: BaseMetricVerifier[] = []

  constructor(
    private readonly collector: MetricCollector,
    @Inject(COLLECTOR_MODULE_OPTIONS)
    private readonly options: CollectorOptions,
  ) {}

  /**
   * Asserts that an `http.server.duration` histogram is present.
   * This is a common metric for measuring the duration of HTTP requests.
   *
   * @returns An `HttpServerDurationAssertion` to chain further assertions.
   *
   * @example
   * Basic HTTP server duration testing:
   * ```typescript
   * metricVerifier
   *   .toHaveHttpServerDuration()
   *   .withMethod('GET')
   *   .withStatusCode(200)
   *   .withRoute('/api/users')
   *   .assert()
   * ```
   *
   * @example
   * Advanced testing with counts and timing:
   * ```typescript
   * metricVerifier
   *   .toHaveHttpServerDuration()
   *   .withMethod('POST')
   *   .withStatusCode(201)
   *   .withRoute('/api/orders')
   *   .withCount(25)           // 25 requests processed
   *   .withSum(5000)           // Total 5 seconds across all requests
   *   .withMin(50)             // Fastest request: 50ms
   *   .withMax(500)            // Slowest request: 500ms
   *   .assert()
   * ```
   */
  toHaveHttpServerDuration(): HttpServerDurationAssertion {
    return new HttpServerDurationAssertion(this, this.assertions)
  }

  /**
   * Asserts that a histogram metric is present.
   * This is for asserting any histogram, including custom ones from your application.
   *
   * @returns A `HistogramAssertion` to chain further assertions.
   *
   * @example
   * Testing custom histogram metrics:
   * ```typescript
   * metricVerifier
   *   .toHaveHistogram()
   *   .withName('order.processing.duration')
   *   .withAttribute('order.priority', 'high')
   *   .withCount(100)
   *   .withSum(15000) // 100 orders processed in total 15 seconds
   *   .assert()
   * ```
   *
   * @example
   * Testing database operation histograms:
   * ```typescript
   * metricVerifier
   *   .toHaveHistogram()
   *   .withName('db.query.duration')
   *   .withAttribute('db.system', 'postgresql')
   *   .withAttribute('db.operation', 'SELECT')
   *   .withBucketCounts([10, 25, 40, 50]) // Distribution across time buckets
   *   .withExplicitBounds([0.1, 0.5, 1.0, 5.0]) // Bucket boundaries in seconds
   *   .assert()
   * ```
   *
   * @example
   * Testing resource usage histograms:
   * ```typescript
   * metricVerifier
   *   .toHaveHistogram()
   *   .withName('memory.allocation.size')
   *   .withAttribute('process.name', 'worker')
   *   .withMin(1024)     // Smallest allocation: 1KB
   *   .withMax(1048576)  // Largest allocation: 1MB
   *   .assert()
   * ```
   */
  toHaveHistogram(): HistogramAssertion {
    return new HistogramAssertion(this, this.assertions)
  }

  /**
   * Executes all chained assertions.
   * This method will wait for the necessary metrics to be collected,
   * retrying until all assertions pass or a timeout is reached.
   *
   * @returns A `Promise` that resolves when all assertions pass.
   * @throws {AssertionError} If any assertion fails during verification.
   * @throws {Error} If a timeout is reached before assertions can be evaluated.
   *
   * @example
   * Single assertion chain:
   * ```typescript
   * await metricVerifier
   *   .toHaveHttpServerDuration()
   *   .withMethod('GET')
   *   .withRoute('/health')
   *   .assert()
   *   .assertAll()
   * ```
   *
   * @example
   * Multiple assertion chain:
   * ```typescript
   * await metricVerifier
   *   .toHaveHttpServerDuration()
   *   .withMethod('POST')
   *   .withStatusCode(201)
   *   .assert()
   *   .toHaveHistogram()
   *   .withName('user.registration.duration')
   *   .withAttribute('validation.type', 'email')
   *   .assert()
   *   .toHaveHistogram()
   *   .withName('database.insert.duration')
   *   .withAttribute('table', 'users')
   *   .assert()
   *   .assertAll()
   * ```
   *
   * @example
   * With timeout considerations:
   * ```typescript
   * // For operations that may take time to emit metrics
   * const verifier = new MetricVerifier(collector, { timeout: 60000 })
   *
   * await verifier.metrics
   *   .toHaveHistogram()
   *   .withName('batch.processing.duration')
   *   .withCount(1000) // Wait for batch of 1000 items to complete
   *   .assert()
   *   .assertAll() // Will wait up to 60 seconds
   * ```
   */
  async assertAll(): Promise<void> {
    // Reactive approach: try assertions on each new data batch
    await this.collector.waitForAssertions((metrics) => {
      // Run all assertions - if any fail, this will throw
      this.assertions.forEach((assertion) => assertion.verify(metrics))
    }, this.options.timeout)
  }
}
