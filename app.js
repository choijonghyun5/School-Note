const KEY='0e7e8e819f064a4db26b423a6b3b29e8';
const $=s=>document.querySelector(s);
const st={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let S=st.get('cfg',{grade:1,cls:6});
const E=['SUN','MON','TUE','WED','THU','FRI','SAT'],K=['일','월','화','수','목','금','토'];
const PT=['09:10','10:10','11:10','12:10','13:50','14:50','16:00','16:50'];
const p2=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate());
const md=d=>p2(d.getMonth()+1)+'.'+p2(d.getDate());
const mon=d=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x};
const add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const endT=t=>{let[h,m]=t.split(':').map(Number);m+=50;return p2(h+(m>=60?1:0))+':'+p2(m%60)};
const mins=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const EP={'초등학교':'elsTimetable','중학교':'misTimetable','고등학교':'hisTimetable'};
const OFF=/휴업|개교|재량|방학|공휴|휴일|대체/;
const pd=s=>new Date(s.slice(0,4),s.slice(4,6)-1,s.slice(6));
const dk=k=>k.slice(0,4)+'-'+k.slice(4,6)+'-'+k.slice(6);
// 전국 모의고사·수능 일정 [날짜, 이름, 대상 학년] (교육청·평가원 공고 기준, 고등학교 전용)
const EX=[
 ['20260324','3월 전국연합학력평가',[1,2,3]],
 ['20260507','5월 전국연합학력평가',[3]],
 ['20260604','6월 모의평가',[3]],['20260604','6월 전국연합학력평가',[1,2]],
 ['20260708','7월 전국연합학력평가',[3]],
 ['20260902','9월 모의평가',[3]],['20260902','9월 전국연합학력평가',[1,2]],
 ['20261020','10월 전국연합학력평가',[1,2,3]],
 ['20261119','2027학년도 수능',[1,2,3]],
 ['20271118','2028학년도 수능',[1,2,3]]];
const EXR=/고사|시험|모의|학력평가|수능/;
const isEx=x=>x.c==='모의고사'||x.c==='시험'||EXR.test(x.n);
let MY=st.get('myev',[]);
const CATS=['시험','수행평가','과제','기타'];
const exOf=k=>S.kind==='고등학교'?EX.filter(x=>x[0]===k&&x[2].includes(+S.grade)).map(x=>({n:x[1],off:false,c:'모의고사'})):[];
const myOf=k=>MY.filter(x=>x.d<=k&&k<=(x.e||x.d)).map(x=>({n:x.n,off:false,c:x.c,my:x.id}));
const evAt=(w,k)=>[...(w.ev[k]||[]),...exOf(k),...myOf(k)];
const nextEx=()=>{const t=ymd(new Date()),L=[];
 if(S.kind==='고등학교')EX.forEach(x=>{if(x[0]>=t&&x[2].includes(+S.grade))L.push([x[0],x[1]])});
 MY.forEach(x=>{if((x.e||x.d)>=t&&x.c==='시험')L.push([x.d>t?x.d:t,x.n])});
 L.sort();const f=L[0];if(!f)return '';
 const n=Math.round((pd(f[0])-pd(t))/864e5);
 return `<div class="note"><b>다음 시험</b>${esc(f[1])} <span class="num">${n?'D-'+n:'D-DAY'}</span></div>`};
