
// Mind Armor Tester App
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const LS = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch(e){ return d } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) },
  del(k){ localStorage.removeItem(k) }
};

const defaultState = {
  plan: "recruit", // recruit | guild | lifetime
  owned: { confidence: true, speaking: false, urges: false, social: false, bedrock: false },
  renamed: {},
  logs: { confidence: [], urges: [], wins: [] },
  streaks: { confidence: {count:0, last:""}, urges: {count:0, last:""} }
};

let state = Object.assign({}, defaultState, LS.get("mindArmorState", {}));
function save(){ LS.set("mindArmorState", state); updateUI(); }
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.style.display="block"; setTimeout(()=>t.style.display="none", 1800); }

// Navigation
$$("nav button[data-section]").forEach(btn=>{
  btn.addEventListener("click", ()=> showSection(btn.dataset.section));
});
function showSection(id){
  $$(".section").forEach(s => s.classList.remove("active"));
  $("#"+id).classList.add("active");
  $$("nav button[data-section]").forEach(b=>b.classList.toggle("active", b.dataset.section===id));
}

// Install prompt
let deferredPrompt;
const installBtn = $("#installBtn");
window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  installBtn.disabled = false;
});
installBtn.addEventListener("click", async ()=>{
  if(!deferredPrompt){ toast("Install not available yet."); return; }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.disabled = true;
});

// Update UI helpers
function updateUI(){
  // Plan badge
  const planMap = { recruit:"Recruit (Free)", guild:"Hero’s Guild", lifetime:"Master’s Path" };
  $("#planLabel").textContent = planMap[state.plan];
  const badge = $("#planBadge");
  badge.textContent = planMap[state.plan];
  badge.style.display = "inline-block";
  // Owned modules locks
  const mods = ["speaking","urges","social","bedrock"];
  for(const m of mods){
    const card = $("#mod-"+m);
    if(!card) continue;
    const locked = !state.owned[m];
    card.classList.toggle("locked", locked);
    const overlay = card.querySelector(".lock-overlay");
    if(overlay) overlay.style.display = locked ? "flex" : "none";
  }
  // Armor progress
  const total = Object.keys(state.owned).length;
  const have = Object.values(state.owned).filter(Boolean).length;
  $("#armorProgress").style.width = Math.round(have/total*100)+"%";
  // Streaks
  $("#conf-streak").textContent = state.streaks.confidence.count;
  $("#conf-streak-bar").style.width = Math.min(100, state.streaks.confidence.count/30*100)+"%";
  $("#urge-streak").textContent = state.streaks.urges.count;
  $("#urge-streak-bar").style.width = Math.min(100, state.streaks.urges.count/30*100)+"%";
  // Renamed
  $$(".module-name").forEach(span=>{
    const key = span.dataset.key;
    span.textContent = state.renamed[key] || span.textContent;
  });
  // Stealth title
  const stealth = LS.get("mindArmorStealth", false);
  $("#stealth-title").checked = stealth;
  document.title = stealth ? "Daily Focus" : "Mind Armor (Tester)";
  $("#brandName").textContent = stealth ? "Daily Focus" : "Mind Armor";
}
updateUI();

// Unlock modal logic
let pendingUnlockKey = null;
$$("[data-unlock]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    pendingUnlockKey = btn.dataset.unlock;
    $("#unlockModal").style.display = "flex";
  });
});
$("#unlock-close").addEventListener("click", ()=> $("#unlockModal").style.display = "none");
$("#unlock-bundle").addEventListener("click", ()=>{
  state.plan = "guild";
  for(const k of Object.keys(state.owned)) state.owned[k]=true;
  save();
  $("#unlockModal").style.display = "none";
  toast("All modules unlocked (tester bundle).");
});
$("#unlock-single").addEventListener("click", ()=>{
  if(pendingUnlockKey){ state.owned[pendingUnlockKey]=true; save(); toast("Module unlocked (tester single)."); }
  $("#unlockModal").style.display = "none";
});

// Open module
$$("[data-open]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const key = btn.dataset.open;
    if(!state.owned[key] && key!=="confidence"){ toast("Locked. Unlock first."); return; }
    showSection(key);
  });
});

