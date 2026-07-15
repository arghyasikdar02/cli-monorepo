import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirectory = path.join(projectRoot, 'public', 'social-source')

const images = {
  home: ['PRACTICAL CYBERSECURITY LEARNING', 'Learn cybersecurity by investigating', 'real scenarios'],
  courses: ['CYBER LAB IN COURSES', 'Cybersecurity courses built around', 'guided work'],
  course: ['BEGINNER COURSE', 'Cyber Security Essentials', 'with guided labs'],
  'course-roadmap': ['COURSE ROADMAP', 'Planned cybersecurity', 'specialisations'],
  'learning-paths': ['STRUCTURED PROGRESSION', 'Cybersecurity learning paths', 'with honest availability'],
  labs: ['GUIDED PRACTICE', 'Inspect evidence, investigate', 'and report findings'],
  resources: ['CYBERSECURITY RESOURCES', 'Clear explanations connected', 'to practical learning'],
  blog: ['CYBERSECURITY GUIDES', 'Reviewed articles for', 'practical learners'],
  instructor: ['INSTRUCTOR PROFILE', 'Arghya Sikdar', 'Founder and cybersecurity educator'],
  organisations: ['ORGANISATIONAL TRAINING', 'Structured cybersecurity training', 'for institutions and teams'],
}

const escapeXml = value => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character])

await fs.mkdir(sourceDirectory, { recursive: true })
for (const [slug, [label, lineOne, lineTwo]] of Object.entries(images)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7fafc"/>
  <rect width="18" height="630" fill="#0b65a3"/>
  <rect x="82" y="92" width="62" height="6" fill="#16a7c8"/>
  <text x="82" y="156" fill="#0b65a3" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="2">${escapeXml(label)}</text>
  <text x="82" y="276" fill="#102b3c" font-family="Arial, sans-serif" font-size="56" font-weight="700">${escapeXml(lineOne)}</text>
  <text x="82" y="350" fill="#102b3c" font-family="Arial, sans-serif" font-size="56" font-weight="700">${escapeXml(lineTwo)}</text>
  <line x1="82" y1="456" x2="1118" y2="456" stroke="#c8d5dd" stroke-width="2"/>
  <text x="82" y="520" fill="#435b6a" font-family="Arial, sans-serif" font-size="26">Learn. Practice. Defend.</text>
  <text x="1118" y="520" fill="#0b65a3" font-family="Arial, sans-serif" font-size="30" font-weight="700" text-anchor="end">CYBER LAB IN</text>
</svg>`
  await fs.writeFile(path.join(sourceDirectory, `cyber-lab-in-${slug}.svg`), svg)
}

console.log(`Generated ${Object.keys(images).length} social image sources.`)
