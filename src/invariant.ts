/** Package-owned invariant companion for the Mind Garden bundle. @module @deepseek-ai/dsh-mind-garden/invariant */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden'

/** Cordis companion plugin name. */
export const name = 'mind-garden-bundle-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

// No runtime invariant: static bundle rows delegate mutable contracts to their owning packages.
const install: InvariantInstaller = () => {}

/** Register the bundle's invariant seat. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
