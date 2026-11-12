// WhatsApp Cloud API calls. Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
const API_VERSION = 'v25.0'

// Sends an approved message template, e.g. Meta's built-in "hello_world".
// Templates can start a conversation.
export function sendTemplate({ to, name, language = 'en_US' }) {
  return sendMessage(to, { type: 'template', template: { name, language: { code: language } } })
}

// Sends plain text. Only delivered within 24 hours of the customer's last message to us.
export function sendText({ to, body }) {
  return sendMessage(to, { type: 'text', text: { body } })
}

async function sendMessage(to, message) {
  const url = `https://graph.facebook.com/${API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/\D/g, ''), ...message }),
  })

  const data = await response.json()
  if (!response.ok) {
    // Meta explains the problem in data.error (message, code, error_subcode, fbtrace_id)
    const error = new Error(data.error?.message ?? `WhatsApp API answered ${response.status}`)
    error.status = response.status
    error.details = data.error
    throw error
  }
  return data
}
