import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Shield, Users, ChevronLeft } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('role'); // role | otp | details
  const [role, setRole] = useState('student');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    if (phone.length === 10) {
      setOtpSent(true);
      setStep('otp');
    }
  };

  const handleOtpChange = (val, idx) => {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleVerify = () => {
    onLogin(role);
    navigate('/dashboard');
  };

  return (
    <div className="auth-page" style={{fontFamily:'Inter,sans-serif'}}>
      {/* LEFT PANEL */}
      <div className="auth-left">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.6)', fontSize:12, background:'none', border:'none', cursor:'pointer', marginBottom:32}}
        >
          <ChevronLeft size={14}/> Back to Home
        </button>

        {/* Logo */}
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:40}}>
          <div style={{width:52, height:52, background:'linear-gradient(135deg, #FF6B1A, #FFD700)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26}}>🏛️</div>
          <div>
            <div style={{fontWeight:800, fontSize:16, color:'white'}}>ST Scholarship Portal</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,0.5)'}}>Ministry of Tribal Affairs</div>
          </div>
        </div>

        <h2 style={{fontSize:28, fontWeight:800, color:'white', marginBottom:12, position:'relative', zIndex:1}}>
          One Portal,<br/>All Scholarships
        </h2>
        <p style={{fontSize:14, color:'rgba(255,255,255,0.65)', lineHeight:1.7, maxWidth:320, marginBottom:40}}>
          Secure login via OTP. Your data is protected under the Government of India's data privacy standards.
        </p>

        {/* Feature list */}
        <div style={{display:'flex', flexDirection:'column', gap:14, position:'relative', zIndex:1}}>
          {[
            {icon:'🔐', text:'OTP-based secure login — no password to remember'},
            {icon:'📱', text:'Works on any phone, even 2G connections'},
            {icon:'🗣️', text:'Available in 12 Indian languages'},
            {icon:'📶', text:'Offline mode — apply without internet'},
          ].map((f, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:12, color:'rgba(255,255,255,0.75)', fontSize:13}}>
              <span style={{fontSize:18}}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>

        {/* Floating badge */}
        <div style={{marginTop:'auto', background:'rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', display:'flex', gap:10, alignItems:'center', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.12)'}}>
          <Shield size={18} color="#FFD700"/>
          <div>
            <div style={{fontSize:12, fontWeight:700, color:'white'}}>Government Secured Platform</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,0.5)'}}>ISO 27001 Certified · Data protected by IT Act</div>
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
                <h2 style={{fontSize:22, fontWeight:800, color:'#003366', marginBottom:4}}>Welcome Back</h2>
                <p style={{fontSize:13, color:'#68738F'}}>Select your role to continue</p>
              </div>

              {/* Role Selection */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:24}}>
                {[
                  {id:'student', label:'Student', icon:'🎒'},
                  {id:'assistant', label:'Teacher / CSC', icon:'👨‍🏫'},
                  {id:'admin', label:'Admin', icon:'🏛️'},
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
                <label style={{display:'block', fontSize:12, fontWeight:600, color:'#333D5C', marginBottom:6}}>Mobile Number <span style={{color:'#C0392B'}}>*</span></label>
                <div style={{display:'flex', gap:8}}>
                  <div style={{padding:'10px 12px', border:'1.5px solid #DDE1EE', borderRadius:8, fontSize:13, color:'#4B5470', background:'#F8F9FC', flexShrink:0}}>+91</div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g,''))}
                    style={{flex:1, padding:'10px 14px', border:'1.5px solid #DDE1EE', borderRadius:8, fontSize:13, color:'#1E2541', outline:'none'}}
                    onFocus={e => e.target.style.borderColor='#1A5FAD'}
                    onBlur={e => e.target.style.borderColor='#DDE1EE'}
                  />
                </div>
              </div>

              {/* DigiLocker option */}
              <div style={{display:'flex', alignItems:'center', gap:8, padding:'12px 14px', background:'#E3F0FF', borderRadius:8, marginBottom:20, fontSize:12, color:'#1565C0', cursor:'pointer', border:'1px solid rgba(21,101,192,0.2)'}}>
                <span>🔗</span>
                <span>Or login with <strong>DigiLocker</strong> for instant document access</span>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={phone.length !== 10}
                style={{
                  width:'100%', padding:'13px', borderRadius:10, fontSize:14, fontWeight:700,
                  background: phone.length === 10 ? 'linear-gradient(135deg,#003366,#1A5FAD)' : '#DDE1EE',
                  color: phone.length === 10 ? 'white' : '#9AA3BC',
                  border:'none', cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  transition:'all 0.2s'
                }}
              >
                <Phone size={15}/> Send OTP <ArrowRight size={14}/>
              </button>

              <p style={{textAlign:'center', fontSize:11, color:'#9AA3BC', marginTop:16, lineHeight:1.6}}>
                By continuing, you agree to the Terms of Service and Privacy Policy of the Ministry of Tribal Affairs.
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              <div style={{textAlign:'center', marginBottom:28}}>
                <div style={{width:56, height:56, background:'linear-gradient(135deg,#1B7A3E,#27AE60)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 16px'}}>📱</div>
                <h2 style={{fontSize:22, fontWeight:800, color:'#003366', marginBottom:4}}>Enter OTP</h2>
                <p style={{fontSize:13, color:'#68738F'}}>6-digit OTP sent to +91 {phone}</p>
              </div>

              {/* OTP boxes */}
              <div style={{display:'flex', gap:8, justifyContent:'center', marginBottom:24}}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(e.target.value, i)}
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

              {/* Demo hint */}
              <div style={{background:'#FFF3DC', borderRadius:8, padding:'10px 12px', fontSize:12, color:'#D4800A', marginBottom:16, textAlign:'center'}}>
                🔑 Demo mode: any OTP works. Enter any 6 digits.
              </div>

              <button
                onClick={handleVerify}
                disabled={otp.join('').length < 6}
                style={{
                  width:'100%', padding:'13px', borderRadius:10, fontSize:14, fontWeight:700,
                  background:'linear-gradient(135deg,#1B7A3E,#27AE60)', color:'white',
                  border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8
                }}
              >
                ✓ Verify & Login
              </button>

              <button
                onClick={() => setStep('role')}
                style={{width:'100%', marginTop:10, padding:'10px', background:'none', border:'none', fontSize:13, color:'#68738F', cursor:'pointer'}}
              >
                ← Change number
              </button>

              <p style={{textAlign:'center', fontSize:12, color:'#9AA3BC', marginTop:12}}>
                Didn't receive? <span style={{color:'#1A5FAD', fontWeight:600, cursor:'pointer'}}>Resend in 45s</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
