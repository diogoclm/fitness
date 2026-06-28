import { NavLink } from 'react-router-dom'

const itens = [
  { to: '/plano', label: 'Plano', icon: '🏋️' },
  { to: '/historico', label: 'Histórico', icon: '📅' },
  { to: '/perfil', label: 'Perfil', icon: '👤' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 border-t border-white/10 bg-card">
      <div className="mx-auto flex max-w-md">
        {itens.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-accent' : 'text-muted'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
