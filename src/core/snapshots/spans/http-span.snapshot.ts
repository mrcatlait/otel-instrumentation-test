import { SpanKind } from '@opentelemetry/api'

import { spanSnapshot } from './span.snapshot'

import { ATTR_HTTP_METHOD, ATTR_HTTP_STATUS_CODE } from 'src/core/constants/attributes'
import { Span } from 'src/core/telemetry/models/span.model'

export const httpSpanSnapshot: Partial<Span> = {
  ...spanSnapshot,
  kind: SpanKind.CLIENT,
  attributes: expect.arrayContaining([
    {
      key: ATTR_HTTP_METHOD,
      value: {
        stringValue: expect.stringMatching(/(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)/),
      },
    },
    {
      key: ATTR_HTTP_STATUS_CODE,
      value: {
        intValue: expect.any(Number),
      },
    },
  ]),
}
