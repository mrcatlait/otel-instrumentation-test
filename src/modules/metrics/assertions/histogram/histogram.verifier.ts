import { Metric } from '../../models'
import { Verifier } from '../../../shared/assertions'

export class HistogramVerifier extends Verifier<Metric> {
  verify(metrics: Metric[]): void {
    const matchingMetrics = metrics.filter((metric) => this.matches(metric))

    try {
      assert.isAbove(
        matchingMetrics.length,
        0,
        `Expected at least one histogram metric, found ${matchingMetrics.length}`,
      )
    } catch (error) {
      if (error instanceof Error && this.originalStack) {
        error.stack = this.originalStack
      }
      throw error
    }
  }

  matches(metric: Metric): boolean {
    if (this.model.name && metric.name !== this.model.name) {
      return false
    }
    if (this.model.description && metric.description !== this.model.description) {
      return false
    }
    if (this.model.unit && metric.unit !== this.model.unit) {
      return false
    }
    if (this.model.resourceAttributes && metric.resourceAttributes !== this.model.resourceAttributes) {
      return false
    }
    return true
  }
}
