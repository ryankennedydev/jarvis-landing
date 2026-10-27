import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const ICE = '#8fd0ff'

/**
 * Plataforma polar: disco escuro, grid polar, anéis de escala
 * e a varredura de sonar girando (a assinatura visual, agora em 3D).
 */
export function Platform({ radius = 2.6, y = 0, reduced = false }: { radius?: number; y?: number; reduced?: boolean }) {
  const sweep = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Group>(null)

  const grid = useMemo(() => {
    const g = new THREE.PolarGridHelper(radius, 24, 6, 96, ICE, ICE)
    const m = g.material as THREE.LineBasicMaterial
    m.transparent = true
    m.opacity = 0.09
    m.depthWrite = false
    return g
  }, [radius])

  const ticks = useMemo(() => {
    const pts: number[] = []
    const n = 120
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const long = i % 10 === 0
      const r0 = radius * 1.04
      const r1 = radius * (long ? 1.1 : 1.07)
      pts.push(Math.cos(a) * r0, 0, Math.sin(a) * r0, Math.cos(a) * r1, 0, Math.sin(a) * r1)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [radius])

  const sweepUniforms = useMemo(() => ({ uColor: { value: new THREE.Color(ICE) } }), [])

  useFrame((_, dt) => {
    if (reduced) return
    if (sweep.current) sweep.current.rotation.z -= dt * 1.2
    if (ring.current) ring.current.rotation.y += dt * 0.05
  })

  return (
    <group position={[0, y, 0]}>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <circleGeometry args={[radius * 1.12, 96]} />
        <meshBasicMaterial color="#05080c" transparent opacity={0.85} depthWrite={false} />
      </mesh>
      <primitive object={grid} />
      <mesh ref={sweep} rotation-x={-Math.PI / 2} position-y={0.005}>
        <circleGeometry args={[radius, 96]} />
        <shaderMaterial
          uniforms={sweepUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
          `}
          fragmentShader={/* glsl */ `
            uniform vec3 uColor;
            varying vec2 vUv;
            void main() {
              vec2 p = vUv - 0.5;
              float ang = atan(p.y, p.x);
              float t = fract(ang / 6.28318530718);
              float trail = pow(t, 7.0) * 0.32;
              float r = length(p) * 2.0;
              float a = trail * smoothstep(1.0, 0.85, r) * smoothstep(0.0, 0.25, r);
              gl_FragColor = vec4(uColor * a, a);
              #include <colorspace_fragment>
            }
          `}
        />
      </mesh>
      <group ref={ring}>
        <lineSegments geometry={ticks}>
          <lineBasicMaterial color={ICE} transparent opacity={0.35} depthWrite={false} />
        </lineSegments>
      </group>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[radius * 1.115, radius * 1.122, 128]} />
        <meshBasicMaterial color={ICE} transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  )
}
