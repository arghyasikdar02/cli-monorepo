const styles = {
  Common:    'bg-slate-100 text-slate-600 border-slate-200',
  Uncommon:  'bg-blue-50 text-blue-600 border-blue-200',
  Rare:      'bg-purple-50 text-purple-600 border-purple-200',
  Epic:      'bg-amber-50 text-amber-600 border-amber-200',
  Legendary: 'bg-red-50 text-red-600 border-red-200',
  Unique:    'bg-violet-500 text-white border-violet-500',
}

export default function RarityBadge({ rarity = 'Common' }) {
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold font-space-grotesk border rounded uppercase tracking-wide ${styles[rarity] ?? styles.Common}`}>
      {rarity}
    </span>
  )
}
