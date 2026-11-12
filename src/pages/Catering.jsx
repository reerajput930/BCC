import { Link } from 'react-router'
import { useT } from '../i18n.js'
import { siteInfo } from '../siteInfo.js'
import EnquiryForm from '../components/EnquiryForm.jsx'
import Placeholder from '../components/Placeholder.jsx'

// Catering, its own page as in the client's content plan ("Events, office lunches and private
// parties. The whole catering experience plus an enquiry form."). No design or copy yet: it uses
// the Contact page's look, and the texts are DRAFTS from what the old site says (event and
// corporate catering). The details below come from the plan's questions for BCC.
const intro = {
  lead: { en: 'Indian food for your event.', de: 'Indisches Essen für deine Veranstaltung.' },
  rest: {
    en: 'From office lunches to family celebrations: we cook regional Indian dishes for your guests – fresh, home-style and in eco-friendly packaging.',
    de: 'Vom Büro-Lunch bis zur Familienfeier: Wir kochen regionale indische Gerichte für deine Gäste – frisch, wie zu Hause und umweltfreundlich verpackt.',
  },
}

const occasions = [
  {
    title: { en: 'Office lunches', de: 'Büro-Lunch' },
    text: {
      en: 'Thalis, biryani and curries for your team, delivered to the office.',
      de: 'Thalis, Biryani und Currys für dein Team, geliefert ins Büro.',
    },
  },
  {
    title: { en: 'Events', de: 'Events' },
    text: {
      en: 'Indian food for company events, conferences and celebrations.',
      de: 'Indisches Essen für Firmenfeiern, Konferenzen und Feste.',
    },
  },
  {
    title: { en: 'Private parties', de: 'Private Feiern' },
    text: {
      en: 'Birthdays, family gatherings and festivals like Diwali.',
      de: 'Geburtstage, Familienfeste und Feste wie Diwali.',
    },
  },
]

// TO CONFIRM with the client: each shows a placeholder until filled in
const details = [
  { label: { en: 'Minimum order', de: 'Mindestbestellung' }, value: null },
  { label: { en: 'Notice needed', de: 'Vorlaufzeit' }, value: null },
  { label: { en: 'Service area', de: 'Liefergebiet' }, value: null },
  { label: { en: 'Setup or drop-off', de: 'Aufbau oder Lieferung' }, value: null },
  { label: { en: 'Price per person', de: 'Preis pro Person' }, value: null },
]

export default function Catering() {
  const { t, pathTo } = useT()

  return (
    <div className="contact-page">
      {/* DRAFT SEO texts, after the plan's search targets */}
      <title>{`${t({ de: 'Indisches Catering in Stuttgart', en: 'Indian Catering in Stuttgart' })} · ${siteInfo.name}`}</title>
      <meta
        name="description"
        content={t({
          de: 'Indisches Catering in Stuttgart für Firmen, Events und private Feiern – regionale Küche wie zu Hause, von Frauen gekocht. Jetzt anfragen.',
          en: 'Indian catering in Stuttgart for offices, events and private parties – regional home-style cooking, made by women. Send us an enquiry.',
        })}
      />

      <section className="contact-hero" aria-labelledby="catering-title">
        <h1 id="catering-title" className="contact-hero__title" data-reveal="left">
          Catering
        </h1>
        <div className="contact-hero__aside" data-reveal="right">
          <p className="contact-hero__intro">
            <strong>{t(intro.lead)}</strong> {t(intro.rest)}
          </p>
          <nav className="contact-hero__crumbs" aria-label={t({ de: 'Brotkrümelnavigation', en: 'Breadcrumb' })}>
            <Link to={pathTo('home')}>{t({ de: 'Startseite', en: 'Home' })}</Link> /{' '}
            <span aria-current="page">Catering</span>
          </nav>
        </div>
      </section>

      <ul className="catering-offer" aria-label={t({ de: 'Wofür wir kochen', en: 'What we cater for' })}>
        {occasions.map((occasion, i) => (
          <li key={occasion.title.en} data-reveal="up" style={{ '--reveal-delay': `${i * 0.1}s` }}>
            <h3>{t(occasion.title)}</h3>
            <p>{t(occasion.text)}</p>
          </li>
        ))}
      </ul>

      <section className="catering-details" aria-labelledby="catering-details-title" data-reveal="up">
        <h2 id="catering-details-title" className="contact-label">
          {t({ de: 'Gut zu wissen', en: 'Good to know' })}
        </h2>
        <dl className="catering-details__list">
          {details.map((detail) => (
            <div key={detail.label.en}>
              <dt>{t(detail.label)}</dt>
              <dd>{detail.value ? t(detail.value) : <Placeholder>{t(detail.label)}</Placeholder>}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="enquiry" className="contact-form" aria-labelledby="catering-form-title">
        <h2 id="catering-form-title" className="contact-order__title">
          {t({ de: 'Catering anfragen', en: 'Send an enquiry' })}
        </h2>
        <div data-reveal="up">
          <EnquiryForm kind="catering" />
        </div>
      </section>
    </div>
  )
}
