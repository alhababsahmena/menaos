/**
 * Per-process knobs for the mock transport.
 *
 * Defaults are tuned for deterministic tests: zero latency, zero simulated
 * errors. The dev demo flips these via `configureMock()` to make the UI feel
 * realistic and to exercise the loading / error states without a real
 * backend.
 */

export interface MockConfig {
  /** Lower bound (ms) on per-request latency. */
  latencyMinMs: number
  /** Upper bound (ms) on per-request latency. */
  latencyMaxMs: number
  /**
   * Probability (0..1) that a request fails with a transient network error
   * before the handler runs. Zero by default so tests are deterministic.
   */
  errorRate: number
}

const defaults: MockConfig = {
  latencyMinMs: 0,
  latencyMaxMs: 0,
  errorRate: 0,
}

let current: MockConfig = { ...defaults }

export function configureMock(partial: Partial<MockConfig>): void {
  current = { ...current, ...partial }
}

export function resetMockConfig(): void {
  current = { ...defaults }
}

export function getMockConfig(): MockConfig {
  return current
}
