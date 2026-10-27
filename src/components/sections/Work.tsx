import { lazy, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { useInView, usePrefersReducedMotion } from '../../lib/hooks'
import { BOTS_PER_SECTOR, SECTORS, workSim, type SectorId } from '../../lib/workSim'
import { WorkFallback } from '../three/fallbacks'
import { SceneMount } from '../three/SceneMount'
import { Card } from '../ui/Card'
import { Icon, type IconName } from '../ui/Icon'
import { Reveal } from '../ui/Reveal'
import { SectionTitle } from '../ui/SectionTitle'

const WorkScene = lazy(() => import('../three/WorkScene'))

const noopSubscribe = () => () => {}

const CAPABILITIES: { icon: IconName; label: string }[] = [
  { icon: 'globe', label: 'Pesquisa na web' },
  { icon: 'file', label: 'Arquivos' },
  { icon: 'calc', label: 'Cálculos' },
  { icon: 'terminal', label: 'Terminais lado a lado' },
]

const R_MANAGER = 100
const R_BOT = 168
const R_LABEL = 196

/** Ângulo do setor no mapa: o CEO fica no topo, os outros em volta. */
const angleOf = (i: number) => ((-90 + ((i + 1) % SECTORS.length) * (360 / SECTORS.length)) * Math.PI) / 180
const polar = (a: number, r: number) => [Math.cos(a) * r, Math.sin(a) * r] as const

function NodeMap({ working, selected, onSelect }: { working: boolean[]; selected: SectorId; onSelect: (id: SectorId) => void }) {
  const reduced = usePrefersReducedMotion()
  const onKey = (e: KeyboardEvent, id: SectorId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }

  return (
    <svg viewBox="-280 -240 560 480" className="h-auto w-full" role="group" aria-label="Mapa da empresa: núcleo no centro, gerentes ao redor e bots ligados a cada gerente">
      <defs>
        <radialGradient id="core-glow">
          <stop offset="0" stopColor="#8fd0ff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#8fd0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={R_MANAGER} fill="none" stroke="rgba(140,180,220,0.09)" strokeDasharray="2 5" />
      <circle r={R_BOT} fill="none" stroke="rgba(140,180,220,0.09)" strokeDasharray="2 5" />

      {SECTORS.map((s, i) => {
        const a = angleOf(i)
        const [mx, my] = polar(a, R_MANAGER)
        const isSel = s.id === selected
        const bots = working.slice(i * BOTS_PER_SECTOR, (i + 1) * BOTS_PER_SECTOR)
        const busy = bots.filter(Boolean).length
        const [lx, ly] = polar(a, R_LABEL)
        const anchor = lx > 20 ? 'start' : lx < -20 ? 'end' : 'middle'
        return (
          <g key={s.id}>
            <line x1={0} y1={0} x2={mx} y2={my} stroke={isSel ? '#8fd0ff' : 'rgba(140,180,220,0.18)'} strokeWidth={isSel ? 1.2 : 1} />
            {!reduced && busy > 0 && (
              <rect width={4} height={4} x={-2} y={-2} fill="#8fd0ff" transform="rotate(45)">
                <animateMotion dur="1.6s" repeatCount="indefinite" path={`M0,0 L${mx},${my}`} />
              </rect>
            )}
            {bots.map((on, k) => {
              const ba = a + ((k - (BOTS_PER_SECTOR - 1) / 2) * 13 * Math.PI) / 180
              const [bx, by] = polar(ba, R_BOT)
              return (
                <g key={k}>
                  <line x1={mx} y1={my} x2={bx} y2={by} stroke={on ? 'rgba(143,208,255,0.55)' : 'rgba(140,180,220,0.12)'} />
                  {!reduced && on && (
                    <circle r={1.8} fill="#cfeaff">
                      <animateMotion dur="1.1s" repeatCount="indefinite" path={`M${mx},${my} L${bx},${by}`} />
                    </circle>
                  )}
                  <rect
                    x={bx - 4.5}
                    y={by - 4.5}
                    width={9}
                    height={9}
                    transform={`rotate(45 ${bx} ${by})`}
                    fill={on ? '#8fd0ff' : '#070b10'}
                    stroke={on ? '#8fd0ff' : 'rgba(140,180,220,0.35)'}
                    style={{ transition: 'fill 300ms, stroke 300ms', filter: on ? 'drop-shadow(0 0 4px rgba(143,208,255,0.8))' : undefined }}
                  />
                </g>
              )
            })}
            <g
              role="button"
              tabIndex={0}
              aria-pressed={isSel}
              aria-label={`${s.manager}: ${busy} de ${BOTS_PER_SECTOR} bots trabalhando`}
              onClick={() => onSelect(s.id)}
              onKeyDown={(e) => onKey(e, s.id)}
              className="group cursor-pointer outline-none"
            >
              <circle cx={mx} cy={my} r={22} fill="transparent" />
              <rect
                x={mx - 17}
                y={my - 17}
                width={34}
                height={34}
                fill="none"
                stroke="#8fd0ff"
                strokeDasharray="3 3"
                className="opacity-0 group-focus-visible:opacity-100"
              />
              <path
                d={`M${mx - 7},${my - 11} H${mx + 11} V${my + 7} L${mx + 7},${my + 11} H${mx - 11} V${my - 7} Z`}
                fill={isSel ? '#8fd0ff' : '#0b1219'}
                stroke={isSel ? '#8fd0ff' : 'rgba(143,208,255,0.55)'}
                className="transition-colors group-hover:stroke-[#cfeaff]"
              />
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="font-display"
                style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fill: isSel ? '#8fd0ff' : '#8d9aa8' }}
              >
                {s.name}
              </text>
            </g>
          </g>
        )
      })}

      <circle r={46} fill="url(#core-glow)" />
      <path d="M-12,-20 H20 V12 L12,20 H-20 V-12 Z" fill="#0b1219" stroke="#8fd0ff" strokeWidth={1.2} />
      <text textAnchor="middle" dominantBaseline="middle" className="font-display" style={{ fontSize: 8, letterSpacing: '0.24em', fill: '#d8e1ea' }}>
        NÚCLEO
      </text>
    </svg>
  )
}

