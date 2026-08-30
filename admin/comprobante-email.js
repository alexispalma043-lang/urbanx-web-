// @ts-nocheck
(function(){
  "use strict";
  let initialized=false;
  const text=v=>String(v==null?"":v).trim();
  const money=v=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(v)||0);
  const typeName=i=>({FACTURA:"Factura SIXTEEN",NOTA_CREDITO:"Nota de crédito SIXTEEN",NOTA_DEBITO:"Nota de débito SIXTEEN"}[text(i?.tipoDocumento)]||"Documento SIXTEEN");
  function cfg(){const r=window.SIXTEEN_EMAILJS_CONFIG||null;if(!r||r.enabled!==true)return null;const x={publicKey:text(r.publicKey),serviceId:text(r.serviceId),templateId:text(r.templateId)};return x.publicKey&&x.serviceId&&x.templateId?x:null;}
  function init(){const c=cfg();if(!c)throw new Error("EmailJS no está configurado.");if(typeof window.emailjs==="undefined")throw new Error("EmailJS SDK no está disponible.");if(!initialized){window.emailjs.init({publicKey:c.publicKey});initialized=true;}return c;}
  function accountUrl(){try{return new URL("../cuenta.html#comprobantesSection",window.location.href).href}catch(_){return ""}}
  function params(item){const to=text(item?.comprador?.email).toLowerCase();const name=text(item?.comprador?.razonSocial||"Cliente SIXTEEN");const type=typeName(item);const number=text(item?.numero||item?.id)||"—";const total=money(item?.totales?.importeTotal??item?.totales?.total);const link=accountUrl();return {to_email:to,to_name:name,subject:`${type} ${number}`,document_type:type,document_number:number,document_total:total,message:[`SIXTEEN emitió tu ${type.toLowerCase()} ${number}.`,`Total: ${total}.`,`Puedes consultar el documento desde Mi Cuenta y usar la opción PDF / imprimir.`,link?`Acceso: ${link}`:"",`Este documento es comercial interno y no representa autorización tributaria del SRI.`].filter(Boolean).join("\n\n")};}
  async function send(item){const c=init();const p=params(item);if(!p.to_email)throw new Error("El cliente no tiene correo registrado.");return window.emailjs.send(c.serviceId,c.templateId,p);}
  window.SIXTEEN_COMPROBANTE_EMAIL={send,params,typeName};
})();
