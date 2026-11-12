import { useT } from '../i18n.js'
import { siteInfo } from '../siteInfo.js'
import Placeholder from '../components/Placeholder.jsx'

// Stories behind regional dishes and festivals (the content plan's "Journal", formerly Blog).
// Waiting on the client: the structure and the first five articles.
export default function Journal() {
  const { t } = useT()
  return (
    <div className="container page">
      <title>{`Journal · ${siteInfo.name}`}</title>
      <h1>Journal</h1>
      <p>
        <Placeholder>{t({ de: 'Artikel', en: 'Articles' })}</Placeholder>
      </p>
    </div>
  )
}
