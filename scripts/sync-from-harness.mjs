import { access, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import process from 'node:process'

const ROOT = resolve(import.meta.dirname, '..')
const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const check = args.has('--check') || !write
const harnessFlag = process.argv.indexOf('--harness')
const HARNESS = resolve(harnessFlag >= 0 ? process.argv[harnessFlag + 1] ?? '' : join(ROOT, '..', 'deepseek-harness'))

const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.md', '.mjs', '.ts', '.tsx', '.txt', '.yaml', '.yml'])
const REPLACEMENTS = [
  ['@deepseek-ai/dsh-client-ui-mind-garden', '@deepseek-ai/dsh-mind-garden/ui'],
  ['@deepseek-ai/dsh-mind-garden-core', '@deepseek-ai/dsh-mind-garden/core'],
  ['@deepseek-ai/dsh-mind-garden-dialogue', '@deepseek-ai/dsh-mind-garden/dialogue'],
  ['@deepseek-ai/dsh-mind-garden-media', '@deepseek-ai/dsh-mind-garden/media'],
  ['@deepseek-ai/dsh-mind-garden-memory', '@deepseek-ai/dsh-mind-garden/memory'],
  ['@deepseek-ai/dsh-mind-garden-portability', '@deepseek-ai/dsh-mind-garden/portability'],
  ['@deepseek-ai/dsh-mind-garden-reflection', '@deepseek-ai/dsh-mind-garden/reflection'],
  ['@deepseek-ai/dsh-mind-garden-safety', '@deepseek-ai/dsh-mind-garden/safety'],
  ['@deepseek-ai/dsh-mind-garden-skills', '@deepseek-ai/dsh-mind-garden/skills'],
  ['@deepseek-ai/dsh-mind-garden-star-map', '@deepseek-ai/dsh-mind-garden/star-map'],
  ['@deepseek-ai/dsh-mind-garden-vault', '@deepseek-ai/dsh-mind-garden/vault'],
]

const UI_SOURCE = join(HARNESS, 'packages', 'client', 'ui-mind-garden')
const UI_TARGET = join(ROOT, 'packages', 'client', 'ui-mind-garden')
const HOST_SOURCE = join(HARNESS, 'packages', 'mind-garden')
const HOST_TARGET = join(ROOT, 'packages', 'mind-garden')

const roots = [
  ['UI source', join(UI_SOURCE, 'src'), join(UI_TARGET, 'src')],
  ['UI tests', join(UI_SOURCE, 'tests'), join(UI_TARGET, 'tests')],
  ['UI asset generator', join(UI_SOURCE, 'scripts'), join(UI_TARGET, 'scripts')],
]

for (const filename of ['DESIGN.md']) {
  roots.push([`UI ${filename}`, join(UI_SOURCE, filename), join(UI_TARGET, filename)])
}

for (const entry of await readdir(HOST_SOURCE, { withFileTypes: true })) {
  if (!entry.isDirectory() || !entry.name.startsWith('mind-garden-')) continue
  for (const part of ['src', 'tests', 'skills']) {
    const source = join(HOST_SOURCE, entry.name, part)
    try {
      await access(source, constants.R_OK)
    } catch {
      continue
    }
    roots.push([`${entry.name}/${part}`, source, join(HOST_TARGET, entry.name, part)])
  }
}

function transform(buffer, filename) {
  if (!TEXT_EXTENSIONS.has(extname(filename))) return buffer
  let text = buffer.toString('utf8').replaceAll('\r\n', '\n')
  for (const [from, to] of REPLACEMENTS) text = text.replaceAll(from, to)
  return Buffer.from(text)
}

async function files(path) {
  if ((await stat(path)).isFile()) return [path]
  const entries = await readdir(path, { withFileTypes: true })
  const result = []
  for (const entry of entries) {
    const child = join(path, entry.name)
    if (entry.isDirectory()) result.push(...await files(child))
    else if (entry.isFile()) result.push(child)
  }
  return result
}

const mismatches = []
let written = 0

for (const [label, sourceRoot, targetRoot] of roots) {
  const sourceExists = await access(sourceRoot, constants.R_OK).then(() => true, () => false)
  if (!sourceExists) throw new Error(`Harness source is missing: ${sourceRoot}`)
  const sourceFiles = (await files(sourceRoot)).sort()
  for (const sourceFile of sourceFiles) {
    const suffix = sourceRoot === sourceFile ? '' : relative(sourceRoot, sourceFile)
    const targetFile = suffix === '' ? targetRoot : join(targetRoot, suffix)
    const expected = transform(await readFile(sourceFile), sourceFile)
    const actual = await readFile(targetFile).catch(() => null)
    if (actual !== null && actual.equals(expected)) continue
    mismatches.push(`${label}: ${suffix || relative(ROOT, targetFile)}`)
    if (!write) continue
    await mkdir(dirname(targetFile), { recursive: true })
    await writeFile(targetFile, expected)
    written += 1
  }
}

if (write) process.stdout.write(`Synchronized ${written} changed file(s) from the Harness production packages.\n`)
if (check && mismatches.length > 0) {
  process.stderr.write(`Harness source drift (${mismatches.length} file(s)):\n${mismatches.map(item => `- ${item}`).join('\n')}\n`)
  process.exitCode = 1
} else if (check) {
  process.stdout.write(`Harness source alignment is complete (${roots.length} source roots).\n`)
}
