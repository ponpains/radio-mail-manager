// standalone-ready: UI/state are kept local and modular for later Android packaging.
const APP_VERSION="ver.6";
const KEY="radioMailManager.v3";
const MEMO_KEY="radioMailManager.memos.v1";
const THEME_KEY="radioMailManager.theme";
const OLD_KEYS=["radioMailManager.v2","radioMailManager.v1"];
let raw=localStorage.getItem(KEY);
if(!raw){for(const k of OLD_KEYS){if(localStorage.getItem(k)){raw=localStorage.getItem(k);break}}}
let mails=raw?JSON.parse(raw):[];
let selectedView=localStorage.getItem("radioMailManager.selectedView")||"けれけれ";
let editingId=null,currentDetailId=null,deferredPrompt=null;
let favoriteOnly=false;
let memoItems=JSON.parse(localStorage.getItem(MEMO_KEY)||"[]");
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
mails=mails.map(x=>({id:x.id||uid(),program:x.program||"不明",episode:(x.episode||"").trim()||"不明",airDate:x.airDate||"",name:(x.name==="ガンバレななお"||x.name==="ガンバレな")?"ガンバレないわ":x.name||"",corner:x.corner||"",body:x.body||"",summary:x.summary||x.title||x.body||"",url:x.url||x.podcast||"",memo:x.memo||"",favorite:!!x.favorite,status:x.status||"adopted",sentAt:x.sentAt||""}));
localStorage.setItem(KEY,JSON.stringify(mails));
function adoptedPrograms(){return [...new Set(mails.filter(x=>x.status==="adopted").map(x=>x.program).filter(Boolean))]}
function viewOrder(){return ["__memo__","__draft__","__sent__","__adopted__",...adoptedPrograms()]}
function renderProgramTabs(){
  const ps=adoptedPrograms();
  $("programTabs").innerHTML=`<button class="program-tab memo-tab ${selectedView==="__memo__"?"active":""}" data-view="__memo__">メモ</button>`+`<button class="program-tab draft-tab ${selectedView==="__draft__"?"active":""}" data-view="__draft__">下書き</button>`+
    `<button class="program-tab sent-tab ${selectedView==="__sent__"?"active":""}" data-view="__sent__">全件</button>`+
    `<button class="program-tab adopted-tab ${selectedView==="__adopted__"?"active":""}" data-view="__adopted__">採用</button>`+
    ps.map(p=>`<button class="program-tab ${p===selectedView?"active":""}" data-view="${esc(p)}">${esc(p)}</button>`).join("");
  document.querySelectorAll(".program-tab[data-view]").forEach(b=>b.onclick=()=>{
    selectedView=b.dataset.view;
    localStorage.setItem("radioMailManager.selectedView",selectedView);
    render();
  });
  setTimeout(bindTabLongPress,0);
}

let longPressTimer=null;
let programMenuTarget=null;

