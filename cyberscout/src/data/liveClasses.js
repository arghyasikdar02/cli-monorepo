export const liveClasses = [
  {
    id: 'lc001',
    title: 'Introduction to Cyber Security Lab Walkthrough',
    instructor: 'Cyber Lab IN Instructor',
    instructorTitle: 'Cyber Safety Educator',
    description: 'A guided walkthrough of digital footprint review, suspicious message inspection, and safe verification habits.',
    date: 'Current',
    month: 'Now',
    day: '01',
    time: 'Self-paced',
    duration: '1h',
    attendees: 0,
    status: 'upcoming',
    category: 'Cyber Safety',
  },
  {
    id: 'lc002',
    title: 'Cyber Security Essentials Lab Walkthrough',
    instructor: 'Cyber Lab IN Instructor',
    instructorTitle: 'Cyber Security Educator',
    description: 'A safe guided session on HTTP traffic, unsafe input, SQL Injection concepts, XSS concepts, and defensive reporting.',
    date: 'Current',
    month: 'Now',
    day: '02',
    time: 'Self-paced',
    duration: '1h',
    attendees: 0,
    status: 'upcoming',
    category: 'Web Security',
  },
]

export const getLiveClassById = (id) => liveClasses.find(c => c.id === id) ?? null
