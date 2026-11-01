import { lazy, useEffect, useRef, useState } from 'react'
import { COMMANDS, sleep } from '../../lib/demo'
import { usePrefersReducedMotion } from '../../lib/hooks'
import { audioDuration, speak } from '../../lib/voice'
import type { VoicePhase } from '../three/HeroOrb'
import { SceneMount } from '../three/SceneMount'
import { OrbFallback } from './Icons'

const MiniOrb = lazy(() => import('../three/MiniOrb'))

type State = { cmd: number; phase: VoicePhase | 'parado'; typed: number }

const STATUS: Record<State['phase'], string> = {
  parado: 'aguardando comando…',
  ouvindo: 'ouvindo…',
  entendendo: 'entendendo…',
  pensando: 'pensando…',
  falando: 'respondendo…',
}

/** "Fale com ele": escolhe um comando e o Jarvis responde digitando, com o orbe reagindo. */
export function Demo() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<State>({ cmd: -1, phase: 'parado', typed: 0 })
  const ctrl = useRef<AbortController | null>(null)

  useEffect(() => {
    // Já deixa as durações carregadas para a digitação acompanhar a fala desde o primeiro clique
    for (const c of COMMANDS) if (c.audio) void audioDuration(c.audio)
    return () => ctrl.current?.abort()
  }, [])

  const run = async (cmd: number) => {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    const { reply, audio } = COMMANDS[cmd]
    try {
      if (reduced) {
        setState({ cmd, phase: 'falando', typed: reply.length })
        await speak(reply, c.signal, audio)
        setState({ cmd, phase: 'parado', typed: reply.length })
        return
      }
      setState({ cmd, phase: 'ouvindo', typed: 0 })
      await sleep(650, c.signal)
      setState({ cmd, phase: 'pensando', typed: 0 })
      await sleep(900, c.signal)
      // A voz começa junto com a digitação, que acompanha a duração do áudio gravado
      const ms = audio ? await audioDuration(audio) : 0
      const step = ms ? Math.max(14, (ms * 0.92) / reply.length) : 48
      const voice = speak(reply, c.signal, audio)
      for (let i = 1; i <= reply.length; i++) {
        setState({ cmd, phase: 'falando', typed: i })
        await sleep(step, c.signal)
      }
      await voice
      if (c.signal.aborted) return
      setState({ cmd, phase: 'parado', typed: reply.length })
    } catch {
      /* outro comando interrompeu este */
    }
  }

  const active = state.cmd >= 0 ? COMMANDS[state.cmd] : null
  const orbPhase: VoicePhase = state.phase === 'parado' ? 'entendendo' : state.phase

  return (
    <section className="section" id="demo">
      <div className="wrap">
        <div className="eyebrow">Experimente agora</div>
        <h2 className="section-title">Fale com ele.</h2>
        <p className="section-sub">Escolha um comando e ouça como ele responde. Ligue o som. É assim que funciona no seu computador.</p>

        <div className="demo">
          <div className="demo-orb">
            <div className="demo-orb-stage">
              <SceneMount
                className="absolute inset-0"
                fallback={<OrbFallback />}
              >
                {(on) => <MiniOrb active={on} phase={orbPhase} palette="mono" background="#000000" />}
              </SceneMount>
            </div>
            <div className={`demo-status ${state.phase !== 'parado' ? 'is-active' : ''}`}>{STATUS[state.phase]}</div>
          </div>

          <div>
            <div className="demo-label">Diga ao Jarvis:</div>
            <div className="demo-grid">
              {COMMANDS.map((c, i) => (
                <button key={c.text} type="button" className="demo-cmd" aria-pressed={state.cmd === i} onClick={() => run(i)}>
                  <span className="demo-cmd-icon" aria-hidden>
                    {c.icon}
                  </span>
                  <span className="demo-cmd-text">“{c.text}”</span>
                </button>
              ))}
            </div>

            <div className="transcript" aria-live="polite">
              <div className="transcript-line">
                <span className="transcript-label">Você</span>
                <span className="transcript-text">{active ? active.text : '—'}</span>
              </div>
              <div className="transcript-line transcript-jarvis">
                <span className="transcript-label">Jarvis</span>
                <span className={`transcript-text ${state.phase === 'falando' ? 'caret' : ''}`}>
                  {active && state.typed ? active.reply.slice(0, state.typed) : STATUS[state.phase]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
