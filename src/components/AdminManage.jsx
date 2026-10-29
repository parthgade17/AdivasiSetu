import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Power } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

const COURSES = ['Class 1–5 (Pre-Primary)', 'Class 6–8', 'Class 9–10', 'Class 11–12', 'Diploma / ITI',
  "Bachelor's Degree (UG)", "Master's Degree (PG)", 'Ph.D / Research', 'Other'];
const DOCS = {
  st_certificate: 'ST Certificate', income_certificate: 'Income Certificate', domicile: 'Domicile Certificate',
  marksheet: 'Marksheet', aadhaar: 'Aadhaar Card', bank_passbook: 'Bank Passbook', bonafide: 'Bonafide',
  photo: 'Passport Photo', itr: 'ITR / Form 16',
};
const EMPTY = {
  name: '', deadline: '', amount_value: 0, ministry: '', amount: '', period: 'per year', type: 'central', category: '',
  states: 'All States / UTs', link: '', description: '', criteria: [], documents: ['st_certificate', 'aadhaar'],
  courses: [], max_income: '', allowed_states: [], active: true,
};

const toForm = (s) => ({
  name: s.name, deadline: s.deadlineIso, amount_value: s.amountValue, ministry: s.ministry || '', amount: s.amount || '',
  period: s.period || 'per year', type: s.type || 'central', category: s.category || '', states: s.states || '',
  link: s.link || '', description: s.description || '', criteria: s.criteria || [], documents: s.documentKeys || [],
  courses: s.rules?.courses || [], max_income: s.rules?.max_income || '',
  allowed_states: Array.isArray(s.rules?.states) ? s.rules.states : [], active: s.active,
});

