import { GUARANTEE_DAYS, TESTIMONIALS } from '../../lib/config'
import { LpIcon, type LpIconName } from './Icons'

const FEATURES: { icon: LpIconName; title: string; text: string }[] = [
  {
    icon: 'mic',
    title: 'Comando por voz',
    text: 'Diga “Jarvis” de qualquer tela e fale normalmente. A fala é reconhecida no seu computador e ele responde em voz, em segundos.',
  },
  {
    icon: 'terminal',
    title: 'Controla o seu computador',
    text: 'Roda comandos, abre programas e organiza arquivos. O que só lê roda direto; o que altera o sistema pede sua autorização.',
  },
  {
    icon: 'memory',
    title: 'Lembra de tudo',
    text: 'Memórias, conversas, tarefas e habilidades ficam no Brain 3D. Quanto mais você usa, mais ele te conhece.',
  },
  {
    icon: 'team',
    title: 'Sua empresa de IA',
    text: 'No Work, gerentes e bots trabalham em paralelo nas tarefas que você delega, e você acompanha tudo.',
  },
  {
    icon: 'chart',
    title: 'Finanças e notícias',
    text: 'Cotações ao vivo, carteira consolidada, alertas por voz e as manchetes do dia lidas para você.',
  },
  {
    icon: 'chip',
    title: 'Você escolhe a IA',
    text: 'Claude, GPT ou Gemini, com a sua própria chave de API. Troque quando quiser.',
  },
]

export function Features() {
  return (
    <section className="section" id="funcionalidades">
      <div className="wrap">
        <div className="eyebrow">O que ele faz</div>
        <h2 className="section-title">Sua voz vira ação.</h2>
        <p className="section-sub">Ele entende o que você pede, lembra do que você disse e resolve no seu computador.</p>
        <div className="features">
          {FEATURES.map((f) => (
            <article key={f.title} className="card feature" data-reveal>
              <div className="feature-icon">
                <LpIcon name={f.icon} />
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { title: 'Baixe o app', text: 'Depois do pagamento, você recebe por e-mail o acesso e o link de download.' },
  { title: 'Cole sua chave', text: 'Crie uma chave de API na Anthropic, OpenAI ou Google e cole no Jarvis. Ela fica só no seu computador.' },
  { title: 'Diga “Jarvis”.', text: 'Pronto. Ele escuta, entende, responde e executa.' },
]

export function Install() {
  return (
    <section className="section section-band">
      <div className="wrap">
        <div className="eyebrow">Em poucos minutos</div>
        <h2 className="section-title">Sem configuração complicada.</h2>
        <p className="section-sub">Pague, instale, configure. Pronto.</p>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card step" data-reveal>
              <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const SYSTEMS: { name: string; icon: LpIconName }[] = [
  { name: 'Windows', icon: 'windows' },
  { name: 'macOS', icon: 'mac' },
  { name: 'Linux', icon: 'terminal' },
]

export function Platforms() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="eyebrow">Disponível em</div>
        <h2 className="section-title">Roda no seu sistema.</h2>
        <div className="os-grid">
          {SYSTEMS.map((s) => (
            <div key={s.name} className="card os-card" data-reveal>
              <div className="os-icon">
                <LpIcon name={s.icon} strokeWidth={1.2} />
              </div>
              <h3 className="os-title">{s.name}</h3>
              <p className="os-status">Disponível</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Só aparece quando há depoimentos reais em TESTIMONIALS (config.ts). */
export function Testimonials() {
  if (!TESTIMONIALS.length) return null
  return (
    <section className="section">
      <div className="wrap">
        <div className="eyebrow">Quem já tem</div>
        <h2 className="section-title">Eles testaram. E ficaram.</h2>
        <div className="testimonials">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name + t.quote} className="card testimonial" data-reveal>
              <blockquote className="testimonial-quote">{t.quote}</blockquote>
              <figcaption className="testimonial-author">
                <span className="avatar" aria-hidden>
                  {t.name.charAt(0)}
                </span>
                <span>
                  <span className="author-name" style={{ display: 'block' }}>
                    {t.name}
                  </span>
                  <span className="author-role">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Guarantee() {
  return (
    <section className="guarantee">
      <div className="wrap">
        <div className="guarantee-card">
          <div className="guarantee-badge">
            <LpIcon name="shield" />
            <span>{GUARANTEE_DAYS} DIAS</span>
          </div>
          <div>
            <h2 className="guarantee-title">Garantia de {GUARANTEE_DAYS} dias.</h2>
            <p className="guarantee-desc">
              Instale, converse e teste tudo. Se não for para você, peça o reembolso em até <strong>{GUARANTEE_DAYS} dias</strong>{' '}
              pela Kirvano e receba o valor de volta.
            </p>
            <p className="guarantee-fine">Antes de comprar, experimente a demonstração acima.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