// Tester buttons
$("#testerUnlockAll").addEventListener("click", ()=>{
  for(const k of Object.keys(state.owned)) state.owned[k]=true;
  save();
  toast("Tester: all modules unlocked.");
});
$("#simulatePurchase").addEventListener("click", ()=>{
  state.plan="guild";
  for(const k of Object.keys(state.owned)) state.owned[k]=true;
  save();
  toast("Simulated: Hero’s Guild active.");
});
$("#choose-bundle").addEventListener("click", ()=>{
  state.plan="guild";
  for(const k of Object.keys(state.owned)) state.owned[k]=true;
  save();
  toast("Subscribed (simulated).");
});
$("#choose-lifetime").addEventListener("click", ()=>{
  state.plan="lifetime";
  for(const k of Object.keys(state.owned)) state.owned[k]=true;
  save();
  toast("Lifetime unlock (simulated).");
});

// Stealth toggle
$("#stealth-title").addEventListener("change", (e)=>{
  LS.set("mindArmorStealth", e.target.checked);
  updateUI();
});

// Rename modules
$("#rename-apply").addEventListener("click", ()=>{
  const key = $("#rename-key").value;
  const val = $("#rename-value").value.trim();
  if(!val) return;
  state.renamed[key]=val;
  save();
  toast("Module renamed.");
});

// Notifications
$("#notify").addEventListener("click", async ()=>{
  if(!("Notification" in window)){ toast("Notifications not supported."); return; }
  let perm = Notification.permission;
  if(perm!=="granted"){
    perm = await Notification.requestPermission();
  }
  if(perm!=="granted"){ toast("Notification permission denied."); return; }
  if("serviceWorker" in navigator){
    const reg = await navigator.serviceWorker.getRegistration();
    if(reg) reg.showNotification("Mind Armor", { body:"This is your test notification. Breathe in. Shoulders down." });
    else new Notification("Mind Armor", { body:"This is your test notification. Breathe in. Shoulders down." });
  } else {
    new Notification("Mind Armor", { body:"This is your test notification. Breathe in. Shoulders down." });
  }
});

// Data export / import / wipe
$("#export-data").addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "mind-armor-data.json"; a.click();
  URL.revokeObjectURL(url);
});
$("#import-data").addEventListener("click", ()=>{
  const file = $("#import-file").files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{ const obj = JSON.parse(reader.result); state = Object.assign({}, defaultState, obj); save(); toast("Data imported."); }
    catch(e){ toast("Invalid file."); }
  };
  reader.readAsText(file);
});
$("#wipe").addEventListener("click", ()=>{
  if(confirm("Erase all local data? This cannot be undone.")){
    localStorage.removeItem("mindArmorState");
    location.reload();
  }
});

// Confidence module logic
function todayISO(){ return new Date().toISOString().slice(0,10); }
$("#conf-save").addEventListener("click", ()=>{
  const text = $("#conf-journal").value.trim();
  if(!text){ toast("Write at least one sentence."); return; }
  state.logs.confidence.push({ date: new Date().toISOString(), text });
  // streak once per day
  const last = state.streaks.confidence.last;
  const today = todayISO();
  if(last !== today){
    state.streaks.confidence.count += 1;
    state.streaks.confidence.last = today;
  }
  $("#conf-journal").value="";
  save();
  toast("Saved. Streak updated.");
});
$("#conf-view-logs").addEventListener("click", ()=>{
  const logs = state.logs.confidence.slice(-10).map(l=>`• ${new Date(l.date).toLocaleString()}: ${l.text}`).join("<br/>") || "No logs yet.";
  alert("Recent entries:\n\n" + state.logs.confidence.slice(-10).map(l=>`- ${new Date(l.date).toLocaleString()}: ${l.text}`).join("\n"));
});
const dares = [
  "Introduce yourself to a colleague and ask one curiosity question.",
  "Send a thank‑you message to someone who helped you recently.",
  "List 3 strengths you used today.",
  "Stand tall for 2 minutes and breathe slowly before a task.",
  "Do one small task you’ve been avoiding for 5 minutes."
];
$("#conf-new-dare").addEventListener("click", ()=>{
  const pick = dares[Math.floor(Math.random()*dares.length)];
  $("#conf-dare").textContent = pick;
});
$("#conf-complete-dare").addEventListener("click", ()=>{
  state.logs.confidence.push({ date:new Date().toISOString(), dare: $("#conf-dare").textContent, done:true });
  save(); toast("Dare logged. Nice.");
});

