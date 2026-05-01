---
'@agentskit/skills': minor
---

feat(skills): add four new built-in skills:

- `sqlAnalyst` (#449) — read-only data analyst. Refuses writes; one query at a time; explains results.
- `technicalWriter` (#450) — skim-friendly docs; no marketing voice; TL;DR-first structure.
- `securityAuditor` (#454) — security review with severity ladder and `file:line + exploit + fix` finding format.
- `customerSupport` (#455) — first-line support with policy/escalation rules, never invents timeframes.
