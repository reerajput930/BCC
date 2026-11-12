import { Link } from 'react-router'
import { useT } from '../i18n.js'
import { siteInfo, whatsappUrl } from '../siteInfo.js'
import EnquiryForm from '../components/EnquiryForm.jsx'
import Placeholder from '../components/Placeholder.jsx'
import shutter from '../assets/contact/shutter.png'
import telephone from '../assets/contact/telephone.png'

// "Order & Contact" from the client's content plan (orders and contact on one page, no table
// reservations: BCC is a cloud kitchen), laid out after the Contact Us design: title and pickup
// address, the ways to order, opening times beside the shop shutter, email and phone beside the
// telephone, the map, then the message form.
// TO DO when the client sends them: this page's texts, the delivery area and the FAQ.
const intro = {
  lead: { en: 'We’d love to hear from you!', de: 'Wir freuen uns, von dir zu hören!' },
  rest: {
    en: 'Whether it’s an order, feedback, suggestions, or just a hello, your words mean the world to us.',
    de: 'Ob Bestellung, Feedback, Ideen oder einfach ein Hallo – deine Nachricht bedeutet uns viel.',
  },
}

const dayNames = {
  mon: { en: 'Monday', de: 'Montag' },
  tue: { en: 'Tuesday', de: 'Dienstag' },
  wed: { en: 'Wednesday', de: 'Mittwoch' },
  thu: { en: 'Thursday', de: 'Donnerstag' },
  fri: { en: 'Friday', de: 'Freitag' },
  sat: { en: 'Saturday', de: 'Samstag' },
  sun: { en: 'Sunday', de: 'Sonntag' },
}

