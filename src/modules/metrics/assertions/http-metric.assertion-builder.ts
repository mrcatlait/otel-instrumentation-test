import { HistogramBuilder } from './histogram/histogram.builder'

export class HttpMetricAssertionBuilder extends HistogramBuilder {
  protected readonly semanticAttributes: string[] = [
    'http.scheme',
    'http.method',
    'net.host.name',
    'http.flavor',
    'http.status_code',
    'net.host.port',
    'http.route',
  ]
}
