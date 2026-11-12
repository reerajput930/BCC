import { useEffect, useRef } from 'react'
import { useT } from '../i18n.js'
import { siteInfo } from '../siteInfo.js'
import { weeklySpecial } from '../weeklySpecial.js'
import ThaliPlate from '../components/ThaliPlate.jsx'
import elephants from '../assets/weekly/elephants.png'
import chappalTools from '../assets/weekly/chappal-tools.png'
import autoRickshaw from '../assets/weekly/auto-rickshaw.png'
import milestone from '../assets/weekly/milestone.png'

// Where the dishes sit along the road, after the design (1440px wide): x = centre of the photo
// in % of the width, y = its centre in px at 1440px wide (the road is 3500px tall there),
// size = its width in %, side = where its text goes, dot = the road's dot beside it, in photo
// widths from its centre; before = points [x %, y px] the road curves through on its way to
// the dot, so it goes round the photos as in the design (wide screens only).
const ROAD_HEIGHT = 3500
const slots = [
  { x: 45.3, y: 242, size: 16.4, side: 'right', dot: [-0.89, 0], before: [[28, 60]] },
  { x: 35.9, y: 626, size: 14.6, side: 'right', dot: [-1, -0.13] },
  { x: 58.7, y: 882, size: 15.5, side: 'right', dot: [-0.92, 0.18], before: [[25, 800]] },
  { x: 52.6, y: 1417, size: 15.3, side: 'right', dot: [-0.84, -0.35], before: [[48.7, 1065]] },
  { x: 30.5, y: 1732, size: 17.5, side: 'right', dot: [-0.73, -0.35] },
  { x: 56.2, y: 2198, size: 19.3, side: 'left', dot: [0.07, -0.8], before: [[14, 1800], [24, 1930], [36, 1985]] },
  { x: 60.7, y: 2591, size: 15, side: 'left', dot: [1.09, 0.13], before: [[80, 2125], [89.5, 2331]] },
  { x: 45.7, y: 3181, size: 17, side: 'left', dot: [0.78, 0], before: [[62, 2884]] },
]
const milestones = [
  { x: 23, y: 183 },
  { x: 41.6, y: 1074 },
  { x: 70, y: 2884 },
]

