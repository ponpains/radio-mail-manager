// standalone-ready: UI/state are kept local and modular for later Android packaging.
const APP_VERSION="ver.23";
const KEY="radioMailManager.v3";
const MEMO_KEY="radioMailManager.memos.v1";
const THEME_KEY="radioMailManager.theme";
const PROGRAM_SETTINGS_KEY="radioMailManager.programSettings.v1";
const PROGRAM_ORDER_KEY="radioMailManager.programOrder.v1";
const SORT_MODES_KEY="radioMailManager.sortModes.v1";
const APP_SETTINGS_KEY="radioMailManager.displaySettings.v1";
const AUTOSAVE_KEY="radioMailManager.autosave.v1";
const OLD_KEYS=["radioMailManager.v2","radioMailManager.v1"];
let raw=localStorage.getItem(KEY);
if(!raw){for(const k of OLD_KEYS){if(localStorage.getItem(k)){raw=localStorage.getItem(k);break}}}
let mails=raw?JSON.parse(raw):[];
let selectedView="__memo__";
let editingId=null,currentDetailId=null,deferredPrompt=null;
let favoriteOnly=false;
let sortModes=JSON.parse(localStorage.getItem(SORT_MODES_KEY)||"{}");
let appSettings={fontSize:"medium",tabSize:"medium",rowSize:"medium",detailDensity:"compact",listTextSource:"body",showFields:{program:true,episode:true,airDate:true,name:true,corner:true,summary:true,url:true,memo:true},...JSON.parse(localStorage.getItem(APP_SETTINGS_KEY)||"{}")};
appSettings.showFields={program:true,episode:true,airDate:true,name:true,corner:true,summary:true,url:true,memo:true,...(appSettings.showFields||{})};
let memoItems=JSON.parse(localStorage.getItem(MEMO_KEY)||"[]");
let programSettings=JSON.parse(localStorage.getItem(PROGRAM_SETTINGS_KEY)||"{}");
let programOrder=JSON.parse(localStorage.getItem(PROGRAM_ORDER_KEY)||"[]");
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
function defaultSortForView(view){return view==="__sent__"?"postedDesc":"episodeAsc"}
function currentSortMode(){return sortModes[selectedView]||defaultSortForView(selectedView)}
function setCurrentSortMode(mode){sortModes[selectedView]=mode;localStorage.setItem(SORT_MODES_KEY,JSON.stringify(sortModes))}
function applyDisplaySettings(){
  const root=document.documentElement;
  root.dataset.fontSize=appSettings.fontSize||"medium";
  root.dataset.tabSize=appSettings.tabSize||"medium";
  root.dataset.rowSize=appSettings.rowSize||"medium";
  root.dataset.detailDensity=appSettings.detailDensity||"compact";
}

function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1800)}
function episodeNum(s){const m=String(s||"").match(/\d+/);return m?Number(m[0]):999999}
function save(){localStorage.setItem(KEY,JSON.stringify(mails));render()}
const completeKerereRows=[["3回", "しゃかかな", "ふつおた", "ラジオ界の帝王"], ["4回", "ななお", "ラジオ猫", "へばにゃん"], ["4回", "しゃかかな", "ラジオ猫", "ラジコ"], ["5回", "ガンバレないわ", "リアクション", "自分の声が聞けない"], ["6回", "しゃかかな", "リアクション", "最初にグーを出す"], ["8回", "ななお", "ふつおた", "ラジオ界のドン"], ["9回", "しゃかかな", "リアクション", "モータウンビート"], ["11回", "ガンバレないわ", "ラジオ猫", "やぎにゃん"], ["11回", "しゃかかな", "共食い", "かまたろう"], ["12回", "ななお", "リアクション", "ラジオの曲SP"], ["12回", "ガンバレないわ", "聞いてけれ", "笑顔中"], ["13回", "しゃかかな", "ラジオ猫", "ディスクユニオン"], ["13回", "ななお", "ハガキ", "絵描き歌"], ["14回", "ななお", "聞いてけれ", "たまご"], ["14回", "ななお", "聞いてけれ", "第一子"], ["15回", "ななお", "共食い", "肉のたかだ"], ["16回", "ななお", "ふつおた", "社会＆文化"], ["16回", "しゃかかな", "リアクション", "永田詩央里まさか"], ["17回", "ななお", "リアクション", "おたがき"], ["17回", "ガンバレないわ", "ラジオ猫", "うまとマハンバー"], ["17回", "しゃかかな", "ラジオ猫", "しおりん"], ["19回", "ななお", "ふつおた", "象拳"], ["19回", "ななお", "ラジオ猫", "アーちゃん"], ["20回", "アンミカの監視下", "ラジオネーム", "アンミカの監視下"], ["21回", "ななお", "リアクション", "出禁宣言"], ["22回", "しゃかかな", "ふつおた", "けれけれ流行語大賞"], ["22回", "ガンバレないわ", "しおり", "黒又山"], ["23回", "ななお", "ふつおた", "radikoマスコット"], ["23回", "しゃかかな", "ラジオ猫", "スポンサー募集中"], ["23回", "ななお", "ラジオ猫", "寿限無"], ["24回", "しゃかかな", "ラジオ猫", "手洗いうがい"], ["24回", "ななお", "しおり", "小坂町のクリスマス"], ["29回", "ななお", "リアクション", "映画館のサブスク"], ["29回", "ななお", "ラジオ猫", "ミルクボーイ"], ["31回", "ななお", "リアクション", "総集編はラブレター"], ["32回", "ななお", "ふつおた", "自炊ニュース"], ["32回", "ななお", "ラジオ猫", "サンタ"], ["33回", "ななお", "ラジオ猫", "未来から来た永田"], ["34回", "ななお", "ハガキ", "ぷるぷるちくわ"], ["34回", "しゃかかな", "聞いてけれ", "フードコート"], ["34回", "しゃかかな", "ふつおた", "さようなまはげ"], ["35回", "ななお", "しおり", "かまくらの権五郎"], ["37回", "ガンバレないわ", "ラジオ猫", "まだラジオ猫にな"], ["37回", "しゃかかな", "ラジオ猫", "豚汁"], ["38回", "ななお", "リアクション", "ギャラクシー賞"], ["38回", "ななお", "聞いてけれ", "自販機のホスピタ"], ["39回", "ななお", "ラジオ猫", "ワタナベ"], ["39回", "ななお", "ラジオ猫", "じゃあ、あんたが"], ["41回", "ななお", "聞いてけれ", "郷ひろみ"], ["42回", "ななお", "ラジオ猫", "こけけ"], ["47回", "しゃかかな", "ラジオ猫", "N〜愛すべき猫がい"], ["50回", "ななお", "リアクション", "エグゾディア"], ["50回", "ななお", "リアクション", "しいたけの擬音"], ["53回", "ななお", "リアクション", "偽の生放送"], ["54回", "ななお", "ふつおた", "1周年"], ["54回", "ななお", "ハガキ", "けれけれすごろく"], ["55回", "ななお", "ラジオ猫", "ハリソン山中"], ["55回", "ななお", "ラジオ猫", "秋田犬"], ["58回", "ななお", "ラジオ猫", "アレクサ"]];

if(!mails.length){
  mails=completeKerereRows.map(([episode,name,corner,body])=>({
    id:uid(),program:"けれけれ",episode,airDate:"",name,corner,body,summary:body,url:"",memo:"",favorite:false,status:"adopted"
  }));
}else{
  const existing=new Set(mails.filter(x=>x.program==="けれけれ").map(x=>[x.episode,x.name,x.corner,x.summary||x.body].join("||")));
  for(const [episode,name,corner,body] of completeKerereRows){
    const key=[episode,name,corner,body].join("||");
    if(!existing.has(key)){
      mails.push({id:uid(),program:"けれけれ",episode,airDate:"",name,corner,body,summary:body,url:"",memo:"",favorite:false,status:"adopted"});
    }
  }
}
function createdAtFromId(id){
  const raw=String(id||"");
  if(raw.length<=6)return "";
  const ms=parseInt(raw.slice(0,-6),36);
  if(!Number.isFinite(ms)||ms<946684800000)return "";
  const d=new Date(ms);
  return Number.isNaN(d.getTime())?"":d.toISOString();
}
mails=mails.map(x=>({id:x.id||uid(),program:x.program||"不明",episode:(x.episode||"").trim()||"不明",airDate:x.airDate||"",name:(x.name==="ガンバレななお"||x.name==="ガンバレな")?"ガンバレないわ":x.name||"",corner:x.corner||"",body:x.body||"",summary:x.summary||x.title||x.body||"",url:x.url||x.podcast||"",memo:x.memo||"",favorite:!!x.favorite,status:x.status||"adopted",sentAt:x.sentAt||"",createdAt:x.createdAt||createdAtFromId(x.id)||x.sentAt||"",addedAt:x.addedAt||((x.status==="sent"||x.status==="adopted")?(x.sentAt||x.createdAt||createdAtFromId(x.id)||""):"")}));
memoItems=memoItems.map(m=>{const {label,labelColor,...rest}=m;return rest;});
localStorage.setItem(KEY,JSON.stringify(mails));
function adoptedPrograms(){
  const existing=[...new Set(mails.filter(x=>x.status==="adopted").map(x=>x.program).filter(Boolean))];
  programOrder=programOrder.filter(p=>existing.includes(p));
  existing.forEach(p=>{if(!programOrder.includes(p))programOrder.push(p)});
  localStorage.setItem(PROGRAM_ORDER_KEY,JSON.stringify(programOrder));
  return [...programOrder];
}
function viewOrder(){return ["__memo__","__draft__","__sent__","__adopted__",...adoptedPrograms()]}
function renderProgramTabs(){
  const ps=adoptedPrograms();
  $("programTabs").innerHTML=`<button class="program-tab memo-tab ${selectedView==="__memo__"?"active":""}" data-view="__memo__">メモ</button>`+`<button class="program-tab draft-tab ${selectedView==="__draft__"?"active":""}" data-view="__draft__">下書き</button>`+
    `<button class="program-tab sent-tab ${selectedView==="__sent__"?"active":""}" data-view="__sent__">送信済</button>`+
    `<button class="program-tab adopted-tab ${selectedView==="__adopted__"?"active":""}" data-view="__adopted__">採用</button>`+
    ps.map(p=>`<button class="program-tab ${p===selectedView?"active":""}" data-view="${esc(p)}">${esc(p)}</button>`).join("");
  document.querySelectorAll(".program-tab[data-view]").forEach(b=>b.onclick=()=>{
    if(reorderMode||suppressTabClick){suppressTabClick=false;return;}
    selectedView=b.dataset.view;
    localStorage.setItem("radioMailManager.selectedView",selectedView);
    render();
  });
  setTimeout(bindTabLongPress,0);
}

let longPressTimer=null;
let programMenuTarget=null;
let reorderMode=false;
let suppressTabClick=false;
let reorderDrag=null;

function bindTabLongPress(){
  document.querySelectorAll('.program-tab[data-view]').forEach(btn=>{
    const view=btn.dataset.view;
    if(view==="__memo__"||view==="__draft__"||view==="__sent__"||view==="__adopted__")return;

    const start=(ev)=>{
      if(reorderMode)return;
      clearTimeout(longPressTimer);
      longPressTimer=setTimeout(()=>{
        suppressTabClick=true;
        programMenuTarget=view;
        const menu=$("programMenu");
        const rect=btn.getBoundingClientRect();
        menu.style.left=Math.min(rect.left,window.innerWidth-menu.offsetWidth-10)+"px";
        menu.style.top=(rect.bottom+8)+"px";
        menu.hidden=false;
      },600);
    };
    const cancel=()=>{clearTimeout(longPressTimer);longPressTimer=null};

    btn.addEventListener("touchstart",start,{passive:true});
    btn.addEventListener("touchend",cancel,{passive:true});
    btn.addEventListener("touchmove",cancel,{passive:true});
    btn.addEventListener("mousedown",start);
    btn.addEventListener("mouseup",cancel);
    btn.addEventListener("mouseleave",cancel);
    btn.addEventListener("contextmenu",e=>e.preventDefault());
  });
}

$("renameProgramBtn").onclick=()=>{
  const program=programMenuTarget;
  $("programMenu").hidden=true;
  if(!program)return;
  const nn=prompt("新しい番組名",program);
  if(!nn||nn===program)return;
  mails=mails.map(x=>x.program===program?{...x,program:nn}:x);
  programOrder=programOrder.map(p=>p===program?nn:p);
  localStorage.setItem(PROGRAM_ORDER_KEY,JSON.stringify(programOrder));
  if(programSettings[program]){programSettings[nn]=programSettings[program];delete programSettings[program];localStorage.setItem(PROGRAM_SETTINGS_KEY,JSON.stringify(programSettings));}
  if(selectedView===program)selectedView=nn;
  localStorage.setItem("radioMailManager.selectedView",selectedView);
  save();
};

$("deleteProgramBtn").onclick=()=>{
  const program=programMenuTarget;
  $("programMenu").hidden=true;
  if(!program)return;
  if(confirm(`「${program}」のメールをすべて削除しますか？`)){
    mails=mails.filter(x=>x.program!==program);
    programOrder=programOrder.filter(p=>p!==program);
    localStorage.setItem(PROGRAM_ORDER_KEY,JSON.stringify(programOrder));
    delete programSettings[program];localStorage.setItem(PROGRAM_SETTINGS_KEY,JSON.stringify(programSettings));
    if(selectedView===program)selectedView="__adopted__";
    localStorage.setItem("radioMailManager.selectedView",selectedView);
    save();
  }
};

function enterProgramReorderMode(){
  reorderMode=true;
  $("programMenu").hidden=true;
  $("programTabs").classList.add("reorder-mode");
  toast("番組タブを長押しして移動できます");
}
function exitProgramReorderMode(){reorderMode=false;reorderDrag=null;$("programTabs").classList.remove("reorder-mode");renderProgramTabs();}
$("reorderProgramBtn").onclick=enterProgramReorderMode;
$("programTabs").addEventListener("pointerdown",e=>{
  if(!reorderMode)return;
  const btn=e.target.closest('.program-tab[data-view]');
  if(!btn||String(btn.dataset.view).startsWith("__"))return;
  e.preventDefault();
  suppressTabClick=true;
  const pointerId=e.pointerId;
  reorderDrag={btn,pointerId};
  btn.classList.add("dragging");
  try{btn.setPointerCapture?.(pointerId);}catch{}
  const move=ev=>{
    if(!reorderDrag||reorderDrag.pointerId!==ev.pointerId)return;
    ev.preventDefault();
    const target=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('.program-tab[data-view]');
    if(!target||target===btn||String(target.dataset.view).startsWith("__"))return;
    const a=programOrder.indexOf(btn.dataset.view),b=programOrder.indexOf(target.dataset.view);
    if(a<0||b<0||a===b)return;
    programOrder.splice(a,1);programOrder.splice(b,0,btn.dataset.view);
    localStorage.setItem(PROGRAM_ORDER_KEY,JSON.stringify(programOrder));
    const fixed=[...$("programTabs").querySelectorAll('.program-tab[data-view^="__"]')];
    const movable=new Map([...$("programTabs").querySelectorAll('.program-tab[data-view]:not([data-view^="__"])')].map(el=>[el.dataset.view,el]));
    fixed.forEach(el=>$("programTabs").appendChild(el));
    programOrder.forEach(name=>{const el=movable.get(name);if(el)$("programTabs").appendChild(el);});
  };
  const up=ev=>{
    if(!reorderDrag||reorderDrag.pointerId!==ev.pointerId)return;
    ev.preventDefault();
    reorderDrag.btn?.classList.remove("dragging");
    try{reorderDrag.btn?.releasePointerCapture?.(ev.pointerId);}catch{}
    reorderDrag=null;
    document.removeEventListener("pointermove",move,true);
    document.removeEventListener("pointerup",up,true);
    document.removeEventListener("pointercancel",up,true);
    toast("並び順を保存しました");
  };
  document.addEventListener("pointermove",move,{capture:true,passive:false});
  document.addEventListener("pointerup",up,{capture:true,passive:false});
  document.addEventListener("pointercancel",up,{capture:true,passive:false});
},{passive:false});
$("programTabs").addEventListener("dblclick",()=>{if(reorderMode)exitProgramReorderMode();});

document.addEventListener("click",e=>{
  if(reorderMode && !e.target.closest(".program-tabs") && !e.target.closest("#programMenu"))exitProgramReorderMode();
  if(!$("programMenu").hidden && !$("programMenu").contains(e.target))$("programMenu").hidden=true;
  if(!$("memoMenu").hidden && !$("memoMenu").contains(e.target) && !e.target.closest(".memo-options-btn"))$("memoMenu").hidden=true;
  if(!$("draftMenu").hidden && !$("draftMenu").contains(e.target) && !e.target.closest(".draft-options-btn"))$("draftMenu").hidden=true;
  if(!$("sortMenu").hidden && !$("sortMenu").contains(e.target) && e.target!==$("sortBtn")){$("sortMenu").hidden=true;$("sortBtn").setAttribute("aria-expanded","false");}
});


