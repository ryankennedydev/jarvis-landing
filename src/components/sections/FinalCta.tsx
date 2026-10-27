import { lazy } from 'react'
import { CHECKOUT_URL, PRICE } from '../../lib/config'
import { OrbFallback } from '../three/fallbacks'
import { SceneMount } from '../three/SceneMount'
import { ButtonLink } from '../ui/Button'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'
import { Reveal } from '../ui/Reveal'
import { Sonar } from '../ui/Sonar'

const MiniOrb = lazy(() => import('../three/MiniOrb'))

const BENEFITS: { title: string; text: string }[] = [
  { title: 'Acesso vitalício', text: 'Paga uma vez e usa para sempre. Sem mensalidade.' },
  { title: 'Voz em tempo real', text: 'Fala “Jarvis” de qualquer tela e ele responde em voz.' },
  { title: 'Brain 3D', text: 'Memórias, conversas, tarefas e habilidades num só lugar.' },
  { title: 'Work', text: 'Sua empresa de IA, com gerentes e bots trabalhando em paralelo.' },
  { title: 'Controle do computador', text: 'Executa comandos e pede autorização antes de alterar algo.' },
  { title: 'Finanças e notícias', text: 'Cotações ao vivo, carteira e manchetes lidas pela voz.' },
  { title: 'Claude, GPT ou Gemini', text: 'Você escolhe a IA e usa a sua própria chave de API.' },
  { title: 'Privacidade total', text: 'Seus dados ficam no seu computador, protegidos por PIN.' },
]

function PriceCard() {
  return (
    <Card size="lg" highlight className="p-6 sm:p-8 [--bd:rgba(143,208,255,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 font-display text-[0.72rem] font-semibold tracking-[0.3em] text-ice">
          <Sonar size={13} />
          Acesso vitalício
        </p>
        <span className="cut cut-sm bg-ice px-2.5 py-1 font-display text-[0.62rem] font-semibold tracking-[0.2em] text-bg">
          −{PRICE.discount}
        </span>
      </div>

      <div className="mt-6">
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-text-dim">
          <span>de</span>
          <s className="tabular text-base text-text decoration-text-dim decoration-[1.5px]">
            <span className="sr-only">preço original </span>
            {PRICE.from}
          </s>
          <span>por</span>
        </p>
        <p className="mt-1 flex items-start gap-2 text-text-strong">
          <span className="tabular mt-2 text-lg sm:mt-3 sm:text-xl">R$</span>
          <span className="tabular text-6xl leading-none font-medium tracking-tight sm:text-7xl">{PRICE.to}</span>
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-display text-[0.62rem] tracking-[0.26em] text-text-dim">
          <span>Pagamento único · sem mensalidade</span>
          <span className="text-ice">
            Você economiza <span className="tabular tracking-normal">{PRICE.saving}</span>
          </span>
        </p>
      </div>

      <ul className="mt-7 grid gap-x-6 gap-y-3.5 border-t border-line pt-6 sm:grid-cols-2">
        {BENEFITS.map((b) => (
          <li key={b.title} className="flex gap-3">
            <span className="cut cut-sm mt-0.5 grid size-5 shrink-0 place-items-center bg-surface-3 text-ice">
              <Icon name="check" size={13} strokeWidth={2} />
            </span>
            <span className="text-sm leading-snug">
              <span className="font-medium text-text-strong">{b.title}.</span> <span className="text-text-dim">{b.text}</span>
            </span>
          </li>
        ))}
      </ul>

      <ButtonLink href={CHECKOUT_URL} size="lg" className="mt-8 w-full" icon={<Icon name="arrowRight" size={17} />}>
        Garantir meu acesso
      </ButtonLink>
    </Card>
  )
}

export function FinalCta() {
  return (
    <section id="comprar" aria-labelledby="comprar-title" className="relative overflow-hidden py-28 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/4 h-2/3 bg-[radial-gradient(ellipse_45%_50%_at_70%_50%,rgba(143,208,255,0.06),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:px-8">
        <div className="text-center lg:text-left">
          <Reveal>
            <div className="relative mx-auto size-[220px] sm:size-[260px] lg:mx-0">
              <SceneMount className="absolute inset-0" fallback={<OrbFallback label="Pequeno orbe do Jarvis." />}>
                {(active) => <MiniOrb active={active} />}
              </SceneMount>
              <div aria-hidden className="sonar pointer-events-none absolute inset-[4%] opacity-40 mix-blend-screen" />
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-10 font-display text-[0.7rem] font-medium tracking-[0.32em] text-ice">
              <span className="tabular text-text-dim">09</span>
              <span aria-hidden className="mx-2 text-text-dim">
                //
              </span>
              Comprar
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2
              id="comprar-title"
              className="mt-5 font-display text-[1.6rem] leading-[1.25] font-semibold tracking-[0.2em] text-text-strong sm:text-4xl md:text-[2.4rem]"
            >
              Pronto para conversar com o seu Jarvis?
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-text-dim lg:mx-0">
              Tudo o que você viu nesta página, num único pagamento. Instale, diga “Jarvis” e comece.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <PriceCard />
        </Reveal>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="flex items-center gap-3 text-text-strong">
            <Sonar size={14} />
            <span className="font-display text-[0.85rem] font-semibold tracking-[0.35em]">J.A.R.V.I.S.</span>
          </p>
          <p className="mt-3 font-mono text-[0.72rem] text-text-dim">Feito com Python · React · three.js</p>
        </div>
        <nav aria-label="Rodapé">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-display text-[0.65rem] tracking-[0.24em] text-text-dim">
            <li>
              <a href="#voz" className="hover:text-ice">Funcionalidades</a>
            </li>
            <li>
              <a href="#privacidade" className="hover:text-ice">Privacidade</a>
            </li>
            <li>
              <a href="#comprar" className="hover:text-ice">Comprar</a>
            </li>
            <li>
              <a href="#inicio" className="hover:text-ice">Topo</a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto max-w-7xl px-4 pb-10 text-[0.72rem] text-text-dim sm:px-6 lg:px-8">
        Projeto independente. Sem afiliação com estúdios, personagens ou marcas registradas.
      </p>
    </footer>
  )
}
