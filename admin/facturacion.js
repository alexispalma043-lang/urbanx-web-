// @ts-nocheck
document.addEventListener("DOMContentLoaded",function(){
  "use strict";
  if(typeof firebase==="undefined")return;

  const FIREBASE_CONFIG={apiKey:"AIzaSyBFLPbBQPZy4ILeBRZ_kELi7KizlR1hgJo",authDomain:"urbanx-92e74.firebaseapp.com",projectId:"urbanx-92e74",storageBucket:"urbanx-92e74.firebasestorage.app",messagingSenderId:"830520272633",appId:"1:830520272633:web:ce7f2bf7abc8f86fec6428"};
  const APP_NAME="sixteen-admin";
  let app=firebase.apps.find(a=>a.name===APP_NAME);
  if(!app)app=firebase.initializeApp(FIREBASE_CONFIG,APP_NAME);
  const db=firebase.firestore(app);
  const FV=firebase.firestore.FieldValue;
  const C=db.collection("facturacion");
  const CFG=C.doc("config_interna");
  const $=id=>document.getElementById(id);

  const e={
    badge:$("facturacionPendientesBadge"),ambiente:$("facturacionAmbienteBadge"),pedido:$("facturacionPedidoSelect"),fecha:$("facturacionFechaEmision"),preview:$("facturacionPedidoPreview"),generar:$("generarFacturaXmlBtn"),msg:$("facturacionGenerarMensaje"),buscar:$("facturacionBuscar"),tipo:$("facturacionFiltroTipo"),estado:$("facturacionFiltroEstado"),exportar:$("exportarFacturacionCsvBtn"),body:$("facturacionBody"),kTotal:$("facturacionKpiTotal"),kFac:$("facturacionKpiFacturas"),kNc:$("facturacionKpiNotasCredito"),kMonto:$("facturacionKpiTotalFacturado"),
    openNc:$("abrirNotaCreditoBtn"),openNd:$("abrirNotaDebitoBtn"),noteModal:$("facturacionNotaModal"),noteTitle:$("facturacionNotaTitulo"),closeNote:$("cerrarFacturacionNotaBtn"),cancelNote:$("cancelarFacturacionNotaBtn"),noteForm:$("facturacionNotaForm"),noteInvoice:$("facturacionNotaFactura"),noteValue:$("facturacionNotaValor"),noteReason:$("facturacionNotaMotivo"),noteInfo:$("facturacionNotaInfo"),noteMsg:$("facturacionNotaMensaje"),noteSave:$("guardarFacturacionNotaBtn"),
    openManual:$("abrirFacturaManualBtn"),manualModal:$("facturacionManualModal"),manualForm:$("facturacionManualForm"),manualClose:$("cerrarFacturaManualBtn"),manualCancel:$("cancelarFacturaManualBtn"),manualSave:$("guardarFacturaManualBtn"),manualMsg:$("facturaManualMensaje"),manualItems:$("facturaManualItems"),manualAdd:$("agregarFacturaManualItemBtn"),mName:$("facturaManualClienteNombre"),mId:$("facturaManualClienteId"),mEmail:$("facturaManualClienteEmail"),mPhone:$("facturaManualClienteTelefono"),mAddress:$("facturaManualClienteDireccion"),mCity:$("facturaManualClienteCiudad"),mProvince:$("facturaManualClienteProvincia"),mDate:$("facturaManualFecha"),mDue:$("facturaManualVencimiento"),mPayMethod:$("facturaManualPagoMetodo"),mPayState:$("facturaManualPagoEstado"),mDiscount:$("facturaManualDescuento"),mShipping:$("facturaManualEnvio"),mNotes:$("facturaManualNotas"),mBase:$("facturaManualBase"),mTax:$("facturaManualIva"),mDiscountTotal:$("facturaManualDescuentoTotal"),mShippingTotal:$("facturaManualEnvioTotal"),mTotal:$("facturaManualTotal"),
    openCfg:$("abrirFacturacionConfigBtn"),cfgModal:$("facturacionConfigModal"),cfgForm:$("facturacionConfigForm"),cfgClose:$("cerrarFacturacionConfigBtn"),cfgCancel:$("cancelarFacturacionConfigBtn"),cfgSave:$("guardarFacturacionConfigBtn"),cfgMsg:$("facturacionConfigMensaje"),cfgName:$("facturacionConfigNombre"),cfgLegal:$("facturacionConfigRazonSocial"),cfgId:$("facturacionConfigIdentificacion"),cfgEmail:$("facturacionConfigEmail"),cfgPhone:$("facturacionConfigTelefono"),cfgCity:$("facturacionConfigCiudad"),cfgAddress:$("facturacionConfigDireccion"),cfgCountry:$("facturacionConfigPais"),cfgIva:$("facturacionConfigIva"),cfgDue:$("facturacionConfigDiasVencimiento"),cfgPrefix:$("facturacionConfigPrefijoFactura"),cfgPrefixNc:$("facturacionConfigPrefijoNC"),cfgPrefixNd:$("facturacionConfigPrefijoND"),cfgTerms:$("facturacionConfigTerminos"),
    detailModal:$("facturacionDetalleModal"),detailTitle:$("facturacionDetalleTitulo"),detailContent:$("facturacionDetalleContenido"),detailClose:$("cerrarFacturacionDetalleBtn"),detailClose2:$("cerrarFacturacionDetalleAccionBtn")
  };
  if(!e.body)return;

  let orders=[],docs=[],noteType="NOTA_CREDITO",config=null,lastFocus=null,lineCounter=0;
  const txt=v=>String(v==null?"":v).trim();
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const round2=v=>Math.round((num(v)+Number.EPSILON)*100)/100;
  const money=v=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(num(v));
  const clean=s=>txt(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const today=()=>{const d=new Date(),p=n=>String(n).padStart(2,"0");return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;};
  const addDays=(iso,days)=>{const d=iso?new Date(iso+"T12:00:00"):new Date();d.setDate(d.getDate()+Math.max(0,Math.floor(num(days))));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
  const safeId=s=>txt(s).replace(/[^A-Za-z0-9_-]/g,"_").slice(0,120);
  const prefix=v=>txt(v).toUpperCase().replace(/[^A-Z0-9-]/g,"").slice(0,20)||"SIX-FAC";
  const seq=(p,n)=>`${prefix(p)}-${String(n).padStart(9,"0")}`;
  const clear=node=>{while(node?.firstChild)node.removeChild(node.firstChild);};
  const isInternal=x=>x&&x.sistema==="SIXTEEN_INTERNO"&&x.tipoRegistro==="DOCUMENTO";
  const typeName=t=>({FACTURA:"Factura",NOTA_CREDITO:"Nota de crédito",NOTA_DEBITO:"Nota de débito"})[t]||"Documento";
  const paymentName=m=>({efectivo:"Efectivo",transferencia:"Transferencia bancaria",qr:"Pago QR",tarjeta:"Tarjeta",credito:"Crédito"})[txt(m)]||txt(m)||"Sin especificar";

  function defaultConfig(){
    return {tipoRegistro:"CONFIG",sistema:"SIXTEEN_INTERNO",version:2,emisor:{nombreComercial:"SIXTEEN",razonSocial:"",identificacion:"",email:"",telefono:"",direccion:"",ciudad:"",pais:"Ecuador"},ivaDefault:15,diasVencimiento:0,prefijoFactura:"SIX-FAC",prefijoNotaCredito:"SIX-NC",prefijoNotaDebito:"SIX-ND",terminos:"Gracias por tu compra.",proximoFactura:1,proximoNotaCredito:1,proximoNotaDebito:1};
  }
  function normalizedConfig(data){
    const d={...defaultConfig(),...(data||{})};
    d.emisor={...defaultConfig().emisor,...((data||{}).emisor||{})};
    d.ivaDefault=[0,5,15].includes(num(d.ivaDefault))?num(d.ivaDefault):15;
    d.diasVencimiento=Math.max(0,Math.min(365,Math.floor(num(d.diasVencimiento))));
    d.prefijoFactura=prefix(d.prefijoFactura||"SIX-FAC");d.prefijoNotaCredito=prefix(d.prefijoNotaCredito||"SIX-NC");d.prefijoNotaDebito=prefix(d.prefijoNotaDebito||"SIX-ND");
    return d;
  }
  function configReady(){return txt(config?.emisor?.nombreComercial).length>0;}
  function renderConfigStatus(){
    if(!e.ambiente)return;
    e.ambiente.textContent=configReady()?"OPERATIVO":"CONFIGURAR";
    e.ambiente.classList.toggle("error",!configReady());
  }
  function setMsg(message,error=false){if(!e.msg)return;e.msg.textContent=message||"";e.msg.classList.toggle("error",!!error);}
  function buyer(order){const c=order?.cliente||{};return {razonSocial:[c.nombres,c.apellidos].filter(Boolean).join(" ").trim()||c.email||"Cliente SIXTEEN",nombres:txt(c.nombres),apellidos:txt(c.apellidos),identificacion:txt(c.identificacion),email:txt(c.email).toLowerCase(),telefono:txt(c.telefono),direccion:txt(order?.entrega?.direccion),ciudad:txt(order?.entrega?.ciudad),provincia:txt(order?.entrega?.provincia)};}

  function detailFromOrder(order){
    const rateDefault=num(config?.ivaDefault??15);
    const raw=(Array.isArray(order?.productos)?order.productos:[]).map(x=>{
      const q=Math.max(0,num(x.cantidad)),unit=Math.max(0,num(x.precioUnitario)),rate=[0,5,15].includes(num(x.ivaTarifa))?num(x.ivaTarifa):rateDefault;
      const gross=round2(q*unit);const base=rate>0?round2(gross/(1+rate/100)):gross;const tax=round2(gross-base);
      return {codigo:txt(x.codigo),descripcion:txt(x.nombre),categoria:txt(x.categoria),cantidad:q,precioUnitario:unit,ivaTarifa:rate,base,iva:tax,total:gross,color:txt(x.color),talla:txt(x.talla),varianteId:txt(x.varianteId)};
    });
    const grossSubtotal=round2(raw.reduce((s,x)=>s+x.total,0));
    const requestedDiscount=Math.max(0,num(order?.resumen?.descuento));
    const discount=Math.min(requestedDiscount,grossSubtotal);
    const ratio=grossSubtotal>0?Math.max(0,Math.min(1,(grossSubtotal-discount)/grossSubtotal)):1;
    const base=round2(raw.reduce((s,x)=>s+x.base*ratio,0));
    const tax=round2(raw.reduce((s,x)=>s+x.iva*ratio,0));
    const shipping=Math.max(0,num(order?.resumen?.envio));
    const total=Math.max(0,num(order?.resumen?.total)||round2(grossSubtotal-discount+shipping));
    return {detalles:raw,totales:{baseImponible:base,impuesto:tax,subtotal:Math.max(0,num(order?.resumen?.subtotal)||grossSubtotal),descuento:discount,envio:shipping,importeTotal:total,cupon:order?.resumen?.cupon||null}};
  }

  function invoiceForOrder(id){return docs.find(x=>x.tipoDocumento==="FACTURA"&&x.pedidoId===id&&x.estado!=="ANULADA")||null;}
  function activeNotesForInvoice(invoiceId,type=""){return docs.filter(x=>x.referenciaFacturaId===invoiceId&&x.estado!=="ANULADA"&&(!type||x.tipoDocumento===type));}
  function remainingCredit(invoice){const used=activeNotesForInvoice(invoice.id,"NOTA_CREDITO").reduce((s,x)=>s+num(x.totales?.importeTotal),0);return Math.max(0,round2(num(invoice.totales?.importeTotal)-used));}

  function renderOrders(){
    if(!e.pedido)return;
    const selected=e.pedido.value;clear(e.pedido);const o=document.createElement("option");o.value="";o.textContent="Selecciona un pedido";e.pedido.append(o);
    orders.filter(x=>txt(x.estado)!=="Cancelado"&&!invoiceForOrder(x.id)).sort((a,b)=>(b.creadoEn?.seconds||0)-(a.creadoEn?.seconds||0)).forEach(x=>{const op=document.createElement("option");op.value=x.id;op.textContent=`${txt(x.numero||x.id)} · ${txt(x.cliente?.nombres)} ${txt(x.cliente?.apellidos)} · ${money(x.resumen?.total)}`;e.pedido.append(op);});
    if([...e.pedido.options].some(x=>x.value===selected))e.pedido.value=selected;renderPreview();
  }
  function renderPreview(){
    if(!e.preview)return;clear(e.preview);const o=orders.find(x=>x.id===e.pedido?.value);
    if(!o){e.preview.textContent="Selecciona un pedido para revisar los datos que se usarán en la factura.";return;}
    const b=buyer(o),calc=detailFromOrder(o);const parts=[`Pedido: ${txt(o.numero||o.id)}`,`Cliente: ${b.razonSocial}`,`Identificación: ${b.identificacion||"—"}`,`Pago: ${txt(o.pago?.nombre||o.pago?.metodo)||"—"}`,`Productos: ${(o.productos||[]).length}`,`Base estimada: ${money(calc.totales.baseImponible)}`,`IVA estimado: ${money(calc.totales.impuesto)}`,`Total: ${money(calc.totales.importeTotal)}`];
    parts.forEach(x=>{const p=document.createElement("p");p.textContent=x;e.preview.append(p);});
  }

  async function notifyInvoice(item){
    if(!item?.clienteUid)return;
    try{await db.collection("notificaciones").doc(item.clienteUid).collection("items").add({tipo:"factura_emitida",titulo:"Factura SIXTEEN emitida",mensaje:`Tu factura ${item.numero} ya está disponible en Mi Cuenta.`,pedidoId:item.pedidoId||"",pedidoNumero:item.pedidoNumero||"",leida:false,creadoEn:FV.serverTimestamp()});}catch(_){ }
  }

  async function createInvoiceFromOrder(){
    const order=orders.find(x=>x.id===e.pedido?.value);
    if(!order){setMsg("Selecciona un pedido.",true);return;}
    if(invoiceForOrder(order.id)){setMsg("Este pedido ya tiene una factura SIXTEEN activa.",true);return;}
    if(!configReady()){setMsg("Configura primero los datos del facturador.",true);openConfig(e.openCfg);return;}
    e.generar.disabled=true;setMsg("Generando factura...");
    try{
      let created=null,createdId="";
      await db.runTransaction(async tx=>{
        const lockRef=C.doc("lock_pedido_"+safeId(order.id));const lockSnap=await tx.get(lockRef);
        if(lockSnap.exists&&txt(lockSnap.data()?.activeFacturaId)){const activeRef=C.doc(txt(lockSnap.data().activeFacturaId));const activeSnap=await tx.get(activeRef);if(activeSnap.exists&&activeSnap.data()?.estado!=="ANULADA")throw new Error("Este pedido ya tiene una factura SIXTEEN activa.");}
        const cfgSnap=await tx.get(CFG);const cfg=normalizedConfig(cfgSnap.exists?cfgSnap.data():config);const n=Math.max(1,Math.floor(num(cfg.proximoFactura)||1));const number=seq(cfg.prefijoFactura,n);const ref=C.doc(`factura_${safeId(order.id)}_${String(n).padStart(9,"0")}`);const existing=await tx.get(ref);if(existing.exists)throw new Error("No fue posible reservar el número de factura. Intenta nuevamente.");
        const calc=detailFromOrder(order);createdId=ref.id;created={tipoRegistro:"DOCUMENTO",sistema:"SIXTEEN_INTERNO",version:2,tipoDocumento:"FACTURA",numero:number,secuencial:n,estado:"EMITIDA",creditoEmitido:0,origenFactura:"PEDIDO",pedidoId:order.id,pedidoNumero:txt(order.numero||order.id),clienteUid:txt(order.clienteUid),comprador:buyer(order),detalles:calc.detalles,totales:calc.totales,pago:{metodo:txt(order.pago?.metodo),nombre:txt(order.pago?.nombre)||paymentName(order.pago?.metodo),estado:txt(order.pago?.estado||order.estadoPago)},entrega:order.entrega||{},emisor:{...cfg.emisor},terminos:txt(cfg.terminos),fechaEmision:e.fecha?.value||today(),fechaVencimiento:addDays(e.fecha?.value||today(),cfg.diasVencimiento),creadoEn:FV.serverTimestamp(),actualizadoEn:FV.serverTimestamp()};
        tx.set(ref,created);tx.set(lockRef,{tipoRegistro:"LOCK",sistema:"SIXTEEN_INTERNO",pedidoId:order.id,activeFacturaId:ref.id,actualizadoEn:FV.serverTimestamp()},{merge:true});tx.set(CFG,{tipoRegistro:"CONFIG",sistema:"SIXTEEN_INTERNO",version:2,proximoFactura:n+1,proximoNotaCredito:Math.max(1,Math.floor(num(cfg.proximoNotaCredito)||1)),proximoNotaDebito:Math.max(1,Math.floor(num(cfg.proximoNotaDebito)||1)),actualizadoEn:FV.serverTimestamp()},{merge:true});
      });
      await notifyInvoice(created);setMsg(`Factura ${created.numero} generada correctamente.`);e.pedido.value="";renderPreview();setTimeout(()=>downloadPdf({...created,id:createdId}),100);
    }catch(err){console.error("Facturación SIXTEEN:",err);setMsg(err?.message||"No fue posible generar la factura.",true);}finally{e.generar.disabled=false;}
  }

  function renderKpis(){
    const active=docs.filter(x=>x.estado!=="ANULADA"),invoices=active.filter(x=>x.tipoDocumento==="FACTURA"),credits=active.filter(x=>x.tipoDocumento==="NOTA_CREDITO"),debits=active.filter(x=>x.tipoDocumento==="NOTA_DEBITO");
    if(e.kTotal)e.kTotal.textContent=String(docs.length);if(e.kFac)e.kFac.textContent=String(invoices.length);if(e.kNc)e.kNc.textContent=String(credits.length);
    const net=invoices.reduce((s,x)=>s+num(x.totales?.importeTotal),0)-credits.reduce((s,x)=>s+num(x.totales?.importeTotal),0)+debits.reduce((s,x)=>s+num(x.totales?.importeTotal),0);if(e.kMonto)e.kMonto.textContent=money(net);
    if(e.badge){e.badge.textContent=String(active.length);e.badge.classList.toggle("vacio",active.length===0);}
  }
  function filtered(){const q=clean(e.buscar?.value),tp=txt(e.tipo?.value),st=txt(e.estado?.value);return docs.filter(x=>(!tp||x.tipoDocumento===tp)&&(!st||x.estado===st)&&(!q||clean([x.numero,x.pedidoNumero,x.referenciaNumero,x.comprador?.razonSocial,x.comprador?.identificacion,x.comprador?.email,x.origenFactura].join(" ")).includes(q)));}
  function tableButton(label,action,id,cls="admin-table-btn"){const b=document.createElement("button");b.type="button";b.className=cls;b.textContent=label;b.dataset[action]=id;return b;}
  function renderTable(){
    clear(e.body);const list=filtered().sort((a,b)=>(b.creadoEn?.seconds||0)-(a.creadoEn?.seconds||0));
    if(!list.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=7;td.textContent="No hay documentos para mostrar.";tr.append(td);e.body.append(tr);return;}
    list.forEach(x=>{const tr=document.createElement("tr");const values=[[typeName(x.tipoDocumento),x.numero],[x.fechaEmision||"—"],[x.comprador?.razonSocial||"—",x.comprador?.identificacion||""],[x.pedidoNumero||x.referenciaNumero||x.origenFactura||"MANUAL"],[money(x.totales?.importeTotal)],[x.estado||"EMITIDA"]];values.forEach(arr=>{const td=document.createElement("td");arr.filter(Boolean).forEach((v,j)=>{const el=j===0?document.createElement("strong"):document.createElement("small");el.textContent=v;td.append(el);});tr.append(td);});const act=document.createElement("td");act.className="facturacion-actions";act.append(tableButton("VER","invoiceView",x.id,"admin-table-btn view"),tableButton("PDF","invoiceDownload",x.id,"admin-table-btn pdf-download"),tableButton("IMPRIMIR","invoicePrint",x.id),tableButton("EMAIL","invoiceEmail",x.id));if(x.estado!=="ANULADA")act.append(tableButton("ANULAR","invoiceCancel",x.id,"admin-table-btn danger"));tr.append(act);e.body.append(tr);});
  }
  function refresh(){renderKpis();renderOrders();renderTable();fillNoteInvoices();renderConfigStatus();}
  function getDoc(id){return docs.find(x=>x.id===id)||null;}
  function printPdf(item){if(!window.SIXTEEN_FACTURA_PDF){alert("No se cargó el generador PDF.");return;}if(!window.SIXTEEN_FACTURA_PDF.open(item))alert("Permite ventanas emergentes para imprimir el documento.");}
  function downloadPdf(item){if(!window.SIXTEEN_FACTURA_PDF){alert("No se cargó el generador PDF.");return;}if(!window.SIXTEEN_FACTURA_PDF.download(item)){alert("No se pudo descargar automáticamente el PDF. Se abrirá la versión para imprimir / guardar como PDF.");printPdf(item);}}

  async function sendEmail(item,button){
    const api=window.SIXTEEN_COMPROBANTE_EMAIL;if(!api){alert("No se cargó el módulo de correo.");return;}button.disabled=true;const old=button.textContent;button.textContent="ENVIANDO...";
    try{await api.send(item);await C.doc(item.id).set({correoEnviado:true,correoEnviadoEn:FV.serverTimestamp(),actualizadoEn:FV.serverTimestamp()},{merge:true});alert("Correo enviado correctamente.");}catch(err){console.error(err);alert(err?.message||"No fue posible enviar el correo.");}finally{button.disabled=false;button.textContent=old;}
  }

  async function cancelDoc(item){
    if(!item||item.estado==="ANULADA")return;
    if(item.tipoDocumento==="FACTURA"&&activeNotesForInvoice(item.id).length){alert("Primero anula las notas activas vinculadas a esta factura.");return;}
    if(!confirm(`¿Anular ${item.numero}? El pedido y el inventario no serán modificados.`))return;
    try{
      await db.runTransaction(async tx=>{
        const ref=C.doc(item.id);
        const current=await tx.get(ref);
        if(!current.exists)throw new Error("El documento ya no existe.");
        if(current.data()?.estado==="ANULADA")return;
        if(item.tipoDocumento==="FACTURA"&&Math.max(0,num(current.data()?.creditoEmitido))>0)throw new Error("Primero anula las notas de crédito activas vinculadas a esta factura.");

        let lockRef=null,lockSnap=null;
        if(item.tipoDocumento==="FACTURA"&&item.pedidoId){
          lockRef=C.doc("lock_pedido_"+safeId(item.pedidoId));
          lockSnap=await tx.get(lockRef);
        }

        let creditInvoiceRef=null,creditInvoiceSnap=null;
        if(item.tipoDocumento==="NOTA_CREDITO"&&item.referenciaFacturaId){
          creditInvoiceRef=C.doc(item.referenciaFacturaId);
          creditInvoiceSnap=await tx.get(creditInvoiceRef);
        }

        tx.update(ref,{estado:"ANULADA",anuladoEn:FV.serverTimestamp(),actualizadoEn:FV.serverTimestamp()});

        if(lockRef&&lockSnap?.exists&&txt(lockSnap.data()?.activeFacturaId)===item.id){
          tx.set(lockRef,{activeFacturaId:"",actualizadoEn:FV.serverTimestamp()},{merge:true});
        }

        if(creditInvoiceRef&&creditInvoiceSnap?.exists){
          const currentCredit=Math.max(0,num(creditInvoiceSnap.data()?.creditoEmitido));
          tx.update(creditInvoiceRef,{creditoEmitido:round2(Math.max(0,currentCredit-num(item.totales?.importeTotal))),actualizadoEn:FV.serverTimestamp()});
        }
      });
    }catch(err){console.error(err);alert(err?.message||"No fue posible anular el documento.");}
  }

  function fillNoteInvoices(){
    if(!e.noteInvoice)return;const val=e.noteInvoice.value;clear(e.noteInvoice);const o=document.createElement("option");o.value="";o.textContent="Selecciona una factura";e.noteInvoice.append(o);docs.filter(x=>x.tipoDocumento==="FACTURA"&&x.estado==="EMITIDA").forEach(x=>{const op=document.createElement("option");op.value=x.id;const rem=remainingCredit(x);op.textContent=`${x.numero} · ${x.comprador?.razonSocial||"Cliente"} · ${money(x.totales?.importeTotal)}${rem<num(x.totales?.importeTotal)?` · crédito disponible ${money(rem)}`:""}`;e.noteInvoice.append(op);});if([...e.noteInvoice.options].some(x=>x.value===val))e.noteInvoice.value=val;
  }

  function focusables(modal){return [...modal.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')].filter(x=>!x.hidden&&x.offsetParent!==null);}
  function openModal(modal,focusEl,trigger){if(!modal)return;lastFocus=trigger||document.activeElement;modal.hidden=false;document.body.classList.add("modal-open");setTimeout(()=>focusEl?.focus?.(),0);}
  function closeModal(modal){if(!modal||modal.hidden)return;modal.hidden=true;if(![e.noteModal,e.manualModal,e.cfgModal,e.detailModal].some(x=>x&&!x.hidden))document.body.classList.remove("modal-open");lastFocus?.focus?.();}
  function trapModalKey(ev,modal){if(!modal||modal.hidden)return false;if(ev.key==="Escape"){ev.preventDefault();closeModal(modal);return true;}if(ev.key!=="Tab")return false;const list=focusables(modal);if(!list.length)return false;const first=list[0],last=list[list.length-1];if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus();}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus();}return true;}

  function openNote(type,trigger){
    noteType=type;if(e.noteTitle)e.noteTitle.textContent=type==="NOTA_CREDITO"?"Nueva nota de crédito":"Nueva nota de débito";if(e.noteInfo)e.noteInfo.textContent=type==="NOTA_CREDITO"?"La nota de crédito disminuye comercialmente el valor de referencia. El total acumulado no puede superar la factura.":"La nota de débito registra un valor adicional comercial sobre la factura.";if(e.noteForm)e.noteForm.reset();if(e.noteMsg)e.noteMsg.textContent="";fillNoteInvoices();openModal(e.noteModal,e.noteInvoice,trigger);
  }
  async function createNote(ev){
    ev.preventDefault();const inv=getDoc(e.noteInvoice?.value);const value=round2(e.noteValue?.value),reason=txt(e.noteReason?.value);
    if(!inv||inv.tipoDocumento!=="FACTURA"||inv.estado!=="EMITIDA"){e.noteMsg.textContent="Selecciona una factura emitida válida.";return;}if(value<=0){e.noteMsg.textContent="Ingresa un valor mayor a cero.";return;}if(noteType==="NOTA_CREDITO"&&value>remainingCredit(inv)){e.noteMsg.textContent=`El crédito disponible para esta factura es ${money(remainingCredit(inv))}.`;return;}if(reason.length<3){e.noteMsg.textContent="Escribe el motivo de la nota.";return;}
    e.noteSave.disabled=true;e.noteMsg.textContent="Generando nota...";
    try{let created=null,refId="";await db.runTransaction(async tx=>{const invRef=C.doc(inv.id);const invSnap=await tx.get(invRef);if(!invSnap.exists||invSnap.data()?.estado!=="EMITIDA")throw new Error("La factura ya no está disponible para notas.");const currentInvoice=invSnap.data()||{};if(noteType==="NOTA_CREDITO"){const issued=Math.max(0,num(currentInvoice.creditoEmitido));const invoiceTotal=Math.max(0,num(currentInvoice.totales?.importeTotal));if(round2(issued+value)>round2(invoiceTotal))throw new Error(`El crédito disponible para esta factura es ${money(Math.max(0,invoiceTotal-issued))}.`);}const cfgSnap=await tx.get(CFG);const cfg=normalizedConfig(cfgSnap.exists?cfgSnap.data():config);const key=noteType==="NOTA_CREDITO"?"proximoNotaCredito":"proximoNotaDebito",n=Math.max(1,Math.floor(num(cfg[key])||1)),p=noteType==="NOTA_CREDITO"?cfg.prefijoNotaCredito:cfg.prefijoNotaDebito;const ref=C.doc(`${noteType==="NOTA_CREDITO"?"nc":"nd"}_${safeId(inv.id)}_${String(n).padStart(9,"0")}`);refId=ref.id;if((await tx.get(ref)).exists)throw new Error("No fue posible reservar el número de nota.");created={tipoRegistro:"DOCUMENTO",sistema:"SIXTEEN_INTERNO",version:2,tipoDocumento:noteType,numero:seq(p,n),secuencial:n,estado:"EMITIDA",origenFactura:"AJUSTE",referenciaFacturaId:inv.id,referenciaNumero:inv.numero,pedidoId:inv.pedidoId||"",pedidoNumero:inv.pedidoNumero||"",clienteUid:inv.clienteUid||"",comprador:inv.comprador||{},pago:inv.pago||{},emisor:inv.emisor||cfg.emisor,motivo:reason,totales:{baseImponible:value,impuesto:0,subtotal:value,descuento:0,envio:0,importeTotal:value},fechaEmision:today(),terminos:txt(cfg.terminos),creadoEn:FV.serverTimestamp(),actualizadoEn:FV.serverTimestamp()};tx.set(ref,created);if(noteType==="NOTA_CREDITO")tx.update(invRef,{creditoEmitido:round2(Math.max(0,num(currentInvoice.creditoEmitido))+value),actualizadoEn:FV.serverTimestamp()});tx.set(CFG,{[key]:n+1,tipoRegistro:"CONFIG",sistema:"SIXTEEN_INTERNO",version:2,actualizadoEn:FV.serverTimestamp()},{merge:true});});closeModal(e.noteModal);setTimeout(()=>downloadPdf({...created,id:refId}),100);}catch(err){console.error(err);e.noteMsg.textContent=err?.message||"No fue posible generar la nota.";}finally{e.noteSave.disabled=false;}
  }

  function addManualLine(data={}){
    if(!e.manualItems)return;lineCounter+=1;const row=document.createElement("div");row.className="facturacion-line-item";row.dataset.lineId=String(lineCounter);
    const field=(label,cls,type="text")=>{const l=document.createElement("label");if(cls)l.classList.add(cls);l.append(document.createTextNode(label));const i=document.createElement("input");i.type=type;l.append(i);return {l,i};};
    const code=field("CÓDIGO","", "text");code.i.className="line-code";code.i.maxLength=40;code.i.value=txt(data.codigo);
    const desc=field("DESCRIPCIÓN *","facturacion-line-description","text");desc.i.className="line-desc";desc.i.maxLength=180;desc.i.required=true;desc.i.value=txt(data.descripcion);
    const qty=field("CANT. *","","number");qty.i.className="line-qty";qty.i.min="0.01";qty.i.step="0.01";qty.i.required=true;qty.i.value=String(data.cantidad||1);
    const unit=field("P. UNIT. SIN IVA *","","number");unit.i.className="line-unit";unit.i.min="0";unit.i.step="0.01";unit.i.required=true;unit.i.value=data.precioUnitario!=null?String(data.precioUnitario):"0";
    const taxLabel=document.createElement("label");taxLabel.append(document.createTextNode("IVA"));const tax=document.createElement("select");tax.className="line-tax";[15,5,0].forEach(r=>{const o=document.createElement("option");o.value=String(r);o.textContent=r+"%";if(r===num(data.ivaTarifa??config?.ivaDefault??15))o.selected=true;tax.append(o);});taxLabel.append(tax);
    const totalLabel=document.createElement("label");totalLabel.append(document.createTextNode("TOTAL"));const total=document.createElement("div");total.className="facturacion-line-total";total.textContent="$0.00";totalLabel.append(total);
    const remove=document.createElement("button");remove.type="button";remove.className="facturacion-line-remove";remove.textContent="×";remove.title="Eliminar línea";remove.setAttribute("aria-label","Eliminar línea");
    row.append(code.l,desc.l,qty.l,unit.l,taxLabel,totalLabel,remove);e.manualItems.append(row);calcManual();setTimeout(()=>desc.i.focus(),0);
  }
  function manualLines(){return [...(e.manualItems?.querySelectorAll(".facturacion-line-item")||[])];}
  function calcManual(){
    let baseGross=0,taxGross=0,gross=0;manualLines().forEach(row=>{const q=Math.max(0,num(row.querySelector(".line-qty")?.value)),unit=Math.max(0,num(row.querySelector(".line-unit")?.value)),rate=Math.max(0,num(row.querySelector(".line-tax")?.value));const base=round2(q*unit),tax=round2(base*rate/100),total=round2(base+tax);baseGross+=base;taxGross+=tax;gross+=total;const tEl=row.querySelector(".facturacion-line-total");if(tEl)tEl.textContent=money(total);});
    const discount=Math.min(Math.max(0,num(e.mDiscount?.value)),gross),shipping=Math.max(0,num(e.mShipping?.value));const ratio=gross>0?(gross-discount)/gross:1;const base=round2(baseGross*ratio),tax=round2(taxGross*ratio),total=round2(gross-discount+shipping);
    if(e.mBase)e.mBase.textContent=money(base);if(e.mTax)e.mTax.textContent=money(tax);if(e.mDiscountTotal)e.mDiscountTotal.textContent=discount?"-"+money(discount):money(0);if(e.mShippingTotal)e.mShippingTotal.textContent=money(shipping);if(e.mTotal)e.mTotal.textContent=money(total);return {base,iva:tax,subtotal:round2(gross),descuento:round2(discount),envio:round2(shipping),total};
  }
  function resetManual(){
    e.manualForm?.reset();clear(e.manualItems);if(e.mDate)e.mDate.value=today();if(e.mDue)e.mDue.value=addDays(today(),config?.diasVencimiento||0);if(e.mPayState)e.mPayState.value="Pendiente";if(e.mDiscount)e.mDiscount.value="0";if(e.mShipping)e.mShipping.value="0";if(e.manualMsg)e.manualMsg.textContent="";addManualLine();calcManual();
  }
  function openManual(trigger){if(!configReady()){alert("Configura primero los datos del facturador.");openConfig(e.openCfg);return;}resetManual();openModal(e.manualModal,e.mName,trigger);}
  async function findClientUid(email){const v=txt(email).toLowerCase();if(!v)return "";const known=orders.filter(o=>txt(o?.cliente?.email).toLowerCase()===v&&txt(o.clienteUid)).sort((a,b)=>(b.creadoEn?.seconds||0)-(a.creadoEn?.seconds||0))[0];if(known)return txt(known.clienteUid);try{const s=await db.collection("cuentas").where("email","==",v).limit(1).get();return s.empty?"":s.docs[0].id;}catch(_){return "";}}
  async function createManualInvoice(ev){
    ev.preventDefault();const name=txt(e.mName?.value),email=txt(e.mEmail?.value).toLowerCase();if(name.length<2){e.manualMsg.textContent="Ingresa el nombre o razón social del cliente.";e.mName?.focus();return;}const rows=manualLines();if(!rows.length){e.manualMsg.textContent="Agrega al menos una línea.";return;}
    const details=[];for(const row of rows){const description=txt(row.querySelector(".line-desc")?.value),q=Math.max(0,num(row.querySelector(".line-qty")?.value)),unit=Math.max(0,num(row.querySelector(".line-unit")?.value)),rate=Math.max(0,num(row.querySelector(".line-tax")?.value));if(description.length<2||q<=0||unit<0){e.manualMsg.textContent="Revisa descripción, cantidad y precio de todas las líneas.";return;}const base=round2(q*unit),tax=round2(base*rate/100);details.push({codigo:txt(row.querySelector(".line-code")?.value),descripcion:description,categoria:"Manual",cantidad:q,precioUnitario:unit,ivaTarifa:rate,base,iva:tax,total:round2(base+tax),color:"",talla:"",varianteId:""});}
    const totals=calcManual();if(totals.total<=0){e.manualMsg.textContent="El total de la factura debe ser mayor a cero.";return;}if(e.mDue?.value&&e.mDate?.value&&e.mDue.value<e.mDate.value){e.manualMsg.textContent="La fecha de vencimiento no puede ser anterior a la fecha de emisión.";return;}
    e.manualSave.disabled=true;e.manualMsg.textContent="Emitiendo factura...";
    try{
      const clientUid=await findClientUid(email);let created=null,createdId="";
      await db.runTransaction(async tx=>{const cfgSnap=await tx.get(CFG);const cfg=normalizedConfig(cfgSnap.exists?cfgSnap.data():config);const n=Math.max(1,Math.floor(num(cfg.proximoFactura)||1));const ref=C.doc(`factura_manual_${String(n).padStart(9,"0")}`);createdId=ref.id;if((await tx.get(ref)).exists)throw new Error("No fue posible reservar el número de factura.");created={tipoRegistro:"DOCUMENTO",sistema:"SIXTEEN_INTERNO",version:2,tipoDocumento:"FACTURA",numero:seq(cfg.prefijoFactura,n),secuencial:n,estado:"EMITIDA",creditoEmitido:0,origenFactura:"MANUAL",pedidoId:"",pedidoNumero:"",clienteUid,comprador:{razonSocial:name,nombres:name,apellidos:"",identificacion:txt(e.mId?.value),email,telefono:txt(e.mPhone?.value),direccion:txt(e.mAddress?.value),ciudad:txt(e.mCity?.value),provincia:txt(e.mProvince?.value)},detalles,totales:{baseImponible:totals.base,impuesto:totals.iva,subtotal:totals.subtotal,descuento:totals.descuento,envio:totals.envio,importeTotal:totals.total,cupon:null},pago:{metodo:txt(e.mPayMethod?.value),nombre:paymentName(e.mPayMethod?.value),estado:txt(e.mPayState?.value)||"Pendiente"},entrega:{direccion:txt(e.mAddress?.value),ciudad:txt(e.mCity?.value),provincia:txt(e.mProvince?.value)},emisor:{...cfg.emisor},notas:txt(e.mNotes?.value),terminos:txt(cfg.terminos),fechaEmision:e.mDate?.value||today(),fechaVencimiento:e.mDue?.value||"",creadoEn:FV.serverTimestamp(),actualizadoEn:FV.serverTimestamp()};tx.set(ref,created);tx.set(CFG,{tipoRegistro:"CONFIG",sistema:"SIXTEEN_INTERNO",version:2,proximoFactura:n+1,actualizadoEn:FV.serverTimestamp()},{merge:true});});await notifyInvoice(created);closeModal(e.manualModal);setTimeout(()=>downloadPdf({...created,id:createdId}),100);
    }catch(err){console.error(err);e.manualMsg.textContent=err?.message||"No fue posible emitir la factura.";}finally{e.manualSave.disabled=false;}
  }

  function fillConfig(){
    const c=normalizedConfig(config);e.cfgName.value=c.emisor.nombreComercial;e.cfgLegal.value=c.emisor.razonSocial;e.cfgId.value=c.emisor.identificacion;e.cfgEmail.value=c.emisor.email;e.cfgPhone.value=c.emisor.telefono;e.cfgAddress.value=c.emisor.direccion;e.cfgCity.value=c.emisor.ciudad;e.cfgCountry.value=c.emisor.pais;e.cfgIva.value=String(c.ivaDefault);e.cfgDue.value=String(c.diasVencimiento);e.cfgPrefix.value=c.prefijoFactura;e.cfgPrefixNc.value=c.prefijoNotaCredito;e.cfgPrefixNd.value=c.prefijoNotaDebito;e.cfgTerms.value=c.terminos;
  }
  function openConfig(trigger){fillConfig();if(e.cfgMsg)e.cfgMsg.textContent="";openModal(e.cfgModal,e.cfgName,trigger);}
  async function saveConfig(ev){
    ev.preventDefault();const name=txt(e.cfgName?.value);if(name.length<2){e.cfgMsg.textContent="Ingresa el nombre comercial del emisor.";return;}const data={tipoRegistro:"CONFIG",sistema:"SIXTEEN_INTERNO",version:2,emisor:{nombreComercial:name,razonSocial:txt(e.cfgLegal?.value),identificacion:txt(e.cfgId?.value),email:txt(e.cfgEmail?.value).toLowerCase(),telefono:txt(e.cfgPhone?.value),direccion:txt(e.cfgAddress?.value),ciudad:txt(e.cfgCity?.value),pais:txt(e.cfgCountry?.value)||"Ecuador"},ivaDefault:[0,5,15].includes(num(e.cfgIva?.value))?num(e.cfgIva.value):15,diasVencimiento:Math.max(0,Math.min(365,Math.floor(num(e.cfgDue?.value)))),prefijoFactura:prefix(e.cfgPrefix?.value),prefijoNotaCredito:prefix(e.cfgPrefixNc?.value||"SIX-NC"),prefijoNotaDebito:prefix(e.cfgPrefixNd?.value||"SIX-ND"),terminos:txt(e.cfgTerms?.value),actualizadoEn:FV.serverTimestamp()};
    e.cfgSave.disabled=true;e.cfgMsg.textContent="Guardando configuración...";try{await CFG.set(data,{merge:true});e.cfgMsg.textContent="Configuración guardada correctamente.";setTimeout(()=>closeModal(e.cfgModal),450);}catch(err){console.error(err);e.cfgMsg.textContent=err?.message||"No fue posible guardar la configuración.";}finally{e.cfgSave.disabled=false;}
  }

  function appendDetailCard(container,label,value,extra=""){const card=document.createElement("div");card.className="facturacion-detail-card";const l=document.createElement("span");l.textContent=label;const strong=document.createElement("strong");strong.textContent=value||"—";card.append(l,strong);if(extra){const p=document.createElement("p");p.textContent=extra;card.append(p);}container.append(card);}
  function openDetail(item,trigger){
    if(!item)return;clear(e.detailContent);e.detailTitle.textContent=`${typeName(item.tipoDocumento)} ${item.numero}`;const grid=document.createElement("div");grid.className="facturacion-detail-grid";appendDetailCard(grid,"CLIENTE",item.comprador?.razonSocial,[item.comprador?.identificacion,item.comprador?.email,item.comprador?.telefono].filter(Boolean).join(" · "));appendDetailCard(grid,"DOCUMENTO",item.numero,`${item.fechaEmision||"—"} · ${item.estado||"EMITIDA"}`);appendDetailCard(grid,"REFERENCIA",item.pedidoNumero||item.referenciaNumero||item.origenFactura||"MANUAL",item.origenFactura||"");appendDetailCard(grid,"PAGO",item.pago?.nombre||item.pago?.metodo,item.pago?.estado||"");e.detailContent.append(grid);
    if(item.tipoDocumento==="FACTURA"&&Array.isArray(item.detalles)){const wrap=document.createElement("div");wrap.className="admin-table-wrap";const table=document.createElement("table");table.className="facturacion-detail-items";table.innerHTML='<thead><tr><th>CÓDIGO</th><th>DESCRIPCIÓN</th><th class="num">CANT.</th><th class="num">P. UNIT.</th><th class="num">IVA</th><th class="num">TOTAL</th></tr></thead>';const body=document.createElement("tbody");item.detalles.forEach(x=>{const tr=document.createElement("tr");[x.codigo||"—",x.descripcion||"Producto",String(num(x.cantidad)),money(x.precioUnitario),x.ivaTarifa==null?"—":`${num(x.ivaTarifa)}%`,money(x.total!=null?x.total:num(x.precioUnitario)*num(x.cantidad))].forEach((v,i)=>{const td=document.createElement("td");td.textContent=v;if(i>=2)td.className="num";tr.append(td);});body.append(tr);});table.append(body);wrap.append(table);e.detailContent.append(wrap);}
    const totals=document.createElement("div");totals.className="facturacion-detail-totals";[["Base imponible",item.totales?.baseImponible],["IVA",item.totales?.impuesto],["Subtotal",item.totales?.subtotal],["Descuento",-num(item.totales?.descuento)],["Envío / otros",item.totales?.envio],["TOTAL",item.totales?.importeTotal]].forEach(([l,v])=>{if(v==null)return;const d=document.createElement("div");if(l==="TOTAL")d.className="grand";const a=document.createElement("span"),b=document.createElement("strong");a.textContent=l;b.textContent=money(v);d.append(a,b);totals.append(d);});e.detailContent.append(totals);if(item.notas||item.terminos||item.motivo){const card=document.createElement("div");card.className="facturacion-detail-card";const l=document.createElement("span");l.textContent="NOTAS / CONDICIONES";const p=document.createElement("p");p.textContent=txt(item.notas||item.terminos||item.motivo);card.append(l,p);e.detailContent.append(card);}openModal(e.detailModal,e.detailClose,trigger);
  }

  function csvCell(v){let s=txt(v).replace(/"/g,'""');if(/^[=+\-@]/.test(s))s="'"+s;return `"${s}"`;}
  function exportCsv(){const list=filtered();if(!list.length){alert("No hay documentos para exportar.");return;}const lines=[["Tipo","Numero","Fecha","Origen","Cliente","Identificacion","Email","Pedido/Referencia","Base","IVA","Subtotal","Descuento","Envio","Total","Estado","EstadoPago"],...list.map(x=>[typeName(x.tipoDocumento),x.numero,x.fechaEmision,x.origenFactura,x.comprador?.razonSocial,x.comprador?.identificacion,x.comprador?.email,x.pedidoNumero||x.referenciaNumero,num(x.totales?.baseImponible).toFixed(2),num(x.totales?.impuesto).toFixed(2),num(x.totales?.subtotal).toFixed(2),num(x.totales?.descuento).toFixed(2),num(x.totales?.envio).toFixed(2),num(x.totales?.importeTotal).toFixed(2),x.estado,x.pago?.estado])].map(r=>r.map(csvCell).join(","));const blob=new Blob(["\ufeff"+lines.join("\n")],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`SIXTEEN_facturacion_${today()}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}

  [e.buscar,e.tipo,e.estado].forEach(x=>x?.addEventListener(x===e.buscar?"input":"change",renderTable));
  e.pedido?.addEventListener("change",renderPreview);e.generar?.addEventListener("click",createInvoiceFromOrder);e.exportar?.addEventListener("click",exportCsv);
  e.openNc?.addEventListener("click",ev=>openNote("NOTA_CREDITO",ev.currentTarget));e.openNd?.addEventListener("click",ev=>openNote("NOTA_DEBITO",ev.currentTarget));e.closeNote?.addEventListener("click",()=>closeModal(e.noteModal));e.cancelNote?.addEventListener("click",()=>closeModal(e.noteModal));e.noteForm?.addEventListener("submit",createNote);
  e.openManual?.addEventListener("click",ev=>openManual(ev.currentTarget));e.manualClose?.addEventListener("click",()=>closeModal(e.manualModal));e.manualCancel?.addEventListener("click",()=>closeModal(e.manualModal));e.manualForm?.addEventListener("submit",createManualInvoice);e.manualAdd?.addEventListener("click",()=>addManualLine());e.manualItems?.addEventListener("input",calcManual);e.manualItems?.addEventListener("change",calcManual);e.mDiscount?.addEventListener("input",calcManual);e.mShipping?.addEventListener("input",calcManual);e.manualItems?.addEventListener("click",ev=>{const b=ev.target.closest(".facturacion-line-remove");if(!b)return;if(manualLines().length<=1){alert("La factura debe tener al menos una línea.");return;}b.closest(".facturacion-line-item")?.remove();calcManual();});
  e.openCfg?.addEventListener("click",ev=>openConfig(ev.currentTarget));e.cfgClose?.addEventListener("click",()=>closeModal(e.cfgModal));e.cfgCancel?.addEventListener("click",()=>closeModal(e.cfgModal));e.cfgForm?.addEventListener("submit",saveConfig);
  e.detailClose?.addEventListener("click",()=>closeModal(e.detailModal));e.detailClose2?.addEventListener("click",()=>closeModal(e.detailModal));
  [e.noteModal,e.manualModal,e.cfgModal,e.detailModal].forEach(modal=>modal?.addEventListener("click",ev=>{if(ev.target===modal)closeModal(modal);}));
  document.addEventListener("keydown",ev=>{for(const modal of [e.detailModal,e.cfgModal,e.manualModal,e.noteModal]){if(modal&&!modal.hidden){trapModalKey(ev,modal);break;}}});
  e.body.addEventListener("click",ev=>{const view=ev.target.closest("button[data-invoice-view]");if(view){openDetail(getDoc(view.dataset.invoiceView),view);return;}const dl=ev.target.closest("button[data-invoice-download]");if(dl){downloadPdf(getDoc(dl.dataset.invoiceDownload));return;}const pr=ev.target.closest("button[data-invoice-print]");if(pr){printPdf(getDoc(pr.dataset.invoicePrint));return;}const mail=ev.target.closest("button[data-invoice-email]");if(mail){sendEmail(getDoc(mail.dataset.invoiceEmail),mail);return;}const can=ev.target.closest("button[data-invoice-cancel]");if(can)cancelDoc(getDoc(can.dataset.invoiceCancel));});

  if(e.fecha&&!e.fecha.value)e.fecha.value=today();
  db.collection("pedidos").onSnapshot(s=>{orders=[];s.forEach(d=>orders.push({id:d.id,...d.data()}));renderOrders();},err=>{console.error("Pedidos facturación:",err);setMsg("No fue posible cargar pedidos.",true);});
  CFG.onSnapshot(s=>{config=normalizedConfig(s.exists?s.data():null);renderConfigStatus();renderPreview();},err=>{console.error("Configuración facturación:",err);config=normalizedConfig(null);renderConfigStatus();});
  C.onSnapshot(s=>{docs=[];s.forEach(d=>{const x={id:d.id,...d.data()};if(isInternal(x))docs.push(x);});refresh();},err=>{console.error("Facturación interna:",err);clear(e.body);const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=7;td.textContent="No fue posible cargar Facturación SIXTEEN.";tr.append(td);e.body.append(tr);});
});
