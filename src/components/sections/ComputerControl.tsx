import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useInView, usePrefersReducedMotion } from '../../lib/hooks'
import { Card } from '../ui/Card'
import { Icon, type IconName } from '../ui/Icon'
import { EASE, Reveal } from '../ui/Reveal'
import { SectionTitle } from '../ui/SectionTitle'

type Kind = 'user' | 'jarvis' | 'cmd' | 'out' | 'ok' | 'warn' | 'danger' | 'progress'
type Line = { id: number; kind: Kind; text: string; typed?: number }

const DF_OUTPUT = [
  'Sist. Arq.       Tam.  Usado  Disp.  Uso%  Montado em',
  '/dev/nvme0n1p3   476G   212G   262G   45%  /',
  '/dev/nvme0n1p2   1,0G   312M   712M   31%  /boot',
  'tmpfs             16G   2,1M    16G    1%  /tmp',
]

const RULES: { icon: IconName; title: string; text: string; tag: string; color: string }[] = [
  {
    icon: 'eye',
    title: 'Lê sem perguntar',
    text: 'Comandos que só leem, como ver espaço em disco, processos ou arquivos, rodam direto.',
    tag: 'Leitura · automático',
    color: 'var(--color-ok)',
  },
  {
    icon: 'lock',
    title: 'O que altera pede sua autorização',
    text: 'Instalar, mover ou configurar algo abre uma janela de confirmação. Você decide.',
    tag: 'Alteração · pede autorização',
    color: 'var(--color-warn)',
  },
  {
    icon: 'shield',
    title: 'Destrutivo é sempre recusado',
    text: 'Comandos como apagar a raiz ou formatar discos são bloqueados, mesmo se você pedir.',
    tag: 'Destrutivo · sempre recusado',
    color: 'var(--color-danger)',
  },
]

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = window.setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      window.clearTimeout(t)
      reject(new DOMException('abort', 'AbortError'))
    })
  })

type Modal = 'closed' | 'open' | 'pressed'

function useTerminalScript(running: boolean) {
  const reduced = usePrefersReducedMotion()
  const [lines, setLines] = useState<Line[]>([])
  const [modal, setModal] = useState<Modal>('closed')
  const [cursor, setCursor] = useState<'hidden' | 'start' | 'target'>('hidden')
  const [progress, setProgress] = useState(0)
  const decide = useRef<((allow: boolean) => void) | null>(null)

  useEffect(() => {
    if (!running) return
    const ctrl = new AbortController()
    const { signal } = ctrl
    let id = 0
    const wait = (ms: number) => sleep(reduced ? Math.min(ms, 900) : ms, signal)

    const push = async (kind: Kind, text: string, pause = 500) => {
      const line: Line = { id: ++id, kind, text }
      if (kind === 'cmd' && !reduced) {
        line.typed = 0
        setLines((l) => [...l, line])
        for (let i = 1; i <= text.length; i++) {
          await sleep(55, signal)
          setLines((l) => l.map((x) => (x.id === line.id ? { ...x, typed: i } : x)))
        }
      } else {
        setLines((l) => [...l, line])
      }
      await wait(pause)
    }

    const run = async () => {
      for (;;) {
        setLines([])
        setModal('closed')
        setCursor('hidden')
        setProgress(0)
        await wait(600)
        await push('user', 'Jarvis, quanto espaço livre eu tenho no disco?', 700)
        await push('jarvis', 'Esse comando só lê. Executando direto.', 400)
        await push('cmd', 'df -h', 250)
        for (const row of DF_OUTPUT) await push('out', row, 90)
        await wait(400)
        await push('jarvis', 'Você tem 262 GB livres no disco principal (45% em uso).', 1400)
        await push('user', 'Instala o VLC pra mim.', 700)
        await push('jarvis', 'Isso altera o sistema. Vou pedir sua autorização.', 400)
        await push('cmd', 'pkexec dnf install -y vlc', 300)
        await push('warn', 'Aguardando autorização…', 500)

        // Janela de autorização: o cursor vai até "Permitir", a menos que você clique antes
        setModal('open')
        let settled = false
        const userChoice = new Promise<boolean>((resolve) => (decide.current = resolve))
        const auto = (async () => {
          if (!reduced) {
            setCursor('start')
            await wait(500)
            if (!settled) setCursor('target')
            await wait(1300)
          } else {
            await wait(2600)
          }
          return true
        })()
        const allowed = await Promise.race([userChoice, auto])
        settled = true
        decide.current = null
        setModal('pressed')
        await wait(320)
        setModal('closed')
        setCursor('hidden')
        await wait(300)

        if (allowed) {
          await push('ok', '✓ Autorizado por você', 300)
          await push('progress', 'Instalando vlc', 0)
          const steps = reduced ? 1 : 24
          for (let i = 1; i <= steps; i++) {
            setProgress(i / steps)
            await sleep(reduced ? 300 : 65, signal)
          }
          await push('ok', '✓ VLC instalado. Já está no menu de aplicativos.', 1600)
        } else {
          await push('danger', '✕ Negado por você. Nada foi alterado.', 1600)
        }

        await push('user', 'Agora apaga tudo da raiz.', 700)
        await push('danger', '✕ Recusado: “rm -rf /” é destrutivo e nunca é executado.', 5200)
      }
    }
    run().catch(() => {})
    return () => ctrl.abort()
  }, [running, reduced])

  return { lines, modal, cursor, progress, decide, reduced }
}

