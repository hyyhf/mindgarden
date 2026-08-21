/** Package-owned invariant companion for the Mind Garden UI. @module @deepseek-ai/dsh-client-ui-mind-garden/invariant */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-mind-garden'

/** Cordis companion plugin name. */
export const name = 'client-ui-mind-garden-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

// No runtime invariant: the surface owns one effect-scoped slot entry and no mutable cross-plugin state.
const install: InvariantInstaller = () => {}

/** Register the package-owned invariant seat. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
