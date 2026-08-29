// @ts-nocheck
(function(){
 let promptEvent=null,timer=null;

 if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{
   navigator.serviceWorker.register("./sw.js",{scope:"./"})
    .catch(e=>console.warn("SIXTEEN PWA:",e));
  });
 }

 window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();
  promptEvent=e;
  showInstall();
 });

 window.addEventListener("appinstalled",()=>{
  promptEvent=null;
  document.getElementById("sixteenInstallBtn")?.remove();
  status("SIXTEEN se instaló correctamente.");
 });

 function showInstall(){
  if(document.getElementById("sixteenInstallBtn"))return;
  const actions=document.querySelector(".header-actions");
  if(!actions)return;

  const b=document.createElement("button");
  b.type="button";
  b.id="sixteenInstallBtn";
  b.className="pwa-install-btn";
  b.setAttribute("aria-label","Instalar SIXTEEN como aplicación");
  b.innerHTML='<span aria-hidden="true">↓</span><span class="pwa-install-label">APP</span>';
  b.addEventListener("click",async()=>{
   if(!promptEvent)return;
   promptEvent.prompt();
   await promptEvent.userChoice;
   promptEvent=null;
   b.remove();
  });
  actions.insertBefore(b,actions.firstChild);
 }

 window.addEventListener("offline",()=>status("Sin conexión · usando contenido disponible."));
 window.addEventListener("online",()=>status("Conexión restablecida."));

 function status(msg){
  let n=document.getElementById("sixteenPwaStatus");
  if(!n){
   n=document.createElement("div");
   n.id="sixteenPwaStatus";
   n.className="pwa-status-toast";
   n.setAttribute("aria-live","polite");
   document.body.appendChild(n);
  }
  clearTimeout(timer);
  n.textContent=msg;
  n.classList.add("activo");
  timer=setTimeout(()=>n.classList.remove("activo"),2600);
 }
})();
