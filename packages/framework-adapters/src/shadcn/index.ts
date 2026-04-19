/**
 * shadcn/ui registry manifest builder. Produces the JSON format
 * consumed by `npx shadcn add <url>` so a developer can install an
 * AgentsKit React chat component as if it were native shadcn.
 *
 * The actual component source is shipped verbatim by the consumer's
 * CDN / published JSON (see the `registry.json` emitted by the
 * package build), keeping this module framework-agnostic and
 * testable.
 */

export interface ShadcnRegistryItem {
  name: string
  type: 'registry:component' | 'registry:hook' | 'registry:example' | 'registry:block'
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: Array<{
    path: string
    content: string
    type?: 'registry:component' | 'registry:hook'
  }>
}

export interface ShadcnRegistry {
  name: string
  homepage?: string
  items: ShadcnRegistryItem[]
}

export function shadcnRegistry(config: ShadcnRegistry): ShadcnRegistry {
  return config
}
