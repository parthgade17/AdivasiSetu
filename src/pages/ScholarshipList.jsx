import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, Clock, BookOpen, IndianRupee, MapPin, ExternalLink } from 'lucide-react';

const SCHEMES = [
  {
    id: 1, name: 'Pre-Matric Scholarship for ST Students', ministry: 'Ministry of Tribal Affairs',
    amount: '₹3,500 – ₹7,000', period: 'per year', deadline: '31 Oct 2026', daysLeft: 30,
    type: 'central', category: 'Pre-Matric', eligible: true,
    description: 'For ST students studying in Class 6 to 10. Covers tuition fees, maintenance allowance and study allowance.',
    criteria: ['Class 6 to 10', 'Annual family income ≤ ₹2.5 Lakh', 'ST Certificate required', 'Domicile certificate of state'],
    documents: ['ST/Caste Certificate', 'Income Certificate', 'Previous marksheet', 'Aadhaar Card', 'Bank passbook'],
    states: 'All States / UTs', link: 'https://scholarships.gov.in'
  },
  {
    id: 2, name: 'Post-Matric Scholarship for ST Students', ministry: 'Ministry of Tribal Affairs',
    amount: 'Up to ₹1,50,000', period: 'per year', deadline: '15 Nov 2026', daysLeft: 45,
    type: 'central', category: 'Post-Matric', eligible: true,
    description: 'Covers tuition fees and maintenance for ST students enrolled in Class 11 and above, including professional courses.',
    criteria: ['Class 11 and above', 'Annual family income ≤ ₹2.5 Lakh', 'Recognized institution', 'Not availing other central scholarship'],
    documents: ['ST Certificate', 'Income Certificate', 'Admission letter', 'Fee receipt', 'Bank account with IFSC'],
    states: 'All States / UTs', link: 'https://scholarships.gov.in'
  },
  {
    id: 3, name: 'National Fellowship for Higher Education (ST)', ministry: 'UGC',
    amount: '₹31,000 + HRA', period: 'per month', deadline: '30 Sep 2026', daysLeft: -1,
    type: 'central', category: 'Fellowship', eligible: false,
    description: 'JRF/SRF level fellowship for ST students enrolled in M.Phil/Ph.D programs at recognized universities.',
    criteria: ['Enrolled in M.Phil or Ph.D', 'NET/JRF qualified or exempted', 'Age ≤ 35 years', 'Not employed full-time'],
    documents: ['UGC-NET scorecard', 'Enrollment letter', 'ST Certificate', 'Research guide approval'],
    states: 'All States / UTs', link: 'https://ugc.ac.in'
  },
  {
    id: 4, name: 'National Overseas Scholarship for ST', ministry: 'Ministry of Tribal Affairs',
    amount: 'Full Funding (abroad)', period: 'entire course', deadline: '28 Feb 2027', daysLeft: 150,
    type: 'central', category: 'Overseas', eligible: false,
    description: 'Funding for ST students to pursue Masters or Ph.D abroad at recognized international universities.',
    criteria: ['PG or Ph.D at foreign university', 'Age ≤ 35 years', 'Income ≤ ₹6 Lakh', 'First time applicant'],
    documents: ['Offer letter from foreign university', 'ST Certificate', 'Income affidavit', 'Passport copy'],
    states: 'All States / UTs', link: 'https://tribal.nic.in'
  },
  {
    id: 5, name: 'MahaDBT Scholarship – Maharashtra', ministry: 'Govt of Maharashtra',
    amount: '₹5,000 – ₹80,000', period: 'per year', deadline: '31 Oct 2026', daysLeft: 30,
    type: 'state', category: 'State Scheme', eligible: true,
    description: 'Consolidated scholarship for ST students in Maharashtra through the MahaDBT portal covering multiple sub-schemes.',
    criteria: ['Maharashtra domicile', 'Annual income ≤ ₹8 Lakh', 'Enrolled in recognized institution in MH', 'ST Certificate from MH'],
    documents: ['Maharashtra domicile certificate', 'ST Certificate (MH)', 'Income Certificate', 'College bonafide certificate'],
    states: 'Maharashtra only', link: 'https://mahadbt.maharashtra.gov.in'
  },
  {
    id: 6, name: 'Rajiv Gandhi Eklavya Scholarship – MP', ministry: 'Govt of Madhya Pradesh',
    amount: '₹10,000 – ₹40,000', period: 'per year', deadline: '20 Oct 2026', daysLeft: 19,
    type: 'state', category: 'State Scheme', eligible: false,
    description: 'For ST students from MP pursuing professional and technical courses at recognized institutions.',
    criteria: ['MP domicile', 'Enrolled in professional/technical UG/PG', 'Income ≤ ₹6 Lakh', 'ST Certificate from MP'],
    documents: ['MP domicile', 'MP ST Certificate', 'College enrollment proof', 'Fee structure'],
    states: 'Madhya Pradesh only', link: 'https://scholarshipportal.mp.nic.in'
  },
];

