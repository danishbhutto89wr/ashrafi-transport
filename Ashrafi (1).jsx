import { useState, useEffect, useCallback } from "react";

const CREDS = { user: "admin", pass: "ashrafi2024" };

const SEED = [
  { id:1, truck:"UP32AB1234", from:"Delhi",      to:"Lucknow",    goods:"Wheat",       amount:42000, date:"2025-04-03", driver:"Ramesh Kumar",  note:"On time"    },
  { id:2, truck:"UP32AB1234", from:"Lucknow",    to:"Kanpur",     goods:"Sugar",       amount:28000, date:"2025-04-18", driver:"Ramesh Kumar",  note:""           },
  { id:3, truck:"DL01CA5678", from:"Delhi",      to:"Agra",       goods:"Iron Rods",   amount:55000, date:"2025-04-22", driver:"Suresh Yadav",  note:"Heavy load" },
  { id:4, truck:"UP14CD9012", from:"Varanasi",   to:"Allahabad",  goods:"Cotton",      amount:36000, date:"2025-05-07", driver:"Anil Singh",    note:""           },
  { id:5, truck:"UP32AB1234", from:"Kanpur",     to:"Delhi",      goods:"Textiles",    amount:48000, date:"2025-05-15", driver:"Ramesh Kumar",  note:""           },
  { id:6, truck:"HR26EF3456", from:"Gurgaon",    to:"Jaipur",     goods:"Electronics", amount:62000, date:"2025-05-20", driver:"Mohit Sharma",  note:"Fragile"    },
  { id:7, truck:"DL01CA5678", from:"Agra",       to:"Delhi",      goods:"Marble",      amount:70000, date:"2025-06-02", driver:"Suresh Yadav",  note:""           },
  { id:8, truck:"UP14CD9012", from:"Allahabad",  to:"Lucknow",    goods:"Rice",        amount:31000, date:"2025-06-10", driver:"Anil Singh",    note:"ETA 2 days" },
  { id:9, truck:"UP32AB1234", from:"Delhi",      to:"Meerut",     goods:"Furniture",   amount:25000, date:"2025-06-15", driver:"Ramesh Kumar",  note:""           },
  { id:10,truck:"HR26EF3456", from:"Jaipur",     to:"Delhi",      goods:"Handicrafts", amount:44000, date:"2025-06-18", driver:"Mohit Sharma",  note:"Loading"    },
];

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDate = d => { if(!d) return "—"; const [y,m,dd] = d.split("-"); return `${dd} ${months[+m-1]} ${y}`; };
const fmtYM   = ym => { const [y,m] = ym.split("-"); return `${months[+m-1]} ${y}`; };
const fmtAmt  = a => "₹" + Number(a).toLocaleString("en-IN");
const today   = () => new Date().toISOString().split("T")[0];
const thisMonth = () => new Date().toISOString().substring(0,7);

