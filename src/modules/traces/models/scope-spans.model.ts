import { InstrumentationScope } from '../../shared/models'
import { Span } from './span.model'

export interface ScopeSpans {
  scope?: InstrumentationScope
  spans?: Span[]
  schemaUrl?: string | null
}
