import type { HTMLAttributes, ReactNode } from 'react'

type Props = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  /** Colchetes de canto em azul-gelo (cards de destaque) */
  highlight?: boolean
  size?: 'sm' | 'md' | 'lg'
  as?: 'div' | 'article' | 'li'
}

/** Card chanfrado do sistema. */
export function Card({ children, highlight = false, size = 'md', as: Tag = 'div', className = '', ...rest }: Props) {
  const cut = size === 'sm' ? 'cut-sm' : size === 'lg' ? 'cut-lg' : ''
  return (
    <Tag className={`cut ${cut} ${highlight ? 'brackets' : ''} bg-panel ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
