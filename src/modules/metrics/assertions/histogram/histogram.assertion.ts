import { Histogram, HistogramDataPoint } from '../../models'
import { MetricVerifier } from '../../verifiers'
import { AnyValue, BaseMetricAssertion } from '../base-metric.assertion'
import { BaseMetricVerifier } from '../base-metric.verifier'
import { HistogramVerifier } from './histogram.verifier'

/**
 * Provides a fluent API for asserting the properties of OpenTelemetry histogram metrics.
 * This is used to verify that histogram metrics, which measure the distribution of values, are correctly emitted.
 *
 * @example
 * Testing HTTP server duration histogram:
 * ```typescript
 * metricVerifier
 *   .toHaveHistogram()
 *   .withName('http.server.duration')
 *   .withUnit('ms')
 *   .withAttribute('http.method', 'GET')
 *   .withAttribute('http.route', '/api/users')
 *   .withCount(100)
 *   .withSum(15000) // 100 requests taking total 15 seconds
 *   .withBucketCounts([10, 25, 50, 75, 100]) // Distribution across time buckets
 *   .assert()
 * ```
 *
 * @example
 * Testing database query duration:
 * ```typescript
 * metricVerifier
 *   .toHaveHistogram()
 *   .withName('db.query.duration')
 *   .withUnit('ms')
 *   .withAttribute('db.system', 'postgresql')
 *   .withAttribute('db.operation', 'SELECT')
 *   .withCount(50)
 *   .withMin(2)    // Fastest query: 2ms
 *   .withMax(250)  // Slowest query: 250ms
 *   .assert()
 * ```
 *
 * @example
 * Testing custom business metrics:
 * ```typescript
 * metricVerifier
 *   .toHaveHistogram()
 *   .withName('order.processing.duration')
 *   .withUnit('s')
 *   .withAttribute('order.type', 'express')
 *   .withAttribute('payment.method', 'credit_card')
 *   .withCount(25)
 *   .withSum(300) // 25 orders processed in total 5 minutes
 *   .withExplicitBounds([1, 5, 10, 30, 60]) // Bucket boundaries in seconds
 *   .assert()
 * ```
 */
export class HistogramAssertion extends BaseMetricAssertion {
  private readonly dataPoint: HistogramDataPoint = {}
  protected verifier = HistogramVerifier

  constructor(parent: MetricVerifier, assertions: BaseMetricVerifier[]) {
    super(parent, assertions)

    this.schema.histogram = {
      dataPoints: [this.dataPoint],
    } as Histogram
  }

  /**
   * Sets an expected attribute for the histogram data point.
   * Data point attributes provide additional details about the metric.
   *
   * @param key The attribute key.
   * @param value The expected attribute value.
   * @returns The `HistogramAssertion` instance for chaining.
   *
   * @example
   * HTTP request attributes:
   * ```typescript
   * assertion
   *   .withAttribute('http.method', 'GET')
   *   .withAttribute('http.status_code', 200)
   *   .withAttribute('http.route', '/api/users/:id')
   * ```
   *
   * @example
   * Database operation attributes:
   * ```typescript
   * assertion
   *   .withAttribute('db.system', 'postgresql')
   *   .withAttribute('db.operation', 'SELECT')
   *   .withAttribute('db.table', 'users')
   * ```
   *
   * @example
   * Custom business attributes:
   * ```typescript
   * assertion
   *   .withAttribute('order.priority', 'high')
   *   .withAttribute('customer.tier', 'premium')
   *   .withAttribute('region', 'us-east-1')
   * ```
   */
  withAttribute(key: string, value: string | number | boolean): this {
    if (!this.dataPoint.attributes) {
      this.dataPoint.attributes = []
    }

    this.dataPoint.attributes.push({ key, value: this.toAttributeValue(value) })
    return this
  }

