/**
 * Comandos de exemplo usados no vídeo do topo e na seção "Fale com ele".
 * `audio` (opcional): resposta gravada com a voz do Jarvis, ex. '/audio/dolar.mp3' em public/audio/.
 * Sem ele, a resposta é falada pela voz do navegador.
 */
export const COMMANDS: { icon: string; text: string; reply: string; audio?: string }[] = [
  { icon: '🎵', text: 'Toca jazz no Spotify', reply: 'Pronto. Tocando agora, senhor.', audio: '/audio/spotify.mp3' },
  {
    icon: '🤖',
    text: 'Quem é você?',
    reply: 'Pois é, eu sou Jarvis. E eu não sou mais coisa de filme: eu fui criado para rodar direto no seu computador.',
    audio: '/audio/quem-sou.mp3',
  },
  { icon: '💬', text: 'Manda um zap pro João dizendo que cheguei', reply: 'Mensagem enviada.', audio: '/audio/whatsapp.mp3' },
  {
    icon: '🧠',
    text: 'Você lembra de mim?',
    reply: 'Eu lembro de tudo. Seu nome, suas preferências, as nossas conversas. Quanto mais você me usa, mais eu te conheço.',
    audio: '/audio/memoria.mp3',
  },
  {
    icon: '🚀',
    text: 'Que programas você abre?',
    reply: 'Abro qualquer programa. Chrome, Photoshop, CapCut, Steam, o que você pedir.',
    audio: '/audio/programas.mp3',
  },
  {
    icon: '💳',
    text: 'Tem mensalidade?',
    reply: 'Não tem mensalidade. Você paga uma vez só e eu sou seu pra sempre, com todas as atualizações.',
    audio: '/audio/mensalidade.mp3',
  },
]

export const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = window.setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      window.clearTimeout(t)
      reject(new DOMException('abort', 'AbortError'))
    })
  })
