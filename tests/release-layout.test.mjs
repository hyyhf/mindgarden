import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const patch = readFileSync(resolve(root, 'cordis.patch.yml'), 'utf8')

const expectedRows = [
  '@deepseek-ai/dsh-mind-garden/vault',
  '@deepseek-ai/dsh-mind-garden/core',
  '@deepseek-ai/dsh-mind-garden/skills',
  '@deepseek-ai/dsh-mind-garden/memory',
  '@deepseek-ai/dsh-mind-garden/media',
  '@deepseek-ai/dsh-mind-garden/reflection',
  '@deepseek-ai/dsh-mind-garden/star-map',
  '@deepseek-ai/dsh-mind-garden/dialogue',
  '@deepseek-ai/dsh-mind-garden/safety',
  '@deepseek-ai/dsh-mind-garden/portability',
  '@deepseek-ai/dsh-mind-garden/ui',
]

test('the bundle declares every Mind Garden runtime row', () => {
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  for (const packageName of expectedRows) {
    assert.match(patch, new RegExp(`name: ['\"]${packageName.replaceAll('/', '\\/')}['\"]`))
  }
})

test('the installable root exposes every Loader row without local file dependencies', () => {
  assert.equal(Object.values(manifest.dependencies).some(spec => spec.startsWith('file:')), false)
  for (const packageName of expectedRows) {
    const exportName = `.${packageName.slice('@deepseek-ai/dsh-mind-garden'.length)}`
    assert.ok(exportName in manifest.exports, `${exportName} is not exported`)
  }
})
