const VERSION="sixteen-v16f6d-5";
const STATIC=`${VERSION}-static`;
const RUNTIME=`${VERSION}-runtime`;
const OFFLINE="./offline.html";

const FILES=[
 "./","./index.html","./producto.html","./carrito.html","./checkout.html",
 "./confirmacion.html","./cuenta.html","./comparar.html","./seguimiento.html",
 "./politicas.html","./soporte.html",
 "./styles.css","./cuenta.css","./comparar.css","./seguimiento.css","./legal.css",
 "./app.js","./producto.js","./carrito.js","./checkout.js","./confirmacion.js",
 "./cuenta.js","./comparar.js","./seguimiento.js","./cart-sync.js",
 "./product-tools.js","./recomendaciones.js","./pwa.js","./seo-producto.js",
 "./store-config.js","./support.js","./variant-utils.js","./compat.js","./payment-config.js","./ride.js",
 "./manifest.webmanifest","./offline.html","./assets/logo-sixteen.jpg","./assets/favicon-32.png",
 "./assets/apple-touch-icon.png","./assets/pwa-icon-192.png",
 "./assets/pwa-icon-512.png","./assets/og-sixteen.png"
];

self.addEventListener("install",e=>{
 e.waitUntil(
  caches.open(STATIC).then(async cache=>{
   await Promise.all(FILES.map(async url=>{
    try{await cache.add(new Request(url,{cache:"reload"}));}catch(_){}
   }));
  }).then(()=>self.skipWaiting())
 );
});

self.addEventListener("activate",e=>{
 e.waitUntil(
  caches.keys().then(keys=>Promise.all(
   keys.filter(k=>k.startsWith("sixteen-")&&k!==STATIC&&k!==RUNTIME)
       .map(k=>caches.delete(k))
  )).then(()=>self.clients.claim())
 );
});

self.addEventListener("fetch",e=>{
 const r=e.request;
 if(r.method!=="GET")return;
 const u=new URL(r.url);
 if(u.origin!==self.location.origin)return;

 if(r.mode==="navigate"){
  e.respondWith((async()=>{
   try{
    const res=await fetch(r);
    if(res&&res.ok)(await caches.open(RUNTIME)).put(r,res.clone());
    return res;
   }catch(_){
    return await caches.match(r) || await caches.match(OFFLINE);
   }
  })());
  return;
 }

 e.respondWith((async()=>{
  const cached=await caches.match(r,{ignoreSearch:true});
  const network=fetch(r).then(async res=>{
   if(res&&res.ok)(await caches.open(RUNTIME)).put(r,res.clone());
   return res;
  }).catch(()=>null);
  return cached || await network || new Response("",{status:504});
 })());
});
