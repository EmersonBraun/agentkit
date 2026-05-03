import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { CURSOR_RULE } from './rules/cursor'
import { WINDSURF_RULE } from './rules/windsurf'
import { CODEX_PROFILE } from './rules/codex'
import { CLAUDE_CODE_SKILL } from './rules/claude-code'

export type Editor = 'cursor' | 'windsurf' | 'codex' | 'claude-code' | 'all'

export interface RulesWriteResult {
  editor: Editor
  files: Array<{ path: string; action: 'wrote' | 'skipped' | 'updated' }>
}

const CODEX_BLOCK_START = '<!-- agentskit-codex-profile:start -->'
const CODEX_BLOCK_END = '<!-- agentskit-codex-profile:end -->'

async function ensureDir(path: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
}

async function writeIfChanged(
  absPath: string,
  contents: string,
  force: boolean,
): Promise<'wrote' | 'skipped' | 'updated'> {
  let existing: string | undefined
  try {
    existing = await readFile(absPath, 'utf8')
  } catch {
    // not present
  }
  if (existing === contents) return 'skipped'
  if (existing !== undefined && !force) {
    // Append-or-update flow handled by callers that need it; default
    // here is to overwrite when contents differ AND force is on.
    return 'skipped'
  }
  await ensureDir(absPath)
  await writeFile(absPath, contents, 'utf8')
  return existing === undefined ? 'wrote' : 'updated'
}

async function writeCursor(rootDir: string, force: boolean): Promise<RulesWriteResult['files']> {
  const path = join(rootDir, '.cursor', 'rules', 'agentskit.mdc')
  const action = await writeIfChanged(path, CURSOR_RULE, force)
  return [{ path, action }]
}

async function writeWindsurf(rootDir: string, force: boolean): Promise<RulesWriteResult['files']> {
  const path = join(rootDir, '.windsurfrules')
  const action = await writeIfChanged(path, WINDSURF_RULE, force)
  return [{ path, action }]
}

/**
 * Codex profile is appended to the existing AGENTS.md, replacing any
 * previous profile block delimited by the sentinel comments. If
 * AGENTS.md does not exist, write it with just the profile (deployers
 * are expected to add the rest of the universal-agent guidance).
 */
async function writeCodex(rootDir: string, force: boolean): Promise<RulesWriteResult['files']> {
  const path = join(rootDir, 'AGENTS.md')
  let existing = ''
  try {
    existing = await readFile(path, 'utf8')
  } catch {
    // not present — write a fresh AGENTS.md with just the profile.
  }
  let next: string
  const startIdx = existing.indexOf(CODEX_BLOCK_START)
  const endIdx = existing.indexOf(CODEX_BLOCK_END)
  if (startIdx >= 0 && endIdx > startIdx) {
    // Replace the existing block in place.
    next =
      existing.slice(0, startIdx) +
      CODEX_PROFILE.trimEnd() +
      existing.slice(endIdx + CODEX_BLOCK_END.length)
  } else if (existing) {
    next = `${existing.replace(/\s+$/, '')}\n\n${CODEX_PROFILE}`
  } else {
    next = CODEX_PROFILE
  }
  if (next === existing) return [{ path, action: 'skipped' }]
  if (existing && !force && startIdx < 0) {
    // Existing AGENTS.md without our block — only append when --force,
    // since the AGENTS.md is a load-bearing root file.
    return [{ path, action: 'skipped' }]
  }
  await ensureDir(path)
  await writeFile(path, next, 'utf8')
  return [{ path, action: existing ? 'updated' : 'wrote' }]
}

async function writeClaudeCode(rootDir: string, force: boolean): Promise<RulesWriteResult['files']> {
  const skillRoot = join(rootDir, '.claude', 'skills', 'agentskit')
  const out: RulesWriteResult['files'] = []
  for (const file of CLAUDE_CODE_SKILL) {
    const abs = join(skillRoot, file.path)
    const action = await writeIfChanged(abs, file.contents, force)
    out.push({ path: abs, action })
  }
  return out
}

export async function writeRules(
  editor: Editor,
  options: { rootDir?: string; force?: boolean } = {},
): Promise<RulesWriteResult[]> {
  const root = resolve(options.rootDir ?? process.cwd())
  const force = options.force === true
  if (editor === 'all') {
    return [
      { editor: 'cursor', files: await writeCursor(root, force) },
      { editor: 'windsurf', files: await writeWindsurf(root, force) },
      { editor: 'codex', files: await writeCodex(root, force) },
      { editor: 'claude-code', files: await writeClaudeCode(root, force) },
    ]
  }
  switch (editor) {
    case 'cursor':
      return [{ editor, files: await writeCursor(root, force) }]
    case 'windsurf':
      return [{ editor, files: await writeWindsurf(root, force) }]
    case 'codex':
      return [{ editor, files: await writeCodex(root, force) }]
    case 'claude-code':
      return [{ editor, files: await writeClaudeCode(root, force) }]
  }
}
