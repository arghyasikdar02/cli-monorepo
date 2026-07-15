import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = path.join(projectRoot, 'dist')
const siteUrl = (process.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')

const pages = [
  ['/', 'Online Cybersecurity Courses with Hands-On Labs | Cyber Lab IN', 'Learn cybersecurity online through guided lessons, hands-on labs and practical security scenarios. Explore beginner courses in phishing, web security, SOC analysis, ethical hacking and defensive security.', 'Learn cybersecurity by investigating real scenarios, not just watching videos.', 'Start with a structured beginner course, inspect realistic evidence and learn to report what you find.', 'home'],
  ['/courses', 'Cybersecurity Courses | Cyber Lab IN', 'Browse published Cyber Lab IN cybersecurity courses and clearly separated planned courses for beginner and early-career learners.', 'Cybersecurity courses built around guided work', 'Compare published course details, prerequisites, labs and outcomes before you enrol.', 'courses'],
  ['/courses/cybersecurity', 'Cybersecurity Courses for Beginners | Cyber Lab IN', 'Explore published beginner cybersecurity courses with protected materials, guided labs and course-specific learning.', 'Beginner cybersecurity courses', 'Published details are open. Course materials are available only to enrolled learners.', 'courses'],
  ['/courses/cybersecurity/cyber-security-essentials', 'Cyber Security Essentials Course | Cyber Lab IN', 'Learn cybersecurity foundations through phishing analysis, account hardening, web-security awareness and defensive reporting.', 'Cyber Security Essentials', 'A beginner course for learning core cybersecurity concepts through guided investigation and reporting.', 'course'],
  ['/courses/cybersecurity/introduction-to-cyber-security', 'Introduction to Cyber Security Course | Cyber Lab IN', 'Build a beginner foundation in cybersecurity with structured lessons, course-specific materials and guided practical work.', 'Introduction to Cyber Security', 'A published beginner course with course-isolated lessons, materials and progress.', 'course'],
  ['/courses/cybersecurity/web-application-security', 'Web Application Security Fundamentals Roadmap | Cyber Lab IN', 'Review the planned scope for Web Application Security Fundamentals and join the course waitlist.', 'Web Application Security Fundamentals', 'This course is planned and is not currently open for enrolment.', 'course-roadmap'],
  ['/courses/cybersecurity/soc-analyst-foundations', 'SOC Analyst Foundations Roadmap | Cyber Lab IN', 'Review the planned scope for SOC Analyst Foundations and join the course waitlist.', 'SOC Analyst Foundations', 'This course is planned and is not currently open for enrolment.', 'course-roadmap'],
  ['/courses/cybersecurity/ethical-hacking-foundations', 'Ethical Hacking Foundations Roadmap | Cyber Lab IN', 'Review the planned scope for Ethical Hacking Foundations and join the course waitlist.', 'Ethical Hacking Foundations', 'This course is planned and is not currently open for enrolment.', 'course-roadmap'],
  ['/learning-paths', 'Cybersecurity Learning Paths | Cyber Lab IN', 'Compare available and planned cybersecurity learning paths with starting level, sequence, practical work and expected study time.', 'Cybersecurity learning paths with honest availability', 'See what is available now, what is planned and how each path builds from foundation knowledge.', 'learning-paths'],
  ['/learning-paths/beginner-cybersecurity', 'Beginner Cybersecurity Learning Path | Cyber Lab IN', 'Start with cybersecurity fundamentals, phishing analysis, account safety, web behaviour and defensive reporting.', 'Beginner Cybersecurity Learning Path', 'A current starting point for complete beginners using published courses and guided labs.', 'learning-paths'],
  ['/learning-paths/ethical-hacking', 'Web Security Learning Path | Cyber Lab IN', 'Review the planned Web Security learning path, recommended foundation course and practical lab sequence.', 'Web Security Learning Path', 'A planned progression from request-response fundamentals to responsible security reporting.', 'learning-paths'],
  ['/learning-paths/soc-analyst', 'SOC Analyst Learning Path | Cyber Lab IN', 'Review the planned SOC Analyst learning path covering alert triage, log review and incident notes.', 'SOC Analyst Learning Path', 'A planned defensive path built on cybersecurity foundations.', 'learning-paths'],
  ['/learning-paths/network-cloud-security', 'Cloud Security Learning Path | Cyber Lab IN', 'Review the planned Cloud Security learning path connecting networks, identity, access and configuration risk.', 'Cloud Security Learning Path', 'A planned path for learners who already understand cybersecurity and networking foundations.', 'learning-paths'],
  ['/learning-paths/digital-forensics', 'Digital Forensics Learning Path | Cyber Lab IN', 'Review the planned Digital Forensics path covering evidence handling, timelines and incident documentation.', 'Digital Forensics Learning Path', 'A planned investigation path built on cybersecurity foundations.', 'learning-paths'],
  ['/labs', 'Guided Cybersecurity Labs | Cyber Lab IN', 'See how Cyber Lab IN guided labs present evidence, define safe actions, collect findings and provide structured feedback.', 'Guided cybersecurity labs', 'Inspect evidence, take authorised actions, submit a finding and compare it with clear feedback.', 'labs'],
  ['/labs/phishing-indicator-analysis', 'Phishing Indicator Analysis Lab | Cyber Lab IN', 'Review a safe email sample, inspect sender and link context, and write a defensive phishing finding.', 'Phishing indicator analysis', 'A read-only overview of the evidence, actions, submission and feedback used in this guided lab.', 'labs'],
  ['/labs/account-hardening-review', 'Account Hardening Review Lab | Cyber Lab IN', 'Review authentication, recovery and account settings against a practical security checklist.', 'Account hardening review', 'A read-only overview of a guided account-security exercise.', 'labs'],
  ['/labs/web-request-response-practice', 'Web Request and Response Practice Lab | Cyber Lab IN', 'Observe a sanitised browser request and application response, then identify security-relevant fields.', 'Web request and response practice', 'A read-only overview of the evidence and expected defensive explanation.', 'labs'],
  ['/labs/network-packet-inspection', 'Network Packet Inspection Lab | Cyber Lab IN', 'Read sanitised packet metadata and identify protocol, source, destination and relevant evidence.', 'Network packet inspection', 'A read-only overview of a controlled network-evidence exercise.', 'labs'],
  ['/labs/log-analysis', 'Log Analysis Lab | Cyber Lab IN', 'Review sanitised events, build a timeline and identify evidence worth escalating.', 'Log analysis', 'A read-only overview of a guided defensive log review.', 'labs'],
  ['/labs/unsafe-input-awareness', 'Unsafe Input Awareness Lab | Cyber Lab IN', 'Compare controlled input and response examples, then document the defensive implication.', 'Unsafe input awareness', 'A read-only overview of an authorised input-handling exercise.', 'labs'],
  ['/labs/session-security-basics', 'Session Security Basics Lab | Cyber Lab IN', 'Review a fictional session configuration and identify settings that affect exposure.', 'Session security basics', 'A read-only overview of a beginner session-security exercise.', 'labs'],
  ['/labs/defensive-reporting-practice', 'Defensive Reporting Practice Lab | Cyber Lab IN', 'Turn a safe observation into a concise finding with evidence, risk and a practical recommendation.', 'Defensive reporting practice', 'A read-only overview of the expected finding structure and feedback.', 'labs'],
  ['/resources', 'Cybersecurity Resources | Cyber Lab IN', 'Browse Cyber Lab IN articles, beginner guides, course references and practical cybersecurity learning resources.', 'Cybersecurity resources for practical learners', 'Read reviewed explanations and connect each topic to a relevant course, path or lab.', 'resources'],
  ['/blog', 'Cybersecurity Articles and Guides | Cyber Lab IN', 'Read reviewed beginner guides on cybersecurity, phishing, ethical hacking and learning cybersecurity.', 'Cybersecurity articles and guides', 'Clear explanations written for learners and linked to practical next steps.', 'blog'],
  ['/blog/what-is-cybersecurity', 'What Is Cybersecurity? | Cyber Lab IN', 'Learn what cybersecurity means, what it protects and how beginners can start building practical security knowledge.', 'What is cybersecurity?', 'A clear beginner explanation of systems, accounts, networks and information security.', 'blog'],
  ['/blog/what-is-phishing-and-how-to-prevent-it', 'What Is Phishing and How Can You Prevent It? | Cyber Lab IN', 'Learn how phishing works, which warning signs to inspect and which account-safety actions reduce risk.', 'What is phishing and how can you prevent it?', 'Review common phishing indicators and practical defensive actions.', 'blog'],
  ['/blog/what-is-ethical-hacking', 'What Is Ethical Hacking? | Cyber Lab IN', 'Understand ethical hacking, authorised scope, responsible testing and the difference between permission and misuse.', 'What is ethical hacking?', 'Ethical hacking is security testing performed with clear permission and a defined scope.', 'blog'],
  ['/blog/how-to-learn-cybersecurity-for-beginners', 'How to Learn Cybersecurity for Beginners | Cyber Lab IN', 'Follow a practical beginner sequence for learning cybersecurity concepts, guided labs and defensive reporting.', 'How to learn cybersecurity as a beginner', 'Start with fundamentals, inspect realistic evidence and practise explaining what you find.', 'blog'],
  ['/about', 'About Cyber Lab IN | Practical Cybersecurity Education', 'Learn why Cyber Lab IN teaches cybersecurity through structured courses, guided exercises and responsible defensive practice.', 'Cybersecurity is best learned by doing', 'Cyber Lab IN helps beginners connect security concepts to evidence, investigation and reporting.', 'home'],
  ['/instructors', 'Cybersecurity Instructors | Cyber Lab IN', 'Meet the educators responsible for Cyber Lab IN courses, guided labs and reviewed learning resources.', 'Cyber Lab IN instructors', 'Course ownership and author expertise are shown with the learning they support.', 'instructor'],
  ['/instructors/arghya-sikdar', 'Arghya Sikdar | Founder and Cybersecurity Educator', 'Read Arghya Sikdar’s cybersecurity education, industry, certification and course-authoring profile.', 'Arghya Sikdar', 'Founder and CEO of Cyber Lab IN, cybersecurity educator and practitioner.', 'instructor'],
  ['/for-organisations', 'Cybersecurity Training for Organisations | Cyber Lab IN', 'Discuss instructor-led cybersecurity training, guided lab access, assessment and cohort reporting for institutions and teams.', 'Cybersecurity training for organisations', 'Structured training can be adapted for colleges, universities, training institutions and business teams.', 'organisations'],
  ['/contact', 'Contact Cyber Lab IN', 'Contact Cyber Lab IN about courses, enrolment, institution training or business learning requirements.', 'Contact Cyber Lab IN', 'Ask a specific question about courses, enrolment or organisational training.', 'home'],
  ['/faq', 'Cyber Lab IN Course FAQ', 'Read direct answers about beginner suitability, course access, guided labs, certificates and enrolment.', 'Frequently asked questions', 'Find concise answers about Cyber Lab IN courses and learner access.', 'home'],
  ['/privacy-policy', 'Privacy Policy | Cyber Lab IN', 'Read how Cyber Lab IN handles account, course, lead and visitor information.', 'Privacy policy', 'How Cyber Lab IN collects, uses and protects information.', 'home'],
  ['/terms', 'Terms of Use | Cyber Lab IN', 'Read the terms that apply to Cyber Lab IN accounts, courses, labs and website use.', 'Terms of use', 'Conditions for using Cyber Lab IN services and learning materials.', 'home'],
  ['/refund-policy', 'Refund Policy | Cyber Lab IN', 'Read the Cyber Lab IN refund eligibility, timing and course-access conditions.', 'Refund policy', 'Check eligibility and course-access conditions before purchase.', 'home'],
  ['/cookie-policy', 'Cookie Policy | Cyber Lab IN', 'Read how necessary, analytics and marketing cookie preferences work on Cyber Lab IN.', 'Cookie policy', 'Necessary cookies support security and access; optional categories require consent.', 'home'],
  ['/accessibility', 'Accessibility | Cyber Lab IN', 'Read the Cyber Lab IN accessibility commitment and how to report an access barrier.', 'Accessibility at Cyber Lab IN', 'The website and learning platform are designed for keyboard, screen-reader and mobile access.', 'home'],
  ['/certificate-verification', 'Certificate Verification | Cyber Lab IN', 'Verify a Cyber Lab IN certificate using its unique certificate code.', 'Verify a Cyber Lab IN certificate', 'Enter a certificate code to check a database-backed issue record.', 'course'],
]

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const imageFor = key => `${siteUrl}/social/cyber-lab-in-${key}.png`

function breadcrumb(pathname, heading) {
  if (pathname === '/') return []
  if (pathname.startsWith('/courses/cybersecurity/')) return [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
    { '@type': 'ListItem', position: 2, name: 'Courses', item: `${siteUrl}/courses` },
    { '@type': 'ListItem', position: 3, name: 'Cybersecurity', item: `${siteUrl}/courses/cybersecurity` },
    { '@type': 'ListItem', position: 4, name: heading, item: `${siteUrl}${pathname}` },
  ]
  if (pathname.startsWith('/blog/')) return [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
    { '@type': 'ListItem', position: 2, name: 'Resources', item: `${siteUrl}/resources` },
    { '@type': 'ListItem', position: 3, name: heading, item: `${siteUrl}${pathname}` },
  ]
  return [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
    { '@type': 'ListItem', position: 2, name: heading, item: `${siteUrl}${pathname}` },
  ]
}

function schemas(pathname, title, description, heading) {
  const graph = [{ '@type': 'WebPage', '@id': `${siteUrl}${pathname}#webpage`, url: `${siteUrl}${pathname}`, name: title, description }]
  if (pathname === '/') {
    graph.push(
      { '@type': 'EducationalOrganization', '@id': `${siteUrl}/#organization`, name: 'Cyber Lab IN', url: siteUrl },
      { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'Cyber Lab IN', url: siteUrl, publisher: { '@id': `${siteUrl}/#organization` } },
      { '@type': 'ItemList', name: 'Published Cyber Lab IN courses', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Cyber Security Essentials', url: `${siteUrl}/courses/cybersecurity/cyber-security-essentials` },
        { '@type': 'ListItem', position: 2, name: 'Introduction to Cyber Security', url: `${siteUrl}/courses/cybersecurity/introduction-to-cyber-security` },
      ] },
      { '@type': 'FAQPage', mainEntity: [
        ['Is Cyber Security Essentials suitable for complete beginners?', 'Yes. The published prerequisite is basic computer and internet knowledge.'],
        ['Do I need programming experience?', 'No programming prerequisite is listed for Cyber Security Essentials.'],
        ['Is there a certificate?', 'The published course record lists a Certificate of Completion.'],
      ].map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
    )
  }
  if (pathname.includes('/courses/cybersecurity/') && !description.includes('planned')) {
    const instructor = pathname.endsWith('/cyber-security-essentials')
      ? { '@type': 'Person', name: 'Arghya Sikdar', url: `${siteUrl}/instructors/arghya-sikdar` }
      : { '@type': 'Organization', name: 'Cyber Lab IN faculty' }
    graph.push({ '@type': 'Course', name: heading, description, educationalLevel: 'Beginner', coursePrerequisites: 'Basic computer and internet knowledge', educationalCredentialAwarded: 'Certificate of Completion', provider: { '@type': 'EducationalOrganization', name: 'Cyber Lab IN', url: siteUrl }, instructor })
  }
  if (pathname.startsWith('/blog/')) {
    graph.push({ '@type': 'Article', headline: heading, description, author: { '@type': 'Person', name: 'Arghya Sikdar', url: `${siteUrl}/instructors/arghya-sikdar` }, publisher: { '@type': 'EducationalOrganization', name: 'Cyber Lab IN', url: siteUrl } })
  }
  if (pathname === '/instructors/arghya-sikdar') {
    graph.push({ '@type': 'Person', name: 'Arghya Sikdar', jobTitle: 'Founder and CEO', worksFor: { '@type': 'EducationalOrganization', name: 'Cyber Lab IN', url: siteUrl }, url: `${siteUrl}${pathname}` })
  }
  const items = breadcrumb(pathname, heading)
  if (items.length) graph.push({ '@type': 'BreadcrumbList', itemListElement: items })
  return { '@context': 'https://schema.org', '@graph': graph }
}

function pageMeta(pathname, title, description, heading, imageKey) {
  const canonical = `${siteUrl}${pathname}`
  const image = imageFor(imageKey)
  return `<!-- CLI_PAGE_META_START -->
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(`${heading} from Cyber Lab IN`)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <script type="application/ld+json">${JSON.stringify(schemas(pathname, title, description, heading)).replace(/</g, '\\u003c')}</script>
    <!-- CLI_PAGE_META_END -->`
}

function staticContent(heading, summary) {
  return `<main class="seo-static-content"><div><p>Cyber Lab IN</p><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(summary)}</p><nav aria-label="Primary"><a href="/courses">Courses</a><a href="/labs">Labs</a><a href="/learning-paths">Learning paths</a><a href="/for-organisations">For organisations</a><a href="/resources">Resources</a></nav></div></main>`
}

const template = await fs.readFile(path.join(distRoot, 'index.html'), 'utf8')
for (const [pathname, title, description, heading, summary, imageKey] of pages) {
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<!-- CLI_PAGE_META_START -->[\s\S]*?<!-- CLI_PAGE_META_END -->/, pageMeta(pathname, title, description, heading, imageKey))
    .replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${staticContent(heading, summary)}</div>`)
  const outputDirectory = pathname === '/' ? distRoot : path.join(distRoot, pathname.slice(1))
  await fs.mkdir(outputDirectory, { recursive: true })
  await fs.writeFile(path.join(outputDirectory, 'index.html'), html)
}

console.log(`Pre-rendered ${pages.length} public routes.`)