function evSheet(id,def){
 const e=MY.find(x=>x.id===id)||{n:'',d:def||ymd(new Date()),e:'',c:'시험'};let c=e.c,del=0;
 const o=document.createElement('div');o.className='ov';
 o.innerHTML=`<div class="sh" role="dialog" aria-label="일정"><div class="lb">${id?'일정 수정':'일정 추가'}</div>
 <div class="f"><input id="a1" value="${esc(e.n)}" placeholder="제목 (예: 수학 중간고사)" maxlength="30" aria-label="제목"></div>
 <div class="f" style="margin-top:8px"><input type="date" id="a2" value="${dk(e.d)}" aria-label="시작일"><span class="sub" style="align-self:center">—</span><input type="date" id="a3" value="${e.e&&e.e!==e.d?dk(e.e):''}" aria-label="종료일"></div>
 <div class="sub" style="font-size:12px;color:var(--tx3)">종료일은 여러 날 이어질 때만 입력하세요</div>
 <div class="chips">${CATS.map(x=>`<button data-c="${x}" class="${x===c?'on':''}">${x}</button>`).join('')}</div>
 <div class="f2">${id?'<button class="gh" data-x="d">삭제</button>':''}<button class="gh" data-x="c">취소</button><button class="bt" data-x="s">저장</button></div></div>`;
 document.body.appendChild(o);const cl=()=>o.remove();o.querySelector('#a1').focus();
 o.onclick=ev=>{const t=ev.target,x=t.dataset.x;
  if(t.dataset.c){c=t.dataset.c;o.querySelectorAll('.chips button').forEach(b=>b.classList.toggle('on',b.dataset.c===c));return}
  if(t===o||x==='c')return cl();
  if(x==='d'){if(!del){del=1;t.textContent='정말 삭제할까요?';return}MY=MY.filter(v=>v.id!==id);st.set('myev',MY);cl();return render(true)}
  if(x==='s'){const n=o.querySelector('#a1').value.trim(),a=o.querySelector('#a2').value.replace(/-/g,''),b=o.querySelector('#a3').value.replace(/-/g,'');
   if(!n){o.querySelector('#a1').focus();return}if(!a){o.querySelector('#a2').focus();return}
   let s1=a,e1=b&&b>a?b:'';
   const r={id:id||'u'+Date.now(),n,d:s1,e:e1,c};
   MY=id?MY.map(v=>v.id===id?r:v):[...MY,r];st.set('myev',MY);
   selDay=pd(s1);cl();render(true)}};
 o.onkeydown=ev=>{if(ev.key==='Enter'&&ev.target.tagName==='INPUT')o.querySelector('[data-x=s]').click();if(ev.key==='Escape')cl()};
}
let view='home',selDay=new Date(),wkStart=mon(new Date()),cache={};
let AL=st.get('alias',{}),TM=st.get('times',{}),CL=st.get('subcls',{});
const nm=s=>AL[s]||s;
const cn=s=>CL[s]||'';
const tm=p=>TM[p]||(PT[p-1]?[PT[p-1],endT(PT[p-1])]:['','']);
function sheet(t,sub,body,save,reset){
 const o=document.createElement('div');o.className='ov';
 o.innerHTML=`<div class="sh" role="dialog" aria-label="${t}"><div class="lb">${t}</div><div class="sub" style="margin-top:8px">${sub}</div>${body}<div class="f2"><button class="gh" data-x="r">원래대로</button><button class="gh" data-x="c">취소</button><button class="bt" data-x="s">저장</button></div></div>`;
 document.body.appendChild(o);
 const cl=()=>o.remove(),i=o.querySelector('input');if(i){i.focus();i.select&&i.select()}
 o.onclick=e=>{const x=e.target.dataset.x;if(e.target===o||x==='c')cl();else if(x==='s'){save(o);cl();render(true)}else if(x==='r'){reset();cl();render(true)}};
 o.onkeydown=e=>{if(e.key==='Enter')o.querySelector('[data-x=s]').click();if(e.key==='Escape')cl()};
}
function editName(raw){
 sheet('과목 설정',`원래 이름 · ${esc(raw)}<br>이름과 반은 같은 과목의 다른 날에도 같이 적용돼요`,
  `<div class="f"><input id="e1" value="${esc(nm(raw))}" placeholder="과목 이름" aria-label="과목 이름"></div><div class="f lbl"><input id="e2" value="${esc(cn(raw))}" placeholder="반 (예: 3반, A반, 201호)" maxlength="12" aria-label="반"></div>`,
  o=>{const v=o.querySelector('#e1').value.trim(),c=o.querySelector('#e2').value.trim();
   if(!v||v===raw)delete AL[raw];else AL[raw]=v;st.set('alias',AL);
   if(c)CL[raw]=c;else delete CL[raw];st.set('subcls',CL)},
  ()=>{delete AL[raw];st.set('alias',AL);delete CL[raw];st.set('subcls',CL)});
}
function editTime(p){
 const[a,b]=tm(p);
 sheet(p+'교시 시간','모든 요일의 '+p+'교시에 적용돼요',`<div class="f"><input type="time" id="e1" value="${a}" aria-label="시작"><span class="sub" style="align-self:center">—</span><input type="time" id="e2" value="${b}" aria-label="종료"></div>`,
  o=>{const x=o.querySelector('#e1').value,y=o.querySelector('#e2').value;if(x&&y&&mins(y)>mins(x)){TM[p]=[x,y];st.set('times',TM)}},
  ()=>{delete TM[p];st.set('times',TM)});
}

