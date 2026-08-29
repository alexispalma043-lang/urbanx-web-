// @ts-nocheck

// ==========================================================
// SIXTEEN
// APP PRINCIPAL
// FIREBASE + FIRESTORE
// BUSCADOR CORREGIDO
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

    let db = null;

    let auth = null;


    if (
      typeof firebase !== "undefined"
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


        if (
          typeof firebase.auth ===
          "function"
        ) {

          auth =
            firebase.auth();

        }


      } catch (error) {

        console.error(
          "Error iniciando Firebase:",
          error
        );

      }

    } else {

      console.error(
        "Firebase no se cargó."
      );

    }


    // ======================================================
    // ELEMENTOS
    // ======================================================

    const menuBtn =
      document.getElementById(
        "menuBtn"
      );


    const nav =
      document.getElementById(
        "nav"
      );


    const buscarBtn =
      document.getElementById(
        "buscarBtn"
      );


    const cerrarBuscador =
      document.getElementById(
        "cerrarBuscador"
      );


    const buscadorPanel =
      document.getElementById(
        "buscadorPanel"
      );


    const buscador =
      document.getElementById(
        "buscador"
      );


    const cuentaBtn =
      document.getElementById(
        "cuentaBtn"
      );


    const carritoBtn =
      document.getElementById(
        "carritoBtn"
      );


    const cantidadCarrito =
      document.getElementById(
        "cantidadCarrito"
      );


    const productosGrid =
      document.getElementById(
        "productosGrid"
      );


    const newsletterForm =
      document.getElementById(
        "newsletterForm"
      );


    const newsletterEmail =
      document.getElementById(
        "newsletterEmail"
      );


    const newsletterStatus =
      document.getElementById(
        "newsletterStatus"
      );


    const newsletterSubmit =
      newsletterForm
        ?.querySelector(
          'button[type="submit"]'
        ) || null;


    const header =
      document.querySelector(
        ".header"
      );


    const toast =
      document.getElementById(
        "toast"
      );


    const verTodosBtn =
      document.getElementById(
        "verTodosBtn"
      );


    const tituloProductos =
      document.getElementById(
        "tituloProductos"
      );


    // ======================================================
    // OFFSET DINÁMICO · HEADER / MENÚ / BUSCADOR
    // ======================================================

    let floatingOffsetFrame = null;


    function actualizarOffsetFlotante() {

      if (!header) {
        return;
      }


      if (floatingOffsetFrame) {
        return;
      }


      floatingOffsetFrame =
        window.requestAnimationFrame(
          function () {

            const rect =
              header.getBoundingClientRect();


            const bottom =
              Math.max(
                0,
                Math.round(
                  rect.bottom
                )
              );


            document.documentElement
              .style
              .setProperty(
                "--sixteen-floating-top",
                `${bottom}px`
              );


            floatingOffsetFrame = null;

          }
        );

    }


    actualizarOffsetFlotante();


    window.addEventListener(
      "resize",
      actualizarOffsetFlotante,
      { passive: true }
    );


    window.addEventListener(
      "scroll",
      actualizarOffsetFlotante,
      { passive: true }
    );


    // ======================================================
    // PASO 11 · CATÁLOGO AVANZADO
    // ======================================================

    const catalogSearch =
      document.getElementById(
        "catalogSearch"
      );


    const catalogSearchClear =
      document.getElementById(
        "catalogSearchClear"
      );


    const catalogFilterToggle =
      document.getElementById(
        "catalogFilterToggle"
      );


    const catalogFilterCount =
      document.getElementById(
        "catalogFilterCount"
      );


    const catalogFilters =
      document.getElementById(
        "catalogFilters"
      );


    const catalogCategory =
      document.getElementById(
        "catalogCategory"
      );


    const catalogSize =
      document.getElementById(
        "catalogSize"
      );


    const catalogColor =
      document.getElementById(
        "catalogColor"
      );


    const catalogAvailability =
      document.getElementById(
        "catalogAvailability"
      );


    const catalogMinPrice =
      document.getElementById(
        "catalogMinPrice"
      );


    const catalogMaxPrice =
      document.getElementById(
        "catalogMaxPrice"
      );


    const catalogSort =
      document.getElementById(
        "catalogSort"
      );


    const catalogClearFilters =
      document.getElementById(
        "catalogClearFilters"
      );


    const catalogResultCount =
      document.getElementById(
        "catalogResultCount"
      );


    const catalogActiveFilters =
      document.getElementById(
        "catalogActiveFilters"
      );


    // ======================================================
    // ESTADO
    // ======================================================

    let productos = [];

    let filtroActual =
      "destacados";


    const catalogState = {

      query:
        "",

      category:
        "",

      size:
        "",

      color:
        "",

      availability:
        "",

      minPrice:
        "",

      maxPrice:
        "",

      sort:
        "newest"

    };


    let unsubscribeProductos =
      null;

    let unsubscribeFavoritos =
      null;

    let usuarioFavoritos =
      null;

    let favoritosIds =
      new Set();

    let toastTimer = null;

    let carrito =
      cargarCarrito();


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


          actualizarBotonesFavoritos();


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


              actualizarBotonesFavoritos();

            },
            function (error) {

              console.error(
                "Favoritos:",
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


    function actualizarBotonesFavoritos() {

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
                ? "Eliminar de favoritos"
                : "Agregar a favoritos"
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


      const ref =
        db
          .collection("favoritos")
          .doc(
            usuarioFavoritos.uid
          )
          .collection("items")
          .doc(
            codigoNormalizado
          );


      const yaExiste =
        favoritosIds.has(
          codigoNormalizado
        );


      if (
        yaExiste
      ) {

        favoritosIds.delete(
          codigoNormalizado
        );

        actualizarBotonesFavoritos();


        try {

          await ref.delete();


          mostrarToast(
            "Producto eliminado de favoritos."
          );

        } catch (error) {

          favoritosIds.add(
            codigoNormalizado
          );

          actualizarBotonesFavoritos();


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


      const producto =
        productos.find(
          function (item) {

            return (
              String(
                item.codigo ||
                ""
              )
                .trim()
                .toUpperCase()
              ===
              codigoNormalizado
            );
          }
        );


      if (!producto) {

        mostrarToast(
          "No fue posible guardar este producto."
        );

        return;
      }


      favoritosIds.add(
        codigoNormalizado
      );

      actualizarBotonesFavoritos();


      try {

        await ref.set({
          codigo:
            codigoNormalizado,

          nombre:
            producto.nombre ||
            codigoNormalizado,

          categoria:
            producto.categoria ||
            "",

          precio:
            numero(
              producto.precio
            ),

          imagen:
            producto.imagen ||
            "",

          color:
            producto.color ||
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

        actualizarBotonesFavoritos();


        console.error(
          "Guardar favorito:",
          error
        );


        mostrarToast(
          "No fue posible guardar el favorito."
        );
      }
    }


    // ======================================================
    // MENÚ MÓVIL
    // ======================================================

    if (
      menuBtn &&
      nav
    ) {

      menuBtn.addEventListener(
        "click",
        function () {

          nav.classList.toggle(
            "activo"
          );

        }
      );

    }


    document
      .querySelectorAll(
        ".nav a"
      )
      .forEach(
        function (link) {

          link.addEventListener(
            "click",
            function () {

              nav?.classList.remove(
                "activo"
              );

              cerrarPanelBuscador(
                false
              );

            }
          );

        }
      );


    // ======================================================
    // BUSCADOR
    // ======================================================

    function abrirPanelBuscador() {

      if (
        !buscadorPanel
      ) {

        return;

      }


      buscadorPanel.classList.add(
        "activo"
      );


      buscadorPanel.setAttribute(
        "aria-hidden",
        "false"
      );


      setTimeout(
        function () {

          buscador?.focus();

        },
        150
      );

    }


    // ======================================================
    // CERRAR BUSCADOR
    //
    // limpiarBusqueda = true:
    // borra el texto y vuelve a destacados.
    //
    // limpiarBusqueda = false:
    // solo oculta el buscador.
    // ======================================================

    function cerrarPanelBuscador(
      limpiarBusqueda = false
    ) {

      if (
        !buscadorPanel
      ) {

        return;

      }


      buscadorPanel.classList.remove(
        "activo"
      );


      buscadorPanel.setAttribute(
        "aria-hidden",
        "true"
      );


      if (
        limpiarBusqueda
      ) {

        setCatalogQuery(
          ""
        );


        const otherFilters =
          Boolean(
            catalogState.category
            ||
            catalogState.size
            ||
            catalogState.color
            ||
            catalogState.availability
            ||
            catalogState.minPrice
            ||
            catalogState.maxPrice
          );


        if (
          otherFilters
        ) {

          aplicarFiltrosCatalogo();

        } else {

          mostrarProductosDestacados();
        }
      }

    }


    // ======================================================
    // ABRIR CON LUPA
    // ======================================================

    buscarBtn?.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        event.stopPropagation();

        if (
          buscadorPanel?.classList
            .contains("activo")
        ) {

          cerrarPanelBuscador(
            false
          );

          return;

        }


        abrirPanelBuscador();

      }
    );


    // ======================================================
    // CERRAR CON X
    // ======================================================

    cerrarBuscador?.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        event.stopPropagation();

        cerrarPanelBuscador(
          true
        );

      }
    );


    // ======================================================
    // CERRAR AL TOCAR FUERA
    // ======================================================

    buscadorPanel?.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          buscadorPanel
        ) {

          cerrarPanelBuscador(
            false
          );

        }

      }
    );


    // Evitar que pulsar dentro del
    // contenido cierre el buscador.

    document
      .querySelector(
        ".buscador-contenido"
      )
      ?.addEventListener(
        "click",
        function (event) {

          event.stopPropagation();

        }
      );


    // ======================================================
    // CERRAR CON ESCAPE
    // ======================================================

    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Escape"
        ) {

          cerrarPanelBuscador(
            false
          );

          nav?.classList.remove(
            "activo"
          );

        }

      }
    );


    // ======================================================
    // CORRECCIÓN PRINCIPAL
    //
    // Si el usuario desplaza la página,
    // el buscador desaparece automáticamente.
    // ======================================================

    window.addEventListener(
      "scroll",
      function () {

        if (
          buscadorPanel?.classList
            .contains("activo")
        ) {

          cerrarPanelBuscador(
            false
          );

        }

      },
      {
        passive: true
      }
    );


    // ======================================================
    // PASO 11 · BUSCADOR AVANZADO
    // ======================================================

    function setCatalogQuery(
      value,
      source = ""
    ) {

      const text =
        String(
          value ||
          ""
        );


      catalogState.query =
        text;


      if (
        source !== "header"
        &&
        buscador
      ) {

        buscador.value =
          text;
      }


      if (
        source !== "catalog"
        &&
        catalogSearch
      ) {

        catalogSearch.value =
          text;
      }


      updateCatalogSearchClear();

    }


    function updateCatalogSearchClear() {

      if (
        catalogSearchClear
      ) {

        catalogSearchClear.hidden =
          !String(
            catalogState.query ||
            ""
          ).trim();
      }
    }


    // ======================================================
    // BÚSQUEDA DEL HEADER
    // ======================================================

    if (
      buscador
    ) {

      buscador.addEventListener(
        "input",
        function () {

          setCatalogQuery(
            buscador.value,
            "header"
          );


          aplicarFiltrosCatalogo();

        }
      );


      buscador.addEventListener(
        "keydown",
        function (event) {

          if (
            event.key !== "Enter"
          ) {

            return;
          }


          event.preventDefault();


          setCatalogQuery(
            buscador.value,
            "header"
          );


          aplicarFiltrosCatalogo();


          cerrarPanelBuscador(
            false
          );


          scrollToProducts();

        }
      );
    }


    // ======================================================
    // BÚSQUEDA DENTRO DEL CATÁLOGO
    // ======================================================

    catalogSearch?.addEventListener(
      "input",
      function () {

        setCatalogQuery(
          catalogSearch.value,
          "catalog"
        );


        aplicarFiltrosCatalogo();

      }
    );


    catalogSearch?.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Enter"
        ) {

          event.preventDefault();

          aplicarFiltrosCatalogo();

        }
      }
    );


    catalogSearchClear?.addEventListener(
      "click",
      function () {

        setCatalogQuery(
          ""
        );


        aplicarFiltrosCatalogo();


        catalogSearch?.focus();

      }
    );


    // ======================================================
    // PANEL DE FILTROS
    // ======================================================

    catalogFilterToggle?.addEventListener(
      "click",
      function () {

        const open =
          !catalogFilters?.classList
            .contains("activo");


        catalogFilters?.classList.toggle(
          "activo",
          open
        );


        catalogFilters?.setAttribute(
          "aria-hidden",
          open
            ? "false"
            : "true"
        );


        catalogFilterToggle.setAttribute(
          "aria-expanded",
          open
            ? "true"
            : "false"
        );

      }
    );


    // ======================================================
    // INPUTS DE FILTROS
    // ======================================================

    [
      [
        catalogCategory,
        "category"
      ],

      [
        catalogSize,
        "size"
      ],

      [
        catalogColor,
        "color"
      ],

      [
        catalogAvailability,
        "availability"
      ],

      [
        catalogMinPrice,
        "minPrice"
      ],

      [
        catalogMaxPrice,
        "maxPrice"
      ],

      [
        catalogSort,
        "sort"
      ]
    ]
      .forEach(
        function (
          [
            element,
            key
          ]
        ) {

          if (!element) {
            return;
          }


          const eventName =
            element.tagName === "INPUT"
              ? "input"
              : "change";


          element.addEventListener(
            eventName,
            function () {

              catalogState[key] =
                element.value;


              aplicarFiltrosCatalogo();

            }
          );
        }
      );


    // ======================================================
    // LIMPIAR FILTROS
    // ======================================================

    catalogClearFilters?.addEventListener(
      "click",
      function () {

        limpiarFiltrosCatalogo(
          {
            showAll:
              true
          }
        );

      }
    );


    // ======================================================
    // CATEGORÍAS VISUALES
    // ======================================================

    document
      .querySelectorAll(
        ".categoria-card"
      )
      .forEach(
        function (card) {

          card.addEventListener(
            "click",
            function () {

              const category =
                String(
                  card.dataset.categoria ||
                  ""
                ).trim();


              if (!category) {
                return;
              }


              catalogState.category =
                category;


              if (
                catalogCategory
              ) {

                catalogCategory.value =
                  category;
              }


              filtroActual =
                "catalogo";


              aplicarFiltrosCatalogo();


              cerrarPanelBuscador(
                false
              );


              scrollToProducts();

            }
          );
        }
      );


    // ======================================================
    // CATEGORÍAS DEL FOOTER
    // ======================================================

    document
      .querySelectorAll(
        "[data-footer-categoria]"
      )
      .forEach(
        function (link) {

          link.addEventListener(
            "click",
            function (event) {

              const category =
                String(
                  link.dataset.footerCategoria ||
                  ""
                ).trim();


              if (!category) {
                return;
              }


              event.preventDefault();


              catalogState.category =
                category;


              if (
                catalogCategory
              ) {

                catalogCategory.value =
                  category;
              }


              filtroActual =
                "catalogo";


              aplicarFiltrosCatalogo();


              cerrarPanelBuscador(
                false
              );


              scrollToProducts();

            }
          );

        }
      );


    // ======================================================
    // VER TODOS
    // ======================================================

    verTodosBtn?.addEventListener(
      "click",
      function () {

        limpiarFiltrosCatalogo(
          {
            showAll:
              true
          }
        );


        scrollToProducts();

      }
    );


    // ======================================================
    // CHIPS ACTIVOS
    // ======================================================

    catalogActiveFilters?.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            "[data-remove-filter]"
          );


        if (!button) {
          return;
        }


        const key =
          button.dataset.removeFilter;


        if (
          key === "query"
        ) {

          setCatalogQuery(
            ""
          );

        } else if (
          Object.prototype.hasOwnProperty.call(
            catalogState,
            key
          )
        ) {

          catalogState[key] =
            "";


          syncCatalogControls();
        }


        aplicarFiltrosCatalogo();

      }
    );


    // ======================================================
    // APLICAR FILTROS
    // ======================================================

    function aplicarFiltrosCatalogo() {

      filtroActual =
        "catalogo";


      const result =
        productos
          .filter(
            product =>
              productMatchesCatalog(
                product
              )
          );


      const ordered =
        ordenarProductosCatalogo(
          result
        );


      updateCatalogHeader(
        ordered
      );


      mostrarProductos(
        ordered
      );

    }


    // ======================================================
    // COINCIDENCIA DE UN PRODUCTO
    // ======================================================

    function productMatchesCatalog(
      product
    ) {

      const query =
        normalizar(
          catalogState.query
        );


      if (query) {

        const haystack =
          normalizar(
            [
              product.nombre,
              product.codigo,
              product.categoria,
              product.color,
              Array.isArray(
                product.tallas
              )
                ? product.tallas.join(" ")
                : "",
              product.descripcion,
              product.detalles
            ]
              .filter(Boolean)
              .join(" ")
          );


        const tokens =
          query
            .split(/\s+/)
            .filter(Boolean);


        const matchesAll =
          tokens.every(
            token =>
              haystack.includes(
                token
              )
          );


        if (!matchesAll) {
          return false;
        }
      }


      if (
        catalogState.category
        &&
        normalizar(
          product.categoria
        )
        !==
        normalizar(
          catalogState.category
        )
      ) {

        return false;
      }


      if (
        catalogState.size
      ) {

        const sizes =
          Array.isArray(
            product.tallas
          )
            ? product.tallas.map(
                item =>
                  normalizar(
                    item
                  )
              )
            : [];


        if (
          !sizes.includes(
            normalizar(
              catalogState.size
            )
          )
        ) {

          return false;
        }
      }


      if (
        catalogState.color
      ) {

        const colors =
          extractProductColors(
            product.color
          )
            .map(
              item =>
                normalizar(
                  item
                )
            );


        if (
          !colors.includes(
            normalizar(
              catalogState.color
            )
          )
        ) {

          return false;
        }
      }


      const stock =
        Math.max(
          0,
          numero(
            product.stock
          )
        );


      if (
        catalogState.availability ===
        "available"
        &&
        stock <= 0
      ) {

        return false;
      }


      if (
        catalogState.availability ===
        "out"
        &&
        stock > 0
      ) {

        return false;
      }


      const price =
        numero(
          product.precio
        );


      const minPrice =
        parseOptionalNumber(
          catalogState.minPrice
        );


      const maxPrice =
        parseOptionalNumber(
          catalogState.maxPrice
        );


      if (
        minPrice !== null
        &&
        price < minPrice
      ) {

        return false;
      }


      if (
        maxPrice !== null
        &&
        price > maxPrice
      ) {

        return false;
      }


      return true;
    }


    // ======================================================
    // ORDENAMIENTO
    // ======================================================

    function ordenarProductosCatalogo(
      list
    ) {

      const ordered =
        [
          ...list
        ];


      switch (
        catalogState.sort
      ) {

        case "price-asc":

          ordered.sort(
            (a, b) =>
              numero(
                a.precio
              )
              -
              numero(
                b.precio
              )
          );

          break;


        case "price-desc":

          ordered.sort(
            (a, b) =>
              numero(
                b.precio
              )
              -
              numero(
                a.precio
              )
          );

          break;


        case "name-asc":

          ordered.sort(
            (a, b) =>
              String(
                a.nombre ||
                ""
              )
                .localeCompare(
                  String(
                    b.nombre ||
                    ""
                  ),
                  "es",
                  {
                    sensitivity:
                      "base"
                  }
                )
          );

          break;


        case "name-desc":

          ordered.sort(
            (a, b) =>
              String(
                b.nombre ||
                ""
              )
                .localeCompare(
                  String(
                    a.nombre ||
                    ""
                  ),
                  "es",
                  {
                    sensitivity:
                      "base"
                  }
                )
          );

          break;


        case "newest":
        default:

          ordered.sort(
            (a, b) =>
              fechaMillis(
                b.creadoEn
              )
              -
              fechaMillis(
                a.creadoEn
              )
          );

          break;
      }


      return ordered;
    }


    // ======================================================
    // OPCIONES DINÁMICAS DE FILTROS
    // ======================================================

    function actualizarOpcionesCatalogo() {

      fillDynamicSelect(
        catalogCategory,
        uniqueSorted(
          productos
            .map(
              product =>
                String(
                  product.categoria ||
                  ""
                ).trim()
            )
            .filter(Boolean)
        ),
        "Todas"
      );


      fillDynamicSelect(
        catalogSize,
        uniqueSorted(
          productos
            .flatMap(
              product =>
                Array.isArray(
                  product.tallas
                )
                  ? product.tallas
                  : []
            )
            .map(
              value =>
                String(
                  value
                ).trim()
            )
            .filter(Boolean)
        ),
        "Todas"
      );


      fillDynamicSelect(
        catalogColor,
        uniqueSorted(
          productos
            .flatMap(
              product =>
                extractProductColors(
                  product.color
                )
            )
        ),
        "Todos"
      );


      const prices =
        productos
          .map(
            product =>
              numero(
                product.precio
              )
          )
          .filter(
            value =>
              value >= 0
          );


      if (
        prices.length
      ) {

        const min =
          Math.min(
            ...prices
          );


        const max =
          Math.max(
            ...prices
          );


        if (
          catalogMinPrice
        ) {

          catalogMinPrice.placeholder =
            min.toFixed(
              2
            );
        }


        if (
          catalogMaxPrice
        ) {

          catalogMaxPrice.placeholder =
            max.toFixed(
              2
            );
        }
      }


      syncCatalogControls();

    }


    function fillDynamicSelect(
      select,
      values,
      firstLabel
    ) {

      if (!select) {
        return;
      }


      const current =
        select.value;


      select.innerHTML =
        "";


      const first =
        document.createElement(
          "option"
        );


      first.value =
        "";


      first.textContent =
        firstLabel;


      select.appendChild(
        first
      );


      values.forEach(
        function (value) {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            value;


          option.textContent =
            value;


          select.appendChild(
            option
          );
        }
      );


      if (
        [
          ...select.options
        ].some(
          option =>
            option.value ===
            current
        )
      ) {

        select.value =
          current;
      }
    }


    // ======================================================
    // SINCRONIZAR CONTROLES
    // ======================================================

    function syncCatalogControls() {

      if (
        catalogCategory
      ) {

        catalogCategory.value =
          catalogState.category;
      }


      if (
        catalogSize
      ) {

        catalogSize.value =
          catalogState.size;
      }


      if (
        catalogColor
      ) {

        catalogColor.value =
          catalogState.color;
      }


      if (
        catalogAvailability
      ) {

        catalogAvailability.value =
          catalogState.availability;
      }


      if (
        catalogMinPrice
      ) {

        catalogMinPrice.value =
          catalogState.minPrice;
      }


      if (
        catalogMaxPrice
      ) {

        catalogMaxPrice.value =
          catalogState.maxPrice;
      }


      if (
        catalogSort
      ) {

        catalogSort.value =
          catalogState.sort;
      }


      setCatalogQuery(
        catalogState.query
      );

    }


    // ======================================================
    // ENCABEZADO / CHIPS / CONTADOR
    // ======================================================

    function updateCatalogHeader(
      list
    ) {

      const total =
        Array.isArray(
          list
        )
          ? list.length
          : 0;


      if (
        tituloProductos
      ) {

        if (
          catalogState.category
        ) {

          tituloProductos.textContent =
            catalogState.category;

        } else if (
          String(
            catalogState.query ||
            ""
          ).trim()
        ) {

          tituloProductos.textContent =
            "Resultados de búsqueda";

        } else {

          tituloProductos.textContent =
            "Todos los productos";
        }
      }


      if (
        catalogResultCount
      ) {

        catalogResultCount.textContent =
          total === 1
            ? "1 producto encontrado"
            : `${total} productos encontrados`;
      }


      updateActiveFilterChips();

    }


    function updateActiveFilterChips() {

      if (
        !catalogActiveFilters
      ) {

        return;
      }


      catalogActiveFilters.innerHTML =
        "";


      const chips =
        [];


      const query =
        String(
          catalogState.query ||
          ""
        ).trim();


      if (query) {

        chips.push({
          key:
            "query",
          label:
            `Buscar: ${query}`
        });
      }


      if (
        catalogState.category
      ) {

        chips.push({
          key:
            "category",
          label:
            catalogState.category
        });
      }


      if (
        catalogState.size
      ) {

        chips.push({
          key:
            "size",
          label:
            `Talla ${catalogState.size}`
        });
      }


      if (
        catalogState.color
      ) {

        chips.push({
          key:
            "color",
          label:
            catalogState.color
        });
      }


      if (
        catalogState.availability
      ) {

        chips.push({
          key:
            "availability",
          label:
            catalogState.availability ===
            "available"
              ? "Disponible"
              : "Agotado"
        });
      }


      if (
        catalogState.minPrice
      ) {

        chips.push({
          key:
            "minPrice",
          label:
            `Desde $${catalogState.minPrice}`
        });
      }


      if (
        catalogState.maxPrice
      ) {

        chips.push({
          key:
            "maxPrice",
          label:
            `Hasta $${catalogState.maxPrice}`
        });
      }


      chips.forEach(
        function (chip) {

          const button =
            document.createElement(
              "button"
            );


          button.type =
            "button";


          button.dataset.removeFilter =
            chip.key;


          button.innerHTML = `
            <span>
              ${escapar(
                chip.label
              )}
            </span>

            <b aria-hidden="true">
              ×
            </b>
          `;


          button.setAttribute(
            "aria-label",
            `Quitar filtro ${chip.label}`
          );


          catalogActiveFilters.appendChild(
            button
          );
        }
      );


      const count =
        chips.length;


      if (
        catalogFilterCount
      ) {

        catalogFilterCount.hidden =
          count === 0;


        catalogFilterCount.textContent =
          String(
            count
          );
      }


      catalogFilterToggle?.classList.toggle(
        "tiene-filtros",
        count > 0
      );

    }


    // ======================================================
    // LIMPIAR TODO
    // ======================================================

    function limpiarFiltrosCatalogo(
      options = {}
    ) {

      catalogState.query =
        "";

      catalogState.category =
        "";

      catalogState.size =
        "";

      catalogState.color =
        "";

      catalogState.availability =
        "";

      catalogState.minPrice =
        "";

      catalogState.maxPrice =
        "";

      catalogState.sort =
        "newest";


      syncCatalogControls();


      if (
        options.showAll
      ) {

        filtroActual =
          "catalogo";


        aplicarFiltrosCatalogo();

      } else {

        mostrarProductosDestacados();
      }
    }


    // ======================================================
    // UTILIDADES DE CATÁLOGO
    // ======================================================

    function parseOptionalNumber(
      value
    ) {

      const text =
        String(
          value ??
          ""
        ).trim();


      if (!text) {
        return null;
      }


      const parsed =
        Number(
          text
        );


      return Number.isFinite(
        parsed
      )
        ? parsed
        : null;
    }


    function extractProductColors(
      value
    ) {

      return String(
        value ||
        ""
      )
        .split(
          /[/,;|]+/
        )
        .map(
          item =>
            item.trim()
        )
        .filter(Boolean);
    }


    function uniqueSorted(
      values
    ) {

      return [
        ...new Set(
          values
        )
      ]
        .sort(
          (a, b) =>
            String(
              a
            ).localeCompare(
              String(
                b
              ),
              "es",
              {
                numeric:
                  true,
                sensitivity:
                  "base"
              }
            )
        );
    }


    function scrollToProducts() {

      const section =
        document.getElementById(
          "productos"
        );


      section?.scrollIntoView({
        behavior:
          "smooth",
        block:
          "start"
      });
    }


    // PASO 14 · búsqueda accesible desde ?q=
    const searchFromUrl =
      String(
        new URLSearchParams(
          window.location.search
        ).get("q") ||
        ""
      ).trim();

    if (searchFromUrl) {
      setCatalogQuery(searchFromUrl);
      filtroActual = "catalogo";
      scrollToProducts();
    }


    // ======================================================
    // FIRESTORE
    // ======================================================

    function cargarProductosFirestore() {

      if (
        !productosGrid
      ) {

        return;

      }


      if (
        !db
      ) {

        mostrarErrorProductos(
          "No fue posible conectar con SIXTEEN."
        );

        return;

      }


      productosGrid.innerHTML = `

        <div
          style="
            grid-column:1/-1;
            padding:60px 20px;
            text-align:center;
            color:#777;
          "
        >

          Cargando productos SIXTEEN...

        </div>

      `;


      unsubscribeProductos =
        db
          .collection(
            "productos"
          )
          .onSnapshot(

            function (snapshot) {

              const nuevosProductos =
                [];


              snapshot.forEach(
                function (documento) {

                  const datos =
                    documento.data();


                  // =========================================
                  // SOLO PRODUCTOS ACTIVOS
                  // =========================================

                  if (
                    normalizar(
                      datos.estado ||
                      "Activo"
                    )
                    !==
                    "activo"
                  ) {

                    return;

                  }


                  nuevosProductos.push({

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
                      Math.max(
                        0,
                        numero(
                          datos.stock
                        )
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


                    imagen:
                      datos.imagen ||
                      "",


                    modelo3d:
                      datos.modelo3d ||
                      "",


                    descripcion:
                      datos.descripcion ||
                      "",


                    detalles:
                      datos.detalles ||
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


              // =============================================
              // MÁS NUEVOS PRIMERO
              // =============================================

              nuevosProductos.sort(
                function (a, b) {

                  return (

                    fechaMillis(
                      b.creadoEn
                    )
                    -
                    fechaMillis(
                      a.creadoEn
                    )

                  );

                }
              );


              productos =
                nuevosProductos;


              actualizarOpcionesCatalogo();


              refrescarVistaActual();

            },


            function (error) {

              console.error(
                "Error obteniendo productos:",
                error
              );


              mostrarErrorProductos(
                "No fue posible cargar los productos."
              );

            }

          );

    }


    // ======================================================
    // REFRESCAR VISTA ACTUAL
    // ======================================================

    function refrescarVistaActual() {

      if (
        filtroActual ===
        "catalogo"
      ) {

        aplicarFiltrosCatalogo();

        return;
      }


      mostrarProductosDestacados();

    }


    // ======================================================
    // DESTACADOS
    // ======================================================

    function mostrarProductosDestacados() {

      filtroActual =
        "destacados";


      if (
        tituloProductos
      ) {

        tituloProductos.textContent =
          "Productos destacados";

      }


      const destacados =
        productos.filter(
          function (producto) {

            return (
              producto.destacado === true
            );

          }
        );


      const listaDestacada =

        destacados.length > 0

          ?

          destacados

          :

          productos;


      if (
        catalogResultCount
      ) {

        catalogResultCount.textContent =
          listaDestacada.length === 1
            ? "1 producto destacado"
            : `${listaDestacada.length} productos destacados`;
      }


      if (
        catalogActiveFilters
      ) {

        catalogActiveFilters.innerHTML =
          "";
      }


      if (
        catalogFilterCount
      ) {

        catalogFilterCount.hidden =
          true;

        catalogFilterCount.textContent =
          "0";
      }


      catalogFilterToggle?.classList.remove(
        "tiene-filtros"
      );


      mostrarProductos(
        listaDestacada
      );

    }


    // ======================================================
    // MOSTRAR PRODUCTOS
    // ======================================================

    function mostrarProductos(
      lista
    ) {

      if (
        !productosGrid
      ) {

        return;

      }


      productosGrid.innerHTML =
        "";


      if (
        !Array.isArray(lista)
        ||
        lista.length === 0
      ) {

        productosGrid.innerHTML = `

          <div class="productos-vacio">

            <strong>
              SIXTEEN
            </strong>

            No encontramos productos.

          </div>

        `;


        return;

      }


      lista.forEach(
        function (producto) {

          const card =
            document.createElement(
              "article"
            );


          card.className =
            "producto-card";


          card.dataset.id =
            producto.codigo;


          const precio =
            numero(
              producto.precio
            );


          const stock =
            Math.max(
              0,
              numero(
                producto.stock
              )
            );


          // ===============================================
          // IMAGEN
          // ===============================================

          const imagenHTML =
            producto.imagen

              ?

              `

              <img
                src="${escaparAtributo(
                  producto.imagen
                )}"
                alt="${escaparAtributo(
                  producto.nombre
                )}"
                loading="lazy"
                decoding="async"
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


          // ===============================================
          // ETIQUETA
          // ===============================================

          let badge = "";


          if (
            stock <= 0
          ) {

            badge = `

              <span class="producto-badge">
                AGOTADO
              </span>

            `;

          } else if (
            producto.nuevo
          ) {

            badge = `

              <span class="producto-badge">
                NUEVO
              </span>

            `;

          }


          // ===============================================
          // CARD
          // ===============================================

          card.innerHTML = `

            <div class="producto-imagen">

              ${badge}

              ${imagenHTML}


              <button
                class="favorito-btn"
                type="button"
                data-id="${escaparAtributo(
                  producto.codigo
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
                        producto.categoria ||
                        "SIXTEEN"
                      ).toUpperCase()

                    )}

                  </p>


                  <h3>

                    ${escapar(
                      producto.nombre
                    )}

                  </h3>

                </div>


                <span class="producto-precio">

                  $${precio.toFixed(2)}

                </span>


              </div>


              <p class="producto-color">

                ${
                  producto.color

                    ?

                    escapar(
                      producto.color
                    )

                    :

                    "SIXTEEN Collection"
                }

              </p>


              <button
                class="comparar-btn-card"
                type="button"
                data-compare-id="${escaparAtributo(
                  producto.codigo
                )}"
                data-compare-name="${escaparAtributo(
                  producto.nombre
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


              ${
                stock <= 0

                  ?

                  `

                  <button
                    class="ver-producto-btn"
                    type="button"
                    disabled
                    style="
                      opacity:.45;
                      cursor:not-allowed;
                    "
                  >
                    AGOTADO
                  </button>

                  `

                  :

                  `

                  <button
                    class="ver-producto-btn"
                    type="button"
                    data-id="${escaparAtributo(
                      producto.codigo
                    )}"
                  >
                    VER PRODUCTO
                  </button>

                  `
              }


            </div>

          `;


          productosGrid.appendChild(
            card
          );

        }
      );


      activarBotonesProductos();


      window.SIXTEEN_PRODUCT_TOOLS
        ?.refresh();

    }


    // ======================================================
    // BOTONES PRODUCTOS
    // ======================================================

    function activarBotonesProductos() {


      // ====================================================
      // VER PRODUCTO
      // ====================================================

      document
        .querySelectorAll(
          ".ver-producto-btn[data-id]"
        )
        .forEach(
          function (btn) {

            btn.addEventListener(
              "click",
              function () {

                const codigo =
                  btn.dataset.id;


                if (
                  !codigo
                ) {

                  return;

                }


                mostrarToast(
                  "Abriendo " +
                  codigo
                );


                setTimeout(
                  function () {

                    window.location.href =
                      "./producto.html?id=" +
                      encodeURIComponent(
                        codigo
                      );

                  },
                  200
                );

              }
            );

          }
        );


      // ====================================================
      // FAVORITOS
      // ====================================================

      document
        .querySelectorAll(
          ".favorito-btn[data-id]"
        )
        .forEach(
          function (btn) {

            btn.addEventListener(
              "click",
              async function (event) {

                event.preventDefault();

                event.stopPropagation();


                btn.disabled =
                  true;


                try {

                  await alternarFavorito(
                    btn.dataset.id
                  );

                } finally {

                  btn.disabled =
                    false;
                }

              }
            );

          }
        );


      actualizarBotonesFavoritos();

    }


    // ======================================================
    // CUENTA
    // ======================================================

    cuentaBtn?.addEventListener(
      "click",
      function () {

        cerrarPanelBuscador(
          false
        );


        window.location.href =
          "./cuenta.html";

      }
    );


    // ======================================================
    // CARRITO
    // ======================================================

    carritoBtn?.addEventListener(
      "click",
      function () {

        cerrarPanelBuscador(
          false
        );


        carrito =
          cargarCarrito();


        if (
          carrito.length === 0
        ) {

          mostrarToast(
            "Tu carrito está vacío."
          );

          return;

        }


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


        if (
          !guardado
        ) {

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
          "Error leyendo carrito:",
          error
        );


        return [];

      }

    }


    // ======================================================
    // CONTADOR CARRITO
    // ======================================================

    function actualizarCarrito() {

      if (
        !cantidadCarrito
      ) {

        return;

      }


      carrito =
        cargarCarrito();


      const cantidad =
        carrito.reduce(

          function (
            total,
            producto
          ) {

            const unidades =
              numero(
                producto.cantidad
              );


            return (

              total

              +

              (
                unidades > 0
                  ? unidades
                  : 1
              )

            );

          },

          0

        );


      cantidadCarrito.textContent =
        cantidad;

    }


    // ======================================================
    // NEWSLETTER
    // ======================================================

    newsletterForm?.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();


        const correo =
          newsletterEmail
            ? newsletterEmail.value.trim().toLowerCase()
            : "";


        if (
          !correo
          ||
          !newsletterEmail?.checkValidity()
        ) {

          newsletterEmail?.reportValidity();

          return;

        }


        if (
          !db
        ) {

          if (newsletterStatus) {
            newsletterStatus.textContent =
              "No pudimos conectar con el servicio. Intenta nuevamente.";
          }


          mostrarToast(
            "No pudimos registrar tu correo."
          );

          return;

        }


        if (newsletterSubmit) {
          newsletterSubmit.disabled = true;
          newsletterSubmit.textContent =
            "GUARDANDO...";
        }


        if (newsletterStatus) {
          newsletterStatus.textContent =
            "Registrando tu suscripción...";
        }


        try {

          const documentId =
            encodeURIComponent(
              correo
            );


          await db
            .collection(
              "newsletter"
            )
            .doc(
              documentId
            )
            .set(
              {
                email: correo,
                activo: true,
                consentimientoMarketing: true,
                origen: "sixteen-web",
                actualizadoEn:
                  firebase.firestore
                    .FieldValue
                    .serverTimestamp()
              },
              { merge: true }
            );


          if (newsletterStatus) {
            newsletterStatus.textContent =
              "Suscripción registrada correctamente.";
          }


          mostrarToast(
            "Bienvenido a SIXTEEN Community."
          );


          newsletterForm.reset();

        } catch (error) {

          console.error(
            "Error registrando newsletter:",
            error
          );


          if (newsletterStatus) {
            newsletterStatus.textContent =
              "No pudimos registrar tu correo. Intenta nuevamente.";
          }


          mostrarToast(
            "No pudimos registrar tu correo."
          );

        } finally {

          if (newsletterSubmit) {
            newsletterSubmit.disabled = false;
            newsletterSubmit.textContent =
              "UNIRME →";
          }

        }

      }
    );


    // ======================================================
    // TOAST
    // ======================================================

    function mostrarToast(
      mensaje
    ) {

      if (
        !toast
      ) {

        return;

      }


      clearTimeout(
        toastTimer
      );


      toast.textContent =
        mensaje;


      toast.classList.add(
        "activo"
      );


      toastTimer =
        setTimeout(
          function () {

            toast.classList.remove(
              "activo"
            );

          },
          2500
        );

    }


    // ======================================================
    // ERROR PRODUCTOS
    // ======================================================

    function mostrarErrorProductos(
      mensaje
    ) {

      if (
        !productosGrid
      ) {

        return;

      }


      productosGrid.innerHTML = `

        <div
          style="
            grid-column:1/-1;
            padding:60px 20px;
            text-align:center;
            color:#777;
          "
        >

          ${escapar(
            mensaje
          )}

        </div>

      `;

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
        .toLowerCase()
        .normalize(
          "NFD"
        )
        .replace(
          /[\u0300-\u036f]/g,
          ""
        );

    }


    function fechaMillis(
      fecha
    ) {

      if (
        fecha &&
        typeof fecha.toMillis ===
        "function"
      ) {

        return fecha.toMillis();

      }


      return 0;

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
      function () {

        actualizarCarrito();


        mostrarToast(
          "Recuperamos tu carrito guardado."
        );
      }
    );


    // ======================================================
    // CARRITO CAMBIADO EN OTRA PESTAÑA
    // ======================================================

    window.addEventListener(
      "storage",
      function (event) {

        if (
          event.key ===
          "urbanx_carrito"
        ) {

          actualizarCarrito();

        }

      }
    );


    // ======================================================
    // AL VOLVER A LA PÁGINA
    // ======================================================

    window.addEventListener(
      "pageshow",
      function () {

        actualizarCarrito();


        // El buscador siempre inicia cerrado.

        cerrarPanelBuscador(
          false
        );

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


        if (
          unsubscribeFavoritos
        ) {

          unsubscribeFavoritos();

        }

      }
    );


    // ======================================================
    // INICIO
    // ======================================================

    // Garantizamos que no quede abierto
    // por estados anteriores del navegador.

    cerrarPanelBuscador(
      false
    );


    actualizarCarrito();


    cargarProductosFirestore();


  }
);