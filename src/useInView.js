import { useEffect, useRef, useState } from 'react'

// True once the element has scrolled a quarter into view; stays true after that.
export function useInView() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return [ref, inView]
}
