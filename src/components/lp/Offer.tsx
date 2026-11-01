import { useEffect, useState } from 'react'
import { CHECKOUT_URL, OFFER, PRICE } from '../../lib/config'
import { useOfferCountdown } from '../../lib/offer'

export function Digits({ inverted = false }: { inverted?: boolean }) {
  const { mm, ss } = useOfferCountdown()
  return (
    <div className={`digits ${inverted ? 'digits-inverted' : ''}`} role="timer" aria-label={`${mm} minutos e ${ss} segundos`}>
      <span className="digit-box">
        <b>{mm}</b>
        <small>min</small>
      </span>
      <span className="digit-colon" aria-hidden>
        :
      </span>
      <span className="digit-box">
        <b>{ss}</b>
        <small>seg</small>
      </span>
    </div>
  )
}

/** Faixa branca do topo com preço, cronômetro e botão; ao sair da tela vira uma barra fixa. */
export function Offer() {
  const [pinned, setPinned] = useState(false)
  const { mm, ss } = useOfferCountdown()

  useEffect(() => {
    const top = document.getElementById('oferta')
    if (!top) return
    const io = new IntersectionObserver(([e]) => setPinned(!e.isIntersecting))
    io.observe(top)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <section className="offer" id="oferta" aria-label={OFFER.label}>
        <div className="offer-in">
          <div className="offer-a">
            <div className="offer-badge">{OFFER.badge}</div>
            <div className="offer-title">{OFFER.label}</div>
            <div className="offer-price">
              de <s>{PRICE.from}</s> por <strong>R$ {PRICE.to}</strong>
            </div>
          </div>
          <div>
            <div className="offer-label">Sua condição fica reservada por</div>
            <Digits />
          </div>
          <div className="offer-c">
            <a className="offer-cta" href={CHECKOUT_URL}>
              Garantir por R$ {PRICE.to}
            </a>
            <div className="offer-note">pagamento único · acesso vitalício</div>
          </div>
        </div>
      </section>

      <div className={`offer-bar ${pinned ? 'is-on' : ''}`} aria-hidden={!pinned}>
        <div className="offer-bar-in">
          <div className="offer-bar-txt">
            <strong>{OFFER.label}</strong>
            <span className="offer-bar-price">
              <s>{PRICE.from}</s> R$ {PRICE.to}
            </span>
          </div>
          <div className="offer-bar-time">
            <span className="offer-bar-label">reservada por</span>
            <b>
              {mm}:{ss}
            </b>
          </div>
          <a className="offer-bar-cta" href={CHECKOUT_URL} tabIndex={pinned ? 0 : -1}>
            Garantir agora
          </a>
        </div>
      </div>
    </>
  )
}
