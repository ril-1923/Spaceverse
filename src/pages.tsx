import {useState} from 'react'
import {Link} from 'react-router-dom'
import {CartesianGrid,Legend,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts'
import {useMission} from './store'
const Card=({l,v,u}:{l:string;v:string;u?:string})=><div className="col-6 col-lg-4"><div className="card-s"><div className="small text-secondary">{l}</div><div className="fs-3">{v}<small className="fs-6 text-secondary"> {u}</small></div></div></div>
export function Overview(){const {alerts,events}=useMission();const act=alerts.filter(a=>a.status!=='Resolved').length
const H:[string,string][]=[['Life support','ok'],['Electrical power','warn'],['Communications','warn'],['Thermal control','warn'],['Navigation','ok'],['Structural integrity','ok']]
return <><h4>ORBITAL HORIZON <small className="text-secondary">SV-2049 · simulated data</small></h4>
<div className="row g-3 mb-3"><Card l="Mission progress" v="68" u="%"/><Card l="Crew members" v="6"/><Card l="Station power" v="82" u="%"/><Card l="Oxygen level" v="96" u="%"/><Card l="Temperature" v="22" u="°C"/><Card l="Active alerts" v={String(act)}/></div>
<div className="row g-3"><div className="col-lg-6"><div className="card-s"><h6>System health</h6>{H.map(([n,s])=><div key={n} className="d-flex align-items-center gap-2 py-1"><span className={`dot ${s}`}/>{n}</div>)}<Link to="/station" className="btn btn-info btn-sm mt-3">Explore station</Link></div></div>
<div className="col-lg-6"><div className="card-s"><h6>Activity feed</h6>{events.map((e,i)=><div key={i} className="small py-1"><span className="text-secondary">{e.t}</span> {e.text}</div>)}</div></div></div></>}
const D=Array.from({length:24},(_,i)=>({h:`${i}:00`,Generation:Math.round(70+25*Math.sin(i/24*6.28-1)),Consumption:Math.round(55+8*Math.cos(i/3))}))
export function Analytics(){const [n,setN]=useState(24);const d=D.slice(-n)
const exp=()=>{try{const csv='hour,generation_kw,consumption_kw\n'+d.map(r=>`${r.h},${r.Generation},${r.Consumption}`).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='spaceverse-power.csv';a.click();URL.revokeObjectURL(a.href)}catch{alert('CSV export failed.')}}
return <><div className="d-flex gap-2 align-items-center mb-3"><h4 className="me-auto m-0">Power generation vs consumption (simulated)</h4>
<select className="form-select form-select-sm w-auto" value={n} onChange={e=>setN(+e.target.value)} aria-label="Time range"><option value={6}>Last 6 h</option><option value={12}>Last 12 h</option><option value={24}>Last 24 h</option></select>
<button className="btn btn-sm btn-info" onClick={exp}>Export CSV</button></div>
<div className="card-s" style={{height:360}}><ResponsiveContainer><LineChart data={d}><CartesianGrid strokeOpacity={.2}/><XAxis dataKey="h"/><YAxis unit=" kW"/><Tooltip/><Legend/><Line dataKey="Generation" stroke="#22d3ee" dot={false}/><Line dataKey="Consumption" stroke="#a78bfa" dot={false}/></LineChart></ResponsiveContainer></div></>}
export function Alerts(){const {alerts,setStatus,markAllRead}=useMission();const [q,setQ]=useState('');const [sev,setSev]=useState('All')
const L=alerts.filter(a=>(sev==='All'||a.sev===sev)&&(a.text+a.system+a.id).toLowerCase().includes(q.toLowerCase()))
return <><div className="d-flex gap-2 mb-3 flex-wrap"><input className="form-control form-control-sm w-auto" placeholder="Search alerts" aria-label="Search alerts" value={q} onChange={e=>setQ(e.target.value)}/>
<select className="form-select form-select-sm w-auto" value={sev} onChange={e=>setSev(e.target.value)} aria-label="Severity">{['All','Critical','Warning','Information'].map(s=><option key={s}>{s}</option>)}</select>
<button className="btn btn-sm btn-outline-info ms-auto" onClick={markAllRead}>Mark all as read</button></div>
{L.length===0?<p className="text-secondary">No alerts match these filters.</p>:<div className="table-responsive card-s"><table className="table table-sm align-middle m-0"><thead><tr><th>ID</th><th>Time</th><th>Severity</th><th>Description</th><th>System</th><th>Status</th><th/></tr></thead><tbody>
{L.map(a=><tr key={a.id}><td>{a.id}</td><td>{a.t}</td><td><span className={`badge ${a.sev==='Critical'?'text-bg-danger':a.sev==='Warning'?'text-bg-warning':'text-bg-info'}`}>{a.sev}</span></td><td>{a.text}</td><td>{a.system}</td><td>{a.status}</td>
<td className="text-nowrap"><button className="btn btn-sm btn-outline-info me-1" disabled={a.status!=='Open'} onClick={()=>setStatus(a.id,'Acknowledged')}>Acknowledge</button><button className="btn btn-sm btn-outline-success" disabled={a.status==='Resolved'} onClick={()=>setStatus(a.id,'Resolved')}>Resolve</button></td></tr>)}</tbody></table></div>}</>}