function currentRows(){
  if(selectedView==="__memo__")return [];
  if(selectedView==="__draft__")return mails.filter(x=>x.status==="draft");
  if(selectedView==="__sent__")return mails.filter(x=>x.status==="sent"||x.status==="adopted");
  if(selectedView==="__adopted__")return mails.filter(x=>x.status==="adopted");
  return mails.filter(x=>x.status==="adopted"&&x.program===selectedView);
}
function options(sel,vals,label){const cur=sel.value;sel.innerHTML=`<option value="">${label}：すべて</option>`+vals.map(v=>`<option>${esc(v)}</option>`).join("");sel.value=cur}
function refreshFilters(){
  const scoped=currentRows();
  const showProgramFilter=selectedView==="__sent__"||selectedView==="__adopted__";
  $("programFilter").hidden=!showProgramFilter;
  options($("programFilter"),[...new Set(scoped.map(x=>x.program).filter(Boolean))].sort(),"番組");
  options($("nameFilter"),[...new Set(scoped.map(x=>x.name).filter(Boolean))].sort(),"ラジオネーム");
  options($("cornerFilter"),[...new Set(scoped.map(x=>x.corner).filter(Boolean))].sort(),"コーナー");
}
function mailAddedTime(x){return new Date(x.addedAt||x.sentAt||x.createdAt||0).getTime()||0}
function mailPostedTime(x){return new Date(x.sentAt||x.addedAt||x.createdAt||0).getTime()||0}
function sortRows(rows){
  const sortMode=currentSortMode();
  return [...rows].sort((a,b)=>{
    if(sortMode==="episodeDesc")return episodeNum(b.episode)-episodeNum(a.episode);
    if(sortMode==="addedDesc")return mailAddedTime(b)-mailAddedTime(a);
    if(sortMode==="addedAsc")return mailAddedTime(a)-mailAddedTime(b);
    if(sortMode==="postedDesc")return mailPostedTime(b)-mailPostedTime(a);
    if(sortMode==="postedAsc")return mailPostedTime(a)-mailPostedTime(b);
    if(sortMode==="nameAsc")return String(a.name||"").localeCompare(String(b.name||""),"ja");
    if(sortMode==="cornerAsc")return String(a.corner||"").localeCompare(String(b.corner||""),"ja");
    return episodeNum(a.episode)-episodeNum(b.episode);
  });
}
function filtered(){
  const q=$("search").value.trim().toLowerCase(),p=(selectedView==="__sent__"||selectedView==="__adopted__")?$("programFilter").value:"",n=$("nameFilter").value,c=$("cornerFilter").value,from=$("fromDateFilter").value,to=$("toDateFilter").value;
  const rows=currentRows().filter(x=>{
    const hay=[x.program,x.episode,x.name,x.corner,x.body,x.summary,x.memo].join(" ").toLowerCase();
    const d=x.airDate||"";return(!q||hay.includes(q))&&(!p||x.program===p)&&(!n||x.name===n)&&(!c||x.corner===c)&&(!favoriteOnly||x.favorite)&&(!from||d>=from)&&(!to||d<=to);
  });
  return sortRows(rows);
}
function render(){
  renderProgramTabs();
  const isMemo=selectedView==="__memo__";
  const isDraft=selectedView==="__draft__";
  const isSpecial=isMemo||isDraft;

  $("memoView").hidden=!isMemo;
  $("draftView").hidden=!isDraft;
  $("summaryBar").hidden=isSpecial;
  document.querySelector(".filters").hidden=isSpecial;
  document.querySelector(".table-wrap").hidden=isSpecial;
  $("fabAddBtn").hidden=false;
  $("programPostBtn").hidden=true;

  if(isMemo){renderMemos();return;}
  if(isDraft){renderDrafts();return;}

  refreshFilters();
  const rows=filtered();
  const adoptedCount=(selectedView==="__adopted__"||selectedView==="__sent__")
    ?mails.filter(x=>x.status==="adopted").length
    :rows.length;

  $("count").textContent=adoptedCount;
  $("countLabel").textContent="採用";
  $("showCount").textContent=rows.length;
  const isProgramView=!String(selectedView).startsWith("__");
  $("programPostBtn").hidden=!isProgramView;
  $("summaryBar").classList.toggle("program-view",isProgramView);

  const isSentView=selectedView==="__sent__";
  const isAdoptedView=selectedView==="__adopted__";
  const showProgramColumn=isSentView||isAdoptedView;
  const table=document.querySelector(".table-wrap table");
  table.classList.toggle("five-col",isAdoptedView);
  table.classList.toggle("sent-four-col",isSentView);
  table.classList.toggle("four-col",!isAdoptedView&&!isSentView);
  table.querySelector("thead tr").innerHTML=isSentView
    ?`<th>番組名</th><th>ラジオネーム</th><th>コーナー</th><th>本文</th>`
    :isAdoptedView
      ?`<th>番組名</th><th>放送回</th><th>ラジオネーム</th><th>コーナー</th><th>本文</th>`
      :`<th>放送回</th><th>ラジオネーム</th><th>コーナー</th><th>本文</th>`;

  $("mailTable").innerHTML=rows.map(x=>`<tr data-id="${x.id}" class="">
    ${showProgramColumn?`<td><span class="fit-text">${esc(x.program)}</span></td>`:""}
    ${isSentView?"":`<td><span class="fit-text">${esc(x.episode)}</span></td>`}
    <td><span class="fit-text">${esc(x.name)}</span></td>
    <td><span class="fit-text">${esc(x.corner)}</span></td>
    <td><span class="fit-text">${esc(x.body||"—")}</span></td>
  </tr>`).join("");
  requestAnimationFrame(fitAllText);
}

function fitAllText(){document.querySelectorAll(".fit-text").forEach(el=>{el.style.transform="scaleX(1)";el.style.width="100%";const cell=el.parentElement,avail=cell.clientWidth-4,need=el.scrollWidth;if(need>avail&&need>0){const scale=Math.max(.55,avail/need);el.style.transform=`scaleX(${scale})`;el.style.width=`${100/scale}%`}})}
window.addEventListener("resize",()=>requestAnimationFrame(fitAllText));
$("mailTable").addEventListener("click",e=>{const tr=e.target.closest("tr");if(tr)openDetail(tr.dataset.id)});["search","programFilter","nameFilter","cornerFilter","fromDateFilter","toDateFilter"].forEach(id=>$(id).addEventListener("input",render));
$("favoriteFilterBtn").onclick=()=>{
  favoriteOnly=!favoriteOnly;
  $("favoriteFilterBtn").classList.toggle("active",favoriteOnly);
  $("favoriteFilterBtn").setAttribute("aria-pressed",String(favoriteOnly));
  $("favoriteFilterBtn").textContent=favoriteOnly?"★ お気に入り":"☆ お気に入り";
  render();
};
function uniqueValues(key){return [...new Set(mails.map(x=>x[key]).filter(Boolean))].sort()}
function fillDatalists(){$("programList").innerHTML=uniqueValues("program").map(v=>`<option value="${esc(v)}"></option>`).join("");$("nameList").innerHTML=uniqueValues("name").map(v=>`<option value="${esc(v)}"></option>`).join("");$("cornerList").innerHTML=uniqueValues("corner").map(v=>`<option value="${esc(v)}"></option>`).join("")}
function resetForm(){editingId=null;$("dialogTitle").textContent=selectedView==="__sent__"?"送信済みメールを追加":"採用メールを追加";$("deleteBtn").hidden=true;$("mailForm").reset();fillDatalists();if(selectedView!=="__sent__"&&selectedView!=="__adopted__")$("program").value=selectedView}
function openEditor(id=null){resetForm();editingId=id;if(id){const x=mails.find(m=>m.id===id);$("dialogTitle").textContent="メールを編集";$("deleteBtn").hidden=false;["program","episode","airDate","name","corner","body","summary","url","memo"].forEach(k=>$(k).value=x[k]??"")}$("editDialog").showModal()}
$("addBtn").onclick=()=>{if(selectedView==="__draft__")openDraftComposer();else openEditor();};$("cancelBtn").onclick=()=>$("editDialog").close();$("closeDialog").onclick=()=>$("editDialog").close();
$("deleteBtn").onclick=()=>{if(editingId&&confirm("このメールを削除しますか？")){mails=mails.filter(x=>x.id!==editingId);save();$("editDialog").close();toast("削除しました")}};
$("mailForm").addEventListener("submit",e=>{e.preventDefault();const old=editingId?mails.find(m=>m.id===editingId):null;const status=old?.status||(selectedView==="__draft__"?"draft":selectedView==="__sent__"?"sent":"adopted");const now=new Date().toISOString();const x={id:editingId||uid(),program:$("program").value.trim()||"不明",episode:$("episode").value.trim()||"不明",airDate:$("airDate").value,name:$("name").value.trim(),corner:$("corner").value.trim(),body:$("body").value,summary:$("summary").value.trim(),url:$("url").value.trim(),memo:$("memo").value,label:$("mailLabel")?.value.trim()||"",labelColor:$("mailLabelColor")?.value||"yellow",favorite:old?.favorite||false,status,sentAt:(status==="sent"&&!old?.sentAt)?now:(old?.sentAt||""),createdAt:old?.createdAt||now,addedAt:old?.addedAt||((status==="sent"||status==="adopted")?now:""),adoptedAt:old?.adoptedAt||((status==="adopted")?now:""),bodyLength:String($("body").value||"").length};if(editingId)mails=mails.map(m=>m.id===editingId?x:m);else mails.push(x);localStorage.setItem(KEY,JSON.stringify(mails));if(typeof setAutosavePart==="function")setAutosavePart("mail",null);render();$("editDialog").close();toast(editingId?"更新しました":"追加しました")});
function safeHttpUrl(url){
  const v=String(url||"").trim();
  if(!v)return "";
  try{
    const u=new URL(v);
    return (u.protocol==="http:"||u.protocol==="https:")?u.href:"";
  }catch{return "";}
}
function commitDetailField(el){
  const m=mails.find(mm=>mm.id===currentDetailId);
  if(!m)return;
  const key=el.dataset.key;
  let val=(el.tagName==="INPUT"||el.tagName==="TEXTAREA"?el.value:el.innerText).trim();
  if(key==="episode"&&!val)val="不明";
  m[key]=val;
  if(key==="body"&&m.status==="draft")m.summary=val.slice(0,40);
  localStorage.setItem(KEY,JSON.stringify(mails));
  render();
}
function bindDetailEditors(){
  $("detailContent").querySelectorAll("[data-key]").forEach(el=>{
    if(el.dataset.manualSave==="true")return;
    el.addEventListener("blur",()=>commitDetailField(el));
    if(el.tagName==="INPUT")el.addEventListener("change",()=>commitDetailField(el));
  });
}
function renderPodcastBlock(x,editing=false){
  const wrap=document.getElementById("podcastBlock");
  if(!wrap)return;
  if(editing){
    wrap.innerHTML=`<input class="detail-url-v1" data-key="url" data-manual-save="true" type="url" value="${esc(x.url||"")}" placeholder="URL未登録">`;
    const input=wrap.querySelector("input");
    input.focus();
    input.setSelectionRange?.(input.value.length,input.value.length);
    $("detailEditBtn").textContent="保存";
  }else{
    const href=safeHttpUrl(x.url);
    wrap.innerHTML=href?`<a class="podcast-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(x.url)}</a>`:`<span class="podcast-empty">URL未登録</span>`;
    $("detailEditBtn").textContent="編集";
  }
}
function openDetail(id){
  currentDetailId=id;
  const x=mails.find(m=>m.id===id);
  if(!x)return;
  const isDraft=x.status==="draft";

  $("detailTitle").textContent=isDraft?"下書き詳細":(x.summary||x.corner||"メール詳細");
  $("detailCount").hidden=!isDraft;
  $("detailCount").textContent=isDraft?`${(x.body||"").length}文字`:"";
  const detailAdded=x.addedAt||((x.status==="sent"||x.status==="adopted")?(x.sentAt||x.createdAt):"");
  $("detailAddedAt").hidden=isDraft||!detailAdded||(selectedView!=="__sent__"&&selectedView!=="__adopted__");
  $("detailAddedAt").textContent=detailAdded?formatDetailDate(detailAdded):"";
  $("favoriteBtn").textContent=x.favorite?"★":"☆";
  $("favoriteBtn").classList.toggle("active",x.favorite);
  $("detailEditBtn").hidden=isDraft;
  $("markAdoptedBtn").hidden=!isDraft;
  $("markAdoptedBtn").textContent=isDraft?"送信済みに追加（全件タブに移動）":"採用メールに追加";

  if(isDraft){
    $("detailContent").innerHTML=`
      <div class="draft-detail-meta">
        <label><span>ラジオネーム</span><input class="draft-detail-small" data-key="name" value="${esc(x.name||"")}" placeholder="ラジオネーム"></label>
        <label><span>コーナー</span><input class="draft-detail-small" data-key="corner" value="${esc(x.corner||"")}" placeholder="コーナー"></label>
      </div>
      <div class="draft-detail-body-wrap">
        <textarea class="draft-detail-body" data-key="body" placeholder="本文">${esc(x.body||"")}</textarea>
      </div>`;
    bindDetailEditors();
    const draftBody=$("detailContent").querySelector(".draft-detail-body");
    draftBody?.addEventListener("input",()=>{$("detailCount").textContent=`${draftBody.value.length}文字`;});
  }else{
    $("detailContent").innerHTML=`
      <div class="detail-grid mail-detail-grid">
        <div class="k">番組</div><div class="detail-gray editable-inline" data-key="program" contenteditable="true">${esc(x.program)}</div>
        <div class="detail-pair-row">
          <label><span>放送回</span><div class="detail-gray editable-inline" data-key="episode" contenteditable="true">${esc(x.episode||"不明")}</div></label>
          <label><span>放送日</span><div class="detail-gray"><input class="detail-date-edit" data-key="airDate" type="date" value="${esc(x.airDate||"")}"></div></label>
        </div>
        <div class="detail-pair-row">
          <label><span>ラジオネーム</span><div class="detail-gray editable-inline" data-key="name" contenteditable="true">${esc(x.name||"")}</div></label>
          <label><span>コーナー</span><div class="detail-gray editable-inline" data-key="corner" contenteditable="true">${esc(x.corner||"")}</div></label>
        </div>
        <div class="k">状態</div><div class="status-cell">${x.status==="adopted"?"採用":"送信済み"}${x.sentAt?`<span class="sent-at">送信 ${new Date(x.sentAt).toLocaleString("ja-JP")}</span>`:""}</div>
      </div>
      <div class="detail-body mail-body-section"><strong>本文</strong><br><div class="detail-gray editable-block-v1 mail-body-main" data-key="body" contenteditable="true">${esc(x.body||"本文未登録")}</div></div>
      ${x.summary?`<div class="detail-body"><strong>要約</strong><br><div class="detail-gray editable-block-v1" data-key="summary" contenteditable="true">${esc(x.summary)}</div></div>`:""}
      <div class="detail-body"><strong>Podcast URL</strong><br><div id="podcastBlock"></div></div>
      ${x.memo?`<div class="detail-body"><strong>メモ</strong><br><div class="detail-gray editable-block-v1" data-key="memo" contenteditable="true">${esc(x.memo)}</div></div>`:""}`;
    bindDetailEditors();
    renderPodcastBlock(x,false);
  }
  $("detailDialog").showModal();
}
$("favoriteBtn").onclick=()=>{const x=mails.find(m=>m.id===currentDetailId);if(!x)return;x.favorite=!x.favorite;save();$("favoriteBtn").textContent=x.favorite?"★":"☆";$("favoriteBtn").classList.toggle("active",x.favorite);toast(x.favorite?"お気に入りに追加":"お気に入りを解除")};
$("markAdoptedBtn").onclick=()=>{const x=mails.find(m=>m.id===currentDetailId);if(!x)return;const now=new Date().toISOString();if(x.status==="draft"){x.status="sent";if(!x.sentAt)x.sentAt=now;if(!x.addedAt)x.addedAt=now;save();$("detailDialog").close();toast("送信済みに追加しました");}else{x.status="adopted";if(!x.sentAt)x.sentAt=now;if(!x.addedAt)x.addedAt=now;save();$("detailDialog").close();toast("採用メールに追加しました")}};
$("detailEditBtn").onclick=()=>{
  const x=mails.find(m=>m.id===currentDetailId);if(!x||x.status==="draft")return;
  const input=document.querySelector("#podcastBlock input[data-key='url']");
  if(input){x.url=input.value.trim();localStorage.setItem(KEY,JSON.stringify(mails));renderPodcastBlock(x,false);render();toast("URLを保存しました");}
  else renderPodcastBlock(x,true);
};
$("closeDetail").onclick=()=>$("detailDialog").close();$("closeDetail2").onclick=()=>$("detailDialog").close();$("moreBtn").onclick=e=>{e.stopPropagation();$("moreMenu").hidden=!$("moreMenu").hidden};document.addEventListener("click",e=>{if(!$("moreMenu").contains(e.target)&&e.target!==$("moreBtn"))$("moreMenu").hidden=true});
function downloadBlob(name,blob){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$("backupBtn").onclick=()=>{downloadBlob("radio-mail-backup-"+new Date().toISOString().slice(0,10)+".json",new Blob([JSON.stringify(mails,null,2)],{type:"application/json"}));toast("バックアップを書き出しました")};$("restoreBtn").onclick=()=>$("restoreInput").click();
$("restoreInput").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data))throw 0;if(confirm(`${data.length}件のデータに置き換えます。よろしいですか？`)){mails=data.map(x=>{const id=x.id||uid();return {...x,id,episode:(x.episode||"").trim()||"不明",favorite:!!x.favorite,status:x.status||"adopted",sentAt:x.sentAt||"",createdAt:x.createdAt||createdAtFromId(id)||x.sentAt||"",addedAt:x.addedAt||((x.status==="sent"||x.status==="adopted")?(x.sentAt||x.createdAt||createdAtFromId(id)||""):"")};});save();toast("復元しました")}}catch{alert("復元できるJSONではありません。")}e.target.value=""};
$("csvBtn").onclick=()=>{const cols=["状態","お気に入り","番組","放送回","放送日","ラジオネーム","コーナー","メール本文","要約","URL","メモ"];const rows=mails.map(x=>[x.status==="adopted"?"採用":"送信済み",x.favorite?"★":"",x.program,x.episode,x.airDate,x.name,x.corner,x.body,x.summary,x.url,x.memo]);const csv="\uFEFF"+[cols,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\r\n");downloadBlob("radio-mail-"+new Date().toISOString().slice(0,10)+".csv",new Blob([csv],{type:"text/csv;charset=utf-8"}));toast("CSVを書き出しました")};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false});$("installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true};window.addEventListener("appinstalled",()=>$("installBtn").hidden=true);if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));







