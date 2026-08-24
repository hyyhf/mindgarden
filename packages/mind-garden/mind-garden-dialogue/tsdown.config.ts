import { defineConfig } from 'tsdown'

/** Keep installed packages and root-bundle subpaths as runtime imports. */
const isRuntimeImport = (specifier: string): boolean => !specifier.startsWith('.')
  && !specifier.startsWith('/')
  && !/^[A-Za-z]:[\\/]/u.test(specifier)

/** Build the runtime plugin and invariant companion independently. */
export default defineConfig([
  {
    entry: ['lib/types/index.js'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
    deps: { neverBundle: isRuntimeImport },
  },
  {
    entry: ['lib/types/invariant.js'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
    deps: { neverBundle: isRuntimeImport },
  },
])
