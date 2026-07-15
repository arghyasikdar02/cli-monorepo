import { useEffect, useState } from 'react'

export default function useRotatingPhrase(phrases, { active = true, interval = 3000, reducedMotion = false } = {}) {
  const [rotation, setRotation] = useState({ current: 0, previous: 0, cycle: 0 })

  useEffect(() => {
    if (!active || reducedMotion || phrases.length < 2) return undefined
    let timer

    const schedule = () => {
      timer = window.setTimeout(() => {
        if (!document.hidden) {
          setRotation(state => ({
            previous: state.current,
            current: (state.current + 1) % phrases.length,
            cycle: state.cycle + 1,
          }))
        }
        schedule()
      }, interval)
    }

    const handleVisibility = () => {
      window.clearTimeout(timer)
      if (!document.hidden) schedule()
    }

    schedule()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [active, interval, phrases.length, reducedMotion])

  return rotation
}
