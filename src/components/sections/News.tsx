import { useEffect, useState, type CSSProperties } from 'react'
import { seeded } from '../../lib/format'
import { useInView, usePrefersReducedMotion } from '../../lib/hooks'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'
import { Reveal } from '../ui/Reveal'
import { SectionTitle } from '../ui/SectionTitle'

type Story = { source: string; topic: string; title: string; time: string; lead?: string }

// Manchetes fictícias para demonstração
const MAIN: Story = {
  source: 'Valor',
  topic: 'Mercado e economia',
  title: 'Juros estáveis e inflação de serviços em queda animam a bolsa no fechamento do mês',
  lead: 'Analistas veem espaço para cortes graduais no próximo ano. Ibovespa renova a máxima do semestre e o dólar fecha praticamente estável.',
  time: 'há 32 min',
}

const HIGHLIGHTS: Story[] = [
  { source: 'G1', topic: 'Brasil', title: 'Frente fria derruba temperaturas no Sul e chega a São Paulo no fim de semana', time: 'há 1 h' },
  { source: 'BBC', topic: 'Mundo', title: 'Rede de sensores autônomos mapeia corrente oceânica profunda pela primeira vez', time: 'há 2 h' },
  { source: 'The Guardian', topic: 'Política internacional', title: 'Cúpula do clima termina com acordo parcial sobre financiamento', time: 'há 3 h' },
]

const TOPICS: { name: string; stories: Story[] }[] = [
  {
    name: 'Política · Brasil',
    stories: [
      { source: 'Folha', topic: '', title: 'Câmara conclui votação do novo marco das ferrovias; texto vai ao Senado', time: 'há 48 min' },
      { source: 'G1', topic: '', title: 'Estados pedem mais prazo para entregar planos de segurança pública', time: 'há 2 h' },
      { source: 'CNN Brasil', topic: '', title: 'Comissão aprova projeto que leva internet rápida a escolas rurais', time: 'há 4 h' },
    ],
  },
  {
    name: 'Política internacional',
    stories: [
      { source: 'The New York Times', topic: '', title: 'Negociação comercial entre blocos avança após rodada de 14 horas', time: 'há 1 h' },
      { source: 'BBC', topic: '', title: 'Parlamento europeu debate regras para IA em serviços públicos', time: 'há 3 h' },
      { source: 'The Guardian', topic: '', title: 'Eleições regionais têm participação recorde em três países nórdicos', time: 'há 5 h' },
    ],
  },
  {
    name: 'Mercado e economia',
    stories: [
      { source: 'Valor', topic: '', title: 'Ibovespa sobe puxado por bancos; dólar fecha a R$ 4,97', time: 'há 20 min' },
      { source: 'Folha', topic: '', title: 'Vendas no varejo crescem pelo terceiro mês seguido', time: 'há 2 h' },
      { source: 'CNN Brasil', topic: '', title: 'Petróleo recua com estoques acima do esperado', time: 'há 3 h' },
    ],
  },
  {
    name: 'Mundo',
    stories: [
      { source: 'BBC', topic: '', title: 'Telescópio registra imagem inédita de um berçário de estrelas', time: 'há 1 h' },
      { source: 'The New York Times', topic: '', title: 'Cidades costeiras testam barreiras flutuantes contra ressacas', time: 'há 4 h' },
      { source: 'G1', topic: '', title: 'Festival de cinema tem recorde de produções latino-americanas', time: 'há 6 h' },
    ],
  },
]

/** Imagem abstrata gerada em CSS, sempre em tons de azul-gelo. */
function artStyle(seed: number): CSSProperties {
  const r = seeded(seed)
  const p = () => Math.round(r() * 100)
  const a = () => Math.round(r() * 360)
  return {
    backgroundImage: [
      `radial-gradient(circle at ${p()}% ${p()}%, rgba(143,208,255,0.42), transparent ${18 + Math.round(r() * 22)}%)`,
      `radial-gradient(circle at ${p()}% ${p()}%, transparent 0 ${20 + p() / 5}%, rgba(143,208,255,0.22) ${21 + p() / 5}%, transparent ${22 + p() / 5}%)`,
      `conic-gradient(from ${a()}deg at ${p()}% ${p()}%, rgba(143,208,255,0.16), transparent 22%, rgba(47,111,168,0.28) 48%, transparent 72%)`,
      `repeating-linear-gradient(${a()}deg, rgba(143,208,255,0.07) 0 1px, transparent 1px ${6 + Math.round(r() * 10)}px)`,
      `linear-gradient(${a()}deg, #0c1a27, #04070a)`,
    ].join(','),
  }
}

function Meta({ story, topic }: { story: Story; topic?: boolean }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.72rem]">
      <span className="font-display font-semibold tracking-[0.16em] text-ice">{story.source}</span>
      {topic && story.topic && (
        <>
          <span aria-hidden className="text-text-faint">
            /
          </span>
          <span className="font-display tracking-[0.18em] text-text-dim">{story.topic}</span>
        </>
      )}
      <span aria-hidden className="text-text-faint">
        ·
      </span>
      <span className="tabular text-text-dim">{story.time}</span>
    </p>
  )
}

