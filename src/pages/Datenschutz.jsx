import { siteInfo } from '../siteInfo.js'
import Placeholder from '../components/Placeholder.jsx'

export default function Datenschutz() {
  return (
    <div className="container page">
      <title>{`Datenschutz · ${siteInfo.name}`}</title>
      <h1>Datenschutzerklärung</h1>
      <p>
        <Placeholder>Datenschutz text</Placeholder>
      </p>
    </div>
  )
}
