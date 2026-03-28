export function AdxuraLogo({ size = 'default', className = '' }: { size?: 'sm' | 'default' | 'lg'; className?: string }) {
  const dims = { sm: { w: 28, h: 28, text: 'text-lg' }, default: { w: 32, h: 32, text: 'text-xl' }, lg: { w: 40, h: 40, text: 'text-2xl' } };
  const d = dims[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={d.w} height={d.h} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Gradient background shape */}
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id="logoShine" x1="0" y1="0" x2="40" y2="0">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Main shape — rounded square with cut corner */}
        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#logoGrad)" />
        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#logoShine)" />
        {/* Letter A stylized as a signal/radar pulse */}
        <path d="M20 8L10 30h4.5l2-5h7l2 5H30L20 8zm0 8.5L23.2 23h-6.4L20 16.5z" fill="white" fillOpacity="0.95" />
        {/* Small radar arc — represents intelligence/scanning */}
        <path d="M28 12a12 12 0 0 1 0 16" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M31 9.5a16 16 0 0 1 0 21" stroke="white" strokeOpacity="0.2" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      </svg>
      <span className={`font-bold ${d.text} tracking-tight`}>
        <span className="text-primary">Adx</span><span className="text-foreground">ura</span>
      </span>
    </span>
  );
}

export function AdxuraIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iconGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#iconGrad)" />
      <path d="M20 8L10 30h4.5l2-5h7l2 5H30L20 8zm0 8.5L23.2 23h-6.4L20 16.5z" fill="white" fillOpacity="0.95" />
      <path d="M28 12a12 12 0 0 1 0 16" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
