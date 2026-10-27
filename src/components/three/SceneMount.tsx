import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { hasWebGL } from '../../lib/hooks'

/*
 * Monta uma cena 3D só quando ela chega perto da tela.
 * Este arquivo NÃO importa three.js: as cenas chegam via React.lazy,
 * então o three fica fora do bundle inicial.
 */

type Props = {
  /** Composição estática usada sem WebGL, durante o carregamento e em caso de erro */
  fallback: ReactNode
  /** Recebe `active`: true enquanto a seção está visível (fora dela a cena renderiza sob demanda) */
  children: (active: boolean) => ReactNode
  className?: string
  /** Inclua o posicionamento (relative/absolute) na className */
  /** Margem para começar a carregar antes de a seção aparecer */
  preload?: string
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('[cena 3D] usando fallback estático:', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function SceneMount({ fallback, children, className = '', preload = '400px' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(false)
  const [webgl] = useState(() => (typeof window === 'undefined' ? false : hasWebGL()))

  useEffect(() => {
    const el = ref.current
    if (!el || !webgl) return
    const near = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setMounted(true)
        near.disconnect()
      }
    }, { rootMargin: preload })
    const visible = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.01 })
    near.observe(el)
    visible.observe(el)
    return () => {
      near.disconnect()
      visible.disconnect()
    }
  }, [webgl, preload])

  return (
    <div ref={ref} className={className}>
      {webgl && mounted ? (
        <SceneBoundary fallback={fallback}>
          <Suspense fallback={fallback}>{children(active)}</Suspense>
        </SceneBoundary>
      ) : (
        fallback
      )}
    </div>
  )
}
