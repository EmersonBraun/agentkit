---
'@agentskit/cli': minor
---

feat(cli): five new starter templates selectable via `agentskit init`:

- `sveltekit` (#467) — SvelteKit project with `@agentskit/svelte` + a `+server.ts` route streaming over fetch.
- `nuxt` (#468) — Nuxt project with `@agentskit/vue` + a Nitro `server/api/chat.post.ts` event handler.
- `vite-ink` (#469) — Ink terminal chat scaffolded for `vite-node --watch` hot reload.
- `cloudflare-workers` (#471) — Edge runtime + `itty-router` + `wrangler.toml` (`nodejs_compat`); D1 / KV stubs commented for memory wiring.
- `bun` (#473) — `Bun.serve` with `--hot` reload; smallest dev-loop on the list.

All five hook into the existing interactive picker and `--template` flag.
