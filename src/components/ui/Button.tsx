import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'cut cut-sm group inline-flex items-center justify-center gap-2.5 font-display font-semibold whitespace-nowrap select-none ' +
  'transition-[background-color,color,filter] duration-200 ease-sharp disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-ice text-bg [--bd:transparent] hover:bg-[#b4e0ff] active:bg-[#7cc4f5]',
  secondary: 'bg-surface-1 text-ice [--bd:rgba(143,208,255,0.55)] hover:bg-surface-3 hover:text-text-strong',
  ghost: 'bg-transparent text-text-dim [--bd:var(--color-line-strong)] hover:text-text-strong hover:bg-surface-2',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.72rem] tracking-[0.22em]',
  md: 'h-11 px-5 text-[0.78rem] tracking-[0.24em]',
  lg: 'h-13 px-7 text-[0.82rem] tracking-[0.26em]',
}

type Common = { variant?: Variant; size?: Size; icon?: ReactNode; children: ReactNode; className?: string }

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      <span>{children}</span>
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      <span>{children}</span>
    </a>
  )
}
