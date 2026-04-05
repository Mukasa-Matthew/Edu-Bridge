import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

/** Public marketing chrome: fixed nav + footer; children should add top padding (e.g. pt-24). */
export default function MarketingLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
