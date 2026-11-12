import { useState } from 'react'
import { Link, NavLink } from 'react-router'
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

export default function Header() {
  const { page } = useLanguage()
  const { t, pathTo } = useT()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  // On Home the header sits transparent over the hero photo; the designed pages have a light bar
  const variant =
    { home: ' site-header--overlay', about: ' site-header--light', weekly: ' site-header--light', contact: ' site-header--light', catering: ' site-header--light' }[
      page
    ] ?? ''

  return (
    <header className={`site-header${variant}`}>
      <div className="site-header__inner">
        <Link to={pathTo('home')} className="wordmark" onClick={closeMenu}>
          <span className="wordmark__main">Beyond</span>
          <span className="wordmark__sub">Chai &amp; Curry</span>
        </Link>
        {/* Always visible, also on phones where the rest of the nav folds away */}
        <LanguageSwitch className="site-header__lang" />
        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="site-header__toggle-bars" aria-hidden="true" />
          {menuOpen ? t({ de: 'Schließen', en: 'Close' }) : t({ de: 'Menü', en: 'Menu' })}
        </button>
        <nav aria-label={t({ de: 'Hauptmenü', en: 'Main' })} id="site-nav" className={menuOpen ? 'is-open' : undefined}>
          <ul className="site-nav">
            {navItems.map((item) => (
              <li key={item.page}>
                <NavLink to={pathTo(item.page)} onClick={closeMenu}>
                  {t(item.label)}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to={`${pathTo('contact')}#order`} className="site-header__order" onClick={closeMenu}>
            {t({ de: 'Jetzt bestellen', en: 'Order now' })}
          </Link>
        </nav>
      </div>
    </header>
  )
}