$("detailDeleteBtn").onclick=()=>{
  if(!currentDetailId)return;
  if(confirm("このメールを削除しますか？")){
    mails=mails.filter(m=>m.id!==currentDetailId);
    save();
    $("detailDialog").close();
    toast("削除しました");
  }
};

// Swipe between the tabs.
// Right swipe = previous tab; left swipe = next tab.
// けれけれ -> right swipe -> 採用メール.
let swipeStartX=0,swipeStartY=0,swipeTracking=false;
const swipeArea=document.querySelector("main");
swipeArea.addEventListener("touchstart",e=>{
  if(e.target.closest("input,select,textarea,button,a")){swipeTracking=false;return;}
  const t=e.changedTouches[0];
  swipeStartX=t.clientX;swipeStartY=t.clientY;swipeTracking=true;
},{passive:true});
swipeArea.addEventListener("touchend",e=>{
  if(!swipeTracking)return;
  const t=e.changedTouches[0];
  const dx=t.clientX-swipeStartX,dy=t.clientY-swipeStartY;
  swipeTracking=false;
  if(Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*1.4)return;
  const order=viewOrder(),i=order.indexOf(selectedView);
  if(i<0)return;
  const ni=dx>0?i-1:i+1;
  if(ni<0||ni>=order.length)return;
  selectedView=order[ni];
  localStorage.setItem("radioMailManager.selectedView",selectedView);
  render();
  document.querySelector(`.program-tab[data-view="${CSS.escape(selectedView)}"]`)?.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"});
},{passive:true});

render();






$("periodFilterBtn").onclick=()=>$("periodDialog").showModal();
$("closePeriodDialog").onclick=()=>$("periodDialog").close();
$("applyPeriodBtn").onclick=()=>{
  const from=$("fromDateFilter").value;
  const to=$("toDateFilter").value;
  $("periodFilterBtn").classList.toggle("active",!!(from||to));
  $("periodFilterBtn").textContent=(from||to)?"期間指定中":"期間指定";
  $("periodDialog").close();
  render();
};
$("clearPeriodBtn").onclick=()=>{
  $("fromDateFilter").value="";
  $("toDateFilter").value="";
  $("periodFilterBtn").classList.remove("active");
  $("periodFilterBtn").textContent="期間指定";
  $("periodDialog").close();
  render();
};







function formatDetailDate(iso){
  const d=new Date(iso);if(Number.isNaN(d.getTime()))return "";
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function formatMemoDate(iso){
  const d=new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}





let currentMemoId=null;
function renderMemos(){
  $("memoTimeline").innerHTML=memoItems
    .slice()
    .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
    .map(m=>`<article class="memo-card" data-id="${m.id}">
      <button class="memo-options-btn" type="button" aria-label="メモのオプション">…</button>
      <div class="memo-text">${esc(m.text)}</div>
      <div class="memo-meta"><span>${formatMemoDate(m.createdAt)}</span><span>${m.text.length}文字</span></div>
    </article>`).join("");
}
function openMemoDialog(id=null){
  currentMemoId=id;
  const m=id?memoItems.find(x=>x.id===id):null;
  $("memoDialogTitle").textContent=m?"メモ詳細":"メモを追加";
  $("memoDialogInput").value=m?.text||"";
  $("memoDialogCount").textContent=`${$("memoDialogInput").value.length} / 500`;
  $("memoDetailCount").hidden=!m;
  $("memoDetailCount").textContent=m?`${$("memoDialogInput").value.length}文字`:"";
  $("memoDialogDate").textContent=m?formatMemoDate(m.createdAt):"";
  $("memoDeleteBtn").hidden=!m;
  $("memoToDraftBtn").hidden=!m;
  $("memoDialog").showModal();
  setTimeout(()=>$("memoDialogInput").focus(),50);
}
$("memoDialogInput").addEventListener("input",()=>{
  $("memoDialogCount").textContent=`${$("memoDialogInput").value.length} / 500`;
  if(!$("memoDetailCount").hidden)$("memoDetailCount").textContent=`${$("memoDialogInput").value.length}文字`;
});
$("memoSaveBtn").onclick=()=>{
  const text=$("memoDialogInput").value.trim();
  if(!text)return;
  if(currentMemoId){
    const m=memoItems.find(x=>x.id===currentMemoId);
    if(m)m.text=text;
  }else{
    memoItems.push({id:uid(),text,createdAt:new Date().toISOString()});
  }
  localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));
  $("memoDialog").close();
  renderMemos();
};
$("memoDeleteBtn").onclick=()=>{
  if(!currentMemoId)return;
  if(confirm("このメモを削除しますか？")){
    memoItems=memoItems.filter(x=>x.id!==currentMemoId);
    localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));
    $("memoDialog").close();
    renderMemos();
  }
};
$("memoCancelBtn").onclick=()=>$("memoDialog").close();
$("closeMemoDialog").onclick=()=>$("memoDialog").close();
let memoMenuTargetId=null;
$("memoTimeline").addEventListener("click",e=>{
  const options=e.target.closest(".memo-options-btn");
  const card=e.target.closest(".memo-card");
  if(!card)return;
  if(options){
    e.stopPropagation();
    memoMenuTargetId=card.dataset.id;
    const menu=$("memoMenu");
    const r=options.getBoundingClientRect();
    menu.style.left=Math.max(8,Math.min(r.right-170,window.innerWidth-178))+"px";
    menu.style.top=Math.min(r.bottom+6,window.innerHeight-150)+"px";
    menu.hidden=false;
    return;
  }
  openMemoDialog(card.dataset.id);
});
$("editMemoMenuBtn").onclick=()=>{const id=memoMenuTargetId;$("memoMenu").hidden=true;if(id)openMemoDialog(id);};
$("deleteMemoMenuBtn").onclick=()=>{
  const id=memoMenuTargetId;$("memoMenu").hidden=true;if(!id)return;
  if(confirm("このメモを削除しますか？")){memoItems=memoItems.filter(x=>x.id!==id);localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));renderMemos();toast("削除しました");}
};
$("copyMemoMenuBtn").onclick=async()=>{
  const m=memoItems.find(x=>x.id===memoMenuTargetId);$("memoMenu").hidden=true;if(!m)return;
  try{await navigator.clipboard.writeText(m.text||"");}
  catch{const ta=document.createElement("textarea");ta.value=m.text||"";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();}
  toast("メモをコピーしました");
};
$("memoToDraftMenuBtn").onclick=()=>{const id=memoMenuTargetId;$("memoMenu").hidden=true;if(id)copyMemoToDraft(id);};

$("fabAddBtn").onclick=()=>{if(selectedView==="__memo__")openMemoComposer();else if(selectedView==="__draft__")openDraftComposer();else openEditor();};


const THEMES={
  green:{accent:"#4b9f5b",accentSoft:"#eef8ee"},
  blue:{accent:"#3f7fcb",accentSoft:"#edf4ff"},
  purple:{accent:"#7a5bc7",accentSoft:"#f3efff"},
  orange:{accent:"#d8792b",accentSoft:"#fff3e8"},
  gray:{accent:"#5d6670",accentSoft:"#f0f2f4"}
};
function applyTheme(name){
  const t=THEMES[name]||THEMES.green;
  document.documentElement.style.setProperty("--accent",t.accent);
  document.documentElement.style.setProperty("--accent-soft",t.accentSoft);
  localStorage.setItem(THEME_KEY,name);
}
$("themeBtn").onclick=()=>{
  $("moreMenu").hidden=true;
  $("themeDialog").showModal();
};
$("closeThemeDialog").onclick=()=>$("themeDialog").close();
document.querySelectorAll(".theme-choice").forEach(btn=>{
  btn.onclick=()=>{
    applyTheme(btn.dataset.theme);
    $("themeDialog").close();
  };
});
applyTheme(localStorage.getItem(THEME_KEY)||"green");
applyDisplaySettings();







function closeDialogOnBackdrop(dialog){
  dialog.addEventListener("click",e=>{
    const r=dialog.getBoundingClientRect();
    const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
    if(!inside)dialog.close();
  });
}
function bindBackdropCloseToAllDialogs(root=document){
  root.querySelectorAll?.("dialog").forEach(dialog=>{
    if(dialog.dataset.backdropCloseBound)return;
    dialog.dataset.backdropCloseBound="true";
    closeDialogOnBackdrop(dialog);
  });
}
bindBackdropCloseToAllDialogs();
new MutationObserver(muts=>muts.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1){if(n.matches?.("dialog"))bindBackdropCloseToAllDialogs(n.parentElement||document);else bindBackdropCloseToAllDialogs(n);}}))).observe(document.body,{childList:true,subtree:true});



function copyMemoToDraft(id){
  const m=memoItems.find(x=>x.id===id);if(!m)return;
  mails.push({id:uid(),program:"不明",episode:"不明",airDate:"",name:"",corner:"",body:m.text,summary:m.text.slice(0,40),url:"",memo:"",label:m.label||"",labelColor:m.labelColor||"yellow",favorite:false,status:"draft",sentAt:"",createdAt:new Date().toISOString(),addedAt:""});
  localStorage.setItem(KEY,JSON.stringify(mails));
  toast("下書きにコピーしました");
}
$("memoToDraftBtn").onclick=()=>{if(!currentMemoId)return;copyMemoToDraft(currentMemoId);$("memoDialog").close();selectedView="__draft__";localStorage.setItem("radioMailManager.selectedView",selectedView);render();};


$("copyBodyBtn").onclick=async()=>{
  const m=mails.find(x=>x.id===currentDetailId);
  if(!m)return;
  try{
    await navigator.clipboard.writeText(m.body||"");
    toast("本文をコピーしました");
  }catch{
    const ta=document.createElement("textarea");
    ta.value=m.body||"";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("本文をコピーしました");
  }
};

function refreshSortMenu(){
  const menu=$("sortMenu");
  const sent=selectedView==="__sent__";
  menu.innerHTML=sent
    ?`<button data-sort="postedDesc">投稿日時：新しい順</button><button data-sort="postedAsc">投稿日時：古い順</button><button data-sort="episodeAsc">放送回：昇順</button><button data-sort="episodeDesc">放送回：降順</button><button data-sort="nameAsc">ラジオネーム順</button><button data-sort="cornerAsc">コーナー順</button>`
    :`<button data-sort="episodeAsc">放送回：昇順</button><button data-sort="episodeDesc">放送回：降順</button><button data-sort="addedDesc">追加日時：新しい順</button><button data-sort="addedAsc">追加日時：古い順</button><button data-sort="nameAsc">ラジオネーム順</button><button data-sort="cornerAsc">コーナー順</button>`;
  menu.querySelectorAll("button[data-sort]").forEach(b=>b.classList.toggle("active",b.dataset.sort===currentSortMode()));
}
$("sortBtn").onclick=e=>{
  e.stopPropagation();refreshSortMenu();
  const menu=$("sortMenu"),r=$("sortBtn").getBoundingClientRect();
  menu.style.left=Math.max(8,Math.min(r.right-210,window.innerWidth-218))+"px";
  menu.style.top=Math.min(r.bottom+6,window.innerHeight-290)+"px";
  menu.hidden=!menu.hidden;
  $("sortBtn").setAttribute("aria-expanded",String(!menu.hidden));
};
$("sortMenu").addEventListener("click",e=>{
  const btn=e.target.closest("button[data-sort]");if(!btn)return;
  setCurrentSortMode(btn.dataset.sort);
  $("sortMenu").hidden=true;$("sortBtn").setAttribute("aria-expanded","false");
  render();toast(btn.textContent);
});

$("filterToggleBtn").onclick=()=>{
  const filters=document.querySelector(".filters");
  const willOpen=filters.classList.contains("collapsed");
  filters.classList.toggle("collapsed");
  $("filterToggleBtn").setAttribute("aria-expanded",String(willOpen));
};
$("programPostBtn").onclick=()=>{
  if(String(selectedView).startsWith("__"))return;
  const s=programSettings[selectedView]||{};
  const url=safeHttpUrl(s.formUrl);
  if(url){window.open(url,"_blank","noopener,noreferrer");return;}
  if(s.email){window.location.href=`mailto:${encodeURIComponent(s.email)}`;return;}
  toast("番組設定に投稿先を登録してください");
};

function renderDrafts(){
  const rows=mails.filter(x=>x.status==="draft").sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
  $("draftTimeline").innerHTML=rows.map(x=>`<article class="draft-card" data-id="${x.id}">
    <button class="draft-options-btn" type="button" aria-label="下書きのオプション">…</button>
    <div class="draft-body">${esc((x.body||"").replace(/\s+/g," ").trim()||"（本文なし）")}</div>
    <div class="draft-meta"><span>${x.createdAt?formatMemoDate(x.createdAt):"日時不明"}</span><span>${(x.body||"").length}文字</span></div>
  </article>`).join("");
}
let draftMenuTargetId=null;
$("draftTimeline").addEventListener("click",e=>{
  const options=e.target.closest(".draft-options-btn");
  const card=e.target.closest(".draft-card");if(!card)return;
  if(options){e.stopPropagation();draftMenuTargetId=card.dataset.id;const menu=$("draftMenu"),r=options.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(r.right-190,window.innerWidth-198))+"px";menu.style.top=Math.min(r.bottom+6,window.innerHeight-230)+"px";menu.hidden=false;return;}
  openDetail(card.dataset.id);
});
$("editDraftMenuBtn").onclick=()=>{const id=draftMenuTargetId;$("draftMenu").hidden=true;if(id)openDraftComposer(id);};
$("deleteDraftMenuBtn").onclick=()=>{const id=draftMenuTargetId;$("draftMenu").hidden=true;if(!id)return;if(confirm("この下書きを削除しますか？")){mails=mails.filter(x=>x.id!==id);localStorage.setItem(KEY,JSON.stringify(mails));renderDrafts();toast("削除しました");}};
$("duplicateDraftMenuBtn").onclick=()=>{const d=mails.find(x=>x.id===draftMenuTargetId);$("draftMenu").hidden=true;if(!d)return;const now=new Date().toISOString();mails.push({...d,id:uid(),status:"draft",sentAt:"",createdAt:now,addedAt:""});localStorage.setItem(KEY,JSON.stringify(mails));renderDrafts();toast("下書きを複製しました");};
$("copyDraftMenuBtn").onclick=async()=>{const d=mails.find(x=>x.id===draftMenuTargetId);$("draftMenu").hidden=true;if(!d)return;try{await navigator.clipboard.writeText(d.body||"");}catch{const ta=document.createElement("textarea");ta.value=d.body||"";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();}toast("下書きをコピーしました");};
$("sendDraftMenuBtn").onclick=()=>{const d=mails.find(x=>x.id===draftMenuTargetId);$("draftMenu").hidden=true;if(!d)return;const now=new Date().toISOString();d.status="sent";if(!d.sentAt)d.sentAt=now;if(!d.addedAt)d.addedAt=now;localStorage.setItem(KEY,JSON.stringify(mails));renderDrafts();toast("送信済みに追加しました");};

let composerMode="memo";
let composerEditId=null;
function openMemoComposer(id=null){
  composerMode="memo";composerEditId=id;
  const m=id?memoItems.find(x=>x.id===id):null;
  $("composerTitle").textContent=m?"メモを編集":"メモ";
  $("draftFields").hidden=true;
  $("quickComposerDialog").classList.add("memo-mode");
  $("quickComposerDialog").classList.remove("draft-mode");
  $("composerText").value=m?.text||"";
  $("composerCount").textContent=`${$("composerText").value.length} / 1000`;
  $("composerTopCount").hidden=true;
  $("quickComposerDialog").showModal();
  setTimeout(()=>$("composerText").focus(),50);
}
function openDraftComposer(id=null){
  composerMode="draft";composerEditId=id;
  const d=id?mails.find(x=>x.id===id):null;
  $("composerTitle").textContent=d?"下書きを編集":"下書き";
  $("draftFields").hidden=false;
  $("quickComposerDialog").classList.remove("memo-mode");
  $("quickComposerDialog").classList.add("draft-mode");
  fillDatalists();
  $("draftName").value=d?.name||"";
  $("draftCorner").value=d?.corner||"";
  $("composerText").value=d?.body||"";
  $("composerCount").textContent=`${$("composerText").value.length} / 1000`;
  $("composerTopCount").hidden=false;$("composerTopCount").textContent=`${$("composerText").value.length}文字`;
  $("quickComposerDialog").showModal();
  setTimeout(()=>$("composerText").focus(),50);
}
$("composerText").addEventListener("input",()=>{const n=$("composerText").value.length;$("composerCount").textContent=`${n} / 1000`;if(composerMode==="draft")$("composerTopCount").textContent=`${n}文字`;});
$("closeComposerDialog").onclick=()=>$("quickComposerDialog").close();
$("composerSaveBtn").onclick=()=>{
  const text=$("composerText").value.trim();if(!text)return;
  if(composerMode==="memo"){
    if(composerEditId){
      const m=memoItems.find(x=>x.id===composerEditId);if(m)m.text=text;
    }else{
      memoItems.push({id:uid(),text,createdAt:new Date().toISOString()});
    }
    localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));renderMemos();
  }else{
    if(composerEditId){
      const d=mails.find(x=>x.id===composerEditId);
      if(d){d.name=$("draftName").value.trim();d.corner=$("draftCorner").value.trim();d.body=text;d.summary=text.slice(0,40);if(!d.createdAt)d.createdAt=new Date().toISOString();}
    }else{
      mails.push({id:uid(),program:"不明",episode:"不明",airDate:"",name:$("draftName").value.trim(),corner:$("draftCorner").value.trim(),body:text,summary:text.slice(0,40),url:"",memo:"",favorite:false,status:"draft",sentAt:"",createdAt:new Date().toISOString(),addedAt:""});
    }
    localStorage.setItem(KEY,JSON.stringify(mails));renderDrafts();
  }
  $("quickComposerDialog").close();
};

