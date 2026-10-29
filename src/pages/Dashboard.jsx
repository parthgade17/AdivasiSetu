import { useApp } from '../context/AppContext';
import { useAdminSummary } from '../hooks/useAdminSummary';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, FileText, CheckCircle,
  AlertCircle, Clock, IndianRupee, Award, ArrowRight,
  MapPin, Calendar, ChevronRight
} from 'lucide-react';

const MONTHLY_DATA = [
  { month: 'May', applications: 1240, approved: 980, rejected: 260 },
  { month: 'Jun', applications: 1580, approved: 1290, rejected: 290 },
  { month: 'Jul', applications: 2100, approved: 1750, rejected: 350 },
  { month: 'Aug', applications: 1890, approved: 1520, rejected: 370 },
  { month: 'Sep', applications: 2450, approved: 2100, rejected: 350 },
  { month: 'Oct', applications: 3100, approved: 2650, rejected: 450 },
];

const SCHEME_DISTRIBUTION = [
  { name: 'Pre-Matric', value: 38, color: '#003366' },
  { name: 'Post-Matric', value: 29, color: '#FF6B1A' },
  { name: 'Nat. Fellowship', value: 14, color: '#1B7A3E' },
  { name: 'State Schemes', value: 12, color: '#D4800A' },
  { name: 'Others', value: 7, color: '#9AA3BC' },
];

const RECENT_APPS = [
  { id: 'APP2026001', name: 'Priya Bhavale', scheme: 'Post-Matric Scholarship', district: 'Nashik', status: 'approved', amount: '₹48,000', date: '28 Sep' },
  { id: 'APP2026002', name: 'Raju Meshram', scheme: 'Pre-Matric Scholarship', district: 'Gadchiroli', status: 'pending', amount: '₹6,500', date: '27 Sep' },
  { id: 'APP2026003', name: 'Sunita Korram', scheme: 'National Fellowship', district: 'Bastar', status: 'under_review', amount: '₹31,000/mo', date: '26 Sep' },
  { id: 'APP2026004', name: 'Manish Tekam', scheme: 'Post-Matric Scholarship', district: 'Dindori', status: 'rejected', amount: '₹22,000', date: '25 Sep' },
  { id: 'APP2026005', name: 'Deepa Uike', scheme: 'Pre-Matric Scholarship', district: 'Mandla', status: 'approved', amount: '₹5,800', date: '24 Sep' },
];

