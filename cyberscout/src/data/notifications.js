export const notifications = [
  { id: 'n001', type: 'course', icon: 'school', title: 'Continue Your Foundation Course', message: 'Start with Introduction to Cyber Security.', timestamp: 'Today', read: false, link: '/learn/courses/c001' },
  { id: 'n002', type: 'course', icon: 'language', title: 'Second Course Available', message: 'Cyber Security Essentials is ready when you want to explore practical web security.', timestamp: 'Today', read: false, link: '/learn/courses/c002' },
  { id: 'n003', type: 'system', icon: 'info', title: 'Two-Course Program', message: 'Cyber Lab IN currently focuses on two guided beginner courses from the Basic Course curriculum.', timestamp: 'Yesterday', read: true, link: '/learn/courses' },
]

export const getUnreadCount = () => notifications.filter(n => !n.read).length
