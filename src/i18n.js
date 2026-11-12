// Two languages, as in the client's content plan: German is the default at the root of the site,
// English sits under /en/. Each page has its own address in each language.
import { createContext, useContext } from 'react'

export const languages = ['de', 'en']

// Addresses as in the plan's sitemap. The legal pages exist in German only, so both languages
// point to the same address.
export const pages = {
  home: { de: '/', en: '/en/' },
  menu: { de: '/speisekarte/', en: '/en/menu/' },
  weekly: { de: '/thali-der-woche/', en: '/en/weekly-specials/' },
  catering: { de: '/catering/', en: '/en/catering/' },
  about: { de: '/ueber-uns/', en: '/en/about-us/' },
  journal: { de: '/journal/', en: '/en/journal/' },
  contact: { de: '/bestellen-kontakt/', en: '/en/order-contact/' },
  allergens: { de: '/allergene/', en: '/en/allergens/' },
  impressum: { de: '/impressum/', en: '/impressum/' },
  datenschutz: { de: '/datenschutz/', en: '/datenschutz/' },
  agb: { de: '/agb/', en: '/agb/' },
}

// Addresses the site used before it had two languages, so old links still work
export const oldPaths = {
  '/menu': pages.menu.en,
  '/weekly-specials': pages.weekly.en,
  '/about': pages.about.en,
  '/contact': pages.contact.en,
  '/blog': pages.journal.en,
  '/allergens': pages.allergens.en,
}

// The language and page of an address. Unknown addresses: the language from the /en/ prefix.
export function locate(pathname) {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`
  for (const [page, paths] of Object.entries(pages)) {
    if (paths.de === path) return { page, lang: 'de' }
    if (paths.en === path) return { page, lang: 'en' }
  }
  return { page: null, lang: path.startsWith('/en/') ? 'en' : 'de' }
}

export const LanguageContext = createContext({ lang: 'de', page: 'home' })

export function useLanguage() {
  return useContext(LanguageContext)
}

// t({ de: '…', en: '…' }) picks the text for the page's language; pathTo('menu') gives the
// menu's address in that language
export function useT() {
  const { lang } = useContext(LanguageContext)
  return {
    lang,
    t: (texts) => texts[lang],
    pathTo: (page) => pages[page][lang],
  }
}
