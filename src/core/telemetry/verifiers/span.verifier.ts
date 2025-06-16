import { Injectable } from '@nestjs/common'

import { SpanCollector } from '../collectors'
import { HttpSpanAssertionBuilder, SpanAssertionBuilder, SpanAssertionVerifier } from '../assertions/spans'

@Injectable()
export class SpanVerifier {
  private readonly assertions: SpanAssertionVerifier[] = []

  constructor(private readonly collector: SpanCollector) {}

  toHaveHttpSpan(): HttpSpanAssertionBuilder {
    return this.toHaveHttpSpanWithCount(1)
  }

  toHaveHttpSpanWithCount(count: number): HttpSpanAssertionBuilder {
    return new HttpSpanAssertionBuilder(this, this.assertions, count)
  }

  toHaveSpan(): SpanAssertionBuilder {
    return this.toHaveSpanWithCount(1)
  }

  toHaveSpanWithCount(count: number): SpanAssertionBuilder {
    return new SpanAssertionBuilder(this, this.assertions, count)
  }

  async assertAll(): Promise<void> {
    await this.collector.waitForUpdate()
    const spans = this.collector.retrieve()
    this.assertions.forEach((assertion) => assertion.verify(spans))
  }
}
