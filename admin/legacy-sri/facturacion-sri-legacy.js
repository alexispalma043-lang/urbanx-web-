// @ts-nocheck

document.addEventListener(
  "DOMContentLoaded",
  function () {

    "use strict";

    if (
      typeof firebase ===
      "undefined"
      ||
      !window.SIXTEEN_SRI
    ) {
      return;
    }

    const FIREBASE_CONFIG = {
      apiKey: "AIzaSyBFLPbBQPZy4ILeBRZ_kELi7KizlR1hgJo",
      authDomain: "urbanx-92e74.firebaseapp.com",
      projectId: "urbanx-92e74",
      storageBucket: "urbanx-92e74.firebasestorage.app",
      messagingSenderId: "830520272633",
      appId: "1:830520272633:web:ce7f2bf7abc8f86fec6428"
    };

    const APP_NAME =
      "sixteen-admin";

    let app =
      firebase.apps.find(
        a =>
          a.name ===
          APP_NAME
      );

    if (!app) {
      app =
        firebase.initializeApp(
          FIREBASE_CONFIG,
          APP_NAME
        );
    }

    const auth =
      firebase.auth(
        app
      );

    const db =
      firebase.firestore(
        app
      );

    const FieldValue =
      firebase.firestore.FieldValue;

    const SRI =
      window.SIXTEEN_SRI;

    const CONFIG_REF =
      db
        .collection(
          "configuracion_sri"
        )
        .doc(
          "principal"
        );

    const COLLECTION =
      db
        .collection(
          "facturacion"
        );

    const $ =
      id =>
        document.getElementById(
          id
        );

    const els = {
      menuBadge:
        $("facturacionPendientesBadge"),

      ambienteBadge:
        $("facturacionAmbienteBadge"),

      pedidoSelect:
        $("facturacionPedidoSelect"),

      fecha:
        $("facturacionFechaEmision"),

      preview:
        $("facturacionPedidoPreview"),

      generar:
        $("generarFacturaXmlBtn"),

      generarMensaje:
        $("facturacionGenerarMensaje"),

      buscar:
        $("facturacionBuscar"),

      filtro:
        $("facturacionFiltroEstado"),

      filtroTipo:
        $("facturacionFiltroTipo"),

      exportar:
        $("exportarFacturacionCsvBtn"),

      body:
        $("facturacionBody"),

      total:
        $("facturacionKpiTotal"),

      xml:
        $("facturacionKpiXml"),

      autorizados:
        $("facturacionKpiAutorizados"),

      pendientes:
        $("facturacionKpiPendientes"),

      configModal:
        $("configuracionSriModal"),

      abrirConfig:
        $("abrirConfiguracionSriBtn"),

      cerrarConfig:
        $("cerrarConfiguracionSriBtn"),

      cancelarConfig:
        $("cancelarConfiguracionSriBtn"),

      configForm:
        $("configuracionSriForm"),

      configMensaje:
        $("configuracionSriMensaje"),

      guardarConfig:
        $("guardarConfiguracionSriBtn"),

      probarBackend:
        $("probarBackendSriBtn"),

      verificarProduccion:
        $("verificarProduccionSriBtn"),

      productionGrid:
        $("sriProductionGrid"),

      productionOverall:
        $("sriProductionOverall"),

      productionMessage:
        $("sriProductionMessage"),

      backendEstado:
        $("facturacionBackendEstado"),

      certificadoInfo:
        $("facturacionCertificadoInfo"),

      flowFirma:
        $("facturacionFlowFirma"),

      flowRecepcion:
        $("facturacionFlowRecepcion"),

      flowAutorizacion:
        $("facturacionFlowAutorizacion"),

      abrirNotaCredito:
        $("abrirNotaCreditoBtn"),

      notaCreditoModal:
        $("notaCreditoModal"),

      cerrarNotaCredito:
        $("cerrarNotaCreditoBtn"),

      cancelarNotaCredito:
        $("cancelarNotaCreditoBtn"),

      notaCreditoForm:
        $("notaCreditoForm"),

      notaCreditoFactura:
        $("notaCreditoFacturaSelect"),

      notaCreditoFecha:
        $("notaCreditoFecha"),

      notaCreditoMotivo:
        $("notaCreditoMotivo"),

      notaCreditoPreview:
        $("notaCreditoPreview"),

      notaCreditoMensaje:
        $("notaCreditoMensaje"),

      generarNotaCredito:
        $("generarNotaCreditoBtn"),

      notaCreditoDetalleLista:
        $("notaCreditoDetalleLista"),

      notaCreditoResumen:
        $("notaCreditoResumenSeleccion"),

      notaCreditoSeleccionarTodo:
        $("notaCreditoSeleccionarTodoBtn"),

      notaCreditoLimpiar:
        $("notaCreditoLimpiarBtn"),

      abrirNotaDebito:
        $("abrirNotaDebitoBtn"),

      notaDebitoModal:
        $("notaDebitoModal"),

      cerrarNotaDebito:
        $("cerrarNotaDebitoBtn"),

      cancelarNotaDebito:
        $("cancelarNotaDebitoBtn"),

      notaDebitoForm:
        $("notaDebitoForm"),

      notaDebitoFactura:
        $("notaDebitoFacturaSelect"),

      notaDebitoFecha:
        $("notaDebitoFecha"),

      notaDebitoIva:
        $("notaDebitoIva"),

      notaDebitoRazon:
        $("notaDebitoRazon"),

      notaDebitoValorBase:
        $("notaDebitoValorBase"),

      notaDebitoPreview:
        $("notaDebitoPreview"),

      notaDebitoTotal:
        $("notaDebitoTotal"),

      notaDebitoMensaje:
        $("notaDebitoMensaje"),

      generarNotaDebito:
        $("generarNotaDebitoBtn"),

      abrirGuiaRemision:
        $("abrirGuiaRemisionBtn"),

      guiaRemisionModal:
        $("guiaRemisionModal"),

      cerrarGuiaRemision:
        $("cerrarGuiaRemisionBtn"),

      cancelarGuiaRemision:
        $("cancelarGuiaRemisionBtn"),

      guiaRemisionForm:
        $("guiaRemisionForm"),

      guiaPedido:
        $("guiaPedidoSelect"),

      guiaDirPartida:
        $("guiaDirPartida"),

      guiaTransportistaNombre:
        $("guiaTransportistaNombre"),

      guiaTransportistaId:
        $("guiaTransportistaId"),

      guiaFechaInicio:
        $("guiaFechaInicio"),

      guiaFechaFin:
        $("guiaFechaFin"),

      guiaPlaca:
        $("guiaPlaca"),

      guiaCodEstabDestino:
        $("guiaCodEstabDestino"),

      guiaDirDestinatario:
        $("guiaDirDestinatario"),

      guiaMotivoTraslado:
        $("guiaMotivoTraslado"),

      guiaRuta:
        $("guiaRuta"),

      guiaRemisionPreview:
        $("guiaRemisionPreview"),

      guiaRemisionMensaje:
        $("guiaRemisionMensaje"),

      generarGuiaRemision:
        $("generarGuiaRemisionBtn"),

      abrirRetencion:
        $("abrirRetencionBtn"),

      retencionModal:
        $("retencionModal"),

      cerrarRetencion:
        $("cerrarRetencionBtn"),

      cancelarRetencion:
        $("cancelarRetencionBtn"),

      retencionForm:
        $("retencionForm"),

      retencionSujetoId:
        $("retencionSujetoId"),

      retencionSujetoNombre:
        $("retencionSujetoNombre"),

      retencionParteRel:
        $("retencionParteRel"),

      retencionSujetoEmail:
        $("retencionSujetoEmail"),

      retencionFechaEmision:
        $("retencionFechaEmision"),

      retencionPeriodoFiscal:
        $("retencionPeriodoFiscal"),

      retencionCodSustento:
        $("retencionCodSustento"),

      retencionCodDocSustento:
        $("retencionCodDocSustento"),

      retencionNumDocSustento:
        $("retencionNumDocSustento"),

      retencionFechaDocSustento:
        $("retencionFechaDocSustento"),

      retencionFechaRegistro:
        $("retencionFechaRegistro"),

      retencionAutDocSustento:
        $("retencionAutDocSustento"),

      retencionSubtotalCompra:
        $("retencionSubtotalCompra"),

      retencionIvaCompra:
        $("retencionIvaCompra"),

      retencionImporteCompra:
        $("retencionImporteCompra"),

      retencionFormaPago:
        $("retencionFormaPago"),

      retencionLineas:
        $("retencionLineas"),

      agregarRetencionLinea:
        $("agregarRetencionLineaBtn"),

      retencionTotalPreview:
        $("retencionTotalPreview"),

      retencionMensaje:
        $("retencionMensaje"),

      generarRetencion:
        $("generarRetencionBtn")
    };

    let usuario =
      null;

    let config =
      null;

    let comprobantes =
      [];

    let filtroActual =
      [];

    let unsubscribeConfig =
      null;

    let unsubscribeInvoices =
      null;

    // ======================================================
    // HELPERS
    // ======================================================

    function text(value) {
      return String(
        value ?? ""
      ).trim();
    }

    function number(value) {
      const n =
        Number(
          value
        );

      return Number.isFinite(
        n
      )
        ? n
        : 0;
    }

    function money(value) {
      return "$"
        +
        number(
          value
        )
          .toFixed(
            2
          );
    }

    function escapeHtml(value) {
      return text(
        value
      )
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        )
        .replace(
          /"/g,
          "&quot;"
        )
        .replace(
          /'/g,
          "&#039;"
        );
    }


    function backendUrlValida(value) {

      const raw =
        text(value);

      if (!raw) {
        return true;
      }

      try {

        const parsed =
          new URL(raw);

        const localHosts =
          new Set([
            "localhost",
            "127.0.0.1",
            "::1"
          ]);

        if (
          parsed.protocol ===
          "https:"
        ) {
          return true;
        }

        return (
          parsed.protocol ===
          "http:"
          &&
          localHosts.has(
            parsed.hostname
          )
        );

      } catch (_) {
        return false;
      }
    }


    let focoAntesModalFacturacion =
      null;


    function elementosEnfocablesModal(modal) {

      if (!modal) {
        return [];
      }

      return Array.from(
        modal.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        element =>
          !element.hidden
          &&
          element.offsetParent !==
          null
      );
    }


    function abrirModalFacturacion(
      modal,
      preferredFocus = null
    ) {

      if (!modal) {
        return;
      }

      focoAntesModalFacturacion =
        document.activeElement instanceof
        HTMLElement
          ? document.activeElement
          : null;

      modal.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "modal-open"
      );

      window.requestAnimationFrame(
        function () {

          const focusTarget =
            preferredFocus
            ||
            elementosEnfocablesModal(
              modal
            )[0]
            ||
            modal.querySelector(
              ".admin-modal-panel"
            );

          focusTarget?.focus?.();
        }
      );
    }


    function cerrarModalFacturacion(
      modal
    ) {

      if (!modal) {
        return;
      }

      modal.setAttribute(
        "aria-hidden",
        "true"
      );

      const otroModalAbierto =
        Array.from(
          document.querySelectorAll(
            '.admin-modal[aria-hidden="false"], .admin-modal.activo'
          )
        ).some(
          candidate =>
            candidate !==
            modal
        );

      if (!otroModalAbierto) {
        document.body.classList.remove(
          "modal-open"
        );
      }

      const previousFocus =
        focoAntesModalFacturacion;

      focoAntesModalFacturacion =
        null;

      previousFocus?.focus?.();
    }


    function instalarComportamientoModal(
      modal,
      closeFn
    ) {

      if (!modal) {
        return;
      }

      modal.addEventListener(
        "click",
        function (event) {

          if (
            event.target ===
            modal
          ) {
            closeFn();
          }
        }
      );

      modal.addEventListener(
        "keydown",
        function (event) {

          if (
            event.key ===
            "Escape"
          ) {
            event.preventDefault();
            closeFn();
            return;
          }

          if (
            event.key !==
            "Tab"
          ) {
            return;
          }

          const focusables =
            elementosEnfocablesModal(
              modal
            );

          if (!focusables.length) {
            event.preventDefault();
            modal.querySelector(
              ".admin-modal-panel"
            )?.focus();
            return;
          }

          const first =
            focusables[0];

          const last =
            focusables[
              focusables.length - 1
            ];

          if (
            event.shiftKey
            &&
            document.activeElement ===
            first
          ) {
            event.preventDefault();
            last.focus();
            return;
          }

          if (
            !event.shiftKey
            &&
            document.activeElement ===
            last
          ) {
            event.preventDefault();
            first.focus();
          }
        }
      );
    }

    function firestoreDate(
      value
    ) {

      if (
        value?.toDate
      ) {
        return value
          .toDate();
      }

      const d =
        new Date(
          value
        );

      return Number.isNaN(
        d.getTime()
      )
        ? null
        : d;
    }

    function dateText(
      value
    ) {

      const date =
        firestoreDate(
          value
        );

      if (!date) {
        return "—";
      }

      return date
        .toLocaleString(
          "es-EC"
        );
    }

    function orderSource() {
      return (
        window
          .SIXTEEN_ADMIN_BACKUP_SOURCE
        ||
        {}
      );
    }

    function pedidos() {
      return orderSource()
        .getPedidos?.()
        ||
        [];
    }

    function productos() {
      return orderSource()
        .getProductos?.()
        ||
        [];
    }

    function configDefault() {
      return {
        ambiente: "1",
        backendUrl:
          localStorage.getItem(
            "sixteen_sri_backend_url"
          )
          ||
          "",
        razonSocial: "",
        nombreComercial: "SIXTEEN",
        ruc: "",
        dirMatriz: "",
        dirEstablecimiento: "",
        estab: "001",
        ptoEmi: "001",
        secuencialFactura: 1,
        secuencialNotaCredito: 1,
        secuencialNotaDebito: 1,
        secuencialGuiaRemision: 1,
        secuencialRetencion: 1,
        ivaDefault: 15,
        ivaEnvio: 15,
        preciosIncluyenIva: true,
        facturarEnvio: true,
        obligadoContabilidad: false,
        contribuyenteEspecial: "",
        regimen: ""
      };
    }

    // ======================================================
    // AUTH
    // ======================================================

    auth.onAuthStateChanged(
      function (user) {

        usuario =
          user ||
          null;

        if (!usuario) {
          return;
        }

        escucharConfig();
        escucharFacturas();
      }
    );

    // ======================================================
    // CONFIG SRI
    // ======================================================

    function escucharConfig() {

      if (
        unsubscribeConfig
      ) {
        unsubscribeConfig();
      }

      unsubscribeConfig =
        CONFIG_REF
          .onSnapshot(
            function (snapshot) {

              const remoteConfig =
                snapshot.exists
                  ? snapshot.data()
                  : {};

              config =
                {
                  ...configDefault(),
                  ...remoteConfig,
                  backendUrl:
                    text(
                      remoteConfig.backendUrl
                    )
                    ||
                    localStorage.getItem(
                      "sixteen_sri_backend_url"
                    )
                    ||
                    ""
                };

              pintarConfig();
              actualizarAmbiente();
              poblarPedidos();

              if (
                backendUrl()
              ) {
                backendStatus(
                  "CONFIGURADO",
                  "Pulsa PROBAR BACKEND para validar servicio y certificado."
                );
              } else {
                backendStatus(
                  "NO CONFIGURADO",
                  "Agrega la URL del backend seguro en Configuración SRI."
                );
              }
            },

            function (error) {

              console.error(
                "Configuración SRI:",
                error
              );
            }
          );
    }

    function actualizarAmbiente() {

      if (
        !els.ambienteBadge
      ) {
        return;
      }

      const prod =
        String(
          config?.ambiente
        )
        ===
        "2";

      els.ambienteBadge.textContent =
        prod
          ? "PRODUCCIÓN"
          : "PRUEBAS";

      els.ambienteBadge.title =
        prod
          ?
          "Los comprobantes autorizados en este ambiente tienen validez tributaria."
          :
          "Ambiente de certificación / pruebas.";
    }

    function abrirConfig() {

      if (!els.configModal) {
        return;
      }

      pintarConfig();

      abrirModalFacturacion(
        els.configModal,
        $("sriAmbiente")
      );
    }

    function cerrarConfig() {

      if (!els.configModal) {
        return;
      }

      cerrarModalFacturacion(
        els.configModal
      );

      mensajeConfig(
        ""
      );
    }

    function value(
      id
    ) {
      return text(
        $(
          id
        )
          ?.value
      );
    }

    function setValue(
      id,
      value
    ) {

      const el =
        $(
          id
        );

      if (el) {
        el.value =
          value ?? "";
      }
    }

    function pintarConfig() {

      const c =
        {
          ...configDefault(),
          ...(
            config ||
            {}
          )
        };

      setValue(
        "sriAmbiente",
        c.ambiente
      );

      setValue(
        "sriBackendUrl",
        c.backendUrl
      );

      setValue(
        "sriRuc",
        c.ruc
      );

      setValue(
        "sriRazonSocial",
        c.razonSocial
      );

      setValue(
        "sriNombreComercial",
        c.nombreComercial
      );

      setValue(
        "sriDirMatriz",
        c.dirMatriz
      );

      setValue(
        "sriDirEstablecimiento",
        c.dirEstablecimiento
      );

      setValue(
        "sriEstab",
        c.estab
      );

      setValue(
        "sriPtoEmi",
        c.ptoEmi
      );

      setValue(
        "sriSecuencialFactura",
        c.secuencialFactura
      );

      setValue(
        "sriIvaDefault",
        c.ivaDefault
      );

      setValue(
        "sriIvaEnvio",
        c.ivaEnvio
      );

      setValue(
        "sriPreciosIncluyenIva",
        c.preciosIncluyenIva !==
        false
          ? "true"
          : "false"
      );

      setValue(
        "sriObligadoContabilidad",
        c.obligadoContabilidad
          ? "true"
          : "false"
      );

      setValue(
        "sriContribuyenteEspecial",
        c.contribuyenteEspecial
      );

      setValue(
        "sriRegimen",
        c.regimen
      );
    }

    function leerConfigForm() {

      return {
        ambiente:
          value(
            "sriAmbiente"
          )
          ||
          "1",

        backendUrl:
          value(
            "sriBackendUrl"
          )
            .replace(
              /\/+$/,
              ""
            ),

        ruc:
          value(
            "sriRuc"
          )
            .replace(
              /\D/g,
              ""
            ),

        razonSocial:
          value(
            "sriRazonSocial"
          ),

        nombreComercial:
          value(
            "sriNombreComercial"
          )
          ||
          "SIXTEEN",

        dirMatriz:
          value(
            "sriDirMatriz"
          ),

        dirEstablecimiento:
          value(
            "sriDirEstablecimiento"
          ),

        estab:
          value(
            "sriEstab"
          )
            .replace(
              /\D/g,
              ""
            )
            .padStart(
              3,
              "0"
            )
            .slice(
              -3
            ),

        ptoEmi:
          value(
            "sriPtoEmi"
          )
            .replace(
              /\D/g,
              ""
            )
            .padStart(
              3,
              "0"
            )
            .slice(
              -3
            ),

        secuencialFactura:
          Math.max(
            1,
            Math.floor(
              number(
                value(
                  "sriSecuencialFactura"
                )
              )
            )
          ),

        ivaDefault:
          number(
            value(
              "sriIvaDefault"
            )
          ),

        ivaEnvio:
          number(
            value(
              "sriIvaEnvio"
            )
          ),

        preciosIncluyenIva:
          value(
            "sriPreciosIncluyenIva"
          )
          !==
          "false",

        facturarEnvio:
          true,

        obligadoContabilidad:
          value(
            "sriObligadoContabilidad"
          )
          ===
          "true",

        contribuyenteEspecial:
          value(
            "sriContribuyenteEspecial"
          ),

        regimen:
          value(
            "sriRegimen"
          )
      };
    }

    function mensajeConfig(
      mensaje,
      ok = false
    ) {

      if (!els.configMensaje) {
        return;
      }

      els.configMensaje.textContent =
        mensaje;

      els.configMensaje.classList
        .toggle(
          "correcto",
          ok
        );
    }

    els.abrirConfig
      ?.addEventListener(
        "click",
        abrirConfig
      );

    els.cerrarConfig
      ?.addEventListener(
        "click",
        cerrarConfig
      );

    els.cancelarConfig
      ?.addEventListener(
        "click",
        cerrarConfig
      );

    els.configForm
      ?.addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();

          const data =
            leerConfigForm();

          const partialErrors = [];

          if (
            data.ruc
            &&
            !/^\d{13}$/.test(
              data.ruc
            )
          ) {
            partialErrors.push(
              "el RUC debe tener 13 dígitos"
            );
          }

          if (
            data.backendUrl
            &&
            !backendUrlValida(
              data.backendUrl
            )
          ) {
            partialErrors.push(
              "el backend debe usar HTTPS; HTTP solo se permite en localhost para desarrollo"
            );
          }

          if (
            partialErrors.length
          ) {
            mensajeConfig(
              "Revisa: "
              +
              partialErrors.join(
                ", "
              )
              +
              "."
            );
            return;
          }

          try {

            els.guardarConfig.disabled =
              true;

            els.guardarConfig.textContent =
              "GUARDANDO...";

            mensajeConfig(
              "Guardando configuración..."
            );

            await CONFIG_REF
              .set(
                {
                  ...data,

                  actualizadoEn:
                    FieldValue.serverTimestamp(),

                  actualizadoPor:
                    usuario?.uid ||
                    ""
                },
                {
                  merge:
                    true
                }
              );

            if (
              data.backendUrl
            ) {
              localStorage.setItem(
                "sixteen_sri_backend_url",
                data.backendUrl
              );
            } else {
              localStorage.removeItem(
                "sixteen_sri_backend_url"
              );
            }

            config = {
              ...configDefault(),
              ...(
                config ||
                {}
              ),
              ...data
            };

            mensajeConfig(
              "Configuración SRI publicada correctamente en Firestore.",
              true
            );

            setTimeout(
              cerrarConfig,
              650
            );

          } catch (error) {

            console.error(
              "Guardar configuración SRI:",
              error
            );

            mensajeConfig(
              "No se guardó ningún cambio. Firestore rechazó o no pudo publicar la configuración: "
              +
              (
                error.message ||
                "error de Firestore"
              )
            );

          } finally {

            els.guardarConfig.disabled =
              false;

            els.guardarConfig.textContent =
              "GUARDAR CONFIGURACIÓN";
          }
        }
      );

    // ======================================================
    // PASO 16F2 · BACKEND SEGURO / FIREBASE ID TOKEN
    // ======================================================

    function backendUrl() {

      return text(
        config?.backendUrl
      )
        .replace(
          /\/+$/,
          ""
        );
    }


    async function backendRequest(
      path,
      options = {}
    ) {

      const base =
        backendUrl();

      if (!base) {
        throw new Error(
          "Configura la URL del backend SRI."
        );
      }

      const current =
        auth.currentUser;

      if (!current) {
        throw new Error(
          "La sesión Admin no está disponible."
        );
      }

      const token =
        await current
          .getIdToken(
            true
          );

      const response =
        await fetch(
          base +
          path,
          {
            method:
              options.method ||
              "GET",

            headers:
              {
                "Content-Type":
                  "application/json",

                "Authorization":
                  "Bearer "
                  +
                  token,

                ...(
                  options.headers ||
                  {}
                )
              },

            body:
              options.body
                ?
                JSON.stringify(
                  options.body
                )
                :
                undefined
          }
        );

      let payload = null;

      try {
        payload =
          await response.json();
      } catch (_) {
        payload =
          null;
      }

      if (!response.ok) {

        throw new Error(
          payload?.detail
          ||
          payload?.message
          ||
          "Backend SRI respondió HTTP "
          +
          response.status
          +
          "."
        );
      }

      return payload;
    }


    function backendStatus(
      status,
      detail = ""
    ) {

      if (
        els.backendEstado
      ) {

        els.backendEstado
          .classList
          .toggle(
            "ok",
            status ===
            "OK"
          );

        els.backendEstado.textContent =
          status;
      }

      if (
        els.certificadoInfo
      ) {
        els.certificadoInfo.textContent =
          detail ||
          "Sin información del certificado.";
      }
    }


    async function probarBackend() {

      const base =
        backendUrl();

      if (!base) {

        backendStatus(
          "NO CONFIGURADO",
          "Guarda primero la URL del backend SRI."
        );

        return;
      }

      try {

        backendStatus(
          "COMPROBANDO...",
          "Verificando servicio..."
        );

        const health =
          await fetch(
            base +
            "/health"
          );

        if (!health.ok) {
          throw new Error(
            "Health check HTTP "
            +
            health.status
          );
        }

        const healthData =
          await health.json()
            .catch(
              () => ({})
            );

        backendStatus(
          "OK",
          "Backend conectado"
          +
          (
            healthData?.version
              ? " · versión " + healthData.version
              : ""
          )
          +
          ". Verificando certificado..."
        );

        try {

          const cert =
            await backendRequest(
              "/api/sri/certificate"
            );

          const info =
            cert?.certificate ||
            {};

          backendStatus(
            "OK",
            [
              "Backend conectado",
              info.subject
                ? "Certificado: " + info.subject
                : "Certificado cargado",
              info.notValidAfter
                ? "Vence: "
                  +
                  new Date(
                    info.notValidAfter
                  )
                    .toLocaleString(
                      "es-EC"
                    )
                : ""
            ]
              .filter(Boolean)
              .join(" · ")
          );

        } catch (certificateError) {

          backendStatus(
            "OK",
            "Backend conectado correctamente. "
            +
            "La firma electrónica está pendiente, por eso todavía no "
            +
            "se puede firmar ni enviar al SRI."
          );
        }

      } catch (error) {

        console.error(
          "Backend SRI:",
          error
        );

        backendStatus(
          "NO DISPONIBLE",
          error.message ||
          "No fue posible conectar."
        );
      }
    }

    els.probarBackend
      ?.addEventListener(
        "click",
        probarBackend
      );

    function setProductionCheck(
      name,
      state,
      label
    ) {

      const row =
        els.productionGrid
          ?.querySelector(
            '[data-check="' + name + '"]'
          );

      if (!row) {
        return;
      }

      row.classList.remove(
        "ok",
        "pending",
        "error"
      );

      row.classList.add(
        state
      );

      const badge =
        row.querySelector(
          "b"
        );

      if (badge) {
        badge.textContent =
          label;
      }
    }


    function fiscalReadiness() {

      const cfg =
        {
          ...configDefault(),
          ...(
            config
            ||
            {}
          )
        };

      const missing = [];

      if (!text(cfg.razonSocial)) {
        missing.push(
          "Razón social"
        );
      }

      if (
        !/^\d{13}$/.test(
          text(
            cfg.ruc
          )
        )
      ) {
        missing.push(
          "RUC"
        );
      }

      if (!text(cfg.dirMatriz)) {
        missing.push(
          "Dirección matriz"
        );
      }

      if (
        !/^\d{3}$/.test(
          text(
            cfg.estab
          )
        )
      ) {
        missing.push(
          "Establecimiento"
        );
      }

      if (
        !/^\d{3}$/.test(
          text(
            cfg.ptoEmi
          )
        )
      ) {
        missing.push(
          "Punto de emisión"
        );
      }

      return {
        ok:
          missing.length === 0,

        missing
      };
    }


    async function verificarProduccionSri() {

      if (
        !els.productionOverall
      ) {
        return;
      }

      els.productionOverall.textContent =
        "VERIFICANDO...";

      if (
        els.productionMessage
      ) {
        els.productionMessage.textContent =
          "Revisando configuración local y conexión privada con el backend.";
      }

      const fiscal =
        fiscalReadiness();

      setProductionCheck(
        "fiscal",
        fiscal.ok
          ? "ok"
          : "pending",
        fiscal.ok
          ? "LISTO"
          : "PENDIENTE"
      );

      const isProduction =
        String(
          config?.ambiente
          ||
          "1"
        )
        ===
        "2";

      setProductionCheck(
        "environment",
        isProduction
          ? "ok"
          : "pending",
        isProduction
          ? "PRODUCCIÓN"
          : "PRUEBAS"
      );

      setProductionCheck(
        "documents",
        "ok",
        "LISTO"
      );

      setProductionCheck(
        "ride",
        "ok",
        "LISTO"
      );

      const base =
        backendUrl();

      let backendOk =
        false;

      let certificateOk =
        false;

      let certificateDetail =
        "";

      if (!base) {

        setProductionCheck(
          "backend",
          "pending",
          "PENDIENTE"
        );

        setProductionCheck(
          "certificate",
          "pending",
          "PENDIENTE"
        );

      } else {

        try {

          const health =
            await fetch(
              base +
              "/health"
            );

          if (!health.ok) {
            throw new Error(
              "HTTP " +
              health.status
            );
          }

          backendOk =
            true;

          setProductionCheck(
            "backend",
            "ok",
            "LISTO"
          );

          try {

            const cert =
              await backendRequest(
                "/api/sri/certificate"
              );

            const info =
              cert?.certificate
              ||
              {};

            certificateOk =
              Boolean(
                info.subject
                ||
                info.notValidAfter
                ||
                cert?.ok
              );

            certificateDetail =
              info.notValidAfter
                ? (
                    "Certificado cargado, vence "
                    +
                    new Date(
                      info.notValidAfter
                    )
                      .toLocaleDateString(
                        "es-EC"
                      )
                  )
                : (
                    certificateOk
                      ? "Certificado cargado."
                      : ""
                  );

            setProductionCheck(
              "certificate",
              certificateOk
                ? "ok"
                : "pending",
              certificateOk
                ? "LISTO"
                : "PENDIENTE"
            );

          } catch (error) {

            certificateDetail =
              "Backend conectado, pero todavía no hay certificado electrónico válido.";

            setProductionCheck(
              "certificate",
              "pending",
              "PENDIENTE"
            );
          }

        } catch (error) {

          setProductionCheck(
            "backend",
            "error",
            "ERROR"
          );

          setProductionCheck(
            "certificate",
            "pending",
            "PENDIENTE"
          );
        }
      }

      const readyForProduction =
        fiscal.ok
        &&
        isProduction
        &&
        backendOk
        &&
        certificateOk;

      els.productionOverall.textContent =
        readyForProduction
          ? "LISTO PARA PRODUCCIÓN"
          : "AÚN NO LISTO";

      els.productionOverall
        .classList
        .toggle(
          "ok",
          readyForProduction
        );

      const messages = [];

      if (!fiscal.ok) {
        messages.push(
          "Falta configuración fiscal: "
          +
          fiscal.missing.join(
            ", "
          )
          +
          "."
        );
      }

      if (!isProduction) {
        messages.push(
          "El ambiente sigue en PRUEBAS. Esto es correcto mientras terminamos la validación."
        );
      }

      if (!backendOk) {
        messages.push(
          base
            ? "El backend no respondió correctamente."
            : "Falta configurar la URL del backend."
        );
      }

      if (!certificateOk) {
        messages.push(
          certificateDetail
          ||
          "Falta instalar una firma electrónica válida en el backend."
        );
      }

      if (
        readyForProduction
      ) {
        messages.push(
          "Los prerrequisitos técnicos están completos. Antes de emitir una factura real debe hacerse una prueba controlada de firma, recepción y autorización SRI."
        );
      }

      if (
        els.productionMessage
      ) {
        els.productionMessage.textContent =
          messages.join(
            " "
          );
      }
    }




    els.verificarProduccion
      ?.addEventListener(
        "click",
        verificarProduccionSri
      );


    // ======================================================
    // PEDIDOS DISPONIBLES
    // ======================================================

    function pedidoYaFacturado(
      pedidoId
    ) {

      return comprobantes
        .some(
          item =>
            item.pedidoId ===
            pedidoId
            &&
            item.estado !==
            "ANULADO"
        );
    }

    function poblarPedidos() {

      if (
        !els.pedidoSelect
      ) {
        return;
      }

      const current =
        els.pedidoSelect.value;

      const list =
        pedidos()
          .filter(
            order =>
              order.estado !==
              "Cancelado"
          )
          .sort(
            (
              a,
              b
            ) => {

              const da =
                firestoreDate(
                  a.creadoEn
                )
                ?.getTime()
                ||
                0;

              const dbb =
                firestoreDate(
                  b.creadoEn
                )
                ?.getTime()
                ||
                0;

              return dbb - da;
            }
          );

      els.pedidoSelect.innerHTML =
        '<option value="">Selecciona un pedido</option>';

      list.forEach(
        function (order) {

          const option =
            document.createElement(
              "option"
            );

          option.value =
            order.id;

          const customer =
            [
              order.cliente
                ?.nombres,
              order.cliente
                ?.apellidos
            ]
              .filter(Boolean)
              .join(" ");

          option.textContent =
            (
              order.numero ||
              order.id
            )
            +
            " · "
            +
            (
              customer ||
              "Cliente"
            )
            +
            " · "
            +
            money(
              order.resumen
                ?.total
            )
            +
            (
              pedidoYaFacturado(
                order.id
              )
                ? " · FACTURADO"
                : ""
            );

          if (
            pedidoYaFacturado(
              order.id
            )
          ) {
            option.disabled =
              true;
          }

          els.pedidoSelect
            .appendChild(
              option
            );
        }
      );

      if (
        current
        &&
        Array.from(
          els.pedidoSelect.options
        )
          .some(
            option =>
              option.value ===
              current
          )
      ) {
        els.pedidoSelect.value =
          current;
      }

      pintarPedidoPreview();
    }

    function pedidoSeleccionado() {

      const id =
        els.pedidoSelect
          ?.value
        ||
        "";

      return pedidos()
        .find(
          order =>
            order.id ===
            id
        )
        ||
        null;
    }

    function pintarPedidoPreview() {

      if (
        !els.preview
      ) {
        return;
      }

      const order =
        pedidoSeleccionado();

      if (!order) {

        els.preview.textContent =
          "Selecciona un pedido para revisar los datos que se usarán en la factura.";

        return;
      }

      const client =
        order.cliente ||
        {};

      const delivery =
        order.entrega ||
        {};

      const items =
        Array.isArray(
          order.productos
        )
          ? order.productos
          : [];

      els.preview.innerHTML =
        [
          "<strong>Pedido:</strong> ",
          escapeHtml(
            order.numero ||
            order.id
          ),
          "<br>",
          "<strong>Cliente:</strong> ",
          escapeHtml(
            [
              client.nombres,
              client.apellidos
            ]
              .filter(Boolean)
              .join(" ")
            ||
            "Consumidor final"
          ),
          " · ",
          escapeHtml(
            client.identificacion ||
            "Sin identificación"
          ),
          "<br>",
          "<strong>Email:</strong> ",
          escapeHtml(
            client.email ||
            "—"
          ),
          "<br>",
          "<strong>Entrega:</strong> ",
          escapeHtml(
            [
              delivery.provincia,
              delivery.ciudad,
              delivery.direccion
            ]
              .filter(Boolean)
              .join(" · ")
            ||
            "—"
          ),
          "<br>",
          "<strong>Productos:</strong> ",
          String(
            items.length
          ),
          " · <strong>Total pedido:</strong> ",
          money(
            order.resumen
              ?.total
          )
        ].join("");
    }

    els.pedidoSelect
      ?.addEventListener(
        "change",
        pintarPedidoPreview
      );

    window.addEventListener(
      "sixteen:admin-data-updated",
      poblarPedidos
    );

    window.addEventListener(
      "sixteen:backup-data-updated",
      poblarPedidos
    );

    // ======================================================
    // GENERACIÓN FACTURA + XML
    // ======================================================

    function setGenerateMessage(
      message,
      ok = false
    ) {

      if (!els.generarMensaje) {
        return;
      }

      els.generarMensaje.textContent =
        message;

      els.generarMensaje.style.color =
        ok
          ? "#87c99d"
          : "#a97872";
    }

    async function generarFactura() {

      const order =
        pedidoSeleccionado();

      if (!order) {

        setGenerateMessage(
          "Selecciona un pedido."
        );

        return;
      }

      if (
        pedidoYaFacturado(
          order.id
        )
      ) {

        setGenerateMessage(
          "Este pedido ya tiene un comprobante generado."
        );

        return;
      }

      const cfg =
        {
          ...configDefault(),
          ...(
            config ||
            {}
          )
        };

      const errors =
        SRI.validateConfig(
          cfg
        );

      if (
        errors.length
      ) {

        setGenerateMessage(
          "Primero completa Configuración SRI: "
          +
          errors.join(
            ", "
          )
          +
          "."
        );

        return;
      }

      const invoiceRef =
        COLLECTION.doc(
          "factura_pedido_"
          +
          order.id
        );

      try {

        els.generar.disabled =
          true;

        els.generar.textContent =
          "GENERANDO...";

        setGenerateMessage(
          "Reservando secuencial y construyendo XML..."
        );

        let invoiceSaved =
          null;

        await db
          .runTransaction(
            async function (transaction) {

              const existingInvoiceSnap =
                await transaction.get(
                  invoiceRef
                );

              if (
                existingInvoiceSnap.exists
              ) {
                throw new Error(
                  "Este pedido ya tiene una factura reservada o generada."
                );
              }

              const configSnap =
                await transaction.get(
                  CONFIG_REF
                );

              const liveConfig =
                {
                  ...cfg,
                  ...(
                    configSnap.exists
                      ? configSnap.data()
                      : {}
                  )
                };

              const nextSequence =
                Math.max(
                  1,
                  Math.floor(
                    number(
                      liveConfig
                        .secuencialFactura
                    )
                  )
                );

              const invoice =
                SRI.buildInvoice(
                  order,
                  productos(),
                  liveConfig,
                  nextSequence,
                  SRI.numericCode()
                );

              const xml =
                SRI.buildXml(
                  invoice
                );

              invoiceSaved =
                {
                  ...invoice,

                  pedidoId:
                    order.id,

                  pedidoNumero:
                    order.numero ||
                    order.id,

                  clienteUid:
                    order.clienteUid ||
                    "",

                  estado:
                    "XML_GENERADO",

                  sriEstado:
                    "PENDIENTE_FIRMA",

                  xmlSinFirma:
                    xml,

                  xmlFirmado:
                    "",

                  autorizacion:
                    "",

                  fechaAutorizacion:
                    null,

                  mensajesSri:
                    [],

                  origen:
                    "sixteen-facturacion",

                  esquema:
                    "OFFLINE",

                  fichaTecnica:
                    "2.32",

                  creadoPor:
                    usuario?.uid ||
                    "",

                  creadoEn:
                    FieldValue.serverTimestamp(),

                  actualizadoEn:
                    FieldValue.serverTimestamp()
                };

              transaction.set(
                invoiceRef,
                invoiceSaved
              );

              transaction.set(
                CONFIG_REF,
                {
                  secuencialFactura:
                    nextSequence +
                    1,

                  ultimoSecuencialReservado:
                    nextSequence,

                  ultimaClaveAcceso:
                    invoice.claveAcceso,

                  actualizadoEn:
                    FieldValue.serverTimestamp()
                },
                {
                  merge:
                    true
                }
              );
            }
          );

        setGenerateMessage(
          "Factura "
          +
          invoiceSaved.numero
          +
          " generada. XML pendiente de firma electrónica.",
          true
        );

        if (
          els.pedidoSelect
        ) {
          els.pedidoSelect.value =
            "";
        }

        pintarPedidoPreview();

      } catch (error) {

        console.error(
          "Generar factura:",
          error
        );

        setGenerateMessage(
          error.message ||
          "No fue posible generar la factura."
        );

      } finally {

        els.generar.disabled =
          false;

        els.generar.textContent =
          "GENERAR FACTURA + XML";
      }
    }

    els.generar
      ?.addEventListener(
        "click",
        generarFactura
      );


    // ======================================================
    // PASO 16F3B · NOTA DE CRÉDITO TOTAL / PARCIAL
    // ======================================================

    function notasCreditoDeFactura(
      invoice
    ) {

      if (!invoice) {
        return [];
      }

      return comprobantes.filter(
        item =>
          text(
            item.tipoDocumento
          )
          ===
          "NOTA_CREDITO"
          &&
          (
            text(
              item.documentoSustentoId
              ||
              item.documentoSustento
                ?.id
            )
            ===
            text(
              invoice.id
            )
            ||
            (
              text(
                item.documentoSustento
                  ?.numero
                ||
                item.documentoSustentoNumero
              )
              &&
              text(
                item.documentoSustento
                  ?.numero
                ||
                item.documentoSustentoNumero
              )
              ===
              text(
                invoice.numero
              )
            )
          )
      );
    }


    function cantidadesYaAcreditadas(
      invoice
    ) {

      const result =
        new Map();

      notasCreditoDeFactura(
        invoice
      )
        .forEach(
          note => {

            const details =
              Array.isArray(
                note.detalles
              )
                ? note.detalles
                : [];

            details.forEach(
              (
                detail,
                fallbackIndex
              ) => {

                const explicitIndex =
                  Number(
                    detail
                      .sourceLineIndex
                  );

                const index =
                  Number.isInteger(
                    explicitIndex
                  )
                  &&
                  explicitIndex >= 0
                    ? explicitIndex
                    : fallbackIndex;

                result.set(
                  index,
                  number(
                    result.get(
                      index
                    )
                  )
                  +
                  Math.max(
                    0,
                    number(
                      detail.cantidad
                    )
                  )
                );
              }
            );
          }
        );

      return result;
    }


    function cantidadDisponibleLinea(
      invoice,
      index
    ) {

      const source =
        invoice
          ?.detalles
          ?.[index];

      if (!source) {
        return 0;
      }

      const credited =
        cantidadesYaAcreditadas(
          invoice
        );

      return Math.max(
        0,
        number(
          source.cantidad
        )
        -
        number(
          credited.get(
            index
          )
        )
      );
    }


    function facturaTieneSaldoAcreditable(
      invoice
    ) {

      const details =
        Array.isArray(
          invoice?.detalles
        )
          ? invoice.detalles
          : [];

      return details.some(
        (
          _,
          index
        ) =>
          cantidadDisponibleLinea(
            invoice,
            index
          )
          >
          0.000001
      );
    }


    function facturasDisponiblesNotaCredito() {

      return comprobantes
        .filter(
          item =>
            text(
              item.tipoDocumento
            )
            ===
            "FACTURA"
            &&
            facturaTieneSaldoAcreditable(
              item
            )
        )
        .sort(
          (
            a,
            b
          ) =>
            text(
              b.numero
            )
              .localeCompare(
                text(
                  a.numero
                )
              )
        );
    }


    function poblarFacturasNotaCredito() {

      if (
        !els.notaCreditoFactura
      ) {
        return;
      }

      const current =
        els.notaCreditoFactura
          .value;

      const invoices =
        facturasDisponiblesNotaCredito();

      els.notaCreditoFactura
        .innerHTML =
          [
            '<option value="">Selecciona una factura</option>',
            ...invoices.map(
              item => `
                <option value="${escapeHtml(item.id)}">
                  ${escapeHtml(item.numero || "Factura")}
                  · ${escapeHtml(item.comprador?.razonSocial || "Cliente")}
                  · ${money(item.totales?.importeTotal)}
                  · ${escapeHtml(item.estado || "")}
                </option>
              `
            )
          ]
            .join("");

      if (
        invoices.some(
          item =>
            item.id ===
            current
        )
      ) {
        els.notaCreditoFactura
          .value =
            current;
      }
    }


    function facturaNotaCreditoSeleccionada() {

      const id =
        text(
          els.notaCreditoFactura
            ?.value
        );

      if (!id) {
        return null;
      }

      return comprobantes.find(
        item =>
          item.id ===
          id
          &&
          text(
            item.tipoDocumento
          )
          ===
          "FACTURA"
      )
      ||
      null;
    }


    function valorParcialLinea(
      detail,
      qty
    ) {

      const originalQty =
        number(
          detail?.cantidad
        );

      if (
        originalQty <= 0
        ||
        qty <= 0
      ) {
        return 0;
      }

      const ratio =
        qty /
        originalQty;

      return SRI.money(
        (
          number(
            detail
              ?.precioTotalSinImpuesto
          )
          +
          number(
            detail?.iva
          )
        )
        *
        ratio
      );
    }


    function leerSeleccionNotaCredito(
      strict = true
    ) {

      const invoice =
        facturaNotaCreditoSeleccionada();

      if (!invoice) {
        return [];
      }

      const details =
        Array.isArray(
          invoice.detalles
        )
          ? invoice.detalles
          : [];

      const result = [];

      els.notaCreditoDetalleLista
        ?.querySelectorAll(
          ".nota-credito-linea"
        )
        .forEach(
          row => {

            const index =
              Number(
                row.dataset.index
              );

            const checkbox =
              row.querySelector(
                ".nota-credito-check"
              );

            const input =
              row.querySelector(
                ".nota-credito-cantidad"
              );

            if (
              !checkbox
              ||
              !checkbox.checked
            ) {
              return;
            }

            const qty =
              number(
                input?.value
              );

            const available =
              cantidadDisponibleLinea(
                invoice,
                index
              );

            if (
              strict
              &&
              (
                qty <= 0
                ||
                qty >
                available
                +
                0.000001
              )
            ) {
              throw new Error(
                "Revisa la cantidad seleccionada en "
                +
                (
                  details[index]
                    ?.descripcion
                  ||
                  "una línea"
                )
                +
                "."
              );
            }

            if (
              qty > 0
              &&
              qty <=
              available
              +
              0.000001
            ) {
              result.push({
                index,
                cantidad:
                  qty
              });
            }
          }
        );

      return result;
    }


    function actualizarResumenNotaCredito() {

      if (
        !els.notaCreditoResumen
      ) {
        return;
      }

      const invoice =
        facturaNotaCreditoSeleccionada();

      if (!invoice) {

        els.notaCreditoResumen
          .innerHTML =
            '<span>0 líneas seleccionadas</span><strong>$0.00</strong>';

        return;
      }

      let selected = [];

      try {
        selected =
          leerSeleccionNotaCredito(
            false
          );
      } catch (_) {}

      const total =
        SRI.money(
          selected.reduce(
            (
              sum,
              item
            ) =>
              sum
              +
              valorParcialLinea(
                invoice.detalles[
                  item.index
                ],
                item.cantidad
              ),
            0
          )
        );

      els.notaCreditoResumen
        .innerHTML =
          '<span>'
          +
          selected.length
          +
          ' línea'
          +
          (
            selected.length === 1
              ? ""
              : "s"
          )
          +
          ' seleccionada'
          +
          (
            selected.length === 1
              ? ""
              : "s"
          )
          +
          '</span><strong>'
          +
          money(
            total
          )
          +
          '</strong>';

      selected.forEach(
        item => {

          const row =
            els.notaCreditoDetalleLista
              ?.querySelector(
                '.nota-credito-linea[data-index="'
                +
                item.index
                +
                '"]'
              );

          const output =
            row?.querySelector(
              ".nota-credito-linea-total strong"
            );

          if (output) {
            output.textContent =
              money(
                valorParcialLinea(
                  invoice.detalles[
                    item.index
                  ],
                  item.cantidad
                )
              );
          }
        }
      );
    }


    function pintarProductosNotaCredito() {

      if (
        !els.notaCreditoDetalleLista
      ) {
        return;
      }

      const invoice =
        facturaNotaCreditoSeleccionada();

      if (!invoice) {

        els.notaCreditoDetalleLista
          .innerHTML =
            '<div class="nota-credito-empty">Selecciona una factura para ver sus productos.</div>';

        actualizarResumenNotaCredito();

        return;
      }

      const details =
        Array.isArray(
          invoice.detalles
        )
          ? invoice.detalles
          : [];

      if (!details.length) {

        els.notaCreditoDetalleLista
          .innerHTML =
            '<div class="nota-credito-empty">La factura no contiene líneas acreditables.</div>';

        actualizarResumenNotaCredito();

        return;
      }

      els.notaCreditoDetalleLista
        .innerHTML =
          details.map(
            (
              detail,
              index
            ) => {

              const available =
                cantidadDisponibleLinea(
                  invoice,
                  index
                );

              const original =
                number(
                  detail.cantidad
                );

              const credited =
                Math.max(
                  0,
                  original
                  -
                  available
                );

              const disabled =
                available <=
                0.000001;

              const variant =
                [
                  detail.color
                    ? "Color: " + detail.color
                    : "",
                  detail.talla
                    ? "Talla: " + detail.talla
                    : ""
                ]
                  .filter(Boolean)
                  .join(" · ");

              return `
                <div
                  class="nota-credito-linea ${disabled ? "is-disabled" : ""}"
                  data-index="${index}"
                >

                  <div class="nota-credito-linea-check">
                    <input
                      class="nota-credito-check"
                      type="checkbox"
                      ${disabled ? "disabled" : ""}
                      aria-label="Seleccionar ${escapeHtml(detail.descripcion || "línea")}"
                    >
                  </div>

                  <div class="nota-credito-linea-info">
                    <strong>
                      ${escapeHtml(detail.descripcion || "Producto SIXTEEN")}
                    </strong>

                    <small>
                      ${escapeHtml(detail.codigoPrincipal || detail.codigoInterno || "ITEM")}
                      ${variant ? " · " + escapeHtml(variant) : ""}
                      · Facturado: ${escapeHtml(original)}
                      · Ya acreditado: ${escapeHtml(credited)}
                      · Disponible: ${escapeHtml(available)}
                    </small>
                  </div>

                  <div class="nota-credito-linea-qty">
                    <label>
                      CANTIDAD
                      <input
                        class="nota-credito-cantidad"
                        type="number"
                        min="0"
                        max="${escapeHtml(available)}"
                        step="0.000001"
                        value="0"
                        ${disabled ? "disabled" : ""}
                      >
                    </label>
                  </div>

                  <div class="nota-credito-linea-total">
                    <span>VALOR</span>
                    <strong>$0.00</strong>
                  </div>

                </div>
              `;
            }
          )
          .join("");

      els.notaCreditoDetalleLista
        .querySelectorAll(
          ".nota-credito-check"
        )
        .forEach(
          checkbox =>
            checkbox.addEventListener(
              "change",
              function () {

                const row =
                  checkbox.closest(
                    ".nota-credito-linea"
                  );

                const input =
                  row?.querySelector(
                    ".nota-credito-cantidad"
                  );

                const index =
                  Number(
                    row?.dataset.index
                  );

                const available =
                  cantidadDisponibleLinea(
                    invoice,
                    index
                  );

                if (
                  checkbox.checked
                  &&
                  input
                  &&
                  number(
                    input.value
                  )
                  <= 0
                ) {
                  input.value =
                    String(
                      Math.min(
                        1,
                        available
                      )
                    );
                }

                if (
                  !checkbox.checked
                  &&
                  input
                ) {
                  input.value =
                    "0";
                }

                actualizarResumenNotaCredito();
              }
            )
        );

      els.notaCreditoDetalleLista
        .querySelectorAll(
          ".nota-credito-cantidad"
        )
        .forEach(
          input =>
            input.addEventListener(
              "input",
              function () {

                const row =
                  input.closest(
                    ".nota-credito-linea"
                  );

                const checkbox =
                  row?.querySelector(
                    ".nota-credito-check"
                  );

                if (
                  checkbox
                  &&
                  number(
                    input.value
                  )
                  >
                  0
                ) {
                  checkbox.checked =
                    true;
                }

                actualizarResumenNotaCredito();
              }
            )
        );

      actualizarResumenNotaCredito();
    }


    function pintarNotaCreditoPreview() {

      if (
        !els.notaCreditoPreview
      ) {
        return;
      }

      const invoice =
        facturaNotaCreditoSeleccionada();

      if (!invoice) {

        els.notaCreditoPreview
          .innerHTML =
            "Selecciona una factura para revisar la nota de crédito.";

        pintarProductosNotaCredito();

        return;
      }

      const authorized =
        invoice.estado ===
        "AUTORIZADO";

      const credits =
        notasCreditoDeFactura(
          invoice
        );

      els.notaCreditoPreview
        .innerHTML =
          [
            "<strong>Factura:</strong> ",
            escapeHtml(
              invoice.numero
              ||
              "—"
            ),
            "<br>",
            "<strong>Cliente:</strong> ",
            escapeHtml(
              invoice.comprador
                ?.razonSocial
              ||
              "—"
            ),
            " · ",
            escapeHtml(
              invoice.comprador
                ?.identificacion
              ||
              "—"
            ),
            "<br>",
            "<strong>Fecha sustento:</strong> ",
            escapeHtml(
              invoice.fechaEmision
              ||
              "—"
            ),
            "<br>",
            "<strong>Total factura:</strong> ",
            money(
              invoice.totales
                ?.importeTotal
            ),
            "<br>",
            "<strong>Notas previas:</strong> ",
            escapeHtml(
              credits.length
            ),
            "<br>",
            authorized
              ? '<span class="facturacion-source-ok">Factura AUTORIZADA: la nota podrá procesarse cuando exista firma electrónica.</span>'
              : '<span class="facturacion-source-warning">Borrador permitido. El envío al SRI permanecerá bloqueado hasta que la factura de sustento esté AUTORIZADA.</span>'
          ]
            .join("");

      pintarProductosNotaCredito();
    }


    function seleccionarTodoNotaCredito() {

      const invoice =
        facturaNotaCreditoSeleccionada();

      if (!invoice) {
        return;
      }

      els.notaCreditoDetalleLista
        ?.querySelectorAll(
          ".nota-credito-linea"
        )
        .forEach(
          row => {

            const index =
              Number(
                row.dataset.index
              );

            const available =
              cantidadDisponibleLinea(
                invoice,
                index
              );

            const checkbox =
              row.querySelector(
                ".nota-credito-check"
              );

            const input =
              row.querySelector(
                ".nota-credito-cantidad"
              );

            if (
              available >
              0.000001
            ) {

              if (checkbox) {
                checkbox.checked =
                  true;
              }

              if (input) {
                input.value =
                  String(
                    available
                  );
              }
            }
          }
        );

      actualizarResumenNotaCredito();
    }


    function limpiarSeleccionNotaCredito() {

      els.notaCreditoDetalleLista
        ?.querySelectorAll(
          ".nota-credito-linea"
        )
        .forEach(
          row => {

            const checkbox =
              row.querySelector(
                ".nota-credito-check"
              );

            const input =
              row.querySelector(
                ".nota-credito-cantidad"
              );

            if (checkbox) {
              checkbox.checked =
                false;
            }

            if (input) {
              input.value =
                "0";
            }

            const output =
              row.querySelector(
                ".nota-credito-linea-total strong"
              );

            if (output) {
              output.textContent =
                "$0.00";
            }
          }
        );

      actualizarResumenNotaCredito();
    }


    function abrirNotaCredito() {

      poblarFacturasNotaCredito();

      if (
        els.notaCreditoFecha
      ) {
        els.notaCreditoFecha
          .value =
            SRI.dateParts(
              new Date()
            ).iso;
      }

      if (
        els.notaCreditoMotivo
      ) {
        els.notaCreditoMotivo
          .value =
            "";
      }

      pintarNotaCreditoPreview();

      if (
        els.notaCreditoMensaje
      ) {
        els.notaCreditoMensaje
          .textContent =
            "";
      }

      abrirModalFacturacion(
        els.notaCreditoModal,
        els.notaCreditoFactura
      );
    }


    function cerrarNotaCredito() {

      cerrarModalFacturacion(
        els.notaCreditoModal
      );
    }


    function mensajeNotaCredito(
      message,
      ok = false
    ) {

      if (
        !els.notaCreditoMensaje
      ) {
        return;
      }

      els.notaCreditoMensaje
        .textContent =
          message;

      els.notaCreditoMensaje
        .style.color =
          ok
            ? "#87c99d"
            : "#a97872";
    }


    async function generarNotaCredito(
      event
    ) {

      event
        ?.preventDefault();

      const sourceInvoice =
        facturaNotaCreditoSeleccionada();

      if (!sourceInvoice) {

        mensajeNotaCredito(
          "Selecciona una factura de sustento."
        );

        return;
      }

      let selection;

      try {
        selection =
          leerSeleccionNotaCredito(
            true
          );
      } catch (error) {
        mensajeNotaCredito(
          error.message
          ||
          "Revisa las cantidades seleccionadas."
        );
        return;
      }

      if (
        !selection.length
      ) {

        mensajeNotaCredito(
          "Selecciona al menos un producto y una cantidad mayor a cero."
        );

        return;
      }

      const reason =
        text(
          els.notaCreditoMotivo
            ?.value
        );

      if (
        !reason
        ||
        reason.length >
        300
      ) {

        mensajeNotaCredito(
          "Ingresa un motivo de hasta 300 caracteres."
        );

        return;
      }

      const emissionDate =
        text(
          els.notaCreditoFecha
            ?.value
        );

      if (!emissionDate) {

        mensajeNotaCredito(
          "Selecciona la fecha de emisión."
        );

        return;
      }

      const cfg =
        {
          ...configDefault(),
          ...(
            config
            ||
            {}
          )
        };

      const errors =
        SRI.validateConfig(
          cfg
        );

      if (
        errors.length
      ) {

        mensajeNotaCredito(
          "Primero completa Configuración SRI: "
          +
          errors.join(
            ", "
          )
          +
          "."
        );

        return;
      }

      const noteRef =
        COLLECTION.doc();

      try {

        if (
          els.generarNotaCredito
        ) {
          els.generarNotaCredito
            .disabled =
              true;

          els.generarNotaCredito
            .textContent =
              "GENERANDO...";
        }

        mensajeNotaCredito(
          "Reservando secuencial y construyendo XML..."
        );

        let saved =
          null;

        await db
          .runTransaction(
            async function (transaction) {

              const configSnap =
                await transaction.get(
                  CONFIG_REF
                );

              const liveConfig =
                {
                  ...cfg,
                  ...(
                    configSnap.exists
                      ? configSnap.data()
                      : {}
                  )
                };

              const nextSequence =
                Math.max(
                  1,
                  Math.floor(
                    number(
                      liveConfig
                        .secuencialNotaCredito
                      ||
                      1
                    )
                  )
                );

              const note =
                SRI.buildCreditNotePartial(
                  sourceInvoice,
                  selection,
                  liveConfig,
                  nextSequence,
                  reason,
                  emissionDate,
                  SRI.numericCode()
                );

              const xml =
                SRI.buildCreditNoteXml(
                  note
                );

              const sourceAuthorized =
                sourceInvoice.estado ===
                "AUTORIZADO";

              saved =
                {
                  ...note,

                  pedidoId:
                    sourceInvoice.pedidoId
                    ||
                    "",

                  pedidoNumero:
                    sourceInvoice.pedidoNumero
                    ||
                    "",

                  clienteUid:
                    sourceInvoice.clienteUid
                    ||
                    "",

                  documentoSustentoId:
                    sourceInvoice.id,

                  documentoSustentoNumero:
                    sourceInvoice.numero
                    ||
                    "",

                  estado:
                    "XML_GENERADO",

                  sriEstado:
                    sourceAuthorized
                      ? "PENDIENTE_FIRMA"
                      : "PENDIENTE_DOCUMENTO_SUSTENTO",

                  xmlSinFirma:
                    xml,

                  xmlFirmado:
                    "",

                  autorizacion:
                    "",

                  fechaAutorizacion:
                    null,

                  mensajesSri:
                    [],

                  origen:
                    "sixteen-facturacion",

                  esquema:
                    "OFFLINE",

                  fichaTecnica:
                    "2.32",

                  creadoPor:
                    usuario?.uid
                    ||
                    "",

                  creadoEn:
                    FieldValue
                      .serverTimestamp(),

                  actualizadoEn:
                    FieldValue
                      .serverTimestamp()
                };

              transaction.set(
                noteRef,
                saved
              );

              transaction.set(
                CONFIG_REF,
                {
                  secuencialNotaCredito:
                    nextSequence
                    +
                    1,

                  ultimoSecuencialNotaCredito:
                    nextSequence,

                  ultimaClaveAccesoNotaCredito:
                    note.claveAcceso,

                  actualizadoEn:
                    FieldValue
                      .serverTimestamp()
                },
                {
                  merge:
                    true
                }
              );
            }
          );

        mensajeNotaCredito(
          "Nota de crédito "
          +
          saved.numero
          +
          " generada correctamente ("
          +
          (
            saved.tipoAjuste ===
            "TOTAL"
              ? "total"
              : "parcial"
          )
          +
          ") como XML sin firma.",
          true
        );

        setTimeout(
          cerrarNotaCredito,
          1100
        );

      } catch (error) {

        console.error(
          "Generar nota de crédito:",
          error
        );

        mensajeNotaCredito(
          error.message
          ||
          "No fue posible generar la nota de crédito."
        );

      } finally {

        if (
          els.generarNotaCredito
        ) {
          els.generarNotaCredito
            .disabled =
              false;

          els.generarNotaCredito
            .textContent =
              "GENERAR NOTA + XML";
        }
      }
    }


    els.abrirNotaCredito
      ?.addEventListener(
        "click",
        abrirNotaCredito
      );

    els.cerrarNotaCredito
      ?.addEventListener(
        "click",
        cerrarNotaCredito
      );

    els.cancelarNotaCredito
      ?.addEventListener(
        "click",
        cerrarNotaCredito
      );

    els.notaCreditoFactura
      ?.addEventListener(
        "change",
        pintarNotaCreditoPreview
      );

    els.notaCreditoSeleccionarTodo
      ?.addEventListener(
        "click",
        seleccionarTodoNotaCredito
      );

    els.notaCreditoLimpiar
      ?.addEventListener(
        "click",
        limpiarSeleccionNotaCredito
      );

    els.notaCreditoForm
      ?.addEventListener(
        "submit",
        generarNotaCredito
      );

    els.notaCreditoModal
      ?.addEventListener(
        "click",
        function (event) {

          if (
            event.target ===
            els.notaCreditoModal
          ) {
            cerrarNotaCredito();
          }
        }
      );


    // ======================================================

    // ======================================================
    // PASO 16F4A · NOTA DE DÉBITO
    // ======================================================

    function facturasDisponiblesNotaDebito() {

      return comprobantes
        .filter(
          item =>
            text(
              item.tipoDocumento
            )
            ===
            "FACTURA"
        )
        .sort(
          (
            a,
            b
          ) =>
            text(
              b.numero
            )
              .localeCompare(
                text(
                  a.numero
                )
              )
        );
    }


    function poblarFacturasNotaDebito() {

      if (
        !els.notaDebitoFactura
      ) {
        return;
      }

      const current =
        els.notaDebitoFactura
          .value;

      const invoices =
        facturasDisponiblesNotaDebito();

      els.notaDebitoFactura
        .innerHTML =
          [
            '<option value="">Selecciona una factura</option>',
            ...invoices.map(
              item => `
                <option value="${escapeHtml(item.id)}">
                  ${escapeHtml(item.numero || "Factura")}
                  · ${escapeHtml(item.comprador?.razonSocial || "Cliente")}
                  · ${money(item.totales?.importeTotal)}
                  · ${escapeHtml(item.estado || "")}
                </option>
              `
            )
          ]
            .join("");

      if (
        invoices.some(
          item =>
            item.id ===
            current
        )
      ) {
        els.notaDebitoFactura
          .value =
            current;
      }
    }


    function facturaNotaDebitoSeleccionada() {

      const id =
        text(
          els.notaDebitoFactura
            ?.value
        );

      if (!id) {
        return null;
      }

      return comprobantes.find(
        item =>
          item.id ===
          id
          &&
          text(
            item.tipoDocumento
          )
          ===
          "FACTURA"
      )
      ||
      null;
    }


    function tarifasIvaFactura(
      invoice
    ) {

      const rates =
        new Set();

      const taxes =
        Array.isArray(
          invoice?.totales?.taxes
        )
          ? invoice.totales.taxes
          : [];

      taxes.forEach(
        tax => {
          const rate =
            number(
              tax.tarifa
            );

          if (
            [
              0,
              5,
              12,
              14,
              15
            ].includes(
              rate
            )
          ) {
            rates.add(
              rate
            );
          }
        }
      );

      if (!rates.size) {
        rates.add(
          number(
            config?.ivaDefault
            ||
            15
          )
        );
      }

      return Array.from(
        rates
      );
    }


    function poblarIvaNotaDebito() {

      if (
        !els.notaDebitoIva
      ) {
        return;
      }

      const invoice =
        facturaNotaDebitoSeleccionada();

      const rates =
        tarifasIvaFactura(
          invoice
        );

      const current =
        number(
          els.notaDebitoIva
            .value
        );

      els.notaDebitoIva
        .innerHTML =
          rates.map(
            rate =>
              '<option value="'
              +
              escapeHtml(
                rate
              )
              +
              '">'
              +
              escapeHtml(
                rate
              )
              +
              '%</option>'
          )
          .join("");

      if (
        rates.includes(
          current
        )
      ) {
        els.notaDebitoIva
          .value =
            String(
              current
            );
      }
    }


    function actualizarTotalNotaDebito() {

      if (
        !els.notaDebitoTotal
      ) {
        return;
      }

      const base =
        Math.max(
          0,
          number(
            els.notaDebitoValorBase
              ?.value
          )
        );

      const rate =
        number(
          els.notaDebitoIva
            ?.value
        );

      const iva =
        SRI.money(
          base
          *
          rate
          /
          100
        );

      const total =
        SRI.money(
          base
          +
          iva
        );

      els.notaDebitoTotal
        .innerHTML =
          '<span>BASE '
          +
          money(
            base
          )
          +
          ' · IVA '
          +
          escapeHtml(
            rate
          )
          +
          '% = '
          +
          money(
            iva
          )
          +
          '</span><strong>'
          +
          money(
            total
          )
          +
          '</strong>';
    }


    function pintarNotaDebitoPreview() {

      if (
        !els.notaDebitoPreview
      ) {
        return;
      }

      const invoice =
        facturaNotaDebitoSeleccionada();

      if (!invoice) {

        els.notaDebitoPreview
          .innerHTML =
            "Selecciona una factura para revisar el documento de sustento.";

        poblarIvaNotaDebito();
        actualizarTotalNotaDebito();

        return;
      }

      const authorized =
        invoice.estado ===
        "AUTORIZADO";

      els.notaDebitoPreview
        .innerHTML =
          [
            "<strong>Factura:</strong> ",
            escapeHtml(
              invoice.numero
              ||
              "—"
            ),
            "<br>",
            "<strong>Cliente:</strong> ",
            escapeHtml(
              invoice.comprador
                ?.razonSocial
              ||
              "—"
            ),
            " · ",
            escapeHtml(
              invoice.comprador
                ?.identificacion
              ||
              "—"
            ),
            "<br>",
            "<strong>Fecha sustento:</strong> ",
            escapeHtml(
              invoice.fechaEmision
              ||
              "—"
            ),
            "<br>",
            "<strong>Total factura:</strong> ",
            money(
              invoice.totales
                ?.importeTotal
            ),
            "<br>",
            authorized
              ? '<span class="facturacion-source-ok">Factura AUTORIZADA: la nota podrá procesarse cuando exista firma electrónica.</span>'
              : '<span class="facturacion-source-warning">Borrador permitido. El envío al SRI permanecerá bloqueado hasta que la factura de sustento esté AUTORIZADA.</span>'
          ]
            .join("");

      poblarIvaNotaDebito();
      actualizarTotalNotaDebito();
    }


    function mensajeNotaDebito(
      message,
      ok = false
    ) {

      if (
        !els.notaDebitoMensaje
      ) {
        return;
      }

      els.notaDebitoMensaje
        .textContent =
          message;

      els.notaDebitoMensaje
        .style.color =
          ok
            ? "#87c99d"
            : "#a97872";
    }


    function abrirNotaDebito() {

      poblarFacturasNotaDebito();

      if (
        els.notaDebitoFecha
      ) {
        els.notaDebitoFecha.value =
          SRI.dateParts(
            new Date()
          ).iso;
      }

      if (
        els.notaDebitoRazon
      ) {
        els.notaDebitoRazon.value =
          "";
      }

      if (
        els.notaDebitoValorBase
      ) {
        els.notaDebitoValorBase.value =
          "";
      }

      if (
        els.notaDebitoMensaje
      ) {
        els.notaDebitoMensaje.textContent =
          "";
      }

      pintarNotaDebitoPreview();

      abrirModalFacturacion(
        els.notaDebitoModal,
        els.notaDebitoFactura
      );
    }


    function cerrarNotaDebito() {

      cerrarModalFacturacion(
        els.notaDebitoModal
      );
    }


    async function generarNotaDebito(
      event
    ) {

      event
        ?.preventDefault();

      const sourceInvoice =
        facturaNotaDebitoSeleccionada();

      if (!sourceInvoice) {
        mensajeNotaDebito(
          "Selecciona una factura de sustento."
        );
        return;
      }

      const reason =
        text(
          els.notaDebitoRazon
            ?.value
        );

      if (
        !reason
        ||
        reason.length >
        300
      ) {
        mensajeNotaDebito(
          "Ingresa una razón de hasta 300 caracteres."
        );
        return;
      }

      const baseValue =
        number(
          els.notaDebitoValorBase
            ?.value
        );

      if (
        baseValue <= 0
      ) {
        mensajeNotaDebito(
          "El valor base debe ser mayor a cero."
        );
        return;
      }

      const rate =
        number(
          els.notaDebitoIva
            ?.value
        );

      const emissionDate =
        text(
          els.notaDebitoFecha
            ?.value
        );

      if (!emissionDate) {
        mensajeNotaDebito(
          "Selecciona la fecha de emisión."
        );
        return;
      }

      const cfg =
        {
          ...configDefault(),
          ...(
            config
            ||
            {}
          )
        };

      const errors =
        SRI.validateConfig(
          cfg
        );

      if (
        errors.length
      ) {
        mensajeNotaDebito(
          "Primero completa Configuración SRI: "
          +
          errors.join(
            ", "
          )
          +
          "."
        );
        return;
      }

      const noteRef =
        COLLECTION.doc();

      try {

        if (
          els.generarNotaDebito
        ) {
          els.generarNotaDebito.disabled =
            true;

          els.generarNotaDebito.textContent =
            "GENERANDO...";
        }

        mensajeNotaDebito(
          "Reservando secuencial y construyendo XML..."
        );

        let saved =
          null;

        await db
          .runTransaction(
            async function (
              transaction
            ) {

              const configSnap =
                await transaction.get(
                  CONFIG_REF
                );

              const liveConfig =
                {
                  ...cfg,
                  ...(
                    configSnap.exists
                      ? configSnap.data()
                      : {}
                  )
                };

              const nextSequence =
                Math.max(
                  1,
                  Math.floor(
                    number(
                      liveConfig
                        .secuencialNotaDebito
                      ||
                      1
                    )
                  )
                );

              const note =
                SRI.buildDebitNote(
                  sourceInvoice,
                  liveConfig,
                  nextSequence,
                  reason,
                  baseValue,
                  rate,
                  emissionDate,
                  SRI.numericCode()
                );

              const xml =
                SRI.buildDebitNoteXml(
                  note
                );

              const sourceAuthorized =
                sourceInvoice.estado ===
                "AUTORIZADO";

              saved =
                {
                  ...note,

                  pedidoId:
                    sourceInvoice.pedidoId
                    ||
                    "",

                  pedidoNumero:
                    sourceInvoice.pedidoNumero
                    ||
                    "",

                  clienteUid:
                    sourceInvoice.clienteUid
                    ||
                    "",

                  documentoSustentoId:
                    sourceInvoice.id,

                  documentoSustentoNumero:
                    sourceInvoice.numero
                    ||
                    "",

                  estado:
                    "XML_GENERADO",

                  sriEstado:
                    sourceAuthorized
                      ? "PENDIENTE_FIRMA"
                      : "PENDIENTE_DOCUMENTO_SUSTENTO",

                  xmlSinFirma:
                    xml,

                  xmlFirmado:
                    "",

                  autorizacion:
                    "",

                  fechaAutorizacion:
                    null,

                  mensajesSri:
                    [],

                  origen:
                    "sixteen-facturacion",

                  esquema:
                    "OFFLINE",

                  fichaTecnica:
                    "2.32",

                  creadoPor:
                    usuario?.uid
                    ||
                    "",

                  creadoEn:
                    FieldValue.serverTimestamp(),

                  actualizadoEn:
                    FieldValue.serverTimestamp()
                };

              transaction.set(
                noteRef,
                saved
              );

              transaction.set(
                CONFIG_REF,
                {
                  secuencialNotaDebito:
                    nextSequence
                    +
                    1,

                  ultimoSecuencialNotaDebito:
                    nextSequence,

                  ultimaClaveAccesoNotaDebito:
                    note.claveAcceso,

                  actualizadoEn:
                    FieldValue.serverTimestamp()
                },
                {
                  merge:
                    true
                }
              );
            }
          );

        mensajeNotaDebito(
          "Nota de débito "
          +
          saved.numero
          +
          " generada correctamente como XML sin firma.",
          true
        );

        setTimeout(
          cerrarNotaDebito,
          1100
        );

      } catch (error) {

        console.error(
          "Generar nota de débito:",
          error
        );

        mensajeNotaDebito(
          error.message
          ||
          "No fue posible generar la nota de débito."
        );

      } finally {

        if (
          els.generarNotaDebito
        ) {
          els.generarNotaDebito.disabled =
            false;

          els.generarNotaDebito.textContent =
            "GENERAR DÉBITO + XML";
        }
      }
    }


    els.abrirNotaDebito
      ?.addEventListener(
        "click",
        abrirNotaDebito
      );

    els.cerrarNotaDebito
      ?.addEventListener(
        "click",
        cerrarNotaDebito
      );

    els.cancelarNotaDebito
      ?.addEventListener(
        "click",
        cerrarNotaDebito
      );

    els.notaDebitoFactura
      ?.addEventListener(
        "change",
        pintarNotaDebitoPreview
      );

    els.notaDebitoValorBase
      ?.addEventListener(
        "input",
        actualizarTotalNotaDebito
      );

    els.notaDebitoIva
      ?.addEventListener(
        "change",
        actualizarTotalNotaDebito
      );

    els.notaDebitoForm
      ?.addEventListener(
        "submit",
        generarNotaDebito
      );

    els.notaDebitoModal
      ?.addEventListener(
        "click",
        function (
          event
        ) {
          if (
            event.target ===
            els.notaDebitoModal
          ) {
            cerrarNotaDebito();
          }
        }
      );



    // ======================================================
    // PASO 16F4B · GUÍA DE REMISIÓN
    // ======================================================

    function guiaPedidoSeleccionado() {

      const id =
        text(
          els.guiaPedido
            ?.value
        );

      return pedidos()
        .find(
          item =>
            item.id ===
            id
        )
        ||
        null;
    }


    function facturaPedido(
      orderId
    ) {

      return comprobantes.find(
        item =>
          item.tipoDocumento ===
          "FACTURA"
          &&
          text(
            item.pedidoId
          )
          ===
          text(
            orderId
          )
      )
      ||
      null;
    }


    function poblarPedidosGuia() {

      if (
        !els.guiaPedido
      ) {
        return;
      }

      const current =
        els.guiaPedido.value;

      const list =
        pedidos()
          .filter(
            order =>
              order.estado !==
              "Cancelado"
          )
          .sort(
            (
              a,
              b
            ) => {

              const da =
                firestoreDate(
                  a.creadoEn
                )
                ?.getTime()
                ||
                0;

              const dbb =
                firestoreDate(
                  b.creadoEn
                )
                ?.getTime()
                ||
                0;

              return dbb - da;
            }
          );

      els.guiaPedido.innerHTML =
        '<option value="">Selecciona un pedido</option>';

      list.forEach(
        order => {

          const option =
            document.createElement(
              "option"
            );

          option.value =
            order.id;

          const customer =
            [
              order.cliente
                ?.nombres,
              order.cliente
                ?.apellidos
            ]
              .filter(Boolean)
              .join(" ");

          const support =
            facturaPedido(
              order.id
            );

          option.textContent =
            (
              order.numero
              ||
              order.id
            )
            +
            " · "
            +
            (
              customer
              ||
              "Cliente"
            )
            +
            (
              support
                ? " · FACTURA " + support.numero
                : ""
            );

          els.guiaPedido
            .appendChild(
              option
            );
        }
      );

      if (
        current
        &&
        Array.from(
          els.guiaPedido.options
        )
          .some(
            option =>
              option.value ===
              current
          )
      ) {
        els.guiaPedido.value =
          current;
      }
    }


    function autocompletarGuiaDesdePedido() {

      const order =
        guiaPedidoSeleccionado();

      if (!order) {

        if (
          els.guiaRemisionPreview
        ) {
          els.guiaRemisionPreview.textContent =
            "Selecciona un pedido para revisar destinatario, productos y factura de sustento si existe.";
        }

        return;
      }

      const delivery =
        order.entrega ||
        {};

      if (
        els.guiaDirDestinatario
      ) {
        els.guiaDirDestinatario.value =
          [
            delivery.provincia,
            delivery.ciudad,
            delivery.direccion
          ]
            .filter(Boolean)
            .join(
              " · "
            );
      }

      pintarGuiaPreview();
    }


    function pintarGuiaPreview() {

      if (
        !els.guiaRemisionPreview
      ) {
        return;
      }

      const order =
        guiaPedidoSeleccionado();

      if (!order) {

        els.guiaRemisionPreview.textContent =
          "Selecciona un pedido para revisar destinatario, productos y factura de sustento si existe.";

        return;
      }

      const client =
        order.cliente ||
        {};

      const items =
        Array.isArray(
          order.productos
        )
          ? order.productos
          : [];

      const invoice =
        facturaPedido(
          order.id
        );

      const productsHtml =
        items
          .slice(
            0,
            8
          )
          .map(
            item =>
              '<span>'
              +
              escapeHtml(
                item.codigo
                ||
                item.id
                ||
                "ITEM"
              )
              +
              " · "
              +
              escapeHtml(
                item.nombre
                ||
                item.descripcion
                ||
                "Producto"
              )
              +
              " · Cant. "
              +
              escapeHtml(
                item.cantidad
                ||
                1
              )
              +
              "</span>"
          )
          .join("");

      els.guiaRemisionPreview.innerHTML =
        [
          "<strong>Pedido:</strong> ",
          escapeHtml(
            order.numero
            ||
            order.id
          ),
          "<br>",
          "<strong>Destinatario:</strong> ",
          escapeHtml(
            [
              client.nombres,
              client.apellidos
            ]
              .filter(Boolean)
              .join(" ")
            ||
            "—"
          ),
          " · ",
          escapeHtml(
            client.identificacion
            ||
            "Sin identificación"
          ),
          "<br>",
          "<strong>Factura sustento:</strong> ",
          invoice
            ? (
                escapeHtml(
                  invoice.numero
                )
                +
                " · "
                +
                escapeHtml(
                  invoice.estado
                  ||
                  ""
                )
              )
            : "No generada todavía",
          '<div class="guide-products">',
          productsHtml,
          "</div>"
        ]
          .join("");
    }


    function mensajeGuia(
      message,
      ok = false
    ) {

      if (
        !els.guiaRemisionMensaje
      ) {
        return;
      }

      els.guiaRemisionMensaje.textContent =
        message;

      els.guiaRemisionMensaje.style.color =
        ok
          ? "#87c99d"
          : "#a97872";
    }


    function abrirGuiaRemision() {

      poblarPedidosGuia();

      const today =
        SRI.dateParts(
          new Date()
        ).iso;

      if (
        els.guiaFechaInicio
      ) {
        els.guiaFechaInicio.value =
          today;
      }

      if (
        els.guiaFechaFin
      ) {
        els.guiaFechaFin.value =
          today;
      }

      if (
        els.guiaDirPartida
        &&
        !els.guiaDirPartida.value
      ) {
        els.guiaDirPartida.value =
          config?.dirEstablecimiento
          ||
          config?.dirMatriz
          ||
          "";
      }

      if (
        els.guiaMotivoTraslado
        &&
        !els.guiaMotivoTraslado.value
      ) {
        els.guiaMotivoTraslado.value =
          "VENTA";
      }

      if (
        els.guiaRemisionMensaje
      ) {
        els.guiaRemisionMensaje.textContent =
          "";
      }

      pintarGuiaPreview();

      abrirModalFacturacion(
        els.guiaRemisionModal,
        els.guiaPedido
      );
    }


    function cerrarGuiaRemision() {

      cerrarModalFacturacion(
        els.guiaRemisionModal
      );
    }


    async function generarGuiaRemision(
      event
    ) {

      event
        ?.preventDefault();

      const order =
        guiaPedidoSeleccionado();

      if (!order) {

        mensajeGuia(
          "Selecciona un pedido."
        );

        return;
      }

      const cfg =
        {
          ...configDefault(),
          ...(
            config
            ||
            {}
          )
        };

      const configErrors =
        SRI.validateConfig(
          cfg
        );

      if (
        configErrors.length
      ) {

        mensajeGuia(
          "Primero completa Configuración SRI: "
          +
          configErrors.join(
            ", "
          )
          +
          "."
        );

        return;
      }

      const transport =
        {
          dirPartida:
            text(
              els.guiaDirPartida
                ?.value
            ),

          razonSocialTransportista:
            text(
              els.guiaTransportistaNombre
                ?.value
            ),

          identificacionTransportista:
            text(
              els.guiaTransportistaId
                ?.value
            ),

          fechaIniTransporte:
            text(
              els.guiaFechaInicio
                ?.value
            ),

          fechaFinTransporte:
            text(
              els.guiaFechaFin
                ?.value
            ),

          placa:
            text(
              els.guiaPlaca
                ?.value
            ),

          dirDestinatario:
            text(
              els.guiaDirDestinatario
                ?.value
            ),

          motivoTraslado:
            text(
              els.guiaMotivoTraslado
                ?.value
            ),

          ruta:
            text(
              els.guiaRuta
                ?.value
            ),

          codEstabDestino:
            text(
              els.guiaCodEstabDestino
                ?.value
            )
        };

      const support =
        facturaPedido(
          order.id
        );

      const docRef =
        COLLECTION.doc();

      try {

        if (
          els.generarGuiaRemision
        ) {
          els.generarGuiaRemision.disabled =
            true;

          els.generarGuiaRemision.textContent =
            "GENERANDO...";
        }

        mensajeGuia(
          "Reservando secuencial y construyendo XML..."
        );

        let saved =
          null;

        await db
          .runTransaction(
            async function (
              transaction
            ) {

              const configSnap =
                await transaction.get(
                  CONFIG_REF
                );

              const liveConfig =
                {
                  ...cfg,
                  ...(
                    configSnap.exists
                      ? configSnap.data()
                      : {}
                  )
                };

              const nextSequence =
                Math.max(
                  1,
                  Math.floor(
                    number(
                      liveConfig
                        .secuencialGuiaRemision
                      ||
                      1
                    )
                  )
                );

              const guide =
                SRI.buildGuideRemision(
                  order,
                  productos(),
                  liveConfig,
                  nextSequence,
                  transport,
                  support,
                  SRI.numericCode()
                );

              const xml =
                SRI.buildGuideRemisionXml(
                  guide
                );

              saved =
                {
                  ...guide,

                  pedidoId:
                    order.id,

                  pedidoNumero:
                    order.numero
                    ||
                    "",

                  clienteUid:
                    order.clienteUid
                    ||
                    order.uid
                    ||
                    "",

                  estado:
                    "XML_GENERADO",

                  sriEstado:
                    "PENDIENTE_FIRMA",

                  xmlSinFirma:
                    xml,

                  xmlFirmado:
                    "",

                  autorizacion:
                    "",

                  fechaAutorizacion:
                    null,

                  mensajesSri:
                    [],

                  origen:
                    "sixteen-facturacion",

                  esquema:
                    "OFFLINE",

                  fichaTecnica:
                    "2.32",

                  creadoPor:
                    usuario?.uid
                    ||
                    "",

                  creadoEn:
                    FieldValue.serverTimestamp(),

                  actualizadoEn:
                    FieldValue.serverTimestamp()
                };

              transaction.set(
                docRef,
                saved
              );

              transaction.set(
                CONFIG_REF,
                {
                  secuencialGuiaRemision:
                    nextSequence
                    +
                    1,

                  ultimoSecuencialGuiaRemision:
                    nextSequence,

                  ultimaClaveAccesoGuiaRemision:
                    guide.claveAcceso,

                  actualizadoEn:
                    FieldValue.serverTimestamp()
                },
                {
                  merge:
                    true
                }
              );
            }
          );

        mensajeGuia(
          "Guía de remisión "
          +
          saved.numero
          +
          " generada correctamente como XML sin firma.",
          true
        );

        setTimeout(
          cerrarGuiaRemision,
          1100
        );

      } catch (error) {

        console.error(
          "Generar guía de remisión:",
          error
        );

        mensajeGuia(
          error.message
          ||
          "No fue posible generar la guía de remisión."
        );

      } finally {

        if (
          els.generarGuiaRemision
        ) {
          els.generarGuiaRemision.disabled =
            false;

          els.generarGuiaRemision.textContent =
            "GENERAR GUÍA + XML";
        }
      }
    }


    els.abrirGuiaRemision
      ?.addEventListener(
        "click",
        abrirGuiaRemision
      );

    els.cerrarGuiaRemision
      ?.addEventListener(
        "click",
        cerrarGuiaRemision
      );

    els.cancelarGuiaRemision
      ?.addEventListener(
        "click",
        cerrarGuiaRemision
      );

    els.guiaPedido
      ?.addEventListener(
        "change",
        autocompletarGuiaDesdePedido
      );

    els.guiaRemisionForm
      ?.addEventListener(
        "submit",
        generarGuiaRemision
      );

    els.guiaRemisionModal
      ?.addEventListener(
        "click",
        function (
          event
        ) {

          if (
            event.target ===
            els.guiaRemisionModal
          ) {
            cerrarGuiaRemision();
          }
        }
      );

    window.addEventListener(
      "sixteen:admin-data-updated",
      poblarPedidosGuia
    );

    window.addEventListener(
      "sixteen:backup-data-updated",
      poblarPedidosGuia
    );



    // ======================================================
    // PASO 16F4C · COMPROBANTE DE RETENCIÓN ATS 2.0.0
    // ======================================================

    let retencionLineaSeq = 0;


    function retencionTipoNombre(
      code
    ) {

      const map = {
        "1": "Renta",
        "2": "IVA",
        "6": "ISD"
      };

      return map[
        String(
          code
        )
      ]
      ||
      "Retención";
    }


    function agregarLineaRetencion(
      initial = {}
    ) {

      if (
        !els.retencionLineas
      ) {
        return;
      }

      retencionLineaSeq += 1;

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "retencion-line";

      row.dataset.lineId =
        String(
          retencionLineaSeq
        );

      row.innerHTML = `
        <label>
          IMPUESTO
          <select class="retencion-tax-code">
            <option value="1">1 · Renta</option>
            <option value="2">2 · IVA</option>
            <option value="6">6 · ISD</option>
          </select>
        </label>

        <label>
          CÓD. RETENCIÓN
          <input
            class="retencion-code"
            type="text"
            maxlength="5"
            placeholder="Ej.: 312"
          >
        </label>

        <label>
          BASE IMPONIBLE
          <input
            class="retencion-base"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
          >
        </label>

        <label>
          % RETENER
          <input
            class="retencion-percent"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="0"
          >
        </label>

        <div class="retencion-line-value">
          <span>VALOR</span>
          <strong>$0.00</strong>
        </div>

        <button
          type="button"
          class="retencion-remove"
          title="Eliminar línea"
          aria-label="Eliminar línea"
        >
          ×
        </button>
      `;

      const tax =
        row.querySelector(
          ".retencion-tax-code"
        );

      const code =
        row.querySelector(
          ".retencion-code"
        );

      const base =
        row.querySelector(
          ".retencion-base"
        );

      const percent =
        row.querySelector(
          ".retencion-percent"
        );

      if (tax) {
        tax.value =
          String(
            initial.codigo
            ||
            "1"
          );
      }

      if (code) {
        code.value =
          text(
            initial.codigoRetencion
          );
      }

      if (base) {
        base.value =
          initial.baseImponible != null
            ? String(
                initial.baseImponible
              )
            : "";
      }

      if (percent) {
        percent.value =
          initial.porcentajeRetener != null
            ? String(
                initial.porcentajeRetener
              )
            : "";
      }

      function syncIvaCode() {

        if (
          tax?.value !==
          "2"
        ) {
          return;
        }

        const mapped =
          SRI.retentionIvaCode(
            number(
              percent?.value
            )
          );

        if (
          mapped
          &&
          code
          &&
          !text(
            code.value
          )
        ) {
          code.value =
            mapped;
        }
      }


      [
        tax,
        code,
        base,
        percent
      ]
        .filter(Boolean)
        .forEach(
          input => {

            input.addEventListener(
              "input",
              function () {

                syncIvaCode();
                actualizarRetencionPreview();
              }
            );

            input.addEventListener(
              "change",
              function () {

                syncIvaCode();
                actualizarRetencionPreview();
              }
            );
          }
        );

      row
        .querySelector(
          ".retencion-remove"
        )
        ?.addEventListener(
          "click",
          function () {

            row.remove();

            if (
              !els.retencionLineas
                .children
                .length
            ) {
              agregarLineaRetencion();
            }

            actualizarRetencionPreview();
          }
        );

      els.retencionLineas
        .appendChild(
          row
        );

      actualizarRetencionPreview();
    }


    function leerLineasRetencion(
      strict = true
    ) {

      const lines = [];

      els.retencionLineas
        ?.querySelectorAll(
          ".retencion-line"
        )
        .forEach(
          (
            row,
            index
          ) => {

            const taxCode =
              text(
                row.querySelector(
                  ".retencion-tax-code"
                )
                ?.value
              );

            const code =
              text(
                row.querySelector(
                  ".retencion-code"
                )
                ?.value
              );

            const base =
              number(
                row.querySelector(
                  ".retencion-base"
                )
                ?.value
              );

            const percent =
              number(
                row.querySelector(
                  ".retencion-percent"
                )
                ?.value
              );

            if (
              strict
              &&
              (
                !code
                ||
                base <= 0
                ||
                percent < 0
                ||
                percent > 100
              )
            ) {
              throw new Error(
                "Revisa la línea de retención "
                +
                (
                  index + 1
                )
                +
                "."
              );
            }

            if (
              code
              &&
              base > 0
              &&
              percent >= 0
              &&
              percent <= 100
            ) {
              lines.push({
                codigo:
                  taxCode,

                codigoRetencion:
                  code,

                baseImponible:
                  base,

                porcentajeRetener:
                  percent,

                valorRetenido:
                  SRI.money(
                    base
                    *
                    percent
                    /
                    100
                  )
              });
            }
          }
        );

      return lines;
    }


    function actualizarRetencionPreview() {

      let lines = [];

      try {
        lines =
          leerLineasRetencion(
            false
          );
      } catch (_) {}

      const total =
        SRI.money(
          lines.reduce(
            (
              sum,
              line
            ) =>
              sum
              +
              number(
                line.valorRetenido
              ),
            0
          )
        );

      els.retencionLineas
        ?.querySelectorAll(
          ".retencion-line"
        )
        .forEach(
          row => {

            const base =
              number(
                row.querySelector(
                  ".retencion-base"
                )
                ?.value
              );

            const percent =
              number(
                row.querySelector(
                  ".retencion-percent"
                )
                ?.value
              );

            const output =
              row.querySelector(
                ".retencion-line-value strong"
              );

            if (output) {
              output.textContent =
                money(
                  SRI.money(
                    base
                    *
                    percent
                    /
                    100
                  )
                );
            }
          }
        );

      if (
        els.retencionTotalPreview
      ) {
        els.retencionTotalPreview.innerHTML =
          '<span>TOTAL RETENIDO</span><strong>'
          +
          money(
            total
          )
          +
          '</strong>';
      }
    }


    function periodoFiscalDesdeFecha(
      iso
    ) {

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          text(
            iso
          )
        )
      ) {
        return "";
      }

      const parts =
        iso.split(
          "-"
        );

      return parts[1]
        +
        "/"
        +
        parts[0];
    }


    function recalcularImporteRetencion() {

      const subtotal =
        Math.max(
          0,
          number(
            els.retencionSubtotalCompra
              ?.value
          )
        );

      const rate =
        number(
          els.retencionIvaCompra
            ?.value
        );

      const total =
        SRI.money(
          subtotal
          +
          (
            subtotal
            *
            rate
            /
            100
          )
        );

      if (
        els.retencionImporteCompra
      ) {
        els.retencionImporteCompra.value =
          total
            ? total.toFixed(2)
            : "";
      }
    }


    function mensajeRetencion(
      message,
      ok = false
    ) {

      if (
        !els.retencionMensaje
      ) {
        return;
      }

      els.retencionMensaje.textContent =
        message;

      els.retencionMensaje.style.color =
        ok
          ? "#87c99d"
          : "#a97872";
    }


    function abrirRetencion() {

      const today =
        SRI.dateParts(
          new Date()
        ).iso;

      if (
        els.retencionFechaEmision
      ) {
        els.retencionFechaEmision.value =
          today;
      }

      if (
        els.retencionFechaDocSustento
      ) {
        els.retencionFechaDocSustento.value =
          today;
      }

      if (
        els.retencionFechaRegistro
      ) {
        els.retencionFechaRegistro.value =
          today;
      }

      if (
        els.retencionPeriodoFiscal
      ) {
        els.retencionPeriodoFiscal.value =
          periodoFiscalDesdeFecha(
            today
          );
      }

      if (
        els.retencionSujetoId
      ) {
        els.retencionSujetoId.value =
          "";
      }

      if (
        els.retencionSujetoNombre
      ) {
        els.retencionSujetoNombre.value =
          "";
      }

      if (
        els.retencionSujetoEmail
      ) {
        els.retencionSujetoEmail.value =
          "";
      }

      if (
        els.retencionNumDocSustento
      ) {
        els.retencionNumDocSustento.value =
          "";
      }

      if (
        els.retencionAutDocSustento
      ) {
        els.retencionAutDocSustento.value =
          "";
      }

      if (
        els.retencionSubtotalCompra
      ) {
        els.retencionSubtotalCompra.value =
          "";
      }

      if (
        els.retencionImporteCompra
      ) {
        els.retencionImporteCompra.value =
          "";
      }

      if (
        els.retencionLineas
      ) {
        els.retencionLineas.innerHTML =
          "";
      }

      retencionLineaSeq = 0;

      agregarLineaRetencion({
        codigo:
          "1"
      });

      if (
        els.retencionMensaje
      ) {
        els.retencionMensaje.textContent =
          "";
      }

      abrirModalFacturacion(
        els.retencionModal,
        els.retencionSujetoId
      );
    }


    function cerrarRetencion() {

      cerrarModalFacturacion(
        els.retencionModal
      );
    }


    async function generarRetencion(
      event
    ) {

      event
        ?.preventDefault();

      const cfg =
        {
          ...configDefault(),
          ...(
            config
            ||
            {}
          )
        };

      const errors =
        SRI.validateConfig(
          cfg
        );

      if (
        errors.length
      ) {

        mensajeRetencion(
          "Primero completa Configuración SRI: "
          +
          errors.join(
            ", "
          )
          +
          "."
        );

        return;
      }

      let lines;

      try {
        lines =
          leerLineasRetencion(
            true
          );
      } catch (error) {

        mensajeRetencion(
          error.message
          ||
          "Revisa las líneas de retención."
        );

        return;
      }

      if (
        !lines.length
      ) {

        mensajeRetencion(
          "Agrega al menos una retención."
        );

        return;
      }

      const data =
        {
          fechaEmisionIso:
            text(
              els.retencionFechaEmision
                ?.value
            ),

          periodoFiscal:
            text(
              els.retencionPeriodoFiscal
                ?.value
            ),

          sujetoRetenido: {
            identificacion:
              text(
                els.retencionSujetoId
                  ?.value
              ),

            razonSocial:
              text(
                els.retencionSujetoNombre
                  ?.value
              ),

            parteRel:
              text(
                els.retencionParteRel
                  ?.value
              )
              ||
              "NO",

            email:
              text(
                els.retencionSujetoEmail
                  ?.value
              )
          },

          documentoSustento: {
            codSustento:
              text(
                els.retencionCodSustento
                  ?.value
              ),

            codDocSustento:
              text(
                els.retencionCodDocSustento
                  ?.value
              ),

            numDocSustento:
              text(
                els.retencionNumDocSustento
                  ?.value
              ),

            fechaEmisionIso:
              text(
                els.retencionFechaDocSustento
                  ?.value
              ),

            fechaRegistroContableIso:
              text(
                els.retencionFechaRegistro
                  ?.value
              ),

            numAutDocSustento:
              text(
                els.retencionAutDocSustento
                  ?.value
              ),

            totalSinImpuestos:
              number(
                els.retencionSubtotalCompra
                  ?.value
              ),

            ivaTarifa:
              number(
                els.retencionIvaCompra
                  ?.value
              ),

            importeTotal:
              number(
                els.retencionImporteCompra
                  ?.value
              ),

            formaPago:
              text(
                els.retencionFormaPago
                  ?.value
              )
              ||
              "01"
          },

          retenciones:
            lines
        };

      const docRef =
        COLLECTION.doc();

      try {

        if (
          els.generarRetencion
        ) {
          els.generarRetencion.disabled =
            true;

          els.generarRetencion.textContent =
            "GENERANDO...";
        }

        mensajeRetencion(
          "Reservando secuencial y construyendo XML ATS..."
        );

        let saved =
          null;

        await db
          .runTransaction(
            async function (
              transaction
            ) {

              const configSnap =
                await transaction.get(
                  CONFIG_REF
                );

              const liveConfig =
                {
                  ...cfg,
                  ...(
                    configSnap.exists
                      ? configSnap.data()
                      : {}
                  )
                };

              const nextSequence =
                Math.max(
                  1,
                  Math.floor(
                    number(
                      liveConfig
                        .secuencialRetencion
                      ||
                      1
                    )
                  )
                );

              const retention =
                SRI.buildRetention(
                  liveConfig,
                  nextSequence,
                  data,
                  SRI.numericCode()
                );

              const xml =
                SRI.buildRetentionXml(
                  retention
                );

              saved =
                {
                  ...retention,

                  estado:
                    "XML_GENERADO",

                  sriEstado:
                    "PENDIENTE_FIRMA",

                  xmlSinFirma:
                    xml,

                  xmlFirmado:
                    "",

                  autorizacion:
                    "",

                  fechaAutorizacion:
                    null,

                  mensajesSri:
                    [],

                  origen:
                    "sixteen-facturacion",

                  esquema:
                    "OFFLINE",

                  fichaTecnica:
                    "2.32",

                  creadoPor:
                    usuario?.uid
                    ||
                    "",

                  creadoEn:
                    FieldValue.serverTimestamp(),

                  actualizadoEn:
                    FieldValue.serverTimestamp()
                };

              transaction.set(
                docRef,
                saved
              );

              transaction.set(
                CONFIG_REF,
                {
                  secuencialRetencion:
                    nextSequence
                    +
                    1,

                  ultimoSecuencialRetencion:
                    nextSequence,

                  ultimaClaveAccesoRetencion:
                    retention.claveAcceso,

                  actualizadoEn:
                    FieldValue.serverTimestamp()
                },
                {
                  merge:
                    true
                }
              );
            }
          );

        mensajeRetencion(
          "Comprobante de retención "
          +
          saved.numero
          +
          " generado correctamente como XML ATS sin firma.",
          true
        );

        setTimeout(
          cerrarRetencion,
          1100
        );

      } catch (error) {

        console.error(
          "Generar retención:",
          error
        );

        mensajeRetencion(
          error.message
          ||
          "No fue posible generar el comprobante de retención."
        );

      } finally {

        if (
          els.generarRetencion
        ) {
          els.generarRetencion.disabled =
            false;

          els.generarRetencion.textContent =
            "GENERAR RETENCIÓN + XML";
        }
      }
    }


    els.abrirRetencion
      ?.addEventListener(
        "click",
        abrirRetencion
      );

    els.cerrarRetencion
      ?.addEventListener(
        "click",
        cerrarRetencion
      );

    els.cancelarRetencion
      ?.addEventListener(
        "click",
        cerrarRetencion
      );

    els.agregarRetencionLinea
      ?.addEventListener(
        "click",
        function () {
          agregarLineaRetencion();
        }
      );

    els.retencionSubtotalCompra
      ?.addEventListener(
        "input",
        recalcularImporteRetencion
      );

    els.retencionIvaCompra
      ?.addEventListener(
        "change",
        recalcularImporteRetencion
      );

    els.retencionFechaDocSustento
      ?.addEventListener(
        "change",
        function () {

          const period =
            periodoFiscalDesdeFecha(
              els.retencionFechaDocSustento
                ?.value
            );

          if (
            period
            &&
            els.retencionPeriodoFiscal
          ) {
            els.retencionPeriodoFiscal.value =
              period;
          }
        }
      );

    els.retencionForm
      ?.addEventListener(
        "submit",
        generarRetencion
      );

    els.retencionModal
      ?.addEventListener(
        "click",
        function (
          event
        ) {

          if (
            event.target ===
            els.retencionModal
          ) {
            cerrarRetencion();
          }
        }
      );


    // PASO 16F2 · FIRMA + RECEPCIÓN + AUTORIZACIÓN
    // ======================================================

    function mensajesSri(
      list
    ) {

      if (
        !Array.isArray(
          list
        )
      ) {
        return [];
      }

      return list.map(
        item => ({
          identificador:
            text(
              item?.identificador
            ),

          mensaje:
            text(
              item?.mensaje
            ),

          informacionAdicional:
            text(
              item?.informacionAdicional
            ),

          tipo:
            text(
              item?.tipo
            )
        })
      );
    }



    // ======================================================
    // PASO 16F5C · EMAIL DE COMPROBANTE AUTORIZADO
    // ======================================================

    async function enviarCorreoComprobanteItem(
      item,
      automatico = false
    ) {

      if (
        !item
        ||
        item.estado !==
        "AUTORIZADO"
      ) {
        if (!automatico) {
          alert(
            "El comprobante debe estar AUTORIZADO para enviar el correo."
          );
        }

        return false;
      }

      const sender =
        window.SIXTEEN_COMPROBANTE_EMAIL;

      if (
        !sender
        ||
        typeof sender.send !==
        "function"
      ) {
        if (!automatico) {
          alert(
            "No fue posible cargar el módulo de correo."
          );
        }

        return false;
      }

      if (
        automatico
        &&
        item.correoComprobanteEstado ===
        "ENVIADO"
      ) {
        return true;
      }

      try {

        const result =
          await sender.send(
            item
          );

        await COLLECTION
          .doc(
            item.id
          )
          .update({
            correoComprobanteEstado:
              "ENVIADO",

            correoComprobanteDestino:
              result.email,

            correoComprobanteEnviadoEn:
              FieldValue.serverTimestamp(),

            correoComprobanteUltimoIntentoEn:
              FieldValue.serverTimestamp(),

            correoComprobanteError:
              "",

            actualizadoEn:
              FieldValue.serverTimestamp()
          });

        if (!automatico) {
          alert(
            "Correo enviado correctamente a "
            +
            result.email
            +
            "."
          );
        }

        return true;

      } catch (error) {

        console.warn(
          "Correo de comprobante:",
          error
        );

        await COLLECTION
          .doc(
            item.id
          )
          .update({
            correoComprobanteEstado:
              "ERROR",

            correoComprobanteUltimoIntentoEn:
              FieldValue.serverTimestamp(),

            correoComprobanteError:
              error.message
              ||
              "No fue posible enviar el correo.",

            actualizadoEn:
              FieldValue.serverTimestamp()
          })
          .catch(
            () => {}
          );

        if (!automatico) {
          alert(
            error.message
            ||
            "No fue posible enviar el correo."
          );
        }

        return false;
      }
    }


    async function enviarCorreoComprobante(
      id,
      automatico = false
    ) {

      const item =
        facturaPorId(
          id
        );

      if (!item) {
        return false;
      }

      return enviarCorreoComprobanteItem(
        item,
        automatico
      );
    }


    async function guardarResultadoSri(
      item,
      payload
    ) {

      const reception =
        payload?.recepcion ||
        {};

      const authorization =
        payload?.autorizacion ||
        null;

      const receptionState =
        text(
          reception.estado
        )
          .toUpperCase();

      const authorizationState =
        text(
          authorization?.estado
        )
          .toUpperCase();

      let estado =
        "ERROR";

      let sriEstado =
        receptionState ||
        "ERROR";

      if (
        receptionState ===
        "DEVUELTA"
      ) {
        estado =
          "DEVUELTA";
      }

      if (
        receptionState ===
        "RECIBIDA"
      ) {
        estado =
          "RECIBIDA";
      }

      if (
        authorizationState ===
        "AUTORIZADO"
      ) {
        estado =
          "AUTORIZADO";

        sriEstado =
          "AUTORIZADO";
      }

      if (
        authorizationState ===
        "NO AUTORIZADO"
      ) {
        estado =
          "NO_AUTORIZADO";

        sriEstado =
          "NO_AUTORIZADO";
      }

      const messages = [
        ...mensajesSri(
          reception.mensajes
        ),

        ...mensajesSri(
          authorization?.mensajes
        )
      ];

      const changes = {
        estado:
          estado,

        sriEstado:
          sriEstado,

        xmlFirmado:
          payload?.xmlFirmado
          ||
          item.xmlFirmado
          ||
          "",

        numeroAutorizacion:
          authorization
            ?.numeroAutorizacion
          ||
          item.numeroAutorizacion
          ||
          "",

        autorizacion:
          authorization
            ?.numeroAutorizacion
          ||
          item.autorizacion
          ||
          "",

        fechaAutorizacionTexto:
          authorization
            ?.fechaAutorizacion
          ||
          "",

        xmlAutorizado:
          authorization
            ?.comprobante
          ||
          "",

        mensajesSri:
          messages,

        certificado:
          payload?.certificate
          ||
          item.certificado
          ||
          null,

        recepcionSri:
          reception,

        autorizacionSri:
          authorization,

        ultimoIntentoSriEn:
          FieldValue.serverTimestamp(),

        actualizadoEn:
          FieldValue.serverTimestamp()
      };

      if (
        authorizationState ===
        "AUTORIZADO"
      ) {
        changes.fechaAutorizacion =
          FieldValue.serverTimestamp();
      }

      await COLLECTION
        .doc(
          item.id
        )
        .update(
          changes
        );

      if (
        estado ===
        "AUTORIZADO"
      ) {

        const authorizedItem =
          {
            ...item,
            ...changes,
            id:
              item.id,

            estado:
              "AUTORIZADO",

            correoComprobanteEstado:
              item.correoComprobanteEstado
              ||
              ""
          };

        enviarCorreoComprobanteItem(
          authorizedItem,
          true
        )
          .catch(
            error =>
              console.warn(
                "Email automático:",
                error
              )
          );
      }

      return estado;
    }


    async function procesarSri(
      id
    ) {

      const item =
        facturaPorId(
          id
        );

      if (!item) {
        return;
      }

      if (
        !item.xmlSinFirma
      ) {
        alert(
          "El comprobante no contiene XML sin firma."
        );
        return;
      }

      if (
        (
          item.tipoDocumento ===
          "NOTA_CREDITO"
          ||
          item.tipoDocumento ===
          "NOTA_DEBITO"
        )
      ) {

        const sourceId =
          text(
            item.documentoSustentoId
            ||
            item.documentoSustento
              ?.id
          );

        const source =
          comprobantes.find(
            candidate =>
              candidate.id ===
              sourceId
          );

        if (
          !source
          ||
          source.estado !==
          "AUTORIZADO"
        ) {
          alert(
            (
              item.tipoDocumento === "NOTA_DEBITO"
                ? "La nota de débito"
                : "La nota de crédito"
            )
            +
            " está en borrador. "
            +
            "La factura de sustento debe estar AUTORIZADA antes de enviarla al SRI."
          );
          return;
        }
      }

      if (
        !backendUrl()
      ) {
        alert(
          "Configura el backend seguro SRI antes de firmar."
        );
        abrirConfig();
        return;
      }

      const ok =
        window.confirm(
          "Se firmará el XML con el certificado del backend y se enviará al ambiente "
          +
          (
            String(
              item.ambiente
            )
            ===
            "2"
              ?
              "PRODUCCIÓN"
              :
              "PRUEBAS"
          )
          +
          ". ¿Continuar?"
        );

      if (!ok) {
        return;
      }

      try {

        await COLLECTION
          .doc(
            item.id
          )
          .update({
            estado:
              "PROCESANDO",

            sriEstado:
              "FIRMANDO",

            ultimoIntentoSriEn:
              FieldValue.serverTimestamp(),

            actualizadoEn:
              FieldValue.serverTimestamp()
          });

        const payload =
          await backendRequest(
            "/api/sri/process",
            {
              method:
                "POST",

              body:
                {
                  xml:
                    item.xmlSinFirma,

                  claveAcceso:
                    item.claveAcceso,

                  ambiente:
                    String(
                      item.ambiente ||
                      "1"
                    )
                }
            }
          );

        const state =
          await guardarResultadoSri(
            item,
            payload
          );

        if (
          state ===
          "AUTORIZADO"
        ) {
          alert(
            "Comprobante AUTORIZADO por el SRI."
          );
        } else if (
          state ===
          "RECIBIDA"
        ) {
          alert(
            "Comprobante RECIBIDO. La autorización todavía está pendiente; usa CONSULTAR."
          );
        } else {
          alert(
            "Respuesta SRI: "
            +
            state
            +
            ". Revisa los mensajes del comprobante."
          );
        }

      } catch (error) {

        console.error(
          "Procesar SRI:",
          error
        );

        await COLLECTION
          .doc(
            item.id
          )
          .update({
            estado:
              "ERROR",

            sriEstado:
              "ERROR_BACKEND",

            ultimoErrorSri:
              error.message ||
              "Error backend/SRI",

            actualizadoEn:
              FieldValue.serverTimestamp()
          })
          .catch(
            () => {}
          );

        alert(
          error.message ||
          "No fue posible procesar el comprobante."
        );
      }
    }


    async function consultarSri(
      id
    ) {

      const item =
        facturaPorId(
          id
        );

      if (!item) {
        return;
      }

      if (
        !backendUrl()
      ) {
        alert(
          "Configura el backend seguro SRI."
        );
        return;
      }

      try {

        const payload =
          await backendRequest(
            "/api/sri/authorize",
            {
              method:
                "POST",

              body:
                {
                  claveAcceso:
                    item.claveAcceso,

                  ambiente:
                    String(
                      item.ambiente ||
                      "1"
                    )
                }
            }
          );

        const authorization =
          payload
            ?.autorizacion
          ||
          {};

        const state =
          text(
            authorization.estado
          )
            .toUpperCase();

        const changes = {
          autorizacionSri:
            authorization,

          mensajesSri:
            mensajesSri(
              authorization.mensajes
            ),

          ultimoConsultaSriEn:
            FieldValue.serverTimestamp(),

          actualizadoEn:
            FieldValue.serverTimestamp()
        };

        if (
          state ===
          "AUTORIZADO"
        ) {

          changes.estado =
            "AUTORIZADO";

          changes.sriEstado =
            "AUTORIZADO";

          changes.numeroAutorizacion =
            authorization.numeroAutorizacion
            ||
            item.claveAcceso;

          changes.autorizacion =
            changes.numeroAutorizacion;

          changes.fechaAutorizacionTexto =
            authorization.fechaAutorizacion
            ||
            "";

          changes.fechaAutorizacion =
            FieldValue.serverTimestamp();

          changes.xmlAutorizado =
            authorization.comprobante
            ||
            "";

        } else if (
          state ===
          "NO AUTORIZADO"
        ) {

          changes.estado =
            "NO_AUTORIZADO";

          changes.sriEstado =
            "NO_AUTORIZADO";

        } else {

          changes.estado =
            "RECIBIDA";

          changes.sriEstado =
            "PENDIENTE_AUTORIZACION";
        }

        await COLLECTION
          .doc(
            item.id
          )
          .update(
            changes
          );

        if (
          state ===
          "AUTORIZADO"
        ) {

          const authorizedItem =
            {
              ...item,
              ...changes,
              id:
                item.id,

              estado:
                "AUTORIZADO",

              correoComprobanteEstado:
                item.correoComprobanteEstado
                ||
                ""
            };

          enviarCorreoComprobanteItem(
            authorizedItem,
            true
          )
            .catch(
              error =>
                console.warn(
                  "Email automático:",
                  error
                )
            );
        }

        alert(
          state ===
          "AUTORIZADO"
            ?
            "Comprobante AUTORIZADO."
            :
            (
              state ===
              "NO AUTORIZADO"
                ?
                "Comprobante NO AUTORIZADO."
                :
                "La autorización todavía está pendiente."
            )
        );

      } catch (error) {

        console.error(
          "Consulta SRI:",
          error
        );

        alert(
          error.message ||
          "No fue posible consultar la autorización."
        );
      }
    }


    function descargarXmlAutorizado(
      id
    ) {

      const item =
        facturaPorId(
          id
        );

      if (
        !item
        ||
        !item.xmlAutorizado
      ) {
        return;
      }

      download(
        item.xmlAutorizado,
        "application/xml;charset=utf-8",
        (
          item.numeroAutorizacion
          ||
          item.claveAcceso
          ||
          "autorizado"
        )
        +
        ".xml"
      );
    }


    // ======================================================
    // COMPROBANTES
    // ======================================================

    function escucharFacturas() {

      if (
        unsubscribeInvoices
      ) {
        unsubscribeInvoices();
      }

      unsubscribeInvoices =
        COLLECTION
          .onSnapshot(
            function (snapshot) {

              comprobantes =
                snapshot.docs
                  .map(
                    doc => ({
                      id:
                        doc.id,
                      ...doc.data()
                    })
                  )
                  .sort(
                    (
                      a,
                      b
                    ) => {

                      const da =
                        firestoreDate(
                          a.creadoEn
                        )
                        ?.getTime()
                        ||
                        0;

                      const dbb =
                        firestoreDate(
                          b.creadoEn
                        )
                        ?.getTime()
                        ||
                        0;

                      return dbb - da;
                    }
                  );

              aplicarFiltros();
              actualizarKpis();
              poblarPedidos();
              poblarFacturasNotaCredito();
              poblarFacturasNotaDebito();
              poblarPedidosGuia();

              window
                .SIXTEEN_FACTURACION_BACKUP_SOURCE =
                {
                  getComprobantes:
                    function () {
                      return comprobantes.slice();
                    },

                  getConfigSri:
                    function () {
                      return config
                        ? {
                            ...config
                          }
                        : {};
                    }
                };

              window.dispatchEvent(
                new CustomEvent(
                  "sixteen:facturacion-data-updated"
                )
              );
            },

            function (error) {

              console.error(
                "Facturación Firestore:",
                error
              );

              if (
                els.body
              ) {
                els.body.innerHTML =
                  '<tr><td colspan="8">No fue posible cargar facturación.</td></tr>';
              }
            }
          );
    }

    function actualizarKpis() {

      const total =
        comprobantes.length;

      const xml =
        comprobantes.filter(
          c =>
            c.estado ===
            "XML_GENERADO"
        ).length;

      const autorizados =
        comprobantes.filter(
          c =>
            c.estado ===
            "AUTORIZADO"
        ).length;

      const pendientes =
        comprobantes.filter(
          c =>
            ![
              "AUTORIZADO",
              "NO_AUTORIZADO",
              "ANULADO"
            ].includes(
              c.estado
            )
        ).length;

      if (els.total) {
        els.total.textContent =
          String(
            total
          );
      }

      if (els.xml) {
        els.xml.textContent =
          String(
            xml
          );
      }

      if (els.autorizados) {
        els.autorizados.textContent =
          String(
            autorizados
          );
      }

      if (els.pendientes) {
        els.pendientes.textContent =
          String(
            pendientes
          );
      }

      if (
        els.menuBadge
      ) {

        els.menuBadge.textContent =
          String(
            pendientes
          );

        els.menuBadge.classList
          .toggle(
            "vacio",
            pendientes ===
            0
          );
      }
    }

    function aplicarFiltros() {

      const query =
        text(
          els.buscar
            ?.value
        )
          .toLowerCase();

      const state =
        text(
          els.filtro
            ?.value
        );

      const documentType =
        text(
          els.filtroTipo
            ?.value
        );

      filtroActual =
        comprobantes.filter(
          function (item) {

            if (
              state
              &&
              item.estado !==
              state
            ) {
              return false;
            }

            if (
              documentType
              &&
              text(
                item.tipoDocumento
              )
              !==
              documentType
            ) {
              return false;
            }

            if (!query) {
              return true;
            }

            const searchable =
              [
                item.numero,
                item.claveAcceso,
                item.pedidoNumero,
                item.tipoDocumento,
                item.documentoSustento
                  ?.numero,
                item.motivos
                  ?.map(
                    m => m.razon
                  )
                  .join(" "),
                item.transporte
                  ?.placa,
                item.transporte
                  ?.razonSocialTransportista,
                item.destinatario
                  ?.razonSocial,
                item.sujetoRetenido
                  ?.razonSocial,
                item.sujetoRetenido
                  ?.identificacion,
                item.comprador
                  ?.razonSocial,
                item.comprador
                  ?.identificacion,
                item.estado
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchable.includes(
              query
            );
          }
        );

      render();
    }

    els.buscar
      ?.addEventListener(
        "input",
        aplicarFiltros
      );

    els.filtro
      ?.addEventListener(
        "change",
        aplicarFiltros
      );

    els.filtroTipo
      ?.addEventListener(
        "change",
        aplicarFiltros
      );

    function estadoClase(
      state
    ) {

      if (
        state ===
        "AUTORIZADO"
      ) {
        return "autorizado";
      }

      if (
        [
          "DEVUELTA",
          "NO_AUTORIZADO",
          "ERROR"
        ].includes(
          state
        )
      ) {
        return "error";
      }

      return "";
    }

    function render() {

      if (!els.body) {
        return;
      }

      if (
        !filtroActual.length
      ) {

        els.body.innerHTML =
          '<tr><td colspan="8">No hay comprobantes para mostrar.</td></tr>';

        return;
      }

      els.body.innerHTML =
        filtroActual.map(
          function (item) {

            return `
              <tr>
                <td>
                  <strong>${escapeHtml(item.numero || "—")}</strong>
                  <span class="facturacion-doc-type">
                    ${escapeHtml(
                      item.tipoDocumento === "NOTA_CREDITO"
                        ? (
                            "NOTA DE CRÉDITO"
                            +
                            (
                              item.tipoAjuste
                                ? " · " + item.tipoAjuste
                                : ""
                            )
                          )
                        : item.tipoDocumento === "NOTA_DEBITO"
                          ? "NOTA DE DÉBITO"
                          : item.tipoDocumento === "GUIA_REMISION"
                            ? "GUÍA DE REMISIÓN"
                            : item.tipoDocumento === "RETENCION"
                              ? "COMPROBANTE DE RETENCIÓN"
                              : "FACTURA"
                    )}
                  </span>
                  <span class="facturacion-key">
                    ${escapeHtml(item.claveAcceso || "")}
                  </span>
                </td>

                <td>
                  ${escapeHtml(item.fechaEmision || "—")}
                </td>

                <td>
                  ${escapeHtml(
                    item.tipoDocumento === "GUIA_REMISION"
                      ? (
                          item.destinatario?.razonSocial
                          ||
                          item.comprador?.razonSocial
                          ||
                          "—"
                        )
                      : item.tipoDocumento === "RETENCION"
                        ? (
                            item.sujetoRetenido?.razonSocial
                            ||
                            item.comprador?.razonSocial
                            ||
                            "—"
                          )
                        : (
                            item.comprador?.razonSocial
                            ||
                            "—"
                          )
                  )}
                  <br>
                  <small>
                    ${escapeHtml(
                      item.tipoDocumento === "GUIA_REMISION"
                        ? (
                            item.destinatario?.identificacion
                            ||
                            item.comprador?.identificacion
                            ||
                            ""
                          )
                        : item.tipoDocumento === "RETENCION"
                          ? (
                              item.sujetoRetenido?.identificacion
                              ||
                              item.comprador?.identificacion
                              ||
                              ""
                            )
                          : (
                              item.comprador?.identificacion
                              ||
                              ""
                            )
                    )}
                  </small>
                </td>

                <td>
                  ${
                    (
                      item.tipoDocumento === "NOTA_CREDITO"
                      ||
                      item.tipoDocumento === "NOTA_DEBITO"
                    )
                      ? (
                          "Factura "
                          +
                          escapeHtml(
                            item.documentoSustento?.numero
                            ||
                            item.documentoSustentoNumero
                            ||
                            "—"
                          )
                        )
                      : escapeHtml(
                          item.pedidoNumero
                          ||
                          item.pedidoId
                          ||
                          "—"
                        )
                  }
                </td>

                <td>
                  ${
                    item.tipoDocumento === "GUIA_REMISION"
                      ? (
                          String(
                            Array.isArray(item.detalles)
                              ? item.detalles.length
                              : 0
                          )
                          +
                          " producto(s)"
                        )
                      : item.tipoDocumento === "RETENCION"
                        ? (
                            "Retenido "
                            +
                            money(
                              item.totales?.totalRetenido
                              ??
                              item.totales?.importeTotal
                            )
                          )
                        : money(
                            item.totales?.importeTotal
                          )
                  }
                </td>

                <td>
                  ${String(item.ambiente) === "2" ? "PRODUCCIÓN" : "PRUEBAS"}
                </td>

                <td>
                  <span class="facturacion-state ${estadoClase(item.estado)}">
                    ${escapeHtml(item.estado || "—")}
                  </span>
                </td>

                <td>
                  <div class="facturacion-actions">

                    <button
                      type="button"
                      data-factura-xml="${escapeHtml(item.id)}"
                    >
                      XML
                    </button>

                    <button
                      type="button"
                      data-factura-ride="${escapeHtml(item.id)}"
                      class="${item.estado === "AUTORIZADO" ? "sri-success" : ""}"
                    >
                      ${item.estado === "AUTORIZADO" ? "RIDE" : "RIDE BORRADOR"}
                    </button>

                    ${
                      item.estado ===
                      "AUTORIZADO"
                        ?
                        `
                        <button
                          type="button"
                          class="sri-success"
                          data-factura-xml-aut="${escapeHtml(item.id)}"
                        >
                          XML AUT.
                        </button>

                        <button
                          type="button"
                          class="sri-success"
                          data-factura-email="${escapeHtml(item.id)}"
                        >
                          ${
                            item.correoComprobanteEstado === "ENVIADO"
                              ? "REENVIAR EMAIL"
                              : "EMAIL"
                          }
                        </button>
                        `
                        :
                        (
                          [
                            "RECIBIDA",
                            "NO_AUTORIZADO"
                          ].includes(
                            item.estado
                          )
                            ?
                            `
                            <button
                              type="button"
                              class="sri-primary"
                              data-factura-consultar="${escapeHtml(item.id)}"
                            >
                              CONSULTAR
                            </button>
                            `
                            :
                            `
                            <button
                              type="button"
                              class="sri-primary"
                              data-factura-procesar="${escapeHtml(item.id)}"
                              ${
                                item.estado ===
                                "PROCESANDO"
                                  ?
                                  "disabled"
                                  :
                                  ""
                              }
                            >
                              ${item.estado === "PROCESANDO" ? "PROCESANDO..." : "FIRMAR + SRI"}
                            </button>
                            `
                        )
                    }

                  </div>
                </td>
              </tr>
            `;
          }
        )
        .join("");

      els.body
        .querySelectorAll(
          "[data-factura-xml]"
        )
        .forEach(
          button => {

            button.addEventListener(
              "click",
              function () {

                descargarXml(
                  button.dataset
                    .facturaXml
                );
              }
            );
          }
        );

      els.body
        .querySelectorAll(
          "[data-factura-ride]"
        )
        .forEach(
          button => {

            button.addEventListener(
              "click",
              function () {

                abrirRide(
                  button.dataset
                    .facturaRide
                );
              }
            );
          }
        );


      els.body
        .querySelectorAll(
          "[data-factura-procesar]"
        )
        .forEach(
          button => {

            button.addEventListener(
              "click",
              function () {

                procesarSri(
                  button.dataset
                    .facturaProcesar
                );
              }
            );
          }
        );


      els.body
        .querySelectorAll(
          "[data-factura-consultar]"
        )
        .forEach(
          button => {

            button.addEventListener(
              "click",
              function () {

                consultarSri(
                  button.dataset
                    .facturaConsultar
                );
              }
            );
          }
        );


      els.body
        .querySelectorAll(
          "[data-factura-xml-aut]"
        )
        .forEach(
          button => {

            button.addEventListener(
              "click",
              function () {

                descargarXmlAutorizado(
                  button.dataset
                    .facturaXmlAut
                );
              }
            );
          }
        );


      els.body
        .querySelectorAll(
          "[data-factura-email]"
        )
        .forEach(
          button => {

            button.addEventListener(
              "click",
              async function () {

                button.disabled =
                  true;

                const original =
                  button.textContent;

                button.textContent =
                  "ENVIANDO...";

                await enviarCorreoComprobante(
                  button.dataset
                    .facturaEmail,
                  false
                );

                button.disabled =
                  false;

                button.textContent =
                  original;
              }
            );
          }
        );
    }

    function facturaPorId(
      id
    ) {

      return comprobantes.find(
        item =>
          item.id ===
          id
      )
      ||
      null;
    }

    function download(
      content,
      type,
      name
    ) {

      const url =
        URL.createObjectURL(
          new Blob(
            [
              content
            ],
            {
              type
            }
          )
        );

      const a =
        document.createElement(
          "a"
        );

      a.href =
        url;

      a.download =
        name;

      document.body
        .appendChild(
          a
        );

      a.click();
      a.remove();

      setTimeout(
        () =>
          URL.revokeObjectURL(
            url
          ),
        1000
      );
    }

    function descargarXml(
      id
    ) {

      const item =
        facturaPorId(
          id
        );

      if (
        !item
        ||
        !item.xmlSinFirma
      ) {
        return;
      }

      download(
        item.xmlFirmado ||
        item.xmlSinFirma,
        "application/xml;charset=utf-8",
        (
          item.claveAcceso
          ||
          item.numero
          ||
          "factura"
        )
        +
        ".xml"
      );
    }

    function abrirRide(
      id
    ) {

      const item =
        facturaPorId(
          id
        );

      if (!item) {
        return;
      }

      if (
        !window.SIXTEEN_RIDE
        ||
        typeof window.SIXTEEN_RIDE.open !==
        "function"
      ) {

        alert(
          "No fue posible cargar el generador RIDE."
        );

        return;
      }

      const opened =
        window.SIXTEEN_RIDE.open(
          item
        );

      if (!opened) {
        alert(
          "El navegador bloqueó la ventana del RIDE. Permite ventanas emergentes para SIXTEEN y vuelve a intentarlo."
        );
      }
    }

    // ======================================================
    // ACCESIBILIDAD · MODALES DE FACTURACIÓN
    // ======================================================

    instalarComportamientoModal(
      els.configModal,
      cerrarConfig
    );

    instalarComportamientoModal(
      els.notaCreditoModal,
      cerrarNotaCredito
    );

    instalarComportamientoModal(
      els.notaDebitoModal,
      cerrarNotaDebito
    );

    instalarComportamientoModal(
      els.guiaRemisionModal,
      cerrarGuiaRemision
    );

    instalarComportamientoModal(
      els.retencionModal,
      cerrarRetencion
    );


    // ======================================================
    // CSV
    // ======================================================

    function csvEscape(
      value
    ) {

      const rawValue =
        value === null ||
        value === undefined
          ? ""
          : (
              typeof value ===
              "object"
                ? JSON.stringify(
                    value
                  )
                : String(
                    value
                  )
            );

      const raw =
        /^[=+\-@]/.test(
          rawValue.trimStart()
        )
          ? "'" + rawValue
          : rawValue;

      return '"'
        +
        raw.replace(
          /"/g,
          '""'
        )
        +
        '"';
    }

    function exportCsv() {

      if (
        !filtroActual.length
      ) {
        alert(
          "No hay comprobantes para exportar."
        );
        return;
      }

      const headers = [
        "tipoDocumento",
        "numero",
        "claveAcceso",
        "fechaEmision",
        "cliente",
        "identificacion",
        "pedido",
        "documentoSustento",
        "total",
        "ambiente",
        "estado"
      ];

      const rows =
        filtroActual.map(
          item => ({
            tipoDocumento:
              item.tipoDocumento
              ||
              "FACTURA",

            numero:
              item.numero,

            claveAcceso:
              item.claveAcceso,

            fechaEmision:
              item.fechaEmision,

            cliente:
              item.comprador
                ?.razonSocial,

            identificacion:
              item.comprador
                ?.identificacion,

            pedido:
              item.pedidoNumero,

            documentoSustento:
              item.documentoSustento
                ?.numero
              ||
              item.documentoSustentoNumero
              ||
              "",

            total:
              item.totales
                ?.importeTotal,

            ambiente:
              item.ambiente,

            estado:
              item.estado
          })
        );

      const content =
        "\uFEFF"
        +
        [
          headers
            .map(
              csvEscape
            )
            .join(
              ","
            ),

          ...rows.map(
            row =>
              headers
                .map(
                  key =>
                    csvEscape(
                      row[key]
                    )
                )
                .join(
                  ","
                )
          )
        ]
          .join(
            "\r\n"
          );

      download(
        content,
        "text/csv;charset=utf-8",
        "SIXTEEN_FACTURACION_"
        +
        new Date()
          .toISOString()
          .slice(
            0,
            10
          )
        +
        ".csv"
      );
    }

    els.exportar
      ?.addEventListener(
        "click",
        exportCsv
      );

    // ======================================================
    // FECHA DEFAULT
    // ======================================================

    if (
      els.fecha
    ) {
      els.fecha.value =
        SRI.dateParts(
          new Date()
        ).iso;
    }

    if (
      els.notaCreditoFecha
    ) {
      els.notaCreditoFecha.value =
        SRI.dateParts(
          new Date()
        ).iso;
    }

    if (
      els.notaDebitoFecha
    ) {
      els.notaDebitoFecha.value =
        SRI.dateParts(
          new Date()
        ).iso;
    }

  }
);
