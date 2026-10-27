import { Html, OrbitControls } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { AIS, REGIONS, type AiId, type BrainApi } from '../../lib/brain'
import { seeded } from '../../lib/format'
import { useIsMobile, usePrefersReducedMotion } from '../../lib/hooks'
import { Tooltip } from '../ui/Tooltip'
import { Glow } from './Glow'
import { Platform } from './Platform'
import SceneCanvas from './SceneCanvas'

const CORE_POS = new THREE.Vector3(0, 0.05, 0)
const TARGET = new THREE.Vector3(0, -0.45, 0)
const HOME_DIST = 7.2
const MIN_DIST = 4.4
const MAX_DIST = 9.2

// ───────────────────────── Geração da nuvem de neurônios ─────────────────────────

const ell = (x: number, y: number, z: number, cx: number, cy: number, cz: number, rx: number, ry: number, rz: number) => {
  const dx = (x - cx) / rx
  const dy = (y - cy) / ry
  const dz = (z - cz) / rz
  return dx * dx + dy * dy + dz * dz
}

/** Região (índice em REGIONS) de um ponto do cérebro, pela posição anatômica aproximada. */
function cerebrumRegion(x: number, y: number, z: number) {
  if (Math.abs(x) > 0.62 && y < -0.05 && z > -0.7 && z < 0.9) return 1 // temporais → conversas
  if (z > 0.38) return 0 // frontal → memórias
  if (z < -0.78) return 3 // occipital → habilidades
  return 2 // parietal → tarefas
}

type BrainData = ReturnType<typeof generateBrain>

