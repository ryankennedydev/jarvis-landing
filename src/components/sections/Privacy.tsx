import { useEffect, useState, type ReactNode } from 'react'
import { useInView, usePrefersReducedMotion } from '../../lib/hooks'
import { Card } from '../ui/Card'
import { Icon, type IconName } from '../ui/Icon'
import { Reveal } from '../ui/Reveal'
import { SectionTitle } from '../ui/SectionTitle'

function LocalData() {
  return (
    <div className="space-y-1.5 font-mono text-[0.72rem]">
      <p className="text-text-dim">~/.local/share/jarvis/</p>
      {[
        ['memorias.db', '48 MB'],
        ['conversas/', '3.912'],
        ['brain.index', '12 MB'],
      ].map(([f, s]) => (
        <p key={f} className="flex justify-between gap-3 pl-3 text-text">
          <span>├ {f}</span>
          <span className="tabular text-text-dim">{s}</span>
        </p>
      ))}
      <p className="flex items-center gap-2 pt-2 text-ok">
        <span aria-hidden className="size-1.5 rotate-45 bg-ok" />
        Enviado para a nuvem: 0 B
      </p>
    </div>
  )
}

function Pin({ running }: { running: boolean }) {
  const reduced = usePrefersReducedMotion()
  const [n, setN] = useState(reduced ? 4 : 0)
  useEffect(() => {
    if (!running || reduced) return
    const id = window.setInterval(() => setN((v) => (v + 1) % 7), 550)
    return () => window.clearInterval(id)
  }, [running, reduced])
  const unlocked = n >= 4
  return (
    <div>
      <div className="flex gap-2" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`cut cut-sm grid size-10 place-items-center transition-colors duration-200 ${
              i < Math.min(n, 4) ? 'bg-surface-3 [--bd:rgba(143,208,255,0.55)]' : 'bg-surface-1'
            }`}
          >
            {i < Math.min(n, 4) && <span className="size-2 rotate-45 bg-ice" />}
          </span>
        ))}
      </div>
      <p className={`mt-3 flex items-center gap-2 font-display text-[0.6rem] tracking-[0.24em] ${unlocked ? 'text-ok' : 'text-text-dim'}`}>
        <span aria-hidden className={`size-1.5 rotate-45 ${unlocked ? 'bg-ok' : 'bg-text-dim'}`} />
        {unlocked ? 'Desbloqueado' : 'Bloqueado · digite o PIN'}
      </p>
    </div>
  )
}

function Keys() {
  const keys = [
    ['ANTHROPIC_API_KEY', 'sk-ant-', '3f9a'],
    ['OPENAI_API_KEY', 'sk-', 'b21c'],
    ['GEMINI_API_KEY', 'AIza', 'Q7xe'],
  ]
  return (
    <div className="space-y-2 font-mono text-[0.7rem]">
      <p className="text-text-dim">.env</p>
      {keys.map(([k, pre, end]) => (
        <p key={k} className="truncate text-text">
          <span className="text-text-dim">{k}=</span>
          {pre}
          <span className="tracking-[-0.1em] text-ice">••••••••••</span>
          {end}
        </p>
      ))}
    </div>
  )
}

function LocalVoice({ running }: { running: boolean }) {
  return (
    <div>
      <div aria-hidden className="flex h-10 items-center gap-[3px]">
        {Array.from({ length: 28 }, (_, i) => (
          <span
            key={i}
            className="h-full w-[3px] bg-ice"
            style={{
              opacity: 0.35 + ((i * 37) % 10) / 15,
              transform: `scaleY(${0.2 + ((i * 53) % 10) / 12})`,
              animation: running ? `eq ${0.6 + ((i * 7) % 5) / 6}s ease-in-out ${-i / 9}s infinite` : undefined,
            }}
          />
        ))}
      </div>
      <p className="mt-3 flex items-center gap-2 font-display text-[0.6rem] tracking-[0.24em] text-text-dim">
        <Icon name="wifiOff" size={14} className="text-ice" />
        Funciona sem internet
      </p>
    </div>
  )
}

export function Privacy() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 })

  const cards: { icon: IconName; title: string; text: string; demo: ReactNode }[] = [
    {
      icon: 'drive',
      title: 'Seus dados ficam no seu computador',
      text: 'Memórias, conversas e o cérebro inteiro são arquivos locais. Nada vai para servidor nosso.',
      demo: <LocalData />,
    },
    {
      icon: 'lock',
      title: 'PIN de bloqueio',
      text: 'Ninguém abre o Jarvis nem lê suas memórias sem o seu PIN.',
      demo: <Pin running={inView} />,
    },
    {
      icon: 'key',
      title: 'Chaves de API protegidas',
      text: 'Ficam só no .env, nunca saem dele e aparecem mascaradas na tela.',
      demo: <Keys />,
    },
    {
      icon: 'mic',
      title: 'Voz 100% local',
      text: 'O reconhecimento de fala roda no seu computador. Seu áudio não é enviado a ninguém.',
      demo: <LocalVoice running={inView} />,
    },
  ]

  return (
    <section id="privacidade" aria-labelledby="privacidade-title" className="relative py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle id="privacidade-title" index="08" eyebrow="Privacidade" title="O que é seu fica com você.">
          Um assistente que sabe tanto sobre você precisa ser seu de verdade.
        </SectionTitle>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal as="li" key={c.title} delay={0.06 * i}>
              <Card highlight className="flex h-full flex-col p-6">
                <span className="cut cut-sm grid size-11 place-items-center bg-surface-2 text-ice">
                  <Icon name={c.icon} size={20} />
                </span>
                <h3 className="mt-5 font-display text-[0.85rem] leading-snug font-semibold tracking-[0.18em] text-text-strong">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-dim">{c.text}</p>
                <div className="mt-auto border-t border-line pt-5">
                  <div className="mt-1">{c.demo}</div>
                </div>
              </Card>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
