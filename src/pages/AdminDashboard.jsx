import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Download, MapPin, TrendingUp, Users, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminSummary } from '../hooks/useAdminSummary';
import ReviewQueue from '../components/ReviewQueue';
import AdminManage from '../components/AdminManage';

const MONTHLY_TREND = [
  { month: 'Apr', apps: 820, approved: 690, rejected: 130, disbursed: 580 },
  { month: 'May', apps: 1240, approved: 1020, rejected: 220, disbursed: 900 },
  { month: 'Jun', apps: 1580, approved: 1290, rejected: 290, disbursed: 1100 },
  { month: 'Jul', apps: 2100, approved: 1750, rejected: 350, disbursed: 1620 },
  { month: 'Aug', apps: 1890, approved: 1520, rejected: 370, disbursed: 1400 },
  { month: 'Sep', apps: 2450, approved: 2100, rejected: 350, disbursed: 1950 },
  { month: 'Oct', apps: 3100, approved: 2650, rejected: 450, disbursed: 0 },
];

const DISTRICT_DATA = [
  { name: 'Gadchiroli', eligible: 4800, applied: 3120, approved: 2680, rate: 65, rejRate: 14 },
  { name: 'Nashik', eligible: 6200, applied: 4890, approved: 4300, rate: 79, rejRate: 12 },
  { name: 'Bastar', eligible: 5100, applied: 2100, approved: 1720, rate: 41, rejRate: 18 },
  { name: 'Mandla', eligible: 3800, applied: 2650, approved: 2310, rate: 70, rejRate: 13 },
  { name: 'Melghat', eligible: 2900, applied: 980, approved: 720, rate: 34, rejRate: 27 },
  { name: 'Dindori', eligible: 3400, applied: 2890, approved: 2610, rate: 85, rejRate: 10 },
  { name: 'Dang', eligible: 1800, applied: 670, approved: 530, rate: 37, rejRate: 21 },
  { name: 'Kinnaur', eligible: 1500, applied: 780, approved: 660, rate: 52, rejRate: 15 },
];

const SCHEME_WISE = [
  { name: 'Pre-Matric', applications: 42000, approved: 38000, disbursed: 35000, amount: '₹14.7 Cr' },
  { name: 'Post-Matric', applications: 31000, approved: 27500, disbursed: 25000, amount: '₹38.2 Cr' },
  { name: 'Nat. Fellowship', applications: 4200, approved: 3100, disbursed: 2800, amount: '₹5.8 Cr' },
  { name: 'State Schemes', applications: 18000, approved: 14200, disbursed: 12000, amount: '₹9.4 Cr' },
];

const REJECTION_REASONS = [
  { reason: 'Expired Income Certificate', count: 1820, pct: 28 },
  { reason: 'Blurry/Invalid Documents', count: 1430, pct: 22 },
  { reason: 'Income Limit Exceeded', count: 1040, pct: 16 },
  { reason: 'Duplicate Application', count: 780, pct: 12 },
  { reason: 'Incomplete Form', count: 650, pct: 10 },
  { reason: 'Ineligible Course', count: 450, pct: 7 },
  { reason: 'Others', count: 330, pct: 5 },
];

const COLORS = ['#003366', '#FF6B1A', '#1B7A3E', '#D4800A', '#1565C0', '#8E44AD', '#9AA3BC'];

