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

// Scroll reveal: elements with a data-reveal attribute get data-revealed the first time they come
// into view, which plays their entrance (see "Scroll reveal" in index.css). A data attribute, not a
// class, so React never removes it again when it updates the element's className.
function useScrollReveal(pathname) {
  useEffect(() => {
    if (!document.documentElement.classList.contains('js-reveal')) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.dataset.revealed = ''
          observer.unobserve(entry.target)
        }
      },
      // a little before the element is fully on screen
      { rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [pathname])
}

export default function Layout() {
  const { pathname, hash } = useLocation()
  const { page, lang } = locate(pathname)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Start each page at the top (otherwise clicking a footer link keeps you scrolled down), or
  // glide to the #section when the link has one, e.g. /bestellen-kontakt/#order.
  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  useScrollReveal(pathname)

  return (
    <LanguageContext value={{ lang, page }}>
      {page && <LanguageLinks page={page} lang={lang} />}
      <Header />
      {/* Pages set their own width: text pages use .container, Home has full-width bands.
          The key starts each page fresh, with its fade-in. */}
      <main className="site-main">
        <div key={pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </LanguageContext>
  )
}