export function Work() {
  const [selected, setSelected] = useState<SectorId>('engenharia')
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.05 })
  const state = useSyncExternalStore(inView ? workSim.subscribe : noopSubscribe, workSim.getState)
  const idx = SECTORS.findIndex((s) => s.id === selected)
  const sector = SECTORS[idx]
  const busy = state.working.slice(idx * BOTS_PER_SECTOR, (idx + 1) * BOTS_PER_SECTOR).filter(Boolean).length
  const totalBusy = state.working.filter(Boolean).length

  return (
    <section id="work" aria-labelledby="work-title" className="relative py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle id="work-title" index="04" eyebrow="Work" title="Uma empresa de IA trabalhando para você.">
          Gerentes delegam, bots executam em paralelo: pesquisa na web, arquivos, cálculos e projetos com terminais lado a lado.
        </SectionTitle>

        <Reveal delay={0.1}>
          <ul className="mt-8 flex flex-wrap gap-2">
            {CAPABILITIES.map((c) => (
              <li key={c.label} className="cut cut-sm flex items-center gap-2 bg-surface-1 px-3.5 py-2 font-display text-[0.65rem] tracking-[0.22em] text-text">
                <Icon name={c.icon} size={15} className="text-ice" />
                {c.label}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="cut cut-lg relative h-[460px] bg-[#05080b] sm:h-[540px] lg:h-[620px]">
              <SceneMount className="absolute inset-0" fallback={<WorkFallback />}>
                {(active) => <WorkScene active={active} selected={selected} onSelect={setSelected} />}
              </SceneMount>
              <div aria-hidden className="pointer-events-none absolute top-5 left-6 font-display text-[0.62rem] tracking-[0.3em] text-text-dim">
                <p className="text-ice">Work // sede</p>
                <p className="tabular mt-1 tracking-normal">
                  {totalBusy}/{state.working.length} bots trabalhando
                </p>
              </div>
              <p aria-hidden className="pointer-events-none absolute bottom-4 left-6 font-display text-[0.6rem] tracking-[0.24em] text-text-dim">
                <span className="hidden md:inline">Arraste para girar · clique num andar</span>
                <span className="md:hidden">Escolha um setor no mapa</span>
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <Card highlight className="flex h-full flex-col p-5 md:p-6">
              <div className="flex items-center justify-between">
                <p className="font-display text-[0.65rem] font-medium tracking-[0.3em] text-text-dim">Organograma vivo</p>
                <p className="flex items-center gap-2 font-display text-[0.6rem] tracking-[0.24em] text-ok">
                  <span aria-hidden className="size-1.5 rotate-45 bg-ok" />
                  {totalBusy} em execução
                </p>
              </div>
              <div className="mx-auto w-full max-w-[460px]">
                <NodeMap working={state.working} selected={selected} onSelect={setSelected} />
              </div>

              <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                <div aria-live="polite">
                  <p className="font-display text-[0.6rem] tracking-[0.26em] text-text-dim">Setor selecionado</p>
                  <p className="mt-1.5 font-display text-base font-semibold tracking-[0.2em] text-ice">{sector.name}</p>
                  <p className="tabular mt-1 text-sm text-text">
                    {busy} de {BOTS_PER_SECTOR} bots ativos
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[0.82rem] text-text-dim">
                    {workSim.tasksFor(sector.id).map((t) => (
                      <li key={t} className="flex gap-2">
                        <span aria-hidden className="mt-[0.55em] size-1 shrink-0 rotate-45 bg-ice" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-display text-[0.6rem] tracking-[0.26em] text-text-dim">Atividade recente</p>
                  <ol className="mt-2 space-y-2 font-mono text-[0.72rem] leading-snug">
                    {state.log.length === 0 && <li className="text-text-dim">Aguardando tarefas…</li>}
                    {state.log.slice(0, 4).map((l) => (
                      <li key={l.id} className="text-text-dim">
                        <span className="tabular text-text-dim">{l.time}</span>{' '}
                        <span className="text-ice">
                          {SECTORS.find((s) => s.id === l.sector)!.name.slice(0, 3).toUpperCase()}-0{l.bot}
                        </span>{' '}
                        <span className="text-text">{l.task}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