function buildStats(){
  const sent=mails.filter(x=>x.status==="sent"||x.status==="adopted");
  const adopted=mails.filter(x=>x.status==="adopted");
  const rate=sent.length?Math.round(adopted.length/sent.length*100):0;
  const byProgram=[...new Set(mails.map(x=>x.program).filter(Boolean))].map(p=>{
    const ps=sent.filter(x=>x.program===p).length;
    const pa=adopted.filter(x=>x.program===p).length;
    return {p,ps,pa,rate:ps?Math.round(pa/ps*100):0};
  }).sort((a,b)=>b.pa-a.pa);
  $("statsContent").innerHTML=`<div class="stats-hero">
    <div><strong>${sent.length}</strong><span>送信</span></div>
    <div><strong>${adopted.length}</strong><span>採用</span></div>
    <div><strong>${rate}%</strong><span>採用率</span></div>
  </div><div class="stats-list">${byProgram.map(x=>`<div class="stats-row"><strong>${esc(x.p)}</strong><span>${x.pa}採用 / ${x.ps}送信 / ${x.rate}%</span></div>`).join("")}</div>`;
}
$("statsBtn").onclick=()=>{$("moreMenu").hidden=true;buildStats();$("statsDialog").showModal();};
$("closeStatsDialog").onclick=()=>$("statsDialog").close();

function refreshProgramSettingsSelect(){
  const ps=adoptedPrograms();
  $("programSettingsSelect").innerHTML=ps.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join("");
  loadProgramSettingsForm();
}
function loadProgramSettingsForm(){
  const p=$("programSettingsSelect").value,s=programSettings[p]||{};
  $("programFormUrl").value=s.formUrl||"";
  $("programEmail").value=s.email||"";
  $("programDefaultName").value=s.defaultName||"";$("programCorners").value=Array.isArray(s.corners)?s.corners.join("\n"):"";
}
function loadSettingsForm(){
  $("fontSizeSetting").value=appSettings.fontSize||"medium";
  $("tabSizeSetting").value=appSettings.tabSize||"medium";
  $("rowSizeSetting").value=appSettings.rowSize||"medium";
  $("detailDensitySetting").value=appSettings.detailDensity||"compact";
}
$("settingsBtn").onclick=()=>{$("moreMenu").hidden=true;loadSettingsForm();$("settingsDialog").showModal();};
$("closeSettingsDialog").onclick=()=>$("settingsDialog").close();
$("saveSettingsBtn").onclick=()=>{
  appSettings={fontSize:$("fontSizeSetting").value,tabSize:$("tabSizeSetting").value,rowSize:$("rowSizeSetting").value,detailDensity:$("detailDensitySetting").value};
  localStorage.setItem(APP_SETTINGS_KEY,JSON.stringify(appSettings));applyDisplaySettings();$("settingsDialog").close();toast("表示設定を保存しました");
};
$("resetSettingsBtn").onclick=()=>{appSettings={fontSize:"medium",tabSize:"medium",rowSize:"medium",detailDensity:"compact"};localStorage.setItem(APP_SETTINGS_KEY,JSON.stringify(appSettings));applyDisplaySettings();loadSettingsForm();toast("表示設定を初期値に戻しました");};

$("programSettingsBtn").onclick=()=>{$("moreMenu").hidden=true;refreshProgramSettingsSelect();$("programSettingsDialog").showModal();};
$("programSettingsSelect").addEventListener("change",loadProgramSettingsForm);
$("closeProgramSettingsDialog").onclick=()=>$("programSettingsDialog").close();
$("saveProgramSettingsBtn").onclick=()=>{
  const p=$("programSettingsSelect").value;if(!p)return;
  programSettings[p]={formUrl:$("programFormUrl").value.trim(),email:$("programEmail").value.trim(),defaultName:$("programDefaultName").value.trim(),corners:$("programCorners").value.split(/\n|,/).map(x=>x.trim()).filter(Boolean)};
  localStorage.setItem(PROGRAM_SETTINGS_KEY,JSON.stringify(programSettings));
  toast("番組設定を保存しました");$("programSettingsDialog").close();
};
$("openProgramPostBtn").onclick=()=>{
  const p=$("programSettingsSelect").value,s=programSettings[p]||{};
  if(s.formUrl){window.open(s.formUrl,"_blank");return;}
  if(s.email){window.location.href=`mailto:${s.email}`;return;}
  toast("投稿先が未登録です");
};

// ===== ver.14 enhancements =====
function allPrograms(){
  const set=new Set([...programOrder,...Object.keys(programSettings),...mails.map(x=>x.program).filter(p=>p&&p!=="不明")]);
  return [...set];
}
function programCorners(program){
  const s=programSettings[program]||{};
  return Array.isArray(s.corners)?s.corners.filter(Boolean):[];
}
function labelChip(item){
  return item?.label?`<span class="item-label label-${esc(item.labelColor||"yellow")}">${esc(item.label)}</span>`:"";
}
function debounce(fn,ms=350){let t;return (...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),ms)}}
function autosaveState(){try{return JSON.parse(localStorage.getItem(AUTOSAVE_KEY)||"{}")||{}}catch{return {}}}
function setAutosavePart(key,val){const st=autosaveState();if(val==null)delete st[key];else st[key]=val;localStorage.setItem(AUTOSAVE_KEY,JSON.stringify(st));}

// Complete backup / restore. Old mail-only backups remain supported.
$("backupBtn").onclick=()=>{
  const bundle={format:"radio-mail-manager-backup",version:APP_VERSION,exportedAt:new Date().toISOString(),data:{
    mails,memos:memoItems,programSettings,programOrder,sortModes,appSettings,
    theme:localStorage.getItem(THEME_KEY)||"green",selectedView,autosave:autosaveState()
  }};
  downloadBlob("radio-mail-manager-complete-"+new Date().toISOString().slice(0,10)+".json",new Blob([JSON.stringify(bundle,null,2)],{type:"application/json"}));
  toast("完全バックアップを書き出しました");
};
$("restoreInput").onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const raw=JSON.parse(await f.text());
    if(Array.isArray(raw)){
      if(!confirm(`${raw.length}件のメールデータに置き換えます。よろしいですか？`))return;
      mails=raw;
    }else if(raw?.format==="radio-mail-manager-backup"&&raw.data){
      if(!confirm("メール・メモ・番組設定・表示設定などをバックアップ内容に置き換えます。よろしいですか？"))return;
      const d=raw.data;
      mails=Array.isArray(d.mails)?d.mails:[];
      memoItems=Array.isArray(d.memos)?d.memos:[];
      programSettings=d.programSettings||{};programOrder=Array.isArray(d.programOrder)?d.programOrder:[];
      sortModes=d.sortModes||{};appSettings={...appSettings,...(d.appSettings||{})};
      appSettings.showFields={program:true,episode:true,airDate:true,name:true,corner:true,summary:true,url:true,memo:true,...(appSettings.showFields||{})};
      selectedView=d.selectedView||"__memo__";
      localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));localStorage.setItem(PROGRAM_SETTINGS_KEY,JSON.stringify(programSettings));
      localStorage.setItem(PROGRAM_ORDER_KEY,JSON.stringify(programOrder));localStorage.setItem(SORT_MODES_KEY,JSON.stringify(sortModes));
      localStorage.setItem(APP_SETTINGS_KEY,JSON.stringify(appSettings));localStorage.setItem("radioMailManager.selectedView",selectedView);
      if(d.autosave)localStorage.setItem(AUTOSAVE_KEY,JSON.stringify(d.autosave));if(d.theme)applyTheme(d.theme);applyDisplaySettings();
    }else throw new Error("format");
    mails=mails.map(x=>({...x,id:x.id||uid(),program:x.program||"不明",episode:(x.episode||"").trim()||"不明",favorite:!!x.favorite,status:x.status||"sent"}));
    localStorage.setItem(KEY,JSON.stringify(mails));render();toast("復元しました");
  }catch(err){alert("復元できるバックアップJSONではありません。");}
  finally{e.target.value="";}
};

// CSV import for the app's own export and common Japanese headers.
function parseCSV(text){
  text=text.replace(/^\uFEFF/,"");const rows=[];let row=[],field="",quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(quoted){if(c==='"'&&n==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}else{if(c==='"')quoted=true;else if(c===','){row.push(field);field="";}else if(c==='\n'){row.push(field.replace(/\r$/,""));rows.push(row);row=[];field="";}else field+=c;}}
  if(field.length||row.length){row.push(field.replace(/\r$/,""));rows.push(row);}return rows;
}
$("csvImportBtn").onclick=()=>{$("moreMenu").hidden=true;$("csvImportInput").click();};
$("csvImportInput").onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const rows=parseCSV(await f.text());if(rows.length<2)throw 0;const head=rows[0].map(x=>x.trim());
    const ix=(...names)=>head.findIndex(h=>names.includes(h));
    const map={status:ix("状態","status"),favorite:ix("お気に入り","favorite"),program:ix("番組","番組名","program"),episode:ix("放送回","episode"),airDate:ix("放送日","airDate"),name:ix("ラジオネーム","RN","name"),corner:ix("コーナー","corner"),body:ix("メール本文","本文","body"),summary:ix("要約","summary"),url:ix("URL","Podcast URL","url"),memo:ix("メモ","memo")};
    if(map.body<0)throw 0;const now=new Date().toISOString();
    const imported=rows.slice(1).filter(r=>r.some(Boolean)).map(r=>{const v=k=>map[k]>=0?(r[map[k]]||"").trim():"";const st=v("status");return {id:uid(),program:v("program")||"不明",episode:v("episode")||"不明",airDate:v("airDate"),name:v("name"),corner:v("corner"),body:v("body"),summary:v("summary")||v("body").slice(0,40),url:v("url"),memo:v("memo"),favorite:/★|1|true|yes/i.test(v("favorite")),status:/採用|adopt/i.test(st)?"adopted":"sent",sentAt:now,createdAt:now,addedAt:now};});
    if(!confirm(`${imported.length}件を現在のデータに追加します。よろしいですか？`))return;
    mails.push(...imported);localStorage.setItem(KEY,JSON.stringify(mails));render();toast(`${imported.length}件を読み込みました`);
  }catch{alert("CSVを読み込めませんでした。本文列を含むCSVを使用してください。");}
  finally{e.target.value="";}
};

// Program settings: destination, default radio name, corners.
refreshProgramSettingsSelect=function(){
  const ps=allPrograms();$("programSettingsSelect").innerHTML=ps.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join("");loadProgramSettingsForm();
};
loadProgramSettingsForm=function(){const p=$("programSettingsSelect").value,s=programSettings[p]||{};$("programFormUrl").value=s.formUrl||"";$("programEmail").value=s.email||"";$("programDefaultName").value=s.defaultName||"";$("programCorners").value=programCorners(p).join("\n");};
$("programSettingsSelect").onchange=loadProgramSettingsForm;
$("saveProgramSettingsBtn").onclick=()=>{const p=$("programSettingsSelect").value;if(!p)return;programSettings[p]={...(programSettings[p]||{}),formUrl:$("programFormUrl").value.trim(),email:$("programEmail").value.trim(),defaultName:$("programDefaultName").value.trim(),corners:$("programCorners").value.split(/\n|,/).map(x=>x.trim()).filter(Boolean)};localStorage.setItem(PROGRAM_SETTINGS_KEY,JSON.stringify(programSettings));fillDatalists();toast("番組設定を保存しました");$("programSettingsDialog").close();};

const originalFillDatalists=fillDatalists;
fillDatalists=function(){
  originalFillDatalists();const p=$("program")?.value||((!String(selectedView).startsWith("__"))?selectedView:"");const corners=[...new Set([...uniqueValues("corner"),...programCorners(p)])];$("cornerList").innerHTML=corners.map(v=>`<option value="${esc(v)}"></option>`).join("");
};
$("program")?.addEventListener("change",()=>{const p=$("program").value.trim();fillDatalists();const s=programSettings[p]||{};if(!$("name").value&&s.defaultName)$("name").value=s.defaultName;});

// Display customization.
loadSettingsForm=function(){
  $("fontSizeSetting").value=appSettings.fontSize||"medium";$("tabSizeSetting").value=appSettings.tabSize||"medium";$("rowSizeSetting").value=appSettings.rowSize||"medium";$("detailDensitySetting").value=appSettings.detailDensity||"compact";
  const f=appSettings.showFields||{};["Program","Episode","AirDate","Name","Corner","Summary","Url","Memo"].forEach(n=>{$("show"+n+"Setting").checked=f[n.charAt(0).toLowerCase()+n.slice(1)]!==false;});
};
$("saveSettingsBtn").onclick=()=>{
  const sf={};[["program","Program"],["episode","Episode"],["airDate","AirDate"],["name","Name"],["corner","Corner"],["summary","Summary"],["url","Url"],["memo","Memo"]].forEach(([k,n])=>sf[k]=$("show"+n+"Setting").checked);
  appSettings={...appSettings,fontSize:$("fontSizeSetting").value,tabSize:$("tabSizeSetting").value,rowSize:$("rowSizeSetting").value,detailDensity:$("detailDensitySetting").value,showFields:sf};
  localStorage.setItem(APP_SETTINGS_KEY,JSON.stringify(appSettings));applyDisplaySettings();$("settingsDialog").close();render();toast("設定を保存しました");
};
$("resetSettingsBtn").onclick=()=>{appSettings={fontSize:"medium",tabSize:"medium",rowSize:"medium",detailDensity:"compact",showFields:{program:true,episode:true,airDate:true,name:true,corner:true,summary:true,url:true,memo:true}};localStorage.setItem(APP_SETTINGS_KEY,JSON.stringify(appSettings));applyDisplaySettings();loadSettingsForm();toast("設定を初期値に戻しました");};

// Labels in mail add/edit.
const originalResetForm=resetForm;
resetForm=function(){originalResetForm();$("mailLabel").value="";$("mailLabelColor").value="yellow";const p=$("program").value.trim();fillDatalists();const st=programSettings[p]||{};if(st.defaultName&&!$("name").value)$("name").value=st.defaultName;};
const originalOpenEditor=openEditor;
openEditor=function(id=null){originalOpenEditor(id);if(id){const x=mails.find(m=>m.id===id);if(x){$("mailLabel").value=x.label||"";$("mailLabelColor").value=x.labelColor||"yellow";}}};
// Autosave: existing items are updated; new forms are kept as recoverable local buffers. Save buttons remain.
const autosaveMail=debounce(()=>{if(!$("editDialog").open)return;const data={program:$("program").value,episode:$("episode").value,airDate:$("airDate").value,name:$("name").value,corner:$("corner").value,body:$("body").value,summary:$("summary").value,url:$("url").value,memo:$("memo").value,label:$("mailLabel").value,labelColor:$("mailLabelColor").value,editingId};if(editingId){const x=mails.find(m=>m.id===editingId);if(x){Object.assign(x,data);delete x.editingId;localStorage.setItem(KEY,JSON.stringify(mails));}}else setAutosavePart("mail",data);},300);
["program","episode","airDate","name","corner","body","summary","url","memo","mailLabel","mailLabelColor"].forEach(id=>$(id)?.addEventListener("input",autosaveMail));
const openEditorV14=openEditor;openEditor=function(id=null){openEditorV14(id);if(!id){const a=autosaveState().mail;if(a&&Object.values(a).some(Boolean)){["program","episode","airDate","name","corner","body","summary","url","memo","label","labelColor"].forEach(k=>{const id2=k==="label"?"mailLabel":k==="labelColor"?"mailLabelColor":k;if($(id2)&&a[k]!=null)$(id2).value=a[k];});}}};

// Memo labels and autosave.
const renderMemosV14Base=renderMemos;
renderMemos=function(){$("memoTimeline").innerHTML=memoItems.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(m=>`<article class="memo-card" data-id="${m.id}"><button class="memo-options-btn" type="button" aria-label="メモのオプション">…</button><div class="memo-text">${esc(m.text)}</div><div class="memo-meta"><span>${formatMemoDate(m.createdAt)}</span><span>${m.text.length}文字</span>${labelChip(m)}</div></article>`).join("");};
const openMemoDialogV14Base=openMemoDialog;
openMemoDialog=function(id=null){openMemoDialogV14Base(id);const m=id?memoItems.find(x=>x.id===id):null;$("memoLabel").value=m?.label||"";$("memoLabelColor").value=m?.labelColor||"yellow";if(!id){const a=autosaveState().memoDetail;if(a){$("memoDialogInput").value=a.text||"";$("memoLabel").value=a.label||"";$("memoLabelColor").value=a.labelColor||"yellow";$("memoDialogCount").textContent=`${$("memoDialogInput").value.length} / 500`;}}};
$("memoSaveBtn").onclick=()=>{const text=$("memoDialogInput").value.trim();if(!text)return;if(currentMemoId){const m=memoItems.find(x=>x.id===currentMemoId);if(m){m.text=text;m.label=$("memoLabel").value.trim();m.labelColor=$("memoLabelColor").value;}}else memoItems.push({id:uid(),text,label:$("memoLabel").value.trim(),labelColor:$("memoLabelColor").value,createdAt:new Date().toISOString()});localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));setAutosavePart("memoDetail",null);$("memoDialog").close();renderMemos();};
const autosaveMemoDetail=debounce(()=>{if(!$("memoDialog").open)return;const val={text:$("memoDialogInput").value,label:$("memoLabel").value,labelColor:$("memoLabelColor").value,id:currentMemoId};if(currentMemoId){const m=memoItems.find(x=>x.id===currentMemoId);if(m){m.text=val.text;m.label=val.label;m.labelColor=val.labelColor;localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));}}else setAutosavePart("memoDetail",val);},300);
["memoDialogInput","memoLabel","memoLabelColor"].forEach(id=>$(id)?.addEventListener("input",autosaveMemoDetail));

