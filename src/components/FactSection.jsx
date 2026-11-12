import { Link } from 'react-router'
import { useT } from '../i18n.js'
import { useInView } from '../useInView.js'

// "Did you know?" band: a big one-line fact and a support line beside an illustration that slides
// in from its side. title: the fact, with its answer in <strong>; link: { to, label } (optional).
export default function FactSection({ id, title, text, link, image, imageAlt = '', imageSide = 'right' }) {
  const [ref, inView] = useInView()
  const { t } = useT()

  return (
    <section
      ref={ref}
      className={`fact fact--image-${imageSide}${inView ? ' is-visible' : ''}`}
      aria-labelledby={id}
    >
      <div className="fact__text">
        <p className="fact__eyebrow">{t({ de: 'Wusstest du?', en: 'Did you know?' })}</p>
        <h2 id={id} className="fact__title">
          {title}
        </h2>
        {text && <p className="fact__support">{text}</p>}
        {link && (
          <Link className="fact__link" to={link.to}>
            {link.label}
          </Link>
        )}
      </div>
      <img className="fact__art" src={image} alt={imageAlt} />
    </section>
  )
}
