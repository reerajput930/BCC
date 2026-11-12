// Answers incoming WhatsApp messages with the reply rules. In dry-run mode
// (WHATSAPP_DRY_RUN, on unless set to false) the reply is only printed, not sent.
import { replyFor, whatsappText } from './replyRules.js'
import { sendText } from './whatsapp.js'

export const dryRun = process.env.WHATSAPP_DRY_RUN !== 'false'

// Meta can deliver the same webhook more than once: answer each message only once
const answered = new Set()

export async function answerMessage(message) {
  if (answered.has(message.id)) return
  answered.add(message.id)
  if (answered.size > 1000) answered.delete(answered.values().next().value)

  const reply = await replyFor(messageText(message), { channel: 'whatsapp' })
  const text = reply.replies.map(whatsappText).join('\n\n')

  if (dryRun) {
    console.log(`[dry run] would reply to ${message.from} (${reply.rule}):`)
    console.log(text.replace(/^/gm, '    │ '))
    return
  }

  try {
    await sendText({ to: message.from, body: text })
    console.log(`[bot] replied to ${message.from} (${reply.rule})`)
  } catch (error) {
    console.error(`[bot] reply to ${message.from} failed: ${error.message}`)
  }
}

function messageText(message) {
  if (message.type === 'text') return message.text.body
  if (message.type === 'button') return message.button.text // quick-reply button on a template
  return null // image, voice note, sticker, location...
}
