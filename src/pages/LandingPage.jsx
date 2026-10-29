import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowRight, Globe, Search, CheckCircle2, FolderSync,
  Mic2, WifiOff, Users2, GraduationCap, Award, ShieldCheck,
  ChevronRight, Calendar, Sparkles, Building2
} from 'lucide-react';
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
    { icon: Search, title: t('feature1Title'), desc: t('feature1Desc'), color: '#003366', bg: '#EFF6FF' },
    { icon: CheckCircle2, title: t('feature2Title'), desc: t('feature2Desc'), color: '#16A34A', bg: '#F0FDF4' },
    { icon: FolderSync, title: t('feature3Title'), desc: t('feature3Desc'), color: '#FF6B1A', bg: '#FFF7ED' },
    { icon: Mic2, title: t('feature4Title'), desc: t('feature4Desc'), color: '#D97706', bg: '#FFFBEB' },
    { icon: WifiOff, title: t('feature5Title'), desc: t('feature5Desc'), color: '#0284C7', bg: '#F0F9FF' },
    { icon: Users2, title: t('feature6Title'), desc: t('feature6Desc'), color: '#7C3AED', bg: '#FAF5FF' },
  ];

  const stats = [
    { value: '47+', label: t('activeSchemes'), color: '#FF6B1A' },
    { value: '12 L+', label: t('studentsCovered'), color: '#FFD700' },
    { value: '28', label: t('statesUTs'), color: '#4ADE80' },
    { value: '₹12.4 Cr', label: t('avgDisbursed'), color: '#60A5FA' },
  ];

  const schemes = [
    { name: 'Pre-Matric Scholarship (ST)', ministry: 'Ministry of Tribal Affairs', amount: '₹3,500 – ₹7,000/yr', deadline: '31 Oct 2026', type: t('central') },
    { name: 'Post-Matric Scholarship (ST)', ministry: 'Ministry of Tribal Affairs', amount: 'Up to ₹1,50,000/yr', deadline: '15 Nov 2026', type: t('central') },
    { name: 'National Fellowship for ST', ministry: 'UGC', amount: '₹31,000/month', deadline: '30 Sep 2026', type: t('central') },
    { name: 'National Overseas Scholarship', ministry: 'Ministry of Tribal Affairs', amount: 'Full Funding', deadline: '28 Feb 2027', type: t('central') },
    { name: 'MahaDBT Scholarship (Maharashtra)', ministry: 'Govt of Maharashtra', amount: '₹5,000 – ₹80,000', deadline: '31 Oct 2026', type: t('state') },
  ];

  return (
    <div style={{minHeight:'100vh', fontFamily:'Inter, -apple-system, sans-serif', background:'#F8FAFC', color:'#1E293B'}}>
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Indian National Tricolor Accent Bar */}
      <div className="tricolor-bar" />

      {/* Official Government of India Header Strip */}
      <div style={{background:'#001E3D', padding:'8px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11.5, color:'rgba(255,255,255,0.85)', flexWrap:'wrap', gap:10}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:6, fontWeight:600}}>
            🇮🇳 {t('heroGovtBar')}
          </span>
          <span style={{opacity:0.4}}>|</span>
          <span style={{opacity:0.8}}>Ministry of Tribal Affairs (MoTA)</span>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.12)', padding:'4px 10px', borderRadius:20, border:'1px solid rgba(255,255,255,0.2)'}}>
            <Globe size={13} color="#FFD700" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ color: '#002147', background: 'white' }}>
                  {l.native} — {l.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{display:'flex', gap:4}}>
            {LANGUAGES.slice(0, 5).map((l) => (
              <button
                key={l.code}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  transition: 'all 0.15s',
                  background: lang === l.code ? 'var(--saffron)' : 'rgba(255,255,255,0.06)',
                  borderColor: lang === l.code ? 'var(--saffron)' : 'rgba(255,255,255,0.2)',
                  color: lang === l.code ? 'white' : 'rgba(255,255,255,0.85)'
                }}
                onClick={() => setLang(l.code)}
              >
                {l.native}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header style={{background:'rgba(255, 255, 255, 0.95)', backdropFilter:'blur(10px)', borderBottom:'1px solid #E2E8F0', padding:'0 36px', display:'flex', alignItems:'center', justifyContent:'space-between', height:76, position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 10px rgba(0,33,71,0.04)'}}>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div style={{width:46, height:46, background:'linear-gradient(135deg, #002147 0%, #0A3A6B 100%)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'white', boxShadow:'0 4px 12px rgba(0,33,71,0.25)', border:'2px solid #FFD700'}}>
            <GraduationCap size={24} color="#FFD700" />
          </div>
          <div>
            <div style={{fontWeight:800, fontSize:18, color:'#002147', lineHeight:1.2, letterSpacing:'-0.3px'}}>{t('brand')}</div>
            <div style={{fontSize:11.5, color:'#64748B', fontWeight:500}}>{t('portalTagline')}</div>
          </div>
        </div>

        <nav style={{display:'flex', gap:24, alignItems:'center'}}>
          {[
            { label: t('about'), path: '#about' },
            { label: t('scholarships'), path: '#schemes' },
            { label: t('faqs'), path: '#how-it-works' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.path}
              style={{fontSize:13.5, fontWeight:600, color:'#475569', transition:'color 0.2s', textDecoration:'none'}}
              onMouseEnter={(e) => (e.target.style.color = '#002147')}
              onMouseLeave={(e) => (e.target.style.color = '#475569')}
            >
              {item.label}
            </a>
          ))}

          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
            style={{padding:'10px 22px', fontSize:13.5, borderRadius:10, boxShadow:'0 2px 8px rgba(0,33,71,0.25)'}}
          >
            {t('loginRegister')}
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{background:'linear-gradient(160deg, #001E3D 0%, #003366 50%, #0A4A86 100%)', padding:'88px 32px 108px', textAlign:'center', position:'relative', overflow:'hidden', color:'white'}}>
        {/* Subtle Ambient Radial Glows */}
        <div style={{position:'absolute', width:500, height:500, background:'radial-gradient(circle, rgba(255,107,26,0.12) 0%, transparent 70%)', top:-200, right:-100, pointerEvents:'none'}}/>
        <div style={{position:'absolute', width:450, height:450, background:'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)', bottom:-150, left:-100, pointerEvents:'none'}}/>

        <div style={{position:'relative', maxWidth:880, margin:'0 auto'}}>
          {/* Badge */}
          <div style={{display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,107,26,0.15)', border:'1px solid rgba(255,107,26,0.35)', borderRadius:30, padding:'7px 18px', marginBottom:24, fontSize:12.5, color:'#FFA366', fontWeight:700, letterSpacing:'0.5px'}}>
            <Sparkles size={14} color="#FF8C42" />
            BHASHINI MULTILINGUAL VOICE · DIGILOCKER · OFFLINE SUPPORT
          </div>

          <h1 style={{fontSize:46, fontWeight:900, lineHeight:1.15, marginBottom:20, letterSpacing:'-0.5px', textShadow:'0 2px 10px rgba(0,0,0,0.2)'}}>
            {t('heroTitle')}
          </h1>

          <p style={{fontSize:16.5, color:'rgba(255,255,255,0.85)', maxWidth:680, margin:'0 auto 38px', lineHeight:1.7, fontWeight:400}}>
            {t('heroSubtitle')}
          </p>

          <div style={{display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap'}}>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-saffron"
              style={{padding:'14px 34px', fontSize:15.5, borderRadius:12, fontWeight:700, display:'flex', alignItems:'center', gap:10, boxShadow:'0 6px 24px rgba(255,107,26,0.45)'}}
            >
              <span>{t('checkMyEligibility')}</span> <ArrowRight size={18}/>
            </button>
            <button
              onClick={openAdmin}
              className="btn"
              style={{padding:'14px 28px', fontSize:15, borderRadius:12, background:'rgba(255,255,255,0.1)', color:'white', border:'1.5px solid rgba(255,255,255,0.3)', backdropFilter:'blur(8px)', fontWeight:600}}
            >
              {config.demoMode ? t('admin') : t('loginRegister')}
            </button>
          </div>

          {/* Stats Bar */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:16, marginTop:64, maxWidth:800, margin:'64px auto 0'}}>
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  background:'rgba(255,255,255,0.06)',
                  backdropFilter:'blur(8px)',
                  border:'1px solid rgba(255,255,255,0.12)',
                  borderRadius:16,
                  padding:'18px 16px',
                  textAlign:'center',
                  transition:'transform 0.2s',
                }}
              >
                <div style={{fontSize:30, fontWeight:900, color:s.color, lineHeight:1.1}}>{s.value}</div>
                <div style={{fontSize:12.5, color:'rgba(255,255,255,0.75)', marginTop:6, fontWeight:500}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{padding:'80px 32px', background:'white', textAlign:'center'}}>
        <div style={{maxWidth:1080, margin:'0 auto'}}>
          <div style={{fontSize:12.5, fontWeight:700, letterSpacing:2, color:'var(--saffron)', textTransform:'uppercase', marginBottom:8}}>
            {t('howItWorksHeading')}
          </div>
          <h2 style={{fontSize:32, fontWeight:800, color:'#002147', marginBottom:48, letterSpacing:'-0.3px'}}>
            {t('step1Title')} → {t('step4Title')}
          </h2>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:24, position:'relative'}}>
            {[
              { step:'01', title: t('step1Title'), desc: t('step1Desc'), icon: ShieldCheck, color:'#003366', bg:'#F0F4FA' },
              { step:'02', title: t('step2Title'), desc: t('step2Desc'), icon: CheckCircle2, color:'#16A34A', bg:'#F0FDF4' },
              { step:'03', title: t('step3Title'), desc: t('step3Desc'), icon: FolderSync, color:'#FF6B1A', bg:'#FFF7ED' },
              { step:'04', title: t('step4Title'), desc: t('step4Desc'), icon: Award, color:'#7C3AED', bg:'#FAF5FF' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background:'#F8FAFC',
                  borderRadius:16,
                  padding:'28px 20px',
                  border:'1.5px solid #E2E8F0',
                  textAlign:'center',
                  transition:'all 0.2s',
                  position:'relative'
                }}
              >
                <div style={{width:58, height:58, background:s.bg, color:s.color, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', border:`1px solid ${s.color}30`, boxShadow:`0 4px 12px ${s.color}15`}}>
                  <s.icon size={26} />
                </div>
                <div style={{fontSize:11.5, fontWeight:800, color:s.color, letterSpacing:'1px', marginBottom:6}}>
                  STEP {s.step}
                </div>
                <div style={{fontSize:16, fontWeight:700, color:'#002147', marginBottom:8}}>{s.title}</div>
                <div style={{fontSize:13, color:'#64748B', lineHeight:1.6}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="about" style={{padding:'80px 32px', background:'#F1F5F9'}}>
        <div style={{maxWidth:1140, margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:48}}>
            <div style={{fontSize:12.5, fontWeight:700, letterSpacing:2, color:'var(--saffron)', textTransform:'uppercase', marginBottom:8}}>
              {t('featuresHeading')}
            </div>
            <h2 style={{fontSize:32, fontWeight:800, color:'#002147', letterSpacing:'-0.3px'}}>{t('brand')}</h2>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:20}}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  background:'white',
                  borderRadius:16,
                  padding:'28px',
                  border:'1.5px solid #E2E8F0',
                  boxShadow:'0 2px 6px rgba(0,33,71,0.03)',
                  transition:'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor:'default'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,33,71,0.08)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,33,71,0.03)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{width:50, height:50, borderRadius:14, background:f.bg, color:f.color, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, border:`1px solid ${f.color}25`}}>
                  <f.icon size={24} />
                </div>
                <div style={{fontSize:16, fontWeight:700, color:'#002147', marginBottom:8}}>{f.title}</div>
                <div style={{fontSize:13.5, color:'#64748B', lineHeight:1.65}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Schemes Preview */}
      <section id="schemes" style={{padding:'80px 32px', background:'white'}}>
        <div style={{maxWidth:1000, margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:40}}>
            <div style={{fontSize:12.5, fontWeight:700, letterSpacing:2, color:'var(--saffron)', textTransform:'uppercase', marginBottom:8}}>
              {t('featuredHeading')}
            </div>
            <h2 style={{fontSize:32, fontWeight:800, color:'#002147', letterSpacing:'-0.3px'}}>{t('scholarships')}</h2>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {schemes.map((s, i) => (
              <div
                key={i}
                style={{
                  display:'flex',
                  alignItems:'center',
                  gap:18,
                  padding:'18px 24px',
                  border:'1.5px solid #E2E8F0',
                  borderRadius:14,
                  background:'white',
                  transition:'all 0.2s',
                  cursor:'pointer',
                  borderLeft:`5px solid ${s.type === t('central') ? '#003366' : 'var(--saffron)'}`
                }}
                onClick={() => navigate('/login')}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,33,71,0.06)';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{flex:1}}>
                  <div style={{fontSize:15.5, fontWeight:700, color:'#002147'}}>{s.name}</div>
                  <div style={{fontSize:12.5, color:'#64748B', marginTop:3, display:'flex', alignItems:'center', gap:6}}>
                    <Building2 size={13} color="#94A3B8" /> {s.ministry}
                  </div>
                </div>

                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:16, fontWeight:800, color:'var(--saffron-dark)'}}>{s.amount}</div>
                  <div style={{fontSize:11.5, color:'#D97706', marginTop:2, display:'flex', alignItems:'center', gap:4, justifyContent:'flex-end'}}>
                    <Calendar size={12} /> {s.deadline}
                  </div>
                </div>

                <div style={{
                  padding:'4px 12px',
                  borderRadius:20,
                  fontSize:11.5,
                  fontWeight:700,
                  background: s.type === t('central') ? '#F0F4FA' : '#FFF7ED',
                  color: s.type === t('central') ? '#003366' : 'var(--saffron-dark)',
                  border: `1px solid ${s.type === t('central') ? '#D2DFEE' : '#FFEDD5'}`
                }}>
                  {s.type}
                </div>
              </div>
            ))}
          </div>

          <div style={{textAlign:'center', marginTop:32}}>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{padding:'12px 30px', fontSize:14.5, borderRadius:10}}
            >
              <span>{t('viewAllSchemes')}</span> <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{background:'linear-gradient(135deg, #FF6B1A 0%, #E55400 100%)', padding:'64px 32px', textAlign:'center', color:'white'}}>
        <div style={{maxWidth:600, margin:'0 auto'}}>
          <h2 style={{fontSize:32, fontWeight:900, marginBottom:12, letterSpacing:'-0.3px'}}>{t('ctaTitle')}</h2>
          <p style={{fontSize:15.5, color:'rgba(255,255,255,0.92)', marginBottom:30, lineHeight:1.6}}>
            {t('ctaSubtitle')}
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding:'14px 36px',
              background:'white',
              color:'var(--saffron-dark)',
              borderRadius:12,
              fontSize:15.5,
              fontWeight:800,
              border:'none',
              cursor:'pointer',
              boxShadow:'0 6px 20px rgba(0,0,0,0.18)',
              transition:'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {t('ctaButton')}
          </button>
        </div>
      </section>

      {/* Official Government Footer */}
      <footer style={{background:'#001830', padding:'48px 32px 24px', color:'rgba(255,255,255,0.65)', fontSize:12.5}}>
        <div style={{maxWidth:1140, margin:'0 auto'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20, borderBottom:'1px solid rgba(255,255,255,0.08)', paddingBottom:24, marginBottom:24}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div style={{width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <GraduationCap size={20} color="#FFD700" />
              </div>
              <div>
                <div style={{fontWeight:800, color:'white', fontSize:15}}>{t('brand')}</div>
                <div style={{fontSize:11.5, color:'rgba(255,255,255,0.5)'}}>{t('portalTagline')}</div>
              </div>
            </div>

            <div style={{color:'rgba(255,255,255,0.8)', fontSize:12.5}}>
              {t('footerGovt')}
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, fontSize:12, color:'rgba(255,255,255,0.5)'}}>
            <span>© 2026 Ministry of Tribal Affairs, Government of India. All rights reserved.</span>
            <span>SIH 2026 · Multilingual Voice-Enabled Tribal Education Portal</span>
          </div>
        </div>
      </footer>

      {/* Floating Interactive AI Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
}