// Speaking module (basic recording & faux analysis)
let media, recorder, chunks=[];
$("#rec-start").addEventListener("click", async ()=>{
  try{
    media = await navigator.mediaDevices.getUserMedia({ audio:true });
    recorder = new MediaRecorder(media);
    chunks=[];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = async ()=>{
      const blob = new Blob(chunks, { type: "audio/webm" });
      $("#rec-audio").src = URL.createObjectURL(blob);
      // Faux analysis: prompt user to type transcript to estimate words/min
      const transcript = prompt("Optional: paste a rough transcript of what you said to estimate words per minute. Leave blank to skip.");
      if(transcript){
        const words = transcript.trim().split(/\s+/).length;
        // assume recording length ~ 45s for rough calc if not exact
        const durationSec = 45;
        $("#wpm").textContent = Math.round(words / durationSec * 60);
        const fillers = (transcript.match(/\b(um|uh|like|you know|sort of|kind of)\b/gi)||[]).length;
        $("#fillers").textContent = fillers;
      } else {
        $("#wpm").textContent = 0;
        $("#fillers").textContent = 0;
      }
    };
    recorder.start();
    toast("Recording… speak for up to 60s.");
    setTimeout(()=>{ if(recorder && recorder.state==="recording"){ recorder.stop(); media.getTracks().forEach(t=>t.stop()); toast("Auto-stopped at 60s."); } }, 60000);
  }catch(e){
    toast("Mic unavailable.");
  }
});
$("#rec-stop").addEventListener("click", ()=>{
  if(recorder && recorder.state==="recording"){
    recorder.stop();
    if(media){ media.getTracks().forEach(t=>t.stop()); }
    toast("Stopped.");
  }
});
const drills = [
  "Read a paragraph while pausing for a full breath at every comma.",
  "Explain a complex topic to a 10‑year‑old in 60 seconds.",
  "Tell a story with a clear beginning, middle, and end in 45 seconds.",
  "Read slowly and remove all filler words."
];
$("#speaking-new-drill").addEventListener("click", ()=>{
  $("#speaking-drill").textContent = drills[Math.floor(Math.random()*drills.length)];
});

// Urge control
let breatheTimer=null, breatheStep=0;
const breatheSeq = [
  {label:"Inhale", sec:4},
  {label:"Hold", sec:7},
  {label:"Exhale", sec:8}
];
$("#start-breathe").addEventListener("click", ()=>{
  if(breatheTimer){ clearInterval(breatheTimer); breatheTimer=null; }
  breatheStep=0;
  let timeLeft = breatheSeq[breatheStep].sec;
  $("#breathe-stage").textContent = `${breatheSeq[breatheStep].label}… ${timeLeft}s`;
  breatheTimer = setInterval(()=>{
    timeLeft--;
    if(timeLeft<=0){
      breatheStep = (breatheStep+1) % breatheSeq.length;
      timeLeft = breatheSeq[breatheStep].sec;
    }
    $("#breathe-stage").textContent = `${breatheSeq[breatheStep].label}… ${timeLeft}s`;
  }, 1000);
  setTimeout(()=>{ clearInterval(breatheTimer); $("#breathe-stage").textContent="Guide complete."; }, 60000);
});

$("#urge-save").addEventListener("click", ()=>{
  const note = $("#urge-note").value.trim();
  state.logs.urges.push({ date:new Date().toISOString(), note });
  // streak once per day
  const last = state.streaks.urges.last;
  const today = todayISO();
  if(last !== today){
    state.streaks.urges.count += 1;
    state.streaks.urges.last = today;
  }
  $("#urge-note").value="";
  save(); toast("Logged. You're in control.");
});
$("#urge-view").addEventListener("click", ()=>{
  alert("Recent urges:\n\n" + state.logs.urges.slice(-10).map(l=>`- ${new Date(l.date).toLocaleString()}: ${l.note||"(no note)"}`).join("\n"));
});

