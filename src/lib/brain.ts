/* Dados do Brain compartilhados entre a seção (HTML) e a cena 3D. Sem three.js aqui. */

export type RegionId = 'memorias' | 'conversas' | 'tarefas' | 'habilidades' | 'agentes'

export type Region = {
  id: RegionId
  name: string
  type: string
  lobe: string
  color: string
  count: number
  description: string
  samples: string[]
}

export const REGIONS: Region[] = [
  {
    id: 'memorias',
    name: 'Memórias',
    type: 'Memória',
    lobe: 'Lobo frontal',
    color: '#7df9ff',
    count: 12480,
    description: 'Fatos, gostos e preferências que você contou.',
    samples: [
      'Prefere respostas curtas pela manhã',
      'Aniversário da Ana: 14 de março',
      'Toma café sem açúcar',
      'Usa Fedora com GNOME no notebook',
      'Reunião de sexta é sempre remota',
      'Não gosta de notificações depois das 22h',
    ],
  },
  {
    id: 'conversas',
    name: 'Conversas',
    type: 'Conversa',
    lobe: 'Lobos temporais',
    color: '#b388ff',
    count: 3912,
    description: 'Tudo o que vocês já falaram, pesquisável.',
    samples: [
      'Ontem: comparamos notebooks até R$ 6 mil',
      'Pediu o resumo do jogo de domingo',
      'Planejamos a viagem para Florianópolis',
      'Discutimos a ideia do app de receitas',
      'Revisamos o currículo para a vaga de dados',
    ],
  },
  {
    id: 'tarefas',
    name: 'Tarefas',
    type: 'Tarefa',
    lobe: 'Lobo parietal',
    color: '#ffd166',
    count: 287,
    description: 'Lembretes, agendamentos e rotinas.',
    samples: [
      'Pagar o boleto da internet até dia 10',
      'Revisar a proposta do cliente às 15h',
      'Backup da pasta Projetos toda sexta',
      'Avisar se o dólar passar de R$ 5,00',
      'Ligar para o dentista na segunda',
    ],
  },
  {
    id: 'habilidades',
    name: 'Habilidades',
    type: 'Habilidade',
    lobe: 'Lobo occipital',
    color: '#ff6bd6',
    count: 64,
    description: 'O que ele sabe fazer no seu computador.',
    samples: [
      'Converter PDF em texto',
      'Pesquisar na web e resumir',
      'Controlar volume e brilho da tela',
      'Ler cotações em tempo real',
      'Organizar a pasta Downloads',
    ],
  },
  {
    id: 'agentes',
    name: 'Agentes do Work',
    type: 'Agente',
    lobe: 'Cerebelo',
    color: '#7ee08a',
    count: 28,
    description: 'Gerentes e bots da sua empresa de IA.',
    samples: [
      'Bot de pesquisa: 3 fontes verificadas',
      'Gerente de Growth delegou 4 tarefas',
      'Bot jurídico revisando um contrato',
      'Bot de engenharia rodando testes',
    ],
  },
]

export type AiId = 'claude' | 'gpt' | 'gemini'

export const AIS: { id: AiId; name: string; color: string; latency: string }[] = [
  { id: 'claude', name: 'Claude', color: '#ff9a5c', latency: '1,3 s' },
  { id: 'gpt', name: 'GPT', color: '#5cffc8', latency: '1,2 s' },
  { id: 'gemini', name: 'Gemini', color: '#6ea8ff', latency: '1,4 s' },
]

/** Comandos que a seção manda para a cena (botões acessíveis por teclado). */
export type BrainApi = {
  zoom: (direction: 1 | -1) => void
  rotate: (direction: 1 | -1) => void
  reset: () => void
}
