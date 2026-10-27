/*
 * Simulação da empresa de IA do Work, compartilhada entre a cena 3D do prédio
 * (que lê o estado a cada frame) e o mapa de nós em SVG (que assina mudanças).
 */

export const SECTORS = [
  { id: 'receita', name: 'Receita', manager: 'Gerente de Receita' },
  { id: 'growth', name: 'Growth', manager: 'Gerente de Growth' },
  { id: 'cliente', name: 'Cliente', manager: 'Gerente de Cliente' },
  { id: 'engenharia', name: 'Engenharia', manager: 'Gerente de Engenharia' },
  { id: 'juridico', name: 'Jurídico', manager: 'Gerente Jurídico' },
  { id: 'financas', name: 'Finanças', manager: 'Gerente de Finanças' },
  { id: 'ceo', name: 'CEO', manager: 'CEO' },
] as const

export type SectorId = (typeof SECTORS)[number]['id']

export const BOTS_PER_SECTOR = 4

const TASKS: Record<SectorId, string[]> = {
  receita: ['Prevendo receita do trimestre', 'Conciliando notas fiscais', 'Revisando preços do plano Pro'],
  growth: ['Pesquisando concorrentes na web', 'Escrevendo 3 variações de anúncio', 'Analisando funil de cadastro'],
  cliente: ['Respondendo 12 tickets', 'Resumindo feedback da semana', 'Atualizando a base de ajuda'],
  engenharia: ['Rodando testes em 3 terminais', 'Refatorando a API de pagamentos', 'Revisando pull request #214'],
  juridico: ['Revisando contrato de fornecedor', 'Checando termos de uso', 'Comparando cláusulas de LGPD'],
  financas: ['Calculando fluxo de caixa', 'Montando planilha de custos', 'Projetando cenário de juros'],
  ceo: ['Consolidando relatório dos gerentes', 'Definindo prioridades da semana', 'Aprovando plano de Growth'],
}

export type LogEntry = { id: number; sector: SectorId; bot: number; task: string; time: string }

type State = { working: boolean[]; log: LogEntry[]; version: number }

const total = SECTORS.length * BOTS_PER_SECTOR
let state: State = {
  working: Array.from({ length: total }, (_, i) => i % 3 === 0),
  log: [],
  version: 0,
}
const listeners = new Set<() => void>()
let timer: number | undefined
let logId = 0

function tick() {
  const working = state.working.slice()
  // Alterna 2–3 bots por ciclo para dar sensação de trabalho em paralelo
  const flips = 2 + Math.round(Math.random())
  let entry: LogEntry | null = null
  for (let k = 0; k < flips; k++) {
    const i = Math.floor(Math.random() * total)
    working[i] = !working[i]
    if (working[i] && !entry) {
      const sector = SECTORS[Math.floor(i / BOTS_PER_SECTOR)].id
      const tasks = TASKS[sector]
      const now = new Date()
      entry = {
        id: ++logId,
        sector,
        bot: (i % BOTS_PER_SECTOR) + 1,
        task: tasks[Math.floor(Math.random() * tasks.length)],
        time: now.toLocaleTimeString('pt-BR', { hour12: false }),
      }
    }
  }
  state = {
    working,
    log: entry ? [entry, ...state.log].slice(0, 5) : state.log,
    version: state.version + 1,
  }
  listeners.forEach((l) => l())
}

export const workSim = {
  getState: () => state,
  subscribe(cb: () => void) {
    listeners.add(cb)
    if (listeners.size === 1) timer = window.setInterval(tick, 900)
    return () => {
      listeners.delete(cb)
      if (listeners.size === 0) window.clearInterval(timer)
    }
  },
  tasksFor: (sector: SectorId) => TASKS[sector],
}
