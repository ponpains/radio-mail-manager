const KEY = "radioMailManager.v2";
let mails = JSON.parse(localStorage.getItem(KEY) || "[]");
let selectedProgram = localStorage.getItem("radioMailManager.selectedProgram") || "けれけれ";
let editingId = null;
let currentDetailId = null;
let deferredPrompt = null;

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const episodeNum = s => { const m = String(s || "").match(/\d+/); return m ? Number(m[0]) : 999999; };

function toast(text) {
  $("toast").textContent = text;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 1800);
}

const sampleRows = [
  ["4回","ななお","ラジオ猫","へばにゃん"],
  ["4回","しゃかかな","ラジオ猫","ラジコ"],
  ["5回","ガンバレななお","リアクション","自分の声が聞けない"],
  ["6回","しゃかかな","リアクション","最初にグーを出す"],
  ["8回","ななお","ふつおた","ラジオ界のドン"],
  ["9回","しゃかかな","リアクション","モータウンビート"],
  ["11回","ガンバレななお","ラジオ猫","やぎにゃん"],
  ["11回","しゃかかな","共食い","かまたろう"],
  ["12回","ななお","リアクション","ラジオの曲SP"],
  ["12回","ガンバレななお","聞いてけれ","笑顔中"],
  ["13回","しゃかかな","ラジオ猫","ディスクニッション"],
  ["13回","ななお","ハガキ","絵描き歌"],
  ["14回","ななお","聞いてけれ","たまご"],
  ["14回","ななお","聞いてけれ","第一子"],
  ["15回","ななお","共食い","肉のたかだ"],
  ["16回","ななお","ふつおた","社会＆文化"],
  ["16回","しゃかかな","リアクション","永田詩央里まさか"],
  ["17回","ななお","リアクション","おたがき"],
  ["17回","ガンバレななお","ラジオ猫","うまとマハンバー"],
  ["17回","しゃかかな","ラジオ猫","しおりん"],
  ["19回","ななお","ふつおた","象拳"],
  ["19回","ななお","ラジオ猫","アーちゃん"],
  ["20回","アンミカの監視下","ラジオネーム","アンミカの監視下"],
  ["21回","ななお","リアクション","出禁宣言"],
  ["22回","しゃかかな","ふつおた","けれけれ流行語大賞"]
];

if (!mails.length) {
  mails = sampleRows.map(([episode, name, corner, summary]) => ({
    id: uid(), program: "けれけれ", episode, airDate: "", name, corner,
    body: "", summary, url: "", memo: ""
  }));
  localStorage.setItem(KEY, JSON.stringify(mails));
}

mails = mails.map(x => ({
  id: x.id || uid(),
  program: x.program || "けれけれ",
  episode: x.episode || "",
  airDate: x.airDate || "",
  name: x.name || "",
  corner: x.corner || "",
  body: x.body || "",
  summary: x.summary || x.title || "",
  url: x.url || x.podcast || "",
  memo: x.memo || ""
}));

function save() {
  localStorage.setItem(KEY, JSON.stringify(mails));
  render();
}

