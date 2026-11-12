import express from 'express'
import { sendTemplate, sendText } from './whatsapp.js'
import { appSecret, webhookRouter } from './webhook.js'
import { dryRun } from './bot.js'
import { prepareReplies, replyFor, topicReply } from './replyRules.js'

// Settings come from server/.env (loaded by node --env-file, see package.json).
// The website chat always runs. The WhatsApp Cloud API (Meta) part – webhook, WhatsApp bot and
// test routes – only runs with WHATSAPP_ENABLED=true; it isn't part of the current flow.
const whatsappEnabled = process.env.WHATSAPP_ENABLED === 'true'

if (whatsappEnabled) {
  const required = [
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_BUSINESS_ACCOUNT_ID',
    'WHATSAPP_TEST_RECIPIENT',
    'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
  ]
  const missing = required.filter((name) => !process.env[name] || process.env[name].startsWith('paste-'))
  if (missing.length) {
    console.error(`Fill in server/.env first. Missing: ${missing.join(', ')}`)
    process.exit(1)
  }
  if (!appSecret()) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Set WHATSAPP_APP_SECRET in server/.env: without it anyone could post fake webhook events')
      process.exit(1)
    }
    console.warn('No WHATSAPP_APP_SECRET in server/.env: webhook requests are not checked for Meta’s signature')
  }
}

const app = express()
// Keep the raw body too: the webhook signature is calculated over the exact bytes Meta sent
app.use(
  express.json({
    verify: (req, res, buffer) => {
      req.rawBody = buffer
    },
  }),
)

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// Website chat: { text } typed by the visitor, or { topic } (an answer id) for a button, plus the
// `context` of the previous reply → { replies: [{ text, link?, handoff?, suggestions? }], context }
app.post('/api/chat', async (req, res) => {
  const { text, topic, context } = req.body ?? {}
  const lang = context?.lang === 'de' ? 'de' : 'en'
  let reply = typeof topic === 'string' ? topicReply(topic, { lang }) : null

  if (!reply) {
    if (typeof text !== 'string' || !text.trim() || text.length > 500) {
      return res.status(400).json({ error: 'Send { text } with 1–500 characters' })
    }
    try {
      reply = await replyFor(text, { context })
    } catch (error) {
      console.error('Chat reply failed:', error)
      return res.status(500).json({ error: 'Chat reply failed' })
    }
  }
  if (process.env.NODE_ENV !== 'production') console.log(`[chat] ${reply.rule}`)
  res.json({ replies: reply.replies, context: reply.context })
})

if (whatsappEnabled) {
  app.use('/api/whatsapp/webhook', webhookRouter)

  // Test routes that message WHATSAPP_TEST_RECIPIENT.
  // Only for checking the setup, so they are switched off when NODE_ENV=production.
  if (process.env.NODE_ENV !== 'production') {
    const sendTest = (send) => async (req, res) => {
      try {
        const result = await send(req)
        res.json({ ok: true, messageId: result.messages?.[0]?.id, result })
      } catch (error) {
        console.error('WhatsApp test failed:', error.message)
        res.status(error.status ?? 500).json({ ok: false, error: error.message, details: error.details })
      }
    }

    // Meta's "hello_world" template: starts a conversation
    app.post(
      '/api/whatsapp/test',
      sendTest(() =>
        sendTemplate({ to: process.env.WHATSAPP_TEST_RECIPIENT, name: 'hello_world', language: 'en_US' }),
      ),
    )

    // Plain text, e.g. {"text": "Hi!"}: only arrives if the recipient messaged us in the last 24 hours
    app.post(
      '/api/whatsapp/test-text',
      sendTest((req) =>
        sendText({
          to: process.env.WHATSAPP_TEST_RECIPIENT,
          body: req.body?.text || 'Hello from Beyond Chai & Curry! 🍛',
        }),
      ),
    )
  }
}

// The chat answers by keywords until the language model is ready (a download of about
// 130 MB on the very first start, a few seconds after that)
const modelLoad = Date.now()
prepareReplies()
  .then(() => console.log(`Chat language model ready (${((Date.now() - modelLoad) / 1000).toFixed(1)} s)`))
  .catch((error) => console.error('Chat language model failed to load – answering by keywords only:', error))

const port = Number(process.env.PORT) || 3001
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port} – website chat at /api/chat`)
  if (!whatsappEnabled) {
    console.log('WhatsApp Cloud API: off (WHATSAPP_ENABLED=true in .env turns on the webhook and bot)')
  } else {
    console.log(
      dryRun
        ? 'WhatsApp bot: DRY RUN – replies are printed here, not sent (WHATSAPP_DRY_RUN=false in .env sends them)'
        : 'WhatsApp bot: LIVE – replies are sent on WhatsApp',
    )
  }
})
