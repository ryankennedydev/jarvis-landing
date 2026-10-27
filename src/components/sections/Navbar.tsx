import { useEffect, useState, type MouseEvent } from 'react'
import { scrollToId } from '../../lib/lenis'
import { ButtonLink } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Sonar } from '../ui/Sonar'

export const NAV_LINKS = [
  { id: 'voz', label: 'Voz' },
  { id: 'cerebro', label: 'Cérebro' },
  { id: 'work', label: 'Work' },
  { id: 'controle', label: 'Controle' },
  { id: 'financas', label: 'Finanças' },
  { id: 'noticias', label: 'Notícias' },
  { id: 'privacidade', label: 'Privacidade' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Destaca o link da seção visível
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id))
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    NAV_LINKS.forEach((l) => {
      const el = document.getElementById(l.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id)
  }

  const solid = scrolled || open

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ease-sharp ${
        solid ? 'border-b border-line bg-panel backdrop-blur-md' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav aria-label="Principal" className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <a href="#inicio" onClick={go('inicio')} className="flex items-center gap-3 text-text-strong" aria-label="J.A.R.V.I.S., voltar ao início">
          <Sonar size={18} />
          <span className="font-display text-[0.95rem] font-semibold tracking-[0.35em]">J.A.R.V.I.S.</span>
        </a>

        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={go(l.id)}
                aria-current={current === l.id ? 'true' : undefined}
                className={`relative px-3 py-2 font-display text-[0.7rem] font-medium tracking-[0.24em] transition-colors duration-200 hover:text-text-strong ${
                  current === l.id ? 'text-ice' : 'text-text-dim'
                }`}
              >
                {l.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 -bottom-px h-px bg-ice transition-transform duration-300 ease-sharp ${
                    current === l.id ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        <ButtonLink href="#comprar" onClick={go('comprar')} size="sm" className="ml-auto lg:ml-2">
          Comprar
        </ButtonLink>

        <button
          type="button"
          className="cut cut-sm -mr-1 grid size-10 place-items-center bg-surface-1 text-text lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'x' : 'menu'} size={18} />
        </button>
      </nav>

      <div id="menu-mobile" hidden={!open} className="border-t border-line lg:hidden">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-4 sm:px-6">
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={go(l.id)}
                className="cut cut-sm block bg-surface-1 px-4 py-3 font-display text-[0.72rem] tracking-[0.24em] text-text hover:bg-surface-3"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
