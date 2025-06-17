import * as assert from 'assert'

import { HistogramDataPoint, Metric, NumberDataPoint, SummaryDataPoint } from '../models'
import { formatAttributeValue, hasAttribute } from '../../shared/utils'

type DataPoint = NumberDataPoint | HistogramDataPoint | SummaryDataPoint

export abstract class BaseMetricVerifier {
  constructor(
    protected readonly schema: Partial<Metric>,
    protected readonly semanticAttributes: string[],
    protected readonly originalStack: string,
  ) {}

  verify(metrics: Metric[]): void {
    const matchingMetrics = metrics.filter((metric) => this.matches(metric))

    try {
      assert.ok(matchingMetrics.length > 0, `Expected at least one metric matching "${this.getDescription()}"`)
    } catch (error) {
      if (error instanceof Error && this.originalStack) {
        error.stack = this.originalStack
      }

      throw error
    }
  }

  private matches(metric: Metric): boolean {
    if (this.schema.name && metric.name !== this.schema.name) {
      return false
    }
    if (this.schema.description && metric.description !== this.schema.description) {
      return false
    }
    if (this.schema.unit && metric.unit !== this.schema.unit) {
      return false
    }
    if (this.schema.resourceAttributes && metric.resourceAttributes !== this.schema.resourceAttributes) {
      return false
    }

    if (this.schema.gauge && !metric.gauge) {
      return false
    } else if (this.schema.gauge && metric.gauge) {
      return metric.gauge.dataPoints.some((dataPoint) => this.matchesDataPoint(dataPoint))
    }

    if (this.schema.histogram && !metric.histogram) {
      return false
    } else if (this.schema.histogram && metric.histogram) {
      return metric.histogram.dataPoints.some((dataPoint) => this.matchesDataPoint(dataPoint))
    }

    if (this.schema.sum && !metric.sum) {
      return false
    } else if (this.schema.sum && metric.sum) {
      return metric.sum.dataPoints.some((dataPoint) => this.matchesDataPoint(dataPoint))
    }

    if (this.schema.summary && !metric.summary) {
      return false
    } else if (this.schema.summary && metric.summary) {
      return metric.summary.dataPoints.some((dataPoint) => this.matchesDataPoint(dataPoint))
    }

    // Check resource attributes
    if (this.schema.resourceAttributes) {
      for (const expectedAttr of this.schema.resourceAttributes) {
        if (!hasAttribute(metric.resourceAttributes ?? [], expectedAttr)) return false
      }
    }

    return true
  }

  abstract matchesDataPoint(dataPoint: DataPoint): boolean

  private getDescription(): string {
    const parts: Record<string, unknown> = {}

    if (this.schema.name) parts.name = this.schema.name
    if (this.schema.description) parts.description = this.schema.description
    if (this.schema.unit) parts.unit = this.schema.unit

    if (this.schema.gauge) {
      parts.type = 'gauge'
      parts.dataPoint = this.getDataPointDescription(this.schema.gauge.dataPoints[0])
    }

    if (this.schema.histogram) {
      parts.type = 'histogram'
      parts.dataPoint = this.getDataPointDescription(this.schema.histogram.dataPoints[0])
    }

    if (this.schema.sum) {
      parts.type = 'sum'
      parts.dataPoint = this.getDataPointDescription(this.schema.sum.dataPoints[0])
    }

    if (this.schema.summary) {
      parts.type = 'summary'
      parts.dataPoint = this.getDataPointDescription(this.schema.summary.dataPoints[0])
    }

    if (this.schema.resourceAttributes && this.schema.resourceAttributes.length > 0) {
      const attributesObj: Record<string, unknown> = {}
      this.schema.resourceAttributes.forEach((attribute) => {
        attributesObj[attribute.key] = formatAttributeValue(attribute.value)
      })
      parts.resourceAttributes = attributesObj
    }

    return JSON.stringify(parts, null, 2)
  }

  abstract getDataPointDescription(dataPoint: DataPoint): Record<string, unknown>
}
