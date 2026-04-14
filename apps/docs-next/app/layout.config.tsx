import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <span className="font-bold">AgentsKit</span>
        <span className="ml-2 text-xs text-fd-muted-foreground">v0</span>
      </>
    ),
  },
  links: [
    { text: 'Documentation', url: '/docs' },
    { text: 'GitHub', url: 'https://github.com/EmersonBraun/agentskit' },
    { text: 'Manifesto', url: 'https://github.com/EmersonBraun/agentskit/blob/main/MANIFESTO.md' },
  ],
  githubUrl: 'https://github.com/EmersonBraun/agentskit',
}
