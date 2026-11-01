import { useEffect, useState } from 'react'
import { OFFER } from './config'

const KEY = 'jarvis-oferta-fim'
const SPAN = OFFER.minutes * 60_000
let end = 0

function renew() {
  end = Date.now() + SPAN
  try {
    localStorage.setItem(KEY, String(end))
  } catch {
    /* sem armazenamento: a reserva vale só nesta aba */
  }
}

/** Milissegundos restantes da reserva; recomeça quando acaba ou quando o valor salvo é inválido. */
function remaining() {
  if (!end) {
    try {
      end = parseInt(localStorage.getItem(KEY) ?? '0', 10) || 0
    } catch {
      end = 0
    }
  }
  const left = end - Date.now()
  if (left <= 0 || left > SPAN) renew()
  return end - Date.now()
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Cronômetro compartilhado por todos os relógios da página. */
export function useOfferCountdown() {
  const [left, setLeft] = useState(remaining)
  useEffect(() => {
    const id = window.setInterval(() => setLeft(remaining()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const s = Math.max(0, Math.floor(left / 1000))
  return { mm: pad(Math.floor(s / 60)), ss: pad(s % 60) }
}
