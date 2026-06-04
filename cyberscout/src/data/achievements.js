export const achievements = [
  { id: 'a001', title: 'First Safety Check', description: 'Complete your first personal digital footprint review.', icon: 'shield_person', rarity: 'Common', category: 'Cyber Safety', earned: true, earnedDate: 'Current' },
  { id: 'a002', title: 'Phishing Spotter', description: 'Identify key phishing indicators in a guided email review.', icon: 'phishing', rarity: 'Uncommon', category: 'Cyber Safety', earned: false, earnedDate: null },
  { id: 'a003', title: 'Account Hardened', description: 'Finish the account security checklist and recovery-code review.', icon: 'lock', rarity: 'Rare', category: 'Cyber Safety', earned: false, earnedDate: null },
  { id: 'a004', title: 'HTTP Observer', description: 'Inspect controlled web traffic and explain request-response basics.', icon: 'language', rarity: 'Common', category: 'Web Security', earned: false, earnedDate: null },
  { id: 'a005', title: 'Input Risk Analyst', description: 'Classify unsafe input behavior in a guided web security lab.', icon: 'fact_check', rarity: 'Uncommon', category: 'Web Security', earned: false, earnedDate: null },
  { id: 'a006', title: 'Responsible Reporter', description: 'Create a simple vulnerability-to-fix report for an authorized training scenario.', icon: 'assignment', rarity: 'Rare', category: 'Web Security', earned: false, earnedDate: null },
  { id: 'a007', title: 'Early Learner', description: 'Joined Cyber Lab IN during the first two-course foundation program.', icon: 'workspace_premium', rarity: 'Unique', category: 'Program', earned: true, earnedDate: 'Current' },
]

export const getEarnedAchievements = () => achievements.filter(a => a.earned)
export const getAchievementById = (id) => achievements.find(a => a.id === id) ?? null
