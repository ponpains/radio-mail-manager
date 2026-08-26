const KEY="radioMailManager.v3";
const OLD_KEYS=["radioMailManager.v2","radioMailManager.v1"];
let raw=localStorage.getItem(KEY);
if(!raw){for(const k of OLD_KEYS){if(localStorage.getItem(k)){raw=localStorage.getItem(k);break}}}
let mails=raw?JSON.parse(raw):[];
let selectedView=localStorage.getItem("radioMailManager.selectedView")||"けれけれ";
let editingId=null,currentDetailId=null,deferredPrompt=null;
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
mails=mails.map(x=>({id:x.id||uid(),program:x.program||"不明",episode:(x.episode||"").trim()||"不明",airDate:x.airDate||"",name:(x.name==="ガンバレななお"||x.name==="ガンバレな")?"ガンバレないわ":x.name||"",corner:x.corner||"",body:x.body||"",summary:x.summary||x.title||x.body||"",url:x.url||x.podcast||"",memo:x.memo||"",favorite:!!x.favorite,status:x.status||"adopted"}));
localStorage.setItem(KEY,JSON.stringify(mails));
function adoptedPrograms(){return [...new Set(mails.filter(x=>x.status==="adopted").map(x=>x.program).filter(Boolean))]}
function renderProgramTabs(){const ps=adoptedPrograms();$("programTabs").innerHTML=`<button class="program-tab sent-tab ${selectedView==="__sent__"?"active":""}" data-view="__sent__">送信済み</button>`+ps.map(p=>`<button class="program-tab ${p===selectedView?"active":""}" data-view="${esc(p)}">${esc(p)}</button>`).join("");document.querySelectorAll(".program-tab[data-view]").forEach(b=>b.onclick=()=>{selectedView=b.dataset.view;localStorage.setItem("radioMailManager.selectedView",selectedView);render()})}
function currentRows(){if(selectedView==="__sent__")return mails.filter(x=>x.status==="sent"||x.status==="adopted");return mails.filter(x=>x.status==="adopted"&&x.program===selectedView)}
function options(sel,vals,label){const cur=sel.value;sel.innerHTML=`<option value="">${label}：すべて</option>`+vals.map(v=>`<option>${esc(v)}</option>`).join("");sel.value=cur}
function refreshFilters(){const scoped=currentRows();options($("episodeFilter"),[...new Set(scoped.map(x=>x.episode).filter(Boolean))],"放送回");options($("cornerFilter"),[...new Set(scoped.map(x=>x.corner).filter(Boolean))].sort(),"コーナー")}
function filtered(){const q=$("search").value.trim().toLowerCase(),e=$("episodeFilter").value,c=$("cornerFilter").value;return currentRows().filter(x=>{const hay=[x.episode,x.name,x.corner,x.body,x.summary,x.memo].join(" ").toLowerCase();return(!q||hay.includes(q))&&(!e||x.episode===e)&&(!c||x.corner===c)}).sort((a,b)=>episodeNum(a.episode)-episodeNum(b.episode))}
function render(){renderProgramTabs();refreshFilters();const rows=filtered();const adoptedCount=selectedView==="__sent__"?mails.filter(x=>x.status==="adopted").length:rows.length;$("count").textContent=adoptedCount;$("showCount").textContent=rows.length;$("mailTable").innerHTML=rows.map(x=>`<tr data-id="${x.id}" class="${selectedView==="__sent__"&&x.status==="adopted"?"adopted-row":""}"><td><span class="fit-text">${esc(x.episode)}</span></td><td><span class="fit-text">${esc(x.name)}</span></td><td><span class="fit-text">${esc(x.corner)}</span></td><td><span class="fit-text">${esc(x.summary||"—")}</span></td></tr>`).join("");requestAnimationFrame(fitAllText)}
function fitAllText(){document.querySelectorAll(".fit-text").forEach(el=>{el.style.transform="scaleX(1)";el.style.width="100%";const cell=el.parentElement,avail=cell.clientWidth-4,need=el.scrollWidth;if(need>avail&&need>0){const scale=Math.max(.55,avail/need);el.style.transform=`scaleX(${scale})`;el.style.width=`${100/scale}%`}})}
window.addEventListener("resize",()=>requestAnimationFrame(fitAllText));
$("mailTable").addEventListener("click",e=>{const tr=e.target.closest("tr");if(tr)openDetail(tr.dataset.id)});["search","episodeFilter","cornerFilter"].forEach(id=>$(id).addEventListener("input",render));
function uniqueValues(key){return [...new Set(mails.map(x=>x[key]).filter(Boolean))].sort()}
function fillDatalists(){$("programList").innerHTML=uniqueValues("program").map(v=>`<option value="${esc(v)}"></option>`).join("");$("nameList").innerHTML=uniqueValues("name").map(v=>`<option value="${esc(v)}"></option>`).join("");$("cornerList").innerHTML=uniqueValues("corner").map(v=>`<option value="${esc(v)}"></option>`).join("")}
function resetForm(){editingId=null;$("dialogTitle").textContent=selectedView==="__sent__"?"送信済みメールを追加":"採用メールを追加";$("deleteBtn").hidden=true;$("mailForm").reset();fillDatalists();if(selectedView!=="__sent__")$("program").value=selectedView}
function openEditor(id=null){resetForm();editingId=id;if(id){const x=mails.find(m=>m.id===id);$("dialogTitle").textContent="メールを編集";$("deleteBtn").hidden=false;["program","episode","airDate","name","corner","body","summary","url","memo"].forEach(k=>$(k).value=x[k]??"")}$("editDialog").showModal()}
$("addBtn").onclick=()=>openEditor();$("cancelBtn").onclick=()=>$("editDialog").close();$("closeDialog").onclick=()=>$("editDialog").close();
$("deleteBtn").onclick=()=>{if(editingId&&confirm("このメールを削除しますか？")){mails=mails.filter(x=>x.id!==editingId);save();$("editDialog").close();toast("削除しました")}};
$("mailForm").addEventListener("submit",e=>{e.preventDefault();const old=editingId?mails.find(m=>m.id===editingId):null;const status=old?.status||(selectedView==="__sent__"?"sent":"adopted");const x={id:editingId||uid(),program:$("program").value.trim()||"不明",episode:$("episode").value.trim()||"不明",airDate:$("airDate").value,name:$("name").value.trim(),corner:$("corner").value.trim(),body:$("body").value,summary:$("summary").value.trim(),url:$("url").value.trim(),memo:$("memo").value,favorite:old?.favorite||false,status};if(editingId)mails=mails.map(m=>m.id===editingId?x:m);else mails.push(x);save();$("editDialog").close();toast(editingId?"更新しました":"追加しました")});
function openDetail(id){currentDetailId=id;const x=mails.find(m=>m.id===id);if(!x)return;$("detailTitle").textContent=x.summary||x.corner||"メール詳細";$("favoriteBtn").textContent=x.favorite?"★":"☆";$("favoriteBtn").classList.toggle("active",x.favorite);$("markAdoptedBtn").hidden=x.status==="adopted";$("detailContent").innerHTML=`<div class="detail-grid"><div class="k">番組</div><div>${esc(x.program)}</div><div class="k">放送回</div><div>${esc(x.episode||"不明")}</div><div class="k">放送日</div><div>${esc(x.airDate||"—")}</div><div class="k">ラジオネーム</div><div>${esc(x.name||"—")}</div><div class="k">コーナー</div><div>${esc(x.corner||"—")}</div><div class="k">状態</div><div>${x.status==="adopted"?"採用":"送信済み"}</div></div><div class="detail-body">${esc(x.body||"本文未登録")}</div>${x.summary?`<div class="detail-body"><strong>要約</strong><br>${esc(x.summary)}</div>`:""}<div class="detail-body"><strong>Podcast URL</strong><br>${x.url?`<a class="detail-url" href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.url)}</a>`:"未登録"}</div>${x.memo?`<div class="detail-body"><strong>メモ</strong><br>${esc(x.memo)}</div>`:""}`;$("detailDialog").showModal()}
$("favoriteBtn").onclick=()=>{const x=mails.find(m=>m.id===currentDetailId);if(!x)return;x.favorite=!x.favorite;save();$("favoriteBtn").textContent=x.favorite?"★":"☆";$("favoriteBtn").classList.toggle("active",x.favorite);toast(x.favorite?"お気に入りに追加":"お気に入りを解除")};
$("markAdoptedBtn").onclick=()=>{const x=mails.find(m=>m.id===currentDetailId);if(!x)return;x.status="adopted";save();$("detailDialog").close();toast("採用メールに追加しました")};
$("deleteFromDetailBtn").onclick=()=>{const x=mails.find(m=>m.id===currentDetailId);if(!x)return;if(confirm("このメールを削除しますか？")){mails=mails.filter(m=>m.id!==currentDetailId);save();$("detailDialog").close();toast("削除しました")}};
$("closeDetail").onclick=()=>$("detailDialog").close();$("closeDetail2").onclick=()=>$("detailDialog").close();$("editFromDetail").onclick=()=>{$("detailDialog").close();openEditor(currentDetailId)};
$("moreBtn").onclick=e=>{e.stopPropagation();$("moreMenu").hidden=!$("moreMenu").hidden};document.addEventListener("click",e=>{if(!$("moreMenu").contains(e.target)&&e.target!==$("moreBtn"))$("moreMenu").hidden=true});
function downloadBlob(name,blob){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$("backupBtn").onclick=()=>{downloadBlob("radio-mail-backup-"+new Date().toISOString().slice(0,10)+".json",new Blob([JSON.stringify(mails,null,2)],{type:"application/json"}));toast("バックアップを書き出しました")};$("restoreBtn").onclick=()=>$("restoreInput").click();
$("restoreInput").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data))throw 0;if(confirm(`${data.length}件のデータに置き換えます。よろしいですか？`)){mails=data.map(x=>({...x,id:x.id||uid(),episode:(x.episode||"").trim()||"不明",favorite:!!x.favorite,status:x.status||"adopted"}));save();toast("復元しました")}}catch{alert("復元できるJSONではありません。")}e.target.value=""};
$("csvBtn").onclick=()=>{const cols=["状態","お気に入り","番組","放送回","放送日","ラジオネーム","コーナー","メール本文","要約","URL","メモ"];const rows=mails.map(x=>[x.status==="adopted"?"採用":"送信済み",x.favorite?"★":"",x.program,x.episode,x.airDate,x.name,x.corner,x.body,x.summary,x.url,x.memo]);const csv="\uFEFF"+[cols,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\r\n");downloadBlob("radio-mail-"+new Date().toISOString().slice(0,10)+".csv",new Blob([csv],{type:"text/csv;charset=utf-8"}));toast("CSVを書き出しました")};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false});$("installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true};window.addEventListener("appinstalled",()=>$("installBtn").hidden=true);if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));render();

const detailDeleteBtn=document.getElementById("detailDeleteBtn");
if(detailDeleteBtn){
  detailDeleteBtn.onclick=()=>{
    const x=mails.find(m=>m.id===currentDetailId);
    if(!x)return;
    if(confirm("このメールを削除しますか？")){
      mails=mails.filter(m=>m.id!==currentDetailId);
      save();
      document.getElementById("detailDialog").close();
      toast("削除しました");
    }
  };
}
