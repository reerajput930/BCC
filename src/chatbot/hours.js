// "Are we open right now?" for the chat bot, from siteInfo.openingHours, in Stuttgart time.
import { siteInfo } from '../siteInfo.js'

const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const dayNames = {
  en: { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' },
  de: { sun: 'Sonntag', mon: 'Montag', tue: 'Dienstag', wed: 'Mittwoch', thu: 'Donnerstag', fri: 'Freitag', sat: 'Samstag' },
}
// How far ahead closures (e.g. a public holiday) are mentioned
const CLOSURE_NOTICE_DAYS = 14

// Weekday, date (YYYY-MM-DD) and minutes since midnight in Stuttgart, `offset` days from `now`
function stuttgart(now, offset = 0) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(now.getTime() + offset * 86_400_000))
      .map(({ type, value }) => [type, value]),
  )
  const date = `${parts.year}-${parts.month}-${parts.day}`
  // Noon UTC on that date always falls on the same weekday
  const day = days[new Date(`${date}T12:00:00Z`).getUTCDay()]
  return { day, date, minutes: Number(parts.hour) * 60 + Number(parts.minute) }
}

const minutesOf = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
const closure = (date) => siteInfo.closedOn.find((entry) => entry.date === date)

// Hours on a given day: [open, close], null (closed) or 'unknown'
function hoursOn({ day, date }) {
  return closure(date) ? null : siteInfo.openingHours[day]
}

// The next opening after today within a week, unless a day on the way has unknown hours
function nextOpening(now, lang) {
  for (let offset = 1; offset <= 7; offset++) {
    const when = stuttgart(now, offset)
    const hours = hoursOn(when)
    if (hours === 'unknown') return null
    if (hours) {
      const day = offset === 1 ? (lang === 'de' ? 'morgen' : 'tomorrow') : `${lang === 'de' ? 'am' : 'on'} ${dayNames[lang][when.day]}`
      return lang === 'de' ? `Wir öffnen wieder ${day} um ${hours[0]}.` : `We open again ${day} at ${hours[0]}.`
    }
  }
  return null
}

// One line on whether we're open right now, e.g. "We're open right now, until 21:00 ✅"
export function openNowLine(lang, now = new Date()) {
  const today = stuttgart(now)
  const hours = hoursOn(today)
  const de = lang === 'de'

  if (hours === 'unknown') {
    return de
      ? `Ob wir heute geöffnet haben, erfahren Sie telefonisch unter ${siteInfo.phone.display}.`
      : `To check whether we’re open today, please call us on ${siteInfo.phone.display}.`
  }
  if (hours && today.minutes < minutesOf(hours[0])) {
    return de ? `Heute öffnen wir um ${hours[0]}.` : `We open today at ${hours[0]}.`
  }
  if (hours && today.minutes < minutesOf(hours[1])) {
    return de ? `Wir haben gerade geöffnet, bis ${hours[1]} Uhr ✅` : `We’re open right now, until ${hours[1]} ✅`
  }

  const holiday = closure(today.date)
  const closed = holiday
    ? de
      ? `Heute (${holiday.name.de}) haben wir geschlossen.`
      : `We’re closed today (${holiday.name.en}).`
    : hours
      ? de
        ? 'Für heute haben wir schon geschlossen.'
        : 'We’re closed for today.'
      : de
        ? 'Heute haben wir geschlossen.'
        : 'We’re closed today.'
  const next = nextOpening(now, lang)
  return next ? `${closed} ${next}` : closed
}

// Closures coming up in the next two weeks, e.g. "Please note: we're closed on Sunday, 1 Nov (All Saints' Day)."
export function closureNotice(lang, now = new Date()) {
  const today = stuttgart(now).date
  const until = stuttgart(now, CLOSURE_NOTICE_DAYS).date
  const upcoming = siteInfo.closedOn.filter(({ date }) => date > today && date <= until)
  if (!upcoming.length) return null

  const list = upcoming
    .map(({ date, name }) => {
      const when = new Date(`${date}T12:00:00Z`).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
      })
      return `${when} (${name[lang]})`
    })
    .join(', ')
  return lang === 'de' ? `Bitte beachten Sie: Am ${list} haben wir geschlossen.` : `Please note: we’re closed on ${list}.`
}
