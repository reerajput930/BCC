import { Link } from 'react-router'
import { languages, pages, useLanguage } from '../i18n.js'

// DE / EN: links to this page in each language. Pages that exist in one language only (the legal
// pages) link to the other language's home page instead.
export default function LanguageSwitch({ className }) {
  const { lang, page } = useLanguage()
  const paths = pages[page] ?? pages.home

  return (
    <ul className={`lang-switch ${className ?? ''}`} aria-label={lang === 'de' ? 'Sprache' : 'Language'}>
      {languages.map((code) => {
        const sameAddress = code !== lang && paths[code] === paths[lang]
        return (
          <li key={code}>
            <Link
              to={sameAddress ? pages.home[code] : paths[code]}
              hrefLang={code}
              lang={code}
              aria-current={code === lang ? 'true' : undefined}
            >
              <span aria-hidden="true">{code.toUpperCase()}</span>
              <span className="visually-hidden">{code === 'de' ? 'Deutsch' : 'English'}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