  /**
   * Sets multiple expected attributes for the histogram data point.
   * This is a convenience for setting multiple attributes at once.
   *
   * @param attributes A record of attribute keys and their expected values.
   * @returns The `HistogramAssertion` instance for chaining.
   *
   * @example
   * HTTP request context:
   * ```typescript
   * assertion.withAttributes({
   *   'http.method': 'POST',
   *   'http.route': '/api/users',
   *   'http.status_code': 201,
   *   'user.authenticated': true
   * })
   * ```
   *
   * @example
   * Database operation context:
   * ```typescript
   * assertion.withAttributes({
   *   'db.system': 'mongodb',
   *   'db.collection': 'orders',
   *   'db.operation': 'aggregate',
   *   'query.complex': true
   * })
   * ```
   */
  withAttributes(attributes: Record<string, string | number | boolean>): this {
    for (const [key, value] of Object.entries(attributes)) {
      this.withAttribute(key, value)
    }

    return this
  }

  /**
   * Sets the expected start time for the histogram data point.
   * @throws {Error} Not yet implemented.
   * @todo Implement start time verification.
   */
  withStartTimeUnixNano(): this {
    throw new Error('Not implemented')
  }

  /**
   * Sets the expected timestamp for the histogram data point.
   * @throws {Error} Not yet implemented.
   * @todo Implement timestamp verification.
   */
  withTimeUnixNano(): this {
    throw new Error('Not implemented')
  }

  /**
   * Sets the expected count of observations for the histogram.
   * The count is the total number of measurements recorded.
   *
   * @param count The expected number of observations.
   * @returns The `HistogramAssertion` instance for chaining.
   *
   * @example
   * Verify specific number of requests:
   * ```typescript
   * assertion.withCount(150) // Expects exactly 150 HTTP requests were measured
   * ```
   *
   * @example
   * Batch processing verification:
   * ```typescript
   * assertion.withCount(1000) // Expects 1000 items were processed
   * ```
   */
  withCount(count: number): this {
    this.dataPoint.count = count

    return this
  }

  /**
   * Sets the expected sum of all observations for the histogram.
   *
   * @param sum The expected sum.
   * @returns The `HistogramAssertion` instance for chaining.
   *
   * @example
   * HTTP request duration totals:
   * ```typescript
   * assertion
   *   .withCount(100)
   *   .withSum(15000) // 100 requests taking total 15 seconds (150ms average)
   * ```
   *
   * @example
   * Data transfer verification:
   * ```typescript
   * assertion
   *   .withCount(50)
   *   .withSum(1048576) // 50 files totaling 1MB transferred
   * ```
   *
   * @example
   * Performance budget verification:
   * ```typescript
   * assertion
   *   .withCount(200)
   *   .withSum(10000) // 200 operations within 10 second budget
   * ```
   */
  withSum(sum: number): this {
    this.dataPoint.sum = sum

    return this
  }

  /**
   * Specifies the expected bucket counts for verification.
   *
   * Bucket counts represent the cumulative distribution of observations across
   * predefined ranges. Each element is the cumulative count of observations
   * that fall within that bucket's range.
   *
   * @param bucketCounts - Array of expected cumulative counts per bucket
   * @returns This assertion instance for method chaining
   *
   * @example
   * HTTP request duration distribution:
   * ```typescript
   * assertion
   *   .withExplicitBounds([100, 500, 1000, 5000]) // ms boundaries
   *   .withBucketCounts([50, 90, 98, 100])        // Cumulative counts
   * // Interpretation:
   * // - 50 requests under 100ms
   * // - 90 requests under 500ms (40 between 100-500ms)
   * // - 98 requests under 1000ms (8 between 500-1000ms)
   * // - 100 requests under 5000ms (2 between 1000-5000ms)
   * ```
   *
   * @example
   * Memory allocation size distribution:
   * ```typescript
   * assertion
   *   .withExplicitBounds([1024, 10240, 102400, 1048576]) // Bytes
   *   .withBucketCounts([25, 40, 45, 50])
   * // Shows distribution of memory allocations across size ranges
   * ```
   */
  withBucketCounts(bucketCounts: number[]): this {
    this.dataPoint.bucketCounts = bucketCounts

    return this
  }

