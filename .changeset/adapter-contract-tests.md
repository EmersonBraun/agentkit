---
'@agentskit/adapters': minor
---

feat(adapters): contract test harness — `runAdapterContract` exercises the ADR 0001 invariants (A1, A3+A4, A6, A7, A9) against any fetch-driven adapter. Stock success-body factories ship for OpenAI, Anthropic, Gemini, and Ollama protocols. The harness runs against 17 adapters today (openai, anthropic, gemini, grok, deepseek, kimi, mistral, cohere, together, groq, fireworks, openrouter, huggingface, ollama, lmstudio, vllm, llamacpp). New adapter authors get the full suite for free with one `runAdapterContract({ name, build, successBody })` call.
