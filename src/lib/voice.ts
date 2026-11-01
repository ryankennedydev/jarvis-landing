/*
 * Voz do Jarvis na demonstração.
 * Com um arquivo de áudio gravado, toca o arquivo; sem ele, usa a voz do próprio navegador
 * (Web Speech API), preferindo uma voz masculina em português, mais grave e pausada.
 */

const MALE = /antonio|daniel|felipe|ricardo|thiago|male|masculin/i

let chosen: SpeechSynthesisVoice | null = null

function pickVoice() {
  const voices = window.speechSynthesis.getVoices()
  const br = voices.filter((v) => v.lang.toLowerCase().replace('_', '-') === 'pt-br')
  const pt = br.length ? br : voices.filter((v) => v.lang.toLowerCase().startsWith('pt'))
  chosen = pt.find((v) => MALE.test(v.name)) ?? pt[0] ?? null
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice()
  window.speechSynthesis.addEventListener('voiceschanged', pickVoice)
}

const durations = new Map<string, Promise<number>>()

/** Duração do áudio em ms (carrega só os metadados, uma vez por arquivo). */
export function audioDuration(src: string) {
  let d = durations.get(src)
  if (!d) {
    d = new Promise<number>((resolve) => {
      const a = new Audio()
      a.preload = 'metadata'
      a.onloadedmetadata = () => resolve(Number.isFinite(a.duration) ? a.duration * 1000 : 0)
      a.onerror = () => resolve(0)
      a.src = src
    })
    durations.set(src, d)
  }
  return d
}

/** Fala `text` e resolve quando termina. Abortar o `signal` corta a fala na hora. */
export function speak(text: string, signal: AbortSignal, audioSrc?: string) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) return resolve()

    if (audioSrc) {
      const audio = new Audio(audioSrc)
      const done = () => resolve()
      audio.addEventListener('ended', done)
      audio.addEventListener('error', done)
      signal.addEventListener('abort', () => {
        audio.pause()
        done()
      })
      audio.play().catch(done)
      return
    }

    if (!('speechSynthesis' in window)) return resolve()
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pt-BR'
    if (chosen) u.voice = chosen
    u.pitch = 0.75
    u.rate = 1.02
    // Alguns navegadores às vezes não disparam `end`: um limite de tempo evita travar a demonstração
    const guard = window.setTimeout(() => resolve(), text.length * 110 + 2500)
    const finish = () => {
      window.clearTimeout(guard)
      resolve()
    }
    u.onend = finish
    u.onerror = finish
    signal.addEventListener('abort', () => {
      synth.cancel()
      finish()
    })
    synth.speak(u)
  })
}
