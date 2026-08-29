// @ts-nocheck
(function () {
  const txt=v=>String(v??"").trim();
  const num=v=>Number.isFinite(Number(v))?Math.max(0,Math.floor(Number(v))):0;
  const slug=v=>txt(v).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  const makeId=(color,talla)=>(slug(color)||"sin-color")+"__"+(slug(talla)||"unica");

  function normalizeVariant(v){
    const color=txt(v?.color), talla=txt(v?.talla);
    return {
      id:txt(v?.id)||makeId(color,talla),
      color,
      talla,
      stock:num(v?.stock),
      activo:v?.activo!==false
    };
  }

  function variants(product){
    if(!Array.isArray(product?.variantes)) return [];
    const seen=new Set();
    return product.variantes.map(normalizeVariant).filter(v=>{
      if(!v.activo) return false;
      v.id=makeId(v.color,v.talla);
      if(seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    });
  }

  function hasVariants(product){ return variants(product).length>0; }

  function totalStock(product){
    const list=variants(product);
    return list.length ? list.reduce((s,v)=>s+num(v.stock),0) : num(product?.stock);
  }

  function colors(product,includeSoldOut=true){
    const out=[];
    variants(product).forEach(v=>{
      if(!includeSoldOut&&v.stock<=0)return;
      const c=v.color||"SIXTEEN";
      if(!out.includes(c))out.push(c);
    });
    return out;
  }

  function sizes(product,color="",includeSoldOut=true){
    const out=[], wanted=txt(color);
    variants(product).forEach(v=>{
      if(wanted&&(v.color||"SIXTEEN")!==wanted)return;
      if(!includeSoldOut&&v.stock<=0)return;
      if(v.talla&&!out.includes(v.talla))out.push(v.talla);
    });
    return out;
  }

  function find(product,o={}){
    const list=variants(product), id=txt(o.id), color=txt(o.color), talla=txt(o.talla);
    if(id){
      const x=list.find(v=>v.id===id);
      if(x)return x;
    }
    return list.find(v=>(v.color||"SIXTEEN")===(color||"SIXTEEN")&&txt(v.talla)===talla)||null;
  }

  function stockFor(product,o={}){
    const list=variants(product);
    if(!list.length)return num(product?.stock);
    const exact=find(product,o);
    if(exact)return num(exact.stock);
    const color=txt(o.color);
    if(color)return list.filter(v=>(v.color||"SIXTEEN")===color).reduce((s,v)=>s+num(v.stock),0);
    return totalStock(product);
  }

  function cleanForSave(items){
    const out=[], seen=new Set();
    (Array.isArray(items)?items:[]).forEach(raw=>{
      const v=normalizeVariant(raw);
      if(!v.color&&!v.talla)return;
      v.id=makeId(v.color,v.talla);
      if(seen.has(v.id)){
        throw new Error(`La variante ${v.color||"Sin color"} / ${v.talla||"Única"} está repetida.`);
      }
      seen.add(v.id);
      out.push(v);
    });
    return out;
  }

  function legacyFields(items){
    const list=cleanForSave(items), cs=[], ts=[];
    list.forEach(v=>{
      if(v.color&&!cs.includes(v.color))cs.push(v.color);
      if(v.talla&&!ts.includes(v.talla))ts.push(v.talla);
    });
    return {
      stock:list.reduce((s,v)=>s+num(v.stock),0),
      color:cs.join(" | "),
      tallas:ts
    };
  }

  window.SIXTEEN_VARIANTS={
    text:txt,integer:num,makeId,normalizeVariant,variants,hasVariants,totalStock,
    colors,sizes,find,stockFor,
    requiresSize:(product,color="")=>sizes(product,color,true).length>0,
    cleanForSave,legacyFields
  };
})();
