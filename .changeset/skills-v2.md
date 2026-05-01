---
'@agentskit/skills': minor
---

feat(skills): v2 prompts for `translator`, `researcher`, `dataAnalyst`:

- `translator` (#452) — adds `translatorWithGlossary(entries)` factory. Glossary entries take priority over the model's default phrasing for downstream consistency. Bare `translator` export = empty-glossary instance.
- `researcher` (#453) — citation-first. Every non-trivial claim ships an inline numbered citation `[1]`; uncited claims are dropped. Primary sources preferred; contradictions surfaced rather than silently picked.
- `dataAnalyst` (#451) — tabular-aware. Inspects schema before writing SQL; distributions over means; explicit time windows; survivorship + selection bias called out; units on every number.
