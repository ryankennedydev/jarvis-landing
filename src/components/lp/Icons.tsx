import type { ReactNode } from 'react'

/** Ícones de traço fino da landing (24×24, herdam a cor do texto). */
const PATHS = {
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
    </>
  ),
  terminal: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m6 9 3 3-3 3M12 15h6" />
    </>
  ),
  memory: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" strokeDasharray="2 3" />
      <circle cx="12" cy="12" r="10.5" opacity="0.5" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14.5a5 5 0 0 1 5.5 5.5" />
    </>
  ),
  windows: (
    <>
      <path d="M3 5.5 10.5 4.5v7H3zM12.5 4.2 21 3v8.5h-8.5zM3 12.5h7.5v7L3 18.5zM12.5 12.5H21V21l-8.5-1.2z" />
    </>
  ),
  /* Tecla ⌘ do Mac */
  mac: (
    <path d="M9 9V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z" />
  ),
  chart: <path d="M3 20h18M5 16l5-5 4 3 6-7M16 7h4v4" />,
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  soundOn: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </>
  ),
  soundOff: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="m23 9-6 6M17 9l6 6" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type LpIconName = keyof typeof PATHS

export function LpIcon({ name, strokeWidth = 1.5 }: { name: LpIconName; strokeWidth?: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  )
}

/** Marca: anéis concêntricos girando devagar. */
export function BrandOrb() {
  return (
    <svg aria-hidden className="brand-orb" viewBox="0 0 32 32" fill="none" stroke="currentColor">
      <circle cx="16" cy="16" r="14" opacity="0.3" />
      <circle cx="16" cy="16" r="10" opacity="0.5" />
      <circle cx="16" cy="16" r="6" opacity="0.8" />
      <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Orbe estático em CSS: aparece sem WebGL, enquanto a cena 3D carrega ou se ela falhar. */
export function OrbFallback() {
  return (
    <div role="img" aria-label="Orbe do Jarvis." className="orb-fallback">
      <span />
    </div>
  )
}
