export const notifications = [
  { id: 'n001', type: 'achievement', icon: 'military_tech', title: 'New Achievement Unlocked!', message: 'You earned the "Network Vanguard" badge. Top 5% of users!', timestamp: '2 hours ago', read: false, link: '/achievements' },
  { id: 'n002', type: 'course', icon: 'school', title: 'Continue Your Course', message: 'You\'re 65% through Network Security Fundamentals. Keep going!', timestamp: '5 hours ago', read: false, link: '/courses/c001' },
  { id: 'n003', type: 'live', icon: 'video_call', title: 'Live Class Starting Soon', message: 'Incident Response Workshop with Dr. Elias Thorne starts in 30 minutes.', timestamp: 'Today', read: false, link: '/live-classes/lc001' },
  { id: 'n004', type: 'streak', icon: 'local_fire_department', title: '12-Day Streak!', message: 'Amazing consistency! You\'re on a 12-day learning streak.', timestamp: 'Yesterday', read: true, link: '/achievements' },
  { id: 'n005', type: 'leaderboard', icon: 'leaderboard', title: 'Leaderboard Update', message: 'You\'re now ranked #5 globally. Only 490 XP away from #4!', timestamp: 'Yesterday', read: true, link: '/leaderboard' },
  { id: 'n006', type: 'system', icon: 'info', title: 'New Course Available', message: 'Zero Trust Architecture is now available. Check it out!', timestamp: '2 days ago', read: true, link: '/courses/c006' },
  { id: 'n007', type: 'achievement', icon: 'emoji_events', title: 'Level Up!', message: 'You\'ve reached Level 34. New challenges are now unlocked.', timestamp: '3 days ago', read: true, link: '/achievements' },
  { id: 'n008', type: 'system', icon: 'campaign', title: 'Monthly Challenge', message: 'October\'s CTF challenge is now live. Prizes for top 3!', timestamp: '5 days ago', read: true, link: '/courses' },
]

export const getUnreadCount = () => notifications.filter(n => !n.read).length
