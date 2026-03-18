import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">PHARMA<span style={{ color: '#f5f5f5', fontWeight: 300 }}>MGR</span></div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''}>
          Catégories
        </NavLink>
        <NavLink to="/medicaments" className={({ isActive }) => isActive ? 'active' : ''}>
          Médicaments
        </NavLink>
        <NavLink to="/ventes" className={({ isActive }) => isActive ? 'active' : ''}>
          Ventes
        </NavLink>
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
        PharmaManager v1.0
      </div>
    </aside>
  );
}
