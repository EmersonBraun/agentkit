import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { Mermaid } from '@/components/mermaid'
import { StackblitzEmbed } from '@/components/mdx/stackblitz-embed'
import { CodeSandboxEmbed } from '@/components/mdx/codesandbox-embed'
import { GifEmbed } from '@/components/mdx/gif-embed'

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Mermaid,
    StackblitzEmbed,
    CodeSandboxEmbed,
    GifEmbed,
    ...components,
  }
}
