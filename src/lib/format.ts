const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const num = (digits: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const formatBRL = (v: number) => brl.format(v)
export const formatNumber = (v: number, digits = 0) => num(digits).format(v)
export const formatPercent = (v: number, digits = 2) => `${num(digits).format(Math.abs(v))}%`
export const formatSigned = (v: number, digits = 2) => `${v >= 0 ? '+' : '−'}${num(digits).format(Math.abs(v))}`

/** Gerador pseudoaleatório determinístico (mulberry32). */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
