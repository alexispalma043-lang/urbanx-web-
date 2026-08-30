// @ts-nocheck
(function () {
  "use strict";

  let initialized =
    false;

  function text(value) {
    return String(
      value == null
        ? ""
        : value
    ).trim();
  }

  function money(value) {
    return new Intl.NumberFormat(
      "en-US",
      {
        style:
          "currency",
        currency:
          "USD"
      }
    ).format(
      Number(
        value
      )
      ||
      0
    );
  }

  function typeName(item) {
    const map = {
      FACTURA:
        "Factura",
      NOTA_CREDITO:
        "Nota de crédito",
      NOTA_DEBITO:
        "Nota de débito",
      GUIA_REMISION:
        "Guía de remisión",
      RETENCION:
        "Comprobante de retención"
    };

    return map[
      text(
        item?.tipoDocumento
      )
    ]
    ||
    "Comprobante electrónico";
  }

  function recipientEmail(item) {
    return text(
      item?.comprador?.email
      ||
      item?.sujetoRetenido?.email
      ||
      item?.destinatario?.email
    )
      .toLowerCase();
  }

  function recipientName(item) {
    return text(
      item?.comprador?.razonSocial
      ||
      item?.sujetoRetenido?.razonSocial
      ||
      item?.destinatario?.razonSocial
      ||
      "Cliente SIXTEEN"
    )
      .slice(
        0,
        120
      );
  }

  function accountUrl() {
    try {
      return new URL(
        "../cuenta.html#comprobantesSection",
        window.location.href
      ).href;
    } catch (_) {
      return "";
    }
  }

  function config() {
    const raw =
      window.SIXTEEN_EMAILJS_CONFIG
      ||
      null;

    if (
      !raw
      ||
      raw.enabled !==
      true
    ) {
      return null;
    }

    const publicKey =
      text(
        raw.publicKey
      );

    const serviceId =
      text(
        raw.serviceId
      );

    const templateId =
      text(
        raw.templateId
      );

    if (
      !publicKey
      ||
      !serviceId
      ||
      !templateId
    ) {
      return null;
    }

    return {
      publicKey,
      serviceId,
      templateId
    };
  }

  function init() {
    const cfg =
      config();

    if (!cfg) {
      throw new Error(
        "EmailJS no está configurado."
      );
    }

    if (
      typeof window.emailjs ===
      "undefined"
    ) {
      throw new Error(
        "EmailJS SDK no está disponible."
      );
    }

    if (!initialized) {
      window.emailjs.init({
        publicKey:
          cfg.publicKey
      });

      initialized =
        true;
    }

    return cfg;
  }

  function params(item) {
    const type =
      typeName(
        item
      );

    const number =
      text(
        item?.numero
        ||
        item?.id
      )
      ||
      "—";

    const authorization =
      text(
        item?.numeroAutorizacion
        ||
        item?.autorizacion
        ||
        item?.claveAcceso
      );

    const date =
      text(
        item?.fechaAutorizacionTexto
        ||
        item?.fechaEmision
      );

    const total =
      item?.tipoDocumento ===
      "GUIA_REMISION"
        ? "Sin valor monetario"
        : money(
            item?.totales?.totalRetenido
            ??
            item?.totales?.importeTotal
          );

    const link =
      accountUrl();

    const message =
      [
        "Tu "
        +
        type.toLowerCase()
        +
        " "
        +
        number
        +
        " se encuentra AUTORIZADO por el SRI.",

        authorization
          ? "Autorización: " + authorization + "."
          : "",

        date
          ? "Fecha: " + date + "."
          : "",

        "Puedes consultar y descargar el RIDE y XML desde Mi Cuenta.",

        link
          ? "Acceso: " + link
          : "",

        "SIXTEEN no solicita datos de tarjeta, contraseñas ni claves por correo."
      ]
        .filter(Boolean)
        .join(
          "\n\n"
        );

    return {
      to_email:
        recipientEmail(
          item
        ),

      to_name:
        recipientName(
          item
        ),

      email_title:
        "SIXTEEN · "
        +
        type
        +
        " autorizada",

      email_heading:
        type
        +
        " AUTORIZADA",

      email_message:
        message,

      order_number:
        number,

      order_status:
        "AUTORIZADO",

      order_total:
        total,

      customer_phone:
        text(
          item?.comprador?.telefono
        ),

      shipping_city:
        "",

      brand_name:
        "SIXTEEN",

      brand_tagline:
        "URBAN LUXURY",

      document_type:
        type,

      document_number:
        number,

      authorization_number:
        authorization,

      account_url:
        link
    };
  }

  async function send(item) {
    if (
      !item
      ||
      text(
        item.estado
      )
      !==
      "AUTORIZADO"
    ) {
      throw new Error(
        "El comprobante debe estar AUTORIZADO antes de enviar el correo."
      );
    }

    const email =
      recipientEmail(
        item
      );

    if (
      !email
      ||
      !email.includes(
        "@"
      )
    ) {
      throw new Error(
        "El comprobante no tiene un correo de destinatario válido."
      );
    }

    const cfg =
      init();

    await window.emailjs.send(
      cfg.serviceId,
      cfg.templateId,
      params(
        item
      )
    );

    return {
      ok:
        true,

      email,

      accountUrl:
        accountUrl()
    };
  }

  window.SIXTEEN_COMPROBANTE_EMAIL = {
    send,
    params,
    recipientEmail,
    recipientName,
    accountUrl,
    typeName
  };
})();
