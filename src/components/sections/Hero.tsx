import { lazy, useEffect, useState } from 'react'
import { useInView, usePrefersReducedMotion } from '../../lib/hooks'
import { PRICE } from '../../lib/config'
import { scrollToId } from '../../lib/lenis'
import { OrbFallback } from '../three/fallbacks'
import type { VoicePhase } from '../three/HeroOrb'
import { SceneMount } from '../three/SceneMount'
import { ButtonLink } from '../ui/Button'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'
import { Reveal } from '../ui/Reveal'
import { Sonar } from '../ui/Sonar'

const HeroOrb = lazy(() => import('../three/HeroOrb'))

const USER_LINE = 'Jarvis, quanto está o dólar hoje?'
const JARVIS_LINE = 'R$ 4,97, senhor. Praticamente estável no dia. Quer que eu avise se passar de R$ 5,00?'

const PHASES: { id: VoicePhase; label: string }[] = [
  { id: 'ouvindo', label: 'Ouvindo' },
  { id: 'entendendo', label: 'Entendendo' },
  { id: 'pensando', label: 'Pensando' },
  { id: 'falando', label: 'Falando' },
]

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = window.setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      window.clearTimeout(t)
      reject(new DOMException('abort', 'AbortError'))
    })
  })

/** Roteiro da demonstração: digita a pergunta, passa pelas fases e digita a resposta. */
function useConversation(running: boolean) {
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState<VoicePhase>('ouvindo')
  const [user, setUser] = useState(0)
  const [bot, setBot] = useState(0)

  useEffect(() => {
    if (!running) return
    const ctrl = new AbortController()
    const { signal } = ctrl

    const type = async (text: string, set: (n: number) => void, speed: number) => {
      for (let i = 1; i <= text.length; i++) {
        set(i)
        await sleep(text[i - 1] === ' ' ? speed * 0.6 : speed + Math.random() * speed * 0.6, signal)
      }
    }

    const loop = async () => {
      if (reduced) {
        setUser(USER_LINE.length)
        setBot(JARVIS_LINE.length)
        for (let i = 0; ; i = (i + 1) % PHASES.length) {
          setPhase(PHASES[i].id)
          await sleep(2400, signal)
        }
      }
      for (;;) {
        setPhase('ouvindo')
        setUser(0)
        setBot(0)
        await sleep(700, signal)
        await type(USER_LINE, setUser, 48)
        await sleep(350, signal)
        setPhase('entendendo')
        await sleep(1000, signal)
        setPhase('pensando')
        await sleep(1300, signal)
        setPhase('falando')
        await type(JARVIS_LINE, setBot, 30)
        await sleep(4200, signal)
      }
    }
    loop().catch(() => {})
    return () => ctrl.abort()
  }, [running, reduced])

  return { phase, user, bot }
}

/** Texto digitado sem deslocar o layout: o texto completo reserva o espaço, invisível. */
function Typed({ text, shown, cursor }: { text: string; shown: number; cursor: boolean }) {
  return (
    <span className="grid">
      <span className="invisible [grid-area:1/1]">{text}</span>
      <span className="[grid-area:1/1]">
        {text.slice(0, shown)}
        {cursor && <span className="ml-0.5 inline-block h-[1.05em] w-[0.5em] translate-y-[0.18em] animate-blink bg-ice" />}
      </span>
    </span>
  )
}

