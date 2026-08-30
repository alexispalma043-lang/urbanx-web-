// @ts-nocheck
(function () {
  "use strict";

  const FORMAT = "SIXTEEN-BACKUP";
  const VERSION = 2;
  const PROJECT_ID = "urbanx-92e74";
  const META_KEY = "sixteen_backup_last_meta_v2";
  const MAX_VALIDATE_BYTES = 50 * 1024 * 1024;

  const $ = id => document.getElementById(id);

  const VALID_PURCHASE_STATES = new Set([
    "Confirmado",
    "En preparación",
    "Enviado",
    "Entregado"
  ]);

  const SECRET_KEY_PATTERN =
    /(password|passwd|secret|secretkey|token|apikey|api_key|privatekey|private_key|cvv|cvc|p12|pfx|certificate|certificado|firmaelectronica|firma_electronica)/i;

  function adminApp() {
    if (typeof firebase === "undefined") return null;

    return (
      firebase.apps.find(app => app.name === "sixteen-admin") ||
      null
    );
  }

  function firestore() {
    const app = adminApp();

    if (!app) {
      throw new Error(
        "No se encontró la sesión administrativa de Firebase."
      );
    }

    return firebase.firestore(app);
  }

  function serializar(value) {
    if (value === null || value === undefined) {
      return value ?? null;
    }

    if (
      typeof value === "object" &&
      typeof value.toDate === "function"
    ) {
      try {
        return value.toDate().toISOString();
      } catch (_) {
        return null;
      }
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map(serializar);
    }

    if (typeof value === "object") {
      const output = {};

      Object.keys(value).forEach(key => {
        output[key] = serializar(value[key]);
      });

      return output;
    }

    return value;
  }

  function sanitizeSecrets(value, removed, path = "") {
    if (value === null || value === undefined) {
      return value ?? null;
    }

    if (Array.isArray(value)) {
      return value.map((item, index) =>
        sanitizeSecrets(
          item,
          removed,
          `${path}[${index}]`
        )
      );
    }

    if (typeof value !== "object") {
      return value;
    }

    if (typeof value.toDate === "function") {
      return serializar(value);
    }

    const output = {};

    Object.entries(value).forEach(([key, item]) => {
      const currentPath = path
        ? `${path}.${key}`
        : key;

      if (SECRET_KEY_PATTERN.test(key)) {
        removed.push(currentPath);
        return;
      }

      output[key] = sanitizeSecrets(
        item,
        removed,
        currentPath
      );
    });

    return output;
  }

  function timestampMs(value) {
    if (!value) return 0;

    if (typeof value.toDate === "function") {
      try {
        return value.toDate().getTime();
      } catch (_) {
        return 0;
      }
    }

    if (typeof value.seconds === "number") {
      return value.seconds * 1000;
    }

    if (value instanceof Date) {
      return value.getTime();
    }

    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function customerKey(order) {
    const client = order?.cliente || {};

    const uid = String(
      order?.clienteUid ||
      client.uid ||
      ""
    ).trim();

    if (uid) {
      return "uid:" + uid.toLowerCase();
    }

    const identification = String(
      client.identificacion ||
      ""
    )
      .replace(/\s+/g, "")
      .trim();

    if (identification) {
      return "id:" + identification.toLowerCase();
    }

    const email = String(
      client.email ||
      ""
    )
      .trim()
      .toLowerCase();

    if (email) {
      return "email:" + email;
    }

    const phone = String(
      client.telefono ||
      ""
    ).replace(/\D+/g, "");

    if (phone) {
      return "tel:" + phone;
    }

    const name = [
      client.nombres,
      client.apellidos
    ]
      .filter(Boolean)
      .join(" ")
      .trim()
      .toLowerCase();

    if (name) {
      return "name:" + name;
    }

    return "order:" + String(
      order?.id ||
      order?.numero ||
      timestampMs(order?.creadoEn) ||
      "sin-id"
    );
  }

  function deriveClients(orders) {
    const map = new Map();

    (Array.isArray(orders) ? orders : [])
      .forEach(order => {
        const client = order?.cliente || {};
        const key = customerKey(order);

        if (!map.has(key)) {
          map.set(key, {
            clave: key,
            nombres: client.nombres || "",
            apellidos: client.apellidos || "",
            nombre: [
              client.nombres,
              client.apellidos
            ].filter(Boolean).join(" ").trim() ||
              client.email ||
              "Cliente SIXTEEN",
            identificacion:
              client.identificacion || "",
            email:
              client.email || "",
            telefono:
              client.telefono || "",
            pedidos: [],
            totalPedidos: 0,
            pedidosNoCancelados: 0,
            comprasValidas: 0,
            totalComprado: 0,
            ticketPromedio: 0,
            ultimoPedido: null,
            ultimaCompraValida: null,
            ultimaEntrega: {}
          });
        }

        const profile = map.get(key);

        if (!profile.identificacion && client.identificacion) {
          profile.identificacion = client.identificacion;
        }

        if (!profile.email && client.email) {
          profile.email = client.email;
        }

        if (!profile.telefono && client.telefono) {
          profile.telefono = client.telefono;
        }

        profile.pedidos.push(order);
      });

    return Array.from(map.values())
      .map(profile => {
        profile.pedidos.sort(
          (a, b) =>
            timestampMs(b?.creadoEn) -
            timestampMs(a?.creadoEn)
        );

        profile.totalPedidos =
          profile.pedidos.length;

        profile.pedidosNoCancelados =
          profile.pedidos.filter(
            order =>
              String(
                order?.estado ||
                "Pendiente"
              ) !== "Cancelado"
          ).length;

        const validOrders =
          profile.pedidos.filter(
            order =>
              VALID_PURCHASE_STATES.has(
                order?.estado
              )
          );

        profile.comprasValidas =
          validOrders.length;

        profile.ultimaCompraValida =
          validOrders[0] ||
          null;

        profile.totalComprado =
          validOrders.reduce(
            (sum, order) =>
              sum +
              Math.max(
                0,
                Number(
                  order?.resumen?.total ||
                  0
                )
              ),
            0
          );

        profile.ticketPromedio =
          profile.comprasValidas
            ? profile.totalComprado /
              profile.comprasValidas
            : 0;

        profile.ultimoPedido =
          profile.pedidos[0] ||
          null;

        profile.ultimaEntrega =
          profile.ultimoPedido?.entrega ||
          {};

        return profile;
      })
      .sort(
        (a, b) =>
          timestampMs(
            b?.ultimoPedido?.creadoEn
          ) -
          timestampMs(
            a?.ultimoPedido?.creadoEn
          )
      );
  }

  async function readCollection(name) {
    const snapshot =
      await firestore()
        .collection(name)
        .get({
          source: "server"
        });

    const rows = [];

    snapshot.forEach(doc => {
      rows.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return rows;
  }

  async function readDocument(
    collection,
    id
  ) {
    const snapshot =
      await firestore()
        .collection(collection)
        .doc(id)
        .get({
          source: "server"
        });

    return snapshot.exists
      ? {
          id: snapshot.id,
          ...snapshot.data()
        }
      : null;
  }

  function splitBilling(records) {
    const internal =
      (Array.isArray(records) ? records : [])
        .filter(
          item =>
            item?.sistema ===
            "SIXTEEN_INTERNO"
        );

    return {
      documentos:
        internal.filter(
          item =>
            item?.tipoRegistro ===
            "DOCUMENTO"
        ),

      configuracion:
        internal.find(
          item =>
            item.id ===
              "config_interna" ||
            item?.tipoRegistro ===
              "CONFIG"
        ) ||
        {},

      locks:
        internal.filter(
          item =>
            item?.tipoRegistro ===
            "LOCK"
        )
    };
  }

  async function captureServerData() {
    const startedAt = Date.now();

    const [
      productos,
      pedidos,
      inventario,
      cupones,
      envios,
      facturacionRaw,
      newsletter,
      urbanx3d,
      configuracionPagos
    ] = await Promise.all([
      readCollection("productos"),
      readCollection("pedidos"),
      readCollection("inventario"),
      readCollection("cupones"),
      readCollection("envios"),
      readCollection("facturacion"),
      readCollection("newsletter"),
      readCollection("urbanx3d"),
      readDocument(
        "configuracion_pagos",
        "principal"
      )
    ]);

    const clientes =
      deriveClients(pedidos);

    const facturacion =
      splitBilling(facturacionRaw);

    const removedSecretFields = [];

    const sanitized = sanitizeSecrets(
      {
        productos,
        pedidos,
        clientes,
        inventario,
        cupones,
        envios,
        facturacion,
        newsletter,
        urbanx3d,
        configuracionPagos:
          configuracionPagos ||
          {},
        storeConfig:
          window.SIXTEEN_STORE_CONFIG ||
          {}
      },
      removedSecretFields
    );

    return {
      data:
        serializar(sanitized),

      removedSecretFields,

      capture:
        {
          startedAt:
            new Date(startedAt)
              .toISOString(),

          finishedAt:
            new Date()
              .toISOString(),

          durationMs:
            Date.now() -
            startedAt,

          source:
            "FIRESTORE_SERVER"
        }
    };
  }

  function countMap(data) {
    return {
      productos:
        data.productos?.length || 0,

      pedidos:
        data.pedidos?.length || 0,

      clientes:
        data.clientes?.length || 0,

      inventario:
        data.inventario?.length || 0,

      cupones:
        data.cupones?.length || 0,

      envios:
        data.envios?.length || 0,

      facturacion:
        data.facturacion
          ?.documentos?.length ||
        0,

      newsletter:
        data.newsletter?.length || 0,

      urbanx3d:
        data.urbanx3d?.length || 0
    };
  }

  function updateKpis(counts) {
    const map = {
      backupKpiProductos:
        counts.productos || 0,

      backupKpiPedidos:
        counts.pedidos || 0,

      backupKpiClientes:
        counts.clientes || 0,

      backupKpiInventario:
        counts.inventario || 0,

      backupKpiCupones:
        counts.cupones || 0,

      backupKpiEnvios:
        counts.envios || 0,

      backupKpiFacturacion:
        counts.facturacion || 0,

      backupKpiNewsletter:
        counts.newsletter || 0
    };

    Object.entries(map)
      .forEach(([id, value]) => {
        const element = $(id);

        if (element) {
          element.textContent =
            String(value);
        }
      });
  }

  function stamp() {
    const date = new Date();
    const pad = value =>
      String(value)
        .padStart(2, "0");

    return (
      date.getFullYear() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      "_" +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }

  function humanBytes(bytes) {
    const value = Number(bytes) || 0;

    if (value < 1024) {
      return `${value} B`;
    }

    if (value < 1024 * 1024) {
      return `${(value / 1024).toFixed(1)} KB`;
    }

    return `${(
      value /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  }

  function download(
    content,
    type,
    name
  ) {
    const blob = new Blob(
      [content],
      {
        type
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download = name;

    document.body.appendChild(
      anchor
    );

    anchor.click();
    anchor.remove();

    setTimeout(
      () =>
        URL.revokeObjectURL(url),
      1000
    );

    return blob.size;
  }

  function hex(buffer) {
    return Array.from(
      new Uint8Array(buffer)
    )
      .map(byte =>
        byte
          .toString(16)
          .padStart(2, "0")
      )
      .join("");
  }

  async function sha(text) {
    if (
      !window.crypto?.subtle
    ) {
      return "";
    }

    const digest =
      await window.crypto
        .subtle
        .digest(
          "SHA-256",
          new TextEncoder()
            .encode(text)
        );

    return hex(digest);
  }

  async function createBackup() {
    const captured =
      await captureServerData();

    const data =
      captured.data;

    const counts =
      countMap(data);

    const base = {
      format:
        FORMAT,

      version:
        VERSION,

      backupType:
        "OPERATIVO_ADMIN",

      generatedAt:
        new Date()
          .toISOString(),

      environment:
        {
          brand:
            "SIXTEEN Urban Luxury",

          firebaseProject:
            PROJECT_ID,

          origin:
            "urbanx-web"
        },

      capture:
        captured.capture,

      scope:
        {
          included:
            [
              "productos",
              "pedidos",
              "clientes_derivados",
              "inventario_kardex",
              "cupones",
              "envios",
              "facturacion_sixteen",
              "newsletter",
              "urbanx3d",
              "configuracion_pagos_publica",
              "store_config"
            ],

          excluded:
            [
              "cuentas_privadas",
              "favoritos",
              "carritos",
              "notificaciones",
              "binarios_cloudinary"
            ]
        },

      counts,

      security:
        {
          removedSecretFieldCount:
            captured
              .removedSecretFields
              .length,

          removedSecretFields:
            captured
              .removedSecretFields
        },

      notes:
        {
          clientes:
            "CRM derivado desde pedidos.",

          restore:
            "Este respaldo no ejecuta restauración automática.",

          files:
            "Se conservan URLs y metadatos; no se copian binarios externos.",

          integrity:
            "SHA-256 detecta alteraciones accidentales; no sustituye una firma digital."
        },

      storeConfig:
        data.storeConfig ||
        {},

      data:
        {
          productos:
            data.productos ||
            [],

          pedidos:
            data.pedidos ||
            [],

          clientes:
            data.clientes ||
            [],

          inventario:
            data.inventario ||
            [],

          cupones:
            data.cupones ||
            [],

          envios:
            data.envios ||
            [],

          facturacion:
            data.facturacion ||
            {
              documentos: [],
              configuracion: {},
              locks: []
            },

          newsletter:
            data.newsletter ||
            [],

          urbanx3d:
            data.urbanx3d ||
            [],

          configuracionPagos:
            data.configuracionPagos ||
            {}
        }
    };

    const hash =
      await sha(
        JSON.stringify(base)
      );

    return {
      ...base,

      integrity:
        {
          algorithm:
            hash
              ? "SHA-256"
              : "UNAVAILABLE",

          sha256:
            hash
        }
    };
  }

  function numericStock(product) {
    try {
      if (
        window.SIXTEEN_VARIANTS
          ?.totalStock
      ) {
        return Number(
          window.SIXTEEN_VARIANTS
            .totalStock(product)
        ) || 0;
      }
    } catch (_) {}

    return Number(
      product?.stock ||
      0
    ) || 0;
  }

  function flattenForCsv(
    type,
    data
  ) {
    const rows =
      Array.isArray(data)
        ? data
        : [];

    if (type === "productos") {
      return rows.map(item => ({
        id:
          item.id || "",
        codigo:
          item.codigo || "",
        nombre:
          item.nombre || "",
        categoria:
          item.categoria || "",
        estado:
          item.estado || "",
        destacado:
          !!item.destacado,
        nuevo:
          !!item.nuevo,
        precio:
          Number(item.precio || 0),
        precioAnterior:
          Number(
            item.precioAnterior || 0
          ),
        ivaTarifa:
          Number(
            item.ivaTarifa ?? 15
          ),
        stockTotal:
          numericStock(item),
        stockMinimo:
          Number(
            item.stockMinimo || 0
          ),
        usaVariantes:
          !!item.usaVariantes,
        variantes:
          Array.isArray(item.variantes)
            ? item.variantes.length
            : 0,
        color:
          item.color || "",
        tallas:
          Array.isArray(item.tallas)
            ? item.tallas.join(" | ")
            : item.tallas || "",
        imagen:
          item.imagen || ""
      }));
    }

    if (type === "pedidos") {
      return rows.map(order => ({
        id:
          order.id || "",
        numero:
          order.numero || "",
        fecha:
          serializar(
            order.creadoEn
          ) || "",
        estado:
          order.estado || "",
        estadoPago:
          order.estadoPago ||
          order.pago?.estado ||
          "",
        metodoPago:
          order.pago?.metodo || "",
        clienteUid:
          order.clienteUid || "",
        cliente:
          [
            order.cliente?.nombres,
            order.cliente?.apellidos
          ]
            .filter(Boolean)
            .join(" "),
        identificacion:
          order.cliente
            ?.identificacion ||
          "",
        email:
          order.cliente?.email || "",
        telefono:
          order.cliente
            ?.telefono ||
          "",
        provincia:
          order.entrega
            ?.provincia ||
          "",
        ciudad:
          order.entrega?.ciudad ||
          "",
        direccion:
          order.entrega
            ?.direccion ||
          "",
        cupon:
          order.resumen
            ?.cupon
            ?.codigo ||
          order.resumen
            ?.cupon ||
          "",
        subtotal:
          Number(
            order.resumen
              ?.subtotal ||
            0
          ),
        descuento:
          Number(
            order.resumen
              ?.descuento ||
            0
          ),
        envio:
          Number(
            order.resumen
              ?.envio ||
            0
          ),
        total:
          Number(
            order.resumen
              ?.total ||
            0
          ),
        productos:
          Array.isArray(
            order.productos
          )
            ? order.productos
                .map(item =>
                  `${item.codigo || ""} ${item.nombre || ""} x${item.cantidad || 0}`
                )
                .join(" | ")
            : ""
      }));
    }

    if (type === "clientes") {
      return rows.map(client => ({
        clave:
          client.clave || "",
        cliente:
          client.nombre || "",
        identificacion:
          client.identificacion || "",
        email:
          client.email || "",
        telefono:
          client.telefono || "",
        pedidos:
          Number(
            client.totalPedidos ||
            0
          ),
        pedidosNoCancelados:
          Number(
            client.pedidosNoCancelados ||
            0
          ),
        comprasValidas:
          Number(
            client.comprasValidas ||
            0
          ),
        totalComprado:
          Number(
            client.totalComprado ||
            0
          ).toFixed(2),
        ticketPromedio:
          Number(
            client.ticketPromedio ||
            0
          ).toFixed(2),
        ultimoPedido:
          client.ultimoPedido
            ?.numero ||
          client.ultimoPedido
            ?.id ||
          "",
        ultimaCompraValida:
          serializar(
            client
              .ultimaCompraValida
              ?.creadoEn
          ) ||
          "",
        provincia:
          client.ultimaEntrega
            ?.provincia ||
          "",
        ciudad:
          client.ultimaEntrega
            ?.ciudad ||
          ""
      }));
    }

    if (type === "inventario") {
      return rows.map(item => ({
        id:
          item.id || "",
        fecha:
          serializar(
            item.creadoEn ||
            item.fecha
          ) || "",
        tipo:
          item.tipo || "",
        productoId:
          item.productoId || "",
        codigo:
          item.codigo || "",
        producto:
          item.producto ||
          item.nombre ||
          "",
        varianteId:
          item.varianteId || "",
        color:
          item.color || "",
        talla:
          item.talla || "",
        cantidad:
          Number(
            item.cantidad || 0
          ),
        variacion:
          Number(
            item.variacion ??
            item.cantidad ??
            0
          ),
        stockAnterior:
          Number(
            item.stockAnterior || 0
          ),
        stockNuevo:
          Number(
            item.stockNuevo || 0
          ),
        pedido:
          item.pedidoNumero ||
          item.pedidoId ||
          "",
        motivo:
          item.motivo || "",
        origen:
          item.origen || "",
        usuario:
          item.usuarioEmail ||
          item.usuario ||
          ""
      }));
    }

    if (type === "cupones") {
      return rows.map(item => ({
        id:
          item.id || "",
        codigo:
          item.codigo ||
          item.id ||
          "",
        activo:
          item.activo !== false,
        descuentoPorcentaje:
          Number(
            item.descuentoPorcentaje ??
            item.porcentaje ??
            0
          ),
        limiteUsos:
          Number(
            item.limiteUsos || 0
          ),
        usos:
          Number(
            item.usos || 0
          ),
        fechaInicio:
          item.fechaInicio || "",
        fechaFin:
          item.fechaFin || "",
        ultimoUsoEn:
          serializar(
            item.ultimoUsoEn
          ) || ""
      }));
    }

    if (type === "envios") {
      return rows.map(item => ({
        id:
          item.id || "",
        provincia:
          item.provincia ||
          item.nombre ||
          item.id ||
          "",
        activo:
          item.activo !== false,
        costo:
          Number(
            item.costo ??
            item.precio ??
            item.tarifa ??
            0
          ),
        actualizadoEn:
          serializar(
            item.actualizadoEn
          ) || ""
      }));
    }

    if (type === "facturacion") {
      return rows.map(item => ({
        id:
          item.id || "",
        tipo:
          item.tipoDocumento || "",
        numero:
          item.numero || "",
        fecha:
          item.fechaEmision || "",
        estado:
          item.estado || "",
        origen:
          item.origenFactura || "",
        pedido:
          item.pedidoNumero ||
          item.pedidoId ||
          "",
        clienteUid:
          item.clienteUid || "",
        cliente:
          item.comprador
            ?.razonSocial ||
          "",
        identificacion:
          item.comprador
            ?.identificacion ||
          "",
        email:
          item.comprador?.email || "",
        base:
          Number(
            item.totales
              ?.baseImponible ||
            0
          ),
        iva:
          Number(
            item.totales
              ?.impuesto ||
            0
          ),
        descuento:
          Number(
            item.totales
              ?.descuento ||
            0
          ),
        envio:
          Number(
            item.totales
              ?.envio ||
            0
          ),
        total:
          Number(
            item.totales
              ?.importeTotal ||
            0
          ),
        estadoPago:
          item.pago?.estado || ""
      }));
    }

    if (type === "newsletter") {
      return rows.map(item => ({
        id:
          item.id || "",
        email:
          item.email || "",
        activo:
          item.activo === true,
        consentimientoMarketing:
          item.consentimientoMarketing === true,
        origen:
          item.origen || "",
        actualizadoEn:
          serializar(
            item.actualizadoEn
          ) || ""
      }));
    }

    return rows;
  }

  function csvEscape(value) {
    const numeric =
      typeof value === "number" &&
      Number.isFinite(value);

    let text = "";

    if (
      value !== null &&
      value !== undefined
    ) {
      text =
        typeof value === "object"
          ? JSON.stringify(
              serializar(value)
            )
          : String(value);
    }

    if (
      !numeric &&
      /^[\s]*[=+\-@]/.test(text)
    ) {
      text = "'" + text;
    }

    return (
      '"' +
      text.replace(
        /"/g,
        '""'
      ) +
      '"'
    );
  }

  function csv(rows) {
    if (
      !Array.isArray(rows) ||
      !rows.length
    ) {
      return "";
    }

    const headers = [];

    rows.forEach(row => {
      Object.keys(row || {})
        .forEach(key => {
          if (
            !headers.includes(key)
          ) {
            headers.push(key);
          }
        });
    });

    return "\uFEFF" + [
      headers
        .map(csvEscape)
        .join(","),

      ...rows.map(row =>
        headers
          .map(key =>
            csvEscape(
              row?.[key]
            )
          )
          .join(",")
      )
    ].join("\r\n");
  }

  function setSourceStatus(
    text,
    state = ""
  ) {
    const element =
      $("backupSourceStatus");

    if (!element) return;

    element.textContent =
      text;

    element.classList.toggle(
      "error",
      state === "error"
    );
  }

  async function refreshKpisFromServer() {
    try {
      setSourceStatus(
        "ACTUALIZANDO..."
      );

      const [
        productos,
        pedidos,
        inventario,
        cupones,
        envios,
        facturacionRaw,
        newsletter
      ] = await Promise.all([
        readCollection("productos"),
        readCollection("pedidos"),
        readCollection("inventario"),
        readCollection("cupones"),
        readCollection("envios"),
        readCollection("facturacion"),
        readCollection("newsletter")
      ]);

      const facturacion =
        splitBilling(
          facturacionRaw
        );

      updateKpis({
        productos:
          productos.length,
        pedidos:
          pedidos.length,
        clientes:
          deriveClients(pedidos)
            .length,
        inventario:
          inventario.length,
        cupones:
          cupones.length,
        envios:
          envios.length,
        facturacion:
          facturacion
            .documentos.length,
        newsletter:
          newsletter.length
      });

      setSourceStatus(
        "FIRESTORE SERVER"
      );
    } catch (error) {
      console.error(
        "KPIs backup:",
        error
      );

      setSourceStatus(
        "REVISAR CONEXIÓN",
        "error"
      );
    }
  }

  function localFallbackKpis() {
    const source =
      window
        .SIXTEEN_ADMIN_BACKUP_SOURCE ||
      {};

    updateKpis({
      productos:
        source
          .getProductos?.()
          ?.length || 0,
      pedidos:
        source
          .getPedidos?.()
          ?.length || 0,
      clientes:
        source
          .getClientes?.()
          ?.length || 0,
      inventario:
        source
          .getInventario?.()
          ?.length || 0,
      cupones:
        source
          .getCupones?.()
          ?.length || 0,
      envios:
        source
          .getEnvios?.()
          ?.length || 0,
      facturacion: 0,
      newsletter: 0
    });
  }

  function saveLastMeta(
    backup,
    size
  ) {
    try {
      localStorage.setItem(
        META_KEY,
        JSON.stringify({
          generatedAt:
            backup.generatedAt,
          sha256:
            backup.integrity
              ?.sha256 ||
            "",
          size
        })
      );
    } catch (_) {}
  }

  function renderLastMeta() {
    const element =
      $("backupUltimaDescarga");

    if (!element) return;

    try {
      const meta =
        JSON.parse(
          localStorage.getItem(
            META_KEY
          ) ||
          "null"
        );

      if (!meta?.generatedAt) {
        return;
      }

      const date =
        new Date(meta.generatedAt);

      element.textContent =
        "Último respaldo registrado: " +
        date.toLocaleString(
          "es-EC"
        ) +
        (
          meta.size
            ? ` · ${humanBytes(meta.size)}`
            : ""
        ) +
        (
          meta.sha256
            ? " · SHA-256"
            : ""
        );
    } catch (_) {}
  }

  async function downloadMasterBackup() {
    const button =
      $("descargarBackupCompletoBtn");

    try {
      if (button) {
        button.disabled = true;
        button.textContent =
          "LEYENDO FIRESTORE...";
      }

      setSourceStatus(
        "RESPALDANDO..."
      );

      const backup =
        await createBackup();

      const content =
        JSON.stringify(
          backup,
          null,
          2
        );

      const size =
        download(
          content,
          "application/json;charset=utf-8",
          "SIXTEEN_BACKUP_OPERATIVO_" +
            stamp() +
            ".json"
        );

      saveLastMeta(
        backup,
        size
      );

      renderLastMeta();

      updateKpis(
        backup.counts
      );

      setSourceStatus(
        "RESPALDO LISTO"
      );

      setTimeout(
        () =>
          setSourceStatus(
            "FIRESTORE SERVER"
          ),
        1800
      );
    } catch (error) {
      console.error(
        "Backup SIXTEEN:",
        error
      );

      setSourceStatus(
        "ERROR DE RESPALDO",
        "error"
      );

      alert(
        "No fue posible generar el respaldo maestro. " +
        (
          error?.message ||
          "Revisa la conexión y los permisos de Firestore."
        )
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent =
          "DESCARGAR RESPALDO MAESTRO";
      }
    }
  }

  async function exportCsv(type) {
    const buttons =
      Array.from(
        document.querySelectorAll(
          `[data-backup-export="${type}"]`
        )
      );

    buttons.forEach(button => {
      button.disabled = true;
    });

    try {
      let rows = [];

      if (
        type === "productos" ||
        type === "pedidos" ||
        type === "inventario" ||
        type === "cupones" ||
        type === "envios" ||
        type === "newsletter"
      ) {
        rows =
          await readCollection(
            type === "inventario"
              ? "inventario"
              : type
          );
      } else if (
        type === "clientes"
      ) {
        rows =
          deriveClients(
            await readCollection(
              "pedidos"
            )
          );
      } else if (
        type === "facturacion"
      ) {
        const billing =
          splitBilling(
            await readCollection(
              "facturacion"
            )
          );

        rows =
          billing.documentos;
      }

      const flat =
        flattenForCsv(
          type,
          rows
        );

      if (!flat.length) {
        alert(
          "No hay datos de " +
          type +
          " para exportar."
        );

        return;
      }

      download(
        csv(flat),
        "text/csv;charset=utf-8",
        "SIXTEEN_" +
          type.toUpperCase() +
          "_" +
          stamp() +
          ".csv"
      );
    } catch (error) {
      console.error(
        "Exportación " + type + ":",
        error
      );

      alert(
        "No fue posible exportar " +
        type +
        ". Revisa la conexión con Firestore."
      );
    } finally {
      buttons.forEach(button => {
        button.disabled = false;
      });
    }
  }

  async function exportConfig() {
    const button =
      $("exportarConfiguracionBtn");

    try {
      if (button) {
        button.disabled = true;
      }

      const [
        paymentConfig,
        billingRaw
      ] = await Promise.all([
        readDocument(
          "configuracion_pagos",
          "principal"
        ),
        readCollection(
          "facturacion"
        )
      ]);

      const billing =
        splitBilling(
          billingRaw
        );

      const removed = [];

      const configuration =
        sanitizeSecrets(
          {
            storeConfig:
              window
                .SIXTEEN_STORE_CONFIG ||
              {},
            configuracionPagos:
              paymentConfig ||
              {},
            configuracionFacturacion:
              billing
                .configuracion ||
              {}
          },
          removed
        );

      const output = {
        format:
          "SIXTEEN-CONFIG",

        version:
          2,

        generatedAt:
          new Date()
            .toISOString(),

        security:
          {
            removedSecretFieldCount:
              removed.length,
            removedSecretFields:
              removed
          },

        ...serializar(
          configuration
        )
      };

      download(
        JSON.stringify(
          output,
          null,
          2
        ),
        "application/json;charset=utf-8",
        "SIXTEEN_CONFIGURACION_" +
          stamp() +
          ".json"
      );
    } catch (error) {
      console.error(
        "Configuración backup:",
        error
      );

      alert(
        "No fue posible exportar la configuración."
      );
    } finally {
      if (button) {
        button.disabled = false;
      }
    }
  }

  function expectedCount(
    parsed,
    key
  ) {
    const data =
      parsed?.data ||
      {};

    if (key === "facturacion") {
      return data.facturacion
        ?.documentos?.length ||
        0;
    }

    return Array.isArray(
      data[key]
    )
      ? data[key].length
      : 0;
  }

  async function validateBackup(file) {
    const box =
      $("backupValidacionResultado");

    const show = (
      text,
      type = ""
    ) => {
      if (!box) return;

      box.classList.remove(
        "ok",
        "error"
      );

      if (type) {
        box.classList.add(type);
      }

      box.textContent = text;
    };

    if (!file) {
      show("Esperando archivo...");
      return;
    }

    if (
      file.size >
      MAX_VALIDATE_BYTES
    ) {
      show(
        "Archivo no válido: supera el límite de 50 MB para validación en navegador.",
        "error"
      );
      return;
    }

    try {
      show(
        "Validando respaldo..."
      );

      const parsed =
        JSON.parse(
          await file.text()
        );

      if (
        parsed.format !==
        FORMAT
      ) {
        throw new Error(
          "No corresponde al formato SIXTEEN-BACKUP."
        );
      }

      const version =
        Number(
          parsed.version
        );

      if (
        ![1, 2].includes(
          version
        )
      ) {
        throw new Error(
          "Versión de respaldo no compatible."
        );
      }

      if (
        !parsed.data ||
        typeof parsed.data !==
          "object"
      ) {
        throw new Error(
          "Falta el bloque de datos."
        );
      }

      if (
        version === 2
      ) {
        const countKeys = [
          "productos",
          "pedidos",
          "clientes",
          "inventario",
          "cupones",
          "envios",
          "facturacion",
          "newsletter"
        ];

        countKeys.forEach(key => {
          const declared =
            Number(
              parsed.counts?.[key] ||
              0
            );

          const actual =
            expectedCount(
              parsed,
              key
            );

          if (
            declared !== actual
          ) {
            throw new Error(
              `El conteo de ${key} no coincide (${declared} declarado / ${actual} real).`
            );
          }
        });

        if (
          parsed.environment
            ?.firebaseProject &&
          parsed.environment
            .firebaseProject !==
            PROJECT_ID
        ) {
          throw new Error(
            "El respaldo pertenece a otro proyecto Firebase."
          );
        }
      }

      let integrity =
        "Sin SHA-256.";

      const expected =
        parsed.integrity
          ?.sha256 ||
        "";

      if (
        expected &&
        window.crypto?.subtle
      ) {
        const clone = {
          ...parsed
        };

        delete clone.integrity;

        const actual =
          await sha(
            JSON.stringify(
              clone
            )
          );

        if (
          actual !== expected
        ) {
          throw new Error(
            "La integridad SHA-256 no coincide."
          );
        }

        integrity =
          "Integridad SHA-256 correcta.";
      }

      const counts =
        parsed.counts ||
        {};

      show(
        [
          `Respaldo válido · Versión ${version}.`,
          `Productos: ${Number(counts.productos || 0)} · Pedidos: ${Number(counts.pedidos || 0)} · Clientes: ${Number(counts.clientes || 0)}.`,
          version === 2
            ? `Facturación: ${Number(counts.facturacion || 0)} · Newsletter: ${Number(counts.newsletter || 0)}.`
            : "Respaldo legado compatible.",
          integrity
        ].join("\n"),
        "ok"
      );
    } catch (error) {
      console.error(
        "Validación backup:",
        error
      );

      show(
        "Archivo no válido: " +
        (
          error?.message ||
          "Error de validación."
        ),
        "error"
      );
    }
  }

  $("descargarBackupCompletoBtn")
    ?.addEventListener(
      "click",
      downloadMasterBackup
    );

  $("exportarConfiguracionBtn")
    ?.addEventListener(
      "click",
      exportConfig
    );

  $("validarBackupInput")
    ?.addEventListener(
      "change",
      function () {
        validateBackup(
          this.files?.[0] ||
          null
        );

        // Permite seleccionar nuevamente el mismo archivo.
        this.value = "";
      }
    );

  document
    .querySelectorAll(
      "[data-backup-export]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () =>
          exportCsv(
            button.dataset
              .backupExport
          )
      );
    });

  window.addEventListener(
    "sixteen:backup-data-updated",
    localFallbackKpis
  );

  window.addEventListener(
    "sixteen:admin-data-updated",
    localFallbackKpis
  );

  localFallbackKpis();
  renderLastMeta();

  // El refresco directo no bloquea el resto del Dashboard.
  setTimeout(
    refreshKpisFromServer,
    500
  );
})();
