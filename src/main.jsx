import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, AlertOctagon, ArrowDownRight, ArrowRight, ArrowUpRight, Bell,
  ChevronDown, ChevronRight, CircleHelp, Clock3, Crosshair, Database,
  Download, Eye, FileSearch, GitBranch, Globe2, LayoutDashboard, LockKeyhole,
  Menu, Network, Radar, RefreshCw, Search, Server, Settings2, Shield,
  ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, Target, Terminal,
  X, Zap
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Cell
} from 'recharts'
import './styles.css'

const snapshots = [
  { id: 'T-01', time: '09:00:00', title: 'Baseline', detail: 'Normal enterprise activity observed in the illustrative dataset.' },
  { id: 'T-02', time: '09:04:30', title: 'Initial access', detail: 'An illustrative suspicious sign-in appears on the public-facing gateway.' },
  { id: 'T-03', time: '09:08:10', title: 'Discovery', detail: 'A sample discovery event is associated with the application server.' },
  { id: 'T-04', time: '09:12:45', title: 'Lateral movement', detail: 'A possible route toward an internal database is highlighted for demonstration.' },
  { id: 'T-05', time: '09:17:20', title: 'Risk escalation', detail: 'The illustrative risk ranking increases for the database node.' },
]
const nodes = [
  { id: 'GW-01', name: 'Edge Gateway', type: 'Gateway', ip: '10.0.0.1', x: 72, y: 154, risk: 31, status: 'Observed', zone: 'Perimeter', desc: 'Public-facing entry point. Review access patterns and authentication events.' },
  { id: 'WEB-02', name: 'Web Application', type: 'Application', ip: '10.0.1.12', x: 245, y: 95, risk: 68, status: 'Elevated', zone: 'DMZ', desc: 'Application service with a simulated suspicious discovery event.' },
  { id: 'AUTH-01', name: 'Identity Service', type: 'Identity', ip: '10.0.2.4', x: 245, y: 224, risk: 47, status: 'Watch', zone: 'Core', desc: 'Identity infrastructure. Review privilege assignments and sign-in history.' },
  { id: 'APP-03', name: 'Internal API', type: 'Application', ip: '10.0.3.18', x: 430, y: 95, risk: 74, status: 'Elevated', zone: 'Core', desc: 'Internal API node on a simulated potential progression route.' },
  { id: 'FILE-01', name: 'File Server', type: 'Storage', ip: '10.0.3.25', x: 430, y: 224, risk: 39, status: 'Watch', zone: 'Core', desc: 'File service with ordinary connections in this sample scenario.' },
  { id: 'DB-01', name: 'Customer Database', type: 'Database', ip: '10.0.4.8', x: 610, y: 154, risk: 89, status: 'High risk', zone: 'Restricted', desc: 'High-impact asset. Risk score is illustrative and should not be treated as a live alert.' },
  { id: 'BK-01', name: 'Backup Vault', type: 'Storage', ip: '10.0.4.22', x: 610, y: 275, risk: 22, status: 'Observed', zone: 'Restricted', desc: 'Backup service. Validate isolation and recovery permissions.' },
]
const edges = [
  ['GW-01','WEB-02'], ['GW-01','AUTH-01'], ['WEB-02','APP-03'], ['AUTH-01','APP-03'],
  ['AUTH-01','FILE-01'], ['APP-03','DB-01'], ['FILE-01','DB-01'], ['DB-01','BK-01']
]
const riskNodes = [
  { id:'DB-01', name:'Customer Database', ip:'10.0.4.8', risk:89, change:'+14', reason:'High-value asset + unusual service access', tier:'Critical' },
  { id:'APP-03', name:'Internal API', ip:'10.0.3.18', risk:74, change:'+9', reason:'Discovery event + route centrality', tier:'High' },
  { id:'WEB-02', name:'Web Application', ip:'10.0.1.12', risk:68, change:'+6', reason:'Public exposure + unusual request pattern', tier:'High' },
  { id:'AUTH-01', name:'Identity Service', ip:'10.0.2.4', risk:47, change:'+2', reason:'Privilege adjacency + sign-in anomaly', tier:'Medium' },
  { id:'FILE-01', name:'File Server', ip:'10.0.3.25', risk:39, change:'−3', reason:'Connected to a higher-risk application node', tier:'Medium' },
]
const paths = [
  { id:'P-01', name:'Gateway → API → Database', severity:'High', confidence:82, hops:3, nodes:['GW-01','WEB-02','APP-03','DB-01'], summary:'Illustrative route through the public-facing application layer toward a restricted database.', rationale:['Public-facing entry point','Elevated application node','High-impact destination asset'], mitigation:'Review gateway and application logs, validate patch status, and restrict database access to approved service identities.' },
  { id:'P-02', name:'Identity → API → Database', severity:'High', confidence:71, hops:2, nodes:['AUTH-01','APP-03','DB-01'], summary:'Illustrative route showing how identity exposure could affect a connected internal service.', rationale:['Identity service is adjacent to the API','API has access to a restricted data tier','Privilege boundaries need verification'], mitigation:'Audit privileged accounts, rotate exposed credentials if confirmed, and enforce least-privilege service access.' },
  { id:'P-03', name:'File Server → Database', severity:'Medium', confidence:54, hops:1, nodes:['FILE-01','DB-01'], summary:'Short hypothetical route between two internal services; included for route comparison.', rationale:['Direct network adjacency in the sample graph','Destination is a high-impact asset'], mitigation:'Confirm whether the connection is required and enforce network segmentation.' },
]
const techniques = [
  { id:'T1190', name:'Exploit Public-Facing Application', tactic:'Initial Access', evidence:'Illustrative public-facing application node and suspicious request pattern.', relevance:'Potentially relevant to P-01; not a confirmed detection.', mitigation:'Patch exposed services, validate WAF rules, and review application logs.' },
  { id:'T1018', name:'Remote System Discovery', tactic:'Discovery', evidence:'Simulated discovery event on the internal application tier.', relevance:'Example mapping for a discovery-like event in the sample timeline.', mitigation:'Review process and network telemetry; restrict unnecessary discovery paths.' },
  { id:'T1021', name:'Remote Services', tactic:'Lateral Movement', evidence:'Illustrative edge between internal service nodes.', relevance:'A possible technique to investigate if corroborated by real telemetry.', mitigation:'Restrict remote administration and require strong authentication.' },
  { id:'T1078', name:'Valid Accounts', tactic:'Initial Access / Persistence', evidence:'Sample identity anomaly used to demonstrate an explanation panel.', relevance:'Hypothetical mapping only; no account compromise is asserted.', mitigation:'Audit sign-ins, enforce MFA, and review privileged account usage.' },
]
const activity = [
  { time:'09:17:20', title:'Risk ranking recalculated', sub:'DB-01 moved to the top of the illustrative risk list', tag:'DEMO EVENT', type:'blue' },
  { time:'09:12:45', title:'Potential path highlighted', sub:'APP-03 → DB-01 route shown for analyst review', tag:'PATH ANALYSIS', type:'purple' },
  { time:'09:08:10', title:'Discovery-like behavior', sub:'Sample event attached to WEB-02 / APP-03', tag:'TEMPORAL', type:'blue' },
  { time:'09:04:30', title:'Unusual access pattern', sub:'Illustrative gateway event added to snapshot T-02', tag:'OBSERVATION', type:'orange' },
]
const trendData = [
  { time:'09:00', perimeter:18, internal:12, critical:7 },
  { time:'09:04', perimeter:28, internal:17, critical:9 },
  { time:'09:08', perimeter:32, internal:34, critical:18 },
  { time:'09:12', perimeter:35, internal:48, critical:42 },
  { time:'09:17', perimeter:39, internal:55, critical:63 },
]
const pieData = [{name:'Critical',value:2,color:'#e87979'},{name:'High',value:5,color:'#d7a66b'},{name:'Moderate',value:8,color:'#6ea8df'},{name:'Low',value:17,color:'#53657e'}]
const navItems = [
  {id:'overview',label:'Overview',icon:LayoutDashboard,group:'Workspace'},
  {id:'graph',label:'Attack Graph',icon:Network,group:'Workspace'},
  {id:'temporal',label:'Temporal Analysis',icon:Clock3,group:'Workspace'},
  {id:'predictions',label:'Node Predictions',icon:Crosshair,group:'Intelligence'},
  {id:'paths',label:'Attack Paths',icon:GitBranch,group:'Intelligence'},
  {id:'mitre',label:'MITRE ATT&CK',icon:ShieldCheck,group:'Intelligence'},
]

