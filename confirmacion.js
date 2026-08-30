// @ts-nocheck
// ==========================================
// SIXTEEN - CONFIRMACIÓN DE PEDIDO
// PASO 5 · PRE-FINAL
// ==========================================

(function () {
  "use strict";

  // ==========================================
  // FIREBASE
  // ==========================================

  const firebaseConfig = {
    apiKey: "AIzaSyBFLPbBQPZy4ILeBRZ_kELi7KizlR1hgJo",
    authDomain: "urbanx-92e74.firebaseapp.com",
    projectId: "urbanx-92e74",
    storageBucket: "urbanx-92e74.firebasestorage.app",
    messagingSenderId: "830520272633",
    appId: "1:830520272633:web:ce7f2bf7abc8f86fec6428"
  };

  if (
    typeof firebase !== "undefined"
    && !firebase.apps.length
  ) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth =
    typeof firebase !== "undefined"
      ? firebase.auth()
      : null;

  const db =
    typeof firebase !== "undefined"
      ? firebase.firestore()
      : null;

  // ==========================================
  // ELEMENTOS
  // ==========================================

  const $ = id =>
    document.getElementById(id);

  const numeroPedido = $("numeroPedido");
  const confirmacionMensaje = $("confirmacionMensaje");
  const confirmacionVerificacion = $("confirmacionVerificacion");
  const confirmacionContenido = $("confirmacionContenido");
  const confirmacionDetalles = $("confirmacionDetalles");

  const confirmacionNombre = $("confirmacionNombre");
  const confirmacionEmail = $("confirmacionEmail");
  const confirmacionTelefono = $("confirmacionTelefono");
  const confirmacionFecha = $("confirmacionFecha");

  const confirmacionMetodoEntrega = $("confirmacionMetodoEntrega");
  const confirmacionProvincia = $("confirmacionProvincia");
  const confirmacionCiudad = $("confirmacionCiudad");
  const confirmacionDireccion = $("confirmacionDireccion");
  const confirmacionReferencia = $("confirmacionReferencia");

  const confirmacionPago = $("confirmacionPago");
  const confirmacionEstado = $("confirmacionEstado");
  const confirmacionPagoInstrucciones = $("confirmacionPagoInstrucciones");

  const confirmacionProductos = $("confirmacionProductos");
  const confirmacionSubtotal = $("confirmacionSubtotal");
  const confirmacionDescuento = $("confirmacionDescuento");
  const confirmacionCuponLinea = $("confirmacionCuponLinea");
  const confirmacionCupon = $("confirmacionCupon");
  const confirmacionEnvio = $("confirmacionEnvio");
  const confirmacionTotal = $("confirmacionTotal");

  const confirmacion3d = $("confirmacion3d");
  const abrirUrbanx3d = $("abrirUrbanx3d");
  const seguirPedidoBtn = $("seguirPedidoBtn");
  const toastConfirmacion = $("toastConfirmacion");

  let pedido = null;
  let toastTimer = null;

  const referenciaUrl =
    String(
      new URLSearchParams(
        window.location.search
      ).get("pedido") || ""
    ).trim();

  // ==========================================
  // CARGA PRINCIPAL
  // ==========================================

  async function cargarPedido() {
    const local = leerPedidoLocal();

    try {
      const usuario =
        await obtenerUsuarioActual();

      if (
        usuario
        && db
      ) {
        const remoto =
          await buscarPedidoFirestore(
            usuario,
            referenciaUrl,
            local
          );

        if (remoto) {
          pedido = remoto;
          guardarPedidoLocal(remoto);
          renderizarPedido();
          marcarVerificado(true);
          return;
        }
      }

      if (
        local
        && coincideReferencia(
          local,
          referenciaUrl
        )
      ) {
        pedido = local;
        renderizarPedido();
        marcarVerificado(false);
        return;
      }

      mostrarErrorPedido();

    } catch (error) {
      console.error(
        "Confirmación SIXTEEN:",
        error
      );

      if (
        local
        && coincideReferencia(
          local,
          referenciaUrl
        )
      ) {
        pedido = local;
        renderizarPedido();
        marcarVerificado(false);
        mostrarToast(
          "Mostrando la copia guardada de tu pedido."
        );
        return;
      }

      mostrarErrorPedido();
    }
  }

  function leerPedidoLocal() {
    try {
      const raw =
        localStorage.getItem(
          "urbanx_ultimo_pedido"
        );

      if (!raw) {
        return null;
      }

      const data =
        JSON.parse(raw);

      return data
        && typeof data === "object"
          ? data
          : null;

    } catch (_) {
      return null;
    }
  }

  function guardarPedidoLocal(data) {
    try {
      const copia = {
        ...data,
        fecha:
          obtenerFechaISO(data)
          || new Date().toISOString()
      };

      delete copia.creadoEn;

      localStorage.setItem(
        "urbanx_ultimo_pedido",
        JSON.stringify(copia)
      );
    } catch (_) {}
  }

  function coincideReferencia(
    data,
    referencia
  ) {
    if (!data) {
      return false;
    }

    if (!referencia) {
      return true;
    }

    return [
      data.firestoreId,
      data.numero
    ]
      .filter(Boolean)
      .some(
        value =>
          String(value) === referencia
      );
  }

  function obtenerUsuarioActual() {
    if (!auth) {
      return Promise.resolve(null);
    }

    if (auth.currentUser) {
      return Promise.resolve(
        auth.currentUser
      );
    }

    return new Promise(resolve => {
      let resuelto = false;

      const timer =
        setTimeout(
          () => {
            if (!resuelto) {
              resuelto = true;
              resolve(
                auth.currentUser || null
              );
            }
          },
          2500
        );

      const unsubscribe =
        auth.onAuthStateChanged(
          user => {
            if (resuelto) {
              return;
            }

            resuelto = true;
            clearTimeout(timer);
            unsubscribe();
            resolve(user || null);
          },
          () => {
            if (resuelto) {
              return;
            }

            resuelto = true;
            clearTimeout(timer);
            unsubscribe();
            resolve(null);
          }
        );
    });
  }

  async function buscarPedidoFirestore(
    usuario,
    referencia,
    local
  ) {
    if (
      !usuario
      || !db
    ) {
      return null;
    }

    const idLocal =
      local
      && local.firestoreId
        ? String(local.firestoreId)
        : "";

    if (
      idLocal
      && (
        !referencia
        || referencia === idLocal
        || referencia === String(
          local.numero || ""
        )
      )
    ) {
      try {
        const snap =
          await db
            .collection("pedidos")
            .doc(idLocal)
            .get();

        if (snap.exists) {
          return normalizarPedidoFirestore(
            snap
          );
        }
      } catch (error) {
        console.warn(
          "No fue posible abrir el pedido por ID:",
          error
        );
      }
    }

    if (!referencia) {
      return null;
    }

    const snapshot =
      await db
        .collection("pedidos")
        .where(
          "clienteUid",
          "==",
          usuario.uid
        )
        .get();

    let encontrado = null;

    snapshot.forEach(doc => {
      if (encontrado) {
        return;
      }

      const data = doc.data() || {};

      if (
        doc.id === referencia
        || String(data.numero || "") === referencia
      ) {
        encontrado =
          normalizarPedidoFirestore(doc);
      }
    });

    return encontrado;
  }

  function normalizarPedidoFirestore(
    doc
  ) {
    const data = doc.data() || {};

    return {
      ...data,
      firestoreId: doc.id,
      fecha: obtenerFechaISO(data)
    };
  }

  // ==========================================
  // RENDER GENERAL
  // ==========================================

  function renderizarPedido() {
    if (!pedido) {
      mostrarErrorPedido();
      return;
    }

    if (confirmacionContenido) {
      confirmacionContenido.hidden = false;
    }

    numeroPedido.textContent =
      pedido.numero || "Sin número";

    configurarSeguimiento();
    renderizarCliente();
    renderizarEntrega();
    renderizarPago();
    renderizarProductos();
    renderizarTotales();
    configurarSixteen3d();
  }

  function renderizarCliente() {
    const cliente =
      pedido.cliente || {};

    confirmacionNombre.textContent =
      (
        (cliente.nombres || "")
        + " "
        + (cliente.apellidos || "")
      ).trim() || "-";

    confirmacionEmail.textContent =
      cliente.email || "-";

    confirmacionTelefono.textContent =
      cliente.telefono || "-";

    if (confirmacionFecha) {
      confirmacionFecha.textContent =
        formatearFechaPedido(pedido);
    }
  }

  function renderizarEntrega() {
    const entrega =
      pedido.entrega || {};

    if (confirmacionMetodoEntrega) {
      confirmacionMetodoEntrega.textContent =
        normalizarMetodoEntrega(
          entrega.metodo
        );
    }

    confirmacionProvincia.textContent =
      entrega.provincia || "-";

    confirmacionCiudad.textContent =
      entrega.ciudad || "-";

    confirmacionDireccion.textContent =
      entrega.direccion || "-";

    confirmacionReferencia.textContent =
      entrega.referencia
      || "Sin referencia";
  }

  function renderizarPago() {
    const pago =
      pedido.pago || {};

    const metodoPago =
      typeof pago === "string"
        ? pago
        : (pago.metodo || "");

    confirmacionPago.textContent =
      (
        pago
        && typeof pago === "object"
        && pago.nombre
      )
        ? pago.nombre
        : obtenerNombrePago(
            metodoPago
          );

    confirmacionEstado.textContent =
      pedido.estadoPago
      || (
        pago
        && typeof pago === "object"
          ? pago.estado
          : ""
      )
      || "Pendiente";

    renderizarInstruccionesPago(
      metodoPago
    );
  }

  function renderizarTotales() {
    const resumen =
      pedido.resumen || {};

    const subtotal =
      numeroSeguro(
        resumen.subtotal
      );

    const descuento =
      numeroSeguro(
        resumen.descuento
      );

    const envio =
      numeroSeguro(
        resumen.envio
      );

    const total =
      numeroSeguro(
        resumen.total
      );

    confirmacionSubtotal.textContent =
      formatoDinero(subtotal);

    confirmacionDescuento.textContent =
      descuento > 0
        ? "-" + formatoDinero(descuento)
        : "$0.00";

    confirmacionEnvio.textContent =
      formatoDinero(envio);

    confirmacionTotal.textContent =
      formatoDinero(total);

    const cupon =
      String(
        resumen.cupon || ""
      ).trim();

    if (
      confirmacionCuponLinea
      && confirmacionCupon
    ) {
      confirmacionCuponLinea.hidden =
        !cupon;

      confirmacionCupon.textContent =
        cupon || "-";
    }
  }

  // ==========================================
  // PRODUCTOS · RENDER SEGURO
  // ==========================================

  function renderizarProductos() {
    const productos =
      Array.isArray(pedido.productos)
        ? pedido.productos
        : [];

    confirmacionProductos.replaceChildren();

    if (!productos.length) {
      const mensaje =
        document.createElement("p");

      mensaje.textContent =
        "No hay productos registrados.";

      confirmacionProductos.appendChild(
        mensaje
      );
      return;
    }

    productos.forEach(producto => {
      const cantidad =
        Math.max(
          1,
          Math.floor(
            numeroSeguro(
              producto.cantidad || 1
            )
          )
        );

      const precio =
        Math.max(
          0,
          numeroSeguro(
            producto.precioUnitario
            ?? producto.precio
            ?? 0
          )
        );

      const item =
        document.createElement("article");

      item.className =
        "confirmacion-producto-item";

      const imagenBox =
        document.createElement("div");

      imagenBox.className =
        "confirmacion-producto-imagen";

      const imagenUrl =
        urlHttpsSegura(
          producto.imagen
        );

      if (imagenUrl) {
        const img =
          document.createElement("img");

        img.src = imagenUrl;
        img.alt =
          String(
            producto.nombre
            || "Producto SIXTEEN"
          );
        img.loading = "lazy";

        img.addEventListener(
          "error",
          () => {
            img.remove();
            imagenBox.textContent = "XVI";
          },
          { once: true }
        );

        imagenBox.appendChild(img);
      } else {
        imagenBox.textContent = "XVI";
      }

      const info =
        document.createElement("div");

      info.className =
        "confirmacion-producto-info";

      const titulo =
        document.createElement("h3");

      titulo.textContent =
        String(
          producto.nombre
          || "Producto SIXTEEN"
        );

      info.appendChild(titulo);

      agregarDatoProducto(
        info,
        "Código",
        producto.codigo
        || producto.id
        || "-"
      );

      agregarDatoProducto(
        info,
        "Color",
        producto.color || "-"
      );

      agregarDatoProducto(
        info,
        "Talla",
        producto.talla || "Única"
      );

      agregarDatoProducto(
        info,
        "Cantidad",
        cantidad
      );

      const precioBox =
        document.createElement("div");

      precioBox.className =
        "confirmacion-producto-precio";

      precioBox.textContent =
        formatoDinero(
          precio * cantidad
        );

      item.append(
        imagenBox,
        info,
        precioBox
      );

      confirmacionProductos.appendChild(
        item
      );
    });
  }

  function agregarDatoProducto(
    contenedor,
    etiqueta,
    valor
  ) {
    const p =
      document.createElement("p");

    p.textContent =
      etiqueta
      + ": "
      + String(
          valor == null
            ? "-"
            : valor
        );

    contenedor.appendChild(p);
  }

  // ==========================================
  // SEGUIMIENTO
  // ==========================================

  function configurarSeguimiento() {
    if (!seguirPedidoBtn) {
      return;
    }

    const referencia =
      pedido.firestoreId
      || pedido.numero
      || "";

    seguirPedidoBtn.hidden =
      !referencia;

    seguirPedidoBtn.href =
      "./seguimiento.html?pedido="
      + encodeURIComponent(
          referencia
        );
  }

  // ==========================================
  // SIXTEEN EXPERIENCE 3D
  // ==========================================

  function configurarSixteen3d() {
    const productos =
      Array.isArray(pedido.productos)
        ? pedido.productos
        : [];

    const compatible =
      productos.find(
        item => {
          if (
            !item
            || item.urbanx3d !== true
            || !(item.codigo || item.id)
          ) {
            return false;
          }

          const modelo = String(item.modelo3d || "").trim();

          try {
            const url = new URL(modelo);
            return url.protocol === "https:" && /\.glb$/i.test(url.pathname);
          } catch (_) {
            return false;
          }
        }
      );

    if (
      !compatible
      || !abrirUrbanx3d
    ) {
      if (confirmacion3d) {
        confirmacion3d.hidden = true;
      }
      return;
    }

    if (confirmacion3d) {
      confirmacion3d.hidden = false;
    }

    const codigo =
      compatible.codigo
      || compatible.id;

    const pedido3dId =
      String(
        pedido.firestoreId
        || ""
      ).trim();

    if (!pedido3dId) {
      if (confirmacion3d) {
        confirmacion3d.hidden = true;
      }
      return;
    }

    abrirUrbanx3d.href =
      "../urbanx-3d/index.html?pedido="
      + encodeURIComponent(pedido3dId)
      + "&producto="
      + encodeURIComponent(codigo);

    abrirUrbanx3d.addEventListener(
      "click",
      () => {
        mostrarToast(
          "Abriendo experiencia SIXTEEN 3D."
        );
      },
      { once: true }
    );
  }

  // ==========================================
  // PAGO
  // ==========================================

  function obtenerNombrePago(metodo) {
    const nombres = {
      transferencia:
        "Transferencia bancaria",
      qr:
        "Pago QR",
      tarjeta:
        "Tarjeta de crédito / débito",
      efectivo:
        "Pago contra entrega"
    };

    return nombres[metodo]
      || "Por confirmar";
  }

  function renderizarInstruccionesPago(
    metodo
  ) {
    if (!confirmacionPagoInstrucciones) {
      return;
    }

    confirmacionPagoInstrucciones
      .replaceChildren();

    const snapshot =
      pedido
      && pedido.pago
      && typeof pedido.pago === "object"
      && pedido.pago.instrucciones
      && typeof pedido.pago.instrucciones === "object"
        ? pedido.pago.instrucciones
        : null;

    let info = snapshot;

    if (
      !info
      && window.SIXTEEN_PAYMENTS
    ) {
      const PAY =
        window.SIXTEEN_PAYMENTS;

      info =
        PAY.instructions(
          metodo,
          PAY.readLocal()
        );
    }

    if (!info) {
      confirmacionPagoInstrucciones
        .classList.remove("visible");
      return;
    }

    const titulo =
      String(info.title || "").trim();

    const lineas =
      Array.isArray(info.lines)
        ? info.lines
            .map(line =>
              String(line || "").trim()
            )
            .filter(Boolean)
            .slice(0, 12)
        : [];

    const imageUrl =
      urlHttpsSegura(
        info.imageUrl
      );

    const actionUrl =
      urlHttpsSegura(
        info.actionUrl
      );

    if (titulo) {
      const h3 =
        document.createElement("h3");
      h3.textContent = titulo;
      confirmacionPagoInstrucciones
        .appendChild(h3);
    }

    lineas.forEach(linea => {
      const p =
        document.createElement("p");
      p.textContent = linea;
      confirmacionPagoInstrucciones
        .appendChild(p);
    });

    if (imageUrl) {
      const img =
        document.createElement("img");
      img.src = imageUrl;
      img.alt =
        "Código QR de pago SIXTEEN";
      img.loading = "lazy";
      confirmacionPagoInstrucciones
        .appendChild(img);
    }

    if (
      metodo === "tarjeta"
      && actionUrl
    ) {
      const referencia =
        document.createElement("p");
      referencia.className =
        "payment-order-reference";
      referencia.textContent =
        "Referencia del pedido: "
        + String(pedido?.numero || "").trim()
        + ". Conserva este número para cualquier verificación del pago.";
      confirmacionPagoInstrucciones
        .appendChild(referencia);

      const link =
        document.createElement("a");
      link.className =
        "payment-secure-link";
      link.href = actionUrl;
      link.target = "_blank";
      link.rel =
        "noopener noreferrer";
      link.textContent =
        "IR AL PAGO SEGURO";
      confirmacionPagoInstrucciones
        .appendChild(link);
    }

    confirmacionPagoInstrucciones
      .classList.toggle(
        "visible",
        Boolean(
          titulo
          || lineas.length
          || imageUrl
          || (
            metodo === "tarjeta"
            && actionUrl
          )
        )
      );
  }

  // ==========================================
  // ESTADO / ERRORES
  // ==========================================

  function marcarVerificado(remoto) {
    if (!confirmacionVerificacion) {
      return;
    }

    confirmacionVerificacion.textContent =
      remoto
        ? "✓ Pedido verificado con SIXTEEN"
        : "Copia local del pedido";

    confirmacionVerificacion.classList.toggle(
      "es-remoto",
      remoto
    );
  }

  function mostrarErrorPedido() {
    pedido = null;

    numeroPedido.textContent =
      "NO DISPONIBLE";

    if (confirmacionVerificacion) {
      confirmacionVerificacion.textContent =
        "No fue posible verificar el pedido";
      confirmacionVerificacion.classList.remove(
        "es-remoto"
      );
    }

    if (confirmacionMensaje) {
      confirmacionMensaje.replaceChildren();

      confirmacionMensaje.append(
        "No encontramos un pedido válido para mostrar en esta sesión. "
      );

      const link =
        document.createElement("a");
      link.href = "./index.html";
      link.className =
        "confirmacion-error-link";
      link.textContent =
        "Volver a SIXTEEN";

      confirmacionMensaje.appendChild(link);
    }

    if (confirmacionContenido) {
      confirmacionContenido.hidden = true;
    }

    if (confirmacion3d) {
      confirmacion3d.hidden = true;
    }

    if (seguirPedidoBtn) {
      seguirPedidoBtn.hidden = true;
    }

    mostrarToast(
      "No se encontró información del pedido."
    );
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  function numeroSeguro(valor) {
    const numero = Number(valor);

    return Number.isFinite(numero)
      ? numero
      : 0;
  }

  function formatoDinero(valor) {
    return "$"
      + Math.max(
          0,
          numeroSeguro(valor)
        ).toFixed(2);
  }

  function obtenerFechaISO(data) {
    if (!data) {
      return "";
    }

    if (
      data.creadoEn
      && typeof data.creadoEn.toDate === "function"
    ) {
      try {
        return data.creadoEn
          .toDate()
          .toISOString();
      } catch (_) {}
    }

    if (data.fecha) {
      const date =
        new Date(data.fecha);

      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return "";
  }

  function formatearFechaPedido(data) {
    const iso =
      obtenerFechaISO(data);

    if (!iso) {
      return "-";
    }

    const fecha =
      new Date(iso);

    try {
      return new Intl.DateTimeFormat(
        "es-EC",
        {
          dateStyle: "medium",
          timeStyle: "short"
        }
      ).format(fecha);
    } catch (_) {
      return fecha.toLocaleString();
    }
  }

  function normalizarMetodoEntrega(valor) {
    const metodo =
      String(valor || "")
        .trim()
        .toLowerCase();

    if (!metodo) {
      return "-";
    }

    const nombres = {
      domicilio: "Entrega a domicilio",
      envio: "Entrega a domicilio",
      courier: "Entrega por courier",
      retiro: "Retiro acordado"
    };

    return nombres[metodo]
      || String(valor);
  }

  function urlHttpsSegura(valor) {
    const texto =
      String(valor || "").trim();

    if (!texto) {
      return "";
    }

    try {
      const url =
        new URL(texto);

      return url.protocol === "https:"
        ? url.href
        : "";
    } catch (_) {
      return "";
    }
  }

  function mostrarToast(mensaje) {
    if (!toastConfirmacion) {
      return;
    }

    clearTimeout(toastTimer);

    toastConfirmacion.textContent =
      mensaje;

    toastConfirmacion.classList.add(
      "activo"
    );

    toastTimer =
      setTimeout(
        () => {
          toastConfirmacion
            .classList.remove(
              "activo"
            );
        },
        2800
      );
  }

  // ==========================================
  // INICIAR
  // ==========================================

  cargarPedido();

})();