  /**
   * Specifies the expected bucket boundaries for verification.
   *
   * Explicit bounds define the upper inclusive bounds for each bucket.
   * These boundaries determine how observations are distributed across buckets
   * for analysis and visualization.
   *
   * @param explicitBounds - Array of bucket upper bounds
   * @returns This assertion instance for method chaining
   *
   * @example
   * HTTP request duration buckets:
   * ```typescript
   * assertion.withExplicitBounds([0.1, 0.5, 1.0, 5.0]) // Duration buckets in seconds
   * // Creates buckets: ≤0.1s, ≤0.5s, ≤1.0s, ≤5.0s, >5.0s
   * ```
   *
   * @example
   * File size buckets:
   * ```typescript
   * assertion.withExplicitBounds([1024, 10240, 102400, 1048576]) // Size buckets in bytes
   * // Creates buckets: ≤1KB, ≤10KB, ≤100KB, ≤1MB, >1MB
   * ```
   *
   * @example
   * Custom latency buckets:
   * ```typescript
   * assertion.withExplicitBounds([10, 50, 100, 500, 1000]) // Latency in milliseconds
   * // Creates buckets for different SLA tiers
   * ```
   */
  withExplicitBounds(explicitBounds: number[]): this {
    this.dataPoint.explicitBounds = explicitBounds

    return this
  }

  /**
   * Specifies the expected flags for the histogram data point.
   *
   * Flags provide additional metadata about the histogram data point
   * according to OpenTelemetry specifications.
   *
   * @param flags - The expected flags value
   * @returns This assertion instance for method chaining
   *
   * @example
   * ```typescript
   * assertion.withFlags(0) // No special flags set
   * ```
   */
  withFlags(flags: number): this {
    this.dataPoint.flags = flags

    return this
  }

  /**
   * Specifies the expected minimum observed value for verification.
   *
   * The minimum value represents the smallest observation recorded in the histogram.
   * This is useful for performance testing and ensuring operations stay within
   * expected bounds.
   *
   * @param min - The expected minimum observed value
   * @returns This assertion instance for method chaining
   *
   * @example
   * HTTP request performance bounds:
   * ```typescript
   * assertion.withMin(0.05) // Fastest request should be at least 50ms
   * ```
   *
   * @example
   * Database query performance:
   * ```typescript
   * assertion.withMin(1) // Fastest query should be at least 1ms
   * ```
   *
   * @example
   * File size constraints:
   * ```typescript
   * assertion.withMin(1024) // Smallest file should be at least 1KB
   * ```
   */
  withMin(min: number): this {
    this.dataPoint.min = min

    return this
  }

  /**
   * Specifies the expected maximum observed value for verification.
   *
   * The maximum value represents the largest observation recorded in the histogram.
   * This is useful for performance testing and ensuring operations don't exceed
   * acceptable limits.
   *
   * @param max - The expected maximum observed value
   * @returns This assertion instance for method chaining
   *
   * @example
   * HTTP request timeout verification:
   * ```typescript
   * assertion.withMax(10.5) // Slowest request should not exceed 10.5 seconds
   * ```
   *
   * @example
   * Memory allocation limits:
   * ```typescript
   * assertion.withMax(1048576) // Largest allocation should not exceed 1MB
   * ```
   *
   * @example
   * SLA compliance verification:
   * ```typescript
   * assertion.withMax(5000) // All operations should complete within 5 seconds
   * ```
   */
  withMax(max: number): this {
    this.dataPoint.max = max

    return this
  }

  /**
   * Specifies expected exemplars for the histogram data point.
   *
   * Exemplars provide specific examples of trace data that contributed to the
   * histogram measurements, enabling correlation between metrics and traces.
   *
   * @throws {Error} Always throws as this feature is not yet implemented
   * @todo Implement exemplar verification for histogram data points
   */
  withExemplars(): this {
    throw new Error('Not implemented')
  }
}
