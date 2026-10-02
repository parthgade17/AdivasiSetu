import { useState } from 'react';
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

const monthlyData = [
  { month: 'May', applications: 1240, approved: 980, rejected: 260 },
  { month: 'Jun', applications: 1580, approved: 1290, rejected: 290 },
  { month: 'Jul', applications: 2100, approved: 1750, rejected: 350 },
  { month: 'Aug', applications: 1890, approved: 1520, rejected: 370 },
  { month: 'Sep', applications: 2450, approved: 2100, rejected: 350 },
  { month: 'Oct', applications: 3100, approved: 2650, rejected: 450 },
];

const schemeDistribution = [
  { name: 'Pre-Matric', value: 38, color: '#003366' },
  { name: 'Post-Matric', value: 29, color: '#FF6B1A' },
  { name: 'Nat. Fellowship', value: 14, color: '#1B7A3E' },
  { name: 'State Schemes', value: 12, color: '#D4800A' },
  { name: 'Others', value: 7, color: '#9AA3BC' },
];

const recentApps = [
  { id: 'APP2026001', name: 'Priya Bhavale', scheme: 'Post-Matric Scholarship', district: 'Nashik', status: 'approved', amount: '₹48,000', date: '28 Sep' },
  { id: 'APP2026002', name: 'Raju Meshram', scheme: 'Pre-Matric Scholarship', district: 'Gadchiroli', status: 'pending', amount: '₹6,500', date: '27 Sep' },
  { id: 'APP2026003', name: 'Sunita Korram', scheme: 'National Fellowship', district: 'Bastar', status: 'under_review', amount: '₹31,000/mo', date: '26 Sep' },
  { id: 'APP2026004', name: 'Manish Tekam', scheme: 'Post-Matric Scholarship', district: 'Dindori', status: 'rejected', amount: '₹22,000', date: '25 Sep' },
  { id: 'APP2026005', name: 'Deepa Uike', scheme: 'Pre-Matric Scholarship', district: 'Mandla', status: 'approved', amount: '₹5,800', date: '24 Sep' },
];

const upcomingDeadlines = [
  { scheme: 'Pre-Matric Scholarship (ST)', deadline: '31 Oct 2026', days: 30, urgent: false },
  { scheme: 'MahaDBT (Maharashtra)', deadline: '15 Oct 2026', days: 14, urgent: true },
  { scheme: 'Post-Matric Scholarship (ST)', deadline: '15 Nov 2026', days: 45, urgent: false },
  { scheme: 'National Overseas Scholarship', deadline: '28 Feb 2027', days: 150, urgent: false },
];

const studentStats = [
  { label: 'Applied Schemes', value: '2', icon: '📝', color: 'navy' },
  { label: 'Approved', value: '1', icon: '✅', color: 'green' },
  { label: 'Pending', value: '1', icon: '⏳', color: 'amber' },
  { label: 'Total Received', value: '₹48,000', icon: '💰', color: 'saffron' },
];

const statusBadge = (status) => {
  const map = {
    approved: { cls: 'badge-green', label: 'Approved' },
    pending: { cls: 'badge-amber', label: 'Pending' },
    under_review: { cls: 'badge-blue', label: 'Under Review' },
    rejected: { cls: 'badge-red', label: 'Rejected' },
  };
  const b = map[status];
  return <span className={`badge ${b.cls}`}>{b.label}</span>;
};

export default function Dashboard({ userRole }) {
  const navigate = useNavigate();
  const isAdmin = userRole === 'admin';

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <h1 className="page-title">
            {isAdmin ? 'Admin Analytics Dashboard' : '👋 Welcome back, Ramesh!'}
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
              <span>Check Eligibility</span> <ArrowRight size={14}/>
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-outline" style={{fontSize:12}}>
              <span>Export Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert: incomplete profile (student only) */}
      {!isAdmin && (
        <div className="alert alert-warning" style={{cursor:'pointer'}} onClick={() => navigate('/profile')}>
          <AlertCircle size={16}/>
          <div>
            <strong>Complete your profile</strong> — Add income certificate and domicile to unlock 3 more scholarships.
            <span style={{marginLeft:8, textDecoration:'underline', fontWeight:600}}>Complete now →</span>
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
                <div className="stat-value">1,24,380</div>
                <div className="stat-label">Registered Students</div>
                <div className="stat-change up"><TrendingUp size={12}/> +12.4% this month</div>
              </div>
            </div>
            <div className="stat-card saffron">
              <div className="stat-icon saffron"><FileText size={22}/></div>
              <div className="stat-info">
                <div className="stat-value">3,100</div>
                <div className="stat-label">Applications This Month</div>
                <div className="stat-change up"><TrendingUp size={12}/> +26.5% vs last</div>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon green"><CheckCircle size={22}/></div>
              <div className="stat-info">
                <div className="stat-value">85.4%</div>
                <div className="stat-label">Approval Rate</div>
                <div className="stat-change up"><TrendingUp size={12}/> +3.2% improved</div>
              </div>
            </div>
            <div className="stat-card amber">
              <div className="stat-icon amber"><IndianRupee size={22}/></div>
              <div className="stat-info">
                <div className="stat-value">₹12.4 Cr</div>
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
            <span className="card-title">{isAdmin ? 'Recent Applications' : 'Your Applications'}</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/applications')}>View All</button>
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
                {recentApps.map(a => (
                  <tr key={a.id} style={{cursor:'pointer'}} onClick={() => navigate('/applications')}>
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
            <span className="card-title">{isAdmin ? 'District Rejection Rates' : 'Upcoming Deadlines'}</span>
            {isAdmin && <button className="btn btn-outline btn-sm">Full Report</button>}
          </div>
          <div className="card-body">
            {isAdmin ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    {district:'Gadchiroli', rate:18},
                    {district:'Nashik', rate:12},
                    {district:'Bastar', rate:22},
                    {district:'Mandla', rate:14},
                    {district:'Dindori', rate:10},
                    {district:'Melghat', rate:28},
                  ]}>
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
                        {d.days}d left
                      </span>
                    </div>
                  </div>
                ))}

                {/* Quick Actions */}
                <div style={{marginTop:16, display:'flex', gap:8, flexWrap:'wrap'}}>
                  <button className="btn btn-saffron btn-sm" onClick={() => navigate('/eligibility')}>
                    <CheckCircle size={13}/> Check Eligibility
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('/documents')}>
                    Upload Documents
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
            <span className="badge badge-red">6 Districts</span>
          </div>
          <div className="card-body">
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12}}>
              {[
                {district:'Melghat, MH', rate:'34%', eligible:1240, applied:421, color:'#C0392B'},
                {district:'Bastar, CG', rate:'41%', eligible:2100, applied:861, color:'#D4800A'},
                {district:'Niyamgiri, OD', rate:'28%', eligible:890, applied:249, color:'#C0392B'},
                {district:'Kinnaur, HP', rate:'52%', eligible:650, applied:338, color:'#D4800A'},
                {district:'Dang, GJ', rate:'37%', eligible:780, applied:289, color:'#C0392B'},
                {district:'Srisailam, AP', rate:'49%', eligible:920, applied:451, color:'#D4800A'},
              ].map((d, i) => (
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
