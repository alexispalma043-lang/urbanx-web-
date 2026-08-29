// @ts-nocheck
(function(){
  "use strict";

  const FORMAT="SIXTEEN-BACKUP";
  const VERSION=1;
  const $=id=>document.getElementById(id);
  const api=()=>window.SIXTEEN_ADMIN_BACKUP_SOURCE||{};

  function datos(){
    const a=api();
    return {
      productos:a.getProductos?.()||[],
      pedidos:a.getPedidos?.()||[],
      clientes:a.getClientes?.()||[],
      inventario:a.getInventario?.()||[],
      cupones:a.getCupones?.()||[],
      envios:a.getEnvios?.()||[],
      facturacion:
        window.SIXTEEN_FACTURACION_BACKUP_SOURCE
          ?.getComprobantes?.()
        || [],
      configuracionSri:
        window.SIXTEEN_FACTURACION_BACKUP_SOURCE
          ?.getConfigSri?.()
        || {},

      configuracionPagos:
        window.SIXTEEN_PAGOS_BACKUP_SOURCE
          ?.getConfigPagos?.()
        || {}
    };
  }

  function serializar(v){
    if(v===null||v===undefined)return v??null;
    if(typeof v==="object"&&typeof v.toDate==="function"){
      try{return v.toDate().toISOString();}catch(_){return null;}
    }
    if(v instanceof Date)return v.toISOString();
    if(Array.isArray(v))return v.map(serializar);
    if(typeof v==="object"){
      const o={};
      Object.keys(v).forEach(k=>o[k]=serializar(v[k]));
      return o;
    }
    return v;
  }

  function actualizar(){
    const d=datos();
    const map={
      backupKpiProductos:d.productos.length,
      backupKpiPedidos:d.pedidos.length,
      backupKpiClientes:d.clientes.length,
      backupKpiInventario:d.inventario.length,
      backupKpiCupones:d.cupones.length,
      backupKpiEnvios:d.envios.length
    };
    Object.entries(map).forEach(([id,n])=>{if($(id))$(id).textContent=String(n);});
  }

  function stamp(){
    const d=new Date(),p=n=>String(n).padStart(2,"0");
    return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+"_"+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds());
  }

  function download(content,type,name){
    const url=URL.createObjectURL(new Blob([content],{type}));
    const a=document.createElement("a");
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function hex(buffer){
    return Array.from(new Uint8Array(buffer)).map(b=>b.toString(16).padStart(2,"0")).join("");
  }

  async function sha(text){
    if(!crypto?.subtle)return"";
    return hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text)));
  }

  async function crear(){
    const data=serializar(datos());
    const base={
      format:FORMAT,
      version:VERSION,
      generatedAt:new Date().toISOString(),
      environment:{
        brand:"SIXTEEN Urban Luxury",
        firebaseProject:"urbanx-92e74",
        origin:"urbanx-web"
      },
      counts:{
        productos:data.productos.length,
        pedidos:data.pedidos.length,
        clientes:data.clientes.length,
        inventario:data.inventario.length,
        cupones:data.cupones.length,
        envios:data.envios.length,
        facturacion:data.facturacion.length
      },
      notes:{
        clientes:"Resumen derivado de pedidos.",
        restore:"Este respaldo no realiza restauración automática.",
        secrets:"No debe contener contraseñas, firma electrónica o claves privadas."
      },
      storeConfig:serializar(window.SIXTEEN_STORE_CONFIG||{}),
      data
    };

    const hash=await sha(JSON.stringify(base));
    return {...base,integrity:{algorithm:hash?"SHA-256":"UNAVAILABLE",sha256:hash}};
  }

  function csv(rows){
    const data=serializar(Array.isArray(rows)?rows:[]);
    if(!data.length)return"";

    const headers=[];
    data.forEach(row=>Object.keys(row||{}).forEach(k=>{if(!headers.includes(k))headers.push(k);}));

    const esc=v=>{
      let s="";
      if(v!==null&&v!==undefined)s=typeof v==="object"?JSON.stringify(v):String(v);
      return '"'+s.replace(/"/g,'""')+'"';
    };

    return "\uFEFF"+[
      headers.map(esc).join(","),
      ...data.map(row=>headers.map(k=>esc(row?.[k])).join(","))
    ].join("\r\n");
  }

  function exportCsv(tipo){
    const rows=datos()[tipo]||[];
    if(!rows.length){alert("No hay datos de "+tipo+" para exportar.");return;}
    download(csv(rows),"text/csv;charset=utf-8","SIXTEEN_"+tipo.toUpperCase()+"_"+stamp()+".csv");
  }

  async function descargarCompleto(){
    const b=$("descargarBackupCompletoBtn");
    try{
      if(b){b.disabled=true;b.textContent="GENERANDO...";}
      const backup=await crear();
      download(JSON.stringify(backup,null,2),"application/json;charset=utf-8","SIXTEEN_BACKUP_COMPLETO_"+stamp()+".json");
      if($("backupUltimaDescarga")){
        $("backupUltimaDescarga").textContent="Último respaldo: "+new Date().toLocaleString("es-EC")+(backup.integrity.sha256?" · SHA-256 incluido.":"");
      }
    }catch(e){
      console.error("Backup SIXTEEN:",e);
      alert("No fue posible generar el respaldo.");
    }finally{
      if(b){b.disabled=false;b.textContent="DESCARGAR RESPALDO COMPLETO";}
    }
  }

  function exportConfig(){
    download(
      JSON.stringify({
        format:"SIXTEEN-STORE-CONFIG",
        version:1,
        generatedAt:new Date().toISOString(),
        storeConfig:serializar(window.SIXTEEN_STORE_CONFIG||{})
      },null,2),
      "application/json;charset=utf-8",
      "SIXTEEN_CONFIGURACION_"+stamp()+".json"
    );
  }

  async function validar(file){
    const box=$("backupValidacionResultado");
    const show=(text,type="")=>{
      if(!box)return;
      box.classList.remove("ok","error");
      if(type)box.classList.add(type);
      box.textContent=text;
    };

    if(!file){show("Esperando archivo...");return;}

    try{
      show("Validando respaldo...");
      const parsed=JSON.parse(await file.text());

      if(parsed.format!==FORMAT)throw new Error("No corresponde al formato SIXTEEN-BACKUP.");
      if(Number(parsed.version)!==VERSION)throw new Error("Versión de respaldo no compatible.");
      if(!parsed.data||typeof parsed.data!=="object")throw new Error("Falta el bloque de datos.");

      let integrity="Sin SHA-256.";
      const expected=parsed.integrity?.sha256||"";

      if(expected&&crypto?.subtle){
        const clone={...parsed};
        delete clone.integrity;
        const actual=await sha(JSON.stringify(clone));
        if(actual!==expected)throw new Error("La integridad SHA-256 no coincide.");
        integrity="Integridad SHA-256 correcta.";
      }

      const c=parsed.counts||{};
      show(
        "Respaldo válido · Productos: "+Number(c.productos||0)+
        " · Pedidos: "+Number(c.pedidos||0)+
        " · Clientes: "+Number(c.clientes||0)+
        " · "+integrity,
        "ok"
      );
    }catch(e){
      console.error("Validación backup:",e);
      show("Archivo no válido: "+(e.message||"Error de validación."),"error");
    }
  }

  $("descargarBackupCompletoBtn")?.addEventListener("click",descargarCompleto);
  $("exportarConfiguracionBtn")?.addEventListener("click",exportConfig);
  $("validarBackupInput")?.addEventListener("change",function(){validar(this.files?.[0]||null);});

  document.querySelectorAll("[data-backup-export]").forEach(button=>{
    button.addEventListener("click",()=>exportCsv(button.dataset.backupExport));
  });

  window.addEventListener("sixteen:backup-data-updated",actualizar);
  window.addEventListener("sixteen:admin-data-updated",actualizar);
  window.addEventListener("sixteen:facturacion-data-updated",actualizar);
  actualizar();
})();
