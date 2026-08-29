// @ts-nocheck
(function(){
 const SITE="https://alexispalma043-lang.github.io/urbanx-web-/";

 function meta(selector,value){
  const n=document.querySelector(selector);
  if(n)n.setAttribute("content",value);
 }

 function updateProduct(p){
  if(!p)return;
  const code=String(p.codigo||"").trim().toUpperCase();
  const name=String(p.nombre||"Producto SIXTEEN").trim();
  const category=String(p.categoria||"Urban Luxury").trim();
  const desc=String(p.descripcion||`${name} de SIXTEEN Urban Luxury. Moda urbana premium en Ecuador.`)
    .replace(/\s+/g," ").trim().slice(0,160);
  const image=String(p.imagen||SITE+"assets/og-sixteen.png");
  const url=SITE+"producto.html?id="+encodeURIComponent(code);
  const price=Number(p.precio);
  const stock=Number(p.stock);
  const title=name+" | SIXTEEN Urban Luxury";

  document.title=title;
  meta('meta[name="description"]',desc);
  meta('meta[property="og:title"]',title);
  meta('meta[property="og:description"]',desc);
  meta('meta[property="og:image"]',image);
  meta('meta[property="og:url"]',url);
  meta('meta[name="twitter:title"]',title);
  meta('meta[name="twitter:description"]',desc);
  meta('meta[name="twitter:image"]',image);

  const canonical=document.querySelector('link[rel="canonical"]');
  if(canonical)canonical.href=url;

  const schema=document.getElementById("productStructuredData");
  if(schema){
   schema.textContent=JSON.stringify({
    "@context":"https://schema.org",
    "@type":"Product",
    "name":name,
    "sku":code,
    "category":category,
    "brand":{"@type":"Brand","name":"SIXTEEN"},
    "description":desc,
    "image":[image],
    "url":url,
    "offers":{
     "@type":"Offer",
     "url":url,
     "priceCurrency":"USD",
     "price":Number.isFinite(price)?price.toFixed(2):"0.00",
     "availability":stock>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",
     "itemCondition":"https://schema.org/NewCondition"
    }
   });
  }
 }

 window.SIXTEEN_SEO={updateProduct};
})();
