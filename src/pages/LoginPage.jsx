import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, ArrowRight, Shield, ChevronLeft, Globe,
  GraduationCap, Users, Building2, KeyRound, CheckCircle2,
  Lock, Sparkles, Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { LANGUAGES } from '../i18n';
import VoiceAssistant from '../components/VoiceAssistant';

const DEMO_PHONES = { student: '9876543210', assistant: '9123456780', admin: '9000000001' };

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, config, t, lang, setLang } = useApp();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('role'); // role | otp
  const [role, setRole] = useState('student');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [demoOtp, setDemoOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    setError(''); setBusy(true);
    try {
      const r = await api.sendOtp(phone, role);
      setDemoOtp(r.demoOtp || '');
      setCooldown(r.resendIn ?? config.otpResendSeconds ?? 30);
      setOtp(['', '', '', '', '', '']);
      setStep('otp');
      setTimeout(() => document.getElementById('otp-0')?.focus(), 50);
    } catch (e) { setError(e.message); }
    setBusy(false);
  };

  const handleOtpChange = (val, idx) => {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
    if (e.key === 'Enter' && otp.join('').length === 6) handleVerify();
  };

  const handleOtpPaste = (e) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    setOtp(Array.from({ length: 6 }, (_, i) => digits[i] || ''));
    document.getElementById(`otp-${Math.min(digits.length, 5)}`)?.focus();
  };

  const handleVerify = async () => {
    setError(''); setBusy(true);
    try {
      const u = await login(phone, otp.join(''), role);
      navigate(u.role === 'assistant' ? '/assisted' : '/dashboard');
    } catch (e) {
      setError(e.message);
      setOtp(['', '', '', '', '', '']);
      setBusy(false);
      document.getElementById('otp-0')?.focus();
    }
  };

  return (
    <div className="auth-page" style={{fontFamily:'Inter, -apple-system, sans-serif', position:'relative'}}>
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Tricolor accent bar */}
      <div className="tricolor-bar" style={{position:'absolute', top:0, left:0, right:0, zIndex:100}} />

      {/* Top Floating Language Switcher */}
      <div style={{position:'absolute', top:16, right:24, zIndex:20, display:'flex', alignItems:'center', gap:8, background:'white', padding:'6px 14px', borderRadius:24, boxShadow:'0 2px 12px rgba(0,33,71,0.08)', border:'1.5px solid #E2E8F0'}}>
        <Globe size={15} color="#002147" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          style={{
            border:'none',
            background:'transparent',
            fontSize:12.5,
            fontWeight:700,
            color:'#002147',
            cursor:'pointer',
            outline:'none'
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.native} ({l.label})
            </option>
          ))}
        </select>
      </div>

      {/* LEFT BRAND PANEL */}
      <div className="auth-left" style={{background:'linear-gradient(160deg, #001E3D 0%, #003366 50%, #0A4A86 100%)', color:'white', padding:'48px 40px'}}>
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{display:'inline-flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.85)', fontSize:13, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', padding:'6px 14px', borderRadius:20, cursor:'pointer', marginBottom:36, width:'fit-content', backdropFilter:'blur(6px)'}}
        >
          <ChevronLeft size={16}/> {t('home')}
        </button>

        {/* Logo */}
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:36}}>
          <div style={{width:50, height:50, background:'linear-gradient(135deg, #FF6B1A, #FFD700)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', color:'#002147', boxShadow:'0 4px 14px rgba(255,107,26,0.3)', border:'2px solid rgba(255,255,255,0.6)'}}>
            <GraduationCap size={28} />
          </div>
          <div>
            <div style={{fontWeight:800, fontSize:18, color:'white', letterSpacing:'-0.3px'}}>{t('brand')}</div>
            <div style={{fontSize:11.5, color:'rgba(255,255,255,0.7)', fontWeight:500}}>{t('portalTagline')}</div>
          </div>
        </div>

        <h2 style={{fontSize:30, fontWeight:900, color:'white', marginBottom:14, lineHeight:1.25, letterSpacing:'-0.5px'}}>
          {t('heroTitle')}
        </h2>
        <p style={{fontSize:14.5, color:'rgba(255,255,255,0.82)', lineHeight:1.7, maxWidth:360, marginBottom:36}}>
          {t('loginSubtitle')}
        </p>

        {/* Feature list */}
        <div style={{display:'flex', flexDirection:'column', gap:14, position:'relative', zIndex:1}}>
          {[
            {icon: ShieldCheck, text: t('feature1Title')},
            {icon: Smartphone, text: t('feature2Title')},
            {icon: Sparkles, text: t('feature4Title')},
            {icon: Users, text: t('feature5Title')},
          ].map((f, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:12, color:'rgba(255,255,255,0.9)', fontSize:13.5}}>
              <div style={{width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                <f.icon size={16} color="#FFD700" />
              </div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Floating badge */}
        <div style={{marginTop:'auto', background:'rgba(255,255,255,0.08)', borderRadius:14, padding:'14px 18px', display:'flex', gap:12, alignItems:'center', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.15)'}}>
          <Shield size={22} color="#FFD700"/>
          <div>
            <div style={{fontSize:12.5, fontWeight:700, color:'white'}}>National Data Protection Standards</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,0.65)'}}>Aadhaar & DigiLocker e-KYC Verified Architecture</div>
          </div>
        </div>
      </div>

      {/* RIGHT AUTH PANEL */}
      <div className="auth-right">
        <div className="auth-form-card fade-in" style={{maxWidth:440, padding:'40px 36px', borderRadius:20, boxShadow:'0 10px 30px rgba(0,33,71,0.08)', border:'1px solid #E2E8F0', background:'white'}}>
          {step === 'role' && (
            <>
              <div style={{textAlign:'center', marginBottom:28}}>
                <div style={{width:54, height:54, background:'#EFF6FF', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', color:'#002147', margin:'0 auto 16px', border:'1px solid #BFDBFE'}}>
                  <GraduationCap size={28} color="#003366" />
                </div>
                <h2 style={{fontSize:23, fontWeight:800, color:'#002147', marginBottom:6, letterSpacing:'-0.3px'}}>{t('loginTitle')}</h2>
                <p style={{fontSize:13, color:'#64748B'}}>{t('loginSubtitle')}</p>
              </div>

              {/* Role Selection */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:24}}>
                {[
                  {id:'student', label: t('studentRole'), icon: GraduationCap},
                  {id:'assistant', label: t('teacherRole'), icon: Users},
                  {id:'admin', label: t('adminRole'), icon: Building2},
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    style={{
                      padding:'14px 8px', borderRadius:12, textAlign:'center', cursor:'pointer',
                      border:`2px solid ${role === r.id ? '#002147' : '#E2E8F0'}`,
                      background: role === r.id ? '#F0F5FA' : 'white',
                      transition:'all 0.2s',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:6
                    }}
                  >
                    <r.icon size={22} color={role === r.id ? '#002147' : '#64748B'} />
                    <div style={{fontSize:11.5, fontWeight:700, color: role === r.id ? '#002147' : '#64748B'}}>{r.label}</div>
                  </button>
                ))}
              </div>

              {/* Phone Input */}
              <div style={{marginBottom:18}}>
                <label style={{display:'block', fontSize:12.5, fontWeight:700, color:'#334155', marginBottom:6}}>
                  {t('mobileLabel')} <span style={{color:'var(--red-error)'}}>*</span>
                </label>
                <div style={{display:'flex', gap:8}}>
                  <div style={{padding:'11px 14px', border:'1.5px solid #CBD5E1', borderRadius:10, fontSize:13.5, fontWeight:600, color:'#475569', background:'#F8FAFC', flexShrink:0}}>
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder={t('mobilePlaceholder')}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g,''))}
                    style={{
                      flex:1, padding:'11px 14px', border:'1.5px solid #CBD5E1', borderRadius:10,
                      fontSize:14, fontWeight:500, color:'#0F172A', outline:'none', background:'white',
                      transition:'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = '#0052A5'}
                    onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                  />
                </div>
              </div>

              {config.demoMode && (
                <div style={{marginBottom:16}}>
                  <button
                    type="button"
                    onClick={() => setPhone(DEMO_PHONES[role])}
                    style={{background:'none', border:'none', color:'#0284C7', fontSize:12.5, fontWeight:600, cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:4}}
                  >
                    ⚡ {t('useDemoNumber')}: <span style={{textDecoration:'underline', fontWeight:700}}>{DEMO_PHONES[role]}</span>
                  </button>
                </div>
              )}

              {error && step === 'role' && <div className="alert alert-error" style={{marginBottom:16}}>{error}</div>}

              <button
                onClick={handleSendOtp}
                disabled={phone.length !== 10 || busy}
                className="btn btn-primary"
                style={{
                  width:'100%', padding:'13px', borderRadius:12, fontSize:14.5, fontWeight:700,
                  opacity: phone.length === 10 ? 1 : 0.6,
                  cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
                  boxShadow: phone.length === 10 ? '0 4px 14px rgba(0,33,71,0.25)' : 'none'
                }}
              >
                <Phone size={16}/> {t('sendOtp')} <ArrowRight size={15}/>
              </button>

              <p style={{textAlign:'center', fontSize:11.5, color:'#94A3B8', marginTop:18, lineHeight:1.6}}>
                {t('loginHelpText')}
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              <div style={{textAlign:'center', marginBottom:28}}>
                <div style={{width:54, height:54, background:'#F0FDF4', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', color:'#16A34A', margin:'0 auto 16px', border:'1px solid #BBF7D0'}}>
                  <KeyRound size={28} />
                </div>
                <h2 style={{fontSize:23, fontWeight:800, color:'#002147', marginBottom:4}}>{t('otpLabel')}</h2>
                <p style={{fontSize:13.5, color:'#64748B', fontWeight:500}}>+91 {phone}</p>
              </div>

              {/* OTP 6-box input */}
              <div style={{display:'flex', gap:8, justifyContent:'center', marginBottom:24}}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    aria-label={`OTP digit ${i + 1}`}
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(e.target.value.replace(/\D/g, ''), i)}
                    onKeyDown={e => handleOtpKey(e, i)}
                    onPaste={handleOtpPaste}
                    style={{
                      width:48, height:54, textAlign:'center', fontSize:22, fontWeight:800,
                      border:`2px solid ${d ? '#002147' : '#CBD5E1'}`,
                      borderRadius:10, color:'#002147', outline:'none', background:'white',
                      transition:'all 0.15s'
                    }}
                    onFocus={e => e.target.style.borderColor = '#0052A5'}
                  />
                ))}
              </div>

              {error && <div className="alert alert-error" style={{marginBottom:14}}>{error}</div>}

              {demoOtp && (
                <div style={{background:'#FFFBEB', borderRadius:10, padding:'10px 14px', fontSize:12.5, color:'#D97706', marginBottom:18, textAlign:'center', border:'1px solid #FDE68A', fontWeight:600}}>
                  🔑 Demo OTP: <strong>{demoOtp}</strong>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={otp.join('').length < 6 || busy}
                className="btn btn-saffron"
                style={{
                  width:'100%', padding:'13px', borderRadius:12, fontSize:14.5, fontWeight:700,
                  opacity: otp.join('').length === 6 ? 1 : 0.6,
                  cursor: otp.join('').length === 6 ? 'pointer' : 'not-allowed'
                }}
              >
                <CheckCircle2 size={16}/> {t('verifyAndLogin')}
              </button>

              <button
                onClick={() => setStep('role')}
                style={{width:'100%', marginTop:12, padding:'10px', background:'none', border:'none', fontSize:13, color:'#64748B', cursor:'pointer', fontWeight:600}}
              >
                ← {t('back')}
              </button>

              <p style={{textAlign:'center', fontSize:12, color:'#94A3B8', marginTop:12}}>
                {cooldown > 0
                  ? <span>{t('resendOtp')} in {cooldown}s</span>
                  : <button type="button" onClick={handleSendOtp} disabled={busy} style={{background:'none', border:'none', padding:0, color:'#0284C7', fontWeight:700, cursor:'pointer', fontSize:12}}>{t('resendOtp')}</button>}
              </p>
            </>
          )}
        </div>
      </div>

      <VoiceAssistant />
    </div>
  );
}
