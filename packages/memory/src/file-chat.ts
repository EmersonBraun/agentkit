import type { ChatMemory, MemoryRecord } from '@agentskit/core'
import { deserializeMessages, serializeMessages } from '@agentskit/core'

/**
 * ChatMemory backed by a JSON file on disk. Node-only.
 *
 * Implements the Memory contract (ADR 0003):
 * - load() returns a snapshot (CM1)
 * - save() is replace-all, not append (CM2)
 * - empty state returns [] (CM5)
 * - clear() is optional but provided here
 */
export function fileChatMemory(path: string): ChatMemory {
  return {
    async load() {
      try {
        const fs = await import('node:fs/promises')
        const raw = await fs.readFile(path, 'utf8')
        return deserializeMessages(JSON.parse(raw) as MemoryRecord)
      } catch {
        return []
      }
    },
    async save(messages) {
      const fs = await import('node:fs/promises')
      await fs.writeFile(path, JSON.stringify(serializeMessages(messages), null, 2), 'utf8')
    },
    async clear() {
      try {
        const fs = await import('node:fs/promises')
        await fs.unlink(path)
      } catch {
        // Ignore missing files.
      }
    },
  }
}