const statusBadge = (status) => {
  const map = {
    approved: { cls: 'badge-green', label: 'Approved' },
    pending: { cls: 'badge-amber', label: 'Pending' },
    under_review: { cls: 'badge-blue', label: 'Under Review' },
    rejected: { cls: 'badge-red', label: 'Rejected' },
    queued: { cls: 'badge-amber', label: 'Waiting to sync' },
  };
  const b = map[status];
  return <span className={`badge ${b.cls}`}>{b.label}</span>;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { role: userRole, user, profile, applications, schemes, documents, t } = useApp();
  const isAdmin = userRole === 'admin';
  const { data: summary } = useAdminSummary();
  const k = summary?.kpis;

  const monthlyData = summary
    ? summary.monthlyTrend.map(m => ({ month: m.month, applications: m.apps, approved: m.approved, rejected: m.rejected }))
    : MONTHLY_DATA;
  const schemeDistribution = summary?.schemeDistribution || SCHEME_DISTRIBUTION;
  const recentApps = isAdmin
    ? (summary?.recentApps || RECENT_APPS).map(a => ({ ...a, date: a.submittedDate || a.date }))
    : applications.slice(0, 5).map(a => ({ ...a, date: a.submittedDate }));
  const deadlinePool = schemes.some(s => s.eligible) ? schemes.filter(s => s.eligible) : schemes;
  const upcomingDeadlines = deadlinePool
    .filter(s => s.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4)
    .map(s => ({ scheme: s.name, deadline: s.deadline, days: s.daysLeft, urgent: s.daysLeft <= 15 }));
  const received = applications.filter(a => a.paymentStatus === 'disbursed')
    .reduce((sum, a) => sum + (parseInt(String(a.amount).replace(/[^\d]/g, ''), 10) || 0), 0);
  const studentStats = [
    { label: t('appliedSchemes'), value: String(applications.length), icon: '📝', color: 'navy' },
    { label: t('approved'), value: String(applications.filter(a => a.status === 'approved').length), icon: '✅', color: 'green' },
    { label: t('inProgress'), value: String(applications.filter(a => ['pending', 'under_review', 'queued'].includes(a.status)).length), icon: '⏳', color: 'amber' },
    { label: t('totalReceived'), value: `₹${received.toLocaleString('en-IN')}`, icon: '💰', color: 'saffron' },
  ];
  const missingDocs = documents.filter(d => d.mandatory && ['missing', 'quality_issue'].includes(d.status)).length;
  const profileIncomplete = !profile?.course || !profile?.income;
  const rejectionByDistrict = (summary?.districtData || [])
    .slice().sort((a, b) => b.rejRate - a.rejRate).slice(0, 6).map(d => ({ district: d.name, rate: d.rejRate }));
  const lowCoverage = summary?.lowCoverage || [];
  const firstName = (profile?.name || user?.name || '').split(' ')[0];

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <h1 className="page-title">
            {isAdmin ? t('admin') : `👋 ${t('welcome', { name: firstName || 'Student' })}`}
          </h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'District-wise application insights and performance metrics'
              : 'Track your scholarship applications and upcoming deadlines.'}
          </p>
        </div>
        <div style={{display:'flex', gap:8}}>
          {!isAdmin && (
            <button className="btn btn-saffron" onClick={() => navigate('/eligibility')}>
              <span>{t('checkEligibility')}</span> <ArrowRight size={14}/>
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-outline" style={{fontSize:12}} onClick={() => navigate('/admin')}>
              <span>Open full analytics</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert: incomplete profile (student only) */}
      {!isAdmin && (profileIncomplete || missingDocs > 0) && (
        <div className="alert alert-warning" style={{cursor:'pointer'}} onClick={() => navigate(profileIncomplete ? '/eligibility' : '/documents')}>
          <AlertCircle size={16}/>
          <div>
            {profileIncomplete
              ? <><strong>{t('profileIncompleteAlert')}</strong></>
              : <><strong>{t('missingDocsAlert')}</strong></>}
            <span style={{marginLeft:8, textDecoration:'underline', fontWeight:600}}>{profileIncomplete ? t('completeProfile') : t('uploadDocs')}</span>
          </div>
        </div>
      )}

      {/* STATS GRID */}
      <div className="stats-grid">
        {isAdmin ? (
          <>
            <div className="stat-card navy">
              <div className="stat-icon navy"><Users size={22}/></div>
              <div className="stat-info">
                <div className="stat-value">{k?.registered || '1,24,380'}</div>
                <div className="stat-label">Registered Students</div>
                <div className="stat-change up"><TrendingUp size={12}/> +12.4% this month</div>
              </div>
            </div>
            <div className="stat-card saffron">
              <div className="stat-icon saffron"><FileText size={22}/></div>
              <div className="stat-info">
                <div className="stat-value">{k?.thisMonth || '3,100'}</div>
                <div className="stat-label">Applications This Month</div>
                <div className="stat-change up"><TrendingUp size={12}/> +26.5% vs last</div>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon green"><CheckCircle size={22}/></div>
              <div className="stat-info">
                <div className="stat-value">{k?.approvalRate || '85.4%'}</div>
                <div className="stat-label">Approval Rate</div>
                <div className="stat-change up"><TrendingUp size={12}/> +3.2% improved</div>
              </div>
            </div>
            <div className="stat-card amber">
              <div className="stat-icon amber"><IndianRupee size={22}/></div>
              <div className="stat-info">
                <div className="stat-value">{k?.disbursed || '₹12.4 Cr'}</div>
                <div className="stat-label">Disbursed (FY 2026-27)</div>
                <div className="stat-change up"><TrendingUp size={12}/> On track</div>
              </div>
            </div>
          </>
        ) : (
          studentStats.map((s, i) => (
            <div key={i} className={`stat-card ${s.color}`}>
              <div className={`stat-icon ${s.color}`} style={{fontSize:24}}>{s.icon}</div>
              <div className="stat-info">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CHARTS ROW */}
      {isAdmin && (
        <div className="grid-2" style={{marginBottom:20}}>
          {/* Applications Trend */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Application Trends (6 Months)</span>
              <select className="form-control" style={{width:'auto', padding:'4px 10px', fontSize:12}}>
                <option>All Districts</option>
                <option>Nashik</option>
                <option>Gadchiroli</option>
              </select>
            </div>
            <div className="card-body" style={{padding:'16px 16px 8px'}}>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#003366" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B7A3E" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1B7A3E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFF1F7"/>
                    <XAxis dataKey="month" tick={{fontSize:11, fill:'#9AA3BC'}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11, fill:'#9AA3BC'}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{borderRadius:8, border:'1px solid #DDE1EE', fontSize:12}}/>
                    <Area type="monotone" dataKey="applications" stroke="#003366" fill="url(#appGrad)" strokeWidth={2} name="Total"/>
                    <Area type="monotone" dataKey="approved" stroke="#1B7A3E" fill="url(#approvedGrad)" strokeWidth={2} name="Approved"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Scheme Distribution */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Applications by Scheme</span>
              <span className="badge badge-navy">FY 2026-27</span>
            </div>
            <div className="card-body" style={{padding:'16px'}}>
              <div style={{height:200}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={schemeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {schemeDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color}/>
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{borderRadius:8, fontSize:12}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {schemeDistribution.map((s, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6}}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <div style={{width:8, height:8, borderRadius:'50%', background:s.color}}/>
                    <span style={{fontSize:12, color:'#4B5470'}}>{s.name}</span>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div className="progress-bar-wrap" style={{width:80}}>
                      <div className="progress-bar" style={{width:`${s.value}%`, background:s.color}}/>
                    </div>
                    <span style={{fontSize:12, fontWeight:700, color:'#1E2541', width:28}}>{s.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION */}
      <div className="grid-2">
        {/* Recent Applications / Eligible Schemes */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">{isAdmin ? 'Recent Applications' : t('recentApplications')}</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate(isAdmin ? '/admin' : '/applications')}>{t('viewDetails')}</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {isAdmin && <th>ID</th>}
                  <th>Student / Scheme</th>
                  {isAdmin && <th>District</th>}
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.length === 0 && (
                  <tr><td colSpan={5} style={{textAlign:'center', color:'#68738F', fontSize:13, padding:20}}>No applications yet.</td></tr>
                )}
                {recentApps.map(a => (
                  <tr key={a.clientRef || a.id} style={{cursor:'pointer'}} onClick={() => navigate(isAdmin ? '/admin' : '/applications')}>
                    {isAdmin && <td style={{fontFamily:'monospace', fontSize:11, color:'#9AA3BC'}}>{a.id}</td>}
                    <td>
                      <div style={{fontWeight:600, color:'#1E2541', fontSize:13}}>{isAdmin ? a.name : a.scheme}</div>
                      <div style={{fontSize:11, color:'#9AA3BC'}}>{isAdmin ? a.scheme : a.date}</div>
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{display:'flex', alignItems:'center', gap:4, fontSize:12}}>
                          <MapPin size={11} style={{color:'#9AA3BC'}}/> {a.district}
                        </div>
                      </td>
                    )}
                    <td>{statusBadge(a.status)}</td>
                    <td style={{fontWeight:700, color:'#E55A0A', fontSize:13}}>{a.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deadlines / District Performance */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">{isAdmin ? 'District Rejection Rates' : t('upcomingDeadlines')}</span>
            {isAdmin && <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin')}>Full Report</button>}
          </div>
          <div className="card-body">
            {isAdmin ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rejectionByDistrict}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFF1F7"/>
                    <XAxis dataKey="district" tick={{fontSize:10, fill:'#9AA3BC'}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:10, fill:'#9AA3BC'}} axisLine={false} tickLine={false} unit="%"/>
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{borderRadius:8, fontSize:12}}/>
                    <Bar dataKey="rate" fill="#FF6B1A" radius={[4,4,0,0]} name="Rejection Rate"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div>
                {upcomingDeadlines.map((d, i) => (
                  <div key={i} style={{display:'flex', gap:12, alignItems:'center', padding:'10px 0', borderBottom: i < upcomingDeadlines.length-1 ? '1px solid #EFF1F7' : 'none'}}>
                    <div style={{width:42, height:42, borderRadius:10, background: d.urgent ? '#FFF3DC' : '#F0F4FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                      <Calendar size={18} color={d.urgent ? '#D4800A' : '#1A5FAD'}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13, fontWeight:600, color:'#1E2541'}}>{d.scheme}</div>
                      <div style={{fontSize:11, color:'#68738F', marginTop:2}}>{d.deadline}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <span className={`badge ${d.urgent ? 'badge-amber' : 'badge-blue'}`}>
                        {t('daysLeft', { n: d.days })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Quick Actions */}
                <div style={{marginTop:16, display:'flex', gap:8, flexWrap:'wrap'}}>
                  <button className="btn btn-saffron btn-sm" onClick={() => navigate('/eligibility')}>
                    <CheckCircle size={13}/> {t('checkEligibility')}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('/documents')}>
                    {t('uploadDocs')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin: Low Awareness Districts */}
      {isAdmin && (
        <div className="card" style={{marginTop:20}}>
          <div className="card-header">
            <span className="card-title">⚠️ Low Application Rate Districts — Action Required</span>
            <span className="badge badge-red">{lowCoverage.length} Districts</span>
          </div>
          <div className="card-body">
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12}}>
              {lowCoverage.map(x => ({ district: x.name, rate: `${x.rate}%`, eligible: x.eligible, applied: x.applied,
                color: x.rate < 35 ? '#C0392B' : '#D4800A' })).map((d, i) => (
                <div key={i} style={{padding:'14px', border:`1.5px solid ${d.color}30`, borderRadius:10, background:`${d.color}08`}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                    <div style={{fontSize:13, fontWeight:700, color:'#1E2541'}}>{d.district}</div>
                    <span style={{fontSize:14, fontWeight:800, color:d.color}}>{d.rate}</span>
                  </div>
                  <div style={{fontSize:11, color:'#68738F', marginBottom:6}}>{d.applied} of {d.eligible} eligible applied</div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{width:d.rate, background:d.color}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
