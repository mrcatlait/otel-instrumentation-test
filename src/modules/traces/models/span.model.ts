import { Attribute, Fixed64 } from '../../shared/models'
import { Event } from './event.model'
import { Link } from './link.model'
import { SpanKind } from '../enums'
import { SpanStatus } from './span-status.model'

export interface Span {
  traceId: string | Uint8Array
  spanId: string | Uint8Array
  traceState?: string | null
  parentSpanId?: string | Uint8Array
  name: string
  kind: SpanKind
  startTimeUnixNano: Fixed64
  endTimeUnixNano: Fixed64
  attributes: Attribute[]
  droppedAttributesCount: number
  events: Event[]
  droppedEventsCount: number
  links: Link[]
  droppedLinksCount: number
  status: SpanStatus
  resourceAttributes?: Attribute[]
}
