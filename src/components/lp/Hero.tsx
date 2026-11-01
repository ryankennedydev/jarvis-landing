import { Fragment, lazy, useEffect, useRef, useState } from 'react'
import { CHECKOUT_URL, PRICE, VSL } from '../../lib/config'
import { COMMANDS, sleep } from '../../lib/demo'
import { usePrefersReducedMotion } from '../../lib/hooks'
import type { VoicePhase } from '../three/HeroOrb'
import { SceneMount } from '../three/SceneMount'
import { BrandOrb, LpIcon, OrbFallback } from './Icons'

const MiniOrb = lazy(() => import('../three/MiniOrb'))

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap">
        <a href="#conteudo" className="brand">
          <BrandOrb />
          J.A.R.V.I.S.
        </a>
        <a href={CHECKOUT_URL} className="btn-header">
          Garantir acesso
        </a>
      </div>
    </header>
  )
}

/** Vídeo de vendas: sem pausa nem avanço, só o botão de som. */
function VideoPlayer() {
  const video = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [prompted, setPrompted] = useState(false)

  const unmuteFromStart = () => {
    const v = video.current
    if (!v) return
    v.currentTime = 0
    v.muted = false
    void v.play()
    setMuted(false)
    setPrompted(true)
  }

  const toggle = () => {
    const v = video.current
    if (!v) return
    v.muted = !v.muted
    if (!v.muted) void v.play()
    setMuted(v.muted)
    setPrompted(true)
  }

  return (
    <>
      <video
        ref={video}
        className="vsl-video"
        src={VSL.src}
        poster={VSL.poster || undefined}
        playsInline
        autoPlay
        muted
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
      />
      {!prompted && (
        <button type="button" className="vsl-unmute" onClick={unmuteFromStart}>
          <LpIcon name="soundOn" strokeWidth={2} />
          Clique para ouvir
        </button>
      )}
      <button type="button" className="vsl-sound" onClick={toggle} aria-pressed={!muted}>
        <LpIcon name={muted ? 'soundOff' : 'soundOn'} strokeWidth={2} />
        {muted ? 'Ativar som' : 'Som'}
      </button>
    </>
  )
}

const LOOP = [COMMANDS[0], COMMANDS[2], COMMANDS[1]]
const PHASE_LABEL: Record<VoicePhase, string> = { ouvindo: 'ouvindo', entendendo: 'entendendo', pensando: 'pensando', falando: 'falando' }

/** Sem vídeo: orbe 3D com uma conversa de exemplo digitada em loop. */
function OrbPlayer() {
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState<VoicePhase>('ouvindo')
  const [line, setLine] = useState(0)
  const [user, setUser] = useState(0)
  const [bot, setBot] = useState(0)

  useEffect(() => {
    const ctrl = new AbortController()
    const { signal } = ctrl
    const type = async (len: number, set: (n: number) => void, speed: number) => {
      for (let i = 1; i <= len; i++) {
        set(i)
        await sleep(speed, signal)
      }
    }
    const loop = async () => {
      for (let i = 0; ; i = (i + 1) % LOOP.length) {
        const c = LOOP[i]
        setLine(i)
        if (reduced) {
          setUser(c.text.length)
          setBot(c.reply.length)
          setPhase('falando')
          await sleep(5000, signal)
          continue
        }
        setPhase('ouvindo')
        setUser(0)
        setBot(0)
        await sleep(600, signal)
        await type(c.text.length, setUser, 45)
        setPhase('pensando')
        await sleep(1100, signal)
        setPhase('falando')
        await type(c.reply.length, setBot, 28)
        await sleep(3600, signal)
      }
    }
    loop().catch(() => {})
    return () => ctrl.abort()
  }, [reduced])

  const c = LOOP[line]
  return (
    <>
      <SceneMount
        className="absolute inset-0"
        fallback={<OrbFallback />}
      >
        {(active) => <MiniOrb active={active} phase={phase} palette="mono" background="#0a0a0a" />}
      </SceneMount>
      <div className="vsl-chip" aria-hidden>
        {PHASE_LABEL[phase]}
      </div>
      <div className="vsl-caption" aria-live="off">
        <div className="transcript-line">
          <span className="transcript-label">Você</span>
          <span className="transcript-text">“Jarvis, {c.text.slice(0, user).replace(/^./, (s) => s.toLowerCase())}”</span>
        </div>
        <div className="transcript-line transcript-jarvis">
          <span className="transcript-label">Jarvis</span>
          <span className={`transcript-text ${phase === 'falando' && bot < c.reply.length ? 'caret' : ''}`}>
            {bot ? c.reply.slice(0, bot) : '…'}
          </span>
        </div>
      </div>
    </>
  )
}

export function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="eyebrow">Seu assistente pessoal de IA</div>
        <h1 className="hero-title">
          Tenha seu próprio <span className="text-gradient">Jarvis</span>.
        </h1>
        <p className="hero-sub">
          Assistente por voz no seu Windows, Mac ou Linux. Conversa, lembra de tudo e controla o computador, com seus dados guardados
          só com você.
        </p>

        <div className="vsl">
          <div className="vsl-frame">{VSL.src ? <VideoPlayer /> : <OrbPlayer />}</div>
        </div>

        <div className="hero-cta">
          <a href={CHECKOUT_URL} className="btn-primary btn-xl">
            Quero meu Jarvis · R$ {PRICE.to}
          </a>
          <p className="cta-sub">
            de {PRICE.from} por R$ {PRICE.to} · pagamento único no Pix ou cartão
          </p>
        </div>
      </div>
    </section>
  )
}

export function Trust() {
  const items: [string, string, string][] = [
    ['100', '%', 'no seu computador'],
    ['3', '', 'IAs à sua escolha'],
    ['∞', '', 'acesso vitalício'],
  ]
  return (
    <section className="trust" aria-label="Destaques">
      <div className="wrap">
        <div className="trust-items">
          {items.map(([n, suffix, label], i) => (
            <Fragment key={label}>
              {i > 0 && <div className="trust-divider" aria-hidden />}
              <div className="trust-item">
                <div className="trust-number">
                  {n}
                  {suffix && <span>{suffix}</span>}
                </div>
                <div className="trust-label">{label}</div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
