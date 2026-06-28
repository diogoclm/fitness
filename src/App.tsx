import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import { getUser } from './lib/storage'
import Onboarding from './screens/Onboarding'
import Plano from './screens/Plano'
import Treino from './screens/Treino'
import Historico from './screens/Historico'
import Perfil from './screens/Perfil'

// Garante que só acessa as telas internas quem já fez o onboarding.
function RequireUser() {
  if (!getUser()) return <Navigate to="/" replace />
  return <Outlet />
}

// Layout com navegação inferior (escondida na execução do treino).
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
  return (
    <Routes>
      <Route
        path="/"
        element={getUser() ? <Navigate to="/plano" replace /> : <Onboarding />}
      />
      <Route element={<RequireUser />}>
        <Route element={<Layout />}>
          <Route path="/plano" element={<Plano />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
        <Route path="/treino/:fichaId" element={<Treino />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
