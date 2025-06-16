import { Controller, Post, Body, Get } from '@nestjs/common'
// import { ResourceMetrics } from '@opentelemetry/sdk-metrics'
// import { ResourceLogs, LogRecord } from '@opentelemetry/sdk-logs'

import { SpanCollector, MetricCollector, LogCollector } from '../collectors'
import { TraceExportDto, TraceExportResponseDto } from '../dtos'
import { Span } from '../models/span.model'

@Controller()
export class CollectorController {
  constructor(
    private readonly spanCollector: SpanCollector,
    private readonly metricCollector: MetricCollector,
    private readonly logCollector: LogCollector,
  ) {}

  @Post('v1/traces')
  handleTraces(@Body() data: TraceExportDto): TraceExportResponseDto {
    for (const resourceSpan of data.resourceSpans) {
      const resourceAttributes = resourceSpan.resource?.attributes || []
      for (const scopeSpan of resourceSpan.scopeSpans) {
        if (!scopeSpan.spans) {
          continue
        }

        const enrichedSpans = scopeSpan.spans.map((span) => ({
          ...span,
          resourceAttributes,
        }))

        this.spanCollector.collect(enrichedSpans)
      }
    }

    return {}
  }

  @Get('traces')
  getTraces(): Span[] {
    return this.spanCollector.retrieve()
  }

  @Post('v1/metrics')
  handleMetrics(@Body() data: any): TraceExportResponseDto {
    // { resourceMetrics: [ { resource: [Object], scopeMetrics: [Array] } ] }
    console.log(JSON.stringify(data))

    return {}
    // for (const resourceMetric of data) {
    //   for (const scopeMetric of resourceMetric.scopeMetrics) {
    //     if (!scopeMetric.metrics) {
    //       continue
    //     }
    //     this.metricCollector.collect(scopeMetric.metrics)
    //   }
    // }
  }

  // @Get('metrics')
  // getMetrics(): Promise<any[]> {
  //   return this.metricCollector.retrieve()
  // }

  // @Post('v1/logs')
  // handleLogs(@Body() data: ResourceLogs[]): void {
  //   for (const resourceLog of data) {
  //     for (const scopeLog of resourceLog.scopeLogs) {
  //       if (!scopeLog.logRecords) {
  //         continue
  //       }
  //       this.logCollector.collect(scopeLog.logRecords)
  //     }
  //   }
  // }

  // @Get('logs')
  // getLogs(): Promise<LogRecord[]> {
  //   return this.logCollector.retrieve()
  // }
}
