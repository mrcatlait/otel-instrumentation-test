/* eslint-disable @typescript-eslint/no-empty-object-type */
import 'vitest'

import { HttpSpan, toContainHttpSpan, toContainResourceAttribute } from '../core/assertions/span.assertions'

import { Attribute } from 'src/core/telemetry/models/attribute.model'

expect.extend({ toContainHttpSpan, toContainResourceAttribute })

interface CustomMatchers {
  toContainHttpSpan: (expectedSpan: HttpSpan) => void
  toContainResourceAttribute: (expectedAttribute: Attribute) => void
}

declare module 'vitest' {
  interface Assertion extends CustomMatchers {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
