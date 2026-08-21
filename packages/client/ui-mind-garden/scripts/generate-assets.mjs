import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const assets = [
  ['GARDEN_THRESHOLD_WARM', 'garden threshold warm', 'garden-threshold-warm.webp'],
  ['GARDEN_ORRERY_WARM', 'warm garden orrery', 'garden-orrery-warm.webp'],
  ['PHOTO_STORY_EMPTY_WARM', 'photo story empty warm', 'photo-story-empty-warm.webp'],
  ['PERSONAL_ORRERY_STAGE', 'personal orrery stage', 'personal-orrery-stage.webp'],
]

const declarations = await Promise.all(assets.map(async ([name, description, filename]) => {
  const bytes = await readFile(`${packageRoot}/src/assets/${filename}`)
  return `/** Package-owned ${description} image. */\nexport const ${name} = 'data:image/webp;base64,${bytes.toString('base64')}'`
}))

await writeFile(
  `${packageRoot}/src/client/generated-assets.ts`,
  `/** Generated inline URLs for package-owned raster assets. Do not edit by hand. */\n\n${declarations.join('\n\n')}\n`,
)
