import { useRef, useState } from 'react';
import {
  Upload, AlertCircle, Trash2, RefreshCw, Link, Eye,
  CheckCircle2, Clock, AlertTriangle, UploadCloud, FileText,
  Camera, Sun, Maximize2, ShieldCheck, Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const statusConfig = {
  verified: { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', icon: <CheckCircle2 size={16}/>, label: 'Verified' },
  pending_review: { color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', icon: <Clock size={16}/>, label: 'Under Review' },
  quality_issue: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: <AlertTriangle size={16}/>, label: 'Quality Issue' },
  missing: { color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', icon: <UploadCloud size={16}/>, label: 'Not Uploaded' },
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
    const tab = window.open('', '_blank');
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
        <p className="page-subtitle">Upload verified certificates or sync directly via DigiLocker for instant scheme approval.</p>
      </div>

      {/* DigiLocker Banner */}
      <div style={{background:'linear-gradient(135deg, #002147 0%, #0A3A6B 50%, #0B5299 100%)', borderRadius:16, padding:'24px 28px', marginBottom:22, display:'flex', alignItems:'center', gap:20, color:'white', boxShadow:'0 4px 18px rgba(0,33,71,0.15)', flexWrap:'wrap'}}>
        <div style={{width:54, height:54, borderRadius:14, background:'rgba(255,255,255,0.12)', border:'1.5px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#FFD700', flexShrink:0}}>
          <ShieldCheck size={28} />
        </div>
        <div style={{flex:1, minWidth:260}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,215,0,0.15)', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, color:'#FFD700', marginBottom:6}}>
            <Sparkles size={12}/> OFFICIAL INTEGRATION
          </div>
          <div style={{fontSize:16, fontWeight:800, marginBottom:3}}>{t('digiLockerBanner')}</div>
          <div style={{fontSize:12.5, color:'rgba(255,255,255,0.85)', lineHeight:1.5}}>{t('digiLockerDesc')}</div>
        </div>
        <button
          onClick={handleDigilocker}
          disabled={digilockerDone || digilockerLoading}
          style={{
            padding:'12px 24px', borderRadius:12, fontSize:13.5, fontWeight:800, border:'none', cursor:'pointer',
            background: digilockerDone ? 'var(--green-success)' : 'white',
            color: digilockerDone ? 'white' : '#002147',
            display:'flex', alignItems:'center', gap:8, flexShrink:0,
            boxShadow:'0 4px 14px rgba(0,0,0,0.15)',
            opacity: digilockerLoading ? 0.7 : 1,
            transition:'all 0.2s'
          }}
        >
          {digilockerLoading ? <><RefreshCw size={15} className="spin"/> Fetching…</> :
            digilockerDone ? <><CheckCircle2 size={16}/> {t('verified')}</> : <><Link size={15}/> {t('connectDigiLocker')}{config.digilockerMode === 'mock' ? ' (simulated)' : ''}</>}
        </button>
      </div>

      {/* Progress Overview */}
      <div className="card" style={{marginBottom:22, borderRadius:14}}>
        <div className="card-body" style={{padding:'20px 24px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <div>
              <div style={{fontSize:15, fontWeight:800, color:'#002147'}}>Document Completeness</div>
              <div style={{fontSize:12.5, color:'#64748B', marginTop:3}}>
                {verified} of {total} mandatory documents verified
              </div>
            </div>
            <div style={{fontSize:28, fontWeight:900, color: completePct >= 80 ? 'var(--green-success)' : 'var(--amber-warn)'}}>
              {completePct}%
            </div>
          </div>

          <div className="progress-bar-wrap" style={{height:10, borderRadius:6}}>
            <div
              className="progress-bar"
              style={{
                width:`${completePct}%`,
                background: completePct >= 80 ? 'linear-gradient(90deg,#16A34A,#22C55E)' : 'linear-gradient(90deg,#D97706,#F59E0B)'
              }}
            />
          </div>

          <div style={{display:'flex', gap:18, marginTop:14, flexWrap:'wrap'}}>
            {Object.entries(statusConfig).map(([key, val]) => {
              const count = docs.filter(d => d.status === key).length;
              return count > 0 ? (
                <div key={key} style={{display:'flex', alignItems:'center', gap:6, fontSize:12.5}}>
                  <span style={{width:8, height:8, borderRadius:'50%', background:val.color, display:'inline-block'}}/>
                  <span style={{color:'#64748B'}}>{val.label}: <strong style={{color:val.color}}>{count}</strong></span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Quality Issue Alert */}
      {issues.length > 0 && (
        <div className="alert alert-error" style={{borderRadius:12, marginBottom:20}}>
          <AlertCircle size={18} style={{flexShrink:0, marginTop:1}}/>
          <div style={{fontSize:13}}>
            <strong>{issues.length} document{issues.length > 1 ? 's have' : ' has'} quality issues:</strong>{' '}
            {issues.map(d => `${d.name}: ${(d.issues || []).join(' ') || 'unclear photo'}`).join(' · ')}. Please re-upload a clear, well-lit image.
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="card" style={{borderRadius:14, overflow:'hidden'}}>
        <div className="card-header">
          <span className="card-title">Required Supporting Documents</span>
        </div>
        <div>
          {docs.map((doc, i) => {
            const sc = statusConfig[doc.status] || statusConfig.missing;
            return (
              <div
                key={doc.id}
                style={{
                  display:'flex', gap:16, alignItems:'center', padding:'16px 22px',
                  borderBottom: i < docs.length-1 ? '1px solid #F1F5F9' : 'none',
                  transition:'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background='#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                {/* Icon */}
                <div style={{width:44, height:44, borderRadius:12, background:sc.bg, border:`1px solid ${sc.border}`, color:sc.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  {sc.icon}
                </div>

                {/* Info */}
                <div style={{flex:1}}>
                  <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                    <span style={{fontSize:13.5, fontWeight:700, color:'#002147'}}>{doc.name}</span>
                    {doc.mandatory && <span className="badge badge-red" style={{padding:'2px 8px', fontSize:10.5}}>Required</span>}
                    {!doc.mandatory && <span className="badge badge-navy" style={{padding:'2px 8px', fontSize:10.5}}>Optional</span>}
                  </div>
                  <div style={{fontSize:12, color:'#64748B', marginTop:3}}>{doc.desc}</div>
                  {doc.file && (
                    <div style={{display:'flex', gap:8, alignItems:'center', marginTop:4}}>
                      <span style={{fontSize:11.5, color:'#0284C7', fontWeight:600}}>📎 {doc.file}</span>
                      {doc.uploadDate && <span style={{fontSize:11, color:'#94A3B8'}}>· {doc.uploadDate}</span>}
                    </div>
                  )}
                  {/* Quality rating */}
                  {doc.quality != null && (
                    <div style={{display:'flex', alignItems:'center', gap:8, marginTop:5}}>
                      <div className="progress-bar-wrap" style={{width:100, height:6}}>
                        <div className="progress-bar" style={{
                          width:`${doc.quality}%`,
                          background: doc.quality >= 80 ? 'var(--green-success)' : doc.quality >= 60 ? '#F59E0B' : '#DC2626'
                        }}/>
                      </div>
                      <span style={{fontSize:11, color: doc.quality >= 80 ? '#16A34A' : '#DC2626', fontWeight:700}}>
                        {doc.quality}% Quality
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div style={{flexShrink:0}}>
                  <span style={{padding:'4px 12px', borderRadius:20, fontSize:11.5, fontWeight:700, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`}}>
                    {sc.label}
                  </span>
                </div>

                {/* Actions */}
                <div style={{display:'flex', gap:8, flexShrink:0}}>
                  {doc.hasFile && (
                    <button className="btn btn-outline btn-sm btn-icon" title="View document" aria-label={`View ${doc.name}`} onClick={() => viewFile(doc.id)}>
                      <Eye size={14}/>
                    </button>
                  )}
                  {doc.status === 'missing' || doc.status === 'quality_issue' ? (
                    <button
                      disabled={uploading === doc.id}
                      className="btn btn-primary btn-sm"
                      onClick={() => pickFile(doc.id)}
                    >
                      {uploading === doc.id ? (
                        <><RefreshCw size={13} className="spin"/> Checking…</>
                      ) : (
                        <><Upload size={13}/> {doc.status === 'quality_issue' ? 'Re-upload' : 'Upload'}</>
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm btn-icon"
                      title="Remove"
                      aria-label={`Remove ${doc.name}`}
                      style={{color:'#DC2626'}}
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <Trash2 size={13}/>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo Upload Tips */}
      <div className="card" style={{marginTop:20, borderRadius:14}}>
        <div className="card-header">
          <span className="card-title">📸 Photo & Document Upload Guidelines</span>
        </div>
        <div className="card-body">
          <div className="grid-2" style={{gap:14}}>
            {[
              {tip:'Use clean natural lighting — avoid harsh shadows or flash reflections', icon: Sun, color: '#D97706', bg: '#FFFBEB'},
              {tip:'Keep the camera steady — blurry or distorted scans cannot be verified', icon: Camera, color: '#0284C7', bg: '#F0F9FF'},
              {tip:'Capture all four edges and corners of the certificate within frame', icon: Maximize2, color: '#16A34A', bg: '#F0FDF4'},
              {tip:'Verify all text, stamps, barcode, and names are clearly legible', icon: FileText, color: '#7C3AED', bg: '#FAF5FF'},
            ].map((t, i) => (
              <div key={i} style={{display:'flex', gap:12, padding:'12px 14px', background:'#F8FAFC', borderRadius:10, fontSize:12.5, color:'#334155', border:'1px solid #E2E8F0', alignItems:'center'}}>
                <div style={{width:32, height:32, borderRadius:8, background:t.bg, color:t.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <t.icon size={16} />
                </div>
                <span>{t.tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
