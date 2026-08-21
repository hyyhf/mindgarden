/** Package-owned ciphertext-domain invariant companion. */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantFailure, InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import type {} from './index.ts'
import { MIND_GARDEN_VAULT_ASSERT } from './private.ts'

const PACKAGE_NAME = '@deepseek-ai/dsh-mind-garden/vault'

/** Cordis companion plugin name. */
export const name = 'mind-garden-vault-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/** Recheck the complete key/envelope relationship on startup and after vault-domain writes. */
const install: InvariantInstaller = Object.assign((ctx: Context, fail: InvariantFailure) => {
  ctx.mindGardenVault[MIND_GARDEN_VAULT_ASSERT](fail)
  ctx.on('domain/changed', (change) => {
    if (change.domain === 'mind_garden_vault') ctx.mindGardenVault[MIND_GARDEN_VAULT_ASSERT](fail)
  }, { global: true })
}, { inject: ['mindGardenVault'] })

/** Register the invariant installer. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
