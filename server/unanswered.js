// Questions the bot couldn't answer, collected in server/logs/unanswered.jsonl (one JSON object
// per line) so new answers can be added to src/chatConfig.js. Only the question is kept, with
// email addresses and phone numbers masked; nothing identifies who asked.
import { appendFile, mkdir } from 'node:fs/promises'

const folder = new URL('./logs/', import.meta.url)
const file = new URL('unanswered.jsonl', folder)

const mask = (text) =>
  text
    .replace(/\S+@\S+\.\S+/g, '[email]')
    .replace(/\+?\d[\d\s/-]{5,}\d/g, '[number]')
    .slice(0, 300)

export async function logUnanswered(text, lang) {
  try {
    await mkdir(folder, { recursive: true })
    await appendFile(file, `${JSON.stringify({ time: new Date().toISOString(), lang, text: mask(text) })}\n`)
  } catch (error) {
    console.warn(`Couldn't log an unanswered question: ${error.message}`)
  }
}
