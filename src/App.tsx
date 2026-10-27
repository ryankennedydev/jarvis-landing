import Lenis from 'lenis'
import { MotionConfig } from 'motion/react'
import { useEffect } from 'react'
import { Brain } from './components/sections/Brain'
import { ComputerControl } from './components/sections/ComputerControl'
import { FinalCta, Footer } from './components/sections/FinalCta'
import { Finance } from './components/sections/Finance'
import { Hero } from './components/sections/Hero'
import { Navbar } from './components/sections/Navbar'
import { News } from './components/sections/News'
import { Privacy } from './components/sections/Privacy'
import { VoicePipeline } from './components/sections/VoicePipeline'
import { Work } from './components/sections/Work'
import { usePrefersReducedMotion } from './lib/hooks'
import { setLenis } from './lib/lenis'

export default function App() {
  const reduced = usePrefersReducedMotion()

  // Scroll suave (desligado com movimento reduzido)
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -64 }, lerp: 0.11 })
    setLenis(lenis)
    return () => {
      setLenis(null)
      lenis.destroy()
    }
  }, [reduced])

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#conteudo"
        className="cut cut-sm fixed top-3 left-3 z-[100] -translate-y-20 bg-ice px-4 py-2 font-display text-[0.7rem] tracking-[0.2em] text-bg focus:translate-y-0"
      >
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo">
        <Hero />
        <VoicePipeline />
        <Brain />
        <Work />
        <ComputerControl />
        <Finance />
        <News />
        <Privacy />
        <FinalCta />
      </main>
      <Footer />
      <div aria-hidden className="atmosphere" />
    </MotionConfig>
  )
}
