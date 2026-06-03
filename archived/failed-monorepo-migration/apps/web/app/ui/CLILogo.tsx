export function CLILogo({ className = '', priority = false }: { className?: string; priority?: boolean }) {
  return (
    <picture>
      <source srcSet="/brand/cyber-lab-in-full-dark.png" media="(prefers-color-scheme: dark)" />
      <img
        src="/brand/cyber-lab-in-full-light.png"
        alt="Cyber Lab IN"
        width="320"
        height="180"
        className={`block h-auto select-none object-contain ${className}`}
        draggable="false"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  );
}

