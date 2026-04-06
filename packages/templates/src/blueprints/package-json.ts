import type { ScaffoldConfig } from '../scaffold'
import { packageName } from './utils'

export function generatePackageJson(config: ScaffoldConfig): string {
  return JSON.stringify({
    name: packageName(config.name),
    version: '0.1.0',
    description: config.description ?? `AgentsKit ${config.type}: ${config.name}`,
    type: 'module',
    main: './dist/index.cjs',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        require: './dist/index.cjs',
      },
    },
    files: ['dist'],
    publishConfig: { access: 'public' },
    scripts: {
      build: 'tsup',
      test: 'vitest run',
      lint: 'tsc --noEmit',
    },
    dependencies: {
      '@agentskit/core': '*',
    },
    devDependencies: {
      tsup: '^8.5.0',
      typescript: '^6.0.2',
      vitest: '^4.1.2',
    },
  }, null, 2)
}