async function api(n,p){
 const r=await fetch('https://open.neis.go.kr/hub/'+n+'?'+new URLSearchParams({KEY,Type:'json',pSize:1000,...p}));
 const j=await r.json();return j[n]?j[n][1].row:[];
}
const ok=()=>S.code&&S.edu;
async function week(ws){
 const k=ymd(ws)+S.code+S.grade+S.cls;if(cache[k])return cache[k];
 const b={ATPT_OFCDC_SC_CODE:S.edu,SD_SCHUL_CODE:S.code},a=ymd(ws),z=ymd(add(ws,6));
 const [t,e,m]=await Promise.all([
  api(EP[S.kind]||'misTimetable',{...b,GRADE:S.grade,CLASS_NM:S.cls,TI_FROM_YMD:a,TI_TO_YMD:z}).catch(()=>[]),
  api('SchoolSchedule',{...b,AA_FROM_YMD:a,AA_TO_YMD:z}).catch(()=>[]),
  api('mealServiceDietInfo',{...b,MMEAL_SC_CODE:2,MLSV_FROM_YMD:a,MLSV_TO_YMD:z}).catch(()=>[])]);
 const w={tt:{},ev:{},meal:{},ch:{},max:0};
 t.forEach(r=>{const p=+r.PERIO;(w.tt[r.ALL_TI_YMD]??={})[p]=String(r.ITRT_CNTNT).replace(/^\*+/,'');w.max=Math.max(w.max,p)});
 e.forEach(r=>{(w.ev[r.AA_YMD]??=[]).push({n:r.EVENT_NM,off:(r.SBTR_DD_SC_NM&&r.SBTR_DD_SC_NM!=='해당없음')||OFF.test(r.EVENT_NM)})});
 m.forEach(r=>{w.meal[r.MLSV_YMD]={items:r.DDISH_NM.split(/<br\s*\/?>/i).map(x=>x.trim()).filter(Boolean),cal:r.CAL_INFO}});
 // 변경 감지: 처음 불러온 시간표를 기준으로 이후 달라진 교시를 표시
 const bk='base'+k,base=st.get(bk);
 if(base){Object.keys(w.tt).forEach(d=>Object.keys(w.tt[d]).forEach(p=>{const o=base[d]&&base[d][p];if(o&&o!==w.tt[d][p])(w.ch[d]??={})[p]=o}))}
 else if(t.length)st.set(bk,w.tt);
 return cache[k]=w;
}
const offOf=(w,d)=>{const k=ymd(d),ev=(w.ev[k]||[]).find(x=>x.off);return ev?ev.n:(d.getDay()%6===0&&!w.tt[k]?'주말':'')};
const gone=(x,y)=>x;

function meal(w,d,big){
 const m=w.meal[ymd(d)];
 if(!m)return `<div class="em"><b>급식 정보가 없어요</b>${offOf(w,d)||'이 날은 중식이 등록되지 않았어요.'}</div>`;
 const main=/밥|김치|국$|탕$|찌개|우유|김$|깍두기|샐러드|과일|주스/;let n=0;
 const rows=m.items.map(x=>{const a=x.match(/^(.*?)\s*\(([\d.]+)\)\s*$/),nm=a?a[1]:x,al=a?a[2]:'';
  const isMain=false;
  return `<div class="${isMain?'m1':'m2'}">${esc(nm)}${al?`<span class="al num">${al}</span>`:''}</div>`}).sort((a,b)=>b.includes('m1')-a.includes('m1'));
 return rows.join('')+`<div class="ft num">${esc(m.cal||'')}</div>`;
}

