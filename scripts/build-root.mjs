import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const mirrors = [
  ['src/index.js', 'lib/index.js'],
  ['src/typert.host.js', 'lib/typert.host.js'],
  ['src/typert.host.d.ts', 'lib/typert.host.d.ts'],
]

for (const [source, target] of mirrors) {
  const destination = resolve(root, target)
  await mkdir(dirname(destination), { recursive: true })
  await copyFile(resolve(root, source), destination)
}

process.stdout.write(`Built ${mirrors.length} standalone root artifact(s).\n`)
