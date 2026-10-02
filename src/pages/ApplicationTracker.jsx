import { useState } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, ChevronDown, ChevronUp, Download, Eye } from 'lucide-react';

const APPLICATIONS = [
  {
    id: 'APP2026001', scheme: 'Post-Matric Scholarship for ST Students',
    ministry: 'Ministry of Tribal Affairs', submittedDate: '10 Sep 2026',
    amount: '₹48,000', status: 'approved', paymentStatus: 'disbursed',
    paymentDate: '25 Sep 2026', paymentRef: 'PFMS2026092501',
    history: [
      { date: '10 Sep 2026', status: 'Submitted', note: 'Application submitted on NSP portal', done: true },
      { date: '14 Sep 2026', status: 'Verified by Institution', note: 'College verified enrollment and fee details', done: true },
      { date: '18 Sep 2026', status: 'State Verification', note: 'State nodal officer reviewed income & ST certificate', done: true },
      { date: '22 Sep 2026', status: 'Approved', note: 'Sanctioned by Ministry. Amount: ₹48,000', done: true },
      { date: '25 Sep 2026', status: 'Disbursed', note: 'Amount credited via PFMS to your bank account', done: true },
    ],
    documents: ['ST Certificate', 'Income Certificate', 'Marksheet', 'Fee Receipt', 'Aadhaar Card']
  },
  {
    id: 'APP2026002', scheme: 'Pre-Matric Scholarship for ST Students',
    ministry: 'Ministry of Tribal Affairs', submittedDate: '22 Sep 2026',
    amount: '₹6,500', status: 'under_review', paymentStatus: 'pending',
    paymentDate: null, paymentRef: null,
    history: [
      { date: '22 Sep 2026', status: 'Submitted', note: 'Application submitted successfully', done: true },
      { date: '25 Sep 2026', status: 'Verified by Institution', note: 'School principal verified attendance and class', done: true },
      { date: '28 Sep 2026', status: 'State Verification', note: 'Under review by state tribal welfare dept.', done: true, active: true },
      { date: 'Expected: 15 Oct', status: 'Approval', note: 'Pending', done: false },
      { date: 'Expected: 30 Oct', status: 'Disbursement', note: 'Pending', done: false },
    ],
    documents: ['ST Certificate', 'School Bonafide', 'Aadhaar Card']
  },
  {
    id: 'APP2026003', scheme: 'MahaDBT Scholarship – Maharashtra',
    ministry: 'Govt of Maharashtra', submittedDate: '05 Aug 2026',
    amount: '₹18,000', status: 'rejected', paymentStatus: null,
    paymentDate: null, paymentRef: null,
    rejectionReason: 'Income certificate expired (more than 1 year old). Please reapply with fresh certificate.',
    history: [
      { date: '05 Aug 2026', status: 'Submitted', note: 'Application submitted on MahaDBT portal', done: true },
      { date: '10 Aug 2026', status: 'Verified by Institution', note: 'College verified details', done: true },
      { date: '20 Aug 2026', status: 'Rejected', note: 'Income certificate expired. Please reapply.', done: true, isRejection: true },
    ],
    documents: ['ST Certificate', 'College Bonafide']
  },
];

const statusConfig = {
  approved: { color: '#1B7A3E', bg: '#E8F5ED', icon: <CheckCircle size={14}/>, label: 'Approved' },
  under_review: { color: '#1565C0', bg: '#E3F0FF', icon: <Clock size={14}/>, label: 'Under Review' },
  pending: { color: '#D4800A', bg: '#FFF3DC', icon: <Clock size={14}/>, label: 'Pending' },
  rejected: { color: '#C0392B', bg: '#FDECEA', icon: <XCircle size={14}/>, label: 'Rejected' },
};

export default function ApplicationTracker() {
  const [expanded, setExpanded] = useState('APP2026001');
  const [activeTab, setActiveTab] = useState('all');

  const filtered = APPLICATIONS.filter(a => {
    if (activeTab === 'active') return ['under_review', 'pending'].includes(a.status);
    if (activeTab === 'approved') return a.status === 'approved';
    if (activeTab === 'rejected') return a.status === 'rejected';
    return true;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">Track application status, payment history and rejection reasons.</p>
      </div>

      {/* Summary Row */}
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)', marginBottom:20}}>
        {[
          {label:'Total Applied', val:'3', icon:'📝', col:'navy'},
          {label:'Approved', val:'1', icon:'✅', col:'green'},
          {label:'Under Review', val:'1', icon:'⏳', col:'amber'},
          {label:'Rejected', val:'1', icon:'❌', col:'saffron'},
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
        {[['all','All (3)'],['active','Active'],['approved','Approved'],['rejected','Rejected']].map(([k,l]) => (
          <button key={k} className={`tab${activeTab===k?' active':''}`} onClick={() => setActiveTab(k)}>{l}</button>
        ))}
      </div>

      {/* Application Cards */}
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {filtered.map(app => {
          const sc = statusConfig[app.status];
          const isOpen = expanded === app.id;
          return (
            <div key={app.id} className="card" style={{overflow:'visible'}}>
              {/* Card Header */}
              <div
                style={{padding:'16px 20px', cursor:'pointer', display:'flex', gap:14, alignItems:'center'}}
                onClick={() => setExpanded(isOpen ? null : app.id)}
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
                        <span style={{textDecoration:'underline', cursor:'pointer', fontWeight:600}}>Reapply with updated documents →</span>
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
                        <button className="btn btn-outline btn-sm">
                          <Download size={13}/> Download Acknowledgement
                        </button>
                        {app.status === 'rejected' && (
                          <button className="btn btn-saffron btn-sm">
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
