// Business details used in the footer, the chat bot and anywhere else they're needed.
// Links still set to null show as plain text until Om sends the URL.
// TO CONFIRM marks details still waiting for the client (see the chatbot info checklist).
export const siteInfo = {
  name: 'Beyond Chai & Curry',
  // TO CONFIRM: the main domain (bccstuttgart.de, beyondchaicurry-stuttgart.de or shop-bccstuttgart.de).
  // Used for the language links search engines read.
  url: 'https://bccstuttgart.de',
  tagline: {
    en: ['Made by women. Rooted in tradition.', 'Sustainably delivered.'],
    de: ['Von Frauen gemacht. In Tradition verwurzelt.', 'Nachhaltig geliefert.'],
  },
  // The footer's brand line, from the content plan
  brandLine: {
    en: 'Home-style regional Indian food, made by women in Stuttgart.',
    de: 'Regionale indische Küche wie zu Hause – von Frauen gemacht in Stuttgart.',
  },

  address: {
    street: 'Möhringer Landstraße 95',
    postcode: '70563',
    city: 'Stuttgart',
  },
  // The pickup point's Google Maps link, from the old website
  mapsUrl: 'https://maps.app.goo.gl/Xpt5kBTHsUddvV3Z6',

  phone: { display: '0711 88866400', href: 'tel:+4971188866400' },
  email: 'info@bccstuttgart.de',

  // Opening times per weekday, 24-hour clock. null: closed all day.
  // 'unknown': not confirmed yet, so the bot and the footer ask people to call.
  openingHours: {
    mon: null,
    tue: ['18:00', '21:00'],
    wed: ['11:00', '21:00'],
    thu: ['11:00', '21:00'],
    fri: ['11:00', '21:00'],
    sat: ['11:00', '21:00'],
    sun: 'unknown', // TO CONFIRM: the usual Sunday hours
  },
  // Days the restaurant is closed although it would normally be open. Dates as YYYY-MM-DD.
  closedOn: [{ date: '2026-11-01', name: { en: 'All Saints’ Day', de: 'Allerheiligen' } }],

  instagram: 'https://www.instagram.com/beyondchaiandcurry/',

  // WhatsApp chat with our team (Ruchika's phone): used by "Talk to human" in the website chat
  // and the footer link. number: international format without + or leading 0,
  // e.g. '4917612345678' (spaces are fine). Still empty: WhatsApp then asks who to send it to.
  whatsapp: {
    number: '',
    // PLACEHOLDER pre-filled message
    message: 'Hi Beyond Chai & Curry! I have a question.',
  },

  // TO CONFIRM: all ways to order. The web shop is the one linked from the old website.
  orderLinks: {
    webshop: 'https://www.beyondchaicurry-stuttgart.de/',
    wolt:'https://wolt.com/de/deu/stuttgart/restaurant/beyond-chai-and-curry',
    uberEats: 'https://www.ubereats.com/de/store/beyond-chai-and-curry/eY_VoW9gSs2Ejc7Q9Xc1ew',
  },
  // TO CONFIRM: link to all Google reviews (null: the "read all reviews" line shows without a link)
  googleReviews: null,
}

const dayNames = {
  en: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },
  de: { mon: 'Mo', tue: 'Di', wed: 'Mi', thu: 'Do', fri: 'Fr', sat: 'Sa', sun: 'So' },
}

// The opening hours as lines, with days that share their hours grouped: 'Wed–Sat 11:00–21:00'
export function hoursLines(lang = 'en') {
  const names = dayNames[lang]
  const describe = (hours) => {
    if (hours === null) return lang === 'de' ? 'geschlossen' : 'closed'
    if (hours === 'unknown') return lang === 'de' ? 'bitte anrufen' : 'please call us'
    return `${hours[0]}–${hours[1]}`
  }
  const groups = []
  for (const [day, hours] of Object.entries(siteInfo.openingHours)) {
    const last = groups.at(-1)
    if (last && describe(last.hours) === describe(hours)) last.to = day
    else groups.push({ from: day, to: day, hours })
  }
  return groups.map(({ from, to, hours }) => {
    const days = from === to ? names[from] : `${names[from]}–${names[to]}`
    return `${days} ${describe(hours)}`
  })
}

// Opens a chat with the pre-filled message. Without a number, WhatsApp asks who to send it to.
export function whatsappUrl({ number, message } = siteInfo.whatsapp) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}
