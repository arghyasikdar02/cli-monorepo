import { useEffect, useRef, useState } from 'react'
import { rotatingInvestigationPhrases } from '../../content/careerRoadmap'
import useReducedMotion from '../../hooks/useReducedMotion'
import useRotatingPhrase from '../../hooks/useRotatingPhrase'

export default function RotatingInvestigationHeadline() {
  const rootRef = useRef(null)
  const [inView, setInView] = useState(true)
  const reducedMotion = useReducedMotion()
  const rotation = useRotatingPhrase(rotatingInvestigationPhrases, { active: inView, reducedMotion, interval: 3000 })
  const currentPhrase = rotatingInvestigationPhrases[rotation.current]
  const previousPhrase = rotatingInvestigationPhrases[rotation.previous]
  const phraseTone = index => index % 2 === 0 ? 'is-purple' : 'is-cyan'

  useEffect(() => {
    if (!('IntersectionObserver' in window) || !rootRef.current) return undefined
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 })
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <h1 ref={rootRef} className="rotating-investigation-headline" aria-label="Learn cybersecurity through role scenarios and real investigations.">
      <span aria-hidden="true" className="rotating-headline-stable">Learn cybersecurity through</span>
      <span aria-hidden="true" className="rotating-headline-window">
        {rotation.cycle > 0 && <span key={`out-${rotation.cycle}`} className={`rotating-headline-phrase is-leaving ${phraseTone(rotation.previous)}`}>{previousPhrase}</span>}
        <span key={`in-${rotation.cycle}`} className={`rotating-headline-phrase ${rotation.cycle > 0 ? 'is-entering' : 'is-current'} ${phraseTone(rotation.current)}`}>{currentPhrase}</span>
      </span>
    </h1>
  )
}