function Reading({ on }: { on: boolean }) {
  if (!on) return null
  return (
    <span className="absolute top-3 right-3 z-[3] flex items-center gap-2 bg-[rgba(3,4,6,0.85)] px-2 py-1 font-display text-[0.55rem] tracking-[0.24em] text-ice">
      <span aria-hidden className="flex h-3 items-center gap-[2px]">
        {[0.3, 0.7, 0.5, 0.9].map((d, i) => (
          <span key={i} className="h-full w-[2px] bg-ice" style={{ animation: `eq ${0.6 + d / 2}s ease-in-out ${-d}s infinite` }} />
        ))}
      </span>
      Lendo
    </span>
  )
}

export function News() {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.1 })
  const reduced = usePrefersReducedMotion()
  const queue = [MAIN, ...HIGHLIGHTS]

  useEffect(() => {
    if (!playing || !inView) return
    const id = window.setInterval(() => setCurrent((c) => (c + 1) % queue.length), reduced ? 4000 : 3200)
    return () => window.clearInterval(id)
  }, [playing, inView, reduced, queue.length])

  const ring = (i: number) => (playing && current === i ? '[--bd:rgba(143,208,255,0.7)] bg-surface-2' : '')

  return (
    <section id="noticias" aria-labelledby="noticias-title" className="relative py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionTitle id="noticias-title" index="07" eyebrow="Notícias" title="O dia inteiro em uma tela.">
            Jarvis também lê as manchetes para você, pela voz.
          </SectionTitle>
          <Reveal delay={0.1}>
            <button
              type="button"
              aria-pressed={playing}
              onClick={() => {
                setPlaying((p) => !p)
                setCurrent(0)
              }}
              className={`cut cut-sm flex h-12 items-center gap-3 px-5 font-display text-[0.72rem] font-semibold tracking-[0.22em] transition-colors ${
                playing ? 'bg-ice text-bg' : 'bg-surface-1 text-ice [--bd:rgba(143,208,255,0.55)] hover:bg-surface-3'
              }`}
            >
              <Icon name={playing ? 'pause' : 'play'} size={16} />
              {playing ? 'Pausar leitura' : 'Ouvir manchetes'}
            </button>
          </Reveal>
        </div>
        <p className="sr-only" aria-live="polite">
          {playing ? `Lendo: ${queue[current].title}` : ''}
        </p>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Card as="article" size="lg" highlight className={`group flex h-full flex-col transition-colors duration-300 ${ring(0)}`}>
              <Reading on={playing && current === 0} />
              <div aria-hidden className="news-art aspect-[16/8] w-full transition-transform duration-500" style={artStyle(11)} />
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <Meta story={MAIN} topic />
                <h3 className="mt-3 text-2xl leading-snug font-semibold text-text-strong md:text-[1.75rem]">{MAIN.title}</h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-text-dim">{MAIN.lead}</p>
              </div>
            </Card>
          </Reveal>

          <div className="grid gap-5">
            {HIGHLIGHTS.map((s, i) => (
              <Reveal key={s.title} delay={0.05 * (i + 1)}>
                <Card as="article" className={`flex h-full gap-4 p-4 transition-colors duration-300 ${ring(i + 1)}`}>
                  <Reading on={playing && current === i + 1} />
                  <div aria-hidden className="news-art cut cut-sm aspect-square w-24 shrink-0 sm:w-28" style={artStyle(23 + i * 7)} />
                  <div className="min-w-0">
                    <Meta story={s} topic />
                    <h3 className="mt-2 text-[0.98rem] leading-snug font-semibold text-text-strong">{s.title}</h3>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((t, ti) => (
            <Reveal key={t.name} delay={0.05 * ti}>
              <Card as="article" className="h-full p-5">
                <h3 className="flex items-center gap-2 border-b border-line pb-3 font-display text-[0.68rem] font-semibold tracking-[0.24em] text-text-strong">
                  <span aria-hidden className="size-1.5 rotate-45 bg-ice" />
                  {t.name}
                </h3>
                <ul className="divide-y divide-line">
                  {t.stories.map((s, si) => (
                    <li key={s.title} className="py-3.5">
                      {si === 0 && <div aria-hidden className="news-art cut cut-sm mb-3 aspect-[16/7]" style={artStyle(100 + ti * 13)} />}
                      <Meta story={s} />
                      <p className="mt-1.5 text-[0.9rem] leading-snug text-text">{s.title}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-[0.75rem] text-text-dim">
          Manchetes fictícias, criadas para esta demonstração. Os nomes dos veículos aparecem só como texto, sem logos.
        </p>
      </div>
    </section>
  )
}
