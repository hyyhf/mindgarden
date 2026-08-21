/**
 * Real Loader composition over the shipped JSON storage and local credential
 * providers. The assertions cross the physical files and a cold restart, so
 * the service-only suites cannot mask plaintext persistence or key loss.
 */

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Storage from '@deepseek-ai/dsh-storage'
import * as StorageDomain from '@deepseek-ai/dsh-storage-domain'
import * as StorageJson from '@deepseek-ai/dsh-storage-json'
import LocalCredentialProvider from '@deepseek-ai/dsh-credentials-local'
import MindGardenVault, { MindGardenVaultRecordId } from '../src/index.ts'

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
})

async function loadComposition(home: string): Promise<Context> {
  const storageRoot = join(home, 'storages')
  const credentialsPath = join(home, '.credentials.yaml')
  const configPath = join(home, 'cordis.yml')
  await writeFile(configPath, [
    '- id: storage',
    "  name: '@deepseek-ai/dsh-storage'",
    '- id: storage-json',
    "  name: '@deepseek-ai/dsh-storage-json'",
    '  config:',
    `    root: ${JSON.stringify(storageRoot)}`,
    '- id: storage-domain',
    "  name: '@deepseek-ai/dsh-storage-domain'",
    '  config:',
    '    backend: json',
    '- id: credentials',
    "  name: '@deepseek-ai/dsh-credentials-local'",
    '  config:',
    `    path: ${JSON.stringify(credentialsPath)}`,
    '    watch: false',
    '- id: mind-garden-vault',
    "  name: '@deepseek-ai/dsh-mind-garden-vault'",
    '',
  ].join('\n'))

  const ctx = new Context()
  context = ctx
  ctx.baseUrl = pathToFileURL(home).href + '/'
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = Include
  const modules = new Map<string, unknown>([
    ['@deepseek-ai/dsh-storage', Storage],
    ['@deepseek-ai/dsh-storage-json', StorageJson],
    ['@deepseek-ai/dsh-storage-domain', StorageDomain],
    ['@deepseek-ai/dsh-credentials-local', LocalCredentialProvider],
    ['@deepseek-ai/dsh-mind-garden-vault', MindGardenVault],
  ])
  ctx.loader.internal = {
    version: 'v2',
    async import(specifier: string) {
      if (!modules.has(specifier)) throw new Error(`unexpected Loader import: ${specifier}`)
      return modules.get(specifier)
    },
  } as unknown as NonNullable<typeof ctx.loader.internal>
  await ctx.loader.create({
    name: 'cordis:include',
    config: { path: pathToFileURL(configPath).href },
  })
  await ctx.loader.await()
  return ctx
}

describe('Mind Garden vault real Loader composition', () => {
  it('persists ciphertext and reopens it with the provider-owned key', async () => {
    root = await mkdtemp(join(tmpdir(), 'dsh-mind-garden-vault-'))
    const first = await loadComposition(root)
    const id = MindGardenVaultRecordId('restart-memory')
    await first.mindGardenVault.put('memories', id, { text: 'private restart value' })

    const storageText = await readFile(join(root, 'storages', 'mind_garden_vault.json'), 'utf8')
    const credentialText = await readFile(join(root, '.credentials.yaml'), 'utf8')
    expect(storageText).not.toContain('private restart value')
    expect(storageText).not.toContain('MIND_GARDEN_DATA_KEY')
    expect(credentialText).toContain('MIND_GARDEN_DATA_KEY')

    const rotated = await first.mindGardenVault.rotateDataKey()
    const rotatedStorageText = await readFile(join(root, 'storages', 'mind_garden_vault.json'), 'utf8')
    const rotatedCredentialText = await readFile(join(root, '.credentials.yaml'), 'utf8')
    expect(rotatedCredentialText).not.toBe(credentialText)
    expect(rotatedCredentialText).not.toContain('MIND_GARDEN_DATA_KEY_NEXT')
    expect(rotatedStorageText).toContain(rotated.toKeyId)
    expect(rotatedStorageText).not.toContain(rotated.fromKeyId)
    expect(rotatedStorageText).not.toContain('private restart value')

    await first.fiber.dispose()
    context = undefined
    const restarted = await loadComposition(root)
    await expect(restarted.mindGardenVault.get('memories', id)).resolves.toEqual({
      text: 'private restart value',
    })
    await expect(restarted.mindGardenVault.status()).resolves.toMatchObject({
      state: 'ready',
      source: 'file',
      records: { memories: 1, reflections: 0, media: 0, stars: 0 },
    })
  })
})
