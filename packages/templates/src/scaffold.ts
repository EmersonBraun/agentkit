import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import {
  generatePackageJson,
  generateTsConfig,
  generateTsupConfig,
  generateToolSource,
  generateToolTest,
  generateSkillSource,
  generateSkillTest,
  generateAdapterSource,
  generateAdapterTest,
  generateReadme,
} from './blueprints'

export type ScaffoldType = 'tool' | 'skill' | 'adapter'

export interface ScaffoldConfig {
  type: ScaffoldType
  name: string
  dir: string
  description?: string
}

const sourceGenerators: Record<ScaffoldType, (name: string) => string> = {
  tool: generateToolSource,
  skill: generateSkillSource,
  adapter: generateAdapterSource,
}

const testGenerators: Record<ScaffoldType, (name: string) => string> = {
  tool: generateToolTest,
  skill: generateSkillTest,
  adapter: generateAdapterTest,
}

export async function scaffold(config: ScaffoldConfig): Promise<string[]> {
  const root = join(config.dir, config.name)
  const created: string[] = []

  const write = async (path: string, content: string) => {
    const full = join(root, path)
    await mkdir(join(root, path, '..'), { recursive: true })
    await writeFile(full, content, 'utf8')
    created.push(full)
  }

  await write('package.json', generatePackageJson(config))
  await write('tsconfig.json', generateTsConfig())
  await write('tsup.config.ts', generateTsupConfig())
  await write('src/index.ts', sourceGenerators[config.type](config.name))
  await write('tests/index.test.ts', testGenerators[config.type](config.name))
  await write('README.md', generateReadme(config))

  return created
}
