import { HistogramDataPoint } from '../../models'
import { Verifier } from '../../../shared/assertions'
import { hasAttribute } from '../../../shared/utils'
import { HistogramBuilder } from './histogram.builder'

export class HistogramDataPointVerifier extends Verifier<HistogramDataPoint, HistogramBuilder> {
  verify(histogramDataPoints: HistogramDataPoint[]): void {
    const matchingSpans = histogramDataPoints.filter((span) => this.matches(span))

    try {
      assert.isAbove(
        matchingSpans.length,
        0,
        `Expected at least one histogram data point matching "", found ${matchingSpans.length}`,
      )
    } catch (error) {
      if (error instanceof Error && this.originalStack) {
        error.stack = this.originalStack
      }
      throw error
    }
  }

  matches(histogramDataPoint: HistogramDataPoint): boolean {
    if (this.model.count && histogramDataPoint.count !== this.model.count) {
      return false
    }
    if (this.model.sum && histogramDataPoint.sum !== this.model.sum) {
      return false
    }
    if (this.model.bucketCounts && histogramDataPoint.bucketCounts !== this.model.bucketCounts) {
      return false
    }
    if (this.model.explicitBounds && histogramDataPoint.explicitBounds !== this.model.explicitBounds) {
      return false
    }
    if (this.model.flags && histogramDataPoint.flags !== this.model.flags) {
      return false
    }
    if (this.model.min && histogramDataPoint.min !== this.model.min) {
      return false
    }
    if (this.model.max && histogramDataPoint.max !== this.model.max) {
      return false
    }

    // If attributes missing but expected, return false
    if (this.model.attributes?.length && !histogramDataPoint.attributes?.length) {
      return false
    }

    // Check attributes
    if (this.model.attributes) {
      for (const expectedAttr of this.model.attributes) {
        if (!hasAttribute(histogramDataPoint.attributes ?? [], expectedAttr)) return false
      }
    }

    return true
  }
}
