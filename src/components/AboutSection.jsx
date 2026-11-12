import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useT } from '../i18n.js'
import { siteInfo } from '../siteInfo.js'
import starAnise1 from '../assets/home/star-anise-1.png'
import starAnise2 from '../assets/home/star-anise-2.png'
import starAnise3 from '../assets/home/star-anise-3.png'

// From the client's content plan (Home, section 5)
const aboutText = {
  en: 'Beyond Chai & Curry began with two women and one idea: to bring real home-cooked Indian food to everyday plates in Stuttgart. Today, women from across India cook the dishes of their home regions here – with local ingredients, strict hygiene and eco-friendly packaging.',
  de: 'Beyond Chai & Curry begann mit zwei Frauen und einer Idee: echtes, hausgemachtes indisches Essen auf Stuttgarter Teller zu bringen. Heute kochen hier Frauen aus ganz Indien die Gerichte ihrer Heimatregionen – mit regionalen Zutaten, strenger Hygiene und umweltfreundlicher Verpackung.',
}

export default function AboutSection() {
  const { t, pathTo } = useT()
  const words = t(aboutText).split(' ')
  const textRef = useRef(null)
  // Everything starts dark, so the text reads fine if the effect below never runs
  const [litCount, setLitCount] = useState(words.length)

  // Words go from grey to black as the paragraph scrolls up the screen
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const update = () => {
      frame = 0
      const { top, height } = textRef.current.getBoundingClientRect()
      // starts when the paragraph's top passes 85% of the screen, done when its bottom reaches 55%
      const start = window.innerHeight * 0.85
      const end = window.innerHeight * 0.55 - height
      const progress = Math.min(1, Math.max(0, (start - top) / (start - end)))
      setLitCount(Math.round(progress * words.length))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [words.length])

  return (
    <section className="about" aria-labelledby="about-title">
      <div className="about__anise">
        <img src={starAnise1} alt="" />
        <img src={starAnise2} alt="" />
        <img src={starAnise3} alt="" />
      </div>
      <div className="about__body">
        <h2 id="about-title" className="about__title">
          {t({ de: 'Über uns', en: 'About Us' })}
        </h2>
        <p className="about__lead">{t(siteInfo.tagline).join(' ')}</p>
        <p ref={textRef} className="about__text">
          {words.map((word, i) => (
            <span key={i} className={i < litCount ? 'is-lit' : undefined}>
              {word}{' '}
            </span>
          ))}
        </p>
        <Link className="about__link" to={pathTo('about')}>
          {t({ de: 'Unsere Geschichte →', en: 'Our story →' })}
        </Link>
      </div>
    </section>
  )
}
