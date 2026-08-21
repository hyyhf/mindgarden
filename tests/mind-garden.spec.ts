import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import * as yaml from 'js-yaml'
import { Context } from '@deepseek-ai/cordis'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import * as bundleEntry from '../src/index.ts'
import { apply as invariantApply } from '../src/invariant.ts'

describe('Mind Garden bundle', () => {
  it('publishes one parseable patch containing the complete vertical slice', () => {
    const root = fileURLToPath(new URL('..', import.meta.url))
    const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      dsh?: { bundle?: { patch?: string } }
      dependencies?: Record<string, string>
    }
    expect(manifest.dsh?.bundle?.patch).toBe('./cordis.patch.yml')
    const parsed = yaml.load(readFileSync(resolve(root, 'cordis.patch.yml'), 'utf8'), {
      schema: entryListSchema,
    }) as Array<{ insert?: Array<{ id?: string; name?: string; config?: Record<string, unknown> }> }>
    expect(parsed.flatMap(item => item.insert ?? [])).toEqual([
      { id: 'mind-garden-vault', name: '@deepseek-ai/dsh-mind-garden/vault' },
      { id: 'mind-garden-core', name: '@deepseek-ai/dsh-mind-garden/core' },
      { id: 'mind-garden-skills', name: '@deepseek-ai/dsh-mind-garden/skills' },
      { id: 'mind-garden-memory', name: '@deepseek-ai/dsh-mind-garden/memory' },
      {
        id: 'mind-garden-media',
        name: '@deepseek-ai/dsh-mind-garden/media',
        config: {
          observerProvider: 'deepseek-official',
          observerModel: 'deepseek-v4-flash-vision-exp',
        },
      },
      { id: 'mind-garden-reflection', name: '@deepseek-ai/dsh-mind-garden/reflection' },
      { id: 'mind-garden-star-map', name: '@deepseek-ai/dsh-mind-garden/star-map' },
      { id: 'mind-garden-dialogue', name: '@deepseek-ai/dsh-mind-garden/dialogue' },
      { id: 'mind-garden-safety', name: '@deepseek-ai/dsh-mind-garden/safety' },
      { id: 'mind-garden-portability', name: '@deepseek-ai/dsh-mind-garden/portability' },
      { id: 'ui-mind-garden', name: '@deepseek-ai/dsh-mind-garden/ui' },
    ])
    expect(manifest.dependencies?.['@deepseek-ai/dsh-skill-filesystem']).toBeDefined()
    expect(Object.values(manifest.dependencies ?? {}).some(spec => spec.startsWith('workspace:'))).toBe(false)
    expect(Object.keys(manifest.dependencies ?? {}).some(name => /^@deepseek-ai\/dsh-mind-garden-/.test(name))).toBe(false)
  })

  it('has an inert runtime entry and a registrable invariant companion', async () => {
    expect(Object.keys(bundleEntry)).toEqual([])
    const disposer = () => {}
    let installed: InvariantInstaller | undefined
    const register = vi.fn((_packageName: string, installer: InvariantInstaller) => {
      installed = installer
      return disposer
    })
    await expect(invariantApply({ invariants: { register } } as never)).resolves.toBe(disposer)
    expect(register).toHaveBeenCalledWith('@deepseek-ai/dsh-mind-garden', expect.any(Function))
    const installer = installed
    if (installer === undefined) throw new Error('invariant installer was not registered')
    await installer(new Context(), () => { throw new Error('unused') })
  })
})
