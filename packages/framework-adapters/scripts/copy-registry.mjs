import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const source = resolve(here, '../src/shadcn/registry.json')
const target = resolve(here, '../dist/shadcn/registry.json')

await mkdir(dirname(target), { recursive: true })
await copyFile(source, target)
process.stdout.write(`copied registry → ${target}\n`)
