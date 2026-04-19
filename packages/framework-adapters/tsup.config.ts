import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    vue: 'src/vue/index.ts',
    svelte: 'src/svelte/index.ts',
    solid: 'src/solid/index.ts',
    rn: 'src/rn/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  sourcemap: true,
  clean: false,
  treeshake: true,
})