export function Hero() {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.05 })
  const { phase, user, bot } = useConversation(inView)
  const phaseIndex = PHASES.findIndex((p) => p.id === phase)
  const typingUser = phase === 'ouvindo'
  const typingBot = phase === 'falando' && bot < JARVIS_LINE.length

  return (
    <section ref={ref} id="inicio" aria-labelledby="hero-title" className="relative isolate overflow-hidden lg:min-h-svh">
      <SceneMount
        preload="0px"
        className="relative h-[54svh] min-h-[340px] w-full lg:absolute lg:inset-0 lg:h-full"
        fallback={<OrbFallback offset label="Orbe do Jarvis: esfera de partículas azul-gelo com núcleo brilhante e anéis tracejados." />}
      >
        {(active) => <HeroOrb active={active} phase={phase} />}
      </SceneMount>

      {/* Varredura de sonar centrada no orbe */}
      <div
        aria-hidden
        className="sonar pointer-events-none absolute top-[27svh] left-1/2 aspect-square w-[min(92vw,52svh)] -translate-x-1/2 -translate-y-1/2 opacity-30 mix-blend-screen lg:top-1/2 lg:left-[70%] lg:w-[min(46vw,82vh)]"
      />

      {/* Legibilidade do texto sobre a cena no desktop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,#030406_0%,rgba(3,4,6,0.85)_30%,rgba(3,4,6,0.2)_55%,transparent_70%)] lg:block" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />

      {/* HUD decorativo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-20 mx-auto hidden max-w-7xl justify-between px-8 font-mono text-[0.65rem] tracking-[0.2em] text-text-faint lg:flex">
        <span>SYS.ONLINE // NÚCLEO LOCAL</span>
        <span className="tabular">LAT −23.55 · LON −46.63</span>
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl items-center px-4 pb-20 sm:px-6 lg:min-h-svh lg:px-8 lg:pt-24">
        <div className="w-full max-w-xl -mt-16 lg:mt-0 lg:w-1/2">
          <Reveal>
            <p className="mb-6 flex items-center gap-3 font-display text-[0.7rem] font-medium tracking-[0.32em] text-ice">
              <span aria-hidden className="h-px w-8 bg-ice" />
              Assistente pessoal de IA · Linux
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              id="hero-title"
              className="font-display text-[1.9rem] leading-[1.15] font-semibold tracking-[0.2em] text-text-strong sm:text-5xl lg:text-[3.4rem]"
            >
              Seu J.A.R.V.I.S. pessoal.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-dim">
              Fale “Jarvis” e ele ouve, pensa, responde em voz e executa: no seu computador, com seus dados guardados nele.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <Card highlight className="mt-8 p-5">
              <p className="sr-only">
                Demonstração de conversa. Você: “{USER_LINE}” Jarvis: “{JARVIS_LINE}”
              </p>
              <div aria-hidden>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="flex items-center gap-2.5 font-display text-[0.72rem] font-semibold tracking-[0.32em] text-ice">
                    <Sonar size={12} />
                    <span className="inline-grid">
                      {PHASES.map((p) => (
                        <span
                          key={p.id}
                          className={`[grid-area:1/1] transition-opacity duration-300 ${p.id === phase ? 'opacity-100' : 'opacity-0'}`}
                        >
                          {p.label}
                        </span>
                      ))}
                    </span>
                  </p>
                  <span className="flex gap-1">
                    {PHASES.map((p, i) => (
                      <span
                        key={p.id}
                        className={`h-1 w-5 transition-colors duration-300 ${i <= phaseIndex ? 'bg-ice' : 'bg-surface-3'}`}
                      />
                    ))}
                  </span>
                </div>
                <dl className="space-y-3 text-[0.95rem] leading-relaxed">
                  <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                    <dt className="pt-[0.2rem] font-display text-[0.65rem] tracking-[0.26em] text-text-dim">Você</dt>
                    <dd className="text-text">
                      <Typed text={`“${USER_LINE}”`} shown={user === 0 ? 0 : user + (user === USER_LINE.length ? 2 : 1)} cursor={typingUser} />
                    </dd>
                  </div>
                  <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                    <dt className="pt-[0.2rem] font-display text-[0.65rem] tracking-[0.26em] text-ice">Jarvis</dt>
                    <dd className="text-text-strong">
                      <Typed text={`“${JARVIS_LINE}”`} shown={bot === 0 ? 0 : bot + (bot === JARVIS_LINE.length ? 2 : 1)} cursor={typingBot} />
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.2} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href="#comprar"
              size="lg"
              icon={<Icon name="arrowRight" size={17} />}
              onClick={(e) => {
                e.preventDefault()
                scrollToId('comprar')
              }}
            >
              Garantir acesso · R$ {PRICE.to}
            </ButtonLink>
            <ButtonLink
              href="#voz"
              size="lg"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('voz')
              }}
            >
              Ver funcionalidades
            </ButtonLink>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-5 font-mono text-[0.72rem] tracking-wide text-text-dim">Acesso vitalício · pagamento único · Fedora · Ubuntu · Arch</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