// ── Styles as JS object (inline) ──
const S = {
  // Colors
  road:"#0f3460", ink:"#1a1a2e", am:"#f5a623", amd:"#d4891a",
  ok:"#38a169", dn:"#e53e3e", mu:"#6b7280", bd:"#dde3ee", tx:"#1f2937",

  topbar:{background:"linear-gradient(135deg,#1a1a2e,#0f3460)",padding:"0 1.25rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:62,position:"sticky",top:0,zIndex:300,boxShadow:"0 2px 20px rgba(0,0,0,.4)"},
  bname:{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"1.28rem",color:"#f5a623"},
  bsub:{fontSize:".56rem",color:"rgba(255,255,255,.4)",letterSpacing:".14em",textTransform:"uppercase"},
  pw:{maxWidth:1120,margin:"0 auto",padding:"1.3rem 1rem"},
  hero:{background:"linear-gradient(135deg,#1a1a2e,#0f3460)",borderRadius:16,padding:"1.4rem 1.6rem",color:"#fff",marginBottom:"1.3rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap",boxShadow:"0 6px 24px rgba(15,52,96,.28)"},
  heroH1:{fontFamily:"'Rajdhani',sans-serif",fontSize:"1.5rem",fontWeight:700,color:"#f5a623",margin:0},
  card:{background:"#fff",borderRadius:14,border:"1px solid #dde3ee",padding:"1.3rem",marginBottom:"1.2rem",boxShadow:"0 2px 10px rgba(0,0,0,.06)"},
  ct:{fontFamily:"'Rajdhani',sans-serif",fontSize:"1.08rem",fontWeight:700,color:"#1a1a2e",marginBottom:"1rem",display:"flex",alignItems:"center",gap:".45rem",borderBottom:"2px solid #f5a623",paddingBottom:".55rem"},
};

function Toast({ toasts }) {
  return (
    <div style={{position:"fixed",top:72,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding:".72rem 1.1rem",borderRadius:10,fontSize:".84rem",fontWeight:600,
          display:"flex",alignItems:"center",gap:".5rem",
          boxShadow:"0 6px 24px rgba(0,0,0,.2)",maxWidth:320,
          background: t.type==="ok"?"#065f46":t.type==="del"?"#991b1b":t.type==="upd"?"#1e40af":"#7c2d12",
          color:"#fff",
          borderLeft: `4px solid ${t.type==="ok"?"#6ee7b7":t.type==="del"?"#fca5a5":t.type==="upd"?"#93c5fd":"#fdba74"}`,
          transition:"all .3s"
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

function Btn({ children, onClick, color="road", sm, style={} }) {
  const bg = color==="am"?"linear-gradient(135deg,#f5a623,#d4891a)":color==="red"?"linear-gradient(135deg,#e53e3e,#c53030)":color==="outline"?"transparent":"linear-gradient(135deg,#0f3460,#1a1a2e)";
  const cl = color==="outline"?"#0f3460":"#fff";
  const bd = color==="outline"?"1.5px solid #0f3460":"none";
  return (
    <button onClick={onClick} style={{
      padding:sm?".32rem .65rem":".55rem 1.2rem",borderRadius:9,fontFamily:"'Inter',sans-serif",
      fontWeight:600,fontSize:sm?".74rem":".84rem",cursor:"pointer",border:bd,
      background:bg,color:cl,display:"inline-flex",alignItems:"center",gap:".4rem",
      lineHeight:1.3,boxShadow:color!=="outline"?"0 3px 12px rgba(0,0,0,.2)":"none",
      transition:"all .18s",...style
    }}>{children}</button>
  );
}

function StatCard({ val, label, accent }) {
  const colors = { am:"#d4891a", gn:"#38a169", default:"#0f3460" };
  const col = colors[accent]||colors.default;
  const bar = accent==="am"?"linear-gradient(90deg,#f5a623,#d4891a)":accent==="gn"?"linear-gradient(90deg,#38a169,#68d391)":"linear-gradient(90deg,#0f3460,#f5a623)";
  return (
    <div style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:14,padding:"1.1rem 1rem",textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,.06)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:bar}}/>
      <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"1.9rem",fontWeight:700,color:col,lineHeight:1}}>{val}</div>
      <div style={{fontSize:".68rem",color:"#6b7280",textTransform:"uppercase",letterSpacing:".07em",marginTop:".2rem"}}>{label}</div>
    </div>
  );
}

