---
'@agentskit/core': patch
'@agentskit/adapters': patch
'@agentskit/runtime': patch
'@agentskit/memory': patch
'@agentskit/rag': patch
'@agentskit/tools': patch
'@agentskit/react': patch
---

docs: expand package READMEs with subpath tables + full ecosystem
coverage, reflecting every feature shipped through Phase 3.

- `@agentskit/core`: 11 subpath exports documented.
- `@agentskit/adapters`: 20+ providers + higher-order adapters
  (router / ensemble / fallback).
- `@agentskit/runtime`: durable execution + topologies + speculate
  + background agents.
- `@agentskit/memory`: pgvector / Pinecone / Qdrant / Chroma /
  Upstash + encrypted / hierarchical / graph / personalization.
- `@agentskit/rag`: rerankers (BM25 / Cohere / BGE) + hybrid +
  document loaders.
- `@agentskit/tools`: MCP bridge + 20 provider integrations.
- `@agentskit/react`: cross-link to Vue / Svelte / Solid / RN /
  Angular / Ink bindings.

No code changes.
