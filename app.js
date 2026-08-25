const KEY="radioMailManager.v1";
let mails=JSON.parse(localStorage.getItem(KEY)||"[]");
let editingId=null,currentDetailId=null,deferredPrompt=null;

const $=id=>document.getElementById(id);
const save=()=>{localStorage.setItem(KEY,JSON.stringify(mails));render();};
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1800)}

const sample=[
{episode:"4回",airDate:"",name:"ななお",program:"ラジオ猫",corner:"へばにゃん",order:1,title:"へばにゃん",body:"",podcast:"",memo:""},
{episode:"4回",airDate:"",name:"しゃかかな",program:"ラジオ猫",corner:"ラジコ",order:2,title:"ラジコ",body:"",podcast:"",memo:""},
{episode:"5回",airDate:"",name:"ガンバレななお",program:"リアクション",corner:"自分の声が聞けない",order:1,title:"自分の声が聞けない",body:"",podcast:"",memo:""},
{episode:"6回",airDate:"",name:"しゃかかな",program:"リアクション",corner:"最初にグーを出す",order:1,title:"最初にグーを出す",body:"",podcast:"",memo:""},
{episode:"8回",airDate:"",name:"ななお",program:"ふつおた",corner:"ラジオ界のドン",order:1,title:"ラジオ界のドン",body:"",podcast:"",memo:""},
{episode:"9回",airDate:"",name:"しゃかかな",program:"リアクション",corner:"モータウンビート",order:1,title:"モータウンビート",body:"",podcast:"",memo:""},
{episode:"11回",airDate:"",name:"ガンバレななお",program:"ラジオ猫",corner:"やぎにゃん",order:1,title:"やぎにゃん",body:"",podcast:"",memo:""},
{episode:"11回",airDate:"",name:"しゃかかな",program:"共食い",corner:"かまたろう",order:2,title:"かまたろう",body:"",podcast:"",memo:""},
{episode:"12回",airDate:"",name:"ななお",program:"リアクション",corner:"ラジオの曲SP",order:1,title:"ラジオの曲SP",body:"",podcast:"",memo:""},
{episode:"12回",airDate:"",name:"ガンバレななお",program:"聞いてけれ",corner:"笑顔中",order:2,title:"笑顔中",body:"",podcast:"",memo:""},
{episode:"13回",airDate:"",name:"しゃかかな",program:"ラジオ猫",corner:"ディスクニッション",order:1,title:"ディスクニッション",body:"",podcast:"",memo:""},
{episode:"13回",airDate:"",name:"ななお",program:"ハガキ",corner:"絵描き歌",order:2,title:"絵描き歌",body:"",podcast:"",memo:""},
{episode:"14回",airDate:"",name:"ななお",program:"聞いてけれ",corner:"たまご",order:1,title:"たまご",body:"",podcast:"",memo:""},
{episode:"14回",airDate:"",name:"ななお",program:"聞いてけれ",corner:"第一子",order:2,title:"第一子",body:"",podcast:"",memo:""},
{episode:"15回",airDate:"",name:"ななお",program:"共食い",corner:"肉のたかだ",order:1,title:"肉のたかだ",body:"",podcast:"",memo:""},
{episode:"16回",airDate:"",name:"ななお",program:"ふつおた",corner:"社会＆文化",order:1,title:"社会＆文化",body:"",podcast:"",memo:""},
{episode:"16回",airDate:"",name:"しゃかかな",program:"リアクション",corner:"永田詩央里まさか",order:2,title:"永田詩央里まさか",body:"",podcast:"",memo:""},
{episode:"17回",airDate:"",name:"ななお",program:"リアクション",corner:"おたがき",order:1,title:"おたがき",body:"",podcast:"",memo:""},
{episode:"17回",airDate:"",name:"ガンバレななお",program:"ラジオ猫",corner:"うまとマハンバー",order:2,title:"うまとマハンバー",body:"",podcast:"",memo:""},
{episode:"17回",airDate:"",name:"しゃかかな",program:"ラジオ猫",corner:"しおりん",order:3,title:"しおりん",body:"",podcast:"",memo:""},
{episode:"19回",airDate:"",name:"ななお",program:"ふつおた",corner:"象拳",order:1,title:"象拳",body:"",podcast:"",memo:""},
{episode:"19回",airDate:"",name:"ななお",program:"ラジオ猫",corner:"アーちゃん",order:2,title:"アーちゃん",body:"",podcast:"",memo:""},
{episode:"20回",airDate:"",name:"アンミカの監視下",program:"ラジオネーム",corner:"アンミカの監視下",order:1,title:"アンミカの監視下",body:"",podcast:"",memo:""},
{episode:"21回",airDate:"",name:"ななお",program:"リアクション",corner:"出禁宣言",order:1,title:"出禁宣言",body:"",podcast:"",memo:""},
{episode:"22回",airDate:"",name:"しゃかかな",program:"ふつおた",corner:"けれけれ流行語大賞",order:1,title:"けれけれ流行語大賞",body:"",podcast:"",memo:""}
].map(x=>({...x,id:uid()}));
if(!mails.length){mails=sample;save();}

