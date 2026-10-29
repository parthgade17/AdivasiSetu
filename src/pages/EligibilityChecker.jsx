import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, ChevronLeft, Award, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ListenButton from '../components/ListenButton';

const states = ['Maharashtra', 'Madhya Pradesh', 'Chhattisgarh', 'Odisha', 'Jharkhand', 'Gujarat', 'Andhra Pradesh', 'Telangana', 'Rajasthan', 'Tamil Nadu'];
const courses = ['Class 1–5 (Pre-Primary)', 'Class 6–8', 'Class 9–10', 'Class 11–12', 'Diploma / ITI', "Bachelor's Degree (UG)", "Master's Degree (PG)", 'Ph.D / Research', 'Other'];

export default function EligibilityChecker() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', state: '', district: '', tribe: '',
    course: '', institution: '', percentage: '',
    income: '', aadhaar: '', bpl: 'no',
    employed: 'no'
  });
  const [eligible, setEligible] = useState(null);
  const [checking, setChecking] = useState(false);
  const { profile, checkEligibility, applyToScheme, isApplied, t, toast, online, acting, role } = useApp();

  const steps = [t('stepLocation'), t('stepEducation'), t('stepFinance'), t('scholarships')];

  // Pre-fill from the saved profile (the student fills details once).
  useEffect(() => {
    if (!profile) return;
    setForm(f => ({
      ...f,
      name: profile.name || f.name, state: profile.state || f.state, district: profile.district || f.district,
      tribe: profile.tribe || f.tribe, course: profile.course || f.course, institution: profile.institution || f.institution,
      percentage: profile.lastPercentage || f.percentage, income: profile.income || f.income,
      bpl: (profile.bpl || f.bpl).toLowerCase(), employed: (profile.employed || f.employed).toLowerCase(),
    }));
  }, [profile]);

  const update = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleNext = async () => {
    if (step === 0 && !form.state) { toast('Select your state to continue', 'error'); return; }
    if (step === 1 && !form.course) { toast('Select your current class or course', 'error'); return; }
    if (step === 2) {
      if (form.income === '') { toast('Enter your annual family income', 'error'); return; }
      setChecking(true);
      const payload = {
        name: form.name, state: form.state, district: form.district, tribe: form.tribe, category: 'ST',
        course: form.course, institution: form.institution, lastPercentage: form.percentage,
        income: String(form.income), bpl: form.bpl === 'yes' ? 'Yes' : 'No', employed: form.employed === 'yes' ? 'Yes' : 'No',
        ...(form.aadhaar.length === 12 ? { aadhaar: `****-****-${form.aadhaar.slice(-4)}` } : {}),
      };
      setEligible(await checkEligibility(payload));
      setChecking(false);
    }
    setStep(s => s + 1);
  };

  const applyAll = async () => {
    for (const s of eligible.filter(x => !isApplied(x.id))) await applyToScheme(s);
    navigate('/applications');
  };

  return (
    <div className="fade-in" style={{maxWidth:760, margin:'0 auto'}}>
      <div className="page-header">
        <h1 className="page-title">{t('eligibility')}</h1>
        <p className="page-subtitle">
          Answer a few questions and instantly see which scholarships you qualify for.
          {!online && ' Works offline — results use schemes saved on this device.'}
          {role === 'admin' && ' Preview mode: results are not saved.'}
          {role === 'assistant' && acting && ` Filling for ${acting.name}.`}
        </p>
      </div>

      {/* Step Indicator */}
      <div style={{display:'flex', alignItems:'center', marginBottom:28}}>
        {steps.map((s, i) => (
          <div key={i} style={{display:'flex', alignItems:'center', flex: i < steps.length-1 ? 1 : 'none'}}>
            <div style={{
              width:34, height:34, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:700, fontSize:13, flexShrink:0, transition:'all 0.2s',
              background: i < step ? '#1B7A3E' : i === step ? '#003366' : '#EFF1F7',
              color: i <= step ? 'white' : '#9AA3BC',
              boxShadow: i === step ? '0 0 0 4px rgba(0,51,102,0.15)' : 'none'
            }}>
              {i < step ? <CheckCircle size={16}/> : i + 1}
            </div>
            <span style={{marginLeft:8, fontSize:12, fontWeight: i === step ? 700 : 500, color: i <= step ? '#003366' : '#9AA3BC', whiteSpace:'nowrap', display: i === steps.length-1 ? 'block' : 'none'}}>
              {s}
            </span>
            {i < steps.length-1 && (
              <>
                <span style={{marginLeft:8, fontSize:12, fontWeight: i === step ? 700 : 500, color: i <= step ? '#003366' : '#9AA3BC', whiteSpace:'nowrap'}}>
                  {s}
                </span>
                <div style={{flex:1, height:2, margin:'0 12px', background: i < step ? '#1B7A3E' : '#EFF1F7', transition:'all 0.3s'}}/>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <div className="card">
        <div className="card-body" style={{padding:28}}>

          {/* STEP 0 - Personal */}
          {step === 0 && (
            <div className="fade-in">
              <h2 style={{fontSize:18, fontWeight:700, color:'#003366', marginBottom:4}}>Personal Details</h2>
              <p style={{fontSize:13, color:'#68738F', marginBottom:24}}>Your information is secure and used only for eligibility matching.</p>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="required">*</span></label>
                  <input className="form-control" placeholder="As per Aadhaar card" value={form.name} onChange={e => update('name', e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">State <span className="required">*</span></label>
                  <select className="form-control" value={form.state} onChange={e => update('state', e.target.value)}>
                    <option value="">Select state</option>
                    {states.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District <span className="required">*</span></label>
                  <input className="form-control" placeholder="e.g. Gadchiroli" value={form.district} onChange={e => update('district', e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Tribe / Community <span className="required">*</span></label>
                  <input className="form-control" placeholder="e.g. Gond, Bhil, Santali" value={form.tribe} onChange={e => update('tribe', e.target.value)}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Aadhaar Number <span className="required">*</span></label>
                <input className="form-control" maxLength={12} placeholder="12-digit Aadhaar" value={form.aadhaar} onChange={e => update('aadhaar', e.target.value.replace(/\D/g,''))}/>
                <p className="form-hint">🔒 Encrypted and secured as per IT Act 2000</p>
              </div>
            </div>
          )}

          {/* STEP 1 - Academic */}
          {step === 1 && (
            <div className="fade-in">
              <h2 style={{fontSize:18, fontWeight:700, color:'#003366', marginBottom:4}}>Academic Details</h2>
              <p style={{fontSize:13, color:'#68738F', marginBottom:24}}>Tell us about your current course and institution.</p>
              <div className="form-group">
                <label className="form-label">Current Course / Level <span className="required">*</span></label>
                <select className="form-control" value={form.course} onChange={e => update('course', e.target.value)}>
                  <option value="">Select your current course</option>
                  {courses.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Institution Name</label>
                  <input className="form-control" placeholder="School / College / University" value={form.institution} onChange={e => update('institution', e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Last Exam Percentage</label>
                  <input className="form-control" placeholder="e.g. 75" type="number" max="100" value={form.percentage} onChange={e => update('percentage', e.target.value)}/>
                </div>
              </div>

              {/* Quick tips */}
              <div className="alert alert-info" style={{marginTop:8}}>
                <Award size={15}/>
                <div>Students from class 1 to Ph.D level are eligible for different schemes. Select your exact current class/level.</div>
              </div>
            </div>
          )}

          {/* STEP 2 - Financial */}
          {step === 2 && (
            <div className="fade-in">
              <h2 style={{fontSize:18, fontWeight:700, color:'#003366', marginBottom:4}}>Financial Details</h2>
              <p style={{fontSize:13, color:'#68738F', marginBottom:24}}>Used to determine income-based eligibility. Not shared with third parties.</p>

              <div className="form-group">
                <label className="form-label">Annual Family Income (₹) <span className="required">*</span></label>
                <input className="form-control" type="number" placeholder="e.g. 150000" value={form.income} onChange={e => update('income', e.target.value)}/>
                <p className="form-hint">Most central schemes require income below ₹2.5 lakh. State schemes may vary.</p>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">BPL Card Holder?</label>
                  <div style={{display:'flex', gap:8, marginTop:4}}>
                    {['yes','no'].map(v => (
                      <button key={v} onClick={() => update('bpl', v)} style={{flex:1, padding:'9px', borderRadius:8, border:`2px solid ${form.bpl===v ? '#003366' : '#DDE1EE'}`, background:form.bpl===v ? '#003366' : 'white', color:form.bpl===v ? 'white' : '#4B5470', fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.15s'}}>
                        {v === 'yes' ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Employed / Getting Salary?</label>
                  <div style={{display:'flex', gap:8, marginTop:4}}>
                    {['yes','no'].map(v => (
                      <button key={v} onClick={() => update('employed', v)} style={{flex:1, padding:'9px', borderRadius:8, border:`2px solid ${form.employed===v ? '#003366' : '#DDE1EE'}`, background:form.employed===v ? '#003366' : 'white', color:form.employed===v ? 'white' : '#4B5470', fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.15s'}}>
                        {v === 'yes' ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 - Results */}
          {step === 3 && eligible !== null && (
            <div className="fade-in">
              {eligible.length > 0 ? (
                <>
                  <div style={{textAlign:'center', marginBottom:28}}>
                    <div style={{width:64, height:64, background:'linear-gradient(135deg,#1B7A3E,#27AE60)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 16px', boxShadow:'0 4px 20px rgba(27,122,62,0.3)'}}>✅</div>
                    <h2 style={{fontSize:22, fontWeight:800, color:'#003366'}}>Great News, {form.name || 'Student'}!</h2>
                    <p style={{fontSize:14, color:'#68738F', marginTop:6}}>You are eligible for <strong style={{color:'#1B7A3E'}}>{eligible.length} scholarship{eligible.length > 1 ? 's' : ''}</strong>. Apply before the deadlines!</p>
                  </div>

                  <div style={{display:'flex', flexDirection:'column', gap:12}}>
                    {eligible.map(s => (
                      <div key={s.id} style={{padding:'16px', border:'1.5px solid rgba(27,122,62,0.25)', borderRadius:12, background:'linear-gradient(135deg, white, rgba(27,122,62,0.03))', borderLeft:`4px solid ${s.type === 'central' ? '#003366' : '#FF6B1A'}`}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8}}>
                          <div>
                            <div style={{fontSize:14, fontWeight:700, color:'#003366', marginBottom:2}}>{s.name}</div>
                            <div style={{fontSize:12, color:'#68738F'}}>{s.ministry}</div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:18, fontWeight:800, color:'#E55A0A'}}>{s.amount}</div>
                            <div style={{fontSize:11, color:'#D4800A', marginTop:2}}>⏰ {s.deadline}</div>
                          </div>
                        </div>
                        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:10}}>
                          {s.reasons.map((r, i) => (
                            <span key={i} style={{padding:'3px 10px', borderRadius:20, background:'rgba(27,122,62,0.1)', color:'#1B7A3E', fontSize:11, fontWeight:600}}>
                              ✓ {r}
                            </span>
                          ))}
                        </div>
                        <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
                          {role !== 'admin' && (isApplied(s.id) ? (
                            <span className="badge badge-green" style={{padding:'8px 12px'}}>✓ {t('alreadyApplied')}</span>
                          ) : (
                            <button
                              onClick={async () => { const r = await applyToScheme(s); if (r) navigate('/applications'); }}
                              style={{padding:'8px 16px', background:'#003366', color:'white', border:'none', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6}}
                            >
                              {t('applyNow')} <ChevronRight size={13}/>
                            </button>
                          ))}
                          <ListenButton scheme={s}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{marginTop:20, display:'flex', gap:10, justifyContent:'center'}}>
                    {role !== 'admin' && eligible.some(x => !isApplied(x.id)) && (
                      <button className="btn btn-saffron" onClick={applyAll}>
                        <Award size={15}/> Apply for All Eligible Schemes
                      </button>
                    )}
                    <button className="btn btn-outline" onClick={() => setStep(0)}>Edit details</button>
                  </div>
                </>
              ) : (
                <div style={{textAlign:'center', padding:'32px 0'}}>
                  <div style={{fontSize:48, marginBottom:16}}>🔍</div>
                  <h2 style={{fontSize:20, fontWeight:700, color:'#003366', marginBottom:8}}>No Schemes Found</h2>
                  <p style={{fontSize:13, color:'#68738F', maxWidth:400, margin:'0 auto 20px', lineHeight:1.6}}>
                    Based on your current details, no schemes exactly match. You may still qualify for state-specific schemes. Contact your district tribal office for guidance.
                  </p>
                  <button className="btn btn-outline" onClick={() => setStep(0)}>
                    Update My Details
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 3 && (
            <div style={{display:'flex', justifyContent:'space-between', marginTop:28, paddingTop:20, borderTop:'1px solid #EFF1F7'}}>
              <button
                className="btn btn-outline"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                style={{opacity: step === 0 ? 0.4 : 1}}
              >
                <ChevronLeft size={15}/> {t('previous')}
              </button>
              <button
                className="btn btn-saffron"
                onClick={handleNext}
                disabled={checking}
              >
                {checking ? <><Loader2 size={15} className="spin"/> Checking…</> : <>{step === 2 ? t('calculateEligibility') : t('next')} <ChevronRight size={15}/></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
