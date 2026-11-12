import { useT } from '../i18n.js'
import { namasteWords } from '../namasteWords.js'
import { useInView } from '../useInView.js'

// Time between one greeting starting to arrive and the next
const STEP_MS = 140

// "Namaste!" and hello in other Indian languages. When the section scrolls into view the
// greetings arrive one by one as if from far away, in a scattered order, NAMASTE! last.
// Hovering a greeting shows its language.
export default function NamasteGreeting() {
  const [ref, inView] = useInView()
  const { t } = useT()

  return (
    <h2 ref={ref} id="namaste-title" className={`namaste__greeting${inView ? ' is-visible' : ''}`}>
      <span className="visually-hidden">
        {t({
          de: 'Namaste! Hallo auf Hindi, Bengalisch, Gujarati, Kannada, Tamil und Malayalam',
          en: 'Namaste! Hello in Hindi, Bengali, Gujarati, Kannada, Tamil and Malayalam',
        })}
      </span>
      {namasteWords.map((word) => (
        <span
          key={word.src}
          className={word.main ? 'namaste__word namaste__word--main' : 'namaste__word'}
          title={word.label}
          style={{
            // Placed from the design (see .namaste__word in index.css): centre across, top, width
            '--cx': word.x + word.w / 2,
            top: `${word.y}%`,
            '--w': word.w,
            '--delay': `${(word.order - 1) * STEP_MS}ms`,
          }}
        >
          <img src={word.src} alt="" />
        </span>
      ))}
    </h2>
  )
}
