import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

const ENTRIES = {
  main: './src/main/main.ts',
  preload: './src/preload/preload.ts',
} as const

export default defineConfig(({ mode }) => {
  const entry = mode === 'preload' ? 'preload' : 'main'

  return {
    resolve: {
      alias: {
        '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
      },
    },
    ssr: {
      noExternal: true,
    },
    build: {
      ssr: fileURLToPath(new URL(ENTRIES[entry], import.meta.url)),
      target: 'node22',
      outDir: fileURLToPath(new URL('./dist/main', import.meta.url)),
      emptyOutDir: entry === 'main',
      rollupOptions: {
        external: ['electron'],
        output: {
          format: 'cjs',
          entryFileNames: `${entry}.js`,
        },
      },
    },
  }
})
