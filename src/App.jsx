import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import About from './pages/public/About.jsx'
import Aftercare from './pages/public/Aftercare.jsx'
import ArtistDetail from './pages/public/ArtistDetail.jsx'
import Artists from './pages/public/Artists.jsx'
import Contact from './pages/public/Contact.jsx'
import Gallery from './pages/public/Gallery.jsx'
import Home from './pages/public/Home.jsx'
import NotFound from './pages/public/NotFound.jsx'
import TattooDetail from './pages/public/TattooDetail.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminArtists from './pages/admin/AdminArtists.jsx'
import AdminEnquiries from './pages/admin/AdminEnquiries.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminTattooForm from './pages/admin/AdminTattooForm.jsx'
import AdminTattoos from './pages/admin/AdminTattoos.jsx'
import { AdminDataProvider } from './context/AdminDataContext.jsx'
import { useAuth } from './context/AuthContext.jsx'

function AdminProtected() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location }} />
  return (
    <AdminDataProvider>
      <AdminLayout />
    </AdminDataProvider>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/:id" element={<TattooDetail />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/:id" element={<ArtistDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/aftercare" element={<Aftercare />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route path="/admin" element={<AdminProtected />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="tattoos" element={<AdminTattoos />} />
        <Route path="tattoos/new" element={<AdminTattooForm />} />
        <Route path="tattoos/:id/edit" element={<AdminTattooForm />} />
        <Route path="artists" element={<AdminArtists />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
      </Route>
    </Routes>
  )
}

export default App