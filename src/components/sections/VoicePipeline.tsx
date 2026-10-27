import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useInView, usePrefersReducedMotion } from '../../lib/hooks'
import { Card } from '../ui/Card'
import { Icon, type IconName } from '../ui/Icon'
import { EASE, Reveal } from '../ui/Reveal'
import { SectionTitle } from '../ui/SectionTitle'

const STEPS: { icon: IconName; title: string; detail: string; time: string; timeLabel: string }[] = [
  { icon: 'mic', title: 'Microfone', detail: 'Palavra de ativação “Jarvis”, de qualquer tela', time: 'ao vivo', timeLabel: 'escuta' },
  { icon: 'wave', title: 'Whisper local', detail: 'Transcrição no seu computador, sem enviar áudio', time: '~1,3 s', timeLabel: 'transcrição' },
  { icon: 'chip', title: 'IA', detail: 'Claude, GPT ou Gemini, você escolhe', time: '~1,3 s', timeLabel: '1ª palavra' },
  { icon: 'speaker', title: 'Voz neural', detail: 'Resposta falada com efeito de IA', time: '~1,1 s', timeLabel: 'voz' },
]

/** Barras de áudio do microfone */
function Eq({ on }: { on: boolean }) {
  return (
    <span aria-hidden className="flex h-5 items-center gap-[3px]">
      {[0.2, 0.55, 0.35, 0.8, 0.45, 0.65, 0.3].map((d, i) => (
        <span
          key={i}
          className="h-full w-[3px] origin-center bg-ice transition-opacity duration-300"
          style={{
            animation: on ? `eq ${0.7 + d}s ease-in-out ${-d}s infinite` : undefined,
            transform: on ? undefined : 'scaleY(0.2)',
            opacity: on ? 1 : 0.35,
          }}
        />
      ))}
    </span>
  )
}

export function VoicePipeline() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 })
  const reduced = usePrefersReducedMotion()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!inView) return
    const id = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), reduced ? 2600 : 1300)
    return () => window.clearInterval(id)
  }, [inView, reduced])

  return (
    <section id="voz" aria-labelledby="voz-title" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
          <SectionTitle id="voz-title" index="02" eyebrow="Voz em tempo real" title="Você fala. Ele responde em segundos.">
            Detector neural de fala ignora ruído e teclado. Fale com ele de qualquer tela.
          </SectionTitle>
          <Reveal delay={0.1} className="lg:justify-self-end">
            <div className="cut cut-sm inline-flex items-baseline gap-4 bg-surface-1 px-5 py-4">
              <span className="font-display text-[0.65rem] tracking-[0.28em] text-text-dim">Da sua voz à resposta falada</span>
              <span className="font-display text-lg font-semibold tracking-[0.24em] text-ice">Em tempo real</span>
            </div>
          </Reveal>
        </div>

        <div ref={ref} className="relative mt-16">
          {/* Trilho: horizontal no desktop, vertical no celular */}
          <div aria-hidden className="absolute top-0 bottom-0 left-[27px] w-px bg-line-strong md:top-[27px] md:right-[12.5%] md:bottom-auto md:left-[12.5%] md:h-px md:w-auto">
            <div className="flow-line absolute inset-0 hidden md:block" />
          </div>
          {/* Pulso de luz que percorre o trilho */}
          <motion.span
            aria-hidden
            className="absolute z-10 hidden size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ice md:block"
            style={{ top: 27, boxShadow: '0 0 18px 4px rgba(143,208,255,0.55), 0 0 60px 12px rgba(143,208,255,0.18)' }}
            animate={{ left: `${12.5 + step * 25}%` }}
            transition={{ duration: reduced ? 0 : 0.9, ease: EASE }}
          />
          <motion.span
            aria-hidden
            className="absolute left-[27px] z-10 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ice md:hidden"
            style={{ boxShadow: '0 0 18px 4px rgba(143,208,255,0.55)' }}
            animate={{ top: `${12.5 + step * 25}%` }}
            transition={{ duration: reduced ? 0 : 0.9, ease: EASE }}
          />

          <ol className="relative grid gap-5 md:grid-cols-4 md:gap-6">
            {STEPS.map((s, i) => {
              const on = i === step
              const done = i < step
              return (
                <Reveal as="li" key={s.title} delay={i * 0.06} className="relative flex items-center gap-5 md:block">
                  <div
                    className={`cut cut-sm relative z-[1] grid size-14 shrink-0 place-items-center transition-[background-color,color] duration-500 md:mx-auto ${
                      on ? 'bg-ice text-bg' : done ? 'bg-surface-3 text-ice' : 'bg-[#070b10] text-text-dim'
                    }`}
                  >
                    <Icon name={s.icon} size={24} />
                  </div>
                  <Card
                    highlight={on}
                    className={`flex-1 p-5 transition-[background-color] duration-500 md:mt-6 ${on ? 'bg-surface-2' : ''}`}
                  >
                    <p className="tabular text-[0.7rem] text-text-dim">0{i + 1}</p>
                    <h3 className="mt-2 font-display text-[0.95rem] font-semibold tracking-[0.2em] text-text-strong">{s.title}</h3>
                    <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-text-dim">{s.detail}</p>
                    <div className="mt-4 flex h-11 items-end justify-between border-t border-line pt-3">
                      <span className="font-display text-[0.6rem] tracking-[0.24em] text-text-dim">{s.timeLabel}</span>
                      {i === 0 ? (
                        <Eq on={inView && !reduced} />
                      ) : (
                        <span className={`tabular text-lg transition-colors duration-500 ${on ? 'text-ice' : 'text-text-strong'}`}>{s.time}</span>
                      )}
                    </div>
                  </Card>
                </Reveal>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
