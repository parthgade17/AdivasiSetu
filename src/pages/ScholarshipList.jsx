import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Clock, MapPin, ExternalLink, Mic } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ListenButton from '../components/ListenButton';
import { listen } from '../services/voice';

const categories = ['All', 'Pre-Matric', 'Post-Matric', 'Fellowship', 'Overseas', 'State Scheme'];
const types = ['All', 'central', 'state', 'private'];

export default function ScholarshipList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState('deadline');
  const [listening, setListening] = useState(false);
  const { schemes: SCHEMES, applyToScheme, isApplied, t, lang, toast, role } = useApp();
  const canApply = role !== 'admin';

  const voiceSearch = () => {
    const r = listen(lang, text => setSearch(text), () => setListening(false));
    if (r) setListening(true); else toast(t('voiceUnsupported'), 'error');
  };

  const filtered = SCHEMES.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.ministry.toLowerCase().includes(q);
    const matchCat = selectedCat === 'All' || s.category === selectedCat;
    const matchType = selectedType === 'All' || s.type === selectedType;
    const matchEligible = !showEligibleOnly || s.eligible;
    return matchQ && matchCat && matchType && matchEligible;
  }).sort((a, b) => {
    if (sortBy === 'eligible') return (b.eligible ? 1 : 0) - (a.eligible ? 1 : 0) || a.daysLeft - b.daysLeft;
    if (sortBy === 'amount') return (b.amountValue || 0) - (a.amountValue || 0);
    const da = a.daysLeft < 0 ? 9999 : a.daysLeft, db = b.daysLeft < 0 ? 9999 : b.daysLeft;
    return da - db;
  });

  const urgentCount = SCHEMES.filter(s => s.daysLeft >= 0 && s.daysLeft <= 20).length;

  const catLabels = {
    'All': t('all'),
    'Pre-Matric': t('preMatric'),
    'Post-Matric': t('postMatric'),
    'Fellowship': t('fellowship'),
    'Overseas': t('overseas'),
    'State Scheme': t('stateScheme'),
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <h1 className="page-title">{t('scholarships')}</h1>
          <p className="page-subtitle">{SCHEMES.length} {t('activeSchemes')} · <span style={{color:'#D4800A', fontWeight:600}}>{t('closingSoon', { n: urgentCount })}</span></p>
        </div>
        <button className="btn btn-saffron" onClick={() => navigate('/eligibility')}>
          {t('checkEligibility')}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{marginBottom:20, padding:'16px 20px'}}>
        <div style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'center'}}>
          <div style={{flex:1, minWidth:220, display:'flex', alignItems:'center', gap:8, padding:'9px 12px', border:'1.5px solid #DDE1EE', borderRadius:8, background:'#F8F9FC'}}>
            <Search size={14} color="#9AA3BC"/>
            <input
              placeholder={t('searchSchemes')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{border:'none', background:'none', fontSize:13, flex:1, color:'#1E2541', outline:'none'}}
            />
            <button onClick={voiceSearch} title={t('voiceSearch')} aria-label={t('voiceSearch')}
              style={{background:'none', border:'none', cursor:'pointer', color: listening ? '#FF6B1A' : '#68738F', display:'flex'}}>
              <Mic size={15}/>
            </button>
          </div>
          <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
            {categories.map(c => (
              <button
                key={c}
                className={`filter-chip${selectedCat === c ? ' active' : ''}`}
                onClick={() => setSelectedCat(c)}
              >{catLabels[c] || c}</button>
            ))}
          </div>
          <button
            onClick={() => setShowEligibleOnly(e => !e)}
            style={{
              padding:'7px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
              border:`1.5px solid ${showEligibleOnly ? '#1B7A3E' : '#DDE1EE'}`,
              background: showEligibleOnly ? '#1B7A3E' : 'white',
              color: showEligibleOnly ? 'white' : '#4B5470',
              display:'flex', alignItems:'center', gap:6
            }}
          >
            ✅ {t('eligibleTag')}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <span style={{fontSize:13, color:'#68738F', fontWeight:500}}>{filtered.length} {t('scholarships')}</span>
        <select className="form-control" style={{width:'auto', fontSize:12, padding:'5px 10px'}} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="deadline">{t('sortDeadline')}</option>
          <option value="amount">{t('sortAmount')}</option>
          <option value="eligible">{t('sortEligible')}</option>
        </select>
      </div>

      {/* Scheme Cards */}
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {filtered.map(s => (
          <div
            key={s.id}
            style={{
              background:'white', borderRadius:12,
              border:`1.5px solid ${s.eligible ? 'rgba(27,122,62,0.25)' : '#DDE1EE'}`,
              borderLeft:`4px solid ${s.type === 'central' ? '#003366' : '#FF6B1A'}`,
              overflow:'hidden', transition:'all 0.2s', cursor:'pointer'
            }}
            onClick={() => setExpanded(expanded === s.id ? null : s.id)}
          >
            {/* Card Header */}
            <div style={{padding:'16px 20px', display:'flex', gap:16, alignItems:'flex-start'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:4}}>
                  {s.eligible && <span className="badge badge-green">✓ You're Eligible</span>}
                  <span className={`badge ${s.type === 'central' ? 'badge-navy' : 'badge-saffron'}`}>
                    {s.type === 'central' ? '🏛️ Central' : '🏙️ State'}
                  </span>
                  <span className="badge badge-blue">{s.category}</span>
                  {s.daysLeft >= 0 && s.daysLeft <= 14 && (
                    <span className="badge badge-red">⚡ {s.daysLeft}d left</span>
                  )}
                  {s.daysLeft < 0 && <span className="badge badge-red">Deadline Passed</span>}
                </div>
                <h3 style={{fontSize:14, fontWeight:700, color:'#003366', marginBottom:3}}>{s.name}</h3>
                <div style={{fontSize:12, color:'#68738F', display:'flex', alignItems:'center', gap:8}}>
                  <span>🏛️ {s.ministry}</span>
                  <span>·</span>
                  <MapPin size={11}/> {s.states}
                </div>
              </div>
              <div style={{textAlign:'right', flexShrink:0}}>
                <div style={{fontSize:20, fontWeight:900, color:'#E55A0A'}}>{s.amount}</div>
                <div style={{fontSize:11, color:'#9AA3BC'}}>{s.period}</div>
                {s.daysLeft >= 0 && (
                  <div style={{display:'flex', alignItems:'center', gap:4, marginTop:6, justifyContent:'flex-end', color:'#D4800A', fontSize:12, fontWeight:600}}>
                    <Clock size={12}/> {s.deadline}
                  </div>
                )}
              </div>
              <div style={{color:'#9AA3BC', flexShrink:0, marginTop:4}}>
                <ChevronRight size={18} style={{transform: expanded === s.id ? 'rotate(90deg)' : 'none', transition:'transform 0.2s'}}/>
              </div>
            </div>

            {/* Expanded Details */}
            {expanded === s.id && (
              <div style={{padding:'0 20px 20px', borderTop:'1px solid #EFF1F7'}} className="fade-in">
                <p style={{fontSize:13, color:'#4B5470', marginTop:14, lineHeight:1.7, marginBottom:16}}>{s.description}</p>
                {s.eligible === false && s.failed?.length > 0 && (
                  <div className="alert alert-warning" style={{marginBottom:16}}>Why not eligible: {s.failed.join(' · ')}</div>
                )}
                <div className="grid-2" style={{gap:20}}>
                  <div>
                    <div style={{fontSize:12, fontWeight:700, color:'#003366', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px'}}>Eligibility Criteria</div>
                    {s.criteria.map((c, i) => (
                      <div key={i} style={{display:'flex', gap:8, fontSize:12, color:'#4B5470', marginBottom:6}}>
                        <span style={{color:'#1B7A3E', flexShrink:0}}>✓</span> {c}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:12, fontWeight:700, color:'#003366', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px'}}>Documents Required</div>
                    {s.documents.map((d, i) => (
                      <div key={i} style={{display:'flex', gap:8, fontSize:12, color:'#4B5470', marginBottom:6}}>
                        <span style={{color:'#FF6B1A', flexShrink:0}}>📄</span> {d}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex', gap:10, marginTop:16, paddingTop:16, borderTop:'1px solid #EFF1F7', flexWrap:'wrap'}}>
                  {!canApply ? null : isApplied(s.id) ? (
                    <button className="btn btn-outline" onClick={e => { e.stopPropagation(); navigate('/applications'); }}>
                      ✓ {t('alreadyApplied')}
                    </button>
                  ) : s.eligible ? (
                    <button
                      className="btn btn-saffron"
                      onClick={async e => { e.stopPropagation(); const r = await applyToScheme(s); if (r) navigate('/applications'); }}
                    >
                      {t('applyNow')} <ChevronRight size={14}/>
                    </button>
                  ) : s.eligible === false ? (
                    <button className="btn btn-outline" disabled style={{opacity:0.6}} title={(s.failed || []).join(', ')}>
                      {t('notEligibleTag')}
                    </button>
                  ) : (
                    <button className="btn btn-outline" onClick={e => { e.stopPropagation(); navigate('/eligibility'); }}>
                      {t('checkEligibility')}
                    </button>
                  )}
                  <ListenButton scheme={s}/>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={e => { e.stopPropagation(); navigate('/documents'); }}
                  >
                    {t('documents')}
                  </button>
                  <a href={s.link} target="_blank" rel="noreferrer">
                    <button className="btn btn-outline btn-sm" onClick={e => e.stopPropagation()}>
                      <ExternalLink size={13}/> Portal
                    </button>
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{textAlign:'center', padding:'60px 32px', background:'white', borderRadius:12, border:'1px solid #DDE1EE'}}>
          <div style={{fontSize:48, marginBottom:16}}>🔍</div>
          <h3 style={{fontSize:16, fontWeight:700, color:'#003366', marginBottom:6}}>{t('noSchemesMatch')}</h3>
          <p style={{fontSize:13, color:'#68738F'}}>{t('searchSchemes')}</p>
          <button className="btn btn-outline" style={{marginTop:16}} onClick={() => { setSearch(''); setSelectedCat('All'); setShowEligibleOnly(false); }}>
            {t('cancel')}
          </button>
        </div>
      )}
    </div>
  );
}
