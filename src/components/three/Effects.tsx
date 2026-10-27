import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

/** Bloom sutil, vinheta e ruído leve. */
export function Effects({ bloom = 0.75 }: { bloom?: number }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={bloom} luminanceThreshold={0.55} luminanceSmoothing={0.25} radius={0.7} />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.18} />
      <Vignette offset={0.32} darkness={0.62} eskil={false} />
    </EffectComposer>
  )
}
