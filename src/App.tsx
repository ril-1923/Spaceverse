import {lazy,Suspense} from 'react'
import {NavLink,Route,Routes} from 'react-router-dom'
import {useMission} from './store'
import {Overview,Analytics,Alerts} from './pages'
const Station=lazy(()=>import('./Station'))
const NAV=[['/','Mission Overview'],['/station','Space Station 3D'],['/analytics','Mission Analytics'],['/alerts','Alerts Center']]
export default function App(){
const {met,unread,theme,toggleTheme,toast}=useMission()
return <div className="shell">
<nav className="side" aria-label="Main"><div className="logo">SpaceVerse <b>3D</b></div>
{NAV.map(([to,l])=><NavLink key={to} to={to} end={to==='/'} className="nl">{l}</NavLink>)}</nav>
<div className="main"><header className="top"><span className="badge text-bg-info">SV-2049 · Nominal</span><span className="met" title="Simulated clock">{met}</span>
<span className="ms-auto">🔔 <span className="badge text-bg-danger" aria-label="unread alerts">{unread}</span></span>
<button className="btn btn-sm btn-outline-info" onClick={toggleTheme}>{theme==='dark'?'Light':'Dark'} theme</button></header>
<main className="content"><Suspense fallback={<p>Loading 3D scene…</p>}><Routes>
<Route path="/" element={<Overview/>}/><Route path="/station" element={<Station/>}/><Route path="/analytics" element={<Analytics/>}/><Route path="/alerts" element={<Alerts/>}/>
<Route path="*" element={<p>Page not found.</p>}/></Routes></Suspense></main></div>
{toast&&<div className="toast-s" role="status">{toast}</div>}</div>}
