import { lazy, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AIS, REGIONS, type AiId, type BrainApi } from '../../lib/brain'
import { formatNumber } from '../../lib/format'
import { useCountUp, useInView } from '../../lib/hooks'
import { BrainFallback } from '../three/fallbacks'
import { SceneMount } from '../three/SceneMount'
import { Card } from '../ui/Card'
import { Icon, type IconName } from '../ui/Icon'
import { Reveal } from '../ui/Reveal'
import { SectionTitle } from '../ui/SectionTitle'

const BrainScene = lazy(() => import('../three/BrainScene'))

/** Seletor de IA: radiogroup com navegação por setas. */
function AiSelector({ value, onChange }: { value: AiId; onChange: (id: AiId) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (i + delta + AIS.length) % AIS.length
    onChange(AIS[next].id)
    refs.current[next]?.focus()
  }
  const current = AIS.find((a) => a.id === value)!

  return (
    <Card highlight className="p-5">
      <p id="ia-label" className="font-display text-[0.65rem] font-medium tracking-[0.3em] text-text-dim">
        IA conectada ao núcleo
      </p>
      <div role="radiogroup" aria-labelledby="ia-label" className="mt-4 grid grid-cols-3 gap-2">
        {AIS.map((ai, i) => {
          const checked = ai.id === value
          return (
            <button
              key={ai.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(ai.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`cut cut-sm flex h-12 items-center justify-center gap-2 font-display text-[0.72rem] font-semibold tracking-[0.2em] transition-colors duration-200 ${
                checked ? 'bg-surface-3 text-text-strong [--bd:rgba(143,208,255,0.6)]' : 'bg-surface-1 text-text-dim hover:text-text'
              }`}
            >
              <span aria-hidden className="size-2 rotate-45 transition-transform duration-300" style={{ background: ai.color, transform: `rotate(45deg) scale(${checked ? 1.25 : 0.8})` }} />
              {ai.name}
            </button>
          )
        })}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
        <div>
          <dt className="font-display text-[0.6rem] tracking-[0.24em] text-text-dim">Núcleo</dt>
          <dd className="mt-1 flex items-center gap-2 text-text-strong">
            <span aria-hidden className="size-1.5 rotate-45 bg-ok" />
            {current.name} online
          </dd>
        </div>
        <div>
          <dt className="font-display text-[0.6rem] tracking-[0.24em] text-text-dim">1ª palavra</dt>
          <dd className="tabular mt-1 text-text-strong">~{current.latency}</dd>
        </div>
      </dl>
    </Card>
  )
}

function RegionRow({ region, start, extra }: { region: (typeof REGIONS)[number]; start: boolean; extra: number }) {
  const value = useCountUp(region.count, start, 1600)
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-0.5 py-3">
      <span aria-hidden className="size-2.5 rotate-45" style={{ background: region.color, boxShadow: `0 0 10px ${region.color}66` }} />
      <span className="font-display text-[0.75rem] font-semibold tracking-[0.2em] text-text-strong">{region.name}</span>
      <span className="tabular text-right text-text-strong">{formatNumber(Math.round(value) + extra)}</span>
      <span />
      <span className="col-span-2 text-[0.8rem] leading-snug text-text-dim">
        <span className="text-text">{region.lobe}.</span> {region.description}
      </span>
    </li>
  )
}

function SceneButton({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="cut cut-sm grid size-9 place-items-center bg-[rgba(6,9,13,0.85)] text-text-dim transition-colors hover:bg-surface-3 hover:text-ice"
    >
      <Icon name={icon} size={16} />
    </button>
  )
}

export function Brain() {
  const [ai, setAi] = useState<AiId>('claude')
  const [engaged, setEngaged] = useState(false)
  const api = useRef<BrainApi | null>(null)
  const [panelRef, panelInView] = useInView<HTMLDivElement>({ once: true, threshold: 0.2 })
  const [live, setLive] = useState([0, 0, 0, 0, 0])

  // Contadores ao vivo: novas memórias e conversas chegando
  useEffect(() => {
    if (!panelInView) return
    const id = window.setInterval(() => {
      setLive((l) => {
        const n = l.slice()
        n[Math.random() < 0.65 ? 0 : 1] += 1
        return n
      })
    }, 3200)
    return () => window.clearInterval(id)
  }, [panelInView])

  return (
    <section id="cerebro" aria-labelledby="cerebro-title" className="relative py-28 md:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 h-[60%] bg-[radial-gradient(ellipse_50%_50%_at_40%_50%,rgba(143,208,255,0.05),transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle id="cerebro-title" index="03" eyebrow="Brain" title="Um cérebro que lembra de tudo.">
          Cada memória, conversa, tarefa, habilidade e agente vira um neurônio. Gire, aproxime e passe o mouse para ver o que o
          Jarvis sabe sobre você.
        </SectionTitle>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <div className="cut cut-lg brackets relative h-[440px] bg-[#05080b] sm:h-[540px] lg:h-[660px]">
              <SceneMount className="absolute inset-0" fallback={<BrainFallback />}>
                {(active) => <BrainScene active={active} ai={ai} apiRef={api} onEngagedChange={setEngaged} />}
              </SceneMount>

              <div aria-hidden className="pointer-events-none absolute top-5 left-6 font-display text-[0.62rem] tracking-[0.3em] text-text-dim">
                <p className="text-ice">Brain // vista 3D</p>
                <p className="tabular mt-1 tracking-normal">{formatNumber(REGIONS.reduce((a, r) => a + r.count, 0))} itens indexados</p>
              </div>

              <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="font-display text-[0.6rem] tracking-[0.24em] text-text-dim">
                  {engaged ? (
                    <span className="text-ice">Zoom ativo · role para aproximar</span>
                  ) : (
                    <>
                      <span className="hidden md:inline">Arraste para girar · clique para ativar o zoom</span>
                      <span className="md:hidden">Toque num neurônio para ver o que ele guarda</span>
                    </>
                  )}
                </p>
                <div role="group" aria-label="Controles da cena do cérebro" className="flex gap-1.5">
                  <SceneButton icon="rotateLeft" label="Girar para a esquerda" onClick={() => api.current?.rotate(-1)} />
                  <SceneButton icon="rotate" label="Girar para a direita" onClick={() => api.current?.rotate(1)} />
                  <SceneButton icon="plus" label="Aproximar" onClick={() => api.current?.zoom(1)} />
                  <SceneButton icon="minus" label="Afastar" onClick={() => api.current?.zoom(-1)} />
                  <SceneButton icon="eye" label="Voltar à vista inicial" onClick={() => api.current?.reset()} />
                </div>
              </div>
            </div>
          </Reveal>

          <div ref={panelRef} className="flex flex-col gap-5 lg:col-span-4">
            <Reveal delay={0.05}>
              <AiSelector value={ai} onChange={setAi} />
            </Reveal>
            <Reveal delay={0.1} className="flex-1">
              <Card className="h-full p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-[0.65rem] font-medium tracking-[0.3em] text-text-dim">Regiões</p>
                  <p className="flex items-center gap-2 font-display text-[0.6rem] tracking-[0.24em] text-ok">
                    <span aria-hidden className="size-1.5 rotate-45 bg-ok" />
                    Ao vivo
                  </p>
                </div>
                <ul className="mt-2 divide-y divide-line">
                  {REGIONS.map((r, i) => (
                    <RegionRow key={r.id} region={r} start={panelInView} extra={live[i]} />
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
