import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle, Clock, AlertCircle, IndianRupee, BookOpen, Filter } from 'lucide-react';

export default function Notifications() {
  const { notifications: notifs, markRead, markAllRead, t } = useApp();
  const [filter, setFilter] = useState('all');

  const typeLabels = {all: t('all'), payment:'Payments', deadline:'Deadlines', status:'Status', reminder:'Reminders', info:'Information'};

  const filtered = notifs.filter(n => filter === 'all' || n.type === filter);
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="fade-in" style={{maxWidth:760, margin:'0 auto'}}>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 className="page-title">{t('notifications')}</h1>
          <p className="page-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCircle size={13}/> {t('markAllRead')}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="tabs" style={{marginBottom:20}}>
        {Object.entries(typeLabels).map(([k, l]) => (
          <button key={k} className={`tab${filter===k?' active':''}`} onClick={() => setFilter(k)}>
            {l}
            {k === 'all' && unreadCount > 0 && (
              <span style={{marginLeft:5, background:'#FF6B1A', color:'white', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10}}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{padding:'8px 0'}}>
          {filtered.length === 0 && (
            <div style={{padding:'60px 32px', textAlign:'center'}}>
              <div style={{fontSize:48, marginBottom:12}}>🔔</div>
              <div style={{fontSize:14, fontWeight:600, color:'#003366'}}>No notifications in this category</div>
            </div>
          )}
          {filtered.map((n, i) => (
            <div
              key={n.id}
              className={`notif-item${!n.read ? ' unread' : ''}`}
              style={{
                padding:'14px 20px', borderBottom: i < filtered.length-1 ? '1px solid #EFF1F7' : 'none',
                background: !n.read ? 'rgba(0,51,102,0.02)' : 'white', cursor:'pointer',
                transition:'background 0.15s', display:'flex', gap:14, alignItems:'flex-start'
              }}
              onClick={() => markRead(n.id)}
            >
              {/* Unread dot */}
              <div style={{width:8, height:8, borderRadius:'50%', background: !n.read ? '#FF6B1A' : 'transparent', flexShrink:0, marginTop:6}}/>

              {/* Icon */}
              <div style={{width:44, height:44, borderRadius:12, background:n.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0}}>
                {n.icon}
              </div>

              {/* Content */}
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight: !n.read ? 700 : 600, color:'#1E2541', marginBottom:4}}>
                  {n.title}
                </div>
                <div style={{fontSize:12, color:'#68738F', lineHeight:1.6}}>{n.body}</div>
              </div>

              {/* Time */}
              <div style={{fontSize:11, color:'#9AA3BC', flexShrink:0, marginTop:2, whiteSpace:'nowrap'}}>{n.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
