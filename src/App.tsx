import { useEffect } from 'react'
import { Buy, Faq, FinalCta, Footer } from './components/lp/Buy'
import { Demo } from './components/lp/Demo'
import { Header, Hero, Trust } from './components/lp/Hero'
import { Offer } from './components/lp/Offer'
import { Features, Guarantee, Install, Platforms, Testimonials } from './components/lp/Sections'

export default function App() {
  // Cartões entram suavemente ao aparecer na tela
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -40px 0px' },
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Offer />
      <Header />
      <main id="conteudo">
        <Hero />
        <Trust />
        <Demo />
        <Features />
        <Install />
        <Platforms />
        <Testimonials />
        <Guarantee />
        <Buy />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
