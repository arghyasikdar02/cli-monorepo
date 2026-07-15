import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { careerTracks, roadmapFoundation, roadmapPracticalCore } from '../../content/careerRoadmap'
import useReducedMotion from '../../hooks/useReducedMotion'
import SiteIcon from '../ui/SiteIcon'

export default function CyberCareerRoadmap() {
  const rootRef = useRef(null)
  const tabRefs = useRef([])
  const reducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [manualSelection, setManualSelection] = useState(false)
  const [inView, setInView] = useState(false)
  const [automaticSteps, setAutomaticSteps] = useState(0)
  const activeTrack = careerTracks[activeIndex]

  useEffect(() => {
    if (!('IntersectionObserver' in window) || !rootRef.current) {
      setInView(true)
      return undefined
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 })
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || reducedMotion || manualSelection || automaticSteps >= careerTracks.length - 1) return undefined
    const timer = window.setTimeout(() => {
      setActiveIndex(index => (index + 1) % careerTracks.length)
      setAutomaticSteps(step => step + 1)
    }, 4200)
    return () => window.clearTimeout(timer)
  }, [automaticSteps, inView, manualSelection, reducedMotion])

  const selectTrack = (index, { focus = false } = {}) => {
    setActiveIndex(index)
    setManualSelection(true)
    if (focus) tabRefs.current[index]?.focus()
  }

  const handleKeyDown = (event, index) => {
    let nextIndex = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % careerTracks.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + careerTracks.length) % careerTracks.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = careerTracks.length - 1
    else return
    event.preventDefault()
    selectTrack(nextIndex, { focus: true })
  }

  return (
    <figure ref={rootRef} className={`career-roadmap ${inView ? 'is-in-view' : ''}`} aria-labelledby="career-roadmap-title">
      <figcaption className="career-roadmap-heading">
        <div>
          <p className="site-eyebrow">Beginner-to-role roadmap</p>
          <h2 id="career-roadmap-title">A cybersecurity path you can actually follow</h2>
          <p>Start with the fundamentals, practise real workflows, then build toward the role that fits you.</p>
        </div>
        <Link to="/learning-paths" className="site-text-link">Explore learning paths<SiteIcon name="arrow_forward" /></Link>
      </figcaption>

      <p className="site-visually-hidden">The shared path begins with computer, network and security foundations, continues through guided practical work, and branches into defensive security, offensive security, cloud and software security, or governance and training.</p>

      <div className="career-roadmap-map">
        <svg className="career-roadmap-connections" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
          <path className="career-roadmap-line is-shared" d="M190 200 H470" />
          {careerTracks.map((track, index) => {
            const y = 52 + (index * 98)
            return <path key={track.id} className={`career-roadmap-line ${index === activeIndex ? 'is-active' : ''}`} d={`M470 200 C560 200 590 ${y} 700 ${y} H735`} />
          })}
        </svg>

        <section className="career-roadmap-stage career-roadmap-foundation" aria-labelledby="roadmap-foundation-title">
          <span className="career-roadmap-step">Start</span>
          <h3 id="roadmap-foundation-title">Complete beginner</h3>
          <p>Build the shared foundation every path relies on.</p>
          <ul>{roadmapFoundation.map(item => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className="career-roadmap-stage career-roadmap-core" aria-labelledby="roadmap-core-title">
          <span className="career-roadmap-step">Practise</span>
          <h3 id="roadmap-core-title">Practical core</h3>
          <p>Inspect evidence, use tools responsibly and explain what you found.</p>
          <ul>{roadmapPracticalCore.map(item => <li key={item}>{item}</li>)}</ul>
        </section>

        <section className="career-roadmap-specialisations" aria-labelledby="roadmap-specialisations-title">
          <div className="career-roadmap-track-heading"><span>Then specialise</span><strong id="roadmap-specialisations-title">Choose a role direction</strong></div>
          <div className="career-roadmap-tabs" role="tablist" aria-label="Cybersecurity role directions">
            {careerTracks.map((track, index) => (
              <button
                key={track.id}
                ref={element => { tabRefs.current[index] = element }}
                type="button"
                role="tab"
                id={`roadmap-tab-${track.id}`}
                aria-selected={index === activeIndex}
                aria-controls="career-roadmap-panel"
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => selectTrack(index)}
                onFocus={() => setManualSelection(true)}
                onKeyDown={event => handleKeyDown(event, index)}
              >
                <span>{track.group}</span>
                <strong>{track.label}</strong>
              </button>
            ))}
          </div>

          <div
            key={activeTrack.id}
            className="career-roadmap-detail"
            role="tabpanel"
            id="career-roadmap-panel"
            aria-labelledby={`roadmap-tab-${activeTrack.id}`}
            tabIndex={0}
            onFocus={() => setManualSelection(true)}
          >
            <div className="career-roadmap-detail-copy"><p>{activeTrack.description}</p><span>Build role-specific skills. Practise the workflow. Prepare evidence of skill.</span></div>
            <div><h4>Skills to develop</h4><ul>{activeTrack.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></div>
            <div><h4>Role directions</h4><ul>{activeTrack.roles.map(role => <li key={role}>{role}</li>)}</ul></div>
          </div>
        </section>
      </div>

      <p className="career-roadmap-note">This roadmap supports course planning and entry-level preparation. It does not guarantee employment or imply that every specialisation is currently open for enrolment.</p>
    </figure>
  )
}
