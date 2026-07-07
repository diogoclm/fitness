import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import { useAuth } from './auth/AuthProvider'
import Login from './screens/Login'
import Onboarding from './screens/Onboarding'
import Plano from './screens/Plano'
import PlanosAnteriores from './screens/PlanosAnteriores'
import Treino from './screens/Treino'
import Historico from './screens/Historico'
import Perfil from './screens/Perfil'

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-12 animate-spin rounded-full border-4 border-white/15 border-t-accent" />
    </div>
  )
}

// Exige usuário logado.
function RequireAuth() {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/" replace />
}

// Exige usuário logado E com perfil preenchido.
function RequireProfile() {
  const { user, profile } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (!profile) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

function Layout() {
  const { pathname } = useLocation()
  const escondeNav = pathname.startsWith('/treino')
  return (
    <div className="mx-auto min-h-full max-w-md pb-20">
      <Outlet />
      {!escondeNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Splash />

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user ? (
            <Login />
          ) : !profile ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <Navigate to="/plano" replace />
          )
        }
      />

      <Route element={<RequireAuth />}>
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      <Route element={<RequireProfile />}>
        <Route element={<Layout />}>
          <Route path="/plano" element={<Plano />} />
          <Route path="/planos" element={<PlanosAnteriores />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
        <Route path="/treino/:fichaId" element={<Treino />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
