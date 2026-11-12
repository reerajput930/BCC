import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { LanguageContext, languages, locate, pages } from '../i18n.js'
import { siteInfo } from '../siteInfo.js'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ChatWidget from './ChatWidget.jsx'

// Tells search engines where the same page is in the other language (hreflang), and which
// address is the page's own (canonical). German is the default for other languages (x-default).
function LanguageLinks({ page, lang }) {
  const paths = pages[page]
  const bilingual = paths.de !== paths.en
  return (
    <>
      <link rel="canonical" href={siteInfo.url + paths[lang]} />
      {bilingual &&
        languages.map((code) => <link key={code} rel="alternate" hrefLang={code} href={siteInfo.url + paths[code]} />)}
      {bilingual && <link rel="alternate" hrefLang="x-default" href={siteInfo.url + paths.de} />}
    </>
  )
}

export default function Layout() {
  const { pathname, hash } = useLocation()
  const { page, lang } = locate(pathname)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Start each page at the top (otherwise clicking a footer link keeps you scrolled down),
  // or at the #section when the link has one, e.g. /bestellen-kontakt/#order.
  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <LanguageContext value={{ lang, page }}>
      {page && <LanguageLinks page={page} lang={lang} />}
      <Header />
      {/* Pages set their own width: text pages use .container, Home has full-width bands */}
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </LanguageContext>
  )
}
