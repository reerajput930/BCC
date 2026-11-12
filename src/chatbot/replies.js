// The website chat's answers, worked out right here in the visitor's browser: no server, and the
// messages never leave the visitor's device. From the answers in src/chatConfig.js and the dishes
// in src/menu.js:
// 1. a message that is only small talk ("thanks!", "hi") gets a small-talk reply;
// 2. a greeting in front of a question is answered together with the question;
// 3. several questions in one message ("open on Sunday and do you deliver?") get an answer each;
// 4. each question gets the dish it names (and what it asks about it), else the answer whose
//    keywords and example questions it matches best, typos allowed. When it's a close call, the
//    likely answers (and our team) are offered as buttons; when nothing fits, the fallback with
//    the "Open WhatsApp" button.
// The chat passes back the `context` of the previous reply, for follow-ups like "how much is it?".
import { chatConfig } from '../chatConfig.js'
import { pages } from '../i18n.js'
import { closureNotice, openNowLine } from './hours.js'
import { detectIntent, dishAnswer, dishesNamed, findDishes, intentIds } from './menuAnswers.js'
import { detectLanguage, similarWord, words } from './text.js'

const answers = [...chatConfig.quickReplies, ...chatConfig.faqs]
const answerById = new Map(answers.map((entry) => [entry.id, entry]))

// How an answer scores: KEYWORD for each keyword hit (MAX_KEYWORDS at most), EXAMPLE for each word
// the message shares with the closest example question, FOLLOW_UP for the previous reply's topic
// on a short follow-up question
const KEYWORD = 1
const MAX_KEYWORDS = 3
const EXAMPLE = 0.5
const FOLLOW_UP = 0.25
const SURE_SCORE = 1 // answer straight away from this score…
const SURE_MARGIN = 0.5 // …when the next best answer is at least this far behind
const UNSURE_SCORE = 0.5 // below that: offer the closest answers as buttons

// Answers about food, which a dish question already covers ("is the biryani vegan?")
const foodTopics = new Set(['food', 'prices', 'vegetarian', 'allergies', 'spice', 'weekly'])
// Words that point back to the dishes of the previous reply ("how much is it?")
const backReferences = new Set(['it', 'its', 'this', 'that', 'these', 'those', 'they', 'them', 'es', 'das', 'dies', 'diese', 'dieser', 'dieses', 'davon'])

const greeting = /^\s*(?:(?:hi+|hy|hey|hello|helo|hallo|namaste|servus|moin|hola|good (?:morning|afternoon|evening)|guten (?:morgen|tag|abend))\b[\s,!.]*)+/iu
const smallTalkWords = new Set([...chatConfig.smallTalk.flatMap((kind) => kind.words), ...chatConfig.smallTalkFiller])

// Words that say little about what someone wants, left out when comparing with the example
// questions. Question words that do say something ('where', 'wo', 'when', 'wann') stay in.
const stopWords = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'be', 'been', 'was', 'were', 'do', 'does', 'did', 'you', 'your',
  'u', 'ur', 'we', 'our', 'us', 'i', 'im', 'me', 'my', 'it', 'its', 'this', 'that', 'these', 'those',
  'to', 'of', 'in', 'on', 'at', 'for', 'from', 'with', 'by', 'as', 'and', 'or', 'but', 'if', 'so',
  'can', 'could', 'would', 'will', 'should', 'may', 'might', 'please', 'pls', 'plz', 'there', 'here',
  'what', 'whats', 'which', 'who', 'how', 'why', 'any', 'some', 'get', 'got', 'have', 'has', 'had',
  'want', 'wanna', 'like', 'need', 'tell', 'know', 'just', 'also', 'really', 'very', 'one', 'not',
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines', 'ist',
  'sind', 'bin', 'bist', 'seid', 'sein', 'war', 'hat', 'habt', 'haben', 'hast', 'gibt', 'es', 'ich',
  'du', 'sie', 'wir', 'ihr', 'euch', 'euer', 'eure', 'ihnen', 'ihre', 'mir', 'mich', 'dir', 'dich',
  'mein', 'meine', 'dein', 'deine', 'unser', 'unsere', 'man', 'zu', 'zum', 'zur', 'im', 'in', 'am',
  'an', 'auf', 'aus', 'bei', 'mit', 'für', 'von', 'vom', 'nach', 'und', 'oder', 'aber', 'wenn', 'wie',
  'was', 'welche', 'welcher', 'welches', 'wer', 'bitte', 'kann', 'können', 'kannst', 'könnt', 'könnte',
  'möchte', 'möchten', 'will', 'wollen', 'mal', 'noch', 'auch', 'schon', 'denn', 'doch', 'ja', 'nein',
  'nicht', 'kein', 'keine', 'etwas', 'gerne', 'gern', 'da', 'hier', 'sehr',
])

