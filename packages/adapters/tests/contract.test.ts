import {
  runAdapterContract,
  openAISuccessBody,
  anthropicSuccessBody,
  geminiSuccessBody,
  ollamaSuccessBody,
} from './contract'
import {
  openai,
  anthropic,
  gemini,
  grok,
  deepseek,
  kimi,
  mistral,
  cohere,
  together,
  groq,
  fireworks,
  openrouter,
  huggingface,
  ollama,
  lmstudio,
  vllm,
  llamacpp,
} from '../src/index'

const oai = openAISuccessBody
const anth = anthropicSuccessBody
const gem = geminiSuccessBody
const oll = ollamaSuccessBody

// One contract block per adapter — all OpenAI-compatible adapters share the
// same fetch shape, so they share the same successBody factory.
runAdapterContract({ name: 'openai',     build: () => openai({ apiKey: 'k', model: 'gpt-4o-mini' }), successBody: oai })
runAdapterContract({ name: 'anthropic',  build: () => anthropic({ apiKey: 'k', model: 'claude-sonnet-4-6' }), successBody: anth })
runAdapterContract({ name: 'gemini',     build: () => gemini({ apiKey: 'k', model: 'gemini-2.5-flash' }), successBody: gem })
runAdapterContract({ name: 'grok',       build: () => grok({ apiKey: 'k', model: 'grok-2' }), successBody: oai })
runAdapterContract({ name: 'deepseek',   build: () => deepseek({ apiKey: 'k', model: 'deepseek-chat' }), successBody: oai })
runAdapterContract({ name: 'kimi',       build: () => kimi({ apiKey: 'k', model: 'moonshot-v1-8k' }), successBody: oai })
runAdapterContract({ name: 'mistral',    build: () => mistral({ apiKey: 'k', model: 'mistral-small-latest' }), successBody: oai })
runAdapterContract({ name: 'cohere',     build: () => cohere({ apiKey: 'k', model: 'command-r-plus' }), successBody: oai })
runAdapterContract({ name: 'together',   build: () => together({ apiKey: 'k', model: 'meta-llama/Llama-3-70b' }), successBody: oai })
runAdapterContract({ name: 'groq',       build: () => groq({ apiKey: 'k', model: 'llama-3.3-70b-versatile' }), successBody: oai })
runAdapterContract({ name: 'fireworks',  build: () => fireworks({ apiKey: 'k', model: 'accounts/fireworks/models/llama-v3-70b-instruct' }), successBody: oai })
runAdapterContract({ name: 'openrouter', build: () => openrouter({ apiKey: 'k', model: 'meta-llama/llama-3-70b' }), successBody: oai })
runAdapterContract({ name: 'huggingface',build: () => huggingface({ apiKey: 'k', model: 'meta-llama/Llama-3-70b' }), successBody: oai })
runAdapterContract({ name: 'ollama',     build: () => ollama({ model: 'llama3.1' }), successBody: oll })
runAdapterContract({ name: 'lmstudio',   build: () => lmstudio({ apiKey: 'lm-studio', model: 'local-model' }), successBody: oai })
runAdapterContract({ name: 'vllm',       build: () => vllm({ apiKey: 'k', model: 'meta-llama/Llama-3-70b' }), successBody: oai })
runAdapterContract({ name: 'llamacpp',   build: () => llamacpp({ apiKey: 'k', model: 'local' }), successBody: oai })

// Adapters that need their own contract surface (different fetch shape, SDK
// peer dep, or two-step protocol) live in dedicated test files:
//   - bedrock     → tests/bedrock.test.ts (uses an injected SDK client)
//   - replicate   → tests/replicate.test.ts (two-step prediction + SSE)
//   - vertex      → tests/vertex.test.ts (OAuth tokens)
//   - azureOpenAI → tests/azure-openai.test.ts (deployment + api-version)
//   - langchain / langgraph / vercelAI → wrap third-party runtimes
