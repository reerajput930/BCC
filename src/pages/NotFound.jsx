import { Link } from 'react-router'
import { useT } from '../i18n.js'
import { siteInfo } from '../siteInfo.js'

export default function NotFound() {
  const { t, pathTo } = useT()
  return (
    <div className="container page">
      <title>{`${t({ de: 'Seite nicht gefunden', en: 'Page not found' })} · ${siteInfo.name}`}</title>
      <meta name="robots" content="noindex" />
      <h1>{t({ de: 'Seite nicht gefunden', en: 'Page not found' })}</h1>
      <p>
        <Link to={pathTo('home')}>{t({ de: 'Zur Startseite', en: 'Back to the home page' })}</Link>
      </p>
    </div>
  )
}