function generateBrain(count: number) {
  const rand = seeded(7)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const index = new Float32Array(count)
  const regions = new Uint8Array(count)
  const regionColors = REGIONS.map((r) => new THREE.Color(r.color))

  let k = 0
  while (k < count) {
    const x = (rand() * 2 - 1) * 1.5
    const y = rand() * 2.5 - 1.45
    const z = (rand() * 2 - 1) * 1.8
    // Giros e sulcos: pequena ondulação do contorno
    const gyri = 1 + 0.07 * Math.sin(x * 9.0) * Math.sin(y * 8.0 + 1.3) * Math.sin(z * 7.0 + 0.5)
    const side = x >= 0 ? 1 : -1
    const eC = ell(x, y, z, side * 0.6, 0.2, 0.05, 0.82, 1.0, 1.55) * gyri
    const eT = ell(x, y, z, side * 0.86, -0.38, 0.22, 0.5, 0.44, 0.85) * gyri
    const eB = ell(x, y, z, 0, -0.8, -1.08, 0.86, 0.44, 0.56) * gyri
    const eS = ell(x, y, z, 0, -1.08, -0.42, 0.2, 0.42, 0.22)

    let e: number
    let region: number
    if (eC <= 1 && Math.abs(x) > 0.05 && y > -0.62) {
      e = eC
      region = cerebrumRegion(x, y, z)
    } else if (eT <= 1) {
      e = eT
      region = 1
    } else if (eB <= 1 && y < -0.48) {
      e = eB
      region = 4
    } else if (eS <= 1) {
      e = 0.9
      region = 4
    } else continue

    // Densidade maior perto do córtex (casca), poucos pontos no interior
    if (e < 0.68 && rand() > 0.1) continue

    positions.set([x, y, z], k * 3)
    const c = regionColors[region]
    const b = 0.75 + rand() * 0.4
    colors.set([c.r * b, c.g * b, c.b * b], k * 3)
    seeds[k] = rand()
    index[k] = k
    regions[k] = region
    k++
  }

  // Conexões: até 2 vizinhos próximos por neurônio, via hash espacial
  const cell = 0.24
  const grid = new Map<number, number[]>()
  const key = (ix: number, iy: number, iz: number) => (ix + 64) * 16384 + (iy + 64) * 128 + (iz + 64)
  for (let i = 0; i < count; i++) {
    const kk = key(
      Math.floor(positions[i * 3] / cell),
      Math.floor(positions[i * 3 + 1] / cell),
      Math.floor(positions[i * 3 + 2] / cell),
    )
    const list = grid.get(kk)
    if (list) list.push(i)
    else grid.set(kk, [i])
  }
  const edges: number[] = []
  const edgeColors: number[] = []
  const pairs: [number, number][] = []
  for (let i = 0; i < count; i++) {
    if (rand() > 0.72) continue
    const px = positions[i * 3]
    const py = positions[i * 3 + 1]
    const pz = positions[i * 3 + 2]
    const cx = Math.floor(px / cell)
    const cy = Math.floor(py / cell)
    const cz = Math.floor(pz / cell)
    let best1 = -1
    let best2 = -1
    let d1 = cell * cell
    let d2 = cell * cell
    for (let ox = -1; ox <= 1; ox++)
      for (let oy = -1; oy <= 1; oy++)
        for (let oz = -1; oz <= 1; oz++) {
          const list = grid.get(key(cx + ox, cy + oy, cz + oz))
          if (!list) continue
          for (const j of list) {
            if (j <= i) continue
            const dx = positions[j * 3] - px
            const dy = positions[j * 3 + 1] - py
            const dz = positions[j * 3 + 2] - pz
            const d = dx * dx + dy * dy + dz * dz
            if (d < d1) {
              d2 = d1
              best2 = best1
              d1 = d
              best1 = j
            } else if (d < d2) {
              d2 = d
              best2 = j
            }
          }
        }
    for (const j of [best1, best2]) {
      if (j < 0) continue
      edges.push(px, py, pz, positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2])
      edgeColors.push(
        colors[i * 3] * 0.6,
        colors[i * 3 + 1] * 0.6,
        colors[i * 3 + 2] * 0.6,
        colors[j * 3] * 0.6,
        colors[j * 3 + 1] * 0.6,
        colors[j * 3 + 2] * 0.6,
      )
      pairs.push([i, j])
    }
  }

  // Impulsos elétricos que percorrem algumas conexões
  const impCount = Math.min(pairs.length, Math.round(count / 10))
  const impStart = new Float32Array(impCount * 3)
  const impEnd = new Float32Array(impCount * 3)
  const impSeed = new Float32Array(impCount)
  const impColor = new Float32Array(impCount * 3)
  for (let n = 0; n < impCount; n++) {
    const [a, b] = pairs[Math.floor(rand() * pairs.length)]
    impStart.set(positions.subarray(a * 3, a * 3 + 3), n * 3)
    impEnd.set(positions.subarray(b * 3, b * 3 + 3), n * 3)
    impColor.set(colors.subarray(a * 3, a * 3 + 3), n * 3)
    impSeed[n] = rand()
  }

  // Filamentos do núcleo (a IA conectada) até neurônios da casca
  const filCount = 42
  const filaments = new Float32Array(filCount * 6)
  const filStart = new Float32Array(filCount * 3)
  const filEnd = new Float32Array(filCount * 3)
  const filSeed = new Float32Array(filCount)
  for (let n = 0; n < filCount; n++) {
    const i = Math.floor(rand() * count)
    filaments.set([CORE_POS.x, CORE_POS.y, CORE_POS.z], n * 6)
    filaments.set(positions.subarray(i * 3, i * 3 + 3), n * 6 + 3)
    filStart.set([CORE_POS.x, CORE_POS.y, CORE_POS.z], n * 3)
    filEnd.set(positions.subarray(i * 3, i * 3 + 3), n * 3)
    filSeed[n] = rand()
  }

  // Centroides de cada região (para os rótulos)
  const centroids = REGIONS.map(() => new THREE.Vector3())
  const counts = REGIONS.map(() => 0)
  for (let i = 0; i < count; i++) {
    centroids[regions[i]].add(new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]))
    counts[regions[i]]++
  }
  centroids.forEach((c, r) => c.divideScalar(Math.max(1, counts[r])))

  return {
    count,
    positions,
    colors,
    seeds,
    index,
    regions,
    edges: new Float32Array(edges),
    edgeColors: new Float32Array(edgeColors),
    impulses: { count: impCount, start: impStart, end: impEnd, seed: impSeed, color: impColor },
    filaments: { count: filCount, lines: filaments, start: filStart, end: filEnd, seed: filSeed },
    centroids,
  }
}

// ───────────────────────── Shaders ─────────────────────────

const neuronVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uHover;
  attribute vec3 aColor;
  attribute float aSeed;
  attribute float aIndex;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = 0.5 + 0.5 * sin(uTime * (0.8 + aSeed * 2.2) + aSeed * 60.0);
    float hov = 1.0 - step(0.5, abs(aIndex - uHover));
    gl_PointSize = uSize * (0.55 + 0.75 * aSeed) * (1.0 + hov * 2.4) * uPixelRatio / -mv.z;
    vColor = aColor * (0.6 + 0.65 * tw) + hov * vec3(0.8);
    vAlpha = 0.5 + 0.5 * tw + hov;
  }
