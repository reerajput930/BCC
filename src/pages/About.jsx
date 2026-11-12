import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n.js'
import { siteInfo } from '../siteInfo.js'
import Placeholder from '../components/Placeholder.jsx'
import kitchenRecipes from '../assets/about/kitchen-recipes.jpg'
import bananaTree from '../assets/about/banana-tree.png'

// Laid out after the About Us design. DRAFT texts in both languages, built from what we know about
// the restaurant: swap in the client's text when it arrives (the content plan has a zigzag
// timeline, the women-led story, Meet the Makers and sustainability here). Each paragraph starts
// with a sentence in bold.
const intro = {
  lead: {
    en: 'Beyond Chai & Curry is an Indian kitchen in Stuttgart-Vaihingen, made by women and rooted in tradition.',
    de: 'Beyond Chai & Curry ist eine indische Küche in Stuttgart-Vaihingen – von Frauen gemacht, in Tradition verwurzelt.',
  },
  rest: {
    en: 'We cook the dishes we grew up with – from Goa, from the South and from the royal kitchens of the North – fresh every day. So far we have served more than 10,000 thalis.',
    de: 'Wir kochen die Gerichte, mit denen wir aufgewachsen sind – aus Goa, aus dem Süden und aus den königlichen Küchen des Nordens –, jeden Tag frisch. Mehr als 10.000 Thalis haben wir schon serviert.',
  },
}

// Three stops along the circle, each with the kitchen photo
const story = [
  {
    label: { en: 'Recipes from home', de: 'Rezepte von zu Hause' },
    caption: {
      en: 'Every dish starts with a family recipe, written down and pinned up in our kitchen.',
      de: 'Jedes Gericht beginnt mit einem Familienrezept, aufgeschrieben und in unserer Küche aufgehängt.',
    },
  },
  {
    label: { en: 'Made by women', de: 'Von Frauen gemacht' },
    caption: {
      en: 'Our team of women cooks every plate the way it’s made at home.',
      de: 'Unser Team aus Frauen kocht jeden Teller so, wie er zu Hause gemacht wird.',
    },
  },
  {
    label: { en: 'Served in Stuttgart', de: 'Serviert in Stuttgart' },
    caption: {
      en: 'Pick it up at Möhringer Landstraße, or have it delivered across the city.',
      de: 'Abholen in der Möhringer Landstraße oder quer durch die Stadt liefern lassen.',
    },
  },
]

const roots = {
  en: [
    { lead: 'We do not just serve food – we serve culture.' },
    {
      text: ' Our menu travels across India: Goan dishes from the west coast, Dakshin cooking from the South and rich Nawabi plates from the North. Our thalis and specials change every week, and on Fridays we make biryani.',
    },
    { lead: ' Everything is cooked fresh and sustainably delivered,' },
    { text: ' so it tastes the way it should when it reaches your table.' },
  ],
  de: [
    { lead: 'Wir servieren nicht nur Essen – wir servieren Kultur.' },
    {
      text: ' Unsere Speisekarte reist durch ganz Indien: Gerichte aus Goa an der Westküste, Dakshin-Küche aus dem Süden und reichhaltige Nawabi-Teller aus dem Norden. Unsere Thalis und Specials wechseln jede Woche, und freitags gibt es Biryani.',
    },
    { lead: ' Alles wird frisch gekocht und nachhaltig geliefert,' },
    { text: ' damit es so schmeckt, wie es soll, wenn es auf deinem Tisch ankommt.' },
  ],
}

// Waiting on the client: the founders' names, photo and story
const founders = { names: null, photo: null, story: null }

// The giant letters behind the title: "beyond chai curry", each letter at x/y in % of the hero
const heroLetters = [
  ...[...'beyond'].map((letter, i) => ({ letter, x: 8 + i * 12.5, y: i % 2 ? 22 : 4 })),
  ...[...'chai'].map((letter, i) => ({ letter, x: 2 + i * 12.5, y: 44 })),
  ...[...'curry'].map((letter, i) => ({ letter, x: 15 + i * 13, y: i % 2 ? 80 : 63 })),
]

