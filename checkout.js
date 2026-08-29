// @ts-nocheck

// ==========================================================
// URBANX
// CHECKOUT
// FIREBASE AUTH + FIRESTORE
// ==========================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {


    // ======================================================
    // FIREBASE
    // ======================================================

    const firebaseConfig = {

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


    if (
      typeof firebase ===
      "undefined"
    ) {

      alert(
        "Firebase no se pudo cargar."
      );

      return;

    }


    if (
      !firebase.apps.length
    ) {

      firebase.initializeApp(
        firebaseConfig
      );

    }


    const auth =
      firebase.auth();


    const db =
      firebase.firestore();


    const PAYMENTS =
      window.SIXTEEN_PAYMENTS;

    let paymentConfig =
      PAYMENTS
        ? PAYMENTS.readLocal()
        : null;


    // ======================================================
    // ELEMENTOS
    // ======================================================

    const checkoutForm =
      document.getElementById(
        "checkoutForm"
      );


    const checkoutProductos =
      document.getElementById(
        "checkoutProductos"
      );


    const checkoutSubtotal =
      document.getElementById(
        "checkoutSubtotal"
      );


    const checkoutDescuento =
      document.getElementById(
        "checkoutDescuento"
      );


    const checkoutEnvio =
      document.getElementById(
        "checkoutEnvio"
      );


    const checkoutTotal =
      document.getElementById(
        "checkoutTotal"
      );


    const finalizarPedidoBtn =
      document.getElementById(
        "finalizarPedidoBtn"
      );


    const toastCheckout =
      document.getElementById(
        "toastCheckout"
      );


    const provincia =
      document.getElementById(
        "provincia"
      );


    const email =
      document.getElementById(
        "email"
      );


    const telefono =
      document.getElementById(
        "telefono"
      );


    const nombres =
      document.getElementById(
        "nombres"
      );


    const apellidos =
      document.getElementById(
        "apellidos"
      );


    const identificacion =
      document.getElementById(
        "identificacion"
      );


    const ciudad =
      document.getElementById(
        "ciudad"
      );


    const direccion =
      document.getElementById(
        "direccion"
      );


    const referencia =
      document.getElementById(
        "referencia"
      );


    const aceptarTerminos =
      document.getElementById(
        "aceptarTerminos"
      );


    const checkoutPaymentInfo =
      document.getElementById(
        "checkoutPaymentInfo"
      );


    const pagoQrNombreCheckout =
      document.getElementById(
        "pagoQrNombreCheckout"
      );


    const estadoCheckout =
      document.getElementById(
        "estadoCheckout"
      );


    const mensajeCheckout =
      document.getElementById(
        "mensajeCheckout"
      );


    const costoEnvioOpcion =
      document.getElementById(
        "costoEnvioOpcion"
      );


    // ======================================================
    // VARIABLES
    // ======================================================

    let carrito =
      [];


    let resumenCompra = {

      subtotal:
        0,

      descuento:
        0,

      cupon:
        null,

      total:
        0

    };


    let costoEnvio =
      0;


    let carritoValidado =
      false;


    let procesandoPedido =
      false;


    let toastTimer;


    // ======================================================
    // CUPONES
    // Firestore + compatibilidad con códigos anteriores.
    // ======================================================

    const cuponesFallback = {

      SIXTEEN10:
        10,

      SIXTEEN20:
        20,

      URBANX10:
        10,

      URBANX20:
        20,

      LEX15:
        15

    };


    const cupones = {
      ...cuponesFallback
    };


    let cuponRemotoActual =
      false;


    // ======================================================
    // ENVÍOS
    // Firestore reemplaza estas tarifas cuando existe config.
    // ======================================================

    const tarifasEnvioFallback = {

      "Pichincha": 3.00,
      "Guayas": 4.50,
      "Azuay": 4.50,
      "Tungurahua": 4.50,
      "Manabí": 5.00,
      "Loja": 5.00,
      "Imbabura": 4.00,
      "Cotopaxi": 4.00,
      "Chimborazo": 4.50,
      "El Oro": 5.00,
      "Santo Domingo de los Tsáchilas": 4.50,
      "Bolívar": 5.00,
      "Cañar": 5.00,
      "Carchi": 5.00,
      "Esmeraldas": 5.50,
      "Los Ríos": 5.00,
      "Morona Santiago": 6.00,
      "Napo": 6.00,
      "Orellana": 6.00,
      "Pastaza": 6.00,
      "Santa Elena": 5.00,
      "Sucumbíos": 6.00,
      "Zamora Chinchipe": 6.00,
      "Galápagos": 12.00

    };


    let tarifasEnvio = {
      ...tarifasEnvioFallback
    };


    let enviosRemotos =
      null;


    // ======================================================
    // CARGAR CARRITO
    // ======================================================

    function cargarCarrito() {


      try {


        const guardado =
          localStorage.getItem(
            "urbanx_carrito"
          );


        const datos =
          guardado
            ? JSON.parse(
                guardado
              )
            : [];


        carrito =
          Array.isArray(
            datos
          )
            ? datos
            : [];


      } catch (error) {


        console.error(
          "Carrito:",
          error
        );


        carrito =
          [];

      }


      carrito =
        carrito.map(
          function (item) {


            return {

              ...item,

              id:
                String(
                  item.id ||
                  ""
                )
                  .trim()
                  .toUpperCase(),

              precio:
                numero(
                  item.precio
                ),

              cantidad:
                Math.max(
                  1,
                  Math.floor(
                    numero(
                      item.cantidad
                    )
                  )
                ),

              imagen:
                String(
                  item.imagen ||
                  ""
                ),

              varianteId:
                String(
                  item.varianteId ||
                  ""
                ),

              usaVariantes:
                item.usaVariantes ===
                true

            };

          }
        );

    }


    // ======================================================
    // CUPÓN
    // ======================================================

    async function cargarCupon() {

      let codigo =
        null;

      try {

        codigo =
          localStorage.getItem(
            "urbanx_cupon"
          );

      } catch (error) {

        codigo =
          null;
      }

      if (!codigo) {

        resumenCompra.cupon =
          null;

        cuponRemotoActual =
          false;

        return;
      }

      const resultado =
        await obtenerCuponValido(
          codigo
        );

      if (
        resultado.valido
      ) {

        cupones[codigo] =
          resultado.porcentaje;

        resumenCompra.cupon =
          codigo;

        cuponRemotoActual =
          resultado.remoto ===
          true;

      } else {

        resumenCompra.cupon =
          null;

        cuponRemotoActual =
          false;

        try {
          localStorage.removeItem(
            "urbanx_cupon"
          );
        } catch (error) {
          // Sin acción.
        }
      }
    }


    async function obtenerCuponValido(
      codigo
    ) {

      const normalizado =
        String(
          codigo ||
          ""
        )
          .trim()
          .toUpperCase();

      if (!normalizado) {

        return {
          valido:
            false
        };
      }

      try {

        const snapshot =
          await db
            .collection("cupones")
            .doc(
              normalizado
            )
            .get();

        if (snapshot.exists) {

          return {
            ...validarDatosCupon(
              snapshot.data() ||
              {}
            ),

            remoto:
              true
          };
        }

      } catch (error) {

        console.warn(
          "Cupón remoto:",
          error
        );
      }

      if (
        cuponesFallback[
          normalizado
        ]
      ) {

        return {
          valido:
            true,

          porcentaje:
            cuponesFallback[
              normalizado
            ],

          remoto:
            false
        };
      }

      return {
        valido:
          false
      };
    }


    function validarDatosCupon(
      datos
    ) {

      if (
        datos.activo !==
        true
      ) {

        return {
          valido:
            false,

          motivo:
            "El cupón está inactivo."
        };
      }

      const hoy =
        fechaISOHoy();

      const inicio =
        String(
          datos.fechaInicio ||
          ""
        );

      const fin =
        String(
          datos.fechaFin ||
          ""
        );

      if (
        inicio &&
        hoy < inicio
      ) {

        return {
          valido:
            false,

          motivo:
            "El cupón todavía no está vigente."
        };
      }

      if (
        fin &&
        hoy > fin
      ) {

        return {
          valido:
            false,

          motivo:
            "El cupón ha vencido."
        };
      }

      const limite =
        Math.max(
          0,
          Math.floor(
            numero(
              datos.limiteUsos
            )
          )
        );

      const usos =
        Math.max(
          0,
          Math.floor(
            numero(
              datos.usosActuales
            )
          )
        );

      if (
        limite > 0 &&
        usos >= limite
      ) {

        return {
          valido:
            false,

          motivo:
            "El cupón alcanzó su límite de usos."
        };
      }

      const porcentaje =
        Math.max(
          0,
          Math.min(
            100,
            numero(
              datos.porcentaje
            )
          )
        );

      if (porcentaje <= 0) {

        return {
          valido:
            false
        };
      }

      return {
        valido:
          true,

        porcentaje:
          porcentaje
      };
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


    async function cargarTarifasEnvioRemotas() {

      try {

        const snapshot =
          await db
            .collection("envios")
            .get();

        if (snapshot.empty) {
          return;
        }

        const configuracion =
          {};

        const tarifas =
          {};

        snapshot.forEach(
          function (doc) {

            const datos =
              doc.data() ||
              {};

            const provinciaNombre =
              String(
                datos.provincia ||
                ""
              ).trim();

            if (!provinciaNombre) {
              return;
            }

            configuracion[
              provinciaNombre
            ] = {
              activo:
                datos.activo ===
                true,

              tarifa:
                Math.max(
                  0,
                  numero(
                    datos.tarifa
                  )
                )
            };

            if (
              datos.activo ===
              true
            ) {

              tarifas[
                provinciaNombre
              ] =
                Math.max(
                  0,
                  numero(
                    datos.tarifa
                  )
                );
            }
          }
        );

        if (
          Object.keys(
            configuracion
          ).length >
          0
        ) {

          enviosRemotos =
            configuracion;

          tarifasEnvio =
            tarifas;

          aplicarEstadoProvinciasRemotas();
        }

      } catch (error) {

        console.warn(
          "Tarifas remotas:",
          error
        );
      }
    }


    function aplicarEstadoProvinciasRemotas() {

      if (
        !enviosRemotos ||
        !provincia
      ) {
        return;
      }

      Array.from(
        provincia.options
      ).forEach(
        function (option) {

          if (!option.value) {
            return;
          }

          const config =
            enviosRemotos[
              option.value
            ];

          if (!config) {

            option.disabled =
              true;

            return;
          }

          option.disabled =
            config.activo !==
            true;
        }
      );

      if (
        provincia.value &&
        provincia.selectedOptions[0]
          ?.disabled
      ) {

        provincia.value =
          "";

        costoEnvio =
          0;
      }
    }


    // ======================================================
    // BUSCAR PRODUCTO POR CÓDIGO
    // ======================================================

    async function obtenerProducto(
      codigo
    ) {


      const consulta =
        await db
          .collection(
            "productos"
          )
          .where(
            "codigo",
            "==",
            codigo
          )
          .limit(1)
          .get();


      if (
        consulta.empty
      ) {

        return null;

      }


      const documento =
        consulta.docs[0];


      return {

        firestoreId:
          documento.id,

        ...documento.data()

      };

    }


    // ======================================================
    // REVALIDAR CARRITO
    // ======================================================

    async function validarCarritoFirestore() {
      carritoValidado=false;
      finalizarPedidoBtn.disabled=true;
      mensajeCheckout.textContent="";
      estadoCheckout.textContent="Verificando precios, variantes y stock...";

      if(!carrito.length){
        estadoCheckout.textContent="Tu carrito está vacío.";
        renderizarProductos();
        actualizarTotales();
        return false;
      }

      try{
        const codigos=Array.from(new Set(carrito.map(item=>String(item.id||"").trim().toUpperCase())));
        const resultados=await Promise.all(codigos.map(obtenerProducto));
        const catalogo=new Map();
        resultados.forEach((producto,index)=>catalogo.set(codigos[index],producto));

        const cantidades=new Map();

        carrito.forEach(item=>{
          const key=String(item.id||"")+"||"+String(item.varianteId||(String(item.color||"")+"__"+String(item.talla||"")));
          cantidades.set(key,(cantidades.get(key)||0)+numero(item.cantidad));
        });

        const actual=[];

        for(const item of carrito){
          const codigo=String(item.id||"").trim().toUpperCase();
          const producto=catalogo.get(codigo);

          if(!producto)throw new Error("El producto "+codigo+" ya no está disponible.");
          if(normalizar(producto.estado)!=="activo")throw new Error(producto.nombre+" actualmente está inactivo.");

          const usa=window.SIXTEEN_VARIANTS?.hasVariants(producto)===true;
          let varianteId="",color=item.color||"",talla=item.talla||null;
          let stock=Math.max(0,numero(producto.stock));

          if(usa){
            const variante=window.SIXTEEN_VARIANTS.find(producto,{
              id:item.varianteId||"",
              color:item.color||"",
              talla:item.talla||""
            });

            if(!variante){
              throw new Error(
                producto.nombre+": la variante "+(item.color||"Sin color")+" / "+(item.talla||"Única")+" ya no está disponible."
              );
            }

            varianteId=variante.id;
            color=variante.color||color;
            talla=variante.talla||null;
            stock=Math.max(0,numero(variante.stock));
          }

          const key=codigo+"||"+String(varianteId||(String(color||"")+"__"+String(talla||"")));
          const solicitada=cantidades.get(key)||numero(item.cantidad);

          if(stock<=0){
            throw new Error(
              producto.nombre+(usa?" · "+(color||"Sin color")+" / "+(talla||"Única"):"")+" está agotado."
            );
          }

          if(solicitada>stock){
            throw new Error(
              producto.nombre+(usa?" · "+(color||"Sin color")+" / "+(talla||"Única"):"")+
              ": solicitaste "+solicitada+" pero solo hay "+stock+" disponibles."
            );
          }

          actual.push({
            ...item,
            firestoreId:producto.firestoreId,
            nombre:producto.nombre||item.nombre,
            categoria:producto.categoria||item.categoria,
            precio:numero(producto.precio),
            imagen:producto.imagen||"",
            varianteId,
            usaVariantes:usa,
            color,
            talla,
            stock,
            urbanx3d:producto.urbanx3d===true
          });
        }

        carrito=actual;
        guardarCarrito();
        calcularResumen();
        renderizarProductos();
        actualizarTotales();

        carritoValidado=true;
        estadoCheckout.textContent="Pedido verificado · precios, variante y stock actualizados.";
        finalizarPedidoBtn.disabled=false;
        return true;

      }catch(error){
        console.error("Validación carrito:",error);
        carritoValidado=false;
        estadoCheckout.textContent="El pedido necesita revisión.";
        mensajeCheckout.textContent=error.message||"No fue posible verificar tu carrito.";
        finalizarPedidoBtn.disabled=true;
        return false;
      }
    }


    // ======================================================
    // GUARDAR CARRITO
    // ======================================================

    function guardarCarrito() {


      try {


        localStorage.setItem(

          "urbanx_carrito",

          JSON.stringify(
            carrito
          )

        );


      } catch (error) {


        console.error(
          "Guardar carrito:",
          error
        );

      }

    }


    // ======================================================
    // CALCULAR RESUMEN
    // ======================================================

    function calcularResumen() {


      const subtotal =
        carrito.reduce(

          function (
            total,
            item
          ) {


            return (

              total

              +

              (
                numero(
                  item.precio
                )
                *
                numero(
                  item.cantidad
                )
              )

            );

          },

          0

        );


      const cupon =
        resumenCompra.cupon;


      const porcentaje =
        cupon &&
        cupones[cupon]

          ?

          cupones[cupon]

          :

          0;


      const descuento =
        subtotal
        *
        (
          porcentaje /
          100
        );


      resumenCompra = {

        subtotal:
          subtotal,

        descuento:
          descuento,

        descuentoPorcentaje:
          porcentaje,

        cupon:
          cupon,

        total:
          Math.max(
            subtotal -
            descuento,
            0
          )

      };

    }


    // ======================================================
    // RENDER PRODUCTOS
    // ======================================================

    function renderizarProductos() {


      checkoutProductos.innerHTML =
        "";


      if (
        carrito.length ===
        0
      ) {


        checkoutProductos.innerHTML = `

          <div
            style="
              padding:30px 0;
              text-align:center;
              color:#777;
            "
          >

            Tu carrito está vacío.

            <br><br>

            <a
              href="./index.html#productos"
              style="
                color:#111;
                font-weight:900;
                text-decoration:underline;
              "
            >
              Ver productos
            </a>

          </div>

        `;


        finalizarPedidoBtn.disabled =
          true;


        return;

      }


      carrito.forEach(
        function (item) {


          const subtotalItem =
            numero(
              item.precio
            )
            *
            numero(
              item.cantidad
            );


          const imagen =
            item.imagen

              ?

              `
              <img
                src="${escaparAtributo(
                  item.imagen
                )}"
                alt="${escaparAtributo(
                  item.nombre
                )}"
                style="
                  width:100%;
                  height:100%;
                  object-fit:cover;
                  display:block;
                "
                onerror="
                  this.style.display='none';
                  this.nextElementSibling.style.display='grid';
                "
              >

              <div
                style="
                  display:none;
                  width:100%;
                  height:100%;
                  place-items:center;
                  background:#111;
                  color:#d8aa55;
                  font-weight:900;
                "
              >
                XVI
              </div>
              `

              :

              `
              <div
                style="
                  width:100%;
                  height:100%;
                  display:grid;
                  place-items:center;
                  background:#111;
                  color:#d8aa55;
                  font-weight:900;
                "
              >
                XVI
              </div>
              `;


          const elemento =
            document.createElement(
              "article"
            );


          elemento.className =
            "checkout-producto-item";


          elemento.innerHTML = `

            <div class="checkout-producto-imagen">

              ${imagen}

            </div>


            <div class="checkout-producto-info">


              <h3>

                ${escapar(
                  item.nombre
                )}

              </h3>


              <p>

                ${escapar(
                  item.color ||
                  "SIXTEEN"
                )}

              </p>


              <p>

                Talla:
                ${escapar(
                  item.talla ||
                  "Única"
                )}

              </p>


              <p>

                Cantidad:
                ${numero(
                  item.cantidad
                )}

              </p>


            </div>


            <div class="checkout-producto-precio">

              $${subtotalItem.toFixed(
                2
              )}

            </div>

          `;


          checkoutProductos.appendChild(
            elemento
          );

        }
      );

    }


    // ======================================================
    // PROVINCIA
    // ======================================================

    provincia.addEventListener(
      "change",
      function () {


        const seleccion =
          provincia.value;


        if (
          seleccion &&
          tarifasEnvio[seleccion] !==
          undefined
        ) {


          costoEnvio =
            numero(
              tarifasEnvio[
                seleccion
              ]
            );


          checkoutEnvio.textContent =
            "$" +
            costoEnvio.toFixed(
              2
            );


          costoEnvioOpcion.textContent =
            "$" +
            costoEnvio.toFixed(
              2
            );


        } else {


          costoEnvio =
            0;


          checkoutEnvio.textContent =
            "Por calcular";


          costoEnvioOpcion.textContent =
            "Por calcular";

        }


        actualizarTotales();

      }
    );


    // ======================================================
    // TOTALES
    // ======================================================

    function actualizarTotales() {


      const subtotal =
        numero(
          resumenCompra.subtotal
        );


      const descuento =
        numero(
          resumenCompra.descuento
        );


      const total =
        Math.max(

          subtotal
          -
          descuento
          +
          costoEnvio,

          0

        );


      checkoutSubtotal.textContent =
        "$" +
        subtotal.toFixed(
          2
        );


      checkoutDescuento.textContent =
        descuento > 0

          ?

          "-$" +
          descuento.toFixed(
            2
          )

          :

          "$0.00";


      if (
        !provincia.value
      ) {


        checkoutEnvio.textContent =
          "Por calcular";

      }


      checkoutTotal.textContent =
        "$" +
        total.toFixed(
          2
        );

    }


    // ======================================================
    // TELÉFONO
    // ======================================================

    telefono.addEventListener(
      "input",
      function () {


        telefono.value =
          telefono.value
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              10
            );

      }
    );


    // ======================================================
    // IDENTIFICACIÓN
    // ======================================================

    identificacion.addEventListener(
      "input",
      function () {


        identificacion.value =
          identificacion.value
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              13
            );

      }
    );


    // ======================================================
    // VALIDACIONES
    // ======================================================

    function validarCorreo(
      correo
    ) {


      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
          correo
        );

    }


    function validarTelefono(
      numeroTelefono
    ) {


      return /^\d{9,10}$/
        .test(
          numeroTelefono
        );

    }


    function validarCheckout() {


      mensajeCheckout.textContent =
        "";


      if (
        !carritoValidado
      ) {


        mostrarToast(
          "Primero debemos verificar tu pedido."
        );


        return false;

      }


      if (
        carrito.length ===
        0
      ) {


        mostrarToast(
          "Tu carrito está vacío."
        );


        return false;

      }


      if (
        !validarCorreo(
          email.value.trim()
        )
      ) {


        mostrarToast(
          "Ingresa un correo electrónico válido."
        );


        email.focus();


        return false;

      }


      if (
        !validarTelefono(
          telefono.value.trim()
        )
      ) {


        mostrarToast(
          "Ingresa un teléfono válido."
        );


        telefono.focus();


        return false;

      }


      if (
        nombres.value
          .trim()
          .length <
        2
      ) {


        mostrarToast(
          "Ingresa tus nombres."
        );


        nombres.focus();


        return false;

      }


      if (
        apellidos.value
          .trim()
          .length <
        2
      ) {


        mostrarToast(
          "Ingresa tus apellidos."
        );


        apellidos.focus();


        return false;

      }


      if (
        identificacion.value
          .trim()
          .length <
        10
      ) {


        mostrarToast(
          "Revisa la identificación."
        );


        identificacion.focus();


        return false;

      }


      if (
        !provincia.value
      ) {


        mostrarToast(
          "Selecciona una provincia."
        );


        provincia.focus();


        return false;

      }


      if (
        ciudad.value
          .trim()
          .length <
        2
      ) {


        mostrarToast(
          "Ingresa la ciudad."
        );


        ciudad.focus();


        return false;

      }


      if (
        direccion.value
          .trim()
          .length <
        5
      ) {


        mostrarToast(
          "Ingresa la dirección de entrega."
        );


        direccion.focus();


        return false;

      }


      const metodoPago =
        obtenerMetodoPago();

      if (
        !metodoPago
        ||
        !metodoPagoDisponible(
          metodoPago
        )
      ) {

        mostrarToast(
          "Selecciona un método de pago disponible."
        );

        return false;
      }


      if (
        metodoPago ===
        "tarjeta"
        &&
        PAYMENTS
        &&
        !PAYMENTS.instructions(
          "tarjeta",
          paymentConfig
        ).actionUrl
      ) {

        mostrarToast(
          "La pasarela de tarjeta todavía no está configurada."
        );

        return false;
      }


      if (
        !aceptarTerminos.checked
      ) {


        mostrarToast(
          "Debes aceptar los términos y condiciones."
        );


        return false;

      }


      return true;

    }


    // ======================================================
    // MÉTODO PAGO
    // ======================================================

    function escaparHtml(value) {
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
    }


    function escaparAtributo(value) {
      return String(
        value == null
          ? ""
          : value
      )
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }


    function obtenerMetodoPago() {

      const seleccionado =
        document.querySelector(
          'input[name="pago"]:checked'
        );

      if (seleccionado) {
        return seleccionado.value;
      }

      const primero =
        Array.from(
          document.querySelectorAll(
            'input[name="pago"]:not(:disabled)'
          )
        )[0];

      return primero
        ? primero.value
        : "";
    }


    function metodoPagoDisponible(
      metodo
    ) {

      if (!PAYMENTS) {
        return (
          metodo === "transferencia"
          ||
          metodo === "efectivo"
        );
      }

      return PAYMENTS.active(
        metodo,
        paymentConfig
      );
    }


    function renderMetodoPagoInfo() {

      if (
        !checkoutPaymentInfo
        ||
        !PAYMENTS
      ) {
        return;
      }

      const metodo =
        obtenerMetodoPago();

      if (!metodo) {
        checkoutPaymentInfo.classList.remove(
          "visible"
        );
        checkoutPaymentInfo.innerHTML =
          "";
        return;
      }

      const info =
        PAYMENTS.instructions(
          metodo,
          paymentConfig
        );

      const lines =
        (info.lines || [])
          .map(
            line =>
              "<p>"
              +
              escaparHtml(
                line
              )
              +
              "</p>"
          )
          .join("");

      const image =
        info.imageUrl
          ? (
              '<img src="'
              +
              escaparAtributo(
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
              escaparAtributo(
                info.actionUrl
              )
              +
              '" target="_blank" rel="noopener noreferrer">'
              +
              "ABRIR PAGO SEGURO"
              +
              "</a>"
            )
          : "";

      checkoutPaymentInfo.innerHTML =
        "<h3>"
        +
        escaparHtml(
          info.title
          ||
          PAYMENTS.name(
            metodo,
            paymentConfig
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

      checkoutPaymentInfo.classList.add(
        "visible"
      );
    }


    function renderMetodosPago() {

      const methods =
        [
          "transferencia",
          "qr",
          "tarjeta",
          "efectivo"
        ];

      methods.forEach(
        function (method) {

          const input =
            document.querySelector(
              'input[name="pago"][value="'
              +
              method
              +
              '"]'
            );

          const label =
            input?.closest(
              ".opcion-checkout"
            );

          if (!input) {
            return;
          }

          const active =
            metodoPagoDisponible(
              method
            );

          input.disabled =
            !active;

          label?.classList.toggle(
            "payment-disabled",
            !active
          );
        }
      );

      if (
        pagoQrNombreCheckout
        &&
        PAYMENTS
      ) {
        pagoQrNombreCheckout.textContent =
          PAYMENTS.name(
            "qr",
            paymentConfig
          );
      }

      const selected =
        document.querySelector(
          'input[name="pago"]:checked'
        );

      if (
        !selected
        ||
        selected.disabled
      ) {
        const first =
          Array.from(
            document.querySelectorAll(
              'input[name="pago"]:not(:disabled)'
            )
          )[0];

        if (first) {
          first.checked =
            true;
        }
      }

      renderMetodoPagoInfo();
    }


    async function cargarMetodosPago() {

      if (!PAYMENTS) {
        renderMetodosPago();
        return;
      }

      paymentConfig =
        await PAYMENTS.load(
          db
        );

      renderMetodosPago();
    }


    // ======================================================
    // MÉTODO ENTREGA
    // ======================================================

    function obtenerMetodoEntrega() {


      const seleccionado =
        document.querySelector(
          'input[name="envio"]:checked'
        );


      return seleccionado
        ? seleccionado.value
        : "domicilio";

    }


    // ======================================================
    // NÚMERO PEDIDO
    // ======================================================

    function generarNumeroPedido() {


      const ahora =
        new Date();


      const fecha =
        ahora
          .getFullYear()
          .toString()

        +

        String(
          ahora.getMonth() +
          1
        ).padStart(
          2,
          "0"
        )

        +

        String(
          ahora.getDate()
        ).padStart(
          2,
          "0"
        );


      const tiempo =
        String(
          Date.now()
        ).slice(
          -5
        );


      const aleatorio =
        Math.floor(
          10 +
          Math.random() *
          90
        );


      return (
        "SIX-" +
        fecha +
        "-" +
        tiempo +
        aleatorio
      );

    }


    // ======================================================
    // ESPERAR AUTH
    // ======================================================

    function obtenerUsuarioFirebase() {


      return new Promise(
        function (
          resolve,
          reject
        ) {


          let resuelto =
            false;


          const unsubscribe =
            auth.onAuthStateChanged(

              function (user) {


                if (resuelto) {

                  return;

                }


                resuelto =
                  true;


                unsubscribe();


                resolve(
                  user
                );

              },

              function (error) {


                if (resuelto) {

                  return;

                }


                resuelto =
                  true;


                unsubscribe();


                reject(
                  error
                );

              }

            );


          setTimeout(
            function () {


              if (
                !resuelto
              ) {


                resuelto =
                  true;


                unsubscribe();


                resolve(
                  auth.currentUser
                );

              }

            },
            2500
          );

        }
      );

    }


    // ======================================================
    // CUENTA CLIENTE · AUTOCOMPLETAR Y GUARDAR PERFIL
    // ======================================================

    async function cargarPerfilCuentaCheckout() {

      try {

        const usuario =
          await obtenerUsuarioFirebase();


        if (
          !usuario ||
          usuario.isAnonymous
        ) {
          return;
        }


        const snapshot =
          await db
            .collection("cuentas")
            .doc(
              usuario.uid
            )
            .get();


        if (!snapshot.exists) {
          return;
        }


        const perfil =
          snapshot.data() ||
          {};


        ponerSiVacio(
          nombres,
          perfil.nombres
        );

        ponerSiVacio(
          apellidos,
          perfil.apellidos
        );

        ponerSiVacio(
          email,
          usuario.email ||
          perfil.email
        );

        ponerSiVacio(
          telefono,
          perfil.telefono
        );

        ponerSiVacio(
          identificacion,
          perfil.identificacion
        );

        ponerSiVacio(
          ciudad,
          perfil.ciudad
        );

        ponerSiVacio(
          direccion,
          perfil.direccion
        );

        ponerSiVacio(
          referencia,
          perfil.referencia
        );


        if (
          !provincia.value &&
          perfil.provincia
        ) {

          const opcion =
            Array.from(
              provincia.options
            ).find(
              function (option) {

                return (
                  option.value ===
                  perfil.provincia &&
                  !option.disabled
                );
              }
            );


          if (opcion) {

            provincia.value =
              perfil.provincia;


            provincia.dispatchEvent(
              new Event(
                "change"
              )
            );
          }
        }

      } catch (error) {

        console.warn(
          "Perfil checkout:",
          error
        );
      }
    }


    function ponerSiVacio(
      elemento,
      valor
    ) {

      if (
        !elemento ||
        elemento.value ||
        !valor
      ) {
        return;
      }


      elemento.value =
        String(
          valor
        );
    }


    async function guardarUltimaDireccionCuenta(
      usuario
    ) {

      if (
        !usuario ||
        usuario.isAnonymous
      ) {
        return;
      }


      try {

        await db
          .collection("cuentas")
          .doc(
            usuario.uid
          )
          .set(
            {
              uid:
                usuario.uid,

              nombres:
                String(
                  nombres.value ||
                  ""
                ).trim(),

              apellidos:
                String(
                  apellidos.value ||
                  ""
                ).trim(),

              email:
                usuario.email ||
                email.value ||
                "",

              telefono:
                telefono.value ||
                "",

              identificacion:
                identificacion.value ||
                "",

              provincia:
                provincia.value ||
                "",

              ciudad:
                String(
                  ciudad.value ||
                  ""
                ).trim(),

              direccion:
                String(
                  direccion.value ||
                  ""
                ).trim(),

              referencia:
                String(
                  referencia.value ||
                  ""
                ).trim(),

              activo:
                true,

              actualizadoEn:
                firebase.firestore
                  .FieldValue
                  .serverTimestamp()
            },
            {
              merge:
                true
            }
          );

      } catch (error) {

        console.warn(
          "Guardar cuenta desde checkout:",
          error
        );
      }
    }


    // ======================================================
    // SESIÓN CLIENTE
    // ======================================================

    async function garantizarSesionCliente() {


      let usuario =
        await obtenerUsuarioFirebase();


      if (usuario) {

        return usuario;

      }


      const credencial =
        await auth
          .signInAnonymously();


      return credencial.user;

    }


    // ======================================================
    // CREAR OBJETO PEDIDO
    // ======================================================

    function crearPedido(
      usuario
    ) {


      const numeroPedido =
        generarNumeroPedido();


      const subtotal =
        numero(
          resumenCompra.subtotal
        );


      const descuento =
        numero(
          resumenCompra.descuento
        );


      const total =
        Math.max(

          subtotal
          -
          descuento
          +
          costoEnvio,

          0

        );


      const metodoPago =
        obtenerMetodoPago();


      let estadoPago =
        PAYMENTS
          ? PAYMENTS.initialState(
              metodoPago
            )
          : (
              metodoPago === "efectivo"
                ? "Pendiente contra entrega"
                : metodoPago === "tarjeta"
                  ? "Pendiente de pasarela"
                  : "Por verificar"
            );


      return {

        numero:
          numeroPedido,


        clienteUid:
          usuario.uid,


        estado:
          "Pendiente",


        estadoPago:
          estadoPago,


        cliente: {

          nombres:
            nombres.value.trim(),

          apellidos:
            apellidos.value.trim(),

          email:
            email.value
              .trim()
              .toLowerCase(),

          telefono:
            telefono.value.trim(),

          identificacion:
            identificacion.value.trim()

        },


        entrega: {

          metodo:
            obtenerMetodoEntrega(),

          provincia:
            provincia.value,

          ciudad:
            ciudad.value.trim(),

          direccion:
            direccion.value.trim(),

          referencia:
            referencia.value.trim()

        },


        pago: {

          metodo:
            metodoPago,

          nombre:
            PAYMENTS
              ? PAYMENTS.name(
                  metodoPago,
                  paymentConfig
                )
              : "",

          estado:
            estadoPago,

          instrucciones:
            PAYMENTS
              ? PAYMENTS.instructions(
                  metodoPago,
                  paymentConfig
                )
              : {
                  title: "",
                  lines: [],
                  imageUrl: "",
                  actionUrl: ""
                }

        },


        productos:
          carrito.map(
            function (item) {


              return {

                firestoreId:
                  item.firestoreId ||
                  "",

                codigo:
                  item.id,

                nombre:
                  item.nombre,

                categoria:
                  item.categoria,

                precioUnitario:
                  numero(
                    item.precio
                  ),

                color:
                  item.color ||
                  "",

                talla:
                  item.talla ||
                  null,

                varianteId:
                  item.varianteId ||
                  "",

                usaVariantes:
                  item.usaVariantes ===
                  true,

                cantidad:
                  numero(
                    item.cantidad
                  ),

                imagen:
                  item.imagen ||
                  "",

                urbanx3d:
                  item.urbanx3d ===
                  true

              };

            }
          ),


        resumen: {

          subtotal:
            subtotal,

          descuento:
            descuento,

          descuentoPorcentaje:
            numero(
              resumenCompra
                .descuentoPorcentaje
            ),

          envio:
            costoEnvio,

          cupon:
            resumenCompra.cupon ||
            null,

          total:
            total

        },


        origen:
          "urbanx-web",


        version:
          1,


        creadoEn:
          firebase.firestore
            .FieldValue
            .serverTimestamp()

      };

    }


    // ======================================================
    // GUARDAR PEDIDO + CONSUMIR CUPÓN REMOTO
    // ======================================================

    async function guardarPedidoConCupon(
      pedido,
      usuario
    ) {

      const pedidoRef =
        db
          .collection("pedidos")
          .doc();

      const codigo =
        String(
          pedido.resumen?.cupon ||
          ""
        )
          .trim()
          .toUpperCase();

      if (
        !codigo ||
        !cuponRemotoActual
      ) {

        await pedidoRef.set(
          pedido
        );

        return pedidoRef;
      }

      const cuponRef =
        db
          .collection("cupones")
          .doc(
            codigo
          );

      await db.runTransaction(
        async function (transaction) {

          const snapshot =
            await transaction.get(
              cuponRef
            );

          if (!snapshot.exists) {

            throw new Error(
              "El cupón ya no existe. Revisa el resumen antes de continuar."
            );
          }

          const datos =
            snapshot.data() ||
            {};

          const validacion =
            validarDatosCupon(
              datos
            );

          if (!validacion.valido) {

            throw new Error(
              validacion.motivo ||
              "El cupón ya no está disponible."
            );
          }

          if (
            numero(
              validacion.porcentaje
            ) !==
            numero(
              pedido.resumen
                ?.descuentoPorcentaje
            )
          ) {

            throw new Error(
              "El descuento del cupón cambió. Regresa al carrito y revisa el total."
            );
          }

          const usosActuales =
            Math.max(
              0,
              Math.floor(
                numero(
                  datos.usosActuales
                )
              )
            );

          transaction.set(
            pedidoRef,
            pedido
          );

          transaction.update(
            cuponRef,
            {
              usosActuales:
                usosActuales +
                1,

              ultimoPedidoId:
                pedidoRef.id,

              ultimoUsoUid:
                usuario.uid,

              ultimoUsoEn:
                firebase.firestore
                  .FieldValue
                  .serverTimestamp()
            }
          );
        }
      );

      return pedidoRef;
    }


    // ======================================================
    // NOTIFICACIÓN INTERNA · PEDIDO RECIBIDO
    // ======================================================

    async function crearNotificacionPedidoRecibido(
      usuario,
      pedido,
      pedidoId
    ) {

      if (
        !usuario ||
        !pedidoId
      ) {
        return;
      }


      try {

        const notificacionRef =
          db
            .collection("notificaciones")
            .doc(
              usuario.uid
            )
            .collection("items")
            .doc(
              "pedido_" +
              pedidoId +
              "_recibido"
            );


        await notificacionRef.set(
          {
            usuarioUid:
              usuario.uid,

            tipo:
              "pedido_creado",

            pedidoId:
              pedidoId,

            pedidoNumero:
              pedido.numero ||
              pedidoId,

            estado:
              "Pendiente",

            titulo:
              "Pedido recibido",

            mensaje:
              "Recibimos tu pedido. Nuestro equipo revisará la información y te avisaremos cuando sea confirmado.",

            leida:
              false,

            creadoEn:
              firebase.firestore
                .FieldValue
                .serverTimestamp()
          },
          {
            merge:
              true
          }
        );

      } catch (error) {

        console.warn(
          "Notificación de pedido:",
          error
        );
      }
    }


    // ======================================================
    // FINALIZAR
    // ======================================================

    checkoutForm.addEventListener(
      "submit",
      async function (event) {


        event.preventDefault();


        if (
          procesandoPedido
        ) {

          return;

        }


        if (
          !validarCheckout()
        ) {

          return;

        }


        procesandoPedido =
          true;


        finalizarPedidoBtn.disabled =
          true;


        finalizarPedidoBtn.textContent =
          "VERIFICANDO...";


        try {


          // ==================================================
          // VALIDACIÓN FINAL
          // ==================================================

          const valido =
            await validarCarritoFirestore();


          if (!valido) {


            throw new Error(
              "Revisa tu carrito antes de continuar."
            );

          }


          if (
            resumenCompra.cupon
          ) {


            const cuponFinal =
              await obtenerCuponValido(
                resumenCompra.cupon
              );


            if (
              !cuponFinal.valido
            ) {


              throw new Error(
                cuponFinal.motivo ||
                "El cupón ya no está disponible. Regresa al carrito y revisa el total."
              );

            }


            cupones[
              resumenCompra.cupon
            ] =
              cuponFinal.porcentaje;


            cuponRemotoActual =
              cuponFinal.remoto ===
              true;


            calcularResumen();
            actualizarTotales();

          }


          finalizarPedidoBtn.textContent =
            "CREANDO PEDIDO...";


          // ==================================================
          // AUTH ANÓNIMO
          // ==================================================

          const usuario =
            await garantizarSesionCliente();


          // ==================================================
          // CREAR PEDIDO
          // ==================================================

          const pedido =
            crearPedido(
              usuario
            );


          const documento =
            await guardarPedidoConCupon(
              pedido,
              usuario
            );


          await guardarUltimaDireccionCuenta(
            usuario
          );


          await crearNotificacionPedidoRecibido(
            usuario,
            pedido,
            documento.id
          );


          // ==================================================
          // COPIA PARA CONFIRMACIÓN LOCAL
          // ==================================================

          const pedidoConfirmacion = {

            ...pedido,

            firestoreId:
              documento.id,

            fecha:
              new Date()
                .toISOString()

          };


          delete pedidoConfirmacion.creadoEn;


          localStorage.setItem(

            "urbanx_ultimo_pedido",

            JSON.stringify(
              pedidoConfirmacion
            )

          );


          // ==================================================
          // LIMPIAR COMPRA
          // ==================================================

          localStorage.removeItem(
            "urbanx_carrito"
          );


          await window.SIXTEEN_CART_SYNC
            ?.limpiar();


          localStorage.removeItem(
            "urbanx_resumen_compra"
          );


          localStorage.removeItem(
            "urbanx_cupon"
          );


          mostrarToast(
            "Pedido registrado correctamente."
          );


          setTimeout(
            function () {


              window.location.href =
                "./confirmacion.html?pedido=" +
                encodeURIComponent(
                  pedido.numero
                );

            },
            700
          );


        } catch (error) {


          console.error(
            "Crear pedido:",
            error
          );


          procesandoPedido =
            false;


          finalizarPedidoBtn.textContent =
            "REALIZAR PEDIDO";


          if (
            error.code ===
            "auth/operation-not-allowed"
          ) {


            mensajeCheckout.textContent =
              "Debes activar el acceso anónimo en Firebase Authentication.";


          } else if (
            error.code ===
            "permission-denied"
            ||
            error.code ===
            "PERMISSION_DENIED"
          ) {


            mensajeCheckout.textContent =
              "Firestore todavía no permite crear pedidos de clientes.";


          } else {


            mensajeCheckout.textContent =
              error.message ||
              "No fue posible registrar el pedido.";

          }


          finalizarPedidoBtn.disabled =
            !carritoValidado;


          mostrarToast(
            "No se pudo completar el pedido."
          );

        }

      }
    );


    // ======================================================
    // MÉTODO PAGO
    // ======================================================

    document
      .querySelectorAll(
        'input[name="pago"]'
      )
      .forEach(
        function (opcion) {


          opcion.addEventListener(
            "change",
            function () {


              const metodo =
                obtenerMetodoPago();


              renderMetodoPagoInfo();


              if (
                metodo ===
                "tarjeta"
              ) {

                mostrarToast(
                  "La tarjeta se procesa únicamente en la pasarela externa segura."
                );

              }


              if (
                metodo ===
                "efectivo"
              ) {

                mostrarToast(
                  "Pago contra entrega sujeto a confirmación."
                );

              }

            }
          );

        }
      );


    // ======================================================
    // TOAST
    // ======================================================

    function mostrarToast(
      mensaje
    ) {


      clearTimeout(
        toastTimer
      );


      toastCheckout.textContent =
        mensaje;


      toastCheckout.classList.add(
        "activo"
      );


      toastTimer =
        setTimeout(
          function () {


            toastCheckout.classList.remove(
              "activo"
            );

          },
          2800
        );

    }


    // ======================================================
    // UTILIDADES
    // ======================================================

    function numero(
      valor
    ) {


      const resultado =
        Number(
          valor
        );


      return Number.isFinite(
        resultado
      )
        ? resultado
        : 0;

    }


    function normalizar(
      valor
    ) {


      return String(
        valor ||
        ""
      )
        .trim()
        .toLowerCase();

    }


    function escapar(
      valor
    ) {


      const div =
        document.createElement(
          "div"
        );


      div.textContent =
        String(
          valor ??
          ""
        );


      return div.innerHTML;

    }


    function escaparAtributo(
      valor
    ) {


      return String(
        valor ??
        ""
      )
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /"/g,
          "&quot;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        );

    }


    // ======================================================
    // INICIAR
    // ======================================================

    async function iniciarCheckout() {


      cargarCarrito();


      await cargarTarifasEnvioRemotas();


      await cargarPerfilCuentaCheckout();


      await cargarCupon();


      calcularResumen();


      renderizarProductos();


      actualizarTotales();


      await validarCarritoFirestore();

    }


    iniciarCheckout();



    cargarMetodosPago();

  }
);