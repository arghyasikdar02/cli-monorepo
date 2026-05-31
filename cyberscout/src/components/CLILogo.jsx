export default function CLILogo({ variant = 'full', size = 40, className = '' }) {
  // Shared mark SVG — C with >_ inside, L, gradient I
  // viewBox 0 0 150 80, size = rendered width
  const markH = Math.round(size * 80 / 150)

  const Mark = ({ gradId }) => (
    <>
      {/* C letterform */}
      <path d="M52 6C29 6 10 22 10 41C10 60 29 76 52 76H57V63H52C37 63 24 53 24 41C24 29 37 19 52 19H57V6H52Z" fill="#0F172A"/>
      {/* >_ terminal symbol inside C — SVG paths, not text */}
      {/* > chevron */}
      <polyline
        points="26,31 35,41 26,51"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.65"
      />
      {/* _ cursor bar */}
      <rect x="38" y="49" width="12" height="3.5" rx="1.75" fill="#0F172A" opacity="0.65"/>
      {/* L letterform */}
      <rect x="73" y="6" width="14" height="70" rx="5" fill="#0F172A"/>
      <rect x="73" y="62" width="38" height="14" rx="5" fill="#0F172A"/>
      {/* I — gradient pill */}
      <rect x="125" y="6" width="14" height="70" rx="7" fill={`url(#${gradId})`}/>
    </>
  )

  if (variant === 'mark') {
    return (
      <svg width={size} height={markH} viewBox="0 0 150 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="iG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8"/>
            <stop offset="100%" stopColor="#7C3AED"/>
          </linearGradient>
        </defs>
        <Mark gradId="iG"/>
      </svg>
    )
  }

  // full variant: mark + CYBER LAB IN subtext
  return (
    <svg width={size} height={Math.round(size * 108 / 150)} viewBox="0 0 150 108" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="iGF" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
        <linearGradient id="tG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38BDF8"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <Mark gradId="iGF"/>
      {/* CYBER LAB text */}
      <text x="2" y="100" fontSize="11" fontFamily="Space Grotesk, sans-serif" fontWeight="700" letterSpacing="5" fill="#0F172A">CYBER LAB</text>
      {/* IN — gradient */}
      <text x="106" y="100" fontSize="11" fontFamily="Space Grotesk, sans-serif" fontWeight="700" letterSpacing="5" fill="url(#tG)">IN</text>
    </svg>
  )
}
