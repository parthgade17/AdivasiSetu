import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRight, Globe } from 'lucide-react';
import { LANGUAGES } from '../i18n';
import VoiceAssistant from '../components/VoiceAssistant';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login, toast, lang, setLang, config, t } = useApp();

  const openAdmin = async () => {
    if (!config.demoMode) { navigate('/login'); return; }
    try { await login('9000000001', '123456', 'admin'); navigate('/admin'); }
    catch (e) { toast(e.message, 'error'); }
  };

  const features = [
    { icon: '🔍', title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: '✅', title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: '📁', title: t('feature3Title'), desc: t('feature3Desc') },
    { icon: '🗣️', title: t('feature4Title'), desc: t('feature4Desc') },
    { icon: '📶', title: t('feature5Title'), desc: t('feature5Desc') },
    { icon: '👨‍🏫', title: t('feature6Title'), desc: t('feature6Desc') },
  ];

  const stats = [
    { value: '47+', label: t('activeSchemes'), color: '#FF6B1A' },
    { value: '12 L+', label: t('studentsCovered'), color: '#FFD700' },
    { value: '28', label: t('statesUTs'), color: '#4CAF50' },
    { value: '₹1.2 Cr', label: t('avgDisbursed'), color: '#29B6F6' },
  ];

  const schemes = [
    { name: 'Pre-Matric Scholarship (ST)', ministry: 'Ministry of Tribal Affairs', amount: '₹3,500 – ₹7,000/yr', deadline: '31 Oct 2026', type: t('central') },
    { name: 'Post-Matric Scholarship (ST)', ministry: 'Ministry of Tribal Affairs', amount: 'Up to ₹1,50,000/yr', deadline: '15 Nov 2026', type: t('central') },
    { name: 'National Fellowship for ST', ministry: 'UGC', amount: '₹31,000/month', deadline: '30 Sep 2026', type: t('central') },
    { name: 'National Overseas Scholarship', ministry: 'Ministry of Tribal Affairs', amount: 'Full Funding', deadline: '28 Feb 2027', type: t('central') },
    { name: 'MahaDBT Scholarship (Maharashtra)', ministry: 'Govt of Maharashtra', amount: '₹5,000 – ₹80,000', deadline: '31 Oct 2026', type: t('state') },
  ];

  return (
    <div style={{minHeight:'100vh', fontFamily:'Inter, sans-serif', background:'#F4F6FB'}}>
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Government Top Bar */}
      <div style={{background:'#002147', padding:'7px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,0.85)', flexWrap:'wrap', gap:8}}>
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          <span>{t('heroGovtBar')}</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,0.12)', padding:'2px 8px', borderRadius:4}}>
            <Globe size={12} color="#FFD700" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ color: '#002147', background: 'white' }}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </div>
          <div style={{display:'flex', gap:6}}>
            {LANGUAGES.slice(0, 4).map((l) => (
              <span
                key={l.code}
                style={{
                  cursor:'pointer',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: lang === l.code ? 700 : 400,
                  background: lang === l.code ? 'var(--saffron)' : 'transparent',
                  color: lang === l.code ? 'white' : 'rgba(255,255,255,0.8)'
                }}
                onClick={() => setLang(l.code)}
              >
                {l.native}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <header style={{background:'white', borderBottom:'1px solid #DDE1EE', padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', height:72, position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 8px rgba(0,33,71,0.06)'}}>
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          <div style={{width:48, height:48, background:'linear-gradient(135deg,#003366,#1A5FAD)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22}}>
            🏛️
          </div>
          <div>
            <div style={{fontWeight:800, fontSize:16, color:'#003366', lineHeight:1.2}}>{t('brand')}</div>
            <div style={{fontSize:11, color:'#68738F'}}>{t('portalTagline')}</div>
          </div>
        </div>
        <nav style={{display:'flex', gap:20, alignItems:'center'}}>
          {[
            { label: t('about'), path: '#about' },
            { label: t('scholarships'), path: '#schemes' },
            { label: t('faqs'), path: '#faqs' },
          ].map((item) => (
            <span
              key={item.label}
              style={{fontSize:13, fontWeight:500, color:'#4B5470', cursor:'pointer', transition:'color 0.2s'}}
              onMouseEnter={(e) => (e.target.style.color = '#003366')}
              onMouseLeave={(e) => (e.target.style.color = '#4B5470')}
            >
              {item.label}
            </span>
          ))}

          <button
            onClick={() => navigate('/login')}
            style={{padding:'9px 20px', background:'#003366', color:'white', borderRadius:8, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.2s'}}
            onMouseEnter={(e) => (e.target.style.background = '#004488')}
            onMouseLeave={(e) => (e.target.style.background = '#003366')}
          >
            {t('loginRegister')}
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{background:'linear-gradient(160deg, #003366 0%, #004488 55%, #003D80 100%)', padding:'80px 32px 100px', textAlign:'center', position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', width:400, height:400, background:'rgba(255,107,26,0.08)', borderRadius:'50%', top:-150, right:-100}}/>
        <div style={{position:'absolute', width:300, height:300, background:'rgba(255,215,0,0.05)', borderRadius:'50%', bottom:-100, left:-80}}/>

        <div style={{position:'relative', maxWidth:840, margin:'0 auto'}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,107,26,0.15)', border:'1px solid rgba(255,107,26,0.3)', borderRadius:20, padding:'6px 16px', marginBottom:24, fontSize:12, color:'#FFA366', fontWeight:600}}>
            ✨ BHASHINI MULTILINGUAL VOICE + DIGILOCKER
          </div>
          <h1 style={{fontSize:44, fontWeight:900, color:'white', lineHeight:1.15, marginBottom:16}}>
            {t('heroTitle')}
          </h1>
          <p style={{fontSize:16, color:'rgba(255,255,255,0.85)', maxWidth:620, margin:'0 auto 36px', lineHeight:1.7}}>
            {t('heroSubtitle')}
          </p>
          <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
            <button
              onClick={() => navigate('/login')}
              style={{padding:'14px 32px', background:'linear-gradient(135deg, #FF6B1A, #FF8C42)', color:'white', borderRadius:10, fontSize:15, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 20px rgba(255,107,26,0.4)'}}
            >
              {t('checkMyEligibility')} <ArrowRight size={16}/>
            </button>
            <button
              onClick={openAdmin}
              style={{padding:'14px 28px', background:'rgba(255,255,255,0.1)', color:'white', borderRadius:10, fontSize:15, fontWeight:600, border:'1.5px solid rgba(255,255,255,0.25)', cursor:'pointer', backdropFilter:'blur(4px)'}}
            >
              {config.demoMode ? t('admin') : t('loginRegister')}
            </button>
          </div>

          {/* Stats Row */}
          <div style={{display:'flex', gap:0, justifyContent:'center', marginTop:56, flexWrap:'wrap'}}>
            {stats.map((s, i) => (
              <div key={i} style={{padding:'0 32px', borderRight: i < stats.length-1 ? '1px solid rgba(255,255,255,0.15)' : 'none', textAlign:'center'}}>
                <div style={{fontSize:28, fontWeight:900, color:s.color}}>{s.value}</div>
                <div style={{fontSize:12, color:'rgba(255,255,255,0.7)', marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{padding:'70px 32px', background:'white', textAlign:'center'}}>
        <div style={{fontSize:12, fontWeight:700, letterSpacing:2, color:'#FF6B1A', textTransform:'uppercase', marginBottom:8}}>
          {t('howItWorksHeading')}
        </div>
        <h2 style={{fontSize:32, fontWeight:800, color:'#003366', marginBottom:40}}>
          {t('step1Title')} → {t('step4Title')}
        </h2>
        <div style={{display:'flex', gap:0, justifyContent:'center', maxWidth:960, margin:'0 auto', flexWrap:'wrap'}}>
          {[
            { step:'01', title: t('step1Title'), desc: t('step1Desc'), icon:'👤' },
            { step:'02', title: t('step2Title'), desc: t('step2Desc'), icon:'✅' },
            { step:'03', title: t('step3Title'), desc: t('step3Desc'), icon:'📂' },
            { step:'04', title: t('step4Title'), desc: t('step4Desc'), icon:'📱' },
          ].map((s, i) => (
            <div key={i} style={{flex:1, minWidth:200, padding:'24px 20px', position:'relative'}}>
              {i < 3 && <div style={{position:'absolute', right:0, top:'40%', fontSize:20, color:'#DDE1EE'}}>→</div>}
              <div style={{width:56, height:56, background:'linear-gradient(135deg, #003366, #1A5FAD)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 12px', boxShadow:'0 4px 16px rgba(0,51,102,0.2)'}}>
                {s.icon}
              </div>
              <div style={{fontSize:11, fontWeight:800, color:'rgba(0,51,102,0.4)', letterSpacing:1, marginBottom:4}}>STEP {s.step}</div>
              <div style={{fontSize:15, fontWeight:700, color:'#003366', marginBottom:6}}>{s.title}</div>
              <div style={{fontSize:12, color:'#68738F', lineHeight:1.6}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="about" style={{padding:'70px 32px', background:'#F4F6FB'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:40}}>
            <div style={{fontSize:12, fontWeight:700, letterSpacing:2, color:'#FF6B1A', textTransform:'uppercase', marginBottom:8}}>
              {t('featuresHeading')}
            </div>
            <h2 style={{fontSize:32, fontWeight:800, color:'#003366'}}>{t('brand')}</h2>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16}}>
            {features.map((f, i) => (
              <div key={i} style={{background:'white', borderRadius:12, padding:'24px', border:'1px solid #DDE1EE', transition:'all 0.2s', cursor:'default'}}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 24px rgba(0,33,71,0.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)'; }}
              >
                <div style={{fontSize:28, marginBottom:12}}>{f.icon}</div>
                <div style={{fontSize:15, fontWeight:700, color:'#003366', marginBottom:6}}>{f.title}</div>
                <div style={{fontSize:13, color:'#68738F', lineHeight:1.6}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Schemes Preview */}
      <section id="schemes" style={{padding:'70px 32px', background:'white'}}>
        <div style={{maxWidth:1000, margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:36}}>
            <div style={{fontSize:12, fontWeight:700, letterSpacing:2, color:'#FF6B1A', textTransform:'uppercase', marginBottom:8}}>
              {t('featuredHeading')}
            </div>
            <h2 style={{fontSize:32, fontWeight:800, color:'#003366'}}>{t('scholarships')}</h2>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {schemes.map((s, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:16, padding:'16px 20px', border:'1.5px solid #DDE1EE', borderRadius:10, background:'white', transition:'all 0.2s', cursor:'pointer', borderLeft:`4px solid ${s.type === t('central') ? '#1A5FAD' : '#FF6B1A'}`}}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(0,33,71,0.08)'; e.currentTarget.style.background='#F8F9FC'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.background='white'; }}
              >
                <div style={{flex:1}}>
                  <div style={{fontSize:15, fontWeight:700, color:'#003366'}}>{s.name}</div>
                  <div style={{fontSize:12, color:'#68738F', marginTop:2}}>{s.ministry}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:15, fontWeight:800, color:'#E55A0A'}}>{s.amount}</div>
                  <div style={{fontSize:11, color:'#D4800A', marginTop:2}}>⏰ {s.deadline}</div>
                </div>
                <div style={{padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: s.type === t('central') ? 'rgba(26,95,173,0.1)' : 'rgba(255,107,26,0.1)', color: s.type === t('central') ? '#1A5FAD' : '#E55A0A'}}>
                  {s.type}
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center', marginTop:24}}>
            <button
              onClick={() => navigate('/login')}
              style={{padding:'12px 28px', background:'#003366', color:'white', borderRadius:8, fontSize:14, fontWeight:700, border:'none', cursor:'pointer'}}
            >
              {t('viewAllSchemes')} →
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{background:'linear-gradient(135deg, #FF6B1A, #E55A0A)', padding:'60px 32px', textAlign:'center'}}>
        <h2 style={{fontSize:32, fontWeight:900, color:'white', marginBottom:12}}>{t('ctaTitle')}</h2>
        <p style={{fontSize:15, color:'rgba(255,255,255,0.9)', marginBottom:28, maxWidth:520, margin:'0 auto 28px'}}>
          {t('ctaSubtitle')}
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{padding:'14px 36px', background:'white', color:'#E55A0A', borderRadius:10, fontSize:15, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}
        >
          {t('ctaButton')}
        </button>
      </section>

      {/* Footer */}
      <footer style={{background:'#0D1120', padding:'40px 32px 20px', color:'rgba(255,255,255,0.6)', fontSize:12}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, borderBottom:'1px solid rgba(255,255,255,0.08)', paddingBottom:20, marginBottom:20}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{fontSize:22}}>🏛️</div>
              <div>
                <div style={{fontWeight:700, color:'white', fontSize:14}}>{t('brand')}</div>
                <div style={{fontSize:11, color:'rgba(255,255,255,0.5)'}}>{t('portalTagline')}</div>
              </div>
            </div>
            <div style={{color:'rgba(255,255,255,0.7)', fontSize:12}}>
              {t('footerGovt')}
            </div>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8, fontSize:11}}>
            <span>© 2026 Ministry of Tribal Affairs, Government of India. All rights reserved.</span>
            <span>Version 2.0 · Multilingual Adivasi Platform</span>
          </div>
        </div>
      </footer>

      {/* Floating Interactive AI Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
}
