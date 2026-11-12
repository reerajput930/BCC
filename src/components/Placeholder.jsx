// Marks content we're still waiting on, so it's easy to spot on the page.
export default function Placeholder({ children }) {
  return <span className="placeholder">[{children}]</span>
}
