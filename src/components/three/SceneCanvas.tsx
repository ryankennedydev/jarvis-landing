import { Canvas, type CanvasProps } from '@react-three/fiber'
import { Suspense, type ReactNode } from 'react'
import { useIsMobile } from '../../lib/hooks'
import { Effects } from './Effects'

type Props = {
  /** Descrição da cena para leitores de tela */
  label: string
  active: boolean
  children: ReactNode
  background?: string
  bloom?: number
  className?: string
  camera?: CanvasProps['camera']
  onPointerDown?: () => void
  onPointerLeave?: () => void
}

/**
 * Canvas padrão do site: dpr [1, 2], sem tone mapping (cores exatas do design system),
 * renderização sob demanda fora da tela e pós-processamento só em telas >= 768px.
 */
export default function SceneCanvas({
  label,
  active,
  children,
  background = '#030406',
  bloom = 0.75,
  className = '',
  camera,
  onPointerDown,
  onPointerLeave,
}: Props) {
  const mobile = useIsMobile()
  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      flat
      frameloop={active ? 'always' : 'demand'}
      camera={camera}
      gl={{ antialias: mobile, alpha: false, powerPreference: 'high-performance', stencil: false }}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute('role', 'img')
        gl.domElement.setAttribute('aria-label', label)
      }}
      onPointerDown={onPointerDown}
      onPointerLeave={onPointerLeave}
    >
      <color attach="background" args={[background]} />
      <Suspense fallback={null}>{children}</Suspense>
      {!mobile && <Effects bloom={bloom} />}
    </Canvas>
  )
}
