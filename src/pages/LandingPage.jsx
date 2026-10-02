import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Globe, Wifi, Users, BookOpen, Mic, Shield } from 'lucide-react';

const features = [
  { icon: '🔍', title: 'One Profile, Every Scheme', desc: 'Fill your details once. Get all scholarships you qualify for instantly.' },
  { icon: '✅', title: 'Smart Eligibility Check', desc: 'Answer 5 simple questions. Know exactly which schemes you qualify for.' },
  { icon: '📁', title: 'DigiLocker Integration', desc: 'Fetch caste, income & domicile certificates automatically.' },
  { icon: '🗣️', title: 'Voice in Your Language', desc: 'Supports Marathi, Hindi, Tamil, Telugu and tribal languages via Bhashini.' },
  { icon: '📶', title: 'Works Offline', desc: 'Fill forms without internet. They sync when signal returns.' },
  { icon: '👨‍🏫', title: 'Assisted Mode', desc: 'Teachers & CSC operators can apply on behalf of students.' },
];

const stats = [
  { value: '47+', label: 'Active Schemes', color: '#FF6B1A' },
  { value: '12 L+', label: 'ST Students Covered', color: '#FFD700' },
  { value: '28', label: 'States & UTs', color: '#4CAF50' },
  { value: '₹1.2 Cr', label: 'Avg Disbursed / Year', color: '#29B6F6' },
];

const schemes = [
  { name: 'Pre-Matric Scholarship (ST)', ministry: 'Ministry of Tribal Affairs', amount: '₹3,500 – ₹7,000/yr', deadline: '31 Oct 2026', type: 'Central' },
  { name: 'Post-Matric Scholarship (ST)', ministry: 'Ministry of Tribal Affairs', amount: 'Up to ₹1,50,000/yr', deadline: '15 Nov 2026', type: 'Central' },
  { name: 'National Fellowship for ST', ministry: 'UGC', amount: '₹31,000/month', deadline: '30 Sep 2026', type: 'Central' },
  { name: 'National Overseas Scholarship', ministry: 'Ministry of Tribal Affairs', amount: 'Full Funding', deadline: '28 Feb 2027', type: 'Central' },
  { name: 'MahaDBT Scholarship (Maharashtra)', ministry: 'Govt of Maharashtra', amount: '₹5,000 – ₹80,000', deadline: '31 Oct 2026', type: 'State' },
];

