import { useIsMobile, usePrefersReducedMotion } from '../../lib/hooks'
import { Orb } from './HeroOrb'
import SceneCanvas from './SceneCanvas'

/** Versão compacta do orbe para o CTA final. */
export default function MiniOrb({ active }: { active: boolean }) {
  const mobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  return (
    <SceneCanvas
      active={active}
      label="Pequeno orbe do Jarvis girando: esfera de partículas azul-gelo com núcleo brilhante."
      camera={{ position: [0, 0, 7.4], fov: 42 }}
      bloom={0.9}
    >
      <Orb phase="falando" count={mobile ? 450 : 900} reduced={reduced} centered />
    </SceneCanvas>
  )
}