function Field({ label, children }) {
  return (
    <label className="form-group" style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#333D5C', marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  );
}

function SchemeForm({ initial, onCancel, onSaved }) {
  const { toast } = useApp();
  const [f, setF] = useState(initial.form);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const toggle = (k, v) => setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((i) => i !== v) : [...x[k], v] }));

  const save = async () => {
    setBusy(true);
    try {
      await api.adminSaveScheme(initial.id, {
        ...f, amount_value: Number(f.amount_value) || 0, max_income: f.max_income ? Number(f.max_income) : null,
      });
      toast(initial.id ? 'Scheme updated' : 'Scheme created', 'success');
      onSaved();
    } catch (e) { toast(e.message, 'error'); }
    setBusy(false);
  };

  return (
    <div style={{ padding: 16, background: '#F8F9FC', borderRadius: 10, marginBottom: 16 }}>
      <div className="grid-2" style={{ gap: 12 }}>
        <Field label="Scheme name *"><input className="form-control" value={f.name} onChange={set('name')} /></Field>
        <Field label="Deadline *"><input className="form-control" type="date" value={f.deadline} onChange={set('deadline')} /></Field>
        <Field label="Ministry / department"><input className="form-control" value={f.ministry} onChange={set('ministry')} /></Field>
        <Field label="Category (e.g. Pre-Matric)"><input className="form-control" value={f.category} onChange={set('category')} /></Field>
        <Field label="Amount shown to students"><input className="form-control" value={f.amount} onChange={set('amount')} placeholder="₹3,500 – ₹7,000" /></Field>
        <Field label="Amount used for payment (₹)"><input className="form-control" type="number" min="0" value={f.amount_value} onChange={set('amount_value')} /></Field>
        <Field label="Type">
          <select className="form-control" value={f.type} onChange={set('type')}><option value="central">Central</option><option value="state">State</option></select>
        </Field>
        <Field label="Maximum family income (₹, blank = no limit)"><input className="form-control" type="number" min="0" value={f.max_income} onChange={set('max_income')} /></Field>
        <Field label="Only for these states (comma separated, blank = all)">
          <input className="form-control" value={f.allowed_states.join(', ')}
            onChange={(e) => setF((x) => ({ ...x, allowed_states: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
        </Field>
        <Field label="Official link"><input className="form-control" value={f.link} onChange={set('link')} placeholder="https://" /></Field>
      </div>
      <Field label="Description"><textarea className="form-control" rows={2} value={f.description} onChange={set('description')} /></Field>
      <Field label="Eligibility criteria shown to students (one per line)">
        <textarea className="form-control" rows={3} value={f.criteria.join('\n')}
          onChange={(e) => setF((x) => ({ ...x, criteria: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) }))} />
      </Field>
      <Field label="Courses covered (none ticked = all)">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
          {COURSES.map((c) => (
            <label key={c} style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={f.courses.includes(c)} onChange={() => toggle('courses', c)} /> {c}
            </label>
          ))}
        </div>
      </Field>
      <Field label="Required documents">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
          {Object.entries(DOCS).map(([k, n]) => (
            <label key={k} style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={f.documents.includes(k)} onChange={() => toggle('documents', k)} /> {n}
            </label>
          ))}
        </div>
      </Field>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-outline btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={busy || !f.name.trim() || !f.deadline} onClick={save}>
          {busy ? 'Saving…' : initial.id ? 'Save changes' : 'Create scheme'}
        </button>
      </div>
    </div>
  );
}

export default function AdminManage() {
  const { toast } = useApp();
  const [schemes, setSchemes] = useState([]);
  const [editing, setEditing] = useState(null); // { id, form }
  const [ops, setOps] = useState([]);
  const [op, setOp] = useState({ phone: '', name: '' });

  const load = useCallback(() => {
    api.adminSchemes().then(setSchemes).catch((e) => toast(e.message, 'error'));
    api.adminOperators().then(setOps).catch((e) => toast(e.message, 'error'));
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn, msg) => { try { await fn(); if (msg) toast(msg, 'success'); load(); } catch (e) { toast(e.message, 'error'); } };

  return (
    <>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title">🎓 Manage schemes</span>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing({ id: null, form: EMPTY })}><Plus size={13} /> New scheme</button>
        </div>
        <div className="card-body">
          {editing && <SchemeForm key={editing.id || 'new'} initial={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
          <div className="table-wrapper">
            <table className="table" style={{ width: '100%', fontSize: 13 }}>
              <thead><tr><th align="left">Scheme</th><th align="left">Deadline</th><th align="left">Status</th><th /></tr></thead>
              <tbody>
                {schemes.map((s) => (
                  <tr key={s.id}>
                    <td style={{ padding: '8px 4px' }}><strong>{s.name}</strong><div style={{ fontSize: 11, color: '#68738F' }}>{s.ministry} · {s.amount}</div></td>
                    <td>{s.deadline}</td>
                    <td><span className={`badge ${s.active ? 'badge-green' : 'badge-red'}`}>{s.active ? 'Active' : 'Hidden'}</span></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="btn btn-outline btn-sm btn-icon" title="Edit" aria-label={`Edit ${s.name}`} onClick={() => setEditing({ id: s.id, form: toForm(s) })}><Pencil size={12} /></button>{' '}
                      <button className="btn btn-outline btn-sm btn-icon" title={s.active ? 'Hide from students' : 'Show to students'} aria-label="Toggle scheme"
                        onClick={() => act(() => api.adminToggleScheme(s.id))}><Power size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><span className="card-title">👨‍🏫 CSC operators and teachers</span></div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <input className="form-control" style={{ maxWidth: 180 }} placeholder="10-digit mobile" inputMode="numeric" maxLength={10}
              value={op.phone} onChange={(e) => setOp({ ...op, phone: e.target.value.replace(/\D/g, '') })} />
            <input className="form-control" style={{ maxWidth: 220 }} placeholder="Name (optional)" value={op.name} onChange={(e) => setOp({ ...op, name: e.target.value })} />
            <button className="btn btn-primary btn-sm" disabled={op.phone.length !== 10}
              onClick={() => act(async () => { await api.adminAddOperator(op); setOp({ phone: '', name: '' }); }, 'Operator added — they can now sign in with an OTP')}>
              <Plus size={13} /> Add operator
            </button>
          </div>
          {ops.length === 0 && <div style={{ fontSize: 13, color: '#68738F' }}>No operators registered yet.</div>}
          {ops.map((o) => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #EEF0F6', fontSize: 13 }}>
              <div><strong>{o.name}</strong> · {o.phone} <span style={{ color: '#68738F' }}>({o.cscId})</span></div>
              <button className={`btn btn-sm ${o.active ? 'btn-outline' : 'btn-saffron'}`} onClick={() => act(() => api.adminToggleOperator(o.id))}>
                {o.active ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