export default function LandingPage({ onLogin }) {
  const navigate = useNavigate();

  return (
    <div style={{minHeight:'100vh', fontFamily:'Inter, sans-serif', background:'#F4F6FB'}}>

      {/* Government Top Bar */}
      <div style={{background:'#002147', padding:'7px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,0.7)'}}>
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          <span>🇮🇳 Government of India</span>
          <span>|</span>
          <span>Ministry of Tribal Affairs</span>
        </div>
        <div style={{display:'flex', gap:16}}>
          <span style={{cursor:'pointer'}}>Screen Reader</span>
          <span style={{cursor:'pointer'}}>A- A A+</span>
          <span style={{cursor:'pointer'}}>हिंदी</span>
        </div>
      </div>

      {/* Header */}
      <header style={{background:'white', borderBottom:'1px solid #DDE1EE', padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', height:72, position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 8px rgba(0,33,71,0.06)'}}>
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          <div style={{width:48, height:48, background:'linear-gradient(135deg,#003366,#1A5FAD)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22}}>
            🏛️
          </div>
          <div>
            <div style={{fontWeight:800, fontSize:15, color:'#003366', lineHeight:1.2}}>ST Scholarship Portal</div>
            <div style={{fontSize:11, color:'#68738F'}}>Unified Scholarship Management System</div>
          </div>
        </div>
        <nav style={{display:'flex', gap:24, alignItems:'center'}}>
          {['About', 'Schemes', 'FAQs', 'Contact'].map(l => (
            <span key={l} style={{fontSize:13, fontWeight:500, color:'#4B5470', cursor:'pointer', transition:'color 0.2s'}}
              onMouseEnter={e => e.target.style.color='#003366'}
              onMouseLeave={e => e.target.style.color='#4B5470'}
            >{l}</span>
          ))}
          <button
            onClick={() => navigate('/login')}
            style={{padding:'9px 20px', background:'#003366', color:'white', borderRadius:8, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.2s'}}
            onMouseEnter={e => e.target.style.background='#004488'}
            onMouseLeave={e => e.target.style.background='#003366'}
          >Login / Register</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{background:'linear-gradient(160deg, #003366 0%, #004488 55%, #003D80 100%)', padding:'80px 32px 100px', textAlign:'center', position:'relative', overflow:'hidden'}}>
        {/* Decorative circles */}
        <div style={{position:'absolute', width:400, height:400, background:'rgba(255,107,26,0.08)', borderRadius:'50%', top:-150, right:-100}}/>
        <div style={{position:'absolute', width:300, height:300, background:'rgba(255,215,0,0.05)', borderRadius:'50%', bottom:-100, left:-80}}/>

        <div style={{position:'relative', maxWidth:800, margin:'0 auto'}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,107,26,0.15)', border:'1px solid rgba(255,107,26,0.3)', borderRadius:20, padding:'6px 16px', marginBottom:24, fontSize:12, color:'#FFA366', fontWeight:600}}>
            ✨ POWERED BY BHASHINI + DIGILOCKER
          </div>
          <h1 style={{fontSize:48, fontWeight:900, color:'white', lineHeight:1.1, marginBottom:16}}>
            Every Tribal Student<br/>
            <span style={{background:'linear-gradient(90deg, #FF6B1A, #FFD700)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
              Deserves Their Scholarship
            </span>
          </h1>
          <p style={{fontSize:16, color:'rgba(255,255,255,0.75)', maxWidth:560, margin:'0 auto 36px', lineHeight:1.7}}>
            One platform for all tribal scholarship schemes. Check eligibility instantly, upload documents once, and track your application status in real time.
          </p>
          <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
            <button
              onClick={() => navigate('/login')}
              style={{padding:'14px 32px', background:'linear-gradient(135deg, #FF6B1A, #FF8C42)', color:'white', borderRadius:10, fontSize:15, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 20px rgba(255,107,26,0.4)'}}
            >
              Check My Eligibility <ArrowRight size={16}/>
            </button>
            <button
              onClick={() => onLogin('admin')}
              style={{padding:'14px 28px', background:'rgba(255,255,255,0.1)', color:'white', borderRadius:10, fontSize:15, fontWeight:600, border:'1.5px solid rgba(255,255,255,0.25)', cursor:'pointer', backdropFilter:'blur(4px)'}}
            >
              Admin Dashboard
            </button>
          </div>

          {/* Stats Row */}
          <div style={{display:'flex', gap:0, justifyContent:'center', marginTop:56, flexWrap:'wrap'}}>
            {stats.map((s, i) => (
              <div key={i} style={{padding:'0 32px', borderRight: i < stats.length-1 ? '1px solid rgba(255,255,255,0.15)' : 'none', textAlign:'center'}}>
                <div style={{fontSize:28, fontWeight:900, color:s.color}}>{s.value}</div>
                <div style={{fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{padding:'70px 32px', background:'white', textAlign:'center'}}>
        <div style={{fontSize:12, fontWeight:700, letterSpacing:2, color:'#FF6B1A', textTransform:'uppercase', marginBottom:8}}>HOW IT WORKS</div>
        <h2 style={{fontSize:32, fontWeight:800, color:'#003366', marginBottom:40}}>Apply in 4 Simple Steps</h2>
        <div style={{display:'flex', gap:0, justifyContent:'center', maxWidth:900, margin:'0 auto', flexWrap:'wrap'}}>
          {[
            {step:'01', title:'Create Profile', desc:'Enter your personal, family, academic and income details once.', icon:'👤'},
            {step:'02', title:'Check Eligibility', desc:'Our engine matches your profile against all 47+ active schemes.', icon:'✅'},
            {step:'03', title:'Upload Documents', desc:'Fetch from DigiLocker or upload photos with quality check.', icon:'📂'},
            {step:'04', title:'Track Status', desc:'Get SMS/push alerts on every status change and payment update.', icon:'📱'},
          ].map((s, i) => (
            <div key={i} style={{flex:1, minWidth:180, padding:'24px 20px', position:'relative'}}>
              {i < 3 && <div style={{position:'absolute', right:0, top:'40%', fontSize:20, color:'#DDE1EE'}}>→</div>}
              <div style={{width:56, height:56, background:'linear-gradient(135deg, #003366, #1A5FAD)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 12px', boxShadow:'0 4px 16px rgba(0,51,102,0.2)'}}>
                {s.icon}
              </div>
              <div style={{fontSize:11, fontWeight:800, color:'rgba(0,51,102,0.3)', letterSpacing:1, marginBottom:4}}>STEP {s.step}</div>
              <div style={{fontSize:15, fontWeight:700, color:'#003366', marginBottom:6}}>{s.title}</div>
              <div style={{fontSize:12, color:'#68738F', lineHeight:1.6}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{padding:'70px 32px', background:'#F4F6FB'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:40}}>
            <div style={{fontSize:12, fontWeight:700, letterSpacing:2, color:'#FF6B1A', textTransform:'uppercase', marginBottom:8}}>FEATURES</div>
            <h2 style={{fontSize:32, fontWeight:800, color:'#003366'}}>Built for Tribal Students</h2>
            <p style={{fontSize:14, color:'#68738F', marginTop:8}}>Designed around the real challenges that prevent eligible students from receiving scholarships</p>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16}}>
            {features.map((f, i) => (
              <div key={i} style={{background:'white', borderRadius:12, padding:'24px', border:'1px solid #DDE1EE', transition:'all 0.2s', cursor:'default'}}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 24px rgba(0,33,71,0.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)'; }}
              >
                <div style={{fontSize:28, marginBottom:12}}>{f.icon}</div>
                <div style={{fontSize:14, fontWeight:700, color:'#003366', marginBottom:6}}>{f.title}</div>
                <div style={{fontSize:12.5, color:'#68738F', lineHeight:1.6}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Schemes Preview */}
      <section style={{padding:'70px 32px', background:'white'}}>
        <div style={{maxWidth:1000, margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:36}}>
            <div style={{fontSize:12, fontWeight:700, letterSpacing:2, color:'#FF6B1A', textTransform:'uppercase', marginBottom:8}}>SCHEMES</div>
            <h2 style={{fontSize:32, fontWeight:800, color:'#003366'}}>Available Scholarships</h2>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {schemes.map((s, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:16, padding:'16px 20px', border:'1.5px solid #DDE1EE', borderRadius:10, background:'white', transition:'all 0.2s', cursor:'pointer', borderLeft:`4px solid ${s.type === 'Central' ? '#1A5FAD' : '#FF6B1A'}`}}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(0,33,71,0.08)'; e.currentTarget.style.background='#F8F9FC'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.background='white'; }}
              >
                <div style={{flex:1}}>
                  <div style={{fontSize:14, fontWeight:700, color:'#003366'}}>{s.name}</div>
                  <div style={{fontSize:12, color:'#68738F', marginTop:2}}>{s.ministry}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:15, fontWeight:800, color:'#E55A0A'}}>{s.amount}</div>
                  <div style={{fontSize:11, color:'#D4800A', marginTop:2}}>⏰ Deadline: {s.deadline}</div>
                </div>
                <div style={{padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: s.type === 'Central' ? 'rgba(26,95,173,0.1)' : 'rgba(255,107,26,0.1)', color: s.type === 'Central' ? '#1A5FAD' : '#E55A0A'}}>
                  {s.type}
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center', marginTop:24}}>
            <button
              onClick={() => navigate('/login')}
              style={{padding:'12px 28px', background:'#003366', color:'white', borderRadius:8, fontSize:13, fontWeight:700, border:'none', cursor:'pointer'}}
            >
              View All 47+ Schemes →
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{background:'linear-gradient(135deg, #FF6B1A, #E55A0A)', padding:'60px 32px', textAlign:'center'}}>
        <h2 style={{fontSize:32, fontWeight:900, color:'white', marginBottom:12}}>Start Your Application Today</h2>
        <p style={{fontSize:15, color:'rgba(255,255,255,0.85)', marginBottom:28, maxWidth:500, margin:'0 auto 28px'}}>
          Don't let deadlines pass. Check your eligibility in under 2 minutes.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{padding:'14px 36px', background:'white', color:'#E55A0A', borderRadius:10, fontSize:15, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}
        >
          Get Started — It's Free
        </button>
      </section>

      {/* Footer */}
      <footer style={{background:'#0D1120', padding:'40px 32px 20px', color:'rgba(255,255,255,0.6)', fontSize:12}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:32, marginBottom:32}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
                <div style={{fontSize:20}}>🏛️</div>
                <div style={{fontWeight:700, color:'white', fontSize:13}}>ST Scholarship Portal</div>
              </div>
              <p style={{lineHeight:1.7, maxWidth:280}}>A unified platform by the Ministry of Tribal Affairs for Scheduled Tribe students across India.</p>
            </div>
            {[
              {title:'Quick Links', links:['Home','Eligibility Checker','Schemes List','Apply Now']},
              {title:'Resources', links:['User Guide','FAQs','Video Tutorials','Help Desk']},
              {title:'Government', links:['Ministry of Tribal Affairs','NSP Portal','DigiLocker','PFMS']},
            ].map(col => (
              <div key={col.title}>
                <div style={{fontWeight:700, color:'white', marginBottom:12}}>{col.title}</div>
                {col.links.map(l => <div key={l} style={{marginBottom:6, cursor:'pointer'}}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8}}>
            <span>© 2026 Ministry of Tribal Affairs, Government of India. All rights reserved.</span>
            <span>Version 1.0 | Last Updated: Oct 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
