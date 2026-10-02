import { useState } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, IndianRupee, BookOpen, Filter } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1, type: 'payment', read: false,
    title: 'Payment Received — ₹48,000',
    body: 'Post-Matric Scholarship 2026-27 has been credited to your bank account via PFMS. Ref: PFMS2026092501.',
    time: '2 hours ago', icon: '💰', color: '#1B7A3E', bg: '#E8F5ED'
  },
  {
    id: 2, type: 'deadline', read: false,
    title: 'Deadline Alert: MahaDBT Scholarship',
    body: 'The MahaDBT Scholarship closes in 14 days (31 Oct 2026). You have not yet applied. Complete application now.',
    time: '5 hours ago', icon: '⏰', color: '#D4800A', bg: '#FFF3DC'
  },
  {
    id: 3, type: 'status', read: false,
    title: 'Application Under Review',
    body: 'Your Pre-Matric Scholarship (APP2026002) is now under state-level review. Expected decision by 15 Oct 2026.',
    time: '1 day ago', icon: '🔄', color: '#1565C0', bg: '#E3F0FF'
  },
  {
    id: 4, type: 'reminder', read: true,
    title: 'Document Reminder: Bank Passbook',
    body: 'The uploaded bank passbook image is blurry (42% quality). Please re-upload a clear copy for your application to proceed.',
    time: '2 days ago', icon: '📄', color: '#C0392B', bg: '#FDECEA'
  },
  {
    id: 5, type: 'info', read: true,
    title: 'New Scheme Added: Eklavya Fellowship',
    body: 'A new fellowship worth ₹15,000/month has been added for ST students in STEM courses. Check if you qualify.',
    time: '3 days ago', icon: '🎓', color: '#003366', bg: '#F0F4FF'
  },
  {
    id: 6, type: 'deadline', read: true,
    title: 'Reminder: National Overseas Scholarship',
    body: 'Applications for National Overseas Scholarship 2026-27 close on 28 Feb 2027. Early applications preferred.',
    time: '1 week ago', icon: '✈️', color: '#003366', bg: '#F0F4FF'
  },
];

const typeLabels = {all:'All', payment:'Payments', deadline:'Deadlines', status:'Status', reminder:'Reminders', info:'Information'};

export default function Notifications() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const markAllRead = () => setNotifs(n => n.map(x => ({...x, read:true})));
  const markRead = (id) => setNotifs(n => n.map(x => x.id === id ? {...x, read:true} : x));

  const filtered = notifs.filter(n => filter === 'all' || n.type === filter);
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="fade-in" style={{maxWidth:760, margin:'0 auto'}}>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCircle size={13}/> Mark All Read
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
