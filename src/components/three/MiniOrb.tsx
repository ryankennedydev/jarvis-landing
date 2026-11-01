import { useIsMobile, usePrefersReducedMotion } from '../../lib/hooks'
import { Orb, type OrbPalette, type VoicePhase } from './HeroOrb'
import SceneCanvas from './SceneCanvas'

/** Versão compacta e centralizada do orbe (vídeo do topo, demonstração e CTA). */
export default function MiniOrb({
  active,
  phase = 'falando',
  palette = 'ice',
  background,
}: {
  active: boolean
  phase?: VoicePhase
  palette?: OrbPalette
  background?: string
}) {
  const mobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  return (
    <SceneCanvas
      active={active}
      label="Orbe do Jarvis: esfera de partículas com núcleo brilhante, pulsando no ritmo da voz."
      camera={{ position: [0, 0, 7.4], fov: 42 }}
      bloom={0.9}
      background={background}
    >
      <Orb phase={phase} count={mobile ? 450 : 900} reduced={reduced} palette={palette} centered />
    </SceneCanvas>
  )
}