// The story photo nearest the middle of the screen is "active": in full colour, with its caption
function useActiveStop(count) {
  const refs = useRef([])
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(refs.current.indexOf(entry.target))
        }
      },
      // a thin band across the middle of the screen
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.slice(0, count).forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [count])

  return [refs, active]
}

export default function About() {
  const [stopRefs, activeStop] = useActiveStop(story.length)
  const { t } = useT()

  return (
    <div className="about-page">
      {/* DRAFT SEO texts, after the plan's search targets */}
      <title>{`${t({ de: 'Über uns', en: 'About Us' })} · ${siteInfo.name}`}</title>
      <meta
        name="description"
        content={t({
          de: 'Beyond Chai & Curry: eine von Frauen geführte indische Küche in Stuttgart-Vaihingen. Regionale Rezepte von zu Hause, jeden Tag frisch gekocht.',
          en: 'Beyond Chai & Curry: a women-run Indian kitchen in Stuttgart-Vaihingen. Regional recipes from home, cooked fresh every day.',
        })}
      />

      <section className="about-hero" aria-labelledby="about-page-title">
        <div className="about-hero__letters" aria-hidden="true">
          {heroLetters.map(({ letter, x, y }, i) => (
            <span key={i} style={{ left: `${x}%`, top: `${y}%` }}>
              {letter}
            </span>
          ))}
        </div>
        <span className="about-hero__circle" aria-hidden="true" />

        <h1 id="about-page-title" className="about-hero__title">
          {t({ de: 'Über', en: 'About' })}
          <span className="about-hero__title-us">
            <span className="about-hero__hindi" lang="hi">
              हमारे बारे में
            </span>{' '}
            {t({ de: 'uns', en: 'Us' })}
          </span>
        </h1>
        <p className="about-hero__intro">
          <strong>{t(intro.lead)}</strong> {t(intro.rest)}
        </p>
      </section>

      <section className="about-story" aria-label={t({ de: 'Unsere Geschichte', en: 'Our story' })}>
        <div className="about-story__inner">
          <span className="about-story__circle" aria-hidden="true" />
          <ol className="about-story__stops">
            {story.map(({ label, caption }, i) => (
              <li
                key={label.en}
                ref={(element) => (stopRefs.current[i] = element)}
                className={`about-story__stop${i === activeStop ? ' is-active' : ''}`}
              >
                <p className="about-story__label">{t(label)}</p>
                <figure className="about-story__photo">
                  <img src={kitchenRecipes} width="603" height="401" alt="" />
                  <figcaption>{t(caption)}</figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="about-roots" aria-label={t({ de: 'Unser Essen', en: 'Our food' })}>
        <img className="about-roots__tree" src={bananaTree} width="421" height="537" alt="" />
        <p className="about-roots__text">
          {t(roots).map((part, i) => (part.lead ? <strong key={i}>{part.lead}</strong> : <span key={i}>{part.text}</span>))}
        </p>
      </section>

      <section className="about-founders" aria-labelledby="founders-title">
        <h2 id="founders-title" className="about-founders__title">
          {t({ de: 'Gründerinnen', en: 'Founders' })}
        </h2>
        <div className="about-founders__feature">
          <div className="about-founders__photo">
            {founders.photo ? (
              <img src={founders.photo} alt="" />
            ) : (
              <Placeholder>{t({ de: 'Foto der Gründerinnen', en: 'Founders’ photo' })}</Placeholder>
            )}
          </div>
          <p className="about-founders__names">{founders.names ?? <Placeholder>{t({ de: 'Namen der Gründerinnen', en: 'Founder names' })}</Placeholder>}</p>
        </div>
        <p className="about-founders__story">
          {founders.story ?? <Placeholder>{t({ de: 'Die Geschichte der Gründerinnen', en: 'The founders’ story' })}</Placeholder>}
        </p>
      </section>
    </div>
  )
}
