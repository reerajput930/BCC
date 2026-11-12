// Small text helpers for the chat bot: splitting into words, guessing the language,
// and comparing words with room for typos.

// Lowercase words (letters and digits), e.g. "Wann habt ihr offen?" → ['wann', 'habt', 'ihr', 'offen']
export function words(text) {
  return text.normalize('NFC').toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
}

// Words that are typical for one language and rare in the other
const germanWords = new Set([
  'ich', 'du', 'wir', 'ihr', 'euch', 'eure', 'euer', 'ihnen', 'habt', 'haben', 'hat', 'ist', 'sind',
  'gibt', 'es', 'kann', 'können', 'wann', 'wo', 'wie', 'was', 'welche', 'welcher', 'bitte', 'danke',
  'hallo', 'nicht', 'kein', 'keine', 'mit', 'ohne', 'für', 'und', 'oder', 'auch', 'heute', 'morgen',
  'geöffnet', 'offen', 'liefert', 'liefern', 'bestellen', 'essen', 'tisch', 'preis', 'kostet', 'der',
  'die', 'das', 'ein', 'eine', 'einen', 'zu', 'zum', 'bei', 'noch', 'mein', 'meine', 'mir', 'bin',
  'gericht', 'gerichte', 'scharf', 'ja', 'nein', 'macht', 'sie', 'gut', 'guten', 'tag',
])
const englishWords = new Set([
  'i', 'you', 'your', 'we', 'do', 'does', 'is', 'are', 'can', 'could', 'what', 'whats', 'when', 'where',
  'how', 'which', 'the', 'a', 'and', 'or', 'with', 'without', 'for', 'have', 'has', 'open', 'today',
  'tonight', 'please', 'thanks', 'my', 'me', 'order', 'food', 'any', 'there', 'it', 'this', 'that',
  'of', 'to', 'much', 'dish', 'dishes', 'yes', 'no', 'hi', 'hello', 'good',
])

// 'de' or 'en' by which language's typical words the text has more of; `fallback` on a tie
export function detectLanguage(text, fallback = 'en') {
  let german = /[äöüß]/i.test(text) ? 1 : 0
  let english = 0
  for (const word of words(text)) {
    if (germanWords.has(word)) german++
    if (englishWords.has(word)) english++
  }
  if (german === english) return fallback
  return german > english ? 'de' : 'en'
}

// Whether two words are the same allowing for a typo: one letter wrong, missing, extra or
// swapped ('biriyani' – 'biryani', 'panner' – 'paneer'), only for words of 5+ letters.
// A word of 4+ letters also matches the start of a longer one ('prawn' – 'prawns').
export function similarWord(said, known) {
  if (said === known) return true
  const shorter = said.length < known.length ? said : known
  const longer = shorter === said ? known : said
  if (shorter.length >= 4 && longer.startsWith(shorter)) return true
  return said.length >= 5 && known.length >= 5 && editDistance(said, known) <= 1
}

// Optimal string alignment distance: inserts, deletes, changes and swaps of neighbouring letters
function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) rows[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const change = a[i - 1] === b[j - 1] ? 0 : 1
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + change)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1)
      }
    }
  }
  return rows[a.length][b.length]
}

// Keywords match the start of a word ('deliver' finds 'delivery'); one with a space matches
// those words in a row
export function keywordHits(keywords = [], said) {
  const phrase = ` ${said.join(' ')}`
  return keywords.filter((keyword) =>
    keyword.includes(' ') ? phrase.includes(` ${keyword}`) : said.some((word) => word.startsWith(keyword)),
  ).length
}
