import type { ChatSurfaceAdapter, ChatSurfaceEvent } from '@agentskit/runtime'

/**
 * Reference Microsoft Teams adapter consuming Bot Framework activity
 * payloads. Driver-light: no botbuilder dependency. Verification of
 * the inbound JWT (`Authorization: Bearer …` from the Bot Framework
 * service) is delegated to a `verifyToken` callback so deployers can
 * plug `botbuilder` or `jose` without forcing a heavy default.
 *
 * Reply path expects an injected `serviceClient` that knows how to
 * post to the channel's `serviceUrl` — abstracting auth + signing
 * keeps this adapter free of Azure SDKs.
 */

export interface TeamsAdapterOptions {
  /**
   * Verify the inbound `Authorization: Bearer <jwt>` header. Default:
   * **deny everything** so you cannot forget to plug auth in. Wire
   * to `botbuilder`'s `JwtTokenValidation.authenticateRequest` or any
   * JWT lib in production.
   */
  verifyToken?: (token: string, req: { headers: Record<string, string>; body: unknown }) => Promise<boolean> | boolean
  /** Post a reply to a conversation via the Bot Framework service URL. */
  serviceClient: TeamsServiceClient
}

export interface TeamsServiceClient {
  /** Send a text reply into a conversation. */
  sendMessage: (params: {
    serviceUrl: string
    conversationId: string
    text: string
    replyToId?: string
  }) => Promise<void>
}

interface TeamsActivity {
  /** 'message' | 'conversationUpdate' | 'messageReaction' | 'invoke' | 'typing' | ... */
  type: string
  id?: string
  timestamp?: string
  serviceUrl?: string
  channelId?: string
  conversation?: { id: string; name?: string; isGroup?: boolean; conversationType?: string }
  from?: { id: string; name?: string; aadObjectId?: string }
  recipient?: { id: string; name?: string }
  text?: string
  replyToId?: string
  attachments?: Array<{ name?: string; contentType?: string; contentUrl?: string }>
  reactionsAdded?: Array<{ type: string }>
  reactionsRemoved?: Array<{ type: string }>
  membersAdded?: Array<{ id: string; aadObjectId?: string }>
  membersRemoved?: Array<{ id: string }>
}

function defaultVerifyToken(): false {
  return false
}

export function teamsAdapter(options: TeamsAdapterOptions): ChatSurfaceAdapter {
  const verifyToken = options.verifyToken ?? defaultVerifyToken

  return {
    surface: 'teams',

    verify: async req => {
      const headers: Record<string, string> = {}
      for (const [k, v] of Object.entries(req.headers ?? {})) {
        if (typeof v === 'string') headers[k] = v
      }
      const auth = headers['authorization']
      if (typeof auth !== 'string' || !auth.toLowerCase().startsWith('bearer ')) return false
      const token = auth.slice('bearer '.length).trim()
      if (!token) return false
      return await verifyToken(token, { headers, body: req.body })
    },

    parse: req => {
      const activity = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as TeamsActivity
      const meta = {
        surface: 'teams' as const,
        eventId: activity.id ?? `${Date.now()}`,
        receivedAt: activity.timestamp,
        channel: {
          id: activity.conversation?.id ?? '',
          name: activity.conversation?.name,
          kind: activity.conversation?.isGroup ? ('group' as const) : ('channel' as const),
        },
        user: { id: activity.from?.id ?? '', name: activity.from?.name },
        threadId: activity.replyToId,
      }

      if (activity.type === 'message') {
        if (activity.attachments?.[0]?.contentUrl) {
          const a = activity.attachments[0]
          return {
            ...meta,
            type: 'file_upload',
            name: a.name ?? 'attachment',
            contentType: a.contentType,
            url: a.contentUrl,
          }
        }
        if (activity.replyToId) {
          return { ...meta, type: 'reply', text: activity.text ?? '', parentId: activity.replyToId }
        }
        // Teams "@mention" still arrives as `type: 'message'`; surface it
        // as `mention` when the text starts with the bot's name. We can't
        // know the bot name at adapter level without configuration, so
        // just treat all messages as `message` and let consumers refine
        // via filter / buildTask if they need explicit mention semantics.
        return { ...meta, type: 'message', text: activity.text ?? '' }
      }
      if (activity.type === 'messageReaction') {
        const reaction = activity.reactionsAdded?.[0] ?? activity.reactionsRemoved?.[0]
        if (!reaction) return null
        return {
          ...meta,
          type: 'reaction',
          messageId: activity.replyToId ?? '',
          emoji: reaction.type,
          added: Boolean(activity.reactionsAdded?.length),
        }
      }
      if (activity.type === 'conversationUpdate') {
        if (activity.membersAdded?.length || activity.membersRemoved?.length) {
          return {
            ...meta,
            type: 'installation',
            action: activity.membersAdded?.length ? 'installed' : 'uninstalled',
            tenantId: activity.from?.aadObjectId ?? activity.conversation?.id ?? '',
          }
        }
        return null
      }
      // typing / invoke / endOfConversation etc. — let the trigger 200-ignore.
      return null
    },

    reply: async (event, text) => {
      // The `WebhookRequest` body is already discarded, but Bot Framework
      // needs `serviceUrl` to send the reply. Deployers should pass it
      // through `buildContext` and inject it into a wrapper before
      // calling `reply`. Here we expose the canonical shape and rely on
      // the injected `serviceClient` to know `serviceUrl`.
      await options.serviceClient.sendMessage({
        serviceUrl: '', // populated by the serviceClient wrapper from the captured activity
        conversationId: event.channel.id,
        text,
        replyToId: 'threadId' in event ? event.threadId : undefined,
      })
    },
  }
}

export type { ChatSurfaceEvent }
