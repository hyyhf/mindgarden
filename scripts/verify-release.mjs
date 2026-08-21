import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const failures = []

if (manifest.dsh?.bundle?.patch !== './cordis.patch.yml') {
  failures.push('package.json must declare dsh.bundle.patch as ./cordis.patch.yml')
}

const packageRoots = [
  'packages/client/ui-mind-garden',
  'packages/mind-garden/mind-garden-core',
  'packages/mind-garden/mind-garden-dialogue',
  'packages/mind-garden/mind-garden-media',
  'packages/mind-garden/mind-garden-memory',
  'packages/mind-garden/mind-garden-portability',
  'packages/mind-garden/mind-garden-reflection',
  'packages/mind-garden/mind-garden-safety',
  'packages/mind-garden/mind-garden-skills',
  'packages/mind-garden/mind-garden-star-map',
  'packages/mind-garden/mind-garden-vault',
]

for (const relative of packageRoots) {
  const packageRoot = resolve(root, relative)
  for (const required of ['package.json', 'lib/index.js']) {
    if (!existsSync(resolve(packageRoot, required))) {
      failures.push(`${relative} is missing ${required}`)
    }
  }
}

for (const required of [
  'cordis.patch.yml',
  'lib/index.js',
  'lib/invariant.js',
  'packages/client/ui-mind-garden/lib/client.js',
]) {
  if (!existsSync(resolve(root, required))) failures.push(`missing release file: ${required}`)
}

for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
  const paths = typeof target === 'string' ? [target] : Object.values(target)
  for (const relative of paths) {
    const exportTarget = typeof relative === 'string' && relative.includes('*')
      ? relative.slice(0, relative.indexOf('*'))
      : relative
    if (typeof exportTarget === 'string' && exportTarget.startsWith('./') && !existsSync(resolve(root, exportTarget))) {
      failures.push(`export ${subpath} points at missing file: ${relative}`)
    }
  }
}

const clientBundle = readFileSync(resolve(root, 'packages/client/ui-mind-garden/lib/client.js'), 'utf8')
if (!clientBundle.includes('id: "@deepseek-ai/dsh-mind-garden/ui"')) {
  failures.push('the browser bundle does not register the Loader row id @deepseek-ai/dsh-mind-garden/ui')
}

const manifests = [
  'package.json',
  ...packageRoots.map(relative => `${relative}/package.json`),
]
for (const relative of manifests) {
  const text = readFileSync(resolve(root, relative), 'utf8')
  if (text.includes('workspace:')) failures.push(`${relative} contains a workspace-only dependency`)
  if (text.includes('deepseek-ai/deepseek-harness.git')) failures.push(`${relative} points at the Harness monorepo`)
}

if (failures.length > 0) {
  for (const failure of failures) process.stderr.write(`- ${failure}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(`Mind Garden release layout is complete (${manifests.length} package manifests).\n`)
}
