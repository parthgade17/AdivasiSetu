import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Download, Eye, RefreshCw, CloudOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

function downloadAcknowledgement(app, studentName) {
  const lines = [
    'AdivasiSetu — Application Acknowledgement', '',
    `Application ID : ${app.id}`, `Student        : ${studentName || app.name || ''}`,
    `Scheme         : ${app.scheme}`, `Department     : ${app.ministry}`,
    `Submitted on   : ${app.submittedDate}`, `Status         : ${app.status}`, '',
    'Timeline:', ...app.history.map(h => `  - ${h.status} (${h.date}) ${h.note}`),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${app.id}-acknowledgement.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const statusConfig = {
  approved: { color: '#1B7A3E', bg: '#E8F5ED', icon: <CheckCircle size={14}/>, label: 'Approved' },
  under_review: { color: '#1565C0', bg: '#E3F0FF', icon: <Clock size={14}/>, label: 'Under Review' },
  pending: { color: '#D4800A', bg: '#FFF3DC', icon: <Clock size={14}/>, label: 'Pending' },
  rejected: { color: '#C0392B', bg: '#FDECEA', icon: <XCircle size={14}/>, label: 'Rejected' },
  queued: { color: '#8A5300', bg: '#FFF3DC', icon: <CloudOff size={14}/>, label: 'Waiting to sync' },
};

export default function ApplicationTracker() {
  const navigate = useNavigate();
  const { applications: APPLICATIONS, refreshApplication, profile, t, config } = useApp();
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(null);
  const count = (fn) => APPLICATIONS.filter(fn).length;

  const filtered = APPLICATIONS.filter(a => {
    if (activeTab === 'active') return ['under_review', 'pending', 'queued'].includes(a.status);
    if (activeTab === 'approved') return a.status === 'approved';
    if (activeTab === 'rejected') return a.status === 'rejected';
    return true;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('applications')}</h1>
        <p className="page-subtitle">Track application status, payment history and rejection reasons.</p>
      </div>

      {/* Summary Row */}
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)', marginBottom:20}}>
        {[
          {label: t('appliedSchemes'), val:APPLICATIONS.length, icon:'📝', col:'navy'},
          {label: t('approved'), val:count(a => a.status === 'approved'), icon:'✅', col:'green'},
          {label: t('inProgress'), val:count(a => ['under_review','pending','queued'].includes(a.status)), icon:'⏳', col:'amber'},
          {label: t('statusRejected'), val:count(a => a.status === 'rejected'), icon:'❌', col:'saffron'},
        ].map((s,i) => (
          <div key={i} className={`stat-card ${s.col}`} style={{padding:'14px 16px'}}>
            <div className={`stat-icon ${s.col}`} style={{width:38, height:38, fontSize:18}}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value" style={{fontSize:22}}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{maxWidth:400}}>
        {[['all',`${t('all')} (${APPLICATIONS.length})`],['active', t('inProgress')],['approved', t('approved')],['rejected', t('statusRejected')]].map(([k,l]) => (
          <button key={k} className={`tab${activeTab===k?' active':''}`} onClick={() => setActiveTab(k)}>{l}</button>
        ))}
      </div>

      {APPLICATIONS.length === 0 && (
        <div style={{textAlign:'center', padding:'48px 24px', background:'white', borderRadius:12, border:'1px solid #DDE1EE'}}>
          <h3 style={{fontSize:16, fontWeight:700, color:'#003366', marginBottom:6}}>{t('noAppsYet')}</h3>
          <p style={{fontSize:13, color:'#68738F', marginBottom:16}}>{t('heroSubtitle')}</p>
          <button className="btn btn-saffron" onClick={() => navigate('/eligibility')}>{t('checkEligibility')}</button>
        </div>
      )}

      {/* Application Cards */}
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {filtered.map(app => {
          const sc = statusConfig[app.status];
          const key = app.clientRef || app.id;
          const isOpen = expanded === key;
          return (
            <div key={key} className="card" style={{overflow:'visible'}}>
              {/* Card Header */}
              <div
                style={{padding:'16px 20px', cursor:'pointer', display:'flex', gap:14, alignItems:'center'}}
                onClick={() => setExpanded(isOpen ? null : key)}
              >
                {/* Status pill */}
                <div style={{width:42, height:42, borderRadius:10, background:sc.bg, display:'flex', alignItems:'center', justifyContent:'center', color:sc.color, flexShrink:0}}>
                  {sc.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                    <span style={{fontSize:12, fontFamily:'monospace', color:'#9AA3BC'}}>{app.id}</span>
                    <span style={{padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:700, background:sc.bg, color:sc.color}}>
                      {sc.label}
                    </span>
                    {app.paymentStatus === 'disbursed' && (
                      <span className="badge badge-green">💰 Disbursed</span>
                    )}
                  </div>
                  <div style={{fontSize:14, fontWeight:700, color:'#003366', marginTop:3}}>{app.scheme}</div>
                  <div style={{fontSize:12, color:'#68738F', marginTop:1}}>{app.ministry} · Applied: {app.submittedDate}</div>
                </div>
                <div style={{textAlign:'right', flexShrink:0}}>
                  <div style={{fontSize:20, fontWeight:900, color:'#E55A0A'}}>{app.amount}</div>
                  {app.paymentDate && <div style={{fontSize:11, color:'#1B7A3E', marginTop:2}}>Paid: {app.paymentDate}</div>}
                </div>
                <div style={{color:'#9AA3BC'}}>
                  {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </div>
              </div>

              {/* Expanded: Timeline + Details */}
              {isOpen && (
                <div style={{padding:'0 20px 20px', borderTop:'1px solid #EFF1F7'}} className="fade-in">
                  {/* Rejection reason */}
                  {app.rejectionReason && (
                    <div className="alert alert-error" style={{marginTop:16}}>
                      <XCircle size={16}/>
                      <div>
                        <strong>Rejection Reason:</strong> {app.rejectionReason}
                        <br/>
                        <span style={{textDecoration:'underline', cursor:'pointer', fontWeight:600}} onClick={() => navigate('/documents')}>Update documents, then reapply</span>
                      </div>
                    </div>
                  )}

                  <div className="grid-2" style={{gap:24, marginTop:16}}>
                    {/* Timeline */}
                    <div>
                      <div style={{fontSize:12, fontWeight:700, color:'#003366', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:16}}>Application Timeline</div>
                      <div className="timeline">
                        {app.history.map((h, i) => (
                          <div key={i} className="timeline-item">
                            <div className={`timeline-dot ${h.done ? (h.isRejection ? '' : 'done') : ''} ${h.active ? 'active' : ''}`}
                              style={h.isRejection ? {background:'#C0392B', boxShadow:'0 0 0 2px #C0392B'} : {}}
                            />
                            <div className="timeline-title" style={{color: h.isRejection ? '#C0392B' : h.active ? '#FF6B1A' : h.done ? '#1E2541' : '#9AA3BC'}}>
                              {h.status}
                            </div>
                            <div className="timeline-date">{h.date}</div>
                            <div style={{fontSize:11, color:'#68738F', marginTop:2, lineHeight:1.5}}>{h.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents & Payment */}
                    <div>
                      <div style={{fontSize:12, fontWeight:700, color:'#003366', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12}}>Submitted Documents</div>
                      {app.documents.map((d, i) => (
                        <div key={i} className="doc-item">
                          <div className="doc-icon" style={{background:'#E3F0FF', color:'#1565C0', fontSize:16}}>📄</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12, fontWeight:600, color:'#1E2541'}}>{d}</div>
                            <div style={{fontSize:11, color:'#1B7A3E'}}>✓ Uploaded</div>
                          </div>
                          <Eye size={14} color="#9AA3BC" style={{cursor:'pointer'}}/>
                        </div>
                      ))}

                      {/* Payment Info */}
                      {app.paymentRef && (
                        <div style={{marginTop:16, padding:'14px', background:'linear-gradient(135deg,#E8F5ED,#F0FBF4)', borderRadius:10, border:'1px solid rgba(27,122,62,0.2)'}}>
                          <div style={{fontSize:12, fontWeight:700, color:'#1B7A3E', marginBottom:8}}>💰 Payment Details</div>
                          <div style={{fontSize:12, color:'#4B5470'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                              <span>Amount</span><strong style={{color:'#1B7A3E'}}>{app.amount}</strong>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                              <span>Date</span><span>{app.paymentDate}</span>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                              <span>PFMS Ref.</span><span style={{fontFamily:'monospace', fontSize:11}}>{app.paymentRef}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{display:'flex', gap:8, marginTop:14, flexWrap:'wrap'}}>
                        {app.status !== 'queued' && (
                          <button className="btn btn-outline btn-sm" onClick={() => downloadAcknowledgement(app, profile?.name)}>
                            <Download size={13}/> Download Acknowledgement
                          </button>
                        )}
                        {config.demoMode && (['pending', 'under_review'].includes(app.status) || (app.status === 'approved' && app.paymentStatus !== 'disbursed')) ? (
                          <button
                            className="btn btn-outline btn-sm"
                            disabled={refreshing === app.id}
                            title="Demo: simulates the next verification step by the department"
                            onClick={async () => { setRefreshing(app.id); await refreshApplication(app.id); setRefreshing(null); }}
                          >
                            <RefreshCw size={13} className={refreshing === app.id ? 'spin' : ''}/> {t('refreshStatus')}
                          </button>
                        ) : null}
                        {app.status === 'rejected' && (
                          <button className="btn btn-saffron btn-sm" onClick={() => navigate('/scholarships')}>
                            Reapply Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
