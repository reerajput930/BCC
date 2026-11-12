import { siteInfo } from '../siteInfo.js'
import Placeholder from '../components/Placeholder.jsx'

export default function Impressum() {
  return (
    <div className="container page">
      <title>{`Impressum · ${siteInfo.name}`}</title>
      <h1>Impressum</h1>
      <p>
        <Placeholder>Impressum text</Placeholder>
      </p>
    </div>
  )
}
