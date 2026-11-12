// Picks the replies to a chat message for the WhatsApp bot (switched off; the website chat now
// answers in the browser, src/chatbot/replies.js), from the answers in src/chatConfig.js and the
// dishes in src/menu.js:
// 1. a menu number on WhatsApp ("2") gets that topic;
// 2. a message that is only small talk ("thanks!", "hi") gets a small-talk reply;
// 3. a greeting in front of a question is answered together with the question;
// 4. several questions in one message ("open on Sunday and do you deliver?") get an answer each;
// 5. each question gets the dish it names (and what it asks about it), else the answer closest
//    in meaning (semantic.js) with a head start for keyword hits. When unsure, the closest
//    answers are offered as suggestions; when nothing fits, the fallback (and it's logged).
// The chat sends back the `context` of the previous reply, for follow-ups like "how much is it?".
import { chatConfig } from '../src/chatConfig.js'
import { closureNotice, openNowLine } from '../src/chatbot/hours.js'
import { detectIntent, dishAnswer, dishesNamed, findDishes, intentIds } from '../src/chatbot/menuAnswers.js'
import { embed, loadModel, similarity } from './semantic.js'
import { detectLanguage, keywordHits, words } from '../src/chatbot/text.js'
import { logUnanswered } from './unanswered.js'

const topics = chatConfig.quickReplies
const answers = [...topics, ...chatConfig.faqs]
const answerById = new Map(answers.map((entry) => [entry.id, entry]))
const menu = topics.map((topic, i) => `${i + 1}. ${topic.label.en}`).join('\n')

// When one of these is closest, the question isn't about us and the bot says it doesn't know
const offTopic = {
  id: 'off-topic',
  label: { en: 'Off topic', de: 'Themenfremd' },
  examples: [
    'What is the weather today?',
    'Tell me a joke',
    'Who won the football game?',
    'Write me some code',
    'Do you sell clothes or shoes?',
    'What is the capital of France?',
    'Can you help me with my homework?',
    'Who should I vote for?',
    'Wie wird das Wetter morgen?',
    'Erzähl mir einen Witz',
    'Kannst du mir bei den Hausaufgaben helfen?',
  ],
}

// How sure the bot must be. A score is the language model's similarity (see semantic.js) plus
// KEYWORD_BONUS per keyword hit, two at most. Tuned with `npm run check`.
const KEYWORD_BONUS = 0.05
const CONTEXT_BONUS = 0.02 // for the previous reply's topic, on short follow-up questions
const SURE_SCORE = 0.87 // answer straight away from this score…
const SURE_MARGIN = 0.015 // …when the next best answer is at least this far behind
const UNSURE_SCORE = 0.84 // below SURE: offer the closest answers as suggestions
const SUGGESTION_RANGE = 0.03 // how close to the best answer a suggestion must be

// Answers about food, which a dish question already covers ("is the biryani vegan?")
const foodTopics = new Set(['food', 'prices', 'vegetarian', 'allergies', 'spice', 'weekly'])
// Words that point back to the dishes of the previous reply ("how much is it?")
const backReferences = new Set(['it', 'its', 'this', 'that', 'these', 'those', 'they', 'them', 'es', 'das', 'dies', 'diese', 'dieser', 'dieses', 'davon'])

const greeting = /^\s*(?:(?:hi+|hey|hello|helo|hallo|namaste|servus|moin|hola|good (?:morning|afternoon|evening)|guten (?:morgen|tag|abend))\b[\s,!.]*)+/iu
const smallTalkWords = new Set([...chatConfig.smallTalk.flatMap((kind) => kind.words), ...chatConfig.smallTalkFiller])

let index = null // [{ entry, vector }] for every example, once the model has loaded

// Loads the language model and compares all examples once. Until it's done (or if it fails),
// messages are matched by keywords only.
export async function prepareReplies() {
  await loadModel()
  const items = [...answers, offTopic].flatMap((entry) =>
    [entry.label.en, entry.label.de, ...entry.examples].map((text) => ({ entry, text })),
  )
  const vectors = await embed(items.map((item) => item.text))
  index = items.map((item, i) => ({ entry: item.entry, vector: vectors[i] }))
}

