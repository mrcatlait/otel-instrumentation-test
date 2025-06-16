import { SpanAssertionBuilder } from './span.assertion-builder'

export class HttpSpanAssertionBuilder extends SpanAssertionBuilder {
  protected semanticAttributes = ['http.method', 'http.status_code', 'http.target']

  withMethod(method: string) {
    return this.withAttribute('http.method', method)
  }

  withHttpStatus(status: number) {
    return this.withAttribute('http.status_code', status)
  }

  withUrl(url: string) {
    return this.withAttribute('http.target', url)
  }
}