const { street, postcode, city } = siteInfo.address
const fullAddress = `${street}, ${postcode} ${city}, Germany`
const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`

// Google Maps, shown straight away. The Datenschutz page must mention it (the map connects to
// Google and may set cookies).
function LocationMap() {
  const { t } = useT()

  return (
    <section className="contact-map" aria-label={t({ de: 'Karte', en: 'Map' })}>
      <iframe
        className="contact-map__frame"
        src={mapEmbedUrl}
        title={t({ de: `Karte: ${siteInfo.name}, ${street}`, en: `Map: ${siteInfo.name}, ${street}` })}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="contact-map__card">
        <address>
          {street}
          <br />
          {postcode} {city}
        </address>
        <a href={siteInfo.mapsUrl} target="_blank" rel="noopener noreferrer">
          {t({ de: 'In Google Maps öffnen', en: 'Open maps' })}
        </a>
      </div>
    </section>
  )
}

// All ways to order, as in the content plan: web shop (pickup), Wolt, Uber Eats, WhatsApp, phone
function OrderOptions() {
  const { t } = useT()
  const { orderLinks, whatsapp, phone } = siteInfo
  const options = [
    {
      name: t({ de: 'Webshop', en: 'Web shop' }),
      text: t({
        de: `Online bestellen und in der ${street} abholen.`,
        en: `Order online and pick up at ${street}.`,
      }),
      href: orderLinks.webshop,
    },
    { name: 'Wolt', text: t({ de: 'Lieferung über Wolt.', en: 'Delivery with Wolt.' }), href: orderLinks.wolt },
    {
      name: 'Uber Eats',
      text: t({ de: 'Lieferung über Uber Eats.', en: 'Delivery with Uber Eats.' }),
      href: orderLinks.uberEats,
    },
    whatsapp.number && {
      name: 'WhatsApp',
      text: t({ de: 'Schreib uns deine Bestellung.', en: 'Send us your order.' }),
      href: whatsappUrl(),
    },
    {
      name: t({ de: 'Telefon', en: 'Phone' }),
      text: t({ de: `Ruf uns an: ${phone.display}`, en: `Call us: ${phone.display}` }),
      href: phone.href,
      sameTab: true,
    },
  ].filter(Boolean)

  return (
    <section id="order" className="contact-order" aria-labelledby="contact-order-title">
      <h2 id="contact-order-title" className="contact-order__title">
        {t({ de: 'So bestellst du', en: 'How to order' })}
      </h2>
      <ul className="contact-order__options">
        {options.map((option) => (
          <li key={option.name}>
            <a
              className="contact-order__option"
              href={option.href}
              {...(option.sameTab ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              <span className="contact-order__name">{option.name}</span>
              <span className="contact-order__text">{option.text}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="contact-order__area">
        <span className="contact-label">{t({ de: 'Liefergebiet', en: 'Delivery area' })}</span>
        <Placeholder>{t({ de: 'Liefergebiet', en: 'Delivery area' })}</Placeholder>
      </p>
    </section>
  )
}

export default function Contact() {
  const { t, lang, pathTo } = useT()
  const { email, phone, openingHours } = siteInfo

  return (
    <div className="contact-page">
      {/* DRAFT SEO texts, after the plan's search targets, until the client's copy for this page arrives */}
      <title>{`${t({ de: 'Bestellen & Kontakt', en: 'Order & Contact' })} · ${siteInfo.name}`}</title>
      <meta
        name="description"
        content={t({
          de: 'Indisches Essen in Stuttgart-Vaihingen bestellen: im Webshop zum Abholen, über Wolt oder Uber Eats. Abholpunkt, Öffnungszeiten und Kontakt.',
          en: 'Order Indian food in Stuttgart-Vaihingen: from our web shop for pickup, or with Wolt or Uber Eats. Pickup point, opening hours and contact.',
        })}
      />

      <section className="contact-hero" aria-labelledby="contact-page-title">
        <h1 id="contact-page-title" className="contact-hero__title">
          {t({ de: 'Bestellen & Kontakt', en: 'Order & Contact' })}
        </h1>
        <div className="contact-hero__aside">
          <p className="contact-hero__intro">
            <strong>{t(intro.lead)}</strong> {t(intro.rest)}
          </p>
          <nav className="contact-hero__crumbs" aria-label={t({ de: 'Brotkrümelnavigation', en: 'Breadcrumb' })}>
            <Link to={pathTo('home')}>{t({ de: 'Startseite', en: 'Home' })}</Link> /{' '}
            <span aria-current="page">{t({ de: 'Kontakt', en: 'Contact' })}</span>
          </nav>
          <h2 className="contact-label">{t({ de: 'Abholpunkt', en: 'Pickup point' })}</h2>
          <address className="contact-hero__address">
            <a href={siteInfo.mapsUrl} target="_blank" rel="noopener noreferrer">
              {street}
              <br />
              {postcode} {city}
            </a>
          </address>
        </div>
      </section>

      <OrderOptions />

      <section className="contact-hours" aria-labelledby="contact-hours-title">
        <img className="contact-hours__shutter" src={shutter} width="373" height="495" alt="" />
        <div>
          <h2 id="contact-hours-title" className="contact-hours__title">
            {t({ de: 'Öffnungszeiten', en: 'Opening Times' })}
          </h2>
          <dl className="contact-hours__list">
            {Object.entries(openingHours).map(([day, hours]) => (
              <div key={day} className="contact-hours__day">
                <dt>{dayNames[day][lang]}</dt>
                {hours === null && <dd>{t({ de: 'Geschlossen', en: 'Closed' })}</dd>}
                {hours === 'unknown' && <dd>{t({ de: 'Bitte anrufen', en: 'Please call us' })}</dd>}
                {Array.isArray(hours) && (
                  <dd className="contact-hours__times">
                    <span>{hours[0]}</span>
                    <span aria-hidden="true">–</span>
                    <span className="visually-hidden">{t({ de: 'bis', en: 'to' })}</span>
                    <span>{hours[1]}</span>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="contact-reach" aria-labelledby="contact-reach-title">
        <div>
          <h2 id="contact-reach-title" className="contact-label">
            {t({ de: 'Kontakt', en: 'Contact' })}
          </h2>
          <p className="contact-reach__lines">
            <a href={`mailto:${email}`}>{email}</a>
            <a href={phone.href}>{phone.display}</a>
          </p>
        </div>
        <img className="contact-reach__phone" src={telephone} width="676" height="676" alt="" />
      </section>

      <LocationMap />

      <section className="contact-form" aria-labelledby="contact-form-title">
        <h2 id="contact-form-title" className="visually-hidden">
          {t({ de: 'Schreib uns', en: 'Write to us' })}
        </h2>
        <EnquiryForm kind="contact" />
      </section>
    </div>
  )
}
