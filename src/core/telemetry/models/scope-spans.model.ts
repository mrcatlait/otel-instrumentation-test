import { InstrumentationScope } from './instrumentation-scope.model'
import { Span } from './span.model'

export interface ScopeSpans {
  scope?: InstrumentationScope
  spans?: Span[]
  schemaUrl?: string | null
}
