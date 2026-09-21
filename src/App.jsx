import {useState,useEffect,useRef} from 'react'
import {ArrowRight,ArrowUpRight,BarChart3,BriefcaseBusiness,CalendarDays,Check,ChevronLeft,ChevronRight,Circle,Edit3,Filter,Gavel,LogOut,Menu,Mic,MicOff,MonitorUp,MoreHorizontal,PhoneOff,Plus,Search,ShieldCheck,Square,Trash2,TrendingUp,Users,Video,VideoOff} from 'lucide-react'
import seed from './db.json'
const load=()=>{try{return JSON.parse(localStorage.getItem('courtdb'))||seed}catch{return seed}}
const nid=a=>Math.max(0,...a.map(x=>x.id))+1
const ini=n=>(n||'?').replace(/^(Adv\.|Justice)\s*/,'')[0]
const fmt=t=>new Date(t).toLocaleString()
const stc=s=>({'In Progress':'st-In',Upcoming:'st-Up',Completed:'st-Co',Delay:'st-De','On Hold':'st-De'}[s])
const STAT=['In Progress','Upcoming','Completed','Delay','On Hold']
const ROLES=['Judge','Public Prosecutor','Defense Lawyer','Plaintiff Lawyer','Defendant','Accused','Witness','Translator','Court Clerk']
const nm=a=>a.map(x=>x.name)

