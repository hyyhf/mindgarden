/** Package-owned invariant companion. @module @deepseek-ai/dsh-mind-garden-reflection/invariant */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden-reflection'

/** Cordis companion plugin name. */
export const name = 'mind-garden-reflection-invariant'
/** Services required before the companion can reserve package ownership. */
export const inject = ['invariants']

/** Strict decoding and conversion recovery own the package's complete persisted relationships. */
const install: InvariantInstaller = Object.assign(() => {
  // No runtime invariant: authenticated reads validate and settle every persisted relationship before use.
}, { inject: ['mindGardenReflection'] })

/** Register the package's invariant ownership. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
