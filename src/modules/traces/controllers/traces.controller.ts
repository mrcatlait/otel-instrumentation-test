import { Controller, Post, Body, Get } from '@nestjs/common'

import { SpanCollector } from '../collectors'
import { TraceExportDto, TraceExportResponseDto } from '../dtos'
import { Span } from '../models/span.model'

@Controller()
export class TracesController {
  constructor(private readonly collector: SpanCollector) {}

  @Post('v1/traces')
  handleTraces(@Body() data: TraceExportDto): TraceExportResponseDto {
    for (const resourceSpan of data.resourceSpans) {
      const resourceAttributes = resourceSpan.resource?.attributes || []
      for (const scopeSpan of resourceSpan.scopeSpans) {
        if (!scopeSpan.spans) {
          continue
        }

        const enrichedSpans: Span[] = scopeSpan.spans.map((span) => ({
          ...span,
          resourceAttributes,
        }))

        this.collector.collect(enrichedSpans)
      }
    }

    return {}
  }

  @Get('traces')
  getTraces(): Span[] {
    return this.collector.retrieve()
  }
}
