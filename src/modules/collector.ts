import { NestFactory } from '@nestjs/core'
import { INestApplication } from '@nestjs/common'

import { CollectorModule } from './collector.module'
import { SpanVerifier } from './traces/verifiers'
import { MetricVerifier } from './metrics/verifiers'
import { CollectorOptions } from './shared/models'

/**
 * Provides access to telemetry verifiers for spans and metrics.
 * These verifiers are used to write assertions against the telemetry data collected during tests.
 *
 * @example
 * ```typescript
 * const verifiers = await collector.start()
 *
 * // Test spans
 * await verifiers.spans
 *   .toHaveSpan()
 *   .withName('HTTP GET')
 *   .assert()
 *   .assertAll()
 *
 * // Test metrics
 * await verifiers.metrics
 *   .toHaveHistogram()
 *   .withName('http.server.duration')
 *   .assert()
 *   .assertAll()
 * ```
 */
export interface Verifiers {
  /**
   *  Verifier for tracing data.
   * @see {@link SpanVerifier}
   */
  spans: SpanVerifier

  /**
   * Verifier for metrics data.
   * @see {@link MetricVerifier}
   */
  metrics: MetricVerifier
}

/**
 * The main entry point for the testing framework.
 * It starts a mock OTLP collector to receive telemetry from an instrumented application,
 * enabling you to write assertions against the captured spans and metrics.
 *
 * @example
 * Basic usage in a test:
 * ```typescript
 * describe('My Application', () => {
 *   let collector: Collector
 *   let verifiers: Verifiers
 *
 *   beforeEach(async () => {
 *     collector = new Collector({ port: 4317, timeout: 30000 })
 *     verifiers = await collector.start()
 *   })
 *
 *   afterEach(async () => {
 *     await collector.stop()
 *   })
 *
 *   it('should create spans for HTTP requests', async () => {
 *     // Make HTTP request to your instrumented app
 *     await fetch('http://localhost:3000/api/users')
 *
 *     // Assert that the expected span was created
 *     await verifiers.spans
 *       .toHaveHttpSpan()
 *       .withMethod('GET')
 *       .withUrl('/api/users')
 *       .withHttpStatus(200)
 *       .assert()
 *       .assertAll()
 *   })
 * })
 * ```
 *
 * @example
 * With custom configuration:
 * ```typescript
 * const collector = new Collector({
 *   port: 4318,        // Custom port
 *   timeout: 60000     // 60 second timeout for assertions
 * })
 * ```
 */
export class Collector {
  private readonly options: CollectorOptions
  private app?: INestApplication

  /**
   * Creates a new collector instance.
   *
   * @param options Configuration for the collector.
   * @param options.port The port for the OTLP collector server. Default: `4317`.
   * @param options.timeout The timeout for assertions in milliseconds. Default: `30000`.
   *
   * @example
   * ```typescript
   * // Use default configuration
   * const collector = new Collector()
   *
   * // Custom configuration
   * const collector = new Collector({
   *   port: 4318,
   *   timeout: 60000
   * })
   * ```
   */
  constructor(options?: Partial<CollectorOptions>) {
    const defaultOptions: CollectorOptions = { port: 4317, timeout: 30000 }
    this.options = { ...defaultOptions, ...options }
  }

  /**
   * Starts the mock OTLP collector server. This must be called before any telemetry
   * data can be received and verified.
   *
   * @returns A `Promise` that resolves with the `Verifiers` for spans and metrics.
   * @throws Error if the collector fails to start or the port is already in use.
   *
   * @example
   * ```typescript
   * const collector = new Collector()
   * const verifiers = await collector.start()
   *
   * // Now you can use verifiers to test telemetry data
   * await verifiers.spans.toHaveSpan().withName('my-operation').assert().assertAll()
   * ```
   */
  async start(): Promise<Verifiers> {
    this.app = await NestFactory.create(CollectorModule.forRoot(this.options))
    await this.app.listen(this.options.port)
    console.log(`Mock collector started on port ${this.options.port}`)

    return { spans: this.app.get(SpanVerifier), metrics: this.app.get(MetricVerifier) }
  }

  /**
   * Stops the collector server and cleans up resources.
   * It's important to call this after tests are complete to ensure a clean shutdown.
   *
   * @returns A `Promise` that resolves when the collector is fully stopped.
   *
   * @example
   * ```typescript
   * afterEach(async () => {
   *   await collector.stop()
   * })
   * ```
   */
  async stop(): Promise<void> {
    if (this.app) {
      await this.app.close()
    }
  }
}
