import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  external: ['@angular/core', 'rxjs'],
  dts: { compilerOptions: { ignoreDeprecations: '6.0', experimentalDecorators: true } },
  sourcemap: true,
  clean: false,
  treeshake: true,
})
