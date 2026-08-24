/** Standalone package bridge discovered by the Harness Loader. */

export const name = 'mind-garden-standalone'

/**
 * Keep the root row lifecycle-visible so Harness can discover this package's
 * conventional `./typert` and `./client` faces. Business services remain in
 * their existing subpath rows.
 */
export function apply() {}