function riskClass(risk){ return risk >= 80 ? 'critical' : risk >= 65 ? 'high' : risk >= 40 ? 'medium' : 'low' }
function IconButton({children, onClick, title}) { return <button className="icon-btn" onClick={onClick} title={title}>{children}</button> }
function SectionHeading({eyebrow,title,description,action}) {
  return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>
}
function Pill({children,tone='neutral'}) { return <span className={`pill ${tone}`}>{children}</span> }
function StatCard({icon:Icon,label,value,delta,deltaTone='blue',foot}) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={17}/></span></div><div className="stat-value">{value}</div><div className="stat-bottom"><span className={`delta ${deltaTone}`}>{delta}</span><span>{foot}</span></div></div>
}

function AttackGraph({selectedNode,setSelectedNode,snapshot,highlightPath=true}) {
  const activePath = paths[0].nodes
  const activeEdges = edges.filter(([a,b]) => activePath.includes(a) && activePath.includes(b))
  return <div className="graph-wrap">
    <div className="graph-toolbar"><div className="graph-legend"><span><i className="legend-dot critical-dot"/>High risk</span><span><i className="legend-dot high-dot"/>Elevated</span><span><i className="legend-dot low-dot"/>Observed</span></div><div className="graph-tools"><Pill tone="blue">{snapshot}</Pill><span className="small-muted">7 nodes · 8 links</span></div></div>
    <svg className="attack-svg" viewBox="0 0 690 340" role="img" aria-label="Illustrative enterprise attack graph">
      <defs><pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M 22 0 L 0 0 0 22" fill="none" stroke="#1a2a40" strokeWidth=".6"/></pattern></defs>
      <rect width="690" height="340" fill="url(#grid)" rx="12"/>
      {edges.map(([a,b],i)=>{
        const na=nodes.find(n=>n.id===a), nb=nodes.find(n=>n.id===b)
        const active=highlightPath && activeEdges.some(e=>e[0]===a&&e[1]===b)
        return <g key={i}><line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={active?'#6ea8df':'#304158'} strokeWidth={active?2.2:1.2} strokeDasharray={active?'5 4':'none'} opacity={active?1:.8}/>{active&&<circle cx={(na.x+nb.x)/2} cy={(na.y+nb.y)/2} r="3" fill="#91c4f5"/>}</g>
      })}
      {nodes.map(n=>{
        const selected=selectedNode===n.id, active=highlightPath&&activePath.includes(n.id)
        const fill=n.risk>=80?'#4a2832':n.risk>=65?'#4b3a2a':'#1d344c'
        const stroke=selected?'#d9e9f8':n.risk>=80?'#d9828d':n.risk>=65?'#d7a66b':'#527ba5'
        return <g key={n.id} onClick={()=>setSelectedNode(n.id)} className="graph-node" role="button" tabIndex="0" aria-label={`Select ${n.name}`} onKeyDown={e=>e.key==='Enter'&&setSelectedNode(n.id)}>
          {selected&&<circle cx={n.x} cy={n.y} r="35" fill="none" stroke="#8bbef0" strokeWidth="1.2" strokeDasharray="3 4"/>}
          {active&&<circle cx={n.x} cy={n.y} r="29" fill="none" stroke={stroke} strokeOpacity=".55"/>}
          <rect x={n.x-25} y={n.y-20} width="50" height="40" rx="10" fill={fill} stroke={stroke} strokeWidth={selected?2:1.2}/>
          <text x={n.x} y={n.y+4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#e5eef9">{n.id.split('-')[0]}</text>
          <text x={n.x} y={n.y+34} textAnchor="middle" fontSize="10.5" fill="#d0dbea">{n.name}</text>
          <text x={n.x} y={n.y+47} textAnchor="middle" fontSize="9" fill="#7f94ad">{n.risk}% sample risk</text>
        </g>
      })}
    </svg>
    <div className="graph-footer"><span><InfoDot/> Highlighted route is illustrative, not a confirmed attack.</span><span>Click a node to inspect</span></div>
  </div>
}
function InfoDot(){return <span className="info-dot">i</span>}

function Overview({setPage,selectedNode,setSelectedNode,snapshot}) {
  return <div className="page-stack">
    <div className="demo-callout"><div className="callout-icon"><ShieldAlert size={19}/></div><div><strong>Research prototype · Demo mode active</strong><p>All metrics, risk scores, events and attack paths shown here are simulated examples. Model integration is in progress.</p></div><Pill tone="blue">SIMULATED DATA</Pill></div>
    <div className="stats-grid">
      <StatCard icon={Network} label="Assets in graph" value="32" delta="Illustrative" foot="sample network" />
      <StatCard icon={AlertOctagon} label="Elevated-risk assets" value="07" delta="+2" deltaTone="orange" foot="vs. prior snapshot" />
      <StatCard icon={GitBranch} label="Candidate paths" value="12" delta="3 reviewed" deltaTone="blue" foot="hypothetical routes" />
      <StatCard icon={Activity} label="Model status" value="Training" delta="Not connected" deltaTone="muted" foot="live inference unavailable" />
    </div>
    <div className="content-grid two-thirds">
      <div className="panel"><div className="panel-head"><div><h3>Enterprise attack graph</h3><p>Illustrative node relationships and a sample route</p></div><button className="text-btn" onClick={()=>setPage('graph')}>Explore graph <ArrowRight size={14}/></button></div><AttackGraph selectedNode={selectedNode} setSelectedNode={setSelectedNode} snapshot={snapshot}/></div>
      <div className="panel risk-panel"><div className="panel-head"><div><h3>Risk distribution</h3><p>Simulated 32-asset sample</p></div><button className="more-btn" aria-label="Risk details" onClick={()=>setPage('predictions')}><ChevronRight size={18}/></button></div><div className="donut-wrap"><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={76} paddingAngle={3} stroke="none">{pieData.map((p,i)=><Cell key={i} fill={p.color}/>)}</Pie><Tooltip contentStyle={{background:'#111d2d',border:'1px solid #2b3b50',borderRadius:8,color:'#e8eff8'}}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>32</strong><span>assets</span></div></div><div className="distribution-list">{pieData.map(p=><div className="distribution-row" key={p.name}><span><i style={{background:p.color}}/>{p.name}</span><strong>{p.value}</strong></div>)}</div></div>
    </div>
    <div className="content-grid equal">
      <div className="panel"><div className="panel-head"><div><h3>Risk trend across snapshots</h3><p>Illustrative risk signals · not model output</p></div><Pill tone="neutral">5 snapshots</Pill></div><div className="chart-box"><ResponsiveContainer width="100%" height={210}><AreaChart data={trendData} margin={{top:8,right:8,left:-22,bottom:0}}><defs><linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6ea8df" stopOpacity={.25}/><stop offset="100%" stopColor="#6ea8df" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#223147" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="time" tick={{fill:'#7f91a8',fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'#7f91a8',fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:'#111d2d',border:'1px solid #2b3b50',borderRadius:8,color:'#e8eff8'}}/><Area type="monotone" dataKey="critical" name="Critical tier" stroke="#d9828d" fill="none" strokeWidth={2}/><Area type="monotone" dataKey="internal" name="Internal tier" stroke="#6ea8df" fill="url(#areaBlue)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></div>
      <div className="panel"><div className="panel-head"><div><h3>Recent demo activity</h3><p>Sample events in the scenario</p></div><button className="text-btn" onClick={()=>setPage('temporal')}>View timeline <ArrowRight size={14}/></button></div><div className="activity-list">{activity.slice(0,3).map((a,i)=><div className="activity-item" key={i}><span className={`activity-mark ${a.type}`}/><div className="activity-copy"><strong>{a.title}</strong><p>{a.sub}</p><span>{a.time} · {a.tag}</span></div></div>)}</div></div>
    </div>
    <div className="footnote"><InfoDot/> Demonstration environment only. Do not use simulated scores to make operational security decisions.</div>
  </div>
}

function GraphPage({selectedNode,setSelectedNode,snapshot}) {
  const node=nodes.find(n=>n.id===selectedNode)||nodes[0]
  return <div className="page-stack"><SectionHeading eyebrow="TOPOLOGY EXPLORER" title="Enterprise Attack Graph" description="Explore the illustrative infrastructure graph, inspect assets, and review a hypothetical route." action={<button className="secondary-btn" onClick={()=>setSelectedNode('DB-01')}><Target size={15}/> Focus high-risk asset</button>}/>
    <div className="demo-callout compact"><div className="callout-icon"><InfoDot/></div><div><strong>Illustrative topology</strong><p>Nodes and links are sample data created to demonstrate the graph interaction.</p></div><Pill tone="blue">{snapshot}</Pill></div>
    <div className="content-grid graph-layout"><div className="panel"><div className="panel-head"><div><h3>Network topology</h3><p>Click any node for asset details</p></div><div className="inline-actions"><Pill tone="neutral">7 shown</Pill><Pill tone="neutral">8 links</Pill></div></div><AttackGraph selectedNode={selectedNode} setSelectedNode={setSelectedNode} snapshot={snapshot}/></div>
      <div className="panel node-detail"><div className="panel-head"><div><div className="eyebrow">SELECTED ASSET</div><h3>{node.name}</h3><p>{node.id}</p></div><div className="node-icon"><Server size={21}/></div></div><div className="risk-score-block"><div><span>Sample risk score</span><strong className={riskClass(node.risk)}>{node.risk}<small>/100</small></strong></div><div className="vertical-meter"><span style={{height:`${node.risk}%`}} className={riskClass(node.risk)}/></div></div><div className="detail-rows"><div><span>IP address</span><strong>{node.ip}</strong></div><div><span>Asset type</span><strong>{node.type}</strong></div><div><span>Network zone</span><strong>{node.zone}</strong></div><div><span>Sample status</span><Pill tone={node.risk>=65?'orange':node.risk>=40?'blue':'neutral'}>{node.status}</Pill></div></div><div className="detail-note"><strong>Analyst note</strong><p>{node.desc}</p></div><div className="button-row"><button className="primary-btn" onClick={()=>navigator.clipboard?.writeText(`${node.id} — ${node.name} — illustrative risk ${node.risk}/100`)}><Download size={15}/> Copy asset summary</button></div></div></div>
    <div className="panel"><div className="panel-head"><div><h3>Connection inventory</h3><p>Sample directed relationships in the graph</p></div><Pill tone="neutral">Demo topology</Pill></div><div className="table-wrap"><table><thead><tr><th>Source</th><th>Destination</th><th>Relationship</th><th>Route relevance</th></tr></thead><tbody>{edges.map(([a,b],i)=><tr key={i}><td><span className="mono">{a}</span></td><td><span className="mono">{b}</span></td><td>Service connectivity</td><td>{paths[0].nodes.includes(a)&&paths[0].nodes.includes(b)?<Pill tone="blue">Highlighted path</Pill>:<Pill tone="neutral">Context link</Pill>}</td></tr>)}</tbody></table></div></div>
  </div>
}

function TemporalPage({snapshot,setSnapshot}) {
  const current=snapshots.find(s=>s.id===snapshot)||snapshots[0]
  const [play,setPlay]=useState(false)
  const [eventFilter,setEventFilter]=useState('all')
  const shown=activity.filter(a=>eventFilter==='all'||a.type===eventFilter)
  return <div className="page-stack"><SectionHeading eyebrow="SEQUENCE LEARNING" title="Temporal Attack Analysis" description="Review how illustrative security signals evolve across sequential graph snapshots." action={<Pill tone="blue"><Clock3 size={12}/> 5 sample snapshots</Pill>}/>
    <div className="demo-callout compact"><div className="callout-icon"><Activity size={18}/></div><div><strong>Temporal sequence is simulated</strong><p>This view demonstrates a possible interface for graph snapshots and event sequencing. It is not a live event stream.</p></div></div>
    <div className="panel"><div className="panel-head"><div><h3>Snapshot sequence</h3><p>Select a point to inspect its sample event context</p></div><button className="secondary-btn" onClick={()=>{const idx=snapshots.findIndex(s=>s.id===snapshot);setSnapshot(snapshots[(idx+1)%snapshots.length].id);setPlay(false)}}><RefreshCw size={14}/> Next snapshot</button></div><div className="timeline">{snapshots.map((s,i)=><button key={s.id} className={`timeline-step ${snapshot===s.id?'active':''}`} onClick={()=>setSnapshot(s.id)}><span className="timeline-dot"/><span className="timeline-time">{s.time}</span><strong>{s.title}</strong><small>{s.id}</small></button>)}</div><div className="snapshot-detail"><div className="snapshot-number">{current.id}</div><div><div className="eyebrow">{current.time} · SNAPSHOT CONTEXT</div><h3>{current.title}</h3><p>{current.detail}</p></div><Pill tone="blue">Simulated</Pill></div></div>
    <div className="content-grid equal"><div className="panel"><div className="panel-head"><div><h3>Signal progression</h3><p>Example values across five snapshots</p></div></div><div className="chart-box"><ResponsiveContainer width="100%" height={260}><LineChart data={trendData} margin={{top:8,right:12,left:-20,bottom:0}}><CartesianGrid stroke="#223147" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="time" tick={{fill:'#7f91a8',fontSize:11}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fill:'#7f91a8',fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:'#111d2d',border:'1px solid #2b3b50',borderRadius:8,color:'#e8eff8'}}/><Line type="monotone" dataKey="perimeter" name="Perimeter signal" stroke="#7d9dc3" strokeWidth={2} dot={{r:3}}/><Line type="monotone" dataKey="internal" name="Internal signal" stroke="#6ea8df" strokeWidth={2} dot={{r:3}}/><Line type="monotone" dataKey="critical" name="Critical asset signal" stroke="#d9828d" strokeWidth={2} dot={{r:3}}/></LineChart></ResponsiveContainer></div></div>
      <div className="panel"><div className="panel-head"><div><h3>Sequence interpretation</h3><p>Example narrative, not an automated finding</p></div><Pill tone="neutral">Analyst view</Pill></div><div className="sequence-list">{snapshots.map((s,i)=><div className={`sequence-item ${snapshot===s.id?'selected':''}`} key={s.id} onClick={()=>setSnapshot(s.id)} role="button" tabIndex="0" onKeyDown={e=>e.key==='Enter'&&setSnapshot(s.id)}><span className="sequence-index">{String(i+1).padStart(2,'0')}</span><div><strong>{s.title}</strong><p>{s.detail}</p></div><ChevronRight size={16}/></div>)}</div></div></div>
    <div className="panel"><div className="panel-head"><div><h3>Sample event log</h3><p>Events are fabricated for UI demonstration</p></div><select className="dark-select" value={eventFilter} onChange={e=>setEventFilter(e.target.value)}><option value="all">All event categories</option><option value="blue">Temporal / path events</option><option value="orange">Observations</option></select></div><div className="activity-list">{shown.map((a,i)=><div className="activity-item" key={i}><span className={`activity-mark ${a.type}`}/><div className="activity-copy"><strong>{a.title}</strong><p>{a.sub}</p><span>{a.time} · {a.tag}</span></div></div>)}</div></div>
  </div>
}