// Social ease
const starters = [
  "What’s something you’re looking forward to this week?",
  "What’s the most interesting thing you learned recently?",
  "If time wasn’t a constraint, what would you try this month?",
  "What’s your favourite small ritual in your day?",
  "What surprised you today?"
];
function loadStarter(){ $("#starters").innerHTML = "<li>• "+ (starters[Math.floor(Math.random()*starters.length)]) +"</li>"; }
$("#new-starter").addEventListener("click", loadStarter);
loadStarter();
$("#ground-now").addEventListener("click", ()=>{
  $("#ground-status").textContent="Starting 5‑4‑3‑2‑1 grounding… take your time.";
  let step=5;
  const id = setInterval(()=>{
    step--;
    if(step<=0){ clearInterval(id); $("#ground-status").textContent="Well done."; }
    else { $("#ground-status").textContent=`Continue… (${step})`; }
  }, 4000);
});
$("#save-win").addEventListener("click", ()=>{
  const t = $("#wins").value.trim(); if(!t) return;
  state.logs.wins.push({ date:new Date().toISOString(), text:t });
  $("#wins").value=""; save(); toast("Win saved.");
});

// BedRock
$("#box-breathe").addEventListener("click", ()=>{
  $("#box-status").textContent="Inhale 4 • Hold 4 • Exhale 4 • Hold 4… for 60s";
  setTimeout(()=> $("#box-status").textContent="Complete. Check in with your body.", 60000);
});
$("#bed-save").addEventListener("click", ()=>{
  const t = $("#bed-script").value.trim(); if(!t) return;
  state.logs.confidence.push({ date:new Date().toISOString(), intimacy_script:t });
  $("#bed-script").value=""; save(); toast("Saved. Practise builds comfort.");
});

// AI Coach (rule-based placeholder)
$("#coach-send").addEventListener("click", ()=>{
  const q = $("#coach-input").value.trim();
  if(!q) return;
  const log = $("#coach-log");
  const user = document.createElement("div"); user.innerHTML = `<strong>You:</strong> ${q}`;
  log.appendChild(user);
  const tip = suggestTip(q);
  const bot = document.createElement("div"); bot.innerHTML = `<strong>Coach:</strong> ${tip}`;
  log.appendChild(bot);
  $("#coach-input").value="";
  log.scrollTop = log.scrollHeight;
});
function suggestTip(text){
  const t = text.toLowerCase();
  if(t.includes("presentation")||t.includes("speak")||t.includes("speech")){
    return "Try a 60‑second outline: (1) Hook (2) Point (3) Example (4) Close. Aim for 130–150 wpm. Record once, then again 10% slower.";
  }
  if(t.includes("urge")||t.includes("porn")||t.includes("masturbat")){
    return "When the urge spikes, stand up and change rooms. Start a 4‑7‑8 breathing cycle for 60s, then do a 2‑minute chore. Momentum breaks cravings.";
  }
  if(t.includes("anxiet")||t.includes("social")){
    return "Ground with 5‑4‑3‑2‑1, then use a curiosity opener like “What are you working on lately?” Keep answers short and ask one follow‑up.";
  }
  if(t.includes("confidence")||t.includes("self")||t.includes("doubt")){
    return "List three micro‑wins from today. Speak them out loud. Confidence is credit built from tiny deposits.";
  }
  return "Name the smallest next action that takes under 2 minutes. Do it now, then check back in.";
}

// Service Worker
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("service-worker.js");
  });
}

// Section switching from back buttons
$$(".section .btn.secondary[data-section]").forEach(btn=>{
  btn.addEventListener("click", ()=> showSection(btn.dataset.section));
});

// Open locked modules from overlay unlock button in cards grid
$$(".lock-overlay button[data-unlock]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    pendingUnlockKey = btn.dataset.unlock;
    $("#unlockModal").style.display = "flex";
  });
});

