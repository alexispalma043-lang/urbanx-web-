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

  // Datos técnicos públicos/no secretos utilizados por el diagnóstico.
  window.SIXTEEN_ADMIN_RUNTIME = Object.freeze({
    firebaseProject:
      firebaseConfig.projectId,
    cloudinaryCloudName:
      CLOUDINARY_CLOUD_NAME,
    cloudinaryUploadPreset:
      CLOUDINARY_UPLOAD_PRESET
  });


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
  const adminMobileMenuBtn = document.getElementById("adminMobileMenuBtn");
  const adminSidebar = document.querySelector(".admin-sidebar");
  const adminLiveStatus = document.getElementById("adminLiveStatus");
  const adminDataStatus = document.getElementById("adminDataStatus");
  const adminLastUpdate = document.getElementById("adminLastUpdate");

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
  const cuponesResultadoTexto = document.getElementById("cuponesResultadoTexto");

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
  const envioBuscar = document.getElementById("envioBuscar");
  const envioFiltroEstado = document.getElementById("envioFiltroEstado");
  const limpiarFiltrosEnviosBtn = document.getElementById("limpiarFiltrosEnviosBtn");
  const enviosResultadoTexto = document.getElementById("enviosResultadoTexto");

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
  const productoBuscar = document.getElementById("productoBuscar");
  const productoFiltroCategoria = document.getElementById("productoFiltroCategoria");
  const productoFiltroEstado = document.getElementById("productoFiltroEstado");
  const limpiarFiltrosProductosBtn = document.getElementById("limpiarFiltrosProductosBtn");
  const productosResultadoTexto = document.getElementById("productosResultadoTexto");
  const productosEstadoBadge = document.getElementById("productosEstadoBadge");
  const pedidosAdminBody = document.getElementById("pedidosAdminBody");
  const inventarioAdminBody = document.getElementById("inventarioAdminBody");
  const sixteen3dAdminBody = document.getElementById("sixteen3dAdminBody");
  const sixteen3dEstadoBadge = document.getElementById("sixteen3dEstadoBadge");
  const sixteen3dKpiCompatibles = document.getElementById("sixteen3dKpiCompatibles");
  const sixteen3dKpiListos = document.getElementById("sixteen3dKpiListos");
  const sixteen3dKpiPendientes = document.getElementById("sixteen3dKpiPendientes");
  const sixteen3dKpiInactivos = document.getElementById("sixteen3dKpiInactivos");
  const sixteen3dBuscar = document.getElementById("sixteen3dBuscar");
  const sixteen3dFiltroEstado = document.getElementById("sixteen3dFiltroEstado");
  const limpiarFiltrosSixteen3dBtn = document.getElementById("limpiarFiltrosSixteen3dBtn");
  const sixteen3dResultadoTexto = document.getElementById("sixteen3dResultadoTexto");

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
  const inventarioFiltroCatalogo = document.getElementById("inventarioFiltroCatalogo");
  const limpiarFiltrosInventarioBtn = document.getElementById("limpiarFiltrosInventarioBtn");
  const exportarStockBtn = document.getElementById("exportarStockBtn");
  const inventarioResultadoTexto = document.getElementById("inventarioResultadoTexto");

  const movimientosInventarioBody = document.getElementById("movimientosInventarioBody");
  const movimientoBuscar = document.getElementById("movimientoBuscar");
  const movimientoFiltroTipo = document.getElementById("movimientoFiltroTipo");
  const movimientoFechaDesde = document.getElementById("movimientoFechaDesde");
  const movimientoFechaHasta = document.getElementById("movimientoFechaHasta");
  const limpiarFiltrosMovimientosBtn = document.getElementById("limpiarFiltrosMovimientosBtn");
  const exportarInventarioBtn = document.getElementById("exportarInventarioBtn");
  const movimientosResultadoTexto = document.getElementById("movimientosResultadoTexto");
  const movimientosFiltroAviso = document.getElementById("movimientosFiltroAviso");

  const inventarioAjusteModal = document.getElementById("inventarioAjusteModal");
  const cerrarInventarioModal = document.getElementById("cerrarInventarioModal");
  const cancelarInventarioAjusteBtn = document.getElementById("cancelarInventarioAjusteBtn");
  const inventarioAjusteForm = document.getElementById("inventarioAjusteForm");
  const inventarioModalProducto = document.getElementById("inventarioModalProducto");
  const inventarioModalStock = document.getElementById("inventarioModalStock");
  const inventarioModalStockLabel = document.getElementById("inventarioModalStockLabel");
  const inventarioModalStockTotal = document.getElementById("inventarioModalStockTotal");
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
  const productoImagenesGaleria = document.getElementById("productoImagenesGaleria");

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
  const pedidoEntregaMetodo = document.getElementById("pedidoEntregaMetodo");
  const pedidoEntregaProvincia = document.getElementById("pedidoEntregaProvincia");
  const pedidoEntregaDireccion = document.getElementById("pedidoEntregaDireccion");
  const pedidoEntregaReferencia = document.getElementById("pedidoEntregaReferencia");

  const pedidoMetodoPago = document.getElementById("pedidoMetodoPago");
  const pedidoEstadoPago = document.getElementById("pedidoEstadoPago");
  const pedidoFecha = document.getElementById("pedidoFecha");
  const pedidoCupon = document.getElementById("pedidoCupon");
  const pedidoEstadoInventario = document.getElementById("pedidoEstadoInventario");
  const pedidoStockAviso = document.getElementById("pedidoStockAviso");
  const pedidoIntegridadBox = document.getElementById("pedidoIntegridadBox");
  const pedidoIntegridadEstado = document.getElementById("pedidoIntegridadEstado");
  const pedidoIntegridadDetalle = document.getElementById("pedidoIntegridadDetalle");
  const pedidoNotificacionEstado = document.getElementById("pedidoNotificacionEstado");
  const pedidoCorreoEstado = document.getElementById("pedidoCorreoEstado");
  const pedidoComunicacionUltima = document.getElementById("pedidoComunicacionUltima");
  const reenviarCorreoPedidoBtn = document.getElementById("reenviarCorreoPedidoBtn");

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
  const pedidoFiltroEstadoPago = document.getElementById("pedidoFiltroEstadoPago");
  const pedidoFechaDesde = document.getElementById("pedidoFechaDesde");
  const pedidoFechaHasta = document.getElementById("pedidoFechaHasta");
  const limpiarFiltrosPedidosBtn = document.getElementById("limpiarFiltrosPedidosBtn");
  const exportarPedidosBtn = document.getElementById("exportarPedidosBtn");

  const pedidosConteoTotal = document.getElementById("pedidosConteoTotal");
  const pedidosConteoPendientes = document.getElementById("pedidosConteoPendientes");
  const pedidosConteoProceso = document.getElementById("pedidosConteoProceso");
  const pedidosConteoEntregados = document.getElementById("pedidosConteoEntregados");
  const pedidosConteoCancelados = document.getElementById("pedidosConteoCancelados");
  const pedidosPendientesBadge = document.getElementById("pedidosPendientesBadge");
  const pedidosFiltroAviso = document.getElementById("pedidosFiltroAviso");
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
  const clienteModalTipo = document.getElementById("clienteModalTipo");
  const clienteModalUltimoPedido = document.getElementById("clienteModalUltimoPedido");
  const clienteModalUltimaCompra = document.getElementById("clienteModalUltimaCompra");
  const clienteModalEstado = document.getElementById("clienteModalEstado");
  const clienteHistorialBody = document.getElementById("clienteHistorialBody");

  // ========================================================
  // ESTADO DE LA APP
  // ========================================================

  let usuarioActual = null;

  let productosActuales = [];
  let productosFiltrados = [];
  let pedidosActuales = [];
  let pedidosFiltradosActuales = [];

  let productosInventarioFiltrados = [];
  let movimientosInventarioActuales = [];
  let movimientosInventarioFiltrados = [];

  let clientesActuales = [];
  let clientesFiltrados = [];
  let clienteActualClave = null;
  let focoAntesClienteModal = null;

  let cuponesActuales = [];
  let cuponesFiltrados = [];
  let cuponEditandoId = null;
  let focoAntesCuponModal = null;

  let enviosActuales = [];
  let enviosFiltrados = [];
  let envioEditandoId = null;
  let envioOriginal = null;
  let focoAntesEnvioModal = null;
  let sembrandoEnvios = false;

  let unsubscribeProductos = null;
  let unsubscribePedidos = null;
  let unsubscribeInventario = null;
  let unsubscribeCupones = null;
  let unsubscribeEnvios = null;

  let productoEditandoId = null;
  let pedidoEditandoId = null;
  let pedidoEstadoOriginal = "";
  let pedidoEstadoPagoOriginal = "";
  let integridadPedidoActual = { estado: "PENDIENTE", detalle: "Sin comprobar." };
  let focoAntesPedidoModal = null;
  let productoAjusteInventarioId = null;
  let focoAntesInventarioModal = null;

  let imagenArchivoSeleccionado = null;
  let imagenPreviewObjectUrl = null;
  let imagenEliminada = false;
  let imagenesProductoActuales = [];
  let imagenesPublicIdsActuales = [];
  let imagenesArchivosSeleccionados = [];
  let imagenesPreviewObjectUrls = [];
  let focoAntesProductoModal = null;

  let logoutEnProceso = false;

  const estadoFuentesDatos = {
    productos: "pendiente",
    pedidos: "pendiente",
    inventario: "pendiente",
    cupones: "pendiente",
    envios: "pendiente"
  };

  let ultimaActualizacionDatos = 0;


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


  function marcarFuenteDatos(fuente, estado) {

    if (!Object.prototype.hasOwnProperty.call(estadoFuentesDatos, fuente)) {
      return;
    }

    estadoFuentesDatos[fuente] = estado;

    if (estado === "ok") {
      ultimaActualizacionDatos = Date.now();
    }

    actualizarEstadoFuentesDatos();
  }


  function actualizarEstadoFuentesDatos() {

    if (!adminLiveStatus || !adminDataStatus || !adminLastUpdate) {
      return;
    }

    const estados = Object.values(estadoFuentesDatos);
    const errores = estados.filter(function (estado) { return estado === "error"; }).length;
    const listos = estados.filter(function (estado) { return estado === "ok"; }).length;

    adminLiveStatus.classList.toggle("error", errores > 0);
    adminLiveStatus.classList.toggle("listo", errores === 0 && listos === estados.length);

    if (errores > 0) {
      adminDataStatus.textContent = "REVISAR CONEXIÓN";
      adminLastUpdate.textContent = errores + (errores === 1 ? " fuente con error" : " fuentes con error");
      return;
    }

    if (listos < estados.length) {
      adminDataStatus.textContent = "SINCRONIZANDO";
      adminLastUpdate.textContent = listos + "/" + estados.length + " fuentes conectadas";
      return;
    }

    adminDataStatus.textContent = "EN TIEMPO REAL";

    if (!ultimaActualizacionDatos) {
      adminLastUpdate.textContent = "Datos conectados";
      return;
    }

    adminLastUpdate.textContent =
      "Actualizado " +
      new Intl.DateTimeFormat("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date(ultimaActualizacionDatos));
  }


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
        .doc("admin_access_check")
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
            marcarFuenteDatos("productos", "ok");

            aplicarFiltrosProductos();
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
            marcarFuenteDatos("productos", "error");
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
                  <td colspan="9">
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

  function aplicarFiltrosProductos() {

    const busqueda = normalizarTexto(productoBuscar?.value || "");
    const categoria = String(productoFiltroCategoria?.value || "").trim();
    const estado = String(productoFiltroEstado?.value || "").trim();

    productosFiltrados = productosActuales.filter(function (producto) {
      const estadoProducto = String(producto.estado || "Activo").trim();

      if (categoria && String(producto.categoria || "").trim() !== categoria) {
        return false;
      }

      if (estado && estadoProducto !== estado) {
        return false;
      }

      if (busqueda) {
        const texto = normalizarTexto([
          producto.codigo,
          producto.nombre,
          producto.categoria,
          producto.color
        ].join(" "));

        if (!texto.includes(busqueda)) {
          return false;
        }
      }

      return true;
    });

    renderProductos(productosFiltrados);

    const visibles = productosFiltrados.length;
    const total = productosActuales.length;

    if (productosResultadoTexto) {
      productosResultadoTexto.textContent = visibles === total
        ? (total === 1 ? "Mostrando 1 producto." : `Mostrando ${total} productos.`)
        : `Mostrando ${visibles} de ${total} productos.`;
    }

    if (productosEstadoBadge) {
      productosEstadoBadge.textContent = `${total} ${total === 1 ? "PRODUCTO" : "PRODUCTOS"}`;
    }
  }

  productoBuscar?.addEventListener("input", aplicarFiltrosProductos);
  productoFiltroCategoria?.addEventListener("change", aplicarFiltrosProductos);
  productoFiltroEstado?.addEventListener("change", aplicarFiltrosProductos);

  limpiarFiltrosProductosBtn?.addEventListener("click", function () {
    if (productoBuscar) productoBuscar.value = "";
    if (productoFiltroCategoria) productoFiltroCategoria.value = "";
    if (productoFiltroEstado) productoFiltroEstado.value = "";
    aplicarFiltrosProductos();
    productoBuscar?.focus();
  });

  function renderProductos(productos) {

    if (!productosAdminBody) {
      return;
    }

    if (!productos.length) {
      const mensaje = productosActuales.length
        ? "No existen productos que coincidan con los filtros."
        : "Todavía no existen productos.";

      productosAdminBody.innerHTML = `
        <tr>
          <td colspan="7">
            ${escapar(mensaje)}
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

        const archivado = producto.archivado === true;
        const inactivo = estado === "Inactivo";
        if (archivado || inactivo) fila.classList.add("producto-archivado");

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
                class="${inactivo ? "reactivar" : "danger"}"
                data-action="${inactivo ? "reactivar" : "archivar"}"
                data-id="${producto.id}"
              >
                ${inactivo ? "REACTIVAR" : "ARCHIVAR"}
              </button>

            </div>
          </td>
        `;

        productosAdminBody.appendChild(fila);
      }
    );
  }

  // ========================================================
  // INVENTARIO AVANZADO · PASO 16
  // ========================================================

  function stockTotalInventarioProducto(producto) {
    if (window.SIXTEEN_VARIANTS) {
      return Math.max(
        0,
        Math.floor(
          window.SIXTEEN_VARIANTS.totalStock(producto)
        )
      );
    }

    return Math.max(
      0,
      Math.floor(numero(producto?.stock))
    );
  }


  function variantesInventarioProducto(producto) {
    if (!window.SIXTEEN_VARIANTS) {
      return [];
    }

    return window.SIXTEEN_VARIANTS.variants(producto);
  }


  function estadoCatalogoProducto(producto) {
    const estado = normalizarTexto(producto?.estado || "Activo");
    return estado === "activo" && producto?.archivado !== true
      ? "activo"
      : "inactivo";
  }


  function aplicarFiltrosInventario() {

    const busqueda = normalizarTexto(inventarioBuscar?.value || "");
    const categoria = String(inventarioFiltroCategoria?.value || "").trim();
    const estado = String(inventarioFiltroEstado?.value || "").trim();
    const catalogo = String(inventarioFiltroCatalogo?.value || "").trim();

    productosInventarioFiltrados = productosActuales.filter(function (producto) {
      if (categoria && String(producto.categoria || "").trim() !== categoria) {
        return false;
      }

      const estadoProducto = estadoInventarioProducto(producto);
      if (estado && estadoProducto !== estado) {
        return false;
      }

      if (catalogo && estadoCatalogoProducto(producto) !== catalogo) {
        return false;
      }

      if (busqueda) {
        const variantes = variantesInventarioProducto(producto);
        const texto = normalizarTexto(
          [
            producto.codigo,
            producto.nombre,
            producto.categoria,
            producto.color,
            Array.isArray(producto.tallas) ? producto.tallas.join(" ") : producto.tallas,
            ...variantes.flatMap(function (variante) {
              return [variante.color, variante.talla, variante.id];
            })
          ]
            .filter(Boolean)
            .join(" ")
        );

        if (!texto.includes(busqueda)) {
          return false;
        }
      }

      return true;
    });

    renderInventario(productosInventarioFiltrados);
    actualizarTextoInventario();
  }


  function crearCeldaInventario(texto = "") {
    const celda = document.createElement("td");
    celda.textContent = String(texto ?? "");
    return celda;
  }


  function renderInventario(productos) {

    if (!inventarioAdminBody) {
      return;
    }

    inventarioAdminBody.replaceChildren();

    if (!productos.length) {
      const fila = document.createElement("tr");
      const celda = crearCeldaInventario("No existen productos que coincidan con los filtros.");
      celda.colSpan = 9;
      fila.appendChild(celda);
      inventarioAdminBody.appendChild(fila);
      return;
    }

    [...productos]
      .sort(function (a, b) {
        return stockTotalInventarioProducto(a) - stockTotalInventarioProducto(b);
      })
      .forEach(function (producto) {
        const stock = stockTotalInventarioProducto(producto);
        const variantes = variantesInventarioProducto(producto);
        const minimo = obtenerStockMinimo(producto);
        const estado = estadoInventarioProducto(producto);
        const catalogo = estadoCatalogoProducto(producto);

        const fila = document.createElement("tr");

        const codigoTd = document.createElement("td");
        const codigoStrong = document.createElement("strong");
        codigoStrong.className = "admin-code";
        codigoStrong.textContent = producto.codigo || "-";
        codigoTd.appendChild(codigoStrong);
        fila.appendChild(codigoTd);

        const productoTd = document.createElement("td");
        const productoWrap = document.createElement("div");
        productoWrap.className = "admin-product-cell";

        if (producto.imagen && esUrlHttpsValida(producto.imagen)) {
          const img = document.createElement("img");
          img.src = producto.imagen;
          img.alt = producto.nombre || "Producto";
          img.loading = "lazy";
          img.addEventListener("error", function () {
            const fallback = document.createElement("span");
            fallback.className = "admin-product-fallback";
            fallback.textContent = "XVI";
            img.replaceWith(fallback);
          }, { once: true });
          productoWrap.appendChild(img);
        } else {
          const fallback = document.createElement("span");
          fallback.className = "admin-product-fallback";
          fallback.textContent = "XVI";
          productoWrap.appendChild(fallback);
        }

        const nombreStrong = document.createElement("strong");
        nombreStrong.textContent = producto.nombre || "-";
        productoWrap.appendChild(nombreStrong);
        productoTd.appendChild(productoWrap);
        fila.appendChild(productoTd);

        fila.appendChild(crearCeldaInventario(producto.categoria || "-"));

        const stockTd = document.createElement("td");
        const stockStrong = document.createElement("strong");
        stockStrong.className = "inventario-stock-numero";
        stockStrong.textContent = String(stock);
        stockTd.appendChild(stockStrong);
        fila.appendChild(stockTd);

        const variantesTd = document.createElement("td");
        if (variantes.length) {
          const strong = document.createElement("strong");
          strong.textContent = String(variantes.length);
          const small = document.createElement("small");
          small.className = "admin-table-secondary";
          small.textContent = variantes.length === 1 ? "variante" : "variantes";
          variantesTd.append(strong, small);
        } else {
          variantesTd.textContent = "Sin variantes";
        }
        fila.appendChild(variantesTd);

        fila.appendChild(crearCeldaInventario(minimo));

        const estadoTd = document.createElement("td");
        const estadoBadge = document.createElement("span");
        estadoBadge.className = `inventario-estado-badge ${estado}`;
        estadoBadge.textContent = textoEstadoStock(estado);
        estadoTd.appendChild(estadoBadge);
        fila.appendChild(estadoTd);

        const catalogoTd = document.createElement("td");
        const catalogoBadge = document.createElement("span");
        catalogoBadge.className = `admin-table-status ${catalogo === "activo" ? "activo" : "inactivo"}`;
        catalogoBadge.textContent = catalogo === "activo" ? "ACTIVO" : "INACTIVO";
        catalogoTd.appendChild(catalogoBadge);
        fila.appendChild(catalogoTd);

        const accionTd = document.createElement("td");
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "admin-view-btn";
        boton.dataset.inventarioAjuste = producto.id;
        boton.textContent = "AJUSTAR";
        boton.setAttribute("aria-label", `Ajustar inventario de ${producto.nombre || producto.codigo || "producto"}`);
        accionTd.appendChild(boton);
        fila.appendChild(accionTd);

        inventarioAdminBody.appendChild(fila);
      });
  }


  function actualizarResumenInventario() {

    const unidades = productosActuales.reduce(function (total, producto) {
      return total + stockTotalInventarioProducto(producto);
    }, 0);

    const bajos = productosActuales.filter(function (producto) {
      return estadoInventarioProducto(producto) === "bajo";
    }).length;

    const agotados = productosActuales.filter(function (producto) {
      return estadoInventarioProducto(producto) === "agotado";
    }).length;

    const valor = productosActuales.reduce(function (total, producto) {
      return total + (
        stockTotalInventarioProducto(producto) *
        Math.max(0, numero(producto.precio))
      );
    }, 0);

    if (inventarioKpiUnidades) inventarioKpiUnidades.textContent = Math.floor(unidades);
    if (inventarioKpiBajo) inventarioKpiBajo.textContent = bajos;
    if (inventarioKpiAgotados) inventarioKpiAgotados.textContent = agotados;
    if (inventarioKpiValor) inventarioKpiValor.textContent = dinero(valor);
  }


  function actualizarCategoriasInventario() {

    if (!inventarioFiltroCategoria) {
      return;
    }

    const valorActual = inventarioFiltroCategoria.value;
    const categorias = Array.from(
      new Set(
        productosActuales
          .map(function (producto) {
            return String(producto.categoria || "").trim();
          })
          .filter(Boolean)
      )
    ).sort(function (a, b) {
      return a.localeCompare(b, "es");
    });

    inventarioFiltroCategoria.replaceChildren();
    const todas = document.createElement("option");
    todas.value = "";
    todas.textContent = "Todas";
    inventarioFiltroCategoria.appendChild(todas);

    categorias.forEach(function (categoria) {
      const option = document.createElement("option");
      option.value = categoria;
      option.textContent = categoria;
      inventarioFiltroCategoria.appendChild(option);
    });

    if (categorias.includes(valorActual)) {
      inventarioFiltroCategoria.value = valorActual;
    }
  }


  function actualizarTextoInventario() {

    if (!inventarioResultadoTexto) {
      return;
    }

    const visibles = productosInventarioFiltrados.length;
    const total = productosActuales.length;

    if (visibles === total) {
      inventarioResultadoTexto.textContent = total === 1
        ? "Mostrando 1 producto."
        : `Mostrando ${total} productos.`;
      return;
    }

    inventarioResultadoTexto.textContent = `Mostrando ${visibles} de ${total} productos.`;
  }


  function limpiarFiltrosInventario() {
    if (inventarioBuscar) inventarioBuscar.value = "";
    if (inventarioFiltroCategoria) inventarioFiltroCategoria.value = "";
    if (inventarioFiltroEstado) inventarioFiltroEstado.value = "";
    if (inventarioFiltroCatalogo) inventarioFiltroCatalogo.value = "";
    aplicarFiltrosInventario();
  }


  [
    inventarioBuscar,
    inventarioFiltroCategoria,
    inventarioFiltroEstado,
    inventarioFiltroCatalogo
  ]
    .filter(Boolean)
    .forEach(function (elemento) {
      const evento = elemento === inventarioBuscar ? "input" : "change";
      elemento.addEventListener(evento, aplicarFiltrosInventario);
    });


  limpiarFiltrosInventarioBtn?.addEventListener("click", limpiarFiltrosInventario);


  inventarioAdminBody?.addEventListener("click", function (event) {
    const boton = event.target.closest("button[data-inventario-ajuste]");
    if (!boton) return;
    abrirAjusteInventario(boton.dataset.inventarioAjuste);
  });


  function obtenerStockMinimo(producto) {
    const valor = Number(producto.stockMinimo);
    return Number.isFinite(valor)
      ? Math.max(0, Math.floor(valor))
      : 5;
  }


  function estadoInventarioProducto(producto) {
    const stock = stockTotalInventarioProducto(producto);
    const minimo = obtenerStockMinimo(producto);

    if (stock <= 0) return "agotado";
    if (stock <= minimo) return "bajo";
    return "disponible";
  }


  function textoEstadoStock(estado) {
    const textos = {
      disponible: "Disponible",
      bajo: "Stock bajo",
      agotado: "Agotado"
    };

    return textos[estado] || "Disponible";
  }


  function exportarStockCSV() {
    const productos = productosInventarioFiltrados.length || filtrosInventarioActivos()
      ? productosInventarioFiltrados
      : productosActuales;

    if (!productos.length) {
      alert("No hay productos de inventario para exportar.");
      return;
    }

    const filas = [[
      "Codigo",
      "Producto",
      "Categoria",
      "Catalogo",
      "Estado stock",
      "Stock minimo",
      "Variante ID",
      "Color",
      "Talla",
      "Stock variante",
      "Stock total producto",
      "Precio venta",
      "Valor venta estimado"
    ]];

    productos.forEach(function (producto) {
      const variantes = variantesInventarioProducto(producto);
      const total = stockTotalInventarioProducto(producto);
      const precio = Math.max(0, numero(producto.precio));
      const comunes = [
        producto.codigo || "",
        producto.nombre || "",
        producto.categoria || "",
        estadoCatalogoProducto(producto) === "activo" ? "Activo" : "Inactivo / archivado",
        textoEstadoStock(estadoInventarioProducto(producto)),
        obtenerStockMinimo(producto)
      ];

      if (variantes.length) {
        variantes.forEach(function (variante) {
          filas.push([
            ...comunes,
            variante.id || "",
            variante.color || "",
            variante.talla || "",
            variante.stock,
            total,
            precio.toFixed(2),
            (total * precio).toFixed(2)
          ]);
        });
      } else {
        filas.push([
          ...comunes,
          "",
          producto.color || "",
          "",
          total,
          total,
          precio.toFixed(2),
          (total * precio).toFixed(2)
        ]);
      }
    });

    descargarCSV(filas, "sixteen-stock-" + fechaArchivo() + ".csv");
  }


  function filtrosInventarioActivos() {
    return Boolean(
      String(inventarioBuscar?.value || "").trim() ||
      inventarioFiltroCategoria?.value ||
      inventarioFiltroEstado?.value ||
      inventarioFiltroCatalogo?.value
    );
  }


  exportarStockBtn?.addEventListener("click", exportarStockCSV);


  // ========================================================
  // HISTORIAL DE MOVIMIENTOS / KARDEX
  // ========================================================

  function escucharMovimientosInventario() {

    if (unsubscribeInventario) {
      unsubscribeInventario();
    }

    unsubscribeInventario = db
      .collection("inventario")
      .onSnapshot(
        function (snapshot) {
          const movimientos = [];

          snapshot.forEach(function (doc) {
            movimientos.push({ id: doc.id, ...doc.data() });
          });

          movimientos.sort(function (a, b) {
            return fechaMillis(b.creadoEn) - fechaMillis(a.creadoEn);
          });

          movimientosInventarioActuales = movimientos;
          marcarFuenteDatos("inventario", "ok");
          aplicarFiltrosMovimientos();
          emitirActualizacionBackup();
        },
        function (error) {
          marcarFuenteDatos("inventario", "error");
          console.error("Firestore inventario:", error);

          if (movimientosInventarioBody) {
            movimientosInventarioBody.replaceChildren();
            const fila = document.createElement("tr");
            const celda = crearCeldaInventario("No fue posible cargar los movimientos.");
            celda.colSpan = 8;
            fila.appendChild(celda);
            movimientosInventarioBody.appendChild(fila);
          }
        }
      );
  }


  function aplicarFiltrosMovimientos() {

    const busqueda = normalizarTexto(movimientoBuscar?.value || "");
    const tipo = String(movimientoFiltroTipo?.value || "").trim();
    const desde = crearFechaFiltro(movimientoFechaDesde?.value, false);
    const hasta = crearFechaFiltro(movimientoFechaHasta?.value, true);
    const rangoInvalido = Boolean(desde && hasta && desde > hasta);

    if (movimientoFechaDesde) {
      movimientoFechaDesde.setAttribute("aria-invalid", rangoInvalido ? "true" : "false");
    }

    if (movimientoFechaHasta) {
      movimientoFechaHasta.setAttribute("aria-invalid", rangoInvalido ? "true" : "false");
    }

    if (movimientosFiltroAviso) {
      movimientosFiltroAviso.textContent = rangoInvalido
        ? "La fecha DESDE no puede ser posterior a HASTA."
        : "";
    }

    if (rangoInvalido) {
      movimientosInventarioFiltrados = [];
      renderMovimientosInventario([]);
      actualizarTextoMovimientos();
      return;
    }

    movimientosInventarioFiltrados = movimientosInventarioActuales.filter(function (movimiento) {
      if (tipo && movimiento.tipo !== tipo) {
        return false;
      }

      const fecha = fechaComoDate(movimiento.creadoEn);
      if (desde && (!fecha || fecha < desde)) return false;
      if (hasta && (!fecha || fecha > hasta)) return false;

      if (busqueda) {
        const texto = normalizarTexto(
          [
            movimiento.codigo,
            movimiento.nombre,
            movimiento.pedidoNumero,
            movimiento.motivo,
            movimiento.usuarioEmail,
            movimiento.tipo,
            movimiento.origen,
            movimiento.varianteId,
            movimiento.color,
            movimiento.talla
          ]
            .filter(Boolean)
            .join(" ")
        );

        if (!texto.includes(busqueda)) {
          return false;
        }
      }

      return true;
    });

    renderMovimientosInventario(movimientosInventarioFiltrados);
    actualizarTextoMovimientos();
  }


  function variacionMovimiento(movimiento) {
    const anterior = numero(movimiento.stockAnterior);
    const nuevo = numero(movimiento.stockNuevo);
    return nuevo - anterior;
  }


  function renderMovimientosInventario(movimientos) {

    if (!movimientosInventarioBody) {
      return;
    }

    movimientosInventarioBody.replaceChildren();

    if (!movimientos.length) {
      const fila = document.createElement("tr");
      const celda = crearCeldaInventario("No existen movimientos que coincidan con los filtros.");
      celda.colSpan = 8;
      fila.appendChild(celda);
      movimientosInventarioBody.appendChild(fila);
      return;
    }

    movimientos.forEach(function (movimiento) {
      const fila = document.createElement("tr");

      fila.appendChild(crearCeldaInventario(fechaLegible(movimiento.creadoEn)));

      const tipoTd = document.createElement("td");
      const tipoBadge = document.createElement("span");
      tipoBadge.className = `movimiento-tipo-badge ${claseMovimientoInventario(movimiento.tipo)}`;
      tipoBadge.textContent = textoMovimientoInventario(movimiento.tipo);
      tipoTd.appendChild(tipoBadge);
      fila.appendChild(tipoTd);

      const productoTd = document.createElement("td");
      const nombre = document.createElement("strong");
      nombre.textContent = movimiento.nombre || movimiento.codigo || "-";
      productoTd.appendChild(nombre);

      const codigo = document.createElement("small");
      codigo.className = "admin-table-secondary";
      codigo.textContent = movimiento.codigo || "";
      productoTd.appendChild(codigo);

      if (movimiento.color || movimiento.talla) {
        const variante = document.createElement("small");
        variante.className = "admin-table-secondary movimiento-variante";
        variante.textContent = [movimiento.color, movimiento.talla]
          .filter(Boolean)
          .join(" / ");
        productoTd.appendChild(variante);
      }
      fila.appendChild(productoTd);

      const variacion = variacionMovimiento(movimiento);
      const cantidadTd = document.createElement("td");
      const cantidadStrong = document.createElement("strong");
      cantidadStrong.className = `movimiento-cantidad ${variacion > 0 ? "entrada" : variacion < 0 ? "salida" : "neutra"}`;
      cantidadStrong.textContent = variacion > 0 ? `+${variacion}` : String(variacion);
      cantidadTd.appendChild(cantidadStrong);
      fila.appendChild(cantidadTd);

      fila.appendChild(crearCeldaInventario(numero(movimiento.stockAnterior)));

      const nuevoTd = document.createElement("td");
      const nuevoStrong = document.createElement("strong");
      nuevoStrong.textContent = String(numero(movimiento.stockNuevo));
      nuevoTd.appendChild(nuevoStrong);
      fila.appendChild(nuevoTd);

      const origenTd = document.createElement("td");
      origenTd.textContent = movimiento.pedidoNumero || movimiento.motivo || movimiento.origen || "Manual";
      fila.appendChild(origenTd);

      fila.appendChild(crearCeldaInventario(movimiento.usuarioEmail || "Administrador"));

      movimientosInventarioBody.appendChild(fila);
    });
  }


  function textoMovimientoInventario(tipo) {
    const textos = {
      SALIDA_VENTA: "Salida venta",
      ENTRADA_CANCELACION: "Devolución por cancelación",
      ENTRADA_REVERSO_PEDIDO: "Reverso a Pendiente",
      AJUSTE_ENTRADA: "Entrada manual",
      AJUSTE_SALIDA: "Salida manual",
      AJUSTE_EXACTO: "Ajuste exacto",
      AJUSTE_MINIMO: "Mínimo actualizado"
    };

    return textos[tipo] || tipo || "Movimiento";
  }


  function claseMovimientoInventario(tipo) {
    if (tipo === "SALIDA_VENTA" || tipo === "AJUSTE_SALIDA") return "salida";
    if (
      tipo === "ENTRADA_CANCELACION" ||
      tipo === "ENTRADA_REVERSO_PEDIDO" ||
      tipo === "AJUSTE_ENTRADA"
    ) return "entrada";
    return "ajuste";
  }


  function actualizarTextoMovimientos() {
    if (!movimientosResultadoTexto) return;

    const visibles = movimientosInventarioFiltrados.length;
    const total = movimientosInventarioActuales.length;

    if (visibles === total) {
      movimientosResultadoTexto.textContent = total === 1
        ? "Mostrando 1 movimiento."
        : `Mostrando ${total} movimientos.`;
      return;
    }

    movimientosResultadoTexto.textContent = `Mostrando ${visibles} de ${total} movimientos.`;
  }


  function limpiarFiltrosMovimientos() {
    if (movimientoBuscar) movimientoBuscar.value = "";
    if (movimientoFiltroTipo) movimientoFiltroTipo.value = "";
    if (movimientoFechaDesde) {
      movimientoFechaDesde.value = "";
      movimientoFechaDesde.setAttribute("aria-invalid", "false");
    }
    if (movimientoFechaHasta) {
      movimientoFechaHasta.value = "";
      movimientoFechaHasta.setAttribute("aria-invalid", "false");
    }
    if (movimientosFiltroAviso) movimientosFiltroAviso.textContent = "";
    aplicarFiltrosMovimientos();
  }


  [
    movimientoBuscar,
    movimientoFiltroTipo,
    movimientoFechaDesde,
    movimientoFechaHasta
  ]
    .filter(Boolean)
    .forEach(function (elemento) {
      const evento = elemento === movimientoBuscar ? "input" : "change";
      elemento.addEventListener(evento, aplicarFiltrosMovimientos);
    });


  limpiarFiltrosMovimientosBtn?.addEventListener("click", limpiarFiltrosMovimientos);
  exportarInventarioBtn?.addEventListener("click", exportarMovimientosCSV);


  function descargarCSV(filas, nombreArchivo) {
    const contenido = filas
      .map(function (fila) {
        return fila.map(escaparCSV).join(",");
      })
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + contenido], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }


  function exportarMovimientosCSV() {
    const movimientos = movimientosInventarioFiltrados.length || filtrosMovimientosActivos()
      ? movimientosInventarioFiltrados
      : movimientosInventarioActuales;

    if (!movimientos.length) {
      alert("No hay movimientos para exportar.");
      return;
    }

    const filas = [[
      "Fecha",
      "Tipo",
      "Codigo",
      "Producto",
      "Variante ID",
      "Color",
      "Talla",
      "Variacion",
      "Cantidad registrada",
      "Stock anterior",
      "Stock nuevo",
      "Stock total anterior",
      "Stock total nuevo",
      "Stock minimo anterior",
      "Stock minimo nuevo",
      "Pedido",
      "Motivo",
      "Origen",
      "Usuario"
    ]];

    movimientos.forEach(function (movimiento) {
      filas.push([
        fechaLegible(movimiento.creadoEn),
        textoMovimientoInventario(movimiento.tipo),
        movimiento.codigo || "",
        movimiento.nombre || "",
        movimiento.varianteId || "",
        movimiento.color || "",
        movimiento.talla || "",
        variacionMovimiento(movimiento),
        numero(movimiento.cantidad),
        numero(movimiento.stockAnterior),
        numero(movimiento.stockNuevo),
        numero(movimiento.stockProductoAnterior),
        numero(movimiento.stockProductoNuevo),
        numero(movimiento.stockMinimoAnterior),
        numero(movimiento.stockMinimoNuevo ?? movimiento.stockMinimo),
        movimiento.pedidoNumero || "",
        movimiento.motivo || "",
        movimiento.origen || "",
        movimiento.usuarioEmail || ""
      ]);
    });

    descargarCSV(filas, "sixteen-kardex-" + fechaArchivo() + ".csv");
  }


  function filtrosMovimientosActivos() {
    return Boolean(
      String(movimientoBuscar?.value || "").trim() ||
      movimientoFiltroTipo?.value ||
      movimientoFechaDesde?.value ||
      movimientoFechaHasta?.value
    );
  }


  // ========================================================
  // AJUSTE MANUAL DE INVENTARIO
  // ========================================================

  function abrirAjusteInventario(productoId) {

    const producto = productosActuales.find(function (item) {
      return item.id === productoId;
    });

    if (!producto) {
      alert("El producto ya no está disponible.");
      return;
    }

    productoAjusteInventarioId = productoId;
    focoAntesInventarioModal = document.activeElement;

    if (inventarioModalProducto) {
      inventarioModalProducto.textContent =
        (producto.codigo ? producto.codigo + " · " : "") +
        (producto.nombre || "Producto");
    }

    const stockTotal = stockTotalInventarioProducto(producto);
    const minimo = obtenerStockMinimo(producto);

    if (inventarioModalStock) inventarioModalStock.textContent = String(stockTotal);
    if (inventarioModalStockTotal) inventarioModalStockTotal.textContent = String(stockTotal);
    if (inventarioModalStockLabel) inventarioModalStockLabel.textContent = "STOCK ACTUAL";
    if (inventarioModalMinimoActual) inventarioModalMinimoActual.textContent = String(minimo);
    if (inventarioOperacion) inventarioOperacion.value = "entrada";
    if (inventarioCantidad) inventarioCantidad.value = "1";
    if (inventarioStockMinimo) inventarioStockMinimo.value = String(minimo);
    if (inventarioMotivo) inventarioMotivo.value = "";

    const variantesProducto = variantesInventarioProducto(producto);

    if (inventarioVarianteField && inventarioVariante) {
      inventarioVariante.replaceChildren();
      inventarioVarianteField.hidden = variantesProducto.length === 0;

      if (variantesProducto.length) {
        variantesProducto.forEach(function (variante) {
          const option = document.createElement("option");
          option.value = variante.id;
          option.textContent =
            (variante.color || "Sin color") + " / " +
            (variante.talla || "Única") + " · " +
            variante.stock + " uds";
          inventarioVariante.appendChild(option);
        });

        const refrescar = function () {
          const variante = variantesProducto.find(function (item) {
            return item.id === inventarioVariante.value;
          });
          if (variante && inventarioModalStock) {
            inventarioModalStock.textContent = String(variante.stock);
          }
          if (inventarioModalStockLabel) {
            inventarioModalStockLabel.textContent = "STOCK DE VARIANTE";
          }
        };

        inventarioVariante.onchange = refrescar;
        refrescar();
      } else {
        inventarioVariante.onchange = null;
      }
    }

    mostrarMensajeInventario("");
    inventarioAjusteModal.classList.add("activo");
    inventarioAjusteModal.setAttribute("aria-hidden", "false");
    actualizarBloqueoBody();

    window.requestAnimationFrame(function () {
      const primerControl = !inventarioVarianteField?.hidden
        ? inventarioVariante
        : inventarioOperacion;
      (primerControl || inventarioAjusteModal.querySelector(".inventario-modal-card"))?.focus();
    });
  }


  function cerrarAjusteInventario() {
    if (!inventarioAjusteModal) return;

    inventarioAjusteModal.classList.remove("activo");
    inventarioAjusteModal.setAttribute("aria-hidden", "true");
    productoAjusteInventarioId = null;
    if (inventarioVariante) inventarioVariante.onchange = null;
    actualizarBloqueoBody();

    if (focoAntesInventarioModal && typeof focoAntesInventarioModal.focus === "function") {
      focoAntesInventarioModal.focus();
    }
    focoAntesInventarioModal = null;
  }


  cerrarInventarioModal?.addEventListener("click", cerrarAjusteInventario);
  cancelarInventarioAjusteBtn?.addEventListener("click", cerrarAjusteInventario);


  inventarioAjusteModal?.addEventListener("click", function (event) {
    if (event.target === inventarioAjusteModal) {
      cerrarAjusteInventario();
    }
  });


  inventarioAjusteModal?.addEventListener("keydown", function (event) {
    if (event.key !== "Tab") return;

    const focusables = Array.from(
      inventarioAjusteModal.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (elemento) {
      return !elemento.hidden && elemento.offsetParent !== null;
    });

    if (!focusables.length) {
      event.preventDefault();
      inventarioAjusteModal.querySelector(".inventario-modal-card")?.focus();
      return;
    }

    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  });


  inventarioAjusteForm?.addEventListener("submit", guardarAjusteInventario);


  async function guardarAjusteInventario(event) {
    event.preventDefault();

    if (!productoAjusteInventarioId || !usuarioActual) return;

    const operacion = String(inventarioOperacion?.value || "");
    const cantidad = Math.max(0, Math.floor(numero(inventarioCantidad?.value)));
    const stockMinimo = Math.max(0, Math.floor(numero(inventarioStockMinimo?.value)));
    const motivo = String(inventarioMotivo?.value || "").trim();

    if (!motivo) {
      mostrarMensajeInventario("Escribe el motivo del ajuste.", false);
      inventarioMotivo?.focus();
      return;
    }

    if (motivo.length > 300) {
      mostrarMensajeInventario("El motivo no puede superar 300 caracteres.", false);
      inventarioMotivo?.focus();
      return;
    }

    if (operacion !== "exacto" && cantidad <= 0) {
      mostrarMensajeInventario("La cantidad debe ser mayor a 0.", false);
      inventarioCantidad?.focus();
      return;
    }

    guardarInventarioAjusteBtn.disabled = true;
    guardarInventarioAjusteBtn.textContent = "GUARDANDO...";
    mostrarMensajeInventario("Actualizando inventario...", true);

    try {
      const productoRef = db.collection("productos").doc(productoAjusteInventarioId);

      await db.runTransaction(async function (transaction) {
        const snap = await transaction.get(productoRef);
        if (!snap.exists) throw new Error("El producto ya no existe.");

        const producto = snap.data() || {};
        const variantes = variantesInventarioProducto(producto).map(function (variante) {
          return { ...variante };
        });
        const usaVariantes = variantes.length > 0;

        let varianteId = "";
        let color = "";
        let talla = "";
        let stockAnterior = usaVariantes
          ? 0
          : Math.max(0, Math.floor(numero(producto.stock)));
        const stockProductoAnterior = stockTotalInventarioProducto(producto);
        const stockMinimoAnterior = obtenerStockMinimo(producto);

        if (usaVariantes) {
          varianteId = String(inventarioVariante?.value || "");
          const idx = variantes.findIndex(function (variante) {
            return variante.id === varianteId;
          });
          if (idx < 0) throw new Error("Selecciona una variante válida.");
          color = variantes[idx].color;
          talla = variantes[idx].talla;
          stockAnterior = variantes[idx].stock;
        }

        let stockNuevo = stockAnterior;
        if (operacion === "entrada") stockNuevo = stockAnterior + cantidad;
        if (operacion === "salida") {
          if (cantidad > stockAnterior) {
            throw new Error(`No puedes retirar ${cantidad} unidades. Stock actual: ${stockAnterior}.`);
          }
          stockNuevo = stockAnterior - cantidad;
        }
        if (operacion === "exacto") stockNuevo = cantidad;

        if (
          operacion === "exacto" &&
          stockNuevo === stockAnterior &&
          stockMinimo === stockMinimoAnterior
        ) {
          throw new Error("No hay cambios que guardar en el inventario.");
        }

        let stockProductoNuevo = stockNuevo;
        const cambios = {
          stockMinimo,
          actualizadoEn: FieldValue.serverTimestamp()
        };

        if (usaVariantes) {
          const idx = variantes.findIndex(function (variante) {
            return variante.id === varianteId;
          });
          variantes[idx].stock = stockNuevo;
          stockProductoNuevo = variantes.reduce(function (suma, variante) {
            return suma + Math.max(0, Math.floor(numero(variante.stock)));
          }, 0);
          cambios.variantes = variantes;
          cambios.usaVariantes = true;
          cambios.stock = stockProductoNuevo;
        } else {
          cambios.stock = stockNuevo;
        }

        transaction.update(productoRef, cambios);

        const soloCambioMinimo = stockNuevo === stockAnterior && stockMinimo !== stockMinimoAnterior;
        const tipoMovimiento = soloCambioMinimo
          ? "AJUSTE_MINIMO"
          : operacion === "entrada"
            ? "AJUSTE_ENTRADA"
            : operacion === "salida"
              ? "AJUSTE_SALIDA"
              : "AJUSTE_EXACTO";

        const mov = db.collection("inventario").doc();
        transaction.set(mov, {
          tipo: tipoMovimiento,
          origen: "manual",
          productoId: productoAjusteInventarioId,
          codigo: producto.codigo || "",
          nombre: producto.nombre || "",
          varianteId,
          color,
          talla,
          cantidad: operacion === "exacto"
            ? Math.abs(stockNuevo - stockAnterior)
            : cantidad,
          stockAnterior,
          stockNuevo,
          stockProductoAnterior,
          stockProductoNuevo,
          stockMinimoAnterior,
          stockMinimoNuevo: stockMinimo,
          motivo,
          usuarioUid: usuarioActual.uid,
          usuarioEmail: usuarioActual.email || "",
          creadoEn: FieldValue.serverTimestamp()
        });
      });

      mostrarMensajeInventario("Inventario actualizado correctamente.", true);
      setTimeout(cerrarAjusteInventario, 650);

    } catch (error) {
      console.error("Ajuste inventario:", error);
      mostrarMensajeInventario(error.message || "No fue posible actualizar el inventario.", false);
    } finally {
      guardarInventarioAjusteBtn.disabled = false;
      guardarInventarioAjusteBtn.textContent = "GUARDAR AJUSTE";
    }
  }


  function mostrarMensajeInventario(texto, correcto = false) {
    if (!inventarioAjusteMensaje) return;

    inventarioAjusteMensaje.textContent = texto || "";
    inventarioAjusteMensaje.className = "producto-mensaje";

    if (correcto) {
      inventarioAjusteMensaje.classList.add("correcto");
    }
  }


  // ========================================================
  // PASO 23 · SIXTEEN EXPERIENCE 3D
  // Campo técnico urbanx3d se conserva por compatibilidad.
  // ========================================================

  function modeloGlbValido(valor) {
    const texto = String(valor || "").trim();

    if (!esUrlHttpsValida(texto)) {
      return false;
    }

    try {
      const url = new URL(texto);
      return /\.glb$/i.test(url.pathname);
    } catch (_) {
      return false;
    }
  }


  function estadoSixteen3dProducto(producto) {
    if (producto?.urbanx3d !== true) {
      return "no-compatible";
    }

    if (estadoCatalogoProducto(producto) !== "activo") {
      return "inactivo";
    }

    return modeloGlbValido(producto?.modelo3d)
      ? "listo"
      : "pendiente";
  }


  function textoEstadoSixteen3d(estado) {
    if (estado === "listo") return "LISTO";
    if (estado === "inactivo") return "INACTIVO";
    return "PENDIENTE";
  }


  function crearCeldaTexto3d(valor, strong = false) {
    const td = document.createElement("td");
    const nodo = strong
      ? document.createElement("strong")
      : document.createElement("span");

    nodo.textContent = String(valor ?? "-");
    td.appendChild(nodo);
    return td;
  }


  function actualizarResumenSixteen3d(productos) {
    const compatibles = productos.filter(
      producto => producto?.urbanx3d === true
    );

    const estados = compatibles.map(estadoSixteen3dProducto);
    const listos = estados.filter(item => item === "listo").length;
    const pendientes = estados.filter(item => item === "pendiente").length;
    const inactivos = estados.filter(item => item === "inactivo").length;

    if (sixteen3dKpiCompatibles) sixteen3dKpiCompatibles.textContent = String(compatibles.length);
    if (sixteen3dKpiListos) sixteen3dKpiListos.textContent = String(listos);
    if (sixteen3dKpiPendientes) sixteen3dKpiPendientes.textContent = String(pendientes);
    if (sixteen3dKpiInactivos) sixteen3dKpiInactivos.textContent = String(inactivos);

    if (sixteen3dEstadoBadge) {
      if (!compatibles.length) {
        sixteen3dEstadoBadge.textContent = "SIN PRODUCTOS 3D";
      } else if (pendientes > 0) {
        sixteen3dEstadoBadge.textContent = `${pendientes} PENDIENTE${pendientes === 1 ? "" : "S"}`;
      } else {
        sixteen3dEstadoBadge.textContent = "CONFIGURACIÓN LISTA";
      }
    }
  }


  function renderSixteen3d(productos) {
    if (!sixteen3dAdminBody) {
      return;
    }

    actualizarResumenSixteen3d(productos);

    const busqueda = normalizarTexto(sixteen3dBuscar?.value || "");
    const filtro = String(sixteen3dFiltroEstado?.value || "").trim();

    const compatibles = productos
      .filter(producto => producto?.urbanx3d === true)
      .filter(producto => {
        const estado = estadoSixteen3dProducto(producto);
        if (filtro && estado !== filtro) return false;

        if (busqueda) {
          const texto = normalizarTexto([
            producto.codigo,
            producto.nombre,
            producto.categoria,
            producto.modelo3d
          ].filter(Boolean).join(" "));

          if (!texto.includes(busqueda)) return false;
        }

        return true;
      });

    sixteen3dAdminBody.replaceChildren();

    if (!compatibles.length) {
      const fila = document.createElement("tr");
      const celda = document.createElement("td");
      celda.colSpan = 6;
      celda.textContent = productos.some(item => item?.urbanx3d === true)
        ? "No hay productos 3D que coincidan con los filtros."
        : "No hay productos SIXTEEN Experience 3D configurados.";
      fila.appendChild(celda);
      sixteen3dAdminBody.appendChild(fila);
    } else {
      compatibles.forEach(function (producto) {
        const modelo = String(producto.modelo3d || "").trim();
        const estado = estadoSixteen3dProducto(producto);
        const fila = document.createElement("tr");

        fila.appendChild(crearCeldaTexto3d(producto.codigo || "-"));
        fila.appendChild(crearCeldaTexto3d(producto.nombre || "-", true));

        const modeloTd = document.createElement("td");
        if (modeloGlbValido(modelo)) {
          const link = document.createElement("a");
          link.className = "admin-inline-link";
          link.href = modelo;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "ABRIR GLB";
          modeloTd.appendChild(link);
        } else {
          const estadoModelo = document.createElement("span");
          estadoModelo.textContent = modelo ? "URL GLB INVÁLIDA" : "SIN MODELO";
          modeloTd.appendChild(estadoModelo);
        }
        fila.appendChild(modeloTd);

        const catalogoTd = document.createElement("td");
        const catalogoBadge = document.createElement("span");
        const catalogoActivo = estadoCatalogoProducto(producto) === "activo";
        catalogoBadge.className = "admin-table-status " + (catalogoActivo ? "activo" : "inactivo");
        catalogoBadge.textContent = catalogoActivo ? "ACTIVO" : "INACTIVO";
        catalogoTd.appendChild(catalogoBadge);
        fila.appendChild(catalogoTd);

        const experienciaTd = document.createElement("td");
        const experienciaBadge = document.createElement("span");
        experienciaBadge.className = "admin-table-status " + (estado === "listo" ? "activo" : "inactivo");
        experienciaBadge.textContent = textoEstadoSixteen3d(estado);
        experienciaTd.appendChild(experienciaBadge);
        fila.appendChild(experienciaTd);

        const accionesTd = document.createElement("td");
        accionesTd.className = "admin-actions-cell sixteen3d-actions";

        const editarBtn = document.createElement("button");
        editarBtn.type = "button";
        editarBtn.className = "admin-table-btn";
        editarBtn.dataset.action3d = "editar";
        editarBtn.dataset.id = producto.id || "";
        editarBtn.textContent = "EDITAR";
        accionesTd.appendChild(editarBtn);

        if (producto.codigo) {
          const ficha = document.createElement("a");
          ficha.className = "admin-table-btn";
          ficha.href = "../producto.html?id=" + encodeURIComponent(producto.codigo);
          ficha.target = "_blank";
          ficha.rel = "noopener noreferrer";
          ficha.textContent = "FICHA";
          accionesTd.appendChild(ficha);

        }

        fila.appendChild(accionesTd);
        sixteen3dAdminBody.appendChild(fila);
      });
    }

    if (sixteen3dResultadoTexto) {
      const total = productos.filter(item => item?.urbanx3d === true).length;
      sixteen3dResultadoTexto.textContent = `Mostrando ${compatibles.length} de ${total} productos compatibles.`;
    }
  }


  sixteen3dBuscar?.addEventListener("input", function () {
    renderSixteen3d(productosActuales);
  });

  sixteen3dFiltroEstado?.addEventListener("change", function () {
    renderSixteen3d(productosActuales);
  });

  limpiarFiltrosSixteen3dBtn?.addEventListener("click", function () {
    if (sixteen3dBuscar) sixteen3dBuscar.value = "";
    if (sixteen3dFiltroEstado) sixteen3dFiltroEstado.value = "";
    renderSixteen3d(productosActuales);
  });

  sixteen3dAdminBody?.addEventListener("click", function (event) {
    const boton = event.target.closest("button[data-action3d]");
    if (!boton) return;

    if (boton.dataset.action3d === "editar" && boton.dataset.id) {
      editarProducto(boton.dataset.id);
    }
  });

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

      if (accion === "archivar") {
        archivarProducto(id);
      }

      if (accion === "reactivar") {
        reactivarProducto(id);
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

    focoAntesProductoModal = document.activeElement;

    productoModal.classList.add("activo");
    productoModal.setAttribute("aria-hidden", "false");

    actualizarBloqueoBody();

    window.requestAnimationFrame(function () {
      const primerCampo = document.getElementById("productoCodigo");
      (primerCampo || productoModal.querySelector(".producto-modal-card"))?.focus();
    });
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
    liberarGaleriaObjectUrls();

    imagenArchivoSeleccionado = null;
    imagenEliminada = false;
    productoEditandoId = null;

    actualizarBloqueoBody();

    if (focoAntesProductoModal && typeof focoAntesProductoModal.focus === "function") {
      focoAntesProductoModal.focus();
    }
    focoAntesProductoModal = null;
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

  productoModal?.addEventListener("keydown", function (event) {
    if (event.key !== "Tab") return;

    const focusables = Array.from(
      productoModal.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (elemento) {
      return !elemento.hidden && elemento.offsetParent !== null;
    });

    if (!focusables.length) return;

    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  });

  // ========================================================
  // IMAGEN PRODUCTO
  // ========================================================

  seleccionarImagenBtn?.addEventListener(
    "click",
    function () {
      productoImagenArchivo?.click();
    }
  );

  function liberarGaleriaObjectUrls() {
    imagenesPreviewObjectUrls.forEach(function (url) {
      try { URL.revokeObjectURL(url); } catch (_) {}
    });
    imagenesPreviewObjectUrls = [];
  }

  function renderGaleriaProducto(urls) {
    const lista = Array.from(new Set((urls || []).filter(Boolean))).slice(0, 6);

    if (productoImagenesGaleria) {
      productoImagenesGaleria.innerHTML = "";

      lista.forEach(function (url, index) {
        const item = document.createElement("div");
        item.className = "producto-imagen-thumb";

        const img = document.createElement("img");
        img.src = url;
        img.alt = index === 0 ? "Imagen principal del producto" : `Imagen adicional ${index + 1}`;
        img.loading = "lazy";

        const etiqueta = document.createElement("span");
        etiqueta.textContent = index === 0 ? "PRINCIPAL" : String(index + 1);

        item.append(img, etiqueta);
        productoImagenesGaleria.appendChild(item);
      });
    }

    if (lista.length) {
      mostrarPreviewImagen(lista[0]);
      if (quitarImagenBtn) quitarImagenBtn.style.display = "";
    } else {
      ocultarPreviewImagen();
      if (quitarImagenBtn) quitarImagenBtn.style.display = "none";
    }
  }

  productoImagenArchivo?.addEventListener(
    "change",
    function () {

      const archivos = Array.from(productoImagenArchivo.files || []);

      if (!archivos.length) return;

      if (archivos.length > 6) {
        mostrarMensajeProducto("Puedes cargar un máximo de 6 fotografías.", false);
        productoImagenArchivo.value = "";
        return;
      }

      const invalido = archivos.find(function (archivo) {
        return !ALLOWED_IMAGE_TYPES.includes(archivo.type);
      });

      if (invalido) {
        mostrarMensajeProducto("Formato no permitido. Usa JPG, JPEG, PNG o WEBP.", false);
        productoImagenArchivo.value = "";
        return;
      }

      const demasiadoGrande = archivos.find(function (archivo) {
        return archivo.size > MAX_IMAGE_SIZE;
      });

      if (demasiadoGrande) {
        mostrarMensajeProducto(`La imagen ${demasiadoGrande.name} supera el máximo de 5 MB.`, false);
        productoImagenArchivo.value = "";
        return;
      }

      liberarPreviewObjectUrl();
      liberarGaleriaObjectUrls();

      imagenesArchivosSeleccionados = archivos;
      imagenArchivoSeleccionado = archivos[0] || null;
      imagenEliminada = false;
      imagenesPreviewObjectUrls = archivos.map(function (archivo) {
        return URL.createObjectURL(archivo);
      });

      renderGaleriaProducto(imagenesPreviewObjectUrls);

      const pesoTotal = archivos.reduce(function (total, archivo) {
        return total + archivo.size;
      }, 0);

      if (productoImagenNombre) {
        productoImagenNombre.textContent =
          `${archivos.length} ${archivos.length === 1 ? "foto seleccionada" : "fotos seleccionadas"} · ${formatearTamano(pesoTotal)}`;
      }

      mostrarMensajeProducto("");
    }
  );

  quitarImagenBtn?.addEventListener(
    "click",
    function () {

      liberarPreviewObjectUrl();
      liberarGaleriaObjectUrls();

      imagenArchivoSeleccionado = null;
      imagenesArchivosSeleccionados = [];
      imagenesProductoActuales = [];
      imagenesPublicIdsActuales = [];
      imagenEliminada = true;

      if (productoImagenArchivo) productoImagenArchivo.value = "";
      if (productoImagenActual) productoImagenActual.value = "";
      if (productoImagenPublicId) productoImagenPublicId.value = "";

      renderGaleriaProducto([]);

      if (productoImagenNombre) {
        productoImagenNombre.textContent =
          "JPG, JPEG, PNG o WEBP · máximo 5 MB por foto";
      }
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

    const precio = Math.max(0, numero(valor("productoPrecio")));
    const precioAnterior = Math.max(0, numero(valor("productoPrecioAnterior")));
    const modelo3d = valor("productoModelo3d");
    const estadoProductoFormulario = valor("productoEstado") || "Activo";

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

    if (codigo.length > 40 || nombre.length > 120) {
      mostrarMensajeProducto("El código o el nombre superan la longitud permitida.", false);
      return;
    }

    if (precio <= 0) {
      mostrarMensajeProducto("El precio debe ser mayor a $0.00.", false);
      return;
    }

    if (precioAnterior > 0 && precioAnterior <= precio) {
      mostrarMensajeProducto("El precio anterior debe ser mayor al precio actual o quedar vacío.", false);
      return;
    }

    if (modelo3d && !esUrlHttpsValida(modelo3d)) {
      mostrarMensajeProducto("El modelo 3D debe usar una URL HTTPS válida.", false);
      return;
    }

    if (modelo3d && !modeloGlbValido(modelo3d)) {
      mostrarMensajeProducto("El modelo 3D debe apuntar a un archivo .GLB válido por HTTPS.", false);
      return;
    }

    if (estaMarcado("producto3d") && !modeloGlbValido(modelo3d)) {
      mostrarMensajeProducto("Para activar SIXTEEN 3D debes registrar primero una URL HTTPS válida que termine en .GLB.", false);
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

      let imagenesUrls = imagenEliminada
        ? []
        : imagenesProductoActuales.slice(0, 6);

      let imagenesPublicIds = imagenEliminada
        ? []
        : imagenesPublicIdsActuales.slice(0, 6);

      if (imagenesArchivosSeleccionados.length) {

        const subidas = [];

        for (let indice = 0; indice < imagenesArchivosSeleccionados.length; indice += 1) {
          guardarProductoBtn.textContent =
            `SUBIENDO FOTO ${indice + 1}/${imagenesArchivosSeleccionados.length}...`;

          mostrarMensajeProducto(
            `Subiendo fotografía ${indice + 1} de ${imagenesArchivosSeleccionados.length} a Cloudinary...`,
            true
          );

          subidas.push(
            await subirImagenCloudinary(imagenesArchivosSeleccionados[indice])
          );
        }

        imagenesUrls = subidas.map(function (item) { return item.url; });
        imagenesPublicIds = subidas.map(function (item) { return item.publicId || ""; });
      }

      const imagenUrl = imagenesUrls[0] || "";
      const imagenPublicId = imagenesPublicIds[0] || "";

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

        precio: precio,

        precioAnterior: precioAnterior,

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

        estado: estadoProductoFormulario,

        archivado:
          estadoProductoFormulario === "Activo"
            ? false
            : (productosActuales.find(function (item) { return item.id === productoEditandoId; })?.archivado === true),

        imagen:
          imagenUrl,

        imagenPublicId:
          imagenPublicId,

        imagenes:
          imagenesUrls.slice(1),

        imagenesPublicIds:
          imagenesPublicIds.slice(1),

        modelo3d:
          modelo3d,

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

        if (estadoProductoFormulario === "Activo") {
          producto.archivadoEn = FieldValue.delete();
        }

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
        productoImagenActual.value = producto.imagen || "";
      }

      if (productoImagenPublicId) {
        productoImagenPublicId.value = producto.imagenPublicId || "";
      }

      imagenesProductoActuales = Array.from(new Set([
        String(producto.imagen || "").trim(),
        ...(Array.isArray(producto.imagenes) ? producto.imagenes : [])
      ].filter(Boolean))).slice(0, 6);

      imagenesPublicIdsActuales = [
        String(producto.imagenPublicId || "").trim(),
        ...(Array.isArray(producto.imagenesPublicIds) ? producto.imagenesPublicIds : [])
      ].slice(0, 6);

      imagenesArchivosSeleccionados = [];
      imagenEliminada = false;
      renderGaleriaProducto(imagenesProductoActuales);

      if (productoImagenNombre) {
        productoImagenNombre.textContent = imagenesProductoActuales.length
          ? `${imagenesProductoActuales.length} ${imagenesProductoActuales.length === 1 ? "fotografía actual" : "fotografías actuales"}`
          : "JPG, JPEG, PNG o WEBP · máximo 5 MB por foto";
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

  async function archivarProducto(id) {

    const producto = productosActuales.find(function (item) {
      return item.id === id;
    });

    const confirmado = window.confirm(
      "¿Archivar " + (producto?.nombre || "este producto") +
      "? Dejará de mostrarse en la tienda, pero conservará su historial."
    );

    if (!confirmado) return;

    try {
      await db.collection("productos").doc(id).update({
        estado: "Inactivo",
        archivado: true,
        archivadoEn: FieldValue.serverTimestamp(),
        actualizadoEn: FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Archivar producto:", error);
      alert("No fue posible archivar el producto.");
    }
  }

  async function reactivarProducto(id) {
    try {
      await db.collection("productos").doc(id).update({
        estado: "Activo",
        archivado: false,
        archivadoEn: FieldValue.delete(),
        actualizadoEn: FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Reactivar producto:", error);
      alert("No fue posible reactivar el producto.");
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
            marcarFuenteDatos("pedidos", "ok");

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

            marcarFuenteDatos("pedidos", "error");

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

    const estadoPago =
      String(
        pedidoFiltroEstadoPago?.value || ""
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

    const rangoInvalido =
      Boolean(
        desde &&
        hasta &&
        desde > hasta
      );

    if (pedidoFechaDesde) {
      pedidoFechaDesde.setAttribute(
        "aria-invalid",
        rangoInvalido ? "true" : "false"
      );
    }

    if (pedidoFechaHasta) {
      pedidoFechaHasta.setAttribute(
        "aria-invalid",
        rangoInvalido ? "true" : "false"
      );
    }

    if (pedidosFiltroAviso) {
      pedidosFiltroAviso.textContent =
        rangoInvalido
          ? "La fecha DESDE no puede ser posterior a HASTA."
          : "";
    }

    if (rangoInvalido) {
      pedidosFiltradosActuales = [];
      renderPedidos([]);
      actualizarTextoResultados();
      return;
    }

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

          if (
            estadoPago &&
            (pago.estado || "Pendiente") !==
            estadoPago
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
                  pedido.entrega?.provincia,
                  pedido.entrega?.ciudad,
                  pedido.resumen?.cupon,
                  pedido.estado,
                  pago.estado,
                  nombreMetodoPago(
                    pago.metodo
                  ),
                  ...(Array.isArray(pedido.productos)
                    ? pedido.productos.flatMap(function (producto) {
                        return [
                          producto.nombre,
                          producto.codigo,
                          producto.color,
                          producto.talla
                        ];
                      })
                    : [])
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

    const cancelados =
      pedidosActuales.filter(
        function (pedido) {
          return pedido.estado ===
            "Cancelado";
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

    if (pedidosConteoCancelados) {
      pedidosConteoCancelados.textContent =
        cancelados;
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

    if (pedidoFiltroEstadoPago) {
      pedidoFiltroEstadoPago.value = "";
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
    pedidoFiltroEstadoPago,
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
      pedidoFiltroEstadoPago?.value ||
      pedidoFechaDesde?.value ||
      pedidoFechaHasta?.value
    );
  }


  function escaparCSV(valor) {

    let texto =
      String(
        valor ?? ""
      );

    // Evita que Excel/Sheets interprete datos de clientes como fórmulas.
    if (/^\s*[=+\-@]/.test(texto)) {
      texto = "'" + texto;
    }

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

    pedidosAdminBody.replaceChildren();

    if (!pedidos.length) {
      const fila = document.createElement("tr");
      const celda = document.createElement("td");
      celda.colSpan = 8;
      celda.textContent = filtrosPedidosActivos()
        ? "No existen pedidos que coincidan con los filtros."
        : "Todavía no existen pedidos.";
      fila.appendChild(celda);
      pedidosAdminBody.appendChild(fila);
      return;
    }

    pedidos.forEach(function (pedido) {

      const cliente = pedido.cliente || {};
      const pago = normalizarPago(pedido);

      const fila = document.createElement("tr");

      const celdaPedido = document.createElement("td");
      const codigo = document.createElement("strong");
      codigo.className = "admin-code";
      codigo.textContent = pedido.numero || pedido.id || "-";
      celdaPedido.appendChild(codigo);

      const celdaCliente = document.createElement("td");
      const clienteNombre = document.createElement("strong");
      clienteNombre.textContent = nombreCliente(cliente);
      const clienteCorreo = document.createElement("small");
      clienteCorreo.className = "admin-table-secondary";
      clienteCorreo.textContent = cliente.email || "";
      celdaCliente.append(clienteNombre, clienteCorreo);

      const celdaFecha = document.createElement("td");
      celdaFecha.textContent = fechaLegible(pedido.creadoEn);

      const celdaTotal = document.createElement("td");
      const total = document.createElement("strong");
      total.textContent = dinero(pedido.resumen?.total);
      celdaTotal.appendChild(total);

      const celdaPago = document.createElement("td");
      const metodo = document.createElement("strong");
      metodo.textContent = nombreMetodoPago(pago.metodo);
      const estadoPago = document.createElement("small");
      estadoPago.className = "admin-table-secondary pedido-pago-estado";
      estadoPago.textContent = pago.estado || "Pendiente";
      celdaPago.append(metodo, estadoPago);

      const celdaEstado = document.createElement("td");
      const badgeEstado = document.createElement("span");
      badgeEstado.className =
        "pedido-estado-badge " + claseEstadoPedido(pedido.estado);
      badgeEstado.textContent = pedido.estado || "Pendiente";
      celdaEstado.appendChild(badgeEstado);

      const celdaInventario = document.createElement("td");
      const badgeInventario = document.createElement("span");
      badgeInventario.className =
        "pedido-inventario-badge " + claseEstadoInventario(pedido);
      badgeInventario.textContent = textoEstadoInventario(pedido);
      celdaInventario.appendChild(badgeInventario);

      const celdaAccion = document.createElement("td");
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "admin-view-btn";
      boton.dataset.pedidoId = pedido.id;
      boton.setAttribute(
        "aria-label",
        "Ver pedido " + (pedido.numero || pedido.id || "")
      );
      boton.textContent = "VER";
      celdaAccion.appendChild(boton);

      fila.append(
        celdaPedido,
        celdaCliente,
        celdaFecha,
        celdaTotal,
        celdaPago,
        celdaEstado,
        celdaInventario,
        celdaAccion
      );

      pedidosAdminBody.appendChild(fila);
    });
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
    focoAntesPedidoModal = document.activeElement;

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

    if (pedidoCupon) {
      pedidoCupon.textContent =
        pedido.resumen?.cupon ||
        "Sin cupón";
    }

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

    renderComunicacionPedido(pedido);

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

    pedidoEstadoOriginal =
      pedidoEstadoSelect.value;

    pedidoEstadoPagoOriginal =
      pedidoEstadoPagoSelect.value;

    actualizarBotonGuardarPedido();

    renderProductosPedido(
      pedido.productos || []
    );

    verificarIntegridadPedidoAdmin(pedido);

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

    window.requestAnimationFrame(function () {
      const primerControl =
        pedidoEstadoSelect ||
        cerrarPedidoModal ||
        pedidoModal.querySelector(".pedido-modal-card");

      primerControl?.focus();
    });
  }

  function renderProductosPedido(productos) {

    pedidoProductosLista.replaceChildren();

    if (
      !Array.isArray(productos) ||
      !productos.length
    ) {
      const vacio = document.createElement("p");
      vacio.className = "pedido-sin-productos";
      vacio.textContent = "No hay productos registrados.";
      pedidoProductosLista.appendChild(vacio);
      return;
    }

    productos.forEach(function (producto) {

      const cantidad =
        Math.max(
          1,
          Math.floor(
            numero(producto.cantidad)
          )
        );

      const precio =
        numero(
          producto.precioUnitario ??
          producto.precio
        );

      const item =
        document.createElement("article");

      item.className =
        "pedido-producto-item";

      const imagenBox =
        document.createElement("div");

      imagenBox.className =
        "pedido-producto-imagen";

      const imagenUrl =
        String(producto.imagen || "").trim();

      if (esUrlHttpsValida(imagenUrl)) {
        const imagen = document.createElement("img");
        imagen.src = imagenUrl;
        imagen.alt = producto.nombre || "Producto SIXTEEN";
        imagen.loading = "lazy";
        imagen.decoding = "async";
        imagen.addEventListener("error", function () {
          imagen.remove();
          imagenBox.textContent = "XVI";
        }, { once: true });
        imagenBox.appendChild(imagen);
      } else {
        imagenBox.textContent = "XVI";
      }

      const info =
        document.createElement("div");

      info.className =
        "pedido-producto-info";

      const titulo =
        document.createElement("h4");

      titulo.textContent =
        producto.nombre ||
        "Producto SIXTEEN";

      const variante =
        document.createElement("p");

      variante.textContent =
        `${producto.codigo || producto.id || "-"} · Talla: ${producto.talla || "Única"}`;

      const detalle =
        document.createElement("p");

      detalle.textContent =
        `Color: ${producto.color || "-"} · Cantidad: ${cantidad}`;

      info.append(
        titulo,
        variante,
        detalle
      );

      const firestoreId =
        String(producto.firestoreId || "").trim();

      if (firestoreId) {
        const enlace = document.createElement("a");
        enlace.className = "pedido-producto-link";
        enlace.href = "../producto.html?id=" + encodeURIComponent(firestoreId);
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.textContent = "VER PRODUCTO ↗";
        info.appendChild(enlace);
      }

      const importe =
        document.createElement("strong");

      importe.textContent =
        dinero(precio * cantidad);

      item.append(
        imagenBox,
        info,
        importe
      );

      pedidoProductosLista.appendChild(item);
    });
  }

  // ========================================================
  // GUARDAR ESTADO DEL PEDIDO + STOCK SEGURO
  //
  // REGLAS:
  // - Al pasar a Confirmado / En preparación / Enviado /
  //   Entregado, el stock se descuenta UNA sola vez.
  // - Si el pedido se cancela o vuelve a Pendiente después de
  //   descontar stock, el stock se devuelve UNA sola vez.
  // - Si un pedido con stock devuelto vuelve a un estado operativo,
  //   el stock se vuelve a descontar, validando existencia.
  // - Todo se hace dentro de una transacción Firestore.
  // - Cada movimiento se registra en "inventario".
  // ========================================================

  const ESTADOS_PEDIDO_CON_STOCK =
    new Set([
      "Confirmado",
      "En preparación",
      "Enviado",
      "Entregado"
    ]);


  function redondearMoneda(value) {
    return Math.round((numero(value) + Number.EPSILON) * 100) / 100;
  }

  function validarIntegridadEstructuralPedido(pedido) {
    const productos=Array.isArray(pedido?.productos)?pedido.productos:[];
    if(!productos.length||productos.length>50)return{valido:false,motivo:"Cantidad de líneas de producto inválida."};
    let calculado=0;
    for(const item of productos){
      const qRaw=Number(item?.cantidad),q=Math.floor(qRaw),price=Number(item?.precioUnitario??item?.precio);
      const id=String(item?.firestoreId||"").trim(),code=String(item?.codigo||item?.id||"").trim().toUpperCase();
      if(!id||!code)return{valido:false,motivo:"Una línea no identifica correctamente su producto."};
      if(!Number.isFinite(qRaw)||qRaw!==q||q<1||q>100)return{valido:false,motivo:`Cantidad inválida en ${code}.`};
      if(!Number.isFinite(price)||price<0||price>100000)return{valido:false,motivo:`Precio inválido en ${code}.`};
      calculado+=redondearMoneda(price*q);
    }
    calculado=redondearMoneda(calculado);
    const r=pedido?.resumen||{},sub=redondearMoneda(r.subtotal),disc=redondearMoneda(r.descuento),ship=redondearMoneda(r.envio),total=redondearMoneda(r.total);
    if(sub<0||disc<0||ship<0||total<0)return{valido:false,motivo:"El resumen contiene valores negativos."};
    if(calculado!==sub)return{valido:false,motivo:`El subtotal registrado (${dinero(sub)}) no coincide con las líneas (${dinero(calculado)}).`};
    if(disc>sub)return{valido:false,motivo:"El descuento supera el subtotal."};
    const expected=redondearMoneda(sub-disc+ship);
    if(expected!==total)return{valido:false,motivo:`El total registrado (${dinero(total)}) no coincide con el cálculo (${dinero(expected)}).`};
    return{valido:true,motivo:"Estructura y totales matemáticos correctos."};
  }

  function pintarIntegridadPedido(estado,detalle){
    integridadPedidoActual={estado,detalle};
    pedidoIntegridadBox?.classList.remove("revisando","ok","warning","error");
    pedidoIntegridadBox?.classList.add(estado==="OK"?"ok":estado==="WARNING"?"warning":estado==="ERROR"?"error":"revisando");
    if(pedidoIntegridadEstado)pedidoIntegridadEstado.textContent=estado==="OK"?"VERIFICADO":estado==="WARNING"?"VERIFICADO · AVISOS":estado==="ERROR"?"BLOQUEADO":"REVISANDO";
    if(pedidoIntegridadDetalle)pedidoIntegridadDetalle.textContent=detalle||"";
    actualizarBotonGuardarPedido();
  }

  async function verificarIntegridadPedidoAdmin(pedido){
    pintarIntegridadPedido("PENDING","Comprobando estructura, totales y referencias del catálogo...");
    const structure=validarIntegridadEstructuralPedido(pedido);
    if(!structure.valido){pintarIntegridadPedido("ERROR",structure.motivo);return;}
    const productos=Array.isArray(pedido.productos)?pedido.productos:[];
    try{
      const snaps=await Promise.all(productos.map(item=>db.collection("productos").doc(String(item.firestoreId||"").trim()).get({source:"server"})));
      const warnings=[];
      for(let i=0;i<snaps.length;i++){
        const snap=snaps[i],item=productos[i];
        if(!snap.exists){pintarIntegridadPedido("ERROR",`El producto ${item.codigo||item.nombre||i+1} ya no existe en Firestore.`);return;}
        const actual=snap.data()||{},codeOrder=String(item.codigo||"").trim().toUpperCase(),codeNow=String(actual.codigo||snap.id).trim().toUpperCase();
        if(codeOrder!==codeNow){pintarIntegridadPedido("ERROR",`La referencia ${codeOrder||"sin código"} no coincide con el catálogo actual.`);return;}
        const pOrder=redondearMoneda(item.precioUnitario??item.precio),pNow=redondearMoneda(actual.precio);
        if(pOrder!==pNow)warnings.push(`${codeNow}: precio pedido ${dinero(pOrder)} / catálogo actual ${dinero(pNow)}`);
        if(actual.estado&&actual.estado!=="Activo")warnings.push(`${codeNow}: producto actualmente ${actual.estado}`);
        if(Array.isArray(actual.variantes)&&actual.variantes.length){
          const variant=window.SIXTEEN_VARIANTS?.find(actual,{id:item.varianteId||"",color:item.color||"",talla:item.talla||""});
          if(!variant){pintarIntegridadPedido("ERROR",`La variante comprada de ${codeNow} ya no coincide con el catálogo.`);return;}
          if(numero(variant.stock)<numero(item.cantidad))warnings.push(`${codeNow}: stock actual ${numero(variant.stock)} / pedido ${numero(item.cantidad)}`);
        }
      }
      pintarIntegridadPedido(warnings.length?"WARNING":"OK",warnings.length?"La estructura es correcta. Revisa: "+warnings.join(" · "):"Estructura, totales y referencias del catálogo verificadas.");
    }catch(error){console.warn("Integridad del pedido:",error);pintarIntegridadPedido("WARNING","La estructura matemática es correcta, pero no fue posible completar la comparación con el catálogo del servidor.");}
  }

  function integridadBloqueaCambio(nuevoEstado,nuevoEstadoPago){
    return Boolean((ESTADOS_PEDIDO_CON_STOCK.has(nuevoEstado)||nuevoEstadoPago==="Pagado")&&(integridadPedidoActual.estado==="ERROR"||integridadPedidoActual.estado==="PENDING"));
  }

  function actualizarBotonGuardarPedido() {

    if (!guardarEstadoPedidoBtn) {
      return;
    }

    const pedido =
      pedidosActuales.find(function (item) {
        return item.id === pedidoEditandoId;
      }) || null;

    const estadoActual =
      pedidoEstadoSelect?.value || "";

    const pagoActual =
      pedidoEstadoPagoSelect?.value || "";

    const hayCambios =
      Boolean(
        pedidoEditandoId &&
        (
          estadoActual !== pedidoEstadoOriginal ||
          pagoActual !== pedidoEstadoPagoOriginal
        )
      );

    const bloqueadoPorIntegridad = integridadBloqueaCambio(estadoActual,pagoActual);

    guardarEstadoPedidoBtn.disabled =
      !hayCambios || bloqueadoPorIntegridad;

    guardarEstadoPedidoBtn.textContent =
      bloqueadoPorIntegridad
        ? "REVISAR INTEGRIDAD"
        : hayCambios
          ? "GUARDAR CAMBIOS"
          : "SIN CAMBIOS";

    if (!pedidoStockAviso) {
      return;
    }

    if (!pedido) {
      pedidoStockAviso.textContent = "";
      return;
    }

    const stockDescontado =
      pedido.stockDescontado === true;

    const stockDevuelto =
      pedido.stockDevuelto === true;

    if (
      ESTADOS_PEDIDO_CON_STOCK.has(estadoActual) &&
      (!stockDescontado || stockDevuelto)
    ) {
      pedidoStockAviso.textContent =
        "Este cambio descontará del inventario las unidades del pedido.";
      pedidoStockAviso.dataset.tipo = "salida";
      return;
    }

    if (
      ["Pendiente", "Cancelado"].includes(estadoActual) &&
      stockDescontado &&
      !stockDevuelto
    ) {
      pedidoStockAviso.textContent =
        estadoActual === "Cancelado"
          ? "Cancelar este pedido devolverá automáticamente sus unidades al inventario."
          : "Volver este pedido a Pendiente devolverá automáticamente sus unidades al inventario.";
      pedidoStockAviso.dataset.tipo = "entrada";
      return;
    }

    pedidoStockAviso.textContent =
      "El cambio no modificará el stock actual.";
    pedidoStockAviso.dataset.tipo = "neutral";
  }


  function confirmarCambioPedido(
    pedido,
    nuevoEstado
  ) {

    if (!pedido) {
      return false;
    }

    const estadoAnterior =
      pedido.estado || "Pendiente";

    if (
      nuevoEstado === "Cancelado" &&
      estadoAnterior !== "Cancelado"
    ) {
      const mensaje =
        pedido.stockDescontado === true &&
        pedido.stockDevuelto !== true
          ? "Vas a cancelar el pedido y devolver sus unidades al inventario. ¿Deseas continuar?"
          : "Vas a cancelar este pedido. ¿Deseas continuar?";

      return window.confirm(mensaje);
    }

    if (
      ESTADOS_PEDIDO_CON_STOCK.has(nuevoEstado) &&
      (
        pedido.stockDescontado !== true ||
        pedido.stockDevuelto === true
      )
    ) {
      return window.confirm(
        "Este cambio descontará del inventario las unidades del pedido. ¿Deseas continuar?"
      );
    }

    if (
      nuevoEstado === "Pendiente" &&
      pedido.stockDescontado === true &&
      pedido.stockDevuelto !== true
    ) {
      return window.confirm(
        "Volver el pedido a Pendiente devolverá sus unidades al inventario. ¿Deseas continuar?"
      );
    }

    return true;
  }


  pedidoEstadoSelect?.addEventListener(
    "change",
    actualizarBotonGuardarPedido
  );

  pedidoEstadoPagoSelect?.addEventListener(
    "change",
    actualizarBotonGuardarPedido
  );


  // ========================================================
  // PASO 27 · NOTIFICACIONES + EMAILJS
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

    if (!pedido || estadoAnterior === nuevoEstado) return null;

    const contenido = datosNotificacionEstado(nuevoEstado);
    if (!contenido) return null;

    const clienteUid = String(pedido.clienteUid || "").trim();
    const pedidoNumero = pedido.numero || pedido.id || pedidoEditandoId;
    let notificacion = clienteUid ? "ERROR" : "SIN_UID";

    if (clienteUid) {
      try {
        await db.collection("notificaciones")
          .doc(clienteUid)
          .collection("items")
          .add({
            usuarioUid: clienteUid,
            tipo: "estado_pedido",
            pedidoId: pedidoEditandoId,
            pedidoNumero,
            estado: nuevoEstado,
            titulo: contenido.titulo,
            mensaje: contenido.mensaje,
            leida: false,
            creadoEn: FieldValue.serverTimestamp(),
            creadoPor: usuarioActual.email || usuarioActual.uid
          });
        notificacion = "ENVIADA";
      } catch (error) {
        console.warn("Notificación del pedido:", error);
      }
    }

    const correo = await enviarCorreoEstadoPedidoEmailJS(
      pedido, contenido, nuevoEstado
    );

    return {
      tipo: "estado_pedido",
      valor: nuevoEstado,
      notificacion,
      correo
    };
  }


  // ========================================================
  // ACTUALIZACIÓN DE PAGO · CLIENTE + FACTURACIÓN
  // ========================================================

  function datosNotificacionPago(
    estadoPago
  ) {

    const mapa = {

      "Pendiente": {
        titulo:
          "Pago pendiente",
        mensaje:
          "El pago de tu pedido continúa pendiente.",
        asunto:
          "Estado de pago de tu pedido SIXTEEN"
      },

      "Pendiente de pasarela": {
        titulo:
          "Pago pendiente en pasarela",
        mensaje:
          "Tu pedido está registrado y el pago con tarjeta todavía está pendiente en la pasarela.",
        asunto:
          "Estado de pago de tu pedido SIXTEEN"
      },

      "Pendiente contra entrega": {
        titulo:
          "Pago contra entrega",
        mensaje:
          "Tu pedido mantiene el pago contra entrega.",
        asunto:
          "Estado de pago de tu pedido SIXTEEN"
      },

      "Por verificar": {
        titulo:
          "Pago por verificar",
        mensaje:
          "Recibimos la referencia de pago y el equipo SIXTEEN debe verificarla antes de marcarla como pagada.",
        asunto:
          "Estado de pago de tu pedido SIXTEEN"
      },

      "Pagado": {
        titulo:
          "Pago confirmado",
        mensaje:
          "El pago de tu pedido fue confirmado correctamente.",
        asunto:
          "Pago confirmado · SIXTEEN"
      },

      "Reembolsado": {
        titulo:
          "Pago reembolsado",
        mensaje:
          "El pago de tu pedido fue marcado como reembolsado.",
        asunto:
          "Actualización de pago · SIXTEEN"
      }
    };


    return (
      mapa[
        estadoPago
      ] ||
      null
    );
  }


  async function registrarActualizacionPagoCliente(
    pedido,
    estadoPagoAnterior,
    nuevoEstadoPago
  ) {

    if (!pedido || estadoPagoAnterior === nuevoEstadoPago) return null;

    const contenido = datosNotificacionPago(nuevoEstadoPago);
    if (!contenido) return null;

    const clienteUid = String(pedido.clienteUid || "").trim();
    const pedidoNumero = pedido.numero || pedido.id || pedidoEditandoId;
    let notificacion = clienteUid ? "ERROR" : "SIN_UID";

    if (clienteUid) {
      try {
        await db.collection("notificaciones")
          .doc(clienteUid)
          .collection("items")
          .add({
            usuarioUid: clienteUid,
            tipo: "estado_pago",
            pedidoId: pedidoEditandoId,
            pedidoNumero,
            estado: nuevoEstadoPago,
            titulo: contenido.titulo,
            mensaje: contenido.mensaje,
            leida: false,
            creadoEn: FieldValue.serverTimestamp(),
            creadoPor: usuarioActual.email || usuarioActual.uid
          });
        notificacion = "ENVIADA";
      } catch (error) {
        console.warn("Notificación de pago:", error);
      }
    }

    const correo = await enviarCorreoEstadoPedidoEmailJS(
      pedido, contenido, "Pago · " + nuevoEstadoPago
    );

    return {
      tipo: "estado_pago",
      valor: nuevoEstadoPago,
      notificacion,
      correo
    };
  }


  async function sincronizarPagoFacturaPedido(
    pedidoId,
    nuevoEstadoPago
  ) {

    if (
      !pedidoId ||
      !nuevoEstadoPago
    ) {
      return true;
    }


    try {

      const snapshot =
        await db
          .collection("facturacion")
          .where(
            "pedidoId",
            "==",
            pedidoId
          )
          .get();


      const batch =
        db.batch();


      let cambios =
        0;


      snapshot.forEach(
        function (doc) {

          const data =
            doc.data() ||
            {};


          if (
            data.sistema !==
              "SIXTEEN_INTERNO" ||
            data.tipoRegistro !==
              "DOCUMENTO" ||
            data.tipoDocumento !==
              "FACTURA" ||
            data.estado ===
              "ANULADA"
          ) {
            return;
          }


          batch.update(
            doc.ref,
            {
              "pago.estado":
                nuevoEstadoPago,

              actualizadoEn:
                FieldValue.serverTimestamp()
            }
          );


          cambios +=
            1;
        }
      );


      if (cambios) {
        await batch.commit();
      }


      return true;

    } catch (error) {

      console.warn(
        "Sincronizar pago con factura:",
        error
      );


      return false;
    }
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
      return "NO_CONFIGURADO";
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

      return "SIN_CORREO";
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


      return "ENVIADO";

    } catch (error) {

      console.warn(
        "No se pudo enviar EmailJS:",
        error
      );


      return "ERROR";
    }
  }


  function textoComunicacionEstado(value) {
    const map = {
      ENVIADA: "Enviada",
      ENVIADO: "Enviado",
      NO_CONFIGURADO: "EmailJS no configurado",
      SIN_CORREO: "Cliente sin correo",
      SIN_UID: "Cliente sin UID",
      NO_APLICA: "No aplica",
      ERROR: "Error"
    };
    return map[value] || "Sin registro";
  }


  function renderComunicacionPedido(pedido) {
    const comunicacion = pedido?.comunicacion || {};
    const candidates = [
      comunicacion.estadoPedido,
      comunicacion.estadoPago,
      comunicacion.reenvio
    ].filter(Boolean).sort((a,b)=>fechaMillis(b.actualizadoEn)-fechaMillis(a.actualizadoEn));
    const latest = candidates[0] || null;

    if (pedidoNotificacionEstado) {
      pedidoNotificacionEstado.textContent = latest?.notificacion
        ? textoComunicacionEstado(latest.notificacion)
        : "Sin registro";
    }

    if (pedidoCorreoEstado) {
      pedidoCorreoEstado.textContent = latest?.correo
        ? textoComunicacionEstado(latest.correo)
        : "Sin registro";
    }

    if (pedidoComunicacionUltima) {
      pedidoComunicacionUltima.textContent = latest
        ? `${String(latest.valor || latest.tipo || "Actualización")} · ${fechaLegible(latest.actualizadoEn)}`
        : "-";
    }
  }


  async function guardarResultadoComunicacionPedido(
    pedidoId, estadoResult, pagoResult
  ) {
    if (!pedidoId || (!estadoResult && !pagoResult)) return true;

    const payload = {};
    if (estadoResult) {
      payload["comunicacion.estadoPedido"] = {
        ...estadoResult,
        actualizadoEn: FieldValue.serverTimestamp()
      };
    }
    if (pagoResult) {
      payload["comunicacion.estadoPago"] = {
        ...pagoResult,
        actualizadoEn: FieldValue.serverTimestamp()
      };
    }

    try {
      await db.collection("pedidos").doc(pedidoId).update(payload);
      return true;
    } catch (error) {
      console.warn("Guardar resultado de comunicación:", error);
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

      const pedidoAntes =
        pedidosActuales.find(
          function (pedido) {
            return pedido.id === pedidoEditandoId;
          }
        ) || null;

      if (
        nuevoEstado === pedidoEstadoOriginal &&
        nuevoEstadoPago === pedidoEstadoPagoOriginal
      ) {
        actualizarBotonGuardarPedido();
        return;
      }

      if (!confirmarCambioPedido(pedidoAntes, nuevoEstado)) {
        return;
      }

      guardarEstadoPedidoBtn.disabled =
        true;

      guardarEstadoPedidoBtn.textContent =
        "GUARDANDO...";

      mostrarMensajePedido(
        "Actualizando pedido e inventario...",
        true
      );

      try {

        const resultado =
          await actualizarPedidoConInventario(
            pedidoEditandoId,
            nuevoEstado,
            nuevoEstadoPago
          );


        const comunicacionEstado =
          await registrarActualizacionCliente(
            resultado.pedidoAntes,
            resultado.estadoAnterior,
            nuevoEstado
          );


        const estadoPagoAnterior =
          String(
            resultado.pedidoAntes
              ?.pago
              ?.estado ||
            resultado.pedidoAntes
              ?.estadoPago ||
            "Pendiente"
          );


        const comunicacionPago =
          await registrarActualizacionPagoCliente(
            resultado.pedidoAntes,
            estadoPagoAnterior,
            nuevoEstadoPago
          );


        const comunicacionGuardada =
          await guardarResultadoComunicacionPedido(
            pedidoEditandoId,
            comunicacionEstado,
            comunicacionPago
          );


        const facturaPagoSincronizada =
          estadoPagoAnterior ===
            nuevoEstadoPago
            ? true
            : await sincronizarPagoFacturaPedido(
                pedidoEditandoId,
                nuevoEstadoPago
              );


        pedidoEstadoOriginal =
          nuevoEstado;

        pedidoEstadoPagoOriginal =
          nuevoEstadoPago;

        if (pedidoAntes) {
          pedidoAntes.estado = nuevoEstado;
          pedidoAntes.estadoPago = nuevoEstadoPago;
          pedidoAntes.pago = {
            ...(typeof pedidoAntes.pago === "object" && pedidoAntes.pago
              ? pedidoAntes.pago
              : {}),
            estado: nuevoEstadoPago
          };
          pedidoAntes.stockDescontado = resultado.stockDescontado;
          pedidoAntes.stockDevuelto = resultado.stockDevuelto;

          pedidoAntes.comunicacion = { ...(pedidoAntes.comunicacion || {}) };
          if (comunicacionEstado) {
            pedidoAntes.comunicacion.estadoPedido = {
              ...comunicacionEstado, actualizadoEn: new Date()
            };
          }
          if (comunicacionPago) {
            pedidoAntes.comunicacion.estadoPago = {
              ...comunicacionPago, actualizadoEn: new Date()
            };
          }
          renderComunicacionPedido(pedidoAntes);
        }

        mostrarMensajePedido(
          resultado.mensaje +
          (
            facturaPagoSincronizada
              ? ""
              : " El pedido se actualizó, pero no fue posible sincronizar el estado de pago con una factura existente."
          ) +
          (
            comunicacionGuardada
              ? ""
              : " No fue posible guardar el registro técnico de comunicación."
          ),
          facturaPagoSincronizada && comunicacionGuardada
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

        actualizarBotonGuardarPedido();
      }
    }
  );


  reenviarCorreoPedidoBtn
    ?.addEventListener(
      "click",
      async function () {

        if (!pedidoEditandoId || !usuarioActual) return;

        const pedido = pedidosActuales.find(item => item.id === pedidoEditandoId);
        if (!pedido) {
          mostrarMensajePedido("El pedido ya no está disponible.", false);
          return;
        }

        const estado = String(pedido.estado || "Pendiente");
        const contenido = datosNotificacionEstado(estado) || {
          titulo: "Pedido recibido",
          mensaje: "Tu pedido está registrado en SIXTEEN y continúa pendiente de confirmación.",
          asunto: "Actualización de tu pedido SIXTEEN"
        };

        reenviarCorreoPedidoBtn.disabled = true;
        reenviarCorreoPedidoBtn.textContent = "ENVIANDO...";

        try {
          const correo = await enviarCorreoEstadoPedidoEmailJS(pedido, contenido, estado);

          await db.collection("pedidos").doc(pedidoEditandoId).update({
            "comunicacion.reenvio": {
              tipo: "reenvio_correo",
              valor: estado,
              notificacion: "NO_APLICA",
              correo,
              actualizadoEn: FieldValue.serverTimestamp()
            }
          });

          pedido.comunicacion = {
            ...(pedido.comunicacion || {}),
            reenvio: {
              tipo: "reenvio_correo",
              valor: estado,
              notificacion: "NO_APLICA",
              correo,
              actualizadoEn: new Date()
            }
          };
          renderComunicacionPedido(pedido);

          const message = correo === "ENVIADO"
            ? "Correo reenviado correctamente."
            : correo === "SIN_CORREO"
              ? "El cliente no tiene un correo válido."
              : correo === "NO_CONFIGURADO"
                ? "EmailJS no está configurado."
                : "No fue posible reenviar el correo.";

          mostrarMensajePedido(message, correo === "ENVIADO");
        } catch (error) {
          console.error("Reenviar correo del pedido:", error);
          mostrarMensajePedido("No fue posible reenviar el correo.", false);
        } finally {
          reenviarCorreoPedidoBtn.disabled = false;
          reenviarCorreoPedidoBtn.textContent = "REENVIAR CORREO DE ESTADO";
        }
      }
    );


  async function actualizarPedidoConInventario(
    pedidoId,
    nuevoEstado,
    nuevoEstadoPago
  ) {
    const pedidoRef=db.collection("pedidos").doc(pedidoId);
    const estadosConStock=ESTADOS_PEDIDO_CON_STOCK;

    return await db.runTransaction(async transaction=>{
      const pedidoSnapshot=await transaction.get(pedidoRef);
      if(!pedidoSnapshot.exists)throw new Error("El pedido ya no existe.");

      const pedido=pedidoSnapshot.data()||{};
      const productos=Array.isArray(pedido.productos)?pedido.productos:[];
      if(!productos.length)throw new Error("El pedido no contiene productos.");

      const integridadEstructural=validarIntegridadEstructuralPedido(pedido);
      if(!integridadEstructural.valido&&(ESTADOS_PEDIDO_CON_STOCK.has(nuevoEstado)||nuevoEstadoPago==="Pagado")){
        throw new Error("Pedido bloqueado por integridad: "+integridadEstructural.motivo);
      }

      const stockDescontado=pedido.stockDescontado===true;
      const stockDevuelto=pedido.stockDevuelto===true;

      let accion="NINGUNA";
      if(estadosConStock.has(nuevoEstado)&&(!stockDescontado||stockDevuelto))accion="DESCONTAR";
      if(["Pendiente","Cancelado"].includes(nuevoEstado)&&stockDescontado&&!stockDevuelto)accion="DEVOLVER";

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
          const codigoCatalogo=String(grupo.producto.codigo||grupo.snapshot.id).trim().toUpperCase();
          for(const reg of grupo.items){
            if(reg.codigo&&codigoCatalogo&&reg.codigo!==codigoCatalogo){
              throw new Error("El código del pedido no coincide con el producto actual en Firestore.");
            }
          }
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
                tipo:accion==="DESCONTAR"
                  ?"SALIDA_VENTA"
                  :nuevoEstado==="Cancelado"
                    ?"ENTRADA_CANCELACION"
                    :"ENTRADA_REVERSO_PEDIDO"
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
                tipo:accion==="DESCONTAR"
                  ?"SALIDA_VENTA"
                  :nuevoEstado==="Cancelado"
                    ?"ENTRADA_CANCELACION"
                    :"ENTRADA_REVERSO_PEDIDO"
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
            ?"Pedido actualizado y stock descontado correctamente."
            :accion==="DEVOLVER"
              ?nuevoEstado==="Cancelado"
                ?"Pedido cancelado y stock devuelto correctamente."
                :"Pedido actualizado y stock devuelto al pasar a Pendiente."
              :"Pedido actualizado correctamente.",
        inventarioTexto:textoEstadoInventario(virtual),
        inventarioClase:claseEstadoInventario(virtual),
        pedidoAntes:{id:pedidoId,...pedido},
        estadoAnterior:pedido.estado||"Pendiente",
        stockDescontado:virtual.stockDescontado===true,
        stockDevuelto:virtual.stockDevuelto===true
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
    pedidoEstadoOriginal = "";
    pedidoEstadoPagoOriginal = "";

    if (pedidoStockAviso) {
      pedidoStockAviso.textContent = "";
      delete pedidoStockAviso.dataset.tipo;
    }

    actualizarBloqueoBody();

    if (
      focoAntesPedidoModal &&
      typeof focoAntesPedidoModal.focus === "function"
    ) {
      focoAntesPedidoModal.focus();
    }

    focoAntesPedidoModal = null;
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

  pedidoModal?.addEventListener(
    "keydown",
    function (event) {

      if (event.key !== "Tab") {
        return;
      }

      const focusables =
        Array.from(
          pedidoModal.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
          )
        ).filter(function (elemento) {
          return !elemento.hidden && elemento.offsetParent !== null;
        });

      if (!focusables.length) {
        event.preventDefault();
        pedidoModal.querySelector(".pedido-modal-card")?.focus();
        return;
      }

      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === primero
      ) {
        event.preventDefault();
        ultimo.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === ultimo
      ) {
        event.preventDefault();
        primero.focus();
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

              ultimaCompraValida:
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

            perfil.ultimaCompraValida =
              pedidosValidos[0] ||
              null;

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

    // El UID es la identidad más estable para pedidos hechos por
    // una misma sesión/cuenta. Evita separar al mismo cliente si
    // luego actualiza cédula, correo o teléfono.
    if (pedido.clienteUid) {
      return "uid:" +
        String(
          pedido.clienteUid
        ).trim();
    }

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

          if (
            tipo === "con_compra" &&
            cliente.comprasValidas < 1
          ) {
            return false;
          }

          if (
            tipo === "sin_compra" &&
            cliente.comprasValidas > 0
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


  function tipoClienteTexto(
    cliente
  ) {

    if (
      cliente.pedidosNoCancelados >=
      2
    ) {
      return "CLIENTE RECURRENTE";
    }

    if (
      cliente.comprasValidas > 0
    ) {
      return "CLIENTE";
    }

    return "SIN COMPRA VÁLIDA";
  }


  function crearFilaVacia(
    tbody,
    columnas,
    mensaje
  ) {

    if (!tbody) {
      return;
    }

    tbody.replaceChildren();

    const fila =
      document.createElement("tr");

    const celda =
      document.createElement("td");

    celda.colSpan =
      columnas;

    celda.textContent =
      mensaje;

    fila.appendChild(celda);
    tbody.appendChild(fila);
  }


  function renderClientes(
    clientes
  ) {

    if (!clientesAdminBody) {
      return;
    }

    if (!clientes.length) {

      crearFilaVacia(
        clientesAdminBody,
        7,
        "No existen clientes que coincidan con los filtros."
      );

      return;
    }

    clientesAdminBody.replaceChildren();

    clientes.forEach(
      function (cliente) {

        const ultimo =
          cliente.ultimoPedido;

        const ultimaCompra =
          cliente.ultimaCompraValida;

        const fila =
          document.createElement(
            "tr"
          );

        const celdaCliente =
          document.createElement("td");

        const nombre =
          document.createElement("strong");

        nombre.textContent =
          cliente.nombre ||
          "Cliente SIXTEEN";

        const tipo =
          document.createElement("small");

        tipo.className =
          "admin-table-secondary";

        tipo.textContent =
          tipoClienteTexto(
            cliente
          );

        celdaCliente.append(
          nombre,
          tipo
        );


        const celdaIdentificacion =
          document.createElement("td");

        celdaIdentificacion.textContent =
          cliente.identificacion ||
          "-";


        const celdaContacto =
          document.createElement("td");

        const contactoPrincipal =
          document.createElement("strong");

        contactoPrincipal.className =
          "cliente-contacto-principal";

        contactoPrincipal.textContent =
          cliente.email ||
          cliente.telefono ||
          "-";

        celdaContacto.appendChild(
          contactoPrincipal
        );

        if (
          cliente.email &&
          cliente.telefono
        ) {

          const telefono =
            document.createElement("small");

          telefono.className =
            "admin-table-secondary";

          telefono.textContent =
            cliente.telefono;

          celdaContacto.appendChild(
            telefono
          );
        }


        const celdaPedidos =
          document.createElement("td");

        const pedidosTotal =
          document.createElement("strong");

        pedidosTotal.textContent =
          String(
            cliente.totalPedidos
          );

        const pedidosActivos =
          document.createElement("small");

        pedidosActivos.className =
          "admin-table-secondary";

        pedidosActivos.textContent =
          cliente.pedidosNoCancelados +
          (
            cliente.pedidosNoCancelados === 1
              ? " no cancelado"
              : " no cancelados"
          );

        celdaPedidos.append(
          pedidosTotal,
          pedidosActivos
        );


        const celdaTotal =
          document.createElement("td");

        const total =
          document.createElement("strong");

        total.className =
          "cliente-total-comprado";

        total.textContent =
          dinero(
            cliente.totalComprado
          );

        celdaTotal.appendChild(
          total
        );


        const celdaUltimaCompra =
          document.createElement("td");

        if (ultimaCompra) {

          const fecha =
            document.createTextNode(
              fechaLegible(
                ultimaCompra.creadoEn
              )
            );

          const pedidoCompra =
            document.createElement("small");

          pedidoCompra.className =
            "admin-table-secondary";

          pedidoCompra.textContent =
            ultimaCompra.numero ||
            ultimaCompra.id ||
            "";

          celdaUltimaCompra.append(
            fecha,
            pedidoCompra
          );

        } else {

          celdaUltimaCompra.textContent =
            "Sin compra válida";

          if (ultimo) {

            const ultimoPedido =
              document.createElement("small");

            ultimoPedido.className =
              "admin-table-secondary";

            ultimoPedido.textContent =
              "Último pedido: " +
              (
                ultimo.numero ||
                ultimo.id ||
                "-"
              );

            celdaUltimaCompra.appendChild(
              ultimoPedido
            );
          }
        }


        const celdaAccion =
          document.createElement("td");

        const boton =
          document.createElement("button");

        boton.type =
          "button";

        boton.className =
          "admin-view-btn";

        boton.dataset.clienteClave =
          cliente.clave;

        boton.textContent =
          "VER PERFIL";

        celdaAccion.appendChild(
          boton
        );


        fila.append(
          celdaCliente,
          celdaIdentificacion,
          celdaContacto,
          celdaPedidos,
          celdaTotal,
          celdaUltimaCompra,
          celdaAccion
        );

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

    focoAntesClienteModal =
      document.activeElement;

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

    if (clienteModalTipo) {
      clienteModalTipo.textContent =
        tipoClienteTexto(
          cliente
        );
    }

    clienteModalUltimoPedido.textContent =
      ultimoPedido?.numero ||
      ultimoPedido?.id ||
      "-";

    clienteModalUltimaCompra.textContent =
      cliente.ultimaCompraValida
        ? fechaLegible(
            cliente.ultimaCompraValida.creadoEn
          )
        : "-";

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

    requestAnimationFrame(
      function () {
        clienteAdminModal
          .querySelector(
            ".cliente-modal-card"
          )
          ?.focus();
      }
    );
  }


  function renderHistorialCliente(
    cliente
  ) {

    if (!clienteHistorialBody) {
      return;
    }

    if (!cliente.pedidos.length) {

      crearFilaVacia(
        clienteHistorialBody,
        7,
        "Sin pedidos registrados."
      );

      return;
    }

    clienteHistorialBody.replaceChildren();

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


        const celdaPedido =
          document.createElement("td");

        const codigo =
          document.createElement("strong");

        codigo.className =
          "admin-code";

        codigo.textContent =
          pedido.numero ||
          pedido.id ||
          "-";

        celdaPedido.appendChild(
          codigo
        );


        const celdaFecha =
          document.createElement("td");

        celdaFecha.textContent =
          fechaLegible(
            pedido.creadoEn
          );


        const celdaEstado =
          document.createElement("td");

        const estado =
          document.createElement("span");

        estado.className =
          "pedido-estado-badge " +
          claseEstadoPedido(
            pedido.estado
          );

        estado.textContent =
          pedido.estado ||
          "Pendiente";

        celdaEstado.appendChild(
          estado
        );


        const celdaPago =
          document.createElement("td");

        celdaPago.textContent =
          nombreMetodoPago(
            pago.metodo
          );


        const celdaEstadoPago =
          document.createElement("td");

        celdaEstadoPago.textContent =
          pago.estado ||
          pedido.estadoPago ||
          "Pendiente";


        const celdaTotal =
          document.createElement("td");

        const total =
          document.createElement("strong");

        total.textContent =
          dinero(
            pedido.resumen?.total
          );

        celdaTotal.appendChild(
          total
        );


        const celdaAccion =
          document.createElement("td");

        const boton =
          document.createElement("button");

        boton.type =
          "button";

        boton.className =
          "admin-view-btn";

        boton.dataset.clientePedidoId =
          pedido.id;

        boton.textContent =
          "VER PEDIDO";

        celdaAccion.appendChild(
          boton
        );


        fila.append(
          celdaPedido,
          celdaFecha,
          celdaEstado,
          celdaPago,
          celdaEstadoPago,
          celdaTotal,
          celdaAccion
        );

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

    if (
      focoAntesClienteModal &&
      typeof focoAntesClienteModal.focus === "function"
    ) {
      focoAntesClienteModal.focus();
    }

    focoAntesClienteModal =
      null;
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


  clienteAdminModal
    ?.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Escape") {
          event.preventDefault();
          cerrarCliente();
          return;
        }

        if (event.key !== "Tab") {
          return;
        }

        const focusables =
          Array.from(
            clienteAdminModal.querySelectorAll(
              'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            )
          ).filter(
            function (elemento) {
              return (
                !elemento.hidden &&
                elemento.offsetParent !== null
              );
            }
          );

        if (!focusables.length) {
          event.preventDefault();
          clienteAdminModal
            .querySelector(
              ".cliente-modal-card"
            )
            ?.focus();
          return;
        }

        const primero =
          focusables[0];

        const ultimo =
          focusables[
            focusables.length - 1
          ];

        if (
          event.shiftKey &&
          document.activeElement === primero
        ) {
          event.preventDefault();
          ultimo.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === ultimo
        ) {
          event.preventDefault();
          primero.focus();
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
          cliente.ultimaCompraValida
            ? fechaLegible(
                cliente.ultimaCompraValida.creadoEn
              )
            : "",
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


  function mostrarEstadoComercialTabla(tbody, colspan, texto) {

    if (!tbody) {
      return;
    }

    tbody.textContent = "";

    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = colspan;
    celda.textContent = texto;

    fila.appendChild(celda);
    tbody.appendChild(fila);
  }


  function gestionarTabEnModal(event, modal) {

    if (
      event.key !== "Tab" ||
      !modal?.classList.contains("activo")
    ) {
      return;
    }

    const focusables = Array.from(
      modal.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (elemento) {
      return !elemento.hidden && elemento.offsetParent !== null;
    });

    if (!focusables.length) {
      event.preventDefault();
      modal.querySelector('[tabindex="-1"]')?.focus();
      return;
    }

    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === primero
    ) {
      event.preventDefault();
      ultimo.focus();
      return;
    }

    if (
      !event.shiftKey &&
      document.activeElement === ultimo
    ) {
      event.preventDefault();
      primero.focus();
    }
  }


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

            cuponesActuales = datos;

            marcarFuenteDatos("cupones", "ok");
            aplicarFiltrosCupones();
            actualizarResumenCupones();
            emitirActualizacionBackup();
          },

          function (error) {

            marcarFuenteDatos("cupones", "error");

            console.error(
              "Firestore cupones:",
              error
            );

            mostrarEstadoComercialTabla(
              cuponesAdminBody,
              6,
              "No fue posible cargar los cupones. Revisa la conexión y las reglas actuales de Firestore."
            );

            setTexto(
              cuponesResultadoTexto,
              "No fue posible cargar los cupones."
            );
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
            estadoCupon(cupon);

          if (
            filtro &&
            estado !== filtro
          ) {
            return false;
          }

          if (
            busqueda &&
            !normalizarTexto(
              [
                cupon.codigo,
                cupon.id,
                textoEstadoCupon(estado),
                cupon.porcentaje
              ].filter(Boolean).join(" ")
            ).includes(busqueda)
          ) {
            return false;
          }

          return true;
        }
      );

    renderCupones(cuponesFiltrados);

    setTexto(
      cuponesResultadoTexto,
      "Mostrando " +
      cuponesFiltrados.length +
      " de " +
      cuponesActuales.length +
      " cupones."
    );
  }


  function renderCupones(cupones) {

    if (!cuponesAdminBody) {
      return;
    }

    if (!cupones.length) {

      mostrarEstadoComercialTabla(
        cuponesAdminBody,
        6,
        "No existen cupones que coincidan con los filtros."
      );

      return;
    }

    cuponesAdminBody.textContent = "";

    cupones.forEach(
      function (cupon) {

        const estado =
          estadoCupon(cupon);

        const limite =
          Math.max(
            0,
            Math.floor(
              numero(cupon.limiteUsos)
            )
          );

        const usos =
          Math.max(
            0,
            Math.floor(
              numero(cupon.usosActuales)
            )
          );

        const fila = document.createElement("tr");

        const codigoTd = document.createElement("td");
        const codigoStrong = document.createElement("strong");
        codigoStrong.className = "admin-code";
        codigoStrong.textContent = cupon.codigo || cupon.id || "-";
        codigoTd.appendChild(codigoStrong);

        const descuentoTd = document.createElement("td");
        const descuentoStrong = document.createElement("strong");
        descuentoStrong.className = "reporte-valor";
        descuentoStrong.textContent = numero(cupon.porcentaje) + "%";
        descuentoTd.appendChild(descuentoStrong);

        const vigenciaTd = document.createElement("td");
        vigenciaTd.textContent = textoVigenciaCupon(cupon);

        const usosTd = document.createElement("td");
        const usosStrong = document.createElement("strong");
        usosStrong.textContent = String(usos);
        const usosSmall = document.createElement("small");
        usosSmall.className = "admin-table-secondary";
        usosSmall.textContent = limite > 0
          ? "de " + limite + " · quedan " + Math.max(limite - usos, 0)
          : "sin límite";
        usosTd.append(usosStrong, usosSmall);

        const estadoTd = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "comercial-status-badge " + estado;
        badge.textContent = textoEstadoCupon(estado);
        estadoTd.appendChild(badge);

        const accionTd = document.createElement("td");
        const acciones = document.createElement("div");
        acciones.className = "comercial-actions";

        const editarBtn = document.createElement("button");
        editarBtn.type = "button";
        editarBtn.className = "admin-view-btn";
        editarBtn.dataset.editarCupon = cupon.id;
        editarBtn.textContent = "EDITAR";

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.dataset.toggleCupon = cupon.id;

        if (cupon.activo === true) {
          toggleBtn.className = "admin-delete-btn";
          toggleBtn.textContent = "DESACTIVAR";
          toggleBtn.setAttribute(
            "aria-label",
            "Desactivar cupón " + (cupon.codigo || cupon.id || "")
          );
        } else {
          toggleBtn.className = "admin-secondary-btn";
          toggleBtn.textContent = "ACTIVAR";
          toggleBtn.setAttribute(
            "aria-label",
            "Activar cupón " + (cupon.codigo || cupon.id || "")
          );
        }

        acciones.append(editarBtn, toggleBtn);
        accionTd.appendChild(acciones);

        fila.append(
          codigoTd,
          descuentoTd,
          vigenciaTd,
          usosTd,
          estadoTd,
          accionTd
        );

        cuponesAdminBody.appendChild(fila);
      }
    );
  }


  function actualizarResumenCupones() {

    const total = cuponesActuales.length;

    const activos =
      cuponesActuales.filter(
        function (cupon) {
          return estadoCupon(cupon) === "activo";
        }
      ).length;

    const usos =
      cuponesActuales.reduce(
        function (totalUsos, cupon) {

          return totalUsos +
            Math.max(
              0,
              numero(cupon.usosActuales)
            );
        },
        0
      );

    setTexto(cuponesKpiTotal, String(total));
    setTexto(cuponesKpiActivos, String(activos));
    setTexto(cuponesKpiUsos, String(Math.floor(usos)));
  }


  function estadoCupon(cupon) {

    if (cupon.activo !== true) {
      return "inactivo";
    }

    const hoy = fechaISOHoy();
    const inicio = String(cupon.fechaInicio || "");
    const fin = String(cupon.fechaFin || "");

    if (
      inicio &&
      hoy < inicio
    ) {
      return "programado";
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
        Math.floor(numero(cupon.limiteUsos))
      );

    const usos =
      Math.max(
        0,
        Math.floor(numero(cupon.usosActuales))
      );

    if (
      limite > 0 &&
      usos >= limite
    ) {
      return "agotado";
    }

    return "activo";
  }


  function textoEstadoCupon(estado) {

    const textos = {
      activo: "Activo",
      inactivo: "Inactivo",
      programado: "Programado",
      vencido: "Vencido",
      agotado: "Agotado"
    };

    return textos[estado] || estado;
  }


  function textoVigenciaCupon(cupon) {

    const inicio = cupon.fechaInicio || "";
    const fin = cupon.fechaFin || "";

    if (!inicio && !fin) {
      return "Sin fecha límite";
    }

    if (inicio && fin) {
      return inicio + " → " + fin;
    }

    if (inicio) {
      return "Desde " + inicio;
    }

    return "Hasta " + fin;
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
            editar.dataset.editarCupon
          );
          return;
        }

        const toggle =
          event.target.closest(
            "button[data-toggle-cupon]"
          );

        if (toggle) {
          cambiarDisponibilidadCupon(
            toggle.dataset.toggleCupon,
            toggle
          );
        }
      }
    );


  function abrirCuponModal(cuponId = null) {

    cuponEditandoId = cuponId;
    focoAntesCuponModal = document.activeElement;

    const cupon =
      cuponId
        ? cuponesActuales.find(
            function (item) {
              return item.id === cuponId;
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
      cuponCodigo.value = cupon?.codigo || "";
      cuponCodigo.disabled = Boolean(cupon);
    }

    if (cuponPorcentaje) {
      cuponPorcentaje.value =
        String(
          Math.max(
            1,
            numero(cupon?.porcentaje || 10)
          )
        );
    }

    if (cuponFechaInicio) {
      cuponFechaInicio.value = cupon?.fechaInicio || "";
    }

    if (cuponFechaFin) {
      cuponFechaFin.value = cupon?.fechaFin || "";
    }

    if (cuponLimiteUsos) {
      cuponLimiteUsos.value =
        String(
          Math.max(
            0,
            Math.floor(numero(cupon?.limiteUsos))
          )
        );
    }

    if (cuponActivo) {
      cuponActivo.checked =
        cupon
          ? cupon.activo === true
          : true;
    }

    mostrarMensajeComercial(cuponMensaje, "");

    cuponModal.classList.add("activo");
    cuponModal.setAttribute("aria-hidden", "false");
    actualizarBloqueoBody();

    setTimeout(
      function () {
        if (cupon) {
          cuponPorcentaje?.focus();
        } else {
          cuponCodigo?.focus();
        }
      },
      50
    );
  }


  function cerrarCuponModalFn() {

    if (!cuponModal) {
      return;
    }

    cuponModal.classList.remove("activo");
    cuponModal.setAttribute("aria-hidden", "true");

    cuponEditandoId = null;

    if (cuponCodigo) {
      cuponCodigo.disabled = false;
    }

    actualizarBloqueoBody();

    if (
      focoAntesCuponModal &&
      document.contains(focoAntesCuponModal)
    ) {
      focoAntesCuponModal.focus();
    }

    focoAntesCuponModal = null;
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
        if (event.target === cuponModal) {
          cerrarCuponModalFn();
        }
      }
    );


  cuponModal
    ?.addEventListener(
      "keydown",
      function (event) {
        gestionarTabEnModal(event, cuponModal);
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
            cuponCodigo?.value || ""
          );

        const porcentaje =
          Math.floor(
            numero(cuponPorcentaje?.value)
          );

        const fechaInicio =
          String(cuponFechaInicio?.value || "");

        const fechaFin =
          String(cuponFechaFin?.value || "");

        const limiteUsos =
          Math.floor(
            numero(cuponLimiteUsos?.value)
          );

        if (
          !codigo ||
          codigo.length < 3 ||
          codigo.length > 30
        ) {
          mostrarMensajeComercial(
            cuponMensaje,
            "El código debe tener entre 3 y 30 caracteres.",
            false
          );
          return;
        }

        if (
          porcentaje < 1 ||
          porcentaje > 100
        ) {
          mostrarMensajeComercial(
            cuponMensaje,
            "El descuento debe estar entre 1% y 100%.",
            false
          );
          return;
        }

        if (limiteUsos < 0) {
          mostrarMensajeComercial(
            cuponMensaje,
            "El límite de usos no puede ser negativo.",
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

        guardarCuponBtn.disabled = true;
        guardarCuponBtn.textContent = "GUARDANDO...";

        mostrarMensajeComercial(
          cuponMensaje,
          "Guardando cupón...",
          true
        );

        try {

          const docId = cuponEditandoId || codigo;
          const ref = db.collection("cupones").doc(docId);

          if (!cuponEditandoId) {

            const existenteSnapshot = await ref.get();

            if (existenteSnapshot.exists) {
              throw new Error(
                "Ya existe un cupón con ese código. Edita el cupón existente en lugar de reutilizar el código."
              );
            }
          }

          const existente =
            cuponEditandoId
              ? cuponesActuales.find(
                  function (item) {
                    return item.id === cuponEditandoId;
                  }
                )
              : null;

          const activo = cuponActivo?.checked === true;

          const datos = {
            codigo: codigo,
            porcentaje: porcentaje,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            limiteUsos: limiteUsos,
            usosActuales:
              Math.max(
                0,
                Math.floor(
                  numero(existente?.usosActuales)
                )
              ),
            activo: activo,
            actualizadoEn: FieldValue.serverTimestamp(),
            actualizadoPor:
              usuarioActual.email ||
              usuarioActual.uid
          };

          if (!existente) {
            datos.creadoEn = FieldValue.serverTimestamp();
            datos.creadoPor =
              usuarioActual.email ||
              usuarioActual.uid;
          }

          if (activo) {
            datos.desactivadoEn = FieldValue.delete();
            datos.desactivadoPor = FieldValue.delete();
          } else {
            datos.desactivadoEn = FieldValue.serverTimestamp();
            datos.desactivadoPor =
              usuarioActual.email ||
              usuarioActual.uid;
          }

          await ref.set(
            datos,
            { merge: true }
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

          guardarCuponBtn.disabled = false;
          guardarCuponBtn.textContent = "GUARDAR CUPÓN";
        }
      }
    );


  async function cambiarDisponibilidadCupon(cuponId, boton) {

    const cupon =
      cuponesActuales.find(
        function (item) {
          return item.id === cuponId;
        }
      );

    if (!cupon || !usuarioActual) {
      return;
    }

    const nuevoActivo = cupon.activo !== true;
    const codigo = cupon.codigo || cupon.id;

    const confirmar = window.confirm(
      nuevoActivo
        ? "¿Activar el cupón " + codigo + "? La vigencia y el límite de usos seguirán aplicándose."
        : "¿Desactivar el cupón " + codigo + "? Se conservarán sus usos y el historial de pedidos."
    );

    if (!confirmar) {
      return;
    }

    const textoAnterior = boton?.textContent || "";

    if (boton) {
      boton.disabled = true;
      boton.textContent = nuevoActivo
        ? "ACTIVANDO..."
        : "DESACTIVANDO...";
    }

    try {

      const cambios = {
        activo: nuevoActivo,
        actualizadoEn: FieldValue.serverTimestamp(),
        actualizadoPor:
          usuarioActual.email ||
          usuarioActual.uid
      };

      if (nuevoActivo) {
        cambios.desactivadoEn = FieldValue.delete();
        cambios.desactivadoPor = FieldValue.delete();
      } else {
        cambios.desactivadoEn = FieldValue.serverTimestamp();
        cambios.desactivadoPor =
          usuarioActual.email ||
          usuarioActual.uid;
      }

      await db
        .collection("cupones")
        .doc(cuponId)
        .update(cambios);

    } catch (error) {

      console.error(
        "Cambiar disponibilidad cupón:",
        error
      );

      alert(
        "No fue posible actualizar la disponibilidad del cupón."
      );

      if (boton) {
        boton.disabled = false;
        boton.textContent = textoAnterior;
      }
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
                await crearTarifasBase(false);
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

                const ordenA = numero(a.orden);
                const ordenB = numero(b.orden);

                if (ordenA !== ordenB) {
                  return ordenA - ordenB;
                }

                return String(a.provincia || "")
                  .localeCompare(
                    String(b.provincia || ""),
                    "es"
                  );
              }
            );

            enviosActuales = datos;

            marcarFuenteDatos("envios", "ok");
            aplicarFiltrosEnvios();
            actualizarResumenEnvios();
            emitirActualizacionBackup();
          },

          function (error) {

            marcarFuenteDatos("envios", "error");

            console.error(
              "Firestore envíos:",
              error
            );

            mostrarEstadoComercialTabla(
              enviosAdminBody,
              5,
              "No fue posible cargar las tarifas. Revisa la conexión y las reglas actuales de Firestore."
            );

            setTexto(
              enviosResultadoTexto,
              "No fue posible cargar las tarifas."
            );
          }
        );
  }


  function aplicarFiltrosEnvios() {

    const busqueda =
      normalizarTexto(
        envioBuscar?.value || ""
      );

    const filtro =
      String(
        envioFiltroEstado?.value || ""
      );

    enviosFiltrados =
      enviosActuales.filter(
        function (envio) {

          const estado =
            envio.activo === true
              ? "activo"
              : "inactivo";

          if (
            filtro &&
            filtro !== estado
          ) {
            return false;
          }

          if (
            busqueda &&
            !normalizarTexto(
              [
                envio.provincia,
                envio.id
              ].filter(Boolean).join(" ")
            ).includes(busqueda)
          ) {
            return false;
          }

          return true;
        }
      );

    renderEnvios(enviosFiltrados);

    setTexto(
      enviosResultadoTexto,
      "Mostrando " +
      enviosFiltrados.length +
      " de " +
      enviosActuales.length +
      " provincias."
    );
  }


  function renderEnvios(envios) {

    if (!enviosAdminBody) {
      return;
    }

    const lista = Array.isArray(envios)
      ? envios
      : enviosActuales;

    if (!lista.length) {

      mostrarEstadoComercialTabla(
        enviosAdminBody,
        5,
        "No existen tarifas que coincidan con los filtros."
      );

      return;
    }

    enviosAdminBody.textContent = "";

    lista.forEach(
      function (envio) {

        const fila = document.createElement("tr");

        const provinciaTd = document.createElement("td");
        const provinciaStrong = document.createElement("strong");
        provinciaStrong.textContent = envio.provincia || "-";
        provinciaTd.appendChild(provinciaStrong);

        const tarifaTd = document.createElement("td");
        const tarifaStrong = document.createElement("strong");
        tarifaStrong.className = "reporte-valor";
        tarifaStrong.textContent = dinero(envio.tarifa);
        tarifaTd.appendChild(tarifaStrong);

        const estadoTd = document.createElement("td");
        const badge = document.createElement("span");
        const activo = envio.activo === true;
        badge.className =
          "comercial-status-badge " +
          (activo ? "activo" : "inactivo");
        badge.textContent = activo ? "Activa" : "Inactiva";
        estadoTd.appendChild(badge);

        const actualizadoTd = document.createElement("td");
        actualizadoTd.textContent = fechaLegible(envio.actualizadoEn);

        const accionTd = document.createElement("td");
        const editarBtn = document.createElement("button");
        editarBtn.type = "button";
        editarBtn.className = "admin-view-btn";
        editarBtn.dataset.editarEnvio = envio.id;
        editarBtn.textContent = "EDITAR";
        editarBtn.setAttribute(
          "aria-label",
          "Editar tarifa de " + (envio.provincia || "provincia")
        );
        accionTd.appendChild(editarBtn);

        fila.append(
          provinciaTd,
          tarifaTd,
          estadoTd,
          actualizadoTd,
          accionTd
        );

        enviosAdminBody.appendChild(fila);
      }
    );
  }


  function actualizarResumenEnvios() {

    const total = enviosActuales.length;

    const activos =
      enviosActuales.filter(
        function (envio) {
          return envio.activo === true;
        }
      );

    const promedio =
      activos.length > 0
        ? activos.reduce(
            function (suma, envio) {
              return suma +
                Math.max(
                  0,
                  numero(envio.tarifa)
                );
            },
            0
          ) / activos.length
        : 0;

    setTexto(enviosKpiTotal, String(total));
    setTexto(enviosKpiActivos, String(activos.length));
    setTexto(enviosKpiPromedio, dinero(promedio));
  }


  envioBuscar
    ?.addEventListener(
      "input",
      aplicarFiltrosEnvios
    );


  envioFiltroEstado
    ?.addEventListener(
      "change",
      aplicarFiltrosEnvios
    );


  limpiarFiltrosEnviosBtn
    ?.addEventListener(
      "click",
      function () {

        if (envioBuscar) {
          envioBuscar.value = "";
        }

        if (envioFiltroEstado) {
          envioFiltroEstado.value = "";
        }

        aplicarFiltrosEnvios();
        envioBuscar?.focus();
      }
    );


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
          boton.dataset.editarEnvio
        );
      }
    );


  restaurarTarifasBtn
    ?.addEventListener(
      "click",
      async function () {

        if (!usuarioActual) {
          return;
        }

        const confirmar =
          window.confirm(
            "Esto reemplazará las tarifas y el estado de las 24 provincias por los valores base de SIXTEEN. Las tarifas personalizadas actuales se perderán. ¿Continuar?"
          );

        if (!confirmar) {
          return;
        }

        restaurarTarifasBtn.disabled = true;
        restaurarTarifasBtn.textContent = "RESTAURANDO...";

        try {

          await crearTarifasBase(true);

          alert(
            "Las 24 tarifas base fueron restauradas."
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

          restaurarTarifasBtn.disabled = false;
          restaurarTarifasBtn.textContent = "RESTAURAR TARIFAS BASE";
        }
      }
    );


  async function crearTarifasBase(sobrescribir) {

    if (sembrandoEnvios) {
      return;
    }

    sembrandoEnvios = true;

    try {

      const batch = db.batch();

      TARIFAS_ENVIO_BASE.forEach(
        function (item, indice) {

          const provincia = item[0];
          const tarifa = item[1];
          const docId = slugDocumento(provincia);
          const ref = db.collection("envios").doc(docId);

          const datos = {
            provincia: provincia,
            tarifa: tarifa,
            activo: true,
            orden: indice + 1,
            actualizadoEn: FieldValue.serverTimestamp(),
            actualizadoPor:
              usuarioActual?.email ||
              usuarioActual?.uid ||
              "admin"
          };

          if (sobrescribir) {

            batch.set(
              ref,
              datos,
              { merge: true }
            );

          } else {

            batch.set(
              ref,
              {
                ...datos,
                creadoEn: FieldValue.serverTimestamp()
              },
              { merge: false }
            );
          }
        }
      );

      await batch.commit();

    } finally {
      sembrandoEnvios = false;
    }
  }


  function abrirEnvioModal(envioId) {

    const envio =
      enviosActuales.find(
        function (item) {
          return item.id === envioId;
        }
      );

    if (!envio) {
      return;
    }

    envioEditandoId = envioId;
    focoAntesEnvioModal = document.activeElement;

    envioOriginal = {
      tarifa: Math.max(0, numero(envio.tarifa)),
      activo: envio.activo === true
    };

    setTexto(
      envioModalProvincia,
      envio.provincia || "-"
    );

    if (envioTarifa) {
      envioTarifa.value =
        numero(envio.tarifa).toFixed(2);
    }

    if (envioActivo) {
      envioActivo.checked =
        envio.activo === true;
    }

    mostrarMensajeComercial(envioMensaje, "");

    envioModal.classList.add("activo");
    envioModal.setAttribute("aria-hidden", "false");
    actualizarBloqueoBody();
    actualizarEstadoGuardarEnvio();

    setTimeout(
      function () {
        envioTarifa?.focus();
        envioTarifa?.select();
      },
      50
    );
  }


  function cerrarEnvioModalFn() {

    if (!envioModal) {
      return;
    }

    envioModal.classList.remove("activo");
    envioModal.setAttribute("aria-hidden", "true");

    envioEditandoId = null;
    envioOriginal = null;

    actualizarBloqueoBody();

    if (
      focoAntesEnvioModal &&
      document.contains(focoAntesEnvioModal)
    ) {
      focoAntesEnvioModal.focus();
    }

    focoAntesEnvioModal = null;
  }


  function actualizarEstadoGuardarEnvio() {

    if (
      !guardarEnvioBtn ||
      !envioOriginal ||
      !envioModal?.classList.contains("activo")
    ) {
      return;
    }

    const tarifa = numero(envioTarifa?.value);
    const activo = envioActivo?.checked === true;

    const sinCambios =
      Math.abs(tarifa - envioOriginal.tarifa) < 0.005 &&
      activo === envioOriginal.activo;

    guardarEnvioBtn.disabled = sinCambios;
    guardarEnvioBtn.textContent =
      sinCambios
        ? "SIN CAMBIOS"
        : "GUARDAR TARIFA";
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
        if (event.target === envioModal) {
          cerrarEnvioModalFn();
        }
      }
    );


  envioModal
    ?.addEventListener(
      "keydown",
      function (event) {
        gestionarTabEnModal(event, envioModal);
      }
    );


  envioTarifa
    ?.addEventListener(
      "input",
      actualizarEstadoGuardarEnvio
    );


  envioActivo
    ?.addEventListener(
      "change",
      actualizarEstadoGuardarEnvio
    );


  envioForm
    ?.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        if (
          !envioEditandoId ||
          !usuarioActual ||
          !envioOriginal
        ) {
          return;
        }

        const tarifa = numero(envioTarifa?.value);
        const activo = envioActivo?.checked === true;

        if (
          !Number.isFinite(tarifa) ||
          tarifa < 0
        ) {
          mostrarMensajeComercial(
            envioMensaje,
            "La tarifa debe ser un valor válido igual o mayor a $0.00.",
            false
          );
          return;
        }

        const sinCambios =
          Math.abs(tarifa - envioOriginal.tarifa) < 0.005 &&
          activo === envioOriginal.activo;

        if (sinCambios) {
          mostrarMensajeComercial(
            envioMensaje,
            "No hay cambios que guardar.",
            false
          );
          actualizarEstadoGuardarEnvio();
          return;
        }

        guardarEnvioBtn.disabled = true;
        guardarEnvioBtn.textContent = "GUARDANDO...";

        mostrarMensajeComercial(
          envioMensaje,
          "Actualizando tarifa...",
          true
        );

        try {

          await db
            .collection("envios")
            .doc(envioEditandoId)
            .update({
              tarifa: Math.round(tarifa * 100) / 100,
              activo: activo,
              actualizadoEn: FieldValue.serverTimestamp(),
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

          if (
            envioModal?.classList.contains("activo")
          ) {
            actualizarEstadoGuardarEnvio();
          }
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

    const desde = new Date();
    desde.setHours(0, 0, 0, 0);
    desde.setDate(desde.getDate() - (dias - 1));

    const pedidosVenta =
      pedidosActuales.filter(
        function (pedido) {

          if (!ESTADOS_VENTA_REPORTE.has(pedido.estado)) {
            return false;
          }

          const fecha = fechaComoDate(pedido.creadoEn);
          return Boolean(fecha && fecha >= desde);
        }
      );

    if (!pedidosVenta.length) {

      alert(
        "No existen ventas válidas en el período seleccionado."
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
      "sixteen-reporte-ventas-ultimos-" +
      dias +
      "-dias-" +
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
    imagenesProductoActuales = [];
    imagenesPublicIdsActuales = [];
    imagenesArchivosSeleccionados = [];
    liberarGaleriaObjectUrls();

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
    renderGaleriaProducto([]);

    if (productoImagenNombre) {
      productoImagenNombre.textContent =
        "JPG, JPEG, PNG o WEBP · máximo 5 MB por foto";
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
    ["menuResenas", "resenasAdmin"],
    ["menuPedidos", "pedidos"],
    ["menuFacturacion", "facturacion"],
    ["menuClientes", "clientes"],
    ["menuInventario", "inventario"],
    ["menuUrbanx3d", "sixteen3d"],
    ["menuSistema", "sistema"]
  ];


  function activarMenuAdmin(menuId) {

    document
      .querySelectorAll(".admin-nav a")
      .forEach(function (link) {
        const activo = link.id === menuId;
        link.classList.toggle("activo", activo);

        if (activo) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
  }


  function cerrarMenuAdminMovil() {

    if (!adminSidebar || !adminMobileMenuBtn) {
      return;
    }

    adminSidebar.classList.remove("menu-open");
    adminMobileMenuBtn.setAttribute("aria-expanded", "false");
  }


  adminMobileMenuBtn?.addEventListener("click", function () {

    if (!adminSidebar) {
      return;
    }

    const abierto = adminSidebar.classList.toggle("menu-open");
    adminMobileMenuBtn.setAttribute("aria-expanded", String(abierto));
  });


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

            activarMenuAdmin(menuId);
            cerrarMenuAdminMovil();
          }
        );
    }
  );


  let menuScrollTick = false;

  function sincronizarMenuAdminConScroll() {

    menuScrollTick = false;

    const secciones =
      menuIds
        .map(function ([menuId, seccionId]) {
          return {
            menuId: menuId,
            elemento: document.getElementById(seccionId)
          };
        })
        .filter(function (item) { return Boolean(item.elemento); })
        .sort(function (a, b) { return a.elemento.offsetTop - b.elemento.offsetTop; });

    if (!secciones.length) {
      return;
    }

    const referencia = 170;
    let actual = secciones[0];

    secciones.forEach(function (item) {
      if (item.elemento.getBoundingClientRect().top <= referencia) {
        actual = item;
      }
    });

    activarMenuAdmin(actual.menuId);
  }


  window.addEventListener(
    "scroll",
    function () {
      if (menuScrollTick) {
        return;
      }

      menuScrollTick = true;
      window.requestAnimationFrame(sincronizarMenuAdminConScroll);
    },
    { passive: true }
  );


  window.addEventListener("resize", function () {
    if (window.innerWidth > 820) {
      cerrarMenuAdminMovil();
    }

    sincronizarMenuAdminConScroll();
  });


  setTimeout(sincronizarMenuAdminConScroll, 0);

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
        return;
      }

      if (adminSidebar?.classList.contains("menu-open")) {
        cerrarMenuAdminMovil();
        adminMobileMenuBtn?.focus();
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

  function esUrlHttpsValida(valor) {

    const texto =
      String(valor || "").trim();

    if (!texto) {
      return false;
    }

    try {
      const url = new URL(texto);
      return url.protocol === "https:";
    } catch (_) {
      return false;
    }
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
