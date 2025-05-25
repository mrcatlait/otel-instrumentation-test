import { Resource } from './resource.model'
import { ScopeSpans } from './scope-spans.model'

export interface ResourceSpans {
  resource?: Resource
  scopeSpans: ScopeSpans[]
  schemaUrl?: string
}
