// ==========================================
// SIXTEEN - CONFIRMACIÓN DE PEDIDO
// confirmacion.js
// ==========================================


// ==========================================
// ELEMENTOS
// ==========================================

const numeroPedido =
  document.getElementById("numeroPedido");

const confirmacionNombre =
  document.getElementById("confirmacionNombre");

const confirmacionEmail =
  document.getElementById("confirmacionEmail");

const confirmacionTelefono =
  document.getElementById("confirmacionTelefono");

const confirmacionProvincia =
  document.getElementById("confirmacionProvincia");

const confirmacionCiudad =
  document.getElementById("confirmacionCiudad");

const confirmacionDireccion =
  document.getElementById("confirmacionDireccion");

const confirmacionReferencia =
  document.getElementById("confirmacionReferencia");

const confirmacionPago =
  document.getElementById("confirmacionPago");

const confirmacionEstado =
  document.getElementById("confirmacionEstado");

const confirmacionPagoInstrucciones =
  document.getElementById(
    "confirmacionPagoInstrucciones"
  );

const confirmacionProductos =
  document.getElementById("confirmacionProductos");

const confirmacionSubtotal =
  document.getElementById("confirmacionSubtotal");

const confirmacionDescuento =
  document.getElementById("confirmacionDescuento");

const confirmacionEnvio =
  document.getElementById("confirmacionEnvio");

const confirmacionTotal =
  document.getElementById("confirmacionTotal");

const abrirUrbanx3d =
  document.getElementById("abrirUrbanx3d");

const seguirPedidoBtn =
  document.getElementById("seguirPedidoBtn");

const toastConfirmacion =
  document.getElementById("toastConfirmacion");


// ==========================================
// VARIABLES
// ==========================================

let pedido = null;


// ==========================================
// CARGAR PEDIDO
// ==========================================

function cargarPedido() {

  try {

    const pedidoGuardado =
      localStorage.getItem(
        "urbanx_ultimo_pedido"
      );


    if (!pedidoGuardado) {

      mostrarErrorPedido();

      return;

    }


    pedido =
      JSON.parse(
        pedidoGuardado
      );


    renderizarPedido();

  } catch (error) {

    console.error(
      "Error al cargar pedido:",
      error
    );


    mostrarErrorPedido();

  }

}


// ==========================================
// MOSTRAR PEDIDO
// ==========================================

function renderizarPedido() {


  // ========================================
  // NÚMERO
  // ========================================

  numeroPedido.textContent =
    pedido.numero || "Sin número";


  if (
    seguirPedidoBtn
  ) {

    seguirPedidoBtn.href =
      "./seguimiento.html?pedido=" +
      encodeURIComponent(
        pedido.firestoreId ||
        pedido.numero ||
        ""
      );
  }


  // ========================================
  // CLIENTE
  // ========================================

  const cliente =
    pedido.cliente || {};


  confirmacionNombre.textContent =
    (
      (cliente.nombres || "") +
      " " +
      (cliente.apellidos || "")
    ).trim() || "-";


  confirmacionEmail.textContent =
    cliente.email || "-";


  confirmacionTelefono.textContent =
    cliente.telefono || "-";


  // ========================================
  // ENTREGA
  // ========================================

  const entrega =
    pedido.entrega || {};


  confirmacionProvincia.textContent =
    entrega.provincia || "-";


  confirmacionCiudad.textContent =
    entrega.ciudad || "-";


  confirmacionDireccion.textContent =
    entrega.direccion || "-";


  confirmacionReferencia.textContent =
    entrega.referencia || "Sin referencia";


  // ========================================
  // PAGO
  // ========================================

  const pago =
    pedido.pago || {};


  const metodoPago =
    typeof pago === "string"
      ? pago
      : (pago.metodo || "");


  const estadoPago =
    typeof pago === "object" && pago
      ? (pago.estado || "")
      : "";


  confirmacionPago.textContent =
    (
      typeof pago === "object"
      &&
      pago
      &&
      pago.nombre
    )
      ? pago.nombre
      : obtenerNombrePago(
          metodoPago
        );


  confirmacionEstado.textContent =
    estadoPago ||
    pedido.estado ||
    "Pendiente";


  renderizarInstruccionesPago(
    metodoPago
  );


  // ========================================
  // PRODUCTOS
  // ========================================

  renderizarProductos();


  // ========================================
  // TOTALES
  // ========================================

  const resumen =
    pedido.resumen || {};


  confirmacionSubtotal.textContent =
    formatoDinero(
      resumen.subtotal || 0
    );


  confirmacionDescuento.textContent =
    resumen.descuento > 0

      ?

      "-" +
      formatoDinero(
        resumen.descuento
      )

      :

      "$0.00";


  confirmacionEnvio.textContent =
    formatoDinero(
      resumen.envio || 0
    );


  confirmacionTotal.textContent =
    formatoDinero(
      resumen.total || 0
    );


  // ========================================
  // ENLACE SIXTEEN 3D
  // ========================================

  configurarUrbanx3d();

}


// ==========================================
// PRODUCTOS
// ==========================================