// Quick composer labels + autosave.
const openMemoComposerV14Base=openMemoComposer,openDraftComposerV14Base=openDraftComposer;
openMemoComposer=function(id=null){openMemoComposerV14Base(id);const m=id?memoItems.find(x=>x.id===id):null;$("composerLabel").value=m?.label||"";$("composerLabelColor").value=m?.labelColor||"yellow";if(!id){const a=autosaveState().memoComposer;if(a){$("composerText").value=a.text||"";$("composerLabel").value=a.label||"";$("composerLabelColor").value=a.labelColor||"yellow";$("composerCount").textContent=`${$("composerText").value.length} / 1000`;}}};
openDraftComposer=function(id=null){openDraftComposerV14Base(id);const d=id?mails.find(x=>x.id===id):null;$("composerLabel").value=d?.label||"";$("composerLabelColor").value=d?.labelColor||"yellow";if(!id){const a=autosaveState().draftComposer;if(a){$("draftName").value=a.name||"";$("draftCorner").value=a.corner||"";$("composerText").value=a.text||"";$("composerLabel").value=a.label||"";$("composerLabelColor").value=a.labelColor||"yellow";$("composerTopCount").textContent=`${$("composerText").value.length}文字`;}}};
const autosaveComposer=debounce(()=>{if(!$("quickComposerDialog").open)return;const data={text:$("composerText").value,name:$("draftName").value,corner:$("draftCorner").value,label:$("composerLabel").value,labelColor:$("composerLabelColor").value};if(composerEditId){if(composerMode==="memo"){const m=memoItems.find(x=>x.id===composerEditId);if(m){m.text=data.text;m.label=data.label;m.labelColor=data.labelColor;localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));}}else{const d=mails.find(x=>x.id===composerEditId);if(d){d.name=data.name;d.corner=data.corner;d.body=data.text;d.summary=data.text.slice(0,40);d.label=data.label;d.labelColor=data.labelColor;localStorage.setItem(KEY,JSON.stringify(mails));}}}else setAutosavePart(composerMode==="memo"?"memoComposer":"draftComposer",data);},300);
["composerText","draftName","draftCorner","composerLabel","composerLabelColor"].forEach(id=>$(id)?.addEventListener("input",autosaveComposer));
$("composerSaveBtn").onclick=()=>{const text=$("composerText").value.trim();if(!text)return;if(composerMode==="memo"){if(composerEditId){const m=memoItems.find(x=>x.id===composerEditId);if(m){m.text=text;m.label=$("composerLabel").value.trim();m.labelColor=$("composerLabelColor").value;}}else memoItems.push({id:uid(),text,label:$("composerLabel").value.trim(),labelColor:$("composerLabelColor").value,createdAt:new Date().toISOString()});localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));setAutosavePart("memoComposer",null);renderMemos();}else{if(composerEditId){const d=mails.find(x=>x.id===composerEditId);if(d){d.name=$("draftName").value.trim();d.corner=$("draftCorner").value.trim();d.body=text;d.summary=text.slice(0,40);d.label=$("composerLabel").value.trim();d.labelColor=$("composerLabelColor").value;if(!d.createdAt)d.createdAt=new Date().toISOString();}}else mails.push({id:uid(),program:"不明",episode:"不明",airDate:"",name:$("draftName").value.trim(),corner:$("draftCorner").value.trim(),body:text,summary:text.slice(0,40),url:"",memo:"",label:$("composerLabel").value.trim(),labelColor:$("composerLabelColor").value,favorite:false,status:"draft",sentAt:"",createdAt:new Date().toISOString(),addedAt:""});localStorage.setItem(KEY,JSON.stringify(mails));setAutosavePart("draftComposer",null);renderDrafts();}$("quickComposerDialog").close();};

// Draft list label chips.
renderDrafts=function(){const rows=mails.filter(x=>x.status==="draft").sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));$("draftTimeline").innerHTML=rows.map(x=>`<article class="draft-card" data-id="${x.id}"><button class="draft-options-btn" type="button" aria-label="下書きのオプション">…</button><div class="draft-body">${esc((x.body||"").replace(/\s+/g," ").trim()||"（本文なし）")}</div><div class="draft-meta"><span>${x.createdAt?formatMemoDate(x.createdAt):"日時不明"}</span><span>${(x.body||"").length}文字</span>${labelChip(x)}</div></article>`).join("");};

// Adoption is controlled from the header button. Sent rows are no longer color-coded.
$("adoptHeaderBtn").onclick=()=>{const x=mails.find(m=>m.id===currentDetailId);if(!x||x.status==="draft")return;if(x.status==="adopted"){toast("このメールは採用済みです");return;}x.status="adopted";if(!x.addedAt)x.addedAt=x.sentAt||new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(mails));openDetail(x.id);render();toast("採用にしました。採用・番組タブにも表示されます");};

// Detail display wrapper with field visibility, label, and adoption button.
const openDetailV14Base=openDetail;
openDetail=function(id){openDetailV14Base(id);const x=mails.find(m=>m.id===id);if(!x)return;const isDraft=x.status==="draft";$("adoptHeaderBtn").hidden=isDraft||selectedView!=="__sent__";$("adoptHeaderBtn").classList.toggle("active",x.status==="adopted");$("adoptHeaderBtn").textContent=x.status==="adopted"?"採用済":"採用";
  if(!isDraft){const f=appSettings.showFields||{};const grid=$("detailContent").querySelector(".mail-detail-grid");if(grid){const children=[...grid.children];let pairRows=grid.querySelectorAll(".detail-pair-row");if(f.program===false){children[0]?.remove();children[1]?.remove();}if(pairRows[0]){const labs=pairRows[0].querySelectorAll("label");if(f.episode===false)labs[0]?.remove();if(f.airDate===false)labs[1]?.remove();if(!pairRows[0].querySelector("label"))pairRows[0].remove();}pairRows=grid.querySelectorAll(".detail-pair-row");const nameRow=[...pairRows].find(r=>[...r.querySelectorAll("span")].some(s=>s.textContent==="ラジオネーム"));if(nameRow){const labs=nameRow.querySelectorAll("label");if(f.name===false)labs[0]?.remove();if(f.corner===false)labs[1]?.remove();if(!nameRow.querySelector("label"))nameRow.remove();}}
    if(f.summary===false){[...$("detailContent").querySelectorAll(".detail-body")].find(d=>d.querySelector("strong")?.textContent==="要約")?.remove();}
    if(f.url===false){[...$("detailContent").querySelectorAll(".detail-body")].find(d=>d.querySelector("strong")?.textContent==="Podcast URL")?.remove();}
    if(f.memo===false){[...$("detailContent").querySelectorAll(".detail-body")].find(d=>d.querySelector("strong")?.textContent==="メモ")?.remove();}
  }
  if(x.label){const chip=document.createElement("div");chip.className="detail-label-wrap";chip.innerHTML=labelChip(x);$("detailContent").prepend(chip);}
};

// Cross-search across memo / drafts / sent / adopted.
function renderGlobalSearch(){const q=$("globalSearchInput").value.trim().toLowerCase();if(!q){$("globalSearchResults").innerHTML='<div class="search-empty">キーワードを入力してください</div>';return;}const hits=[];for(const m of memoItems){if([m.text,m.label].join(" ").toLowerCase().includes(q))hits.push({kind:"memo",id:m.id,title:"メモ",text:m.text,label:m});}for(const x of mails){if([x.program,x.episode,x.name,x.corner,x.body,x.summary,x.memo,x.label].join(" ").toLowerCase().includes(q))hits.push({kind:x.status,id:x.id,title:x.status==="draft"?"下書き":x.status==="adopted"?"採用":"送信済",text:x.body||x.summary,label:x});}$("globalSearchResults").innerHTML=hits.slice(0,100).map(h=>`<button class="global-hit" data-kind="${h.kind}" data-id="${h.id}"><span class="global-hit-kind">${h.title}</span><strong>${esc((h.text||"").replace(/\s+/g," ").slice(0,80)||"（本文なし）")}</strong>${labelChip(h.label)}</button>`).join("")||'<div class="search-empty">該当するデータはありません</div>';}
$("globalSearchBtn").onclick=()=>{$("globalSearchInput").value="";renderGlobalSearch();$("globalSearchDialog").showModal();setTimeout(()=>$("globalSearchInput").focus(),50);};$("closeGlobalSearchDialog").onclick=()=>$("globalSearchDialog").close();$("globalSearchInput").oninput=renderGlobalSearch;$("globalSearchResults").onclick=e=>{const b=e.target.closest(".global-hit");if(!b)return;$("globalSearchDialog").close();if(b.dataset.kind==="memo"){selectedView="__memo__";render();openMemoDialog(b.dataset.id);}else{const x=mails.find(m=>m.id===b.dataset.id);selectedView=x?.status==="draft"?"__draft__":x?.status==="adopted"?"__adopted__":"__sent__";localStorage.setItem("radioMailManager.selectedView",selectedView);render();openDetail(b.dataset.id);}};

// Expanded statistics in the existing Record dialog.
buildStats=function(){const sent=mails.filter(x=>x.status==="sent"||x.status==="adopted"),adopted=mails.filter(x=>x.status==="adopted"),drafts=mails.filter(x=>x.status==="draft"),rate=sent.length?Math.round(adopted.length/sent.length*100):0;const now=new Date(),ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;const thisMonth=sent.filter(x=>(x.sentAt||x.addedAt||"").startsWith(ym));const thisYear=sent.filter(x=>(x.sentAt||x.addedAt||"").startsWith(String(now.getFullYear())));const programs=[...new Set(sent.map(x=>x.program).filter(Boolean))].map(p=>{const ps=sent.filter(x=>x.program===p).length,pa=adopted.filter(x=>x.program===p).length;return {name:p,sent:ps,adopted:pa,rate:ps?Math.round(pa/ps*100):0};}).sort((a,b)=>b.sent-a.sent);const corners=[...new Set(sent.map(x=>x.corner).filter(Boolean))].map(c=>({name:c,sent:sent.filter(x=>x.corner===c).length,adopted:adopted.filter(x=>x.corner===c).length})).sort((a,b)=>b.sent-a.sent).slice(0,12);$("statsContent").innerHTML=`<div class="stats-hero"><div><strong>${sent.length}</strong><span>送信</span></div><div><strong>${adopted.length}</strong><span>採用</span></div><div><strong>${rate}%</strong><span>採用率</span></div></div><div class="stats-subgrid"><span>今月 <strong>${thisMonth.length}</strong>通</span><span>今年 <strong>${thisYear.length}</strong>通</span><span>下書き <strong>${drafts.length}</strong></span><span>メモ <strong>${memoItems.length}</strong></span></div><h3>番組別</h3><div class="stats-list">${programs.map(x=>`<div class="stats-row"><strong>${esc(x.name)}</strong><span>${x.sent}送信 / ${x.adopted}採用 / ${x.rate}%</span></div>`).join("")||"—"}</div><h3>コーナー別</h3><div class="stats-list">${corners.map(x=>`<div class="stats-row"><strong>${esc(x.name)}</strong><span>${x.sent}送信 / ${x.adopted}採用</span></div>`).join("")||"—"}</div>`;};

// Update CSV export with label and accurate statuses.
$("csvBtn").onclick=()=>{const cols=["状態","お気に入り","番組","放送回","放送日","ラジオネーム","コーナー","メール本文","要約","URL","メモ","ラベル"];const rows=mails.filter(x=>x.status!=="draft").map(x=>[x.status==="adopted"?"採用":"送信済み",x.favorite?"★":"",x.program,x.episode,x.airDate,x.name,x.corner,x.body,x.summary,x.url,x.memo,x.label]);const csv="\uFEFF"+[cols,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\r\n");downloadBlob("radio-mail-"+new Date().toISOString().slice(0,10)+".csv",new Blob([csv],{type:"text/csv;charset=utf-8"}));toast("CSVを書き出しました");};

// Ensure sent list never gets adoption coloring, and show labels in search via text only.
const renderV14Base=render;
render=function(){renderV14Base();document.querySelectorAll("#mailTable tr").forEach(tr=>tr.classList.remove("adopted-row"));};

["editDialog","memoDialog","quickComposerDialog"].forEach(id=>$(id)?.addEventListener("close",()=>render()));

// Rebind global dialog backdrop-close after new dialogs and render once.
bindBackdropCloseToAllDialogs();
render();


// ===== ver.15 adjustments =====
// Label feature removed from the UI and active behavior.
labelChip=function(){return "";};
function stripLegacyLabels(){
  mails=mails.map(x=>{const {label,labelColor,...rest}=x;return rest;});
  memoItems=memoItems.map(x=>{const {label,labelColor,...rest}=x;return rest;});
  localStorage.setItem(KEY,JSON.stringify(mails));
  localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));
}
stripLegacyLabels();

// Cross-search no longer includes labels.
renderGlobalSearch=function(){
  const q=$("globalSearchInput").value.trim().toLowerCase();
  if(!q){$("globalSearchResults").innerHTML='<div class="search-empty">キーワードを入力してください</div>';return;}
  const hits=[];
  for(const m of memoItems){if(String(m.text||"").toLowerCase().includes(q))hits.push({kind:"memo",id:m.id,title:"メモ",text:m.text});}
  for(const x of mails){
    if([x.program,x.episode,x.name,x.corner,x.body,x.summary,x.memo].join(" ").toLowerCase().includes(q))
      hits.push({kind:x.status,id:x.id,title:x.status==="draft"?"下書き":x.status==="adopted"?"採用":"送信済",text:x.body||x.summary});
  }
  $("globalSearchResults").innerHTML=hits.slice(0,100).map(h=>`<button class="global-hit" data-kind="${h.kind}" data-id="${h.id}"><span class="global-hit-kind">${h.title}</span><strong>${esc((h.text||"").replace(/\s+/g," ").slice(0,80)||"（本文なし）")}</strong></button>`).join("")||'<div class="search-empty">該当するデータはありません</div>';
};

// Adoption can be toggled from every non-draft mail detail.
const openDetailV15Base=openDetail;
openDetail=function(id){
  openDetailV15Base(id);
  const x=mails.find(m=>m.id===id);if(!x)return;
  const isDraft=x.status==="draft";
  $("adoptHeaderBtn").hidden=isDraft;
  if(!isDraft){
    const adopted=x.status==="adopted";
    $("adoptHeaderBtn").classList.toggle("active",adopted);
    $("adoptHeaderBtn").textContent=adopted?"採用済":"採用";
    $("adoptHeaderBtn").title=adopted?"押すと採用を解除します":"押すと採用にします";
  }
};
$("adoptHeaderBtn").onclick=()=>{
  const x=mails.find(m=>m.id===currentDetailId);if(!x||x.status==="draft")return;
  const wasAdopted=x.status==="adopted";
  x.status=wasAdopted?"sent":"adopted";
  if(!x.sentAt)x.sentAt=new Date().toISOString();
  if(!x.addedAt)x.addedAt=x.sentAt||new Date().toISOString();
  localStorage.setItem(KEY,JSON.stringify(mails));
  const disappearing=wasAdopted&&(selectedView==="__adopted__"||!String(selectedView).startsWith("__"));
  render();
  if(disappearing){$("detailDialog").close();toast("採用を解除しました");}
  else{$("detailDialog").close();openDetail(x.id);toast(wasAdopted?"採用を解除しました":"採用にしました");}
};

// Body column always reflects the actual body field.
const renderV15Base=render;
render=function(){
  renderV15Base();
  if(selectedView!=="__memo__"&&selectedView!=="__draft__"){
    const rows=filtered();
    document.querySelectorAll("#mailTable tr[data-id]").forEach((tr,i)=>{
      const x=rows[i];if(!x)return;
      const last=tr.querySelector("td:last-child .fit-text");
      if(last)last.textContent=x.body||"—";
    });
    requestAnimationFrame(fitAllText);
  }
};

// Statistics: choose what kind of record to display.
function statsData(){
  const sent=mails.filter(x=>x.status==="sent"||x.status==="adopted"),adopted=mails.filter(x=>x.status==="adopted"),drafts=mails.filter(x=>x.status==="draft");
  return {sent,adopted,drafts,rate:sent.length?Math.round(adopted.length/sent.length*100):0};
}
function aggregateStats(items,key){
  return [...new Set(items.map(x=>x[key]).filter(Boolean))].map(name=>{
    const sent=items.filter(x=>x[key]===name).length;
    const adopted=mails.filter(x=>x.status==="adopted"&&x[key]===name).length;
    return {name,sent,adopted,rate:sent?Math.round(adopted/sent*100):0};
  }).sort((a,b)=>b.sent-a.sent||b.adopted-a.adopted);
}
buildStats=function(){
  const mode=$("statsMode")?.value||"overview";
  const {sent,adopted,drafts,rate}=statsData();
  const now=new Date(),ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  if(mode==="overview"){
    const thisMonth=sent.filter(x=>(x.sentAt||x.addedAt||"").startsWith(ym));
    const thisYear=sent.filter(x=>(x.sentAt||x.addedAt||"").startsWith(String(now.getFullYear())));
    $("statsContent").innerHTML=`<div class="stats-hero"><div><strong>${sent.length}</strong><span>送信</span></div><div><strong>${adopted.length}</strong><span>採用</span></div><div><strong>${rate}%</strong><span>採用率</span></div></div><div class="stats-subgrid"><span>今月 <strong>${thisMonth.length}</strong>通</span><span>今年 <strong>${thisYear.length}</strong>通</span><span>下書き <strong>${drafts.length}</strong></span><span>メモ <strong>${memoItems.length}</strong></span></div>`;
    return;
  }
  if(mode==="month"){
    const map=new Map();
    for(const x of sent){const d=x.sentAt||x.addedAt||x.createdAt||"";const k=d.slice(0,7)||"日時不明";if(!map.has(k))map.set(k,{sent:0,adopted:0});map.get(k).sent++;if(x.status==="adopted")map.get(k).adopted++;}
    const rows=[...map.entries()].sort((a,b)=>b[0].localeCompare(a[0]));
    $("statsContent").innerHTML=`<div class="stats-list">${rows.map(([k,v])=>`<div class="stats-row"><strong>${esc(k)}</strong><span>${v.sent}送信 / ${v.adopted}採用 / ${v.sent?Math.round(v.adopted/v.sent*100):0}%</span></div>`).join("")||"—"}</div>`;return;
  }
  const key=mode==="program"?"program":mode==="corner"?"corner":"name";
  const rows=aggregateStats(sent,key);
  $("statsContent").innerHTML=`<div class="stats-list">${rows.map(x=>`<div class="stats-row"><strong>${esc(x.name)}</strong><span>${x.sent}送信 / ${x.adopted}採用 / ${x.rate}%</span></div>`).join("")||"—"}</div>`;
};
$("statsMode")?.addEventListener("change",buildStats);
$("statsBtn").onclick=()=>{$("moreMenu").hidden=true;if($("statsMode"))$("statsMode").value="overview";buildStats();$("statsDialog").showModal();};

