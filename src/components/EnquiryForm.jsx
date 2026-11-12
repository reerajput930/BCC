import { useState } from 'react'
import { useT } from '../i18n.js'
import { siteInfo } from '../siteInfo.js'

// Today as YYYY-MM-DD, so the date picker starts at today
function today() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

const topics = [
  { de: 'Frage zu einer Bestellung', en: 'Question about an order' },
  { de: 'Catering', en: 'Catering' },
  { de: 'Feedback', en: 'Feedback' },
  { de: 'Etwas anderes', en: 'Something else' },
]

// The message form on Order & Contact (kind 'contact': with a topic) and Catering (kind 'catering':
// with the event's date and number of guests). No mail server yet: the message opens in the
// visitor's email app, ready to send to us.
// TODO: post it to the server instead once sending email from there is set up.
export default function EnquiryForm({ kind = 'contact' }) {
  const { t } = useT()
  const [sent, setSent] = useState(false)
  const id = (field) => `${kind}-${field}`

  function handleSubmit(event) {
    event.preventDefault()
    const { name, phone, topic, date, guests, message } = Object.fromEntries(new FormData(event.currentTarget))
    const subject =
      kind === 'catering'
        ? t({ de: `Catering-Anfrage${date ? ` für ${date}` : ''}`, en: `Catering enquiry${date ? ` for ${date}` : ''}` })
        : `${topic} – ${name}`
    const details = [
      `Name: ${name}`,
      phone && `${t({ de: 'Telefon', en: 'Phone' })}: ${phone}`,
      date && `${t({ de: 'Datum', en: 'Date' })}: ${date}`,
      guests && `${t({ de: 'Personen', en: 'Guests' })}: ${guests}`,
    ].filter(Boolean)
    const body = [...details, '', message].join('\n')
    window.location.href = `mailto:${siteInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <form className="enquiry-form" onSubmit={handleSubmit}>
      <div className="enquiry-form__field">
        <label htmlFor={id('name')}>{t({ de: 'Dein Name', en: 'Your name' })}</label>
        <input
          id={id('name')}
          name="name"
          autoComplete="name"
          placeholder={t({ de: 'Vor- und Nachname', en: 'Your full name' })}
          required
        />
      </div>
      <div className="enquiry-form__field">
        <label htmlFor={id('phone')}>{t({ de: 'Telefonnummer', en: 'Phone number' })}</label>
        <input
          id={id('phone')}
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={t({ de: 'Deine Telefonnummer', en: 'Your phone number' })}
        />
      </div>

      {kind === 'catering' ? (
        <>
          <div className="enquiry-form__field">
            <label htmlFor={id('date')}>{t({ de: 'Datum der Veranstaltung', en: 'Date of the event' })}</label>
            <input id={id('date')} name="date" type="date" min={today()} />
          </div>
          <div className="enquiry-form__field">
            <label htmlFor={id('guests')}>{t({ de: 'Personen', en: 'Guests' })}</label>
            <input
              id={id('guests')}
              name="guests"
              type="number"
              inputMode="numeric"
              min="1"
              placeholder={t({ de: 'Anzahl der Gäste', en: 'Number of guests' })}
            />
          </div>
        </>
      ) : (
        <div className="enquiry-form__field enquiry-form__field--wide">
          <label htmlFor={id('topic')}>{t({ de: 'Worum geht es?', en: 'What is it about?' })}</label>
          <select id={id('topic')} name="topic">
            {topics.map((topic) => (
              <option key={topic.en}>{t(topic)}</option>
            ))}
          </select>
        </div>
      )}

      <div className="enquiry-form__field enquiry-form__field--wide">
        <label htmlFor={id('message')}>{t({ de: 'Nachricht', en: 'Message' })}</label>
        <textarea
          id={id('message')}
          name="message"
          rows="5"
          placeholder={
            kind === 'catering'
              ? t({
                  de: 'Erzähl uns von deiner Veranstaltung: Anlass, Ort, Wünsche …',
                  en: 'Tell us about your event: the occasion, the place, any wishes…',
                })
              : t({ de: 'Deine Nachricht an uns …', en: 'Your message to us…' })
          }
          required
        />
      </div>
      <button type="submit" className="enquiry-form__send">
        {t({ de: 'Senden', en: 'Send' })}
      </button>
      <p className="enquiry-form__note" role="status">
        {sent
          ? t({
              de: `Dein E-Mail-Programm sollte sich jetzt mit der fertigen Nachricht öffnen. Falls nicht, schreib uns an ${siteInfo.email}.`,
              en: `Your email app should now open with the message ready to send. If it doesn’t, write to us at ${siteInfo.email}.`,
            })
          : t({
              de: 'Beim Senden öffnet sich dein E-Mail-Programm mit der fertigen Nachricht.',
              en: 'Sending opens your email app with the message ready to go.',
            })}
      </p>
    </form>
  )
}
