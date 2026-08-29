// @ts-nocheck
(function (root, factory) {
  const api = factory();

  if (
    typeof module !== "undefined"
    &&
    module.exports
  ) {
    module.exports = api;
  }

  if (root) {
    root.SIXTEEN_RIDE = api;
  }
})(
  typeof window !== "undefined"
    ? window
    : null,
  function () {

    "use strict";

    function text(value) {
      return String(
        value == null
          ? ""
          : value
      ).trim();
    }

    function number(value) {
      const n =
        Number(value);

      return Number.isFinite(n)
        ? n
        : 0;
    }

    function money(value) {
      return new Intl.NumberFormat(
        "en-US",
        {
          style: "currency",
          currency: "USD"
        }
      ).format(
        number(value)
      );
    }

    function escapeHtml(value) {
      return text(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function typeName(item) {
      const map = {
        FACTURA:
          "FACTURA",
        NOTA_CREDITO:
          "NOTA DE CRÉDITO",
        NOTA_DEBITO:
          "NOTA DE DÉBITO",
        GUIA_REMISION:
          "GUÍA DE REMISIÓN",
        RETENCION:
          "COMPROBANTE DE RETENCIÓN"
      };

      return map[
        text(
          item?.tipoDocumento
        )
      ]
      ||
      "COMPROBANTE ELECTRÓNICO";
    }

    function isAuthorized(item) {
      return text(
        item?.estado
      )
        .toUpperCase()
        ===
        "AUTORIZADO";
    }

    function groupedKey(value) {
      const raw =
        text(value)
          .replace(
            /\s+/g,
            ""
          );

      return raw
        .replace(
          /(.{4})/g,
          "$1 "
        )
        .trim();
    }

    function safeDate(value) {
      if (!value) {
        return "";
      }

      if (
        typeof value === "string"
      ) {
        return value;
      }

      if (
        typeof value?.toDate ===
        "function"
      ) {
        return value
          .toDate()
          .toLocaleString(
            "es-EC"
          );
      }

      if (
        value instanceof Date
      ) {
        return value
          .toLocaleString(
            "es-EC"
          );
      }

      return text(value);
    }

    function detailTable(item) {
      const type =
        text(
          item?.tipoDocumento
        );

      if (
        type ===
        "RETENCION"
      ) {
        const rows =
          (
            Array.isArray(
              item?.retenciones
            )
              ? item.retenciones
              : []
          )
            .map(
              line => `
                <tr>
                  <td>${
                    escapeHtml(
                      line.codigo === "1"
                        ? "Renta"
                        : line.codigo === "2"
                          ? "IVA"
                          : "ISD"
                    )
                  }</td>
                  <td>${escapeHtml(line.codigoRetencion)}</td>
                  <td class="num">${money(line.baseImponible)}</td>
                  <td class="num">${escapeHtml(line.porcentajeRetener)}%</td>
                  <td class="num">${money(line.valorRetenido)}</td>
                </tr>
              `
            )
            .join("");

        return `
          <section class="ride-section">
            <h3>Detalle de retenciones</h3>
            <table>
              <thead>
                <tr>
                  <th>Impuesto</th>
                  <th>Código</th>
                  <th class="num">Base</th>
                  <th class="num">%</th>
                  <th class="num">Valor retenido</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </section>
        `;
      }

      if (
        type ===
        "NOTA_DEBITO"
      ) {
        return `
          <section class="ride-section">
            <h3>Motivo del débito</h3>
            <table>
              <thead>
                <tr>
                  <th>Razón</th>
                  <th class="num">Base</th>
                  <th class="num">IVA</th>
                  <th class="num">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${escapeHtml(item?.motivos?.[0]?.razon || "—")}</td>
                  <td class="num">${money(item?.totales?.totalSinImpuestos)}</td>
                  <td class="num">${money(item?.totales?.totalIva)}</td>
                  <td class="num">${money(item?.totales?.importeTotal)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        `;
      }

      const details =
        Array.isArray(
          item?.detalles
        )
          ? item.detalles
          : [];

      const rows =
        details.map(
          detail => {

            const variant =
              [
                detail.color
                  ? "Color: " + text(detail.color)
                  : "",
                detail.talla
                  ? "Talla: " + text(detail.talla)
                  : ""
              ]
                .filter(Boolean)
                .join(" · ");

            if (
              type ===
              "GUIA_REMISION"
            ) {
              return `
                <tr>
                  <td>${escapeHtml(detail.codigoPrincipal || detail.codigoInterno)}</td>
                  <td>
                    ${escapeHtml(detail.descripcion)}
                    ${
                      variant
                        ? '<small>' + escapeHtml(variant) + '</small>'
                        : ""
                    }
                  </td>
                  <td class="num">${number(detail.cantidad).toFixed(2)}</td>
                </tr>
              `;
            }

            return `
              <tr>
                <td>${escapeHtml(detail.codigoPrincipal || detail.codigoInterno)}</td>
                <td>
                  ${escapeHtml(detail.descripcion)}
                  ${
                    variant
                      ? '<small>' + escapeHtml(variant) + '</small>'
                      : ""
                  }
                </td>
                <td class="num">${number(detail.cantidad).toFixed(2)}</td>
                <td class="num">${money(detail.precioUnitario)}</td>
                <td class="num">${money(detail.descuento)}</td>
                <td class="num">${money(detail.precioTotalSinImpuesto)}</td>
              </tr>
            `;
          }
        )
        .join("");

      if (
        type ===
        "GUIA_REMISION"
      ) {
        return `
          <section class="ride-section">
            <h3>Bienes transportados</h3>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th class="num">Cantidad</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </section>
        `;
      }

      return `
        <section class="ride-section">
          <h3>Detalle</h3>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th class="num">Cant.</th>
                <th class="num">P. unit.</th>
                <th class="num">Desc.</th>
                <th class="num">Subtotal</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </section>
      `;
    }

    function subjectBlocks(item) {
      const type =
        text(
          item?.tipoDocumento
        );

      if (
        type ===
        "GUIA_REMISION"
      ) {
        return `
          <div class="info-grid">
            <div class="info-card">
              <span class="label">DESTINATARIO</span>
              <strong>${escapeHtml(item?.destinatario?.razonSocial || "—")}</strong>
              <p>Identificación: ${escapeHtml(item?.destinatario?.identificacion || "—")}</p>
              <p>Dirección: ${escapeHtml(item?.destinatario?.direccion || "—")}</p>
              <p>Motivo: ${escapeHtml(item?.destinatario?.motivoTraslado || "—")}</p>
              ${
                item?.transporte?.ruta
                  ? `<p>Ruta: ${escapeHtml(item.transporte.ruta)}</p>`
                  : ""
              }
            </div>

            <div class="info-card">
              <span class="label">TRANSPORTE</span>
              <strong>${escapeHtml(item?.transporte?.razonSocialTransportista || "—")}</strong>
              <p>Identificación: ${escapeHtml(item?.transporte?.identificacionTransportista || "—")}</p>
              <p>Placa: ${escapeHtml(item?.transporte?.placa || "—")}</p>
              <p>Partida: ${escapeHtml(item?.transporte?.dirPartida || "—")}</p>
              <p>Período: ${escapeHtml(item?.transporte?.fechaIniTransporte || "—")} a ${escapeHtml(item?.transporte?.fechaFinTransporte || "—")}</p>
            </div>
          </div>
        `;
      }

      if (
        type ===
        "RETENCION"
      ) {
        return `
          <div class="info-grid">
            <div class="info-card">
              <span class="label">SUJETO RETENIDO</span>
              <strong>${escapeHtml(item?.sujetoRetenido?.razonSocial || "—")}</strong>
              <p>Identificación: ${escapeHtml(item?.sujetoRetenido?.identificacion || "—")}</p>
              <p>Parte relacionada: ${escapeHtml(item?.sujetoRetenido?.parteRel || "NO")}</p>
              <p>Período fiscal: ${escapeHtml(item?.periodoFiscal || "—")}</p>
            </div>

            <div class="info-card">
              <span class="label">DOCUMENTO DE SUSTENTO</span>
              <strong>${escapeHtml(item?.documentoSustento?.numero || "—")}</strong>
              <p>Código sustento: ${escapeHtml(item?.documentoSustento?.codSustento || "—")}</p>
              <p>Código documento: ${escapeHtml(item?.documentoSustento?.codDocSustento || "—")}</p>
              <p>Fecha: ${escapeHtml(item?.documentoSustento?.fechaEmision || "—")}</p>
              <p>Importe: ${money(item?.documentoSustento?.importeTotal)}</p>
            </div>
          </div>
        `;
      }

      const buyer =
        item?.comprador
        ||
        {};

      const support =
        (
          type ===
          "NOTA_CREDITO"
          ||
          type ===
          "NOTA_DEBITO"
        )
          ? `
            <div class="info-card">
              <span class="label">DOCUMENTO MODIFICADO</span>
              <strong>${escapeHtml(item?.documentoSustento?.numero || item?.documentoSustentoNumero || "—")}</strong>
              <p>Fecha sustento: ${escapeHtml(item?.documentoSustento?.fechaEmision || "—")}</p>
              ${
                type === "NOTA_CREDITO"
                  ? `<p>Motivo: ${escapeHtml(item?.motivo || "—")}</p>`
                  : `<p>Razón: ${escapeHtml(item?.motivos?.[0]?.razon || "—")}</p>`
              }
            </div>
          `
          : `
            <div class="info-card">
              <span class="label">PEDIDO</span>
              <strong>${escapeHtml(item?.pedidoNumero || item?.pedidoId || "—")}</strong>
              <p>Forma de pago: ${escapeHtml(item?.pago?.metodo || item?.metodoPago || "—")}</p>
              <p>Forma SRI: ${escapeHtml(item?.pago?.formaPago || "—")}</p>
            </div>
          `;

      return `
        <div class="info-grid">
          <div class="info-card">
            <span class="label">CLIENTE</span>
            <strong>${escapeHtml(buyer.razonSocial || "—")}</strong>
            <p>Identificación: ${escapeHtml(buyer.identificacion || "—")}</p>
            <p>Email: ${escapeHtml(buyer.email || "—")}</p>
            ${
              buyer.direccion
                ? `<p>Dirección: ${escapeHtml(buyer.direccion)}</p>`
                : ""
            }
          </div>

          ${support}
        </div>
      `;
    }

    function totalsBlock(item) {
      const type =
        text(
          item?.tipoDocumento
        );

      if (
        type ===
        "GUIA_REMISION"
      ) {
        return "";
      }

      if (
        type ===
        "RETENCION"
      ) {
        return `
          <div class="totals">
            <div>
              <span>Importe documento sustento</span>
              <strong>${money(item?.documentoSustento?.importeTotal)}</strong>
            </div>
            <div class="grand">
              <span>Total retenido</span>
              <strong>${money(item?.totales?.totalRetenido ?? item?.totales?.importeTotal)}</strong>
            </div>
          </div>
        `;
      }

      const taxRows =
        (
          Array.isArray(
            item?.totales?.taxes
          )
            ? item.totales.taxes
            : []
        )
          .map(
            tax => `
              <div>
                <span>
                  IVA ${escapeHtml(tax.tarifa)}%
                  · Base ${money(tax.baseImponible)}
                </span>
                <strong>${money(tax.valor)}</strong>
              </div>
            `
          )
          .join("");

      const totalLabel =
        type ===
        "NOTA_CREDITO"
          ? "Valor modificación"
          : type ===
            "NOTA_DEBITO"
            ? "Valor total débito"
            : "TOTAL";

      return `
        <div class="totals">
          <div>
            <span>Subtotal sin impuestos</span>
            <strong>${money(item?.totales?.totalSinImpuestos)}</strong>
          </div>
          ${
            number(
              item?.totales?.totalDescuento
            ) > 0
              ? `
                <div>
                  <span>Descuento</span>
                  <strong>${money(item.totales.totalDescuento)}</strong>
                </div>
              `
              : ""
          }
          ${taxRows}
          <div class="grand">
            <span>${escapeHtml(totalLabel)}</span>
            <strong>${money(item?.totales?.importeTotal)}</strong>
          </div>
        </div>
      `;
    }

    function buildHtml(item) {
      if (!item) {
        throw new Error(
          "No existe comprobante para generar el RIDE."
        );
      }

      const authorized =
        isAuthorized(
          item
        );

      const authNumber =
        text(
          item.numeroAutorizacion
          ||
          item.autorizacion
          ||
          item.autorizacionSri
            ?.numeroAutorizacion
        );

      const authDate =
        safeDate(
          item.fechaAutorizacionTexto
          ||
          item.autorizacionSri
            ?.fechaAutorizacion
          ||
          item.fechaAutorizacion
        );

      const environment =
        String(
          item.ambiente
        )
        ===
        "2"
          ? "PRODUCCIÓN"
          : "PRUEBAS";

      const accessKey =
        text(
          item.claveAcceso
        );

      const legalState =
        authorized
          ? "AUTORIZADO POR EL SRI"
          : "BORRADOR · SIN AUTORIZACIÓN SRI";

      const statusClass =
        authorized
          ? "authorized"
          : "draft";

      return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  >
  <title>RIDE ${escapeHtml(item.numero || "")}</title>

  <style>
    *{
      box-sizing:border-box
    }

    @page{
      size:A4;
      margin:10mm
    }

    body{
      margin:0;
      background:#ececec;
      color:#171717;
      font-family:Arial,Helvetica,sans-serif
    }

    .ride-toolbar{
      position:sticky;
      top:0;
      z-index:10;
      display:flex;
      justify-content:center;
      gap:8px;
      padding:10px;
      background:#111
    }

    .ride-toolbar button{
      border:1px solid #c79a47;
      background:#17120a;
      color:#f2d18b;
      padding:10px 14px;
      font-weight:700;
      cursor:pointer
    }

    .ride-page{
      width:210mm;
      min-height:297mm;
      margin:16px auto;
      padding:12mm;
      background:#fff;
      box-shadow:0 12px 35px rgba(0,0,0,.18)
    }

    .status{
      margin-bottom:12px;
      padding:9px 12px;
      text-align:center;
      font-size:11px;
      font-weight:800;
      letter-spacing:.08em;
      border:1px solid
    }

    .status.authorized{
      border-color:#2f7c49;
      color:#21683a;
      background:#f0faf3
    }

    .status.draft{
      border-color:#9e2d2d;
      color:#8e2222;
      background:#fff4f4
    }

    .ride-head{
      display:grid;
      grid-template-columns:1.15fr .85fr;
      gap:12px
    }

    .brand,
    .document-box,
    .info-card,
    .access-box{
      border:1px solid #a9a9a9;
      padding:12px
    }

    .brand-name{
      margin:0 0 7px;
      font-size:17px
    }

    .brand p,
    .document-box p,
    .info-card p{
      margin:4px 0;
      font-size:10px;
      line-height:1.4
    }

    .document-box h1{
      margin:0 0 9px;
      font-size:17px
    }

    .document-number{
      margin:0 0 9px;
      font-size:14px;
      font-weight:800
    }

    .label{
      display:block;
      margin-bottom:6px;
      color:#666;
      font-size:8px;
      font-weight:700;
      letter-spacing:.1em
    }

    .info-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px;
      margin-top:10px
    }

    .info-card strong{
      display:block;
      margin-bottom:6px;
      font-size:11px
    }

    .ride-section{
      margin-top:14px
    }

    .ride-section h3{
      margin:0 0 7px;
      font-size:11px;
      text-transform:uppercase
    }

    table{
      width:100%;
      border-collapse:collapse;
      font-size:9px
    }

    th,
    td{
      border:1px solid #b6b6b6;
      padding:6px;
      vertical-align:top
    }

    th{
      background:#f2f2f2
    }

    td small{
      display:block;
      margin-top:3px;
      color:#666
    }

    .num{
      text-align:right;
      white-space:nowrap
    }

    .totals{
      width:min(360px,100%);
      margin:12px 0 0 auto;
      border:1px solid #aaa;
      padding:8px 10px
    }

    .totals div{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:15px;
      padding:4px 0;
      font-size:10px
    }

    .totals .grand{
      margin-top:5px;
      padding-top:8px;
      border-top:1px solid #777;
      font-size:12px
    }

    .access-box{
      margin-top:14px
    }

    .access-key{
      margin-top:6px;
      font-family:"Courier New",monospace;
      font-size:10px;
      font-weight:700;
      line-height:1.5;
      word-break:break-word
    }

    .auth-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:8px;
      margin-top:9px
    }

    .auth-grid div{
      padding-top:7px;
      border-top:1px dotted #999;
      font-size:9px
    }

    .ride-footer{
      margin-top:14px;
      padding-top:8px;
      border-top:1px solid #bbb;
      color:#666;
      font-size:8px;
      line-height:1.45
    }

    @media(max-width:850px){
      .ride-page{
        width:auto;
        min-height:0;
        margin:0;
        padding:16px
      }

      .ride-head,
      .info-grid,
      .auth-grid{
        grid-template-columns:1fr
      }
    }

    @media print{
      body{
        background:#fff
      }

      .ride-toolbar{
        display:none
      }

      .ride-page{
        width:auto;
        min-height:auto;
        margin:0;
        padding:0;
        box-shadow:none
      }
    }
  </style>
</head>

<body>

  <div class="ride-toolbar">
    <button onclick="window.print()">
      IMPRIMIR / GUARDAR PDF
    </button>
    <button onclick="window.close()">
      CERRAR
    </button>
  </div>

  <main class="ride-page">

    <div class="status ${statusClass}">
      ${escapeHtml(legalState)}
    </div>

    <section class="ride-head">

      <div class="brand">
        <span class="label">EMISOR</span>
        <h2 class="brand-name">
          ${escapeHtml(item?.emisor?.razonSocial || "SIXTEEN")}
        </h2>
        ${
          item?.emisor?.nombreComercial
            ? `<p><strong>${escapeHtml(item.emisor.nombreComercial)}</strong></p>`
            : ""
        }
        <p>RUC: ${escapeHtml(item?.emisor?.ruc || "—")}</p>
        <p>Matriz: ${escapeHtml(item?.emisor?.dirMatriz || "—")}</p>
        ${
          item?.emisor?.dirEstablecimiento
            ? `<p>Establecimiento: ${escapeHtml(item.emisor.dirEstablecimiento)}</p>`
            : ""
        }
      </div>

      <div class="document-box">
        <span class="label">RIDE · REPRESENTACIÓN IMPRESA</span>
        <h1>${escapeHtml(typeName(item))}</h1>
        <div class="document-number">
          ${escapeHtml(item.numero || "—")}
        </div>
        <p>Fecha emisión: <strong>${escapeHtml(item.fechaEmision || "—")}</strong></p>
        <p>Ambiente: <strong>${escapeHtml(environment)}</strong></p>
        <p>Estado: <strong>${escapeHtml(item.estado || "—")}</strong></p>
      </div>

    </section>

    ${subjectBlocks(item)}

    ${detailTable(item)}

    ${totalsBlock(item)}

    <section class="access-box">
      <span class="label">CLAVE DE ACCESO</span>
      <div class="access-key">
        ${escapeHtml(groupedKey(accessKey) || "—")}
      </div>

      <div class="auth-grid">
        <div>
          <span class="label">NÚMERO DE AUTORIZACIÓN</span>
          <strong>
            ${escapeHtml(
              authorized
                ? (
                    authNumber
                    ||
                    accessKey
                    ||
                    "—"
                  )
                : "PENDIENTE"
            )}
          </strong>
        </div>

        <div>
          <span class="label">FECHA DE AUTORIZACIÓN</span>
          <strong>
            ${escapeHtml(
              authorized
                ? (
                    authDate
                    ||
                    "—"
                  )
                : "PENDIENTE"
            )}
          </strong>
        </div>
      </div>
    </section>

    <footer class="ride-footer">
      ${
        authorized
          ? (
              "Este documento es una representación impresa del comprobante electrónico "
              +
              "registrado en SIXTEEN con estado AUTORIZADO."
            )
          : (
              "BORRADOR: este documento todavía no constituye un comprobante autorizado por el SRI. "
              +
              "La firma electrónica y autorización deben completarse antes de utilizarlo como RIDE autorizado."
            )
      }
    </footer>

  </main>

</body>
</html>
      `.trim();
    }

    function open(item) {
      if (
        typeof window ===
        "undefined"
      ) {
        return false;
      }

      const win =
        window.open(
          "",
          "_blank",
          "noopener,noreferrer"
        );

      if (!win) {
        return false;
      }

      win.document.open();
      win.document.write(
        buildHtml(
          item
        )
      );
      win.document.close();

      return true;
    }

    return {
      text,
      money,
      escapeHtml,
      typeName,
      isAuthorized,
      groupedKey,
      buildHtml,
      open
    };
  }
);
