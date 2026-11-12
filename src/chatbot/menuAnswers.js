// Answers about dishes on the menu (src/menu.js): which dishes a message names, what it asks
// about them (price, allergens, vegetarian/vegan, spice), and the reply.
// Allergen answers only repeat what the menu prints and always point to our team:
// the bot never says a dish is safe for someone.
import { additiveNames, allergenNames, dishes, menuSections } from '../menu.js'
import { similarWord, words } from './text.js'

const sections = new Map(menuSections.map((section) => [section.id, section]))

// Other words people use for words in the dish names
const aliases = {
  hähnchen: 'chicken',
  hühnchen: 'chicken',
  huhn: 'chicken',
  fisch: 'fish',
  prawn: 'prawns',
  shrimp: 'prawns',
  shrimps: 'prawns',
  garnelen: 'prawns',
  garnele: 'prawns',
  dal: 'daal',
  dhal: 'daal',
  chili: 'chilli',
}
// Words that only narrow dishes down: "veg" or "Goan" alone is a general question, not a dish
const weakWords = new Set(['veg', 'vegetable', 'goan', 'dakshin', 'nawabi', 'chilli', 'masala'])
const dishWords = dishes.map((dish) => ({ dish, words: words(dish.name) }))

const withoutNames = (said, named) => {
  const nameWords = named.flatMap((dish) => words(dish.name))
  return said.filter((word) => !nameWords.some((nameWord) => similarWord(aliases[word] ?? word, nameWord)))
}

// The dishes a message names. A full name wins ("chicken biryani"); otherwise every dish that
// shares the most words with it ("biryani" → both biryanis, "lassi" → all three).
export function findDishes(text) {
  const said = words(text).map((word) => aliases[word] ?? word)
  let found = []
  let bestScore = 0
  for (const { dish, words: name } of dishWords) {
    const matched = name.filter((word) => said.some((saidWord) => similarWord(saidWord, word)))
    if (!matched.some((word) => !weakWords.has(word))) continue
    // A full name beats any partial match, and a longer full name beats a shorter one
    const score = matched.length + (matched.length === name.length ? 10 : 0)
    if (score > bestScore) {
      found = [dish]
      bestScore = score
    } else if (score === bestScore) {
      found.push(dish)
    }
  }
  return found
}

// What a message asks about a dish. The first that matches wins.
const intents = [
  {
    id: 'allergens',
    prefixes: ['allerg', 'gluten', 'lactose', 'dairy', 'milk', 'nut', 'peanut', 'egg', 'soy', 'soja', 'sesam', 'mustard', 'senf', 'crustacean', 'shellfish', 'intoleran', 'contain', 'laktose', 'milch', 'nüss', 'erdnuss', 'enthält', 'unverträglich', 'krebs', 'schalenfr'],
    words: ['ei', 'eier'],
  },
  { id: 'diet', prefixes: ['vegan', 'vegetar', 'veggie', 'meat', 'fleisch'], words: ['veg'] },
  { id: 'spice', prefixes: ['spic', 'hot', 'mild', 'scharf', 'würzig'], words: [] },
  { id: 'price', prefixes: ['price', 'cost', 'expensive', 'cheap', 'euro', 'preis', 'kost', 'teuer', 'günstig'], words: ['much'] },
]
export const intentIds = intents.map((intent) => intent.id)

// Words of the dishes named don't count: "Goan Veg Thali" isn't a question about "veg"
export function detectIntent(text, named = []) {
  const said = withoutNames(words(text), named)
  const matches = ({ prefixes, words: exact }) =>
    said.some((word) => exact.includes(word) || prefixes.some((prefix) => word.startsWith(prefix)))
  return intents.find(matches)?.id ?? (text.includes('€') ? 'price' : null)
}

// Allergens a message names, as menu letters: "does it contain nuts?" → ['H']
const allergenWords = {
  A: ['gluten', 'wheat', 'weizen'],
  B: ['crustacean', 'shellfish', 'krebs'],
  C: ['egg', 'ei', 'eier'],
  D: ['fish', 'fisch'],
  E: ['peanut', 'erdnuss', 'erdnüsse'],
  F: ['soy', 'soja'],
  G: ['milk', 'dairy', 'lactose', 'milch', 'laktose'],
  H: ['nut', 'nuts', 'nüsse', 'schalenfrüchte'],
  J: ['mustard', 'senf'],
  K: ['sesame', 'sesam'],
}
function askedAllergens(text, dish) {
  const said = withoutNames(words(text), [dish])
  return Object.keys(allergenWords).filter((letter) =>
    allergenWords[letter].some((name) => said.some((word) => word === name || (name.length >= 5 && word.startsWith(name)))),
  )
}

