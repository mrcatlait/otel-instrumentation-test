import { AssertionError } from 'assert'
import { Subject } from 'rxjs'

/**
 * Provides a base for collecting OpenTelemetry telemetry data (spans, metrics, etc.) for testing purposes.
 * It buffers telemetry data and allows for reactive assertions that are evaluated as data arrives,
 * eliminating the need for fixed-time waits.
 *
 * @template T The type of telemetry data being collected (e.g., Span, Metric).
 *
 * @example
 * ```typescript
 * class SpanCollector extends AbstractTelemetryCollector<Span> {
 *   // Implementation specific to span collection
 * }
 *
 * const collector = new SpanCollector()
 * collector.collect([span1, span2])
 *
 * // Wait for assertions to pass
 * await collector.waitForAssertions((spans) => {
 *   assert(spans.length > 0, 'Expected at least one span')
 * }, 30000)
 * ```
 */
export abstract class AbstractTelemetryCollector<T> {
  /** Notifies subscribers when new telemetry data is collected. */
  private readonly updateSubject = new Subject<void>()

  /** A buffer of the collected telemetry data. */
  private telemetryData: T[] = []

  /**
   * Adds telemetry data to the collector's buffer and notifies any active assertions.
   *
   * @param data An array of telemetry data items to add.
   *
   * @example
   * ```typescript
   * // Called when OTLP data is received
   * collector.collect([newSpan1, newSpan2])
   * ```
   */
  collect(data: T[]): void {
    this.telemetryData.push(...data)
    this.updateSubject.next()
  }

  /**
   * Retrieves all telemetry data currently in the buffer.
   *
   * @returns An array of all collected telemetry data items.
   *
   * @example
   * ```typescript
   * const allSpans = collector.retrieve()
   * console.log(`Collected ${allSpans.length} spans`)
   * ```
   */
  retrieve(): T[] {
    return this.telemetryData
  }

  /**
   * Clears all telemetry data from the buffer. This is useful for resetting state between tests.
   *
   * @example
   * ```typescript
   * beforeEach(() => {
   *   collector.clear() // Start each test with clean state
   * })
   * ```
   */
  clear(): void {
    this.telemetryData = []
  }

  /**
   * Waits for a set of assertions to pass.
   *
   * This method repeatedly runs the assertion function against the collected telemetry data
   * until it succeeds or a timeout is reached. It checks immediately and then subscribes
   * to new data, re-running assertions as more data arrives.
   *
   * @param assertionFn A function that throws an `AssertionError` if the collected data does not meet expectations.
   * @param timeoutMs The maximum time to wait for the assertions to pass, in milliseconds.
   * @returns A `Promise` that resolves with the collected data when the assertions pass.
   * @throws {AssertionError} If the assertions do not pass within the specified timeout.
   * @throws {Error} If a timeout occurs before any assertion attempts.
   *
   * @example
   * ```typescript
   * // Wait for at least 3 HTTP spans
   * await collector.waitForAssertions((spans) => {
   *   const httpSpans = spans.filter(s => s.name.includes('HTTP'))
   *   assert(httpSpans.length >= 3, `Expected 3+ HTTP spans, got ${httpSpans.length}`)
   * }, 30000)
   *
   * // Wait for specific span attributes
   * await collector.waitForAssertions((spans) => {
   *   const span = spans.find(s => s.name === 'my-operation')
   *   assert(span, 'Expected span with name "my-operation"')
   *   assert(span.attributes['http.status_code'] === 200, 'Expected status 200')
   * }, 15000)
   * ```
   */
  async waitForAssertions(assertionFn: (data: T[]) => void, timeoutMs: number): Promise<T[]> {
    let failedAssertion: AssertionError | null = null

    // Try assertions with current data first
    try {
      assertionFn(this.telemetryData)
      return this.telemetryData
    } catch (error) {
      if (error instanceof AssertionError) {
        failedAssertion = error
      }
      // Current data doesn't satisfy assertions, wait for more
    }

    return new Promise((resolve, reject) => {
      const subscription = this.updateSubject.subscribe(() => {
        // Try assertions with new data
        try {
          assertionFn(this.telemetryData)
          failedAssertion = null
          subscription.unsubscribe()
          resolve(this.telemetryData)
        } catch (error) {
          if (error instanceof AssertionError) {
            failedAssertion = error
          }
          // Assertions still fail, wait for next batch
          // (subscription continues)
        }
      })

      // Set up timeout fallback
      setTimeout(() => {
        subscription.unsubscribe()
        if (failedAssertion) {
          reject(failedAssertion)
        } else {
          reject(new Error(`Assertion timeout after ${timeoutMs}ms. Current data count: ${this.telemetryData.length}`))
        }
      }, timeoutMs)
    })
  }
}
