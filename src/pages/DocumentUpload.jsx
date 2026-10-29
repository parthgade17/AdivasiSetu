import { useRef, useState } from 'react';
import { Upload, AlertCircle, Trash2, RefreshCw, Link, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const statusConfig = {
  verified: { color: '#1B7A3E', bg: '#E8F5ED', icon: '✅', label: 'Verified' },
  pending_review: { color: '#1565C0', bg: '#E3F0FF', icon: '⏳', label: 'Under Review' },
  quality_issue: { color: '#C0392B', bg: '#FDECEA', icon: '⚠️', label: 'Quality Issue' },
  missing: { color: '#68738F', bg: '#F4F6FB', icon: '📤', label: 'Not Uploaded' },
};

export default function DocumentUpload() {
  const { documents: docs, uploadDocument, fetchDigiLocker, deleteDocument, toast, t, studentParams, online, config } = useApp();
  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [uploading, setUploading] = useState(null);
  const fileInput = useRef(null);
  const pendingType = useRef(null);
  const digilockerDone = docs.some(d => d.source === 'digilocker');

  const pickFile = (docType) => { pendingType.current = docType; fileInput.current?.click(); };

  const onFileChosen = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const docType = pendingType.current;
    if (!file || !docType) return;
    setUploading(docType);
    const r = await uploadDocument(docType, file);
    setUploading(null);
    if (!r) return;
    if (r.status === 'quality_issue') toast(`Photo quality ${r.quality}%: ${r.issues.join(' ')}`, 'error');
    else if (r.status === 'verified') toast(`Looks good — ${r.quality}% quality`, 'success');
    else toast(`Uploaded (${r.quality}% quality). It will be reviewed.`, 'info');
  };

  const viewFile = async (docType) => {
    if (!online) { toast(t('needsInternet'), 'error'); return; }
    const tab = window.open('', '_blank'); // open first so the popup blocker allows it
    try {
      const blob = await api.documentFile(docType, studentParams || {});
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url; else window.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) { tab?.close(); toast(e.message, 'error'); }
  };

  const handleDigilocker = async () => {
    setDigilockerLoading(true);
    if (await fetchDigiLocker()) toast('ST certificate, domicile and Aadhaar fetched from DigiLocker', 'success');
    setDigilockerLoading(false);
  };

  const issues = docs.filter(d => d.status === 'quality_issue');
  const verified = docs.filter(d => d.mandatory && d.status === 'verified').length;
  const total = docs.filter(d => d.mandatory).length || 1;
  const completePct = Math.round((verified / total) * 100);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('documents')}</h1>
        <input ref={fileInput} type="file" accept="image/*,application/pdf" capture="environment" className="file-input-hidden" onChange={onFileChosen} aria-hidden="true" tabIndex={-1}/>
        <p className="page-subtitle">Upload and verify all documents required for scholarship applications.</p>
      </div>

      {/* DigiLocker Banner */}
      <div style={{background:'linear-gradient(135deg, #003366, #1A5FAD)', borderRadius:12, padding:'20px 24px', marginBottom:20, display:'flex', alignItems:'center', gap:16}}>
        <div style={{fontSize:36}}>🔗</div>
        <div style={{flex:1}}>
          <div style={{fontSize:15, fontWeight:700, color:'white', marginBottom:4}}>{t('digiLockerBanner')}</div>
          <div style={{fontSize:12, color:'rgba(255,255,255,0.7)'}}>{t('digiLockerDesc')}</div>
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
          {digilockerLoading ? <><RefreshCw size={14} className="spin"/> Loading…</> :
            digilockerDone ? <>✅ {t('verified')}</> : <><Link size={14}/> {t('connectDigiLocker')}{config.digilockerMode === 'mock' ? ' (simulated)' : ''}</>}
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
      {issues.length > 0 && (
        <div className="alert alert-error">
          <AlertCircle size={16}/>
          <div>
            <strong>{issues.length} document{issues.length > 1 ? 's have' : ' has'} a quality issue</strong> —{' '}
            {issues.map(d => `${d.name}: ${(d.issues || []).join(' ') || 'unclear photo'}`).join(' · ')}. Please re-upload a clear, well-lit image.
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Required Documents</span>
          <div style={{display:'flex', gap:8}}>

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
                  {doc.quality != null && (
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
                  {doc.hasFile && (
                    <button className="btn btn-outline btn-sm btn-icon" title="View file" aria-label={`View ${doc.name}`} onClick={() => viewFile(doc.id)}>
                      <Eye size={12}/>
                    </button>
                  )}
                  {doc.status === 'missing' || doc.status === 'quality_issue' ? (
                    <button
                      disabled={uploading === doc.id}
                      style={{
                        padding:'7px 12px', borderRadius:7, fontSize:12, fontWeight:700, border:'none',
                        background:'#003366', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:6
                      }}
                      onClick={() => pickFile(doc.id)}
                    >
                      {uploading === doc.id ? <><RefreshCw size={12} className="spin"/> Checking…</> :
                        <><Upload size={12}/> {doc.status === 'quality_issue' ? 'Re-upload' : 'Upload'}</>}
                    </button>
                  ) : (
                    <button className="btn btn-outline btn-sm btn-icon" title="Remove" aria-label={`Remove ${doc.name}`} style={{color:'#C0392B'}}
                      onClick={() => deleteDocument(doc.id)}
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
