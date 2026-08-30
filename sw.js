const VERSION="sixteen-v16f6d-22";
const STATIC=`${VERSION}-static`;
const RUNTIME=`${VERSION}-runtime`;
const OFFLINE="./offline.html";
const RUNTIME_MAX=70;

const FILES=[
 "./","./index.html","./producto.html","./carrito.html","./checkout.html",
 "./confirmacion.html","./cuenta.html","./comparar.html","./seguimiento.html",
 "./politicas.html","./soporte.html",
 "./styles.css","./cuenta.css","./comparar.css","./seguimiento.css","./legal.css",
 "./app.js","./producto.js","./carrito.js","./checkout.js","./confirmacion.js",
 "./cuenta.js","./comparar.js","./seguimiento.js","./cart-sync.js",
 "./product-tools.js","./recomendaciones.js","./pwa.js","./seo-producto.js",
 "./store-config.js","./support.js","./variant-utils.js","./compat.js",
 "./payment-config.js","./factura-sixteen.js",
 "./manifest.webmanifest","./offline.html","./assets/logo-sixteen.jpg",
 "./assets/favicon-32.png","./assets/apple-touch-icon.png",
 "./assets/pwa-icon-192.png","./assets/pwa-icon-512.png","./assets/og-sixteen.png"
];

async function trimRuntime(){
 const cache=await caches.open(RUNTIME);
 const keys=await cache.keys();

 if(keys.length<=RUNTIME_MAX)return;

 const excess=keys.length-RUNTIME_MAX;

 await Promise.all(
  keys.slice(0,excess)
      .map(key=>cache.delete(key))
 );
}

async function runtimePut(request,response){
 if(
  !response ||
  !response.ok ||
  response.type==="opaque"
 ){
  return;
 }

 const cache=await caches.open(RUNTIME);
 await cache.put(request,response.clone());
 await trimRuntime();
}

self.addEventListener("install",event=>{
 event.waitUntil(
  caches.open(STATIC)
    .then(async cache=>{
      await Promise.all(
       FILES.map(async url=>{
        try{
         await cache.add(
          new Request(
           url,
           {cache:"reload"}
          )
         );
        }catch(_){}
       })
      );
    })
    .then(()=>self.skipWaiting())
 );
});

self.addEventListener("activate",event=>{
 event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(
      keys
       .filter(
        key=>
         key.startsWith("sixteen-") &&
         key!==STATIC &&
         key!==RUNTIME
       )
       .map(key=>caches.delete(key))
    ))
    .then(()=>self.clients.claim())
 );
});

self.addEventListener("fetch",event=>{
 const request=event.request;

 if(request.method!=="GET"){
  return;
 }

 const url=new URL(request.url);

 if(url.origin!==self.location.origin){
  return;
 }

 // El panel administrativo nunca se guarda en caché.
 // La autenticación real sigue dependiendo de Firebase/Firestore.
 if(url.pathname.includes("/admin/")){
  event.respondWith(
   fetch(request).catch(
    ()=>caches.match(OFFLINE)
   )
  );
  return;
 }

 if(request.mode==="navigate"){
  event.respondWith(
   (async()=>{
    try{
     const response=
      await fetch(request);

     await runtimePut(
      request,
      response
     );

     return response;
    }catch(_){
     return (
      await caches.match(request) ||
      await caches.match(OFFLINE)
     );
    }
   })()
  );
  return;
 }

 event.respondWith(
  (async()=>{
   const cached=
    await caches.match(
     request,
     {ignoreSearch:true}
    );

   const network=
    fetch(request)
      .then(async response=>{
       await runtimePut(
        request,
        response
       );

       return response;
      })
      .catch(()=>null);

   return (
    cached ||
    await network ||
    new Response(
     "",
     {status:504}
    )
   );
  })()
 );
});
