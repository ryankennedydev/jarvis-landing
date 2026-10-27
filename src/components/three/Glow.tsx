import { Billboard } from '@react-three/drei'
import { useMemo, type Ref } from 'react'
import * as THREE from 'three'

/** Halo radial aditivo (sempre virado para a câmera). Funciona mesmo sem bloom. */
export function Glow({
  color,
  size = 2,
  intensity = 1,
  materialRef,
}: {
  color: THREE.ColorRepresentation
  size?: number
  intensity?: number
  materialRef?: Ref<THREE.ShaderMaterial>
}) {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  return (
    <Billboard>
      <mesh>
        <planeGeometry args={[size, size]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={/* glsl */ `
            uniform vec3 uColor;
            uniform float uIntensity;
            varying vec2 vUv;
            void main() {
              float d = length(vUv - 0.5) * 2.0;
              float a = pow(max(1.0 - d, 0.0), 2.4) * uIntensity;
              gl_FragColor = vec4(uColor * a, a);
              #include <colorspace_fragment>
            }
          `}
        />
      </mesh>
    </Billboard>
  )
}
