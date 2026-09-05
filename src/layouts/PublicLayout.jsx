import { Outlet } from 'react-router-dom'
import Footer from '../components/public/Footer'
import Navbar from '../components/public/Navbar'
import ScrollToTop from '../components/common/ScrollToTop'

function PublicLayout() {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      <ScrollToTop />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </div>
  )
}

export default PublicLayout