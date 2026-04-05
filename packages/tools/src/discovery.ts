import type { JSONSchema7 } from 'json-schema'

export interface ToolMetadata {
  name: string
  description: string
  tags: string[]
  category: string
  schema: JSONSchema7
}

const toolRegistry: ToolMetadata[] = [
  {
    name: 'web_search',
    description: 'Search the web for information. Returns titles, URLs, and snippets.',
    tags: ['web', 'search'],
    category: 'retrieval',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query' },
      },
      required: ['query'],
    },
  },
  {
    name: 'read_file',
    description: 'Read the contents of a file. Path is relative to the workspace.',
    tags: ['filesystem', 'read'],
    category: 'filesystem',
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to workspace' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write content to a file. Creates the file if it does not exist. Path is relative to the workspace.',
    tags: ['filesystem', 'write'],
    category: 'filesystem',
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to workspace' },
        content: { type: 'string', description: 'Content to write' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'list_directory',
    description: 'List files and directories at a path. Path is relative to the workspace.',
    tags: ['filesystem', 'read'],
    category: 'filesystem',
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path relative to workspace (default: root)' },
      },
    },
  },
  {
    name: 'shell',
    description: 'Execute a shell command and stream the output. Returns stdout and stderr.',
    tags: ['shell', 'command'],
    category: 'execution',
    schema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'The shell command to execute' },
      },
      required: ['command'],
    },
  },
]

export function listTools(): ToolMetadata[] {
  return [...toolRegistry]
}