function nav(){
 const I={home:'<path d="M4 11l8-6.5L20 11v8.5a.5.5 0 0 1-.5.5H14v-6h-4v6H4.5a.5.5 0 0 1-.5-.5z"/>',tt:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 5V3.5M15 5V3.5M9 10v10"/>',meal:'<path d="M4 12h16c0 4.4-3.6 8-8 8s-8-3.6-8-8z"/><path d="M8 3.5l4 7.5M12.5 3l4 8"/>',cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8.5 3v4M15.5 3v4"/><path d="M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 17h.01M12 17h.01"/>',set:'<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2"/><circle cx="9" cy="16" r="2"/>'};
 const L={home:'홈',tt:'시간표',meal:'급식',cal:'학사일정',set:'설정'};
 $('#nav').innerHTML=Object.keys(I).map(k=>`<button class="${view===k?'on':''}" data-v="${k}" aria-label="${L[k]}"><svg viewBox="0 0 24 24">${I[k]}</svg>${L[k]}</button>`).join('');
 $('#nav').onclick=e=>{const b=e.target.closest('button');if(b){view=b.dataset.v;render()}};
}

function setup(){return `<div class="em"><b>학교를 먼저 선택해 주세요</b>설정에서 학교와 학년·반을 입력하면 시간표와 급식이 나타나요.</div>`}

async function home(){
 if(!ok())return setup();
 const n=new Date(),w=await week(mon(n)),k=ymd(n),t=w.tt[k]||{},off=offOf(w,n),ev=evAt(w,k).filter(x=>!x.off);
 const mm=w.meal[k],mi=mm?mm.items.map(x=>x.replace(/\s*\([\d.]+\)\s*$/,'')):[],ml=mi;
 const mw=`<div class="mw" data-go="meal"><div class="lb">급식</div>${ml.length?ml.map(x=>`<div>${esc(x)}</div>`).join(''):'<div>오늘은 급식이 없어요</div>'}</div>`;
 const now=n.getHours()*60+n.getMinutes(),ps=Object.keys(t).map(Number).sort((a,b)=>a-b);
 let cur=0,nx=0;ps.forEach(p=>{const[a,b]=tm(p),s=mins(a||'23:59'),e=b?mins(b):s+50;if(now>=s&&now<e)cur=p;else if(s>now&&!nx)nx=p});
 const f=cur||nx,lab=cur?'지금':nx?'다음':'오늘';
 let hero=off?`<div class="lb">${lab}</div><h1>${esc(off)}</h1><div class="sub">수업이 없는 날이에요</div>`
  :f?`<div class="lb">${lab}</div><h1>${esc(nm(t[f]))}</h1><div class="sub num">${f}교시 · ${tm(f)[0]} — ${tm(f)[1]}${cn(t[f])?' · '+esc(cn(t[f])):''}</div>`
  :`<div class="lb">오늘</div><h1>수업 끝</h1><div class="sub">오늘 일정이 모두 끝났어요</div>`;
 const cards=off?'':ps.map(p=>{const c=w.ch[k]&&w.ch[k][p],[a,b]=tm(p),e=b?mins(b):mins(a||'23:59')+50;
  return `<div class="r ${p===cur?'on':''} ${e<=now?'past':''}"><i class="num">${p2(p)}</i><div class="nm" data-s="${esc(t[p])}"><b>${esc(nm(t[p]))}${c?'<span class="tag">변경</span>':''}${cn(t[p])?`<span class="tag">${esc(cn(t[p]))}</span>`:''}</b>${c?`<small>원래 ${esc(nm(c))}</small>`:''}</div><div class="tm num" data-t="${p}">${a?a+' — '+b:'시간 설정'}</div></div>`}).join('');
 $('#side').innerHTML=`<div class="ai"><div class="lb">오늘의 급식</div><div style="margin-top:14px">${meal(w,n)}</div></div>`;
 return `<div class="top"><div class="tl"><div class="dt num">${K[n.getDay()]}요일 · ${md(n)}</div><div class="hero">${hero}</div></div>${mw}</div>${ev.length?`<div class="note"><b>학사일정</b>${ev.map(x=>esc(x.n)).join(', ')}</div>`:''}${nextEx()}<div class="rows">${cards}</div>${cards?'<div class="ft">과목 이름이나 시간을 눌러 수정할 수 있어요</div>':''}`;
}

async function tt(){
 if(!ok())return setup();
 const w=await week(wkStart),days=[0,1,2,3,4].map(i=>add(wkStart,i)),td=ymd(new Date());
 if([...Object.keys(w.tt)].some(d=>new Date(d.slice(0,4),d.slice(4,6)-1,d.slice(6)).getDay()===6))days.push(add(wkStart,5));
 const mx=Math.max(w.max,7);let anyCh=0;
 const head=days.map(d=>{const o=offOf(w,d);return `<th class="${ymd(d)===td?'today':''}">${K[d.getDay()]}<em class="num">${md(d)}</em></th>`}).join('');
 let rows='';
 for(let p=1;p<=mx;p++){rows+=`<tr><td class="p num" data-t="${p}">${p}<small>${tm(p)[0]}</small></td>`+days.map(d=>{
  const k=ymd(d),o=offOf(w,d),cl=ymd(d)===td?'today':'';
  if(o&&p===1)return `<td class="${cl} off" rowspan="${mx}">${esc(o)}</td>`;if(o)return '';
  const s=(w.tt[k]||{})[p],c=w.ch[k]&&w.ch[k][p];if(c)anyCh=1;
  return `<td class="${cl} ${c?'ch':''}"${s?` data-s="${esc(s)}"`:''}>${s?esc(nm(s)):''}${s&&cn(s)?`<em class="cn">${esc(cn(s))}</em>`:''}${c?`<s>${esc(nm(c))}</s>`:''}</td>`}).join('')+'</tr>'}
 const e=add(wkStart,4);
 return `<div class="dt num">${wkStart.getFullYear()}</div><h2 class="hd">${S.grade}학년 ${S.cls}반</h2>
 <div class="wk"><button data-w="-1" aria-label="이전 주">‹</button><span class="num sub">${md(wkStart)} — ${md(e)}</span><button data-w="1" aria-label="다음 주">›</button></div>
 <div class="tw"><table><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></div>${anyCh?'<div class="legend">진하게 칠해진 칸은 시간표가 변경된 교시예요 (위: 현재, 아래: 원래)</div>':''}<div class="ft">과목이나 시간을 눌러 수정할 수 있어요</div>`;
}

async function month(d){
 const y=d.getFullYear(),mo=d.getMonth(),k='m'+y+'-'+mo+S.code;if(cache[k])return cache[k];
 const b={ATPT_OFCDC_SC_CODE:S.edu,SD_SCHUL_CODE:S.code},a=ymd(new Date(y,mo,1)),z=ymd(new Date(y,mo+1,0));
 const [e,m]=await Promise.all([
  api('SchoolSchedule',{...b,AA_FROM_YMD:a,AA_TO_YMD:z}).catch(()=>[]),
  api('mealServiceDietInfo',{...b,MMEAL_SC_CODE:2,MLSV_FROM_YMD:a,MLSV_TO_YMD:z}).catch(()=>[])]);
 const w={tt:{},ev:{},meal:{},ch:{},max:0};
 e.forEach(r=>{(w.ev[r.AA_YMD]??=[]).push({n:r.EVENT_NM,off:(r.SBTR_DD_SC_NM&&r.SBTR_DD_SC_NM!=='해당없음')||OFF.test(r.EVENT_NM)})});
 m.forEach(r=>{w.meal[r.MLSV_YMD]={items:r.DDISH_NM.split(/<br\s*\/?>/i).map(x=>x.trim()).filter(Boolean),cal:r.CAL_INFO}});
 if(e.length||m.length)cache[k]=w;
 return w;
}

async function mealv(){
 if(!ok())return setup();
 const y=selDay.getFullYear(),mo=selDay.getMonth(),w=await month(selDay),td=ymd(new Date()),sk=ymd(selDay);
 const first=new Date(y,mo,1).getDay(),last=new Date(y,mo+1,0).getDate();
 let cells='<i></i>'.repeat(first);
 for(let n=1;n<=last;n++){const d=new Date(y,mo,n),k=ymd(d);
  cells+=`<button class="${k===sk?'on':''} ${k===td?'td':''} ${d.getDay()%6===0?'we':''} ${w.meal[k]?'hm':''}" data-d="${k}" aria-label="${mo+1}월 ${n}일"><span class="num">${n}</span></button>`}
 return `<div class="lb">LUNCH MENU</div><h2 class="num" style="margin-top:10px">${md(selDay)} <span class="sub" style="font-size:18px;font-weight:400">${K[selDay.getDay()]}요일</span></h2>
 <div class="cal"><div class="wk"><button data-cm="-1" aria-label="이전 달">‹</button><span class="num sub">${y}년 ${mo+1}월</span><button data-cm="1" aria-label="다음 달">›</button></div><div class="cg">${K.map(x=>`<u>${x}</u>`).join('')}${cells}</div></div>
 <div class="meal">${meal(w,selDay)}</div>`;
}

async function calv(){
 if(!ok())return setup();
 const y=selDay.getFullYear(),mo=selDay.getMonth(),w=await month(selDay),td=ymd(new Date()),sk=ymd(selDay);
 const first=new Date(y,mo,1).getDay(),last=new Date(y,mo+1,0).getDate();
 const pd=s=>new Date(s.slice(0,4),s.slice(4,6)-1,s.slice(6));
 const A={};let cells='<i></i>'.repeat(first);
 for(let n=1;n<=last;n++){const d=new Date(y,mo,n),k=ymd(d),ev=A[k]=evAt(w,k);
  cells+=`<button class="${k===sk?'on':''} ${k===td?'td':''} ${d.getDay()%6===0?'we':''} ${ev.some(isEx)?'ex':''} ${ev.length?'hm':''} ${ev.some(x=>x.off)?'of':''}" data-d="${k}" aria-label="${mo+1}월 ${n}일"><span class="num">${n}</span></button>`}
 const rg=[];
 Object.keys(A).sort().forEach(k=>A[k].forEach(x=>{const r=rg.find(r=>r.n===x.n&&r.my===x.my&&ymd(add(pd(r.e),1))===k);if(r){r.e=k;r.off=r.off||x.off}else rg.push({n:x.n,s:k,e:k,off:x.off,c:x.c,my:x.my})}));
 rg.sort((a,b)=>a.s<b.s?-1:a.s>b.s?1:0);
 const tg=x=>(x.off?'<span class="tag">휴업</span>':'')+(x.c?`<span class="tag">${esc(x.c)}</span>`:'');
 const se=A[sk]||[];
 const sel=`<div class="sel"><div class="lb num">${md(selDay)} ${K[selDay.getDay()]}요일</div>${se.length?se.map(x=>`<div class="m2"${x.my?` data-my="${x.my}" style="cursor:pointer"`:''}>${esc(x.n)}${tg(x)}</div>`).join(''):'<div class="sub" style="margin-top:8px">등록된 학사일정이 없어요</div>'}</div>`;
 const list=rg.length?rg.map(r=>{const one=r.s===r.e;
  return `<button class="ev ${r.s<=sk&&sk<=r.e?'on':''}" data-d="${r.s}"${r.my?` data-my="${r.my}"`:''}><span class="ed num">${md(pd(r.s))}${one?'':' — '+md(pd(r.e))}${one?`<small>${K[pd(r.s).getDay()]}요일</small>`:''}</span><span class="en">${esc(r.n)}${tg(r)}</span></button>`}).join('')
  :'<div class="em"><b>이 달에는 등록된 학사일정이 없어요</b>다른 달을 확인해 보세요.</div>';
 return `<div class="lb">SCHEDULE</div><h2 style="margin-top:10px">학사일정</h2>
 <div class="cal"><div class="wk"><button data-cm="-1" aria-label="이전 달">‹</button><span class="num sub">${y}년 ${mo+1}월</span><button data-cm="1" aria-label="다음 달">›</button></div><div class="cg">${K.map(x=>`<u>${x}</u>`).join('')}${cells}</div></div>
 ${sel}
 <button class="add" data-add="${sk}">＋ 일정 추가</button>
 <div class="lb" style="margin:40px 0 8px">${mo+1}월 전체 일정</div><div>${list}</div>
 <div class="ft">데이터 출처: NEIS 교육행정정보시스템 · 모의고사 일정은 교육청·평가원 공고 기준이에요<br>내가 추가한 일정은 눌러서 수정·삭제할 수 있어요</div>`;
}

function settings(){
 return `<div class="lb">${ok()?'SETTINGS':'WELCOME'}</div><h2 style="margin-top:10px">${ok()?'설정':'학교를 선택해 주세요'}</h2>
 <div class="sel"><div class="sub">${ok()?esc(S.name)+' · '+S.grade+'학년 '+S.cls+'반':'학교 이름을 검색하고 학년·반을 저장하면 시간표와 급식이 나타나요.'}</div></div>
 <div class="f"><input id="q" placeholder="학교 이름" aria-label="학교 이름"><button class="bt" id="sr">검색</button></div><div class="li" id="rs"></div>
 <div class="f"><input class="s num" id="g" inputmode="numeric" value="${S.grade}" aria-label="학년"><span class="sub" style="align-self:center">학년</span><input class="s num" id="c" inputmode="numeric" value="${S.cls}" aria-label="반"><span class="sub" style="align-self:center">반</span><button class="bt" id="sv" style="margin-left:auto">저장</button></div>
 <div class="ft">수업 시간은 09:10 시작 기준 안내 시간이에요. 데이터 출처: NEIS 교육행정정보시스템</div>`;
}

async function render(keep){
 if(!ok())view='set';
 nav();const v=$('#v');v.classList.toggle('wide',view==='tt');
 if(!keep){v.style.animation='none';void v.offsetWidth;v.style.animation='';v.innerHTML='<div class="em">불러오는 중…</div>'}
 try{v.innerHTML=await({home,tt,meal:mealv,cal:calv,set:async()=>settings()}[view])()}
 catch(e){v.innerHTML='<div class="em"><b>데이터를 불러오지 못했어요</b>인터넷 연결을 확인하고 다시 시도해 주세요.</div>'}
 if(view!=='home')$('#side').innerHTML='';
 if(view==='set')bindSet();
 if(!keep)window.scrollTo(0,0);
}
$('#v').addEventListener('click',e=>{
 const my=e.target.closest('[data-my]');if(my)return evSheet(my.dataset.my);
 const ad=e.target.closest('[data-add]');if(ad)return evSheet(null,ad.dataset.add);
 const g=e.target.closest('[data-go]');if(g){view=g.dataset.go;selDay=new Date();return render()}
 const n=e.target.closest('[data-s]'),t=e.target.closest('[data-t]');
 if(n)return editName(n.dataset.s);if(t)return editTime(+t.dataset.t);
 const w=e.target.closest('[data-w]'),d=e.target.closest('[data-d]'),c=e.target.closest('[data-cm]');
 if(w){wkStart=add(wkStart,7*w.dataset.w);render()}
 if(c){const y=selDay.getFullYear(),m=selDay.getMonth()+ +c.dataset.cm,ld=new Date(y,m+1,0).getDate();selDay=new Date(y,m,Math.min(selDay.getDate(),ld));render(true)}
 if(d){const s=d.dataset.d;selDay=new Date(s.slice(0,4),s.slice(4,6)-1,s.slice(6));render(true)}
});
function bindSet(){
 const go=async()=>{const q=$('#q').value.trim();if(!q)return;$('#rs').innerHTML='<div class="em">검색 중…</div>';
  try{const r=await api('schoolInfo',{SCHUL_NM:q});
   $('#rs').innerHTML=r.length?r.map((s,i)=>`<button data-i="${i}">${esc(s.SCHUL_NM)}<small>${esc(s.SCHUL_KND_SC_NM)} · ${esc(s.ORG_RDNMA||'')}</small></button>`).join(''):'<div class="em">검색 결과가 없어요. 학교 이름을 다시 확인해 주세요.</div>';
   $('#rs').onclick=e=>{const b=e.target.closest('button');if(!b)return;const s=r[b.dataset.i];S={...S,edu:s.ATPT_OFCDC_SC_CODE,code:s.SD_SCHUL_CODE,name:s.SCHUL_NM,kind:s.SCHUL_KND_SC_NM};$('#rs').innerHTML=`<div class="em"><b>${esc(s.SCHUL_NM)}</b>선택했어요. 학년·반을 입력하고 저장하세요.</div>`}
  }catch(e){$('#rs').innerHTML='<div class="em">검색하지 못했어요. 연결을 확인해 주세요.</div>'}};
 if(!ok())$('#q').focus();
 $('#sr').onclick=go;$('#q').onkeydown=e=>e.key==='Enter'&&go();
 $('#sv').onclick=()=>{S.grade=+$('#g').value||1;S.cls=+$('#c').value||1;st.set('cfg',S);cache={};view='home';render()};
}
render();
