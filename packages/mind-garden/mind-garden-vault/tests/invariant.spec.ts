import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import { apply } from '../src/invariant.ts'
import { MIND_GARDEN_VAULT_ASSERT } from '../src/private.ts'

describe('Mind Garden vault invariant companion', () => {
  it('registers ownership and rechecks only vault-domain changes', async () => {
    const disposer = () => {}
    let installed: InvariantInstaller | undefined
    const register = vi.fn((_name: string, installer: InvariantInstaller) => {
      installed = installer
      return disposer
    })
    await expect(apply({ invariants: { register } } as never)).resolves.toBe(disposer)
    expect(register).toHaveBeenCalledWith('@deepseek-ai/dsh-mind-garden-vault', expect.any(Function))

    const ctx = new Context()
    const assertInvariants = vi.fn()
    ctx.provide('mindGardenVault', { [MIND_GARDEN_VAULT_ASSERT]: assertInvariants } as never)
    const installer = installed
    if (installer === undefined) throw new Error('invariant was not registered')
    await installer(ctx, () => { throw new Error('unused') })
    expect(assertInvariants).toHaveBeenCalledTimes(1)
    ctx.emit('domain/changed', {
      domain: 'other', table: 'items', key: 'one', operation: 'deleted',
    })
    expect(assertInvariants).toHaveBeenCalledTimes(1)
    ctx.emit('domain/changed', {
      domain: 'mind_garden_vault', table: 'memories', key: 'one', operation: 'deleted',
    })
    expect(assertInvariants).toHaveBeenCalledTimes(2)
  })
})
