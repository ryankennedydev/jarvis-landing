import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export const EASE = [0.2, 0.8, 0.2, 1] as const

type Props = {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'article'
}

/** Entrada padrão: fade + 8px de subida, 350ms. Com movimento reduzido vira só fade. */
export function Reveal({ children, delay = 0, className, as = 'div' }: Props) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.35, ease: EASE, delay }}
    >
      {children}
    </Comp>
  )
}
