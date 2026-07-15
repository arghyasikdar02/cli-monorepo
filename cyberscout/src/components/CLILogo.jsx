const logoSources = {
  full: {
    light: { src: '/brand/cyber-lab-in-full-light.webp', width: 420, height: 235 },
    dark: { src: '/brand/cyber-lab-in-full-dark.webp', width: 420, height: 241 },
  },
  mark: {
    light: { src: '/brand/cyber-lab-in-mark-light.webp', width: 240, height: 122 },
    dark: { src: '/brand/cyber-lab-in-mark-dark.webp', width: 240, height: 126 },
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
  const source = logoSources[normalizedVariant][normalizedTone]
  const height = Math.round(size * (source.height / source.width))

  return (
    <img
      src={source.src}
      alt={alt}
      width={size}
      height={height}
      className={`block h-auto select-none object-contain ${className}`}
      draggable="false"
    />
  )
}
