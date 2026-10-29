import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, Clock, XCircle, ChevronDown, ChevronUp,
  Download, Eye, RefreshCw, CloudOff, FileText, CheckCircle2,
  IndianRupee, AlertCircle
} from 'lucide-react';
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
  approved: { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', icon: <CheckCircle size={15}/>, label: 'Approved' },
  under_review: { color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', icon: <Clock size={15}/>, label: 'Under Review' },
  pending: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: <Clock size={15}/>, label: 'Pending' },
  rejected: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: <XCircle size={15}/>, label: 'Rejected' },
  queued: { color: '#8A5300', bg: '#FFFBEB', border: '#FDE68A', icon: <CloudOff size={15}/>, label: 'Waiting to sync' },
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

  const summaryStats = [
    { label: t('appliedSchemes'), val: APPLICATIONS.length, icon: FileText, col: 'navy' },
    { label: t('approved'), val: count(a => a.status === 'approved'), icon: CheckCircle2, col: 'green' },
    { label: t('inProgress'), val: count(a => ['under_review','pending','queued'].includes(a.status)), icon: Clock, col: 'amber' },
    { label: t('statusRejected'), val: count(a => a.status === 'rejected'), icon: XCircle, col: 'saffron' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('applications')}</h1>
        <p className="page-subtitle">Track your application progress, verification milestones and direct DBT disbursements.</p>
      </div>

      {/* Summary Row */}
      <div className="stats-grid" style={{marginBottom:22}}>
        {summaryStats.map((s, i) => (
          <div key={i} className={`stat-card ${s.col}`} style={{padding:'16px 18px'}}>
            <div className={`stat-icon ${s.col}`}>
              <s.icon size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="tabs" style={{maxWidth:480, marginBottom:20}}>
        {[
          ['all', `${t('all')} (${APPLICATIONS.length})`],
          ['active', t('inProgress')],
          ['approved', t('approved')],
          ['rejected', t('statusRejected')]
        ].map(([k, l]) => (
          <button key={k} className={`tab${activeTab === k ? ' active' : ''}`} onClick={() => setActiveTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {APPLICATIONS.length === 0 && (
        <div style={{textAlign:'center', padding:'56px 24px', background:'white', borderRadius:16, border:'1.5px solid #E2E8F0'}}>
          <div style={{width:60, height:60, background:'#F0F4FA', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#002147'}}>
            <FileText size={28} />
          </div>
          <h3 style={{fontSize:17, fontWeight:800, color:'#002147', marginBottom:6}}>{t('noAppsYet')}</h3>
          <p style={{fontSize:13.5, color:'#64748B', maxWidth:420, margin:'0 auto 20px', lineHeight:1.6}}>
            {t('heroSubtitle')}
          </p>
          <button className="btn btn-saffron" onClick={() => navigate('/eligibility')} style={{boxShadow:'0 4px 12px rgba(255,107,26,0.3)'}}>
            <CheckCircle2 size={15}/> {t('checkEligibility')}
          </button>
        </div>
      )}

      {/* Application Cards */}
      <div style={{display:'flex', flexDirection:'column', gap:14}}>
        {filtered.map(app => {
          const sc = statusConfig[app.status] || statusConfig.pending;
          const key = app.clientRef || app.id;
          const isOpen = expanded === key;
          return (
            <div key={key} className="card" style={{borderRadius:14, border:'1.5px solid #E2E8F0', overflow:'visible', transition:'all 0.2s'}}>
              {/* Card Header */}
              <div
                style={{padding:'18px 24px', cursor:'pointer', display:'flex', gap:16, alignItems:'center'}}
                onClick={() => setExpanded(isOpen ? null : key)}
              >
                {/* Status pill icon */}
                <div style={{width:44, height:44, borderRadius:12, background:sc.bg, border:`1px solid ${sc.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:sc.color, flexShrink:0}}>
                  {sc.icon}
                </div>

                <div style={{flex:1}}>
                  <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:4}}>
                    <span style={{fontSize:12, fontFamily:'monospace', color:'#64748B', fontWeight:700}}>{app.id}</span>
                    <span style={{padding:'3px 10px', borderRadius:20, fontSize:11.5, fontWeight:700, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`}}>
                      {sc.label}
                    </span>
                    {app.paymentStatus === 'disbursed' && (
                      <span className="badge badge-green">
                        <IndianRupee size={11}/> Disbursed
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:15, fontWeight:800, color:'#002147'}}>{app.scheme}</div>
                  <div style={{fontSize:12, color:'#64748B', marginTop:2}}>
                    {app.ministry} · Applied: {app.submittedDate}
                  </div>
                </div>

                <div style={{textAlign:'right', flexShrink:0}}>
                  <div style={{fontSize:20, fontWeight:900, color:'var(--saffron-dark)'}}>{app.amount}</div>
                  {app.paymentDate && <div style={{fontSize:11.5, color:'var(--green-success)', marginTop:2, fontWeight:700}}>Paid: {app.paymentDate}</div>}
                </div>

                <div style={{color:'#94A3B8'}}>
                  {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </div>
              </div>

              {/* Expanded: Timeline + Submitted Details */}
              {isOpen && (
                <div style={{padding:'0 24px 24px', borderTop:'1px solid #F1F5F9'}} className="fade-in">
                  {/* Rejection alert */}
                  {app.rejectionReason && (
                    <div className="alert alert-error" style={{marginTop:18, borderRadius:12}}>
                      <XCircle size={18} style={{flexShrink:0, marginTop:1}}/>
                      <div style={{fontSize:13}}>
                        <strong>Rejection Reason:</strong> {app.rejectionReason}
                        <br/>
                        <span style={{textDecoration:'underline', cursor:'pointer', fontWeight:700, color:'#991B1B', marginTop:4, display:'inline-block'}} onClick={() => navigate('/documents')}>
                          Update missing documents in DigiLocker, then reapply →
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid-2" style={{gap:28, marginTop:18}}>
                    {/* Verification Timeline */}
                    <div>
                      <div style={{fontSize:12, fontWeight:800, color:'#002147', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:18}}>
                        Application Timeline
                      </div>
                      <div className="timeline">
                        {app.history.map((h, i) => (
                          <div key={i} className="timeline-item">
                            <div
                              className={`timeline-dot ${h.done ? (h.isRejection ? '' : 'done') : ''} ${h.active ? 'active' : ''}`}
                              style={h.isRejection ? {background:'#DC2626', boxShadow:'0 0 0 2px #DC2626'} : {}}
                            />
                            <div className="timeline-title" style={{color: h.isRejection ? '#DC2626' : h.active ? 'var(--saffron)' : h.done ? '#0F172A' : '#94A3B8', fontWeight:700}}>
                              {h.status}
                            </div>
                            <div className="timeline-date">{h.date}</div>
                            <div style={{fontSize:11.5, color:'#64748B', marginTop:3, lineHeight:1.5}}>{h.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents & Direct Disbursement */}
                    <div>
                      <div style={{fontSize:12, fontWeight:800, color:'#002147', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:14}}>
                        Verified Supporting Documents
                      </div>
                      <div style={{display:'flex', flexDirection:'column', gap:8}}>
                        {app.documents.map((d, i) => (
                          <div key={i} className="doc-item" style={{borderRadius:10, padding:'10px 14px'}}>
                            <div className="doc-icon" style={{background:'#F0F4FA', color:'#002147'}}>
                              <FileText size={18} />
                            </div>
                            <div style={{flex:1}}>
                              <div style={{fontSize:12.5, fontWeight:700, color:'#1E293B'}}>{d}</div>
                              <div style={{fontSize:11, color:'var(--green-success)', fontWeight:600}}>✓ Verified from DigiLocker</div>
                            </div>
                            <Eye size={15} color="#94A3B8" style={{cursor:'pointer'}}/>
                          </div>
                        ))}
                      </div>

                      {/* Payment Card */}
                      {app.paymentRef && (
                        <div style={{marginTop:18, padding:'16px', background:'linear-gradient(135deg,#F0FDF4,#ECFDF5)', borderRadius:12, border:'1px solid #BBF7D0'}}>
                          <div style={{fontSize:12.5, fontWeight:800, color:'#15803D', marginBottom:10, display:'flex', alignItems:'center', gap:6}}>
                            <IndianRupee size={15}/> Direct Benefit Transfer (DBT) Details
                          </div>
                          <div style={{fontSize:12.5, color:'#334155', display:'flex', flexDirection:'column', gap:6}}>
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                              <span>Sanctioned Amount:</span>
                              <strong style={{color:'#15803D', fontSize:13.5}}>{app.amount}</strong>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                              <span>Disbursement Date:</span>
                              <span>{app.paymentDate}</span>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                              <span>PFMS Reference:</span>
                              <span style={{fontFamily:'monospace', fontSize:11.5, fontWeight:700}}>{app.paymentRef}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{display:'flex', gap:10, marginTop:18, flexWrap:'wrap', alignItems:'center'}}>
                        {app.status !== 'queued' && (
                          <button className="btn btn-outline btn-sm" onClick={() => downloadAcknowledgement(app, profile?.name)}>
                            <Download size={14}/> Download Acknowledgement
                          </button>
                        )}
                        {config.demoMode && (['pending', 'under_review'].includes(app.status) || (app.status === 'approved' && app.paymentStatus !== 'disbursed')) && (
                          <button
                            className="btn btn-outline btn-sm"
                            disabled={refreshing === app.id}
                            title="Simulates step advancement by tribal welfare officer"
                            onClick={async () => { setRefreshing(app.id); await refreshApplication(app.id); setRefreshing(null); }}
                          >
                            <RefreshCw size={13} className={refreshing === app.id ? 'spin' : ''}/> {t('refreshStatus')}
                          </button>
                        )}
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
