// @ts-nocheck
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  if(root) root.SIXTEEN_FACTURA_PDF=api;
})(typeof window!=="undefined"?window:null,function(){
  "use strict";

  const t=v=>String(v==null?"":v).trim();
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const round2=v=>Math.round((n(v)+Number.EPSILON)*100)/100;
  const money=v=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n(v));
  const esc=v=>t(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  const typeName=item=>({FACTURA:"FACTURA SIXTEEN",NOTA_CREDITO:"NOTA DE CRÉDITO",NOTA_DEBITO:"NOTA DE DÉBITO"}[t(item?.tipoDocumento)]||"DOCUMENTO SIXTEEN");
  const fileName=item=>(t(item?.numero||item?.id||"documento-sixteen").replace(/[^A-Za-z0-9_-]+/g,"_")+".pdf");
  const date=v=>{
    if(!v)return "—";
    if(typeof v?.toDate==="function")return v.toDate().toLocaleString("es-EC");
    if(v instanceof Date)return v.toLocaleString("es-EC");
    return t(v)||"—";
  };

  function issuer(item){
    const e=item?.emisor||{};
    return {
      nombreComercial:t(e.nombreComercial)||"SIXTEEN",
      razonSocial:t(e.razonSocial),
      identificacion:t(e.identificacion),
      email:t(e.email),
      telefono:t(e.telefono),
      direccion:t(e.direccion),
      ciudad:t(e.ciudad),
      pais:t(e.pais)||"Ecuador"
    };
  }

  function rowsHtml(item){
    const d=Array.isArray(item?.detalles)?item.detalles:[];
    if(!d.length)return '<tr><td colspan="7">Sin detalle de productos o servicios.</td></tr>';
    return d.map(x=>{
      const q=Math.max(0,n(x.cantidad));
      const unit=Math.max(0,n(x.precioUnitario));
      const base=x.base!=null?n(x.base):unit*q;
      const iva=x.iva!=null?n(x.iva):0;
      const total=x.total!=null?n(x.total):base+iva;
      const rate=x.ivaTarifa==null?"—":`${n(x.ivaTarifa)}%`;
      return `<tr>
        <td>${esc(x.codigo||x.codigoPrincipal||"—")}</td>
        <td>${esc(x.descripcion||x.nombre||"Producto / servicio")}${x.color||x.talla?`<small>${esc([x.color?"Color: "+x.color:"",x.talla?"Talla: "+x.talla:""].filter(Boolean).join(" · "))}</small>`:""}</td>
        <td class="num">${q}</td>
        <td class="num">${money(unit)}</td>
        <td class="num">${esc(rate)}</td>
        <td class="num">${money(iva)}</td>
        <td class="num">${money(total)}</td>
      </tr>`;
    }).join("");
  }

  function buildHtml(item){
    if(!item)throw new Error("No existe documento para generar el PDF.");
    const buyer=item.comprador||{};
    const em=issuer(item);
    const totals=item.totales||{};
    const total=totals.importeTotal??totals.total??0;
    const subtotal=totals.subtotal??0;
    const base=totals.baseImponible??totals.subtotalSinImpuestos??subtotal;
    const tax=totals.impuesto??totals.iva??0;
    const discount=totals.descuento??0;
    const shipping=totals.envio??0;
    const reference=item.referenciaNumero||item.pedidoNumero||item.pedidoId||"—";
    const status=t(item.estado)||"EMITIDA";
    const notes=t(item.notas||item.terminos||item.motivo);
    const due=t(item.fechaVencimiento);

    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(typeName(item))} ${esc(item.numero||"")}</title><style>
    *{box-sizing:border-box}@page{size:A4;margin:12mm}body{margin:0;background:#eee;font:13px Arial,sans-serif;color:#171717}.sheet{max-width:920px;margin:22px auto;background:#fff;padding:34px;border:1px solid #ddd}.top{display:flex;justify-content:space-between;gap:24px;border-bottom:3px solid #111;padding-bottom:18px}.brand{font-size:32px;font-weight:900;letter-spacing:.10em}.gold{color:#9a7617}.issuer{margin-top:10px;font-size:11px;color:#555;line-height:1.5}.doc{text-align:right}.doc h1{font-size:19px;margin:0 0 8px}.badge{display:inline-block;border:1px solid #111;padding:6px 10px;font-weight:700}.notice{margin:18px 0;padding:10px 12px;border:1px solid #d8b94a;background:#fff8db;font-size:11px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:18px 0}.card{border:1px solid #ddd;padding:14px}.label{display:block;font-size:10px;letter-spacing:.12em;color:#666;margin-bottom:5px}.card p{margin:6px 0}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}th{font-size:9px;letter-spacing:.06em;background:#f7f7f7}.num{text-align:right;white-space:nowrap}small{display:block;color:#666;margin-top:4px}.totals{width:min(410px,100%);margin:22px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #ddd}.totals .grand{font-size:18px;font-weight:900;border-top:2px solid #111}.notes{margin-top:20px;border:1px solid #ddd;padding:12px;white-space:pre-wrap}.footer{margin-top:28px;padding-top:14px;border-top:1px solid #ddd;color:#666;font-size:10px}.actions{position:fixed;right:18px;bottom:18px;display:flex;gap:8px}.actions button{padding:12px 18px;border:0;background:#111;color:#fff;font-weight:800;cursor:pointer}.actions button.alt{background:#9a7617}@media print{body{background:#fff}.sheet{margin:0;padding:0;border:0;max-width:none}.actions{display:none}}@media(max-width:650px){.top,.grid{grid-template-columns:1fr;display:grid}.doc{text-align:left}.sheet{margin:0;padding:20px}.actions{position:static;padding:12px;background:#fff}.actions button{flex:1}}
    </style></head><body><main class="sheet"><section class="top"><div><div class="brand">${esc(em.nombreComercial)}</div><div class="gold">SIXTEEN · FACTURACIÓN</div><div class="issuer">${em.razonSocial?esc(em.razonSocial)+"<br>":""}${em.identificacion?"Identificación: "+esc(em.identificacion)+"<br>":""}${em.direccion?esc(em.direccion)+"<br>":""}${esc([em.ciudad,em.pais].filter(Boolean).join(" · "))}${em.email?"<br>"+esc(em.email):""}${em.telefono?" · "+esc(em.telefono):""}</div></div><div class="doc"><h1>${esc(typeName(item))}</h1><strong>${esc(item.numero||item.id||"—")}</strong><p>Emisión: ${esc(item.fechaEmision||date(item.creadoEn))}</p>${due?`<p>Vence: ${esc(due)}</p>`:""}<span class="badge">${esc(status)}</span></div></section>
    <div class="notice"><strong>DOCUMENTO COMERCIAL SIXTEEN.</strong> Generado por el facturador propio de SIXTEEN. No constituye un comprobante tributario autorizado por el SRI.</div>
    <section class="grid"><div class="card"><span class="label">CLIENTE</span><strong>${esc(buyer.razonSocial||buyer.nombre||"Cliente SIXTEEN")}</strong><p>Identificación: ${esc(buyer.identificacion||"—")}</p><p>Email: ${esc(buyer.email||"—")}</p><p>Teléfono: ${esc(buyer.telefono||"—")}</p><p>Dirección: ${esc([buyer.direccion,buyer.ciudad,buyer.provincia].filter(Boolean).join(" · ")||"—")}</p></div><div class="card"><span class="label">REFERENCIA / PAGO</span><strong>${esc(reference)}</strong><p>Pago: ${esc(item?.pago?.nombre||item?.pago?.metodo||"—")}</p><p>Estado pago: ${esc(item?.pago?.estado||"—")}</p>${item.origenFactura?`<p>Origen: ${esc(item.origenFactura)}</p>`:""}${item.motivo?`<p>Motivo: ${esc(item.motivo)}</p>`:""}</div></section>
    ${item.tipoDocumento==="FACTURA"?`<table><thead><tr><th>CÓDIGO</th><th>DESCRIPCIÓN</th><th class="num">CANT.</th><th class="num">P. UNIT.</th><th class="num">IVA</th><th class="num">IMP.</th><th class="num">TOTAL</th></tr></thead><tbody>${rowsHtml(item)}</tbody></table>`:""}
    <section class="totals"><div><span>Base imponible</span><strong>${money(base)}</strong></div>${n(tax)>0?`<div><span>IVA</span><strong>${money(tax)}</strong></div>`:""}<div><span>Subtotal</span><strong>${money(subtotal)}</strong></div>${n(discount)>0?`<div><span>Descuento</span><strong>-${money(discount)}</strong></div>`:""}${n(shipping)>0?`<div><span>Envío / otros</span><strong>${money(shipping)}</strong></div>`:""}<div class="grand"><span>TOTAL</span><strong>${money(total)}</strong></div></section>
    ${notes?`<section class="notes"><span class="label">NOTAS / CONDICIONES</span>${esc(notes)}</section>`:""}
    <footer class="footer">Documento generado por Facturación SIXTEEN · ${esc(date(item.creadoEn))}</footer></main><div class="actions"><button class="alt" onclick="window.opener&&window.opener.SIXTEEN_FACTURA_PDF&&window.opener.SIXTEEN_FACTURA_PDF.download(window.__SIXTEEN_DOC__)" style="display:none">DESCARGAR PDF</button><button onclick="window.print()">IMPRIMIR / GUARDAR PDF</button></div><script>window.__SIXTEEN_DOC__=${JSON.stringify(item).replace(/</g,"\\u003c")};<\/script></body></html>`;
  }

  function open(item){
    if(typeof window==="undefined")return false;
    const w=window.open("","_blank");
    if(!w)return false;
    w.document.open();
    w.document.write(buildHtml(item));
    w.document.close();
    return true;
  }

  function wrap(doc,text,width){
    return doc.splitTextToSize(t(text)||"—",width);
  }

  function download(item){
    if(typeof window==="undefined")return false;
    const jsPDF=window.jspdf?.jsPDF;
    if(!jsPDF)return false;
    try{
      const doc=new jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
      const em=issuer(item);const buyer=item.comprador||{};const totals=item.totales||{};
      const pageW=210,margin=14,contentW=pageW-margin*2;
      let y=16;
      const line=(txtv,size=9,bold=false,x=margin,align="left")=>{doc.setFont("helvetica",bold?"bold":"normal");doc.setFontSize(size);doc.text(t(txtv)||"—",x,y,{align});};
      doc.setFont("helvetica","bold");doc.setFontSize(23);doc.text(em.nombreComercial||"SIXTEEN",margin,y);doc.setFontSize(8);doc.setTextColor(120);doc.text("SIXTEEN · FACTURACIÓN",margin,y+5);doc.setTextColor(0);
      doc.setFontSize(13);doc.text(typeName(item),pageW-margin,y,{align:"right"});doc.setFontSize(9);doc.text(t(item.numero||item.id)||"—",pageW-margin,y+6,{align:"right"});doc.setFont("helvetica","normal");doc.text(`Emisión: ${t(item.fechaEmision)||date(item.creadoEn)}`,pageW-margin,y+12,{align:"right"});
      y+=20;doc.setDrawColor(30);doc.line(margin,y,pageW-margin,y);y+=6;
      doc.setFontSize(8);doc.setTextColor(80);
      const issuerLines=[em.razonSocial,em.identificacion?`Identificación: ${em.identificacion}`:"",em.direccion,[em.ciudad,em.pais].filter(Boolean).join(" · "),[em.email,em.telefono].filter(Boolean).join(" · ")].filter(Boolean);
      issuerLines.forEach(v=>{doc.text(t(v),margin,y);y+=4;});doc.setTextColor(0);y+=2;
      doc.setFillColor(255,248,219);doc.setDrawColor(216,185,74);doc.roundedRect(margin,y,contentW,12,1,1,"FD");doc.setFontSize(7.7);doc.text("DOCUMENTO COMERCIAL SIXTEEN · No constituye comprobante tributario autorizado por el SRI.",margin+3,y+7);y+=18;
      doc.setFont("helvetica","bold");doc.setFontSize(8);doc.text("CLIENTE",margin,y);doc.text("REFERENCIA / PAGO",110,y);y+=5;doc.setFont("helvetica","normal");doc.setFontSize(9);
      const clientLines=[buyer.razonSocial||"Cliente SIXTEEN",buyer.identificacion?`ID: ${buyer.identificacion}`:"",buyer.email,buyer.telefono,[buyer.direccion,buyer.ciudad,buyer.provincia].filter(Boolean).join(" · ")].filter(Boolean);
      const refLines=[item.referenciaNumero||item.pedidoNumero||item.pedidoId||"—",item?.pago?.nombre||item?.pago?.metodo||"—",item?.pago?.estado||"—"].filter(Boolean);
      const cWrapped=clientLines.flatMap(v=>wrap(doc,v,85));const rWrapped=refLines.flatMap(v=>wrap(doc,v,80));const max=Math.max(cWrapped.length,rWrapped.length,1);
      for(let i=0;i<max;i++){if(cWrapped[i])doc.text(cWrapped[i],margin,y);if(rWrapped[i])doc.text(rWrapped[i],110,y);y+=4.3;}y+=5;
      const details=Array.isArray(item.detalles)?item.detalles:[];
      if(item.tipoDocumento==="FACTURA"&&details.length){
        doc.setFillColor(245);doc.rect(margin,y,contentW,7,"F");doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("CÓDIGO",margin+1,y+4.5);doc.text("DESCRIPCIÓN",39,y+4.5);doc.text("CANT.",125,y+4.5,{align:"right"});doc.text("P.UNIT.",148,y+4.5,{align:"right"});doc.text("IVA",164,y+4.5,{align:"right"});doc.text("TOTAL",pageW-margin-1,y+4.5,{align:"right"});y+=9;
        doc.setFont("helvetica","normal");
        for(const x of details){
          if(y>272){doc.addPage();y=16;}
          const q=Math.max(0,n(x.cantidad)),unit=Math.max(0,n(x.precioUnitario)),total=x.total!=null?n(x.total):unit*q;
          const desc=wrap(doc,[x.descripcion||x.nombre||"Producto / servicio",[x.color,x.talla].filter(Boolean).join(" / ")].filter(Boolean).join(" · "),80);
          const h=Math.max(6,desc.length*3.8+2);
          if(y+h>280){doc.addPage();y=16;}
          doc.setFontSize(7.5);doc.text(t(x.codigo)||"—",margin+1,y+4);doc.text(desc,39,y+4);doc.text(String(q),125,y+4,{align:"right"});doc.text(money(unit),148,y+4,{align:"right"});doc.text(x.ivaTarifa==null?"—":`${n(x.ivaTarifa)}%`,164,y+4,{align:"right"});doc.text(money(total),pageW-margin-1,y+4,{align:"right"});doc.setDrawColor(225);doc.line(margin,y+h,pageW-margin,y+h);y+=h+1;
        }
      }
      y+=5;if(y>235){doc.addPage();y=16;}
      const totalRows=[["Base imponible",totals.baseImponible??totals.subtotalSinImpuestos??totals.subtotal??0],["IVA",totals.impuesto??totals.iva??0],["Subtotal",totals.subtotal??0],["Descuento",-n(totals.descuento)],["Envío / otros",totals.envio??0],["TOTAL",totals.importeTotal??totals.total??0]];
      const tx=128;doc.setFontSize(8.5);for(const [label,val] of totalRows){if(label!=="TOTAL"&&Math.abs(n(val))<0.005&&label!=="Subtotal"&&label!=="Base imponible")continue;doc.setFont("helvetica",label==="TOTAL"?"bold":"normal");doc.text(label,tx,y);doc.text(money(val),pageW-margin,y,{align:"right"});y+=5;}doc.setFont("helvetica","normal");
      const notes=t(item.notas||item.terminos||item.motivo);if(notes){y+=4;if(y>255){doc.addPage();y=16;}doc.setFont("helvetica","bold");doc.setFontSize(7.5);doc.text("NOTAS / CONDICIONES",margin,y);y+=4;doc.setFont("helvetica","normal");const arr=wrap(doc,notes,contentW);doc.text(arr,margin,y);}
      doc.save(fileName(item));return true;
    }catch(err){console.error("PDF SIXTEEN:",err);return false;}
  }

  return {buildHtml,open,download,typeName,money,fileName};
});
