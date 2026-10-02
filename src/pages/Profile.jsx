import { useState } from 'react';
import { Edit3, Save, CheckCircle, User, BookOpen, Home, CreditCard, Shield } from 'lucide-react';

const SECTIONS = ['Personal', 'Academic', 'Financial', 'Bank Details'];

const initialProfile = {
  name: 'Ramesh Bhavale', dob: '1998-05-14', gender: 'Male',
  aadhaar: '****-****-3421', phone: '9876543210', email: 'ramesh.bhavale@gmail.com',
  tribe: 'Gond', state: 'Maharashtra', district: 'Gadchiroli', village: 'Dhanora',
  category: 'ST', bpl: 'No', employed: 'No',
  course: "Bachelor's Degree (UG)", institution: 'Gondwana University, Gadchiroli',
  year: '3rd Year', branch: 'B.Sc Agriculture', rollNo: 'GU2024AGR0042',
  lastPercentage: '74.5', boardYear: '2021',
  income: '120000', fatherOccupation: 'Farmer', motherOccupation: 'Daily Wage Worker',
  bankName: 'Bank of Maharashtra', accountNo: '****9821', ifsc: 'MAHB0001234',
  branch_bank: 'Gadchiroli Main Branch', accountHolder: 'Ramesh Bhavale',
};

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

export default function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('Personal');

  const completeness = completenessItems.filter(i => profile[i.key]).length;
  const pct = Math.round((completeness / completenessItems.length) * 100);

  const update = (k, v) => setProfile(p => ({...p, [k]: v}));
  const Field = ({label, field, type='text', options}) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {options ? (
        <select className="form-control" value={profile[field]} onChange={e => update(field, e.target.value)} disabled={!editing}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input className="form-control" type={type} value={profile[field]} onChange={e => update(field, e.target.value)} disabled={!editing} style={{background: !editing ? '#F8F9FC' : 'white'}}/>
      )}
    </div>
  );

  return (
    <div className="fade-in" style={{maxWidth:900, margin:'0 auto'}}>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Your master profile — used to auto-fill all scholarship applications.</p>
        </div>
        <button
          className={`btn ${editing ? 'btn-saffron' : 'btn-primary'}`}
          onClick={() => setEditing(e => !e)}
        >
          {editing ? <><Save size={14}/> Save Profile</> : <><Edit3 size={14}/> Edit Profile</>}
        </button>
      </div>

      <div className="grid-2" style={{alignItems:'flex-start', gap:20}}>
        {/* Left: Avatar + Completeness */}
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          {/* Profile Card */}
          <div className="card">
            <div className="card-body" style={{textAlign:'center', padding:'28px 20px'}}>
              <div style={{width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg, #003366, #1A5FAD)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 14px', boxShadow:'0 4px 20px rgba(0,51,102,0.25)'}}>
                👤
              </div>
              <div style={{fontSize:18, fontWeight:800, color:'#003366'}}>{profile.name}</div>
              <div style={{fontSize:12, color:'#68738F', marginTop:3}}>{profile.tribe} · {profile.district}, {profile.state}</div>
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
                {icon:'🔗', name:'DigiLocker', status:'Connected', color:'#1B7A3E'},
                {icon:'📱', name:'Mobile (OTP)', status:'Verified', color:'#1B7A3E'},
                {icon:'🏦', name:'Bank Account', status:'Verified', color:'#1B7A3E'},
                {icon:'🌐', name:'NSP Portal', status:'Not Linked', color:'#D4800A'},
              ].map((a, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i < 3 ? '1px solid #EFF1F7' : 'none'}}>
                  <span style={{fontSize:20}}>{a.icon}</span>
                  <div style={{flex:1, fontSize:13, fontWeight:500, color:'#1E2541'}}>{a.name}</div>
                  <span style={{fontSize:12, fontWeight:700, color:a.color}}>{a.status}</span>
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
                    <Field label="Full Name" field="name"/>
                    <Field label="Date of Birth" field="dob" type="date"/>
                    <Field label="Gender" field="gender" options={['Male','Female','Other']}/>
                    <Field label="Mobile Number" field="phone"/>
                    <Field label="Email Address" field="email" type="email"/>
                    <Field label="Aadhaar Number" field="aadhaar"/>
                    <Field label="Tribe / Community" field="tribe"/>
                    <Field label="BPL Card Holder?" field="bpl" options={['Yes','No']}/>
                  </div>
                </div>
              )}
              {activeSection === 'Academic' && (
                <div className="fade-in">
                  <div className="form-grid-2">
                    <Field label="Current Course / Degree" field="course" options={['Class 6–8','Class 9–10','Class 11–12','Diploma / ITI',"Bachelor's Degree (UG)","Master's Degree (PG)",'Ph.D / Research']}/>
                    <Field label="Institution Name" field="institution"/>
                    <Field label="Year of Study" field="year" options={['1st Year','2nd Year','3rd Year','4th Year','5th Year']}/>
                    <Field label="Branch / Specialization" field="branch"/>
                    <Field label="Roll Number / Enrollment No." field="rollNo"/>
                    <Field label="Last Exam Percentage" field="lastPercentage"/>
                  </div>
                </div>
              )}
              {activeSection === 'Financial' && (
                <div className="fade-in">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Annual Family Income (₹)</label>
                      <input className="form-control" type="number" value={profile.income} onChange={e => update('income', e.target.value)} disabled={!editing} style={{background:!editing?'#F8F9FC':'white'}}/>
                    </div>
                    <Field label="Father's Occupation" field="fatherOccupation"/>
                    <Field label="Mother's Occupation" field="motherOccupation"/>
                    <Field label="State" field="state" options={['Maharashtra','Madhya Pradesh','Chhattisgarh','Odisha']}/>
                    <Field label="District" field="district"/>
                    <Field label="Village / Town" field="village"/>
                  </div>
                </div>
              )}
              {activeSection === 'Bank Details' && (
                <div className="fade-in">
                  <div className="alert alert-info" style={{marginBottom:16}}>
                    <Shield size={14}/> Bank details are used for scholarship disbursement via PFMS. Ensure they are accurate.
                  </div>
                  <div className="form-grid-2">
                    <Field label="Account Holder Name" field="accountHolder"/>
                    <Field label="Bank Name" field="bankName"/>
                    <Field label="Account Number" field="accountNo"/>
                    <Field label="IFSC Code" field="ifsc"/>
                    <Field label="Branch Name" field="branch_bank"/>
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
