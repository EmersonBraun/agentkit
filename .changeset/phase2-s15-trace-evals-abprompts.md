---
'@agentskit/observability': minor
'@agentskit/eval': minor
'@agentskit/core': minor
---

Phase 2 sprint S15 — issues #149, #150, #151.

- `@agentskit/observability` — `createFileTraceSink(dir)` +
  `buildTraceReport` + `renderTraceViewerHtml`. Offline
  Jaeger-style trace viewer: persist spans as JSON, render a
  self-contained HTML waterfall with no runtime deps.
- `@agentskit/eval/ci` — `renderJUnit`, `renderMarkdown`,
  `renderGitHubAnnotations`, and a one-shot `reportToCi` that
  writes artifacts, appends a summary, emits annotations, and
  returns pass/fail vs. `minAccuracy`. Paired with a
  `.github/actions/agentskit-evals` composite action for drop-in
  PR gating.
- `@agentskit/core/prompt-experiments` — `createPromptExperiment`
  + `stickyResolver` + `flagResolver`. A/B-test prompts with any
  feature-flag provider (PostHog / GrowthBook / custom); sticky
  fallback guarantees every user gets a prompt even when the flag
  service is down.
