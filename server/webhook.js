// Webhook that Meta calls with incoming WhatsApp messages and delivery updates.
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
import crypto from 'node:crypto'
import express from 'express'
import { answerMessage } from './bot.js'

export const webhookRouter = express.Router()

// Meta's one-time check when you save the callback URL in the app dashboard
webhookRouter.get('/', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('[webhook] verified by Meta')
    res.type('text/plain').send(req.query['hub.challenge'])
  } else {
    console.warn('[webhook] verification refused: wrong verify token')
    res.sendStatus(403)
  }
})

webhookRouter.post('/', (req, res) => {
  if (!hasValidSignature(req)) {
    console.warn('[webhook] rejected a request without a valid Meta signature')
    return res.sendStatus(401)
  }
  // Answer straight away: Meta retries anything that isn't a quick 200
  res.sendStatus(200)

  for (const entry of req.body?.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field === 'messages') handleMessagesChange(change.value)
    }
  }
})

// Meta signs each request with the App Secret (X-Hub-Signature-256: sha256=<hmac of the raw body>)
function hasValidSignature(req) {
  const secret = appSecret()
  if (!secret) return true // index.js warns at startup that requests aren't checked
  const received = Buffer.from(req.get('x-hub-signature-256') ?? '')
  const expected = Buffer.from(
    `sha256=${crypto.createHmac('sha256', secret).update(req.rawBody ?? '').digest('hex')}`,
  )
  return received.length === expected.length && crypto.timingSafeEqual(received, expected)
}

export function appSecret() {
  const secret = process.env.WHATSAPP_APP_SECRET
  return secret && !secret.startsWith('paste-') ? secret : null
}

function handleMessagesChange({ metadata, contacts = [], messages = [], statuses = [] } = {}) {
  // Only answer for our own number, in case other numbers get added to the account
  const forUs = metadata?.phone_number_id === process.env.WHATSAPP_PHONE_NUMBER_ID

  for (const message of messages) {
    const name = contacts.find((contact) => contact.wa_id === message.from)?.profile?.name
    const content = message.type === 'text' ? `"${message.text.body}"` : `[${message.type}]`
    console.log(`[webhook] message from ${message.from}${name ? ` (${name})` : ''}: ${content}`)
    if (forUs) answerMessage(message)
  }

  // sent, delivered, read or failed, for messages we sent
  for (const status of statuses) {
    console.log(`[webhook] ${status.status} → ${status.recipient_id} (${status.id})`)
    for (const error of status.errors ?? []) {
      const detail = error.error_data?.details ?? error.message
      console.log(`[webhook]   error ${error.code}: ${error.title}${detail ? ` – ${detail}` : ''}`)
    }
  }
}
