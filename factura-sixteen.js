// @ts-nocheck
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  if(root) root.SIXTEEN_FACTURA_PDF=api;
})(typeof window!=="undefined"?window:null,function(){
  "use strict";
  const t=v=>String(v==null?"":v).trim();
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const money=v=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n(v));
  const esc=v=>t(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  const typeName=item=>({FACTURA:"FACTURA SIXTEEN",NOTA_CREDITO:"NOTA DE CRÉDITO",NOTA_DEBITO:"NOTA DE DÉBITO"}[t(item?.tipoDocumento)]||"DOCUMENTO SIXTEEN");
  const date=v=>{ if(!v)return "—"; if(typeof v?.toDate==="function")return v.toDate().toLocaleString("es-EC"); return t(v)||"—"; };
  function rows(item){
    const d=Array.isArray(item?.detalles)?item.detalles:[];
    if(!d.length) return '<tr><td colspan="5">Sin detalle de productos.</td></tr>';
    return d.map(x=>`<tr><td>${esc(x.codigo||x.codigoPrincipal||"—")}</td><td>${esc(x.descripcion||x.nombre||"Producto")}${x.color||x.talla?`<small>${esc([x.color?"Color: "+x.color:"",x.talla?"Talla: "+x.talla:""].filter(Boolean).join(" · "))}</small>`:""}</td><td class="num">${n(x.cantidad)}</td><td class="num">${money(x.precioUnitario)}</td><td class="num">${money(n(x.precioUnitario)*n(x.cantidad))}</td></tr>`).join("");
  }
  function buildHtml(item){
    if(!item) throw new Error("No existe documento para generar el PDF.");
    const buyer=item.comprador||{};
    const total=item?.totales?.importeTotal ?? item?.totales?.total ?? 0;
    const sub=item?.totales?.subtotal ?? item?.totales?.totalSinImpuestos ?? 0;
    const discount=item?.totales?.descuento ?? item?.totales?.totalDescuento ?? 0;
    const shipping=item?.totales?.envio ?? 0;
    const reference=item.referenciaNumero||item.pedidoNumero||item.pedidoId||"—";
    const status=t(item.estado)||"EMITIDA";
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(typeName(item))} ${esc(item.numero||"")}</title><style>
    *{box-sizing:border-box} @page{size:A4;margin:12mm} body{margin:0;background:#eee;font:14px Arial,sans-serif;color:#171717}.sheet{max-width:900px;margin:22px auto;background:#fff;padding:34px;border:1px solid #ddd}.top{display:flex;justify-content:space-between;gap:24px;border-bottom:3px solid #111;padding-bottom:18px}.brand{font-size:34px;font-weight:900;letter-spacing:.12em}.gold{color:#9a7617}.doc{text-align:right}.doc h1{font-size:19px;margin:0 0 8px}.badge{display:inline-block;border:1px solid #111;padding:6px 10px;font-weight:700}.notice{margin:18px 0;padding:12px;border:1px solid #d8b94a;background:#fff8db;font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:18px 0}.card{border:1px solid #ddd;padding:14px}.label{display:block;font-size:10px;letter-spacing:.12em;color:#666;margin-bottom:5px}.card p{margin:6px 0}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border-bottom:1px solid #ddd;padding:9px;text-align:left}th{font-size:10px;letter-spacing:.08em;background:#f7f7f7}.num{text-align:right}small{display:block;color:#666;margin-top:4px}.totals{width:min(380px,100%);margin:22px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #ddd}.totals .grand{font-size:18px;font-weight:900;border-top:2px solid #111}.footer{margin-top:28px;padding-top:14px;border-top:1px solid #ddd;color:#666;font-size:11px}.actions{position:fixed;right:18px;bottom:18px}.actions button{padding:12px 18px;border:0;background:#111;color:#fff;font-weight:800;cursor:pointer}@media print{body{background:#fff}.sheet{margin:0;padding:0;border:0;max-width:none}.actions{display:none}}@media(max-width:650px){.top,.grid{grid-template-columns:1fr;display:grid}.doc{text-align:left}.sheet{margin:0;padding:20px}}
    </style></head><body><main class="sheet"><section class="top"><div><div class="brand">SIXTEEN</div><div class="gold">URBAN LUXURY</div></div><div class="doc"><h1>${esc(typeName(item))}</h1><strong>${esc(item.numero||item.id||"—")}</strong><p>${esc(item.fechaEmision||date(item.creadoEn))}</p><span class="badge">${esc(status)}</span></div></section>
    <div class="notice"><strong>COMPROBANTE COMERCIAL INTERNO.</strong> Este documento es emitido por el sistema propio de SIXTEEN y no representa autorización tributaria del SRI.</div>
    <section class="grid"><div class="card"><span class="label">CLIENTE</span><strong>${esc(buyer.razonSocial||buyer.nombre||"Cliente SIXTEEN")}</strong><p>Identificación: ${esc(buyer.identificacion||"—")}</p><p>Email: ${esc(buyer.email||"—")}</p><p>Teléfono: ${esc(buyer.telefono||"—")}</p></div><div class="card"><span class="label">REFERENCIA</span><strong>${esc(reference)}</strong><p>Pago: ${esc(item?.pago?.nombre||item?.pago?.metodo||"—")}</p><p>Estado pago: ${esc(item?.pago?.estado||"—")}</p>${item.motivo?`<p>Motivo: ${esc(item.motivo)}</p>`:""}</div></section>
    ${item.tipoDocumento==="FACTURA"?`<table><thead><tr><th>CÓDIGO</th><th>DESCRIPCIÓN</th><th class="num">CANT.</th><th class="num">P. UNIT.</th><th class="num">TOTAL</th></tr></thead><tbody>${rows(item)}</tbody></table>`:""}
    <section class="totals"><div><span>Subtotal</span><strong>${money(sub)}</strong></div>${n(discount)>0?`<div><span>Descuento</span><strong>-${money(discount)}</strong></div>`:""}${n(shipping)>0?`<div><span>Envío</span><strong>${money(shipping)}</strong></div>`:""}<div class="grand"><span>TOTAL</span><strong>${money(total)}</strong></div></section>
    <footer class="footer">Documento generado por Facturación SIXTEEN · ${esc(date(item.creadoEn))}</footer></main><div class="actions"><button onclick="window.print()">IMPRIMIR / GUARDAR PDF</button></div></body></html>`;
  }
  function open(item){ if(typeof window==="undefined")return false; const w=window.open("","_blank","noopener,noreferrer"); if(!w)return false; w.document.open(); w.document.write(buildHtml(item)); w.document.close(); return true; }
  return {buildHtml,open,typeName,money};
});