function programs() {
  const vals = [...new Set(mails.map(x => x.program.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ja"));
  if (!vals.length) vals.push("けれけれ");
  if (!vals.includes(selectedProgram)) selectedProgram = vals[0];
  return vals;
}

function renderProgramTabs() {
  const ps = programs();
  $("programTabs").innerHTML = ps.map(p =>
    `<button class="program-tab ${p === selectedProgram ? "active" : ""}" data-program="${esc(p)}">${esc(p)}</button>`
  ).join("");
  document.querySelectorAll(".program-tab").forEach(btn => {
    btn.onclick = () => {
      selectedProgram = btn.dataset.program;
      localStorage.setItem("radioMailManager.selectedProgram", selectedProgram);
      $("search").value = "";
      $("episodeFilter").value = "";
      $("cornerFilter").value = "";
      render();
    };
  });
}

function setOptions(select, values, label) {
  const current = select.value;
  select.innerHTML = `<option value="">${label}：すべて</option>` + values.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
  if (values.includes(current)) select.value = current;
}

function refreshFilters() {
  const scoped = mails.filter(x => x.program === selectedProgram);
  setOptions($("episodeFilter"), [...new Set(scoped.map(x => x.episode).filter(Boolean))].sort((a,b)=>episodeNum(a)-episodeNum(b)), "放送回");
  setOptions($("cornerFilter"), [...new Set(scoped.map(x => x.corner).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ja")), "コーナー");
}

function filtered() {
  const q = $("search").value.trim().toLowerCase();
  const ep = $("episodeFilter").value;
  const corner = $("cornerFilter").value;
  return mails
    .filter(x => x.program === selectedProgram)
    .filter(x => {
      const hay = [x.episode, x.name, x.corner, x.body, x.summary, x.memo].join(" ").toLowerCase();
      return (!q || hay.includes(q)) && (!ep || x.episode === ep) && (!corner || x.corner === corner);
    })
    .sort((a,b) => episodeNum(a.episode) - episodeNum(b.episode));
}

function render() {
  renderProgramTabs();
  refreshFilters();
  const rows = filtered();
  const programTotal = mails.filter(x => x.program === selectedProgram).length;
  $("count").textContent = programTotal;
  $("showCount").textContent = rows.length;
  $("mailTable").innerHTML = rows.map(x => `
    <tr data-id="${x.id}">
      <td>${esc(x.episode)}</td>
      <td>${esc(x.name)}</td>
      <td>${esc(x.corner)}</td>
      <td>${esc(x.summary || "—")}</td>
    </tr>`).join("");
}

$("mailTable").addEventListener("click", e => {
  const tr = e.target.closest("tr");
  if (tr) openDetail(tr.dataset.id);
});
["search","episodeFilter","cornerFilter"].forEach(id => $(id).addEventListener("input", render));

function resetForm() {
  editingId = null;
  $("dialogTitle").textContent = "採用メールを追加";
  $("deleteBtn").hidden = true;
  $("mailForm").reset();
  $("program").value = selectedProgram;
}

function openEditor(id = null) {
  resetForm();
  editingId = id;
  if (id) {
    const x = mails.find(m => m.id === id);
    if (!x) return;
    $("dialogTitle").textContent = "採用メールを編集";
    $("deleteBtn").hidden = false;
    ["program","episode","airDate","name","corner","body","summary","url","memo"].forEach(k => $(k).value = x[k] ?? "");
  }
  $("editDialog").showModal();
}

$("addBtn").onclick = () => openEditor();
$("cancelBtn").onclick = () => $("editDialog").close();
$("closeDialog").onclick = () => $("editDialog").close();
$("deleteBtn").onclick = () => {
  if (editingId && confirm("この採用メールを削除しますか？")) {
    mails = mails.filter(x => x.id !== editingId);
    save();
    $("editDialog").close();
    toast("削除しました");
  }
};

$("mailForm").addEventListener("submit", e => {
  e.preventDefault();
  const program = $("program").value.trim();
  const item = {
    id: editingId || uid(),
    program,
    episode: $("episode").value.trim(),
    airDate: $("airDate").value,
    name: $("name").value.trim(),
    corner: $("corner").value.trim(),
    body: $("body").value,
    summary: $("summary").value.trim(),
    url: $("url").value.trim(),
    memo: $("memo").value
  };
  if (!program) return;
  if (editingId) mails = mails.map(m => m.id === editingId ? item : m);
  else mails.push(item);
  selectedProgram = program;
  localStorage.setItem("radioMailManager.selectedProgram", selectedProgram);
  save();
  $("editDialog").close();
  toast(editingId ? "更新しました" : "追加しました");
});

function openDetail(id) {
  currentDetailId = id;
  const x = mails.find(m => m.id === id);
  if (!x) return;
  $("detailTitle").textContent = x.summary || x.corner || "採用メール";
  $("detailContent").innerHTML = `
    <div class="detail-grid">
      <div class="k">番組</div><div>${esc(x.program)}</div>
      <div class="k">放送回</div><div>${esc(x.episode)}</div>
      <div class="k">放送日</div><div>${esc(x.airDate || "—")}</div>
      <div class="k">ラジオネーム</div><div>${esc(x.name)}</div>
      <div class="k">コーナー</div><div>${esc(x.corner || "—")}</div>
    </div>
    <div class="detail-section"><div class="detail-label">メール本文</div><div class="detail-body">${esc(x.body || "本文未登録")}</div></div>
    ${x.summary ? `<div class="detail-section"><div class="detail-label">要約</div><div class="detail-body">${esc(x.summary)}</div></div>` : ""}
    ${x.url ? `<a class="podcast" href="${esc(x.url)}" target="_blank" rel="noopener">🔗 URLを開く</a>` : ""}
    ${x.memo ? `<div class="detail-section"><div class="detail-label">メモ</div><div class="detail-body">${esc(x.memo)}</div></div>` : ""}
  `;
  $("detailDialog").showModal();
}

$("closeDetail").onclick = () => $("detailDialog").close();
$("closeDetail2").onclick = () => $("detailDialog").close();
$("editFromDetail").onclick = () => { $("detailDialog").close(); openEditor(currentDetailId); };

function downloadBlob(name, blob) {
  const a = document.createElement("a");
  const href = URL.createObjectURL(blob);
  a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

$("backupBtn").onclick = () => {
  downloadBlob(`radio-mail-backup-${new Date().toISOString().slice(0,10)}.json`, new Blob([JSON.stringify(mails,null,2)], {type:"application/json"}));
  toast("バックアップを書き出しました");
};
$("restoreBtn").onclick = () => $("restoreInput").click();
$("restoreInput").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!Array.isArray(data)) throw new Error();
    if (confirm(`${data.length}件のデータに置き換えます。よろしいですか？`)) {
      mails = data.map(x => ({id:x.id||uid(),program:x.program||"けれけれ",episode:x.episode||"",airDate:x.airDate||"",name:x.name||"",corner:x.corner||"",body:x.body||"",summary:x.summary||x.title||"",url:x.url||x.podcast||"",memo:x.memo||""}));
      save(); toast("復元しました");
    }
  } catch { alert("復元できるJSONではありません。"); }
  e.target.value = "";
};
$("csvBtn").onclick = () => {
  const cols = ["番組","放送回","放送日","ラジオネーム","コーナー","メール本文","要約","URL","メモ"];
  const rows = mails.map(x => [x.program,x.episode,x.airDate,x.name,x.corner,x.body,x.summary,x.url,x.memo]);
  const csv = "\uFEFF" + [cols,...rows].map(r => r.map(v => `"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\r\n");
  downloadBlob(`radio-mail-${new Date().toISOString().slice(0,10)}.csv`, new Blob([csv], {type:"text/csv;charset=utf-8"}));
  toast("CSVを書き出しました");
};

window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; $("installBtn").hidden = false; });
$("installBtn").onclick = async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; $("installBtn").hidden = true; };
window.addEventListener("appinstalled", () => $("installBtn").hidden = true);
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(()=>{}));
render();