// A smooth line through the points (Catmull-Rom, as cubic Bézier curves)
function smoothPath(points) {
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [points[i - 1] ?? points[i], points[i], points[i + 1], points[i + 2] ?? points[i + 1]]
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`
  }
  return d
}

// Draws the road from the auto-rickshaw through the dots beside the dishes, and drives the
// rickshaw along it as the page scrolls, keeping it level with the middle of the screen
function useRoad() {
  const journeyRef = useRef(null)
  const pathRef = useRef(null)
  const rickshawRef = useRef(null)
  const roadRef = useRef(null)

  useEffect(() => {
    const journey = journeyRef.current
    const path = pathRef.current
    const rickshaw = rickshawRef.current
    const drive = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let samples = [] // points along the road, with the lowest y reached so far
    let start = null // the rickshaw's own centre, where the road begins
    let frame = 0

    const layout = () => {
      rickshaw.style.transform = ''
      const box = journey.getBoundingClientRect()
      const centre = (element) => {
        const r = element.getBoundingClientRect()
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }
      }
      start = centre(rickshaw)
      const road = roadRef.current.getBoundingClientRect()
      const dots = [...journey.querySelectorAll('.ws-dish__dot')].map(centre)
      const last = dots.at(-1)
      // the design's bends, on wide screens where the dishes are placed as in the design
      const wide = window.matchMedia('(min-width: 761px)').matches
      const bend = ([x, y]) => ({
        x: road.left - box.left + (x / 100) * road.width,
        y: road.top - box.top + (y / ROAD_HEIGHT) * road.height,
      })
      const points = [
        start,
        // down the left edge to where the road section begins
        { x: start.x + box.width * 0.02, y: road.top - box.top },
        ...dots.flatMap((dot, i) => [...(wide ? (slots[i].before ?? []).map(bend) : []), dot]),
        { x: last.x + box.width * 0.04, y: road.bottom - box.top },
      ]
      path.ownerSVGElement.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`)
      path.setAttribute('d', smoothPath(points))

      const length = path.getTotalLength()
      samples = []
      let lowest = -Infinity
      for (let at = 0; at <= length; at += 6) {
        const { x, y } = path.getPointAtLength(at)
        lowest = Math.max(lowest, y)
        samples.push({ x, y, lowest })
      }
      update()
    }

    const update = () => {
      frame = 0
      if (!drive || !samples.length) return
      const target = window.innerHeight / 2 - journey.getBoundingClientRect().top
      // the first point of the road that reaches the middle of the screen
      let low = 0
      let high = samples.length - 1
      while (low < high) {
        const mid = (low + high) >> 1
        if (samples[mid].lowest < target) low = mid + 1
        else high = mid
      }
      const at = samples[low]
      const before = samples[Math.max(0, low - 3)]
      const after = samples[Math.min(samples.length - 1, low + 3)]
      // the picture faces down the page, which is 90° along the road
      const angle = (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI - 90
      rickshaw.style.transform = `translate(${at.x - start.x}px, ${at.y - start.y}px) rotate(${angle}deg)`
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    const resizeObserver = new ResizeObserver(() => layout())
    resizeObserver.observe(journey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return { journeyRef, pathRef, rickshawRef, roadRef }
}

export default function WeeklySpecials() {
  const { region, intro, fact, thali, dishes } = weeklySpecial
  const { journeyRef, pathRef, rickshawRef, roadRef } = useRoad()
  const { t } = useT()

  return (
    <div className="ws-page">
      {/* DRAFT SEO texts, until the client's copy for this page arrives */}
      <title>{`${t({ de: 'Thali der Woche', en: 'Weekly Specials' })} · ${siteInfo.name}`}</title>
      <meta
        name="description"
        content={t({
          de: `Diese Woche: ${thali.name}. Jede Woche ein regionales Thali aus einer anderen Ecke Indiens – frisch gekocht in Stuttgart.`,
          en: `This week: ${thali.name}. A regional thali from a different corner of India every week – cooked fresh in Stuttgart.`,
        })}
      />

      <section className="ws-hero" aria-labelledby="ws-title">
        <div className="ws-hero__text" data-reveal="left">
          <h1 id="ws-title" className="ws-hero__title">
            {region} <span>{t({ de: 'Thali der Woche', en: 'Weekly Special' })}</span>
          </h1>
          <p className="ws-hero__intro">
            <strong>{t(intro.lead)}</strong> {t(intro.rest)}
          </p>
          <img className="ws-hero__elephants" src={elephants} width="477" height="255" alt="" />
        </div>
        <ThaliPlate className="ws-hero__plate" />
      </section>

      <section className="ws-fact" aria-label={t({ de: 'Wusstest du?', en: 'Did you know?' })}>
        <div data-reveal="left">
          <p className="ws-fact__eyebrow">{t({ de: 'Wusstest du?', en: 'Did You Know?' })}</p>
          <p className="ws-fact__title">
            <strong>{fact.place}</strong> {t(fact.rest)}
          </p>
        </div>
        <img className="ws-fact__art" data-reveal="right" src={chappalTools} width="720" height="411" alt="" />
      </section>

      <div ref={journeyRef} className="ws-journey">
        <svg className="ws-journey__road" aria-hidden="true" focusable="false">
          <path ref={pathRef} />
        </svg>

        <section className="ws-thali" aria-labelledby="ws-thali-title">
          <img ref={rickshawRef} className="ws-rickshaw" src={autoRickshaw} width="330" height="424" alt="" />
          <div className="ws-thali__text">
            <h2 id="ws-thali-title" className="ws-thali__title">
              {thali.name}
              <span className="ws-thali__dot">.</span>
            </h2>
            <p className="ws-thali__local" lang="mr">
              {thali.localName}
            </p>
            <p className="ws-thali__intro">
              <strong>{t(thali.lead)}</strong> {t(thali.rest)}
            </p>
          </div>
          <ThaliPlate className="ws-thali__plate" />
        </section>

        <div ref={roadRef} className="ws-road" style={{ '--road-height': ROAD_HEIGHT }}>
          {milestones.map(({ x, y }, i) => (
            <img
              key={i}
              className="ws-milestone"
              src={milestone}
              width="166"
              height="204"
              alt=""
              style={{ '--x': x, '--y': y }}
            />
          ))}
          <ol
            className="ws-road__dishes"
            aria-label={t({ de: `Gerichte des ${thali.name}`, en: `Dishes of the ${thali.name}` })}
          >
            {dishes.slice(0, slots.length).map((dish, i) => {
              const slot = slots[i]
              return (
                <li
                  key={dish.name}
                  className={`ws-dish ws-dish--${slot.side}`}
                  style={{
                    '--x': slot.x,
                    '--y': slot.y,
                    '--size': slot.size,
                    '--slot-dot-x': slot.dot[0],
                    '--slot-dot-y': slot.dot[1],
                  }}
                >
                  <div className="ws-dish__media">
                    <img src={dish.image} alt="" />
                    <span className="ws-dish__dot" aria-hidden="true" />
                  </div>
                  <div className="ws-dish__text">
                    <h3 className="ws-dish__name">{dish.name}</h3>
                    <p className="ws-dish__local" lang="mr">
                      {dish.localName}
                    </p>
                    <p className="ws-dish__about">{t(dish.text)}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
