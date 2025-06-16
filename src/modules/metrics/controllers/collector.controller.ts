import { Controller, Post, Body, Get } from '@nestjs/common'

import { MetricExportDto, MetricExportResponseDto } from '../dtos'
import { MetricCollector } from '../collectors'
import { Metric } from '../models'

@Controller()
export class MetricsController {
  constructor(private readonly collector: MetricCollector) {}

  @Post('v1/metrics')
  handleMetrics(@Body() data: MetricExportDto): MetricExportResponseDto {
    for (const resourceMetric of data.resourceMetrics) {
      for (const scopeMetric of resourceMetric.scopeMetrics) {
        if (!scopeMetric.metrics) {
          continue
        }

        const enrichedMetrics: Metric[] = scopeMetric.metrics.map((metric) => ({
          ...metric,
          resourceAttributes: resourceMetric.resource?.attributes || [],
        }))

        this.collector.collect(enrichedMetrics)
      }
    }

    return {}
  }

  @Get('metrics')
  getMetrics(): Metric[] {
    return this.collector.retrieve()
  }
}
