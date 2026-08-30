// @ts-nocheck

// ==========================================================
// SIXTEEN ADMIN
// FIREBASE AUTH + FIRESTORE + CLOUDINARY
// PRODUCTOS + PEDIDOS + INVENTARIO + EXPERIENCE 3D
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

  // ========================================================
  // CONFIGURACIÓN FIREBASE
  // ========================================================

  const firebaseConfig = {
    apiKey: "AIzaSyBFLPbBQPZy4ILeBRZ_kELi7KizlR1hgJo",
    authDomain: "urbanx-92e74.firebaseapp.com",
    projectId: "urbanx-92e74",
    storageBucket: "urbanx-92e74.firebasestorage.app",
    messagingSenderId: "830520272633",
    appId: "1:830520272633:web:ce7f2bf7abc8f86fec6428"
  };

  // ========================================================
  // CLOUDINARY
  // Los nombres técnicos anteriores se conservan para no
  // romper la integración existente.
  // ========================================================

  const CLOUDINARY_CLOUD_NAME = "m7gdr5hk";
  const CLOUDINARY_UPLOAD_PRESET = "urbanx_productos";
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  // ========================================================
  // FIREBASE
  // ========================================================

  if (typeof firebase === "undefined") {
    alert("Firebase no se pudo cargar.");
    return;
  }

  // ========================================================
  // FIREBASE · SESIÓN ADMIN AISLADA
  // ========================================================
  //
  // El panel administrativo usa una app Firebase con nombre
  // propio. Así puede coexistir con una sesión de cliente
  // abierta en el mismo navegador sin heredar su usuario.
  // ========================================================

  const ADMIN_APP_NAME =
    "sixteen-admin";


  let adminApp =
    firebase.apps.find(
      function (app) {

        return app.name ===
          ADMIN_APP_NAME;
      }
    );


  if (!adminApp) {

    adminApp =
      firebase.initializeApp(
        firebaseConfig,
        ADMIN_APP_NAME
      );
  }


  const auth =
    firebase.auth(
      adminApp
    );


  const db =
    firebase.firestore(
      adminApp
    );


  const FieldValue =
    firebase.firestore.FieldValue;

  // ========================================================
  // ELEMENTOS GENERALES
  // ========================================================

  const adminShell = document.getElementById("adminShell");
  const adminAccessState = document.getElementById("adminAccessState");
  const adminAccessTitle = document.getElementById("adminAccessTitle");
  const adminAccessMessage = document.getElementById("adminAccessMessage");
  const adminAccessRetry = document.getElementById("adminAccessRetry");
  const adminEmail = document.getElementById("adminEmail");
  const adminAvatar = document.getElementById("adminAvatar");
  const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");

  const kpiProductos = document.getElementById("kpiProductos");
  const kpiPedidos = document.getElementById("kpiPedidos");
  const kpiStock = document.getElementById("kpiStock");
  const kpiVentas = document.getElementById("kpiVentas");

  // ========================================================
  // DASHBOARD / REPORTES · ELEMENTOS
  // ========================================================

  const reportePeriodoDias = document.getElementById("reportePeriodoDias");
  const exportarReporteBtn = document.getElementById("exportarReporteBtn");

  const reporteVentaHoy = document.getElementById("reporteVentaHoy");
  const reportePedidosHoy = document.getElementById("reportePedidosHoy");
  const reporteVentaSemana = document.getElementById("reporteVentaSemana");
  const reportePedidosSemana = document.getElementById("reportePedidosSemana");
  const reporteVentaMes = document.getElementById("reporteVentaMes");
  const reportePedidosMes = document.getElementById("reportePedidosMes");
  const reporteTicketPromedio = document.getElementById("reporteTicketPromedio");
  const reporteVentasValidas = document.getElementById("reporteVentasValidas");
  const reporteUnidadesVendidas = document.getElementById("reporteUnidadesVendidas");
  const reporteClientesRecurrentes = document.getElementById("reporteClientesRecurrentes");
  const reporteClientesTotal = document.getElementById("reporteClientesTotal");
  const reportePeriodoTotal = document.getElementById("reportePeriodoTotal");

  const ventasChart = document.getElementById("ventasChart");
  const pedidosEstadoChart = document.getElementById("pedidosEstadoChart");
  const metodosPagoChart = document.getElementById("metodosPagoChart");
  const topProductosBody = document.getElementById("topProductosBody");
  const topClientesBody = document.getElementById("topClientesBody");

  // ========================================================
  // CUPONES Y ENVÍOS · ELEMENTOS
  // ========================================================

  const nuevoCuponBtn = document.getElementById("nuevoCuponBtn");
  const cuponBuscar = document.getElementById("cuponBuscar");
  const cuponFiltroEstado = document.getElementById("cuponFiltroEstado");
  const cuponesAdminBody = document.getElementById("cuponesAdminBody");
  const cuponesKpiTotal = document.getElementById("cuponesKpiTotal");
  const cuponesKpiActivos = document.getElementById("cuponesKpiActivos");
  const cuponesKpiUsos = document.getElementById("cuponesKpiUsos");

  const cuponModal = document.getElementById("cuponModal");
  const cuponModalTitulo = document.getElementById("cuponModalTitulo");
  const cerrarCuponModal = document.getElementById("cerrarCuponModal");
  const cancelarCuponBtn = document.getElementById("cancelarCuponBtn");
  const cuponForm = document.getElementById("cuponForm");
  const cuponCodigo = document.getElementById("cuponCodigo");
  const cuponPorcentaje = document.getElementById("cuponPorcentaje");
  const cuponFechaInicio = document.getElementById("cuponFechaInicio");
  const cuponFechaFin = document.getElementById("cuponFechaFin");
  const cuponLimiteUsos = document.getElementById("cuponLimiteUsos");
  const cuponActivo = document.getElementById("cuponActivo");
  const cuponMensaje = document.getElementById("cuponMensaje");
  const guardarCuponBtn = document.getElementById("guardarCuponBtn");

  const restaurarTarifasBtn = document.getElementById("restaurarTarifasBtn");
  const enviosAdminBody = document.getElementById("enviosAdminBody");
  const enviosKpiTotal = document.getElementById("enviosKpiTotal");
  const enviosKpiActivos = document.getElementById("enviosKpiActivos");
  const enviosKpiPromedio = document.getElementById("enviosKpiPromedio");

  const envioModal = document.getElementById("envioModal");
  const cerrarEnvioModal = document.getElementById("cerrarEnvioModal");
  const cancelarEnvioBtn = document.getElementById("cancelarEnvioBtn");
  const envioForm = document.getElementById("envioForm");
  const envioModalProvincia = document.getElementById("envioModalProvincia");
  const envioTarifa = document.getElementById("envioTarifa");
  const envioActivo = document.getElementById("envioActivo");
  const envioMensaje = document.getElementById("envioMensaje");
  const guardarEnvioBtn = document.getElementById("guardarEnvioBtn");

  const productosAdminBody = document.getElementById("productosAdminBody");
  const pedidosAdminBody = document.getElementById("pedidosAdminBody");
  const inventarioAdminBody = document.getElementById("inventarioAdminBody");
  const sixteen3dAdminBody = document.getElementById("sixteen3dAdminBody");

  // ========================================================
  // INVENTARIO AVANZADO · ELEMENTOS
  // ========================================================

  const inventarioKpiUnidades = document.getElementById("inventarioKpiUnidades");
  const inventarioKpiBajo = document.getElementById("inventarioKpiBajo");
  const inventarioKpiAgotados = document.getElementById("inventarioKpiAgotados");
  const inventarioKpiValor = document.getElementById("inventarioKpiValor");

  const inventarioBuscar = document.getElementById("inventarioBuscar");
  const inventarioFiltroCategoria = document.getElementById("inventarioFiltroCategoria");
  const inventarioFiltroEstado = document.getElementById("inventarioFiltroEstado");
  const limpiarFiltrosInventarioBtn = document.getElementById("limpiarFiltrosInventarioBtn");
  const inventarioResultadoTexto = document.getElementById("inventarioResultadoTexto");

  const movimientosInventarioBody = document.getElementById("movimientosInventarioBody");
  const movimientoBuscar = document.getElementById("movimientoBuscar");
  const movimientoFiltroTipo = document.getElementById("movimientoFiltroTipo");
  const movimientoFechaDesde = document.getElementById("movimientoFechaDesde");
  const movimientoFechaHasta = document.getElementById("movimientoFechaHasta");
  const limpiarFiltrosMovimientosBtn = document.getElementById("limpiarFiltrosMovimientosBtn");
  const exportarInventarioBtn = document.getElementById("exportarInventarioBtn");
  const movimientosResultadoTexto = document.getElementById("movimientosResultadoTexto");

  const inventarioAjusteModal = document.getElementById("inventarioAjusteModal");
  const cerrarInventarioModal = document.getElementById("cerrarInventarioModal");
  const cancelarInventarioAjusteBtn = document.getElementById("cancelarInventarioAjusteBtn");
  const inventarioAjusteForm = document.getElementById("inventarioAjusteForm");
  const inventarioModalProducto = document.getElementById("inventarioModalProducto");
  const inventarioModalStock = document.getElementById("inventarioModalStock");
  const inventarioModalMinimoActual = document.getElementById("inventarioModalMinimoActual");
  const inventarioOperacion = document.getElementById("inventarioOperacion");
  const inventarioCantidad = document.getElementById("inventarioCantidad");
  const inventarioStockMinimo = document.getElementById("inventarioStockMinimo");
  const inventarioMotivo = document.getElementById("inventarioMotivo");
  const inventarioAjusteMensaje = document.getElementById("inventarioAjusteMensaje");
  const guardarInventarioAjusteBtn = document.getElementById("guardarInventarioAjusteBtn");

  // ========================================================
  // PRODUCTO · ELEMENTOS
  // ========================================================

  const nuevoProductoBtn = document.getElementById("nuevoProductoBtn");
  const productoModal = document.getElementById("productoAdminModal");
  const productoForm = document.getElementById("productoAdminForm");
  const productoModalTitulo = document.getElementById("productoModalTitulo");
  const cerrarProductoModal = document.getElementById("cerrarProductoModal");
  const cancelarProductoBtn = document.getElementById("cancelarProductoBtn");
  const guardarProductoBtn = document.getElementById("guardarProductoBtn");
  const productoMensaje = document.getElementById("productoAdminMensaje");

  const productoImagenArchivo = document.getElementById("productoImagenArchivo");
  const seleccionarImagenBtn = document.getElementById("seleccionarImagenBtn");
  const quitarImagenBtn = document.getElementById("quitarImagenBtn");
  const productoImagenPreview = document.getElementById("productoImagenPreview");
  const productoImagenPlaceholder = document.getElementById("productoImagenPlaceholder");
  const productoImagenNombre = document.getElementById("productoImagenNombre");
  const productoImagenActual = document.getElementById("productoImagenActual");
  const productoImagenPublicId = document.getElementById("productoImagenPublicId");

  const productoUsaVariantes = document.getElementById("productoUsaVariantes");
  const agregarVarianteProductoBtn = document.getElementById("agregarVarianteProductoBtn");
  const productoVariantesLista = document.getElementById("productoVariantesLista");
  const productoVariantesResumen = document.getElementById("productoVariantesResumen");
  const productoVariantesStockTotal = document.getElementById("productoVariantesStockTotal");
  const productoVariantesConteo = document.getElementById("productoVariantesConteo");
  const productoVariantesAyuda = document.getElementById("productoVariantesAyuda");

  const inventarioVarianteField = document.getElementById("inventarioVarianteField");
  const inventarioVariante = document.getElementById("inventarioVariante");

  // ========================================================
  // PEDIDO · ELEMENTOS
  // ========================================================

  const pedidoModal = document.getElementById("pedidoAdminModal");
  const pedidoModalNumero = document.getElementById("pedidoModalNumero");
  const cerrarPedidoModal = document.getElementById("cerrarPedidoModal");
  const pedidoEstadoSelect = document.getElementById("pedidoEstadoSelect");
  const pedidoEstadoPagoSelect = document.getElementById("pedidoEstadoPagoSelect");
  const guardarEstadoPedidoBtn = document.getElementById("guardarEstadoPedidoBtn");
  const pedidoAdminMensaje = document.getElementById("pedidoAdminMensaje");

  const pedidoClienteNombre = document.getElementById("pedidoClienteNombre");
  const pedidoClienteIdentificacion = document.getElementById("pedidoClienteIdentificacion");
  const pedidoClienteEmail = document.getElementById("pedidoClienteEmail");
  const pedidoClienteTelefono = document.getElementById("pedidoClienteTelefono");

  const pedidoEntregaCiudad = document.getElementById("pedidoEntregaCiudad");
  const pedidoEntregaProvincia = document.getElementById("pedidoEntregaProvincia");
  const pedidoEntregaDireccion = document.getElementById("pedidoEntregaDireccion");
  const pedidoEntregaReferencia = document.getElementById("pedidoEntregaReferencia");

  const pedidoMetodoPago = document.getElementById("pedidoMetodoPago");
  const pedidoEstadoPago = document.getElementById("pedidoEstadoPago");
  const pedidoFecha = document.getElementById("pedidoFecha");
  const pedidoEstadoInventario = document.getElementById("pedidoEstadoInventario");

  const pedidoProductosLista = document.getElementById("pedidoProductosLista");
  const pedidoSubtotal = document.getElementById("pedidoSubtotal");
  const pedidoDescuento = document.getElementById("pedidoDescuento");
  const pedidoEnvio = document.getElementById("pedidoEnvio");
  const pedidoTotal = document.getElementById("pedidoTotal");

  // ========================================================
  // PEDIDOS · BÚSQUEDA Y FILTROS
  // ========================================================

  const pedidoBuscar = document.getElementById("pedidoBuscar");
  const pedidoFiltroEstado = document.getElementById("pedidoFiltroEstado");
  const pedidoFiltroPago = document.getElementById("pedidoFiltroPago");
  const pedidoFechaDesde = document.getElementById("pedidoFechaDesde");
  const pedidoFechaHasta = document.getElementById("pedidoFechaHasta");
  const limpiarFiltrosPedidosBtn = document.getElementById("limpiarFiltrosPedidosBtn");
  const exportarPedidosBtn = document.getElementById("exportarPedidosBtn");

  const pedidosConteoTotal = document.getElementById("pedidosConteoTotal");
  const pedidosConteoPendientes = document.getElementById("pedidosConteoPendientes");
  const pedidosConteoProceso = document.getElementById("pedidosConteoProceso");
  const pedidosConteoEntregados = document.getElementById("pedidosConteoEntregados");
  const pedidosPendientesBadge = document.getElementById("pedidosPendientesBadge");
  const pedidosResultadoTexto = document.getElementById("pedidosResultadoTexto");

  // ========================================================
  // CLIENTES · ELEMENTOS
  // ========================================================

  const clientesAdminBody = document.getElementById("clientesAdminBody");
  const clienteBuscar = document.getElementById("clienteBuscar");
  const clienteFiltroTipo = document.getElementById("clienteFiltroTipo");
  const clienteOrden = document.getElementById("clienteOrden");
  const limpiarFiltrosClientesBtn = document.getElementById("limpiarFiltrosClientesBtn");
  const exportarClientesBtn = document.getElementById("exportarClientesBtn");
  const clientesResultadoTexto = document.getElementById("clientesResultadoTexto");

  const clientesKpiTotal = document.getElementById("clientesKpiTotal");
  const clientesKpiRecurrentes = document.getElementById("clientesKpiRecurrentes");
  const clientesKpiVentas = document.getElementById("clientesKpiVentas");
  const clientesKpiTicket = document.getElementById("clientesKpiTicket");
  const clientesBadge = document.getElementById("clientesBadge");

  const clienteAdminModal = document.getElementById("clienteAdminModal");
  const cerrarClienteModal = document.getElementById("cerrarClienteModal");
  const clienteModalNombre = document.getElementById("clienteModalNombre");
  const clienteModalPedidos = document.getElementById("clienteModalPedidos");
  const clienteModalComprasValidas = document.getElementById("clienteModalComprasValidas");
  const clienteModalTotal = document.getElementById("clienteModalTotal");
  const clienteModalTicket = document.getElementById("clienteModalTicket");
  const clienteModalIdentificacion = document.getElementById("clienteModalIdentificacion");
  const clienteModalEmail = document.getElementById("clienteModalEmail");
  const clienteModalTelefono = document.getElementById("clienteModalTelefono");
  const clienteModalProvincia = document.getElementById("clienteModalProvincia");
  const clienteModalCiudad = document.getElementById("clienteModalCiudad");
  const clienteModalDireccion = document.getElementById("clienteModalDireccion");
  const clienteModalUltimoPedido = document.getElementById("clienteModalUltimoPedido");
  const clienteModalUltimaCompra = document.getElementById("clienteModalUltimaCompra");
  const clienteModalEstado = document.getElementById("clienteModalEstado");
  const clienteHistorialBody = document.getElementById("clienteHistorialBody");

  // ========================================================
  // ESTADO DE LA APP
  // ========================================================

  let usuarioActual = null;

  let productosActuales = [];
  let pedidosActuales = [];
  let pedidosFiltradosActuales = [];

  let productosInventarioFiltrados = [];
  let movimientosInventarioActuales = [];
  let movimientosInventarioFiltrados = [];

  let clientesActuales = [];
  let clientesFiltrados = [];
  let clienteActualClave = null;

  let cuponesActuales = [];
  let cuponesFiltrados = [];
  let cuponEditandoId = null;

  let enviosActuales = [];
  let envioEditandoId = null;
  let sembrandoEnvios = false;

  let unsubscribeProductos = null;
  let unsubscribePedidos = null;
  let unsubscribeInventario = null;
  let unsubscribeCupones = null;
  let unsubscribeEnvios = null;

  let productoEditandoId = null;
  let pedidoEditandoId = null;
  let productoAjusteInventarioId = null;

  let imagenArchivoSeleccionado = null;
  let imagenPreviewObjectUrl = null;
  let imagenEliminada = false;

  let logoutEnProceso = false;


  // ========================================================
  // PASO 15 · FUENTE DE DATOS PARA ANALÍTICA
  //
  // Se reutilizan los arrays que el Admin YA carga.
  // No se crean listeners extra ni lecturas duplicadas.
  // ========================================================

  window.SIXTEEN_ADMIN_ANALYTICS_SOURCE = {

    getPedidos:
      function () {

        return pedidosActuales.slice();
      },

    getProductos:
      function () {

        return productosActuales.slice();
      },

    getClientes:
      function () {

        return clientesActuales.slice();
      }

  };


  function emitirActualizacionAnalitica() {

    window.dispatchEvent(
      new CustomEvent(
        "sixteen:admin-data-updated"
      )
    );
  }


  // ========================================================
  // PASO 16E · FUENTE LOCAL DE BACKUPS
  // ========================================================

  window.SIXTEEN_ADMIN_BACKUP_SOURCE = {
    getProductos: function () { return productosActuales.slice(); },
    getPedidos: function () { return pedidosActuales.slice(); },
    getClientes: function () { return clientesActuales.slice(); },
    getInventario: function () { return movimientosInventarioActuales.slice(); },
    getCupones: function () { return cuponesActuales.slice(); },
    getEnvios: function () { return enviosActuales.slice(); }
  };


  function emitirActualizacionBackup() {

    window.dispatchEvent(
      new CustomEvent(
        "sixteen:backup-data-updated"
      )
    );
  }


  document.body.classList.remove("modal-open");

  // ========================================================
  // AUTENTICACIÓN + AUTORIZACIÓN ADMIN
  // ========================================================
  // La sesión por sí sola no concede acceso. Antes de mostrar
  // el panel se realiza una lectura protegida por las reglas
  // de Firestore. Un usuario autenticado sin permiso admin
  // recibe permission-denied y nunca ve el panel.

  let validandoAccesoAdmin = false;
  let listenersAdminIniciados = false;


  function mostrarEstadoAcceso(titulo, mensaje, reintentar) {

    if (adminAccessTitle) {
      adminAccessTitle.textContent = titulo || "VERIFICANDO ACCESO";
    }

    if (adminAccessMessage) {
      adminAccessMessage.textContent = mensaje || "";
    }

    if (adminAccessRetry) {
      adminAccessRetry.hidden = !reintentar;
    }

    if (adminAccessState) {
      adminAccessState.hidden = false;
    }
  }


  async function verificarPermisoAdmin(user) {

    if (!user) {
      return false;
    }

    try {

      await db
        .collection("configuracion_sri")
        .doc("__admin_access_check__")
        .get({ source: "server" });

      return true;

    } catch (error) {

      if (
        error &&
        error.code === "permission-denied"
      ) {
        return false;
      }

      throw error;
    }
  }


  function iniciarPanelAutorizado(user) {

    usuarioActual = user;

    if (adminEmail) {
      adminEmail.textContent =
        user.email || "Administrador";
    }

    if (adminAvatar) {
      adminAvatar.textContent =
        (user.email || "S")
          .charAt(0)
          .toUpperCase();
    }

    if (adminAccessState) {
      adminAccessState.hidden = true;
    }

    if (adminShell) {
      adminShell.style.visibility = "visible";
    }

    if (listenersAdminIniciados) {
      return;
    }

    listenersAdminIniciados = true;

    escucharProductos();
    escucharPedidos();
    escucharMovimientosInventario();
    escucharCupones();
    escucharEnvios();
  }


  async function procesarSesionAdmin(user) {

    if (validandoAccesoAdmin) {
      return;
    }

    if (!user) {
      const motivo = logoutEnProceso ? "logout" : "session";

      window.location.replace(
        "./login.html?" +
        motivo +
        "=" +
        Date.now()
      );

      return;
    }

    validandoAccesoAdmin = true;

    mostrarEstadoAcceso(
      "VERIFICANDO ACCESO",
      "Comprobando tu sesión y permisos administrativos...",
      false
    );

    try {

      const autorizado =
        await verificarPermisoAdmin(user);

      if (!autorizado) {

        detenerListeners();
        listenersAdminIniciados = false;

        try {
          await auth.signOut();
        } catch (_) {}

        window.location.replace(
          "./login.html?denied=" +
          Date.now()
        );

        return;
      }

      iniciarPanelAutorizado(user);

    } catch (error) {

      console.error("Admin access:", error);

      mostrarEstadoAcceso(
        "NO PUDIMOS VERIFICAR EL ACCESO",
        "Revisa tu conexión e inténtalo nuevamente. El panel permanecerá bloqueado hasta verificar tus permisos.",
        true
      );

    } finally {
      validandoAccesoAdmin = false;
    }
  }


  adminAccessRetry?.addEventListener(
    "click",
    function () {
      procesarSesionAdmin(
        auth.currentUser
      );
    }
  );


  auth.onAuthStateChanged(
    function (user) {
      procesarSesionAdmin(user);
    },

    function (error) {
      console.error("Auth:", error);

      mostrarEstadoAcceso(
        "ERROR DE SESIÓN",
        "No fue posible comprobar la sesión administrativa.",
        true
      );
    }
  );

  // ========================================================
  // CERRAR SESIÓN
  // ========================================================

  cerrarSesionBtn?.addEventListener(
    "click",
    async function () {

      if (logoutEnProceso) {
        return;
      }

      logoutEnProceso = true;
      cerrarSesionBtn.disabled = true;
      cerrarSesionBtn.textContent = "CERRANDO...";

      try {

        detenerListeners();
        listenersAdminIniciados = false;

        await auth.signOut();

        window.location.replace(
          "./login.html?logout=" +
          Date.now()
        );

      } catch (error) {

        console.error("Logout:", error);

        logoutEnProceso = false;
        cerrarSesionBtn.disabled = false;
        cerrarSesionBtn.textContent = "CERRAR SESIÓN";

        alert("No fue posible cerrar la sesión.");
      }
    }
  );

  // ========================================================
  // FIRESTORE · PRODUCTOS
  // ========================================================

  function escucharProductos() {

    if (unsubscribeProductos) {
      unsubscribeProductos();
    }

    unsubscribeProductos =
      db
        .collection("productos")
        .onSnapshot(
          function (snapshot) {

            const productos = [];

            snapshot.forEach(
              function (doc) {
                productos.push({
                  id: doc.id,
                  ...doc.data()
                });
              }
            );

            productos.sort(
              function (a, b) {
                return fechaMillis(b.creadoEn) -
                  fechaMillis(a.creadoEn);
              }
            );

            productosActuales = productos;

            renderProductos(productos);
            actualizarCategoriasInventario();
            aplicarFiltrosInventario();
            actualizarResumenInventario();
            renderSixteen3d(productos);
            actualizarKPIs();
            actualizarReportes();
            emitirActualizacionAnalitica();
            emitirActualizacionBackup();
          },

          function (error) {
            console.error("Firestore productos:", error);

            if (productosAdminBody) {
              productosAdminBody.innerHTML = `
                <tr>
                  <td colspan="7">
                    No fue posible cargar los productos.
                  </td>
                </tr>
              `;
            }

            if (inventarioAdminBody) {
              inventarioAdminBody.innerHTML = `
                <tr>
                  <td colspan="7">
                    No fue posible cargar el inventario.
                  </td>
                </tr>
              `;
            }
          }
        );
  }

  // ========================================================
  // RENDER PRODUCTOS
  // ========================================================

  function renderProductos(productos) {

    if (!productosAdminBody) {
      return;
    }

    if (!productos.length) {
      productosAdminBody.innerHTML = `
        <tr>
          <td colspan="7">
            Todavía no existen productos.
          </td>
        </tr>
      `;
      return;
    }

    productosAdminBody.innerHTML = "";

    productos.forEach(
      function (producto) {

        const estado =
          producto.estado || "Activo";

        const fila =
          document.createElement("tr");

        fila.innerHTML = `
          <td>
            <strong class="admin-code">
              ${escapar(producto.codigo || "-")}
            </strong>
          </td>

          <td>
            <div class="admin-product-cell">
              ${
                producto.imagen
                  ? `
                    <img
                      src="${escaparAtributo(producto.imagen)}"
                      alt="${escaparAtributo(producto.nombre || "Producto")}"
                    >
                  `
                  : `
                    <span class="admin-product-fallback">
                      XVI
                    </span>
                  `
              }

              <strong>
                ${escapar(producto.nombre || "-")}
              </strong>
            </div>
          </td>

          <td>
            ${escapar(producto.categoria || "-")}
          </td>

          <td>
            ${dinero(producto.precio)}
          </td>

          <td>
            ${numero(producto.stock)}
          </td>

          <td>
            <span
              class="
                admin-table-status
                ${
                  estado === "Inactivo"
                    ? "inactivo"
                    : "activo"
                }
              "
            >
              ${escapar(estado)}
            </span>
          </td>

          <td>
            <div class="admin-actions">

              <button
                type="button"
                data-action="editar"
                data-id="${producto.id}"
              >
                EDITAR
              </button>

              <button
                type="button"
                class="danger"
                data-action="eliminar"
                data-id="${producto.id}"
              >
                ELIMINAR
              </button>

            </div>
          </td>
        `;

        productosAdminBody.appendChild(fila);
      }
    );
  }

  // ========================================================
  // INVENTARIO AVANZADO
  // ========================================================

  function aplicarFiltrosInventario() {

    const busqueda =
      normalizarTexto(
        inventarioBuscar?.value || ""
      );

    const categoria =
      String(
        inventarioFiltroCategoria?.value || ""
      ).trim();

    const estado =
      String(
        inventarioFiltroEstado?.value || ""
      ).trim();

    productosInventarioFiltrados =
      productosActuales.filter(
        function (producto) {

          if (
            categoria &&
            producto.categoria !== categoria
          ) {
            return false;
          }

          const estadoProducto =
            estadoInventarioProducto(
              producto
            );

          if (
            estado &&
            estadoProducto !== estado
          ) {
            return false;
          }

          if (busqueda) {

            const texto =
              normalizarTexto(
                [
                  producto.codigo,
                  producto.nombre,
                  producto.categoria
                ]
                  .filter(Boolean)
                  .join(" ")
              );

            if (
              !texto.includes(
                busqueda
              )
            ) {
              return false;
            }
          }

          return true;
        }
      );

    renderInventario(
      productosInventarioFiltrados
    );

    actualizarTextoInventario();
  }


  function renderInventario(productos) {

    if (!inventarioAdminBody) {
      return;
    }

    if (!productos.length) {

      inventarioAdminBody.innerHTML = `
        <tr>
          <td colspan="7">
            No existen productos que coincidan con los filtros.
          </td>
        </tr>
      `;

      return;
    }

    inventarioAdminBody.innerHTML =
      "";

    [...productos]
      .sort(
        function (a, b) {

          return numero(a.stock) -
            numero(b.stock);
        }
      )
      .forEach(
        function (producto) {

          const stock =
            Math.max(
              0,
              Math.floor(
                numero(
                  producto.stock
                )
              )
            );

          const minimo =
            obtenerStockMinimo(
              producto
            );

          const estado =
            estadoInventarioProducto(
              producto
            );

          const textoEstado =
            textoEstadoStock(
              estado
            );

          const fila =
            document.createElement(
              "tr"
            );

          fila.innerHTML = `
            <td>
              <strong class="admin-code">
                ${escapar(producto.codigo || "-")}
              </strong>
            </td>

            <td>
              <div class="admin-product-cell">

                ${
                  producto.imagen
                    ? `
                      <img
                        src="${escaparAtributo(producto.imagen)}"
                        alt="${escaparAtributo(producto.nombre || "Producto")}"
                      >
                    `
                    : `
                      <span class="admin-product-fallback">
                        XVI
                      </span>
                    `
                }

                <strong>
                  ${escapar(producto.nombre || "-")}
                </strong>

              </div>
            </td>

            <td>
              ${escapar(producto.categoria || "-")}
            </td>

            <td>
              <strong class="inventario-stock-numero">
                ${stock}
              </strong>
            </td>

            <td>
              ${minimo}
            </td>

            <td>
              <span
                class="
                  inventario-estado-badge
                  ${estado}
                "
              >
                ${textoEstado}
              </span>
            </td>

            <td>
              <button
                type="button"
                class="admin-view-btn"
                data-inventario-ajuste="${producto.id}"
              >
                AJUSTAR
              </button>
            </td>
          `;

          inventarioAdminBody.appendChild(
            fila
          );
        }
      );
  }


  function actualizarResumenInventario() {

    const unidades =
      productosActuales.reduce(
        function (total, producto) {

          return total +
            Math.max(
              0,
              numero(
                producto.stock
              )
            );
        },
        0
      );

    const bajos =
      productosActuales.filter(
        function (producto) {
          return estadoInventarioProducto(producto) === "bajo";
        }
      ).length;

    const agotados =
      productosActuales.filter(
        function (producto) {
          return estadoInventarioProducto(producto) === "agotado";
        }
      ).length;

    const valor =
      productosActuales.reduce(
        function (total, producto) {

          return total +
            (
              Math.max(
                0,
                numero(
                  producto.stock
                )
              ) *
              Math.max(
                0,
                numero(
                  producto.precio
                )
              )
            );
        },
        0
      );

    if (inventarioKpiUnidades) {
      inventarioKpiUnidades.textContent =
        Math.floor(unidades);
    }

    if (inventarioKpiBajo) {
      inventarioKpiBajo.textContent =
        bajos;
    }

    if (inventarioKpiAgotados) {
      inventarioKpiAgotados.textContent =
        agotados;
    }

    if (inventarioKpiValor) {
      inventarioKpiValor.textContent =
        dinero(valor);
    }
  }


  function actualizarCategoriasInventario() {

    if (!inventarioFiltroCategoria) {
      return;
    }

    const valorActual =
      inventarioFiltroCategoria.value;

    const categorias =
      Array.from(
        new Set(
          productosActuales
            .map(
              function (producto) {
                return String(
                  producto.categoria || ""
                ).trim();
              }
            )
            .filter(Boolean)
        )
      )
        .sort(
          function (a, b) {
            return a.localeCompare(
              b,
              "es"
            );
          }
        );

    inventarioFiltroCategoria.innerHTML =
      '<option value="">Todas</option>';

    categorias.forEach(
      function (categoria) {

        const option =
          document.createElement(
            "option"
          );

        option.value = categoria;
        option.textContent = categoria;

        inventarioFiltroCategoria.appendChild(
          option
        );
      }
    );

    if (
      categorias.includes(
        valorActual
      )
    ) {
      inventarioFiltroCategoria.value =
        valorActual;
    }
  }


  function actualizarTextoInventario() {

    if (!inventarioResultadoTexto) {
      return;
    }

    const visibles =
      productosInventarioFiltrados.length;

    const total =
      productosActuales.length;

    if (visibles === total) {

      inventarioResultadoTexto.textContent =
        total === 1
          ? "Mostrando 1 producto."
          : `Mostrando ${total} productos.`;

      return;
    }

    inventarioResultadoTexto.textContent =
      `Mostrando ${visibles} de ${total} productos.`;
  }


  function limpiarFiltrosInventario() {

    if (inventarioBuscar) {
      inventarioBuscar.value = "";
    }

    if (inventarioFiltroCategoria) {
      inventarioFiltroCategoria.value = "";
    }

    if (inventarioFiltroEstado) {
      inventarioFiltroEstado.value = "";
    }

    aplicarFiltrosInventario();
  }


  [
    inventarioBuscar,
    inventarioFiltroCategoria,
    inventarioFiltroEstado
  ]
    .filter(Boolean)
    .forEach(
      function (elemento) {

        const evento =
          elemento === inventarioBuscar
            ? "input"
            : "change";

        elemento.addEventListener(
          evento,
          aplicarFiltrosInventario
        );
      }
    );


  limpiarFiltrosInventarioBtn
    ?.addEventListener(
      "click",
      limpiarFiltrosInventario
    );


  inventarioAdminBody
    ?.addEventListener(
      "click",
      function (event) {

        const boton =
          event.target.closest(
            "button[data-inventario-ajuste]"
          );

        if (!boton) {
          return;
        }

        abrirAjusteInventario(
          boton.dataset.inventarioAjuste
        );
      }
    );


  function obtenerStockMinimo(producto) {

    const valor =
      Number(
        producto.stockMinimo
      );

    return Number.isFinite(valor)
      ? Math.max(
          0,
          Math.floor(valor)
        )
      : 5;
  }


  function estadoInventarioProducto(producto) {

    const stock =
      Math.max(
        0,
        Math.floor(
          numero(
            producto.stock
          )
        )
      );

    const minimo =
      obtenerStockMinimo(
        producto
      );

    if (stock <= 0) {
      return "agotado";
    }

    if (stock <= minimo) {
      return "bajo";
    }

    return "disponible";
  }


  function textoEstadoStock(estado) {

    const textos = {
      disponible: "Disponible",
      bajo: "Stock bajo",
      agotado: "Agotado"
    };

    return textos[estado] ||
      "Disponible";
  }


  // ========================================================
  // HISTORIAL DE MOVIMIENTOS
  // ========================================================

  function escucharMovimientosInventario() {

    if (unsubscribeInventario) {
      unsubscribeInventario();
    }

    unsubscribeInventario =
      db
        .collection("inventario")
        .onSnapshot(
          function (snapshot) {

            const movimientos = [];

            snapshot.forEach(
              function (doc) {

                movimientos.push({
                  id: doc.id,
                  ...doc.data()
                });
              }
            );

            movimientos.sort(
              function (a, b) {

                return fechaMillis(
                  b.creadoEn
                ) -
                fechaMillis(
                  a.creadoEn
                );
              }
            );

            movimientosInventarioActuales =
              movimientos;

            aplicarFiltrosMovimientos();
            emitirActualizacionBackup();
          },

          function (error) {

            console.error(
              "Firestore inventario:",
              error
            );

            if (movimientosInventarioBody) {

              movimientosInventarioBody.innerHTML = `
                <tr>
                  <td colspan="8">
                    No fue posible cargar los movimientos.
                  </td>
                </tr>
              `;
            }
          }
        );
  }


  function aplicarFiltrosMovimientos() {

    const busqueda =
      normalizarTexto(
        movimientoBuscar?.value ||
        ""
      );

    const tipo =
      String(
        movimientoFiltroTipo?.value ||
        ""
      ).trim();

    const desde =
      crearFechaFiltro(
        movimientoFechaDesde?.value,
        false
      );

    const hasta =
      crearFechaFiltro(
        movimientoFechaHasta?.value,
        true
      );

    movimientosInventarioFiltrados =
      movimientosInventarioActuales.filter(
        function (movimiento) {

          if (
            tipo &&
            movimiento.tipo !== tipo
          ) {
            return false;
          }

          const fecha =
            fechaComoDate(
              movimiento.creadoEn
            );

          if (
            desde &&
            (
              !fecha ||
              fecha < desde
            )
          ) {
            return false;
          }

          if (
            hasta &&
            (
              !fecha ||
              fecha > hasta
            )
          ) {
            return false;
          }

          if (busqueda) {

            const texto =
              normalizarTexto(
                [
                  movimiento.codigo,
                  movimiento.nombre,
                  movimiento.pedidoNumero,
                  movimiento.motivo,
                  movimiento.usuarioEmail,
                  movimiento.tipo,
                  movimiento.origen
                ]
                  .filter(Boolean)
                  .join(" ")
              );

            if (
              !texto.includes(
                busqueda
              )
            ) {
              return false;
            }
          }

          return true;
        }
      );

    renderMovimientosInventario(
      movimientosInventarioFiltrados
    );

    actualizarTextoMovimientos();
  }


  function renderMovimientosInventario(movimientos) {

    if (!movimientosInventarioBody) {
      return;
    }

    if (!movimientos.length) {

      movimientosInventarioBody.innerHTML = `
        <tr>
          <td colspan="8">
            No existen movimientos que coincidan con los filtros.
          </td>
        </tr>
      `;

      return;
    }

    movimientosInventarioBody.innerHTML =
      "";

    movimientos.forEach(
      function (movimiento) {

        const fila =
          document.createElement(
            "tr"
          );

        fila.innerHTML = `
          <td>
            ${escapar(
              fechaLegible(
                movimiento.creadoEn
              )
            )}
          </td>

          <td>
            <span
              class="
                movimiento-tipo-badge
                ${claseMovimientoInventario(
                  movimiento.tipo
                )}
              "
            >
              ${escapar(
                textoMovimientoInventario(
                  movimiento.tipo
                )
              )}
            </span>
          </td>

          <td>
            <strong>
              ${escapar(
                movimiento.nombre ||
                movimiento.codigo ||
                "-"
              )}
            </strong>

            <small class="admin-table-secondary">
              ${escapar(
                movimiento.codigo ||
                ""
              )}
            </small>
          </td>

          <td>
            <strong>
              ${Math.max(
                0,
                numero(
                  movimiento.cantidad
                )
              )}
            </strong>
          </td>

          <td>
            ${numero(
              movimiento.stockAnterior
            )}
          </td>

          <td>
            <strong>
              ${numero(
                movimiento.stockNuevo
              )}
            </strong>
          </td>

          <td>
            ${
              movimiento.pedidoNumero
                ? `
                  <span>
                    ${escapar(
                      movimiento.pedidoNumero
                    )}
                  </span>
                `
                : `
                  <span>
                    ${escapar(
                      movimiento.motivo ||
                      movimiento.origen ||
                      "Manual"
                    )}
                  </span>
                `
            }
          </td>

          <td>
            ${escapar(
              movimiento.usuarioEmail ||
              "Administrador"
            )}
          </td>
        `;

        movimientosInventarioBody.appendChild(
          fila
        );
      }
    );
  }


  function textoMovimientoInventario(tipo) {

    const textos = {
      SALIDA_VENTA: "Salida venta",
      ENTRADA_CANCELACION: "Devolución",
      AJUSTE_ENTRADA: "Entrada manual",
      AJUSTE_SALIDA: "Salida manual",
      AJUSTE_EXACTO: "Ajuste exacto"
    };

    return textos[tipo] ||
      tipo ||
      "Movimiento";
  }


  function claseMovimientoInventario(tipo) {

    if (
      tipo === "SALIDA_VENTA" ||
      tipo === "AJUSTE_SALIDA"
    ) {
      return "salida";
    }

    if (
      tipo === "ENTRADA_CANCELACION" ||
      tipo === "AJUSTE_ENTRADA"
    ) {
      return "entrada";
    }

    return "ajuste";
  }


  function actualizarTextoMovimientos() {

    if (!movimientosResultadoTexto) {
      return;
    }

    const visibles =
      movimientosInventarioFiltrados.length;

    const total =
      movimientosInventarioActuales.length;

    if (visibles === total) {

      movimientosResultadoTexto.textContent =
        total === 1
          ? "Mostrando 1 movimiento."
          : `Mostrando ${total} movimientos.`;

      return;
    }

    movimientosResultadoTexto.textContent =
      `Mostrando ${visibles} de ${total} movimientos.`;
  }


  function limpiarFiltrosMovimientos() {

    if (movimientoBuscar) {
      movimientoBuscar.value = "";
    }

    if (movimientoFiltroTipo) {
      movimientoFiltroTipo.value = "";
    }

    if (movimientoFechaDesde) {
      movimientoFechaDesde.value = "";
    }

    if (movimientoFechaHasta) {
      movimientoFechaHasta.value = "";
    }

    aplicarFiltrosMovimientos();
  }


  [
    movimientoBuscar,
    movimientoFiltroTipo,
    movimientoFechaDesde,
    movimientoFechaHasta
  ]
    .filter(Boolean)
    .forEach(
      function (elemento) {

        const evento =
          elemento === movimientoBuscar
            ? "input"
            : "change";

        elemento.addEventListener(
          evento,
          aplicarFiltrosMovimientos
        );
      }
    );


  limpiarFiltrosMovimientosBtn
    ?.addEventListener(
      "click",
      limpiarFiltrosMovimientos
    );


  exportarInventarioBtn
    ?.addEventListener(
      "click",
      exportarMovimientosCSV
    );


  function exportarMovimientosCSV() {

    const movimientos =
      movimientosInventarioFiltrados.length ||
      filtrosMovimientosActivos()
        ? movimientosInventarioFiltrados
        : movimientosInventarioActuales;

    if (!movimientos.length) {

      alert(
        "No hay movimientos para exportar."
      );

      return;
    }

    const filas = [
      [
        "Fecha",
        "Tipo",
        "Codigo",
        "Producto",
        "Cantidad",
        "Stock anterior",
        "Stock nuevo",
        "Pedido",
        "Motivo",
        "Usuario"
      ]
    ];

    movimientos.forEach(
      function (movimiento) {

        filas.push([
          fechaLegible(
            movimiento.creadoEn
          ),
          textoMovimientoInventario(
            movimiento.tipo
          ),
          movimiento.codigo || "",
          movimiento.nombre || "",
          numero(
            movimiento.cantidad
          ),
          numero(
            movimiento.stockAnterior
          ),
          numero(
            movimiento.stockNuevo
          ),
          movimiento.pedidoNumero || "",
          movimiento.motivo || "",
          movimiento.usuarioEmail || ""
        ]);
      }
    );

    const contenido =
      filas
        .map(
          function (fila) {

            return fila
              .map(
                escaparCSV
              )
              .join(",");
          }
        )
        .join("\r\n");

    const blob =
      new Blob(
        [
          "\uFEFF" +
          contenido
        ],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const enlace =
      document.createElement(
        "a"
      );

    enlace.href = url;

    enlace.download =
      "sixteen-inventario-" +
      fechaArchivo() +
      ".csv";

    document.body.appendChild(
      enlace
    );

    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(
      url
    );
  }


  function filtrosMovimientosActivos() {

    return Boolean(
      String(
        movimientoBuscar?.value ||
        ""
      ).trim() ||
      movimientoFiltroTipo?.value ||
      movimientoFechaDesde?.value ||
      movimientoFechaHasta?.value
    );
  }


  // ========================================================
  // AJUSTE MANUAL DE INVENTARIO
  // ========================================================

  function abrirAjusteInventario(productoId) {

    const producto =
      productosActuales.find(
        function (item) {
          return item.id ===
            productoId;
        }
      );

    if (!producto) {

      alert(
        "El producto ya no está disponible."
      );

      return;
    }

    productoAjusteInventarioId =
      productoId;

    if (inventarioModalProducto) {
      inventarioModalProducto.textContent =
        (
          producto.codigo
            ? producto.codigo +
              " · "
            : ""
        ) +
        (
          producto.nombre ||
          "Producto"
        );
    }

    const stock =
      Math.max(
        0,
        Math.floor(
          numero(
            producto.stock
          )
        )
      );

    const minimo =
      obtenerStockMinimo(
        producto
      );

    if (inventarioModalStock) {
      inventarioModalStock.textContent =
        stock;
    }

    if (inventarioModalMinimoActual) {
      inventarioModalMinimoActual.textContent =
        minimo;
    }

    if (inventarioOperacion) {
      inventarioOperacion.value =
        "entrada";
    }

    if (inventarioCantidad) {
      inventarioCantidad.value =
        "1";
    }

    if (inventarioStockMinimo) {
      inventarioStockMinimo.value =
        String(minimo);
    }

    if (inventarioMotivo) {
      inventarioMotivo.value =
        "";
    }

    const variantesProducto =
      window.SIXTEEN_VARIANTS.variants(producto);

    if (inventarioVarianteField && inventarioVariante) {
      inventarioVariante.innerHTML = "";
      inventarioVarianteField.hidden = variantesProducto.length === 0;

      if (variantesProducto.length) {
        variantesProducto.forEach(variante=>{
          const option=document.createElement("option");
          option.value=variante.id;
          option.textContent=(variante.color||"Sin color")+" / "+(variante.talla||"Única")+" · "+variante.stock+" uds";
          inventarioVariante.appendChild(option);
        });

        const refrescar=()=>{
          const v=variantesProducto.find(x=>x.id===inventarioVariante.value);
          if(v&&inventarioModalStock)inventarioModalStock.textContent=String(v.stock);
        };

        inventarioVariante.onchange=refrescar;
        refrescar();
      } else {
        inventarioVariante.onchange=null;
      }
    }

    mostrarMensajeInventario("");

    inventarioAjusteModal.classList.add(
      "activo"
    );

    inventarioAjusteModal.setAttribute(
      "aria-hidden",
      "false"
    );

    actualizarBloqueoBody();
  }


  function cerrarAjusteInventario() {

    if (!inventarioAjusteModal) {
      return;
    }

    inventarioAjusteModal.classList.remove(
      "activo"
    );

    inventarioAjusteModal.setAttribute(
      "aria-hidden",
      "true"
    );

    productoAjusteInventarioId =
      null;

    actualizarBloqueoBody();
  }


  cerrarInventarioModal
    ?.addEventListener(
      "click",
      cerrarAjusteInventario
    );


  cancelarInventarioAjusteBtn
    ?.addEventListener(
      "click",
      cerrarAjusteInventario
    );


  inventarioAjusteModal
    ?.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          inventarioAjusteModal
        ) {
          cerrarAjusteInventario();
        }
      }
    );


  inventarioAjusteForm
    ?.addEventListener(
      "submit",
      guardarAjusteInventario
    );


  async function guardarAjusteInventario(event) {
    event.preventDefault();

    if(!productoAjusteInventarioId||!usuarioActual)return;

    const operacion=String(inventarioOperacion?.value||"");
    const cantidad=Math.max(0,Math.floor(numero(inventarioCantidad?.value)));
    const stockMinimo=Math.max(0,Math.floor(numero(inventarioStockMinimo?.value)));
    const motivo=String(inventarioMotivo?.value||"").trim();

    if(!motivo){
      mostrarMensajeInventario("Escribe el motivo del ajuste.",false);
      inventarioMotivo?.focus();
      return;
    }

    if(operacion!=="exacto"&&cantidad<=0){
      mostrarMensajeInventario("La cantidad debe ser mayor a 0.",false);
      return;
    }

    guardarInventarioAjusteBtn.disabled=true;
    guardarInventarioAjusteBtn.textContent="GUARDANDO...";
    mostrarMensajeInventario("Actualizando inventario...",true);

    try{
      const productoRef=db.collection("productos").doc(productoAjusteInventarioId);

      await db.runTransaction(async transaction=>{
        const snap=await transaction.get(productoRef);
        if(!snap.exists)throw new Error("El producto ya no existe.");

        const producto=snap.data()||{};
        const variantes=window.SIXTEEN_VARIANTS.variants(producto).map(v=>({...v}));
        const usaVariantes=variantes.length>0;

        let varianteId="",color="",talla="";
        let stockAnterior=usaVariantes?0:Math.max(0,Math.floor(numero(producto.stock)));
        const stockProductoAnterior=window.SIXTEEN_VARIANTS.totalStock(producto);

        if(usaVariantes){
          varianteId=String(inventarioVariante?.value||"");
          const idx=variantes.findIndex(v=>v.id===varianteId);
          if(idx<0)throw new Error("Selecciona una variante válida.");
          color=variantes[idx].color;
          talla=variantes[idx].talla;
          stockAnterior=variantes[idx].stock;
        }

        let stockNuevo=stockAnterior;
        if(operacion==="entrada")stockNuevo=stockAnterior+cantidad;
        if(operacion==="salida"){
          if(cantidad>stockAnterior)throw new Error("No puedes retirar "+cantidad+" unidades. Stock actual: "+stockAnterior+".");
          stockNuevo=stockAnterior-cantidad;
        }
        if(operacion==="exacto")stockNuevo=cantidad;

        let stockProductoNuevo=stockNuevo;
        const cambios={stockMinimo,actualizadoEn:FieldValue.serverTimestamp()};

        if(usaVariantes){
          const idx=variantes.findIndex(v=>v.id===varianteId);
          variantes[idx].stock=stockNuevo;
          stockProductoNuevo=variantes.reduce((s,v)=>s+Math.max(0,Math.floor(numero(v.stock))),0);
          cambios.variantes=variantes;
          cambios.usaVariantes=true;
          cambios.stock=stockProductoNuevo;
        }else{
          cambios.stock=stockNuevo;
        }

        transaction.update(productoRef,cambios);

        const mov=db.collection("inventario").doc();
        transaction.set(mov,{
          tipo:operacion==="entrada"?"AJUSTE_ENTRADA":operacion==="salida"?"AJUSTE_SALIDA":"AJUSTE_EXACTO",
          origen:"manual",
          productoId:productoAjusteInventarioId,
          codigo:producto.codigo||"",
          nombre:producto.nombre||"",
          varianteId,
          color,
          talla,
          cantidad:operacion==="exacto"?Math.abs(stockNuevo-stockAnterior):cantidad,
          stockAnterior,
          stockNuevo,
          stockProductoAnterior,
          stockProductoNuevo,
          stockMinimo,
          motivo,
          usuarioUid:usuarioActual.uid,
          usuarioEmail:usuarioActual.email||"",
          creadoEn:FieldValue.serverTimestamp()
        });
      });

      mostrarMensajeInventario("Inventario actualizado correctamente.",true);
      setTimeout(cerrarAjusteInventario,650);

    }catch(error){
      console.error("Ajuste inventario:",error);
      mostrarMensajeInventario(error.message||"No fue posible actualizar el inventario.",false);
    }finally{
      guardarInventarioAjusteBtn.disabled=false;
      guardarInventarioAjusteBtn.textContent="GUARDAR AJUSTE";
    }
  }


  function mostrarMensajeInventario(texto, correcto = false) {

    if (!inventarioAjusteMensaje) {
      return;
    }

    inventarioAjusteMensaje.textContent =
      texto || "";

    inventarioAjusteMensaje.className =
      "producto-mensaje";

    if (correcto) {
      inventarioAjusteMensaje.classList.add(
        "correcto"
      );
    }
  }


  // ========================================================
  // SIXTEEN EXPERIENCE 3D
  // Campo técnico urbanx3d se conserva por compatibilidad.
  // ========================================================

  function renderSixteen3d(productos) {

    if (!sixteen3dAdminBody) {
      return;
    }

    const compatibles =
      productos.filter(
        function (producto) {
          return producto.urbanx3d === true;
        }
      );

    if (!compatibles.length) {
      sixteen3dAdminBody.innerHTML = `
        <tr>
          <td colspan="4">
            No hay productos SIXTEEN Experience 3D activos.
          </td>
        </tr>
      `;
      return;
    }

    sixteen3dAdminBody.innerHTML = "";

    compatibles.forEach(
      function (producto) {

        const modelo = String(
          producto.modelo3d || ""
        ).trim();

        const fila =
          document.createElement("tr");

        fila.innerHTML = `
          <td>
            ${escapar(producto.codigo || "-")}
          </td>

          <td>
            <strong>
              ${escapar(producto.nombre || "-")}
            </strong>
          </td>

          <td>
            ${
              modelo
                ? `
                  <a
                    class="admin-inline-link"
                    href="${escaparAtributo(modelo)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    VER MODELO
                  </a>
                `
                : "Sin modelo"
            }
          </td>

          <td>
            <span
              class="
                admin-table-status
                ${
                  modelo
                    ? "activo"
                    : "inactivo"
                }
              "
            >
              ${
                modelo
                  ? "CONFIGURADO"
                  : "PENDIENTE"
              }
            </span>
          </td>
        `;

        sixteen3dAdminBody.appendChild(fila);
      }
    );
  }

  // ========================================================
  // EVENTOS TABLA PRODUCTOS
  // ========================================================

  productosAdminBody?.addEventListener(
    "click",
    function (event) {

      const boton =
        event.target.closest(
          "button[data-action]"
        );

      if (!boton) {
        return;
      }

      const accion = boton.dataset.action;
      const id = boton.dataset.id;

      if (accion === "editar") {
        editarProducto(id);
      }

      if (accion === "eliminar") {
        eliminarProducto(id);
      }
    }
  );

  // ========================================================
  // NUEVO PRODUCTO
  // ========================================================

  nuevoProductoBtn?.addEventListener(
    "click",
    function () {

      resetFormularioProducto();

      productoEditandoId = null;

      productoModalTitulo.textContent =
        "Nuevo producto";

      establecer("productoStock", 0);
      establecer("productoIvaTarifa", 15);
      establecer("productoEstado", "Activo");
      cargarVariantesEditor();

      abrirModalProducto();
    }
  );

  // ========================================================
  // MODAL PRODUCTO
  // ========================================================

  function abrirModalProducto() {

    if (!productoModal) {
      return;
    }

    productoModal.classList.add("activo");
    productoModal.setAttribute(
      "aria-hidden",
      "false"
    );

    actualizarBloqueoBody();
  }

  function cerrarModalProductoFn() {

    if (!productoModal) {
      return;
    }

    productoModal.classList.remove("activo");
    productoModal.setAttribute(
      "aria-hidden",
      "true"
    );

    liberarPreviewObjectUrl();

    imagenArchivoSeleccionado = null;
    imagenEliminada = false;
    productoEditandoId = null;

    actualizarBloqueoBody();
  }

  cerrarProductoModal?.addEventListener(
    "click",
    cerrarModalProductoFn
  );

  cancelarProductoBtn?.addEventListener(
    "click",
    cerrarModalProductoFn
  );

  productoModal?.addEventListener(
    "click",
    function (event) {

      if (event.target === productoModal) {
        cerrarModalProductoFn();
      }
    }
  );

  // ========================================================
  // IMAGEN PRODUCTO
  // ========================================================

  seleccionarImagenBtn?.addEventListener(
    "click",
    function () {
      productoImagenArchivo?.click();
    }
  );

  productoImagenArchivo?.addEventListener(
    "change",
    function () {

      const archivo =
        productoImagenArchivo.files &&
        productoImagenArchivo.files[0]
          ? productoImagenArchivo.files[0]
          : null;

      if (!archivo) {
        return;
      }

      if (
        !ALLOWED_IMAGE_TYPES.includes(
          archivo.type
        )
      ) {

        mostrarMensajeProducto(
          "Formato no permitido. Usa JPG, JPEG, PNG o WEBP.",
          false
        );

        productoImagenArchivo.value = "";
        return;
      }

      if (
        archivo.size >
        MAX_IMAGE_SIZE
      ) {

        mostrarMensajeProducto(
          "La imagen supera el máximo de 5 MB.",
          false
        );

        productoImagenArchivo.value = "";
        return;
      }

      liberarPreviewObjectUrl();

      imagenArchivoSeleccionado = archivo;
      imagenEliminada = false;

      imagenPreviewObjectUrl =
        URL.createObjectURL(archivo);

      mostrarPreviewImagen(
        imagenPreviewObjectUrl
      );

      productoImagenNombre.textContent =
        archivo.name +
        " · " +
        formatearTamano(
          archivo.size
        );

      quitarImagenBtn.style.display = "";
      mostrarMensajeProducto("");
    }
  );

  quitarImagenBtn?.addEventListener(
    "click",
    function () {

      liberarPreviewObjectUrl();

      imagenArchivoSeleccionado = null;
      imagenEliminada = true;

      if (productoImagenArchivo) {
        productoImagenArchivo.value = "";
      }

      if (productoImagenActual) {
        productoImagenActual.value = "";
      }

      if (productoImagenPublicId) {
        productoImagenPublicId.value = "";
      }

      ocultarPreviewImagen();

      productoImagenNombre.textContent =
        "JPG, JPEG, PNG o WEBP · máximo 5 MB";

      quitarImagenBtn.style.display = "none";
    }
  );

  async function subirImagenCloudinary(
    archivo
  ) {

    const endpoint =
      "https://api.cloudinary.com/v1_1/" +
      CLOUDINARY_CLOUD_NAME +
      "/image/upload";

    const formData = new FormData();

    formData.append(
      "file",
      archivo
    );

    formData.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET
    );

    const respuesta =
      await fetch(
        endpoint,
        {
          method: "POST",
          body: formData
        }
      );

    let datos;

    try {
      datos = await respuesta.json();
    } catch (error) {
      throw new Error(
        "Cloudinary devolvió una respuesta inválida."
      );
    }

    if (
      !respuesta.ok ||
      !datos.secure_url
    ) {

      console.error(
        "Cloudinary:",
        datos
      );

      throw new Error(
        datos?.error?.message ||
        "No fue posible subir la fotografía."
      );
    }

    return {
      url: datos.secure_url,
      publicId: datos.public_id || ""
    };
  }

  // ========================================================
  // PASO 16B · EDITOR DE VARIANTES
  // ========================================================

  function variantesEditorActivas() {
    return productoUsaVariantes?.checked === true;
  }

  function crearFilaVariante(datos = {}) {
    if (!productoVariantesLista) return;

    const v = window.SIXTEEN_VARIANTS.normalizeVariant(datos);
    const fila = document.createElement("div");
    fila.className = "producto-variante-fila";

    fila.innerHTML = `
      <label>COLOR
        <input type="text" data-variante-color value="${escaparAtributo(v.color)}" placeholder="Negro" maxlength="80">
      </label>
      <label>TALLA
        <input type="text" data-variante-talla value="${escaparAtributo(v.talla)}" placeholder="M / 40 / Única" maxlength="40">
      </label>
      <label>STOCK
        <input type="number" data-variante-stock min="0" step="1" value="${Math.max(0,Math.floor(numero(v.stock)))}">
      </label>
      <button type="button" class="producto-variante-eliminar" data-eliminar-variante aria-label="Eliminar variante">×</button>
    `;

    productoVariantesLista.appendChild(fila);

    fila.querySelectorAll("input").forEach(input=>{
      input.addEventListener("input",sincronizarResumenVariantes);
    });

    fila.querySelector("[data-eliminar-variante]")?.addEventListener("click",()=>{
      fila.remove();
      sincronizarResumenVariantes();
    });

    sincronizarResumenVariantes();
  }

  function leerVariantesFormulario() {
    if (!variantesEditorActivas()) return [];

    const raw = Array.from(
      productoVariantesLista?.querySelectorAll(".producto-variante-fila") || []
    ).map(fila=>({
      color:String(fila.querySelector("[data-variante-color]")?.value||"").trim(),
      talla:String(fila.querySelector("[data-variante-talla]")?.value||"").trim(),
      stock:Math.max(0,Math.floor(numero(fila.querySelector("[data-variante-stock]")?.value)))
    }));

    return window.SIXTEEN_VARIANTS.cleanForSave(raw);
  }

  function sincronizarResumenVariantes() {
    const active=variantesEditorActivas();

    if(agregarVarianteProductoBtn)agregarVarianteProductoBtn.disabled=!active;
    if(productoVariantesLista)productoVariantesLista.hidden=!active;
    if(productoVariantesResumen)productoVariantesResumen.hidden=!active;
    if(productoVariantesAyuda)productoVariantesAyuda.hidden=!active;

    const stock=document.getElementById("productoStock");
    const color=document.getElementById("productoColor");
    const tallas=document.getElementById("productoTallas");

    if(!active){
      if(stock)stock.readOnly=false;
      if(color)color.readOnly=false;
      if(tallas)tallas.readOnly=false;
      return;
    }

    let list=[];
    try{ list=leerVariantesFormulario(); }catch(_){}

    const legacy=window.SIXTEEN_VARIANTS.legacyFields(list);

    if(stock){stock.value=String(legacy.stock);stock.readOnly=true;}
    if(color){color.value=legacy.color;color.readOnly=true;}
    if(tallas){tallas.value=legacy.tallas.join(", ");tallas.readOnly=true;}
    if(productoVariantesStockTotal)productoVariantesStockTotal.textContent=String(legacy.stock);
    if(productoVariantesConteo)productoVariantesConteo.textContent=String(list.length);
  }

  function cargarVariantesEditor(producto=null) {
    if(productoVariantesLista)productoVariantesLista.innerHTML="";
    const list=window.SIXTEEN_VARIANTS.variants(producto||{});
    if(productoUsaVariantes)productoUsaVariantes.checked=list.length>0;
    list.forEach(crearFilaVariante);
    sincronizarResumenVariantes();
  }

  productoUsaVariantes?.addEventListener("change",()=>{
    if(productoUsaVariantes.checked&&productoVariantesLista&&productoVariantesLista.children.length===0){
      crearFilaVariante({color:valor("productoColor"),talla:"",stock:0});
    }
    sincronizarResumenVariantes();
  });

  agregarVarianteProductoBtn?.addEventListener("click",()=>crearFilaVariante());


  // ========================================================
  // GUARDAR PRODUCTO
  // ========================================================

  productoForm?.addEventListener(
    "submit",
    guardarProducto
  );

  async function guardarProducto(
    event
  ) {

    event.preventDefault();

    if (!usuarioActual) {
      mostrarMensajeProducto(
        "La sesión administrativa expiró.",
        false
      );
      return;
    }

    const codigo =
      valor("productoCodigo")
        .toUpperCase();

    const nombre =
      valor("productoNombre");

    const categoria =
      valor("productoCategoria");

    if (
      !codigo ||
      !nombre ||
      !categoria
    ) {
      mostrarMensajeProducto(
        "Completa los campos obligatorios.",
        false
      );
      return;
    }

    guardarProductoBtn.disabled = true;

    try {

      guardarProductoBtn.textContent =
        "VALIDANDO...";

      const consultaDuplicados =
        await db
          .collection("productos")
          .where(
            "codigo",
            "==",
            codigo
          )
          .get();

      let codigoDuplicado = false;

      consultaDuplicados.forEach(
        function (documento) {

          if (
            !productoEditandoId ||
            documento.id !==
            productoEditandoId
          ) {
            codigoDuplicado = true;
          }
        }
      );

      if (codigoDuplicado) {

        mostrarMensajeProducto(
          "Ya existe un producto con ese código.",
          false
        );

        return;
      }

      let imagenUrl =
        productoImagenActual?.value || "";

      let imagenPublicId =
        productoImagenPublicId?.value || "";

      if (imagenEliminada) {
        imagenUrl = "";
        imagenPublicId = "";
      }

      if (imagenArchivoSeleccionado) {

        guardarProductoBtn.textContent =
          "SUBIENDO FOTO...";

        mostrarMensajeProducto(
          "Subiendo fotografía a Cloudinary...",
          true
        );

        const subida =
          await subirImagenCloudinary(
            imagenArchivoSeleccionado
          );

        imagenUrl = subida.url;
        imagenPublicId = subida.publicId;
      }

      guardarProductoBtn.textContent =
        "GUARDANDO...";

      mostrarMensajeProducto(
        "Guardando producto...",
        true
      );

      const producto = {

        codigo: codigo,

        nombre: nombre,

        categoria: categoria,

        precio:
          Math.max(
            0,
            numero(
              valor("productoPrecio")
            )
          ),

        precioAnterior:
          Math.max(
            0,
            numero(
              valor(
                "productoPrecioAnterior"
              )
            )
          ),

        ivaTarifa:
          Math.max(
            0,
            numero(
              valor(
                "productoIvaTarifa"
              )
              ||
              15
            )
          ),

        stock:
          Math.max(
            0,
            Math.floor(
              numero(
                valor("productoStock")
              )
            )
          ),

        color:
          valor("productoColor"),

        tallas:
          valor("productoTallas")
            .split(",")
            .map(
              function (item) {
                return item.trim();
              }
            )
            .filter(Boolean),

        usaVariantes:
          variantesEditorActivas(),

        variantes:
          variantesEditorActivas()
            ? leerVariantesFormulario()
            : [],

        estado:
          valor("productoEstado") ||
          "Activo",

        imagen:
          imagenUrl,

        imagenPublicId:
          imagenPublicId,

        modelo3d:
          valor("productoModelo3d"),

        descripcion:
          valor("productoDescripcion"),

        materiales:
          valor("productoMateriales"),

        detalles:
          valor("productoDetalles"),

        destacado:
          estaMarcado(
            "productoDestacado"
          ),

        nuevo:
          estaMarcado(
            "productoNuevo"
          ),

        // Se conserva el nombre técnico actual
        // para que producto.js y checkout sigan funcionando.
        urbanx3d:
          estaMarcado(
            "producto3d"
          ),

        actualizadoEn:
          FieldValue.serverTimestamp()
      };

      if (producto.usaVariantes) {
        if (!producto.variantes.length) {
          throw new Error("Agrega al menos una variante de color/talla.");
        }

        const legacy =
          window.SIXTEEN_VARIANTS.legacyFields(producto.variantes);

        producto.stock = legacy.stock;
        producto.color = legacy.color;
        producto.tallas = legacy.tallas;
      }

      if (productoEditandoId) {

        await db
          .collection("productos")
          .doc(productoEditandoId)
          .update(producto);

        mostrarMensajeProducto(
          "Producto actualizado correctamente.",
          true
        );

      } else {

        producto.creadoEn =
          FieldValue.serverTimestamp();

        await db
          .collection("productos")
          .add(producto);

        mostrarMensajeProducto(
          "Producto creado correctamente.",
          true
        );
      }

      setTimeout(
        cerrarModalProductoFn,
        650
      );

    } catch (error) {

      console.error(
        "Guardar producto:",
        error
      );

      if (
        error.code ===
        "permission-denied"
      ) {
        mostrarMensajeProducto(
          "Firestore rechazó el acceso. Revisa las reglas y el UID del administrador.",
          false
        );
      } else {
        mostrarMensajeProducto(
          error.message ||
          "No fue posible guardar el producto.",
          false
        );
      }

    } finally {

      guardarProductoBtn.disabled =
        false;

      guardarProductoBtn.textContent =
        "GUARDAR PRODUCTO";
    }
  }

  // ========================================================
  // EDITAR PRODUCTO
  // ========================================================

  async function editarProducto(id) {

    try {

      const documento =
        await db
          .collection("productos")
          .doc(id)
          .get();

      if (!documento.exists) {
        alert(
          "El producto ya no existe."
        );
        return;
      }

      const producto =
        documento.data();

      resetFormularioProducto();

      productoEditandoId = id;

      productoModalTitulo.textContent =
        "Editar producto";

      establecer(
        "productoCodigo",
        producto.codigo
      );

      establecer(
        "productoNombre",
        producto.nombre
      );

      asegurarOpcionSelect(
        "productoCategoria",
        producto.categoria
      );

      establecer(
        "productoCategoria",
        producto.categoria
      );

      establecer(
        "productoPrecio",
        producto.precio
      );

      establecer(
        "productoPrecioAnterior",
        producto.precioAnterior
      );

      establecer(
        "productoIvaTarifa",
        producto.ivaTarifa ??
        15
      );

      establecer(
        "productoStock",
        producto.stock
      );

      establecer(
        "productoColor",
        producto.color
      );

      establecer(
        "productoTallas",
        Array.isArray(
          producto.tallas
        )
          ? producto.tallas.join(", ")
          : ""
      );

      cargarVariantesEditor(producto);

      establecer(
        "productoEstado",
        producto.estado ||
        "Activo"
      );

      establecer(
        "productoModelo3d",
        producto.modelo3d
      );

      establecer(
        "productoDescripcion",
        producto.descripcion
      );

      establecer(
        "productoMateriales",
        producto.materiales
      );

      establecer(
        "productoDetalles",
        producto.detalles
      );

      marcar(
        "productoDestacado",
        producto.destacado
      );

      marcar(
        "productoNuevo",
        producto.nuevo
      );

      marcar(
        "producto3d",
        producto.urbanx3d
      );

      if (productoImagenActual) {
        productoImagenActual.value =
          producto.imagen || "";
      }

      if (productoImagenPublicId) {
        productoImagenPublicId.value =
          producto.imagenPublicId || "";
      }

      if (producto.imagen) {

        mostrarPreviewImagen(
          producto.imagen
        );

        productoImagenNombre.textContent =
          "Fotografía actual del producto";

        quitarImagenBtn.style.display = "";
      }

      abrirModalProducto();

    } catch (error) {

      console.error(
        "Editar:",
        error
      );

      alert(
        "No fue posible abrir el producto."
      );
    }
  }

  // ========================================================
  // ELIMINAR PRODUCTO
  // ========================================================

  async function eliminarProducto(id) {

    const producto =
      productosActuales.find(
        function (item) {
          return item.id === id;
        }
      );

    const confirmado =
      window.confirm(
        "¿Seguro que deseas eliminar " +
        (producto?.nombre ||
          "este producto") +
        "?"
      );

    if (!confirmado) {
      return;
    }

    try {

      await db
        .collection("productos")
        .doc(id)
        .delete();

    } catch (error) {

      console.error(
        "Eliminar:",
        error
      );

      alert(
        "No fue posible eliminar el producto."
      );
    }
  }

  // ========================================================
  // FIRESTORE · PEDIDOS
  // ========================================================

  function escucharPedidos() {

    if (unsubscribePedidos) {
      unsubscribePedidos();
    }

    unsubscribePedidos =
      db
        .collection("pedidos")
        .onSnapshot(
          function (snapshot) {

            const pedidos = [];

            snapshot.forEach(
              function (doc) {
                pedidos.push({
                  id: doc.id,
                  ...doc.data()
                });
              }
            );

            pedidos.sort(
              function (a, b) {
                return fechaMillis(b.creadoEn) -
                  fechaMillis(a.creadoEn);
              }
            );

            pedidosActuales = pedidos;

            actualizarResumenPedidos();
            aplicarFiltrosPedidos();

            construirClientesDesdePedidos();
            aplicarFiltrosClientes();
            actualizarResumenClientes();

            actualizarKPIs();
            actualizarReportes();
            emitirActualizacionAnalitica();
            emitirActualizacionBackup();
          },

          function (error) {

            console.error(
              "Firestore pedidos:",
              error
            );

            if (pedidosAdminBody) {
              pedidosAdminBody.innerHTML = `
                <tr>
                  <td colspan="8">
                    No fue posible cargar los pedidos.
                  </td>
                </tr>
              `;
            }
          }
        );
  }

  // ========================================================
  // PEDIDOS · FILTROS, CONTADORES Y EXPORTACIÓN
  // ========================================================

  function aplicarFiltrosPedidos() {

    const busqueda =
      normalizarTexto(
        pedidoBuscar?.value || ""
      );

    const estado =
      String(
        pedidoFiltroEstado?.value || ""
      ).trim();

    const metodoPago =
      String(
        pedidoFiltroPago?.value || ""
      ).trim();

    const desde =
      crearFechaFiltro(
        pedidoFechaDesde?.value,
        false
      );

    const hasta =
      crearFechaFiltro(
        pedidoFechaHasta?.value,
        true
      );

    pedidosFiltradosActuales =
      pedidosActuales.filter(
        function (pedido) {

          const cliente =
            pedido.cliente || {};

          const pago =
            normalizarPago(
              pedido
            );

          if (
            estado &&
            (pedido.estado || "Pendiente") !==
            estado
          ) {
            return false;
          }

          if (
            metodoPago &&
            pago.metodo !==
            metodoPago
          ) {
            return false;
          }

          const fechaPedido =
            fechaComoDate(
              pedido.creadoEn
            );

          if (
            desde &&
            (
              !fechaPedido ||
              fechaPedido < desde
            )
          ) {
            return false;
          }

          if (
            hasta &&
            (
              !fechaPedido ||
              fechaPedido > hasta
            )
          ) {
            return false;
          }

          if (busqueda) {

            const textoPedido =
              normalizarTexto(
                [
                  pedido.numero,
                  pedido.id,
                  cliente.nombres,
                  cliente.apellidos,
                  cliente.email,
                  cliente.telefono,
                  cliente.identificacion,
                  pedido.estado,
                  nombreMetodoPago(
                    pago.metodo
                  )
                ]
                  .filter(Boolean)
                  .join(" ")
              );

            if (
              !textoPedido.includes(
                busqueda
              )
            ) {
              return false;
            }
          }

          return true;
        }
      );

    renderPedidos(
      pedidosFiltradosActuales
    );

    actualizarTextoResultados();
  }


  function actualizarResumenPedidos() {

    const total =
      pedidosActuales.length;

    const pendientes =
      pedidosActuales.filter(
        function (pedido) {
          return (
            pedido.estado ||
            "Pendiente"
          ) === "Pendiente";
        }
      ).length;

    const enProceso =
      pedidosActuales.filter(
        function (pedido) {

          return [
            "Confirmado",
            "En preparación",
            "Enviado"
          ].includes(
            pedido.estado
          );
        }
      ).length;

    const entregados =
      pedidosActuales.filter(
        function (pedido) {
          return pedido.estado ===
            "Entregado";
        }
      ).length;

    if (pedidosConteoTotal) {
      pedidosConteoTotal.textContent =
        total;
    }

    if (pedidosConteoPendientes) {
      pedidosConteoPendientes.textContent =
        pendientes;
    }

    if (pedidosConteoProceso) {
      pedidosConteoProceso.textContent =
        enProceso;
    }

    if (pedidosConteoEntregados) {
      pedidosConteoEntregados.textContent =
        entregados;
    }

    if (pedidosPendientesBadge) {

      pedidosPendientesBadge.textContent =
        pendientes;

      pedidosPendientesBadge.classList.toggle(
        "vacio",
        pendientes === 0
      );
    }
  }


  function actualizarTextoResultados() {

    if (!pedidosResultadoTexto) {
      return;
    }

    const visibles =
      pedidosFiltradosActuales.length;

    const total =
      pedidosActuales.length;

    if (visibles === total) {

      pedidosResultadoTexto.textContent =
        total === 1
          ? "Mostrando 1 pedido."
          : `Mostrando ${total} pedidos.`;

      return;
    }

    pedidosResultadoTexto.textContent =
      `Mostrando ${visibles} de ${total} pedidos.`;
  }


  function limpiarFiltrosPedidos() {

    if (pedidoBuscar) {
      pedidoBuscar.value = "";
    }

    if (pedidoFiltroEstado) {
      pedidoFiltroEstado.value = "";
    }

    if (pedidoFiltroPago) {
      pedidoFiltroPago.value = "";
    }

    if (pedidoFechaDesde) {
      pedidoFechaDesde.value = "";
    }

    if (pedidoFechaHasta) {
      pedidoFechaHasta.value = "";
    }

    aplicarFiltrosPedidos();
  }


  [
    pedidoBuscar,
    pedidoFiltroEstado,
    pedidoFiltroPago,
    pedidoFechaDesde,
    pedidoFechaHasta
  ]
    .filter(Boolean)
    .forEach(
      function (elemento) {

        const evento =
          elemento === pedidoBuscar
            ? "input"
            : "change";

        elemento.addEventListener(
          evento,
          aplicarFiltrosPedidos
        );
      }
    );


  limpiarFiltrosPedidosBtn
    ?.addEventListener(
      "click",
      limpiarFiltrosPedidos
    );


  exportarPedidosBtn
    ?.addEventListener(
      "click",
      exportarPedidosCSV
    );


  function exportarPedidosCSV() {

    const pedidos =
      pedidosFiltradosActuales.length ||
      filtrosPedidosActivos()
        ? pedidosFiltradosActuales
        : pedidosActuales;

    if (!pedidos.length) {

      alert(
        "No hay pedidos para exportar."
      );

      return;
    }

    const filas = [
      [
        "Numero",
        "Fecha",
        "Cliente",
        "Identificacion",
        "Correo",
        "Telefono",
        "Metodo de pago",
        "Estado de pago",
        "Estado del pedido",
        "Subtotal",
        "Descuento",
        "Envio",
        "Total"
      ]
    ];

    pedidos.forEach(
      function (pedido) {

        const cliente =
          pedido.cliente || {};

        const pago =
          normalizarPago(
            pedido
          );

        const resumen =
          pedido.resumen || {};

        filas.push([
          pedido.numero ||
            pedido.id ||
            "",
          fechaLegible(
            pedido.creadoEn
          ),
          nombreCliente(
            cliente
          ),
          cliente.identificacion ||
            "",
          cliente.email ||
            "",
          cliente.telefono ||
            "",
          nombreMetodoPago(
            pago.metodo
          ),
          pago.estado ||
            "",
          pedido.estado ||
            "Pendiente",
          numero(
            resumen.subtotal
          ).toFixed(2),
          numero(
            resumen.descuento
          ).toFixed(2),
          numero(
            resumen.envio
          ).toFixed(2),
          numero(
            resumen.total
          ).toFixed(2)
        ]);
      }
    );

    const contenido =
      filas
        .map(
          function (fila) {

            return fila
              .map(
                escaparCSV
              )
              .join(",");
          }
        )
        .join("\r\n");

    const blob =
      new Blob(
        [
          "\uFEFF" +
          contenido
        ],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const enlace =
      document.createElement(
        "a"
      );

    enlace.href = url;

    enlace.download =
      "sixteen-pedidos-" +
      fechaArchivo() +
      ".csv";

    document.body.appendChild(
      enlace
    );

    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(
      url
    );
  }


  function filtrosPedidosActivos() {

    return Boolean(
      String(
        pedidoBuscar?.value || ""
      ).trim() ||
      pedidoFiltroEstado?.value ||
      pedidoFiltroPago?.value ||
      pedidoFechaDesde?.value ||
      pedidoFechaHasta?.value
    );
  }


  function escaparCSV(valor) {

    const texto =
      String(
        valor ?? ""
      );

    return (
      '"' +
      texto.replace(
        /"/g,
        '""'
      ) +
      '"'
    );
  }


  function fechaArchivo() {

    const ahora =
      new Date();

    const yyyy =
      ahora.getFullYear();

    const mm =
      String(
        ahora.getMonth() + 1
      ).padStart(2, "0");

    const dd =
      String(
        ahora.getDate()
      ).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  }


  function crearFechaFiltro(
    valorFecha,
    finDelDia
  ) {

    if (!valorFecha) {
      return null;
    }

    const partes =
      String(valorFecha)
        .split("-")
        .map(Number);

    if (
      partes.length !== 3 ||
      partes.some(
        function (parte) {
          return !Number.isFinite(
            parte
          );
        }
      )
    ) {
      return null;
    }

    const fecha =
      new Date(
        partes[0],
        partes[1] - 1,
        partes[2],
        finDelDia ? 23 : 0,
        finDelDia ? 59 : 0,
        finDelDia ? 59 : 0,
        finDelDia ? 999 : 0
      );

    return fecha;
  }


  function fechaComoDate(fecha) {

    if (
      fecha &&
      typeof fecha.toDate ===
      "function"
    ) {
      return fecha.toDate();
    }

    if (!fecha) {
      return null;
    }

    const date =
      new Date(fecha);

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }


  function normalizarTexto(texto) {

    return String(
      texto || ""
    )
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim();
  }


  // ========================================================
  // RENDER PEDIDOS
  // ========================================================

  function renderPedidos(pedidos) {

    if (!pedidosAdminBody) {
      return;
    }

    if (!pedidos.length) {
      pedidosAdminBody.innerHTML = `
        <tr>
          <td colspan="8">
            Todavía no existen pedidos.
          </td>
        </tr>
      `;
      return;
    }

    pedidosAdminBody.innerHTML = "";

    pedidos.forEach(
      function (pedido) {

        const cliente =
          pedido.cliente || {};

        const pago =
          normalizarPago(
            pedido
          );

        const fila =
          document.createElement("tr");

        fila.innerHTML = `
          <td>
            <strong class="admin-code">
              ${escapar(pedido.numero || pedido.id)}
            </strong>
          </td>

          <td>
            <strong>
              ${escapar(
                nombreCliente(cliente)
              )}
            </strong>
            <small class="admin-table-secondary">
              ${escapar(cliente.email || "")}
            </small>
          </td>

          <td>
            ${escapar(
              fechaLegible(
                pedido.creadoEn
              )
            )}
          </td>

          <td>
            <strong>
              ${dinero(
                pedido.resumen?.total
              )}
            </strong>
          </td>

          <td>
            ${escapar(
              nombreMetodoPago(
                pago.metodo
              )
            )}
          </td>

          <td>
            <span
              class="
                pedido-estado-badge
                ${claseEstadoPedido(
                  pedido.estado
                )}
              "
            >
              ${escapar(
                pedido.estado ||
                "Pendiente"
              )}
            </span>
          </td>

          <td>
            <span
              class="
                pedido-inventario-badge
                ${claseEstadoInventario(
                  pedido
                )}
              "
            >
              ${escapar(
                textoEstadoInventario(
                  pedido
                )
              )}
            </span>
          </td>

          <td>
            <button
              type="button"
              class="admin-view-btn"
              data-pedido-id="${pedido.id}"
            >
              VER
            </button>
          </td>
        `;

        pedidosAdminBody.appendChild(
          fila
        );
      }
    );
  }

  pedidosAdminBody?.addEventListener(
    "click",
    function (event) {

      const boton =
        event.target.closest(
          "button[data-pedido-id]"
        );

      if (!boton) {
        return;
      }

      abrirPedido(
        boton.dataset.pedidoId
      );
    }
  );

  // ========================================================
  // ABRIR PEDIDO
  // ========================================================

  function abrirPedido(id) {

    const pedido =
      pedidosActuales.find(
        function (item) {
          return item.id === id;
        }
      );

    if (!pedido) {
      alert(
        "El pedido ya no está disponible."
      );
      return;
    }

    pedidoEditandoId = id;

    const cliente =
      pedido.cliente || {};

    const entrega =
      pedido.entrega || {};

    const pago =
      normalizarPago(
        pedido
      );

    const resumen =
      pedido.resumen || {};

    pedidoModalNumero.textContent =
      pedido.numero ||
      "Pedido";

    pedidoClienteNombre.textContent =
      nombreCliente(cliente);

    pedidoClienteIdentificacion.textContent =
      cliente.identificacion || "-";

    pedidoClienteEmail.textContent =
      cliente.email || "-";

    pedidoClienteTelefono.textContent =
      cliente.telefono || "-";

    pedidoEntregaCiudad.textContent =
      entrega.ciudad || "-";

    pedidoEntregaProvincia.textContent =
      entrega.provincia || "-";

    pedidoEntregaDireccion.textContent =
      entrega.direccion || "-";

    pedidoEntregaReferencia.textContent =
      entrega.referencia ||
      "Sin referencia";

    pedidoMetodoPago.textContent =
      nombreMetodoPago(
        pago.metodo
      );

    pedidoEstadoPago.textContent =
      pago.estado ||
      "Pendiente";

    pedidoFecha.textContent =
      fechaLegible(
        pedido.creadoEn
      );

    if (pedidoEstadoInventario) {
      pedidoEstadoInventario.textContent =
        textoEstadoInventario(
          pedido
        );

      pedidoEstadoInventario.className =
        "pedido-inventario-texto " +
        claseEstadoInventario(
          pedido
        );
    }

    asegurarOpcionSelect(
      "pedidoEstadoSelect",
      pedido.estado ||
      "Pendiente"
    );

    pedidoEstadoSelect.value =
      pedido.estado ||
      "Pendiente";

    asegurarOpcionSelect(
      "pedidoEstadoPagoSelect",
      pago.estado ||
      "Pendiente"
    );

    pedidoEstadoPagoSelect.value =
      pago.estado ||
      "Pendiente";

    renderProductosPedido(
      pedido.productos || []
    );

    pedidoSubtotal.textContent =
      dinero(
        resumen.subtotal
      );

    pedidoDescuento.textContent =
      dinero(
        resumen.descuento
      );

    pedidoEnvio.textContent =
      dinero(
        resumen.envio
      );

    pedidoTotal.textContent =
      dinero(
        resumen.total
      );

    mostrarMensajePedido("");

    pedidoModal.classList.add(
      "activo"
    );

    pedidoModal.setAttribute(
      "aria-hidden",
      "false"
    );

    actualizarBloqueoBody();
  }

  function renderProductosPedido(productos) {

    pedidoProductosLista.innerHTML = "";

    if (!Array.isArray(productos) ||
        !productos.length) {

      pedidoProductosLista.innerHTML = `
        <p class="pedido-sin-productos">
          No hay productos registrados.
        </p>
      `;

      return;
    }

    productos.forEach(
      function (producto) {

        const cantidad =
          Math.max(
            1,
            numero(
              producto.cantidad
            )
          );

        const precio =
          numero(
            producto.precioUnitario ??
            producto.precio
          );

        const item =
          document.createElement(
            "article"
          );

        item.className =
          "pedido-producto-item";

        item.innerHTML = `
          <div class="pedido-producto-imagen">
            ${
              producto.imagen
                ? `
                  <img
                    src="${escaparAtributo(producto.imagen)}"
                    alt="${escaparAtributo(producto.nombre || "Producto SIXTEEN")}"
                  >
                `
                : "XVI"
            }
          </div>

          <div class="pedido-producto-info">

            <h4>
              ${escapar(
                producto.nombre ||
                "Producto SIXTEEN"
              )}
            </h4>

            <p>
              ${escapar(
                producto.codigo ||
                producto.id ||
                "-"
              )}
              · Talla:
              ${escapar(
                producto.talla ||
                "Única"
              )}
            </p>

            <p>
              Color:
              ${escapar(
                producto.color ||
                "-"
              )}
              · Cantidad:
              ${cantidad}
            </p>

          </div>

          <strong>
            ${dinero(
              precio * cantidad
            )}
          </strong>
        `;

        pedidoProductosLista.appendChild(
          item
        );
      }
    );
  }

  // ========================================================
  // GUARDAR ESTADO DEL PEDIDO + STOCK SEGURO
  //
  // REGLAS:
  // - Al pasar a Confirmado / En preparación / Enviado /
  //   Entregado, el stock se descuenta UNA sola vez.
  // - Si el pedido se cancela después de descontar stock,
  //   el stock se devuelve UNA sola vez.
  // - Si un pedido cancelado vuelve a un estado operativo,
  //   el stock se vuelve a descontar, validando existencia.
  // - Todo se hace dentro de una transacción Firestore.
  // - Cada movimiento se registra en "inventario".
  // ========================================================

  // ========================================================
  // PASO 9B · NOTIFICACIONES + EMAILJS FREE
  // ========================================================

  function datosNotificacionEstado(
    nuevoEstado
  ) {

    const mapa = {

      "Confirmado": {
        titulo:
          "Pedido confirmado",

        mensaje:
          "Tu pedido fue confirmado y ya forma parte de nuestro proceso de preparación.",

        asunto:
          "Tu pedido SIXTEEN fue confirmado"
      },


      "En preparación": {
        titulo:
          "Pedido en preparación",

        mensaje:
          "Estamos preparando tu pedido SIXTEEN para el siguiente paso.",

        asunto:
          "Estamos preparando tu pedido SIXTEEN"
      },


      "Enviado": {
        titulo:
          "Pedido enviado",

        mensaje:
          "Tu pedido salió de nuestro proceso de preparación y fue marcado como enviado.",

        asunto:
          "Tu pedido SIXTEEN fue enviado"
      },


      "Entregado": {
        titulo:
          "Pedido entregado",

        mensaje:
          "Tu pedido fue marcado como entregado. Gracias por elegir SIXTEEN.",

        asunto:
          "Tu pedido SIXTEEN fue entregado"
      },


      "Cancelado": {
        titulo:
          "Pedido cancelado",

        mensaje:
          "Tu pedido fue marcado como cancelado. Si necesitas ayuda, comunícate con SIXTEEN.",

        asunto:
          "Actualización de tu pedido SIXTEEN"
      }
    };


    return (
      mapa[
        nuevoEstado
      ] ||
      null
    );
  }


  async function registrarActualizacionCliente(
    pedido,
    estadoAnterior,
    nuevoEstado
  ) {

    if (
      !pedido ||
      estadoAnterior ===
      nuevoEstado
    ) {
      return;
    }


    const contenido =
      datosNotificacionEstado(
        nuevoEstado
      );


    if (!contenido) {
      return;
    }


    const clienteUid =
      String(
        pedido.clienteUid ||
        ""
      ).trim();


    const pedidoNumero =
      pedido.numero ||
      pedido.id ||
      pedidoEditandoId;


    // --------------------------------------------------------
    // NOTIFICACIÓN INTERNA
    // --------------------------------------------------------

    if (
      clienteUid
    ) {

      try {

        await db
          .collection("notificaciones")
          .doc(
            clienteUid
          )
          .collection("items")
          .add({
            usuarioUid:
              clienteUid,

            tipo:
              "estado_pedido",

            pedidoId:
              pedidoEditandoId,

            pedidoNumero:
              pedidoNumero,

            estado:
              nuevoEstado,

            titulo:
              contenido.titulo,

            mensaje:
              contenido.mensaje,

            leida:
              false,

            creadoEn:
              FieldValue.serverTimestamp(),

            creadoPor:
              usuarioActual.email ||
              usuarioActual.uid
          });

      } catch (error) {

        console.warn(
          "Notificación del pedido:",
          error
        );
      }
    }


    // --------------------------------------------------------
    // CORREO AUTOMÁTICO GRATIS · EMAILJS
    //
    // No usa Firebase Extensions ni Blaze.
    // Si EmailJS no está configurado o falla, el pedido,
    // el stock y la notificación interna siguen funcionando.
    // --------------------------------------------------------

    await enviarCorreoEstadoPedidoEmailJS(
      pedido,
      contenido,
      nuevoEstado
    );
  }


  // ========================================================
  // EMAILJS FREE
  // ========================================================

  let emailjsInicializado =
    false;


  function obtenerConfigEmailJS() {

    const config =
      window.SIXTEEN_EMAILJS_CONFIG ||
      null;


    if (
      !config ||
      config.enabled !== true
    ) {
      return null;
    }


    const publicKey =
      String(
        config.publicKey ||
        ""
      ).trim();

    const serviceId =
      String(
        config.serviceId ||
        ""
      ).trim();

    const templateId =
      String(
        config.templateId ||
        ""
      ).trim();


    if (
      !publicKey ||
      !serviceId ||
      !templateId ||
      publicKey.startsWith("TU_") ||
      serviceId.startsWith("TU_") ||
      templateId.startsWith("TU_")
    ) {
      return null;
    }


    return {
      publicKey:
        publicKey,

      serviceId:
        serviceId,

      templateId:
        templateId
    };
  }


  function prepararEmailJS() {

    const config =
      obtenerConfigEmailJS();


    if (!config) {

      console.info(
        "EmailJS aún no está configurado."
      );

      return null;
    }


    if (
      typeof window.emailjs ===
      "undefined"
    ) {

      console.warn(
        "EmailJS SDK no está disponible."
      );

      return null;
    }


    if (
      !emailjsInicializado
    ) {

      window.emailjs.init({
        publicKey:
          config.publicKey
      });


      emailjsInicializado =
        true;
    }


    return config;
  }


  async function enviarCorreoEstadoPedidoEmailJS(
    pedido,
    contenido,
    nuevoEstado
  ) {

    const config =
      prepararEmailJS();


    if (!config) {
      return false;
    }


    const correoCliente =
      String(
        pedido?.cliente?.email ||
        ""
      )
        .trim()
        .toLowerCase();


    if (
      !correoCliente ||
      !correoCliente.includes("@")
    ) {

      console.info(
        "Pedido sin correo válido."
      );

      return false;
    }


    const nombreCliente =
      String(
        pedido?.cliente?.nombres ||
        pedido?.cliente?.nombre ||
        "Cliente SIXTEEN"
      )
        .trim()
        .slice(
          0,
          100
        );


    const numeroPedido =
      String(
        pedido?.numero ||
        pedido?.id ||
        pedidoEditandoId ||
        "-"
      ).trim();


    const templateParams = {

      to_email:
        correoCliente,

      to_name:
        nombreCliente,

      email_title:
        contenido.asunto,

      email_heading:
        contenido.titulo,

      email_message:
        contenido.mensaje,

      order_number:
        numeroPedido,

      order_status:
        nuevoEstado,

      order_total:
        dinero(
          pedido?.resumen?.total
        ),

      customer_phone:
        String(
          pedido?.cliente?.telefono ||
          ""
        ).trim(),

      shipping_city:
        String(
          pedido?.entrega?.ciudad ||
          ""
        ).trim(),

      brand_name:
        "SIXTEEN",

      brand_tagline:
        "URBAN LUXURY"
    };


    try {

      await window.emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams
      );


      console.info(
        "Correo EmailJS enviado:",
        numeroPedido,
        nuevoEstado
      );


      return true;

    } catch (error) {

      console.warn(
        "No se pudo enviar EmailJS:",
        error
      );


      return false;
    }
  }


  guardarEstadoPedidoBtn?.addEventListener(
    "click",
    async function () {

      if (
        !pedidoEditandoId ||
        !usuarioActual
      ) {
        return;
      }

      const nuevoEstado =
        pedidoEstadoSelect.value;

      const nuevoEstadoPago =
        pedidoEstadoPagoSelect.value;

      guardarEstadoPedidoBtn.disabled =
        true;

      guardarEstadoPedidoBtn.textContent =
        "GUARDANDO...";

      mostrarMensajePedido(
        "Actualizando pedido e inventario...",
        true
      );

      try {

        const pedidoAntes =
          pedidosActuales.find(
            function (pedido) {

              return (
                pedido.id ===
                pedidoEditandoId
              );
            }
          ) ||
          null;


        const estadoAnterior =
          pedidoAntes?.estado ||
          "Pendiente";


        const resultado =
          await actualizarPedidoConInventario(
            pedidoEditandoId,
            nuevoEstado,
            nuevoEstadoPago
          );


        await registrarActualizacionCliente(
          pedidoAntes,
          estadoAnterior,
          nuevoEstado
        );

        mostrarMensajePedido(
          resultado.mensaje,
          true
        );

        pedidoEstadoPago.textContent =
          nuevoEstadoPago;

        if (pedidoEstadoInventario) {

          pedidoEstadoInventario.textContent =
            resultado.inventarioTexto;

          pedidoEstadoInventario.className =
            "pedido-inventario-texto " +
            resultado.inventarioClase;
        }

      } catch (error) {

        console.error(
          "Actualizar pedido / stock:",
          error
        );

        mostrarMensajePedido(
          error.message ||
          "No fue posible actualizar el pedido.",
          false
        );

      } finally {

        guardarEstadoPedidoBtn.disabled =
          false;

        guardarEstadoPedidoBtn.textContent =
          "GUARDAR ESTADO";
      }
    }
  );


  async function actualizarPedidoConInventario(
    pedidoId,
    nuevoEstado,
    nuevoEstadoPago
  ) {
    const pedidoRef=db.collection("pedidos").doc(pedidoId);
    const estadosConStock=new Set(["Confirmado","En preparación","Enviado","Entregado"]);

    return await db.runTransaction(async transaction=>{
      const pedidoSnapshot=await transaction.get(pedidoRef);
      if(!pedidoSnapshot.exists)throw new Error("El pedido ya no existe.");

      const pedido=pedidoSnapshot.data()||{};
      const productos=Array.isArray(pedido.productos)?pedido.productos:[];
      if(!productos.length)throw new Error("El pedido no contiene productos.");

      const stockDescontado=pedido.stockDescontado===true;
      const stockDevuelto=pedido.stockDevuelto===true;

      let accion="NINGUNA";
      if(estadosConStock.has(nuevoEstado)&&(!stockDescontado||stockDevuelto))accion="DESCONTAR";
      if(nuevoEstado==="Cancelado"&&stockDescontado&&!stockDevuelto)accion="DEVOLVER";

      const grupos=new Map();

      for(const item of productos){
        const cantidad=Math.max(1,Math.floor(numero(item.cantidad)));
        const codigo=String(item.codigo||item.id||"").trim().toUpperCase();
        let productoId=String(item.firestoreId||"").trim();

        if(!productoId&&codigo){
          const encontrado=productosActuales.find(p=>String(p.codigo||"").trim().toUpperCase()===codigo);
          productoId=encontrado?.id||"";
        }

        if(!productoId)throw new Error("No se pudo identificar el producto "+(codigo||item.nombre||"")+" en Firestore.");

        if(!grupos.has(productoId)){
          grupos.set(productoId,{
            productoId,
            productoRef:db.collection("productos").doc(productoId),
            items:[]
          });
        }

        grupos.get(productoId).items.push({item,cantidad,codigo});
      }

      if(accion!=="NINGUNA"){
        for(const grupo of grupos.values()){
          grupo.snapshot=await transaction.get(grupo.productoRef);
          if(!grupo.snapshot.exists)throw new Error("Uno de los productos del pedido ya no existe.");
          grupo.producto=grupo.snapshot.data()||{};
        }
      }

      const movimientos=[];

      if(accion!=="NINGUNA"){
        for(const grupo of grupos.values()){
          const producto=grupo.producto;
          const variantes=window.SIXTEEN_VARIANTS.variants(producto).map(v=>({...v}));
          const usaVariantes=variantes.length>0;
          let stockProducto=window.SIXTEEN_VARIANTS.totalStock(producto);
          const stockProductoInicial=stockProducto;

          for(const reg of grupo.items){
            if(usaVariantes){
              const variante=window.SIXTEEN_VARIANTS.find(
                {variantes},
                {
                  id:reg.item.varianteId||"",
                  color:reg.item.color||"",
                  talla:reg.item.talla||""
                }
              );

              if(!variante){
                throw new Error(
                  "La variante "+(reg.item.color||"Sin color")+" / "+(reg.item.talla||"Única")+
                  " de "+(producto.nombre||reg.codigo)+" ya no existe."
                );
              }

              const idx=variantes.findIndex(v=>v.id===variante.id);
              const before=variantes[idx].stock;
              let after=before;

              if(accion==="DESCONTAR"){
                if(before<reg.cantidad){
                  throw new Error(
                    "Stock insuficiente para "+(producto.nombre||reg.codigo)+" · "+
                    (variante.color||"Sin color")+" / "+(variante.talla||"Única")+
                    ". Disponible: "+before+", solicitado: "+reg.cantidad+"."
                  );
                }
                after=before-reg.cantidad;
                stockProducto-=reg.cantidad;
              }else{
                after=before+reg.cantidad;
                stockProducto+=reg.cantidad;
              }

              variantes[idx].stock=after;

              movimientos.push({
                grupo,producto,reg,
                varianteId:variante.id,
                color:variante.color,
                talla:variante.talla,
                stockAnterior:before,
                stockNuevo:after,
                tipo:accion==="DESCONTAR"?"SALIDA_VENTA":"ENTRADA_CANCELACION"
              });

            }else{
              const before=stockProducto;
              let after=before;

              if(accion==="DESCONTAR"){
                if(before<reg.cantidad){
                  throw new Error(
                    "Stock insuficiente para "+(producto.nombre||reg.codigo)+
                    ". Disponible: "+before+", solicitado: "+reg.cantidad+"."
                  );
                }
                after=before-reg.cantidad;
              }else{
                after=before+reg.cantidad;
              }

              stockProducto=after;

              movimientos.push({
                grupo,producto,reg,
                varianteId:"",
                color:reg.item.color||"",
                talla:reg.item.talla||"",
                stockAnterior:before,
                stockNuevo:after,
                tipo:accion==="DESCONTAR"?"SALIDA_VENTA":"ENTRADA_CANCELACION"
              });
            }
          }

          grupo.usaVariantes=usaVariantes;
          grupo.variantesFinales=variantes;
          grupo.stockProductoInicial=stockProductoInicial;
          grupo.stockProductoFinal=Math.max(0,Math.floor(stockProducto));
        }

        for(const grupo of grupos.values()){
          const cambios={
            stock:grupo.stockProductoFinal,
            actualizadoEn:FieldValue.serverTimestamp()
          };
          if(grupo.usaVariantes){
            cambios.variantes=grupo.variantesFinales;
            cambios.usaVariantes=true;
          }
          transaction.update(grupo.productoRef,cambios);
        }

        for(const m of movimientos){
          transaction.set(db.collection("inventario").doc(),{
            tipo:m.tipo,
            origen:"pedido",
            pedidoId,
            pedidoNumero:pedido.numero||pedidoId,
            productoId:m.grupo.productoId,
            codigo:m.producto.codigo||m.reg.codigo||"",
            nombre:m.producto.nombre||m.reg.item.nombre||"",
            varianteId:m.varianteId,
            color:m.color||"",
            talla:m.talla||"",
            cantidad:m.reg.cantidad,
            stockAnterior:m.stockAnterior,
            stockNuevo:m.stockNuevo,
            stockProductoAnterior:m.grupo.stockProductoInicial,
            stockProductoNuevo:m.grupo.stockProductoFinal,
            usuarioUid:usuarioActual.uid,
            usuarioEmail:usuarioActual.email||"",
            creadoEn:FieldValue.serverTimestamp()
          });
        }
      }

      const cambiosPedido={
        estado:nuevoEstado,
        estadoPago:nuevoEstadoPago,
        "pago.estado":nuevoEstadoPago,
        actualizadoEn:FieldValue.serverTimestamp()
      };

      if(accion==="DESCONTAR"){
        cambiosPedido.stockDescontado=true;
        cambiosPedido.stockDevuelto=false;
        cambiosPedido.stockDescontadoEn=FieldValue.serverTimestamp();
        cambiosPedido.stockDevueltoEn=null;
      }

      if(accion==="DEVOLVER"){
        cambiosPedido.stockDescontado=true;
        cambiosPedido.stockDevuelto=true;
        cambiosPedido.stockDevueltoEn=FieldValue.serverTimestamp();
      }

      transaction.update(pedidoRef,cambiosPedido);

      const virtual={
        ...pedido,
        ...cambiosPedido,
        stockDescontado:accion==="DESCONTAR"?true:accion==="DEVOLVER"?true:stockDescontado,
        stockDevuelto:accion==="DEVOLVER"?true:accion==="DESCONTAR"?false:stockDevuelto
      };

      return {
        mensaje:
          accion==="DESCONTAR"
            ?"Pedido actualizado y stock de variantes descontado correctamente."
            :accion==="DEVOLVER"
              ?"Pedido cancelado y stock de variantes devuelto correctamente."
              :"Pedido actualizado correctamente.",
        inventarioTexto:textoEstadoInventario(virtual),
        inventarioClase:claseEstadoInventario(virtual)
      };
    });
  }


  function textoEstadoInventario(
    pedido
  ) {

    if (
      pedido.stockDescontado ===
      true &&
      pedido.stockDevuelto ===
      true
    ) {
      return "DEVUELTO";
    }

    if (
      pedido.stockDescontado ===
      true
    ) {
      return "DESCONTADO";
    }

    return "PENDIENTE";
  }


  function claseEstadoInventario(
    pedido
  ) {

    if (
      pedido.stockDescontado ===
      true &&
      pedido.stockDevuelto ===
      true
    ) {
      return "devuelto";
    }

    if (
      pedido.stockDescontado ===
      true
    ) {
      return "descontado";
    }

    return "pendiente";
  }


  function cerrarModalPedidoFn() {

    if (!pedidoModal) {
      return;
    }

    pedidoModal.classList.remove(
      "activo"
    );

    pedidoModal.setAttribute(
      "aria-hidden",
      "true"
    );

    pedidoEditandoId = null;

    actualizarBloqueoBody();
  }

  cerrarPedidoModal?.addEventListener(
    "click",
    cerrarModalPedidoFn
  );

  pedidoModal?.addEventListener(
    "click",
    function (event) {

      if (event.target === pedidoModal) {
        cerrarModalPedidoFn();
      }
    }
  );

  // ========================================================
  // CLIENTES · CRM DERIVADO DE PEDIDOS
  //
  // No crea una nueva colección "clientes".
  // Los perfiles se construyen en tiempo real desde "pedidos",
  // así no cambiamos las reglas ni duplicamos datos.
  // ========================================================

  function construirClientesDesdePedidos() {

    const mapa =
      new Map();

    pedidosActuales.forEach(
      function (pedido) {

        const cliente =
          pedido.cliente || {};

        const clave =
          claveClientePedido(
            pedido
          );

        if (!mapa.has(clave)) {

          mapa.set(
            clave,
            {
              clave: clave,

              nombres:
                cliente.nombres || "",

              apellidos:
                cliente.apellidos || "",

              nombre:
                nombreCliente(
                  cliente
                ),

              identificacion:
                cliente.identificacion || "",

              email:
                cliente.email || "",

              telefono:
                cliente.telefono || "",

              pedidos: [],

              totalPedidos:
                0,

              pedidosNoCancelados:
                0,

              comprasValidas:
                0,

              totalComprado:
                0,

              ticketPromedio:
                0,

              ultimoPedido:
                null,

              ultimaEntrega:
                {}
            }
          );
        }

        const perfil =
          mapa.get(clave);

        // Completa datos si un pedido anterior no los tenía.
        if (!perfil.identificacion && cliente.identificacion) {
          perfil.identificacion =
            cliente.identificacion;
        }

        if (!perfil.email && cliente.email) {
          perfil.email =
            cliente.email;
        }

        if (!perfil.telefono && cliente.telefono) {
          perfil.telefono =
            cliente.telefono;
        }

        if (
          (!perfil.nombres || !perfil.apellidos) &&
          (cliente.nombres || cliente.apellidos)
        ) {

          perfil.nombres =
            perfil.nombres ||
            cliente.nombres ||
            "";

          perfil.apellidos =
            perfil.apellidos ||
            cliente.apellidos ||
            "";

          perfil.nombre =
            nombreCliente({
              nombres:
                perfil.nombres,

              apellidos:
                perfil.apellidos
            });
        }

        perfil.pedidos.push(
          pedido
        );
      }
    );


    const estadosCompraValida =
      new Set([
        "Confirmado",
        "En preparación",
        "Enviado",
        "Entregado"
      ]);


    clientesActuales =
      Array.from(
        mapa.values()
      )
        .map(
          function (perfil) {

            perfil.pedidos.sort(
              function (a, b) {

                return fechaMillis(
                  b.creadoEn
                ) -
                fechaMillis(
                  a.creadoEn
                );
              }
            );

            perfil.totalPedidos =
              perfil.pedidos.length;

            perfil.pedidosNoCancelados =
              perfil.pedidos.filter(
                function (pedido) {

                  return (
                    pedido.estado ||
                    "Pendiente"
                  ) !== "Cancelado";
                }
              ).length;

            const pedidosValidos =
              perfil.pedidos.filter(
                function (pedido) {

                  return estadosCompraValida.has(
                    pedido.estado
                  );
                }
              );

            perfil.comprasValidas =
              pedidosValidos.length;

            perfil.totalComprado =
              pedidosValidos.reduce(
                function (
                  total,
                  pedido
                ) {

                  return total +
                    Math.max(
                      0,
                      numero(
                        pedido.resumen?.total
                      )
                    );
                },
                0
              );

            perfil.ticketPromedio =
              perfil.comprasValidas > 0
                ? perfil.totalComprado /
                  perfil.comprasValidas
                : 0;

            perfil.ultimoPedido =
              perfil.pedidos[0] ||
              null;

            perfil.ultimaEntrega =
              perfil.ultimoPedido?.entrega ||
              {};

            return perfil;
          }
        )
        .sort(
          function (a, b) {

            return fechaMillis(
              b.ultimoPedido?.creadoEn
            ) -
            fechaMillis(
              a.ultimoPedido?.creadoEn
            );
          }
        );
  }


  function claveClientePedido(
    pedido
  ) {

    const cliente =
      pedido.cliente || {};

    const identificacion =
      normalizarTexto(
        cliente.identificacion ||
        ""
      );

    if (identificacion) {
      return "id:" +
        identificacion;
    }

    const email =
      String(
        cliente.email ||
        ""
      )
        .trim()
        .toLowerCase();

    if (email) {
      return "email:" +
        email;
    }

    const telefono =
      String(
        cliente.telefono ||
        ""
      )
        .replace(
          /\D/g,
          ""
        );

    if (telefono) {
      return "tel:" +
        telefono;
    }

    if (pedido.clienteUid) {
      return "uid:" +
        pedido.clienteUid;
    }

    const nombre =
      normalizarTexto(
        nombreCliente(
          cliente
        )
      );

    return "nombre:" +
      (
        nombre ||
        pedido.id ||
        Math.random()
          .toString(36)
          .slice(2)
      );
  }


  function aplicarFiltrosClientes() {

    const busqueda =
      normalizarTexto(
        clienteBuscar?.value ||
        ""
      );

    const tipo =
      String(
        clienteFiltroTipo?.value ||
        ""
      ).trim();

    const orden =
      String(
        clienteOrden?.value ||
        "reciente"
      ).trim();

    clientesFiltrados =
      clientesActuales.filter(
        function (cliente) {

          if (
            tipo === "nuevo" &&
            cliente.pedidosNoCancelados !==
            1
          ) {
            return false;
          }

          if (
            tipo === "recurrente" &&
            cliente.pedidosNoCancelados <
            2
          ) {
            return false;
          }

          if (busqueda) {

            const texto =
              normalizarTexto(
                [
                  cliente.nombre,
                  cliente.identificacion,
                  cliente.email,
                  cliente.telefono
                ]
                  .filter(Boolean)
                  .join(" ")
              );

            if (
              !texto.includes(
                busqueda
              )
            ) {
              return false;
            }
          }

          return true;
        }
      );


    clientesFiltrados.sort(
      function (a, b) {

        if (orden === "total") {

          return (
            b.totalComprado -
            a.totalComprado
          );
        }

        if (orden === "pedidos") {

          return (
            b.totalPedidos -
            a.totalPedidos
          );
        }

        if (orden === "nombre") {

          return a.nombre.localeCompare(
            b.nombre,
            "es"
          );
        }

        return fechaMillis(
          b.ultimoPedido?.creadoEn
        ) -
        fechaMillis(
          a.ultimoPedido?.creadoEn
        );
      }
    );


    renderClientes(
      clientesFiltrados
    );

    actualizarTextoClientes();
  }


  function renderClientes(
    clientes
  ) {

    if (!clientesAdminBody) {
      return;
    }

    if (!clientes.length) {

      clientesAdminBody.innerHTML = `
        <tr>
          <td colspan="7">
            No existen clientes que coincidan con los filtros.
          </td>
        </tr>
      `;

      return;
    }

    clientesAdminBody.innerHTML =
      "";

    clientes.forEach(
      function (cliente) {

        const ultimo =
          cliente.ultimoPedido;

        const fila =
          document.createElement(
            "tr"
          );

        fila.innerHTML = `
          <td>

            <strong>
              ${escapar(
                cliente.nombre ||
                "Cliente SIXTEEN"
              )}
            </strong>

            <small class="admin-table-secondary">
              ${
                cliente.pedidosNoCancelados >=
                2
                  ? "CLIENTE RECURRENTE"
                  : "CLIENTE"
              }
            </small>

          </td>

          <td>
            ${escapar(
              cliente.identificacion ||
              "-"
            )}
          </td>

          <td>

            <strong class="cliente-contacto-principal">
              ${escapar(
                cliente.email ||
                cliente.telefono ||
                "-"
              )}
            </strong>

            ${
              cliente.email &&
              cliente.telefono
                ? `
                  <small class="admin-table-secondary">
                    ${escapar(
                      cliente.telefono
                    )}
                  </small>
                `
                : ""
            }

          </td>

          <td>
            <strong>
              ${cliente.totalPedidos}
            </strong>
          </td>

          <td>
            <strong class="cliente-total-comprado">
              ${dinero(
                cliente.totalComprado
              )}
            </strong>
          </td>

          <td>

            ${escapar(
              fechaLegible(
                ultimo?.creadoEn
              )
            )}

            <small class="admin-table-secondary">
              ${escapar(
                ultimo?.numero ||
                ""
              )}
            </small>

          </td>

          <td>

            <button
              type="button"
              class="admin-view-btn"
              data-cliente-clave="${escaparAtributo(
                cliente.clave
              )}"
            >
              VER PERFIL
            </button>

          </td>
        `;

        clientesAdminBody.appendChild(
          fila
        );
      }
    );
  }


  function actualizarResumenClientes() {

    const total =
      clientesActuales.length;

    const recurrentes =
      clientesActuales.filter(
        function (cliente) {

          return (
            cliente.pedidosNoCancelados >=
            2
          );
        }
      ).length;

    const ventas =
      clientesActuales.reduce(
        function (
          acumulado,
          cliente
        ) {

          return acumulado +
            cliente.totalComprado;
        },
        0
      );

    const comprasValidas =
      clientesActuales.reduce(
        function (
          acumulado,
          cliente
        ) {

          return acumulado +
            cliente.comprasValidas;
        },
        0
      );

    const ticket =
      comprasValidas > 0
        ? ventas /
          comprasValidas
        : 0;

    if (clientesKpiTotal) {
      clientesKpiTotal.textContent =
        total;
    }

    if (clientesKpiRecurrentes) {
      clientesKpiRecurrentes.textContent =
        recurrentes;
    }

    if (clientesKpiVentas) {
      clientesKpiVentas.textContent =
        dinero(
          ventas
        );
    }

    if (clientesKpiTicket) {
      clientesKpiTicket.textContent =
        dinero(
          ticket
        );
    }

    if (clientesBadge) {

      clientesBadge.textContent =
        total;

      clientesBadge.classList.toggle(
        "vacio",
        total === 0
      );
    }
  }


  function actualizarTextoClientes() {

    if (!clientesResultadoTexto) {
      return;
    }

    const visibles =
      clientesFiltrados.length;

    const total =
      clientesActuales.length;

    if (visibles === total) {

      clientesResultadoTexto.textContent =
        total === 1
          ? "Mostrando 1 cliente."
          : `Mostrando ${total} clientes.`;

      return;
    }

    clientesResultadoTexto.textContent =
      `Mostrando ${visibles} de ${total} clientes.`;
  }


  function limpiarFiltrosClientes() {

    if (clienteBuscar) {
      clienteBuscar.value = "";
    }

    if (clienteFiltroTipo) {
      clienteFiltroTipo.value = "";
    }

    if (clienteOrden) {
      clienteOrden.value =
        "reciente";
    }

    aplicarFiltrosClientes();
  }


  [
    clienteBuscar,
    clienteFiltroTipo,
    clienteOrden
  ]
    .filter(Boolean)
    .forEach(
      function (elemento) {

        const evento =
          elemento === clienteBuscar
            ? "input"
            : "change";

        elemento.addEventListener(
          evento,
          aplicarFiltrosClientes
        );
      }
    );


  limpiarFiltrosClientesBtn
    ?.addEventListener(
      "click",
      limpiarFiltrosClientes
    );


  clientesAdminBody
    ?.addEventListener(
      "click",
      function (event) {

        const boton =
          event.target.closest(
            "button[data-cliente-clave]"
          );

        if (!boton) {
          return;
        }

        abrirCliente(
          boton.dataset
            .clienteClave
        );
      }
    );


  function abrirCliente(
    clave
  ) {

    const cliente =
      clientesActuales.find(
        function (item) {

          return item.clave ===
            clave;
        }
      );

    if (!cliente) {

      alert(
        "El cliente ya no está disponible."
      );

      return;
    }

    clienteActualClave =
      clave;

    const ultimoPedido =
      cliente.ultimoPedido;

    const entrega =
      cliente.ultimaEntrega || {};

    clienteModalNombre.textContent =
      cliente.nombre ||
      "Cliente SIXTEEN";

    clienteModalPedidos.textContent =
      cliente.totalPedidos;

    clienteModalComprasValidas.textContent =
      cliente.comprasValidas;

    clienteModalTotal.textContent =
      dinero(
        cliente.totalComprado
      );

    clienteModalTicket.textContent =
      dinero(
        cliente.ticketPromedio
      );

    clienteModalIdentificacion.textContent =
      cliente.identificacion ||
      "-";

    clienteModalEmail.textContent =
      cliente.email ||
      "-";

    clienteModalTelefono.textContent =
      cliente.telefono ||
      "-";

    clienteModalProvincia.textContent =
      entrega.provincia ||
      "-";

    clienteModalCiudad.textContent =
      entrega.ciudad ||
      "-";

    clienteModalDireccion.textContent =
      entrega.direccion ||
      "-";

    clienteModalUltimoPedido.textContent =
      ultimoPedido?.numero ||
      ultimoPedido?.id ||
      "-";

    clienteModalUltimaCompra.textContent =
      fechaLegible(
        ultimoPedido?.creadoEn
      );

    clienteModalEstado.textContent =
      ultimoPedido?.estado ||
      "Pendiente";

    renderHistorialCliente(
      cliente
    );

    clienteAdminModal.classList.add(
      "activo"
    );

    clienteAdminModal.setAttribute(
      "aria-hidden",
      "false"
    );

    actualizarBloqueoBody();
  }


  function renderHistorialCliente(
    cliente
  ) {

    if (!clienteHistorialBody) {
      return;
    }

    if (!cliente.pedidos.length) {

      clienteHistorialBody.innerHTML = `
        <tr>
          <td colspan="6">
            Sin pedidos registrados.
          </td>
        </tr>
      `;

      return;
    }

    clienteHistorialBody.innerHTML =
      "";

    cliente.pedidos.forEach(
      function (pedido) {

        const pago =
          normalizarPago(
            pedido
          );

        const fila =
          document.createElement(
            "tr"
          );

        fila.innerHTML = `
          <td>
            <strong class="admin-code">
              ${escapar(
                pedido.numero ||
                pedido.id ||
                "-"
              )}
            </strong>
          </td>

          <td>
            ${escapar(
              fechaLegible(
                pedido.creadoEn
              )
            )}
          </td>

          <td>
            <span
              class="
                pedido-estado-badge
                ${claseEstadoPedido(
                  pedido.estado
                )}
              "
            >
              ${escapar(
                pedido.estado ||
                "Pendiente"
              )}
            </span>
          </td>

          <td>
            ${escapar(
              nombreMetodoPago(
                pago.metodo
              )
            )}
          </td>

          <td>
            <strong>
              ${dinero(
                pedido.resumen?.total
              )}
            </strong>
          </td>

          <td>
            <button
              type="button"
              class="admin-view-btn"
              data-cliente-pedido-id="${pedido.id}"
            >
              VER PEDIDO
            </button>
          </td>
        `;

        clienteHistorialBody.appendChild(
          fila
        );
      }
    );
  }


  clienteHistorialBody
    ?.addEventListener(
      "click",
      function (event) {

        const boton =
          event.target.closest(
            "button[data-cliente-pedido-id]"
          );

        if (!boton) {
          return;
        }

        const pedidoId =
          boton.dataset
            .clientePedidoId;

        cerrarCliente();

        setTimeout(
          function () {
            abrirPedido(
              pedidoId
            );
          },
          50
        );
      }
    );


  function cerrarCliente() {

    if (!clienteAdminModal) {
      return;
    }

    clienteAdminModal.classList.remove(
      "activo"
    );

    clienteAdminModal.setAttribute(
      "aria-hidden",
      "true"
    );

    clienteActualClave =
      null;

    actualizarBloqueoBody();
  }


  cerrarClienteModal
    ?.addEventListener(
      "click",
      cerrarCliente
    );


  clienteAdminModal
    ?.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          clienteAdminModal
        ) {
          cerrarCliente();
        }
      }
    );


  exportarClientesBtn
    ?.addEventListener(
      "click",
      exportarClientesCSV
    );


  function exportarClientesCSV() {

    const clientes =
      clientesFiltrados.length ||
      filtrosClientesActivos()
        ? clientesFiltrados
        : clientesActuales;

    if (!clientes.length) {

      alert(
        "No hay clientes para exportar."
      );

      return;
    }

    const filas = [
      [
        "Cliente",
        "Identificacion",
        "Correo",
        "Telefono",
        "Pedidos",
        "Pedidos no cancelados",
        "Compras validas",
        "Total comprado",
        "Ticket promedio",
        "Ultimo pedido",
        "Ultima compra",
        "Provincia",
        "Ciudad",
        "Direccion"
      ]
    ];

    clientes.forEach(
      function (cliente) {

        const entrega =
          cliente.ultimaEntrega ||
          {};

        filas.push([
          cliente.nombre || "",
          cliente.identificacion || "",
          cliente.email || "",
          cliente.telefono || "",
          cliente.totalPedidos,
          cliente.pedidosNoCancelados,
          cliente.comprasValidas,
          numero(
            cliente.totalComprado
          ).toFixed(2),
          numero(
            cliente.ticketPromedio
          ).toFixed(2),
          cliente.ultimoPedido?.numero ||
            cliente.ultimoPedido?.id ||
            "",
          fechaLegible(
            cliente.ultimoPedido?.creadoEn
          ),
          entrega.provincia || "",
          entrega.ciudad || "",
          entrega.direccion || ""
        ]);
      }
    );

    const contenido =
      filas
        .map(
          function (fila) {

            return fila
              .map(
                escaparCSV
              )
              .join(",");
          }
        )
        .join("\r\n");

    const blob =
      new Blob(
        [
          "\uFEFF" +
          contenido
        ],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const enlace =
      document.createElement(
        "a"
      );

    enlace.href =
      url;

    enlace.download =
      "sixteen-clientes-" +
      fechaArchivo() +
      ".csv";

    document.body.appendChild(
      enlace
    );

    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(
      url
    );
  }


  function filtrosClientesActivos() {

    return Boolean(
      String(
        clienteBuscar?.value ||
        ""
      ).trim() ||
      clienteFiltroTipo?.value ||
      (
        clienteOrden?.value &&
        clienteOrden.value !==
        "reciente"
      )
    );
  }


  // ========================================================
  // CUPONES Y ENVÍOS
  // ========================================================

  const TARIFAS_ENVIO_BASE = [
    ["Pichincha", 3.00],
    ["Guayas", 4.50],
    ["Azuay", 4.50],
    ["Tungurahua", 4.50],
    ["Manabí", 5.00],
    ["Loja", 5.00],
    ["Imbabura", 4.00],
    ["Cotopaxi", 4.00],
    ["Chimborazo", 4.50],
    ["El Oro", 5.00],
    ["Santo Domingo de los Tsáchilas", 4.50],
    ["Bolívar", 5.00],
    ["Cañar", 5.00],
    ["Carchi", 5.00],
    ["Esmeraldas", 5.50],
    ["Los Ríos", 5.00],
    ["Morona Santiago", 6.00],
    ["Napo", 6.00],
    ["Orellana", 6.00],
    ["Pastaza", 6.00],
    ["Santa Elena", 5.00],
    ["Sucumbíos", 6.00],
    ["Zamora Chinchipe", 6.00],
    ["Galápagos", 12.00]
  ];


  function escucharCupones() {

    if (unsubscribeCupones) {
      unsubscribeCupones();
    }

    unsubscribeCupones =
      db
        .collection("cupones")
        .onSnapshot(
          function (snapshot) {

            const datos = [];

            snapshot.forEach(
              function (doc) {

                datos.push({
                  id: doc.id,
                  ...doc.data()
                });
              }
            );

            datos.sort(
              function (a, b) {

                return String(
                  a.codigo ||
                  a.id ||
                  ""
                ).localeCompare(
                  String(
                    b.codigo ||
                    b.id ||
                    ""
                  ),
                  "es"
                );
              }
            );

            cuponesActuales =
              datos;

            aplicarFiltrosCupones();
            actualizarResumenCupones();
            emitirActualizacionBackup();
          },

          function (error) {

            console.error(
              "Firestore cupones:",
              error
            );

            if (cuponesAdminBody) {
              cuponesAdminBody.innerHTML = `
                <tr>
                  <td colspan="6">
                    No fue posible cargar los cupones. Revisa las reglas de Firestore del Paso 5.
                  </td>
                </tr>
              `;
            }
          }
        );
  }


  function aplicarFiltrosCupones() {

    const busqueda =
      normalizarTexto(
        cuponBuscar?.value ||
        ""
      );

    const filtro =
      String(
        cuponFiltroEstado?.value ||
        ""
      );

    cuponesFiltrados =
      cuponesActuales.filter(
        function (cupon) {

          const estado =
            estadoCupon(
              cupon
            );

          if (
            filtro &&
            estado !== filtro
          ) {
            return false;
          }

          if (
            busqueda &&
            !normalizarTexto(
              cupon.codigo ||
              cupon.id ||
              ""
            ).includes(
              busqueda
            )
          ) {
            return false;
          }

          return true;
        }
      );

    renderCupones(
      cuponesFiltrados
    );
  }


  function renderCupones(
    cupones
  ) {

    if (!cuponesAdminBody) {
      return;
    }

    if (!cupones.length) {

      cuponesAdminBody.innerHTML = `
        <tr>
          <td colspan="6">
            No existen cupones que coincidan con los filtros.
          </td>
        </tr>
      `;

      return;
    }

    cuponesAdminBody.innerHTML =
      "";

    cupones.forEach(
      function (cupon) {

        const estado =
          estadoCupon(
            cupon
          );

        const limite =
          Math.max(
            0,
            Math.floor(
              numero(
                cupon.limiteUsos
              )
            )
          );

        const usos =
          Math.max(
            0,
            Math.floor(
              numero(
                cupon.usosActuales
              )
            )
          );

        const fila =
          document.createElement(
            "tr"
          );

        fila.innerHTML = `
          <td>
            <strong class="admin-code">
              ${escapar(
                cupon.codigo ||
                cupon.id ||
                "-"
              )}
            </strong>
          </td>

          <td>
            <strong class="reporte-valor">
              ${numero(
                cupon.porcentaje
              )}%
            </strong>
          </td>

          <td>
            <span>
              ${escapar(
                textoVigenciaCupon(
                  cupon
                )
              )}
            </span>
          </td>

          <td>
            <strong>
              ${usos}
            </strong>
            <small class="admin-table-secondary">
              ${
                limite > 0
                  ? "de " + limite
                  : "sin límite"
              }
            </small>
          </td>

          <td>
            <span
              class="
                comercial-status-badge
                ${estado}
              "
            >
              ${escapar(
                textoEstadoCupon(
                  estado
                )
              )}
            </span>
          </td>

          <td>
            <div class="comercial-actions">

              <button
                type="button"
                class="admin-view-btn"
                data-editar-cupon="${escaparAtributo(
                  cupon.id
                )}"
              >
                EDITAR
              </button>

              <button
                type="button"
                class="admin-delete-btn"
                data-eliminar-cupon="${escaparAtributo(
                  cupon.id
                )}"
              >
                ELIMINAR
              </button>

            </div>
          </td>
        `;

        cuponesAdminBody.appendChild(
          fila
        );
      }
    );
  }


  function actualizarResumenCupones() {

    const total =
      cuponesActuales.length;

    const activos =
      cuponesActuales.filter(
        function (cupon) {

          return (
            estadoCupon(
              cupon
            ) === "activo"
          );
        }
      ).length;

    const usos =
      cuponesActuales.reduce(
        function (
          totalUsos,
          cupon
        ) {

          return totalUsos +
            Math.max(
              0,
              numero(
                cupon.usosActuales
              )
            );
        },
        0
      );

    setTexto(
      cuponesKpiTotal,
      String(
        total
      )
    );

    setTexto(
      cuponesKpiActivos,
      String(
        activos
      )
    );

    setTexto(
      cuponesKpiUsos,
      String(
        Math.floor(
          usos
        )
      )
    );
  }


  function estadoCupon(
    cupon
  ) {

    if (
      cupon.activo !==
      true
    ) {
      return "inactivo";
    }

    const hoy =
      fechaISOHoy();

    const inicio =
      String(
        cupon.fechaInicio ||
        ""
      );

    const fin =
      String(
        cupon.fechaFin ||
        ""
      );

    if (
      inicio &&
      hoy < inicio
    ) {
      return "inactivo";
    }

    if (
      fin &&
      hoy > fin
    ) {
      return "vencido";
    }

    const limite =
      Math.max(
        0,
        Math.floor(
          numero(
            cupon.limiteUsos
          )
        )
      );

    const usos =
      Math.max(
        0,
        Math.floor(
          numero(
            cupon.usosActuales
          )
        )
      );

    if (
      limite > 0 &&
      usos >= limite
    ) {
      return "vencido";
    }

    return "activo";
  }


  function textoEstadoCupon(
    estado
  ) {

    const textos = {
      activo:
        "Activo",

      inactivo:
        "Inactivo",

      vencido:
        "Vencido / agotado"
    };

    return textos[estado] ||
      estado;
  }


  function textoVigenciaCupon(
    cupon
  ) {

    const inicio =
      cupon.fechaInicio ||
      "";

    const fin =
      cupon.fechaFin ||
      "";

    if (
      !inicio &&
      !fin
    ) {
      return "Sin fecha límite";
    }

    if (
      inicio &&
      fin
    ) {
      return inicio +
        " → " +
        fin;
    }

    if (inicio) {
      return "Desde " +
        inicio;
    }

    return "Hasta " +
      fin;
  }


  cuponBuscar
    ?.addEventListener(
      "input",
      aplicarFiltrosCupones
    );


  cuponFiltroEstado
    ?.addEventListener(
      "change",
      aplicarFiltrosCupones
    );


  nuevoCuponBtn
    ?.addEventListener(
      "click",
      function () {

        abrirCuponModal();
      }
    );


  cuponesAdminBody
    ?.addEventListener(
      "click",
      function (event) {

        const editar =
          event.target.closest(
            "button[data-editar-cupon]"
          );

        if (editar) {

          abrirCuponModal(
            editar.dataset
              .editarCupon
          );

          return;
        }

        const eliminar =
          event.target.closest(
            "button[data-eliminar-cupon]"
          );

        if (eliminar) {

          eliminarCupon(
            eliminar.dataset
              .eliminarCupon
          );
        }
      }
    );


  function abrirCuponModal(
    cuponId = null
  ) {

    cuponEditandoId =
      cuponId;

    const cupon =
      cuponId
        ? cuponesActuales.find(
            function (item) {
              return item.id ===
                cuponId;
            }
          )
        : null;

    if (cuponModalTitulo) {
      cuponModalTitulo.textContent =
        cupon
          ? "Editar cupón"
          : "Nuevo cupón";
    }

    if (cuponCodigo) {

      cuponCodigo.value =
        cupon?.codigo ||
        "";

      cuponCodigo.disabled =
        Boolean(
          cupon
        );
    }

    if (cuponPorcentaje) {
      cuponPorcentaje.value =
        String(
          Math.max(
            1,
            numero(
              cupon?.porcentaje ||
              10
            )
          )
        );
    }

    if (cuponFechaInicio) {
      cuponFechaInicio.value =
        cupon?.fechaInicio ||
        "";
    }

    if (cuponFechaFin) {
      cuponFechaFin.value =
        cupon?.fechaFin ||
        "";
    }

    if (cuponLimiteUsos) {
      cuponLimiteUsos.value =
        String(
          Math.max(
            0,
            Math.floor(
              numero(
                cupon?.limiteUsos
              )
            )
          )
        );
    }

    if (cuponActivo) {
      cuponActivo.checked =
        cupon
          ? cupon.activo ===
            true
          : true;
    }

    mostrarMensajeComercial(
      cuponMensaje,
      ""
    );

    cuponModal.classList.add(
      "activo"
    );

    cuponModal.setAttribute(
      "aria-hidden",
      "false"
    );

    actualizarBloqueoBody();

    if (!cupon) {
      setTimeout(
        function () {
          cuponCodigo?.focus();
        },
        50
      );
    }
  }


  function cerrarCuponModalFn() {

    if (!cuponModal) {
      return;
    }

    cuponModal.classList.remove(
      "activo"
    );

    cuponModal.setAttribute(
      "aria-hidden",
      "true"
    );

    cuponEditandoId =
      null;

    if (cuponCodigo) {
      cuponCodigo.disabled =
        false;
    }

    actualizarBloqueoBody();
  }


  cerrarCuponModal
    ?.addEventListener(
      "click",
      cerrarCuponModalFn
    );


  cancelarCuponBtn
    ?.addEventListener(
      "click",
      cerrarCuponModalFn
    );


  cuponModal
    ?.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          cuponModal
        ) {
          cerrarCuponModalFn();
        }
      }
    );


  cuponCodigo
    ?.addEventListener(
      "input",
      function () {

        cuponCodigo.value =
          normalizarCodigoCupon(
            cuponCodigo.value
          );
      }
    );


  cuponForm
    ?.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        if (!usuarioActual) {
          return;
        }

        const codigo =
          normalizarCodigoCupon(
            cuponCodigo?.value ||
            ""
          );

        const porcentaje =
          Math.max(
            1,
            Math.min(
              100,
              Math.floor(
                numero(
                  cuponPorcentaje?.value
                )
              )
            )
          );

        const fechaInicio =
          String(
            cuponFechaInicio?.value ||
            ""
          );

        const fechaFin =
          String(
            cuponFechaFin?.value ||
            ""
          );

        const limiteUsos =
          Math.max(
            0,
            Math.floor(
              numero(
                cuponLimiteUsos?.value
              )
            )
          );

        if (
          !codigo ||
          codigo.length <
          3
        ) {

          mostrarMensajeComercial(
            cuponMensaje,
            "El código debe tener al menos 3 caracteres.",
            false
          );

          return;
        }

        if (
          fechaInicio &&
          fechaFin &&
          fechaFin < fechaInicio
        ) {

          mostrarMensajeComercial(
            cuponMensaje,
            "La fecha final no puede ser anterior a la fecha inicial.",
            false
          );

          return;
        }

        guardarCuponBtn.disabled =
          true;

        guardarCuponBtn.textContent =
          "GUARDANDO...";

        mostrarMensajeComercial(
          cuponMensaje,
          "Guardando cupón...",
          true
        );

        try {

          const docId =
            cuponEditandoId ||
            codigo;

          const ref =
            db
              .collection("cupones")
              .doc(
                docId
              );

          if (!cuponEditandoId) {

            const existente =
              await ref.get();

            if (existente.exists) {
              throw new Error(
                "Ya existe un cupón con ese código."
              );
            }
          }

          const existente =
            cuponEditandoId
              ? cuponesActuales.find(
                  function (item) {
                    return item.id ===
                      cuponEditandoId;
                  }
                )
              : null;

          const datos = {
            codigo:
              codigo,

            porcentaje:
              porcentaje,

            fechaInicio:
              fechaInicio,

            fechaFin:
              fechaFin,

            limiteUsos:
              limiteUsos,

            usosActuales:
              Math.max(
                0,
                Math.floor(
                  numero(
                    existente?.usosActuales
                  )
                )
              ),

            activo:
              cuponActivo?.checked ===
              true,

            actualizadoEn:
              FieldValue.serverTimestamp(),

            actualizadoPor:
              usuarioActual.email ||
              usuarioActual.uid
          };

          if (!existente) {
            datos.creadoEn =
              FieldValue.serverTimestamp();
          }

          await ref.set(
            datos,
            {
              merge:
                true
            }
          );

          mostrarMensajeComercial(
            cuponMensaje,
            "Cupón guardado correctamente.",
            true
          );

          setTimeout(
            cerrarCuponModalFn,
            550
          );

        } catch (error) {

          console.error(
            "Guardar cupón:",
            error
          );

          mostrarMensajeComercial(
            cuponMensaje,
            error.message ||
            "No fue posible guardar el cupón.",
            false
          );

        } finally {

          guardarCuponBtn.disabled =
            false;

          guardarCuponBtn.textContent =
            "GUARDAR CUPÓN";
        }
      }
    );


  async function eliminarCupon(
    cuponId
  ) {

    const cupon =
      cuponesActuales.find(
        function (item) {
          return item.id ===
            cuponId;
        }
      );

    if (!cupon) {
      return;
    }

    const confirmar =
      window.confirm(
        "¿Eliminar el cupón " +
        (
          cupon.codigo ||
          cupon.id
        ) +
        "?"
      );

    if (!confirmar) {
      return;
    }

    try {

      await db
        .collection("cupones")
        .doc(
          cuponId
        )
        .delete();

    } catch (error) {

      console.error(
        "Eliminar cupón:",
        error
      );

      alert(
        "No fue posible eliminar el cupón."
      );
    }
  }


  function escucharEnvios() {

    if (unsubscribeEnvios) {
      unsubscribeEnvios();
    }

    unsubscribeEnvios =
      db
        .collection("envios")
        .onSnapshot(
          async function (snapshot) {

            const datos = [];

            snapshot.forEach(
              function (doc) {

                datos.push({
                  id: doc.id,
                  ...doc.data()
                });
              }
            );

            if (
              datos.length === 0 &&
              !sembrandoEnvios
            ) {

              try {
                await crearTarifasBase(
                  false
                );
              } catch (error) {
                console.error(
                  "Crear tarifas base:",
                  error
                );
              }

              return;
            }

            datos.sort(
              function (a, b) {

                return numero(
                  a.orden
                ) -
                numero(
                  b.orden
                );
              }
            );

            enviosActuales =
              datos;

            renderEnvios();
            actualizarResumenEnvios();
            emitirActualizacionBackup();
          },

          function (error) {

            console.error(
              "Firestore envíos:",
              error
            );

            if (enviosAdminBody) {
              enviosAdminBody.innerHTML = `
                <tr>
                  <td colspan="5">
                    No fue posible cargar las tarifas. Revisa las reglas de Firestore del Paso 5.
                  </td>
                </tr>
              `;
            }
          }
        );
  }


  function renderEnvios() {

    if (!enviosAdminBody) {
      return;
    }

    if (!enviosActuales.length) {

      enviosAdminBody.innerHTML = `
        <tr>
          <td colspan="5">
            No existen tarifas de envío.
          </td>
        </tr>
      `;

      return;
    }

    enviosAdminBody.innerHTML =
      "";

    enviosActuales.forEach(
      function (envio) {

        const fila =
          document.createElement(
            "tr"
          );

        fila.innerHTML = `
          <td>
            <strong>
              ${escapar(
                envio.provincia ||
                "-"
              )}
            </strong>
          </td>

          <td>
            <strong class="reporte-valor">
              ${dinero(
                envio.tarifa
              )}
            </strong>
          </td>

          <td>
            <span
              class="
                comercial-status-badge
                ${
                  envio.activo ===
                  true
                    ? "activo"
                    : "inactivo"
                }
              "
            >
              ${
                envio.activo ===
                true
                  ? "Activa"
                  : "Inactiva"
              }
            </span>
          </td>

          <td>
            ${escapar(
              fechaLegible(
                envio.actualizadoEn
              )
            )}
          </td>

          <td>
            <button
              type="button"
              class="admin-view-btn"
              data-editar-envio="${escaparAtributo(
                envio.id
              )}"
            >
              EDITAR
            </button>
          </td>
        `;

        enviosAdminBody.appendChild(
          fila
        );
      }
    );
  }


  function actualizarResumenEnvios() {

    const total =
      enviosActuales.length;

    const activos =
      enviosActuales.filter(
        function (envio) {
          return envio.activo ===
            true;
        }
      );

    const promedio =
      activos.length > 0
        ? activos.reduce(
            function (
              suma,
              envio
            ) {
              return suma +
                Math.max(
                  0,
                  numero(
                    envio.tarifa
                  )
                );
            },
            0
          ) /
          activos.length
        : 0;

    setTexto(
      enviosKpiTotal,
      String(
        total
      )
    );

    setTexto(
      enviosKpiActivos,
      String(
        activos.length
      )
    );

    setTexto(
      enviosKpiPromedio,
      dinero(
        promedio
      )
    );
  }


  enviosAdminBody
    ?.addEventListener(
      "click",
      function (event) {

        const boton =
          event.target.closest(
            "button[data-editar-envio]"
          );

        if (!boton) {
          return;
        }

        abrirEnvioModal(
          boton.dataset
            .editarEnvio
        );
      }
    );


  restaurarTarifasBtn
    ?.addEventListener(
      "click",
      async function () {

        const confirmar =
          window.confirm(
            "Esto restaurará las 24 tarifas base de SIXTEEN. ¿Continuar?"
          );

        if (!confirmar) {
          return;
        }

        restaurarTarifasBtn.disabled =
          true;

        restaurarTarifasBtn.textContent =
          "RESTAURANDO...";

        try {

          await crearTarifasBase(
            true
          );

          alert(
            "Tarifas base restauradas."
          );

        } catch (error) {

          console.error(
            "Restaurar tarifas:",
            error
          );

          alert(
            "No fue posible restaurar las tarifas."
          );

        } finally {

          restaurarTarifasBtn.disabled =
            false;

          restaurarTarifasBtn.textContent =
            "RESTAURAR TARIFAS BASE";
        }
      }
    );


  async function crearTarifasBase(
    sobrescribir
  ) {

    if (sembrandoEnvios) {
      return;
    }

    sembrandoEnvios =
      true;

    try {

      const batch =
        db.batch();

      TARIFAS_ENVIO_BASE.forEach(
        function (
          item,
          indice
        ) {

          const provincia =
            item[0];

          const tarifa =
            item[1];

          const docId =
            slugDocumento(
              provincia
            );

          const ref =
            db
              .collection("envios")
              .doc(
                docId
              );

          const datos = {
            provincia:
              provincia,

            tarifa:
              tarifa,

            activo:
              true,

            orden:
              indice + 1,

            actualizadoEn:
              FieldValue.serverTimestamp(),

            actualizadoPor:
              usuarioActual?.email ||
              usuarioActual?.uid ||
              "admin"
          };

          if (sobrescribir) {

            batch.set(
              ref,
              datos,
              {
                merge:
                  true
              }
            );

          } else {

            batch.set(
              ref,
              {
                ...datos,
                creadoEn:
                  FieldValue.serverTimestamp()
              },
              {
                merge:
                  false
              }
            );
          }
        }
      );

      await batch.commit();

    } finally {

      sembrandoEnvios =
        false;
    }
  }


  function abrirEnvioModal(
    envioId
  ) {

    const envio =
      enviosActuales.find(
        function (item) {
          return item.id ===
            envioId;
        }
      );

    if (!envio) {
      return;
    }

    envioEditandoId =
      envioId;

    setTexto(
      envioModalProvincia,
      envio.provincia ||
      "-"
    );

    if (envioTarifa) {
      envioTarifa.value =
        numero(
          envio.tarifa
        ).toFixed(
          2
        );
    }

    if (envioActivo) {
      envioActivo.checked =
        envio.activo ===
        true;
    }

    mostrarMensajeComercial(
      envioMensaje,
      ""
    );

    envioModal.classList.add(
      "activo"
    );

    envioModal.setAttribute(
      "aria-hidden",
      "false"
    );

    actualizarBloqueoBody();
  }


  function cerrarEnvioModalFn() {

    if (!envioModal) {
      return;
    }

    envioModal.classList.remove(
      "activo"
    );

    envioModal.setAttribute(
      "aria-hidden",
      "true"
    );

    envioEditandoId =
      null;

    actualizarBloqueoBody();
  }


  cerrarEnvioModal
    ?.addEventListener(
      "click",
      cerrarEnvioModalFn
    );


  cancelarEnvioBtn
    ?.addEventListener(
      "click",
      cerrarEnvioModalFn
    );


  envioModal
    ?.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          envioModal
        ) {
          cerrarEnvioModalFn();
        }
      }
    );


  envioForm
    ?.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        if (
          !envioEditandoId ||
          !usuarioActual
        ) {
          return;
        }

        const tarifa =
          Math.max(
            0,
            numero(
              envioTarifa?.value
            )
          );

        guardarEnvioBtn.disabled =
          true;

        guardarEnvioBtn.textContent =
          "GUARDANDO...";

        mostrarMensajeComercial(
          envioMensaje,
          "Actualizando tarifa...",
          true
        );

        try {

          await db
            .collection("envios")
            .doc(
              envioEditandoId
            )
            .update({
              tarifa:
                tarifa,

              activo:
                envioActivo?.checked ===
                true,

              actualizadoEn:
                FieldValue.serverTimestamp(),

              actualizadoPor:
                usuarioActual.email ||
                usuarioActual.uid
            });

          mostrarMensajeComercial(
            envioMensaje,
            "Tarifa actualizada.",
            true
          );

          setTimeout(
            cerrarEnvioModalFn,
            500
          );

        } catch (error) {

          console.error(
            "Actualizar envío:",
            error
          );

          mostrarMensajeComercial(
            envioMensaje,
            error.message ||
            "No fue posible actualizar la tarifa.",
            false
          );

        } finally {

          guardarEnvioBtn.disabled =
            false;

          guardarEnvioBtn.textContent =
            "GUARDAR TARIFA";
        }
      }
    );


  function normalizarCodigoCupon(
    valor
  ) {

    return String(
      valor ||
      ""
    )
      .trim()
      .toUpperCase()
      .replace(
        /[^A-Z0-9_-]/g,
        ""
      )
      .slice(
        0,
        30
      );
  }


  function slugDocumento(
    valor
  ) {

    return normalizarTexto(
      valor
    )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );
  }


  function fechaISOHoy() {

    const hoy =
      new Date();

    const yyyy =
      hoy.getFullYear();

    const mm =
      String(
        hoy.getMonth() +
        1
      ).padStart(
        2,
        "0"
      );

    const dd =
      String(
        hoy.getDate()
      ).padStart(
        2,
        "0"
      );

    return (
      yyyy +
      "-" +
      mm +
      "-" +
      dd
    );
  }


  function mostrarMensajeComercial(
    elemento,
    texto,
    correcto = false
  ) {

    if (!elemento) {
      return;
    }

    elemento.textContent =
      texto ||
      "";

    elemento.className =
      "producto-mensaje";

    if (
      texto &&
      correcto
    ) {
      elemento.classList.add(
        "correcto"
      );
    }
  }


  // ========================================================
  // DASHBOARD Y REPORTES
  // ========================================================

  const ESTADOS_VENTA_REPORTE =
    new Set([
      "Confirmado",
      "En preparación",
      "Enviado",
      "Entregado"
    ]);


  reportePeriodoDias
    ?.addEventListener(
      "change",
      actualizarReportes
    );


  exportarReporteBtn
    ?.addEventListener(
      "click",
      exportarReporteCSV
    );


  function actualizarReportes() {

    const pedidosVenta =
      pedidosActuales.filter(
        function (pedido) {

          return ESTADOS_VENTA_REPORTE.has(
            pedido.estado
          );
        }
      );

    const ahora =
      new Date();

    const inicioHoy =
      new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        0,
        0,
        0,
        0
      );

    const finHoy =
      new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        23,
        59,
        59,
        999
      );

    const inicioSemana =
      inicioSemanaActual(
        ahora
      );

    const inicioMes =
      new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        1,
        0,
        0,
        0,
        0
      );

    const hoy =
      resumenPeriodoVentas(
        pedidosVenta,
        inicioHoy,
        finHoy
      );

    const semana =
      resumenPeriodoVentas(
        pedidosVenta,
        inicioSemana,
        ahora
      );

    const mes =
      resumenPeriodoVentas(
        pedidosVenta,
        inicioMes,
        ahora
      );

    const totalVentas =
      pedidosVenta.reduce(
        function (total, pedido) {

          return total +
            Math.max(
              0,
              numero(
                pedido.resumen?.total
              )
            );
        },
        0
      );

    const ticketPromedio =
      pedidosVenta.length > 0
        ? totalVentas /
          pedidosVenta.length
        : 0;

    const unidadesVendidas =
      pedidosVenta.reduce(
        function (total, pedido) {

          const productos =
            Array.isArray(
              pedido.productos
            )
              ? pedido.productos
              : [];

          return total +
            productos.reduce(
              function (
                subtotal,
                item
              ) {

                return subtotal +
                  Math.max(
                    0,
                    Math.floor(
                      numero(
                        item.cantidad
                      )
                    )
                  );
              },
              0
            );
        },
        0
      );

    const recurrentes =
      clientesActuales.filter(
        function (cliente) {

          return (
            cliente.pedidosNoCancelados >=
            2
          );
        }
      ).length;

    setTexto(
      reporteVentaHoy,
      dinero(
        hoy.total
      )
    );

    setTexto(
      reportePedidosHoy,
      textoCantidad(
        hoy.cantidad,
        "pedido",
        "pedidos"
      )
    );

    setTexto(
      reporteVentaSemana,
      dinero(
        semana.total
      )
    );

    setTexto(
      reportePedidosSemana,
      textoCantidad(
        semana.cantidad,
        "pedido",
        "pedidos"
      )
    );

    setTexto(
      reporteVentaMes,
      dinero(
        mes.total
      )
    );

    setTexto(
      reportePedidosMes,
      textoCantidad(
        mes.cantidad,
        "pedido",
        "pedidos"
      )
    );

    setTexto(
      reporteTicketPromedio,
      dinero(
        ticketPromedio
      )
    );

    setTexto(
      reporteVentasValidas,
      textoCantidad(
        pedidosVenta.length,
        "compra válida",
        "compras válidas"
      )
    );

    setTexto(
      reporteUnidadesVendidas,
      String(
        unidadesVendidas
      )
    );

    setTexto(
      reporteClientesRecurrentes,
      String(
        recurrentes
      )
    );

    setTexto(
      reporteClientesTotal,
      textoCantidad(
        clientesActuales.length,
        "cliente",
        "clientes"
      )
    );

    renderEvolucionVentas(
      pedidosVenta
    );

    renderPedidosPorEstado();

    renderTopProductos(
      pedidosVenta
    );

    renderTopClientes();

    renderMetodosPago(
      pedidosVenta
    );
  }


  function resumenPeriodoVentas(
    pedidos,
    desde,
    hasta
  ) {

    const filtrados =
      pedidos.filter(
        function (pedido) {

          const fecha =
            fechaComoDate(
              pedido.creadoEn
            );

          if (!fecha) {
            return false;
          }

          return (
            fecha >= desde &&
            fecha <= hasta
          );
        }
      );

    return {
      cantidad:
        filtrados.length,

      total:
        filtrados.reduce(
          function (
            acumulado,
            pedido
          ) {

            return acumulado +
              Math.max(
                0,
                numero(
                  pedido.resumen?.total
                )
              );
          },
          0
        )
    };
  }


  function inicioSemanaActual(
    fecha
  ) {

    const copia =
      new Date(
        fecha
      );

    const dia =
      copia.getDay();

    const diferencia =
      dia === 0
        ? -6
        : 1 - dia;

    copia.setDate(
      copia.getDate() +
      diferencia
    );

    copia.setHours(
      0,
      0,
      0,
      0
    );

    return copia;
  }


  function renderEvolucionVentas(
    pedidosVenta
  ) {

    if (!ventasChart) {
      return;
    }

    const dias =
      Math.max(
        7,
        Math.min(
          90,
          Math.floor(
            numero(
              reportePeriodoDias?.value ||
              30
            )
          )
        )
      );

    const hoy =
      new Date();

    hoy.setHours(
      0,
      0,
      0,
      0
    );

    const mapa =
      new Map();

    for (
      let i = dias - 1;
      i >= 0;
      i--
    ) {

      const fecha =
        new Date(
          hoy
        );

      fecha.setDate(
        hoy.getDate() -
        i
      );

      const clave =
        claveFechaLocal(
          fecha
        );

      mapa.set(
        clave,
        {
          fecha:
            fecha,

          total:
            0,

          pedidos:
            0
        }
      );
    }

    pedidosVenta.forEach(
      function (pedido) {

        const fecha =
          fechaComoDate(
            pedido.creadoEn
          );

        if (!fecha) {
          return;
        }

        const clave =
          claveFechaLocal(
            fecha
          );

        const registro =
          mapa.get(
            clave
          );

        if (!registro) {
          return;
        }

        registro.total +=
          Math.max(
            0,
            numero(
              pedido.resumen?.total
            )
          );

        registro.pedidos +=
          1;
      }
    );

    const datos =
      Array.from(
        mapa.values()
      );

    const totalPeriodo =
      datos.reduce(
        function (
          total,
          item
        ) {

          return total +
            item.total;
        },
        0
      );

    setTexto(
      reportePeriodoTotal,
      dinero(
        totalPeriodo
      )
    );

    const maximo =
      Math.max(
        1,
        ...datos.map(
          function (item) {
            return item.total;
          }
        )
      );

    const mostrarCada =
      dias <= 7
        ? 1
        : (
            dias <= 30
              ? 5
              : 15
          );

    ventasChart.innerHTML =
      "";

    datos.forEach(
      function (
        item,
        indice
      ) {

        const porcentaje =
          item.total > 0
            ? Math.max(
                4,
                (
                  item.total /
                  maximo
                ) *
                100
              )
            : 1;

        const barra =
          document.createElement(
            "div"
          );

        barra.className =
          "venta-dia";

        const mostrarEtiqueta =
          indice %
            mostrarCada ===
            0 ||
          indice ===
            datos.length - 1;

        barra.innerHTML = `
          <div
            class="venta-dia-valor"
            title="${escaparAtributo(
              fechaCortaReporte(
                item.fecha
              ) +
              " · " +
              dinero(
                item.total
              ) +
              " · " +
              textoCantidad(
                item.pedidos,
                "pedido",
                "pedidos"
              )
            )}"
          >
            <span
              style="height:${porcentaje.toFixed(2)}%"
            ></span>
          </div>

          <small class="${
            mostrarEtiqueta
              ? ""
              : "venta-dia-etiqueta-oculta"
          }">
            ${escapar(
              fechaMiniReporte(
                item.fecha
              )
            )}
          </small>
        `;

        ventasChart.appendChild(
          barra
        );
      }
    );
  }


  function renderPedidosPorEstado() {

    if (!pedidosEstadoChart) {
      return;
    }

    const estados = [
      "Pendiente",
      "Confirmado",
      "En preparación",
      "Enviado",
      "Entregado",
      "Cancelado"
    ];

    const datos =
      estados.map(
        function (estado) {

          return {
            estado:
              estado,

            cantidad:
              pedidosActuales.filter(
                function (pedido) {

                  return (
                    pedido.estado ||
                    "Pendiente"
                  ) === estado;
                }
              ).length
          };
        }
      );

    const maximo =
      Math.max(
        1,
        ...datos.map(
          function (item) {
            return item.cantidad;
          }
        )
      );

    pedidosEstadoChart.innerHTML =
      "";

    datos.forEach(
      function (item) {

        const porcentaje =
          (
            item.cantidad /
            maximo
          ) *
          100;

        const fila =
          document.createElement(
            "div"
          );

        fila.className =
          "estado-chart-row";

        fila.innerHTML = `
          <div class="estado-chart-label">
            <span>
              ${escapar(
                item.estado
              )}
            </span>

            <strong>
              ${item.cantidad}
            </strong>
          </div>

          <div class="estado-chart-track">
            <span
              style="width:${porcentaje.toFixed(2)}%"
            ></span>
          </div>
        `;

        pedidosEstadoChart.appendChild(
          fila
        );
      }
    );
  }


  function renderTopProductos(
    pedidosVenta
  ) {

    if (!topProductosBody) {
      return;
    }

    const mapa =
      new Map();

    pedidosVenta.forEach(
      function (pedido) {

        const productos =
          Array.isArray(
            pedido.productos
          )
            ? pedido.productos
            : [];

        productos.forEach(
          function (item) {

            const clave =
              String(
                item.codigo ||
                item.id ||
                item.nombre ||
                "producto"
              )
                .trim()
                .toUpperCase();

            if (!mapa.has(clave)) {

              mapa.set(
                clave,
                {
                  nombre:
                    item.nombre ||
                    item.codigo ||
                    "Producto",

                  codigo:
                    item.codigo ||
                    "",

                  unidades:
                    0,

                  ventas:
                    0
                }
              );
            }

            const registro =
              mapa.get(
                clave
              );

            const cantidad =
              Math.max(
                0,
                Math.floor(
                  numero(
                    item.cantidad
                  )
                )
              );

            const precio =
              Math.max(
                0,
                numero(
                  item.precioUnitario ??
                  item.precio
                )
              );

            registro.unidades +=
              cantidad;

            registro.ventas +=
              cantidad *
              precio;
          }
        );
      }
    );

    const ranking =
      Array.from(
        mapa.values()
      )
        .sort(
          function (a, b) {

            if (
              b.unidades !==
              a.unidades
            ) {
              return (
                b.unidades -
                a.unidades
              );
            }

            return (
              b.ventas -
              a.ventas
            );
          }
        )
        .slice(
          0,
          5
        );

    if (!ranking.length) {

      topProductosBody.innerHTML = `
        <tr>
          <td colspan="4">
            Sin ventas registradas.
          </td>
        </tr>
      `;

      return;
    }

    topProductosBody.innerHTML =
      "";

    ranking.forEach(
      function (
        item,
        indice
      ) {

        const fila =
          document.createElement(
            "tr"
          );

        fila.innerHTML = `
          <td>
            <strong class="reporte-posicion">
              ${indice + 1}
            </strong>
          </td>

          <td>
            <strong>
              ${escapar(
                item.nombre
              )}
            </strong>

            <small class="admin-table-secondary">
              ${escapar(
                item.codigo
              )}
            </small>
          </td>

          <td>
            <strong>
              ${item.unidades}
            </strong>
          </td>

          <td>
            <strong class="reporte-valor">
              ${dinero(
                item.ventas
              )}
            </strong>
          </td>
        `;

        topProductosBody.appendChild(
          fila
        );
      }
    );
  }


  function renderTopClientes() {

    if (!topClientesBody) {
      return;
    }

    const ranking =
      [...clientesActuales]
        .filter(
          function (cliente) {

            return (
              cliente.totalComprado >
              0
            );
          }
        )
        .sort(
          function (a, b) {

            return (
              b.totalComprado -
              a.totalComprado
            );
          }
        )
        .slice(
          0,
          5
        );

    if (!ranking.length) {

      topClientesBody.innerHTML = `
        <tr>
          <td colspan="4">
            Sin clientes con compras válidas.
          </td>
        </tr>
      `;

      return;
    }

    topClientesBody.innerHTML =
      "";

    ranking.forEach(
      function (
        cliente,
        indice
      ) {

        const fila =
          document.createElement(
            "tr"
          );

        fila.innerHTML = `
          <td>
            <strong class="reporte-posicion">
              ${indice + 1}
            </strong>
          </td>

          <td>
            <strong>
              ${escapar(
                cliente.nombre ||
                "Cliente SIXTEEN"
              )}
            </strong>

            <small class="admin-table-secondary">
              ${escapar(
                cliente.identificacion ||
                cliente.email ||
                ""
              )}
            </small>
          </td>

          <td>
            <strong>
              ${cliente.comprasValidas}
            </strong>
          </td>

          <td>
            <strong class="reporte-valor">
              ${dinero(
                cliente.totalComprado
              )}
            </strong>
          </td>
        `;

        topClientesBody.appendChild(
          fila
        );
      }
    );
  }


  function renderMetodosPago(
    pedidosVenta
  ) {

    if (!metodosPagoChart) {
      return;
    }

    const mapa =
      new Map();

    pedidosVenta.forEach(
      function (pedido) {

        const pago =
          normalizarPago(
            pedido
          );

        const metodo =
          pago.metodo ||
          "otro";

        if (!mapa.has(metodo)) {

          mapa.set(
            metodo,
            {
              metodo:
                metodo,

              cantidad:
                0,

              total:
                0
            }
          );
        }

        const registro =
          mapa.get(
            metodo
          );

        registro.cantidad +=
          1;

        registro.total +=
          Math.max(
            0,
            numero(
              pedido.resumen?.total
            )
          );
      }
    );

    const datos =
      Array.from(
        mapa.values()
      )
        .sort(
          function (a, b) {

            return (
              b.total -
              a.total
            );
          }
        );

    if (!datos.length) {

      metodosPagoChart.innerHTML = `
        <p class="reportes-vacio">
          Sin ventas registradas.
        </p>
      `;

      return;
    }

    const maximo =
      Math.max(
        1,
        ...datos.map(
          function (item) {
            return item.total;
          }
        )
      );

    metodosPagoChart.innerHTML =
      "";

    datos.forEach(
      function (item) {

        const porcentaje =
          (
            item.total /
            maximo
          ) *
          100;

        const fila =
          document.createElement(
            "div"
          );

        fila.className =
          "metodo-pago-row";

        fila.innerHTML = `
          <div class="metodo-pago-head">

            <span>
              ${escapar(
                nombreMetodoPago(
                  item.metodo
                )
              )}
            </span>

            <strong>
              ${dinero(
                item.total
              )}
            </strong>

          </div>

          <div class="metodo-pago-meta">

            <small>
              ${textoCantidad(
                item.cantidad,
                "pedido",
                "pedidos"
              )}
            </small>

          </div>

          <div class="metodo-pago-track">
            <span
              style="width:${porcentaje.toFixed(2)}%"
            ></span>
          </div>
        `;

        metodosPagoChart.appendChild(
          fila
        );
      }
    );
  }


  function exportarReporteCSV() {

    const pedidosVenta =
      pedidosActuales.filter(
        function (pedido) {

          return ESTADOS_VENTA_REPORTE.has(
            pedido.estado
          );
        }
      );

    if (!pedidosVenta.length) {

      alert(
        "No existen ventas válidas para exportar."
      );

      return;
    }

    const filas = [
      [
        "Numero",
        "Fecha",
        "Cliente",
        "Identificacion",
        "Estado",
        "Metodo de pago",
        "Estado de pago",
        "Subtotal",
        "Descuento",
        "Envio",
        "Total",
        "Unidades"
      ]
    ];

    pedidosVenta
      .slice()
      .sort(
        function (a, b) {

          return fechaMillis(
            b.creadoEn
          ) -
          fechaMillis(
            a.creadoEn
          );
        }
      )
      .forEach(
        function (pedido) {

          const cliente =
            pedido.cliente ||
            {};

          const pago =
            normalizarPago(
              pedido
            );

          const productos =
            Array.isArray(
              pedido.productos
            )
              ? pedido.productos
              : [];

          const unidades =
            productos.reduce(
              function (
                total,
                item
              ) {

                return total +
                  Math.max(
                    0,
                    Math.floor(
                      numero(
                        item.cantidad
                      )
                    )
                  );
              },
              0
            );

          filas.push([
            pedido.numero ||
              pedido.id ||
              "",

            fechaLegible(
              pedido.creadoEn
            ),

            nombreCliente(
              cliente
            ),

            cliente.identificacion ||
              "",

            pedido.estado ||
              "",

            nombreMetodoPago(
              pago.metodo
            ),

            pago.estado ||
              "",

            numero(
              pedido.resumen?.subtotal
            ).toFixed(2),

            numero(
              pedido.resumen?.descuento
            ).toFixed(2),

            numero(
              pedido.resumen?.envio
            ).toFixed(2),

            numero(
              pedido.resumen?.total
            ).toFixed(2),

            unidades
          ]);
        }
      );

    const contenido =
      filas
        .map(
          function (fila) {

            return fila
              .map(
                escaparCSV
              )
              .join(",");
          }
        )
        .join("\r\n");

    const blob =
      new Blob(
        [
          "\uFEFF" +
          contenido
        ],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const enlace =
      document.createElement(
        "a"
      );

    enlace.href =
      url;

    enlace.download =
      "sixteen-reporte-ventas-" +
      fechaArchivo() +
      ".csv";

    document.body.appendChild(
      enlace
    );

    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(
      url
    );
  }


  function claveFechaLocal(
    fecha
  ) {

    const yyyy =
      fecha.getFullYear();

    const mm =
      String(
        fecha.getMonth() +
        1
      ).padStart(
        2,
        "0"
      );

    const dd =
      String(
        fecha.getDate()
      ).padStart(
        2,
        "0"
      );

    return (
      yyyy +
      "-" +
      mm +
      "-" +
      dd
    );
  }


  function fechaMiniReporte(
    fecha
  ) {

    return fecha.toLocaleDateString(
      "es-EC",
      {
        day:
          "2-digit",

        month:
          "short"
      }
    );
  }


  function fechaCortaReporte(
    fecha
  ) {

    return fecha.toLocaleDateString(
      "es-EC",
      {
        day:
          "2-digit",

        month:
          "short",

        year:
          "numeric"
      }
    );
  }


  function textoCantidad(
    cantidad,
    singular,
    plural
  ) {

    const numeroCantidad =
      Math.max(
        0,
        Math.floor(
          numero(
            cantidad
          )
        )
      );

    return (
      numeroCantidad +
      " " +
      (
        numeroCantidad === 1
          ? singular
          : plural
      )
    );
  }


  function setTexto(
    elemento,
    texto
  ) {

    if (elemento) {
      elemento.textContent =
        texto;
    }
  }


  // ========================================================
  // KPIs
  // Ventas: pedidos confirmados/en proceso/entregados.
  // Pendientes y cancelados no se suman.
  // ========================================================

  function actualizarKPIs() {

    const stockTotal =
      productosActuales.reduce(
        function (
          total,
          producto
        ) {
          return total +
            Math.max(
              0,
              numero(
                producto.stock
              )
            );
        },
        0
      );

    const estadosVenta = new Set([
      "Confirmado",
      "En preparación",
      "Enviado",
      "Entregado"
    ]);

    const totalVentas =
      pedidosActuales.reduce(
        function (
          total,
          pedido
        ) {

          if (
            !estadosVenta.has(
              pedido.estado
            )
          ) {
            return total;
          }

          return total +
            Math.max(
              0,
              numero(
                pedido.resumen?.total
              )
            );
        },
        0
      );

    if (kpiProductos) {
      kpiProductos.textContent =
        productosActuales.length;
    }

    if (kpiPedidos) {
      kpiPedidos.textContent =
        pedidosActuales.length;
    }

    if (kpiStock) {
      kpiStock.textContent =
        stockTotal;
    }

    if (kpiVentas) {
      kpiVentas.textContent =
        dinero(
          totalVentas
        );
    }
  }

  // ========================================================
  // RESET PRODUCTO
  // ========================================================

  function resetFormularioProducto() {

    productoForm?.reset();

    liberarPreviewObjectUrl();

    imagenArchivoSeleccionado = null;
    imagenEliminada = false;

    if (productoImagenArchivo) {
      productoImagenArchivo.value = "";
    }

    if (productoImagenActual) {
      productoImagenActual.value = "";
    }

    if (productoImagenPublicId) {
      productoImagenPublicId.value = "";
    }

    ocultarPreviewImagen();

    if (productoImagenNombre) {
      productoImagenNombre.textContent =
        "JPG, JPEG, PNG o WEBP · máximo 5 MB";
    }

    if (quitarImagenBtn) {
      quitarImagenBtn.style.display =
        "none";
    }

    if (productoVariantesLista) productoVariantesLista.innerHTML = "";
    if (productoUsaVariantes) productoUsaVariantes.checked = false;
    sincronizarResumenVariantes();

    mostrarMensajeProducto("");
  }

  function mostrarPreviewImagen(url) {

    if (!productoImagenPreview ||
        !productoImagenPlaceholder) {
      return;
    }

    productoImagenPreview.src = url;
    productoImagenPreview.style.display =
      "block";

    productoImagenPlaceholder.style.display =
      "none";
  }

  function ocultarPreviewImagen() {

    if (!productoImagenPreview ||
        !productoImagenPlaceholder) {
      return;
    }

    productoImagenPreview.removeAttribute(
      "src"
    );

    productoImagenPreview.style.display =
      "none";

    productoImagenPlaceholder.style.display =
      "flex";
  }

  function liberarPreviewObjectUrl() {

    if (!imagenPreviewObjectUrl) {
      return;
    }

    URL.revokeObjectURL(
      imagenPreviewObjectUrl
    );

    imagenPreviewObjectUrl = null;
  }

  // ========================================================
  // MENÚ / NAVEGACIÓN
  // ========================================================

  const menuIds = [
    ["menuDashboard", "inicio"],
    ["menuReportes", "reportes"],
    ["menuAnalitica", "analitica"],
    ["menuBackups", "backups"],
    ["menuComercial", "comercial"],
    ["menuPagos", "pagos"],
    ["menuProductos", "productos"],
    ["menuPedidos", "pedidos"],
    ["menuFacturacion", "facturacion"],
    ["menuClientes", "clientes"],
    ["menuInventario", "inventario"],
    ["menuUrbanx3d", "sixteen3d"]
  ];

  menuIds.forEach(
    function ([menuId, seccionId]) {

      document
        .getElementById(menuId)
        ?.addEventListener(
          "click",
          function (event) {

            event.preventDefault();

            const seccion =
              document.getElementById(
                seccionId
              );

            if (seccion) {

              if (
                typeof window.SIXTEEN_SCROLL_TO ===
                "function"
              ) {

                window.SIXTEEN_SCROLL_TO(
                  seccion,
                  {
                    behavior: "smooth",
                    block: "start",
                    offset: 12
                  }
                );

              } else if (
                typeof seccion.scrollIntoView ===
                "function"
              ) {

                seccion.scrollIntoView({
                  behavior: "smooth",
                  block: "start"
                });

              } else {

                const top =
                  seccion
                    .getBoundingClientRect()
                    .top
                  +
                  (
                    window.pageYOffset ||
                    0
                  )
                  -
                  12;

                window.scrollTo(
                  0,
                  Math.max(
                    0,
                    top
                  )
                );
              }

              try {
                history.replaceState(
                  null,
                  "",
                  "#" + seccionId
                );
              } catch (_) {}
            }

            document
              .querySelectorAll(
                ".admin-nav a"
              )
              .forEach(
                function (link) {
                  link.classList.remove(
                    "activo"
                  );
                }
              );

            document
              .getElementById(menuId)
              ?.classList.add(
                "activo"
              );
          }
        );
    }
  );

  // ========================================================
  // ESC
  // ========================================================

  document.addEventListener(
    "keydown",
    function (event) {

      if (event.key !== "Escape") {
        return;
      }

      if (
        pedidoModal?.classList.contains(
          "activo"
        )
      ) {
        cerrarModalPedidoFn();
        return;
      }

      if (
        cuponModal?.classList.contains(
          "activo"
        )
      ) {
        cerrarCuponModalFn();
        return;
      }

      if (
        envioModal?.classList.contains(
          "activo"
        )
      ) {
        cerrarEnvioModalFn();
        return;
      }

      if (
        clienteAdminModal?.classList.contains(
          "activo"
        )
      ) {
        cerrarCliente();
        return;
      }

      if (
        inventarioAjusteModal?.classList.contains(
          "activo"
        )
      ) {
        cerrarAjusteInventario();
        return;
      }

      if (
        productoModal?.classList.contains(
          "activo"
        )
      ) {
        cerrarModalProductoFn();
      }
    }
  );

  // ========================================================
  // UTILIDADES
  // ========================================================

  function valor(id) {

    const elemento =
      document.getElementById(id);

    return elemento
      ? String(
          elemento.value || ""
        ).trim()
      : "";
  }

  function establecer(
    id,
    dato
  ) {

    const elemento =
      document.getElementById(id);

    if (elemento) {
      elemento.value =
        dato ?? "";
    }
  }

  function asegurarOpcionSelect(
    id,
    dato
  ) {

    const select =
      document.getElementById(id);

    const valorDato =
      String(
        dato ?? ""
      ).trim();

    if (
      !select ||
      !valorDato
    ) {
      return;
    }

    const existe =
      Array.from(
        select.options
      ).some(
        function (option) {
          return option.value === valorDato;
        }
      );

    if (!existe) {

      const option =
        document.createElement(
          "option"
        );

      option.value = valorDato;
      option.textContent = valorDato;

      select.appendChild(option);
    }
  }

  function numero(dato) {

    const resultado =
      Number(dato);

    return Number.isFinite(
      resultado
    )
      ? resultado
      : 0;
  }

  function dinero(dato) {

    return "$" +
      numero(dato)
        .toFixed(2);
  }

  function estaMarcado(id) {

    const elemento =
      document.getElementById(id);

    return elemento
      ? elemento.checked === true
      : false;
  }

  function marcar(
    id,
    estado
  ) {

    const elemento =
      document.getElementById(id);

    if (elemento) {
      elemento.checked =
        estado === true;
    }
  }

  function fechaMillis(fecha) {

    if (
      fecha &&
      typeof fecha.toMillis ===
      "function"
    ) {
      return fecha.toMillis();
    }

    if (
      fecha &&
      typeof fecha.toDate ===
      "function"
    ) {
      return fecha.toDate().getTime();
    }

    const valor =
      Date.parse(fecha || "");

    return Number.isFinite(valor)
      ? valor
      : 0;
  }

  function fechaLegible(fecha) {

    let date = null;

    if (
      fecha &&
      typeof fecha.toDate ===
      "function"
    ) {
      date = fecha.toDate();
    } else if (fecha) {
      const posible =
        new Date(fecha);

      if (
        !Number.isNaN(
          posible.getTime()
        )
      ) {
        date = posible;
      }
    }

    if (!date) {
      return "Sin fecha";
    }

    return new Intl.DateTimeFormat(
      "es-EC",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    ).format(date);
  }

  function nombreCliente(cliente) {

    const nombre =
      [
        cliente.nombres,
        cliente.apellidos
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return nombre ||
      "Cliente SIXTEEN";
  }

  function normalizarPago(pedido) {

    if (
      typeof pedido.pago ===
      "string"
    ) {
      return {
        metodo: pedido.pago,
        estado:
          pedido.estadoPago ||
          "Pendiente"
      };
    }

    return {
      metodo:
        pedido.pago?.metodo ||
        "",

      estado:
        pedido.pago?.estado ||
        pedido.estadoPago ||
        "Pendiente"
    };
  }

  function nombreMetodoPago(metodo) {

    const nombres = {
      transferencia:
        "Transferencia bancaria",

      qr:
        "Pago QR",

      tarjeta:
        "Tarjeta crédito / débito",

      efectivo:
        "Pago contra entrega"
    };

    return nombres[metodo] ||
      metodo ||
      "Por confirmar";
  }

  function claseEstadoPedido(estado) {

    switch (estado) {

      case "Confirmado":
        return "confirmado";

      case "En preparación":
        return "preparacion";

      case "Enviado":
        return "enviado";

      case "Entregado":
        return "entregado";

      case "Cancelado":
        return "cancelado";

      default:
        return "pendiente";
    }
  }

  function escapar(dato) {

    const div =
      document.createElement("div");

    div.textContent =
      String(
        dato ?? ""
      );

    return div.innerHTML;
  }

  function escaparAtributo(dato) {

    return String(
      dato ?? ""
    )
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function mostrarMensajeProducto(
    texto,
    correcto = false
  ) {

    if (!productoMensaje) {
      return;
    }

    productoMensaje.textContent =
      texto || "";

    productoMensaje.className =
      "producto-mensaje";

    if (correcto) {
      productoMensaje.classList.add(
        "correcto"
      );
    }
  }

  function mostrarMensajePedido(
    texto,
    correcto = false
  ) {

    if (!pedidoAdminMensaje) {
      return;
    }

    pedidoAdminMensaje.textContent =
      texto || "";

    pedidoAdminMensaje.className =
      "producto-mensaje";

    if (correcto) {
      pedidoAdminMensaje.classList.add(
        "correcto"
      );
    }
  }

  function formatearTamano(bytes) {

    const mb =
      bytes /
      1024 /
      1024;

    return mb.toFixed(2) +
      " MB";
  }

  function actualizarBloqueoBody() {

    const modalAbierto =
      productoModal?.classList.contains(
        "activo"
      ) ||
      pedidoModal?.classList.contains(
        "activo"
      ) ||
      cuponModal?.classList.contains(
        "activo"
      ) ||
      envioModal?.classList.contains(
        "activo"
      ) ||
      clienteAdminModal?.classList.contains(
        "activo"
      ) ||
      inventarioAjusteModal?.classList.contains(
        "activo"
      );

    document.body.classList.toggle(
      "modal-open",
      Boolean(modalAbierto)
    );
  }

  function detenerListeners() {

    if (unsubscribeProductos) {
      unsubscribeProductos();
      unsubscribeProductos = null;
    }

    if (unsubscribePedidos) {
      unsubscribePedidos();
      unsubscribePedidos = null;
    }

    if (unsubscribeInventario) {
      unsubscribeInventario();
      unsubscribeInventario = null;
    }

    if (unsubscribeCupones) {
      unsubscribeCupones();
      unsubscribeCupones = null;
    }

    if (unsubscribeEnvios) {
      unsubscribeEnvios();
      unsubscribeEnvios = null;
    }
  }

  // ========================================================
  // LIMPIEZA
  // ========================================================

  window.addEventListener(
    "beforeunload",
    function () {

      liberarPreviewObjectUrl();
      detenerListeners();
    }
  );

});
