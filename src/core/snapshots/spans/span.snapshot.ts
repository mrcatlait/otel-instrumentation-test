import { Span } from 'src/core/telemetry/models/span.model'

export const spanSnapshot: Partial<Span> = {
  name: expect.any(String),
  kind: expect.any(Number),
  spanId: expect.stringMatching(/^[0-9a-fA-F]+$/),
  traceId: expect.stringMatching(/^[0-9a-fA-F]+$/),
  droppedAttributesCount: expect.any(Number),
  droppedEventsCount: expect.any(Number),
  droppedLinksCount: expect.any(Number),
  status: expect.objectContaining({
    code: expect.any(Number),
  }),
  events: expect.any(Array),
  links: expect.any(Array),
  startTimeUnixNano: expect.stringMatching(/^[0-9]+$/),
  endTimeUnixNano: expect.stringMatching(/^[0-9]+$/),
  attributes: expect.arrayContaining([
    {
      key: expect.any(String),
      value: expect.any(Object),
    },
  ]),
  resourceAttributes: expect.arrayContaining([
    {
      key: expect.any(String),
      value: expect.any(Object),
    },
  ]),
}
