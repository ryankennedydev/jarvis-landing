import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { formatBRL, formatNumber, formatPercent, seeded } from '../../lib/format'
import { useInView, usePrefersReducedMotion } from '../../lib/hooks'
import { Card } from '../ui/Card'
import { EASE, Reveal } from '../ui/Reveal'
import { SectionTitle } from '../ui/SectionTitle'
import { Ticker } from '../ui/Ticker'

// ───────────────────────── Dados simulados ─────────────────────────

type Quote = { name: string; value: number; change: number; prefix?: string; digits: number }

const QUOTES: Quote[] = [
  { name: 'Ibovespa', value: 131842, change: 0.84, digits: 0 },
  { name: 'Dólar', value: 4.97, change: -0.12, prefix: 'R$ ', digits: 2 },
  { name: 'Euro', value: 5.38, change: 0.21, prefix: 'R$ ', digits: 2 },
  { name: 'S&P 500', value: 6012.4, change: -0.32, digits: 1 },
  { name: 'Nasdaq', value: 19544.2, change: 0.57, digits: 1 },
  { name: 'Brent', value: 74.18, change: -1.05, prefix: 'US$ ', digits: 2 },
  { name: 'Bitcoin', value: 68420, change: 2.31, prefix: 'US$ ', digits: 0 },
]

const PATRIMONIO = 248312.4
const INVESTIDO = 207032.28

const PERIODS = [
  { id: '1M', label: '1 mês', points: 22, start: 242100, stepDays: 1 },
  { id: '6M', label: '6 meses', points: 26, start: 221400, stepDays: 7 },
  { id: '1A', label: '1 ano', points: 52, start: 207032, stepDays: 7 },
] as const

type PeriodId = (typeof PERIODS)[number]['id']

/** Série com tendência de alta e ruído, presa aos valores inicial e final. */
function makeSeries(points: number, start: number, end: number, seed: number) {
  const rand = seeded(seed)
  const walk = [0]
  for (let i = 1; i < points; i++) walk.push(walk[i - 1] + (rand() - 0.5) * 2)
  const last = walk[points - 1]
  const amp = Math.abs(end - start) * 0.09 + 2200
  return walk.map((w, i) => {
    const t = i / (points - 1)
    return start + (end - start) * t + (w - last * t) * amp * 0.45
  })
}

const TODAY = new Date(2026, 9, 26)

function dateFor(period: (typeof PERIODS)[number], i: number) {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - (period.points - 1 - i) * period.stepDays)
  return d
}

const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')

// ───────────────────────── Componentes ─────────────────────────

function Change({ value, digits = 2, className = '' }: { value: number; digits?: number; className?: string }) {
  const up = value >= 0
  return (
    <span className={`tabular whitespace-nowrap ${up ? 'text-up' : 'text-down'} ${className}`}>
      <span aria-hidden>{up ? '▲' : '▼'}</span>
      <span className="sr-only">{up ? 'alta de' : 'queda de'}</span> {formatPercent(value, digits)}
    </span>
  )
}

function QuoteItem({ q }: { q: Quote }) {
  return (
    <span className="flex items-center gap-3 border-r border-line px-6 py-3.5">
      <span className="font-display text-[0.68rem] font-semibold tracking-[0.22em] text-text-dim">{q.name}</span>
      <span className="tabular text-sm text-text-strong">
        {q.prefix}
        {formatNumber(q.value, q.digits)}
      </span>
      <Change value={q.change} className="text-[0.78rem]" />
    </span>
  )
}

const W = 800
const H = 300
const PAD = { l: 64, r: 16, t: 20, b: 34 }

