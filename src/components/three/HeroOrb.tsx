import { Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useIsMobile, usePrefersReducedMotion } from '../../lib/hooks'
import { Glow } from './Glow'
import SceneCanvas from './SceneCanvas'

export type VoicePhase = 'ouvindo' | 'entendendo' | 'pensando' | 'falando'

const ICE = new THREE.Color('#8fd0ff')
const DEEP = new THREE.Color('#2f6fa8')
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

/** Energia-alvo de cada fase da conversa */
const PHASE_ENERGY: Record<VoicePhase, number> = { ouvindo: 0.55, entendendo: 0.3, pensando: 0.2, falando: 1 }

/** Pontos distribuídos em espiral de Fibonacci sobre uma esfera. */
function fibonacciSphere(count: number, radius: number) {
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const y = 1 - ((i + 0.5) / count) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = GOLDEN * i
    pos[i * 3] = Math.cos(theta) * r * radius
    pos[i * 3 + 1] = y * radius
    pos[i * 3 + 2] = Math.sin(theta) * r * radius
    seed[i] = Math.random()
  }
  return { pos, seed }
}

/** Onda de áudio simulada: seno + ruído, com sílabas e pausas. */
function voiceSignal(t: number) {
  const syllables = Math.abs(Math.sin(t * 10.5)) * (0.6 + 0.4 * Math.sin(t * 3.7 + 1.3))
  const noise = Math.sin(t * 23.1) * Math.sin(t * 7.9 + 0.7) * 0.25
  const envelope = 0.55 + 0.45 * Math.sin(t * 1.4)
  return Math.max(0, syllables * envelope + noise)
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uMouseStrength;
  uniform vec3 uMouse;
  attribute float aSeed;
  varying float vGlow;
  varying float vMix;

  void main() {
    vec3 dir = normalize(position);
    float wave = sin(dir.y * 7.0 - uTime * 3.2 + aSeed * 0.6) * 0.5 + 0.5;
    float wave2 = sin(atan(dir.z, dir.x) * 5.0 + uTime * 1.7) * 0.5 + 0.5;
    float jitter = sin(uTime * (2.0 + aSeed * 3.0) + aSeed * 40.0) * 0.5 + 0.5;
    float disp = uEnergy * (0.14 * wave + 0.07 * wave2 + 0.05 * jitter);

    float m = pow(max(dot(dir, uMouse), 0.0), 8.0) * uMouseStrength;
    disp += m * 0.28;

    vec3 p = position * (1.0 + disp);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    gl_PointSize = uSize * (0.55 + 0.9 * aSeed) * (1.0 + disp * 2.2) * uPixelRatio / -mv.z;

    vec3 nView = normalize(normalMatrix * dir);
    float facing = 0.35 + 0.65 * smoothstep(-0.7, 0.5, nView.z);
    vGlow = clamp(0.45 + disp * 3.2 + m * 0.9, 0.0, 1.8) * facing;
    vMix = wave;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vGlow;
  varying float vMix;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    vec3 col = mix(uColorB, uColorA, 0.35 + 0.65 * vMix) * vGlow;
    gl_FragColor = vec4(col, a * min(vGlow, 1.0));
    #include <colorspace_fragment>
  }
`

export function Orb({
  phase,
  count,
  reduced,
  centered = false,
}: {
  phase: VoicePhase
  count: number
  reduced: boolean
  centered?: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const shell = useRef<THREE.Points>(null)
  const ringA = useRef<THREE.Group>(null)
  const ringB = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.ShaderMaterial>(null)
  const pointer = useRef({ x: 0, y: 0, last: -10 })
  const energy = useRef(0.4)
  const { viewport, size, gl } = useThree()

  const { pos, seed } = useMemo(() => fibonacciSphere(count, 1.6), [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEnergy: { value: 0.4 },
      uSize: { value: 38 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector3(0, 0, 1) },
      uMouseStrength: { value: 0 },
      uColorA: { value: ICE.clone() },
      uColorB: { value: DEEP.clone() },
    }),
    [],
  )

  const ringPoints = useMemo(() => {
    const make = (r: number) =>
      Array.from({ length: 129 }, (_, i) => {
        const a = (i / 128) * Math.PI * 2
        return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)
      })
    return { a: make(2.05), b: make(2.32) }
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1
      pointer.current.last = performance.now()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const tmp = useMemo(() => ({ v: new THREE.Vector3(), q: new THREE.Quaternion() }), [])
  const coreColor = useMemo(() => new THREE.Color('#cfeaff').multiplyScalar(2.2), [])
  // Desktop: orbe deslocado para a direita do texto; celular: centralizado acima do texto
  const wide = !centered && size.width >= 1024
  const offsetX = wide ? viewport.width * 0.2 : 0
  const ndcOffset = wide ? 0.4 : 0
  // Telas estreitas: reduz o orbe para que ele e os anéis caibam com folga (a pulsação aumenta o raio)
  const fit = centered ? 1 : Math.min(1, viewport.width / 5.6)
  const offsetY = wide || centered ? 0 : -0.15

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const u = uniforms
    u.uTime.value = reduced ? 0 : t
    u.uPixelRatio.value = gl.getPixelRatio()

    // Energia: a onda de voz simulada modulada pela fase da conversa
    const speaking = phase === 'falando' || phase === 'ouvindo'
    const target = reduced ? 0.35 : PHASE_ENERGY[phase] * (speaking ? 0.35 + voiceSignal(t) : 0.8 + 0.2 * Math.sin(t * 2))
    energy.current += (target - energy.current) * Math.min(1, dt * 9)
    u.uEnergy.value = energy.current

    // Reação ao mouse: o orbe se inclina na direção do cursor e as partículas sob ele se acendem
    const p = pointer.current
    const recent = performance.now() - p.last < 2500 ? 1 : 0
    u.uMouseStrength.value += (recent - u.uMouseStrength.value) * Math.min(1, dt * 3)
    const g = group.current
    if (g) {
      const spin = reduced ? 0 : dt * (phase === 'pensando' ? 0.45 : 0.12)
      g.rotation.y += spin
      g.rotation.x += (p.y * 0.25 - g.rotation.x) * Math.min(1, dt * 2)
      g.rotation.z += (-p.x * 0.12 - g.rotation.z) * Math.min(1, dt * 2)
      tmp.v.set((p.x - ndcOffset) * 0.9, p.y * 0.9, 0.85).normalize()
      tmp.q.copy(g.quaternion).invert()
      u.uMouse.value.copy(tmp.v.applyQuaternion(tmp.q))
    }

    if (!reduced) {
      if (ringA.current) ringA.current.rotation.y += dt * 0.35
      if (ringB.current) ringB.current.rotation.y -= dt * 0.22
    }
    const pulse = 1 + energy.current * 0.18
    core.current?.scale.setScalar(pulse)
    if (glow.current) glow.current.uniforms.uIntensity.value = 0.55 + energy.current * 0.45
  })

  return (
    <group position={[offsetX, offsetY, 0]} scale={fit}>
      <group ref={group}>
        <points ref={shell}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[pos, 3]} />
            <bufferAttribute attach="attributes-aSeed" args={[seed, 1]} />
          </bufferGeometry>
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>

      <group rotation={[1.18, 0, 0.22]}>
        <group ref={ringA}>
          <Line points={ringPoints.a} color="#8fd0ff" lineWidth={1.1} dashed dashSize={0.16} gapSize={0.1} transparent opacity={0.55} />
        </group>
      </group>
      <group rotation={[1.32, 0, -0.38]}>
        <group ref={ringB}>
          <Line points={ringPoints.b} color="#8fd0ff" lineWidth={0.8} dashed dashSize={0.05} gapSize={0.12} transparent opacity={0.35} />
        </group>
      </group>

      <mesh ref={core}>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshBasicMaterial color={coreColor} toneMapped={false} />
      </mesh>
      <Glow color="#8fd0ff" size={2.6} intensity={0.8} materialRef={glow} />
    </group>
  )
}

export default function HeroOrb({ active, phase }: { active: boolean; phase: VoicePhase }) {
  const mobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  return (
    <SceneCanvas
      active={active}
      label="Orbe do Jarvis: uma esfera de partículas azul-gelo com núcleo brilhante e dois anéis tracejados, pulsando no ritmo da voz e reagindo ao mouse."
      camera={{ position: [0, 0, 6.4], fov: 45 }}
      bloom={0.9}
    >
      <Orb phase={phase} count={mobile ? 700 : 1400} reduced={reduced} />
    </SceneCanvas>
  )
}
