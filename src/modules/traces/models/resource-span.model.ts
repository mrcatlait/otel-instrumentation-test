import { Resource } from '../../shared/models'
import { ScopeSpans } from './scope-spans.model'

export interface ResourceSpans {
  resource?: Resource
  scopeSpans: ScopeSpans[]
  schemaUrl?: string
}
