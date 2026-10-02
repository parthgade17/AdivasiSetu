import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, ChevronRight, Phone, MapPin, BookOpen } from 'lucide-react';

const STUDENTS = [
  { id: 1, name: 'Priya Bhavale', phone: '9876543210', village: 'Dhanora, Gadchiroli', tribe: 'Gond', class: "Bachelor's Degree (UG)", income: '₹1.2L/yr', status: 'complete', applications: 2 },
  { id: 2, name: 'Raju Meshram', phone: '9765432109', village: 'Aheri, Gadchiroli', tribe: 'Gond', class: 'Class 9–10', income: '₹80K/yr', status: 'incomplete', applications: 1 },
  { id: 3, name: 'Kavita Atram', phone: '—', village: 'Korpana, Chandrapur', tribe: 'Kolam', class: 'Class 11–12', income: '₹1.5L/yr', status: 'not_started', applications: 0 },
];

export default function AssistedMode() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showNew, setShowNew] = useState(false);

  const filtered = STUDENTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">👨‍🏫 Assisted Application Mode</h1>
        <p className="page-subtitle">Apply on behalf of students who don't have phones or internet access.</p>
      </div>

      <div className="assisted-banner">
        <span style={{fontSize:20}}>ℹ️</span>
        <div>
          <strong>Assisted Mode</strong> — You are logged in as <strong>Teacher Ramesh Wankhede</strong> (CSC ID: MH-GC-0042).
          All applications submitted here will be linked to your CSC ID for audit purposes.
        </div>
      </div>

      <div className="grid-2" style={{alignItems:'flex-start'}}>
        {/* Student List */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Student List</span>
            <button className="btn btn-saffron btn-sm" onClick={() => setShowNew(true)}>
              <UserPlus size={13}/> Add Student
            </button>
          </div>
          <div style={{padding:'12px 16px', borderBottom:'1px solid #EFF1F7'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, padding:'8px 12px', border:'1.5px solid #DDE1EE', borderRadius:8, background:'#F8F9FC'}}>
              <Search size={14} color="#9AA3BC"/>
              <input
                placeholder="Search student name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{border:'none', background:'none', fontSize:13, flex:1, color:'#1E2541', outline:'none'}}
              />
            </div>
          </div>

          {showNew && (
            <div style={{padding:'14px 16px', background:'#F0F4FF', borderBottom:'1px solid #DDE1EE'}} className="fade-in">
              <div style={{fontSize:13, fontWeight:700, color:'#003366', marginBottom:10}}>Add New Student</div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                <input className="form-control" style={{flex:1, minWidth:140}} placeholder="Student name" value={newName} onChange={e => setNewName(e.target.value)}/>
                <input className="form-control" style={{flex:1, minWidth:120}} placeholder="Phone (optional)" value={newPhone} onChange={e => setNewPhone(e.target.value)}/>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setShowNew(false); setNewName(''); setNewPhone(''); }}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {filtered.map(s => (
            <div
              key={s.id}
              style={{
                padding:'14px 16px', cursor:'pointer', borderBottom:'1px solid #EFF1F7', transition:'background 0.15s',
                background: selected?.id === s.id ? '#F0F4FF' : 'white',
                borderLeft: selected?.id === s.id ? '3px solid #003366' : '3px solid transparent'
              }}
              onClick={() => setSelected(s)}
            >
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:14, fontWeight:700, color:'#1E2541'}}>{s.name}</div>
                  <div style={{fontSize:12, color:'#68738F', display:'flex', alignItems:'center', gap:6, marginTop:2}}>
                    <MapPin size={11}/> {s.village} · {s.tribe}
                  </div>
                  {s.phone !== '—' && (
                    <div style={{fontSize:12, color:'#68738F', display:'flex', alignItems:'center', gap:6, marginTop:2}}>
                      <Phone size={11}/> {s.phone}
                    </div>
                  )}
                </div>
                <div style={{textAlign:'right'}}>
                  <span className={`badge ${s.status === 'complete' ? 'badge-green' : s.status === 'incomplete' ? 'badge-amber' : 'badge-navy'}`}>
                    {s.status === 'complete' ? '✓ Done' : s.status === 'incomplete' ? 'In Progress' : 'Not Started'}
                  </span>
                  {s.applications > 0 && (
                    <div style={{fontSize:11, color:'#68738F', marginTop:4}}>{s.applications} applied</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Panel */}
        <div>
          {selected ? (
            <div className="fade-in">
              <div className="card" style={{marginBottom:16}}>
                <div className="card-header">
                  <span className="card-title">👤 {selected.name}</span>
                  <span className={`badge ${selected.status === 'complete' ? 'badge-green' : selected.status === 'incomplete' ? 'badge-amber' : 'badge-navy'}`}>
                    {selected.status === 'complete' ? 'Complete' : selected.status === 'incomplete' ? 'Incomplete' : 'Not Started'}
                  </span>
                </div>
                <div className="card-body">
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16}}>
                    {[
                      {label:'Village / District', val:selected.village},
                      {label:'Tribe', val:selected.tribe},
                      {label:'Current Class', val:selected.class},
                      {label:'Family Income', val:selected.income},
                    ].map(r => (
                      <div key={r.label} style={{padding:'10px 12px', background:'#F8F9FC', borderRadius:8}}>
                        <div style={{fontSize:10, color:'#9AA3BC', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2}}>{r.label}</div>
                        <div style={{fontSize:13, fontWeight:600, color:'#1E2541'}}>{r.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Eligible schemes for this student */}
                  <div style={{fontSize:12, fontWeight:700, color:'#003366', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px'}}>Eligible Schemes</div>
                  {[
                    {name:'Pre-Matric Scholarship (ST)', amount:'₹6,500', deadline:'31 Oct 2026'},
                    {name:'MahaDBT – Maharashtra', amount:'₹18,000', deadline:'31 Oct 2026'},
                  ].map((sc, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', border:'1.5px solid rgba(27,122,62,0.2)', borderRadius:8, marginBottom:8, background:'rgba(27,122,62,0.03)'}}>
                      <div>
                        <div style={{fontSize:13, fontWeight:600, color:'#003366'}}>{sc.name}</div>
                        <div style={{fontSize:11, color:'#D4800A', marginTop:2}}>⏰ {sc.deadline}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:15, fontWeight:800, color:'#E55A0A'}}>{sc.amount}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{display:'flex', gap:8, marginTop:16, flexWrap:'wrap'}}>
                    <button className="btn btn-saffron" onClick={() => navigate('/eligibility')}>
                      <BookOpen size={14}/> Start Application
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate('/documents')}>
                      Upload Documents
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="card">
                <div className="card-header"><span className="card-title">📝 Notes</span></div>
                <div className="card-body">
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Add notes about this student's case..."
                    style={{resize:'vertical'}}
                  />
                  <button className="btn btn-primary btn-sm" style={{marginTop:10}}>Save Notes</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{padding:'60px 32px', textAlign:'center', background:'white', borderRadius:12, border:'1px solid #DDE1EE'}}>
              <div style={{fontSize:48, marginBottom:16}}>👈</div>
              <div style={{fontSize:15, fontWeight:700, color:'#003366', marginBottom:6}}>Select a Student</div>
              <div style={{fontSize:13, color:'#68738F'}}>Click on a student from the list to view their profile and apply on their behalf.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
