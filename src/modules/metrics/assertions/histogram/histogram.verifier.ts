import { HistogramDataPoint } from '../../models'
import { BaseMetricVerifier } from '../base-metric.verifier'
import { formatAttributeValue, hasAttribute } from '../../../shared/utils'

export class HistogramVerifier extends BaseMetricVerifier {
  matchesDataPoint(dataPoint: HistogramDataPoint): boolean {
    const schema = this.schema.histogram?.dataPoints[0]

    if (schema?.count && dataPoint.count !== schema.count) {
      return false
    }
    if (schema?.sum && dataPoint.sum !== schema.sum) {
      return false
    }
    if (schema?.bucketCounts && dataPoint.bucketCounts !== schema.bucketCounts) {
      return false
    }
    if (schema?.explicitBounds && dataPoint.explicitBounds !== schema.explicitBounds) {
      return false
    }
    if (schema?.flags && dataPoint.flags !== schema.flags) {
      return false
    }
    if (schema?.min && dataPoint.min !== schema.min) {
      return false
    }
    if (schema?.max && dataPoint.max !== schema.max) {
      return false
    }

    // If attributes missing but expected, return false
    if (schema?.attributes?.length && !dataPoint.attributes?.length) {
      return false
    }

    // Check attributes
    if (schema?.attributes) {
      for (const expectedAttr of schema.attributes) {
        if (!hasAttribute(dataPoint.attributes ?? [], expectedAttr)) return false
      }
    }

    // Check semantic attributes
    if (this.semanticAttributes.length > 0) {
      for (const expectedAttr of this.semanticAttributes) {
        const matches = dataPoint.attributes?.some((attr) => attr.key === expectedAttr)
        if (!matches) return false
      }
    }

    return true
  }

  getDataPointDescription(dataPoint: HistogramDataPoint): Record<string, unknown> {
    const parts: Record<string, unknown> = { ...dataPoint }

    if (dataPoint.attributes) {
      const attributesObj: Record<string, unknown> = {}
      dataPoint.attributes.forEach((attribute) => {
        attributesObj[attribute.key] = formatAttributeValue(attribute.value)
      })
      parts.attributes = attributesObj
    }
    if (this.semanticAttributes.length > 0) {
      parts.semanticAttributes = this.semanticAttributes.join(', ')
    }

    return parts
  }
}
