// @ts-nocheck

// ==========================================================
// URBANX
// CARRITO DE COMPRAS
// FIRESTORE + STOCK + PRECIOS REALES
// ==========================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {


    // ======================================================
    // FIREBASE CONFIG
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


    // ======================================================
    // FIREBASE
    // ======================================================

    let db =
      null;


    if (
      typeof firebase !==
      "undefined"
    ) {


      try {


        if (
          !firebase.apps.length
        ) {

          firebase.initializeApp(
            firebaseConfig
          );

        }


        db =
          firebase.firestore();


      } catch (error) {


        console.error(
          "Firebase:",
          error
        );

      }

    }


    // ======================================================
    // ELEMENTOS
    // ======================================================

    const carritoLista =
      document.getElementById(
        "carritoLista"
      );


    const carritoVacio =
      document.getElementById(
        "carritoVacio"
      );


    const resumenCompra =
      document.getElementById(
        "resumenCompra"
      );


    const cantidadCarrito =
      document.getElementById(
        "cantidadCarrito"
      );


    const cantidadProductosTexto =
      document.getElementById(
        "cantidadProductosTexto"
      );


    const subtotalCarrito =
      document.getElementById(
        "subtotalCarrito"
      );


    const descuentoCarrito =
      document.getElementById(
        "descuentoCarrito"
      );


    const envioCarrito =
      document.getElementById(
        "envioCarrito"
      );


    const totalCarrito =
      document.getElementById(
        "totalCarrito"
      );


    const codigoCupon =
      document.getElementById(
        "codigoCupon"
      );


    const aplicarCuponBtn =
      document.getElementById(
        "aplicarCuponBtn"
      );


    const mensajeCupon =
      document.getElementById(
        "mensajeCupon"
      );


    const checkoutBtn =
      document.getElementById(
        "checkoutBtn"
      );


    const modalEliminar =
      document.getElementById(
        "modalEliminar"
      );


    const cancelarEliminarBtn =
      document.getElementById(
        "cancelarEliminarBtn"
      );


    const confirmarEliminarBtn =
      document.getElementById(
        "confirmarEliminarBtn"
      );


    const toastCarrito =
      document.getElementById(
        "toastCarrito"
      );


    const estadoSincronizacion =
      document.getElementById(
        "estadoSincronizacion"
      );


    const mensajeValidacionCarrito =
      document.getElementById(
        "mensajeValidacionCarrito"
      );


    // ======================================================
    // VARIABLES
    // ======================================================

    let carrito =
      [];


    let itemAEliminar =
      null;


    let descuentoPorcentaje =
      0;


    let cuponActual =
      null;


    let catalogoListo =
      false;


    let catalogoDisponible =
      false;


    let unsubscribeProductos =
      null;


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


    // ======================================================
    // LEER CARRITO LOCAL
    // ======================================================

    async function cargarCarritoLocal() {


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
          "Error leyendo carrito:",
          error
        );


        carrito =
          [];

      }


      carrito =
        carrito.map(
          normalizarItemCarrito
        );


      await cargarCuponGuardado();


      renderizarCarrito();

    }


    // ======================================================
    // NORMALIZAR ITEM
    // ======================================================

    function normalizarItemCarrito(
      item
    ) {


      return {

        ...item,


        id:
          String(
            item.id ||
            ""
          )
            .trim()
            .toUpperCase(),


        nombre:
          String(
            item.nombre ||
            "Producto SIXTEEN"
          ),


        categoria:
          String(
            item.categoria ||
            "SIXTEEN"
          ),


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
              ) ||
              1
            )
          ),


        color:
          String(
            item.color ||
            "SIXTEEN"
          ),


        talla:
          item.talla ??
          null,

        varianteId:
          String(
            item.varianteId ||
            ""
          ),

        usaVariantes:
          item.usaVariantes ===
          true,


        imagen:
          String(
            item.imagen ||
            ""
          ),


        stock:
          item.stock !==
          undefined
            ? numero(
                item.stock
              )
            : null,


        disponible:
          item.disponible !==
          false,


        sincronizado:
          false

      };

    }


    // ======================================================
    // GUARDAR CARRITO
    // ======================================================

    function guardarCarrito() {


      try {


        const limpio =
          carrito.map(
            function (item) {


              return {

                id:
                  item.id,

                firestoreId:
                  item.firestoreId ||
                  "",

                nombre:
                  item.nombre,

                categoria:
                  item.categoria,

                precio:
                  numero(
                    item.precio
                  ),

                color:
                  item.color,

                talla:
                  item.talla,

                varianteId:
                  item.varianteId ||
                  "",

                usaVariantes:
                  item.usaVariantes ===
                  true,

                cantidad:
                  Math.max(
                    1,
                    numero(
                      item.cantidad
                    )
                  ),

                imagen:
                  item.imagen ||
                  "",

                stock:
                  item.stock,

                disponible:
                  item.disponible

              };

            }
          );


        localStorage.setItem(

          "urbanx_carrito",

          JSON.stringify(
            limpio
          )

        );


        window.SIXTEEN_CART_SYNC
          ?.guardar(
            limpio
          );


      } catch (error) {


        console.error(
          "No se pudo guardar el carrito:",
          error
        );

      }

    }


    // ======================================================
    // FIRESTORE
    // ======================================================

    function escucharCatalogo() {


      if (!db) {


        catalogoListo =
          true;


        catalogoDisponible =
          false;


        estadoSincronizacion.textContent =
          "No fue posible verificar los productos.";


        renderizarCarrito();


        return;

      }


      estadoSincronizacion.textContent =
        "Verificando disponibilidad y precios...";


      unsubscribeProductos =
        db
          .collection(
            "productos"
          )
          .onSnapshot(

            function (snapshot) {


              const mapaProductos =
                new Map();


              snapshot.forEach(
                function (documento) {


                  const datos =
                    documento.data();


                  const codigo =
                    String(
                      datos.codigo ||
                      ""
                    )
                      .trim()
                      .toUpperCase();


                  if (!codigo) {

                    return;

                  }


                  mapaProductos.set(
                    codigo,
                    {

                      firestoreId:
                        documento.id,

                      codigo:
                        codigo,

                      nombre:
                        datos.nombre ||
                        "Producto SIXTEEN",

                      categoria:
                        datos.categoria ||
                        "SIXTEEN",

                      precio:
                        numero(
                          datos.precio
                        ),

                      stock:
                        window.SIXTEEN_VARIANTS
                          ?.totalStock(datos)
                        ??
                        Math.max(
                          0,
                          numero(
                            datos.stock
                          )
                        ),

                      usaVariantes:
                        window.SIXTEEN_VARIANTS
                          ?.hasVariants(datos)
                        === true,

                      variantes:
                        window.SIXTEEN_VARIANTS
                          ?.variants(datos)
                        || [],

                      estado:
                        datos.estado ||
                        "Activo",

                      imagen:
                        datos.imagen ||
                        ""

                    }
                  );

                }
              );


              sincronizarCarritoConCatalogo(
                mapaProductos
              );


              catalogoListo =
                true;


              catalogoDisponible =
                true;


              estadoSincronizacion.textContent =
                "Precios y disponibilidad actualizados.";


              guardarCarrito();


              renderizarCarrito();

            },

            function (error) {


              console.error(
                "Error Firestore carrito:",
                error
              );


              catalogoListo =
                true;


              catalogoDisponible =
                false;


              estadoSincronizacion.textContent =
                "No fue posible verificar precios y stock.";


              renderizarCarrito();

            }

          );

    }


    // ======================================================
    // SINCRONIZAR
    // ======================================================

    function sincronizarCarritoConCatalogo(mapaProductos) {
      carrito.forEach(item=>{
        const producto=mapaProductos.get(String(item.id||"").trim().toUpperCase());

        if(!producto){
          item.disponible=false;
          item.sincronizado=true;
          item.motivo="Este producto ya no está disponible.";
          return;
        }

        item.firestoreId=producto.firestoreId;
        item.nombre=producto.nombre;
        item.categoria=producto.categoria;
        item.precio=producto.precio;
        item.imagen=producto.imagen;
        item.sincronizado=true;

        if(normalizar(producto.estado)!=="activo"){
          item.disponible=false;
          item.motivo="Este producto está inactivo.";
          return;
        }

        if(producto.usaVariantes){
          const variante=window.SIXTEEN_VARIANTS.find(producto,{
            id:item.varianteId||"",
            color:item.color||"",
            talla:item.talla||""
          });

          if(!variante){
            item.disponible=false;
            item.stock=0;
            item.motivo="La variante seleccionada ya no está disponible.";
            return;
          }

          item.varianteId=variante.id;
          item.usaVariantes=true;
          item.color=variante.color||item.color||"SIXTEEN";
          item.talla=variante.talla||null;
          item.stock=Math.max(0,numero(variante.stock));
        }else{
          item.varianteId="";
          item.usaVariantes=false;
          item.stock=Math.max(0,numero(producto.stock));
        }

        if(item.stock<=0){
          item.disponible=false;
          item.motivo=producto.usaVariantes?"La variante está agotada.":"Producto agotado.";
          return;
        }

        item.disponible=true;
        item.motivo="";

        if(item.cantidad>item.stock){
          item.motivo="Solo quedan "+item.stock+(item.stock===1?" unidad.":" unidades.");
        }
      });
    }


    // ======================================================
    // CUPÓN GUARDADO
    // ======================================================

    async function cargarCuponGuardado() {

      let guardado =
        null;

      try {

        guardado =
          localStorage.getItem(
            "urbanx_cupon"
          );

      } catch (error) {

        guardado =
          null;
      }

      if (!guardado) {
        return;
      }

      const resultado =
        await obtenerCuponValido(
          guardado
        );

      if (!resultado.valido) {

        cuponActual =
          null;

        descuentoPorcentaje =
          0;

        guardarCupon();

        return;
      }

      cupones[guardado] =
        resultado.porcentaje;

      cuponActual =
        guardado;

      descuentoPorcentaje =
        resultado.porcentaje;

      codigoCupon.value =
        guardado;

      mensajeCupon.textContent =
        "Cupón " +
        guardado +
        " aplicado: " +
        descuentoPorcentaje +
        "% de descuento.";

      mensajeCupon.className =
        "mensaje-cupon correcto";
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

      if (db) {

        try {

          const snapshot =
            await db
              .collection("cupones")
              .doc(
                normalizado
              )
              .get();

          if (snapshot.exists) {

            return validarDatosCupon(
              snapshot.data() ||
              {}
            );
          }

        } catch (error) {

          console.warn(
            "Cupón remoto:",
            error
          );
        }
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
            "Este cupón está inactivo."
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
            "Este cupón todavía no está vigente."
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
            "Este cupón ha vencido."
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
            "Este cupón alcanzó su límite de usos."
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
          porcentaje,

        remoto:
          true
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


    // ======================================================
    // GUARDAR CUPÓN
    // ======================================================

    function guardarCupon() {


      try {


        if (cuponActual) {


          localStorage.setItem(
            "urbanx_cupon",
            cuponActual
          );


        } else {


          localStorage.removeItem(
            "urbanx_cupon"
          );

        }


      } catch (error) {


        console.error(
          "Guardar cupón:",
          error
        );

      }

    }


    // ======================================================
    // RENDERIZAR
    // ======================================================

    function renderizarCarrito() {


      carritoLista.innerHTML =
        "";


      // ====================================================
      // VACÍO
      // ====================================================

      if (
        carrito.length === 0
      ) {


        carritoVacio.classList.add(
          "activo"
        );


        resumenCompra.style.display =
          "none";


        carritoLista.style.display =
          "none";


        estadoSincronizacion.textContent =
          "";


        actualizarContadores();


        actualizarTotales();


        return;

      }


      carritoVacio.classList.remove(
        "activo"
      );


      resumenCompra.style.display =
        "block";


      carritoLista.style.display =
        "flex";


      // ====================================================
      // ITEMS
      // ====================================================

      carrito.forEach(
        function (
          item,
          index
        ) {


          const elemento =
            document.createElement(
              "article"
            );


          elemento.className =
            "carrito-item";


          const subtotalItem =
            numero(
              item.precio
            )
            *
            numero(
              item.cantidad
            );


          const disponible =
            item.disponible !==
            false;


          const excedeStock =
            item.stock !==
              null
            &&
            numero(
              item.cantidad
            )
            >
            numero(
              item.stock
            );


          // ================================================
          // IMAGEN
          // ================================================

          const imagenHTML =
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
                loading="lazy"
                style="
                  width:100%;
                  height:100%;
                  object-fit:cover;
                  display:block;
                "
                onerror="
                  this.style.display='none';
                  this.nextElementSibling.style.display='flex';
                "
              >

              <div
                class="carrito-item-demo"
                style="display:none;"
              >
                XVI
              </div>
              `

              :

              `
              <div class="carrito-item-demo">
                XVI
              </div>
              `;


          // ================================================
          // AVISO
          // ================================================

          let aviso =
            "";


          if (!disponible) {


            aviso = `

              <p
                style="
                  margin-top:10px;
                  color:#c9473c;
                  font-size:11px;
                  font-weight:700;
                "
              >
                ${
                  escapar(
                    item.motivo ||
                    "Producto no disponible."
                  )
                }
              </p>

            `;


          } else if (
            excedeStock
          ) {


            aviso = `

              <p
                style="
                  margin-top:10px;
                  color:#c9473c;
                  font-size:11px;
                  font-weight:700;
                "
              >
                Solo hay
                ${numero(
                  item.stock
                )}
                unidades disponibles.
              </p>

            `;

          }


          // ================================================
          // HTML
          // ================================================

          elemento.innerHTML = `

            <div class="carrito-item-imagen">

              ${imagenHTML}

            </div>


            <div class="carrito-item-info">


              <p class="carrito-item-categoria">

                ${escapar(
                  String(
                    item.categoria ||
                    "SIXTEEN"
                  ).toUpperCase()
                )}

              </p>


              <h3>

                ${escapar(
                  item.nombre
                )}

              </h3>


              <div class="carrito-item-meta">


                <span>

                  Código:
                  ${escapar(
                    item.id
                  )}

                </span>


                <span>

                  Color:
                  ${escapar(
                    item.color ||
                    "SIXTEEN"
                  )}

                </span>


                <span>

                  Talla:
                  ${escapar(
                    item.talla ||
                    "Única"
                  )}

                </span>


                ${
                  item.stock !==
                  null

                    ?

                    `
                    <span>

                      Stock:
                      ${numero(
                        item.stock
                      )}

                    </span>
                    `

                    :

                    ""
                }


              </div>


              ${aviso}


              <div class="carrito-item-cantidad">


                <button
                  type="button"
                  class="restar-item"
                  data-index="${index}"
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>


                <span>
                  ${numero(
                    item.cantidad
                  )}
                </span>


                <button
                  type="button"
                  class="sumar-item"
                  data-index="${index}"
                  aria-label="Aumentar cantidad"

                  ${
                    !disponible ||
                    (
                      item.stock !==
                      null
                      &&
                      numero(
                        item.cantidad
                      )
                      >=
                      numero(
                        item.stock
                      )
                    )

                      ?

                      "disabled"

                      :

                      ""
                  }
                >
                  +
                </button>


              </div>


            </div>


            <div class="carrito-item-final">


              <span class="carrito-item-precio">

                $${subtotalItem.toFixed(
                  2
                )}

              </span>


              <button
                type="button"
                class="eliminar-carrito-btn"
                data-index="${index}"
              >
                Eliminar
              </button>


            </div>

          `;


          if (!disponible) {

            elemento.style.opacity =
              "0.65";

          }


          carritoLista.appendChild(
            elemento
          );

        }
      );


      activarControles();


      actualizarContadores();


      actualizarTotales();

    }


    // ======================================================
    // CONTROLES
    // ======================================================

    function activarControles() {


      // ====================================================
      // RESTAR
      // ====================================================

      document
        .querySelectorAll(
          ".restar-item"
        )
        .forEach(
          function (boton) {


            boton.addEventListener(
              "click",
              function () {


                const index =
                  Number(
                    boton.dataset.index
                  );


                if (
                  !carrito[index]
                ) {

                  return;

                }


                if (
                  numero(
                    carrito[index]
                      .cantidad
                  )
                  >
                  1
                ) {


                  carrito[index]
                    .cantidad--;


                  guardarCarrito();


                  renderizarCarrito();


                } else {


                  abrirModalEliminar(
                    index
                  );

                }

              }
            );

          }
        );


      // ====================================================
      // SUMAR
      // ====================================================

      document
        .querySelectorAll(
          ".sumar-item"
        )
        .forEach(
          function (boton) {


            boton.addEventListener(
              "click",
              function () {


                const index =
                  Number(
                    boton.dataset.index
                  );


                const item =
                  carrito[index];


                if (!item) {

                  return;

                }


                if (
                  item.disponible ===
                  false
                ) {


                  mostrarToast(
                    "Este producto no está disponible."
                  );


                  return;

                }


                if (
                  item.stock !==
                  null
                  &&
                  numero(
                    item.cantidad
                  )
                  >=
                  numero(
                    item.stock
                  )
                ) {


                  mostrarToast(
                    "No hay más unidades disponibles."
                  );


                  return;

                }


                item.cantidad++;


                guardarCarrito();


                renderizarCarrito();


                mostrarToast(
                  "Cantidad actualizada."
                );

              }
            );

          }
        );


      // ====================================================
      // ELIMINAR
      // ====================================================

      document
        .querySelectorAll(
          ".eliminar-carrito-btn"
        )
        .forEach(
          function (boton) {


            boton.addEventListener(
              "click",
              function () {


                abrirModalEliminar(

                  Number(
                    boton.dataset.index
                  )

                );

              }
            );

          }
        );

    }


    // ======================================================
    // MODAL ELIMINAR
    // ======================================================

    function abrirModalEliminar(
      index
    ) {


      itemAEliminar =
        index;


      modalEliminar.classList.add(
        "activo"
      );

    }


    cancelarEliminarBtn.addEventListener(
      "click",
      function () {


        cerrarModalEliminar();

      }
    );


    confirmarEliminarBtn.addEventListener(
      "click",
      function () {


        if (
          itemAEliminar ===
          null
        ) {

          return;

        }


        const producto =
          carrito[
            itemAEliminar
          ];


        carrito.splice(
          itemAEliminar,
          1
        );


        guardarCarrito();


        cerrarModalEliminar();


        renderizarCarrito();


        mostrarToast(

          (
            producto?.nombre ||
            "Producto"
          )
          +
          " eliminado del carrito."

        );

      }
    );


    modalEliminar.addEventListener(
      "click",
      function (event) {


        if (
          event.target ===
          modalEliminar
        ) {

          cerrarModalEliminar();

        }

      }
    );


    document.addEventListener(
      "keydown",
      function (event) {


        if (
          event.key ===
          "Escape"
        ) {

          cerrarModalEliminar();

        }

      }
    );


    function cerrarModalEliminar() {


      modalEliminar.classList.remove(
        "activo"
      );


      itemAEliminar =
        null;

    }


    // ======================================================
    // CONTADORES
    // ======================================================

    function actualizarContadores() {


      const cantidadTotal =
        carrito.reduce(

          function (
            total,
            item
          ) {

            return (
              total +
              numero(
                item.cantidad
              )
            );

          },

          0

        );


      cantidadCarrito.textContent =
        cantidadTotal;


      cantidadProductosTexto.textContent =
        cantidadTotal ===
        1

          ?

          "1 producto"

          :

          cantidadTotal +
          " productos";

    }


    // ======================================================
    // SUBTOTAL
    // ======================================================

    function calcularSubtotal() {


      return carrito.reduce(

        function (
          total,
          item
        ) {


          if (
            item.disponible ===
            false
          ) {

            return total;

          }


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

    }


    // ======================================================
    // VALIDAR CARRITO
    // ======================================================

    function obtenerErrorCarrito() {


      if (
        carrito.length ===
        0
      ) {

        return "Tu carrito está vacío.";

      }


      if (
        !catalogoListo
      ) {

        return "Estamos verificando precios y disponibilidad.";

      }


      if (
        !catalogoDisponible
      ) {

        return "No pudimos verificar el catálogo. Intenta nuevamente.";

      }


      for (
        const item of carrito
      ) {


        if (
          item.disponible ===
          false
        ) {

          return (
            item.nombre +
            " no está disponible."
          );

        }


        if (
          item.stock ===
          null
        ) {

          return (
            "No pudimos verificar el stock de " +
            item.nombre +
            "."
          );

        }


        if (
          numero(
            item.cantidad
          )
          >
          numero(
            item.stock
          )
        ) {

          return (
            "Reduce la cantidad de " +
            item.nombre +
            "."
          );

        }

      }


      return "";

    }


    // ======================================================
    // TOTALES
    // ======================================================

    function actualizarTotales() {


      const subtotal =
        calcularSubtotal();


      const descuento =
        subtotal
        *
        (
          descuentoPorcentaje
          /
          100
        );


      const total =
        Math.max(
          subtotal -
          descuento,
          0
        );


      subtotalCarrito.textContent =
        "$" +
        subtotal.toFixed(
          2
        );


      descuentoCarrito.textContent =
        descuento > 0

          ?

          "-$" +
          descuento.toFixed(
            2
          )

          :

          "$0.00";


      totalCarrito.textContent =
        "$" +
        total.toFixed(
          2
        );


      envioCarrito.textContent =
        carrito.length > 0

          ?

          "Se calcula después"

          :

          "$0.00";


      const error =
        obtenerErrorCarrito();


      mensajeValidacionCarrito.textContent =
        error;


      checkoutBtn.disabled =
        Boolean(
          error
        );

    }


    // ======================================================
    // CUPÓN
    // ======================================================

    aplicarCuponBtn.addEventListener(
      "click",
      async function () {


        const codigo =
          codigoCupon.value
            .trim()
            .toUpperCase();


        mensajeCupon.className =
          "mensaje-cupon";


        if (!codigo) {


          mensajeCupon.textContent =
            "Ingresa un código.";


          mensajeCupon.classList.add(
            "error"
          );


          return;

        }


        aplicarCuponBtn.disabled =
          true;


        aplicarCuponBtn.textContent =
          "VALIDANDO...";


        try {


          const resultado =
            await obtenerCuponValido(
              codigo
            );


          if (
            resultado.valido
          ) {


            cupones[codigo] =
              resultado.porcentaje;


            descuentoPorcentaje =
              resultado.porcentaje;


            cuponActual =
              codigo;


            mensajeCupon.textContent =
              "Cupón aplicado: " +
              descuentoPorcentaje +
              "% de descuento.";


            mensajeCupon.classList.add(
              "correcto"
            );


            guardarCupon();


            actualizarTotales();


            mostrarToast(
              "Descuento " +
              descuentoPorcentaje +
              "% aplicado."
            );


          } else {


            descuentoPorcentaje =
              0;


            cuponActual =
              null;


            mensajeCupon.textContent =
              resultado.motivo ||
              "El código ingresado no es válido.";


            mensajeCupon.classList.add(
              "error"
            );


            guardarCupon();


            actualizarTotales();

          }


        } finally {


          aplicarCuponBtn.disabled =
            false;


          aplicarCuponBtn.textContent =
            "APLICAR";

        }

      }
    );


    codigoCupon.addEventListener(
      "keydown",
      function (event) {


        if (
          event.key ===
          "Enter"
        ) {


          event.preventDefault();


          aplicarCuponBtn.click();

        }

      }
    );


    // ======================================================
    // CHECKOUT
    // ======================================================

    checkoutBtn.addEventListener(
      "click",
      function () {


        const error =
          obtenerErrorCarrito();


        if (error) {


          mostrarToast(
            error
          );


          actualizarTotales();


          return;

        }


        // ==================================================
        // GUARDAR EL CARRITO YA SINCRONIZADO
        // ==================================================

        guardarCarrito();


        // ==================================================
        // RESUMEN
        // ==================================================

        const subtotal =
          calcularSubtotal();


        const descuento =
          subtotal
          *
          (
            descuentoPorcentaje
            /
            100
          );


        const total =
          Math.max(
            subtotal -
            descuento,
            0
          );


        const resumen = {

          subtotal:
            subtotal,

          descuento:
            descuento,

          descuentoPorcentaje:
            descuentoPorcentaje,

          cupon:
            cuponActual,

          total:
            total,

          cantidadItems:
            carrito.reduce(

              function (
                suma,
                item
              ) {

                return (
                  suma +
                  numero(
                    item.cantidad
                  )
                );

              },

              0

            ),

          validadoEn:
            new Date()
              .toISOString()

        };


        try {


          localStorage.setItem(

            "urbanx_resumen_compra",

            JSON.stringify(
              resumen
            )

          );


        } catch (error) {


          console.error(
            "Resumen:",
            error
          );

        }


        window.location.href =
          "./checkout.html";

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


      toastCarrito.textContent =
        mensaje;


      toastCarrito.classList.add(
        "activo"
      );


      toastTimer =
        setTimeout(
          function () {


            toastCarrito.classList.remove(
              "activo"
            );

          },

          2500
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
    // CARRITO RECUPERADO DESDE LA CUENTA
    // ======================================================

    window.addEventListener(
      "sixteen:cart-restored",
      async function () {

        await cargarCarritoLocal();


        mostrarToast(
          "Recuperamos tu carrito guardado."
        );
      }
    );


    // ======================================================
    // CAMBIOS DE LOCALSTORAGE
    // ======================================================

    window.addEventListener(
      "storage",
      function (event) {


        if (
          event.key ===
          "urbanx_carrito"
        ) {


          cargarCarritoLocal();

        }

      }
    );


    // ======================================================
    // LIMPIEZA
    // ======================================================

    window.addEventListener(
      "beforeunload",
      function () {


        if (
          unsubscribeProductos
        ) {

          unsubscribeProductos();

        }

      }
    );


    // ======================================================
    // INICIAR
    // ======================================================

    cargarCarritoLocal();


    escucharCatalogo();


  }
);