function renderizarProductos() {


  const productos =
    pedido.productos || [];


  confirmacionProductos.innerHTML =
    "";


  if (productos.length === 0) {

    confirmacionProductos.innerHTML = `

      <p>
        No hay productos registrados.
      </p>

    `;

    return;

  }


  productos.forEach(
    producto => {


      const cantidad =
        Number(
          producto.cantidad || 1
        );


      const precio =
        Number(
          producto.precioUnitario ??
          producto.precio ??
          0
        );


      const subtotal =
        precio *
        cantidad;


      const item =
        document.createElement(
          "article"
        );


      item.className =
        "confirmacion-producto-item";


      item.innerHTML = `

        <div class="confirmacion-producto-imagen">

          ${
            producto.imagen
              ? `<img src="${producto.imagen}" alt="${producto.nombre || "Producto SIXTEEN"}">`
              : "XVI"
          }

        </div>


        <div class="confirmacion-producto-info">


          <h3>

            ${producto.nombre || "Producto SIXTEEN"}

          </h3>


          <p>

            Código:
            ${producto.codigo || producto.id || "-"}

          </p>


          <p>

            Color:
            ${producto.color || "-"}

          </p>


          <p>

            Talla:
            ${producto.talla || "Única"}

          </p>


          <p>

            Cantidad:
            ${cantidad}

          </p>


        </div>


        <div class="confirmacion-producto-precio">

          ${formatoDinero(subtotal)}

        </div>

      `;


      confirmacionProductos.appendChild(
        item
      );

    }
  );

}


// ==========================================
// SIXTEEN 3D
// ==========================================

function configurarUrbanx3d() {


  const productos =
    pedido.productos || [];


  if (productos.length === 0) {

    abrirUrbanx3d.style.display =
      "none";

    return;

  }


  // Por ahora usamos el primer producto
  // comprado.
  //
  // Después podremos hacer que cada
  // producto tenga su propio botón 3D.

  const primerProducto =
    productos[0];


  const codigo =
    primerProducto.codigo ||
    primerProducto.id ||
    "";


  if (!codigo) {

    abrirUrbanx3d.style.display =
      "none";

    return;
  }


  abrirUrbanx3d.href =

    "../urbanx-3d/index.html?producto=" +
    encodeURIComponent(
      codigo
    );


  abrirUrbanx3d.addEventListener(
    "click",
    () => {

      mostrarToast(
        "Abriendo experiencia SIXTEEN 3D."
      );

    }
  );

}


// ==========================================
// NOMBRE DEL MÉTODO DE PAGO
// ==========================================

function obtenerNombrePago(
  metodo
) {


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


  return (
    nombres[metodo] ||
    "Por confirmar"
  );

}



// ==========================================
// INSTRUCCIONES DE PAGO
// ==========================================

function renderizarInstruccionesPago(
  metodo
) {

  if (
    !confirmacionPagoInstrucciones
    ||
    !window.SIXTEEN_PAYMENTS
  ) {
    return;
  }

  const PAY =
    window.SIXTEEN_PAYMENTS;

  const config =
    PAY.readLocal();

  const snapshot =
    (
      pedido
      &&
      typeof pedido.pago === "object"
      &&
      pedido.pago
      &&
      pedido.pago.instrucciones
      &&
      typeof pedido.pago.instrucciones === "object"
    )
      ? pedido.pago.instrucciones
      : null;


  const info =
    snapshot
      ||
      PAY.instructions(
        metodo,
        config
      );

  const escape =
    value => {
      const div =
        document.createElement(
          "div"
        );
      div.textContent =
        String(
          value == null
            ? ""
            : value
        );
      return div.innerHTML;
    };

  const attr =
    value =>
      String(
        value == null
          ? ""
          : value
      )
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

  const lines =
    (info.lines || [])
      .map(
        line =>
          "<p>"
          +
          escape(line)
          +
          "</p>"
      )
      .join("");

  const image =
    info.imageUrl
      ? (
          '<img src="'
          +
          attr(
            info.imageUrl
          )
          +
          '" alt="Código QR de pago SIXTEEN">'
        )
      : "";

  const action =
    metodo === "tarjeta"
    &&
    info.actionUrl
      ? (
          '<a class="payment-secure-link" href="'
          +
          attr(
            info.actionUrl
          )
          +
          '" target="_blank" rel="noopener noreferrer">'
          +
          "IR AL PAGO SEGURO"
          +
          "</a>"
        )
      : "";

  confirmacionPagoInstrucciones
    .innerHTML =
      "<h3>"
      +
      escape(
        info.title
        ||
        PAY.name(
          metodo,
          config
        )
      )
      +
      "</h3>"
      +
      lines
      +
      image
      +
      action;

  confirmacionPagoInstrucciones
    .classList.toggle(
      "visible",
      Boolean(
        info.title
        ||
        lines
        ||
        image
        ||
        action
      )
    );
}


// ==========================================
// FORMATO DE DINERO
// ==========================================

function formatoDinero(
  valor
) {

  return (
    "$" +
    Number(valor)
      .toFixed(2)
  );

}


// ==========================================
// ERROR AL CARGAR PEDIDO
// ==========================================

function mostrarErrorPedido() {


  numeroPedido.textContent =
    "NO DISPONIBLE";


  confirmacionProductos.innerHTML = `

    <div style="
      padding:25px 0;
      color:#777;
      line-height:1.7;
    ">

      No encontramos un pedido reciente
      en este dispositivo.

      <br><br>

      <a
        href="index.html"
        style="
          color:#111;
          font-weight:900;
          text-decoration:underline;
        "
      >

        Volver a SIXTEEN

      </a>

    </div>

  `;


  abrirUrbanx3d.style.display =
    "none";


  mostrarToast(
    "No se encontró información del pedido."
  );

}


// ==========================================
// NOTIFICACIONES
// ==========================================

let toastTimer;


function mostrarToast(
  mensaje
) {


  clearTimeout(
    toastTimer
  );


  toastConfirmacion.textContent =
    mensaje;


  toastConfirmacion.classList.add(
    "activo"
  );


  toastTimer =
    setTimeout(
      () => {

        toastConfirmacion.classList.remove(
          "activo"
        );

      },

      2500

    );

}


// ==========================================
// INICIAR
// ==========================================

cargarPedido();