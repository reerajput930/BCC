import { useT } from '../i18n.js'
import { featuredReviews, reviewSnippets, reviewSummary } from '../reviews.js'
import { siteInfo } from '../siteInfo.js'

function LotusOrnament() {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M24 4C19 11 19 19 24 26C29 19 29 11 24 4Z" />
      <path d="M24 26C17 23 12 17 12 10C17 12 22 17 24 26" />
      <path d="M24 26C31 23 36 17 36 10C31 12 26 17 24 26" />
      <path d="M24 27C15 27 8 23 4 17C11 17 18 20 24 27" />
      <path d="M24 27C33 27 40 23 44 17C37 17 30 20 24 27" />
      <path d="M12 30H36" />
    </svg>
  )
}

// Steel wire: a dark stroke with a thin light line along it
const clipWire = 'M5 3v47a4.5 4.5 0 0 0 9 0V11a3 3 0 0 0-6 0v33'

function PaperClip() {
  return (
    <svg
      className="review-card__clip"
      viewBox="0 0 18 58"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={clipWire} stroke="#2e3033" strokeWidth="2" />
      <path d={clipWire} stroke="#8a8f94" strokeWidth="0.4" transform="translate(-0.4 -0.4)" />
    </svg>
  )
}

function Stars({ rating = 5, className }) {
  const { t } = useT()
  return (
    <span
      className={className}
      role="img"
      aria-label={t({ de: `${rating} von 5 Sternen`, en: `${rating} out of 5 stars` })}
    >
      {'★'.repeat(rating)}
    </span>
  )
}

function ReviewCard({ review, slot }) {
  const { quote, name, detail, source, rating } = review
  return (
    <figure className={`review-card review-card--${slot}`}>
      <PaperClip />
      <div className="review-card__body">
        <Stars rating={rating} className="review-card__stars" />
        <blockquote className="review-card__quote">“{quote}”</blockquote>
      </div>
      <figcaption className="review-card__author">
        {source && (
          <span className="review-card__avatar" aria-hidden="true">
            {name.charAt(0)}
          </span>
        )}
        <span className="review-card__who">
          <span className="review-card__name">{name}</span>
          <span className="review-card__detail">{detail}</span>
        </span>
        {source && <span className="review-card__source">{source}</span>}
      </figcaption>
    </figure>
  )
}

function Snippet({ snippet, hidden }) {
  return (
    <li className="reviews__snippet" aria-hidden={hidden || undefined}>
      <span className="reviews__snippet-stars" aria-hidden="true">
        ★★★★★
      </span>
      <span className="reviews__snippet-quote">“{snippet.quote}”</span>
      <span className="reviews__snippet-name">— {snippet.name}</span>
    </li>
  )
}

// Review texts stay in the language they were written in (content plan: never translate them)
export default function ReviewsSection() {
  const { rating, count, area } = reviewSummary
  const { t } = useT()

  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <div className="reviews__inner">
        <header className="reviews__header">
          <div className="reviews__ornament">
            <LotusOrnament />
          </div>
          <p className="reviews__eyebrow">{t({ de: 'BEWERTUNGEN', en: 'REVIEWS' })}</p>
          <h2 id="reviews-title" className="reviews__title">
            {t({ de: 'Liebesgrüße aus Stuttgart', en: 'Love notes from Stuttgart' })}
          </h2>
          <div className="reviews__summary">
            <p className="reviews__score">
              <span className="reviews__score-value">{rating}</span>
              <span
                className="reviews__score-stars"
                role="img"
                aria-label={t({ de: 'von 5 Sternen', en: 'out of 5 stars' })}
              >
                ★★★★★
              </span>
            </p>
            <span className="reviews__summary-divider" aria-hidden="true" />
            <p className="reviews__summary-text">
              {t({
                de: (
                  <>
                    <strong>{count}</strong> Fünf-Sterne-Bewertungen
                    <br />
                    von Gästen aus ganz {area}
                  </>
                ),
                en: (
                  <>
                    <strong>{count}</strong> five-star reviews from
                    <br />
                    guests across {area}
                  </>
                ),
              })}
            </p>
          </div>
        </header>

        <div className="reviews__grid">
          {featuredReviews.slice(0, 6).map((review, index) => (
            <ReviewCard key={review.name + review.quote} review={review} slot={index + 1} />
          ))}
        </div>

        {/* The list is repeated once so the strip can loop seamlessly; the copy is hidden from screen readers. */}
        <div className="reviews__marquee">
          <ul className="reviews__track">
            {reviewSnippets.map((snippet) => (
              <Snippet key={snippet.quote} snippet={snippet} />
            ))}
            {reviewSnippets.map((snippet) => (
              <Snippet key={`copy-${snippet.quote}`} snippet={snippet} hidden />
            ))}
          </ul>
        </div>

        {/* Shows once the Google reviews link is filled in siteInfo.js */}
        {siteInfo.googleReviews && (
          <p className="reviews__all">
            <a href={siteInfo.googleReviews} target="_blank" rel="noopener noreferrer">
              {t({ de: 'Alle Bewertungen auf Google →', en: 'Read all reviews on Google →' })}
            </a>
          </p>
        )}
      </div>
    </section>
  )
}
