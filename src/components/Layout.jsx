import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CheckSquare, FileText, Bell,
  Upload, User, Users, BarChart3, LogOut, ChevronLeft,
  ChevronRight, Wifi, WifiOff, RefreshCw, Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../i18n';
import BottomNav from './BottomNav';
import VoiceAssistant from './VoiceAssistant';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['student', 'admin'] },
  { key: 'assisted', icon: Users, path: '/assisted', roles: ['assistant'] },
  { key: 'eligibility', icon: CheckSquare, path: '/eligibility', roles: ['student', 'assistant'], badge: 'NEW' },
  { key: 'scholarships', icon: BookOpen, path: '/scholarships', roles: ['student', 'assistant', 'admin'] },
  { key: 'applications', icon: FileText, path: '/applications', roles: ['student', 'assistant'] },
  { key: 'documents', icon: Upload, path: '/documents', roles: ['student', 'assistant'] },
  { key: 'admin', icon: BarChart3, path: '/admin', roles: ['admin'] },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user, role, config, t, lang, setLang, online, netOnline, simOffline, setSimOffline,
    acting, notifications, logout, queue, loading, loadAll,
  } = useApp();

  const filteredNav = navItems.filter(n => n.roles.includes(role));
  const unread = notifications.filter(n => !n.read).length;
  const hasStudentArea = role === 'student' || (role === 'assistant' && acting);
  const current = navItems.find(n => location.pathname.startsWith(n.path))?.key
    || (location.pathname === '/notifications' ? 'notifications' : 'profile');
  const pageTitle = t(current);
  const displayName = user?.name || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="app-shell">
      {/* Hidden hook for DOM translation */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* SIDEBAR */}
      <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-emblem" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/></svg>
          </div>
          {!collapsed && (
            <div className="sidebar-brand">
              <span className="sidebar-brand-title">{t('brand')}</span>
              <span className="sidebar-brand-sub">{t('portalTagline')}</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {!collapsed && <span className="nav-section-title">{t('navigation')}</span>}
          {filteredNav.map(item => (
            <div
              key={item.path}
              className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
              title={collapsed ? t(item.key) : ''}
            >
              <item.icon size={18} className="nav-icon" />
              {!collapsed && <span>{t(item.key)}</span>}
              {!collapsed && item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}

          {hasStudentArea && (
            <>
              {!collapsed && <span className="nav-section-title" style={{marginTop:8}}>{t('account')}</span>}
              <div
                className={`nav-item${location.pathname === '/notifications' ? ' active' : ''}`}
                onClick={() => navigate('/notifications')}
                title={collapsed ? t('notifications') : ''}
              >
                <Bell size={18} className="nav-icon" />
                {!collapsed && <span>{t('notifications')}</span>}
                {!collapsed && unread > 0 && <span className="nav-badge">{unread}</span>}
              </div>
              <div
                className={`nav-item${location.pathname === '/profile' ? ' active' : ''}`}
                onClick={() => navigate('/profile')}
                title={collapsed ? t('profile') : ''}
              >
                <User size={18} className="nav-icon" />
                {!collapsed && <span>{t('profile')}</span>}
              </div>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'1px', marginBottom:6, display:'flex', alignItems:'center', gap:4}}>
                <Globe size={11} /> {t('language')} (All 22+ Languages)
              </div>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)',
                  cursor: 'pointer',
                  outline: 'none',
                  marginBottom: 6
                }}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} style={{color: '#002147', background:'white'}}>
                    {l.native} — {l.label}
                  </option>
                ))}
              </select>

              {/* Quick Pills for Top Languages */}
              <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
                {LANGUAGES.slice(0, 6).map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    title={l.label}
                    style={{
                      padding:'3px 6px', borderRadius:4, fontSize:10, fontWeight:600,
                      border:'1px solid', cursor:'pointer', transition:'all 0.15s',
                      background: lang === l.code ? 'var(--saffron)' : 'transparent',
                      borderColor: lang === l.code ? 'var(--saffron)' : 'rgba(255,255,255,0.2)',
                      color: lang === l.code ? 'white' : 'rgba(255,255,255,0.7)'
                    }}
                  >{l.short}</button>
                ))}
              </div>
            </div>
          )}

          {!collapsed && (
            <button
              className="status-toggle"
              onClick={() => config.demoMode && setSimOffline(s => !s)}
              title={config.demoMode ? t('simulateOffline') : undefined}
              style={{marginBottom:10, color: online ? '#4CAF50' : '#FF9800', cursor: config.demoMode ? 'pointer' : 'default'}}
            >
              {online ? <Wifi size={12}/> : <WifiOff size={12}/>}
              {online ? t('online') : t('offline')}
              {simOffline && netOnline && <span style={{opacity:0.7}}>(demo)</span>}
            </button>
          )}

          <div className="sidebar-user-card">
            <div className="user-avatar">{initial}</div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">{displayName}</div>
                <div className="user-role">
                  {role === 'assistant' ? `CSC ${user?.cscId || ''}` : role ? role.charAt(0).toUpperCase() + role.slice(1) : ''}
                </div>
              </div>
            )}
          </div>

          <div className="nav-item" style={{marginTop:6, color:'rgba(255,80,80,0.8)'}} onClick={handleLogout} title={t('logout')}>
            <LogOut size={16} />
            {!collapsed && <span>{t('logout')}</span>}
          </div>
        </div>

        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
        {!online && (
          <div className="offline-bar">
            <WifiOff size={14}/> {t('offlineBar')}
            {queue.length > 0 && <strong>· {queue.length} {t('queued')}</strong>}
            {simOffline && config.demoMode && (
              <button className="status-toggle" style={{marginLeft:'auto', color:'inherit', textDecoration:'underline'}} onClick={() => setSimOffline(false)}>
                {t('online')}
              </button>
            )}
          </div>
        )}

        {role === 'assistant' && acting && (
          <div className="acting-banner">
            <span>👤 {t('actingFor', { name: acting.name })}</span>
            <button onClick={() => navigate('/assisted')}>{t('changeStudent')}</button>
          </div>
        )}

        <header className="topbar">
          <div className="topbar-left">
            <div>
              <div className="topbar-page-title">{pageTitle}</div>
              <div className="topbar-breadcrumb">{t('brand')} › {pageTitle}</div>
            </div>
          </div>
          <div className="topbar-right">
            {/* Topbar Universal Language Selector Dropdown */}
            <div style={{display:'flex', alignItems:'center', gap:6, background:'#F0F4FA', padding:'4px 8px', borderRadius:8, border:'1px solid #DDE1EE'}}>
              <Globe size={14} color="#003366" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{
                  border:'none',
                  background:'transparent',
                  fontSize:12,
                  fontWeight:600,
                  color:'#003366',
                  cursor:'pointer',
                  outline:'none'
                }}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.short})
                  </option>
                ))}
              </select>
            </div>

            <button
              className="icon-btn"
              onClick={() => (online ? loadAll() : setSimOffline(false))}
              title={online ? 'Refresh data' : t('offline')}
              aria-label="Refresh data"
              style={{color: online ? undefined : '#D4800A'}}
            >
              {online ? <RefreshCw size={16} className={loading ? 'spin' : ''}/> : <WifiOff size={16}/>}
            </button>
            {hasStudentArea && (
              <div className="icon-btn" onClick={() => navigate('/notifications')} style={{position:'relative'}}>
                <Bell size={16}/>
                {unread > 0 && <div className="notif-dot"></div>}
              </div>
            )}
            <div className="user-avatar" style={{cursor: hasStudentArea ? 'pointer' : 'default'}} onClick={() => hasStudentArea && navigate('/profile')}>
              {initial}
            </div>
          </div>
        </header>

        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>

      <BottomNav />
      {/* Floating Interactive AI Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
}
