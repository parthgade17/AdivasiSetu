import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, BookOpen, FileText, Upload, Users, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ITEMS = {
  student: [['dashboard', '/dashboard', LayoutDashboard], ['eligibility', '/eligibility', CheckSquare], ['scholarships', '/scholarships', BookOpen],
    ['applications', '/applications', FileText], ['documents', '/documents', Upload]],
  assistant: [['assisted', '/assisted', Users], ['eligibility', '/eligibility', CheckSquare], ['scholarships', '/scholarships', BookOpen],
    ['applications', '/applications', FileText], ['documents', '/documents', Upload]],
  admin: [['dashboard', '/dashboard', LayoutDashboard], ['admin', '/admin', BarChart3], ['scholarships', '/scholarships', BookOpen]],
};

export default function BottomNav() {
  const { role, t } = useApp();
  return (
    <nav className="bottom-nav" aria-label="Main">
      {(ITEMS[role] || []).map(([key, path, Icon]) => (
        <NavLink key={path} to={path} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <Icon size={20} />
          <span>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