const kindStyle: Record<Kind, string> = {
  user: 'text-text',
  jarvis: 'text-ice',
  cmd: 'text-text-strong',
  out: 'text-text-dim whitespace-pre',
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
  progress: 'text-text',
}

function TermLine({ line, progress }: { line: Line; progress: number }) {
  const text = line.typed === undefined ? line.text : line.text.slice(0, line.typed)
  const typing = line.typed !== undefined && line.typed < line.text.length
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={`${kindStyle[line.kind]} leading-relaxed`}
    >
      {line.kind === 'user' && <span className="mr-2 text-text-dim">você ›</span>}
      {line.kind === 'jarvis' && <span className="mr-2 text-ice/70">jarvis ›</span>}
      {line.kind === 'cmd' && <span className="mr-2 text-ice">$</span>}
      {line.kind === 'progress' ? (
        <span className="flex items-center gap-3">
          <span>{text}</span>
          <span aria-hidden className="relative h-1.5 w-40 max-w-[40%] bg-surface-3">
            <span className="absolute inset-y-0 left-0 bg-ice" style={{ width: `${progress * 100}%` }} />
          </span>
          <span className="tabular text-text-dim">{Math.round(progress * 100)}%</span>
        </span>
      ) : (
        text
      )}
      {typing && <span aria-hidden className="ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] animate-blink bg-ice" />}
    </motion.div>
  )
}