`

const pointFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor * a, a * clamp(vAlpha, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`

const impulseVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uSpeed;
  uniform vec3 uTint;
  uniform float uUseTint;
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute float aSeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float t = fract(uTime * uSpeed * (0.6 + aSeed * 0.8) + aSeed * 13.0);
    vec3 p = mix(aStart, aEnd, t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float life = sin(t * 3.14159265);
    gl_PointSize = uSize * (0.6 + life) * uPixelRatio / -mv.z;
    vColor = mix(aColor, uTint, uUseTint) * 1.8;
    vAlpha = life;
  }
`

function usePointUniforms<E extends Record<string, THREE.IUniform>>(size: number, extra: E = {} as E) {
  return useMemo(
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: 1 }, uSize: { value: size }, ...extra }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}

// ───────────────────────── Partes da cena ─────────────────────────

type Hovered = { index: number; region: number } | null

function Neurons({ data, reduced, onHover, hovered }: { data: BrainData; reduced: boolean; hovered: Hovered; onHover: (h: Hovered) => void }) {
  const uniforms = usePointUniforms(26, { uHover: { value: -1 } })
  const gl = useThree((s) => s.gl)

  useFrame((state) => {
    uniforms.uTime.value = reduced ? 1.0 : state.clock.elapsedTime
    uniforms.uPixelRatio.value = gl.getPixelRatio()
    uniforms.uHover.value = hovered ? hovered.index : -1
  })

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const i = e.index
    if (i === undefined) return
    if (!hovered || hovered.index !== i) onHover({ index: i, region: data.regions[i] })
  }

  return (
    <points onPointerMove={handleMove} onPointerOut={() => onHover(null)}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[data.colors, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[data.seeds, 1]} />
        <bufferAttribute attach="attributes-aIndex" args={[data.index, 1]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={neuronVertex}
        fragmentShader={pointFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Impulses({
  start,
  end,
  seed,
  color,
  size,
  speed,
  reduced,
  tint,
}: {
  start: Float32Array
  end: Float32Array
  seed: Float32Array
  color: Float32Array
  size: number
  speed: number
  reduced: boolean
  tint?: RefObject<THREE.Color>
}) {
  const uniforms = usePointUniforms(size, {
    uSpeed: { value: speed },
    uTint: { value: new THREE.Color() },
    uUseTint: { value: tint ? 1 : 0 },
  })
  const gl = useThree((s) => s.gl)
  // Posição base: necessária para o bounding sphere (o shader calcula a posição real)
  const base = useMemo(() => start.slice(), [start])

  useFrame((state) => {
    uniforms.uTime.value = reduced ? 0.35 : state.clock.elapsedTime
    uniforms.uPixelRatio.value = gl.getPixelRatio()
    if (tint?.current) (uniforms.uTint.value as THREE.Color).copy(tint.current)
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[base, 3]} />
        <bufferAttribute attach="attributes-aStart" args={[start, 3]} />
        <bufferAttribute attach="attributes-aEnd" args={[end, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seed, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[color, 3]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={impulseVertex}
        fragmentShader={pointFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Núcleo da IA conectada: a cor muda com uma transição suave ao trocar de modelo. */
function Core({ ai, data, reduced }: { ai: AiId; data: BrainData; reduced: boolean }) {
  const target = useMemo(() => new THREE.Color(), [])
  const current = useRef(new THREE.Color(AIS.find((a) => a.id === ai)!.color))
  const coreMat = useRef<THREE.MeshBasicMaterial>(null)
  const shellMat = useRef<THREE.MeshBasicMaterial>(null)
  const filMat = useRef<THREE.LineBasicMaterial>(null)
  const glowMat = useRef<THREE.ShaderMaterial>(null)
  const core = useRef<THREE.Group>(null)
  const filColors = useMemo(() => new Float32Array(data.filaments.count * 3), [data])

  useFrame((state, dt) => {
    target.set(AIS.find((a) => a.id === ai)!.color)
    current.current.lerp(target, 1 - Math.exp(-dt * 3.2))
    const c = current.current
    coreMat.current?.color.copy(c).multiplyScalar(3.2)
    shellMat.current?.color.copy(c)
    filMat.current?.color.copy(c)
    glowMat.current?.uniforms.uColor.value.copy(c)
    const t = state.clock.elapsedTime
    const beat = reduced ? 1 : 1 + 0.08 * Math.sin(t * 2.4) + 0.05 * Math.sin(t * 5.1)
    core.current?.scale.setScalar(beat)
    if (core.current && !reduced) core.current.rotation.y += dt * 0.6
  })

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.filaments.lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={filMat} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <Impulses
        start={data.filaments.start}
        end={data.filaments.end}
        seed={data.filaments.seed}
        color={filColors}
        size={34}
        speed={0.35}
        reduced={reduced}
        tint={current}
      />
      <group ref={core} position={CORE_POS}>
        <mesh>
          <icosahedronGeometry args={[0.15, 2]} />
          <meshBasicMaterial ref={coreMat} toneMapped={false} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.27, 1]} />
          <meshBasicMaterial ref={shellMat} wireframe transparent opacity={0.45} toneMapped={false} />
        </mesh>
        <Glow color={AIS.find((a) => a.id === ai)!.color} size={1.9} intensity={0.9} materialRef={glowMat} />
      </group>
    </group>
  )
}

/** Rótulos HTML das 5 regiões; perdem opacidade quando a região está do lado de trás. */
function RegionLabels({ data, groupRef }: { data: BrainData; groupRef: RefObject<THREE.Group | null> }) {
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const camera = useThree((s) => s.camera)
  const anchors = useMemo(
    () =>
      data.centroids.map((c, i) => {
        const dir = c.clone().sub(CORE_POS)
        if (i === 2) dir.y += 0.6 // parietal: rótulo acima
        if (i === 4) dir.y -= 0.3 // cerebelo: rótulo abaixo
        dir.normalize()
        return { pos: c.clone().add(dir.clone().multiplyScalar(1.15)), dir }
      }),
    [data],
  )
  const tmp = useMemo(() => ({ cam: new THREE.Vector3(), world: new THREE.Vector3() }), [])

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    tmp.cam.copy(camera.position).sub(TARGET).normalize()
    anchors.forEach((a, i) => {
      const el = refs.current[i]
      if (!el) return
      const facing = tmp.world.copy(a.dir).applyQuaternion(g.quaternion).dot(tmp.cam)
      el.style.opacity = String(0.4 + 0.6 * THREE.MathUtils.smoothstep(facing, -0.55, 0.25))
    })
  })

  return (
    <>
      {anchors.map((a, i) => {
        const r = REGIONS[i]
        return (
          <Html key={r.id} position={a.pos} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
            <div
              ref={(el) => {
                refs.current[i] = el
              }}
              aria-hidden
              className="cut cut-sm bg-[rgba(4,6,9,0.78)] px-2.5 py-1.5 whitespace-nowrap transition-opacity duration-300"
              style={{ '--bd': `${r.color}55` } as CSSProperties}
            >
              <p className="flex items-center gap-1.5 font-display text-[0.6rem] font-semibold tracking-[0.24em]" style={{ color: r.color }}>
                <span className="inline-block size-1.5 rotate-45" style={{ background: r.color }} />
                {r.name}
              </p>
              <p className="mt-0.5 font-display text-[0.52rem] tracking-[0.2em] text-text-dim">{r.lobe}</p>
            </div>
          </Html>
        )
      })}
    </>
  )
}

function Brain({
  ai,
  count,
  reduced,
  interactive,
  engaged,
  apiRef,
}: {
  ai: AiId
  count: number
  reduced: boolean
  interactive: boolean
  engaged: boolean
  apiRef: RefObject<BrainApi | null>
}) {
  const data = useMemo(() => generateBrain(count), [count])
  const [hovered, setHovered] = useState<Hovered>(null)
  const group = useRef<THREE.Group>(null)
  const controls = useRef<OrbitControlsImpl>(null)
  const rotTarget = useRef(0)
  const desiredDist = useRef<number | null>(null)
  const { camera, gl, raycaster } = useThree()

  useEffect(() => {
    raycaster.params.Points.threshold = 0.055
  }, [raycaster])

  // Com o zoom ativo, o Lenis não intercepta a roda do mouse sobre a cena
  useEffect(() => {
    if (engaged) gl.domElement.setAttribute('data-lenis-prevent', '')
    else gl.domElement.removeAttribute('data-lenis-prevent')
  }, [engaged, gl])

  useEffect(() => {
    gl.domElement.style.cursor = hovered ? 'pointer' : ''
  }, [hovered, gl])

  useEffect(() => {
    apiRef.current = {
      zoom: (d) => {
        const dist = camera.position.distanceTo(TARGET)
        desiredDist.current = THREE.MathUtils.clamp(dist * (d > 0 ? 0.82 : 1.2), MIN_DIST, MAX_DIST)
      },
      rotate: (d) => {
        rotTarget.current += d * (Math.PI / 4)
      },
      reset: () => {
        desiredDist.current = HOME_DIST
        rotTarget.current = Math.round(rotTarget.current / (Math.PI * 2)) * Math.PI * 2
      },
    }
    return () => {
      apiRef.current = null
    }
  }, [apiRef, camera])

  useFrame((_, dt) => {
    const g = group.current
    if (g) {
      if (!reduced && !hovered) rotTarget.current += dt * 0.09
      g.rotation.y += (rotTarget.current - g.rotation.y) * Math.min(1, dt * 4)
    }
    if (desiredDist.current !== null) {
      const dir = camera.position.clone().sub(TARGET)
      const dist = dir.length()
      const next = dist + (desiredDist.current - dist) * Math.min(1, dt * 6)
      camera.position.copy(TARGET).add(dir.setLength(next))
      if (Math.abs(next - desiredDist.current) < 0.01) desiredDist.current = null
      controls.current?.update()
    }
  })

  const hoverPos = hovered
    ? new THREE.Vector3().fromArray(data.positions, hovered.index * 3)
    : null
  const hoverRegion = hovered ? REGIONS[hovered.region] : null

  return (
    <>
      <group ref={group} position={[0, 0.1, 0]}>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.edges, 3]} />
            <bufferAttribute attach="attributes-color" args={[data.edgeColors, 3]} />
          </bufferGeometry>
          <lineBasicMaterial vertexColors transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
        <Neurons data={data} reduced={reduced} hovered={hovered} onHover={setHovered} />
        <Impulses
          start={data.impulses.start}
          end={data.impulses.end}
          seed={data.impulses.seed}
          color={data.impulses.color}
          size={30}
          speed={0.5}
          reduced={reduced}
        />
        <Core ai={ai} data={data} reduced={reduced} />
        <RegionLabels data={data} groupRef={group} />
        {hovered && hoverPos && hoverRegion && (
          <Html position={hoverPos} zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
            <Tooltip className="translate-x-3.5 -translate-y-1/2" label={hoverRegion.type} meta={`#${String(hovered.index).padStart(4, '0')}`} color={hoverRegion.color}>
              {hoverRegion.samples[hovered.index % hoverRegion.samples.length]}
            </Tooltip>
          </Html>
        )}
      </group>

      <Platform radius={1.75} y={-1.65} reduced={reduced} />

      {interactive && (
        <OrbitControls
          ref={controls}
          target={TARGET}
          enablePan={false}
          enableZoom={engaged}
          zoomSpeed={0.6}
          minDistance={MIN_DIST}
          maxDistance={MAX_DIST}
          minPolarAngle={0.55}
          maxPolarAngle={1.72}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
        />
      )}
    </>
  )
}

