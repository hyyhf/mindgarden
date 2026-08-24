import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const patch = readFileSync(resolve(root, 'cordis.patch.yml'), 'utf8')

const protectedUiResources = {
  'concern-paper-lattice-v3.webp': 'ca9fe74d95ab60e58d531929c97df851b7a162eaddf1671ded95f8d34a483a46',
  'garden-home-courtyard-v4.webp': 'a6a8ac4f817d3fcfd5960f394c0110ff598af7a80d21d9aad5ceaa83f72ce3d4',
  'garden-orrery-warm.webp': 'c74b39597f571a40de2c23dc700e1bb89da182e89949b7f860593f6d4818b8a3',
  'garden-threshold-warm.webp': 'dc1ee75cad59db8972db155b4dcc328d7bbaf871c3892c2e0b92d7b0c77c680a',
  'growth-observation-bench-v3.webp': 'dd94f6763c2c44847ec9b166aaac4d5686ef945b62864d907373a63754022791',
  'life-time-corridor-v3.webp': 'dab57b851ba7f45c4812f08dcd71ce4c96920f93a96214501b7f0b7f7d12eaca',
  'memory-archive-alcove-v3.webp': 'c68d1f0e7062536e8150b1ef17345eaab9783cabd455a65f6413ce975268db76',
  'mind-garden-display.woff2': '49c4f9c2e5513a0d000b9584c59e9702914e53ee537363521a0847c5ace6ea77',
  'morning-xuan-texture-v2.webp': '6c5163a10799201d3296e7db62269bc20ee9474b57ccf589b533b467d520cefb',
  'pale-ash-wood-texture-v2.webp': '005baa43a3bf9dd8ac6f51a6f3559f23f0cb03c862fcc60fbe3fa0cb37d97599',
  'personal-orrery-stage.webp': 'ff6a48eccd108d2c1b12e6bb6f3d1a91da6b1f8fe530e661915974d98eae0c02',
  'philosophy-folio-room-v3.webp': 'da9cdb186b9038a25a3477e6d3ac48bb5abb023d652b30078950a0a3a9f53356',
  'photo-memory-stage-v4.webp': '54c12ae7c3532a6425068bbaa062cb86b7ad59932e135e8743826c79d614ceed',
  'photo-memory-stage-v5.webp': 'aa4f122b1bbb037e441868a6c5c44dd09a2e53935d04aac22b447ced86b117db',
  'photo-story-empty-morning-v2.webp': 'cc6902e50d9048ad1fe2d8db8e3db60d4b691d3058e2e4f85fd7cf5769bc01ef',
  'photo-story-empty-warm.webp': '9f2f29d78d7de14e649bb17357b321b3612e59113ecc9fe7b569b79bdeca49ed',
  'photo-story-threshold-v3.webp': 'd19b6bd7a8066457ab8309827f8e3be8745525196412794e76e27ef28c65402d',
  'porcelain-thought-token-v2.png': '5101ea4cf7451d193d2db1d6c866e022b0955025e67c687c7bdb675b8ecb0f76',
  'star-mist-courtyard-v4.webp': 'a1db1d31fdac618c6ecfd337e5437891e756a7a69504cc1670236bb0fca34d8b',
  'star-mist-courtyard-v5.webp': '1826c71de709cd3ea9724f5038e1ed2680f31c07bbe8cb55c9512264f2919f83',
  'today-courtyard-corridor-v3.webp': '2f2cb064147aa1e324cf3bda68f27a96d95eacd834413ae076ace06921a4d915',
  'warm-limestone-texture-v2.webp': 'eff1a797f95027a215d6da9b37b044a5ba20125333609236113f8be8217e4d8d',
}

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
  '@deepseek-ai/dsh-mind-garden',
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

test('the standalone root exposes one conventional Typert face for every remote service', () => {
  assert.ok('./typert' in manifest.exports)
  const bridge = readFileSync(resolve(root, 'lib/typert.host.js'), 'utf8')
  for (const face of ['core', 'media', 'memory', 'portability', 'reflection', 'star-map']) {
    assert.ok(
      bridge.includes(`mind-garden-${face}/lib/typert.host.js`),
      `${face} Typert contribution is missing from the standalone bridge`,
    )
  }
  assert.match(bridge, /invocations: contributions\.flatMap/)
})

test('the approved shipping UI resources cannot be removed or silently replaced', () => {
  const assetRoot = resolve(root, 'packages/client/ui-mind-garden/src/assets')
  for (const [fileName, expectedHash] of Object.entries(protectedUiResources)) {
    const bytes = readFileSync(resolve(assetRoot, fileName))
    const actualHash = createHash('sha256').update(bytes).digest('hex')
    assert.equal(actualHash, expectedHash, `${fileName} changed; preserve the approved resource and add a new version instead`)
  }
})
