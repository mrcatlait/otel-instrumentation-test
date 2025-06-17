/**
 * Configuration options for the test collector.
 *
 * These options control how the mock OTLP collector behaves during testing,
 * including which port it listens on and how long to wait for assertions to pass.
 *
 * @example
 * ```typescript
 * const options: CollectorOptions = {
 *   port: 4317,        // Standard OTLP gRPC port
 *   timeout: 30000     // 30 second timeout for assertions
 * }
 *
 * const collector = new Collector(options)
 * ```
 */
export interface CollectorOptions {
  /**
   * The port for the mock OTLP collector to listen on.
   * This should match the port configured in your application's OTLP exporter.
   *
   * @default 4317
   *
   * @example
   * ```typescript
   * // Use standard gRPC port
   * { port: 4317 }
   *
   * // Use standard HTTP port
   * { port: 4318 }
   *
   * // Use custom port to avoid conflicts
   * { port: 5555 }
   * ```
   */
  port: number

  /**
   * The maximum time in milliseconds to wait for assertions to pass.
   * If assertions do not pass within this time, the test will fail.
   *
   * @default 30000
   *
   * @example
   * ```typescript
   * // Quick tests - 10 second timeout
   * { timeout: 10000 }
   *
   * // Integration tests - 60 second timeout
   * { timeout: 60000 }
   *
   * // Development/debugging - 5 minute timeout
   * { timeout: 300000 }
   * ```
   */
  timeout: number
}