function PredictionsPage({setSelectedNode,setPage}) {
  const [horizon,setHorizon]=useState('30')
  const [threshold,setThreshold]=useState(60)
  const filtered=riskNodes.filter(n=>n.risk>=threshold)
  return <div className="page-stack"><SectionHeading eyebrow="PREDICTIVE INTELLIGENCE" title="Compromised Node Predictions" description="Explore a sample ranking that illustrates the intended output of the future prediction model." action={<Pill tone="orange"><AlertOctagon size={12}/> Not live inference</Pill>}/>
    <div className="demo-callout compact"><div className="callout-icon"><Crosshair size={18}/></div><div><strong>Prediction interface preview</strong><p>Scores and rankings below are simulated. Changing the horizon adjusts the demonstration scenario only; it does not run the trained model.</p></div></div>
    <div className="panel control-panel"><div><label htmlFor="horizon">Prediction horizon</label><p>Choose a future window for the demo scenario</p></div><select id="horizon" className="dark-select" value={horizon} onChange={e=>setHorizon(e.target.value)}><option value="15">Next 15 minutes</option><option value="30">Next 30 minutes</option><option value="60">Next 60 minutes</option><option value="120">Next 2 hours</option></select><div className="horizon-note"><Clock3 size={15}/> Sample horizon: <strong>{horizon==='120'?'2 hours':`${horizon} minutes`}</strong></div></div>
    <div className="stats-grid three"><StatCard icon={Target} label="Assets ranked" value="32" delta="Simulated" foot="sample graph" /><StatCard icon={AlertOctagon} label="Above threshold" value={String(filtered.length).padStart(2,'0')} delta={`Threshold ${threshold}`} deltaTone="orange" foot="illustrative only"/><StatCard icon={Activity} label="Inference state" value="Offline" delta="Model training" deltaTone="muted" foot="not connected"/></div>
    <div className="panel"><div className="panel-head"><div><h3>Risk-ranked assets</h3><p>Illustrative node-level ranking and rationale</p></div><div className="filter-inline"><SlidersHorizontal size={15}/><label htmlFor="threshold">Minimum score</label><strong>{threshold}</strong><input id="threshold" type="range" min="20" max="90" step="5" value={threshold} onChange={e=>setThreshold(Number(e.target.value))}/></div></div><div className="table-wrap"><table><thead><tr><th>Asset</th><th>Sample risk</th><th>Change</th><th>Primary contributing factors</th><th>Tier</th><th></th></tr></thead><tbody>{filtered.map(n=><tr key={n.id}><td><div className="asset-cell"><span className={`asset-mini ${riskClass(n.risk)}`}><Server size={15}/></span><div><strong>{n.name}</strong><small>{n.id} · {n.ip}</small></div></div></td><td><div className="risk-cell"><strong className={riskClass(n.risk)}>{n.risk}</strong><div className="mini-bar"><span className={riskClass(n.risk)} style={{width:`${n.risk}%`}}/></div></div></td><td><span className={n.change.startsWith('+')?'change-up':'change-down'}>{n.change}</span></td><td>{n.reason}</td><td><Pill tone={n.risk>=80?'red':n.risk>=65?'orange':n.risk>=40?'blue':'neutral'}>{n.tier}</Pill></td><td><button className="text-btn" onClick={()=>{setSelectedNode(n.id);setPage('graph')}}>Inspect <ChevronRight size={14}/></button></td></tr>)}{filtered.length===0&&<tr><td colSpan="6" className="empty-state">No sample assets meet this threshold. Lower the minimum score to view more.</td></tr>}</tbody></table></div></div>
    <div className="content-grid equal"><div className="panel"><div className="panel-head"><div><h3>Illustrative score factors</h3><p>Potential features the eventual model may consider</p></div></div><div className="factor-list">{[['Asset criticality',82],['Temporal behavior change',74],['Graph path centrality',67],['Privilege adjacency',55],['Exposure level',48]].map(([name,val])=><div className="factor-row" key={name}><span>{name}</span><div className="factor-track"><span style={{width:`${val}%`}}/></div><strong>{val}</strong></div>)}</div><div className="small-disclaimer">Factor values are illustrative weights for this UI, not trained feature importance.</div></div><div className="panel"><div className="panel-head"><div><h3>Analyst response guidance</h3><p>Defensive next steps for validation</p></div><ShieldCheck size={18} className="muted-icon"/></div><div className="recommendation-list"><div><span>01</span><p><strong>Validate the signal</strong>Correlate with endpoint, identity, and network telemetry.</p></div><div><span>02</span><p><strong>Check the asset context</strong>Confirm business criticality, exposure, and ownership.</p></div><div><span>03</span><p><strong>Prioritize safe mitigations</strong>Review access controls and isolate only when evidence supports it.</p></div></div></div></div>
  </div>
}

