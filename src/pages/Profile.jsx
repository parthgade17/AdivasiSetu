import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Edit3, Save, CheckCircle, User, BookOpen, Home, CreditCard, Shield, Link, Smartphone, Building2, Globe, UserCheck } from 'lucide-react';

const SECTIONS = ['Personal', 'Academic', 'Financial', 'Bank Details'];

const completenessItems = [
  {key:'name', label:'Full Name'},
  {key:'aadhaar', label:'Aadhaar'},
  {key:'tribe', label:'Tribe'},
  {key:'course', label:'Course'},
  {key:'income', label:'Income'},
  {key:'accountNo', label:'Bank Account'},
  {key:'phone', label:'Phone'},
  {key:'district', label:'District'},
];

// Defined outside the page component so inputs keep focus while typing.
function Field({ label, field, type = 'text', options, profile, update, editing }) {
  const value = profile[field] ?? '';
  const opts = options && value && !options.includes(value) ? [value, ...options] : options;
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {opts ? (
        <select className="form-control" value={value} onChange={e => update(field, e.target.value)} disabled={!editing}>
          <option value="">Select</option>
          {opts.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input className="form-control" type={type} value={value} onChange={e => update(field, e.target.value)} disabled={!editing} style={{background: !editing ? '#F8F9FC' : 'white'}}/>
      )}
    </div>
  );
}

