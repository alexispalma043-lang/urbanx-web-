// @ts-nocheck
document.addEventListener(
  "DOMContentLoaded",
  function () {

    "use strict";

    if (
      typeof firebase === "undefined"
      ||
      !window.SIXTEEN_PAYMENTS
    ) {
      return;
    }

    const FIREBASE_CONFIG = {
      apiKey:
        "AIzaSyBFLPbBQPZy4ILeBRZ_kELi7KizlR1hgJo",
      authDomain:
        "urbanx-92e74.firebaseapp.com",
      projectId:
        "urbanx-92e74",
      storageBucket:
        "urbanx-92e74.firebasestorage.app",
      messagingSenderId:
        "830520272633",
      appId:
        "1:830520272633:web:ce7f2bf7abc8f86fec6428"
    };

    const APP_NAME =
      "sixteen-admin";

    let app =
      firebase.apps.find(
        item =>
          item.name === APP_NAME
      );

    if (!app) {
      app =
        firebase.initializeApp(
          FIREBASE_CONFIG,
          APP_NAME
        );
    }

    const auth =
      firebase.auth(app);

    const db =
      firebase.firestore(app);

    const FieldValue =
      firebase.firestore.FieldValue;

    const PAY =
      window.SIXTEEN_PAYMENTS;

    const REF =
      db
        .collection(
          "configuracion_pagos"
        )
        .doc(
          "principal"
        );

    const $ =
      id =>
        document.getElementById(id);

    const els = {
      form:
        $("pagosConfigForm"),

      mensaje:
        $("pagosConfigMensaje"),

      guardar:
        $("guardarPagosConfigBtn"),

      transferenciaActivo:
        $("pagoTransferenciaActivo"),

      banco:
        $("pagoBanco"),

      tipoCuenta:
        $("pagoTipoCuenta"),

      numeroCuenta:
        $("pagoNumeroCuenta"),

      titular:
        $("pagoTitular"),

      identificacion:
        $("pagoIdentificacion"),

      transferenciaNota:
        $("pagoTransferenciaNota"),

      qrActivo:
        $("pagoQrActivo"),

      qrNombre:
        $("pagoQrNombre"),

      qrImagen:
        $("pagoQrImagen"),

      qrNota:
        $("pagoQrNota"),

      tarjetaActivo:
        $("pagoTarjetaActivo"),

      tarjetaProveedor:
        $("pagoTarjetaProveedor"),

      tarjetaUrl:
        $("pagoTarjetaUrl"),

      tarjetaNota:
        $("pagoTarjetaNota"),

      efectivoActivo:
        $("pagoEfectivoActivo"),

      efectivoNota:
        $("pagoEfectivoNota"),

      estado:
        $("pagosConfigEstado")
    };

    let config =
      PAY.readLocal();

    function text(value) {
      return String(
        value == null
          ? ""
          : value
      ).trim();
    }

    function setMessage(
      message,
      ok = false
    ) {
      if (!els.mensaje) {
        return;
      }

      els.mensaje.textContent =
        message;

      els.mensaje.style.color =
        ok
          ? "#87c99d"
          : "#a97872";
    }

    function render() {
      const c =
        PAY.normalize(config);

      if (els.transferenciaActivo) {
        els.transferenciaActivo.checked =
          c.transferencia.activo;
      }

      if (els.banco) {
        els.banco.value =
          c.transferencia.banco || "";
      }

      if (els.tipoCuenta) {
        els.tipoCuenta.value =
          c.transferencia.tipoCuenta || "";
      }

      if (els.numeroCuenta) {
        els.numeroCuenta.value =
          c.transferencia.numeroCuenta || "";
      }

      if (els.titular) {
        els.titular.value =
          c.transferencia.titular || "";
      }

      if (els.identificacion) {
        els.identificacion.value =
          c.transferencia.identificacion || "";
      }

      if (els.transferenciaNota) {
        els.transferenciaNota.value =
          c.transferencia.nota || "";
      }

      if (els.qrActivo) {
        els.qrActivo.checked =
          c.qr.activo;
      }

      if (els.qrNombre) {
        els.qrNombre.value =
          c.qr.nombre || "";
      }

      if (els.qrImagen) {
        els.qrImagen.value =
          c.qr.imagenUrl || "";
      }

      if (els.qrNota) {
        els.qrNota.value =
          c.qr.nota || "";
      }

      if (els.tarjetaActivo) {
        els.tarjetaActivo.checked =
          c.tarjeta.activo;
      }

      if (els.tarjetaProveedor) {
        els.tarjetaProveedor.value =
          c.tarjeta.proveedor || "";
      }

      if (els.tarjetaUrl) {
        els.tarjetaUrl.value =
          c.tarjeta.urlPago || "";
      }

      if (els.tarjetaNota) {
        els.tarjetaNota.value =
          c.tarjeta.nota || "";
      }

      if (els.efectivoActivo) {
        els.efectivoActivo.checked =
          c.efectivo.activo;
      }

      if (els.efectivoNota) {
        els.efectivoNota.value =
          c.efectivo.nota || "";
      }

      if (els.estado) {
        const active =
          [
            c.transferencia.activo,
            c.qr.activo,
            c.tarjeta.activo,
            c.efectivo.activo
          ]
            .filter(Boolean)
            .length;

        els.estado.textContent =
          active
          +
          " método"
          +
          (
            active === 1
              ? ""
              : "s"
          )
          +
          " activo"
          +
          (
            active === 1
              ? ""
              : "s"
          );
      }
    }

    function readForm() {
      const cardUrl =
        text(
          els.tarjetaUrl?.value
        );

      if (cardUrl) {
        let parsed;

        try {
          parsed =
            new URL(cardUrl);
        } catch (_) {
          throw new Error(
            "La URL de pago con tarjeta no es válida."
          );
        }

        if (
          ![
            "https:"
          ].includes(
            parsed.protocol
          )
        ) {
          throw new Error(
            "La pasarela de tarjeta debe usar HTTPS."
          );
        }
      }

      const qrUrl =
        text(
          els.qrImagen?.value
        );

      if (qrUrl) {
        try {
          const parsed =
            new URL(qrUrl);

          if (
            ![
              "https:",
              "http:"
            ].includes(
              parsed.protocol
            )
          ) {
            throw new Error();
          }

        } catch (_) {
          throw new Error(
            "La URL de la imagen QR no es válida."
          );
        }
      }

      return PAY.normalize({
        version: 1,

        transferencia: {
          activo:
            els.transferenciaActivo
              ?.checked === true,

          banco:
            text(
              els.banco?.value
            ),

          tipoCuenta:
            text(
              els.tipoCuenta?.value
            ),

          numeroCuenta:
            text(
              els.numeroCuenta?.value
            ),

          titular:
            text(
              els.titular?.value
            ),

          identificacion:
            text(
              els.identificacion?.value
            ),

          nota:
            text(
              els.transferenciaNota?.value
            )
        },

        qr: {
          activo:
            els.qrActivo
              ?.checked === true,

          nombre:
            text(
              els.qrNombre?.value
            )
            ||
            "Pago QR",

          imagenUrl:
            qrUrl,

          nota:
            text(
              els.qrNota?.value
            )
        },

        tarjeta: {
          activo:
            els.tarjetaActivo
              ?.checked === true,

          proveedor:
            text(
              els.tarjetaProveedor?.value
            ),

          urlPago:
            cardUrl,

          nota:
            text(
              els.tarjetaNota?.value
            )
        },

        efectivo: {
          activo:
            els.efectivoActivo
              ?.checked === true,

          nota:
            text(
              els.efectivoNota?.value
            )
        }
      });
    }

    async function save(event) {
      event?.preventDefault();

      let next;

      try {
        next =
          readForm();
      } catch (error) {
        setMessage(
          error.message
          ||
          "Revisa la configuración."
        );
        return;
      }

      const active =
        [
          next.transferencia.activo,
          next.qr.activo,
          next.tarjeta.activo,
          next.efectivo.activo
        ]
          .filter(Boolean)
          .length;

      if (!active) {
        setMessage(
          "Activa al menos un método de pago."
        );
        return;
      }

      if (
        next.transferencia.activo
        &&
        (
          !next.transferencia.banco
          ||
          !next.transferencia.numeroCuenta
          ||
          !next.transferencia.titular
        )
      ) {
        setMessage(
          "Para activar transferencia completa banco, número de cuenta y titular."
        );
        return;
      }

      if (
        next.qr.activo
        &&
        !next.qr.imagenUrl
      ) {
        setMessage(
          "Para activar pago QR debes configurar la URL de la imagen QR."
        );
        return;
      }

      if (
        next.tarjeta.activo
        &&
        !next.tarjeta.urlPago
      ) {
        setMessage(
          "Para activar tarjeta debes configurar una URL HTTPS de una pasarela externa segura."
        );
        return;
      }

      config =
        PAY.saveLocal(next);

      render();

      if (els.guardar) {
        els.guardar.disabled =
          true;
        els.guardar.textContent =
          "GUARDANDO...";
      }

      try {
        await REF.set(
          {
            ...config,
            actualizadoEn:
              FieldValue.serverTimestamp()
          },
          {
            merge: true
          }
        );

        setMessage(
          "Métodos de pago guardados correctamente.",
          true
        );

      } catch (error) {
        console.error(
          "Guardar configuración de pagos:",
          error
        );

        setMessage(
          "Configuración guardada localmente. "
          +
          "Firestore todavía no permitió publicarla: "
          +
          (
            error.message
            ||
            "error de permisos"
          ),
          true
        );

      } finally {
        if (els.guardar) {
          els.guardar.disabled =
            false;
          els.guardar.textContent =
            "GUARDAR MÉTODOS";
        }
      }
    }

    els.form
      ?.addEventListener(
        "submit",
        save
      );

    auth.onAuthStateChanged(
      async function (user) {

        if (!user) {
          return;
        }

        config =
          await PAY.load(db);

        render();

        REF.onSnapshot(
          function (snapshot) {

            if (!snapshot.exists) {
              return;
            }

            config =
              PAY.saveLocal(
                snapshot.data()
              );

            render();
          },
          function (error) {
            console.warn(
              "Configuración de pagos:",
              error
            );
          }
        );
      }
    );

    window.SIXTEEN_PAGOS_BACKUP_SOURCE = {
      getConfigPagos:
        () =>
          PAY.normalize(config)
    };

    render();
  }
);