function PathsPage() {
  const [active,setActive]=useState(paths[0].id)
  const path=paths.find(p=>p.id===active)||paths[0]
  return <div className="page-stack"><SectionHeading eyebrow="PATH INTELLIGENCE" title="Potential Attack Paths" description="Compare hypothetical paths through the sample enterprise graph and review why they may warrant investigation." action={<Pill tone="blue"><GitBranch size={12}/> Route explorer</Pill>}/>
    <div className="demo-callout compact"><div className="callout-icon"><GitBranch size={18}/></div><div><strong>Hypothetical routes only</strong><p>These routes are manually authored sample scenarios, not paths predicted by the training model.</p></div></div>
    <div className="content-grid path-layout"><div className="panel path-list-panel"><div className="panel-head"><div><h3>Candidate route list</h3><p>Choose a path to inspect</p></div><span className="small-muted">3 samples</span></div>{paths.map(p=><button key={p.id} className={`path-option ${active===p.id?'active':''}`} onClick={()=>setActive(p.id)}><div className="path-option-top"><span className="path-id">{p.id}</span><Pill tone={p.severity==='High'?'orange':'blue'}>{p.severity}</Pill></div><strong>{p.name}</strong><p>{p.summary}</p><div className="path-meta"><span><GitBranch size={13}/>{p.hops} hops</span><span><Target size={13}/>{p.confidence}% sample score</span></div></button>)}</div>
      <div className="panel path-detail-panel"><div className="panel-head"><div><div className="eyebrow">{path.id} · ROUTE DETAIL</div><h3>{path.name}</h3><p>{path.summary}</p></div><Pill tone="orange">Simulated</Pill></div><div className="route-flow">{path.nodes.map((id,i)=><React.Fragment key={id}><div className="route-node"><span className="route-node-icon">{i===0?<Globe2 size={17}/>:i===path.nodes.length-1?<Database size={17}/>:<Server size={17}/>}</span><strong>{nodes.find(n=>n.id===id)?.name||id}</strong><small>{id}</small></div>{i<path.nodes.length-1&&<div className="route-arrow"><ArrowRight size={18}/></div>}</React.Fragment>)}</div><div className="path-score-row"><div><span>Illustrative path score</span><strong>{path.confidence}<small>/100</small></strong></div><div className="path-score-bar"><span style={{width:`${path.confidence}%`}}/></div></div><div className="detail-note"><strong>Why this route is shown</strong><ul>{path.rationale.map((r,i)=><li key={i}>{r}</li>)}</ul></div><div className="mitigation-box"><div className="mitigation-icon"><ShieldCheck size={18}/></div><div><strong>Defensive validation steps</strong><p>{path.mitigation}</p></div></div></div></div>
    <div className="panel"><div className="panel-head"><div><h3>Route comparison</h3><p>Sample route metadata</p></div></div><div className="table-wrap"><table><thead><tr><th>Route</th><th>Severity</th><th>Hops</th><th>Illustrative score</th><th>Destination asset</th></tr></thead><tbody>{paths.map(p=><tr key={p.id}><td><strong>{p.name}</strong><small className="table-sub">{p.id}</small></td><td><Pill tone={p.severity==='High'?'orange':'blue'}>{p.severity}</Pill></td><td>{p.hops}</td><td><strong>{p.confidence}/100</strong></td><td>{nodes.find(n=>n.id===p.nodes[p.nodes.length-1])?.name}</td></tr>)}</tbody></table></div></div>
  </div>
}

