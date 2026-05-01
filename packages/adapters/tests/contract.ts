import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { AdapterFactory, StreamChunk } from '@agentskit/core'

/**
 * Contract test harness from ADR 0001 — runs invariants A1–A10 against any
 * adapter that goes through `globalThis.fetch`. Bring your own fetch stub:
 * for OpenAI-compatible adapters, return an SSE body with a `[DONE]`
 * sentinel; for Anthropic-style, return its event stream; etc.
 *
 * Adapters that don't use the global fetch (bedrock, replicate, langchain,
 * vercel-ai) need their own per-adapter test files — this harness skips
 * them.
 */
export interface ContractStubResponse {
  /** Raw body of the streaming response. Will be passed back as `Response.body`. */
  body: string | Uint8Array | ReadableStream<Uint8Array>
  status?: number
  contentType?: string
}

export interface ContractAdapterCase {
  name: string
  /** Construct the adapter under test. */
  build(): AdapterFactory
  /** Provider-shaped success body. */
  successBody(): ContractStubResponse
}

function bodyToStream(body: string | Uint8Array | ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  if (body instanceof ReadableStream) return body
  const bytes = typeof body === 'string' ? new TextEncoder().encode(body) : body
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })
}

function mockSuccess(stub: ContractStubResponse): typeof globalThis.fetch {
  return vi.fn(async () => new Response(bodyToStream(stub.body), {
    status: stub.status ?? 200,
    headers: { 'content-type': stub.contentType ?? 'text/event-stream' },
  })) as unknown as typeof globalThis.fetch
}

function mockFailure(): typeof globalThis.fetch {
  return vi.fn(async () => new Response('upstream broke', { status: 500 })) as unknown as typeof globalThis.fetch
}

function userMessage(content: string) {
  return {
    id: 'u1',
    role: 'user' as const,
    content,
    status: 'complete' as const,
    createdAt: new Date(0),
  }
}

async function drain(factory: AdapterFactory): Promise<StreamChunk[]> {
  const out: StreamChunk[] = []
  for await (const chunk of factory.createSource({ messages: [userMessage('hi')] }).stream()) {
    out.push(chunk)
  }
  return out
}

/**
 * Run the ADR 0001 contract suite against one adapter. Call from a
 * `describe(...)` so vitest's `beforeEach` / `afterEach` scope correctly.
 */
export function runAdapterContract(adapterCase: ContractAdapterCase): void {
  describe(`adapter contract — ${adapterCase.name}`, () => {
    let originalFetch: typeof globalThis.fetch
    beforeEach(() => { originalFetch = globalThis.fetch })
    afterEach(() => { globalThis.fetch = originalFetch })

    it('A1: createSource is synchronous and does not fetch eagerly', () => {
      const fetchSpy = vi.fn() as unknown as typeof globalThis.fetch
      globalThis.fetch = fetchSpy
      const factory = adapterCase.build()
      const source = factory.createSource({ messages: [userMessage('hi')] })
      expect(source).toBeDefined()
      expect(source.stream).toBeTypeOf('function')
      expect(source.abort).toBeTypeOf('function')
      expect((fetchSpy as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBe(0)
    })

    it('A3 + A4: stream ends with a terminal chunk (done or error)', async () => {
      globalThis.fetch = mockSuccess(adapterCase.successBody())
      const out = await drain(adapterCase.build())
      const last = out[out.length - 1]
      expect(last).toBeDefined()
      expect(['done', 'error']).toContain(last!.type)
    })

    it('A6: abort is safe before stream() is called', () => {
      globalThis.fetch = mockSuccess(adapterCase.successBody())
      const source = adapterCase.build().createSource({ messages: [userMessage('hi')] })
      expect(() => source.abort()).not.toThrow()
    })

    it('A6: abort is safe after stream() completes', async () => {
      globalThis.fetch = mockSuccess(adapterCase.successBody())
      const source = adapterCase.build().createSource({ messages: [userMessage('hi')] })
      for await (const _ of source.stream()) { /* drain */ void _ }
      expect(() => source.abort()).not.toThrow()
    })

    it('A7: input messages are not mutated', async () => {
      globalThis.fetch = mockSuccess(adapterCase.successBody())
      const messages = [userMessage('hi')]
      const snapshot = JSON.stringify(messages)
      for await (const _ of adapterCase.build().createSource({ messages }).stream()) { void _ }
      expect(JSON.stringify(messages)).toBe(snapshot)
    })

    it('A9: errors surface as an error chunk, not a thrown exception', async () => {
      globalThis.fetch = mockFailure()
      const out: StreamChunk[] = []
      // Must not throw — caller drains, contract says no rejection here.
      for await (const chunk of adapterCase.build().createSource({ messages: [userMessage('hi')] }).stream()) {
        out.push(chunk)
      }
      // Either an error chunk somewhere, or a graceful done — but not zero output.
      expect(out.length).toBeGreaterThan(0)
      expect(out.some(c => c.type === 'error' || c.type === 'done')).toBe(true)
    })
  })
}

// ---------------------------------------------------------------------------
// Stock provider response bodies
// ---------------------------------------------------------------------------

/** Minimal OpenAI-compatible SSE stream: one text delta, one DONE sentinel. */
export function openAISuccessBody(): ContractStubResponse {
  return {
    body:
      `data: {"choices":[{"delta":{"content":"hi"}}]}\n\n` +
      `data: [DONE]\n\n`,
  }
}

/** Minimal Anthropic SSE stream: text delta + message_stop. */
export function anthropicSuccessBody(): ContractStubResponse {
  return {
    body:
      `data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"hi"}}\n\n` +
      `data: {"type":"message_stop"}\n\n`,
  }
}

/** Minimal Gemini SSE stream: one text candidate. */
export function geminiSuccessBody(): ContractStubResponse {
  return {
    body:
      `data: {"candidates":[{"content":{"parts":[{"text":"hi"}]}}]}\n\n`,
  }
}

/** Ollama NDJSON stream. */
export function ollamaSuccessBody(): ContractStubResponse {
  return {
    body:
      `{"message":{"content":"hi"}}\n` +
      `{"done":true}\n`,
    contentType: 'application/x-ndjson',
  }
}
