/** Link da página de checkout (Kirvano). */
export const CHECKOUT_URL = 'https://pay.kirvano.com/a7e8b3a9-8d10-413c-8865-5ca54e6b55ba'

export const PRICE = { from: 'R$ 97,90', to: '47,90', discount: '51%', saving: 'R$ 50,00' }

/** Faixa de oferta do topo e cronômetro de reserva (minutos por visitante, salvo no navegador). */
export const OFFER = { label: 'Black Friday', badge: 'Condição de última hora', minutes: 30 }

/**
 * Vídeo de vendas do topo (.mp4). Vazio: o quadro mostra o orbe 3D com uma conversa de exemplo.
 * Imagem de capa opcional, usada enquanto o vídeo carrega.
 */
export const VSL = { src: '/video/jarvis.mp4', poster: '/video/jarvis-poster.jpg' }

/** E-mail de suporte do rodapé. Vazio: o link some. */
export const SUPPORT_EMAIL = ''

/** Prazo de garantia (dias). O CDC garante 7 dias de arrependimento em compras online. */
export const GUARANTEE_DAYS = 7

/**
 * Depoimentos reais de clientes. A seção "Quem já tem" só aparece quando houver pelo menos um.
 * Exemplo: { name: 'Daniel', role: 'Cliente verificado', quote: 'Instalei em 5 minutos.' }
 */
export const TESTIMONIALS: { name: string; role: string; quote: string }[] = []
