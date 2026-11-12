import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useLanguage, useT } from '../i18n.js'
import LanguageSwitch from './LanguageSwitch.jsx'

// As in the content plan: the logo leads home, then the pages, the order button and DE / EN
const navItems = [
  { page: 'menu', label: { de: 'Speisekarte', en: 'Menu' } },
  { page: 'weekly', label: { de: 'Thali der Woche', en: 'Weekly Specials' } },
  { page: 'catering', label: { de: 'Catering', en: 'Catering' } },
  { page: 'about', label: { de: 'Über uns', en: 'About us' } },
  { page: 'journal', label: { de: 'Journal', en: 'Journal' } },
  { page: 'contact', label: { de: 'Kontakt', en: 'Contact' } },
]

// The header stays at the top of the screen: it slides away while you scroll down and comes back
// as soon as you scroll up. "scrolled": away from the top of the page (the bar gets its shadow,
// and on Home its background).
function useScrollState() {
  const [state, setState] = useState({ scrolled: false, hidden: false })

  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0
    const set = (scrolled, hidden) =>
      setState((prev) => (prev.scrolled === scrolled && prev.hidden === hidden ? prev : { scrolled, hidden }))

    const update = () => {
      frame = 0
      const y = window.scrollY
      if (y < 40) {
        set(false, false)
      } else if (Math.abs(y - lastY) > 8) {
        // ignore tiny movements, e.g. a finger resting on the screen
        set(true, y > lastY && y > 240)
      } else {
        return
      }
      lastY = y
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return state
}

export default function Header() {
  const { page } = useLanguage()
  const { t, pathTo } = useT()
  const { pathname } = useLocation()
  const { scrolled, hidden } = useScrollState()
  const toggleRef = useRef(null)

  // The menu belongs to the page it was opened on, so it closes by itself on any page change
  const [openOn, setOpenOn] = useState(null)
  const menuOpen = openOn === pathname
  const closeMenu = () => setOpenOn(null)

  // Escape closes the menu and puts the focus back on its button
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      setOpenOn(null)
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // On Home the header sits transparent over the hero photo; the designed pages have a light bar
  const variant =
    {
      home: ' site-header--overlay',
      about: ' site-header--light',
      weekly: ' site-header--light',
      contact: ' site-header--light',
      catering: ' site-header--light',
    }[page] ?? ''
  const states = `${scrolled ? ' is-scrolled' : ''}${hidden && !menuOpen ? ' is-hidden' : ''}${menuOpen ? ' is-menu-open' : ''}`

  return (
    <header className={`site-header${variant}${states}`}>
      <div className="site-header__inner">
        <Link to={pathTo('home')} className="wordmark" onClick={closeMenu}>
          <span className="wordmark__main">Beyond</span>
          <span className="wordmark__sub">Chai &amp; Curry</span>
        </Link>
        {/* Always visible, also on phones where the rest of the nav folds away */}
        <LanguageSwitch className="site-header__lang" />
        <button
          ref={toggleRef}
          type="button"
          className="site-header__toggle"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setOpenOn(menuOpen ? null : pathname)}
        >
          <span className="site-header__toggle-bars" aria-hidden="true" />
          <span className="site-header__toggle-label">
            {menuOpen ? t({ de: 'Schließen', en: 'Close' }) : t({ de: 'Menü', en: 'Menu' })}
          </span>
        </button>
        <nav aria-label={t({ de: 'Hauptmenü', en: 'Main' })} id="site-nav" className={menuOpen ? 'is-open' : undefined}>
          <ul className="site-nav">
            {navItems.map((item, i) => (
              <li key={item.page} style={{ '--i': i }}>
                <NavLink to={pathTo(item.page)} onClick={closeMenu}>
                  {t(item.label)}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link
            to={`${pathTo('contact')}#order`}
            className="site-header__order"
            style={{ '--i': navItems.length }}
            onClick={closeMenu}
          >
            {t({ de: 'Jetzt bestellen', en: 'Order now' })}
          </Link>
        </nav>
      </div>
    </header>
  )
}
