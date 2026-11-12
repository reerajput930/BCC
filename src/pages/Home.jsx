import { Link } from 'react-router'
import { pages, useT } from '../i18n.js'
import { siteInfo } from '../siteInfo.js'
import { weeklySpecial } from '../weeklySpecial.js'
import AboutSection from '../components/AboutSection.jsx'
import FactSection from '../components/FactSection.jsx'
import NamasteGreeting from '../components/NamasteGreeting.jsx'
import Placeholder from '../components/Placeholder.jsx'
import ReviewsSection from '../components/ReviewsSection.jsx'
import ThaliPlate from '../components/ThaliPlate.jsx'
import heroDosa from '../assets/home/hero-dosa-1728.jpg'
import heroDosaSmall from '../assets/home/hero-dosa-960.jpg'
import skyline from '../assets/home/skyline.png'
import peacock from '../assets/home/peacock.png'
import tiger from '../assets/home/tiger.png'
import kitchenRecipes from '../assets/about/kitchen-recipes.jpg'

// Texts from the client's content plan, "Page 1 – Home / Startseite". Anything in [brackets]
// there is still to be confirmed by BCC and shows as a placeholder.
const seo = {
  title: {
    en: 'Regional Indian Food in Stuttgart | Beyond Chai & Curry',
    de: 'Indisches Essen in Stuttgart | Beyond Chai & Curry',
  },
  description: {
    en: 'Home-style regional Indian food, cooked by women in Stuttgart. Weekly regional thalis, biryani and curries – order for pickup or delivery.',
    de: 'Regionale indische Küche wie zu Hause, von Frauen gekocht in Stuttgart. Wöchentlich wechselnde Thalis, Biryani & Currys – zum Abholen oder Liefern.',
  },
}

const hero = {
  // The plan leaves it open whether German keeps "Flavours of India" as the brand line
  display: { en: 'Flavours of India', de: 'Aromen Indiens' },
  subline: {
    en: 'Regional Indian home cooking, made by women in Stuttgart',
    de: 'Regionale indische Küche wie zu Hause – von Frauen gekocht in Stuttgart',
  },
  button: { en: 'Order now', de: 'Jetzt bestellen' },
  alt: {
    en: 'Freshly cooked Indian dish served at Beyond Chai & Curry, Stuttgart',
    de: 'Frisch gekochtes indisches Gericht von Beyond Chai & Curry, Stuttgart',
  },
}

const namasteLine = {
  en: 'One country, many ways to say hello – and even more ways to cook.',
  de: 'Ein Land, viele Arten, Hallo zu sagen – und noch mehr Arten zu kochen.',
}

const skylineAlt = {
  en: 'Illustrated skyline of Indian landmarks',
  de: 'Illustrierte Skyline indischer Wahrzeichen',
}

const intro = {
  statement: {
    en: 'Regional flavours of India, cooked with care right here in Stuttgart. From timeless family recipes to fresh, local ingredients – it’s a real taste of home.',
    de: 'Regionale Aromen Indiens, mit Liebe gekocht – mitten in Stuttgart. Von überlieferten Familienrezepten bis zu frischen, regionalen Zutaten: ein echter Geschmack von Zuhause.',
  },
  stat: { value: { en: '10,000+', de: '10.000+' }, label: { en: 'thalis cooked', de: 'Thalis gekocht' } },
  // Stand-in photo until the client sends one for this section
  photoAlt: {
    en: 'Family recipes pinned up in the Beyond Chai & Curry kitchen',
    de: 'Familienrezepte an der Wand der Küche von Beyond Chai & Curry',
  },
}

// Years and photos still to be confirmed by BCC (the full timeline goes on About Us)
const milestones = [
  {
    year: null,
    title: { en: 'The idea', de: 'Die Idee' },
    text: {
      en: 'Two women, one kitchen and a shared longing for the food of home.',
      de: 'Zwei Frauen, eine Küche und die gemeinsame Sehnsucht nach dem Essen von zu Hause.',
    },
  },
  {
    year: null,
    title: { en: 'The first thali', de: 'Das erste Thali' },
    text: {
      en: 'One platter, a whole regional meal. It quickly became a Stuttgart favourite.',
      de: 'Ein Teller, eine ganze regionale Mahlzeit. Schnell ein Stuttgarter Liebling.',
    },
  },
  {
    year: null,
    title: { en: '10,000+ thalis', de: '10.000+ Thalis' },
    text: {
      en: 'Weekly regional thalis, Friday Finds, catering and our own web shop.',
      de: 'Wöchentliche Regional-Thalis, Friday Finds, Catering und unser eigener Webshop.',
    },
  },
]

