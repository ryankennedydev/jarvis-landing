import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { Sonar } from './Sonar'

type Props = {
  index: string
  eyebrow: string
  title: ReactNode
  children?: ReactNode
  align?: 'left' | 'center'
  id?: string
}

export function SectionTitle({ index, eyebrow, title, children, align = 'left', id }: Props) {
  const center = align === 'center'
  return (
    <header className={`max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
      <Reveal>
        <p className={`mb-5 flex items-center gap-3 text-ice ${center ? 'justify-center' : ''}`}>
          <Sonar size={14} />
          <span className="font-display text-[0.7rem] font-medium tracking-[0.32em]">
            <span className="tabular text-text-dim">{index}</span>
            <span aria-hidden className="mx-2 text-text-dim">
              //
            </span>
            {eyebrow}
          </span>
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2
          id={id}
          className="font-display text-[1.6rem] leading-[1.2] font-semibold tracking-[0.2em] text-text-strong sm:text-3xl md:text-[2.4rem]"
        >
          {title}
        </h2>
      </Reveal>
      {children && (
        <Reveal delay={0.1}>
          <div className="mt-5 text-base leading-relaxed text-text-dim md:text-lg">{children}</div>
        </Reveal>
      )}
    </header>
  )
}
