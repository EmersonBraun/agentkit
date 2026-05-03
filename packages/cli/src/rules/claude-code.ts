/**
 * Claude Code skill bundle — written to `.claude/skills/agentskit/`
 * by `agentskit rules claude-code`. Each command file is a slash
 * command Claude Code can invoke against the running CLI.
 */

export interface ClaudeCodeFile {
  /** Path relative to the skill root (e.g. `.claude/skills/agentskit/`). */
  path: string
  contents: string
}

export const CLAUDE_CODE_SKILL: ClaudeCodeFile[] = [
  {
    path: 'SKILL.md',
    contents: `---
name: agentskit
description: Scaffold AgentsKit projects, add tools/skills, run doctor, and inspect the runtime — wraps the agentskit CLI with structured slash commands.
---

# AgentsKit

Skill bundle for working with the AgentsKit toolkit from inside Claude Code.

Use these slash commands to drive the existing \`@agentskit/cli\` without
remembering its flags:

- \`/agentskit:new-agent\` — interactive scaffold (\`agentskit init\`)
- \`/agentskit:doctor\` — diagnose the local environment (\`agentskit doctor\`)
- \`/agentskit:add-tool\` — add a tool integration template
- \`/agentskit:add-skill\` — add a skill template
- \`/agentskit:lint-pii\` — validate a PII taxonomy file
- \`/agentskit:rules\` — write \`.cursor/rules\` / \`.windsurfrules\` / Codex
  profile to the current repo

When the user is inside an AgentsKit workspace, prefer the slash commands above
over hand-rolling shell invocations — they share the canonical defaults.

For convention reminders (named exports only, no bare throw, etc.), prompt
Claude to read \`AGENTS.md\` at the workspace root.
`,
  },
  {
    path: 'commands/new-agent.md',
    contents: `---
description: Scaffold a new AgentsKit project (interactive)
allowed-tools: Bash(npx agentskit init:*)
---

Run \`npx @agentskit/cli init\` interactively in the user's chosen directory.
After scaffold completes, summarise the layout (templates created, next
commands the user should run).
`,
  },
  {
    path: 'commands/doctor.md',
    contents: `---
description: Run the AgentsKit environment doctor and summarise findings
allowed-tools: Bash(npx agentskit doctor:*)
---

Run \`npx @agentskit/cli doctor\` in the workspace root. Format the output
into pass / warn / fail buckets and propose a fix for each fail / warn.
`,
  },
  {
    path: 'commands/add-tool.md',
    contents: `---
description: Add a tool template to the current package
---

Ask the user which tool to add. Use \`packages/templates/src/blueprints/tool.ts\`
to scaffold the file under \`packages/<pkg>/src/tools/\`. Update the package's
\`src/index.ts\` to re-export the new tool. Add a vitest mock test under
\`packages/<pkg>/tests/\`.
`,
  },
  {
    path: 'commands/add-skill.md',
    contents: `---
description: Add a skill template to @agentskit/skills
---

Use \`packages/templates/src/blueprints/skill.ts\` to scaffold a new skill
under \`packages/skills/src/\`. Re-export from the package index. Add a
golden-dataset test fixture under \`packages/skills/tests/\` (10–50 input/
expected examples, per the conventions).
`,
  },
  {
    path: 'commands/lint-pii.md',
    contents: `---
description: Validate a PII taxonomy JSON file
allowed-tools: Bash(npx agentskit pii lint:*)
---

Ask the user for a path. Run \`npx @agentskit/cli pii lint <path>\` and
display the report. If issues exist, suggest concrete fixes per the
issue messages.
`,
  },
  {
    path: 'commands/rules.md',
    contents: `---
description: Write editor rule files (Cursor / Windsurf / Codex / Claude Code)
allowed-tools: Bash(npx agentskit rules:*)
---

Ask which editor (or "all"). Run the matching:
- \`npx @agentskit/cli rules cursor\`
- \`npx @agentskit/cli rules windsurf\`
- \`npx @agentskit/cli rules codex\`
- \`npx @agentskit/cli rules claude-code\`

After writing, summarise which files landed and what each one does.
`,
  },
]