// What a dish contains that makes it not vegetarian, from its name
const meatWords = {
  chicken: { en: 'chicken', de: 'Hähnchen' },
  keema: { en: 'chicken', de: 'Hähnchen' },
  fish: { en: 'fish', de: 'Fisch' },
  prawns: { en: 'prawns', de: 'Garnelen' },
}
function meatIn(dish, lang) {
  const word = words(dish.name).find((nameWord) => meatWords[nameWord])
  return word && meatWords[word][lang]
}

const euro = (price, lang) =>
  lang === 'de' ? `${price.toFixed(2).replace('.', ',')} €` : `€${price.toFixed(2)}`

const dietTag = (dish, lang) => {
  if (dish.diet === 'vegan') return ' 🌱 vegan'
  if (dish.diet === 'vegetarian') return lang === 'de' ? ' 🟢 vegetarisch' : ' 🟢 vegetarian'
  return ''
}

// "gluten (A), milk (G), colourings (4)"
function allergenList(dish, lang) {
  return [
    ...dish.allergens.map((letter) => `${allergenNames[letter][lang]} (${letter})`),
    ...(dish.additives ?? []).map((number) => `${additiveNames[number][lang]} (${number})`),
  ].join(', ')
}

const severeAllergyNote = {
  en: 'If you have a severe allergy, please check with our team before you order.',
  de: 'Bei einer schweren Allergie sprechen Sie bitte vor der Bestellung mit unserem Team.',
}

// Notes for a dish from its menu section: weekly changes, Fridays, what's served with it
function sectionNotes(section, lang) {
  const de = lang === 'de'
  const notes = []
  if (section.weekly) {
    notes.push(de ? 'Wechselt jede Woche – fragen Sie unser Team, was diese Woche auf der Karte steht.' : 'This changes every week – ask our team what’s on this week.')
  }
  if (section.friday) notes.push(de ? 'Gibt es freitags.' : 'Served on Fridays.')
  return notes
}

// The same notes, short, for a line in a list of dishes
function listNote(section, lang) {
  if (section.weekly) return lang === 'de' ? ' · wöchentlich' : ' · weekly'
  if (section.friday) return lang === 'de' ? ' · freitags' : ' · Fridays'
  return ''
}

function dishCard(dish, lang) {
  const section = sections.get(dish.section)
  const de = lang === 'de'
  const lines = [`${dish.name} – ${euro(dish.price, lang)}${dietTag(dish, lang)}`, (dish.about ?? section.about)[lang]]
  const allergens = allergenList(dish, lang)
  lines.push(
    allergens
      ? `${de ? 'Allergene' : 'Allergens'}: ${allergens}`
      : de
        ? 'Auf der Karte sind keine Allergene angegeben.'
        : 'No allergens are listed on our menu.',
  )
  if (section.servedWith) lines.push(`${de ? 'Dazu' : 'Served with it'}: ${section.servedWith[lang]}.`)
  lines.push(...sectionNotes(section, lang))
  return { text: lines.join('\n') }
}

function allergenAnswer(dish, lang, asked) {
  const de = lang === 'de'
  const section = sections.get(dish.section)
  const lines = []
  if (asked.length) {
    for (const letter of asked) {
      const name = `${allergenNames[letter][lang]} (${letter})`
      lines.push(
        dish.allergens.includes(letter)
          ? de
            ? `Ja – laut unserer Speisekarte enthält ${dish.name} ${name}.`
            : `Yes – according to our menu, ${dish.name} contains ${name}.`
          : de
            ? `Unsere Speisekarte gibt für ${dish.name} kein ${name} an.`
            : `Our menu doesn’t list ${name} for ${dish.name}.`,
      )
    }
  } else {
    const allergens = allergenList(dish, lang)
    lines.push(
      allergens
        ? de
          ? `Laut unserer Speisekarte enthält ${dish.name}: ${allergens}.`
          : `According to our menu, ${dish.name} contains: ${allergens}.`
        : de
          ? `Unsere Speisekarte gibt für ${dish.name} keine Allergene an.`
          : `Our menu lists no allergens for ${dish.name}.`,
    )
  }
  if (section.servedWith) lines.push(`${de ? 'Dazu' : 'Served with it'}: ${section.servedWith[lang]}.`)
  lines.push(severeAllergyNote[lang])
  return { text: lines.join('\n'), handoff: true }
}

