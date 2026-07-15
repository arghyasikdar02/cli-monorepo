import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicSiteLayout, { Breadcrumbs, PageIntro } from '../../components/site/PublicSiteLayout'
import SiteIcon from '../../components/ui/SiteIcon'

function Icon({ name }) {
  return <SiteIcon name={name} />
}

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Cyber Lab IN | Practical Cybersecurity Education'
    let meta = document.head.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'Learn why Cyber Lab IN builds practical cybersecurity education around guided labs, clear explanations and responsible defensive workflows.')
  }, [])

  return (
    <PublicSiteLayout>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About Cyber Lab IN' }]} />
      <PageIntro eyebrow="About Cyber Lab IN" title="Cybersecurity is best learned by doing" description="Cyber Lab IN creates practical, approachable cybersecurity learning for students, professionals and career switchers through structured courses, guided exercises and clear defensive thinking." actions={<><Link to="/courses" className="site-button-primary">Explore published courses<Icon name="arrow_forward" /></Link><Link to="/contact" className="site-text-link">Contact Cyber Lab IN<Icon name="arrow_forward" /></Link></>} aside={<aside className="about-principle"><p className="site-eyebrow">Learn. Practice. Defend.</p><p>Understand the concept, inspect the scenario, complete the guided work and communicate a responsible finding.</p></aside>} />

      <section className="about-story"><div className="site-container about-story-grid"><div><p className="site-eyebrow">Why Cyber Lab IN exists</p><h2>Move beyond passive security training</h2></div><div><p>Too often, people spend months watching videos, reading slides and collecting certificates, only to discover that they still do not feel confident solving real security problems. Cyber Lab IN started with a belief that practical work should be part of learning from the beginning.</p><p>The platform creates experiences rooted in guided exploration and meaningful practice. The goal is to make cybersecurity approachable without oversimplifying the decisions, evidence and responsibility involved.</p><p>Whether someone is taking a first step or sharpening an existing skill, the learning should explain not only what to do, but why it matters.</p></div></div></section>

      <section className="about-pillars"><div className="site-container"><div className="about-pillar-row"><span>01</span><h2>Mission</h2><p>Help learners build confidence through hands-on practice, guided exploration and meaningful security learning.</p></div><div className="about-pillar-row"><span>02</span><h2>What we teach</h2><p>Cybersecurity foundations, defensive security, ethical hacking concepts, digital forensics, DevSecOps, cloud security and responsible uses of AI in security.</p></div><div className="about-pillar-row"><span>03</span><h2>Why practical work matters</h2><p>Guided exercises help learners connect a concept to evidence, investigation structure, reporting and safer decisions.</p></div></div></section>

      <section className="about-community"><div className="site-container about-community-grid"><div><p className="site-eyebrow">A growing learning community</p><h2>Built for curiosity, questions and careful practice</h2><p>Cyber Lab IN welcomes students, working professionals and people who are simply curious about cybersecurity. The platform is designed to support a community of learners, educators and practitioners focused on becoming more capable defenders.</p></div><ul><li><span>For learners</span>Clear starting points and course-specific practical work.</li><li><span>For educators</span>Structured learning outcomes and guided curriculum context.</li><li><span>For teams</span>Training discussions grounded in audience and role.</li></ul></div></section>

      <section className="about-founder"><div className="site-container about-founder-grid about-founder-no-photo"><div><p className="site-eyebrow">Founder and CEO</p><h2>Arghya Sikdar</h2><p>Arghya Sikdar is a cybersecurity educator and practitioner with experience across cybersecurity, DevSecOps, cloud security, vulnerability assessment and penetration testing, digital forensics and practical security training.</p><p>His profile documents the professional and academic experience behind the Cyber Lab IN curriculum.</p><Link to="/instructors/arghya-sikdar" className="site-text-link">Read the full instructor profile<Icon name="arrow_forward" /></Link></div></div></section>
    </PublicSiteLayout>
  )
}
