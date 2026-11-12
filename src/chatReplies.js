// Where the chat widget gets its answers: called with { text, quickReply, context } and resolves
// to { replies: [{ text, link?, handoff?, suggestions?, fallback? }], context }. The answers are
// worked out in the browser (src/chatbot/replies.js), so the chat needs no server. The widget sends
// `context` back with the next message, so follow-ups like "how much is it?" work.
import { replyFor, topicReply } from './chatbot/replies.js'

// "typing…" lasts a little longer for longer replies, like a person typing
export const typingTime = (text) => Math.min(450 + text.length * 8, 1600)

export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)))

export async function getReply({ text, quickReply, context = {} }) {
  const result = (quickReply && topicReply(quickReply.id, context.lang)) ?? replyFor(text, context)
  // A natural typing time before the reply shows
  await pause(typingTime(result.replies[0].text))
  return result
}