// Restored older backups may contain legacy label fields; remove them after restore.
const restoreInputV15Base=$("restoreInput").onchange;
$("restoreInput").onchange=async e=>{await restoreInputV15Base(e);stripLegacyLabels();render();};

// CSV export without the removed label feature.
$("csvBtn").onclick=()=>{
  const cols=["状態","お気に入り","番組","放送回","放送日","ラジオネーム","コーナー","メール本文","要約","URL","メモ"];
  const rows=mails.filter(x=>x.status!=="draft").map(x=>[x.status==="adopted"?"採用":"送信済み",x.favorite?"★":"",x.program,x.episode,x.airDate,x.name,x.corner,x.body,x.summary,x.url,x.memo]);
  const csv="\uFEFF"+[cols,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\r\n");
  downloadBlob("radio-mail-"+new Date().toISOString().slice(0,10)+".csv",new Blob([csv],{type:"text/csv;charset=utf-8"}));toast("CSVを書き出しました");
};

render();


// ===== ver.16 adjustments =====
const TRASH_KEY="radioMailManager.trash.v1";
let trashItems=[];
try{trashItems=JSON.parse(localStorage.getItem(TRASH_KEY)||"[]")||[];}catch{trashItems=[];}
function saveTrash(){localStorage.setItem(TRASH_KEY,JSON.stringify(trashItems));}
function moveMailToTrash(id){const x=mails.find(m=>m.id===id);if(!x)return false;trashItems.unshift({trashId:uid(),kind:x.status==="draft"?"draft":"mail",deletedAt:new Date().toISOString(),data:{...x}});mails=mails.filter(m=>m.id!==id);localStorage.setItem(KEY,JSON.stringify(mails));saveTrash();return true;}
function moveMemoToTrash(id){const x=memoItems.find(m=>m.id===id);if(!x)return false;trashItems.unshift({trashId:uid(),kind:"memo",deletedAt:new Date().toISOString(),data:{...x}});memoItems=memoItems.filter(m=>m.id!==id);localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));saveTrash();return true;}
function trashKindLabel(t){return t.kind==="memo"?"メモ":t.kind==="draft"?"下書き":"メール";}
function trashPreview(t){const d=t.data||{};return String(t.kind==="memo"?d.text:(d.body||d.summary||d.program||"（本文なし）")).replace(/\s+/g," ").trim().slice(0,90)||"（本文なし）";}
function renderTrash(){
  $("trashCount").textContent=`${trashItems.length}件`;
  $("emptyTrashBtn").disabled=!trashItems.length;
  $("trashList").innerHTML=trashItems.map(t=>`<article class="trash-item" data-trash-id="${t.trashId}"><div class="trash-item-head"><span>${trashKindLabel(t)}</span><time>${t.deletedAt?new Date(t.deletedAt).toLocaleString("ja-JP"):""}</time></div><div class="trash-preview">${esc(trashPreview(t))}</div><div class="trash-actions"><button type="button" class="secondary trash-restore">復元</button><button type="button" class="danger trash-delete-forever">完全削除</button></div></article>`).join("")||'<div class="search-empty">ゴミ箱は空です</div>';
}
$("trashBtn").onclick=()=>{$("moreMenu").hidden=true;renderTrash();$("trashDialog").showModal();};
$("closeTrashDialog").onclick=()=>$("trashDialog").close();
$("emptyTrashBtn").onclick=()=>{if(!trashItems.length)return;if(confirm("ゴミ箱の中身を完全に削除しますか？この操作は元に戻せません。")){trashItems=[];saveTrash();renderTrash();toast("ゴミ箱を空にしました");}};
$("trashList").onclick=e=>{const item=e.target.closest(".trash-item");if(!item)return;const i=trashItems.findIndex(t=>t.trashId===item.dataset.trashId);if(i<0)return;const t=trashItems[i];if(e.target.closest(".trash-restore")){const d={...(t.data||{})};if(t.kind==="memo"){if(memoItems.some(x=>x.id===d.id))d.id=uid();memoItems.push(d);localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));}else{if(mails.some(x=>x.id===d.id))d.id=uid();mails.push(d);localStorage.setItem(KEY,JSON.stringify(mails));}trashItems.splice(i,1);saveTrash();renderTrash();render();toast("復元しました");}else if(e.target.closest(".trash-delete-forever")){if(confirm("この項目を完全に削除しますか？")){trashItems.splice(i,1);saveTrash();renderTrash();toast("完全に削除しました");}}};

// Existing delete actions now move items to Trash instead of deleting permanently.
$("deleteBtn").onclick=()=>{if(editingId&&confirm("このメールをゴミ箱に移動しますか？")){moveMailToTrash(editingId);$("editDialog").close();render();toast("ゴミ箱に移動しました");}};
$("detailDeleteBtn").onclick=()=>{if(currentDetailId&&confirm("このメールをゴミ箱に移動しますか？")){moveMailToTrash(currentDetailId);$("detailDialog").close();render();toast("ゴミ箱に移動しました");}};
$("memoDeleteBtn").onclick=()=>{if(currentMemoId&&confirm("このメモをゴミ箱に移動しますか？")){moveMemoToTrash(currentMemoId);$("memoDialog").close();renderMemos();toast("ゴミ箱に移動しました");}};
$("deleteMemoMenuBtn").onclick=()=>{const id=memoMenuTargetId;$("memoMenu").hidden=true;if(id&&confirm("このメモをゴミ箱に移動しますか？")){moveMemoToTrash(id);renderMemos();toast("ゴミ箱に移動しました");}};
$("deleteDraftMenuBtn").onclick=()=>{const id=draftMenuTargetId;$("draftMenu").hidden=true;if(id&&confirm("この下書きをゴミ箱に移動しますか？")){moveMailToTrash(id);renderDrafts();toast("ゴミ箱に移動しました");}};

// Complete backups include Trash as of ver.16.
$("backupBtn").onclick=()=>{const bundle={format:"radio-mail-manager-backup",version:APP_VERSION,exportedAt:new Date().toISOString(),data:{mails,memos:memoItems,programSettings,programOrder,sortModes,appSettings,theme:localStorage.getItem(THEME_KEY)||"green",selectedView,autosave:autosaveState(),trash:trashItems}};downloadBlob("radio-mail-manager-complete-"+new Date().toISOString().slice(0,10)+".json",new Blob([JSON.stringify(bundle,null,2)],{type:"application/json"}));toast("完全バックアップを書き出しました");};
const restoreV16Base=$("restoreInput").onchange;
$("restoreInput").onchange=async e=>{let raw=null;const f=e.target.files[0];if(f){try{raw=JSON.parse(await f.text());}catch{}e.target.value="";}if(!raw){alert("復元できるバックアップJSONではありません。");return;}try{if(Array.isArray(raw)){if(!confirm(`${raw.length}件のメールデータに置き換えます。よろしいですか？`))return;mails=raw;}else if(raw?.format==="radio-mail-manager-backup"&&raw.data){if(!confirm("メール・メモ・番組設定・表示設定・ゴミ箱などをバックアップ内容に置き換えます。よろしいですか？"))return;const d=raw.data;mails=Array.isArray(d.mails)?d.mails:[];memoItems=Array.isArray(d.memos)?d.memos:[];programSettings=d.programSettings||{};programOrder=Array.isArray(d.programOrder)?d.programOrder:[];sortModes=d.sortModes||{};appSettings={...appSettings,...(d.appSettings||{})};appSettings.showFields={program:true,episode:true,airDate:true,name:true,corner:true,summary:true,url:true,memo:true,...(appSettings.showFields||{})};selectedView=d.selectedView||"__memo__";trashItems=Array.isArray(d.trash)?d.trash:[];localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));localStorage.setItem(PROGRAM_SETTINGS_KEY,JSON.stringify(programSettings));localStorage.setItem(PROGRAM_ORDER_KEY,JSON.stringify(programOrder));localStorage.setItem(SORT_MODES_KEY,JSON.stringify(sortModes));localStorage.setItem(APP_SETTINGS_KEY,JSON.stringify(appSettings));localStorage.setItem("radioMailManager.selectedView",selectedView);if(d.autosave)localStorage.setItem(AUTOSAVE_KEY,JSON.stringify(d.autosave));if(d.theme)applyTheme(d.theme);saveTrash();applyDisplaySettings();}else throw 0;mails=mails.map(x=>({...x,id:x.id||uid(),program:x.program||"不明",episode:(x.episode||"").trim()||"不明",favorite:!!x.favorite,status:x.status||"sent"}));stripLegacyLabels();localStorage.setItem(KEY,JSON.stringify(mails));render();toast("復元しました");}catch{alert("復元できるバックアップJSONではありません。");}};

// Statistics period filter.
function statsDateValue(x){return x.sentAt||x.addedAt||x.createdAt||"";}
function statsPeriodBounds(){const mode=$("statsPeriod")?.value||"all",now=new Date();let from=null,to=null;if(mode==="year"){from=new Date(now.getFullYear(),0,1);to=new Date(now.getFullYear()+1,0,1);}else if(mode==="fiscal"){const y=now.getMonth()>=3?now.getFullYear():now.getFullYear()-1;from=new Date(y,3,1);to=new Date(y+1,3,1);}else if(mode==="30days"){to=new Date(now);to.setHours(23,59,59,999);from=new Date(now);from.setDate(from.getDate()-29);from.setHours(0,0,0,0);}else if(mode==="custom"){const f=$("statsFrom")?.value,t=$("statsTo")?.value;if(f)from=new Date(f+"T00:00:00");if(t){to=new Date(t+"T00:00:00");to.setDate(to.getDate()+1);}}return {from,to};}
function filterStatsPeriod(items){const {from,to}=statsPeriodBounds();return items.filter(x=>{const s=statsDateValue(x);if(!s)return !from&&!to;const d=new Date(s);return (!from||d>=from)&&(!to||d<to);});}
statsData=function(){const allSent=mails.filter(x=>x.status==="sent"||x.status==="adopted"),sent=filterStatsPeriod(allSent),adopted=sent.filter(x=>x.status==="adopted"),drafts=mails.filter(x=>x.status==="draft");return {sent,adopted,drafts,rate:sent.length?Math.round(adopted.length/sent.length*100):0};};
aggregateStats=function(items,key){return [...new Set(items.map(x=>x[key]).filter(Boolean))].map(name=>{const group=items.filter(x=>x[key]===name),adopted=group.filter(x=>x.status==="adopted").length;return {name,sent:group.length,adopted,rate:group.length?Math.round(adopted/group.length*100):0};}).sort((a,b)=>b.sent-a.sent||b.adopted-a.adopted);};
const buildStatsV16Base=buildStats;
buildStats=function(){buildStatsV16Base();};
$("statsPeriod").addEventListener("change",()=>{$("statsCustomPeriod").hidden=$("statsPeriod").value!=="custom";buildStats();});
["statsFrom","statsTo"].forEach(id=>$(id).addEventListener("change",buildStats));
const statsBtnV16Base=$("statsBtn").onclick;
$("statsBtn").onclick=()=>{$("moreMenu").hidden=true;if($("statsMode"))$("statsMode").value="overview";if($("statsPeriod"))$("statsPeriod").value="all";$("statsCustomPeriod").hidden=true;buildStats();$("statsDialog").showModal();};

// Sent list: adopted mails get only a thin accent line at the right edge of the program-name cell.
const renderV16Base=render;
render=function(){renderV16Base();if(selectedView==="__sent__"){document.querySelectorAll("#mailTable tr[data-id]").forEach(tr=>{const x=mails.find(m=>m.id===tr.dataset.id);const cell=tr.querySelector("td:first-child");if(cell){cell.classList.toggle("sent-program-adopted",x?.status==="adopted");}});} };

bindBackdropCloseToAllDialogs();
render();


// ===== ver.18 adjustments =====
// Draft radio-name/corner fields are intentionally hidden, but the stored values are preserved
// so the ver.16 layout can be restored without losing old draft metadata.

function renderMemosV17(){
  $("memoTimeline").innerHTML=memoItems.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(m=>`<article class="memo-card" data-id="${m.id}"><button class="memo-options-btn" type="button" aria-label="メモのオプション">…</button><div class="memo-text">${esc(m.text)}</div><div class="memo-meta"><span>${formatMemoDate(m.createdAt)}</span><span>${m.text.length}文字${m.favorite?' <span class="list-favorite-star" aria-label="お気に入り">★</span>':''}</span></div></article>`).join("");
}
renderMemos=renderMemosV17;

function renderDraftsV17(){
  const rows=mails.filter(x=>x.status==="draft").sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
  $("draftTimeline").innerHTML=rows.map(x=>`<article class="draft-card" data-id="${x.id}"><button class="draft-options-btn" type="button" aria-label="下書きのオプション">…</button><div class="draft-body">${esc((x.body||"").replace(/\s+/g," ").trim()||"（本文なし）")}</div><div class="draft-meta"><span>${x.createdAt?formatMemoDate(x.createdAt):"日時不明"}</span><span>${(x.body||"").length}文字${x.favorite?' <span class="list-favorite-star" aria-label="お気に入り">★</span>':''}</span></div></article>`).join("");
}
renderDrafts=renderDraftsV17;

const openMemoDialogV17Base=openMemoDialog;
openMemoDialog=function(id=null){
  openMemoDialogV17Base(id);
  const m=id?memoItems.find(x=>x.id===id):null;
  const b=$("memoFavoriteBtn");
  if(b){
    b.hidden=!m;
    b.textContent=m?.favorite?"★":"☆";
    b.classList.toggle("active",!!m?.favorite);
  }
};
$("memoFavoriteBtn").onclick=()=>{
  if(!currentMemoId)return;
  const m=memoItems.find(x=>x.id===currentMemoId);if(!m)return;
  m.favorite=!m.favorite;
  localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));
  $("memoFavoriteBtn").textContent=m.favorite?"★":"☆";
  $("memoFavoriteBtn").classList.toggle("active",m.favorite);
  renderMemos();
  toast(m.favorite?"お気に入りに追加":"お気に入りを解除");
};

// Keep favorites when a new memo is created or existing memo is edited.
// Existing save/autosave handlers already mutate only text and preserve unknown fields.

// Draft composer: metadata fields remain in the DOM/data model for rollback compatibility,
// but are hidden from the user in ver.18.
const openDraftComposerV17Base=openDraftComposer;
openDraftComposer=function(id=null){
  openDraftComposerV17Base(id);
  $("draftFields").hidden=true;
};

// Draft detail: body-only layout, with original name/corner data preserved in storage.
const openDetailV17Base=openDetail;
openDetail=function(id){
  openDetailV17Base(id);
  const x=mails.find(m=>m.id===id);if(!x)return;
  const isDraft=x.status==="draft";
  $("detailDialog").classList.toggle("draft-detail-v17",isDraft);
  if(isDraft){
    $("detailContent").innerHTML=`<div class="draft-detail-body-wrap v17-body-only"><textarea class="draft-detail-body" data-key="body" placeholder="本文">${esc(x.body||"")}</textarea></div>`;
    bindDetailEditors();
    const body=$("detailContent").querySelector(".draft-detail-body");
    body?.addEventListener("input",()=>{$("detailCount").textContent=`${body.value.length}文字`;});
    $("markAdoptedBtn").textContent="送信済に追加";
  }
};

// Ensure normal mail details never inherit the draft-only footer/layout class.
$("detailDialog").addEventListener("close",()=>$("detailDialog").classList.remove("draft-detail-v17"));

// Normalize memo favorite flags without disturbing old backups.
memoItems=memoItems.map(m=>({...m,favorite:!!m.favorite}));
localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));
renderMemos();


// ===== ver.19 adjustments =====
// Mail detail shows a live character count next to the body heading.
const openDetailV19Base=openDetail;
openDetail=function(id){
  openDetailV19Base(id);
  const x=mails.find(m=>m.id===id);if(!x||x.status==="draft")return;
  const section=$("detailContent")?.querySelector(".mail-body-section");
  const heading=section?.querySelector("strong");
  const body=section?.querySelector('[data-key="body"]');
  if(heading){
    heading.innerHTML=`本文 <span class="body-char-count">${String(x.body||"").length}文字</span>`;
    body?.addEventListener("input",()=>{heading.innerHTML=`本文 <span class="body-char-count">${String(body.innerText||"").length}文字</span>`;});
  }
};

// The final list column can show either the full body or the saved summary.
appSettings.listTextSource=appSettings.listTextSource||"body";
const renderV19Base=render;
render=function(){
  renderV19Base();
  if(selectedView!=="__memo__"&&selectedView!=="__draft__"){
    const rows=filtered();
    document.querySelectorAll("#mailTable tr[data-id]").forEach((tr,i)=>{
      const x=rows[i];if(!x)return;
      const last=tr.querySelector("td:last-child .fit-text");
      if(last)last.textContent=(appSettings.listTextSource==="summary"?(x.summary||"—"):(x.body||"—"));
    });
    requestAnimationFrame(fitAllText);
  }
  markMultiSelected();
};

