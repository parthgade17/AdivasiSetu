import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Shield, ChevronLeft, Globe } from 'lucide-react';
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
    <div className="auth-page" style={{fontFamily:'Inter,sans-serif'}}>
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Top Floating Language Switcher */}
      <div style={{position:'absolute', top:16, right:24, zIndex:10, display:'flex', alignItems:'center', gap:6, background:'white', padding:'6px 12px', borderRadius:20, boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
        <Globe size={14} color="#003366" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          style={{
            border:'none',
            background:'transparent',
            fontSize:12,
            fontWeight:600,
            color:'#003366',
            cursor:'pointer',
            outline:'none'
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.native} ({l.short})
            </option>
          ))}
        </select>
      </div>

      {/* LEFT PANEL */}
      <div className="auth-left">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.8)', fontSize:13, background:'none', border:'none', cursor:'pointer', marginBottom:32}}
        >
          <ChevronLeft size={16}/> {t('home')}
        </button>

        {/* Logo */}
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:40}}>
          <div style={{width:52, height:52, background:'linear-gradient(135deg, #FF6B1A, #FFD700)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26}}>🏛️</div>
          <div>
            <div style={{fontWeight:800, fontSize:17, color:'white'}}>{t('brand')}</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,0.7)'}}>{t('portalTagline')}</div>
          </div>
        </div>

        <h2 style={{fontSize:28, fontWeight:800, color:'white', marginBottom:12, position:'relative', zIndex:1, lineHeight:1.3}}>
          {t('heroTitle')}
        </h2>
        <p style={{fontSize:14, color:'rgba(255,255,255,0.8)', lineHeight:1.7, maxWidth:340, marginBottom:40}}>
          {t('loginSubtitle')}
        </p>

        {/* Feature list */}
        <div style={{display:'flex', flexDirection:'column', gap:14, position:'relative', zIndex:1}}>
          {[
            {icon:'🔐', text: t('feature1Title')},
            {icon:'📱', text: t('feature2Title')},
            {icon:'🗣️', text: t('feature4Title')},
            {icon:'📶', text: t('feature5Title')},
          ].map((f, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:12, color:'rgba(255,255,255,0.85)', fontSize:13}}>
              <span style={{fontSize:18}}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>

        {/* Floating badge */}
        <div style={{marginTop:'auto', background:'rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', display:'flex', gap:10, alignItems:'center', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.12)'}}>
          <Shield size={18} color="#FFD700"/>
          <div>
            <div style={{fontSize:12, fontWeight:700, color:'white'}}>Secure Government Standards</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,0.6)'}}>OTP verification · DigiLocker certified data</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-card fade-in">
          {step === 'role' && (
            <>
              <div style={{textAlign:'center', marginBottom:28}}>
                <div style={{width:56, height:56, background:'linear-gradient(135deg,#003366,#1A5FAD)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 16px'}}>🎓</div>
                <h2 style={{fontSize:22, fontWeight:800, color:'#003366', marginBottom:4}}>{t('loginTitle')}</h2>
                <p style={{fontSize:13, color:'#68738F'}}>{t('loginSubtitle')}</p>
              </div>

              {/* Role Selection */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:24}}>
                {[
                  {id:'student', label: t('studentRole'), icon:'🎒'},
                  {id:'assistant', label: t('teacherRole'), icon:'👨‍🏫'},
                  {id:'admin', label: t('adminRole'), icon:'🏛️'},
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    style={{
                      padding:'14px 8px', borderRadius:10, textAlign:'center', cursor:'pointer',
                      border:`2px solid ${role === r.id ? '#003366' : '#DDE1EE'}`,
                      background: role === r.id ? '#F0F4FF' : 'white',
                      transition:'all 0.15s'
                    }}
                  >
                    <div style={{fontSize:22, marginBottom:4}}>{r.icon}</div>
                    <div style={{fontSize:11, fontWeight:700, color: role === r.id ? '#003366' : '#68738F'}}>{r.label}</div>
                  </button>
                ))}
              </div>

              {/* Phone Input */}
              <div style={{marginBottom:16}}>
                <label style={{display:'block', fontSize:12, fontWeight:600, color:'#333D5C', marginBottom:6}}>
                  {t('mobileLabel')} <span style={{color:'#C0392B'}}>*</span>
                </label>
                <div style={{display:'flex', gap:8}}>
                  <div style={{padding:'10px 12px', border:'1.5px solid #DDE1EE', borderRadius:8, fontSize:13, color:'#4B5470', background:'#F8F9FC', flexShrink:0}}>+91</div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder={t('mobilePlaceholder')}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g,''))}
                    style={{flex:1, padding:'10px 14px', border:'1.5px solid #DDE1EE', borderRadius:8, fontSize:13, color:'#1E2541', outline:'none'}}
                    onFocus={e => e.target.style.borderColor='#1A5FAD'}
                    onBlur={e => e.target.style.borderColor='#DDE1EE'}
                  />
                </div>
              </div>

              {config.demoMode && (
                <button
                  type="button"
                  onClick={() => setPhone(DEMO_PHONES[role])}
                  style={{background:'none', border:'none', color:'#1A5FAD', fontSize:12, fontWeight:600, cursor:'pointer', padding:0, marginBottom:14}}
                >
                  ⚡ {t('useDemoNumber')}: {DEMO_PHONES[role]}
                </button>
              )}
              {error && step === 'role' && <div className="alert alert-error" style={{marginBottom:14}}>{error}</div>}

              <button
                onClick={handleSendOtp}
                disabled={phone.length !== 10 || busy}
                style={{
                  width:'100%', padding:'13px', borderRadius:10, fontSize:14, fontWeight:700,
                  background: phone.length === 10 ? 'linear-gradient(135deg,#003366,#1A5FAD)' : '#DDE1EE',
                  color: phone.length === 10 ? 'white' : '#9AA3BC',
                  border:'none', cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  transition:'all 0.2s'
                }}
              >
                <Phone size={15}/> {t('sendOtp')} <ArrowRight size={14}/>
              </button>

              <p style={{textAlign:'center', fontSize:11, color:'#9AA3BC', marginTop:16, lineHeight:1.6}}>
                {t('loginHelpText')}
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              <div style={{textAlign:'center', marginBottom:28}}>
                <div style={{width:56, height:56, background:'linear-gradient(135deg,#1B7A3E,#27AE60)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 16px'}}>📱</div>
                <h2 style={{fontSize:22, fontWeight:800, color:'#003366', marginBottom:4}}>{t('otpLabel')}</h2>
                <p style={{fontSize:13, color:'#68738F'}}>+91 {phone}</p>
              </div>

              {/* OTP boxes */}
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
                      width:48, height:52, textAlign:'center', fontSize:20, fontWeight:700,
                      border:`2px solid ${d ? '#003366' : '#DDE1EE'}`,
                      borderRadius:8, color:'#003366', outline:'none', background:'white',
                      transition:'all 0.15s'
                    }}
                    onFocus={e => e.target.style.borderColor='#1A5FAD'}
                  />
                ))}
              </div>

              {error && <div className="alert alert-error" style={{marginBottom:14}}>{error}</div>}
              {demoOtp && (
                <div style={{background:'#FFF3DC', borderRadius:8, padding:'10px 12px', fontSize:12, color:'#D4800A', marginBottom:16, textAlign:'center'}}>
                  🔑 Demo OTP: {demoOtp}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={otp.join('').length < 6 || busy}
                style={{
                  width:'100%', padding:'13px', borderRadius:10, fontSize:14, fontWeight:700,
                  background:'linear-gradient(135deg,#1B7A3E,#27AE60)', color:'white',
                  border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8
                }}
              >
                ✓ {t('verifyAndLogin')}
              </button>

              <button
                onClick={() => setStep('role')}
                style={{width:'100%', marginTop:10, padding:'10px', background:'none', border:'none', fontSize:13, color:'#68738F', cursor:'pointer'}}
              >
                ← {t('back')}
              </button>

              <p style={{textAlign:'center', fontSize:12, color:'#9AA3BC', marginTop:12}}>
                {cooldown > 0
                  ? <span>{t('resendOtp')} in {cooldown}s</span>
                  : <button type="button" onClick={handleSendOtp} disabled={busy} style={{background:'none', border:'none', padding:0, color:'#1A5FAD', fontWeight:600, cursor:'pointer', fontSize:12}}>{t('resendOtp')}</button>}
              </p>
            </>
          )}
        </div>
      </div>

      <VoiceAssistant />
    </div>
  );
}
