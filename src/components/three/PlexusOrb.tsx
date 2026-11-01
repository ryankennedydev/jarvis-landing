import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useIsMobile, usePrefersReducedMotion } from '../../lib/hooks'
import { voiceLevel } from '../../lib/voice'
import type { VoicePhase } from './HeroOrb'
import SceneCanvas from './SceneCanvas'

const RADIUS = 1.85
/** Ligações de cada nó com os vizinhos mais próximos */
const LINKS = 4

/** Nós espalhados num volume de contorno irregular, cada um ligado aos vizinhos mais próximos. */
function buildNetwork(count: number) {
  const base = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const color = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const y = Math.random() * 2 - 1
    const theta = Math.random() * Math.PI * 2
    const s = Math.sqrt(1 - y * y)
    const x = s * Math.cos(theta)
    const z = s * Math.sin(theta)
    // Deformação suave da esfera: o contorno fica orgânico, não um círculo perfeito
    const blob = 1 + 0.1 * Math.sin(3 * x + 1.3) * Math.cos(2 * y) + 0.07 * Math.sin(4 * z + 2 * y)
    // Raiz cúbica concentra os nós perto da superfície, mas ainda preenche o miolo
    const r = RADIUS * blob * (0.3 + 0.7 * Math.cbrt(Math.random()))
    base.set([x * r, y * r, z * r], i * 3)
    seed[i] = Math.random()
    const g = 0.3 + 0.7 * Math.random() ** 2
    color.set([g, g, g], i * 3)
  }

  const seen = new Set<number>()
  const edges: number[] = []
  const near = new Array<number>(LINKS)
  const dist = new Array<number>(LINKS)
  for (let i = 0; i < count; i++) {
    near.fill(-1)
    dist.fill(Infinity)
    for (let j = 0; j < count; j++) {
      if (j === i) continue
      const dx = base[i * 3] - base[j * 3]
      const dy = base[i * 3 + 1] - base[j * 3 + 1]
      const dz = base[i * 3 + 2] - base[j * 3 + 2]
      const d = dx * dx + dy * dy + dz * dz
      if (d >= dist[LINKS - 1]) continue
      let k = LINKS - 1
      while (k > 0 && dist[k - 1] > d) {
        dist[k] = dist[k - 1]
        near[k] = near[k - 1]
        k--
      }
      dist[k] = d
      near[k] = j
    }
    for (const j of near) {
      const key = Math.min(i, j) * count + Math.max(i, j)
      if (j < 0 || seen.has(key)) continue
      seen.add(key)
      edges.push(i, j)
    }
  }
  return { base, seed, color, edges: Uint16Array.from(edges) }
}

function Network({ count, phase, reduced }: { count: number; phase: VoicePhase; reduced: boolean }) {
  const net = useMemo(() => buildNetwork(count), [count])
  const nodes = useMemo(() => net.base.slice(), [net])
  const lines = useMemo(() => {
    const out = new Float32Array(net.edges.length * 3)
    net.edges.forEach((n, k) => out.set(net.base.subarray(n * 3, n * 3 + 3), k * 3))
    return out
  }, [net])

  const group = useRef<THREE.Group>(null)
  const nodeGeo = useRef<THREE.BufferGeometry>(null)
  const lineGeo = useRef<THREE.BufferGeometry>(null)
  const nodeMat = useRef<THREE.PointsMaterial>(null)
  const lineMat = useRef<THREE.LineBasicMaterial>(null)
  const level = useRef(0)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const target = phase === 'falando' ? voiceLevel() : phase === 'ouvindo' ? 0.16 + 0.08 * Math.sin(t * 5) : 0
    // Sobe rápido e desce um pouco mais devagar, como um medidor de áudio
    level.current += (target - level.current) * Math.min(1, dt * (target > level.current ? 18 : 8))
    const l = level.current

    const { base, seed, edges } = net
    const breathe = reduced ? 0 : 0.018 * Math.sin(t * 1.1)
    for (let i = 0; i < count; i++) {
      const by = base[i * 3 + 1]
      const ripple = 0.5 + 0.5 * Math.sin(t * 7 + seed[i] * 20 + by * 2.4)
      const k = 1 + breathe + l * (0.08 + 0.2 * ripple)
      nodes[i * 3] = base[i * 3] * k
      nodes[i * 3 + 1] = by * k
      nodes[i * 3 + 2] = base[i * 3 + 2] * k
    }
    for (let e = 0; e < edges.length; e++) {
      const n = edges[e] * 3
      lines[e * 3] = nodes[n]
      lines[e * 3 + 1] = nodes[n + 1]
      lines[e * 3 + 2] = nodes[n + 2]
    }
    nodeGeo.current!.attributes.position.needsUpdate = true
    lineGeo.current!.attributes.position.needsUpdate = true

    if (!reduced) {
      const spin = 0.08 + (phase === 'pensando' ? 0.45 : 0) + l * 0.6
      group.current!.rotation.y += dt * spin
      group.current!.rotation.x = 0.22 * Math.sin(t * 0.17)
    }
    lineMat.current!.opacity = 0.1 + l * 0.32
    nodeMat.current!.size = 0.042 * (1 + l * 0.7)
  })

  return (
    <group ref={group}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={lineGeo}>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} usage={THREE.DynamicDrawUsage} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMat} color="#ffffff" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points frustumCulled={false}>
        <bufferGeometry ref={nodeGeo}>
          <bufferAttribute attach="attributes-position" args={[nodes, 3]} usage={THREE.DynamicDrawUsage} />
          <bufferAttribute attach="attributes-color" args={[net.color, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={nodeMat}
          size={0.042}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

/** Rede neural 3D da demonstração: gira devagar e pulsa com o volume da voz do Jarvis. */
export default function PlexusOrb({ active, phase, background }: { active: boolean; phase: VoicePhase; background?: string }) {
  const mobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  return (
    <SceneCanvas
      active={active}
      label="Rede de pontos ligados em forma de esfera, que pulsa conforme o Jarvis fala."
      camera={{ position: [0, 0, 7.4], fov: 42 }}
      bloom={0.5}
      background={background}
    >
      <Network count={mobile ? 380 : 680} phase={phase} reduced={reduced} />
    </SceneCanvas>
  )
}
