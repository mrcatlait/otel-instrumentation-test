/**
 * @fileoverview OpenTelemetry Instrumentation Testing Framework
 *
 * This module provides the main exports for testing OpenTelemetry instrumentation
 * in your applications. It includes a mock OTLP collector and fluent assertion APIs
 * for verifying that telemetry data is being emitted correctly.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { Collector } from 'otel-instrumentation-test'
 *
 * describe('My App Instrumentation', () => {
 *   let collector: Collector
 *   let verifiers: Verifiers
 *
 *   beforeEach(async () => {
 *     collector = new Collector()
 *     verifiers = await collector.start()
 *   })
 *
 *   afterEach(async () => {
 *     await collector.stop()
 *   })
 *
 *   it('should trace HTTP requests', async () => {
 *     // Make request to your instrumented app
 *     await fetch('http://localhost:3000/api/users')
 *
 *     // Assert telemetry was captured
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
 * ## Framework Architecture
 *
 * The framework consists of several key components:
 *
 * - **Collector**: Mock OTLP server that receives telemetry data
 * - **Verifiers**: Provide fluent APIs for writing assertions
 * - **Assertions**: Define expected characteristics of telemetry data
 * - **Reactive Testing**: Automatically waits for asynchronous telemetry data
 *
 * @author OpenTelemetry Instrumentation Test Framework Team
 * @version 0.0.1
 * @license MIT
 */

export * from './modules/collector'
export * from './modules/shared/models/collector-options.model'
