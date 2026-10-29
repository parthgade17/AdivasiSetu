import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, ChevronRight, ChevronLeft, Award, Loader2,
  MapPin, GraduationCap, IndianRupee, Sparkles, CheckCircle2,
  FileText, Shield, ArrowRight
} from 'lucide-react';
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

  const steps = [
    { label: t('stepLocation'), icon: MapPin },
    { label: t('stepEducation'), icon: GraduationCap },
    { label: t('stepFinance'), icon: IndianRupee },
    { label: t('scholarships'), icon: Award },
  ];

  // Pre-fill from the saved profile
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
    <div className="fade-in" style={{maxWidth:780, margin:'0 auto'}}>
      {/* Header */}
      <div className="page-header" style={{textAlign:'center', marginBottom:28}}>
        <h1 className="page-title">{t('eligibility')}</h1>
        <p className="page-subtitle" style={{maxWidth:600, margin:'6px auto 0'}}>
          Complete 3 quick steps to instantly match all Central and State ST scholarship schemes.
          {!online && ' Works offline with local data.'}
          {role === 'assistant' && acting && ` Filling for ${acting.name}.`}
        </p>
      </div>

      {/* Step Indicator */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32, padding:'0 12px'}}>
        {steps.map((s, i) => {
          const isDone = i < step;
          const isActive = i === step;
          const Icon = s.icon;
          return (
            <div key={i} style={{display:'flex', alignItems:'center', flex: i < steps.length-1 ? 1 : 'none'}}>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
                <div style={{
                  width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:800, fontSize:13, flexShrink:0, transition:'all 0.25s',
                  background: isDone ? 'var(--green-success)' : isActive ? 'var(--navy)' : '#F1F5F9',
                  color: (isDone || isActive) ? 'white' : '#94A3B8',
                  border: isActive ? '3px solid #BFDBFE' : '1px solid #E2E8F0',
                  boxShadow: isActive ? '0 0 0 3px rgba(0,51,102,0.12)' : 'none'
                }}>
                  {isDone ? <CheckCircle size={18}/> : <Icon size={16}/>}
                </div>
                <span style={{fontSize:11.5, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--navy)' : '#64748B', whiteSpace:'nowrap'}}>
                  {s.label}
                </span>
              </div>

              {i < steps.length-1 && (
                <div style={{
                  flex:1, height:3, margin:'0 14px 22px', borderRadius:2,
                  background: isDone ? 'var(--green-success)' : '#E2E8F0',
                  transition:'all 0.3s'
                }}/>
              )}
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <div className="card" style={{borderRadius:16, border:'1.5px solid #E2E8F0', boxShadow:'0 4px 18px rgba(0,33,71,0.06)'}}>
        <div className="card-body" style={{padding:'32px 36px'}}>

          {/* STEP 0 - Personal & Location */}
          {step === 0 && (
            <div className="fade-in">
              <div style={{marginBottom:24}}>
                <h2 style={{fontSize:19, fontWeight:800, color:'#002147', marginBottom:4}}>Personal & Tribal Details</h2>
                <p style={{fontSize:13, color:'#64748B'}}>Enter your official details for certificate and domicile verification.</p>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="required">*</span></label>
                  <input className="form-control" placeholder="As per Aadhaar card" value={form.name} onChange={e => update('name', e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">State of Domicile <span className="required">*</span></label>
                  <select className="form-control" value={form.state} onChange={e => update('state', e.target.value)}>
                    <option value="">Select state</option>
                    {states.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District <span className="required">*</span></label>
                  <input className="form-control" placeholder="e.g. Gadchiroli, Bastar" value={form.district} onChange={e => update('district', e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Tribe / Community Name <span className="required">*</span></label>
                  <input className="form-control" placeholder="e.g. Gond, Bhil, Santal, Oraon" value={form.tribe} onChange={e => update('tribe', e.target.value)}/>
                </div>
              </div>

              <div className="form-group" style={{marginTop:8}}>
                <label className="form-label">Aadhaar Number (Optional)</label>
                <input className="form-control" maxLength={12} placeholder="12-digit Aadhaar number" value={form.aadhaar} onChange={e => update('aadhaar', e.target.value.replace(/\D/g,''))}/>
                <p className="form-hint" style={{display:'flex', alignItems:'center', gap:4, marginTop:6}}>
                  <Shield size={12} color="#16A34A"/> Encrypted and verified via UIDAI guidelines.
                </p>
              </div>
            </div>
          )}

          {/* STEP 1 - Academic */}
          {step === 1 && (
            <div className="fade-in">
              <div style={{marginBottom:24}}>
                <h2 style={{fontSize:19, fontWeight:800, color:'#002147', marginBottom:4}}>Education & Institution</h2>
                <p style={{fontSize:13, color:'#64748B'}}>Select your current class or course to check scheme grade limits.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Current Course / Class Level <span className="required">*</span></label>
                <select className="form-control" value={form.course} onChange={e => update('course', e.target.value)}>
                  <option value="">Select your course / class</option>
                  {courses.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Institution / College / School Name</label>
                  <input className="form-control" placeholder="e.g. Govt Degree College" value={form.institution} onChange={e => update('institution', e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Previous Year Marks / Percentage (%)</label>
                  <input className="form-control" placeholder="e.g. 72" type="number" max="100" value={form.percentage} onChange={e => update('percentage', e.target.value)}/>
                </div>
              </div>

              <div className="alert alert-info" style={{marginTop:12, borderRadius:12}}>
                <Award size={18} style={{flexShrink:0, marginTop:1}}/>
                <div style={{fontSize:12.5, lineHeight:1.5}}>
                  Pre-Matric schemes cover Class 1 to 10. Post-Matric schemes cover Class 11, 12, ITI, Diploma, UG, and PG. Fellowships fund M.Phil and Ph.D.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 - Financial & Social */}
          {step === 2 && (
            <div className="fade-in">
              <div style={{marginBottom:24}}>
                <h2 style={{fontSize:19, fontWeight:800, color:'#002147', marginBottom:4}}>Financial & Family Background</h2>
                <p style={{fontSize:13, color:'#64748B'}}>Eligibility rules depend on annual family income ceilings.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Annual Family Income (in ₹) <span className="required">*</span></label>
                <input className="form-control" type="number" placeholder="e.g. 150000" value={form.income} onChange={e => update('income', e.target.value)}/>
                <p className="form-hint" style={{marginTop:6}}>
                  Central schemes usually require income under ₹2,50,000 per year.
                </p>
              </div>

              <div className="form-grid-2" style={{marginTop:16}}>
                <div className="form-group">
                  <label className="form-label">Do you hold a BPL / Antyodaya Card?</label>
                  <div className="pill-choice-group" style={{marginTop:6}}>
                    <button
                      type="button"
                      className={`pill-choice${form.bpl === 'yes' ? ' active' : ''}`}
                      onClick={() => update('bpl', 'yes')}
                    >
                      ✓ Yes, BPL Holder
                    </button>
                    <button
                      type="button"
                      className={`pill-choice${form.bpl === 'no' ? ' active' : ''}`}
                      onClick={() => update('bpl', 'no')}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Are you currently employed / salaried?</label>
                  <div className="pill-choice-group" style={{marginTop:6}}>
                    <button
                      type="button"
                      className={`pill-choice${form.employed === 'yes' ? ' active' : ''}`}
                      onClick={() => update('employed', 'yes')}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`pill-choice${form.employed === 'no' ? ' active' : ''}`}
                      onClick={() => update('employed', 'no')}
                    >
                      No (Full-time student)
                    </button>
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
                  <div style={{textAlign:'center', marginBottom:32}}>
                    <div style={{width:68, height:68, background:'linear-gradient(135deg,#16A34A,#22C55E)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', margin:'0 auto 16px', boxShadow:'0 6px 20px rgba(22,163,74,0.3)'}}>
                      <CheckCircle2 size={36}/>
                    </div>
                    <h2 style={{fontSize:24, fontWeight:900, color:'#002147', letterSpacing:'-0.3px'}}>
                      Great News, {form.name || 'Student'}!
                    </h2>
                    <p style={{fontSize:14, color:'#64748B', marginTop:6}}>
                      You qualify for <strong style={{color:'var(--green-success)'}}>{eligible.length} scholarship scheme{eligible.length > 1 ? 's' : ''}</strong> based on your criteria.
                    </p>
                  </div>

                  <div style={{display:'flex', flexDirection:'column', gap:14}}>
                    {eligible.map(s => (
                      <div
                        key={s.id}
                        className="scheme-card-modern is-eligible"
                        style={{
                          padding:'18px 22px',
                          borderLeft:`5px solid ${s.type === 'central' ? '#002147' : 'var(--saffron)'}`
                        }}
                      >
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10}}>
                          <div>
                            <div style={{fontSize:15, fontWeight:800, color:'#002147', marginBottom:2}}>{s.name}</div>
                            <div style={{fontSize:12.5, color:'#64748B'}}>{s.ministry}</div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:18, fontWeight:900, color:'var(--saffron-dark)'}}>{s.amount}</div>
                            <div style={{fontSize:11.5, color:'#D97706', marginTop:2, fontWeight:600}}>⏰ {s.deadline}</div>
                          </div>
                        </div>

                        {/* Criteria Match Chips */}
                        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:12}}>
                          {s.reasons.map((r, i) => (
                            <span key={i} className="badge badge-green" style={{fontSize:11.5}}>
                              ✓ {r}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div style={{display:'flex', gap:10, marginTop:14, paddingTop:14, borderTop:'1px solid #F1F5F9', flexWrap:'wrap', alignItems:'center'}}>
                          {role !== 'admin' && (isApplied(s.id) ? (
                            <span className="badge badge-green" style={{padding:'8px 14px'}}>
                              <CheckCircle2 size={13}/> {t('alreadyApplied')}
                            </span>
                          ) : (
                            <button
                              className="btn btn-saffron btn-sm"
                              onClick={async () => { const r = await applyToScheme(s); if (r) navigate('/applications'); }}
                              style={{boxShadow:'0 2px 8px rgba(255,107,26,0.3)'}}
                            >
                              <span>{t('applyNow')}</span> <ArrowRight size={13}/>
                            </button>
                          ))}

                          <ListenButton scheme={s}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bulk Apply Action */}
                  <div style={{marginTop:28, display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
                    {role !== 'admin' && eligible.some(x => !isApplied(x.id)) && (
                      <button className="btn btn-saffron" onClick={applyAll} style={{padding:'12px 28px', fontSize:14.5}}>
                        <Award size={16}/> Apply for All Eligible Schemes
                      </button>
                    )}
                    <button className="btn btn-outline" onClick={() => setStep(0)}>
                      Modify Details
                    </button>
                  </div>
                </>
              ) : (
                <div style={{textAlign:'center', padding:'40px 16px'}}>
                  <div style={{width:64, height:64, background:'#FFF7ED', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'var(--saffron)'}}>
                    <FileText size={28}/>
                  </div>
                  <h2 style={{fontSize:21, fontWeight:800, color:'#002147', marginBottom:8}}>No Direct Matches Found</h2>
                  <p style={{fontSize:13.5, color:'#64748B', maxWidth:460, margin:'0 auto 24px', lineHeight:1.6}}>
                    Based on your selected criteria, no central schemes directly match. You may still qualify for state-specific or discretionary tribal schemes.
                  </p>
                  <button className="btn btn-primary" onClick={() => setStep(0)}>
                    Update Details
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          {step < 3 && (
            <div style={{display:'flex', justifyContent:'space-between', marginTop:32, paddingTop:22, borderTop:'1px solid #F1F5F9'}}>
              <button
                className="btn btn-outline"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                style={{opacity: step === 0 ? 0.4 : 1, padding:'10px 20px'}}
              >
                <ChevronLeft size={16}/> {t('previous')}
              </button>

              <button
                className="btn btn-saffron"
                onClick={handleNext}
                disabled={checking}
                style={{padding:'10px 24px', boxShadow:'0 4px 12px rgba(255,107,26,0.3)'}}
              >
                {checking ? (
                  <><Loader2 size={16} className="spin"/> Checking…</>
                ) : (
                  <>{step === 2 ? t('calculateEligibility') : t('next')} <ChevronRight size={16}/></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