export default function Profile() {
  const { profile: saved, saveProfile, t, acting } = useApp();
  const [profile, setProfile] = useState(saved || {});
  const [editing, setEditing] = useState(false);
  useEffect(() => { if (!editing) setProfile(saved || {}); }, [saved, editing]);

  const toggleEdit = async () => {
    if (!editing) { setEditing(true); return; }
    if (await saveProfile(profile)) setEditing(false);
  };
  const [activeSection, setActiveSection] = useState('Personal');

  const completeness = completenessItems.filter(i => profile[i.key]).length;
  const pct = Math.round((completeness / completenessItems.length) * 100);

  const update = (k, v) => setProfile(p => ({...p, [k]: v}));
  return (
    <div className="fade-in" style={{maxWidth:900, margin:'0 auto'}}>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 className="page-title">{acting ? `${acting.name} — Profile` : t('profile')}</h1>
          <p className="page-subtitle">Your master profile — used to auto-fill all scholarship applications.</p>
        </div>
        <button
          className={`btn ${editing ? 'btn-saffron' : 'btn-primary'}`}
          onClick={toggleEdit}
        >
          {editing ? <><Save size={14}/> {t('save')}</> : <><Edit3 size={14}/> Edit Profile</>}
        </button>
      </div>

      <div className="grid-2" style={{alignItems:'flex-start', gap:20}}>
        {/* Left: Avatar + Completeness */}
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          {/* Profile Card */}
          <div className="card">
            <div className="card-body" style={{textAlign:'center', padding:'28px 20px'}}>
              <div style={{width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg, #003366, #1A5FAD)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 4px 20px rgba(0,51,102,0.25)', color:'white'}}>
                <User size={38} />
              </div>
              <div style={{fontSize:18, fontWeight:800, color:'#003366'}}>{profile.name}</div>
              <div style={{fontSize:12, color:'#68738F', marginTop:3}}>{[profile.tribe, [profile.district, profile.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}</div>
              <div style={{display:'flex', gap:6, justifyContent:'center', marginTop:10, flexWrap:'wrap'}}>
                <span className="badge badge-navy">ST Category</span>
                <span className="badge badge-saffron">Maharashtra</span>
                <span className="badge badge-green">3rd Year UG</span>
              </div>

              {/* Completeness */}
              <div style={{marginTop:20, textAlign:'left'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                  <span style={{fontSize:12, color:'#68738F'}}>Profile Completeness</span>
                  <span style={{fontSize:12, fontWeight:700, color: pct === 100 ? '#1B7A3E' : '#D4800A'}}>{pct}%</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar" style={{width:`${pct}%`, background: pct === 100 ? 'linear-gradient(90deg,#1B7A3E,#27AE60)' : 'linear-gradient(90deg,#D4800A,#F39C12)'}}/>
                </div>
                <div style={{marginTop:10}}>
                  {completenessItems.map(item => (
                    <div key={item.key} style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
                      {profile[item.key]
                        ? <CheckCircle size={12} color="#1B7A3E"/>
                        : <div style={{width:12, height:12, borderRadius:'50%', border:'2px solid #DDE1EE'}}/>
                      }
                      <span style={{fontSize:11, color: profile[item.key] ? '#1B7A3E' : '#C0392B'}}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Linked Accounts */}
          <div className="card">
            <div className="card-header"><span className="card-title">Linked Accounts</span></div>
            <div className="card-body">
              {[
                {icon: Link, name:'DigiLocker', status:'Connected', color:'#16A34A', bg:'#F0FDF4'},
                {icon: Smartphone, name:'Mobile (OTP)', status:'Verified', color:'#16A34A', bg:'#F0FDF4'},
                {icon: Building2, name:'Bank Account (PFMS)', status:'Verified', color:'#16A34A', bg:'#F0FDF4'},
                {icon: Globe, name:'NSP National Portal', status:'Not Linked', color:'#D97706', bg:'#FFFBEB'},
              ].map((a, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < 3 ? '1px solid #EFF1F7' : 'none'}}>
                  <div style={{width:32, height:32, borderRadius:8, background:a.bg, color:a.color, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <a.icon size={16} />
                  </div>
                  <div style={{flex:1, fontSize:13, fontWeight:600, color:'#1E293B'}}>{a.name}</div>
                  <span style={{fontSize:11.5, fontWeight:700, color:a.color}}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sections */}
        <div>
          <div className="tabs" style={{marginBottom:16}}>
            {SECTIONS.map(s => (
              <button key={s} className={`tab${activeSection===s?' active':''}`} onClick={() => setActiveSection(s)}>{s}</button>
            ))}
          </div>

          <div className="card">
            <div className="card-body" style={{padding:24}}>
              {activeSection === 'Personal' && (
                <div className="fade-in">
                  <div className="form-grid-2">
                    <Field profile={profile} update={update} editing={editing} label="Full Name" field="name"/>
                    <Field profile={profile} update={update} editing={editing} label="Date of Birth" field="dob" type="date"/>
                    <Field profile={profile} update={update} editing={editing} label="Gender" field="gender" options={['Male','Female','Other']}/>
                    <Field profile={profile} update={update} editing={editing} label="Mobile Number" field="phone"/>
                    <Field profile={profile} update={update} editing={editing} label="Email Address" field="email" type="email"/>
                    <Field profile={profile} update={update} editing={editing} label="Aadhaar Number" field="aadhaar"/>
                    <Field profile={profile} update={update} editing={editing} label="Tribe / Community" field="tribe"/>
                    <Field profile={profile} update={update} editing={editing} label="BPL Card Holder?" field="bpl" options={['Yes','No']}/>
                  </div>
                </div>
              )}
              {activeSection === 'Academic' && (
                <div className="fade-in">
                  <div className="form-grid-2">
                    <Field profile={profile} update={update} editing={editing} label="Current Course / Degree" field="course" options={['Class 6–8','Class 9–10','Class 11–12','Diploma / ITI',"Bachelor's Degree (UG)","Master's Degree (PG)",'Ph.D / Research']}/>
                    <Field profile={profile} update={update} editing={editing} label="Institution Name" field="institution"/>
                    <Field profile={profile} update={update} editing={editing} label="Year of Study" field="year" options={['1st Year','2nd Year','3rd Year','4th Year','5th Year']}/>
                    <Field profile={profile} update={update} editing={editing} label="Branch / Specialization" field="branch"/>
                    <Field profile={profile} update={update} editing={editing} label="Roll Number / Enrollment No." field="rollNo"/>
                    <Field profile={profile} update={update} editing={editing} label="Last Exam Percentage" field="lastPercentage"/>
                  </div>
                </div>
              )}
              {activeSection === 'Financial' && (
                <div className="fade-in">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Annual Family Income (₹)</label>
                      <input className="form-control" type="number" value={profile.income ?? ''} onChange={e => update('income', e.target.value)} disabled={!editing} style={{background:!editing?'#F8F9FC':'white'}}/>
                    </div>
                    <Field profile={profile} update={update} editing={editing} label="Father's Occupation" field="fatherOccupation"/>
                    <Field profile={profile} update={update} editing={editing} label="Mother's Occupation" field="motherOccupation"/>
                    <Field profile={profile} update={update} editing={editing} label="State" field="state" options={['Maharashtra','Madhya Pradesh','Chhattisgarh','Odisha','Jharkhand','Gujarat','Rajasthan','Telangana','Andhra Pradesh']}/>
                    <Field profile={profile} update={update} editing={editing} label="District" field="district"/>
                    <Field profile={profile} update={update} editing={editing} label="Village / Town" field="village"/>
                  </div>
                </div>
              )}
              {activeSection === 'Bank Details' && (
                <div className="fade-in">
                  <div className="alert alert-info" style={{marginBottom:16}}>
                    <Shield size={14}/> Bank details are used for scholarship disbursement via PFMS. Ensure they are accurate.
                  </div>
                  <div className="form-grid-2">
                    <Field profile={profile} update={update} editing={editing} label="Account Holder Name" field="accountHolder"/>
                    <Field profile={profile} update={update} editing={editing} label="Bank Name" field="bankName"/>
                    <Field profile={profile} update={update} editing={editing} label="Account Number" field="accountNo"/>
                    <Field profile={profile} update={update} editing={editing} label="IFSC Code" field="ifsc"/>
                    <Field profile={profile} update={update} editing={editing} label="Branch Name" field="branch_bank"/>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
