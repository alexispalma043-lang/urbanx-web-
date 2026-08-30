// @ts-nocheck
(function(){
  "use strict";
  const ADMIN_APP_NAME="sixteen-admin",INACTIVITY_MS=60*60*1000,WARNING_MS=5*60*1000,KEY="sixteen_admin_last_activity";
  const status=document.getElementById("adminSessionGuardStatus");
  let last=Date.now(),lastPersist=0,closing=false;
  function app(){return typeof firebase!=="undefined"?(firebase.apps.find(x=>x.name===ADMIN_APP_NAME)||null):null;}
  function save(force=false){const now=Date.now();if(!force&&now-lastPersist<15000)return;last=now;lastPersist=now;try{sessionStorage.setItem(KEY,String(now));}catch(_){}}
  function restore(){try{const x=Number(sessionStorage.getItem(KEY));if(Number.isFinite(x)&&x>0)last=x;}catch(_){}}
  function fmt(ms){const s=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(s/60);return String(m).padStart(2,"0")+":"+String(s%60).padStart(2,"0");}
  async function logout(){if(closing)return;closing=true;if(status){status.textContent="SESIÓN EXPIRADA";status.classList.add("warning");}try{const a=app();if(a)await firebase.auth(a).signOut();}catch(_){}try{sessionStorage.removeItem(KEY);}catch(_){}window.location.replace("./login.html?motivo=inactividad");}
  function tick(){const a=app(),u=a?firebase.auth(a).currentUser:null;if(!u)return;const left=INACTIVITY_MS-(Date.now()-last);if(left<=0){logout();return;}if(!status)return;if(left<=WARNING_MS){status.textContent="CIERRA EN "+fmt(left);status.classList.add("warning");}else{status.textContent="SESIÓN PROTEGIDA";status.classList.remove("warning");}}
  ["pointerdown","keydown","touchstart"].forEach(ev=>window.addEventListener(ev,()=>{save();tick();},{passive:ev!=="keydown"}));
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")tick();});
  restore();save(true);setInterval(tick,30000);tick();
})();
