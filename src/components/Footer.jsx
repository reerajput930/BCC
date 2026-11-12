import { Link } from 'react-router'
import { useT } from '../i18n.js'
import { hoursLines, siteInfo, whatsappUrl } from '../siteInfo.js'
import LanguageSwitch from './LanguageSwitch.jsx'
import LogoMark from './LogoMark.jsx'

const currentYear = new Date().getFullYear()

// Columns as in the content plan: Explore, Order, Visit
const exploreLinks = [
  { page: 'menu', label: { de: 'Speisekarte', en: 'Menu' } },
  { page: 'weekly', label: { de: 'Thali der Woche', en: 'Weekly Specials' } },
  { page: 'catering', label: { de: 'Catering', en: 'Catering' } },
  { page: 'about', label: { de: 'Über uns', en: 'About us' } },
  { page: 'journal', label: { de: 'Journal', en: 'Journal' } },
]

const legalLinks = [
  { page: 'impressum', label: { de: 'Impressum', en: 'Impressum' } },
  { page: 'datenschutz', label: { de: 'Datenschutz', en: 'Privacy' } },
  { page: 'agb', label: { de: 'AGB', en: 'Terms' } },
  { page: 'allergens', label: { de: 'Allergene', en: 'Allergens' } },
]

// Shows the label without a link until the URL is filled in siteInfo.js.
function ExternalLink({ href, children }) {
  if (!href) return <span>{children}</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

function handleNewsletterSubmit(event) {
  event.preventDefault()
  // TODO: send the address to a newsletter provider once one is chosen
  // (needs double opt-in and a mention in the Datenschutz page).
}

export default function Footer() {
  const { t, lang, pathTo } = useT()
  const { name, brandLine, address, mapsUrl, phone, email, instagram, orderLinks, whatsapp } = siteInfo
  const hours = hoursLines(lang)

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="footer-brand" data-reveal="up">
            <p className="footer-brand__name">
              <LogoMark />
              {name}
            </p>
            <p className="footer-brand__tagline">{t(brandLine)}</p>
            <p className="footer-instagram">
              <ExternalLink href={instagram}>Instagram</ExternalLink>
            </p>
            <form className="newsletter" onSubmit={handleNewsletterSubmit}>
              <label className="visually-hidden" htmlFor="newsletter-email">
                {t({ de: 'E-Mail für den Newsletter', en: 'Newsletter email' })}
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t({ de: 'Newsletter: deine E-Mail', en: 'Newsletter email' })}
                required
              />
              <button type="submit">{t({ de: 'Anmelden', en: 'Join' })}</button>
            </form>
          </div>

          <nav className="footer-col" aria-labelledby="footer-explore" data-reveal="up" style={{ '--reveal-delay': '0.08s' }}>
            <h2 id="footer-explore">{t({ de: 'Entdecken', en: 'Explore' })}</h2>
            <ul className="footer-links">
              {exploreLinks.map((link) => (
                <li key={link.page}>
                  <Link to={pathTo(link.page)}>{t(link.label)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-col" aria-labelledby="footer-order" data-reveal="up" style={{ '--reveal-delay': '0.16s' }}>
            <h2 id="footer-order">{t({ de: 'Bestellen', en: 'Order' })}</h2>
            <ul className="footer-links">
              <li>
                <ExternalLink href={orderLinks.webshop}>{t({ de: 'Webshop (Abholung)', en: 'Web shop (pickup)' })}</ExternalLink>
              </li>
              <li>
                <ExternalLink href={orderLinks.wolt}>Wolt</ExternalLink>
              </li>
              <li>
                <ExternalLink href={orderLinks.uberEats}>Uber Eats</ExternalLink>
              </li>
              <li>
                <ExternalLink href={whatsapp.number ? whatsappUrl() : null}>WhatsApp</ExternalLink>
              </li>
            </ul>
          </nav>

          <section className="footer-col" aria-labelledby="footer-visit" data-reveal="up" style={{ '--reveal-delay': '0.24s' }}>
            <h2 id="footer-visit">{t({ de: 'Besuch', en: 'Visit' })}</h2>
            <address className="footer-brand__address">
              <ExternalLink href={mapsUrl}>
                {address.street}, {address.postcode} {address.city}
              </ExternalLink>
            </address>
            <p className="footer-hours">
              {hours.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <p className="footer-brand__contact">
              <a href={phone.href}>{phone.display}</a>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          </section>
        </div>

        {/* The floating chat button stops above this row, see ChatWidget.jsx */}
        <div className="site-footer__bottom" data-floating-dock>
          <p>
            © {currentYear} {name} · {address.city}
          </p>
          <div className="site-footer__legal">
            <ul className="legal-links">
              {legalLinks.map((link) => (
                <li key={link.page}>
                  <Link to={pathTo(link.page)}>{t(link.label)}</Link>
                </li>
              ))}
            </ul>
            <LanguageSwitch />
          </div>
        </div>
      </div>
    </footer>
  )
}