function dietAnswer(dish, lang, text) {
  const de = lang === 'de'
  const askedVegan = words(text).some((word) => word.startsWith('vegan'))
  const meat = meatIn(dish, lang)
  if (dish.diet === 'vegan') {
    return { text: de ? `Ja, ${dish.name} ist laut Speisekarte vegan 🌱` : `Yes, ${dish.name} is marked vegan on our menu 🌱` }
  }
  if (dish.diet === 'vegetarian') {
    if (askedVegan) {
      return {
        text: de
          ? `${dish.name} ist vegetarisch 🟢, aber nicht als vegan gekennzeichnet.`
          : `${dish.name} is vegetarian 🟢, but it isn’t marked vegan.`,
      }
    }
    return { text: de ? `Ja, ${dish.name} ist vegetarisch 🟢` : `Yes, ${dish.name} is vegetarian 🟢` }
  }
  if (meat) return { text: de ? `Nein, ${dish.name} enthält ${meat}.` : `No, ${dish.name} contains ${meat}.` }
  return {
    text: de
      ? `${dish.name} ist auf unserer Speisekarte nicht als vegetarisch oder vegan gekennzeichnet – bitte fragen Sie unser Team.`
      : `${dish.name} isn’t marked vegetarian or vegan on our menu – please ask our team to be sure.`,
    handoff: true,
  }
}

function priceAnswer(dish, lang) {
  const de = lang === 'de'
  const section = sections.get(dish.section)
  const price = euro(dish.price, lang)
  const text = de ? `${dish.name} kostet ${price}.` : `${dish.name} costs ${price}.`
  if (!section.pickupDiscount) return { text }
  return { text: `${text} ${de ? 'Bei Selbstabholung sparen Sie 15 %.' : 'Pick it up yourself and save 15%.'}` }
}

function spiceAnswer(names, lang) {
  return {
    text:
      lang === 'de'
        ? `Wie scharf ${names} ist, sagt Ihnen gern unser Team 🌶️ Fragen Sie einfach vor der Bestellung.`
        : `Our team can tell you how hot ${names} is 🌶️ Just ask before you order.`,
    handoff: true,
  }
}

// Several dishes: a list, with what was asked about each
const LIST_LIMIT = 8
function listAnswer(found, intent, lang) {
  const de = lang === 'de'
  if (intent === 'spice') return spiceAnswer(found.map((dish) => dish.name).join(', '), lang)

  const shown = found.slice(0, LIST_LIMIT)
  const lines = shown.map((dish) => {
    if (intent === 'allergens') {
      const allergens = allergenList(dish, lang)
      return `• ${dish.name}: ${allergens || (de ? 'keine angegeben' : 'none listed')}`
    }
    if (intent === 'diet') {
      const tag = dietTag(dish, lang).trim()
      const meat = meatIn(dish, lang)
      return `• ${dish.name}: ${tag || (meat ? (de ? `mit ${meat}` : `with ${meat}`) : de ? 'nicht gekennzeichnet' : 'not marked')}`
    }
    return `• ${dish.name} – ${euro(dish.price, lang)}${dietTag(dish, lang)}${listNote(sections.get(dish.section), lang)}`
  })
  if (found.length > shown.length) {
    lines.push(de ? `… und ${found.length - shown.length} weitere` : `… and ${found.length - shown.length} more`)
  }

  const intro = de ? 'Auf unserer Speisekarte:' : 'On our menu:'
  const outro =
    intent === 'allergens'
      ? severeAllergyNote[lang]
      : de
        ? 'Zu welchem Gericht möchten Sie mehr wissen?'
        : 'Which one would you like to know more about?'
  return {
    text: [intro, ...lines, outro].join('\n'),
    handoff: intent === 'allergens' || undefined,
    suggestions: intent === 'allergens' ? undefined : shown.slice(0, 4).map((dish) => ({ label: dish.name })),
  }
}

// The reply about `found` dishes for the question `text`
export function dishAnswer(found, intent, lang, text) {
  if (found.length > 1) return listAnswer(found, intent, lang)
  const [dish] = found
  if (intent === 'allergens') return allergenAnswer(dish, lang, askedAllergens(text, dish))
  if (intent === 'diet') return dietAnswer(dish, lang, text)
  if (intent === 'price') return priceAnswer(dish, lang)
  if (intent === 'spice') return spiceAnswer(dish.name, lang)
  return dishCard(dish, lang)
}

// Dishes from an earlier answer, by name (the chat sends them back as context)
export function dishesNamed(names) {
  return names.map((name) => dishes.find((dish) => dish.name === name)).filter(Boolean)
}
