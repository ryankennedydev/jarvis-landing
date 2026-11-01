import { CHECKOUT_URL, GUARANTEE_DAYS, OFFER, PRICE, SUPPORT_EMAIL } from '../../lib/config'
import { BrandOrb } from './Icons'
import { Digits } from './Offer'

const [REAIS, CENTS] = PRICE.to.split(',')

const INCLUDED = [
  'Pagamento único, sem mensalidade',
  'Acesso vitalício e todas as atualizações',
  'Voz, Brain 3D, Work, finanças e notícias',
  'Dados no seu computador, protegidos por PIN',
]

export function Buy() {
  return (
    <section className="buy" id="comprar">
      <div className="wrap">
        <div className="buy-card">
          <div className="buy-badge">{OFFER.label} · última hora</div>
          <h2 className="buy-title">Seu Jarvis começa hoje.</h2>

          <div className="buy-price">
            <div className="buy-timer">
              <div className="buy-timer-label">Sua condição fica reservada por</div>
              <Digits inverted />
            </div>
            <div className="buy-from">
              de <s>{PRICE.from}</s> por
            </div>
            <div className="buy-tag">À vista · −{PRICE.discount}</div>
            <div className="buy-amount">
              <span className="buy-currency">R$</span>
              <span className="buy-value">
                {REAIS}
                <span className="buy-cents">,{CENTS}</span>
              </span>
            </div>
            <div className="buy-pay">
              você economiza <strong>{PRICE.saving}</strong> · Pix · Cartão
            </div>
            <ul className="buy-list">
              {INCLUDED.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </div>

          <div className="buy-note">
            <div className="eyebrow">Importante</div>
            <div className="buy-note-title">A IA é paga à parte</div>
            <p>
              O Jarvis usa a sua própria chave de API (Claude, GPT ou Gemini). O uso é cobrado direto pela empresa da IA que você
              escolher, não por nós.
            </p>
          </div>

          <a href={CHECKOUT_URL} className="btn-primary btn-xl btn-buy">
            Quero meu Jarvis agora
          </a>
          <p className="buy-fine">Pagamento seguro pela Kirvano · Pix · Cartão</p>
          <p className="buy-fine" style={{ marginTop: 6 }}>
            Garantia de {GUARANTEE_DAYS} dias.
          </p>
        </div>
      </div>
    </section>
  )
}

const FAQ: [string, string][] = [
  [
    'Funciona no meu computador?',
    'Sim. O Jarvis roda em Windows, macOS e Linux.',
  ],
  [
    'É mensalidade?',
    `Não. Você paga uma vez, R$ ${PRICE.to}, e o Jarvis é seu para sempre, com todas as atualizações. A única cobrança à parte é o uso da IA, feito com a sua chave de API e cobrado direto pela empresa (Anthropic, OpenAI ou Google).`,
  ],
  [
    'Precisa de internet?',
    'O reconhecimento da sua voz roda no seu computador, sem internet. Para pensar e responder, ele usa a IA que você escolheu, e essa parte precisa de conexão.',
  ],
  [
    'E a privacidade?',
    'Memórias, conversas e configurações ficam em arquivos no seu computador, nada vai para servidor nosso. O Jarvis é protegido por PIN e as chaves de API ficam só no arquivo .env, mascaradas na tela.',
  ],
  [
    'Que chave de API eu preciso?',
    'Uma, da IA que preferir: Claude (Anthropic), GPT (OpenAI) ou Gemini (Google). Você cria a chave no site da empresa e cola no Jarvis.',
  ],
  [
    'Ele mexe no meu computador sem eu saber?',
    'Não. Comandos que só leem, como ver o espaço em disco, rodam direto. Qualquer coisa que altere o sistema aparece para você autorizar antes.',
  ],
  [
    'E se eu não gostar?',
    `Você tem ${GUARANTEE_DAYS} dias de garantia. Peça o reembolso pela Kirvano dentro do prazo e recebe o valor de volta.`,
  ],
  [
    'Quanto tempo até começar a usar?',
    'Pagou, recebe o acesso por e-mail. Instala, cola a chave de API e diz “Jarvis”. Em poucos minutos você já está conversando.',
  ],
  [
    'É o Jarvis do filme?',
    'É inspirado nele: voz natural, conversa fluida, controla o computador e lembra de você. É um projeto independente, sem afiliação com estúdios, personagens ou marcas registradas.',
  ],
]

export function Faq() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="eyebrow">Perguntas frequentes</div>
        <h2 className="section-title">Tudo que você quer saber.</h2>
        <div className="faq">
          {FAQ.map(([q, a]) => (
            <details key={q} className="card faq-item" data-reveal>
              <summary className="faq-q">{q}</summary>
              <p className="faq-a">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FinalCta() {
  return (
    <section className="final">
      <div className="wrap">
        <h2 className="final-title">
          Você fala “Jarvis”.
          <br />
          Ele responde.
        </h2>
        <a href={CHECKOUT_URL} className="btn-primary btn-xl">
          Garantir meu Jarvis · R$ {PRICE.to}
        </a>
        <p className="final-sub">Pagamento único · Acesso vitalício</p>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="brand">
            <BrandOrb />
            J.A.R.V.I.S.
          </div>
          <nav className="footer-links" aria-label="Rodapé">
            {SUPPORT_EMAIL && <a href={`mailto:${SUPPORT_EMAIL}`}>Suporte</a>}
            <a href="#funcionalidades">Funcionalidades</a>
            <a href={CHECKOUT_URL}>Comprar</a>
          </nav>
        </div>
        <div className="footer-meta">
          <p>© {new Date().getFullYear()} J.A.R.V.I.S. · Assistente pessoal de IA para Windows, macOS e Linux</p>
          <p>Projeto independente. Sem afiliação com estúdios, personagens ou marcas registradas.</p>
        </div>
      </div>
    </footer>
  )
}
