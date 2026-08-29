// @ts-nocheck
(function () {
  "use strict";

  const LOCAL_KEY =
    "sixteen_payment_config";

  const DEFAULTS = {
    version: 1,

    transferencia: {
      activo: true,
      banco: "",
      tipoCuenta: "",
      numeroCuenta: "",
      titular: "",
      identificacion: "",
      nota:
        "Realiza la transferencia y conserva el comprobante. "
        +
        "El pedido se confirmará después de verificar el pago."
    },

    qr: {
      activo: false,
      nombre: "Pago QR",
      imagenUrl: "",
      nota:
        "Escanea el QR desde tu aplicación bancaria y conserva el comprobante."
    },

    tarjeta: {
      activo: false,
      proveedor: "",
      urlPago: "",
      nota:
        "El pago con tarjeta se realizará únicamente en una pasarela externa segura."
    },

    efectivo: {
      activo: true,
      nota:
        "Paga al recibir tu pedido. Disponible únicamente cuando SIXTEEN confirme la entrega."
    }
  };

  function text(value) {
    return String(
      value == null
        ? ""
        : value
    ).trim();
  }

  function bool(value, fallback) {
    return typeof value === "boolean"
      ? value
      : fallback;
  }

  function clone(value) {
    return JSON.parse(
      JSON.stringify(value)
    );
  }

  function normalize(raw) {
    const input =
      raw && typeof raw === "object"
        ? raw
        : {};

    return {
      version: 1,

      transferencia: {
        ...clone(DEFAULTS.transferencia),
        ...(input.transferencia || {}),
        activo:
          bool(
            input.transferencia?.activo,
            DEFAULTS.transferencia.activo
          )
      },

      qr: {
        ...clone(DEFAULTS.qr),
        ...(input.qr || {}),
        activo:
          bool(
            input.qr?.activo,
            DEFAULTS.qr.activo
          )
      },

      tarjeta: {
        ...clone(DEFAULTS.tarjeta),
        ...(input.tarjeta || {}),
        activo:
          bool(
            input.tarjeta?.activo,
            DEFAULTS.tarjeta.activo
          )
      },

      efectivo: {
        ...clone(DEFAULTS.efectivo),
        ...(input.efectivo || {}),
        activo:
          bool(
            input.efectivo?.activo,
            DEFAULTS.efectivo.activo
          )
      }
    };
  }

  function readLocal() {
    try {
      const raw =
        localStorage.getItem(
          LOCAL_KEY
        );

      return raw
        ? normalize(
            JSON.parse(raw)
          )
        : normalize(DEFAULTS);

    } catch (_) {
      return normalize(DEFAULTS);
    }
  }

  function saveLocal(config) {
    const normalized =
      normalize(config);

    try {
      localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify(normalized)
      );
    } catch (_) {}

    return normalized;
  }

  async function load(db) {
    let config =
      readLocal();

    if (
      !db
      ||
      typeof db.collection !== "function"
    ) {
      return config;
    }

    try {
      const snapshot =
        await db
          .collection(
            "configuracion_pagos"
          )
          .doc(
            "principal"
          )
          .get();

      if (snapshot.exists) {
        config =
          normalize(
            snapshot.data()
          );

        saveLocal(config);
      }

    } catch (error) {
      console.warn(
        "SIXTEEN pagos: usando configuración local.",
        error
      );
    }

    return config;
  }

  function name(method, config) {
    const cfg =
      normalize(config);

    const names = {
      transferencia:
        "Transferencia bancaria",

      qr:
        text(
          cfg.qr.nombre
        )
        ||
        "Pago QR",

      tarjeta:
        cfg.tarjeta.proveedor
          ? "Tarjeta · " + text(cfg.tarjeta.proveedor)
          : "Tarjeta de crédito / débito",

      efectivo:
        "Pago contra entrega"
    };

    return names[method]
      ||
      "Por confirmar";
  }

  function active(method, config) {
    const cfg =
      normalize(config);

    return cfg[method]?.activo === true;
  }

  function initialState(method) {
    const states = {
      transferencia:
        "Por verificar",

      qr:
        "Por verificar",

      tarjeta:
        "Pendiente de pasarela",

      efectivo:
        "Pendiente contra entrega"
    };

    return states[method]
      ||
      "Pendiente";
  }

  function instructions(method, config) {
    const cfg =
      normalize(config);

    if (method === "transferencia") {
      const d =
        cfg.transferencia;

      return {
        title:
          "Datos para transferencia",
        lines:
          [
            d.banco
              ? "Banco: " + text(d.banco)
              : "",
            d.tipoCuenta
              ? "Tipo de cuenta: " + text(d.tipoCuenta)
              : "",
            d.numeroCuenta
              ? "Cuenta: " + text(d.numeroCuenta)
              : "",
            d.titular
              ? "Titular: " + text(d.titular)
              : "",
            d.identificacion
              ? "Identificación: " + text(d.identificacion)
              : "",
            text(d.nota)
          ]
            .filter(Boolean),
        imageUrl: "",
        actionUrl: ""
      };
    }

    if (method === "qr") {
      const d =
        cfg.qr;

      return {
        title:
          text(d.nombre)
          ||
          "Pago QR",
        lines:
          [
            text(d.nota)
          ]
            .filter(Boolean),
        imageUrl:
          text(d.imagenUrl),
        actionUrl: ""
      };
    }

    if (method === "tarjeta") {
      const d =
        cfg.tarjeta;

      return {
        title:
          d.proveedor
            ? "Pago seguro con " + text(d.proveedor)
            : "Pago con tarjeta",
        lines:
          [
            text(d.nota),
            d.urlPago
              ? "Usa el botón de pago seguro. SIXTEEN no solicita ni almacena datos de tarjeta."
              : "La pasarela todavía no está configurada."
          ]
            .filter(Boolean),
        imageUrl: "",
        actionUrl:
          text(d.urlPago)
      };
    }

    if (method === "efectivo") {
      return {
        title:
          "Pago contra entrega",
        lines:
          [
            text(
              cfg.efectivo.nota
            )
          ]
            .filter(Boolean),
        imageUrl: "",
        actionUrl: ""
      };
    }

    return {
      title: "",
      lines: [],
      imageUrl: "",
      actionUrl: ""
    };
  }

  window.SIXTEEN_PAYMENTS = {
    LOCAL_KEY,
    DEFAULTS:
      clone(DEFAULTS),
    normalize,
    readLocal,
    saveLocal,
    load,
    name,
    active,
    initialState,
    instructions
  };
})();