export default function BrainScene({
  active,
  ai,
  apiRef,
  onEngagedChange,
}: {
  active: boolean
  ai: AiId
  apiRef: RefObject<BrainApi | null>
  onEngagedChange?: (engaged: boolean) => void
}) {
  const mobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const [engaged, setEngaged] = useState(false)

  const setEngagedAndNotify = (v: boolean) => {
    setEngaged(v)
    onEngagedChange?.(v)
  }

  // Câmera inicial: vista 3/4 com o lobo frontal voltado para quem olha
  const dir = new THREE.Vector3(0.62, 0.24, 0.72).normalize().multiplyScalar(HOME_DIST)
  const position: [number, number, number] = [TARGET.x + dir.x, TARGET.y + dir.y, TARGET.z + dir.z]

  return (
    <SceneCanvas
      active={active}
      background="#05080b"
      bloom={0.8}
      label="Cérebro 3D do Jarvis: uma nuvem de neurônios coloridos por região (memórias, conversas, tarefas, habilidades e agentes), ligados por linhas finas a um núcleo brilhante, sobre uma plataforma polar."
      camera={{ position, fov: 40 }}
      onPointerDown={() => !mobile && setEngagedAndNotify(true)}
      onPointerLeave={() => setEngagedAndNotify(false)}
    >
      <Brain ai={ai} count={mobile ? 1300 : 2600} reduced={reduced} interactive={!mobile} engaged={engaged} apiRef={apiRef} />
    </SceneCanvas>
  )
}