export default function AdminDashboard() {
  const { toast, config } = useApp();
  const { data, reload } = useAdminSummary();
  const k = data?.kpis;
  const monthlyTrend = data?.monthlyTrend || MONTHLY_TREND;
  const districtData = data?.districtData || DISTRICT_DATA;
  const schemeWise = data?.schemeWise || SCHEME_WISE;
  const rejectionReasons = data?.rejectionReasons || REJECTION_REASONS;
  const lowCount = (data?.lowCoverage || []).length;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <h1 className="page-title">📊 Admin Analytics Dashboard</h1>
          <p className="page-subtitle">District-wise application insights · Ministry of Tribal Affairs</p>
        </div>
        <div style={{display:'flex', gap:8}}>
          <select className="form-control" style={{width:'auto', fontSize:12}}>
            <option>FY 2026-27</option>
            <option>FY 2025-26</option>
          </select>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Download size={13}/> Export PDF
          </button>
          {config.demoMode && (
            <button className="btn btn-primary btn-sm" onClick={() => toast(`Awareness alert sent to ${lowCount} low-coverage district offices (demo)`, 'success')}>
              Send Alerts to Low-Rate Districts
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          {label:'Total Eligible ST Students', val:k?.eligible || '8,42,300', change:'+4.2%', trend:'up', icon:<Users size={22}/>, col:'navy'},
          {label:'Applications This FY', val:k?.applications || '98,720', change:'+18.5%', trend:'up', icon:<FileText size={22}/>, col:'saffron'},
          {label:'Overall Approval Rate', val:k?.approvalRate || '85.4%', change:'+3.2%', trend:'up', icon:<CheckCircle size={22}/>, col:'green'},
          {label:'Total Disbursed (FY)', val:k?.disbursed || '₹68.1 Cr', change:'on track', trend:'up', icon:<TrendingUp size={22}/>, col:'amber'},
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.col}`}>
            <div className={`stat-icon ${s.col}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value" style={{fontSize:22}}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-change ${s.trend}`}><TrendingUp size={11}/> {s.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Live review queue: applications submitted through the app */}
      <ReviewQueue onChange={reload}/>

      {/* Monthly Trend */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header">
          <span className="card-title">Application & Disbursement Trend (FY 2026-27)</span>
          <div style={{display:'flex', gap:12}}>
            {[
              {color:'#003366', label:'Applications'},
              {color:'#1B7A3E', label:'Approved'},
              {color:'#FF6B1A', label:'Rejected'},
            ].map(l => (
              <div key={l.label} style={{display:'flex', alignItems:'center', gap:5, fontSize:11}}>
                <div style={{width:10, height:10, borderRadius:2, background:l.color}}/>
                {l.label}
              </div>
            ))}
          </div>
        </div>
        <div className="card-body" style={{padding:'16px'}}>
          <div style={{height:260}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003366" stopOpacity={0.15}/><stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B7A3E" stopOpacity={0.15}/><stop offset="95%" stopColor="#1B7A3E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFF1F7"/>
                <XAxis dataKey="month" tick={{fontSize:11, fill:'#9AA3BC'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11, fill:'#9AA3BC'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{borderRadius:8, border:'1px solid #DDE1EE', fontSize:12}}/>
                <Area type="monotone" dataKey="apps" stroke="#003366" fill="url(#g1)" strokeWidth={2} name="Applications"/>
                <Area type="monotone" dataKey="approved" stroke="#1B7A3E" fill="url(#g2)" strokeWidth={2} name="Approved"/>
                <Line type="monotone" dataKey="rejected" stroke="#FF6B1A" strokeWidth={2} dot={false} name="Rejected"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* District Table + Rejection Reasons */}
      <div className="grid-2" style={{marginBottom:20}}>
        {/* District Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">District-wise Performance</span>
            <button className="btn btn-outline btn-sm"><Download size={12}/> CSV</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Eligible</th>
                  <th>Applied</th>
                  <th>Coverage</th>
                  <th>Rej. Rate</th>
                </tr>
              </thead>
              <tbody>
                {districtData.map(d => (
                  <tr key={d.name}>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:5, fontWeight:600}}>
                        <MapPin size={11} color="#9AA3BC"/>{d.name}
                      </div>
                    </td>
                    <td style={{color:'#68738F'}}>{d.eligible.toLocaleString()}</td>
                    <td style={{color:'#1A5FAD', fontWeight:600}}>{d.applied.toLocaleString()}</td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        <div className="progress-bar-wrap" style={{width:60}}>
                          <div className="progress-bar" style={{
                            width:`${d.rate}%`,
                            background: d.rate >= 70 ? '#1B7A3E' : d.rate >= 50 ? '#D4800A' : '#C0392B'
                          }}/>
                        </div>
                        <span style={{fontSize:12, fontWeight:700, color: d.rate >= 70 ? '#1B7A3E' : d.rate >= 50 ? '#D4800A' : '#C0392B'}}>{d.rate}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${d.rejRate > 20 ? 'badge-red' : d.rejRate > 15 ? 'badge-amber' : 'badge-green'}`}>
                        {d.rejRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rejection Reasons */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Rejection Reasons</span>
            <span className="badge badge-red">6,500 rejected</span>
          </div>
          <div className="card-body">
            <div style={{height:200, marginBottom:16}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rejectionReasons} dataKey="count" nameKey="reason" cx="50%" cy="50%" outerRadius={80}>
                    {rejectionReasons.map((_, i) => <Cell key={i} fill={COLORS[i]}/>)}
                  </Pie>
                  <Tooltip formatter={v => v.toLocaleString()} contentStyle={{borderRadius:8, fontSize:12}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {rejectionReasons.map((r, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:8, marginBottom:7}}>
                <div style={{width:10, height:10, borderRadius:2, background:COLORS[i], flexShrink:0}}/>
                <div style={{flex:1, fontSize:12, color:'#4B5470'}}>{r.reason}</div>
                <div className="progress-bar-wrap" style={{width:60}}>
                  <div className="progress-bar" style={{width:`${r.pct}%`, background:COLORS[i]}}/>
                </div>
                <span style={{fontSize:12, fontWeight:700, color:'#1E2541', width:28}}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scheme-wise Summary */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header">
          <span className="card-title">Scheme-wise Summary (FY 2026-27)</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Scheme</th>
                <th>Applications</th>
                <th>Approved</th>
                <th>Disbursed</th>
                <th>Amount Disbursed</th>
                <th>Approval %</th>
              </tr>
            </thead>
            <tbody>
              {schemeWise.map(s => (
                <tr key={s.name}>
                  <td><strong style={{color:'#003366'}}>{s.name}</strong></td>
                  <td>{s.applications.toLocaleString()}</td>
                  <td style={{color:'#1B7A3E', fontWeight:600}}>{s.approved.toLocaleString()}</td>
                  <td style={{color:'#1565C0'}}>{s.disbursed.toLocaleString()}</td>
                  <td style={{fontWeight:800, color:'#E55A0A'}}>{s.amount}</td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div className="progress-bar-wrap" style={{width:70}}>
                        <div className="progress-bar green" style={{width:`${Math.round(s.approved/s.applications*100)}%`}}/>
                      </div>
                      <span style={{fontSize:12, fontWeight:700}}>{Math.round(s.approved/s.applications*100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Alerts */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">⚠️ Action Required — Intervention Alerts</span>
          <span className="badge badge-red">{lowCount} flagged</span>
        </div>
        <div className="card-body">
          {[
            ...(data?.lowCoverage || []).map((d) => ({
              level: d.rate < 40 ? 'high' : 'medium', district: d.name,
              issue: `Only ${d.rate}% of ${d.eligible.toLocaleString('en-IN')} eligible students have applied; rejection rate ${d.rejRate}%.`,
              action: d.rejRate >= 20 ? 'Schedule awareness drive' : 'Send SMS + CSC notification',
            })),
          ].map((a, i) => (
            <div key={i} style={{display:'flex', gap:14, padding:'14px', borderRadius:10, background: a.level === 'high' ? '#FDECEA' : '#FFF3DC', border:`1px solid ${a.level === 'high' ? 'rgba(192,57,43,0.2)' : 'rgba(212,128,10,0.2)'}`, marginBottom:10}}>
              <AlertTriangle size={20} color={a.level === 'high' ? '#C0392B' : '#D4800A'} style={{flexShrink:0, marginTop:2}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:700, color:'#1E2541', marginBottom:3}}>{a.district}</div>
                <div style={{fontSize:12, color:'#4B5470', lineHeight:1.5}}>{a.issue}</div>
              </div>
              <span style={{padding:'7px 14px', borderRadius:7, fontSize:12, fontWeight:600, background: a.level === 'high' ? '#C0392B' : '#D4800A', color:'white', flexShrink:0, alignSelf:'flex-start'}}>
                Suggested: {a.action}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AdminManage />
    </div>
  );
}