const loadSettingsFormV19Base=loadSettingsForm;
loadSettingsForm=function(){
  loadSettingsFormV19Base();
  if($("listTextSourceSetting"))$("listTextSourceSetting").value=appSettings.listTextSource||"body";
};
$("saveSettingsBtn").onclick=()=>{
  const sf={};[["program","Program"],["episode","Episode"],["airDate","AirDate"],["name","Name"],["corner","Corner"],["summary","Summary"],["url","Url"],["memo","Memo"]].forEach(([k,n])=>sf[k]=$("show"+n+"Setting").checked);
  appSettings={...appSettings,fontSize:$("fontSizeSetting").value,tabSize:$("tabSizeSetting").value,rowSize:$("rowSizeSetting").value,detailDensity:$("detailDensitySetting").value,listTextSource:$("listTextSourceSetting").value||"body",showFields:sf};
  localStorage.setItem(APP_SETTINGS_KEY,JSON.stringify(appSettings));applyDisplaySettings();$("settingsDialog").close();render();toast("設定を保存しました");
};
$("resetSettingsBtn").onclick=()=>{
  appSettings={fontSize:"medium",tabSize:"medium",rowSize:"medium",detailDensity:"compact",listTextSource:"body",showFields:{program:true,episode:true,airDate:true,name:true,corner:true,summary:true,url:true,memo:true}};
  localStorage.setItem(APP_SETTINGS_KEY,JSON.stringify(appSettings));applyDisplaySettings();loadSettingsForm();render();toast("設定を初期値に戻しました");
};

// Program reorder mode is explicitly a drag mode. Disable text selection/callouts and drag immediately.
const enterProgramReorderModeV19Base=enterProgramReorderMode;
enterProgramReorderMode=function(){
  enterProgramReorderModeV19Base();
  document.getSelection?.().removeAllRanges?.();
  toast("番組タブをそのままドラッグして移動できます");
};
$("reorderProgramBtn").onclick=enterProgramReorderMode;

// Long-press multi-selection for every list type.
let multiSelectKind=null;
let multiSelected=new Set();
let multiSuppressClickUntil=0;
function activeMultiKind(){return selectedView==="__memo__"?"memo":selectedView==="__draft__"?"draft":"mail";}
function itemTextForMulti(kind,id){
  if(kind==="memo")return memoItems.find(x=>x.id===id)?.text||"";
  return mails.find(x=>x.id===id)?.body||"";
}
function itemFavoriteForMulti(kind,id){return kind==="memo"?!!memoItems.find(x=>x.id===id)?.favorite:!!mails.find(x=>x.id===id)?.favorite;}
function setItemFavoriteForMulti(kind,id,value){const x=kind==="memo"?memoItems.find(x=>x.id===id):mails.find(x=>x.id===id);if(x)x.favorite=value;}
function selectionElement(id){
  const escId=(globalThis.CSS&&CSS.escape)?CSS.escape(String(id)):String(id).replace(/["\\]/g,"\\$&");
  if(multiSelectKind==="memo")return document.querySelector(`#memoTimeline .memo-card[data-id="${escId}"]`);
  if(multiSelectKind==="draft")return document.querySelector(`#draftTimeline .draft-card[data-id="${escId}"]`);
  return document.querySelector(`#mailTable tr[data-id="${escId}"]`);
}
function markMultiSelected(){
  document.querySelectorAll(".multi-selected").forEach(el=>el.classList.remove("multi-selected"));
  multiSelected.forEach(id=>selectionElement(id)?.classList.add("multi-selected"));
  updateMultiBar();
}
function updateMultiBar(){
  const bar=$("multiSelectBar");if(!bar)return;
  const n=multiSelected.size;bar.hidden=!n;$("multiSelectCount").textContent=`${n}件選択`;
  if(n){const allFav=[...multiSelected].every(id=>itemFavoriteForMulti(multiSelectKind,id));$("multiFavoriteBtn").textContent=allFav?"お気に入り解除":"お気に入り";}
}
function clearMultiSelection(){multiSelected.clear();multiSelectKind=null;document.body.classList.remove("multi-select-mode");markMultiSelected();}
function startMultiSelection(kind,id){
  if(reorderMode)return;
  multiSelectKind=kind;multiSelected.clear();multiSelected.add(id);multiSuppressClickUntil=Date.now()+650;document.body.classList.add("multi-select-mode");document.getSelection?.().removeAllRanges?.();markMultiSelected();
}
function toggleMultiSelection(id){if(multiSelected.has(id))multiSelected.delete(id);else multiSelected.add(id);if(!multiSelected.size){clearMultiSelection();return;}markMultiSelected();}
function bindLongPressSelection(container,selector,kind){
  if(!container||container.dataset.multiBound)return;container.dataset.multiBound="1";
  let timer=null,startX=0,startY=0,targetId=null;
  const cancel=()=>{clearTimeout(timer);timer=null;targetId=null;};
  container.addEventListener("pointerdown",e=>{
    if(e.button!==undefined&&e.button!==0)return;
    const item=e.target.closest(selector);if(!item||e.target.closest("button"))return;
    startX=e.clientX;startY=e.clientY;targetId=item.dataset.id;clearTimeout(timer);
    timer=setTimeout(()=>{if(targetId)startMultiSelection(kind,targetId);timer=null;},520);
  },{passive:true});
  container.addEventListener("pointermove",e=>{if(timer&&Math.hypot(e.clientX-startX,e.clientY-startY)>9)cancel();},{passive:true});
  container.addEventListener("pointerup",cancel,{passive:true});container.addEventListener("pointercancel",cancel,{passive:true});
  container.addEventListener("contextmenu",e=>{if(e.target.closest(selector))e.preventDefault();});
}
bindLongPressSelection($("memoTimeline"),".memo-card","memo");
bindLongPressSelection($("draftTimeline"),".draft-card","draft");
bindLongPressSelection($("mailTable"),"tr[data-id]","mail");

document.addEventListener("click",e=>{
  if(!multiSelected.size)return;
  if(e.target.closest("#multiSelectBar"))return;
  let item=null;
  if(multiSelectKind==="memo")item=e.target.closest("#memoTimeline .memo-card[data-id]");
  else if(multiSelectKind==="draft")item=e.target.closest("#draftTimeline .draft-card[data-id]");
  else item=e.target.closest("#mailTable tr[data-id]");
  if(!item)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(Date.now()<multiSuppressClickUntil)return;
  toggleMultiSelection(item.dataset.id);
},true);

$("multiCancelBtn").onclick=clearMultiSelection;
$("multiCopyBtn").onclick=async()=>{
  const text=[...multiSelected].map(id=>itemTextForMulti(multiSelectKind,id)).filter(Boolean).join("\n\n");
  if(!text)return;
  try{await navigator.clipboard.writeText(text);}catch{const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();}
  toast(`${multiSelected.size}件をコピーしました`);
};
$("multiFavoriteBtn").onclick=()=>{
  const allFav=[...multiSelected].every(id=>itemFavoriteForMulti(multiSelectKind,id));
  [...multiSelected].forEach(id=>setItemFavoriteForMulti(multiSelectKind,id,!allFav));
  if(multiSelectKind==="memo")localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));else localStorage.setItem(KEY,JSON.stringify(mails));
  if(multiSelectKind==="memo")renderMemos();else if(multiSelectKind==="draft")renderDrafts();else render();
  toast(allFav?"お気に入りを解除しました":"お気に入りに追加しました");clearMultiSelection();
};
$("multiDeleteBtn").onclick=()=>{
  const ids=[...multiSelected];if(!ids.length)return;
  if(!confirm(`${ids.length}件をゴミ箱に移動しますか？`))return;
  if(multiSelectKind==="memo")ids.forEach(moveMemoToTrash);else ids.forEach(moveMailToTrash);
  clearMultiSelection();render();toast(`${ids.length}件をゴミ箱に移動しました`);
};

// Leaving the tab cancels selection, keeping list actions local to the active tab.
const renderProgramTabsV19Base=renderProgramTabs;
renderProgramTabs=function(){
  const old=selectedView;renderProgramTabsV19Base();
  document.querySelectorAll(".program-tab[data-view]").forEach(btn=>btn.addEventListener("click",()=>{if(multiSelected.size&&btn.dataset.view!==old)clearMultiSelection();},{capture:true}));
};

render();


// ===== ver.20 adjustments =====
// 2) Long-press + gives a lightweight global creation menu.
(function(){
  const fab=$("fabAddBtn"), menu=$("quickAddMenu");
  let timer=null, longPressed=false, sx=0, sy=0;
  function closeQuickAdd(){menu.hidden=true;}
  fab.addEventListener("pointerdown",e=>{
    if(e.button!==undefined&&e.button!==0)return;
    longPressed=false;sx=e.clientX;sy=e.clientY;clearTimeout(timer);
    timer=setTimeout(()=>{longPressed=true;menu.hidden=false;document.getSelection?.().removeAllRanges?.();},480);
  });
  fab.addEventListener("pointermove",e=>{if(timer&&Math.hypot(e.clientX-sx,e.clientY-sy)>10){clearTimeout(timer);timer=null;}},{passive:true});
  ["pointerup","pointercancel"].forEach(ev=>fab.addEventListener(ev,()=>{clearTimeout(timer);timer=null;},{passive:true}));
  const oldFabClick=fab.onclick;
  fab.onclick=e=>{if(longPressed){longPressed=false;e.preventDefault();return;}closeQuickAdd();oldFabClick?.call(fab,e);};
  menu.querySelectorAll("[data-quick-add]").forEach(b=>b.onclick=()=>{
    const kind=b.dataset.quickAdd;closeQuickAdd();
    if(kind==="memo")openMemoComposer();
    else if(kind==="draft")openDraftComposer();
    else openEditor();
  });
  document.addEventListener("click",e=>{if(!menu.hidden&&!menu.contains(e.target)&&e.target!==fab)closeQuickAdd();});
})();

// 6) Move through the currently visible mail list without returning to the list.
function detailNavigationRows(){
  if(selectedView==="__memo__"||selectedView==="__draft__")return [];
  return filtered();
}
function updateDetailNavigation(){
  const x=mails.find(m=>m.id===currentDetailId), prev=$("detailPrevBtn"), next=$("detailNextBtn");
  if(!x||x.status==="draft"){prev.hidden=true;next.hidden=true;return;}
  const rows=detailNavigationRows(), i=rows.findIndex(r=>r.id===currentDetailId);
  prev.hidden=false;next.hidden=false;prev.disabled=i<=0;next.disabled=i<0||i>=rows.length-1;
}
const openDetailV20Base=openDetail;
openDetail=function(id){openDetailV20Base(id);updateDetailNavigation();};
$("detailPrevBtn").onclick=()=>{const rows=detailNavigationRows(),i=rows.findIndex(r=>r.id===currentDetailId);if(i>0)openDetail(rows[i-1].id);};
$("detailNextBtn").onclick=()=>{const rows=detailNavigationRows(),i=rows.findIndex(r=>r.id===currentDetailId);if(i>=0&&i<rows.length-1)openDetail(rows[i+1].id);};

// 7) Mail multi-selection can toggle adoption in bulk.
const updateMultiBarV20Base=updateMultiBar;
updateMultiBar=function(){
  updateMultiBarV20Base();
  const b=$("multiAdoptBtn");if(!b)return;
  b.hidden=!multiSelected.size||multiSelectKind!=="mail";
  if(!b.hidden){
    const allAdopted=[...multiSelected].every(id=>mails.find(x=>x.id===id)?.status==="adopted");
    b.textContent=allAdopted?"採用解除":"採用";
  }
};
$("multiAdoptBtn").onclick=()=>{
  if(multiSelectKind!=="mail"||!multiSelected.size)return;
  const targets=[...multiSelected].map(id=>mails.find(x=>x.id===id)).filter(x=>x&&x.status!=="draft");
  const allAdopted=targets.length&&targets.every(x=>x.status==="adopted"), now=new Date().toISOString();
  targets.forEach(x=>{
    if(allAdopted){x.status="sent";x.adoptedAt="";}
    else{
      x.status="adopted";
      if(!x.sentAt)x.sentAt=now;
      if(!x.addedAt)x.addedAt=x.sentAt;
      if(!x.adoptedAt)x.adoptedAt=now;
    }
    x.bodyLength=String(x.body||"").length;
  });
  localStorage.setItem(KEY,JSON.stringify(mails));
  clearMultiSelection();render();toast(allAdopted?"採用を解除しました":`${targets.length}件を採用にしました`);
};

