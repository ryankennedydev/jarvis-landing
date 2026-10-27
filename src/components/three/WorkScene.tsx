import { Edges, Html, OrbitControls } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import * as THREE from 'three'
import { useIsMobile, usePrefersReducedMotion } from '../../lib/hooks'
import { BOTS_PER_SECTOR, SECTORS, workSim, type SectorId } from '../../lib/workSim'
import { Platform } from './Platform'
import SceneCanvas from './SceneCanvas'

const ICE = '#8fd0ff'
const FLOOR_H = 0.44
const GAP = 0.05
const W = 2.7
const D = 1.7

const BOT_ON = new THREE.Color(ICE).multiplyScalar(2.4)
const BOT_OFF = new THREE.Color('#2b3846')
const SCREEN_ON = new THREE.Color('#bfe6ff').multiplyScalar(1.8)
const SCREEN_OFF = new THREE.Color('#0d141b')

/** Andar i (0 = térreo). O CEO, no topo, é um pouco menor. */
function floorDims(i: number) {
  const top = i === SECTORS.length - 1
  return { w: top ? W * 0.72 : W, d: top ? D * 0.72 : D, y: i * (FLOOR_H + GAP) + FLOOR_H / 2 }
}

/** Posições das mesas e bots de cada andar (2 × 2). */
function deskLayout(i: number) {
  const { w, d, y } = floorDims(i)
  return Array.from({ length: BOTS_PER_SECTOR }, (_, k) => {
    const col = k % 2
    const row = Math.floor(k / 2)
    return new THREE.Vector3((col - 0.5) * w * 0.48, y - FLOOR_H / 2, (row - 0.5) * d * 0.46)
  })
}

const noopSubscribe = () => () => {}

