/*
 * Composições estáticas em CSS com o mesmo enquadramento das cenas 3D.
 * Aparecem sem WebGL, enquanto a cena carrega e se ela falhar. Sem three.js aqui.
 */

import { REGIONS } from '../../lib/brain'
import { SECTORS } from '../../lib/workSim'

function DashedRing({ size, tilt, opacity, dash }: { size: string; tilt: number; opacity: number; dash: 'dashed' | 'dotted' }) {
  return (
    <span
      aria-hidden
      className="absolute top-1/2 left-1/2 rounded-full"
      style={{
        width: size,
        height: size,
        border: `1px ${dash} rgba(143,208,255,${opacity})`,
        transform: `translate(-50%, -50%) rotateX(${tilt}deg)`,
      }}
    />
  )
}

export function OrbFallback({ label, offset = false }: { label: string; offset?: boolean }) {
  return (
    <div role="img" aria-label={label} className="absolute inset-0 overflow-hidden [perspective:900px]">
      <div className={`absolute top-1/2 aspect-square w-[min(78vw,64vh)] -translate-y-1/2 ${offset ? 'left-1/2 -translate-x-1/2 lg:left-[70%]' : 'left-1/2 -translate-x-1/2'}`}>
        <div className="sonar absolute inset-[-12%] opacity-60" />
        <div
          className="absolute inset-[12%] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(220,240,255,0.95) 0 3%, rgba(143,208,255,0.55) 6%, rgba(143,208,255,0.08) 22%, transparent 40%),' +
              'radial-gradient(circle at 50% 50%, transparent 58%, rgba(143,208,255,0.16) 66%, rgba(47,111,168,0.06) 70%, transparent 71%)',
          }}
        />
        <div
          className="absolute inset-[12%] rounded-full opacity-70"
          style={{
            background: 'radial-gradient(circle, rgba(143,208,255,0.5) 1px, transparent 1.6px) 0 0 / 14px 14px',
            maskImage: 'radial-gradient(circle, transparent 40%, #000 62%, transparent 71%)',
          }}
        />
        <DashedRing size="96%" tilt={68} opacity={0.5} dash="dashed" />
        <DashedRing size="110%" tilt={76} opacity={0.3} dash="dotted" />
      </div>
    </div>
  )
}

const LOBES: Record<string, { x: string; y: string; w: string; h: string }> = {
  memorias: { x: '64%', y: '40%', w: '34%', h: '40%' },
  conversas: { x: '52%', y: '60%', w: '36%', h: '22%' },
  tarefas: { x: '44%', y: '30%', w: '30%', h: '34%' },
  habilidades: { x: '27%', y: '43%', w: '26%', h: '34%' },
  agentes: { x: '30%', y: '68%', w: '26%', h: '16%' },
}

export function BrainFallback() {
  return (
    <div
      role="img"
      aria-label="Ilustração estática do cérebro do Jarvis com as cinco regiões coloridas e o núcleo brilhante ao centro."
      className="absolute inset-0 overflow-hidden"
    >
      <div className="absolute top-[46%] left-1/2 aspect-[1.35] w-[min(86%,560px)] -translate-x-1/2 -translate-y-1/2">
        {REGIONS.map((r) => {
          const l = LOBES[r.id]
          return (
            <span
              key={r.id}
              aria-hidden
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
              style={{
                left: l.x,
                top: l.y,
                width: l.w,
                height: l.h,
                background: `radial-gradient(closest-side, ${r.color}55, ${r.color}14 70%, transparent)`,
              }}
            />
          )
        })}
        <span
          aria-hidden
          className="absolute inset-0 rounded-[50%] opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(200,230,255,0.55) 1px, transparent 1.5px) 0 0 / 11px 11px',
            maskImage: 'radial-gradient(ellipse 50% 46% at 50% 46%, #000 60%, transparent 100%)',
          }}
        />
        <span
          aria-hidden
          className="absolute top-[46%] left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, #fff 0 8%, #ff9a5c 18%, rgba(255,154,92,0.2) 45%, transparent 70%)' }}
        />
      </div>
      <div
        aria-hidden
        className="sonar absolute bottom-[6%] left-1/2 aspect-square w-[min(70%,420px)] -translate-x-1/2"
        style={{ transform: 'translateX(-50%) perspective(600px) rotateX(74deg)' }}
      />
    </div>
  )
}

export function WorkFallback() {
  return (
    <div
      role="img"
      aria-label="Ilustração estática do prédio da empresa de IA: sete andares empilhados, um por setor, sobre uma plataforma circular."
      className="absolute inset-0 flex items-end justify-center overflow-hidden pb-[12%]"
    >
      <div
        aria-hidden
        className="sonar absolute bottom-[4%] left-1/2 aspect-square w-[min(80%,440px)]"
        style={{ transform: 'translateX(-50%) perspective(600px) rotateX(74deg)' }}
      />
      <div className="relative flex w-[min(56%,300px)] flex-col-reverse gap-1.5">
        {SECTORS.map((s, i) => (
          <div
            key={s.id}
            className="flex h-9 items-center justify-between border border-[rgba(143,208,255,0.35)] bg-[rgba(14,30,44,0.45)] px-3"
            style={{ width: i === SECTORS.length - 1 ? '72%' : '100%', alignSelf: 'center' }}
          >
            <span className="font-display text-[0.55rem] tracking-[0.24em] text-text-dim">{s.name}</span>
            <span className="flex gap-1.5">
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className={`size-1.5 rotate-45 ${(i + k) % 3 === 0 ? 'bg-ice' : 'bg-[#2b3846]'}`} />
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
