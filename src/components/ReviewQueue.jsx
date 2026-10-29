import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, XCircle, MapPin, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

const REASONS = ['Expired Income Certificate', 'Blurry/Invalid Documents', 'Income Limit Exceeded',
  'Duplicate Application', 'Incomplete Form', 'Ineligible Course', 'Others'];
const STAGE_LABEL = {
  submitted: 'Submitted', institute_verified: 'Institute verified', state_verified: 'State verified', approved: 'Sanctioned',
};
const NEXT_ACTION = {
  submitted: 'Verify (institute)', institute_verified: 'Verify (state)', state_verified: 'Sanction', approved: 'Disburse',
};

export default function ReviewQueue({ onChange }) {
  const { online, toast } = useApp();
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState(REASONS[0]);

  const load = useCallback(async () => {
    if (!online) return;
    try {
      const open = await api.adminApplications('open');
      const all = await api.adminApplications('all');
      const sanctioned = all.filter(a => a.stage === 'approved');
      setRows([...open, ...sanctioned]);
    } catch (e) { toast(e.message, 'error'); }
  }, [online, toast]);
  useEffect(() => { load(); }, [load]);

  const act = async (code, fn, msg) => {
    setBusy(code);
    try { await fn(); toast(msg, 'success'); await load(); onChange?.(); }
    catch (e) { toast(e.message, 'error'); }
    setBusy(null);
  };

  return (
    <div className="card" style={{marginBottom:20}}>
      <div className="card-header">
        <span className="card-title">Applications awaiting action</span>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <span className="badge badge-amber">{rows.length} open</span>
          <button className="btn btn-outline btn-sm btn-icon" onClick={load} aria-label="Reload queue"><RefreshCw size={13}/></button>
        </div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>ID</th><th>Student / Scheme</th><th>District</th><th>Stage</th><th>Documents</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{textAlign:'center', color:'#68738F', padding:20, fontSize:13}}>No applications waiting. New submissions from students and CSC operators appear here.</td></tr>
            )}
            {rows.map(a => (
              <tr key={a.id}>
                <td style={{fontFamily:'monospace', fontSize:11, color:'#9AA3BC'}}>
                  {a.id}{a.assisted && <div style={{fontFamily:'inherit'}}><span className="badge badge-blue" style={{fontSize:9}}>CSC</span></div>}
                </td>
                <td>
                  <div style={{fontWeight:600, color:'#1E2541', fontSize:13}}>{a.name}</div>
                  <div style={{fontSize:11, color:'#9AA3BC'}}>{a.scheme} · {a.submittedDate}</div>
                </td>
                <td><div style={{display:'flex', alignItems:'center', gap:4, fontSize:12}}><MapPin size={11} color="#9AA3BC"/> {a.district}</div></td>
                <td><span className="badge badge-blue">{STAGE_LABEL[a.stage] || a.stage}</span></td>
                <td style={{fontSize:12, color: a.documents.length >= 5 ? '#1B7A3E' : '#D4800A'}}>{a.documents.length} uploaded</td>
                <td>
                  {rejecting === a.id ? (
                    <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                      <select className="form-control" style={{fontSize:12, padding:'4px 8px', width:'auto'}} value={reason} onChange={e => setReason(e.target.value)}>
                        {REASONS.map(r => <option key={r}>{r}</option>)}
                      </select>
                      <button className="btn btn-sm" style={{background:'#C0392B', color:'white'}} disabled={busy === a.id}
                        onClick={() => { setRejecting(null); act(a.id, () => api.adminReject(a.id, reason), `${a.id} rejected — student notified`); }}>
                        Confirm
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => setRejecting(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                      <button className="btn btn-sm" style={{background:'#1B7A3E', color:'white'}} disabled={busy === a.id}
                        onClick={() => act(a.id, () => api.adminAdvance(a.id), `${a.id}: ${NEXT_ACTION[a.stage]} done — student notified`)}>
                        <CheckCircle size={12}/> {NEXT_ACTION[a.stage]}
                      </button>
                      <button className="btn btn-outline btn-sm" style={{color:'#C0392B'}} onClick={() => setRejecting(a.id)}>
                        <XCircle size={12}/> Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
