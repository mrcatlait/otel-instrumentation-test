import { SpanStatusCode } from '../enums'

export interface SpanStatus {
  code: SpanStatusCode
  message?: string
}
