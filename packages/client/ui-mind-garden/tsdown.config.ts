import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { UserConfig } from 'tsdown'
import { clientBundle } from '../tsdown.client.ts'

const packageRoot = fileURLToPath(new URL('.', import.meta.url))
const browserAssets = [
  'garden-threshold-warm.webp',
  'concern-paper-lattice-v3.webp',
  'memory-archive-alcove-v3.webp',
  'growth-observation-bench-v3.webp',
  'philosophy-folio-room-v3.webp',
  'life-time-corridor-v3.webp',
  'photo-memory-stage-v5.webp',
  'star-mist-courtyard-v5.webp',
  'garden-home-courtyard-v4.webp',
  'morning-xuan-texture-v2.webp',
  'warm-limestone-texture-v2.webp',
  'pale-ash-wood-texture-v2.webp',
  'mind-garden-display.woff2',
] as const

const heavyScenes: UserConfig = {
  name: '@deepseek-ai/dsh-mind-garden/heavy-scenes',
  entry: { 'heavy-scenes': 'lib/types/client/heavy-scenes.js' },
  outDir: 'lib',
  format: 'esm',
  platform: 'browser',
  target: 'es2024',
  dts: false,
  sourcemap: true,
  clean: false,
  deps: { alwaysBundle: () => true },
  plugins: [{
    name: 'mind-garden-browser-assets',
    async buildStart() {
      for (const filename of browserAssets) {
        const originalFileName = `${packageRoot}src/assets/${filename}`
        this.emitFile({
          type: 'asset',
          fileName: `assets/${filename}`,
          source: await readFile(originalFileName),
          originalFileName,
        })
      }
    },
  }],
  outputOptions: { entryFileNames: 'heavy-scenes.js' },
}

export default clientBundle(
  '@deepseek-ai/dsh-mind-garden',
  ['lib/types/index.js', 'lib/types/invariant.js'],
  { companions: [heavyScenes] },
)
