import {createContext,useContext,useEffect,useState,ReactNode} from 'react'
export type Status='Open'|'Acknowledged'|'Resolved'
export interface MissionAlert{id:string;sev:'Critical'|'Warning'|'Information';text:string;system:string;status:Status;t:string}
export interface MissionEvent{t:string;text:string}
const A0:MissionAlert[]=[
{id:'AL-101',sev:'Warning',text:'Power reserve below preferred level',system:'Power',status:'Open',t:'T+12:03:10'},
{id:'AL-102',sev:'Warning',text:'Thermal system requires inspection',system:'Thermal',status:'Open',t:'T+12:05:44'},
{id:'AL-103',sev:'Information',text:'Communication link intermittent',system:'Comms',status:'Open',t:'T+12:09:02'},
{id:'AL-104',sev:'Critical',text:'Oxygen level warning in Crew Quarters',system:'Life Support',status:'Open',t:'T+12:11:30'},
{id:'AL-105',sev:'Information',text:'Docking alignment required',system:'Navigation',status:'Acknowledged',t:'T+12:14:18'}]
function load<T>(k:string,d:T):T{try{const v=localStorage.getItem(k);return v?JSON.parse(v) as T:d}catch{return d}}
export const fmt=(s:number)=>{const b=s+12*86400;const p=(n:number)=>String(n).padStart(2,'0');return `T+${p(Math.floor(b/86400))}d ${p(Math.floor(b%86400/3600))}:${p(Math.floor(b%3600/60))}:${p(b%60)}`}
interface Ctx{theme:'dark'|'light';toggleTheme:()=>void;alerts:MissionAlert[];setStatus:(id:string,s:Status)=>void;markAllRead:()=>void;events:MissionEvent[];met:string;unread:number;toast:string;}
const C=createContext<Ctx|null>(null)
export const useMission=()=>{const c=useContext(C);if(!c)throw new Error('Provider missing');return c}
export function Provider({children}:{children:ReactNode}){
const [theme,setTheme]=useState<'dark'|'light'>(()=>load('sv-theme','dark'))
const [alerts,setAlerts]=useState<MissionAlert[]>(()=>load('sv-alerts',A0))
const [sec,setSec]=useState(0)
const [toast,setToast]=useState('')
const [events,setEvents]=useState<MissionEvent[]>([{t:fmt(0),text:'Environmental systems check completed'},{t:fmt(0),text:'Solar array orientation updated'}])
useEffect(()=>{document.documentElement.setAttribute('data-bs-theme',theme);localStorage.setItem('sv-theme',JSON.stringify(theme))},[theme])
useEffect(()=>{localStorage.setItem('sv-alerts',JSON.stringify(alerts))},[alerts])
useEffect(()=>{const i=setInterval(()=>setSec(s=>s+1),1000);return()=>clearInterval(i)},[])
useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2500);return()=>clearTimeout(t)},[toast])
const log=(text:string)=>{setEvents(e=>[{t:fmt(sec),text},...e].slice(0,15));setToast(text)}
const setStatus=(id:string,s:Status)=>{setAlerts(a=>a.map(x=>x.id===id?{...x,status:s}:x));log(`Alert ${id} ${s.toLowerCase()}`)}
const markAllRead=()=>{setAlerts(a=>a.map(x=>x.status==='Open'?{...x,status:'Acknowledged'}:x));log('All alerts marked as read')}
const v:Ctx={theme,toggleTheme:()=>setTheme(t=>t==='dark'?'light':'dark'),alerts,setStatus,markAllRead,events,met:fmt(sec),unread:alerts.filter(a=>a.status==='Open').length,toast}
return <C.Provider value={v}>{children}</C.Provider>}
