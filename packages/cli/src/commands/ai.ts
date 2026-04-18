import type { Command } from 'commander'
import { writeScaffold, scaffoldAgent, createAdapterPlanner } from '../ai'
import { resolveChatProvider } from '../providers'

export function registerAiCommand(program: Command): void {
  program
    .command('ai <description...>')
    .description('Generate an agent (config + tools + skill wiring) from a natural-language description.')
    .option('-o, --out <dir>', 'Output directory', './my-agent')
    .option('--provider <provider>', 'Planner provider (openai | anthropic | ...)', 'anthropic')
    .option('--model <model>', 'Planner model id')
    .option('--api-key <key>', 'API key (falls back to env)')
    .option('--base-url <url>', 'Override base URL (for OpenAI-compatible endpoints)')
    .option('--overwrite', 'Overwrite existing files', false)
    .option('--dry-run', 'Print the plan + files without writing', false)
    .action(async (descriptionWords: string[], options) => {
      const description = descriptionWords.join(' ').trim()
      if (!description) {
        process.stderr.write('agentskit ai: missing description.\n')
        process.exit(1)
      }

      const resolved = resolveChatProvider({
        provider: options.provider,
        model: options.model,
        apiKey: options.apiKey,
        baseUrl: options.baseUrl,
      })
      const planner = createAdapterPlanner(resolved.adapter)

      process.stderr.write(`Planning agent for: "${description}"\n`)
      const schema = await planner(description)
      const files = scaffoldAgent(schema)

      if (options.dryRun) {
        process.stdout.write(JSON.stringify({ schema, files: files.map(f => f.path) }, null, 2) + '\n')
        return
      }

      const written = await writeScaffold(files, options.out, { overwrite: options.overwrite })
      process.stderr.write(`Wrote ${written.length} file(s) to ${options.out}\n`)
      for (const f of written) process.stderr.write(`  + ${f}\n`)
    })
}
