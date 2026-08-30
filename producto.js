// @ts-nocheck

// ==========================================================
// SIXTEEN
// FICHA INDIVIDUAL DE PRODUCTO
// FIREBASE FIRESTORE
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

    if (
      typeof firebase ===
      "undefined"
    ) {

      mostrarError(
        "No fue posible conectar con SIXTEEN."
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


    const db =
      firebase.firestore();


    const auth =
      typeof firebase.auth === "function"
        ? firebase.auth()
        : null;


    // ======================================================
    // CÓDIGO DESDE URL
    // producto.html?id=CODIGO_PRODUCTO
    // ======================================================

    const parametros =
      new URLSearchParams(
        window.location.search
      );


    const codigoSolicitado =
      String(
        parametros.get("id") ||
        ""
      )
        .trim()
        .toUpperCase();


    // ======================================================
    // ELEMENTOS
    // ======================================================

    const header =
      document.querySelector(
        ".header"
      );


    const navProducto =
      document.getElementById(
        "navProducto"
      );


    const menuBtnProducto =
      document.getElementById(
        "menuBtnProducto"
      );

    const productoCargando =
      document.getElementById(
        "productoCargando"
      );


    const detalleProducto =
      document.getElementById(
        "detalleProducto"
      );


    const productoError =
      document.getElementById(
        "productoError"
      );


    const productoErrorTexto =
      document.getElementById(
        "productoErrorTexto"
      );


    const nombreProducto =
      document.getElementById(
        "nombreProducto"
      );


    const categoriaProducto =
      document.getElementById(
        "categoriaProducto"
      );


    const codigoProducto =
      document.getElementById(
        "codigoProducto"
      );


    const precioProducto =
      document.getElementById(
        "precioProducto"
      );


    const precioAnteriorProducto =
      document.getElementById(
        "precioAnteriorProducto"
      );


    const descripcionProducto =
      document.getElementById(
        "descripcionProducto"
      );


    const materialesProducto =
      document.getElementById(
        "materialesProducto"
      );


    const detallesProducto =
      document.getElementById(
        "detallesProducto"
      );


    const estadoStock =
      document.getElementById(
        "estadoStock"
      );


    const stockPunto =
      document.getElementById(
        "stockPunto"
      );


    const badgeProducto =
      document.getElementById(
        "badgeProducto"
      );


    const imagenProducto =
      document.getElementById(
        "imagenProducto"
      );


    const imagenDemoProducto =
      document.getElementById(
        "imagenDemoProducto"
      );


    const miniaturasProducto =
      document.getElementById(
        "miniaturasProducto"
      );


    const selectorColores =
      document.getElementById(
        "selectorColores"
      );


    const colorSeleccionado =
      document.getElementById(
        "colorSeleccionado"
      );


    const selectorTallas =
      document.getElementById(
        "selectorTallas"
      );


    const mensajeTalla =
      document.getElementById(
        "mensajeTalla"
      );


    const bloqueTallas =
      document.getElementById(
        "bloqueTallas"
      );


    const cantidadProducto =
      document.getElementById(
        "cantidadProducto"
      );


    const restarCantidad =
      document.getElementById(
        "restarCantidad"
      );


    const sumarCantidad =
      document.getElementById(
        "sumarCantidad"
      );


    const agregarCarritoBtn =
      document.getElementById(
        "agregarCarritoBtn"
      );


    const comprarAhoraBtn =
      document.getElementById(
        "comprarAhoraBtn"
      );


    const guardarFavoritoProductoBtn =
      document.getElementById(
        "guardarFavoritoProductoBtn"
      );


    const guardarFavoritoProductoIcono =
      document.getElementById(
        "guardarFavoritoProductoIcono"
      );


    const guardarFavoritoProductoTexto =
      document.getElementById(
        "guardarFavoritoProductoTexto"
      );


    const cantidadCarritoProducto =
      document.getElementById(
        "cantidadCarritoProducto"
      );


    const guiaTallasBtn =
      document.getElementById(
        "guiaTallasBtn"
      );


    const modalTallas =
      document.getElementById(
        "modalTallas"
      );


    const cerrarModalTallas =
      document.getElementById(
        "cerrarModalTallas"
      );


    const modalTallasContenido =
      modalTallas?.querySelector(
        ".modal-contenido"
      );


    const productosRelacionados =
      document.getElementById(
        "productosRelacionados"
      );


    const seccionRelacionados =
      document.getElementById(
        "seccionRelacionados"
      );


    const compararProductoBtn =
      document.getElementById(
        "compararProductoBtn"
      );


    const productosVistosRecientemente =
      document.getElementById(
        "productosVistosRecientemente"
      );


    const seccionUrbanx3d =
      document.getElementById(
        "seccionUrbanx3d"
      );


    const textoUrbanx3d =
      document.getElementById(
        "textoUrbanx3d"
      );


    // ======================================================
    // RESEÑAS · ELEMENTOS
    // ======================================================

    const seccionResenas =
      document.getElementById(
        "seccionResenas"
      );


    const resenaResumenBtn =
      document.getElementById(
        "resenaResumenBtn"
      );


    const resenaResumenEstrellas =
      document.getElementById(
        "resenaResumenEstrellas"
      );


    const resenaResumenPromedio =
      document.getElementById(
        "resenaResumenPromedio"
      );


    const resenaResumenCantidad =
      document.getElementById(
        "resenaResumenCantidad"
      );


    const resenaPromedioGrande =
      document.getElementById(
        "resenaPromedioGrande"
      );


    const resenaEstrellasGrandes =
      document.getElementById(
        "resenaEstrellasGrandes"
      );


    const resenaCantidadGrande =
      document.getElementById(
        "resenaCantidadGrande"
      );


    const resenaPromedioAside =
      document.getElementById(
        "resenaPromedioAside"
      );


    const resenaEstrellasAside =
      document.getElementById(
        "resenaEstrellasAside"
      );


    const resenaCantidadAside =
      document.getElementById(
        "resenaCantidadAside"
      );


    const resenaListaCantidad =
      document.getElementById(
        "resenaListaCantidad"
      );


    const resenasLista =
      document.getElementById(
        "resenasLista"
      );


    const resenaLoginPrompt =
      document.getElementById(
        "resenaLoginPrompt"
      );


    const resenaLoginBtn =
      document.getElementById(
        "resenaLoginBtn"
      );


    const resenaForm =
      document.getElementById(
        "resenaForm"
      );


    const resenaFormTitulo =
      document.getElementById(
        "resenaFormTitulo"
      );


    const resenaFormDescripcion =
      document.getElementById(
        "resenaFormDescripcion"
      );


    const resenaStarButtons =
      document.getElementById(
        "resenaStarButtons"
      );


    const resenaComentario =
      document.getElementById(
        "resenaComentario"
      );


    const resenaContadorCaracteres =
      document.getElementById(
        "resenaContadorCaracteres"
      );


    const guardarResenaBtn =
      document.getElementById(
        "guardarResenaBtn"
      );


    const eliminarResenaBtn =
      document.getElementById(
        "eliminarResenaBtn"
      );


    const resenaMensaje =
      document.getElementById(
        "resenaMensaje"
      );


    const resenaBar5 =
      document.getElementById(
        "resenaBar5"
      );

    const resenaBar4 =
      document.getElementById(
        "resenaBar4"
      );

    const resenaBar3 =
      document.getElementById(
        "resenaBar3"
      );

    const resenaBar2 =
      document.getElementById(
        "resenaBar2"
      );

    const resenaBar1 =
      document.getElementById(
        "resenaBar1"
      );


    const resenaCount5 =
      document.getElementById(
        "resenaCount5"
      );

    const resenaCount4 =
      document.getElementById(
        "resenaCount4"
      );

    const resenaCount3 =
      document.getElementById(
        "resenaCount3"
      );

    const resenaCount2 =
      document.getElementById(
        "resenaCount2"
      );

    const resenaCount1 =
      document.getElementById(
        "resenaCount1"
      );


    const toastProducto =
      document.getElementById(
        "toastProducto"
      );


    // ======================================================
    // ESTADO
    // ======================================================

    let producto =
      null;


    let productosActivos =
      [];


    let usuarioFavoritos =
      null;


    let favoritosIds =
      new Set();


    let unsubscribeFavoritos =
      null;


    let resenasActuales =
      [];


    let resenaPropia =
      null;


    let calificacionSeleccionada =
      0;


    let unsubscribeResenas =
      null;


    let tallaSeleccionada =
      null;


    let colorActual =
      "";


    let cantidad =
      1;


    let carrito =
      cargarCarrito();


    let unsubscribeProductos =
      null;


    let toastTimer;


    let focoAntesModalTallas =
      null;


    let floatingOffsetFrame =
      null;


    // ======================================================
    // HEADER / MENÚ MÓVIL
    // ======================================================

    function actualizarOffsetFlotante() {

      if (!header || floatingOffsetFrame) {
        return;
      }

      floatingOffsetFrame =
        window.requestAnimationFrame(
          function () {

            const rect =
              header.getBoundingClientRect();

            document.documentElement
              .style
              .setProperty(
                "--sixteen-floating-top",
                `${Math.max(0, Math.round(rect.bottom))}px`
              );

            floatingOffsetFrame =
              null;
          }
        );
    }


    function cerrarMenuProducto() {

      navProducto?.classList.remove(
        "activo"
      );

      menuBtnProducto?.setAttribute(
        "aria-expanded",
        "false"
      );
    }


    menuBtnProducto?.addEventListener(
      "click",
      function () {

        const abierto =
          navProducto?.classList.toggle(
            "activo"
          ) === true;

        menuBtnProducto.setAttribute(
          "aria-expanded",
          abierto ? "true" : "false"
        );
      }
    );


    navProducto
      ?.querySelectorAll("a")
      .forEach(
        function (link) {
          link.addEventListener(
            "click",
            cerrarMenuProducto
          );
        }
      );


    actualizarOffsetFlotante();

    window.addEventListener(
      "resize",
      function () {
        actualizarOffsetFlotante();

        if (window.innerWidth > 900) {
          cerrarMenuProducto();
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "scroll",
      actualizarOffsetFlotante,
      { passive: true }
    );


    // ======================================================
    // VALIDAR CÓDIGO URL
    // ======================================================

    if (!codigoSolicitado) {

      mostrarError(
        "No se indicó qué producto deseas consultar."
      );

      return;

    }


    // ======================================================
    // ESCUCHAR FIRESTORE
    // ======================================================

    function escucharProductos() {


      unsubscribeProductos =
        db
          .collection(
            "productos"
          )
          .where(
            "estado",
            "==",
            "Activo"
          )
          .onSnapshot(

            function (snapshot) {


              productosActivos =
                [];


              snapshot.forEach(
                function (documento) {


                  const datos =
                    documento.data();


                  productosActivos.push({

                    firestoreId:
                      documento.id,

                    codigo:
                      String(
                        datos.codigo ||
                        documento.id
                      )
                        .trim()
                        .toUpperCase(),

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

                    precioAnterior:
                      numero(
                        datos.precioAnterior
                      ),

                    stock:
                      window.SIXTEEN_VARIANTS
                        ?.totalStock(datos)
                      ??
                      numero(
                        datos.stock
                      ),

                    color:
                      datos.color ||
                      "",

                    tallas:
                      Array.isArray(
                        datos.tallas
                      )
                        ? datos.tallas
                        : [],

                    usaVariantes:
                      datos.usaVariantes === true,

                    variantes:
                      window.SIXTEEN_VARIANTS
                        ?.variants(datos)
                      || [],

                    imagen:
                      datos.imagen ||
                      "",

                    imagenes:
                      Array.isArray(
                        datos.imagenes
                      )
                        ? datos.imagenes
                            .map(
                              function (url) {
                                return String(
                                  url ||
                                  ""
                                ).trim();
                              }
                            )
                            .filter(Boolean)
                        : [],

                    modelo3d:
                      datos.modelo3d ||
                      "",

                    descripcion:
                      datos.descripcion ||
                      "",

                    detalles:
                      datos.detalles ||
                      "",

                    materiales:
                      datos.materiales ||
                      "",

                    destacado:
                      datos.destacado ===
                      true,

                    nuevo:
                      datos.nuevo ===
                      true,

                    urbanx3d:
                      datos.urbanx3d ===
                      true,

                    estado:
                      datos.estado ||
                      "Activo",

                    creadoEn:
                      datos.creadoEn ||
                      null

                  });

                }
              );


              const encontrado =
                productosActivos.find(
                  function (item) {

                    return (
                      item.codigo ===
                      codigoSolicitado
                    );

                  }
                );


              if (!encontrado) {

                mostrarError(
                  "Este producto no existe o actualmente no está disponible."
                );

                return;

              }


              producto =
                encontrado;


              cargarProducto();


              cargarRelacionados();


              escucharResenas(
                producto.codigo
              );


            },

            function (error) {


              console.error(
                "Error Firestore:",
                error
              );


              mostrarError(
                "No fue posible cargar el producto."
              );

            }

          );

    }


    // ======================================================
    // FAVORITOS · FIRESTORE
    // ======================================================

    if (auth) {

      auth.onAuthStateChanged(
        function (usuario) {

          usuarioFavoritos =
            usuario &&
            !usuario.isAnonymous
              ? usuario
              : null;


          detenerFavoritos();


          favoritosIds =
            new Set();


          actualizarFavoritosUI();


          actualizarEstadoFormularioResena();


          if (
            usuarioFavoritos
          ) {

            escucharFavoritos(
              usuarioFavoritos.uid
            );

          }

        }
      );
    }


    function escucharFavoritos(
      uid
    ) {

      detenerFavoritos();


      unsubscribeFavoritos =
        db
          .collection("favoritos")
          .doc(uid)
          .collection("items")
          .onSnapshot(
            function (snapshot) {

              const nuevos =
                new Set();


              snapshot.forEach(
                function (doc) {

                  const datos =
                    doc.data() ||
                    {};


                  nuevos.add(
                    String(
                      datos.codigo ||
                      doc.id
                    )
                      .trim()
                      .toUpperCase()
                  );
                }
              );


              favoritosIds =
                nuevos;


              actualizarFavoritosUI();

            },
            function (error) {

              console.error(
                "Favoritos producto:",
                error
              );
            }
          );
    }


    function detenerFavoritos() {

      if (
        unsubscribeFavoritos
      ) {

        unsubscribeFavoritos();

        unsubscribeFavoritos =
          null;
      }
    }


    function actualizarFavoritosUI() {

      if (
        producto &&
        guardarFavoritoProductoBtn
      ) {

        const activo =
          favoritosIds.has(
            String(
              producto.codigo ||
              ""
            )
              .trim()
              .toUpperCase()
          );


        guardarFavoritoProductoBtn
          .classList.toggle(
            "activo",
            activo
          );


        guardarFavoritoProductoIcono.textContent =
          activo
            ? "♥"
            : "♡";


        guardarFavoritoProductoTexto.textContent =
          activo
            ? "GUARDADO EN FAVORITOS"
            : "GUARDAR EN FAVORITOS";


        guardarFavoritoProductoBtn
          .setAttribute(
            "aria-label",
            activo
              ? "Eliminar producto de favoritos"
              : "Agregar producto a favoritos"
          );
      }


      document
        .querySelectorAll(
          ".favorito-btn[data-id]"
        )
        .forEach(
          function (btn) {

            const codigo =
              String(
                btn.dataset.id ||
                ""
              )
                .trim()
                .toUpperCase();


            const activo =
              favoritosIds.has(
                codigo
              );


            btn.classList.toggle(
              "activo",
              activo
            );


            btn.textContent =
              activo
                ? "♥"
                : "♡";


            btn.setAttribute(
              "aria-label",
              activo
                ? "Eliminar producto de favoritos"
                : "Agregar producto a favoritos"
            );
          }
        );
    }


    async function alternarFavorito(
      codigo
    ) {

      const codigoNormalizado =
        String(
          codigo ||
          ""
        )
          .trim()
          .toUpperCase();


      if (
        !codigoNormalizado
      ) {
        return;
      }


      if (
        !usuarioFavoritos
      ) {

        mostrarToast(
          "Inicia sesión para guardar favoritos."
        );


        setTimeout(
          function () {

            window.location.href =
              "./cuenta.html";

          },
          800
        );


        return;
      }


      const favoritoRef =
        db
          .collection("favoritos")
          .doc(
            usuarioFavoritos.uid
          )
          .collection("items")
          .doc(
            codigoNormalizado
          );


      const existe =
        favoritosIds.has(
          codigoNormalizado
        );


      if (
        existe
      ) {

        favoritosIds.delete(
          codigoNormalizado
        );

        actualizarFavoritosUI();


        try {

          await favoritoRef.delete();


          mostrarToast(
            "Producto eliminado de favoritos."
          );

        } catch (error) {

          favoritosIds.add(
            codigoNormalizado
          );

          actualizarFavoritosUI();


          console.error(
            "Eliminar favorito:",
            error
          );


          mostrarToast(
            "No fue posible eliminar el favorito."
          );
        }


        return;
      }


      const item =
        (
          producto &&
          String(
            producto.codigo ||
            ""
          )
            .trim()
            .toUpperCase() ===
            codigoNormalizado
        )
          ? producto
          : productosActivos.find(
              function (productoItem) {

                return (
                  String(
                    productoItem.codigo ||
                    ""
                  )
                    .trim()
                    .toUpperCase() ===
                  codigoNormalizado
                );
              }
            );


      if (!item) {

        mostrarToast(
          "No fue posible guardar este producto."
        );

        return;
      }


      favoritosIds.add(
        codigoNormalizado
      );

      actualizarFavoritosUI();


      try {

        await favoritoRef.set({
          codigo:
            codigoNormalizado,

          nombre:
            item.nombre ||
            codigoNormalizado,

          categoria:
            item.categoria ||
            "",

          precio:
            numero(
              item.precio
            ),

          imagen:
            item.imagen ||
            "",

          color:
            item.color ||
            "",

          agregadoEn:
            firebase.firestore
              .FieldValue
              .serverTimestamp()
        });


        mostrarToast(
          "Producto guardado en favoritos."
        );

      } catch (error) {

        favoritosIds.delete(
          codigoNormalizado
        );

        actualizarFavoritosUI();


        console.error(
          "Guardar favorito:",
          error
        );


        mostrarToast(
          "No fue posible guardar el favorito."
        );
      }
    }


    guardarFavoritoProductoBtn
      ?.addEventListener(
        "click",
        async function () {

          if (!producto) {
            return;
          }


          guardarFavoritoProductoBtn.disabled =
            true;


          try {

            await alternarFavorito(
              producto.codigo
            );

          } finally {

            guardarFavoritoProductoBtn.disabled =
              false;
          }
        }
      );


    // ======================================================
    // RESEÑAS Y CALIFICACIONES · FIRESTORE
    // ======================================================

    function escucharResenas(
      codigo
    ) {

      detenerResenas();


      if (!codigo) {
        return;
      }


      unsubscribeResenas =
        db
          .collection("resenas")
          .doc(
            String(
              codigo
            )
              .trim()
              .toUpperCase()
          )
          .collection("items")
          .onSnapshot(
            function (snapshot) {

              const datos =
                [];


              snapshot.forEach(
                function (doc) {

                  datos.push({
                    id:
                      doc.id,
                    ...doc.data()
                  });
                }
              );


              datos.sort(
                function (a, b) {

                  return (
                    fechaMillisResena(
                      b.actualizadoEn ||
                      b.creadoEn
                    )
                    -
                    fechaMillisResena(
                      a.actualizadoEn ||
                      a.creadoEn
                    )
                  );
                }
              );


              resenasActuales =
                datos;


              actualizarResumenResenas();

              renderResenas();

              actualizarEstadoFormularioResena();

            },
            function (error) {

              console.error(
                "Reseñas:",
                error
              );


              resenasLista.innerHTML = `
                <div class="resenas-empty">
                  <span>!</span>

                  <strong>
                    NO FUE POSIBLE CARGAR LAS RESEÑAS.
                    REVISA LAS REGLAS DE FIRESTORE DEL PASO 8.
                  </strong>
                </div>
              `;
            }
          );
    }


    function detenerResenas() {

      if (
        unsubscribeResenas
      ) {

        unsubscribeResenas();

        unsubscribeResenas =
          null;
      }
    }


    function actualizarResumenResenas() {

      const total =
        resenasActuales.length;


      const suma =
        resenasActuales.reduce(
          function (
            acumulado,
            resena
          ) {

            return (
              acumulado +
              Math.max(
                1,
                Math.min(
                  5,
                  Math.round(
                    numero(
                      resena.calificacion
                    )
                  )
                )
              )
            );

          },
          0
        );


      const promedio =
        total > 0
          ? suma / total
          : 0;


      const promedioTexto =
        promedio.toFixed(
          1
        );


      const estrellas =
        estrellasPromedio(
          promedio
        );


      const cantidadTexto =
        total === 0
          ? "Sin reseñas"
          : total === 1
            ? "1 reseña"
            : total + " reseñas";


      resenaResumenEstrellas.textContent =
        estrellas;

      resenaResumenPromedio.textContent =
        promedioTexto;

      resenaResumenCantidad.textContent =
        cantidadTexto;


      resenaPromedioGrande.textContent =
        promedioTexto;

      resenaEstrellasGrandes.textContent =
        estrellas;

      resenaCantidadGrande.textContent =
        cantidadTexto;


      resenaPromedioAside.textContent =
        promedioTexto;

      resenaEstrellasAside.textContent =
        estrellas;

      resenaCantidadAside.textContent =
        total === 1
          ? "1 opinión"
          : total + " opiniones";


      resenaListaCantidad.textContent =
        total +
        (
          total === 1
            ? " RESEÑA"
            : " RESEÑAS"
        );


      const conteos = {
        1:
          0,
        2:
          0,
        3:
          0,
        4:
          0,
        5:
          0
      };


      resenasActuales.forEach(
        function (resena) {

          const valor =
            Math.max(
              1,
              Math.min(
                5,
                Math.round(
                  numero(
                    resena.calificacion
                  )
                )
              )
            );


          conteos[
            valor
          ] += 1;
        }
      );


      actualizarBarraResena(
        5,
        conteos[5],
        total,
        resenaBar5,
        resenaCount5
      );

      actualizarBarraResena(
        4,
        conteos[4],
        total,
        resenaBar4,
        resenaCount4
      );

      actualizarBarraResena(
        3,
        conteos[3],
        total,
        resenaBar3,
        resenaCount3
      );

      actualizarBarraResena(
        2,
        conteos[2],
        total,
        resenaBar2,
        resenaCount2
      );

      actualizarBarraResena(
        1,
        conteos[1],
        total,
        resenaBar1,
        resenaCount1
      );
    }


    function actualizarBarraResena(
      estrellas,
      cantidadResenas,
      total,
      barra,
      contador
    ) {

      const porcentaje =
        total > 0
          ? (
              cantidadResenas /
              total
            ) *
            100
          : 0;


      barra.style.width =
        porcentaje.toFixed(
          1
        ) +
        "%";


      contador.textContent =
        cantidadResenas;
    }


    function renderResenas() {

      if (
        !resenasActuales.length
      ) {

        resenasLista.innerHTML = `
          <div class="resenas-empty">

            <span>
              ☆
            </span>

            <strong>
              TODAVÍA NO HAY RESEÑAS.
            </strong>

            <p>
              Sé el primero en compartir tu opinión sobre este producto.
            </p>

          </div>
        `;

        return;
      }


      resenasLista.innerHTML =
        "";


      resenasActuales.forEach(
        function (resena) {

          const articulo =
            document.createElement(
              "article"
            );


          articulo.className =
            "resena-item";


          const calificacion =
            Math.max(
              1,
              Math.min(
                5,
                Math.round(
                  numero(
                    resena.calificacion
                  )
                )
              )
            );


          const nombre =
            resena.usuarioNombre ||
            "Cliente SIXTEEN";


          const inicial =
            String(
              nombre
            )
              .trim()
              .charAt(0)
              .toUpperCase() ||
            "S";


          articulo.innerHTML = `
            <div class="resena-item-top">

              <div class="resena-user">

                <span class="resena-avatar">
                  ${escapar(
                    inicial
                  )}
                </span>

                <div>

                  <strong>
                    ${escapar(
                      nombre
                    )}
                  </strong>

                  <small>
                    ${escapar(
                      fechaResenaLegible(
                        resena.actualizadoEn ||
                        resena.creadoEn
                      )
                    )}
                  </small>

                </div>

              </div>


              <span class="resena-item-stars">
                ${estrellasEnteras(
                  calificacion
                )}
              </span>

            </div>


            <p class="resena-item-comment">
              ${escapar(
                resena.comentario ||
                ""
              ).replace(
                /\n/g,
                "<br>"
              )}
            </p>
          `;


          resenasLista.appendChild(
            articulo
          );
        }
      );
    }


    function actualizarEstadoFormularioResena() {

      const autenticado =
        Boolean(
          usuarioFavoritos
        );


      resenaLoginPrompt.hidden =
        autenticado;


      resenaForm.hidden =
        !autenticado;


      resenaPropia =
        autenticado
          ? resenasActuales.find(
              function (resena) {

                return (
                  resena.usuarioUid ===
                  usuarioFavoritos.uid
                );
              }
            ) ||
            null
          : null;


      if (!autenticado) {

        calificacionSeleccionada =
          0;


        actualizarEstrellasFormulario();


        resenaComentario.value =
          "";


        eliminarResenaBtn.hidden =
          true;


        resenaFormTitulo.textContent =
          "Califica este producto";


        resenaFormDescripcion.textContent =
          "Inicia sesión para compartir tu experiencia.";


        return;
      }


      if (
        resenaPropia
      ) {

        calificacionSeleccionada =
          Math.max(
            1,
            Math.min(
              5,
              Math.round(
                numero(
                  resenaPropia.calificacion
                )
              )
            )
          );


        resenaComentario.value =
          resenaPropia.comentario ||
          "";


        eliminarResenaBtn.hidden =
          false;


        guardarResenaBtn.textContent =
          "ACTUALIZAR RESEÑA";


        resenaFormTitulo.textContent =
          "Tu reseña";


        resenaFormDescripcion.textContent =
          "Puedes actualizar tu calificación y comentario.";

      } else {

        calificacionSeleccionada =
          0;


        resenaComentario.value =
          "";


        eliminarResenaBtn.hidden =
          true;


        guardarResenaBtn.textContent =
          "PUBLICAR RESEÑA";


        resenaFormTitulo.textContent =
          "Califica este producto";


        resenaFormDescripcion.textContent =
          "Comparte tu experiencia con la comunidad SIXTEEN.";
      }


      actualizarEstrellasFormulario();

      actualizarContadorResena();
    }


    resenaResumenBtn
      ?.addEventListener(
        "click",
        function () {

          seccionResenas
            ?.scrollIntoView({
              behavior:
                "smooth",

              block:
                "start"
            });
        }
      );


    resenaLoginBtn
      ?.addEventListener(
        "click",
        function () {

          window.location.href =
            "./cuenta.html";
        }
      );


    resenaStarButtons
      ?.querySelectorAll(
        "button[data-rating]"
      )
      .forEach(
        function (boton) {

          boton.addEventListener(
            "click",
            function () {

              calificacionSeleccionada =
                Math.max(
                  1,
                  Math.min(
                    5,
                    Math.round(
                      numero(
                        boton.dataset.rating
                      )
                    )
                  )
                );


              actualizarEstrellasFormulario();


              mostrarMensajeResena(
                "",
                false
              );
            }
          );
        }
      );


    function actualizarEstrellasFormulario() {

      resenaStarButtons
        ?.querySelectorAll(
          "button[data-rating]"
        )
        .forEach(
          function (boton) {

            const valor =
              Math.round(
                numero(
                  boton.dataset.rating
                )
              );


            const activo =
              valor <=
              calificacionSeleccionada;


            boton.classList.toggle(
              "activo",
              activo
            );


            boton.textContent =
              activo
                ? "★"
                : "☆";


            boton.setAttribute(
              "role",
              "radio"
            );

            boton.setAttribute(
              "aria-checked",
              valor === calificacionSeleccionada
                ? "true"
                : "false"
            );
          }
        );
    }


    resenaComentario
      ?.addEventListener(
        "input",
        actualizarContadorResena
      );


    function actualizarContadorResena() {

      const largo =
        String(
          resenaComentario?.value ||
          ""
        ).length;


      resenaContadorCaracteres.textContent =
        largo +
        " / 600";
    }


    resenaForm
      ?.addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();


          if (
            !usuarioFavoritos ||
            !producto
          ) {

            mostrarMensajeResena(
              "Inicia sesión para publicar una reseña.",
              false
            );

            return;
          }


          if (
            calificacionSeleccionada <
            1 ||
            calificacionSeleccionada >
            5
          ) {

            mostrarMensajeResena(
              "Selecciona entre 1 y 5 estrellas.",
              false
            );

            return;
          }


          const comentario =
            String(
              resenaComentario.value ||
              ""
            ).trim();


          if (
            comentario.length <
            3
          ) {

            mostrarMensajeResena(
              "Escribe un comentario de al menos 3 caracteres.",
              false
            );

            return;
          }


          guardarResenaBtn.disabled =
            true;


          guardarResenaBtn.textContent =
            "GUARDANDO...";


          mostrarMensajeResena(
            "Guardando tu reseña...",
            true
          );


          try {

            const codigo =
              String(
                producto.codigo ||
                ""
              )
                .trim()
                .toUpperCase();


            const ref =
              db
                .collection("resenas")
                .doc(
                  codigo
                )
                .collection("items")
                .doc(
                  usuarioFavoritos.uid
                );


            const nombreUsuario =
              String(
                usuarioFavoritos.displayName ||
                "Cliente SIXTEEN"
              )
                .trim()
                .slice(
                  0,
                  80
                ) ||
              "Cliente SIXTEEN";


            const datos = {
              productoCodigo:
                codigo,

              usuarioUid:
                usuarioFavoritos.uid,

              usuarioNombre:
                nombreUsuario,

              calificacion:
                calificacionSeleccionada,

              comentario:
                comentario.slice(
                  0,
                  600
                ),

              actualizadoEn:
                firebase.firestore
                  .FieldValue
                  .serverTimestamp()
            };


            if (
              !resenaPropia
            ) {

              datos.creadoEn =
                firebase.firestore
                  .FieldValue
                  .serverTimestamp();
            }


            await ref.set(
              datos,
              {
                merge:
                  true
              }
            );


            mostrarMensajeResena(
              resenaPropia
                ? "Reseña actualizada correctamente."
                : "Reseña publicada correctamente.",
              true
            );


            mostrarToast(
              resenaPropia
                ? "Tu reseña fue actualizada."
                : "Gracias por compartir tu opinión."
            );

          } catch (error) {

            console.error(
              "Guardar reseña:",
              error
            );


            mostrarMensajeResena(
              error.message ||
              "No fue posible guardar tu reseña.",
              false
            );

          } finally {

            guardarResenaBtn.disabled =
              false;


            guardarResenaBtn.textContent =
              resenaPropia
                ? "ACTUALIZAR RESEÑA"
                : "PUBLICAR RESEÑA";
          }
        }
      );


    eliminarResenaBtn
      ?.addEventListener(
        "click",
        async function () {

          if (
            !usuarioFavoritos ||
            !producto ||
            !resenaPropia
          ) {
            return;
          }


          const confirmar =
            window.confirm(
              "¿Deseas eliminar tu reseña de este producto?"
            );


          if (!confirmar) {
            return;
          }


          eliminarResenaBtn.disabled =
            true;


          try {

            await db
              .collection("resenas")
              .doc(
                String(
                  producto.codigo ||
                  ""
                )
                  .trim()
                  .toUpperCase()
              )
              .collection("items")
              .doc(
                usuarioFavoritos.uid
              )
              .delete();


            mostrarToast(
              "Tu reseña fue eliminada."
            );


            mostrarMensajeResena(
              "Reseña eliminada.",
              true
            );

          } catch (error) {

            console.error(
              "Eliminar reseña:",
              error
            );


            mostrarMensajeResena(
              "No fue posible eliminar tu reseña.",
              false
            );

          } finally {

            eliminarResenaBtn.disabled =
              false;
          }
        }
      );


    function mostrarMensajeResena(
      texto,
      correcto
    ) {

      resenaMensaje.textContent =
        texto ||
        "";


      resenaMensaje.className =
        "resena-form-message";


      if (
        texto &&
        correcto
      ) {

        resenaMensaje.classList.add(
          "correcto"
        );
      }
    }


    function estrellasEnteras(
      valor
    ) {

      const numeroEstrellas =
        Math.max(
          0,
          Math.min(
            5,
            Math.round(
              numero(
                valor
              )
            )
          )
        );


      return (
        "★".repeat(
          numeroEstrellas
        )
        +
        "☆".repeat(
          5 -
          numeroEstrellas
        )
      );
    }


    function estrellasPromedio(
      valor
    ) {

      return estrellasEnteras(
        valor
      );
    }


    function fechaMillisResena(
      valor
    ) {

      if (
        valor &&
        typeof valor.toMillis ===
        "function"
      ) {

        return valor.toMillis();
      }


      if (
        valor &&
        typeof valor.toDate ===
        "function"
      ) {

        return valor
          .toDate()
          .getTime();
      }


      const fecha =
        new Date(
          valor ||
          0
        );


      return Number.isNaN(
        fecha.getTime()
      )
        ? 0
        : fecha.getTime();
    }


    function fechaResenaLegible(
      valor
    ) {

      let fecha =
        null;


      if (
        valor &&
        typeof valor.toDate ===
        "function"
      ) {

        fecha =
          valor.toDate();

      } else if (valor) {

        fecha =
          new Date(
            valor
          );
      }


      if (
        !fecha ||
        Number.isNaN(
          fecha.getTime()
        )
      ) {

        return "Ahora";
      }


      return fecha.toLocaleDateString(
        "es-EC",
        {
          year:
            "numeric",

          month:
            "short",

          day:
            "2-digit"
        }
      );
    }


    // ======================================================
    // CARGAR PRODUCTO
    // ======================================================

    function cargarProducto() {


      if (!producto) {

        return;

      }


      if (productoCargando) {

        productoCargando.style.display =
          "none";

      }


      if (productoError) {

        productoError.style.display =
          "none";

      }


      if (detalleProducto) {

        detalleProducto.style.display =
          "";

      }


      document.title =
        producto.nombre +
        " | SIXTEEN";

      window.SIXTEEN_SEO
        ?.updateProduct(
          producto
        );


      if (
        compararProductoBtn
      ) {

        compararProductoBtn.dataset.compareId =
          producto.codigo;


        compararProductoBtn.dataset.compareName =
          producto.nombre;
      }


      window.SIXTEEN_PRODUCT_TOOLS
        ?.rememberViewed(
          producto
        );


      window.SIXTEEN_PRODUCT_TOOLS
        ?.renderRecent(
          productosVistosRecientemente,
          producto.codigo,
          4
        );


      window.SIXTEEN_PRODUCT_TOOLS
        ?.refresh();


      nombreProducto.textContent =
        producto.nombre;


      categoriaProducto.textContent =
        String(
          producto.categoria
        ).toUpperCase();


      codigoProducto.textContent =
        "Código: " +
        producto.codigo;


      precioProducto.textContent =
        "$" +
        producto.precio.toFixed(2);


      // ====================================================
      // PRECIO ANTERIOR
      // ====================================================

      if (
        producto.precioAnterior > 0 &&
        producto.precioAnterior >
        producto.precio
      ) {

        precioAnteriorProducto.textContent =
          "$" +
          producto.precioAnterior
            .toFixed(2);

        precioAnteriorProducto.style.display =
          "";

      } else {

        precioAnteriorProducto.textContent =
          "";

        precioAnteriorProducto.style.display =
          "none";

      }


      // ====================================================
      // DESCRIPCIÓN
      // ====================================================

      descripcionProducto.textContent =
        producto.descripcion ||
        "Producto original SIXTEEN de colección urbana.";


      // ====================================================
      // BADGE
      // ====================================================

      if (producto.nuevo) {

        badgeProducto.textContent =
          "NUEVO";

        badgeProducto.style.display =
          "";

      } else {

        badgeProducto.style.display =
          "none";

      }


      // ====================================================
      // IMAGEN
      // ====================================================

      cargarImagen();


      // ====================================================
      // STOCK
      // ====================================================

      cargarStock();


      // ====================================================
      // COLOR
      // ====================================================

      cargarColores();


      // ====================================================
      // TALLAS
      // ====================================================

      cargarTallas();


      // ====================================================
      // DETALLES
      // ====================================================

      cargarDetalles();


      // ====================================================
      // GUÍA DE TALLAS
      // ====================================================

      actualizarDisponibilidadGuiaTallas();


      // ====================================================
      // RESEÑAS
      // ====================================================

      if (seccionResenas) {
        seccionResenas.style.display =
          "";
      }


      // ====================================================
      // 3D
      // ====================================================

      cargarUrbanx3d();


      // ====================================================
      // CARRITO
      // ====================================================

      actualizarContadorCarrito();


      // ====================================================
      // FAVORITOS
      // ====================================================

      actualizarFavoritosUI();

    }


    // ======================================================
    // IMAGEN
    // ======================================================

    function cargarImagen() {

      const imagenes =
        obtenerImagenesProducto();


      if (!imagenes.length) {

        imagenProducto.removeAttribute(
          "src"
        );

        imagenProducto.style.display =
          "none";

        imagenDemoProducto.style.display =
          "grid";

        miniaturasProducto.hidden =
          true;

        miniaturasProducto.innerHTML =
          "";

        return;
      }


      mostrarImagenPrincipal(
        imagenes[0],
        0
      );


      miniaturasProducto.innerHTML =
        "";


      if (imagenes.length <= 1) {

        miniaturasProducto.hidden =
          true;

        return;
      }


      miniaturasProducto.hidden =
        false;


      imagenes.forEach(
        function (url, indice) {

          const boton =
            document.createElement(
              "button"
            );

          boton.type =
            "button";

          boton.className =
            "miniatura" +
            (indice === 0
              ? " activa"
              : "");

          boton.setAttribute(
            "aria-label",
            `Ver imagen ${indice + 1} de ${producto.nombre}`
          );

          boton.setAttribute(
            "aria-pressed",
            indice === 0
              ? "true"
              : "false"
          );


          const img =
            document.createElement(
              "img"
            );

          img.src =
            url;

          img.alt =
            "";

          img.loading =
            "lazy";

          img.decoding =
            "async";

          img.onerror =
            function () {
              boton.remove();

              if (
                miniaturasProducto
                  .querySelectorAll(
                    ".miniatura"
                  ).length <= 1
              ) {
                miniaturasProducto.hidden =
                  true;
              }
            };

          boton.appendChild(
            img
          );


          boton.addEventListener(
            "click",
            function () {

              mostrarImagenPrincipal(
                url,
                indice
              );
            }
          );


          miniaturasProducto.appendChild(
            boton
          );
        }
      );
    }


    function obtenerImagenesProducto() {

      const candidatos = [
        producto?.imagen ||
          "",
        ...(Array.isArray(
          producto?.imagenes
        )
          ? producto.imagenes
          : [])
      ];

      const unicas =
        [];

      const vistas =
        new Set();


      candidatos.forEach(
        function (url) {

          const limpia =
            String(
              url ||
              ""
            ).trim();

          if (
            !limpia ||
            vistas.has(limpia)
          ) {
            return;
          }

          vistas.add(
            limpia
          );

          unicas.push(
            limpia
          );
        }
      );


      return unicas;
    }


    function mostrarImagenPrincipal(
      url,
      indice
    ) {

      imagenProducto.decoding =
        "async";

      imagenProducto.fetchPriority =
        indice === 0
          ? "high"
          : "auto";

      imagenProducto.alt =
        producto.nombre;

      imagenProducto.style.display =
        "block";

      imagenDemoProducto.style.display =
        "none";

      imagenProducto.onerror =
        function () {

          imagenProducto.style.display =
            "none";

          imagenDemoProducto.style.display =
            "grid";
        };

      imagenProducto.src =
        url;


      miniaturasProducto
        .querySelectorAll(
          ".miniatura"
        )
        .forEach(
          function (boton, posicion) {

            const activo =
              posicion === indice;

            boton.classList.toggle(
              "activa",
              activo
            );

            boton.setAttribute(
              "aria-pressed",
              activo
                ? "true"
                : "false"
            );
          }
        );
    }


    // ======================================================
    // STOCK + VARIANTES
    // ======================================================

    function usaVariantesProducto() {
      return window.SIXTEEN_VARIANTS?.hasVariants(producto) === true;
    }

    function varianteSeleccionadaActual() {
      if(!usaVariantesProducto())return null;
      return window.SIXTEEN_VARIANTS.find(producto,{
        color:colorActual||"",
        talla:tallaSeleccionada||""
      });
    }

    function stockSeleccionActual() {
      if(!producto)return 0;
      if(!usaVariantesProducto())return Math.max(0,numero(producto.stock));

      const exact=varianteSeleccionadaActual();
      if(exact)return Math.max(0,numero(exact.stock));

      return window.SIXTEEN_VARIANTS.stockFor(producto,{color:colorActual||""});
    }

    function actualizarStockSeleccionado() {
      cantidad=1;
      cantidadProducto.textContent="1";

      const total=window.SIXTEEN_VARIANTS?.totalStock(producto)??Math.max(0,numero(producto?.stock));
      const requiere=usaVariantesProducto()&&window.SIXTEEN_VARIANTS.requiresSize(producto,colorActual||"");

      if(total<=0){
        estadoStock.textContent="Agotado";
        agregarCarritoBtn.disabled=true;
        comprarAhoraBtn.disabled=true;
        if(stockPunto)stockPunto.style.opacity=".3";
        actualizarControlesCantidad();
        return;
      }

      if(usaVariantesProducto()&&requiere&&!tallaSeleccionada){
        const s=window.SIXTEEN_VARIANTS.stockFor(producto,{color:colorActual||""});
        estadoStock.textContent=s>0?"Selecciona una talla · "+s+" unidades en este color":"Color agotado";
        agregarCarritoBtn.disabled=s<=0;
        comprarAhoraBtn.disabled=s<=0;
        if(stockPunto)stockPunto.style.opacity=s>0?"1":".3";
        actualizarControlesCantidad();
        return;
      }

      const stock=Math.max(0,stockSeleccionActual());

      if(stock<=0){
        estadoStock.textContent="Variante agotada";
        agregarCarritoBtn.disabled=true;
        comprarAhoraBtn.disabled=true;
        if(stockPunto)stockPunto.style.opacity=".3";
        actualizarControlesCantidad();
        return;
      }

      estadoStock.textContent="Disponible · "+stock+(stock===1?" unidad":" unidades");
      agregarCarritoBtn.disabled=false;
      comprarAhoraBtn.disabled=false;
      if(stockPunto)stockPunto.style.opacity="1";
      actualizarControlesCantidad();
    }

    function actualizarControlesCantidad() {

      const requiereTalla =
        producto &&
        (
          usaVariantesProducto()
            ? window.SIXTEEN_VARIANTS.requiresSize(
                producto,
                colorActual ||
                ""
              )
            : Array.isArray(
                producto.tallas
              ) &&
              producto.tallas.length > 0
        );

      const seleccionIncompleta =
        requiereTalla &&
        !tallaSeleccionada;

      const stock =
        seleccionIncompleta
          ? 0
          : stockSeleccionActual();

      restarCantidad.disabled =
        cantidad <= 1;

      sumarCantidad.disabled =
        !producto ||
        stock <= 0 ||
        cantidad >= stock;
    }


    function cargarStock(){
      actualizarStockSeleccionado();
    }

    function cargarColores() {
      selectorColores.innerHTML="";

      const colores=usaVariantesProducto()
        ?window.SIXTEEN_VARIANTS.colors(producto,true)
        :obtenerColores(producto.color);

      colorActual=
        colores.find(c=>!usaVariantesProducto()||window.SIXTEEN_VARIANTS.stockFor(producto,{color:c})>0)
        ||colores[0]||"SIXTEEN";

      colorSeleccionado.textContent=colorActual;

      colores.forEach(color=>{
        const boton=document.createElement("button");
        boton.type="button";
        boton.className="color-opcion";
        boton.dataset.color=color;
        boton.setAttribute("aria-label","Color " + color);
        boton.setAttribute(
          "aria-pressed",
          color===colorActual?"true":"false"
        );
        boton.style.background=obtenerColorVisual(color);

        const s=usaVariantesProducto()
          ?window.SIXTEEN_VARIANTS.stockFor(producto,{color})
          :numero(producto.stock);

        if(s<=0){
          boton.disabled=true;
          boton.classList.add("variante-agotada");
          boton.title="Color agotado";
        }

        if(color===colorActual)boton.classList.add("activo");

        boton.addEventListener("click",()=>{
          if(boton.disabled)return;
          selectorColores.querySelectorAll(".color-opcion").forEach(x=>{
            x.classList.remove("activo");
            x.setAttribute("aria-pressed","false");
          });
          boton.classList.add("activo");
          boton.setAttribute("aria-pressed","true");
          colorActual=color;
          colorSeleccionado.textContent=color;
          tallaSeleccionada=null;
          cargarTallas();
          actualizarStockSeleccionado();
        });

        selectorColores.appendChild(boton);
      });
    }

    function obtenerColores(texto) {
      const valor=String(texto||"").trim();
      if(!valor)return["SIXTEEN"];
      const out=valor.split(/[,|/]+/).map(x=>x.trim()).filter(Boolean);
      return out.length?out:[valor];
    }

    function obtenerColorVisual(color) {
      const texto=String(color).toLowerCase();
      if(texto.includes("negro"))return"#111111";
      if(texto.includes("blanco"))return"#f5f5f5";
      if(texto.includes("gris"))return"#777777";
      if(texto.includes("azul"))return"#315f9f";
      if(texto.includes("rojo"))return"#b93b3b";
      if(texto.includes("verde")||texto.includes("lime"))return"#dfff38";
      if(texto.includes("beige"))return"#d6c5aa";
      if(texto.includes("dorado"))return"#d8aa55";
      return"#d8aa55";
    }

    function cargarTallas() {
      selectorTallas.innerHTML="";
      mensajeTalla.textContent="";
      tallaSeleccionada=null;

      const tallas=usaVariantesProducto()
        ?window.SIXTEEN_VARIANTS.sizes(producto,colorActual||"",true)
        :(Array.isArray(producto.tallas)?producto.tallas.map(x=>String(x).trim()).filter(Boolean):[]);

      if(!tallas.length){
        bloqueTallas.style.display="none";
        actualizarStockSeleccionado();
        return;
      }

      bloqueTallas.style.display="";

      tallas.forEach(talla=>{
        const boton=document.createElement("button");
        boton.type="button";
        boton.textContent=talla;
        boton.dataset.talla=talla;
        boton.setAttribute("aria-label","Talla " + talla);
        boton.setAttribute("aria-pressed","false");

        const v=usaVariantesProducto()
          ?window.SIXTEEN_VARIANTS.find(producto,{color:colorActual||"",talla})
          :null;

        if(v&&numero(v.stock)<=0){
          boton.disabled=true;
          boton.classList.add("variante-agotada");
          boton.title="Talla agotada";
        }

        boton.addEventListener("click",()=>{
          if(boton.disabled)return;
          selectorTallas.querySelectorAll("button").forEach(x=>{
            x.classList.remove("activo");
            x.setAttribute("aria-pressed","false");
          });
          boton.classList.add("activo");
          boton.setAttribute("aria-pressed","true");
          tallaSeleccionada=talla;
          mensajeTalla.textContent="";
          actualizarStockSeleccionado();
        });

        selectorTallas.appendChild(boton);
      });

      actualizarStockSeleccionado();
    }


    function actualizarDisponibilidadGuiaTallas() {

      if (!guiaTallasBtn || !producto) {
        return;
      }

      const categoria =
        normalizar(
          producto.categoria
        );

      const esCalzado =
        categoria.includes(
          "zapato"
        ) ||
        categoria.includes(
          "calzado"
        ) ||
        categoria.includes(
          "sneaker"
        );

      guiaTallasBtn.hidden =
        !esCalzado;
    }


    // ======================================================
    // DETALLES
    // ======================================================

    function cargarDetalles() {


      const detalles =
        obtenerDetalles(
          producto.detalles
        );


      detallesProducto.innerHTML =
        "";


      if (
        detalles.length
      ) {


        const lista =
          document.createElement(
            "ul"
          );


        detalles.forEach(
          function (detalle) {


            const li =
              document.createElement(
                "li"
              );


            li.textContent =
              detalle;


            lista.appendChild(
              li
            );

          }
        );


        detallesProducto.appendChild(
          lista
        );


      } else {


        const p =
          document.createElement(
            "p"
          );


        p.textContent =
          producto.descripcion ||
          "Información del producto SIXTEEN.";


        detallesProducto.appendChild(
          p
        );

      }


      materialesProducto.textContent =
        producto.materiales ||
        "Información de materiales no especificada.";

    }


    // ======================================================
    // PARSEAR DETALLES
    // ======================================================

    function obtenerDetalles(
      valor
    ) {


      if (
        Array.isArray(
          valor
        )
      ) {

        return valor
          .map(
            function (item) {

              return String(
                item
              ).trim();

            }
          )
          .filter(Boolean);

      }


      const texto =
        String(
          valor ||
          ""
        ).trim();


      if (!texto) {

        return [];

      }


      return texto
        .split(
          /\n|;|•/
        )
        .map(
          function (item) {

            return item
              .replace(
                /^[-–—]\s*/,
                ""
              )
              .trim();

          }
        )
        .filter(Boolean);

    }


    // ======================================================
    // SIXTEEN 3D
    // ======================================================

    function cargarUrbanx3d() {


      if (
        producto.urbanx3d
      ) {


        seccionUrbanx3d.style.display =
          "";


        textoUrbanx3d.textContent =
          "Este producto es compatible con SIXTEEN 3D. Después de realizar tu compra podrás acceder a su experiencia digital exclusiva.";


      } else {


        // La sección se mantiene,
        // pero sin prometer que este producto
        // tenga experiencia 3D.

        seccionUrbanx3d.style.display =
          "";


        textoUrbanx3d.textContent =
          "Algunos productos seleccionados SIXTEEN incluyen experiencias digitales exclusivas después de la compra.";

      }

    }


    // ======================================================
    // CANTIDAD -
    // ======================================================

    restarCantidad.addEventListener(
      "click",
      function () {


        if (
          cantidad > 1
        ) {

          cantidad--;


          cantidadProducto.textContent =
            cantidad;

          actualizarControlesCantidad();

        }

      }
    );


    // ======================================================
    // CANTIDAD +
    // ======================================================

    sumarCantidad.addEventListener(
      "click",
      function () {


        if (!producto) {

          return;

        }


        const stockDisponible =
          stockSeleccionActual();

        if (
          cantidad <
          stockDisponible
        ) {


          cantidad++;


          cantidadProducto.textContent =
            cantidad;

          actualizarControlesCantidad();


        } else {


          mostrarToast(
            "No hay más unidades disponibles."
          );

        }

      }
    );


    // ======================================================
    // VALIDAR SELECCIÓN
    // ======================================================

    function validarSeleccion() {
      if(!producto)return false;

      const total=window.SIXTEEN_VARIANTS?.totalStock(producto)??numero(producto.stock);
      if(total<=0){
        mostrarToast("Este producto está agotado.");
        return false;
      }

      const requiere=usaVariantesProducto()
        ?window.SIXTEEN_VARIANTS.requiresSize(producto,colorActual||"")
        :(Array.isArray(producto.tallas)&&producto.tallas.length>0);

      if(requiere&&!tallaSeleccionada){
        mensajeTalla.textContent="Selecciona una talla para continuar.";
        selectorTallas.scrollIntoView({behavior:"smooth",block:"center"});
        return false;
      }

      const stock=stockSeleccionActual();
      if(stock<=0){
        mostrarToast("La variante seleccionada está agotada.");
        return false;
      }

      if(cantidad>stock){
        mostrarToast("Solo hay "+stock+" unidades de esta variante.");
        return false;
      }

      return true;
    }


    // ======================================================
    // AGREGAR AL CARRITO
    // ======================================================

    agregarCarritoBtn.addEventListener(
      "click",
      function () {


        if (
          !validarSeleccion()
        ) {

          return;

        }


        agregarProductoAlCarrito();


        mostrarToast(
          producto.nombre +
          " agregado al carrito."
        );

      }
    );


    // ======================================================
    // AGREGAR PRODUCTO
    // ======================================================

    function agregarProductoAlCarrito() {
      carrito=cargarCarrito();

      const variante=varianteSeleccionadaActual();
      const varianteId=variante?.id||"";
      const stockDisponible=stockSeleccionActual();

      const existente=carrito.find(item=>
        item.id===producto.codigo
        &&String(item.varianteId||"")===String(varianteId)
        &&String(item.talla||"")===String(tallaSeleccionada||"")
        &&String(item.color||"")===String(colorActual||"")
      );

      if(existente){
        existente.cantidad=Math.min(numero(existente.cantidad)+cantidad,stockDisponible);
        existente.stock=stockDisponible;
      }else{
        carrito.push({
          id:producto.codigo,
          firestoreId:producto.firestoreId,
          varianteId,
          usaVariantes:usaVariantesProducto(),
          nombre:producto.nombre,
          categoria:producto.categoria,
          precio:producto.precio,
          precioAnterior:producto.precioAnterior,
          ivaTarifa:Number(producto.ivaTarifa ?? 15),
          color:colorActual,
          talla:tallaSeleccionada,
          stock:stockDisponible,
          cantidad,
          imagen:producto.imagen||""
        });
      }

      guardarCarrito();
      actualizarContadorCarrito();
    }


    // ======================================================
    // COMPRAR AHORA
    // ======================================================

    comprarAhoraBtn.addEventListener(
      "click",
      function () {


        if (
          !validarSeleccion()
        ) {

          return;

        }


        agregarProductoAlCarrito();


        window.location.href =
          "./carrito.html";

      }
    );


    // ======================================================
    // CARGAR CARRITO
    // ======================================================

    function cargarCarrito() {


      try {


        const guardado =
          localStorage.getItem(
            "urbanx_carrito"
          );


        if (!guardado) {

          return [];

        }


        const datos =
          JSON.parse(
            guardado
          );


        return Array.isArray(
          datos
        )
          ? datos
          : [];


      } catch (error) {


        console.error(
          "Error cargando carrito:",
          error
        );


        return [];

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


        window.SIXTEEN_CART_SYNC
          ?.guardar(
            carrito
          );


      } catch (error) {


        console.error(
          "Error guardando carrito:",
          error
        );

      }

    }


    // ======================================================
    // CONTADOR CARRITO
    // ======================================================

    function actualizarContadorCarrito() {


      carrito =
        cargarCarrito();


      const total =
        carrito.reduce(

          function (
            suma,
            item
          ) {


            const unidades =
              numero(
                item.cantidad
              );


            return (
              suma +
              (
                unidades > 0
                  ? unidades
                  : 1
              )
            );

          },

          0

        );


      cantidadCarritoProducto.textContent =
        total;

    }


    // ======================================================
    // GUÍA DE TALLAS
    // ======================================================

    function abrirModalTallas() {

      focoAntesModalTallas =
        document.activeElement;

      modalTallas.classList.add(
        "activo"
      );

      modalTallas.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "modal-open"
      );

      window.requestAnimationFrame(
        function () {
          modalTallasContenido?.focus();
        }
      );
    }


    function cerrarModalTallasSeguro() {

      if (
        !modalTallas.classList.contains(
          "activo"
        )
      ) {
        return;
      }

      modalTallas.classList.remove(
        "activo"
      );

      modalTallas.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.classList.remove(
        "modal-open"
      );

      if (
        focoAntesModalTallas &&
        typeof focoAntesModalTallas.focus ===
          "function"
      ) {
        focoAntesModalTallas.focus();
      }
    }


    guiaTallasBtn.addEventListener(
      "click",
      abrirModalTallas
    );


    cerrarModalTallas.addEventListener(
      "click",
      cerrarModalTallasSeguro
    );


    modalTallas.addEventListener(
      "click",
      function (event) {

        if (event.target === modalTallas) {
          cerrarModalTallasSeguro();
        }
      }
    );


    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Escape" &&
          modalTallas.classList.contains(
            "activo"
          )
        ) {
          cerrarModalTallasSeguro();
        }
      }
    );


    // ======================================================
    // PRODUCTOS RELACIONADOS
    // ======================================================

    function cargarRelacionados() {


      if (
        !producto ||
        !productosRelacionados
      ) {

        return;

      }


      let relacionados =
        productosActivos.filter(
          function (item) {


            return (

              item.codigo !==
              producto.codigo

              &&

              normalizar(
                item.categoria
              )
              ===
              normalizar(
                producto.categoria
              )

            );

          }
        );


      // Si no hay suficientes de la misma
      // categoría, completamos con otros.

      if (
        relacionados.length < 3
      ) {


        const otros =
          productosActivos.filter(
            function (item) {


              return (

                item.codigo !==
                producto.codigo

                &&

                !relacionados.some(
                  function (relacionado) {

                    return (
                      relacionado.codigo ===
                      item.codigo
                    );

                  }
                )

              );

            }
          );


        relacionados =
          relacionados.concat(
            otros
          );

      }


      relacionados =
        relacionados.slice(
          0,
          3
        );


      productosRelacionados.innerHTML =
        "";


      if (
        relacionados.length === 0
      ) {


        seccionRelacionados.style.display =
          "none";


        return;

      }


      seccionRelacionados.style.display =
        "";


      relacionados.forEach(
        function (item) {


          const card =
            document.createElement(
              "article"
            );


          card.className =
            "producto-card";


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
                class="producto-demo"
                style="display:none;"
              >
                XVI
              </div>
              `

              :

              `
              <div class="producto-demo">
                XVI
              </div>
              `;


          card.innerHTML = `

            <div class="producto-imagen">

              ${
                item.nuevo

                  ?

                  `
                  <span class="producto-badge">
                    NUEVO
                  </span>
                  `

                  :

                  ""
              }

              ${imagen}


              <button
                class="favorito-btn"
                type="button"
                data-id="${escaparAtributo(
                  item.codigo
                )}"
                aria-label="Agregar a favoritos"
              >
                ♡
              </button>

            </div>


            <div class="producto-contenido">


              <div class="producto-top">


                <div>

                  <p class="producto-categoria">

                    ${escapar(
                      String(
                        item.categoria
                      ).toUpperCase()
                    )}

                  </p>


                  <h3>

                    ${escapar(
                      item.nombre
                    )}

                  </h3>

                </div>


                <span class="producto-precio">

                  $${item.precio.toFixed(2)}

                </span>


              </div>


              <p class="producto-color">

                ${escapar(
                  item.color ||
                  "SIXTEEN Collection"
                )}

              </p>


              <button
                class="comparar-btn-card"
                type="button"
                data-compare-id="${escaparAtributo(
                  item.codigo
                )}"
                data-compare-name="${escaparAtributo(
                  item.nombre
                )}"
                aria-pressed="false"
              >

                <span aria-hidden="true">
                  ⇄
                </span>

                <span data-compare-label>
                  COMPARAR
                </span>

              </button>


              <button
                class="ver-producto-btn"
                type="button"
                data-id="${escaparAtributo(
                  item.codigo
                )}"
              >
                VER PRODUCTO
              </button>


            </div>

          `;


          productosRelacionados
            .appendChild(
              card
            );

        }
      );


      productosRelacionados
        .querySelectorAll(
          ".ver-producto-btn"
        )
        .forEach(
          function (boton) {


            boton.addEventListener(
              "click",
              function () {


                window.location.href =
                  "./producto.html?id=" +
                  encodeURIComponent(
                    boton.dataset.id
                  );

              }
            );

          }
        );

      productosRelacionados
        .querySelectorAll(
          ".favorito-btn[data-id]"
        )
        .forEach(
          function (boton) {

            boton.addEventListener(
              "click",
              async function (event) {

                event.preventDefault();

                event.stopPropagation();


                boton.disabled =
                  true;


                try {

                  await alternarFavorito(
                    boton.dataset.id
                  );

                } finally {

                  boton.disabled =
                    false;
                }
              }
            );
          }
        );


      actualizarFavoritosUI();


      window.SIXTEEN_PRODUCT_TOOLS
        ?.refresh();

    }


    // ======================================================
    // ERROR
    // ======================================================

    function mostrarError(
      mensaje
    ) {


      if (
        productoCargando
      ) {

        productoCargando.style.display =
          "none";

      }


      if (
        detalleProducto
      ) {

        detalleProducto.style.display =
          "none";

      }


      if (
        productoError
      ) {

        productoError.style.display =
          "block";

      }


      if (
        productoErrorTexto
      ) {

        productoErrorTexto.textContent =
          mensaje;

      }


      if (
        seccionRelacionados
      ) {

        seccionRelacionados.style.display =
          "none";

      }


      if (seccionUrbanx3d) {
        seccionUrbanx3d.style.display =
          "none";
      }


      if (seccionResenas) {
        seccionResenas.style.display =
          "none";
      }


      document
        .getElementById(
          "seccionVistosRecientemente"
        )
        ?.setAttribute(
          "hidden",
          ""
        );


      document
        .getElementById(
          "recomendacionesProducto"
        )
        ?.setAttribute(
          "hidden",
          ""
        );

    }


    // ======================================================
    // TOAST
    // ======================================================

    function mostrarToast(
      mensaje
    ) {


      if (!toastProducto) {

        return;

      }


      clearTimeout(
        toastTimer
      );


      toastProducto.textContent =
        mensaje;


      toastProducto.classList.add(
        "activo"
      );


      toastTimer =
        setTimeout(
          function () {


            toastProducto.classList.remove(
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


        if (
          unsubscribeFavoritos
        ) {

          unsubscribeFavoritos();

        }


        if (
          unsubscribeResenas
        ) {

          unsubscribeResenas();

        }

      }
    );


    // ======================================================
    // CARRITO RECUPERADO DESDE CUENTA
    // ======================================================

    window.addEventListener(
      "sixteen:cart-restored",
      function () {

        actualizarContadorCarrito();


        mostrarToast(
          "Carrito recuperado."
        );
      }
    );


    // ======================================================
    // INICIAR
    // ======================================================

    actualizarContadorCarrito();

    escucharProductos();


  }
);