function MitrePage() {
  const [active,setActive]=useState(techniques[0].id)
  const [search,setSearch]=useState('')
  const technique=techniques.find(t=>t.id===active)||techniques[0]
  const filtered=techniques.filter(t=>(t.id+' '+t.name+' '+t.tactic).toLowerCase().includes(search.toLowerCase()))
  return <div className="page-stack"><SectionHeading eyebrow="EXPLAINABLE SECURITY" title="MITRE ATT&CK Mapping" description="Illustrative technique references, supporting context, and defensive recommendations." action={<Pill tone="blue"><ShieldCheck size={12}/> Explainability view</Pill>}/>
    <div className="demo-callout compact"><div className="callout-icon"><FileSearch size={18}/></div><div><strong>Example mappings for interface demonstration</strong><p>Technique associations are hypothetical examples for review, not confirmed detections or model-generated explanations.</p></div></div>
    <div className="panel"><div className="panel-head"><div><h3>Technique library</h3><p>Select a technique to see the sample explanation</p></div><div className="search-box"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search technique or tactic"/></div></div><div className="mitre-layout"><div className="technique-list">{filtered.map(t=><button key={t.id} className={`technique-option ${active===t.id?'active':''}`} onClick={()=>setActive(t.id)}><span className="tech-id">{t.id}</span><div><strong>{t.name}</strong><small>{t.tactic}</small></div><ChevronRight size={15}/></button>)}{filtered.length===0&&<div className="empty-state">No matching techniques.</div>}</div><div className="technique-detail"><div className="technique-banner"><div className="tech-icon"><Shield size={22}/></div><div><span className="eyebrow">MITRE ATT&CK · EXAMPLE</span><h3>{technique.name}</h3><div className="tech-badges"><Pill tone="blue">{technique.id}</Pill><Pill tone="neutral">{technique.tactic}</Pill></div></div></div><div className="explain-section"><div className="explain-heading"><Eye size={16}/><strong>Evidence context</strong></div><p>{technique.evidence}</p></div><div className="explain-section"><div className="explain-heading"><Sparkles size={16}/><strong>Why this mapping is shown</strong></div><p>{technique.relevance}</p></div><div className="explain-section"><div className="explain-heading"><ShieldCheck size={16}/><strong>Suggested defensive action</strong></div><p>{technique.mitigation}</p></div><div className="small-disclaimer">A production explanation should be grounded in actual telemetry and validated model features, with provenance and confidence available to the analyst.</div></div></div></div>
    <div className="content-grid equal"><div className="panel"><div className="panel-head"><div><h3>Explainability workflow</h3><p>Proposed integration pattern</p></div></div><div className="workflow-list">{[{n:'01',t:'Input evidence',d:'Graph structure, temporal events, and asset metadata'},{n:'02',t:'Model output',d:'Node risk or route ranking from the trained model'},{n:'03',t:'Technique association',d:'Candidate ATT&CK mapping with supporting evidence'},{n:'04',t:'Analyst validation',d:'Review, confirm, dismiss, and record rationale'}].map(x=><div key={x.n} className="workflow-step"><span>{x.n}</span><div><strong>{x.t}</strong><p>{x.d}</p></div></div>)}</div></div><div className="panel"><div className="panel-head"><div><h3>Research integrity note</h3><p>How to describe this demo accurately</p></div></div><div className="integrity-note"><LockKeyhole size={20}/><p><strong>Prototype, not operational detection.</strong><br/>This frontend demonstrates the intended analyst workflow. Actual predictive metrics, mappings, and explanations must be connected to validated model outputs before they are reported as research results.</p></div></div></div>
  </div>
}

