import { useT } from '../i18n.js'
import { siteInfo } from '../siteInfo.js'
import Placeholder from '../components/Placeholder.jsx'

export default function Allergens() {
  const { t } = useT()
  return (
    <div className="container page">
      <title>{`${t({ de: 'Allergene', en: 'Allergens' })} · ${siteInfo.name}`}</title>
      <h1>{t({ de: 'Allergene', en: 'Allergens' })}</h1>
      <p>
        <Placeholder>{t({ de: 'Allergene je Gericht', en: 'Allergen information per dish' })}</Placeholder>
      </p>
    </div>
  )
}
