import type { ScaffoldConfig } from '../scaffold'
import { camelCase, packageName } from './utils'

export function generateReadme(config: ScaffoldConfig): string {
  return `# ${packageName(config.name)}

${config.description ?? `AgentsKit ${config.type}: ${config.name}`}

## Install

\`\`\`bash
npm install ${packageName(config.name)}
\`\`\`

## Usage

\`\`\`ts
import { ${camelCase(config.name)} } from '${packageName(config.name)}'

// TODO: add usage example
\`\`\`

## Development

\`\`\`bash
npm run build   # build
npm test        # run tests
npm run lint    # type check
\`\`\`
`
}