function bindTabLongPress(){
  document.querySelectorAll('.program-tab[data-view]').forEach(btn=>{
    const view=btn.dataset.view;
    if(view==="__memo__"||view==="__draft__"||view==="__sent__"||view==="__adopted__")return;

    const start=(ev)=>{
      clearTimeout(longPressTimer);
      longPressTimer=setTimeout(()=>{
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
    if(selectedView===program)selectedView="__adopted__";
    localStorage.setItem("radioMailManager.selectedView",selectedView);
    save();
  }
};

document.addEventListener("click",e=>{
  if(!$("programMenu").hidden && !$("programMenu").contains(e.target)){
    $("programMenu").hidden=true;
  }
});


function currentRows(){
  if(selectedView==="__memo__")return [];
  if(selectedView==="__draft__")return mails.filter(x=>x.status==="draft");
  if(selectedView==="__sent__")return mails.filter(x=>x.status==="sent"||x.status==="adopted");
  if(selectedView==="__adopted__")return mails.filter(x=>x.status==="adopted");
  return mails.filter(x=>x.status==="adopted"&&x.program===selectedView);
}
function options(sel,vals,label){const cur=sel.value;sel.innerHTML=`<option value="">${label}：すべて</option>`+vals.map(v=>`<option>${esc(v)}</option>`).join("");sel.value=cur}
function refreshFilters(){const scoped=currentRows();options($("nameFilter"),[...new Set(scoped.map(x=>x.name).filter(Boolean))].sort(),"ラジオネーム");options($("cornerFilter"),[...new Set(scoped.map(x=>x.corner).filter(Boolean))].sort(),"コーナー")}
function filtered(){
  const q=$("search").value.trim().toLowerCase(),n=$("nameFilter").value,c=$("cornerFilter").value,from=$("fromDateFilter").value,to=$("toDateFilter").value;
  return currentRows().filter(x=>{
    const hay=[x.episode,x.name,x.corner,x.body,x.summary,x.memo].join(" ").toLowerCase();
    const d=x.airDate||"";return(!q||hay.includes(q))&&(!n||x.name===n)&&(!c||x.corner===c)&&(!favoriteOnly||x.favorite)&&(!from||d>=from)&&(!to||d<=to);
  }).sort((a,b)=>episodeNum(a.episode)-episodeNum(b.episode));
}
function render(){
  renderProgramTabs();

  const isMemo=selectedView==="__memo__";
  $("memoView").hidden=!isMemo;
  document.querySelector(".summary").hidden=isMemo;
  document.querySelector(".filters").hidden=isMemo;
  document.querySelector(".table-wrap").hidden=isMemo;
  $("fabAddBtn").hidden=false;

  if(isMemo){
    renderMemos();
    return;
  }

  refreshFilters();
  const rows=filtered();
  const adoptedCount=(selectedView==="__adopted__"||selectedView==="__sent__")?mails.filter(x=>x.status==="adopted").length:(selectedView==="__draft__"?mails.filter(x=>x.status==="draft").length:rows.length);
  $("count").textContent=adoptedCount;
  document.querySelector(".summary div span").textContent=selectedView==="__draft__"?"下書き":"採用";
  $("showCount").textContent=rows.length;
  $("mailTable").innerHTML=rows.map(x=>`<tr data-id="${x.id}" class="${selectedView==="__sent__"&&x.status==="adopted"?"adopted-row":""}">
    <td><span class="fit-text">${esc(x.episode)}</span></td>
    <td><span class="fit-text">${esc(x.name)}</span></td>
    <td><span class="fit-text">${esc(x.corner)}</span></td>
    <td><span class="fit-text">${esc(x.summary||"—")}</span></td>
  </tr>`).join("");
  requestAnimationFrame(fitAllText);
}
function fitAllText(){document.querySelectorAll(".fit-text").forEach(el=>{el.style.transform="scaleX(1)";el.style.width="100%";const cell=el.parentElement,avail=cell.clientWidth-4,need=el.scrollWidth;if(need>avail&&need>0){const scale=Math.max(.55,avail/need);el.style.transform=`scaleX(${scale})`;el.style.width=`${100/scale}%`}})}
window.addEventListener("resize",()=>requestAnimationFrame(fitAllText));
$("mailTable").addEventListener("click",e=>{const tr=e.target.closest("tr");if(tr)openDetail(tr.dataset.id)});["search","nameFilter","cornerFilter","fromDateFilter","toDateFilter"].forEach(id=>$(id).addEventListener("input",render));
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
$("addBtn").onclick=()=>openEditor();$("cancelBtn").onclick=()=>$("editDialog").close();$("closeDialog").onclick=()=>$("editDialog").close();
$("deleteBtn").onclick=()=>{if(editingId&&confirm("このメールを削除しますか？")){mails=mails.filter(x=>x.id!==editingId);save();$("editDialog").close();toast("削除しました")}};
$("mailForm").addEventListener("submit",e=>{e.preventDefault();const old=editingId?mails.find(m=>m.id===editingId):null;const status=old?.status||(selectedView==="__draft__"?"draft":selectedView==="__sent__"?"sent":"adopted");const x={id:editingId||uid(),program:$("program").value.trim()||"不明",episode:$("episode").value.trim()||"不明",airDate:$("airDate").value,name:$("name").value.trim(),corner:$("corner").value.trim(),body:$("body").value,summary:$("summary").value.trim(),url:$("url").value.trim(),memo:$("memo").value,favorite:old?.favorite||false,status,sentAt:(status==="sent"&&!old?.sentAt)?new Date().toISOString():(old?.sentAt||"")};if(editingId)mails=mails.map(m=>m.id===editingId?x:m);else mails.push(x);save();$("editDialog").close();toast(editingId?"更新しました":"追加しました")});
function openDetail(id){
  currentDetailId=id;
  const x=mails.find(m=>m.id===id);
  if(!x)return;

  $("detailTitle").textContent=x.summary||x.corner||"メール詳細";
  $("favoriteBtn").textContent=x.favorite?"★":"☆";
  $("favoriteBtn").classList.toggle("active",x.favorite);
  $("markAdoptedBtn").hidden=x.status==="adopted";

  $("detailContent").innerHTML=`
    <div class="detail-grid">
      <div class="k">番組</div><div class="detail-gray editable-inline" data-key="program" contenteditable="true">${esc(x.program)}</div>
      <div class="k">放送回</div><div class="detail-gray editable-inline" data-key="episode" contenteditable="true">${esc(x.episode||"不明")}</div>
      <div class="k">放送日</div><div class="detail-gray"><input class="detail-date-edit" data-key="airDate" type="date" value="${esc(x.airDate||"")}"></div>
      <div class="k">ラジオネーム</div><div class="detail-gray editable-inline" data-key="name" contenteditable="true">${esc(x.name||"")}</div>
      <div class="k">コーナー</div><div class="detail-gray editable-inline" data-key="corner" contenteditable="true">${esc(x.corner||"")}</div>
      <div class="k">状態</div><div class="status-cell">${x.status==="adopted"?"採用":x.status==="draft"?"下書き":"送信済み"}${x.sentAt?`<span class="sent-at">送信 ${new Date(x.sentAt).toLocaleString("ja-JP")}</span>`:""}</div>
    </div>

    <div class="detail-body detail-gray editable-block-v1" data-key="body" contenteditable="true">${esc(x.body||"本文未登録")}</div>

    ${x.summary?`<div class="detail-body"><strong>要約</strong><br><div class="detail-gray editable-block-v1" data-key="summary" contenteditable="true">${esc(x.summary)}</div></div>`:""}

    <div class="detail-body"><strong>Podcast URL</strong><br><input class="detail-url-v1" data-key="url" value="${esc(x.url||"")}" placeholder="URL未登録"></div>

    ${x.memo?`<div class="detail-body"><strong>メモ</strong><br><div class="detail-gray editable-block-v1" data-key="memo" contenteditable="true">${esc(x.memo)}</div></div>`:""}
    ${x.status==="draft"?`<div class="detail-body status-action-wrap"><button id="sendDraftBtn" class="primary">送信済みにする</button></div>`:""}
  `;

  $("detailContent").querySelectorAll("[data-key]").forEach(el=>{
    const commit=()=>{
      const m=mails.find(mm=>mm.id===currentDetailId);
      if(!m)return;
      const key=el.dataset.key;
      let val=(el.tagName==="INPUT"?el.value:el.innerText).trim();
      if(key==="episode"&&!val)val="不明";
      m[key]=val;
      localStorage.setItem(KEY,JSON.stringify(mails));
      render();
    };
    el.addEventListener("blur",commit);
    if(el.tagName==="INPUT")el.addEventListener("change",commit);
  });

  $("detailDialog").showModal();
  const sendDraftBtn=document.getElementById("sendDraftBtn");
  if(sendDraftBtn){
    sendDraftBtn.onclick=()=>{
      const m=mails.find(mm=>mm.id===currentDetailId);
      if(!m)return;
      m.status="sent";
      if(!m.sentAt)m.sentAt=new Date().toISOString();
      save();
      $("detailDialog").close();
      toast("送信済みにしました");
    };
  }
}
$("favoriteBtn").onclick=()=>{const x=mails.find(m=>m.id===currentDetailId);if(!x)return;x.favorite=!x.favorite;save();$("favoriteBtn").textContent=x.favorite?"★":"☆";$("favoriteBtn").classList.toggle("active",x.favorite);toast(x.favorite?"お気に入りに追加":"お気に入りを解除")};
$("markAdoptedBtn").onclick=()=>{const x=mails.find(m=>m.id===currentDetailId);if(!x)return;x.status="adopted";if(!x.sentAt)x.sentAt=new Date().toISOString();save();$("detailDialog").close();toast("採用メールに追加しました")};
$("closeDetail").onclick=()=>$("detailDialog").close();$("closeDetail2").onclick=()=>$("detailDialog").close();$("moreBtn").onclick=e=>{e.stopPropagation();$("moreMenu").hidden=!$("moreMenu").hidden};document.addEventListener("click",e=>{if(!$("moreMenu").contains(e.target)&&e.target!==$("moreBtn"))$("moreMenu").hidden=true});
function downloadBlob(name,blob){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$("backupBtn").onclick=()=>{downloadBlob("radio-mail-backup-"+new Date().toISOString().slice(0,10)+".json",new Blob([JSON.stringify(mails,null,2)],{type:"application/json"}));toast("バックアップを書き出しました")};$("restoreBtn").onclick=()=>$("restoreInput").click();
$("restoreInput").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data))throw 0;if(confirm(`${data.length}件のデータに置き換えます。よろしいですか？`)){mails=data.map(x=>({...x,id:x.id||uid(),episode:(x.episode||"").trim()||"不明",favorite:!!x.favorite,status:x.status||"adopted",sentAt:x.sentAt||""}));save();toast("復元しました")}}catch{alert("復元できるJSONではありません。")}e.target.value=""};
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
  $("memoDialogDate").textContent=m?formatMemoDate(m.createdAt):"";
  $("memoDeleteBtn").hidden=!m;
  $("memoToDraftBtn").hidden=!m;
  $("memoDialog").showModal();
  setTimeout(()=>$("memoDialogInput").focus(),50);
}
$("memoDialogInput").addEventListener("input",()=>{
  $("memoDialogCount").textContent=`${$("memoDialogInput").value.length} / 500`;
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
$("memoTimeline").addEventListener("click",e=>{
  const card=e.target.closest(".memo-card");
  if(card)openMemoDialog(card.dataset.id);
});

$("fabAddBtn").onclick=()=>{if(selectedView==="__memo__")openMemoDialog();else openEditor();};


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
["detailDialog","editDialog","memoDialog"].forEach(id=>closeDialogOnBackdrop($(id)));



$("memoToDraftBtn").onclick=()=>{
  if(!currentMemoId)return;
  const m=memoItems.find(x=>x.id===currentMemoId);
  if(!m)return;
  mails.push({
    id:uid(),program:"不明",episode:"不明",airDate:"",name:"",corner:"",
    body:m.text,summary:m.text.slice(0,40),url:"",memo:"",
    favorite:false,status:"draft",sentAt:""
  });
  localStorage.setItem(KEY,JSON.stringify(mails));
  selectedView="__draft__";
  localStorage.setItem("radioMailManager.selectedView",selectedView);
  $("memoDialog").close();
  toast("下書きに追加しました");
  render();
};


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

$("filterToggleBtn").onclick=()=>{
  const filters=document.querySelector(".filters");
  const willOpen=filters.classList.contains("collapsed");
  filters.classList.toggle("collapsed");
  $("filterToggleBtn").setAttribute("aria-expanded",String(willOpen));
};