// TO CONFIRM: that these five categories match the menu, and that sweets and chai are on it
const menuTiles = [
  {
    title: { en: 'Thalis', de: 'Thalis' },
    text: { en: 'A full regional meal on one plate.', de: 'Eine ganze regionale Mahlzeit auf einem Teller.' },
  },
  {
    title: { en: 'Biryani', de: 'Biryani' },
    text: { en: 'Slow-cooked, layered, fragrant.', de: 'Langsam gegart, geschichtet, duftend.' },
  },
  {
    title: { en: 'Curries', de: 'Currys' },
    text: { en: 'Paneer, dal and more, the way it’s cooked at home.', de: 'Paneer, Dal und mehr – so wie zu Hause gekocht.' },
  },
  {
    title: { en: 'Breads & Snacks', de: 'Brot & Snacks' },
    text: { en: 'Fresh chapatis and street-food favourites.', de: 'Frische Chapatis und Streetfood-Klassiker.' },
  },
  {
    title: { en: 'Sweets & Chai', de: 'Süßes & Chai' },
    text: { en: 'A sweet ending with a cup of masala chai.', de: 'Ein süßer Abschluss mit einer Tasse Masala Chai.' },
  },
]

// Calendar week as used in Germany (ISO 8601)
function calendarWeek(date = new Date()) {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7))
  const yearStart = Date.UTC(day.getUTCFullYear(), 0, 1)
  return Math.ceil(((day - yearStart) / 86400000 + 1) / 7)
}

const weekdays = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

