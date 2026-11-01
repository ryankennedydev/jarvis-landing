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

/*
 * Volume da voz em tempo real, para o orbe reagir à fala.
 * O áudio toca direto pelo <audio>, sem passar pela Web Audio (que pode emudecer o som
 * em alguns navegadores). O volume de cada arquivo é lido antes, em silêncio, e consultado
 * pelo tempo atual da reprodução. Na voz do navegador o volume é simulado.
 */
const LEVELS_PER_SECOND = 50
const levels = new Map<string, Promise<Float32Array | null>>()

/** Volume do arquivo, 50 valores por segundo de 0 a 1. Decodifica numa OfflineAudioContext, que não emite som. */
export function voiceLevels(src: string) {
  let l = levels.get(src)
  if (!l) {
    l = fetch(src)
      .then((r) => r.arrayBuffer())
      .then((buf) => new OfflineAudioContext(1, 1, 44100).decodeAudioData(buf))
      .then((audio) => {
        const data = audio.getChannelData(0)
        const win = Math.round(audio.sampleRate / LEVELS_PER_SECOND)
        const out = new Float32Array(Math.ceil(data.length / win))
        for (let i = 0; i < out.length; i++) {
          const end = Math.min(data.length, (i + 1) * win)
          let sum = 0
          for (let j = i * win; j < end; j++) sum += data[j] * data[j]
          out[i] = Math.min(1, Math.sqrt(sum / (end - i * win)) * 5)
        }
        return out
      })
      .catch(() => null)
    levels.set(src, l)
  }
  return l
}

/** Fala atual: um arquivo (com o volume já lido, ou ainda não) ou a voz do navegador (`audio` nulo) */
type Speech = { audio: HTMLAudioElement | null; levels: Float32Array | null }
let now: Speech | null = null

/** Volume da fala agora, de 0 a 1 (0 quando o Jarvis está calado). */
export function voiceLevel() {
  if (!now) return 0
  if (now.audio && now.levels) return now.levels[Math.floor(now.audio.currentTime * LEVELS_PER_SECOND)] ?? 0
  const t = performance.now() / 1000
  return Math.abs(Math.sin(t * 10.5)) * (0.55 + 0.35 * Math.sin(t * 3.7 + 1.3))
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
      const mine: Speech = { audio, levels: null }
      now = mine
      void voiceLevels(audioSrc).then((l) => (mine.levels = l))
      const done = () => {
        // Uma fala interrompida não apaga a que começou depois dela
        if (now === mine) now = null
        resolve()
      }
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
    const mine: Speech = { audio: null, levels: null }
    const finish = () => {
      window.clearTimeout(guard)
      if (now === mine) now = null
      resolve()
    }
    u.onend = finish
    u.onerror = finish
    signal.addEventListener('abort', () => {
      synth.cancel()
      finish()
    })
    now = mine
    synth.speak(u)
  })
}
