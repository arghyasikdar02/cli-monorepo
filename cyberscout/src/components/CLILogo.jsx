const logoSources = {
  full: {
    light: '/brand/cyber-lab-in-full-light.png',
    dark: '/brand/cyber-lab-in-full-dark.png',
  },
  mark: {
    light: '/brand/cyber-lab-in-mark-light.png',
    dark: '/brand/cyber-lab-in-mark-dark.png',
  },
}

export default function CLILogo({
  variant = 'full',
  tone = 'light',
  size = 160,
  className = '',
  alt = 'Cyber Lab IN',
}) {
  const normalizedVariant = logoSources[variant] ? variant : 'full'
  const normalizedTone = logoSources[normalizedVariant][tone] ? tone : 'light'

  return (
    <img
      src={logoSources[normalizedVariant][normalizedTone]}
      alt={alt}
      width={size}
      className={`block h-auto select-none object-contain ${className}`}
      draggable="false"
    />
  )
}