const categories = ['All', 'Pre-Matric', 'Post-Matric', 'Fellowship', 'Overseas', 'State Scheme'];
const types = ['All', 'central', 'state', 'private'];

export default function ScholarshipList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const filtered = SCHEMES.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.ministry.toLowerCase().includes(q);
    const matchCat = selectedCat === 'All' || s.category === selectedCat;
    const matchType = selectedType === 'All' || s.type === selectedType;
    const matchEligible = !showEligibleOnly || s.eligible;
    return matchQ && matchCat && matchType && matchEligible;
  });

  const urgentCount = SCHEMES.filter(s => s.daysLeft >= 0 && s.daysLeft <= 20).length;

  return (
    <div className="fade-in">
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <h1 className="page-title">Scholarship Schemes</h1>
          <p className="page-subtitle">{SCHEMES.length} schemes available · <span style={{color:'#D4800A', fontWeight:600}}>{urgentCount} closing soon</span></p>
        </div>
        <button className="btn btn-saffron" onClick={() => navigate('/eligibility')}>
          Check My Eligibility
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{marginBottom:20, padding:'16px 20px'}}>
        <div style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'center'}}>
          <div style={{flex:1, minWidth:220, display:'flex', alignItems:'center', gap:8, padding:'9px 12px', border:'1.5px solid #DDE1EE', borderRadius:8, background:'#F8F9FC'}}>
            <Search size={14} color="#9AA3BC"/>
            <input
              placeholder="Search schemes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{border:'none', background:'none', fontSize:13, flex:1, color:'#1E2541', outline:'none'}}
            />
          </div>
          <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
            {categories.map(c => (
              <button
                key={c}
                className={`filter-chip${selectedCat === c ? ' active' : ''}`}
                onClick={() => setSelectedCat(c)}
              >{c}</button>
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
            ✅ Eligible Only
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <span style={{fontSize:13, color:'#68738F', fontWeight:500}}>Showing {filtered.length} scheme{filtered.length !== 1 ? 's' : ''}</span>
        <select className="form-control" style={{width:'auto', fontSize:12, padding:'5px 10px'}}>
          <option>Sort: Deadline (Nearest)</option>
          <option>Sort: Amount (Highest)</option>
          <option>Sort: Eligibility First</option>
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
                <div style={{display:'flex', gap:10, marginTop:16, paddingTop:16, borderTop:'1px solid #EFF1F7'}}>
                  {s.eligible ? (
                    <button
                      className="btn btn-saffron"
                      onClick={e => { e.stopPropagation(); navigate('/applications'); }}
                    >
                      Apply Now <ChevronRight size={14}/>
                    </button>
                  ) : (
                    <button className="btn btn-outline" disabled style={{opacity:0.6}}>
                      Not Eligible Yet
                    </button>
                  )}
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={e => { e.stopPropagation(); navigate('/documents'); }}
                  >
                    Check Documents
                  </button>
                  <a href={s.link} target="_blank" rel="noreferrer">
                    <button className="btn btn-outline btn-sm" onClick={e => e.stopPropagation()}>
                      <ExternalLink size={13}/> Official Portal
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
          <h3 style={{fontSize:16, fontWeight:700, color:'#003366', marginBottom:6}}>No schemes match your filters</h3>
          <p style={{fontSize:13, color:'#68738F'}}>Try adjusting your search or filters</p>
          <button className="btn btn-outline" style={{marginTop:16}} onClick={() => { setSearch(''); setSelectedCat('All'); setShowEligibleOnly(false); }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
