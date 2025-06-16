import { Metric } from '../models'
import { AttributeValue } from '../../shared/models'

import { Builder } from 'src/modules/shared/assertions'

type AnyValue = string | number | boolean | string[]

export abstract class BaseMetricBuilder<Parent = void, Child = void> extends Builder<Metric, Parent, Child> {
  protected readonly model: Partial<Metric> = {}

  withName(name: string): this {
    this.model.name = name
    return this
  }

  withDescription(description: string): this {
    this.model.description = description
    return this
  }

  withUnit(unit: string): this {
    this.model.unit = unit
    return this
  }

  withResourceAttribute(key: string, value: AnyValue): this {
    if (!this.model.resourceAttributes) {
      this.model.resourceAttributes = []
    }

    this.model.resourceAttributes.push({ key, value: this.toAttributeValue(value) })
    return this
  }

  withResourceAttributes(attributes: Record<string, AnyValue>): this {
    Object.entries(attributes).forEach(([key, value]) => {
      this.withResourceAttribute(key, value)
    })

    return this
  }

  protected toAttributeValue(value: AnyValue): AttributeValue {
    if (typeof value === 'string') {
      return { stringValue: value }
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return { intValue: value }
      } else {
        return { doubleValue: value }
      }
    } else if (typeof value === 'boolean') {
      return { boolValue: value }
    } else if (Array.isArray(value)) {
      return { arrayValue: { values: value.map((v) => ({ stringValue: v })) } }
    } else {
      throw new Error(`Unsupported attribute value type: ${typeof value}`)
    }
  }
}