function EquityChart({ inView }: { inView: boolean }) {
  const reduced = usePrefersReducedMotion()
  const [periodId, setPeriodId] = useState<PeriodId>('6M')
  const [hover, setHover] = useState<number | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const period = PERIODS.find((p) => p.id === periodId)!

  const series = useMemo(() => makeSeries(period.points, period.start, PATRIMONIO, period.points * 31), [period])
  const { min, max, ticks } = useMemo(() => {
    const lo = Math.min(...series)
    const hi = Math.max(...series)
    const step = 10000
    const min = Math.floor((lo - 2000) / step) * step
    const max = Math.ceil((hi + 2000) / step) * step
    const ticks: number[] = []
    const every = (max - min) / step > 6 ? step * 2 : step
    for (let v = min; v <= max; v += every) ticks.push(v)
    return { min, max, ticks }
  }, [series])

  const x = (i: number) => PAD.l + (i / (series.length - 1)) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b)
  const line = series.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${x(series.length - 1)},${H - PAD.b} L${x(0)},${H - PAD.b} Z`
  const first = series[0]
  const last = series[series.length - 1]
  const delta = ((last - first) / first) * 100

  const indexFromPointer = (e: PointerEvent<SVGSVGElement>) => {
    const r = svg.current!.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (series.length - 1))
    return Math.max(0, Math.min(series.length - 1, i))
  }

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    const cur = hover ?? series.length - 1
    if (e.key === 'ArrowLeft') setHover(Math.max(0, cur - 1))
    else if (e.key === 'ArrowRight') setHover(Math.min(series.length - 1, cur + 1))
    else if (e.key === 'Home') setHover(0)
    else if (e.key === 'End') setHover(series.length - 1)
    else if (e.key === 'Escape') setHover(null)
    else return
    e.preventDefault()
  }

  const hi = hover !== null ? { i: hover, v: series[hover], d: dateFor(period, hover) } : null
  const draw = inView || reduced

  return (
    <Card highlight className="p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-[0.65rem] tracking-[0.3em] text-text-dim">Evolução do patrimônio</p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="tabular text-2xl text-text-strong md:text-[1.7rem]">{formatBRL(hi ? hi.v : last)}</span>
            {hi ? (
              <span className="tabular text-sm text-text-dim">{fmtDate(hi.d)}</span>
            ) : (
              <Change value={delta} className="text-sm" />
            )}
          </p>
        </div>
        <div role="radiogroup" aria-label="Período do gráfico" className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={p.id === periodId}
              aria-label={p.label}
              onClick={() => {
                setPeriodId(p.id)
                setHover(null)
              }}
              className={`cut cut-sm h-8 px-3 font-mono text-[0.72rem] transition-colors ${
                p.id === periodId ? 'bg-surface-3 text-ice [--bd:rgba(143,208,255,0.5)]' : 'bg-surface-1 text-text-dim hover:text-text'
              }`}
            >
              {p.id}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-5">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-pan-y select-none"
          tabIndex={0}
          role="img"
          aria-label={`Gráfico de linha do patrimônio em ${period.label}: de ${formatBRL(first)} para ${formatBRL(last)}. Use as setas para percorrer os pontos.`}
          onPointerMove={(e) => setHover(indexFromPointer(e))}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
        >
          <defs>
            <linearGradient id="eq-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#8fd0ff" stopOpacity="0.22" />
              <stop offset="1" stopColor="#8fd0ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="rgba(140,180,220,0.09)" />
              <text x={PAD.l - 10} y={y(t)} textAnchor="end" dominantBaseline="middle" className="tabular" style={{ fontSize: 11, fill: '#8d9aa8' }}>
                {formatNumber(t / 1000)} mil
              </text>
            </g>
          ))}
          {[0, Math.floor((series.length - 1) / 2), series.length - 1].map((i) => (
            <text key={i} x={x(i)} y={H - 10} textAnchor={i === 0 ? 'start' : i === series.length - 1 ? 'end' : 'middle'} className="tabular" style={{ fontSize: 11, fill: '#8d9aa8' }}>
              {fmtDate(dateFor(period, i))}
            </text>
          ))}

          <motion.path
            key={`a-${periodId}`}
            d={area}
            fill="url(#eq-area)"
            initial={{ opacity: 0 }}
            animate={{ opacity: draw ? 1 : 0 }}
            transition={{ duration: 0.8, delay: reduced ? 0 : 0.9 }}
          />
          <motion.path
            key={`l-${periodId}`}
            d={line}
            fill="none"
            stroke="#8fd0ff"
            strokeWidth={2}
            strokeLinejoin="round"
            initial={{ pathLength: reduced ? 1 : 0 }}
            animate={{ pathLength: draw ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 1.6, ease: EASE }}
          />

          {hi && (
            <g pointerEvents="none">
              <line x1={x(hi.i)} x2={x(hi.i)} y1={PAD.t} y2={H - PAD.b} stroke="rgba(143,208,255,0.5)" strokeDasharray="3 3" />
              <line x1={PAD.l} x2={W - PAD.r} y1={y(hi.v)} y2={y(hi.v)} stroke="rgba(143,208,255,0.3)" strokeDasharray="3 3" />
              <rect x={x(hi.i) - 5} y={y(hi.v) - 5} width={10} height={10} transform={`rotate(45 ${x(hi.i)} ${y(hi.v)})`} fill="#030406" stroke="#8fd0ff" strokeWidth={2} />
            </g>
          )}
        </svg>
        <p className="sr-only" aria-live="polite">
          {hi ? `${fmtDate(hi.d)}: ${formatBRL(hi.v)}` : ''}
        </p>
      </div>
    </Card>
  )
}

const SUMMARY = [
  { label: 'Patrimônio', value: formatBRL(PATRIMONIO) },
  { label: 'Resultado', value: `+${formatBRL(PATRIMONIO - INVESTIDO)}`, change: ((PATRIMONIO - INVESTIDO) / INVESTIDO) * 100 },
  { label: 'Hoje', value: `−${formatBRL(1204.55)}`, change: -0.48 },
  { label: 'Investido', value: formatBRL(INVESTIDO) },
]

const ALLOCATION = [
  { label: 'Ações BR', pct: 34 },
  { label: 'Exterior', pct: 22 },
  { label: 'FIIs', pct: 18 },
  { label: 'Renda fixa', pct: 18 },
  { label: 'Cripto', pct: 8 },
]

export function Finance() {
  const [quotes, setQuotes] = useState(QUOTES)
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.25 })
  const [chartRef, chartInView] = useInView<HTMLDivElement>({ threshold: 0.35, once: true })

  // Cotações oscilando levemente enquanto a seção está visível
  useEffect(() => {
    if (!inView) return
    const id = window.setInterval(() => {
      setQuotes((qs) =>
        qs.map((q) => {
          const jitter = (Math.random() - 0.5) * 0.08
          return { ...q, value: q.value * (1 + jitter / 100), change: Math.round((q.change + jitter) * 100) / 100 }
        }),
      )
    }, 2500)
    return () => window.clearInterval(id)
  }, [inView])

  return (
    <section id="financas" aria-labelledby="financas-title" className="relative py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle id="financas-title" index="06" eyebrow="Finanças" title="Seu dinheiro, em tempo real.">
          Cotações ao vivo, carteira consolidada e alertas por voz: “Jarvis, me avisa se o dólar passar de R$ 5,00”.
        </SectionTitle>

        <Reveal delay={0.1}>
          <Card size="sm" className="mt-12 bg-surface-1">
            <Ticker label="Cotações do mercado" duration={45}>
              {quotes.map((q) => (
                <QuoteItem key={q.name} q={q} />
              ))}
            </Ticker>
          </Card>
        </Reveal>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div ref={chartRef}>
              <EquityChart inView={chartInView} />
            </div>
          </Reveal>

          <div className="flex flex-col gap-5">
            <dl className="grid grid-cols-2 gap-3">
              {SUMMARY.map((s, i) => (
                <Reveal key={s.label} delay={0.05 * i}>
                  <Card className="h-full p-4">
                    <dt className="font-display text-[0.6rem] tracking-[0.26em] text-text-dim">{s.label}</dt>
                    <dd className="tabular mt-2 text-[0.95rem] text-text-strong xl:text-base">{s.value}</dd>
                    {s.change !== undefined && (
                      <dd className="mt-1">
                        <Change value={s.change} className="text-[0.75rem]" />
                      </dd>
                    )}
                  </Card>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={0.1} className="flex-1">
              <Card className="h-full p-5">
                <p className="font-display text-[0.65rem] tracking-[0.3em] text-text-dim">Distribuição da carteira</p>
                <ul className="mt-4 space-y-3.5">
                  {ALLOCATION.map((a, i) => (
                    <li key={a.label}>
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="text-text">{a.label}</span>
                        <span className="tabular text-text-dim">
                          <span className="text-text-strong">{a.pct}%</span> · {formatBRL((PATRIMONIO * a.pct) / 100).replace(/,\d+$/, '')}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-surface-2" role="presentation">
                        <motion.div
                          className="h-full bg-ice"
                          style={{ opacity: 1 - i * 0.14 }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${a.pct / 0.34}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.07 }}
                        />
                      </div>
                    </li>
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
