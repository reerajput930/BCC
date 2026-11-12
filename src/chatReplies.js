// Where the chat widget gets its answers: called with { text, quickReply, context } and resolves
// to { replies: [{ text, link?, handoff?, suggestions? }], context }. The server picks the replies
// (server/replyRules.js); the widget sends `context` back with the next message, so follow-ups
// like "how much is it?" work. In development Vite forwards /api to the server on port 3001.

// "typing…" lasts a little longer for longer replies, like a person typing
export const typingTime = (text) => Math.min(450 + text.length * 8, 1600)

export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)))

export async function getReply({ text, quickReply, context = {} }) {
  // "Talk to human" never needs the server, so it works even when the server is down
  if (quickReply?.id === 'human') {
    const reply = quickReply.reply[context.lang ?? 'en']
    await pause(typingTime(reply))
    return { replies: [{ text: reply, handoff: true }], context }
  }

  const started = Date.now()
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...(quickReply ? { topic: quickReply.id } : { text }), context }),
  })
  if (!response.ok) throw new Error(`Chat server answered ${response.status}`)
  const result = await response.json()
  // The rest of a natural typing time, so a reply doesn't pop up before the visitor's own message settles
  await pause(typingTime(result.replies[0].text) - (Date.now() - started))
  return result
}