// The words of a text that matter, each once
const contentWords = (text) => [...new Set(words(text).filter((word) => !stopWords.has(word)))]

// Each answer's labels and example questions as content words, worked out once
const exampleWords = new Map(
  answers.map((entry) => [
    entry,
    [entry.label.en, entry.label.de, ...entry.examples].map(contentWords).filter((list) => list.length),
  ]),
)

// The reply to a typed message: { replies: [{ text, link?, handoff?, suggestions?, fallback? }], context }.
// handoff shows the "Open WhatsApp" button; suggestions: [{ label, topic? }] – a topic id, or else
// the label is sent as the next message; fallback: nothing fitted.
export function replyFor(text, previous = {}) {
  const context = cleanContext(previous)
  const lang = detectLanguage(text, context.lang ?? 'de')
  const said = words(text)

  const talk = smallTalk(said)
  if (talk) return { replies: [{ text: pick(talk.reply[lang]) }], context: { lang } }

  const question = text.replace(greeting, '')
  const greeted = question !== text && words(question).length > 0
  const answer = answerMessage(greeted ? question : text, lang, context)
  if (!answer) return fallback(lang)

  const [first, ...rest] = answer.replies
  const replies = greeted ? [{ ...first, text: chatConfig.greetingPrefix[lang] + first.text }, ...rest] : answer.replies
  return { replies, context: { lang, ...answer.context } }
}

// The reply to a topic button or suggestion (by answer id)
export function topicReply(id, lang = 'de') {
  const entry = answerById.get(id)
  if (!entry) return null
  return { replies: [entryReply(entry, lang)], context: { lang, topic: id } }
}

// A message with several questions gets an answer to each that the bot is sure about;
// otherwise it's answered as a whole.
function answerMessage(text, lang, context) {
  const parts = text
    .split(/[?!;\n]+|\.(?!\d)|\s(?:and|also|plus|und|außerdem|sowie)\s/iu)
    .filter((part) => words(part).length >= 2)
  if (parts.length > 1) {
    const results = []
    let partContext = context
    for (const part of parts) {
      const result = answerQuestion(part, lang, partContext)
      if (result?.sure && !results.some((other) => other.key === result.key)) {
        results.push(result)
        partContext = { ...partContext, ...result.context }
      }
    }
    if (results.length > 1) {
      return { replies: results.flatMap((result) => result.replies), context: results.at(-1).context }
    }
  }
  return answerQuestion(text, lang, context)
}

function answerQuestion(text, lang, context) {
  const said = words(text)
  const named = findDishes(text)
  const asked = detectIntent(text, named)
  const pointsBack = said.length <= 3 || said.some((word) => backReferences.has(word))
  const dishes = named.length ? named : asked && pointsBack ? dishesNamed(context.dishes ?? []) : []
  // "and the keema pav?" after "is the vada pav vegan?" asks the same thing again
  const asksAgain = /^\s*(?:and|und|also|auch|what about|how about|was ist mit)\b/iu.test(text)
  const intent = asked ?? (named.length && asksAgain ? (context.intent ?? null) : null)

  const ranked = rank(text, context)
  const verdict = judge(ranked)
  const [best] = ranked

  if (dishes.length) {
    const names = dishes.map((dish) => dish.name)
    const result = {
      sure: true,
      key: `dish: ${names.join(', ')} ${intent}`,
      replies: [dishAnswer(dishes, intent, lang, text)],
      context: { dishes: names, intent: intent ?? undefined },
    }
    // A question about something else that names a dish ("can I order biryani on Wolt?"): both
    if (!intent && verdict === 'sure' && best.hits && !foodTopics.has(best.entry.id)) {
      result.replies.unshift(entryReply(best.entry, lang))
      result.context.topic = best.entry.id
    }
    return result
  }

  if (verdict === 'sure') {
    return { sure: true, key: best.entry.id, replies: [entryReply(best.entry, lang)], context: { topic: best.entry.id } }
  }
  if (verdict === 'unsure') {
    const likely = ranked
      .filter(({ entry, score }) => score >= UNSURE_SCORE && score >= best.score - SURE_MARGIN && entry.id !== 'human')
      .slice(0, 3)
    return {
      sure: false,
      replies: [
        {
          text: chatConfig.unsureReply[lang],
          // …and always the way to a person
          suggestions: [...likely.map(({ entry }) => entry), answerById.get('human')].map((entry) => ({
            label: entry.label[lang],
            topic: entry.id,
          })),
        },
      ],
      context: {},
    }
  }
  return null
}

