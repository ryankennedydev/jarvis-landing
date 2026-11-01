/**
 * Comandos de exemplo usados no vídeo do topo e na seção "Fale com ele".
 * `audio` (opcional): resposta gravada com a voz do Jarvis, ex. '/audio/dolar.mp3' em public/audio/.
 * Sem ele, a resposta é falada pela voz do navegador.
 */
export const COMMANDS: { icon: string; text: string; reply: string; audio?: string }[] = [
  { icon: '🎵', text: 'Toca jazz no Spotify', reply: 'Tocando jazz no Spotify, senhor.', audio: '/audio/spotify.mp3' },
  { icon: '💬', text: 'Manda zap pro João', reply: 'Mensagem enviada para João, senhor.', audio: '/audio/whatsapp.mp3' },
  {
    icon: '📅',
    text: 'Que reuniões tenho amanhã?',
    reply: 'Você tem reunião com Matheus às 10h, almoço às 13h e duas mensagens pendentes.',
    audio: '/audio/agenda.mp3',
  },
  { icon: '🧠', text: 'Salva isso na minha memória', reply: 'Salvo. Lembrarei sempre que precisar, senhor.', audio: '/audio/memoria.mp3' },
  { icon: '🚀', text: 'Abre o Photoshop', reply: 'Abrindo Adobe Photoshop, senhor.', audio: '/audio/photoshop.mp3' },
  {
    icon: '✉️',
    text: 'Escreve email pro fornecedor',
    reply: 'Pronto. Email rascunhado e aguardando sua revisão.',
    audio: '/audio/email.mp3',
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
