// @ts-nocheck
document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  if (typeof firebase === "undefined" || !window.SIXTEEN_PAYMENTS) return;

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBFLPbBQPZy4ILeBRZ_kELi7KizlR1hgJo",
    authDomain: "urbanx-92e74.firebaseapp.com",
    projectId: "urbanx-92e74",
    storageBucket: "urbanx-92e74.firebasestorage.app",
    messagingSenderId: "830520272633",
    appId: "1:830520272633:web:ce7f2bf7abc8f86fec6428"
  };

  const APP_NAME = "sixteen-admin";
  let app = firebase.apps.find(item => item.name === APP_NAME);
  if (!app) app = firebase.initializeApp(FIREBASE_CONFIG, APP_NAME);

  const auth = firebase.auth(app);
  const db = firebase.firestore(app);
  const FieldValue = firebase.firestore.FieldValue;
  const PAY = window.SIXTEEN_PAYMENTS;
  const REF = db.collection("configuracion_pagos").doc("principal");
  const $ = id => document.getElementById(id);

  const els = {
    form: $("pagosConfigForm"),
    mensaje: $("pagosConfigMensaje"),
    guardar: $("guardarPagosConfigBtn"),
    estado: $("pagosConfigEstado"),
    remoto: $("pagosConfigRemoteEstado"),
    transferenciaEstado: $("pagoTransferenciaEstado"),
    qrEstado: $("pagoQrEstado"),
    tarjetaEstado: $("pagoTarjetaEstado"),
    efectivoEstado: $("pagoEfectivoEstado"),

    transferenciaActivo: $("pagoTransferenciaActivo"),
    banco: $("pagoBanco"),
    tipoCuenta: $("pagoTipoCuenta"),
    numeroCuenta: $("pagoNumeroCuenta"),
    titular: $("pagoTitular"),
    identificacion: $("pagoIdentificacion"),
    transferenciaNota: $("pagoTransferenciaNota"),

    qrActivo: $("pagoQrActivo"),
    qrNombre: $("pagoQrNombre"),
    qrImagen: $("pagoQrImagen"),
    qrNota: $("pagoQrNota"),

    tarjetaActivo: $("pagoTarjetaActivo"),
    tarjetaProveedor: $("pagoTarjetaProveedor"),
    tarjetaUrl: $("pagoTarjetaUrl"),
    tarjetaNota: $("pagoTarjetaNota"),

    efectivoActivo: $("pagoEfectivoActivo"),
    efectivoNota: $("pagoEfectivoNota")
  };

  let config = PAY.normalize(PAY.DEFAULTS);
  let publishedConfig = null;
  let dirty = false;
  let saving = false;
  let remoteState = "CARGANDO";
  let unsubscribe = null;

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function setMessage(message, type = "error") {
    if (!els.mensaje) return;
    els.mensaje.textContent = message || "";
    els.mensaje.dataset.type = type;
  }

  function methodStatus(method, cfg) {
    if (!PAY.active(method, cfg)) {
      return { text: "INACTIVO", className: "is-off" };
    }
    if (PAY.ready(method, cfg)) {
      return { text: "LISTO", className: "is-ready" };
    }
    return { text: "INCOMPLETO", className: "is-warning" };
  }

  function setMethodBadge(element, method, cfg) {
    if (!element) return;
    const state = methodStatus(method, cfg);
    element.textContent = state.text;
    element.className = "pago-method-state " + state.className;
  }

  function renderStatus(cfg) {
    const methods = ["transferencia", "qr", "tarjeta", "efectivo"];
    const active = methods.filter(method => PAY.active(method, cfg)).length;
    const ready = methods.filter(method => PAY.ready(method, cfg)).length;

    if (els.estado) {
      els.estado.textContent = ready + " LISTO" + (ready === 1 ? "" : "S") + " · " + active + " ACTIVO" + (active === 1 ? "" : "S");
    }

    if (els.remoto) {
      const map = {
        CARGANDO: "VERIFICANDO FIRESTORE",
        PUBLICADO: dirty ? "CAMBIOS SIN PUBLICAR" : "PUBLICADO EN FIRESTORE",
        SIN_CONFIG: "SIN CONFIGURACIÓN PUBLICADA",
        ERROR: "ERROR DE CONEXIÓN",
        GUARDANDO: "PUBLICANDO..."
      };
      els.remoto.textContent = map[remoteState] || remoteState;
      els.remoto.dataset.state = remoteState;
    }

    setMethodBadge(els.transferenciaEstado, "transferencia", cfg);
    setMethodBadge(els.qrEstado, "qr", cfg);
    setMethodBadge(els.tarjetaEstado, "tarjeta", cfg);
    setMethodBadge(els.efectivoEstado, "efectivo", cfg);

    if (els.guardar) {
      els.guardar.disabled = saving || !dirty;
      els.guardar.textContent = saving
        ? "PUBLICANDO..."
        : dirty
          ? "PUBLICAR MÉTODOS"
          : "SIN CAMBIOS";
    }
  }

  function renderForm(cfg) {
    const c = PAY.normalize(cfg);

    els.transferenciaActivo && (els.transferenciaActivo.checked = c.transferencia.activo);
    els.banco && (els.banco.value = c.transferencia.banco);
    els.tipoCuenta && (els.tipoCuenta.value = c.transferencia.tipoCuenta);
    els.numeroCuenta && (els.numeroCuenta.value = c.transferencia.numeroCuenta);
    els.titular && (els.titular.value = c.transferencia.titular);
    els.identificacion && (els.identificacion.value = c.transferencia.identificacion);
    els.transferenciaNota && (els.transferenciaNota.value = c.transferencia.nota);

    els.qrActivo && (els.qrActivo.checked = c.qr.activo);
    els.qrNombre && (els.qrNombre.value = c.qr.nombre);
    els.qrImagen && (els.qrImagen.value = c.qr.imagenUrl);
    els.qrNota && (els.qrNota.value = c.qr.nota);

    els.tarjetaActivo && (els.tarjetaActivo.checked = c.tarjeta.activo);
    els.tarjetaProveedor && (els.tarjetaProveedor.value = c.tarjeta.proveedor);
    els.tarjetaUrl && (els.tarjetaUrl.value = c.tarjeta.urlPago);
    els.tarjetaNota && (els.tarjetaNota.value = c.tarjeta.nota);

    els.efectivoActivo && (els.efectivoActivo.checked = c.efectivo.activo);
    els.efectivoNota && (els.efectivoNota.value = c.efectivo.nota);

    renderStatus(c);
  }

  function validateHttps(url, label) {
    if (!url) return;
    if (!PAY.validHttpsUrl(url)) {
      throw new Error(label + " debe ser una dirección HTTPS válida.");
    }
  }

  function readDraft() {
    return PAY.normalize({
      version: 1,
      transferencia: {
        activo: els.transferenciaActivo?.checked === true,
        banco: text(els.banco?.value),
        tipoCuenta: text(els.tipoCuenta?.value),
        numeroCuenta: text(els.numeroCuenta?.value),
        titular: text(els.titular?.value),
        identificacion: text(els.identificacion?.value),
        nota: text(els.transferenciaNota?.value)
      },
      qr: {
        activo: els.qrActivo?.checked === true,
        nombre: text(els.qrNombre?.value) || "Pago QR",
        imagenUrl: text(els.qrImagen?.value),
        nota: text(els.qrNota?.value)
      },
      tarjeta: {
        activo: els.tarjetaActivo?.checked === true,
        proveedor: text(els.tarjetaProveedor?.value),
        urlPago: text(els.tarjetaUrl?.value),
        nota: text(els.tarjetaNota?.value)
      },
      efectivo: {
        activo: els.efectivoActivo?.checked === true,
        nota: text(els.efectivoNota?.value)
      }
    });
  }

  function readForm() {
    const next = readDraft();

    validateHttps(next.qr.imagenUrl, "La URL de la imagen QR");
    validateHttps(next.tarjeta.urlPago, "La URL de pago con tarjeta");

    const active = ["transferencia", "qr", "tarjeta", "efectivo"]
      .filter(method => PAY.active(method, next));

    if (!active.length) {
      throw new Error("Activa al menos un método de pago.");
    }

    if (next.transferencia.activo && !PAY.ready("transferencia", next)) {
      throw new Error("Para activar transferencia completa banco, número de cuenta y titular.");
    }

    if (next.qr.activo && !PAY.ready("qr", next)) {
      throw new Error("Para activar Pago QR configura un nombre y una imagen HTTPS válida.");
    }

    if (next.tarjeta.activo && !PAY.ready("tarjeta", next)) {
      throw new Error("Para activar Tarjeta configura proveedor y URL HTTPS de la pasarela.");
    }

    return next;
  }

  function markDirty() {
    if (saving) return;
    dirty = true;
    config = readDraft();
    setMessage("Tienes cambios pendientes de publicar.", "warning");
    renderStatus(config);
  }

  async function save(event) {
    event?.preventDefault();
    if (saving || !dirty) return;

    let next;
    try {
      next = readForm();
    } catch (error) {
      setMessage(error.message || "Revisa la configuración.", "error");
      return;
    }

    saving = true;
    remoteState = "GUARDANDO";
    renderStatus(next);
    setMessage("Publicando configuración en Firestore...", "info");

    try {
      // Reemplaza el documento completo: evita conservar campos antiguos/no permitidos.
      await REF.set({
        ...next,
        actualizadoEn: FieldValue.serverTimestamp()
      });

      config = PAY.saveLocal(next);
      publishedConfig = PAY.normalize(next);
      dirty = false;
      remoteState = "PUBLICADO";
      setMessage("Métodos de pago publicados correctamente.", "success");
      renderForm(config);
    } catch (error) {
      console.error("Guardar configuración de pagos:", error);
      remoteState = "ERROR";
      dirty = true;
      setMessage(
        "No se publicaron los cambios en Firestore. " +
        (error?.message || "Revisa permisos y conexión."),
        "error"
      );
      renderStatus(next);
    } finally {
      saving = false;
      renderStatus(config);
    }
  }

  els.form?.addEventListener("submit", save);
  els.form?.addEventListener("input", markDirty);
  els.form?.addEventListener("change", markDirty);

  auth.onAuthStateChanged(function (user) {
    if (!user) return;

    unsubscribe?.();
    remoteState = "CARGANDO";
    renderStatus(config);

    unsubscribe = REF.onSnapshot(
      { includeMetadataChanges: true },
      function (snapshot) {
        if (!snapshot.exists) {
          publishedConfig = null;
          remoteState = "SIN_CONFIG";
          if (!dirty) {
            config = PAY.normalize(PAY.DEFAULTS);
            renderForm(config);
          } else {
            renderStatus(config);
          }
          setMessage(
            dirty
              ? "Aún no existe una configuración publicada. Publica tus cambios cuando estén listos."
              : "No existe una configuración de pagos publicada. Completa y publica los métodos.",
            "warning"
          );
          return;
        }

        const remote = PAY.normalize(snapshot.data());
        publishedConfig = remote;
        PAY.saveLocal(remote);
        remoteState = snapshot.metadata.hasPendingWrites ? "GUARDANDO" : "PUBLICADO";

        // Nunca pisar campos que el administrador está editando sin guardar.
        if (!dirty) {
          config = remote;
          renderForm(config);
          if (!snapshot.metadata.hasPendingWrites) {
            setMessage("Configuración sincronizada con Firestore.", "success");
          }
        } else {
          renderStatus(config);
        }
      },
      function (error) {
        console.warn("Configuración de pagos:", error);
        remoteState = "ERROR";
        renderStatus(config);
        setMessage("No fue posible verificar la configuración publicada en Firestore.", "error");
      }
    );
  });

  window.addEventListener("beforeunload", function (event) {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  window.SIXTEEN_PAGOS_BACKUP_SOURCE = {
    getConfigPagos: () => PAY.normalize(publishedConfig || config)
  };

  renderForm(config);
});
