import { HttpStatus } from '@nestjs/common'

import { Verifiers, Collector } from '../modules/collector'

describe('HTTP Instrumentation', () => {
  let collector: Collector
  let verifiers: Verifiers

  beforeEach(async () => {
    collector = new Collector()
    verifiers = await collector.start()
  })

  afterEach(async () => {
    await collector.stop()
  })

  it('should create a span for a request', async () => {
    const url = 'http://localhost:3000/http'
    const response = await fetch(url)
    const body = await response.text()
    expect(body).toEqual('Hello World')

    /* eslint-disable prettier/prettier */
    await verifiers.spans
      .toHaveHttpSpan()
        .withMethod('GET')
        .withUrl('/http')
        .withHttpStatus(HttpStatus.OK)
        .assert()
      .assertAll()
    /* eslint-enable prettier/prettier */

    // await new Promise((resolve) => setTimeout(resolve, 70001))
  })
})
