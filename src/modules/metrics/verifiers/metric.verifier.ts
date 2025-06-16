import { Injectable } from '@nestjs/common'

import { MetricCollector } from '../collectors'
import { HttpMetricAssertionBuilder } from '../assertions/http-metric.assertion-builder'
import { Metric } from '../models'

import { Verifier } from 'src/modules/shared/assertions'

@Injectable()
export class MetricVerifier {
  private readonly assertions: Verifier<Metric, MetricVerifier>[] = []

  constructor(private readonly collector: MetricCollector) {}

  toHaveServerRequestDuration(): HttpMetricAssertionBuilder {
    return new HttpMetricAssertionBuilder(this, this.assertions)
  }

  async assertAll(): Promise<void> {
    await this.collector.waitForUpdate()
    const metrics = this.collector.retrieve()

    this.assertions.forEach((assertion) => assertion.verify(metrics))
  }
}