function Building({
  selected,
  onSelect,
  reduced,
  active,
}: {
  selected: SectorId | null
  onSelect: (id: SectorId) => void
  reduced: boolean
  active: boolean
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const bots = useRef<THREE.InstancedMesh>(null)
  const screens = useRef<THREE.InstancedMesh>(null)
  const desks = useRef<THREE.InstancedMesh>(null)
  const beacon = useRef<THREE.MeshBasicMaterial>(null)
  const state = useSyncExternalStore(active ? workSim.subscribe : noopSubscribe, workSim.getState)
  const total = SECTORS.length * BOTS_PER_SECTOR
  const glow = useRef(new Float32Array(total))

  const slots = useMemo(() => SECTORS.flatMap((_, i) => deskLayout(i)), [])
  const labels = useRef<(THREE.Group | null)[]>([])
  const camera = useThree((st) => st.camera)
  const side = useMemo(() => ({ v: new THREE.Vector3(), q: new THREE.Quaternion() }), [])

  // Posiciona mesas, monitores e bots uma vez
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const one = new THREE.Vector3(1, 1, 1)
    slots.forEach((p, k) => {
      desks.current?.setMatrixAt(k, m.compose(new THREE.Vector3(p.x, p.y + 0.13, p.z), q, one))
      screens.current?.setMatrixAt(k, m.compose(new THREE.Vector3(p.x, p.y + 0.21, p.z - 0.07), q, one))
      bots.current?.setMatrixAt(k, m.compose(new THREE.Vector3(p.x, p.y + 0.14, p.z + 0.13), q, one))
      bots.current?.setColorAt(k, BOT_OFF)
      screens.current?.setColorAt(k, SCREEN_OFF)
    })
    ;[desks, screens, bots].forEach((r) => {
      if (!r.current) return
      r.current.instanceMatrix.needsUpdate = true
      if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true
    })
  }, [slots])

  const tmp = useMemo(() => new THREE.Color(), [])
  useFrame((s, dt) => {
    // Direita da câmera, no plano horizontal e no espaço local do prédio
    const first = labels.current[0]
    if (first?.parent) {
      side.v.set(1, 0, 0).applyQuaternion(camera.quaternion)
      side.v.y = 0
      side.v.normalize().applyQuaternion(first.parent.getWorldQuaternion(side.q).invert())
      labels.current.forEach((g, i) => {
        if (!g) return
        const r = i === SECTORS.length - 1 ? 1.35 : 1.62
        g.position.set(side.v.x * r, floorDims(i).y, side.v.z * r)
      })
    }
    const working = workSim.getState().working
    const g = glow.current
    for (let k = 0; k < total; k++) {
      const target = working[k] ? 1 : 0
      g[k] += (target - g[k]) * Math.min(1, dt * (reduced ? 20 : 5))
      const flicker = working[k] && !reduced ? 0.85 + 0.15 * Math.sin(s.clock.elapsedTime * 9 + k) : 1
      bots.current?.setColorAt(k, tmp.copy(BOT_OFF).lerp(BOT_ON, g[k] * flicker))
      screens.current?.setColorAt(k, tmp.copy(SCREEN_OFF).lerp(SCREEN_ON, g[k]))
    }
    if (bots.current?.instanceColor) bots.current.instanceColor.needsUpdate = true
    if (screens.current?.instanceColor) screens.current.instanceColor.needsUpdate = true
    if (beacon.current) {
      const on = reduced ? 1 : Math.sin(s.clock.elapsedTime * 3) > 0.6 ? 1 : 0.15
      beacon.current.color.set(ICE).multiplyScalar(1 + on * 2.5)
    }
  })

  const topY = SECTORS.length * (FLOOR_H + GAP)

  return (
    <group>
      {SECTORS.map((sector, i) => {
        const { w, d, y } = floorDims(i)
        const active = selected === sector.id || hovered === i
        const busy = state.working.slice(i * BOTS_PER_SECTOR, (i + 1) * BOTS_PER_SECTOR).filter(Boolean).length
        return (
          <group key={sector.id}>
            {/* Laje */}
            <mesh position={[0, y - FLOOR_H / 2 + 0.012, 0]}>
              <boxGeometry args={[w, 0.024, d]} />
              <meshBasicMaterial color={active ? '#16324a' : '#0c1620'} />
            </mesh>
            {/* Vidro escuro do andar */}
            <mesh
              position={[0, y, 0]}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation()
                setHovered(i)
              }}
              onPointerOut={() => setHovered((h) => (h === i ? null : h))}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation()
                onSelect(sector.id)
              }}
            >
              <boxGeometry args={[w, FLOOR_H, d]} />
              <meshStandardMaterial
                color={active ? '#14283a' : '#0a121a'}
                metalness={0.7}
                roughness={0.18}
                transparent
                opacity={active ? 0.5 : 0.38}
                depthWrite={false}
              />
              <Edges color={ICE} transparent opacity={active ? 0.95 : 0.32} />
            </mesh>
            {/* Rótulo do setor: reposicionado a cada frame para ficar à direita do prédio */}
            <group
              ref={(g) => {
                labels.current[i] = g
              }}
              position={[0, y, 0]}
            >
              <Html zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }} className="-translate-y-1/2">
                <div
                  aria-hidden
                  className={`flex items-center gap-2 whitespace-nowrap font-display text-[0.58rem] tracking-[0.24em] transition-colors duration-200 ${
                    active ? 'text-ice' : 'text-text-dim'
                  }`}
                >
                  <span className={`inline-block h-px w-5 ${active ? 'bg-ice' : 'bg-line-strong'}`} />
                  <span className="tabular text-text-dim">{String(i + 1).padStart(2, '0')}</span>
                  {sector.name}
                  <span className={`tabular tracking-normal ${busy ? 'text-ice' : 'text-text-dim'}`}>
                    {busy}/{BOTS_PER_SECTOR}
                  </span>
                </div>
              </Html>
            </group>
          </group>
        )
      })}

      {/* Mesas, monitores e bots: instanciados (um draw call cada) */}
      <instancedMesh ref={desks} args={[undefined, undefined, total]}>
        <boxGeometry args={[0.42, 0.025, 0.24]} />
        <meshStandardMaterial color="#1a2633" metalness={0.4} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={screens} args={[undefined, undefined, total]}>
        <boxGeometry args={[0.2, 0.12, 0.012]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={bots} args={[undefined, undefined, total]}>
        <capsuleGeometry args={[0.045, 0.08, 4, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Colunas de canto */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[(sx * W) / 2, (topY - FLOOR_H - GAP) / 2, (sz * D) / 2]}>
            <boxGeometry args={[0.025, topY - FLOOR_H - GAP, 0.025]} />
            <meshBasicMaterial color={ICE} transparent opacity={0.4} />
          </mesh>
        )),
      )}

      {/* Antena e farol no topo */}
      <mesh position={[0.5, topY + 0.32, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.7, 6]} />
        <meshBasicMaterial color={ICE} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.5, topY + 0.68, 0]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial ref={beacon} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Rig({ reduced, interactive }: { reduced: boolean; interactive: boolean }) {
  const camera = useThree((st) => st.camera)
  useLayoutEffect(() => {
    camera.lookAt(0, 1.55, 0)
  }, [camera])
  if (!interactive) return null
  return (
    <OrbitControls
      target={[0, 1.55, 0]}
      enablePan={false}
      enableZoom={false}
      autoRotate={!reduced}
      autoRotateSpeed={0.55}
      minPolarAngle={0.7}
      maxPolarAngle={1.45}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.55}
    />
  )
}

function Scene({
  selected,
  onSelect,
  reduced,
  interactive,
  active,
}: {
  selected: SectorId | null
  onSelect: (id: SectorId) => void
  reduced: boolean
  interactive: boolean
  active: boolean
}) {
  const spin = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!interactive && !reduced && spin.current) spin.current.rotation.y += dt * 0.12
  })
  return (
    <>
      <ambientLight intensity={0.35} color="#9fbad6" />
      <directionalLight position={[4, 8, 5]} intensity={1.4} color="#cfe6ff" />
      <pointLight position={[0, 1.6, 0]} intensity={4} distance={4} color={ICE} />
      <group ref={spin}>
        <Building selected={selected} onSelect={onSelect} reduced={reduced} active={active} />
        <Platform radius={2.35} y={0} reduced={reduced} />
      </group>
      <Rig reduced={reduced} interactive={interactive} />
    </>
  )
}

export default function WorkScene({
  active,
  selected,
  onSelect,
}: {
  active: boolean
  selected: SectorId | null
  onSelect: (id: SectorId) => void
}) {
  const mobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  return (
    <SceneCanvas
      active={active}
      background="#05080b"
      bloom={0.7}
      label="Prédio de vidro escuro com bordas azul-gelo, um andar por setor da empresa de IA (Receita, Growth, Cliente, Engenharia, Jurídico, Finanças e CEO no topo), com pequenos bots nas mesas que acendem quando estão trabalhando, sobre uma plataforma circular."
      camera={{ position: [7.4, 4.3, 8.4], fov: 36 }}
    >
      <Scene selected={selected} onSelect={onSelect} reduced={reduced} interactive={!mobile} active={active} />
    </SceneCanvas>
  )
}
