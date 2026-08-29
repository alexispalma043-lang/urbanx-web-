// @ts-nocheck

// ==========================================================
// SIXTEEN · PASO 10
// RECUPERACIÓN / SINCRONIZACIÓN DEL CARRITO
// LOCALSTORAGE + FIRESTORE
// ==========================================================

(function () {

  const CART_KEY =
    "urbanx_carrito";

  const UPDATED_KEY =
    "urbanx_carrito_actualizado";


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


  let auth =
    null;

  let db =
    null;

  let usuarioActual =
    null;

  let sincronizando =
    false;

  let listo =
    false;


  // ========================================================
  // INICIAR
  // ========================================================

  function iniciar() {

    if (
      listo ||
      typeof firebase ===
      "undefined"
    ) {
      return;
    }


    try {

      if (
        !firebase.apps.length
      ) {

        firebase.initializeApp(
          firebaseConfig
        );
      }


      if (
        typeof firebase.auth !==
        "function"
      ) {

        console.warn(
          "Cart Sync: Firebase Auth no está disponible."
        );

        return;
      }


      auth =
        firebase.auth();


      db =
        firebase.firestore();


      auth.onAuthStateChanged(
        async function (usuario) {

          usuarioActual =
            usuario ||
            null;


          if (!usuarioActual) {
            return;
          }


          await sincronizarConCuenta();
        }
      );


      listo =
        true;

    } catch (error) {

      console.warn(
        "Cart Sync:",
        error
      );
    }
  }


  // ========================================================
  // LEER LOCAL
  // ========================================================

  function leerLocal() {

    try {

      const raw =
        localStorage.getItem(
          CART_KEY
        );


      if (!raw) {
        return [];
      }


      const datos =
        JSON.parse(
          raw
        );


      return Array.isArray(
        datos
      )
        ? datos
        : [];

    } catch (error) {

      console.warn(
        "Cart Sync · leer local:",
        error
      );


      return [];
    }
  }


  // ========================================================
  // NORMALIZAR
  // ========================================================

  function normalizarItems(
    items
  ) {

    if (
      !Array.isArray(
        items
      )
    ) {
      return [];
    }


    return items
      .slice(
        0,
        50
      )
      .map(
        function (item) {

          return {

            id:
              String(
                item?.id ||
                item?.codigo ||
                ""
              )
                .trim()
                .toUpperCase(),

            firestoreId:
              String(
                item?.firestoreId ||
                ""
              ),

            nombre:
              String(
                item?.nombre ||
                "Producto SIXTEEN"
              ),

            categoria:
              String(
                item?.categoria ||
                "SIXTEEN"
              ),

            precio:
              numero(
                item?.precio
              ),

            color:
              String(
                item?.color ||
                "SIXTEEN"
              ),

            talla:
              item?.talla ??
              null,

            varianteId:
              String(
                item?.varianteId ||
                ""
              ),

            usaVariantes:
              item?.usaVariantes ===
              true,

            cantidad:
              Math.max(
                1,
                Math.floor(
                  numero(
                    item?.cantidad
                  ) ||
                  1
                )
              ),

            imagen:
              String(
                item?.imagen ||
                ""
              ),

            stock:
              item?.stock ===
              undefined
                ? null
                : numero(
                    item.stock
                  ),

            disponible:
              item?.disponible !==
              false
          };
        }
      )
      .filter(
        function (item) {

          return Boolean(
            item.id
          );
        }
      );
  }


  // ========================================================
  // GUARDAR LOCAL
  // ========================================================

  function escribirLocal(
    items,
    timestamp
  ) {

    const limpio =
      normalizarItems(
        items
      );


    try {

      if (
        limpio.length
      ) {

        localStorage.setItem(
          CART_KEY,
          JSON.stringify(
            limpio
          )
        );

      } else {

        localStorage.removeItem(
          CART_KEY
        );
      }


      localStorage.setItem(
        UPDATED_KEY,
        String(
          timestamp
        )
      );


      return limpio;

    } catch (error) {

      console.warn(
        "Cart Sync · guardar local:",
        error
      );


      return limpio;
    }
  }


  // ========================================================
  // GUARDAR EN CUENTA
  // ========================================================

  async function guardarNube(
    items,
    timestamp
  ) {

    if (
      !db ||
      !usuarioActual
    ) {
      return;
    }


    const limpio =
      normalizarItems(
        items
      );


    try {

      await db
        .collection("carritos")
        .doc(
          usuarioActual.uid
        )
        .set(
          {
            uid:
              usuarioActual.uid,

            items:
              limpio,

            actualizadoEnCliente:
              timestamp,

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
        "Cart Sync · guardar nube:",
        error
      );
    }
  }


  // ========================================================
  // API · GUARDAR
  // ========================================================

  async function guardar(
    items
  ) {

    const timestamp =
      Date.now();


    const limpio =
      escribirLocal(
        items,
        timestamp
      );


    await guardarNube(
      limpio,
      timestamp
    );


    emitirEvento(
      "sixteen:cart-updated",
      limpio
    );
  }


  // ========================================================
  // API · LIMPIAR
  // ========================================================

  async function limpiar() {

    const timestamp =
      Date.now();


    escribirLocal(
      [],
      timestamp
    );


    await guardarNube(
      [],
      timestamp
    );


    emitirEvento(
      "sixteen:cart-updated",
      []
    );
  }


  // ========================================================
  // SINCRONIZAR
  // ========================================================

  async function sincronizarConCuenta() {

    if (
      sincronizando ||
      !db ||
      !usuarioActual
    ) {
      return;
    }


    sincronizando =
      true;


    try {

      const ref =
        db
          .collection("carritos")
          .doc(
            usuarioActual.uid
          );


      const snapshot =
        await ref.get();


      const localItems =
        leerLocal();


      const localTimestamp =
        numero(
          localStorage.getItem(
            UPDATED_KEY
          )
        );


      if (
        !snapshot.exists
      ) {

        if (
          localItems.length
        ) {

          const timestamp =
            localTimestamp > 0
              ? localTimestamp
              : Date.now();


          escribirLocal(
            localItems,
            timestamp
          );


          await guardarNube(
            localItems,
            timestamp
          );
        }


        return;
      }


      const datos =
        snapshot.data() ||
        {};


      const nubeItems =
        normalizarItems(
          datos.items
        );


      const nubeTimestamp =
        numero(
          datos.actualizadoEnCliente
        );


      // ----------------------------------------------------
      // La versión más reciente gana.
      // ----------------------------------------------------

      if (
        nubeTimestamp >
        localTimestamp
      ) {

        const restaurado =
          escribirLocal(
            nubeItems,
            nubeTimestamp
          );


        emitirEvento(
          "sixteen:cart-restored",
          restaurado
        );


        return;
      }


      if (
        localTimestamp >
        nubeTimestamp
      ) {

        await guardarNube(
          localItems,
          localTimestamp
        );


        return;
      }


      // ----------------------------------------------------
      // Primera sincronización / timestamps antiguos.
      // Si en nube hay productos y local está vacío,
      // recuperamos el carrito.
      // ----------------------------------------------------

      if (
        !localItems.length &&
        nubeItems.length
      ) {

        const timestamp =
          nubeTimestamp > 0
            ? nubeTimestamp
            : Date.now();


        const restaurado =
          escribirLocal(
            nubeItems,
            timestamp
          );


        emitirEvento(
          "sixteen:cart-restored",
          restaurado
        );


        return;
      }


      if (
        localItems.length &&
        !nubeItems.length
      ) {

        const timestamp =
          localTimestamp > 0
            ? localTimestamp
            : Date.now();


        escribirLocal(
          localItems,
          timestamp
        );


        await guardarNube(
          localItems,
          timestamp
        );
      }

    } catch (error) {

      console.warn(
        "Cart Sync · sincronizar:",
        error
      );

    } finally {

      sincronizando =
        false;
    }
  }


  // ========================================================
  // EVENTO
  // ========================================================

  function emitirEvento(
    nombre,
    items
  ) {

    try {

      window.dispatchEvent(
        new CustomEvent(
          nombre,
          {
            detail: {
              items:
                items
            }
          }
        )
      );

    } catch (error) {

      console.warn(
        "Cart Sync · evento:",
        error
      );
    }
  }


  // ========================================================
  // UTILIDAD
  // ========================================================

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


  // ========================================================
  // EXPORTAR
  // ========================================================

  window.SIXTEEN_CART_SYNC = {

    iniciar:
      iniciar,

    guardar:
      guardar,

    limpiar:
      limpiar,

    sincronizar:
      sincronizarConCuenta,

    leerLocal:
      leerLocal

  };


  iniciar();

})();
