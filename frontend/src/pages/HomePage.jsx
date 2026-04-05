import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import PageSeo from '../components/PageSeo.jsx'
import Hero from '../components/Hero.jsx'
import StatsBar from '../components/StatsBar.jsx'
import MissionVision from '../components/MissionVision.jsx'
import Features from '../components/Features.jsx'
import Payments from '../components/Payments.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Testimonials from '../components/Testimonials.jsx'
import Team from '../components/Team.jsx'
import FAQ from '../components/FAQ.jsx'
import Contact from '../components/Contact.jsx'
import Footer from '../components/Footer.jsx'
import { ROUTE_SEO, SITE_ORIGIN } from '../seo.js'

/** Marketing homepage (all sections) */
export default function HomePage() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace(/^#/, '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.pathname, location.hash])

  return (
    <>
      <PageSeo
        title={ROUTE_SEO.home.title}
        description={ROUTE_SEO.home.description}
        canonical={`${SITE_ORIGIN}/`}
      />
      <Navbar />
      <main id="main-content">
        <Hero />
        <StatsBar />
        <MissionVision />
        <Features />
        <Payments />
        <HowItWorks />
        <Testimonials />
        <Team />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
