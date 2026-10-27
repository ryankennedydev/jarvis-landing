import type { CSSProperties, ReactNode } from 'react'

type Props = {
  label: string
  children: ReactNode
  /** Cor categórica opcional (ex.: região do cérebro) */
  color?: string
  meta?: string
  className?: string
}

/** Tooltip chanfrado usado nas cenas 3D e nos gráficos. */
export function Tooltip({ label, children, color, meta, className = '' }: Props) {
  return (
    <div
      role="tooltip"
      className={`cut cut-sm pointer-events-none w-max max-w-[260px] bg-[rgba(6,9,13,0.94)] px-3.5 py-2.5 shadow-2xl ${className}`}
      style={color ? ({ '--bd': `${color}66` } as CSSProperties) : undefined}
    >
      <p className="flex items-center gap-2 font-display text-[0.62rem] font-semibold tracking-[0.26em]" style={{ color: color ?? 'var(--color-ice)' }}>
        <span aria-hidden className="inline-block size-1.5 rotate-45" style={{ background: color ?? 'var(--color-ice)' }} />
        {label}
        {meta && <span className="tabular ml-auto pl-3 text-[0.62rem] tracking-normal text-text-dim">{meta}</span>}
      </p>
      <div className="mt-1.5 text-[0.82rem] leading-snug text-text-strong">{children}</div>
    </div>
  )
}
