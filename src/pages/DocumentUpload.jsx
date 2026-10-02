import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Eye, Trash2, RefreshCw, Link, Camera } from 'lucide-react';

const REQUIRED_DOCS = [
  { id: 1, name: 'Scheduled Tribe (ST) Certificate', desc: 'Issued by Tehsildar or above', mandatory: true, status: 'verified', file: 'ST_Certificate.pdf', uploadDate: '05 Sep 2026', quality: 100 },
  { id: 2, name: 'Income Certificate', desc: 'Annual family income, issued by competent authority', mandatory: true, status: 'pending_review', file: 'Income_Cert.jpg', uploadDate: '08 Sep 2026', quality: 88 },
  { id: 3, name: 'Domicile / Residence Certificate', desc: 'Proof of residence in the state', mandatory: true, status: 'missing', file: null, uploadDate: null, quality: null },
  { id: 4, name: 'Previous Year Marksheet', desc: 'Last exam result certificate', mandatory: true, status: 'verified', file: 'Marksheet_2025.pdf', uploadDate: '05 Sep 2026', quality: 100 },
  { id: 5, name: 'Aadhaar Card', desc: 'Valid Aadhaar card copy', mandatory: true, status: 'verified', file: 'Aadhaar_Ramesh.jpg', uploadDate: '05 Sep 2026', quality: 95 },
  { id: 6, name: 'Bank Passbook / Statement', desc: 'Account in student\'s name with IFSC', mandatory: true, status: 'quality_issue', file: 'Bank_Pass_blurry.jpg', uploadDate: '10 Sep 2026', quality: 42 },
  { id: 7, name: 'College / School Bonafide', desc: 'Current enrollment certificate', mandatory: true, status: 'missing', file: null, uploadDate: null, quality: null },
  { id: 8, name: 'Passport Size Photo', desc: 'Recent photograph (white background)', mandatory: false, status: 'verified', file: 'Photo_Ramesh.jpg', uploadDate: '05 Sep 2026', quality: 100 },
  { id: 9, name: 'Income Tax Return / Form 16', desc: 'If annual income > ₹2.5 Lakh', mandatory: false, status: 'missing', file: null, uploadDate: null, quality: null },
];

const statusConfig = {
  verified: { color: '#1B7A3E', bg: '#E8F5ED', icon: '✅', label: 'Verified' },
  pending_review: { color: '#1565C0', bg: '#E3F0FF', icon: '⏳', label: 'Under Review' },
  quality_issue: { color: '#C0392B', bg: '#FDECEA', icon: '⚠️', label: 'Quality Issue' },
  missing: { color: '#68738F', bg: '#F4F6FB', icon: '📤', label: 'Not Uploaded' },
};

