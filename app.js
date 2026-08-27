// standalone-ready: UI/state are kept local and modular for later Android packaging.
const APP_VERSION="ver.12";
const KEY="radioMailManager.v3";
const MEMO_KEY="radioMailManager.memos.v1";
const THEME_KEY="radioMailManager.theme";
const PROGRAM_SETTINGS_KEY="radioMailManager.programSettings.v1";
const PROGRAM_ORDER_KEY="radioMailManager.programOrder.v1";
const OLD_KEYS=["radioMailManager.v2","radioMailManager.v1"];
let raw=localStorage.getItem(KEY);
if(!raw){for(const k of OLD_KEYS){if(localStorage.getItem(k)){raw=localStorage.getItem(k);break}}}
let mails=raw?JSON.parse(raw):[];
let selectedView="__memo__";
let editingId=null,currentDetailId=null,deferredPrompt=null;
let favoriteOnly=false;
let sortMode="episodeAsc";
let memoItems=JSON.parse(localStorage.getItem(MEMO_KEY)||"[]");
let programSettings=JSON.parse(localStorage.getItem(PROGRAM_SETTINGS_KEY)||"{}");
let programOrder=JSON.parse(localStorage.getItem(PROGRAM_ORDER_KEY)||"[]");
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
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
  const startX=e.clientX,startY=e.clientY,pointerId=e.pointerId;
  const timer=setTimeout(()=>{
    reorderDrag={btn,pointerId};btn.classList.add("dragging");btn.setPointerCapture?.(pointerId);
  },450);
  const cancel=()=>clearTimeout(timer);
  const move=ev=>{
    if(!reorderDrag){if(Math.hypot(ev.clientX-startX,ev.clientY-startY)>8)cancel();return;}
    if(reorderDrag.pointerId!==ev.pointerId)return;
    ev.preventDefault();
    const target=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('.program-tab[data-view]');
    if(!target||target===btn||String(target.dataset.view).startsWith("__"))return;
    const a=programOrder.indexOf(btn.dataset.view),b=programOrder.indexOf(target.dataset.view);
    if(a<0||b<0)return;
    programOrder.splice(a,1);programOrder.splice(b,0,btn.dataset.view);
    localStorage.setItem(PROGRAM_ORDER_KEY,JSON.stringify(programOrder));
    programOrder.forEach(name=>{const el=[...$("programTabs").querySelectorAll('.program-tab[data-view]')].find(x=>x.dataset.view===name);if(el)$("programTabs").appendChild(el);});
  };
  const up=ev=>{
    cancel();
    if(reorderDrag&&reorderDrag.pointerId===ev.pointerId){reorderDrag.btn?.classList.remove("dragging");reorderDrag=null;toast("並び順を保存しました");}
    document.removeEventListener("pointermove",move);document.removeEventListener("pointerup",up);document.removeEventListener("pointercancel",up);
  };
  document.addEventListener("pointermove",move,{passive:false});document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up);
});
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
function sortRows(rows){
  return [...rows].sort((a,b)=>{
    if(sortMode==="episodeDesc")return episodeNum(b.episode)-episodeNum(a.episode);
    if(sortMode==="addedDesc")return mailAddedTime(b)-mailAddedTime(a);
    if(sortMode==="addedAsc")return mailAddedTime(a)-mailAddedTime(b);
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

  const showProgramColumn=selectedView==="__sent__"||selectedView==="__adopted__";
  const table=document.querySelector(".table-wrap table");
  table.classList.toggle("five-col",showProgramColumn);
  table.classList.toggle("four-col",!showProgramColumn);
  table.querySelector("thead tr").innerHTML=showProgramColumn
    ?`<th>番組名</th><th>放送回</th><th>ラジオネーム</th><th>コーナー</th><th>本文</th>`
    :`<th>放送回</th><th>ラジオネーム</th><th>コーナー</th><th>本文</th>`;

  $("mailTable").innerHTML=rows.map(x=>`<tr data-id="${x.id}" class="${selectedView==="__sent__"&&x.status==="adopted"?"adopted-row":""}">
    ${showProgramColumn?`<td><span class="fit-text">${esc(x.program)}</span></td>`:""}
    <td><span class="fit-text">${esc(x.episode)}</span></td>
    <td><span class="fit-text">${esc(x.name)}</span></td>
    <td><span class="fit-text">${esc(x.corner)}</span></td>
    <td><span class="fit-text">${esc(x.summary||"—")}</span></td>
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
$("mailForm").addEventListener("submit",e=>{e.preventDefault();const old=editingId?mails.find(m=>m.id===editingId):null;const status=old?.status||(selectedView==="__draft__"?"draft":selectedView==="__sent__"?"sent":"adopted");const now=new Date().toISOString();const x={id:editingId||uid(),program:$("program").value.trim()||"不明",episode:$("episode").value.trim()||"不明",airDate:$("airDate").value,name:$("name").value.trim(),corner:$("corner").value.trim(),body:$("body").value,summary:$("summary").value.trim(),url:$("url").value.trim(),memo:$("memo").value,favorite:old?.favorite||false,status,sentAt:(status==="sent"&&!old?.sentAt)?now:(old?.sentAt||""),createdAt:old?.createdAt||now,addedAt:old?.addedAt||((status==="sent"||status==="adopted")?now:"")};if(editingId)mails=mails.map(m=>m.id===editingId?x:m);else mails.push(x);save();$("editDialog").close();toast(editingId?"更新しました":"追加しました")});
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
      <div class="detail-body detail-gray editable-block-v1 mail-body-main" data-key="body" contenteditable="true">${esc(x.body||"本文未登録")}</div>
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
  mails.push({id:uid(),program:"不明",episode:"不明",airDate:"",name:"",corner:"",body:m.text,summary:m.text.slice(0,40),url:"",memo:"",favorite:false,status:"draft",sentAt:"",createdAt:new Date().toISOString(),addedAt:""});
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

$("sortBtn").onclick=e=>{
  e.stopPropagation();
  const menu=$("sortMenu"),r=$("sortBtn").getBoundingClientRect();
  menu.style.left=Math.max(8,Math.min(r.right-210,window.innerWidth-218))+"px";
  menu.style.top=Math.min(r.bottom+6,window.innerHeight-250)+"px";
  menu.hidden=!menu.hidden;
  $("sortBtn").setAttribute("aria-expanded",String(!menu.hidden));
};
$("sortMenu").addEventListener("click",e=>{
  const btn=e.target.closest("button[data-sort]");if(!btn)return;
  sortMode=btn.dataset.sort;
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
  $("programWeekday").value=s.weekday||"";
}
$("programSettingsBtn").onclick=()=>{$("moreMenu").hidden=true;refreshProgramSettingsSelect();$("programSettingsDialog").showModal();};
$("programSettingsSelect").addEventListener("change",loadProgramSettingsForm);
$("closeProgramSettingsDialog").onclick=()=>$("programSettingsDialog").close();
$("saveProgramSettingsBtn").onclick=()=>{
  const p=$("programSettingsSelect").value;if(!p)return;
  programSettings[p]={formUrl:$("programFormUrl").value.trim(),email:$("programEmail").value.trim(),weekday:$("programWeekday").value.trim()};
  localStorage.setItem(PROGRAM_SETTINGS_KEY,JSON.stringify(programSettings));
  toast("番組設定を保存しました");$("programSettingsDialog").close();
};
$("openProgramPostBtn").onclick=()=>{
  const p=$("programSettingsSelect").value,s=programSettings[p]||{};
  if(s.formUrl){window.open(s.formUrl,"_blank");return;}
  if(s.email){window.location.href=`mailto:${s.email}`;return;}
  toast("投稿先が未登録です");
};
