import { useT } from '../i18n.js'
import { siteInfo } from '../siteInfo.js'
import Placeholder from '../components/Placeholder.jsx'

// The content plan has the full menu come from a menu plugin, as text Google can read. Waiting on
// the client: the plugin, and this page's intro, dietary legend and SEO texts.
export default function Menu() {
  const { t } = useT()
  return (
    <div className="container page">
      <title>{`${t({ de: 'Speisekarte', en: 'Menu' })} · ${siteInfo.name}`}</title>
      <h1>{t({ de: 'Speisekarte', en: 'Menu' })}</h1>
      <p>
        <Placeholder>{t({ de: 'Gerichte und Preise', en: 'Menu items and prices' })}</Placeholder>
      </p>
    </div>
  )
}