function options(sel,vals,label){const cur=sel.value;sel.innerHTML=`<option value="">${label}：すべて</option>`+vals.map(v=>`<option>${esc(v)}</option>`).join("");sel.value=cur}
function refreshFilters(){
  options($("programFilter"),[...new Set(mails.map(x=>x.program).filter(Boolean))].sort(),"番組");
  options($("episodeFilter"),[...new Set(mails.map(x=>x.episode).filter(Boolean))],"放送回");
  options($("cornerFilter"),[...new Set(mails.map(x=>x.corner).filter(Boolean))].sort(),"コーナー");
}
function filtered(){
  const q=$("search").value.trim().toLowerCase(),p=$("programFilter").value,e=$("episodeFilter").value,c=$("cornerFilter").value;
  return mails.filter(x=>{
    const hay=[x.episode,x.name,x.program,x.corner,x.title,x.body,x.memo].join(" ").toLowerCase();
    return (!q||hay.includes(q))&&(!p||x.program===p)&&(!e||x.episode===e)&&(!c||x.corner===c);
  }).sort((a,b)=>episodeNum(a.episode)-episodeNum(b.episode)||(a.order||999)-(b.order||999));
}
function episodeNum(s){const m=String(s||"").match(/\d+/);return m?Number(m[0]):999999}
function render(){
  refreshFilters(); const rows=filtered();
  $("count").textContent=mails.length;$("showCount").textContent=rows.length;
  $("mailTable").innerHTML=rows.map(x=>`<tr data-id="${x.id}">
    <td>${esc(x.episode)}</td><td>${esc(x.name)}</td><td>${esc(x.program)}</td><td>${esc(x.corner)}</td><td>${esc(x.title)}</td>
  </tr>`).join("");
}
$("mailTable").addEventListener("click",e=>{const tr=e.target.closest("tr");if(tr)openDetail(tr.dataset.id)});
["search","programFilter","episodeFilter","cornerFilter"].forEach(id=>$(id).addEventListener("input",render));

function resetForm(){editingId=null;$("dialogTitle").textContent="採用メールを追加";$("deleteBtn").hidden=true;$("mailForm").reset();$("order").value=""}
function openEditor(id=null){
  resetForm();editingId=id;
  if(id){const x=mails.find(m=>m.id===id);$("dialogTitle").textContent="採用メールを編集";$("deleteBtn").hidden=false;
    ["episode","airDate","name","program","corner","order","title","body","podcast","memo"].forEach(k=>$(k).value=x[k]??"");
  }
  $("editDialog").showModal();
}
$("addBtn").onclick=()=>openEditor();
$("cancelBtn").onclick=()=>$("editDialog").close();
$("closeDialog").onclick=()=>$("editDialog").close();
$("deleteBtn").onclick=()=>{if(editingId&&confirm("この採用メールを削除しますか？")){mails=mails.filter(x=>x.id!==editingId);save();$("editDialog").close();toast("削除しました")}};

$("mailForm").addEventListener("submit",e=>{
  e.preventDefault();
  const x={id:editingId||uid(),episode:$("episode").value.trim(),airDate:$("airDate").value,name:$("name").value.trim(),program:$("program").value.trim(),corner:$("corner").value.trim(),order:Number($("order").value)||null,title:$("title").value.trim(),body:$("body").value,memo:$("memo").value,podcast:$("podcast").value.trim()};
  if(editingId)mails=mails.map(m=>m.id===editingId?x:m);else mails.push(x);
  save();$("editDialog").close();toast(editingId?"更新しました":"追加しました");
});

function openDetail(id){
  currentDetailId=id;const x=mails.find(m=>m.id===id);if(!x)return;
  $("detailTitle").textContent=x.title||"採用メール";
  $("detailContent").innerHTML=`<div class="detail-grid">
    <div class="k">放送回</div><div>${esc(x.episode)}</div>
    <div class="k">放送日</div><div>${esc(x.airDate||"—")}</div>
    <div class="k">ラジオネーム</div><div>${esc(x.name)}</div>
    <div class="k">番組</div><div>${esc(x.program)}</div>
    <div class="k">コーナー</div><div>${esc(x.corner||"—")}</div>
    <div class="k">採用順</div><div>${x.order?esc(x.order+"通目"):"—"}</div>
  </div>
  <div class="detail-body">${esc(x.body||"本文未登録")}</div>
  ${x.podcast?`<a class="podcast" href="${esc(x.podcast)}" target="_blank" rel="noopener">🎧 Podcastを聴く</a>`:""}
  ${x.memo?`<div class="detail-body"><strong>メモ</strong><br>${esc(x.memo)}</div>`:""}`;
  $("detailDialog").showModal();
}
$("closeDetail").onclick=()=>$("detailDialog").close();
$("closeDetail2").onclick=()=>$("detailDialog").close();
$("editFromDetail").onclick=()=>{$("detailDialog").close();openEditor(currentDetailId)};

function downloadBlob(name,blob){
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
$("backupBtn").onclick=()=>{
  downloadBlob("radio-mail-backup-"+new Date().toISOString().slice(0,10)+".json",new Blob([JSON.stringify(mails,null,2)],{type:"application/json"}));
  toast("バックアップを書き出しました");
};
$("restoreBtn").onclick=()=>$("restoreInput").click();
$("restoreInput").onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{const data=JSON.parse(await f.text());if(!Array.isArray(data))throw 0;
    if(confirm(`${data.length}件のデータに置き換えます。よろしいですか？`)){mails=data.map(x=>({...x,id:x.id||uid()}));save();toast("復元しました")}
  }catch{alert("復元できるJSONではありません。")}
  e.target.value="";
};
$("csvBtn").onclick=()=>{
  const cols=["放送回","放送日","ラジオネーム","番組","コーナー","採用順","タイトル","メール本文","Podcast URL","メモ"];
  const rows=mails.map(x=>[x.episode,x.airDate,x.name,x.program,x.corner,x.order,x.title,x.body,x.podcast,x.memo]);
  const csv="\uFEFF"+[cols,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\r\n");
  downloadBlob("radio-mail-"+new Date().toISOString().slice(0,10)+".csv",new Blob([csv],{type:"text/csv;charset=utf-8"}));
  toast("CSVを書き出しました");
};

window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false});
$("installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true};
window.addEventListener("appinstalled",()=>$("installBtn").hidden=true);

if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
render();