// channel: 'web' or 'whatsapp'. Returns { rule, replies: [{ text, link?, handoff?, suggestions? }], context }.
// rule names what matched, for logs; handoff shows the "Open WhatsApp" button;
// suggestions: [{ label, topic? }] – a topic id, or else the label is sent as the next message.
export async function replyFor(text, { channel = 'web', context: previous } = {}) {
  const context = cleanContext(previous)
  if (typeof text !== 'string' || !text.trim()) return fallback(channel, context.lang ?? 'en', 'fallback (not a text message)')

  const lang = detectLanguage(text, context.lang)
  const said = words(text)

  const number = channel === 'whatsapp' && text.trim().match(/^(\d+)\.?$/)?.[1]
  const numbered = number && topics[Number(number) - 1]
  if (numbered) return topicReply(numbered.id, { channel, lang, rule: `menu ${number}: ${numbered.label.en}` })

  const talk = smallTalk(said)
  if (talk) {
    const reply = pick(talk.reply[lang])
    return {
      rule: `small talk: ${talk.id}`,
      replies: [{ text: channel === 'whatsapp' && talk.id === 'greeting' ? withMenu(reply) : reply }],
      context: { lang },
    }
  }

  const question = text.replace(greeting, '')
  const greeted = question !== text && words(question).length > 0
  const answer = await answerMessage(greeted ? question : text, lang, context, channel)
  if (!answer) {
    logUnanswered(text, lang)
    return fallback(channel, lang, 'fallback')
  }
  if (!answer.sure) logUnanswered(text, lang)

  const [first, ...rest] = answer.replies
  const replies = greeted ? [{ ...first, text: chatConfig.greetingPrefix[lang] + first.text }, ...rest] : answer.replies
  return { rule: answer.rule, replies, context: { lang, ...answer.context } }
}

// The answer for a topic button (by id), or for a menu number on WhatsApp
export function topicReply(id, { channel = 'web', lang = 'en', rule = `button: ${id}` } = {}) {
  const entry = answerById.get(id)
  if (!entry) return null
  return { rule, replies: [entryReply(entry, lang, channel)], context: { lang, topic: id } }
}

// WhatsApp messages are plain text, so a link goes on its own line
export function whatsappText({ text, link }) {
  return link ? `${text}\n\n${link.label}: ${link.href}` : text
}

// A message with several questions gets an answer to each that the bot is sure about;
// otherwise it's answered as a whole.
async function answerMessage(text, lang, context, channel) {
  const parts = text
    .split(/[?!;\n]+|\.(?!\d)|\s(?:and|also|plus|und|außerdem|sowie)\s/iu)
    .filter((part) => words(part).length >= 2)
  if (parts.length > 1) {
    const results = []
    let partContext = context
    for (const part of parts) {
      const result = await answerQuestion(part, lang, partContext, channel)
      if (result?.sure && !results.some((other) => other.key === result.key)) {
        results.push(result)
        partContext = { ...partContext, ...result.context }
      }
    }
    if (results.length > 1) {
      return {
        sure: true,
        rule: results.map((result) => result.rule).join(' + '),
        replies: results.flatMap((result) => result.replies),
        context: results.at(-1).context,
      }
    }
  }
  return answerQuestion(text, lang, context, channel)
}

async function answerQuestion(text, lang, context, channel) {
  const said = words(text)
  const named = findDishes(text)
  const asked = detectIntent(text, named)
  const pointsBack = said.length <= 3 || said.some((word) => backReferences.has(word))
  const dishes = named.length ? named : asked && pointsBack ? dishesNamed(context.dishes ?? []) : []
  // "and the keema pav?" after "is the vada pav vegan?" asks the same thing again
  const asksAgain = /^\s*(?:and|und|also|auch|what about|how about|was ist mit)\b/iu.test(text)
  const intent = asked ?? (named.length && asksAgain ? (context.intent ?? null) : null)

  const ranked = await rank(said, text, context)
  const verdict = judge(ranked)
  const [best] = ranked

  if (dishes.length) {
    const names = dishes.map((dish) => dish.name)
    const result = {
      sure: true,
      key: `dish: ${names.join(', ')} ${intent}`,
      rule: `dish: ${names.join(', ')}${intent ? ` (${intent})` : ''}`,
      replies: [dishAnswer(dishes, intent, lang, text)],
      context: { dishes: names, intent: intent ?? undefined },
    }
    // A question about something else that names a dish ("can I order biryani on Wolt?"): both
    if (!intent && verdict === 'sure' && best.hits && !foodTopics.has(best.entry.id)) {
      result.rule = `${best.entry.id} + ${result.rule}`
      result.replies.unshift(entryReply(best.entry, lang, channel))
      result.context.topic = best.entry.id
    }
    return result
  }

  if (verdict === 'sure') {
    return {
      sure: true,
      key: best.entry.id,
      rule: `${best.entry.id} (${best.score.toFixed(3)})`,
      replies: [entryReply(best.entry, lang, channel)],
      context: { topic: best.entry.id },
    }
  }
  if (verdict === 'unsure') {
    const likely = ranked
      .filter(({ entry, score }) => entry !== offTopic && score >= best.score - SUGGESTION_RANGE)
      .slice(0, 3)
    return {
      sure: false,
      rule: `unsure: ${likely.map(({ entry, score }) => `${entry.id} ${score.toFixed(3)}`).join(', ')}`,
      replies: [
        {
          text: chatConfig.unsureReply[lang],
          suggestions: likely.map(({ entry }) => ({ label: entry.label[lang], topic: entry.id })),
        },
      ],
      context: {},
    }
  }
  return null
}

