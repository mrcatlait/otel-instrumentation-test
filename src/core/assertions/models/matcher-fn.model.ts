interface SyncExpectationResult {
  pass: boolean
  message: () => string
  actual?: unknown
  expected?: unknown
}

type AsyncExpectationResult = Promise<SyncExpectationResult>
type ExpectationResult = SyncExpectationResult | AsyncExpectationResult

export type MatcherFn<Received> = (received: Received, ...expected: Array<unknown>) => ExpectationResult