function Table({ cols, rows, empty="Koi entry nahi." }) {
  if(!rows.length) return <div style={{textAlign:"center",padding:"2.5rem 1rem",color:"#6b7280"}}><div style={{fontSize:"2.5rem",marginBottom:".5rem"}}>📭</div><p style={{fontSize:".86rem"}}>{empty}</p></div>;
  return (
    <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:".82rem"}}>
        <thead><tr>{cols.map((c,i)=><th key={i} style={{background:"linear-gradient(135deg,#1a1a2e,#0f3460)",color:"rgba(255,255,255,.9)",padding:".7rem .85rem",textAlign:"left",fontWeight:600,fontSize:".67rem",letterSpacing:".08em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r,i)=><tr key={i} style={{borderBottom:"1px solid #eef0f6"}}>{r.map((c,j)=><td key={j} style={{padding:".65rem .85rem",verticalAlign:"middle"}}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function ProgressBar({ pct }) {
  return <div style={{height:7,background:"#dde3ee",borderRadius:4,overflow:"hidden",minWidth:60}}><div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#0f3460,#f5a623)",borderRadius:4}}/></div>;
}

// ══════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState(false);

  const attempt = () => {
    if(u===CREDS.user && p===CREDS.pass){ setErr(false); onLogin(); }
    else { setErr(true); setP(""); }
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",background:"#0f0f1a",position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 20% 50%,rgba(15,52,96,.8),transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(245,166,35,.15),transparent 50%),#0a0a18",zIndex:0}}/>
      {/* floating trucks */}
      {[...Array(6)].map((_,i)=>(
        <div key={i} style={{position:"fixed",top:`${10+i*14}%`,fontSize:"2rem",opacity:.05,zIndex:0,animation:`floatT ${18+i*3}s linear infinite`,animationDelay:`-${i*4}s`,whiteSpace:"nowrap"}}>🚛🚛🚛🚛🚛🚛🚛🚛🚛🚛</div>
      ))}
      <style>{`@keyframes floatT{0%{transform:translateX(-200px)}100%{transform:translateX(110vw)}}`}</style>

      <div style={{position:"relative",zIndex:1,background:"rgba(255,255,255,.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,.1)",borderRadius:24,padding:"2.75rem 2.25rem",width:"100%",maxWidth:400,boxShadow:"0 32px 80px rgba(0,0,0,.6)",textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#1a1a2e,#0f3460)",border:"2px solid rgba(245,166,35,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.2rem",margin:"0 auto .75rem",boxShadow:"0 8px 32px rgba(245,166,35,.2)"}}>🚛</div>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"1.9rem",fontWeight:700,color:"#f5a623",marginBottom:".3rem"}}>Ashrafi Transport</div>
        <p style={{color:"rgba(255,255,255,.45)",fontSize:".82rem",marginBottom:"2rem"}}>Fleet Management System</p>

        {err && <div style={{background:"rgba(229,62,62,.15)",border:"1px solid rgba(229,62,62,.4)",borderRadius:10,padding:".65rem .9rem",fontSize:".82rem",color:"#fc8181",marginBottom:"1rem",display:"flex",alignItems:"center",gap:".5rem"}}>❌ Username ya password galat hai</div>}

        {[{icon:"👤",val:u,set:setU,type:"text",ph:"Username"},{icon:"🔑",val:p,set:setP,type:"password",ph:"Password"}].map((f,i)=>(
          <div key={i} style={{position:"relative",marginBottom:"1rem"}}>
            <span style={{position:"absolute",left:".9rem",top:"50%",transform:"translateY(-50%)",fontSize:"1rem"}}>{f.icon}</span>
            <input value={f.val} onChange={e=>f.set(e.target.value)} type={f.type} placeholder={f.ph}
              onKeyDown={e=>e.key==="Enter"&&attempt()}
              style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1.5px solid rgba(255,255,255,.12)",borderRadius:10,padding:".75rem 1rem .75rem 2.6rem",fontSize:".95rem",fontFamily:"'Inter',sans-serif",color:"#fff",outline:"none"}}/>
          </div>
        ))}
        <button onClick={attempt} style={{width:"100%",padding:".85rem",borderRadius:10,fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"1rem",cursor:"pointer",border:"none",background:"linear-gradient(135deg,#f5a623,#d4891a)",color:"#fff",boxShadow:"0 6px 20px rgba(245,166,35,.4)"}}>🔐 Login Karein</button>
        <p style={{fontSize:".72rem",color:"rgba(255,255,255,.25)",marginTop:"1.5rem"}}>User: <b>admin</b> &nbsp;|&nbsp; Pass: <b>ashrafi2024</b></p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState("dashboard");
  const [data, setData] = useState(SEED.map(e=>({...e})));
  const [toasts, setToasts] = useState([]);
  const [editId, setEditId] = useState(0);
  const [atab, setAtab] = useState("overview");
  const [delId, setDelId] = useState(null);

  // filters
  const [fTruck, setFTruck] = useState("");
  const [fMonth, setFMonth] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [anMonth, setAnMonth] = useState("");

  // form fields
  const [fTruckV,  setFTruckV]  = useState("");
  const [fFromV,   setFFromV]   = useState("");
  const [fToV,     setFToV]     = useState("");
  const [fGoodsV,  setFGoodsV]  = useState("");
  const [fAmtV,    setFAmtV]    = useState("");
  const [fDateV,   setFDateV]   = useState(today());
  const [fDriverV, setFDriverV] = useState("");
  const [fNoteV,   setFNoteV]   = useState("");
  const [fErrs,    setFErrs]    = useState({});

  const showToast = useCallback((msg, type) => {
    const id = Date.now();
    setToasts(prev=>[...prev,{id,msg,type}]);
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)),3200);
  },[]);

  const goto = (v, eid=0) => {
    setView(v);
    if(v==="add"){
      setEditId(eid);
      setFErrs({});
      if(eid){
        const e=data.find(x=>x.id===eid);
        if(e){ setFTruckV(e.truck);setFFromV(e.from);setFToV(e.to);setFGoodsV(e.goods);setFAmtV(String(e.amount));setFDateV(e.date);setFDriverV(e.driver);setFNoteV(e.note); }
      } else { setFTruckV("");setFFromV("");setFToV("");setFGoodsV("");setFAmtV("");setFDateV(today());setFDriverV("");setFNoteV(""); }
    }
    if(v==="search") setSearchQ("");
    window.scrollTo && window.scrollTo(0,0);
  };

  const saveEntry = () => {
    const errs={};
    if(!fTruckV.trim())  errs.truck=true;
    if(!fFromV.trim())   errs.from=true;
    if(!fToV.trim())     errs.to=true;
    if(!fGoodsV.trim())  errs.goods=true;
    if(!fAmtV)           errs.amt=true;
    if(!fDateV)          errs.date=true;
    setFErrs(errs);
    if(Object.keys(errs).length){ showToast("⚠️ Sabhi required (*) fields bharein!","err"); return; }
    const entry={ truck:fTruckV.toUpperCase().trim(),from:fFromV.trim(),to:fToV.trim(),goods:fGoodsV.trim(),amount:parseFloat(fAmtV)||0,date:fDateV,driver:fDriverV.trim(),note:fNoteV.trim() };
    if(editId){
      setData(prev=>prev.map(e=>e.id===editId?{...entry,id:editId}:e));
      showToast("✏️ Entry update ho gayi!","upd");
    } else {
      const nid=data.length?Math.max(...data.map(e=>e.id))+1:1;
      setData(prev=>[...prev,{...entry,id:nid}]);
      showToast("✅ Entry add ho gayi!","ok");
    }
    goto("entries");
  };

  const deleteEntry = (id) => {
    setData(prev=>prev.filter(e=>e.id!==id));
    setDelId(null);
    showToast("🗑 Entry delete ho gayi!","del");
  };

  const allMonths = [...new Set(data.map(e=>e.date.substring(0,7)))].sort().reverse();
  const sorted = data.slice().sort((a,b)=>b.date.localeCompare(a.date)||(b.id-a.id));

  // Filtered entries
  const filt = sorted.filter(e=>
    (!fTruck||e.truck.includes(fTruck.toUpperCase())) &&
    (!fMonth||e.date.startsWith(fMonth))
  );

  // Search results
  const srch = searchQ ? sorted.filter(e=>
    e.truck.toLowerCase().includes(searchQ.toLowerCase())||
    e.from.toLowerCase().includes(searchQ.toLowerCase())||
    e.to.toLowerCase().includes(searchQ.toLowerCase())||
    e.goods.toLowerCase().includes(searchQ.toLowerCase())
  ) : [];

  // Analysis data
  const ada = anMonth ? sorted.filter(e=>e.date.startsWith(anMonth)) : sorted;
  const arev = ada.reduce((s,e)=>s+e.amount,0);
  const amon={}, atsum={}, adsum={}, agsum={}, arout={};
  ada.forEach(e=>{
    const ym=e.date.substring(0,7); amon[ym]=amon[ym]||{t:0,r:0}; amon[ym].t++; amon[ym].r+=e.amount;
    atsum[e.truck]=atsum[e.truck]||{t:0,r:0,last:""}; atsum[e.truck].t++; atsum[e.truck].r+=e.amount; if(e.date>atsum[e.truck].last)atsum[e.truck].last=e.date;
    const d=e.driver||"Unknown"; adsum[d]=adsum[d]||{t:0,r:0,last:"",trucks:{}}; adsum[d].t++; adsum[d].r+=e.amount; if(e.date>adsum[d].last)adsum[d].last=e.date; adsum[d].trucks[e.truck]=1;
    agsum[e.goods]=agsum[e.goods]||{t:0,r:0}; agsum[e.goods].t++; agsum[e.goods].r+=e.amount;
    const rt=`${e.from} → ${e.to}`; arout[rt]=arout[rt]||{t:0,r:0}; arout[rt].t++; arout[rt].r+=e.amount;
  });
  const atsumK=Object.keys(atsum).sort((a,b)=>atsum[b].r-atsum[a].r);
  const adsumK=Object.keys(adsum).sort((a,b)=>adsum[b].r-adsum[a].r);
  const agsumK=Object.keys(agsum).sort((a,b)=>agsum[b].r-agsum[a].r);
  const aroutK=Object.keys(arout).sort((a,b)=>arout[b].t-arout[a].t);
  const amonK=Object.keys(amon).sort();
  const maxAR=Math.max(...amonK.map(k=>amon[k].r),1);
  const maxGR=Math.max(...agsumK.map(k=>agsum[k].r),1);
  const maxRt=Math.max(...aroutK.map(k=>arout[k].t),1);

  const thisM=thisMonth();
  const tym=data.filter(e=>e.date.startsWith(thisM));
  const trks=[...new Set(data.map(e=>e.truck))];

  const navBtns=[
    {v:"dashboard",ic:"📊",label:"Dashboard"},
    {v:"entries",  ic:"📋",label:"Entries"},
    {v:"search",   ic:"🔍",label:"Search"},
    {v:"add",      ic:"➕",label:"Add"},
    {v:"analysis", ic:"📈",label:"Analysis"},
  ];

  const inpStyle=(err)=>({border:`1.5px solid ${err?"#e53e3e":"#dde3ee"}`,borderRadius:9,padding:".65rem .9rem",fontFamily:"'Inter',sans-serif",fontSize:".95rem",color:"#1f2937",background:"#fff",outline:"none",width:"100%"});
  const lgStyle=(v)=>({display:"flex",flexDirection:"column",gap:".35rem"});
  const lblStyle={fontSize:".72rem",fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:".07em"};

  if(!loggedIn) return <LoginScreen onLogin={()=>setLoggedIn(true)}/>;

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#f0f4f8",minHeight:"100vh",color:"#1f2937"}}>
      <Toast toasts={toasts}/>

      {/* TOPBAR */}
      <div style={S.topbar}>
        <div style={{display:"flex",alignItems:"center",gap:".65rem"}}>
          <span style={{fontSize:"1.65rem"}}>🚛</span>
          <div><div style={S.bname}>Ashrafi Transport</div><div style={S.bsub}>Fleet Management</div></div>
        </div>
        <nav style={{display:"flex",gap:".12rem"}}>
          {navBtns.map(n=>(
            <button key={n.v} onClick={()=>goto(n.v)} style={{color:view===n.v?"#f5a623":"rgba(255,255,255,.65)",fontSize:".78rem",fontWeight:view===n.v?600:500,padding:".42rem .72rem",borderRadius:7,background:view===n.v?"rgba(245,166,35,.16)":"transparent",border:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap"}}>{n.ic} {n.label}</button>
          ))}
        </nav>
        <button onClick={()=>setLoggedIn(false)} style={{display:"flex",alignItems:"center",gap:".4rem",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.15)",borderRadius:20,padding:".28rem .75rem",fontSize:".74rem",color:"rgba(255,255,255,.8)",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#68d391",display:"inline-block"}}/>Admin · Logout
        </button>
      </div>

      <div style={S.pw}>

        {/* ══ DASHBOARD ══ */}
        {view==="dashboard" && <>
          <div style={S.hero}>
            <div><h1 style={S.heroH1}>Ashrafi Transport 🚛</h1><p style={{fontSize:".82rem",color:"rgba(255,255,255,.6)",marginTop:".2rem"}}>Fleet manage karein, shipments track karein, performance monitor karein.</p></div>
            <span style={{fontSize:"3.2rem",opacity:.16}}>🏠</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(128px,1fr))",gap:".9rem",marginBottom:"1.3rem"}}>
            <StatCard val={data.length}         label="Total Entries"/>
            <StatCard val={trks.length}          label="Active Trucks"  accent="am"/>
            <StatCard val={tym.length}           label="Is Mahine"      accent="gn"/>
            <StatCard val={fmtAmt(data.reduce((s,e)=>s+e.amount,0))} label="Total Revenue"/>
          </div>
          <div style={{display:"flex",gap:".6rem",flexWrap:"wrap",marginBottom:"1.3rem"}}>
            <Btn onClick={()=>goto("add")} color="am" style={{fontSize:".95rem",padding:".7rem 1.6rem"}}>➕ Naya Entry Add Karein</Btn>
            <Btn onClick={()=>showToast("CSV export ke liye app ko download karein!","upd")} color="outline">⬇️ CSV Export</Btn>
          </div>
          <div style={S.card}>
            <div style={S.ct}>📋 Recent Entries</div>
            <Table cols={["Truck","Route","Goods","Amount","Date"]}
              rows={sorted.slice(0,8).map(e=>[
                <strong>{e.truck}</strong>,
                `${e.from} → ${e.to}`,e.goods,
                <strong>{fmtAmt(e.amount)}</strong>,
                fmtDate(e.date)
              ])}
              empty="Koi entry nahi. Pehli entry add karein!"/>
            <div style={{textAlign:"right",marginTop:".75rem",paddingTop:".75rem",borderTop:"1px solid #dde3ee"}}>
              <Btn onClick={()=>goto("entries")} color="outline" sm>Saari entries →</Btn>
            </div>
          </div>
        </>}

        {/* ══ ENTRIES ══ */}
        {view==="entries" && <>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:".75rem",marginBottom:"1.1rem"}}>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"1.45rem",color:"#1a1a2e"}}>📋 All Entries</div>
            <div style={{display:"flex",gap:".5rem",flexWrap:"wrap"}}>
              <Btn onClick={()=>goto("add")} color="am">➕ Add New</Btn>
            </div>
          </div>
          <div style={{display:"flex",gap:".6rem",alignItems:"center",flexWrap:"wrap",marginBottom:"1.1rem"}}>
            <input value={fTruck} onChange={e=>setFTruck(e.target.value)} placeholder="Truck number se filter…"
              style={{flex:1,minWidth:160,border:"1.5px solid #dde3ee",borderRadius:9,padding:".6rem .9rem",fontSize:".88rem",fontFamily:"'Inter',sans-serif",outline:"none",background:"#fff"}}/>
            <select value={fMonth} onChange={e=>setFMonth(e.target.value)}
              style={{minWidth:150,border:"1.5px solid #dde3ee",borderRadius:9,padding:".6rem .9rem",fontSize:".88rem",fontFamily:"'Inter',sans-serif",outline:"none",background:"#fff"}}>
              <option value="">Saare Mahine</option>
              {allMonths.map(ym=><option key={ym} value={ym}>{fmtYM(ym)}</option>)}
            </select>
            <Btn onClick={()=>{setFTruck("");setFMonth("");}} color="outline" sm>✕ Clear</Btn>
          </div>
          <div style={{...S.card,padding:0,overflow:"hidden"}}>
            <Table
              cols={["#","Truck","From","To","Goods","Amount","Date","Driver","Note","Actions"]}
              rows={filt.map((e,i)=>[
                i+1,<strong>{e.truck}</strong>,e.from,e.to,e.goods,
                <strong>{fmtAmt(e.amount)}</strong>,fmtDate(e.date),
                e.driver||"—",
                <span style={{maxWidth:110,fontSize:".78rem",color:"#6b7280",display:"block"}}>{e.note||"—"}</span>,
                <div style={{display:"flex",gap:".3rem"}}>
                  <Btn onClick={()=>goto("add",e.id)} color="am" sm>✏️ Edit</Btn>
                  <Btn onClick={()=>setDelId(e.id)} color="red" sm>🗑</Btn>
                </div>
              ])}
              empty="Koi entry nahi mili."/>
            {filt.length>0 && <div style={{padding:".6rem 1rem",fontSize:".78rem",color:"#6b7280",borderTop:"1px solid #dde3ee"}}>{filt.length} entries</div>}
          </div>
        </>}

        {/* ══ SEARCH ══ */}
        {view==="search" && <>
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"1.45rem",color:"#1a1a2e",marginBottom:"1.1rem"}}>🔍 Truck Search</div>
          <div style={S.card}>
            <div style={{display:"flex",gap:".6rem",flexWrap:"wrap",alignItems:"center"}}>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                placeholder="Truck number, city ya goods daalo…"
                style={{flex:1,minWidth:200,border:"1.5px solid #dde3ee",borderRadius:9,padding:".6rem .9rem",fontSize:".88rem",fontFamily:"'Inter',sans-serif",outline:"none",background:"#fff"}}/>
              <Btn color="road">🔍 Search</Btn>
            </div>
          </div>
          {searchQ && <>
            {!srch.length
              ? <div style={S.card}><div style={{textAlign:"center",padding:"2rem",color:"#6b7280"}}><div style={{fontSize:"2.5rem"}}>🔍</div><p>"{searchQ}" ke liye koi entry nahi mili.</p></div></div>
              : <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(128px,1fr))",gap:".9rem",marginBottom:"1.3rem"}}>
                  <StatCard val={srch.length} label="Total Trips"/>
                  <StatCard val={fmtAmt(srch.reduce((s,e)=>s+e.amount,0))} label="Total Revenue" accent="am"/>
                  <StatCard val={fmtAmt(srch.reduce((s,e)=>s+e.amount,0)/srch.length)} label="Avg/Trip" accent="gn"/>
                </div>
                <div style={{...S.card,padding:0,overflow:"hidden"}}>
                  <Table cols={["#","Date","From","To","Goods","Amount","Driver","Note"]}
                    rows={srch.map((e,i)=>[i+1,fmtDate(e.date),e.from,e.to,e.goods,fmtAmt(e.amount),e.driver||"—",e.note||"—"])}/>
                </div>
              </>
            }
          </>}
        </>}

        {/* ══ ADD / EDIT ══ */}
        {view==="add" && <>
          <div style={{...S.hero,background:"linear-gradient(135deg,#064e3b,#065f46)"}}>
            <div>
              <h1 style={{...S.heroH1,color:"#6ee7b7"}}>{editId?"✏️ Entry Edit Karein":"➕ Naya Entry Add Karein"}</h1>
              <p style={{fontSize:".82rem",color:"rgba(255,255,255,.6)",marginTop:".2rem"}}>{editId?"Entry ka detail update karein.":"Naye transport entry ki details bharein."}</p>
            </div>
            <span style={{fontSize:"3.2rem",opacity:.16}}>📝</span>
          </div>
          <div style={S.card}>
            <div style={S.ct}>🚛 Entry Details</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:".9rem"}}>
              {[
                {lbl:"Truck Number *",val:fTruckV,set:v=>setFTruckV(v.toUpperCase()),err:fErrs.truck,ph:"e.g. UP32AB1234"},
                {lbl:"From (Origin) *",val:fFromV,set:setFFromV,err:fErrs.from,ph:"e.g. Delhi"},
                {lbl:"To (Destination) *",val:fToV,set:setFToV,err:fErrs.to,ph:"e.g. Lucknow"},
                {lbl:"Goods / Cargo *",val:fGoodsV,set:setFGoodsV,err:fErrs.goods,ph:"e.g. Wheat"},
                {lbl:"Amount (₹) *",val:fAmtV,set:setFAmtV,err:fErrs.amt,ph:"e.g. 45000",type:"number"},
                {lbl:"Date *",val:fDateV,set:setFDateV,err:fErrs.date,ph:"",type:"date"},
                {lbl:"Driver Name",val:fDriverV,set:setFDriverV,err:false,ph:"Driver ka naam"},
              ].map((f,i)=>(
                <div key={i} style={lgStyle(f.v)}>
                  <label style={lblStyle}>{f.lbl}</label>
                  <input value={f.val} onChange={e=>f.set(e.target.value)} type={f.type||"text"} placeholder={f.ph} style={inpStyle(f.err)}/>
                </div>
              ))}
              <div style={{gridColumn:"1/-1",...lgStyle()}}>
                <label style={lblStyle}>Note / Remark</label>
                <textarea value={fNoteV} onChange={e=>setFNoteV(e.target.value)} placeholder="Koi khaas baat…" style={{...inpStyle(false),minHeight:65,resize:"vertical"}}/>
              </div>
            </div>
            <hr style={{border:"none",borderTop:"1px solid #dde3ee",margin:"1.1rem 0"}}/>
            <div style={{display:"flex",gap:".65rem",flexWrap:"wrap",alignItems:"center"}}>
              <Btn onClick={saveEntry} color="am" style={{fontSize:".95rem",padding:".7rem 1.6rem"}}>💾 {editId?"Update Entry":"Save Entry"}</Btn>
              <Btn onClick={()=>goto("entries")} color="outline">← Wapas</Btn>
            </div>
          </div>
        </>}

        {/* ══ ANALYSIS ══ */}
        {view==="analysis" && <>
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"1.45rem",color:"#1a1a2e",marginBottom:"1.1rem"}}>📈 Analysis</div>

          <div style={{...S.card,padding:".9rem 1.1rem",marginBottom:"1rem"}}>
            <div style={{display:"flex",gap:".6rem",flexWrap:"wrap",alignItems:"center"}}>
              <select value={anMonth} onChange={e=>setAnMonth(e.target.value)}
                style={{minWidth:150,border:"1.5px solid #dde3ee",borderRadius:9,padding:".6rem .9rem",fontSize:".88rem",fontFamily:"'Inter',sans-serif",outline:"none",background:"#fff"}}>
                <option value="">Saare Mahine</option>
                {allMonths.map(ym=><option key={ym} value={ym}>{fmtYM(ym)}</option>)}
              </select>
              <Btn onClick={()=>setAnMonth("")} color="outline" sm>✕ Clear</Btn>
            </div>
          </div>

          <div style={{display:"flex",gap:".4rem",flexWrap:"wrap",marginBottom:"1.1rem"}}>
            {[["overview","📊 Overview"],["trucks","🚛 Trucks"],["drivers","🧑 Drivers"],["goods","📦 Goods"],["routes","🛣️ Routes"]].map(([k,l])=>(
              <button key={k} onClick={()=>setAtab(k)} style={{padding:".48rem 1rem",borderRadius:8,fontSize:".78rem",fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap",border:atab===k?"none":"1.5px solid #dde3ee",background:atab===k?"linear-gradient(135deg,#0f3460,#1a1a2e)":"#fff",color:atab===k?"#fff":"#0f3460"}}>{l}</button>
            ))}
          </div>

          {atab==="overview" && <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:".9rem",marginBottom:"1.3rem"}}>
              <StatCard val={ada.length} label="Total Trips"/>
              <StatCard val={fmtAmt(arev)} label="Total Revenue" accent="am"/>
              <StatCard val={ada.length?fmtAmt(arev/ada.length):"₹0"} label="Avg/Trip" accent="gn"/>
              <StatCard val={atsumK.length} label="Trucks"/>
              <StatCard val={adsumK.length} label="Drivers"/>
            </div>
            <div style={S.card}>
              <div style={S.ct}>📊 Monthly Revenue Trend</div>
              {!amonK.length
                ? <div style={{textAlign:"center",padding:"2rem",color:"#6b7280"}}>📊 Data nahi hai.</div>
                : <div style={{display:"flex",alignItems:"flex-end",height:155,gap:".35rem",borderLeft:"2px solid #dde3ee",borderBottom:"2px solid #dde3ee",padding:".4rem .4rem 0",overflowX:"auto",marginTop:".75rem"}}>
                    {amonK.map(ym=>{
                      const h=Math.max(5,Math.round(amon[ym].r/maxAR*130));
                      return <div key={ym} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:".22rem",flex:1,minWidth:44}}>
                        <div style={{fontSize:".57rem",fontWeight:700,color:"#1a1a2e",whiteSpace:"nowrap"}}>{fmtAmt(amon[ym].r/1000)}K</div>
                        <div style={{width:"100%",height:h,borderRadius:"4px 4px 0 0",background:"linear-gradient(180deg,#f5a623,#d4891a)"}}/>
                        <div style={{fontSize:".57rem",color:"#6b7280",whiteSpace:"nowrap"}}>{fmtYM(ym)}</div>
                      </div>;
                    })}
                  </div>
              }
            </div>
            <div style={S.card}>
              <div style={S.ct}>🏆 Top Performers</div>
              {!atsumK.length
                ? <div style={{textAlign:"center",padding:"2rem",color:"#6b7280"}}>Data nahi hai.</div>
                : [
                    ["🚛 Best Truck",atsumK[0],atsum[atsumK[0]]?.r],
                    ["🧑 Best Driver",adsumK[0],adsum[adsumK[0]]?.r],
                    ["📦 Top Goods",agsumK[0],agsum[agsumK[0]]?.r],
                    ["🛣️ Top Route",aroutK[0],null],
                  ].map(([lbl,nm,rv],i)=>(
                    <div key={i} style={{background:"#f0f4f8",borderRadius:10,padding:".7rem 1rem",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".5rem",border:"1px solid #dde3ee"}}>
                      <span style={{fontSize:".82rem",fontWeight:600}}>{lbl}</span>
                      <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"1.05rem",fontWeight:700,color:"#0f3460"}}>{nm||"—"}{rv?` · ${fmtAmt(rv)}`:""}</span>
                    </div>
                  ))
              }
            </div>
          </>}

          {atab==="trucks" && <div style={S.card}>
            <div style={S.ct}>🚛 Trucks Summary ({atsumK.length})</div>
            <Table cols={["Truck","Trips","Revenue","Avg/Trip","Share","Last Trip"]}
              rows={atsumK.map(tn=>{const td=atsum[tn];return[<strong>{tn}</strong>,td.t,fmtAmt(td.r),fmtAmt(td.r/td.t),(arev?Math.round(td.r/arev*100):0)+"%",fmtDate(td.last)];})}>
            </Table>
          </div>}

          {atab==="drivers" && <div style={S.card}>
            <div style={S.ct}>🧑 Driver Performance ({adsumK.length})</div>
            <Table cols={["Driver","Trips","Revenue","Avg/Trip","Trucks","Last Trip"]}
              rows={adsumK.map(dn=>{const dd=adsum[dn];return[<strong>{dn}</strong>,dd.t,fmtAmt(dd.r),fmtAmt(dd.r/dd.t),Object.keys(dd.trucks).length,fmtDate(dd.last)];})}>
            </Table>
          </div>}

          {atab==="goods" && <div style={S.card}>
            <div style={S.ct}>📦 Goods Breakdown ({agsumK.length})</div>
            {agsumK.map(gn=><div key={gn} style={{marginBottom:".85rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:".83rem",marginBottom:".28rem"}}>
                <span style={{fontWeight:600}}>📦 {gn}</span>
                <span style={{color:"#6b7280"}}>{agsum[gn].t} trips · {fmtAmt(agsum[gn].r)}</span>
              </div>
              <ProgressBar pct={Math.round(agsum[gn].r/maxGR*100)}/>
            </div>)}
          </div>}

          {atab==="routes" && <div style={S.card}>
            <div style={S.ct}>🛣️ Routes ({aroutK.length})</div>
            {aroutK.map(rt=><div key={rt} style={{marginBottom:".85rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:".83rem",marginBottom:".28rem"}}>
                <span style={{fontWeight:600}}>🛣️ {rt}</span>
                <span style={{color:"#6b7280"}}>{arout[rt].t} trips · {fmtAmt(arout[rt].r)}</span>
              </div>
              <ProgressBar pct={Math.round(arout[rt].t/maxRt*100)}/>
            </div>)}
          </div>}
        </>}

      </div>{/* .pw */}

      {/* DELETE MODAL */}
      {delId && (
        <div onClick={()=>setDelId(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:"1.5rem",maxWidth:460,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
            <h3 style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"1.3rem",color:"#1a1a2e",marginBottom:".5rem"}}>🗑 Entry Delete Karein?</h3>
            <p style={{fontSize:".88rem",color:"#6b7280",marginBottom:"1.2rem"}}>Yeh entry permanently delete ho jaayegi. Wapas nahi aayegi!</p>
            <div style={{display:"flex",gap:".5rem",justifyContent:"flex-end"}}>
              <Btn onClick={()=>setDelId(null)} color="outline">Cancel</Btn>
              <Btn onClick={()=>deleteEntry(delId)} color="red">Delete Karein</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