// All answers, best first: { entry, meaning, hits, score }
async function rank(said, text, context) {
  const meanings = new Map()
  if (index) {
    const [vector] = await embed([text])
    for (const { entry, vector: example } of index) {
      const score = similarity(vector, example)
      if (score > (meanings.get(entry) ?? -1)) meanings.set(entry, score)
    }
  }
  const followUp = said.length <= 5
  return [...answers, offTopic]
    .map((entry) => {
      const meaning = meanings.get(entry) ?? 0
      const hits = Math.min(2, keywordHits(entry.keywords, said))
      const bonus = hits * KEYWORD_BONUS + (followUp && entry.id === context.topic ? CONTEXT_BONUS : 0)
      return { entry, meaning, hits, score: meaning + bonus }
    })
    .sort((a, b) => b.score - a.score)
}

// 'sure', 'unsure' or 'none'
function judge([best, next]) {
  if (best.entry === offTopic) return 'none'
  const margin = best.score - next.score
  // Without the language model, a keyword hit is all there is
  if (!index) return best.hits && margin > 0 ? 'sure' : 'none'
  if (best.score >= SURE_SCORE && margin >= SURE_MARGIN) return 'sure'
  return best.score >= UNSURE_SCORE ? 'unsure' : 'none'
}

function entryReply(entry, lang, channel) {
  let text = typeof entry.reply === 'function' ? entry.reply(lang) : pick(entry.reply[lang])
  if (entry.id === 'hours') text = [openNowLine(lang), text, closureNotice(lang)].filter(Boolean).join('\n\n')

  if (channel === 'whatsapp') {
    return { text: entry.whatsappReply ?? text, link: whatsappLink(entry.link, lang) }
  }
  return {
    text,
    link: entry.link?.href ? { label: entry.link.label[lang], href: entry.link.href } : undefined,
    handoff: entry.handoff || undefined,
    suggestions: entry.related?.map((id) => ({ label: answerById.get(id).label[lang], topic: id })),
  }
}

// A message that's only small talk ("thank you so much!") → the kind of small talk
function smallTalk(said) {
  if (!said.length || !said.every((word) => smallTalkWords.has(word))) return null
  return chatConfig.smallTalk.find((kind) => said.some((word) => kind.words.includes(word))) ?? null
}

function fallback(channel, lang, rule) {
  if (channel === 'whatsapp') return { rule, replies: [{ text: withMenu(chatConfig.whatsapp.fallbackReply) }], context: { lang } }
  return { rule, replies: [{ text: chatConfig.fallbackReply[lang] }], context: { lang } }
}

function withMenu(intro) {
  return `${intro}\n\n${menu}\n\n${chatConfig.whatsapp.menuHint}`
}

const pick = (text) => (Array.isArray(text) ? text[Math.floor(Math.random() * text.length)] : text)

// The context the chat sent back comes from the browser: keep only values the bot knows
function cleanContext(context) {
  if (!context || typeof context !== 'object') return {}
  const clean = {}
  if (context.lang === 'en' || context.lang === 'de') clean.lang = context.lang
  if (answerById.has(context.topic)) clean.topic = context.topic
  if (intentIds.includes(context.intent)) clean.intent = context.intent
  if (Array.isArray(context.dishes)) {
    clean.dishes = dishesNamed(context.dishes.slice(0, 10)).map((dish) => dish.name)
  }
  return clean
}

// Site pages need the site's address (SITE_URL); a WhatsApp link is pointless inside WhatsApp.
function whatsappLink(link, lang) {
  if (!link?.href || link.href.startsWith('https://wa.me/')) return undefined
  const label = link.label[lang]
  if (!link.href.startsWith('/')) return { label, href: link.href }
  if (!process.env.SITE_URL) return undefined
  return { label, href: new URL(link.href, process.env.SITE_URL).href }
}
