import {
  ATTR_HTTP_FLAVOR,
  ATTR_HTTP_METHOD,
  ATTR_HTTP_SCHEME,
  ATTR_HTTP_STATUS_CODE,
  ATTR_NET_HOST_NAME,
  ATTR_NET_HOST_PORT,
} from '@opentelemetry/semantic-conventions/incubating'
import { ATTR_HTTP_ROUTE } from '@opentelemetry/semantic-conventions'

import { MetricVerifier } from '../../verifiers'
import { BaseMetricVerifier } from '../base-metric.verifier'
import { HistogramAssertion } from '../histogram'

/**
 * A specialized `HistogramAssertion` for verifying `http.server.duration` metrics.
 * It automatically sets the metric name and provides convenience methods for asserting common
 * HTTP server attributes, such as method, status code, and route.
 *
 * @example
 * ```typescript
 * metricVerifier
 *   .expectHttpServerDuration()
 *   .withMethod('GET')
 *   .withStatusCode(200)
 *   .withRoute('/api/users/:id')
 *   .withCount(50)
 *   .withSum(2500) // Total 2.5 seconds across 50 requests
 *   .assert()
 * ```
 */
export class HttpServerDurationAssertion extends HistogramAssertion {
  protected readonly semanticAttributes: string[] = [
    ATTR_HTTP_SCHEME,
    ATTR_HTTP_METHOD,
    ATTR_NET_HOST_NAME,
    ATTR_HTTP_FLAVOR,
    ATTR_HTTP_STATUS_CODE,
    ATTR_NET_HOST_PORT,
    ATTR_HTTP_ROUTE,
  ]

  constructor(parent: MetricVerifier, assertions: BaseMetricVerifier[]) {
    super(parent, assertions)

    this.schema.name = 'http.server.duration'
  }

  /**
   * Sets the expected HTTP method for the metric.
   * This is a convenience for `withAttribute('http.method', method)`.
   *
   * @param method The expected HTTP method (e.g., 'GET', 'POST').
   * @returns The `HttpServerDurationAssertion` instance for chaining.
   *
   * @example
   * ```typescript
   * assertion.withMethod('GET') // For GET requests
   * assertion.withMethod('POST') // For POST requests
   * ```
   */
  withMethod(method: string): this {
    this.withAttribute(ATTR_HTTP_METHOD, method)

    return this
  }

  /**
   * Sets the expected HTTP status code for the metric.
   * This is a convenience for `withAttribute('http.status_code', statusCode)`.
   *
   * @param statusCode The expected HTTP status code (e.g., 200, 404).
   * @returns The `HttpServerDurationAssertion` instance for chaining.
   *
   * @example
   * ```typescript
   * assertion.withStatusCode(200) // Successful requests
   * assertion.withStatusCode(404) // Not found requests
   * assertion.withStatusCode(500) // Server error requests
   * ```
   */
  withStatusCode(statusCode: number): this {
    this.withAttribute(ATTR_HTTP_STATUS_CODE, statusCode)

    return this
  }

  /**
   * Sets the expected HTTP route for the metric.
   * The route is the path template (e.g., `/users/:id`).
   *
   * @param route The expected HTTP route.
   * @returns The `HttpServerDurationAssertion` instance for chaining.
   *
   * @example
   * ```typescript
   * assertion.withRoute('/api/users/:id') // Parameterized route
   * assertion.withRoute('/health') // Static route
   * assertion.withRoute('/api/orders') // Collection endpoint
   * ```
   */
  withRoute(route: string): this {
    this.withAttribute(ATTR_HTTP_ROUTE, route)

    return this
  }
}
