import { useState } from 'react'
import { Link } from 'react-router-dom'
import useReducedMotion from '../../hooks/useReducedMotion'
import { trackEvent } from '../../lib/analytics'
import SiteIcon from '../ui/SiteIcon'
import RotatingInvestigationHeadline from './RotatingInvestigationHeadline'

export default function HeroSection() {
  const reducedMotion = useReducedMotion()
  const [videoUnavailable, setVideoUnavailable] = useState(false)
  const showVideo = !reducedMotion && !videoUnavailable

  return (
    <section className={`home-hero home-hero-focused${videoUnavailable ? ' is-video-unavailable' : ''}`}>
      <div className="home-hero-media" aria-hidden="true">
        {showVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            tabIndex="-1"
            disablePictureInPicture
            onError={() => setVideoUnavailable(true)}
          >
            <source src="/vide/video.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      <div className="home-hero-overlay" aria-hidden="true" />
      <div className="site-container home-hero-content">
        <div className="home-hero-grid">
          <div className="home-hero-copy">
            <p className="site-eyebrow">Beginner cybersecurity training</p>
            <RotatingInvestigationHeadline />
            <p>Start with clear explanations, then inspect evidence, make decisions and report what you found. Learning goes beyond watching videos.</p>
            <div className="site-action-row">
              <Link
                to="/courses"
                className="site-button-primary"
                onClick={() => trackEvent('hero_primary_cta', { destination: 'courses' })}
              >
                Explore Courses<SiteIcon name="arrow_forward" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
