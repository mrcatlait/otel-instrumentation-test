import { HistogramDataPointBuilder } from './histogram-data-point.builder'
import { BaseMetricBuilder } from '../base-metric.builder'
import { HistogramDataPoint } from '../../models'
import { HistogramVerifier } from './histogram.verifier'
import { MetricVerifier } from '../../verifiers'

export class HistogramBuilder extends BaseMetricBuilder<MetricVerifier, HistogramDataPoint> {
  protected verifierClass = HistogramVerifier

  toHaveDataPoint(): HistogramDataPointBuilder {
    return new HistogramDataPointBuilder(this, this.childAssertions)
  }
}
