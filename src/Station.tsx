import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react'
import {Canvas,useFrame} from '@react-three/fiber'
import {OrbitControls,Stars,Html} from '@react-three/drei'
import * as THREE from 'three'
interface Mod{id:string;name:string;desc:string;status:string;metrics:[string,string][];pos:[number,number,number];rot:[number,number,number]}
const MODS:Mod[]=[
{id:'cmd',name:'Command Module',desc:'Flight control consoles and station navigation.',status:'Nominal',metrics:[['Console load','34%'],['Uplink','Stable']],pos:[0,0,0],rot:[0,0,0]},
{id:'crew',name:'Crew Quarters',desc:'Sleeping pods and recreation for six crew members.',status:'Nominal',metrics:[['Occupancy','6/6'],['Cabin temp','22 °C']],pos:[2.6,0,0],rot:[0,0,Math.PI/2]},
{id:'lab',name:'Science Laboratory',desc:'Microgravity experiments and sample storage.',status:'Active',metrics:[['Experiments','4 running'],['Rack power','2.1 kW']],pos:[-2.6,0,0],rot:[0,0,Math.PI/2]},
{id:'life',name:'Life Support Module',desc:'Oxygen generation, CO₂ scrubbing and water recycling.',status:'Watch',metrics:[['Oxygen','96%'],['Water','81%']],pos:[0,0,2.4],rot:[Math.PI/2,0,0]},
{id:'power',name:'Power and Solar Module',desc:'Battery storage and solar array control.',status:'Reduced',metrics:[['Power','82%'],['Arrays','2/2 tracking']],pos:[0,1.6,0],rot:[0,0,Math.PI/2]},
{id:'dock',name:'Cargo and Docking Module',desc:'Docking port and cargo handling.',status:'Standby',metrics:[['Ports free','2/2'],['Cargo','Empty']],pos:[0,0,-2.4],rot:[Math.PI/2,0,0]}]
const COL:Record<string,string>={cmd:'#9fb4d0',crew:'#c8d3e3',lab:'#b9c7dd',life:'#a9d1c9',power:'#d6c9a0',dock:'#b4b9e8'}
const VIEWS:Record<string,{p:number[];t:number[]}>={Overview:{p:[8,4,10],t:[0,0,0]},Solar:{p:[0,6,8],t:[0,1.6,0]},Docking:{p:[0,2,-9],t:[0,0,-2.4]},Earth:{p:[0,-3,14],t:[0,-10,0]}}
interface Opts{stars:boolean;atmo:boolean;labels:boolean;orbit:boolean;light:number}
function earthTex(){const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d')!;g.fillStyle='#0b3d7a';g.fillRect(0,0,1024,512)
let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647
for(let i=0;i<70;i++){const x=r()*1024,y=60+r()*392;g.fillStyle=r()>.4?'#2f7d3b':'#8a6b3e';for(let j=0;j<14;j++){g.beginPath();g.arc(x+(r()-.5)*90,y+(r()-.5)*50,8+r()*26,0,7);g.fill()}}
for(let i=0;i<120;i++){g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(r()*1024,r()*512,20+r()*50,4+r()*8,0,0,7);g.fill()}
g.fillStyle='#eef6ff';g.fillRect(0,0,1024,22);g.fillRect(0,490,1024,22);return new THREE.CanvasTexture(c)}
function Earth({o}:{o:Opts}){const m=useRef<THREE.Mesh>(null);const tex=useMemo(earthTex,[]);useEffect(()=>()=>tex.dispose(),[tex])
useFrame((_,d)=>{if(m.current)m.current.rotation.y+=d*.02})
return <group position={[0,-16,0]}><mesh ref={m}><sphereGeometry args={[12,64,64]}/><meshStandardMaterial map={tex} roughness={.9}/></mesh>
{o.atmo&&<mesh><sphereGeometry args={[12.6,48,48]}/><meshBasicMaterial color="#4cc3ff" transparent opacity={.18} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>}
{o.orbit&&<mesh position={[0,16,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[16,.04,8,128]}/><meshBasicMaterial color="#8b5cf6"/></mesh>}</group>}
function Part({m,sel,onSel,labels,geo}:{m:Mod;sel:string|null;onSel:(id:string)=>void;labels:boolean;geo:JSX.Element}){const on=sel===m.id
return <group position={m.pos} onClick={e=>{e.stopPropagation();onSel(m.id)}}>
<mesh rotation={m.rot}>{geo}<meshStandardMaterial color={COL[m.id]} metalness={.7} roughness={.35} emissive={on?'#22d3ee':'#000'} emissiveIntensity={on?.5:0}/></mesh>
{on&&<mesh><torusGeometry args={[1.5,.03,8,48]}/><meshBasicMaterial color="#22d3ee"/></mesh>}
{labels&&<Html center distanceFactor={12} position={[0,1.2,0]}><span className="lbl">{m.name}</span></Html>}</group>}
function Panels({on,onSel}:{on:boolean;onSel:(id:string)=>void}){const r=useRef<THREE.InstancedMesh>(null)
useLayoutEffect(()=>{const d=new THREE.Object3D();let i=0;for(const sx of[-1,1])for(let k=0;k<6;k++)for(const dz of[-.8,.8]){d.position.set(sx*(2+k*.62),1.6,dz);d.updateMatrix();r.current!.setMatrixAt(i++,d.matrix)}r.current!.instanceMatrix.needsUpdate=true},[])
return <group onClick={e=>{e.stopPropagation();onSel('power')}}><mesh position={[0,1.6,0]}><boxGeometry args={[9,.08,.08]}/><meshStandardMaterial color="#8791a3" metalness={.8}/></mesh>
<instancedMesh ref={r} args={[undefined,undefined,24]}><boxGeometry args={[.58,.03,1.4]}/><meshStandardMaterial color="#1e3a8a" emissive="#2563eb" emissiveIntensity={on?.6:.15} metalness={.6} roughness={.3}/></instancedMesh></group>}
function Blink(){const m=useRef<THREE.MeshBasicMaterial>(null);useFrame(({clock})=>{if(m.current)m.current.color.set(Math.sin(clock.elapsedTime*4)>0?'#ff4d4d':'#401010')})
return <mesh position={[0,.9,0]}><sphereGeometry args={[.07,8,8]}/><meshBasicMaterial ref={m}/></mesh>}
function Rig({goal}:{goal:{p:number[];t:number[]}}){const ctl=useRef<any>(null);const act=useRef(false);useEffect(()=>{act.current=true},[goal])
useFrame(({camera},d)=>{const c=ctl.current;if(!c||!act.current)return;const a=1-Math.exp(-4*d),p=new THREE.Vector3(...goal.p);camera.position.lerp(p,a);c.target.lerp(new THREE.Vector3(...goal.t),a);c.update();if(camera.position.distanceTo(p)<.05)act.current=false})
return <OrbitControls ref={ctl} makeDefault minDistance={3} maxDistance={32} onStart={()=>{act.current=false}}/>}
function Scene({o,sel,onSel,goal}:{o:Opts;sel:string|null;onSel:(id:string|null)=>void;goal:{p:number[];t:number[]}}){
const g:Record<string,JSX.Element>={cmd:<sphereGeometry args={[.9,32,24]}/>,crew:<cylinderGeometry args={[.6,.6,2.2,24]}/>,lab:<cylinderGeometry args={[.6,.6,2.2,24]}/>,life:<cylinderGeometry args={[.55,.55,1.8,24]}/>,power:<cylinderGeometry args={[.3,.3,.8,16]}/>,dock:<cylinderGeometry args={[.7,.5,1.6,24]}/>}
return <>{o.stars&&<Stars radius={120} depth={40} count={4000} factor={4} fade/>}
<ambientLight intensity={.35*o.light}/><directionalLight position={[20,12,10]} intensity={2.2*o.light}/>
<Earth o={o}/>{MODS.map(m=><Part key={m.id} m={m} sel={sel} onSel={onSel} labels={o.labels} geo={g[m.id]}/>)}
<Panels on={sel==='power'} onSel={onSel}/><Blink/>
<mesh position={[0,0,-3.4]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.5,.07,8,24]}/><meshStandardMaterial color="#e5e7eb" metalness={.8}/></mesh>
<mesh position={[0,1.1,0]}><coneGeometry args={[.4,.25,20]}/><meshStandardMaterial color="#f1f5f9" metalness={.8}/></mesh>
<Rig goal={goal}/></>}
function webgl(){try{return !!document.createElement('canvas').getContext('webgl2')}catch{return false}}
export default function Station(){
const [sel,setSel]=useState<string|null>(null);const [goal,setGoal]=useState(VIEWS.Overview)
const [o,setO]=useState<Opts>({stars:true,atmo:true,labels:true,orbit:false,light:1})
const m=MODS.find(x=>x.id===sel)
if(!webgl())return <div className="alert alert-warning">WebGL is unavailable in this browser. Enable hardware acceleration to view the 3D station.</div>
const T=(k:'stars'|'atmo'|'labels'|'orbit',l:string)=><label className="form-check"><input className="form-check-input" type="checkbox" checked={o[k]} onChange={e=>setO({...o,[k]:e.target.checked})}/> {l}</label>
return <div className="stage"><div className="cv"><Canvas dpr={[1,1.75]} camera={{position:[8,4,10],fov:50}} onPointerMissed={()=>setSel(null)}><Scene o={o} sel={sel} onSel={setSel} goal={goal}/></Canvas>
<div className="hint">Drag to rotate · scroll to zoom · right-drag to pan · click a module</div></div>
<aside className="panel-s"><h6>Camera</h6><div className="d-flex flex-wrap gap-1 mb-3">{Object.keys(VIEWS).map(k=><button key={k} className="btn btn-sm btn-outline-info" onClick={()=>setGoal({...VIEWS[k]})}>{k}</button>)}<button className="btn btn-sm btn-info" onClick={()=>{setGoal({...VIEWS.Overview});setSel(null)}}>Reset</button></div>
<h6>Scene</h6>{T('stars','Stars')}{T('atmo','Atmosphere')}{T('labels','Labels')}{T('orbit','Orbit path')}
<label className="form-label small mt-2">Lighting {o.light.toFixed(1)}</label><input type="range" className="form-range" min={.4} max={1.6} step={.1} value={o.light} onChange={e=>setO({...o,light:+e.target.value})}/>
<hr/>{m?<div><h5>{m.name}</h5><span className="badge text-bg-info mb-2">{m.status}</span><p className="small">{m.desc}</p>{m.metrics.map(([k,v])=><div key={k} className="d-flex justify-content-between small"><span>{k}</span><b>{v}</b></div>)}<p className="small text-secondary mt-2">Simulated data</p></div>:<p className="small text-secondary">Select a module to see its status and metrics.</p>}</aside></div>}
