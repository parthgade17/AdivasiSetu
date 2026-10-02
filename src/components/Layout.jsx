import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CheckSquare, FileText, Bell,
  Upload, User, Users, BarChart3, LogOut, ChevronLeft,
  ChevronRight, Wifi, WifiOff, Globe
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['student', 'admin', 'assistant'] },
  { label: 'Eligibility Checker', icon: CheckSquare, path: '/eligibility', roles: ['student', 'assistant'], badge: 'NEW' },
  { label: 'Scholarships', icon: BookOpen, path: '/scholarships', roles: ['student', 'assistant'] },
  { label: 'My Applications', icon: FileText, path: '/applications', roles: ['student', 'assistant'] },
  { label: 'Documents', icon: Upload, path: '/documents', roles: ['student', 'assistant'] },
  { label: 'Assisted Mode', icon: Users, path: '/assisted', roles: ['assistant'] },
  { label: 'Admin Dashboard', icon: BarChart3, path: '/admin', roles: ['admin'] },
];

const languages = ['EN', 'हिं', 'मर', 'TE', 'TA'];

export default function Layout({ onLogout, userRole }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isOnline] = useState(true);
  const [currentLang, setCurrentLang] = useState('EN');
  const navigate = useNavigate();
  const location = useLocation();

  const filteredNav = navItems.filter(n => n.roles.includes(userRole));

  const pageTitle = navItems.find(n => location.pathname.startsWith(n.path))?.label
    || (location.pathname === '/notifications' ? 'Notifications' : 'Profile');

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-emblem">🏛️</div>
          {!collapsed && (
            <div className="sidebar-brand">
              <span className="sidebar-brand-title">ST Scholarship Portal</span>
              <span className="sidebar-brand-sub">Ministry of Tribal Affairs</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {!collapsed && <span className="nav-section-title">Navigation</span>}
          {filteredNav.map(item => (
            <div
              key={item.path}
              className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ''}
            >
              <item.icon size={18} className="nav-icon" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
          ))}

          {!collapsed && <span className="nav-section-title" style={{marginTop:8}}>Account</span>}
          <div
            className={`nav-item${location.pathname === '/notifications' ? ' active' : ''}`}
            onClick={() => navigate('/notifications')}
            title={collapsed ? 'Notifications' : ''}
          >
            <Bell size={18} className="nav-icon" />
            {!collapsed && <span>Notifications</span>}
            {!collapsed && <span className="nav-badge">3</span>}
          </div>
          <div
            className={`nav-item${location.pathname === '/profile' ? ' active' : ''}`}
            onClick={() => navigate('/profile')}
            title={collapsed ? 'Profile' : ''}
          >
            <User size={18} className="nav-icon" />
            {!collapsed && <span>My Profile</span>}
          </div>
        </nav>

        <div className="sidebar-footer">
          {/* Language quick-select */}
          {!collapsed && (
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:6}}>Language</div>
              <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
                {languages.map(l => (
                  <button
                    key={l}
                    onClick={() => setCurrentLang(l)}
                    style={{
                      padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:600,
                      border:'1px solid', cursor:'pointer', transition:'all 0.15s',
                      background: currentLang === l ? 'var(--saffron)' : 'transparent',
                      borderColor: currentLang === l ? 'var(--saffron)' : 'rgba(255,255,255,0.2)',
                      color: currentLang === l ? 'white' : 'rgba(255,255,255,0.5)'
                    }}
                  >{l}</button>
                ))}
              </div>
            </div>
          )}

          {/* Online status */}
          {!collapsed && (
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:10, fontSize:11, color: isOnline ? '#4CAF50' : '#FF9800'}}>
              {isOnline ? <Wifi size={12}/> : <WifiOff size={12}/>}
              {isOnline ? 'Online' : 'Offline Mode'}
            </div>
          )}

          <div className="sidebar-user-card">
            <div className="user-avatar">
              {userRole === 'admin' ? 'A' : userRole === 'assistant' ? 'T' : 'R'}
            </div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">
                  {userRole === 'admin' ? 'Admin Officer' : userRole === 'assistant' ? 'Teacher Ramesh' : 'Ramesh Bhavale'}
                </div>
                <div className="user-role">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</div>
              </div>
            )}
          </div>

          <div
            className="nav-item"
            style={{marginTop:6, color:'rgba(255,80,80,0.8)'}}
            onClick={onLogout}
            title="Logout"
          >
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            position:'absolute', right:'-12px', top:'80px',
            width:24, height:24, borderRadius:'50%',
            background:'white', border:'1px solid var(--gray-200)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', boxShadow:'var(--shadow-sm)', color:'var(--gray-600)'
          }}
        >
          {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
        </button>
      </aside>

      {/* MAIN */}
      <main className={`main-content${collapsed ? ' collapsed' : ''}`}>
        {/* Offline bar */}
        {!isOnline && (
          <div className="offline-bar">
            <WifiOff size={14}/> You are offline. Changes will sync when connected.
          </div>
        )}

        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div>
              <div className="topbar-page-title">{pageTitle}</div>
              <div className="topbar-breadcrumb">ST Scholarship Portal › {pageTitle}</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--gray-400)'}}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input placeholder="Search scholarships, status…" />
            </div>
            <div className="icon-btn" style={{position:'relative'}}>
              <Globe size={16}/>
            </div>
            <div className="icon-btn" onClick={() => navigate('/notifications')}>
              <Bell size={16}/>
              <div className="notif-dot"></div>
            </div>
            <div className="user-avatar" style={{cursor:'pointer'}} onClick={() => navigate('/profile')}>
              {userRole === 'admin' ? 'A' : userRole === 'assistant' ? 'T' : 'R'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
