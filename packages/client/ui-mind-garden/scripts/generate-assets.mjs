import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const assets = [
  ['GARDEN_THRESHOLD_WARM', 'garden threshold warm', 'garden-threshold-warm.webp'],
  ['CONCERN_PAPER_LATTICE_V3', 'concern paper lattice', 'concern-paper-lattice-v3.webp'],
  ['MEMORY_ARCHIVE_ALCOVE_V3', 'memory archive alcove', 'memory-archive-alcove-v3.webp'],
  ['GROWTH_OBSERVATION_BENCH_V3', 'growth observation bench', 'growth-observation-bench-v3.webp'],
  ['PHILOSOPHY_FOLIO_ROOM_V3', 'philosophy folio room', 'philosophy-folio-room-v3.webp'],
  ['LIFE_TIME_CORRIDOR_V3', 'life time corridor', 'life-time-corridor-v3.webp'],
  ['PHOTO_MEMORY_STAGE_V5', 'open-album rainy-night memory theatre', 'photo-memory-stage-v5.webp'],
  ['STAR_MIST_COURTYARD_V5', 'deep mist-lake New Chinese observatory', 'star-mist-courtyard-v5.webp'],
  ['GARDEN_HOME_COURTYARD_V4', 'immersive morning New Chinese home courtyard', 'garden-home-courtyard-v4.webp'],
]

const pluginRoot = '/plugins/@deepseek-ai/dsh-mind-garden/ui/assets'
const declarations = assets.map(([name, description, filename]) =>
  `/** Package-owned ${description} image. */\nexport const ${name} = '${pluginRoot}/${filename}'`,
)

await writeFile(
  `${packageRoot}/src/client/generated-assets.ts`,
  `/** Generated package resource URLs for raster assets. Do not edit by hand. */\n\n${declarations.join('\n\n')}\n`,
)
