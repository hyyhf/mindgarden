/** Local failure boundary for presentation callbacks supplied by the Host adapter. */

import type { MindGardenDataResult } from './slots.ts'

/**
 * Convert an unexpected rejected callback into the same settled result shape
 * that ordinary Remote failures use, so loading and pending UI can always recover.
 * @param operation - Host-backed action to invoke once.
 * @returns The action result, or an unavailable result when the action rejects.
 */
export async function settleMindGardenAction<T>(
  operation: () => Promise<MindGardenDataResult<T>>,
): Promise<MindGardenDataResult<T>> {
  try {
    return await operation()
  } catch {
    return { ok: false, code: 'unavailable' }
  }
}
