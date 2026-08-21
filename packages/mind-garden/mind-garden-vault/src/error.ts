/** Stable failures from the Mind Garden encrypted-record boundary. */
export type MindGardenVaultErrorCode =
  | 'authentication-failed'
  | 'corrupt-record'
  | 'corrupt-state'
  | 'invalid-key'
  | 'invalid-record-id'
  | 'invalid-value'
  | 'key-mismatch'
  | 'locked'
  | 'record-too-large'
  | 'rotation-unavailable'

/** Error carrying a machine-readable code without including secret material. */
export class MindGardenVaultError extends Error {
  /**
   * @param code - Stable failure category.
   * @param message - Human-readable diagnostic safe to log.
   * @param options - Optional causal error.
   */
  constructor(readonly code: MindGardenVaultErrorCode, message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'MindGardenVaultError'
  }
}
