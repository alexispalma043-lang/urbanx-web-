// @ts-nocheck
(function () {
  "use strict";

  const LOCAL_KEY = "sixteen_payment_config";

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
        "Realiza la transferencia y conserva el comprobante. " +
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
        "El pago con tarjeta se realiza en una pasarela externa segura. " +
        "El enlace se muestra después de registrar el pedido y el pago se verifica por separado."
    },
    efectivo: {
      activo: true,
      nota:
        "Paga al recibir tu pedido. Disponible únicamente cuando SIXTEEN confirme la entrega."
    }
  };

  function text(value, max = 1000) {
    return String(value == null ? "" : value)
      .trim()
      .slice(0, max);
  }

  function bool(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function validHttpsUrl(value) {
    const url = text(value, 600);
    if (!url) return false;

    try {
      return new URL(url).protocol === "https:";
    } catch (_) {
      return false;
    }
  }

  // Solo conserva campos públicos conocidos. Así una propiedad accidental o
  // sensible agregada al documento nunca se propaga al Checkout/localStorage.
  function normalize(raw) {
    const input = raw && typeof raw === "object" ? raw : {};
    const t = input.transferencia && typeof input.transferencia === "object"
      ? input.transferencia
      : {};
    const q = input.qr && typeof input.qr === "object" ? input.qr : {};
    const c = input.tarjeta && typeof input.tarjeta === "object" ? input.tarjeta : {};
    const e = input.efectivo && typeof input.efectivo === "object" ? input.efectivo : {};

    return {
      version: 1,
      transferencia: {
        activo: bool(t.activo, DEFAULTS.transferencia.activo),
        banco: text(t.banco, 100),
        tipoCuenta: text(t.tipoCuenta, 80),
        numeroCuenta: text(t.numeroCuenta, 60),
        titular: text(t.titular, 160),
        identificacion: text(t.identificacion, 20),
        nota: text(t.nota, 500)
      },
      qr: {
        activo: bool(q.activo, DEFAULTS.qr.activo),
        nombre: text(q.nombre, 80) || "Pago QR",
        imagenUrl: text(q.imagenUrl, 500),
        nota: text(q.nota, 500)
      },
      tarjeta: {
        activo: bool(c.activo, DEFAULTS.tarjeta.activo),
        proveedor: text(c.proveedor, 100),
        urlPago: text(c.urlPago, 500),
        nota: text(c.nota, 500)
      },
      efectivo: {
        activo: bool(e.activo, DEFAULTS.efectivo.activo),
        nota: text(e.nota, 500)
      }
    };
  }

  function readLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? normalize(JSON.parse(raw)) : normalize(DEFAULTS);
    } catch (_) {
      return normalize(DEFAULTS);
    }
  }

  function saveLocal(config) {
    const normalized = normalize(config);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(normalized));
    } catch (_) {}
    return normalized;
  }

  async function loadWithStatus(db) {
    let config = readLocal();

    if (!db || typeof db.collection !== "function") {
      return {
        config,
        remoteLoaded: false,
        reason: "Firestore no está disponible."
      };
    }

    try {
      const snapshot = await db
        .collection("configuracion_pagos")
        .doc("principal")
        .get({ source: "server" });

      if (!snapshot.exists) {
        return {
          config: normalize(DEFAULTS),
          remoteLoaded: false,
          reason: "No existe una configuración de pagos publicada."
        };
      }

      config = normalize(snapshot.data());
      saveLocal(config);

      return {
        config,
        remoteLoaded: true,
        reason: ""
      };
    } catch (error) {
      console.warn(
        "SIXTEEN pagos: no fue posible cargar la configuración remota.",
        error
      );

      return {
        config,
        remoteLoaded: false,
        reason: "No pudimos verificar los métodos de pago."
      };
    }
  }

  async function load(db) {
    const result = await loadWithStatus(db);
    return result.config;
  }

  function name(method, config) {
    const cfg = normalize(config);
    const names = {
      transferencia: "Transferencia bancaria",
      qr: text(cfg.qr.nombre, 80) || "Pago QR",
      tarjeta: cfg.tarjeta.proveedor
        ? "Tarjeta · " + text(cfg.tarjeta.proveedor, 100)
        : "Tarjeta de crédito / débito",
      efectivo: "Pago contra entrega"
    };

    return names[method] || "Por confirmar";
  }

  function active(method, config) {
    const cfg = normalize(config);
    return cfg[method]?.activo === true;
  }

  function ready(method, config) {
    const cfg = normalize(config);
    if (!active(method, cfg)) return false;

    if (method === "transferencia") {
      return Boolean(
        text(cfg.transferencia.banco, 100) &&
        text(cfg.transferencia.numeroCuenta, 60) &&
        text(cfg.transferencia.titular, 160)
      );
    }

    if (method === "qr") {
      return Boolean(
        text(cfg.qr.nombre, 80) &&
        validHttpsUrl(cfg.qr.imagenUrl)
      );
    }

    if (method === "tarjeta") {
      return Boolean(
        text(cfg.tarjeta.proveedor, 100) &&
        validHttpsUrl(cfg.tarjeta.urlPago)
      );
    }

    if (method === "efectivo") return true;

    return false;
  }

  function initialState(method) {
    const states = {
      transferencia: "Por verificar",
      qr: "Por verificar",
      tarjeta: "Pendiente de pasarela",
      efectivo: "Pendiente contra entrega"
    };

    return states[method] || "Pendiente";
  }

  function instructions(method, config) {
    const cfg = normalize(config);

    if (method === "transferencia") {
      const d = cfg.transferencia;
      return {
        title: "Datos para transferencia",
        lines: [
          d.banco ? "Banco: " + text(d.banco, 100) : "",
          d.tipoCuenta ? "Tipo de cuenta: " + text(d.tipoCuenta, 80) : "",
          d.numeroCuenta ? "Cuenta: " + text(d.numeroCuenta, 60) : "",
          d.titular ? "Titular: " + text(d.titular, 160) : "",
          d.identificacion
            ? "Identificación: " + text(d.identificacion, 20)
            : "",
          text(d.nota, 500)
        ].filter(Boolean),
        imageUrl: "",
        actionUrl: ""
      };
    }

    if (method === "qr") {
      const d = cfg.qr;
      return {
        title: text(d.nombre, 80) || "Pago QR",
        lines: [text(d.nota, 500)].filter(Boolean),
        imageUrl: validHttpsUrl(d.imagenUrl) ? text(d.imagenUrl, 500) : "",
        actionUrl: ""
      };
    }

    if (method === "tarjeta") {
      const d = cfg.tarjeta;
      return {
        title: d.proveedor
          ? "Pago seguro con " + text(d.proveedor, 100)
          : "Pago con tarjeta",
        lines: [
          text(d.nota, 500),
          d.urlPago
            ? "Registra primero tu pedido. El enlace de pago seguro aparecerá en la confirmación."
            : "La pasarela todavía no está configurada."
        ].filter(Boolean),
        imageUrl: "",
        actionUrl: validHttpsUrl(d.urlPago) ? text(d.urlPago, 500) : ""
      };
    }

    if (method === "efectivo") {
      return {
        title: "Pago contra entrega",
        lines: [text(cfg.efectivo.nota, 500)].filter(Boolean),
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
    DEFAULTS: clone(DEFAULTS),
    normalize,
    readLocal,
    saveLocal,
    load,
    loadWithStatus,
    name,
    active,
    ready,
    initialState,
    instructions,
    validHttpsUrl
  };
})();
