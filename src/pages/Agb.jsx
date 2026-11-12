import { siteInfo } from '../siteInfo.js'
import Placeholder from '../components/Placeholder.jsx'

// Terms for the web shop. Supplied by the client (or a legal generator), not written by us.
export default function Agb() {
  return (
    <div className="container page" lang="de">
      <title>{`AGB · ${siteInfo.name}`}</title>
      <h1>Allgemeine Geschäftsbedingungen</h1>
      <p>
        <Placeholder>AGB-Text</Placeholder>
      </p>
    </div>
  )
}