// What search engines read about the restaurant: address, phone, opening hours and menu
function restaurantSchema(lang) {
  const { name, url, address, phone, email, instagram, openingHours } = siteInfo
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name,
    url: url + pages.home[lang],
    telephone: phone.href.replace('tel:', ''),
    email,
    servesCuisine: 'Indian',
    hasMenu: url + pages.menu[lang],
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      postalCode: address.postcode,
      addressLocality: address.city,
      addressCountry: 'DE',
    },
    openingHoursSpecification: Object.entries(openingHours)
      .filter(([, hours]) => Array.isArray(hours))
      .map(([day, [opens, closes]]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${weekdays[day]}`,
        opens,
        closes,
      })),
    sameAs: [instagram],
  }
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"
      />
      <circle cx="12" cy="10" r="2.3" fill="currentColor" />
    </svg>
  )
}

// "This Week's Thali": the weekly special with its dishes, days, price and an order button.
// The content plan asks the designer for this section; until there's a design it follows the
// plan's notes (on phones: photo, then name, dishes and the order button).
function WeeklyThali() {
  const { t, pathTo } = useT()
  const { thali, fact, state, dishes, days, price } = weeklySpecial
  const week = calendarWeek()

  return (
    <section className="home-thali" aria-labelledby="home-thali-title">
      <div className="home-thali__plate" data-reveal="left">
        <ThaliPlate />
      </div>
      <div className="home-thali__text" data-reveal="right">
        <p className="home-eyebrow">{t({ de: `Diese Woche · KW ${week}`, en: `This week · CW ${week}` })}</p>
        <h2 id="home-thali-title" className="home-thali__title">
          {thali.name}
        </h2>
        <p className="home-thali__region">
          {fact.place}, {state}
        </p>
        <ul className="home-thali__dishes" aria-label={t({ de: 'Mit dabei', en: 'On the plate' })}>
          {dishes.slice(0, 4).map((dish) => (
            <li key={dish.name}>{dish.name}</li>
          ))}
        </ul>
        <p className="home-thali__about">{t(thali.lead)}</p>
        <p className="home-thali__meta">
          {days ? t(days) : <Placeholder>{t({ de: 'Tage', en: 'Days' })}</Placeholder>}
          {' · '}
          {price ?? <Placeholder>{t({ de: 'Preis', en: 'Price' })}</Placeholder>}
        </p>
        <div className="home-thali__actions">
          <a className="home-button" href={siteInfo.orderLinks.webshop} target="_blank" rel="noopener noreferrer">
            {t({ de: 'Dieses Thali bestellen', en: 'Order this thali' })}
          </a>
          <Link className="home-more" to={pathTo('weekly')}>
            {t({ de: 'Alle Thalis ansehen →', en: 'See the full rotation →' })}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { t, lang, pathTo } = useT()

  return (
    <>
      <title>{t(seo.title)}</title>
      <meta name="description" content={t(seo.description)} />
      <script type="application/ld+json">{JSON.stringify(restaurantSchema(lang))}</script>

      <section className="hero" aria-labelledby="hero-title">
        <img
          className="hero__photo"
          src={heroDosa}
          srcSet={`${heroDosaSmall} 960w, ${heroDosa} 1728w`}
          sizes="100vw"
          alt={t(hero.alt)}
          fetchPriority="high"
        />
        <div className="hero__content" data-reveal="up">
          <p className="hero__welcome" lang="hi">
            आपका स्वागत है
          </p>
          <p className="hero__title">{t(hero.display)}</p>
          <h1 id="hero-title" className="hero__subline">
            {t(hero.subline)}
          </h1>
          <p className="hero__location">
            <PinIcon />
            {siteInfo.address.city}
          </p>
          <Link to={`${pathTo('contact')}#order`} className="hero__order">
            {t(hero.button)}
          </Link>
        </div>
      </section>

      {/* Hello in many Indian languages, over a skyline of landmarks */}
      <section className="namaste" aria-labelledby="namaste-title">
        <NamasteGreeting />
        <p className="namaste__line" data-reveal="up">{t(namasteLine)}</p>
        <div className="namaste__skyline">
          <img src={skyline} width="1728" height="1372" alt={t(skylineAlt)} />
        </div>
      </section>

      <section className="home-intro" aria-label={t({ de: 'Über unsere Küche', en: 'About our kitchen' })}>
        <div className="home-intro__text" data-reveal="left">
          <p className="home-intro__statement">{t(intro.statement)}</p>
          <p className="home-intro__stat">
            <strong>{t(intro.stat.value)}</strong> {t(intro.stat.label)}
          </p>
        </div>
        <img
          className="home-intro__photo"
          data-reveal="right"
          src={kitchenRecipes}
          width="603"
          height="401"
          alt={t(intro.photoAlt)}
        />
      </section>

      <AboutSection />

      <section className="home-timeline" aria-labelledby="home-timeline-title">
        <h2 id="home-timeline-title" className="visually-hidden">
          {t({ de: 'Unsere Geschichte', en: 'Our story' })}
        </h2>
        <ol className="home-timeline__list">
          {milestones.map((milestone, i) => (
            <li key={i} className="home-timeline__item" data-reveal="up" style={{ '--reveal-delay': `${i * 0.12}s` }}>
              <p className="home-timeline__year">
                {milestone.year ?? <Placeholder>{t({ de: 'Jahr', en: 'Year' })}</Placeholder>}
              </p>
              <h3 className="home-timeline__title">{t(milestone.title)}</h3>
              <p className="home-timeline__text">{t(milestone.text)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-menu" aria-labelledby="home-menu-title">
        <h2 id="home-menu-title" className="home-menu__title" data-reveal="up">
          {t({ de: 'Unsere Speisekarte', en: 'Our Menu' })}
        </h2>
        <p className="home-menu__intro" data-reveal="up">{t({ de: 'Fünf Wege, Indien zu schmecken.', en: 'Five ways to taste India.' })}</p>
        <ul className="home-menu__tiles">
          {menuTiles.map((tile, i) => (
            <li
              key={tile.title.en}
              className="home-menu__tile"
              data-reveal="up"
              style={{ '--reveal-delay': `${i * 0.08}s` }}
            >
              <h3>{t(tile.title)}</h3>
              <p>{t(tile.text)}</p>
            </li>
          ))}
        </ul>
        <Link className="home-button" to={pathTo('menu')}>
          {t({ de: 'Zur Speisekarte', en: 'View full menu' })}
        </Link>
      </section>

      <WeeklyThali />

      <FactSection
        id="fact-tiger"
        image={tiger}
        title={t({
          de: (
            <>
              Indiens Nationaltier
              <br />
              ist der <strong>Tiger.</strong>
            </>
          ),
          en: (
            <>
              India’s National
              <br />
              Animal Is The <strong>Tiger.</strong>
            </>
          ),
        })}
        text={t({
          de: 'Kraftvoll, feurig und nicht zu übersehen – ein bisschen wie unser Kolhapuri-Thali.',
          en: 'Bold, fiery and impossible to ignore – a bit like our Kolhapuri thali.',
        })}
      />

      <ReviewsSection />

      <FactSection
        id="fact-peacock"
        image={peacock}
        imageSide="left"
        title={t({
          de: (
            <>
              Indiens Nationalvogel
              <br />
              ist der <strong>Pfau.</strong>
            </>
          ),
          en: (
            <>
              India’s National
              <br />
              Bird Is The <strong>Peacock.</strong>
            </>
          ),
        })}
        text={t({
          de: 'Farbenfroh, stolz und wie gemacht zum Feiern – genau wie ein festliches Thali.',
          en: 'Colourful, proud and made for celebrations – just like a festive thali.',
        })}
        link={{ to: pathTo('weekly'), label: t({ de: 'Zum Thali der Woche →', en: 'See this week’s thali →' }) }}
      />
    </>
  )
}