export default function DocumentUpload() {
  const [docs, setDocs] = useState(REQUIRED_DOCS);
  const [dragOver, setDragOver] = useState(null);
  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [digilockerDone, setDigilockerDone] = useState(false);

  const handleFakeUpload = (id) => {
    setDocs(d => d.map(doc => doc.id === id
      ? {...doc, status:'pending_review', file:`document_${id}.pdf`, uploadDate: 'Today', quality: 92}
      : doc
    ));
  };

  const handleDigilocker = () => {
    setDigilockerLoading(true);
    setTimeout(() => {
      setDigilockerDone(true);
      setDigilockerLoading(false);
      setDocs(d => d.map(doc =>
        [1, 3, 5].includes(doc.id)
          ? {...doc, status:'verified', quality:100, file:`DigiLocker_${doc.id}.pdf`, uploadDate:'Today'}
          : doc
      ));
    }, 2000);
  };

  const verified = docs.filter(d => d.status === 'verified').length;
  const total = docs.filter(d => d.mandatory).length;
  const completePct = Math.round((verified / total) * 100);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Document Manager</h1>
        <p className="page-subtitle">Upload and verify all documents required for scholarship applications.</p>
      </div>

      {/* DigiLocker Banner */}
      <div style={{background:'linear-gradient(135deg, #003366, #1A5FAD)', borderRadius:12, padding:'20px 24px', marginBottom:20, display:'flex', alignItems:'center', gap:16}}>
        <div style={{fontSize:36}}>🔗</div>
        <div style={{flex:1}}>
          <div style={{fontSize:15, fontWeight:700, color:'white', marginBottom:4}}>Auto-fetch from DigiLocker</div>
          <div style={{fontSize:12, color:'rgba(255,255,255,0.7)'}}>Instantly import ST Certificate, Aadhaar, and Domicile Certificate from DigiLocker without manual upload.</div>
        </div>
        <button
          onClick={handleDigilocker}
          disabled={digilockerDone || digilockerLoading}
          style={{
            padding:'11px 22px', borderRadius:10, fontSize:13, fontWeight:700, border:'none', cursor:'pointer',
            background: digilockerDone ? '#1B7A3E' : 'white',
            color: digilockerDone ? 'white' : '#003366',
            display:'flex', alignItems:'center', gap:8, flexShrink:0,
            opacity: digilockerLoading ? 0.7 : 1
          }}
        >
          {digilockerLoading ? <><RefreshCw size={14} style={{animation:'spin 1s linear infinite'}}/> Fetching...</> :
            digilockerDone ? <>✅ Fetched from DigiLocker</> : <><Link size={14}/> Connect DigiLocker</>}
        </button>
      </div>

      {/* Progress Overview */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-body" style={{padding:'20px 24px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <div>
              <div style={{fontSize:14, fontWeight:700, color:'#003366'}}>Document Completeness</div>
              <div style={{fontSize:12, color:'#68738F', marginTop:2}}>{verified} of {total} mandatory documents verified</div>
            </div>
            <div style={{fontSize:28, fontWeight:900, color: completePct >= 80 ? '#1B7A3E' : '#D4800A'}}>{completePct}%</div>
          </div>
          <div className="progress-bar-wrap" style={{height:12}}>
            <div className="progress-bar" style={{width:`${completePct}%`, background: completePct >= 80 ? 'linear-gradient(90deg,#1B7A3E,#27AE60)' : 'linear-gradient(90deg,#D4800A,#F39C12)'}}/>
          </div>
          <div style={{display:'flex', gap:16, marginTop:12, flexWrap:'wrap'}}>
            {Object.entries(statusConfig).map(([key, val]) => {
              const count = docs.filter(d => d.status === key).length;
              return count > 0 ? (
                <div key={key} style={{display:'flex', alignItems:'center', gap:6, fontSize:12}}>
                  <span style={{width:8, height:8, borderRadius:'50%', background:val.color, display:'inline-block'}}/>
                  <span style={{color:'#68738F'}}>{val.label}: <strong style={{color:val.color}}>{count}</strong></span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Quality Issue Alert */}
      {docs.some(d => d.status === 'quality_issue') && (
        <div className="alert alert-error">
          <AlertCircle size={16}/>
          <div>
            <strong>1 document has a quality issue</strong> — Bank passbook photo is blurry. Please re-upload a clear, well-lit image.
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Required Documents</span>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-outline btn-sm">
              <Camera size={13}/> Photo Guide
            </button>
          </div>
        </div>
        <div style={{padding:'8px 0'}}>
          {docs.map((doc, i) => {
            const sc = statusConfig[doc.status];
            return (
              <div key={doc.id} style={{
                display:'flex', gap:14, alignItems:'center', padding:'14px 20px',
                borderBottom: i < docs.length-1 ? '1px solid #EFF1F7' : 'none',
                transition:'background 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.background='#F8F9FC'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                {/* Icon */}
                <div style={{width:44, height:44, borderRadius:10, background:sc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0}}>
                  {sc.icon}
                </div>

                {/* Info */}
                <div style={{flex:1}}>
                  <div style={{display:'flex', gap:6, alignItems:'center'}}>
                    <span style={{fontSize:13, fontWeight:700, color:'#1E2541'}}>{doc.name}</span>
                    {doc.mandatory && <span className="badge badge-red" style={{padding:'1px 6px', fontSize:10}}>Required</span>}
                    {!doc.mandatory && <span className="badge badge-navy" style={{padding:'1px 6px', fontSize:10}}>Optional</span>}
                  </div>
                  <div style={{fontSize:11, color:'#68738F', marginTop:2}}>{doc.desc}</div>
                  {doc.file && (
                    <div style={{display:'flex', gap:8, alignItems:'center', marginTop:4}}>
                      <span style={{fontSize:11, color:'#1A5FAD', fontWeight:500}}>📎 {doc.file}</span>
                      {doc.uploadDate && <span style={{fontSize:10, color:'#9AA3BC'}}>· {doc.uploadDate}</span>}
                    </div>
                  )}
                  {/* Quality bar */}
                  {doc.quality !== null && (
                    <div style={{display:'flex', alignItems:'center', gap:8, marginTop:5}}>
                      <div className="progress-bar-wrap" style={{width:100}}>
                        <div className="progress-bar" style={{
                          width:`${doc.quality}%`,
                          background: doc.quality >= 80 ? 'var(--green-success)' : doc.quality >= 60 ? '#F39C12' : '#C0392B'
                        }}/>
                      </div>
                      <span style={{fontSize:10, color: doc.quality >= 80 ? '#1B7A3E' : '#C0392B', fontWeight:700}}>
                        {doc.quality}% Quality
                      </span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div style={{flexShrink:0}}>
                  <span style={{padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:sc.bg, color:sc.color}}>
                    {sc.label}
                  </span>
                </div>

                {/* Actions */}
                <div style={{display:'flex', gap:6, flexShrink:0}}>
                  {doc.file && (
                    <button className="btn btn-outline btn-sm btn-icon" title="View">
                      <Eye size={13}/>
                    </button>
                  )}
                  {doc.status === 'missing' || doc.status === 'quality_issue' ? (
                    <div
                      style={{
                        padding:'7px 12px', borderRadius:7, fontSize:12, fontWeight:700,
                        background:'#003366', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:6
                      }}
                      onClick={() => handleFakeUpload(doc.id)}
                    >
                      <Upload size={12}/> {doc.status === 'quality_issue' ? 'Re-upload' : 'Upload'}
                    </div>
                  ) : (
                    <button className="btn btn-outline btn-sm btn-icon" title="Delete" style={{color:'#C0392B'}}
                      onClick={() => setDocs(d => d.map(x => x.id === doc.id ? {...x, status:'missing', file:null, uploadDate:null, quality:null} : x))}
                    >
                      <Trash2 size={12}/>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="card" style={{marginTop:16}}>
        <div className="card-header">
          <span className="card-title">📸 Document Photo Tips</span>
        </div>
        <div className="card-body">
          <div className="grid-2" style={{gap:12}}>
            {[
              {tip:'Use good natural lighting — avoid shadows on the document', icon:'☀️'},
              {tip:'Keep the camera steady — blurry images will be rejected', icon:'📷'},
              {tip:'Include all four corners of the document in the frame', icon:'🔲'},
              {tip:'Ensure all text is clearly readable before uploading', icon:'🔤'},
            ].map((t, i) => (
              <div key={i} style={{display:'flex', gap:10, padding:'10px', background:'#F8F9FC', borderRadius:8, fontSize:12, color:'#4B5470'}}>
                <span>{t.icon}</span> {t.tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
