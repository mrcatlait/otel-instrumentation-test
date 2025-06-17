import {
  ATTR_HTTP_METHOD,
  ATTR_HTTP_STATUS_CODE,
  ATTR_HTTP_TARGET,
} from '@opentelemetry/semantic-conventions/incubating'

import { SpanAssertion } from './span.assertion'

/**
 * A specialized `SpanAssertion` for verifying HTTP spans.
 * It provides convenience methods for asserting common HTTP attributes, such as method, status code, and URL,
 * and automatically includes them in the verification process.
 *
 * @example
 * Basic HTTP GET request verification:
 * ```typescript
 * spanVerifier
 *   .toHaveHttpSpan()
 *   .withName('GET /api/users')
 *   .withMethod('GET')
 *   .withHttpStatus(200)
 *   .withUrl('/api/users')
 *   .assert()
 * ```
 *
 * @example
 * HTTP POST request with detailed attributes:
 * ```typescript
 * spanVerifier
 *   .toHaveHttpSpan()
 *   .withName('POST /api/orders')
 *   .withMethod('POST')
 *   .withHttpStatus(201)
 *   .withUrl('/api/orders')
 *   .withAttribute('http.request_content_length', 256)
 *   .withAttribute('http.response_content_length', 128)
 *   .withResourceAttribute('service.name', 'order-service')
 *   .assert()
 * ```
 *
 * @example
 * Testing error scenarios:
 * ```typescript
 * spanVerifier
 *   .toHaveHttpSpan()
 *   .withName('GET /api/users/invalid')
 *   .withMethod('GET')
 *   .withHttpStatus(404)
 *   .withUrl('/api/users/invalid')
 *   .withStatus({
 *     code: SpanStatusCode.ERROR,
 *     message: 'Not Found'
 *   })
 *   .assert()
 * ```
 *
 * @example
 * Testing different HTTP methods:
 * ```typescript
 * // Test multiple HTTP operations in sequence
 * await spanVerifier
 *   .toHaveHttpSpan()
 *   .withMethod('POST')
 *   .withHttpStatus(201)
 *   .withUrl('/api/users')
 *   .assert()
 *   .toHaveHttpSpan()
 *   .withMethod('GET')
 *   .withHttpStatus(200)
 *   .withUrl('/api/users/123')
 *   .assert()
 *   .toHaveHttpSpan()
 *   .withMethod('PUT')
 *   .withHttpStatus(200)
 *   .withUrl('/api/users/123')
 *   .assert()
 *   .assertAll()
 * ```
 */
export class HttpSpanAssertion extends SpanAssertion {
  protected readonly semanticAttributes: string[] = [ATTR_HTTP_METHOD, ATTR_HTTP_STATUS_CODE, ATTR_HTTP_TARGET]

  /**
   * Sets the expected HTTP method for the span.
   * This is a convenience for `withAttribute('http.method', method)`.
   */
  withMethod(method: string): this {
    return this.withAttribute(ATTR_HTTP_METHOD, method)
  }

  /**
   * Sets the expected HTTP status code for the span.
   * This is a convenience for `withAttribute('http.status_code', statusCode)`.
   */
  withHttpStatus(statusCode: number): this {
    return this.withAttribute(ATTR_HTTP_STATUS_CODE, statusCode)
  }

  /**
   * Sets the expected HTTP URL for the span.
   * The URL should typically include the path and query parameters.
   * This is a convenience for `withAttribute('http.target', url)`.
   */
  withUrl(url: string): this {
    return this.withAttribute(ATTR_HTTP_TARGET, url)
  }
}
