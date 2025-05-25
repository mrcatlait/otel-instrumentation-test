import { HttpStatus } from '@nestjs/common'

import { CollectorServices, MockCollector } from '../core/telemetry/collector.server'

describe('HTTP Instrumentation', () => {
  let collector: MockCollector
  let collectorServices: CollectorServices

  beforeEach(async () => {
    collector = new MockCollector()
    collectorServices = await collector.start()
  })

  afterEach(async () => {
    await collector.stop()
  })

  it('should create a span for a request', async () => {
    const url = 'http://localhost:3000'
    const response = await fetch(url)
    const body = await response.text()
    expect(body).toEqual('Hello World!')

    await fetch(url + '/404')

    await collectorServices.spans.waitForUpdate()

    const spans = collectorServices.spans.retrieve()

    expect(spans).toContainHttpSpan({
      method: 'GET',
      path: '/',
      status: HttpStatus.OK,
    })

    expect(spans).toContainHttpSpan({
      name: 'GET /',
      method: 'GET',
      path: '/404',
      status: HttpStatus.NOT_FOUND,
    })
  })

  it('should create a span for a request with resource attributes', async () => {
    const url = 'http://localhost:3000'
    const response = await fetch(url)
    const body = await response.text()
    expect(body).toEqual('Hello World!')

    await fetch(url + '/404')

    await collectorServices.spans.waitForUpdate()

    const spans = collectorServices.spans.retrieve()

    expect(spans).toContainResourceAttribute({
      key: 'appname',
      value: {
        stringValue: 'nodejs-nestjs',
      },
    })
  })
})
