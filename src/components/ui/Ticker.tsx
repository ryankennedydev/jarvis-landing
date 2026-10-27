import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  label: string
  /** Segundos para uma volta completa */
  duration?: number
  className?: string
}

/**
 * Faixa rolando infinitamente. O conteúdo é duplicado (a cópia fica oculta para leitores de tela)
 * e a animação pausa no hover e no foco.
 */
export function Ticker({ children, label, duration = 40, className = '' }: Props) {
  return (
    <div
      role="region"
      aria-label={label}
      className={`group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] ${className}`}
    >
      <div
        className="flex w-max motion-safe:animate-[marquee_var(--d)_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
        style={{ '--d': `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