// 8) Analysis-oriented CSV export.
function csvCell(v){return `"${String(v??"").replace(/"/g,'""')}"`;}
function analysisPeriodBounds(){
  const mode=$("analysisPeriod").value,now=new Date();let from=null,to=null;
  if(mode==="year"){from=new Date(now.getFullYear(),0,1);to=new Date(now.getFullYear()+1,0,1);}
  else if(mode==="30days"){to=new Date(now);to.setHours(23,59,59,999);from=new Date(now);from.setDate(from.getDate()-29);from.setHours(0,0,0,0);}
  else if(mode==="custom"){if($("analysisFrom").value)from=new Date($("analysisFrom").value+"T00:00:00");if($("analysisTo").value){to=new Date($("analysisTo").value+"T00:00:00");to.setDate(to.getDate()+1);}}
  return {from,to};
}
function openAnalysisExport(){
  const programs=[...new Set(mails.filter(x=>x.status!=="draft").map(x=>x.program).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ja"));
  $("analysisProgram").innerHTML='<option value="">すべて</option>'+programs.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join("");
  $("analysisStatus").value="all";$("analysisPeriod").value="all";$("analysisCustomPeriod").hidden=true;
  $("analysisExportDialog").showModal();
}
$("analysisExportBtn").onclick=()=>{$("moreMenu").hidden=true;openAnalysisExport();};
$("closeAnalysisExportDialog").onclick=$("cancelAnalysisExportBtn").onclick=()=>$("analysisExportDialog").close();
$("analysisPeriod").onchange=()=>{$("analysisCustomPeriod").hidden=$("analysisPeriod").value!=="custom";};
$("runAnalysisExportBtn").onclick=()=>{
  const status=$("analysisStatus").value,program=$("analysisProgram").value,{from,to}=analysisPeriodBounds();
  let rows=mails.filter(x=>x.status==="sent"||x.status==="adopted");
  if(status==="adopted")rows=rows.filter(x=>x.status==="adopted");
  if(status==="notAdopted")rows=rows.filter(x=>x.status!=="adopted");
  if(program)rows=rows.filter(x=>x.program===program);
  rows=rows.filter(x=>{const s=x.sentAt||x.addedAt||x.createdAt||"";if(!s)return !from&&!to;const d=new Date(s);return(!from||d>=from)&&(!to||d<to);});
  const head=["番組","投稿日時","採用日時","放送回","放送日","ラジオネーム","コーナー","本文","要約","採用状態","文字数"];
  const lines=[head.map(csvCell).join(",")];
  rows.forEach(x=>lines.push([x.program,x.sentAt||x.addedAt||"",x.adoptedAt||"",x.episode,x.airDate,x.name,x.corner,x.body,x.summary,x.status==="adopted"?"採用":"未採用",String(x.body||"").length].map(csvCell).join(",")));
  const csv="\uFEFF"+lines.join("\r\n");
  downloadBlob("radio-mail-analysis-"+new Date().toISOString().slice(0,10)+".csv",new Blob([csv],{type:"text/csv;charset=utf-8"}));
  $("analysisExportDialog").close();toast(`${rows.length}件を分析用CSVに書き出しました`);
};

// 16) Quietly keep analysis-friendly timestamps and body-length metadata from now on.
mails=mails.map(x=>({...x,bodyLength:String(x.body||"").length,createdAt:x.createdAt||x.addedAt||x.sentAt||""}));
localStorage.setItem(KEY,JSON.stringify(mails));

const commitDetailFieldV20Base=commitDetailField;
commitDetailField=function(el){
  commitDetailFieldV20Base(el);
  const x=mails.find(m=>m.id===currentDetailId);
  if(x&&el?.dataset?.key==="body"){x.bodyLength=String(x.body||"").length;localStorage.setItem(KEY,JSON.stringify(mails));}
};

// Replace adoption toggle so future adoption/undo timestamps are recorded.
$("adoptHeaderBtn").onclick=()=>{
  const x=mails.find(m=>m.id===currentDetailId);if(!x||x.status==="draft")return;
  const wasAdopted=x.status==="adopted",now=new Date().toISOString();
  x.status=wasAdopted?"sent":"adopted";
  if(!x.sentAt)x.sentAt=now;
  if(!x.addedAt)x.addedAt=x.sentAt;
  x.adoptedAt=wasAdopted?"":now;
  x.bodyLength=String(x.body||"").length;
  localStorage.setItem(KEY,JSON.stringify(mails));
  const disappearing=wasAdopted&&(selectedView==="__adopted__"||!String(selectedView).startsWith("__"));
  render();
  if(disappearing){$("detailDialog").close();toast("採用を解除しました");}
  else{$("detailDialog").close();openDetail(x.id);toast(wasAdopted?"採用を解除しました":"採用にしました");}
};

// Draft -> sent paths also record the transition time and current length.
$("sendDraftMenuBtn").onclick=()=>{
  const d=mails.find(x=>x.id===draftMenuTargetId);$("draftMenu").hidden=true;if(!d)return;
  const now=new Date().toISOString();d.status="sent";d.sentAt=now;if(!d.addedAt)d.addedAt=now;d.bodyLength=String(d.body||"").length;
  localStorage.setItem(KEY,JSON.stringify(mails));renderDrafts();toast("送信済みに追加しました");
};

bindBackdropCloseToAllDialogs();
render();

// ver.20: detail draft -> sent also records analysis metadata.
$("markAdoptedBtn").onclick=()=>{
  const x=mails.find(m=>m.id===currentDetailId);if(!x)return;const now=new Date().toISOString();
  if(x.status==="draft"){
    x.status="sent";x.sentAt=now;if(!x.addedAt)x.addedAt=now;x.bodyLength=String(x.body||"").length;
    localStorage.setItem(KEY,JSON.stringify(mails));$("detailDialog").close();render();toast("送信済みに追加しました");
  }else{
    const was=x.status==="adopted";x.status=was?"sent":"adopted";if(!x.sentAt)x.sentAt=now;if(!x.addedAt)x.addedAt=x.sentAt;x.adoptedAt=was?"":now;x.bodyLength=String(x.body||"").length;
    localStorage.setItem(KEY,JSON.stringify(mails));$("detailDialog").close();render();toast(was?"採用を解除しました":"採用にしました");
  }
};


// ===== ver.21 adjustments =====
// Addition button size. ver.20/current size is "small".
appSettings.fabSize=appSettings.fabSize||"small";
function applyFabSize(){
  const size=appSettings.fabSize||"small";
  $("fabAddBtn").dataset.size=size;
}
const applyDisplaySettingsV21Base=applyDisplaySettings;
applyDisplaySettings=function(){applyDisplaySettingsV21Base();applyFabSize();};
const loadSettingsFormV21Base=loadSettingsForm;
loadSettingsForm=function(){loadSettingsFormV21Base();if($("fabSizeSetting"))$("fabSizeSetting").value=appSettings.fabSize||"small";};

const saveSettingsV21Base=$("saveSettingsBtn").onclick;
$("saveSettingsBtn").onclick=()=>{
  const fab=$("fabSizeSetting")?.value||"small";
  // Let the existing v20 handler save all established settings, then add this one.
  saveSettingsV21Base();
  appSettings.fabSize=fab;
  localStorage.setItem(APP_SETTINGS_KEY,JSON.stringify(appSettings));
  applyFabSize();
};
const resetSettingsV21Base=$("resetSettingsBtn").onclick;
$("resetSettingsBtn").onclick=()=>{
  resetSettingsV21Base();
  appSettings.fabSize="small";
  localStorage.setItem(APP_SETTINGS_KEY,JSON.stringify(appSettings));
  applyFabSize();
};

// Larger multi-selection menu, positioned near the most recently selected item.
let multiLastAnchor=null;
function positionMultiSelectBar(anchor){
  const bar=$("multiSelectBar");if(!bar||bar.hidden)return;
  bar.classList.add("multi-select-floating");
  const r=anchor?.getBoundingClientRect?.();
  const w=Math.min(360,window.innerWidth-24);
  let left=r?Math.max(12,Math.min(r.left,window.innerWidth-w-12)):12;
  let top=r?(r.bottom+8):Math.round(window.innerHeight*.55);
  requestAnimationFrame(()=>{
    const h=bar.offsetHeight||150;
    if(top+h>window.innerHeight-12)top=r?Math.max(12,r.top-h-8):Math.max(12,window.innerHeight-h-12);
    bar.style.left=left+"px";bar.style.top=top+"px";
  });
}
const startMultiSelectionV21Base=startMultiSelection;
startMultiSelection=function(kind,id){
  startMultiSelectionV21Base(kind,id);
  multiLastAnchor=selectionElement(id);
  positionMultiSelectBar(multiLastAnchor);
};
const toggleMultiSelectionV21Base=toggleMultiSelection;
toggleMultiSelection=function(id){
  toggleMultiSelectionV21Base(id);
  if(multiSelected.size){
    multiLastAnchor=selectionElement(id);
    positionMultiSelectBar(multiLastAnchor);
  }
};
const clearMultiSelectionV21Base=clearMultiSelection;
clearMultiSelection=function(){
  clearMultiSelectionV21Base();
  multiLastAnchor=null;
  const bar=$("multiSelectBar");bar?.classList.remove("multi-select-floating");if(bar){bar.style.left="";bar.style.top="";}
};
window.addEventListener("resize",()=>{if(multiSelected.size)positionMultiSelectBar(multiLastAnchor);});

// Called by the Android back gesture. Selection is consumed before dialogs/app exit.
window.radioMailHandleBack=function(){
  if(multiSelected?.size){clearMultiSelection();return true;}
  const openDialogs=[...document.querySelectorAll("dialog[open]")];
  if(openDialogs.length){openDialogs[openDialogs.length-1].close();return true;}
  for(const id of ["quickAddMenu","memoMenu","draftMenu","sortMenu","programMenu","moreMenu"]){
    const m=document.getElementById(id);if(m&&!m.hidden){m.hidden=true;return true;}
  }
  return false;
};

applyDisplaySettings();
render();

// ===== ver.22 adjustments =====
function clampFloatingMenu(menu,left,top){
  if(!menu)return;
  menu.style.left=Math.max(8,left)+"px";
  menu.style.top=Math.max(8,top)+"px";
  menu.style.right="auto";
  menu.style.bottom="auto";
  requestAnimationFrame(()=>{
    const r=menu.getBoundingClientRect();
    let x=r.left,y=r.top;
    if(r.right>window.innerWidth-8)x=Math.max(8,window.innerWidth-r.width-8);
    if(r.bottom>window.innerHeight-8)y=Math.max(8,window.innerHeight-r.height-8);
    menu.style.left=x+"px";menu.style.top=y+"px";
  });
}
positionMultiSelectBar=function(anchor){
  const bar=$("multiSelectBar");if(!bar||bar.hidden)return;
  bar.classList.add("multi-select-floating");
  const r=anchor?.getBoundingClientRect?.();
  requestAnimationFrame(()=>{
    const w=bar.offsetWidth||300,h=bar.offsetHeight||130;
    let left=r?(r.left+r.width/2-w/2):(window.innerWidth-w)/2;
    let top=r?(r.bottom+7):(window.innerHeight-h)/2;
    if(top+h>window.innerHeight-8)top=r?(r.top-h-7):(window.innerHeight-h)/2;
    left=Math.max(8,Math.min(left,window.innerWidth-w-8));
    top=Math.max(8,Math.min(top,window.innerHeight-h-8));
    bar.style.left=left+"px";bar.style.top=top+"px";
  });
};

// Re-clamp program-tab option menu immediately after it opens.
document.addEventListener("pointerup",()=>{
  requestAnimationFrame(()=>{
    const m=$("programMenu");
    if(m&&!m.hidden){
      const r=m.getBoundingClientRect();
      clampFloatingMenu(m,r.left,r.top);
    }
  });
},true);

// Native widget can call this after opening the memo composer.
window.radioMailOpenMemoAndKeyboard=function(){
  openMemoComposer();
  setTimeout(()=>{
    const d=$("quickComposerDialog");
    const target=d?.querySelector("textarea,input:not([type=hidden])");
    if(target){target.focus();target.click();}
  },120);
  return true;
};


// ===== ver.23 adjustments =====
// Drafts now keep a last-updated timestamp. Existing drafts inherit createdAt once.
mails=mails.map(x=>x.status==="draft"?{...x,updatedAt:x.updatedAt||x.createdAt||new Date().toISOString()}:x);
localStorage.setItem(KEY,JSON.stringify(mails));

function ver23SearchText(v){return String(v||"").trim().toLowerCase();}
function renderMemosV23(){
  const q=ver23SearchText($("memoSearch")?.value);
  const rows=memoItems.slice().filter(m=>!q||[m.text,m.label].join(" ").toLowerCase().includes(q)).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
  $("memoTimeline").innerHTML=rows.map(m=>`<article class="memo-card" data-id="${m.id}"><button class="memo-options-btn" type="button" aria-label="メモのオプション">…</button><div class="memo-text">${esc(m.text)}</div><div class="memo-meta"><span>${formatMemoDate(m.createdAt)}</span><span>${m.text.length}文字${m.favorite?' <span class="list-favorite-star" aria-label="お気に入り">★</span>':''}</span></div></article>`).join("")||(q?'<div class="special-search-empty">該当するメモはありません</div>':'');
}
function renderDraftsV23(){
  const q=ver23SearchText($("draftSearch")?.value);
  const rows=mails.filter(x=>x.status==="draft"&&(!q||[x.body,x.summary,x.name,x.corner,x.memo].join(" ").toLowerCase().includes(q))).sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0));
  $("draftTimeline").innerHTML=rows.map(x=>`<article class="draft-card" data-id="${x.id}"><button class="draft-options-btn" type="button" aria-label="下書きのオプション">…</button><div class="draft-body">${esc((x.body||"").replace(/\s+/g," ").trim()||"（本文なし）")}</div><div class="draft-meta"><span class="draft-updated-label">更新 ${x.updatedAt?formatMemoDate(x.updatedAt):(x.createdAt?formatMemoDate(x.createdAt):"日時不明")}</span><span>${(x.body||"").length}文字${x.favorite?' <span class="list-favorite-star" aria-label="お気に入り">★</span>':''}</span></div></article>`).join("")||(q?'<div class="special-search-empty">該当する下書きはありません</div>':'');
}
renderMemos=renderMemosV23;
renderDrafts=renderDraftsV23;
const openDetailV23Base=openDetail;
openDetail=function(id){
  openDetailV23Base(id);
  const x=mails.find(m=>m.id===id);
  if(x?.status==="draft"&&$("detailAddedAt")){
    $("detailAddedAt").hidden=false;
    $("detailAddedAt").textContent=`更新 ${formatDetailDate(x.updatedAt||x.createdAt||"")}`;
  }
};
$("memoSearch")?.addEventListener("input",renderMemosV23);
$("draftSearch")?.addEventListener("input",renderDraftsV23);

// Track draft edits from both the quick composer autosave and detail screen.
const commitDetailFieldV23Base=commitDetailField;
commitDetailField=function(el){
  commitDetailFieldV23Base(el);
  const x=mails.find(m=>m.id===currentDetailId);
  if(x?.status==="draft"){x.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(mails));renderDraftsV23();}
};
const draftUpdatedTouch=debounce(()=>{
  if(!$("quickComposerDialog")?.open||composerMode!=="draft"||!composerEditId)return;
  const d=mails.find(x=>x.id===composerEditId);if(!d)return;
  d.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(mails));
},350);
["composerText","draftName","draftCorner"].forEach(id=>$(id)?.addEventListener("input",draftUpdatedTouch));
$("composerSaveBtn")?.addEventListener("click",()=>{
  if(composerMode!=="draft")return;
  const now=new Date().toISOString();
  if(composerEditId){const d=mails.find(x=>x.id===composerEditId);if(d)d.updatedAt=now;}
  else {const newest=mails.filter(x=>x.status==="draft").sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0))[0];if(newest&&!newest.updatedAt)newest.updatedAt=newest.createdAt||now;}
  localStorage.setItem(KEY,JSON.stringify(mails));renderDraftsV23();
});


// Keep updatedAt correct for memo→draft and draft duplication paths.
const copyMemoToDraftV23Base=copyMemoToDraft;
copyMemoToDraft=function(id){
  const before=new Set(mails.map(x=>x.id));
  copyMemoToDraftV23Base(id);
  const d=mails.find(x=>x.status==="draft"&&!before.has(x.id));
  if(d){d.updatedAt=d.createdAt||new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(mails));renderDraftsV23();}
};
$("duplicateDraftMenuBtn").onclick=()=>{
  const d=mails.find(x=>x.id===draftMenuTargetId);$("draftMenu").hidden=true;if(!d)return;
  const now=new Date().toISOString();mails.push({...d,id:uid(),status:"draft",sentAt:"",createdAt:now,updatedAt:now,addedAt:"",adoptedAt:""});
  localStorage.setItem(KEY,JSON.stringify(mails));renderDraftsV23();toast("下書きを複製しました");
};

// Quick corner creation from the mail add/edit screen.
$("quickAddCornerBtn")?.addEventListener("click",()=>{
  const program=$("program").value.trim()||((!String(selectedView).startsWith("__"))?selectedView:"");
  if(!program){toast("先に番組名を入力してください");$("program").focus();return;}
  const name=prompt("新しいコーナー名");
  if(!name||!name.trim())return;
  const corner=name.trim();
  const current=programSettings[program]||{};
  const corners=[...new Set([...(Array.isArray(current.corners)?current.corners:[]),corner])];
  programSettings[program]={...current,corners};
  localStorage.setItem(PROGRAM_SETTINGS_KEY,JSON.stringify(programSettings));
  fillDatalists();
  $("corner").value=corner;
  $("corner").dispatchEvent(new Event("input",{bubbles:true}));
  toast("コーナーを追加しました");
});

// Android exports: always use the native create-document flow. Browser keeps normal downloads.
downloadBlob=async function(name,blob){
  try{
    if(window.AndroidBridge&&typeof window.AndroidBridge.saveTextFile==="function"){
      const text=await blob.text();
      window.AndroidBridge.saveTextFile(name,blob.type||"text/plain",text);
      return;
    }
  }catch(e){console.error("Android export bridge failed",e);}
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};

// Five-generation automatic backups stored on-device.
const AUTO_BACKUP_KEY="radioMailManager.autoBackups.v1";
const AUTO_BACKUP_MAX=5;
function autoBackupState(){try{const x=JSON.parse(localStorage.getItem(AUTO_BACKUP_KEY)||"[]");return Array.isArray(x)?x:[];}catch{return [];}}
function buildCompleteBundle(){return {format:"radio-mail-manager-backup",version:APP_VERSION,exportedAt:new Date().toISOString(),data:{mails,memos:memoItems,programSettings,programOrder,sortModes,appSettings,theme:localStorage.getItem(THEME_KEY)||"green",selectedView,autosave:autosaveState(),trash:typeof trashItems!=="undefined"?trashItems:[]}};}
function saveAutoBackup(reason="auto"){
  const entry={id:uid(),createdAt:new Date().toISOString(),reason,bundle:buildCompleteBundle()};
  let list=autoBackupState();list.unshift(entry);list=list.slice(0,AUTO_BACKUP_MAX);
  try{localStorage.setItem(AUTO_BACKUP_KEY,JSON.stringify(list));}
  catch(e){while(list.length>1){list.pop();try{localStorage.setItem(AUTO_BACKUP_KEY,JSON.stringify(list));break;}catch{}}}
  renderAutoBackupList();return entry;
}
function maybeDailyAutoBackup(){
  const list=autoBackupState();const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const hasToday=list.some(x=>{const d=new Date(x.createdAt);return !Number.isNaN(d.getTime())&&`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`===today;});
  if(!hasToday)saveAutoBackup("daily");
}
function renderAutoBackupList(){
  const list=autoBackupState();
  if($("autoBackupCount"))$("autoBackupCount").textContent=`${list.length} / ${AUTO_BACKUP_MAX}世代`;
  if(!$("autoBackupList"))return;
  $("autoBackupList").innerHTML=list.map((x,i)=>`<div class="auto-backup-item" data-backup-id="${esc(x.id)}"><strong>${new Date(x.createdAt).toLocaleString("ja-JP")}</strong><span>${x.reason==="manual"?"手動作成":"自動作成"}・${x.bundle?.data?.mails?.length||0}メール / ${x.bundle?.data?.memos?.length||0}メモ</span><button type="button" class="secondary auto-backup-restore">復元</button></div>`).join("")||'<div class="special-search-empty">まだ自動バックアップはありません</div>';
}
function restoreFromBundle(raw){
  if(!(raw?.format==="radio-mail-manager-backup"&&raw.data))return false;
  const d=raw.data;
  mails=Array.isArray(d.mails)?d.mails:[];memoItems=Array.isArray(d.memos)?d.memos:[];programSettings=d.programSettings||{};programOrder=Array.isArray(d.programOrder)?d.programOrder:[];sortModes=d.sortModes||{};
  appSettings={...appSettings,...(d.appSettings||{})};appSettings.showFields={program:true,episode:true,airDate:true,name:true,corner:true,summary:true,url:true,memo:true,...(appSettings.showFields||{})};selectedView=d.selectedView||"__memo__";
  if(typeof trashItems!=="undefined")trashItems=Array.isArray(d.trash)?d.trash:[];
  localStorage.setItem(KEY,JSON.stringify(mails));localStorage.setItem(MEMO_KEY,JSON.stringify(memoItems));localStorage.setItem(PROGRAM_SETTINGS_KEY,JSON.stringify(programSettings));localStorage.setItem(PROGRAM_ORDER_KEY,JSON.stringify(programOrder));localStorage.setItem(SORT_MODES_KEY,JSON.stringify(sortModes));localStorage.setItem(APP_SETTINGS_KEY,JSON.stringify(appSettings));localStorage.setItem("radioMailManager.selectedView",selectedView);
  if(d.autosave)localStorage.setItem(AUTOSAVE_KEY,JSON.stringify(d.autosave));if(d.theme)applyTheme(d.theme);if(typeof saveTrash==="function")saveTrash();applyDisplaySettings();render();return true;
}
$("autoBackupBtn")?.addEventListener("click",()=>{$("moreMenu").hidden=true;renderAutoBackupList();$("autoBackupDialog").showModal();});
$("closeAutoBackupDialog")?.addEventListener("click",()=>$("autoBackupDialog").close());
$("createAutoBackupBtn")?.addEventListener("click",()=>{saveAutoBackup("manual");toast("自動バックアップを1世代作成しました");});
$("autoBackupList")?.addEventListener("click",e=>{
  const item=e.target.closest(".auto-backup-item");if(!item||!e.target.closest(".auto-backup-restore"))return;
  const entry=autoBackupState().find(x=>x.id===item.dataset.backupId);if(!entry)return;
  if(!confirm("この世代の内容に復元しますか？現在の状態は復元前に1世代保存します。"))return;
  saveAutoBackup("manual");
  if(restoreFromBundle(entry.bundle)){$("autoBackupDialog").close();toast("自動バックアップから復元しました");}
});

// Create at most one automatic generation per calendar day when the app starts.
setTimeout(maybeDailyAutoBackup,500);
bindBackdropCloseToAllDialogs();
render();