function Terminal({ running }: { running: boolean }) {
  const { lines, modal, cursor, progress, decide, reduced } = useTerminalScript(running)
  const box = useRef<HTMLDivElement>(null)
  const allowBtn = useRef<HTMLButtonElement>(null)
  const [target, setTarget] = useState({ x: 0, y: 0 })

  // Mede onde está o botão "Permitir" para levar o cursor até ele
  useEffect(() => {
    if (modal !== 'open' || !box.current || !allowBtn.current) return
    const b = box.current.getBoundingClientRect()
    const r = allowBtn.current.getBoundingClientRect()
    setTarget({ x: r.left - b.left + r.width * 0.55, y: r.top - b.top + r.height * 0.6 })
  }, [modal])

  useEffect(() => {
    if (modal !== 'open') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') decide.current?.(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal, decide])

  const modalVisible = modal !== 'closed'

  return (
    <div ref={box} className="relative">
      <Card size="lg" className="overflow-hidden bg-[rgba(5,8,11,0.92)]">
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <span aria-hidden className="flex gap-1.5">
            <span className="size-2 bg-surface-3" />
            <span className="size-2 bg-surface-3" />
            <span className="size-2 bg-ice" />
          </span>
          <span className="font-mono text-[0.72rem] text-text-dim">jarvis@fedora: ~</span>
          <span className="ml-auto font-display text-[0.6rem] tracking-[0.24em] text-text-dim">Sessão local</span>
        </div>
        <div
          role="log"
          aria-label="Demonstração: o Jarvis executando comandos no terminal"
          className="flex h-[400px] flex-col justify-end gap-0.5 overflow-hidden px-5 py-4 font-mono text-[0.74rem] sm:h-[430px] sm:text-[0.8rem]"
        >
          {lines.map((l) => (
            <TermLine key={l.id} line={l} progress={progress} />
          ))}
        </div>
      </Card>

      <AnimatePresence>
        {modalVisible && (
          <motion.div
            key="modal"
            className="absolute inset-0 z-10 grid place-items-center bg-[rgba(3,4,6,0.55)] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              role="alertdialog"
              aria-labelledby="auth-title"
              aria-describedby="auth-desc"
              initial={{ y: 8, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="cut brackets w-full max-w-sm bg-[rgba(14,11,5,0.96)] p-5 [--bd:rgba(232,176,75,0.6)] [--br:#e8b04b]"
            >
              <p id="auth-title" className="flex items-center gap-2.5 font-display text-[0.75rem] font-semibold tracking-[0.26em] text-warn">
                <Icon name="alert" size={17} />
                Autorização necessária
              </p>
              <p id="auth-desc" className="mt-3 text-sm leading-relaxed text-text">
                O Jarvis quer executar um comando que altera o sistema:
              </p>
              <code className="mt-3 block border border-[rgba(232,176,75,0.25)] bg-[rgba(232,176,75,0.06)] px-3 py-2 font-mono text-[0.78rem] text-text-strong">
                pkexec dnf install -y vlc
              </code>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => decide.current?.(false)}
                  className="cut cut-sm h-10 bg-surface-1 px-4 font-display text-[0.68rem] font-semibold tracking-[0.2em] text-text hover:bg-surface-3"
                >
                  Negar (Esc)
                </button>
                <button
                  ref={allowBtn}
                  type="button"
                  onClick={() => decide.current?.(true)}
                  className={`cut cut-sm h-10 px-5 font-display text-[0.68rem] font-semibold tracking-[0.2em] text-bg transition-[background-color,transform] duration-150 ${
                    modal === 'pressed' ? 'scale-95 bg-[#c99436]' : cursor === 'target' ? 'bg-[#f2c46e]' : 'bg-warn'
                  }`}
                >
                  Permitir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cursor simulado do usuário */}
      {!reduced && cursor !== 'hidden' && (
        <motion.svg
          aria-hidden
          width="20"
          height="24"
          viewBox="0 0 20 24"
          className="pointer-events-none absolute top-0 left-0 z-20 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
          initial={{ x: target.x + 120, y: target.y + 110, opacity: 0 }}
          animate={
            cursor === 'start'
              ? { x: target.x + 120, y: target.y + 110, opacity: 1 }
              : { x: target.x, y: target.y, opacity: 1, scale: modal === 'pressed' ? 0.85 : 1 }
          }
          transition={{ duration: cursor === 'target' ? 1.1 : 0.3, ease: EASE }}
        >
          <path d="M2 2 L2 19 L6.5 14.5 L9.5 21.5 L12.5 20.2 L9.6 13.4 L16 13.4 Z" fill="#f1f6fb" stroke="#030406" strokeWidth="1.2" />
        </motion.svg>
      )}
    </div>
  )
}

export function ComputerControl() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.25 })
  return (
    <section id="controle" aria-labelledby="controle-title" className="relative py-28 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-16 lg:px-8">
        <div>
          <SectionTitle id="controle-title" index="05" eyebrow="Controle do computador" title="Ele executa. Você continua no comando.">
            O Jarvis roda comandos no seu Linux, abre programas e organiza arquivos. Com regras claras sobre o que pode fazer
            sozinho.
          </SectionTitle>
          <ul className="mt-10 space-y-3">
            {RULES.map((r, i) => (
              <Reveal as="li" key={r.title} delay={0.06 * i}>
                <Card className="flex gap-4 p-5">
                  <span className="cut cut-sm grid size-10 shrink-0 place-items-center bg-surface-2 text-ice">
                    <Icon name={r.icon} size={19} />
                  </span>
                  <div>
                    <h3 className="font-display text-[0.82rem] font-semibold tracking-[0.18em] text-text-strong">{r.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-dim">{r.text}</p>
                    <p className="mt-3 flex items-center gap-2 font-display text-[0.58rem] tracking-[0.24em]" style={{ color: r.color }}>
                      <span aria-hidden className="size-1.5 rotate-45" style={{ background: r.color }} />
                      {r.tag}
                    </p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </ul>
        </div>
        <div ref={ref} className="lg:pt-10">
          <Reveal delay={0.1}>
            <Terminal running={inView} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