function App() {
  const [page,setPage]=useState('overview')
  const [selectedNode,setSelectedNode]=useState('DB-01')
  const [snapshot,setSnapshot]=useState('T-05')
  const [sidebarOpen,setSidebarOpen]=useState(false)
  const [searchOpen,setSearchOpen]=useState(false)
  const [search,setSearch]=useState('')
  const [notice,setNotice]=useState('')
  const [showHelp,setShowHelp]=useState(false)
  const currentNav=navItems.find(n=>n.id===page)||navItems[0]
  const searchResults=navItems.filter(n=>n.label.toLowerCase().includes(search.toLowerCase()))
  const goto=(id)=>{setPage(id);setSidebarOpen(false);setSearchOpen(false);setSearch('')}
  const titleMap={overview:'Overview',graph:'Attack Graph',temporal:'Temporal Analysis',predictions:'Node Predictions',paths:'Attack Paths',mitre:'MITRE ATT&CK'}
  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen?'open':''}`}>
      <div className="brand"><div className="brand-mark"><Radar size={22}/></div><div><strong>HAWKS<span>™</span></strong><small>SECURITY INTELLIGENCE</small></div><button className="mobile-close" onClick={()=>setSidebarOpen(false)}><X size={18}/></button></div>
      <div className="workspace-select"><div className="workspace-icon"><Shield size={16}/></div><div><strong>Research workspace</strong><small>Local demo environment</small></div><ChevronDown size={14}/></div>
      <nav className="side-nav">{['Workspace','Intelligence'].map(group=><div className="nav-group" key={group}><span className="nav-label">{group}</span>{navItems.filter(n=>n.group===group).map(item=>{const Icon=item.icon;return <button key={item.id} onClick={()=>goto(item.id)} className={`nav-item ${page===item.id?'active':''}`}><Icon size={17}/><span>{item.label}</span>{item.id==='predictions'&&<span className="nav-count">5</span>}</button>})}</div>)}</nav>
      <div className="sidebar-bottom"><div className="model-status"><span className="status-indicator"/><div><strong>Model integration</strong><small>Training in progress</small></div><span className="status-dot"/></div><button className="nav-item" onClick={()=>setShowHelp(true)}><CircleHelp size={17}/><span>Demo guide</span></button><div className="user-card"><div className="avatar">H</div><div><strong>HAWKS Research</strong><small>Presenter workspace</small></div><Settings2 size={16}/></div></div>
    </aside>
    {sidebarOpen&&<div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)}/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={()=>setSidebarOpen(true)}><Menu size={19}/></button><div className="breadcrumbs"><span>HAWKS</span><ChevronRight size={14}/><strong>{titleMap[page]}</strong></div></div><div className="topbar-actions"><div className="demo-status"><span/> DEMO MODE</div><IconButton title="Search pages" onClick={()=>setSearchOpen(!searchOpen)}><Search size={17}/></IconButton><IconButton title="Demo guide" onClick={()=>setShowHelp(true)}><CircleHelp size={17}/></IconButton><IconButton title="Notifications (demo)" onClick={()=>setNotice('No live notifications — this is a local simulated environment.')}><Bell size={17}/></IconButton><div className="top-avatar">H</div></div></header>
      {searchOpen&&<div className="search-popover"><div className="search-box wide"><Search size={15}/><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a dashboard section…"/><button onClick={()=>setSearchOpen(false)}><X size={15}/></button></div>{searchResults.map(r=><button key={r.id} onClick={()=>goto(r.id)}>{r.label}<ArrowRight size={14}/></button>)}</div>}
      <div className="page-content"><div className="page-title-row"><div><div className="page-kicker">HIERARCHICAL ATTACK-PATH WEIGHTED KNOWLEDGE SYSTEM</div><h1>{titleMap[page]}</h1><p>Predictive cyber attack detection &amp; attack path intelligence</p></div><div className="page-title-actions"><span className="last-updated"><span className="status-dot"/> Local scenario · simulated</span><button className="secondary-btn" onClick={()=>{setSnapshot('T-01');setSelectedNode('DB-01');setNotice('Demo view reset to baseline snapshot. All displayed values remain simulated.')}}><RefreshCw size={14}/> Reset demo</button></div></div>
        {page==='overview'&&<Overview setPage={setPage} selectedNode={selectedNode} setSelectedNode={setSelectedNode} snapshot={snapshot}/>}
        {page==='graph'&&<GraphPage selectedNode={selectedNode} setSelectedNode={setSelectedNode} snapshot={snapshot}/>}
        {page==='temporal'&&<TemporalPage snapshot={snapshot} setSnapshot={setSnapshot}/>}
        {page==='predictions'&&<PredictionsPage setSelectedNode={setSelectedNode} setPage={setPage}/>}
        {page==='paths'&&<PathsPage/>}
        {page==='mitre'&&<MitrePage/>}
        <footer className="app-footer"><span>HAWKS Research Prototype <span className="footer-sep">•</span> Frontend demonstration</span><span><span className="status-dot"/> Model outputs not connected</span></footer>
      </div>
    </main>
    {notice&&<div className="toast"><InfoDot/><span>{notice}</span><button onClick={()=>setNotice('')}><X size={15}/></button></div>}
    {showHelp&&<div className="modal-backdrop" onClick={()=>setShowHelp(false)}><div className="help-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">PRESENTATION NOTES</span><h2>HAWKS demo guide</h2></div><button className="icon-btn" onClick={()=>setShowHelp(false)}><X size={17}/></button></div><div className="demo-callout"><div className="callout-icon"><ShieldAlert size={18}/></div><div><strong>Be clear about prototype status</strong><p>This is an interactive frontend with simulated data, not a live detection system.</p></div></div><div className="guide-steps">{[{n:'01',t:'Overview',d:'Introduce the six views and explain the research goal.'},{n:'02',t:'Attack Graph',d:'Select DB-01 and show how graph relationships are inspected.'},{n:'03',t:'Temporal Analysis',d:'Select snapshots to explain how a temporal workflow could be presented.'},{n:'04',t:'Predictions & Paths',d:'Explain the intended ranking and route review experience; scores are illustrative.'},{n:'05',t:'MITRE ATT&CK',d:'Show how a future model output can be connected to evidence and defensive actions.'}].map(s=><div key={s.n}><span>{s.n}</span><p><strong>{s.t}</strong>{s.d}</p></div>)}</div><div className="modal-foot"><button className="primary-btn" onClick={()=>setShowHelp(false)}>Got it</button></div></div></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App/>)