const IconButton=({label,children,className='',...p})=><button className={'icon-btn '+className} aria-label={label} title={label} {...p}>{children}</button>
function T({cols,rows,pageSize=8}){
 const [page,setPage]=useState(1),[limit,setLimit]=useState(pageSize), pages=Math.max(1,Math.ceil(rows.length/limit)), current=rows.slice((page-1)*limit,page*limit)
 useEffect(()=>setPage(1),[rows.length,limit])
 const shown=Array.from({length:pages},(_,i)=>i+1).slice(0,5)
 return <><div className="tw"><table><thead><tr>{cols.map(c=><th key={c[0]}>{c[0]}</th>)}</tr></thead>
 <tbody>{current.length?current.map(r=><tr key={r.id}>{cols.map(c=><td key={c[0]}>{c[1](r)}</td>)}</tr>):<tr><td colSpan={cols.length}><div className="empty"><Search size={18}/>No records found</div></td></tr>}</tbody></table></div>
 <div className="pager"><span>Showing {rows.length?(page-1)*limit+1:0}-{Math.min(page*limit,rows.length)} of {rows.length}</span><div className="pager-controls"><IconButton label="Previous page" disabled={page===1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={17}/></IconButton>{shown.map(number=><button key={number} className={'page-number '+(page===number?'active':'')} onClick={()=>setPage(number)}>{number}</button>)}{pages>5&&<span className="pager-ellipsis">...</span>}<IconButton label="Next page" disabled={page===pages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={17}/></IconButton><select className="page-size" value={limit} onChange={e=>setLimit(Number(e.target.value))}><option value={8}>8 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option></select></div></div>
 </>
}
const S=({l,v,set,o})=><label className="f"><span>{l}</span><select value={v} onChange={e=>set(e.target.value)}><option>All</option>{o.map(x=><option key={x}>{x}</option>)}</select></label>
const In=({l,v,set,t})=><label className="f"><span>{l}</span><input type={t} value={v} placeholder={l} onChange={e=>set(e.target.value)}/></label>

function Modal({title,fields,init={},onSave,onClose}){
 const [v,setV]=useState(init)
 return <div className="ov"><div className="modal"><h3>{title}</h3>
 {fields.map(f=><label key={f.k} className="f full"><span>{f.l}{f.req&&' *'}</span>
 {f.o?<select value={v[f.k]||''} onChange={e=>setV({...v,[f.k]:e.target.value})}><option value="">Select</option>{f.o.map(x=><option key={x}>{x}</option>)}</select>
 :<input type={f.t||'text'} value={v[f.k]||''} onChange={e=>setV({...v,[f.k]:e.target.value})}/>}</label>)}
 <div className="row"><button className="btn ghost" onClick={onClose}>Cancel</button>
 <button className="btn" onClick={()=>{if(fields.some(f=>f.req&&!v[f.k]))return alert('Please fill all required fields');onSave(v);onClose()}}>Save</button></div></div></div>
}

function Login({db,ok}){
 const [e,setE]=useState('admin@pjsofttech.com'),[p,setP]=useState(''),[er,setEr]=useState('')
 return <div className="login"><div className="login-art"><div className="court-mark"><Gavel size={42}/></div><p className="eyebrow">PUNE DISTRICT COURT</p><h1>Clarity for every case.</h1><p>One calm workspace for court administration, teams, hearings, and records.</p></div><form className="modal login-form" onSubmit={x=>{x.preventDefault();e===db.admin.email&&p===db.admin.password?ok():setEr('Incorrect email or password.')}}>
 <div className="brand-line"><div className="mini-mark"><Gavel size={20}/></div><span>{db.project}</span></div><h2>Welcome back</h2><p className="subtle">Sign in to your administration workspace</p>
 <label className="f full"><span>Email address</span><input value={e} onChange={x=>setE(x.target.value)}/></label>
 <label className="f full"><span>Password</span><input type="password" value={p} onChange={x=>setP(x.target.value)}/></label>
 {er&&<div className="err">{er}</div>}<button className="btn login-submit">Sign in <ArrowRight size={17}/></button></form></div>
}

function Dashboard({db}){
 const c=db.cases,n=s=>c.filter(x=>x.status===s).length,mx=Math.max(1,...STAT.map(n))
 const stats=[['Total cases',c.length,BriefcaseBusiness,'blue','All active records'],['In progress',n('In Progress'),TrendingUp,'orange','Being worked on'],['Upcoming',n('Upcoming'),CalendarDays,'purple','Next hearings'],['Completed',n('Completed'),ShieldCheck,'green','Closed matters'],['Participants',db.members.length,Users,'teal','Across all teams'],['Meetings held',db.meetings.length,BarChart3,'navy','Court sessions']]
 const months=['May','Jun','Jul','Aug','Sep','Oct'],monthly=months.map((_,i)=>c.filter(x=>new Date(x.start).getMonth()===i+4).length),maxMonthly=Math.max(1,...monthly)
 return <div className="dashboard-page"><div className="dashboard-head"><div></div></div>
 <div className="grid dashboard-stats">{stats.map(([a,b,Icon,tone,caption])=><div className={'card stat-card '+tone} key={a}><div className="stat-icon"><Icon size={18}/></div><div><h4>{a}</h4><div className="n">{b}</div><small>{caption}</small></div><ArrowUpRight className="stat-arrow" size={16}/></div>)}</div>
 <div className="dashboard-main-grid"><div className="card trend-card"><div className="section-heading"><div><h3>Case activity</h3><p>New matters opened by month</p></div><IconButton label="More chart options" className="plain"><MoreHorizontal size={19}/></IconButton></div><div className="chart-legend"><span><i className="legend-blue"/>Cases opened</span><b>{c.length} total</b></div><div className="column-chart">{monthly.map((value,i)=><div className="column-group" key={months[i]}><span>{value}</span><i><b style={{height:value/maxMonthly*100+'%'}}/></i><small>{months[i]}</small></div>)}</div></div>
 <div className="card distribution-card"><div className="section-heading"><div><h3>Case distribution</h3><p>Current status breakdown</p></div><IconButton label="More distribution options" className="plain"><MoreHorizontal size={19}/></IconButton></div><div className="donut" style={{background:`conic-gradient(#2e9e5b 0 ${n('Completed')/mx*100}%, #e68a00 ${n('Completed')/mx*100}% ${(n('Completed')+n('In Progress'))/mx*100}%, #8e24aa ${(n('Completed')+n('In Progress'))/mx*100}% 100%)`}}><div><strong>{c.length}</strong><span>cases</span></div></div><div className="distribution-list">{STAT.slice(0,3).map(s=><div key={s}><span><i className={'legend-'+(s==='Completed'?'green':s==='In Progress'?'orange':'purple')}/>{s}</span><b>{n(s)}</b></div>)}</div></div></div>
 <div className="dashboard-bottom"><div className="card activity-card"><div className="section-heading"><div><h3>Upcoming cases</h3><p>Matters needing attention</p></div><button className="text-action">View all <ArrowRight size={14}/></button></div>{db.cases.filter(x=>x.status!=='Completed').slice(0,3).map(item=><div className="activity-row" key={item.id}><div className="activity-icon"><BriefcaseBusiness size={16}/></div><div><b>{item.name}</b><small>{item.department} · {item.team}</small></div><span className={'status-tag '+stc(item.status)}>{item.status}</span></div>)}</div><div className="card activity-card"><div className="section-heading"><div><h3>Pending tasks</h3><p>Assigned work across teams</p></div><button className="text-action">View all <ArrowRight size={14}/></button></div>{db.tasks.filter(t=>t.status!=='Completed').slice(0,3).map(item=><div className="activity-row" key={item.id}><div className="activity-icon task"><Check size={16}/></div><div><b>{item.title}</b><small>{item.assignee} · due {item.due}</small></div><span className="status-tag st-Up">{item.status}</span></div>)}</div></div></div>
}

function Cases({db,add,del,upd,startMeet}){
 const [f,setF]=useState({c:'All',s:'All',b:'All',d:'All',t:'All'}),[m,setMState]=useState(false),[edit,setEdit]=useState(null);const setM=value=>setMState(Boolean(value))
 const sf=k=>v=>setF(x=>({...x,[k]:v}))
 const rows=db.cases.filter(x=>(f.c==='All'||x.name===f.c)&&(f.s==='All'||x.status===f.s)&&(f.b==='All'||x.branch===f.b)&&(f.d==='All'||x.department===f.d)&&(f.t==='All'||x.team===f.t))
 const n=s=>db.cases.filter(x=>x.status===s).length
 return <><div className="bar filter-row"><S l="Select Case" v={f.c} set={sf('c')} o={nm(db.cases)}/><S l="Status" v={f.s} set={sf('s')} o={STAT}/><S l="Branch" v={f.b} set={sf('b')} o={nm(db.branches)}/><S l="Department" v={f.d} set={sf('d')} o={nm(db.departments)}/><S l="Team" v={f.t} set={sf('t')} o={nm(db.teams)}/><button className="btn" onClick={()=>setM(1)}><Plus size={16}/>Add case</button>
 <span className="chip">Total Cases: {db.cases.length}</span><span className="chip r">Delay: {n('Delay')}</span><span className="chip o">In Progress: {n('In Progress')}</span><span className="chip">On Hold: {n('On Hold')}</span><span className="chip g">Completed: {n('Completed')}</span><span className="chip p">Upcoming: {n('Upcoming')}</span></div>
 <T rows={rows} cols={[['ID',r=>r.id],['Case',r=><button className="link-btn" onClick={()=>setEdit(r)}>{r.name}<Edit3 size={14}/></button>],['Branch',r=>r.branch],['Department',r=>r.department],['Team & Members',r=><><b>{r.team}</b><br/>{db.members.filter(x=>x.team===r.team).map(x=><span className="pill" key={x.id} title={x.role}>{x.name} · {x.role}</span>)}</>],
 ['Status',r=><select value={r.status} onChange={e=>upd('cases',r.id,{status:e.target.value})}>{STAT.map(s=><option key={s}>{s}</option>)}</select>],
 ['Progress',r=><div className="pg"><i><b style={{width:r.progress+'%'}}/></i>{r.progress}%</div>],['Start',r=>r.start],['End',r=>r.end],['Remark',r=>r.remark||'N/A'],
 ['Actions',r=><div className="actions"><IconButton label="Start meeting" className="meeting" onClick={()=>startMeet(r)}><Video size={16}/></IconButton><IconButton label="Delete case" className="danger" onClick={()=>del('cases',r.id)}><Trash2 size={16}/></IconButton></div>]]}/>
 {m&&<Modal title="Add case" onClose={()=>setM(0)} onSave={v=>add('cases',{progress:0,...v,status:v.status||'Upcoming'})} fields={[{k:'name',l:'Case title & number',req:1},{k:'branch',l:'Branch',o:nm(db.branches),req:1},{k:'department',l:'Department',o:nm(db.departments),req:1},{k:'team',l:'Team',o:nm(db.teams)},{k:'status',l:'Status',o:STAT},{k:'start',l:'Start date',t:'date',req:1},{k:'end',l:'End date',t:'date'},{k:'remark',l:'Remark'}]}/>} {edit&&<Modal title="Edit case" init={edit} onClose={()=>setEdit(null)} onSave={v=>upd('cases',edit.id,v)} fields={[{k:'name',l:'Case title & number',req:1},{k:'branch',l:'Branch',o:nm(db.branches),req:1},{k:'department',l:'Department',o:nm(db.departments),req:1},{k:'team',l:'Team',o:nm(db.teams)},{k:'status',l:'Status',o:STAT},{k:'progress',l:'Progress',t:'number'},{k:'start',l:'Start date',t:'date'},{k:'end',l:'End date',t:'date'},{k:'remark',l:'Remark'}]}/>}</>
}

function Tasks({db,add,del,upd}){
 const [m,setMState]=useState(false),[q,setQ]=useState('');const setM=value=>setMState(Boolean(value))
 return <><div className="bar"><In l="Search tasks" v={q} set={setQ}/><button className="btn" onClick={()=>setM(1)}><Plus size={16}/>Add task</button><span className="chip">Total Tasks: {db.tasks.length}</span></div>
 <T rows={db.tasks.filter(t=>(t.title+t.assignee).toLowerCase().includes(q.toLowerCase()))} cols={[['ID',r=>r.id],['Task',r=>r.title],['Case',r=>r.case],['Assigned to',r=>r.assignee],['Due',r=>r.due],['Status',r=><select value={r.status} onChange={e=>upd('tasks',r.id,{status:e.target.value})}>{['Pending','In Progress','Completed'].map(s=><option key={s}>{s}</option>)}</select>],['Action',r=><IconButton label="Delete task" className="danger" onClick={()=>del('tasks',r.id)}><Trash2 size={16}/></IconButton>]]}/>
 {m&&<Modal title="Assign task" onClose={()=>setM(0)} onSave={v=>add('tasks',{status:'Pending',...v})} fields={[{k:'title',l:'Task',req:1},{k:'case',l:'Case',o:nm(db.cases),req:1},{k:'assignee',l:'Assign to',o:[...nm(db.members)],req:1},{k:'due',l:'Due date',t:'date',req:1}]}/>}</>
}

function Members({db,add,del,upd}){
 const [f,setF]=useState({q:'',b:'All',d:'All',r:'All'}),[m,setMState]=useState(false),[tk,setTk]=useState(null),[edit,setEdit]=useState(null);const setM=value=>setMState(Boolean(value))
 const sf=k=>v=>setF(x=>({...x,[k]:v}))
 const rows=db.members.filter(x=>x.name.toLowerCase().includes(f.q.toLowerCase())&&(f.b==='All'||x.branch===f.b)&&(f.d==='All'||x.department===f.d)&&(f.r==='All'||x.role===f.r))
 return <><div className="bar"><In l="Search by name" v={f.q} set={sf('q')}/><S l="Branch" v={f.b} set={sf('b')} o={nm(db.branches)}/><S l="Department" v={f.d} set={sf('d')} o={nm(db.departments)}/><S l="Role" v={f.r} set={sf('r')} o={ROLES}/></div>
 <div className="bar"><button className="btn" onClick={()=>setM(1)}>ADD MEMBER</button><span className="chip">Total Members: {db.members.length}</span></div>
 <T rows={rows} cols={[['ID',r=>r.id],['Name',r=><><button className="link-btn" onClick={()=>setEdit(r)}>{r.name}<Edit3 size={14}/></button><small>{r.email}</small></>],['Department',r=>r.department],['Role',r=>r.role],['Branch',r=>r.branch],['Team',r=>r.team||'—'],['Language',r=>r.language],['Image',r=><div className="av">{ini(r.name)}</div>],
 ['Task',r=><IconButton label="Assign task" className="soft" onClick={()=>setTk(r)}><Plus size={16}/></IconButton>],
 ['Action',r=><div className="actions"><IconButton label="Promote to leader" className="purple" onClick={()=>{if(db.leaders.some(l=>l.email===r.email))return alert('Already a leader');add('leaders',{name:r.name,email:r.email,department:r.department,branch:r.branch})}}><ArrowRight size={16}/></IconButton><IconButton label="Delete member" className="danger" onClick={()=>del('members',r.id)}><Trash2 size={16}/></IconButton></div>]]}/>
 {m&&<Modal title="Add member" onClose={()=>setM(0)} onSave={v=>add('members',v)} fields={[{k:'name',l:'Full name',req:1},{k:'email',l:'Email',t:'email',req:1},{k:'branch',l:'Branch',o:nm(db.branches),req:1},{k:'department',l:'Department',o:nm(db.departments),req:1},{k:'language',l:'Language',o:nm(db.languages)}]}/>}
 {tk&&<Modal title={'Assign task to '+tk.name} onClose={()=>setTk(null)} onSave={v=>add('tasks',{status:'Pending',assignee:tk.name,...v})} fields={[{k:'title',l:'Task',req:1},{k:'case',l:'Case',o:nm(db.cases),req:1},{k:'due',l:'Due date',t:'date',req:1}]}/>} {edit&&<Modal title="Edit member" init={edit} onClose={()=>setEdit(null)} onSave={v=>upd('members',edit.id,v)} fields={[{k:'name',l:'Full name',req:1},{k:'email',l:'Email',t:'email',req:1},{k:'role',l:'Role',o:ROLES,req:1},{k:'branch',l:'Branch',o:nm(db.branches),req:1},{k:'department',l:'Department',o:nm(db.departments),req:1},{k:'team',l:'Team',o:nm(db.teams)},{k:'language',l:'Language',o:nm(db.languages)}]}/>}</>
}

function Leaders({db,add,del,upd}){
 const [f,setF]=useState({q:'',d:'All',b:'All'}),[m,setMState]=useState(false),[tk,setTk]=useState(null),[edit,setEdit]=useState(null);const setM=value=>setMState(Boolean(value))
 const sf=k=>v=>setF(x=>({...x,[k]:v}))
 return <><div className="bar"><In l="Search by name" v={f.q} set={sf('q')}/><S l="Department" v={f.d} set={sf('d')} o={nm(db.departments)}/><S l="Branch" v={f.b} set={sf('b')} o={nm(db.branches)}/><button className="btn" onClick={()=>setM(1)}><Plus size={16}/>Add leader</button><span className="chip">Total Leaders: {db.leaders.length}</span></div>
 <T rows={db.leaders.filter(x=>x.name.toLowerCase().includes(f.q.toLowerCase())&&(f.d==='All'||x.department===f.d)&&(f.b==='All'||x.branch===f.b))} cols={[['ID',r=>r.id],['Name',r=><><button className="link-btn" onClick={()=>setEdit(r)}>{r.name}<Edit3 size={14}/></button><small>{r.email}</small></>],['Department',r=>r.department],['Branch',r=>r.branch],['Cases led',r=>db.cases.filter(c=>db.teams.some(t=>t.name===c.team&&t.leader===r.name)).length],['Image',r=><div className="av">{ini(r.name)}</div>],['Task',r=><IconButton label="Assign task" className="soft" onClick={()=>setTk(r)}><Plus size={16}/></IconButton>],['Action',r=><IconButton label="Delete leader" className="danger" onClick={()=>del('leaders',r.id)}><Trash2 size={16}/></IconButton>]]}/>
 {m&&<Modal title="Add leader" onClose={()=>setM(0)} onSave={v=>add('leaders',v)} fields={[{k:'name',l:'Name',req:1},{k:'email',l:'Email',t:'email',req:1},{k:'department',l:'Department',o:nm(db.departments),req:1},{k:'branch',l:'Branch',o:nm(db.branches),req:1}]}/>}
 {tk&&<Modal title={'Assign task to '+tk.name} onClose={()=>setTk(null)} onSave={v=>add('tasks',{status:'Pending',assignee:tk.name,...v})} fields={[{k:'title',l:'Task',req:1},{k:'case',l:'Case',o:nm(db.cases),req:1},{k:'due',l:'Due date',t:'date',req:1}]}/>} {edit&&<Modal title="Edit leader" init={edit} onClose={()=>setEdit(null)} onSave={v=>upd('leaders',edit.id,v)} fields={[{k:'name',l:'Name',req:1},{k:'email',l:'Email',t:'email',req:1},{k:'department',l:'Department',o:nm(db.departments),req:1},{k:'branch',l:'Branch',o:nm(db.branches),req:1}]}/>}</>
}

function Teams({db,add,del,upd}){
 const [f,setF]=useState({q:'',b:'All',d:'All'}),[m,setMState]=useState(false),[a,setA]=useState(null),[edit,setEdit]=useState(null);const setM=value=>setMState(Boolean(value))
 const sf=k=>v=>setF(x=>({...x,[k]:v}))
 return <><div className="bar"><In l="Search teams" v={f.q} set={sf('q')}/><S l="Branch" v={f.b} set={sf('b')} o={nm(db.branches)}/><S l="Department" v={f.d} set={sf('d')} o={nm(db.departments)}/><button className="btn" onClick={()=>setM(1)}><Plus size={16}/>Add team</button><span className="chip">Total Teams: {db.teams.length}</span></div>
 <T rows={db.teams.filter(x=>x.name.toLowerCase().includes(f.q.toLowerCase())&&(f.b==='All'||x.branch===f.b)&&(f.d==='All'||x.department===f.d))} cols={[['ID',r=>r.id],['Team Name',r=><button className="link-btn" onClick={()=>setEdit(r)}>{r.name}<Edit3 size={14}/></button>],['Branch',r=>r.branch],['Department',r=>r.department],['Team Leader',r=>r.leader?<span className="pill">{r.leader}</span>:'Not assigned'],
 ['Team Members',r=>{const ms=db.members.filter(x=>x.team===r.name);return ms.length?ms.map(x=><span className="pill" key={x.id}>{x.name} ({x.role})</span>):'None'}],
 ['Actions',r=><div className="actions"><IconButton label="Add member" className="soft" onClick={()=>setA(r)}><Plus size={16}/></IconButton><IconButton label="Delete team" className="danger" onClick={()=>del('teams',r.id)}><Trash2 size={16}/></IconButton></div>]]}/>
 {m&&<Modal title="Add team" onClose={()=>setM(0)} onSave={v=>add('teams',v)} fields={[{k:'name',l:'Team name',req:1},{k:'branch',l:'Branch',o:nm(db.branches),req:1},{k:'department',l:'Department',o:nm(db.departments),req:1},{k:'leader',l:'Team leader',o:nm(db.leaders)}]}/>}
 {a&&<Modal title={'Add member to '+a.name} onClose={()=>setA(null)} onSave={v=>{const p=db.members.find(x=>x.name===v.who);upd('members',p.id,{team:a.name})}} fields={[{k:'who',l:'Member',o:nm(db.members.filter(x=>x.team!==a.name)),req:1}]}/>} {edit&&<Modal title="Edit team" init={edit} onClose={()=>setEdit(null)} onSave={v=>upd('teams',edit.id,v)} fields={[{k:'name',l:'Team name',req:1},{k:'branch',l:'Branch',o:nm(db.branches),req:1},{k:'department',l:'Department',o:nm(db.departments),req:1},{k:'leader',l:'Team leader',o:nm(db.leaders)}]}/>}</>
}

function Meetings({db,startMeet,setRoom}){
 const [m,setMState]=useState(false);const setM=value=>setMState(Boolean(value))
 return <><div className="bar"><button className="btn" onClick={()=>setM(1)}><Video size={16}/>Start meeting</button><span className="chip">Total Meetings: {db.meetings.length}</span></div>
 <T rows={[...db.meetings].reverse()} cols={[['ID',r=>r.id],['Case',r=><span className="lk">{r.caseName}</span>],['Host',r=>r.host],['Started',r=>fmt(r.start)],['Duration',r=>r.end?Math.round((r.end-r.start)/60000)+' min':'Live'],['Participants',r=>r.participants.length],['Chat messages',r=>(r.chat||[]).length],['Recording',r=>r.recorded?'Yes':'No'],['Action',r=>!r.end?<IconButton label="Rejoin meeting" className="meeting" onClick={()=>setRoom(r)}><Video size={16}/></IconButton>:'Ended']]}/>
 {m&&<Modal title="Start meeting" onClose={()=>setM(0)} onSave={v=>startMeet(db.cases.find(c=>c.name===v.c))} fields={[{k:'c',l:'Select case',o:nm(db.cases),req:1}]}/>}</>
}

function Settings({db,add,del,upd}){
 const [k,setK]=useState('departments'),[q,setQ]=useState(''),[m,setMState]=useState(false);const setM=value=>setMState(Boolean(value))
 const L={departments:'Department',branches:'Branch',languages:'Language'}
 return <div className="set"><div className="sn">{Object.keys(L).map(x=><a key={x} className={k===x?'on':''} onClick={()=>{setK(x);setQ('')}}>Add {L[x]}</a>)}</div>
 <div><div className="bar"><In l={`Search ${L[k].toLowerCase()}s...`} v={q} set={setQ}/><button className="btn" onClick={()=>setM(1)}><Plus size={16}/>Add {L[k]}</button><span className="chip">Total {L[k]}s: {db[k].length}</span></div>
 <T rows={db[k].filter(x=>x.name.toLowerCase().includes(q.toLowerCase()))} cols={[['ID',r=>r.id],[L[k]+' Name',r=>r.name],['Actions',r=><IconButton label={'Delete '+L[k].toLowerCase()} className="danger" onClick={()=>del(k,r.id)}><Trash2 size={16}/></IconButton>]]}/></div>
 {m&&<Modal title={'Add '+L[k]} onClose={()=>setM(0)} onSave={v=>add(k,v)} fields={[{k:'name',l:L[k]+' name',req:1}]}/>}
 </div>
}

function Room({m,db,upd,close}){
 const [chat,setChat]=useState(m.chat||[]),[txt,setTxt]=useState(''),[side,setSide]=useState('chat'),[mic,setMic]=useState(true),[cam,setCam]=useState(true),[rec,setRec]=useState(false),[t,setT]=useState(0),[note,setNote]=useState(''),[rc,setRc]=useState(!!m.recorded)
 const vid=useRef(),st=useRef(),mr=useRef(),ch=useRef([])
 useEffect(()=>{navigator.mediaDevices?.getUserMedia({video:true,audio:true}).then(s=>{st.current=s;vid.current.srcObject=s}).catch(()=>setNote('Camera or microphone not available. Allow access in the browser to enable them.'))
 const i=setInterval(()=>setT(x=>x+1),1000);return()=>{clearInterval(i);st.current?.getTracks().forEach(x=>x.stop())}},[])
 const tog=(kind,on,set)=>{st.current?.[kind]().forEach(x=>x.enabled=!on);set(!on)}
 const send=()=>{if(!txt.trim())return;const c=[...chat,{from:'Admin',text:txt,at:Date.now()}];setChat(c);setTxt('');upd('meetings',m.id,{chat:c})}
 const record=()=>{if(rec){mr.current.stop();return}
  if(!st.current)return setNote('Turn on camera or microphone access to record.')
  ch.current=[];mr.current=new MediaRecorder(st.current);mr.current.ondataavailable=e=>ch.current.push(e.data)
  mr.current.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(ch.current,{type:'video/webm'}));a.download=`meeting-${m.id}.webm`;a.click();setRec(false);setRc(true);upd('meetings',m.id,{recorded:true})}
  mr.current.start();setRec(true)}
 const share=async()=>{try{const s=await navigator.mediaDevices.getDisplayMedia({video:true});vid.current.srcObject=s;s.getVideoTracks()[0].onended=()=>vid.current.srcObject=st.current}catch{}}
 const leave=()=>{if(rec)mr.current.stop();upd('meetings',m.id,{end:Date.now(),chat});close()}
 const mm=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')
 return <div className="room"><div className="rtop"><div><b>{m.caseName}</b><div style={{fontSize:12,opacity:.8}}>Meeting #{m.id} · Hosted by {m.host} · {mm}{rec&&' · ● Recording'}</div></div><button className="btn ghost sm" onClick={()=>navigator.clipboard?.writeText(location.origin+'/meet/'+m.code)}>Copy invite link</button></div>
 {note&&<div style={{background:'#7a5b00',padding:'6px 18px',fontSize:12}}>{note}</div>}
 <div className="rbody"><div className="tiles"><div className="tile"><video ref={vid} autoPlay muted playsInline/><span className="nm">Admin (Host)</span></div>
 {m.participants.map(p=><div className="tile" key={p.name}><div className="av" style={{width:64,height:64,fontSize:26}}>{ini(p.name)}</div><span className="nm">{p.name} · {p.role}</span></div>)}</div>
 <div className="rs"><div className="tb"><button className={side==='chat'?'on':''} onClick={()=>setSide('chat')}>Chat</button><button className={side==='info'?'on':''} onClick={()=>setSide('info')}>Details</button><button className={side==='ppl'?'on':''} onClick={()=>setSide('ppl')}>People</button></div>
 {side==='chat'&&<><div className="msgs">{chat.length?chat.map((c,i)=><div className="msg" key={i}><b>{c.from}</b><small>{new Date(c.at).toLocaleTimeString()}</small><div>{c.text}</div></div>):'No messages yet.'}</div><div className="in"><input value={txt} placeholder="Type a message" onChange={e=>setTxt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/><button className="btn" onClick={send}>Send</button></div></>}
 {side==='info'&&<div className="det"><b>Case:</b> {m.caseName}<br/><b>Branch:</b> {m.branch}<br/><b>Team:</b> {m.team}<br/><b>Started by:</b> {m.host} (admin@pjsofttech.com)<br/><b>Started at:</b> {fmt(m.start)}<br/><b>Duration:</b> {mm}<br/><b>Meeting code:</b> {m.code}<br/><b>Recording:</b> {rec?'In progress':rc?'Saved to downloads':'Off'}<br/><b>Messages:</b> {chat.length}</div>}
 {side==='ppl'&&<div className="det"><b>Host:</b> Admin<br/>{m.participants.map(p=><div key={p.name}>{p.name}<small style={{display:'block',color:'var(--mu)',lineHeight:1.2}}>{p.role} · {p.language} · {p.email}</small></div>)}</div>}</div></div>
 <div className="rc">
  <button className={'meeting-control'+(mic?'':' active')} onClick={()=>tog('getAudioTracks',mic,setMic)} aria-label={mic?'Mute microphone':'Unmute microphone'} title={mic?'Mute microphone':'Unmute microphone'}>{mic?<Mic size={18}/>:<MicOff size={18}/>}</button>
  <button className={'meeting-control'+(cam?'':' active')} onClick={()=>tog('getVideoTracks',cam,setCam)} aria-label={cam?'Stop video':'Start video'} title={cam?'Stop video':'Start video'}>{cam?<Video size={18}/>:<VideoOff size={18}/>}</button>
  <button className="meeting-control" onClick={share} aria-label="Share screen" title="Share screen"><MonitorUp size={18}/></button>
  <button className={'meeting-control'+(rec?' active':'')} onClick={record} aria-label={rec?'Stop recording':'Start recording'} title={rec?'Stop recording':'Start recording'}>{rec?<Square size={16}/>:<Circle size={18}/>}</button>
  <button className="meeting-control end" onClick={leave} aria-label="End meeting" title="End meeting"><PhoneOff size={18}/></button>
 </div></div>
}

const TABS=[['dashboard','Dashboard'],['cases','Case'],['tasks','Task List'],['members','Member'],['leaders','Leader'],['teams','Team'],['meetings','Meetings'],['settings','Setting']]
export default function App(){
 const [db,setDb]=useState(load),[auth,setAuth]=useState(()=>localStorage.getItem('courtauth')==='1'),[tab,setTab]=useState('dashboard'),[room,setRoom]=useState(null),[nav,setNav]=useState(false)
 useEffect(()=>localStorage.setItem('courtdb',JSON.stringify(db)),[db])
 const set=(k,f)=>setDb(d=>({...d,[k]:f(d[k])}))
 const add=(k,o)=>set(k,a=>[...a,{...o,id:nid(a)}])
 const del=(k,id)=>confirm('Delete this record?')&&set(k,a=>a.filter(x=>x.id!==id))
 const upd=(k,id,o)=>{set(k,a=>a.map(x=>x.id===id?{...x,...o}:x));setRoom(r=>r&&k==='meetings'&&r.id===id?{...r,...o}:r)}
 const startMeet=c=>{const ps=db.members.filter(x=>x.team===c.team);const id=nid(db.meetings)
  const m={id,caseName:c.name,branch:c.branch,team:c.team,host:'Admin',start:Date.now(),code:Math.random().toString(36).slice(2,5)+'-'+Math.random().toString(36).slice(2,6)+'-'+Math.random().toString(36).slice(2,5),participants:ps,chat:[]}
  set('meetings',a=>[...a,m]);setRoom(m)}
 if(!auth)return <Login db={db} ok={()=>{localStorage.setItem('courtauth','1');setAuth(true)}}/>
 const go=t=>{setTab(t);setNav(false)},P={db,add,del,upd,startMeet,setRoom}
 const C={dashboard:Dashboard,cases:Cases,tasks:Tasks,members:Members,leaders:Leaders,teams:Teams,meetings:Meetings,settings:Settings}[tab]
 return <><div className="hdr"><IconButton label="Open navigation" className="burger" onClick={()=>setNav(!nav)}><Menu size={22}/></IconButton><h1>{db.project} <span>Administration</span></h1><span className="mid">Pune District Court</span><IconButton label="Log out" className="logout" onClick={()=>{localStorage.removeItem('courtauth');setAuth(false)}}><LogOut size={17}/></IconButton></div>
 <div className={'side'+(nav?' open':'')}>{[['dashboard','Main Dashboard'],['cases','Case Management'],['members','Court Participants'],['meetings','Meetings'],['settings','Setting']].map(([k,l])=><a key={k} className={tab===k?'on':''} onClick={()=>go(k)}>{l}</a>)}
 <a onClick={()=>{if(confirm('Reset all demo data?')){localStorage.removeItem('courtdb');location.reload()}}}>Reset demo data</a></div>
 <div className="main"><div className="tabs">{TABS.map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>go(k)}>{l}</button>)}</div><C {...P}/></div>
 {room&&<Room key={room.id} m={room} db={db} upd={upd} close={()=>setRoom(null)}/>}</>
}