// All answers, best first: { entry, hits, score }
function rank(text, context) {
  const said = words(text)
  const content = contentWords(text)
  const followUp = said.length <= 5
  return answers
    .map((entry) => {
      const hits = Math.min(MAX_KEYWORDS, keywordHits(entry, said))
      const shared = exampleOverlap(entry, content)
      const score = hits * KEYWORD + shared * EXAMPLE + (followUp && entry.id === context.topic ? FOLLOW_UP : 0)
      return { entry, hits, score }
    })
    .sort((a, b) => b.score - a.score)
}

// 'sure', 'unsure' or 'none'
function judge([best, next]) {
  if (best.score >= SURE_SCORE && best.score - next.score >= SURE_MARGIN) return 'sure'
  return best.score >= UNSURE_SCORE ? 'unsure' : 'none'
}

// Keywords match the start of a word ('deliver' finds 'delivery'), longer ones also with a typo
// ('delivr'); one with a space matches those words in a row; `exact` words only on their own
function keywordHits(entry, said) {
  const phrase = ` ${said.join(' ')} `
  const keywords = (entry.keywords ?? []).filter((keyword) =>
    keyword.includes(' ')
      ? phrase.includes(` ${keyword}`)
      : said.some((word) => word.startsWith(keyword) || (keyword.length >= 5 && similarWord(word, keyword))),
  )
  const exact = (entry.exact ?? []).filter((word) => said.includes(word))
  return keywords.length + exact.length
}

// How many of the message's words the closest example question of an answer has, typos allowed
function exampleOverlap(entry, content) {
  let best = 0
  for (const example of exampleWords.get(entry)) {
    const shared = content.filter((word) => example.some((known) => similarWord(word, known))).length
    if (shared > best) best = shared
  }
  return best
}

function entryReply(entry, lang) {
  let text = typeof entry.reply === 'function' ? entry.reply(lang) : pick(entry.reply[lang])
  if (entry.id === 'hours') text = [openNowLine(lang), text, closureNotice(lang)].filter(Boolean).join('\n\n')
  return {
    text,
    link: linkFor(entry.link, lang),
    handoff: entry.handoff || undefined,
    suggestions: entry.related?.map((id) => ({ label: answerById.get(id).label[lang], topic: id })),
  }
}

// A page of this site in the visitor's language, or a link to another site
function linkFor(link, lang) {
  if (!link) return undefined
  const href = link.page ? pages[link.page][lang] + (link.hash ?? '') : link.href
  return href ? { label: link.label[lang], href } : undefined
}

// A message that's only small talk ("thank you so much!") → the kind of small talk
function smallTalk(said) {
  if (!said.length || !said.every((word) => smallTalkWords.has(word))) return null
  return chatConfig.smallTalk.find((kind) => said.some((word) => kind.words.includes(word))) ?? null
}

// Nothing fitted: say so, with the "Open WhatsApp" button (the topic buttons stay below)
function fallback(lang) {
  return { replies: [{ text: chatConfig.fallbackReply[lang], handoff: true, fallback: true }], context: { lang } }
}

const pick = (text) => (Array.isArray(text) ? text[Math.floor(Math.random() * text.length)] : text)

// Keep only context values the bot knows
function cleanContext(context) {
  if (!context || typeof context !== 'object') return {}
  const clean = {}
  if (context.lang === 'en' || context.lang === 'de') clean.lang = context.lang
  if (answerById.has(context.topic)) clean.topic = context.topic
  if (intentIds.includes(context.intent)) clean.intent = context.intent
  if (Array.isArray(context.dishes)) clean.dishes = dishesNamed(context.dishes.slice(0, 10)).map((dish) => dish.name)
  return clean
}
