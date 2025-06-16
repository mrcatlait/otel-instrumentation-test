import { HistogramDataPoint } from '../../models'
import { HistogramDataPointVerifier } from './histogram-data-point.verifier'
import { HistogramBuilder } from './histogram.builder'
import { Builder } from '../../../shared/assertions'

export class HistogramDataPointBuilder extends Builder<HistogramDataPoint, HistogramBuilder> {
  protected verifierClass = HistogramDataPointVerifier

  withAttributes(): this {
    throw new Error('Not implemented')
  }

  withStartTimeUnixNano(): this {
    throw new Error('Not implemented')
  }

  withTimeUnixNano(): this {
    throw new Error('Not implemented')
  }

  withCount(count: number): this {
    this.model.count = count

    return this
  }

  withSum(sum: number): this {
    this.model.sum = sum

    return this
  }

  withBucketCounts(bucketCounts: number[]): this {
    this.model.bucketCounts = bucketCounts

    return this
  }

  withExplicitBounds(explicitBounds: number[]): this {
    this.model.explicitBounds = explicitBounds

    return this
  }

  withFlags(flags: number): this {
    this.model.flags = flags

    return this
  }

  withMin(min: number): this {
    this.model.min = min

    return this
  }

  withMax(max: number): this {
    this.model.max = max

    return this
  }

  withExemplars(): this {
    throw new Error('Not implemented')
  }
}
