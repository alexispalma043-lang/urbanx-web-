// @ts-nocheck

// ==========================================================
// SIXTEEN · PASO 13
// RECOMENDACIONES INTELIGENTES SIN SERVICIOS EXTERNOS
// ==========================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const firebaseConfig = {
      apiKey: "AIzaSyBFLPbBQPZy4ILeBRZ_kELi7KizlR1hgJo",
      authDomain: "urbanx-92e74.firebaseapp.com",
      projectId: "urbanx-92e74",
      storageBucket: "urbanx-92e74.firebasestorage.app",
      messagingSenderId: "830520272633",
      appId: "1:830520272633:web:ce7f2bf7abc8f86fec6428"
    };


    if (
      typeof firebase ===
      "undefined"
    ) {
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
      typeof firebase.auth ===
      "function"
        ? firebase.auth()
        : null;


    const homeSection =
      document.getElementById(
        "recomendacionesInicio"
      );


    const homeGrid =
      document.getElementById(
        "recomendacionesGridInicio"
      );


    const productSection =
      document.getElementById(
        "recomendacionesProducto"
      );


    const productGrid =
      document.getElementById(
        "recomendacionesGridProducto"
      );


    if (
      !homeGrid &&
      !productGrid
    ) {
      return;
    }


    const currentCode =
      String(
        new URLSearchParams(
          window.location.search
        ).get("id") ||
        ""
      )
        .trim()
        .toUpperCase();


    let products =
      [];

    let favorites =
      [];

    let recent =
      getRecentItems();


    let currentUser =
      auth?.currentUser ||
      null;


    let renderedOnce =
      false;


    // ======================================================
    // INICIO
    // ======================================================

    loadProducts();


    if (auth) {

      auth.onAuthStateChanged(
        async function (user) {

          currentUser =
            user ||
            null;


          await loadFavorites();


          if (
            products.length
          ) {

            renderRecommendations();
          }
        }
      );
    }


    // ======================================================
    // PRODUCTOS
    // ======================================================

    async function loadProducts() {

      try {

        const snapshot =
          await db
            .collection("productos")
            .where(
              "estado",
              "==",
              "Activo"
            )
            .get();


        products =
          [];


        snapshot.forEach(
          function (doc) {

            const data =
              doc.data() ||
              {};


            products.push({
              firestoreId:
                doc.id,

              codigo:
                normalize(
                  data.codigo ||
                  doc.id
                ),

              nombre:
                String(
                  data.nombre ||
                  "Producto SIXTEEN"
                ),

              categoria:
                String(
                  data.categoria ||
                  "SIXTEEN"
                ),

              precio:
                numberValue(
                  data.precio
                ),

              color:
                String(
                  data.color ||
                  ""
                ),

              tallas:
                Array.isArray(
                  data.tallas
                )
                  ? data.tallas
                  : [],

              imagen:
                String(
                  data.imagen ||
                  ""
                ),

              stock:
                Math.max(
                  0,
                  numberValue(
                    data.stock
                  )
                ),

              nuevo:
                data.nuevo ===
                true,

              destacado:
                data.destacado ===
                true,

              descripcion:
                String(
                  data.descripcion ||
                  ""
                )
            });
          }
        );


        await loadFavorites();


        renderRecommendations();

      } catch (error) {

        console.warn(
          "SIXTEEN recomendaciones:",
          error
        );


        hideSections();
      }
    }


    // ======================================================
    // FAVORITOS
    // ======================================================

    async function loadFavorites() {

      favorites =
        [];


      if (
        !currentUser ||
        currentUser.isAnonymous
      ) {
        return;
      }


      try {

        const snapshot =
          await db
            .collection("favoritos")
            .doc(
              currentUser.uid
            )
            .collection("items")
            .get();


        snapshot.forEach(
          function (doc) {

            const data =
              doc.data() ||
              {};


            favorites.push({
              codigo:
                normalize(
                  data.codigo ||
                  doc.id
                ),

              categoria:
                String(
                  data.categoria ||
                  ""
                ),

              color:
                String(
                  data.color ||
                  ""
                )
            });
          }
        );

      } catch (error) {

        console.warn(
          "Recomendaciones · favoritos:",
          error
        );
      }
    }


    // ======================================================
    // MOTOR DE RECOMENDACIÓN
    // ======================================================

    function renderRecommendations() {

      recent =
        getRecentItems();


      const current =
        currentCode
          ? products.find(
              product =>
                product.codigo ===
                currentCode
            )
          : null;


      const ranked =
        products
          .filter(
            product =>
              product.codigo !==
              currentCode
          )
          .map(
            function (product) {

              const result =
                scoreProduct(
                  product,
                  current
                );


              return {
                ...product,
                recommendationScore:
                  result.score,
                recommendationReasons:
                  result.reasons
              };
            }
          )
          .sort(
            function (a, b) {

              if (
                b.recommendationScore !==
                a.recommendationScore
              ) {

                return (
                  b.recommendationScore -
                  a.recommendationScore
                );
              }


              if (
                b.stock !==
                a.stock
              ) {

                return (
                  b.stock -
                  a.stock
                );
              }


              return a.nombre.localeCompare(
                b.nombre,
                "es",
                {
                  sensitivity:
                    "base"
                }
              );
            }
          );


      const recommended =
        ranked
          .filter(
            product =>
              product.stock > 0
          )
          .slice(
            0,
            4
          );


      if (
        homeGrid
      ) {

        renderGrid(
          homeGrid,
          recommended
        );


        homeSection.hidden =
          recommended.length ===
          0;
      }


      if (
        productGrid
      ) {

        renderGrid(
          productGrid,
          recommended
        );


        productSection.hidden =
          recommended.length ===
          0;
      }


      renderedOnce =
        true;
    }


    function scoreProduct(
      product,
      current
    ) {

      let score =
        0;


      const reasons =
        [];


      const productCategory =
        normalizeText(
          product.categoria
        );


      const productColors =
        splitColors(
          product.color
        );


      // ----------------------------------------------------
      // PRODUCTO ACTUAL
      // ----------------------------------------------------

      if (current) {

        if (
          productCategory &&
          productCategory ===
          normalizeText(
            current.categoria
          )
        ) {

          score += 8;

          addReason(
            reasons,
            "Misma categoría"
          );
        }


        if (
          colorsIntersect(
            productColors,
            splitColors(
              current.color
            )
          )
        ) {

          score += 5;

          addReason(
            reasons,
            "Color relacionado"
          );
        }
      }


      // ----------------------------------------------------
      // FAVORITOS DEL CLIENTE
      // ----------------------------------------------------

      favorites.forEach(
        function (favorite) {

          if (
            productCategory &&
            productCategory ===
            normalizeText(
              favorite.categoria
            )
          ) {

            score += 4;

            addReason(
              reasons,
              "Según tus favoritos"
            );
          }


          if (
            colorsIntersect(
              productColors,
              splitColors(
                favorite.color
              )
            )
          ) {

            score += 2.5;

            addReason(
              reasons,
              "Según tus favoritos"
            );
          }
        }
      );


      // ----------------------------------------------------
      // HISTORIAL RECIENTE
      // ----------------------------------------------------

      recent
        .slice(
          0,
          6
        )
        .forEach(
          function (viewed) {

            if (
              product.codigo ===
              normalize(
                viewed.codigo
              )
            ) {

              return;
            }


            if (
              productCategory &&
              productCategory ===
              normalizeText(
                viewed.categoria
              )
            ) {

              score += 2.5;

              addReason(
                reasons,
                "Según lo que viste"
              );
            }


            if (
              colorsIntersect(
                productColors,
                splitColors(
                  viewed.color
                )
              )
            ) {

              score += 1.5;

              addReason(
                reasons,
                "Según lo que viste"
              );
            }
          }
        );


      // ----------------------------------------------------
      // CALIDAD DE CANDIDATO
      // ----------------------------------------------------

      if (
        product.destacado
      ) {

        score += 1.5;

        addReason(
          reasons,
          "Destacado"
        );
      }


      if (
        product.nuevo
      ) {

        score += 1;

        addReason(
          reasons,
          "Nuevo"
        );
      }


      if (
        product.stock > 0
      ) {

        score += 0.5;
      }


      if (
        reasons.length ===
        0
      ) {

        addReason(
          reasons,
          "Selección SIXTEEN"
        );
      }


      return {
        score:
          score,

        reasons:
          reasons.slice(
            0,
            2
          )
      };
    }


    // ======================================================
    // RENDER
    // ======================================================

    function renderGrid(
      container,
      list
    ) {

      container.innerHTML =
        "";


      list.forEach(
        function (product) {

          const card =
            document.createElement(
              "article"
            );


          card.className =
            "producto-card recomendacion-card";


          const image =
            product.imagen
              ? `
                <img
                  src="${escapeHtml(
                    product.imagen
                  )}"
                  alt="${escapeHtml(
                    product.nombre
                  )}"
                  loading="lazy"
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
              : `
                <div class="producto-demo">
                  XVI
                </div>
              `;


          const badge =
            product.nuevo
              ? `
                <span class="producto-badge">
                  NUEVO
                </span>
              `
              : "";


          const reasons =
            product
              .recommendationReasons
              .map(
                reason =>
                  `
                    <span>
                      ${escapeHtml(
                        reason
                      )}
                    </span>
                  `
              )
              .join("");


          card.innerHTML = `
            <div class="producto-imagen">

              ${badge}

              ${image}

            </div>


            <div class="producto-contenido">

              <div class="recomendacion-razones">
                ${reasons}
              </div>


              <div class="producto-top">

                <div>

                  <p class="producto-categoria">
                    ${escapeHtml(
                      product.categoria
                        .toUpperCase()
                    )}
                  </p>

                  <h3>
                    ${escapeHtml(
                      product.nombre
                    )}
                  </h3>

                </div>


                <span class="producto-precio">
                  $${product.precio.toFixed(2)}
                </span>

              </div>


              <p class="producto-color">
                ${escapeHtml(
                  product.color ||
                  "SIXTEEN Collection"
                )}
              </p>


              <button
                class="comparar-btn-card"
                type="button"
                data-compare-id="${escapeHtml(
                  product.codigo
                )}"
                data-compare-name="${escapeHtml(
                  product.nombre
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


              <a
                class="ver-producto-btn recomendacion-ver-btn"
                href="./producto.html?id=${encodeURIComponent(
                  product.codigo
                )}"
              >
                VER PRODUCTO
              </a>

            </div>
          `;


          container.appendChild(
            card
          );
        }
      );


      window.SIXTEEN_PRODUCT_TOOLS
        ?.refresh();
    }


    // ======================================================
    // HISTORIAL LOCAL
    // ======================================================

    function getRecentItems() {

      if (
        window.SIXTEEN_PRODUCT_TOOLS
          ?.getRecentItems
      ) {

        return window
          .SIXTEEN_PRODUCT_TOOLS
          .getRecentItems();
      }


      try {

        const raw =
          localStorage.getItem(
            "sixteen_vistos_recientemente"
          );


        const parsed =
          raw
            ? JSON.parse(raw)
            : [];


        return Array.isArray(
          parsed
        )
          ? parsed
          : [];

      } catch (error) {

        return [];
      }
    }


    // ======================================================
    // UTILIDADES
    // ======================================================

    function normalize(
      value
    ) {

      return String(
        value ||
        ""
      )
        .trim()
        .toUpperCase();
    }


    function normalizeText(
      value
    ) {

      return String(
        value ||
        ""
      )
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        );
    }


    function splitColors(
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
          color =>
            normalizeText(
              color
            )
        )
        .filter(Boolean);
    }


    function colorsIntersect(
      a,
      b
    ) {

      if (
        !a.length ||
        !b.length
      ) {
        return false;
      }


      return a.some(
        color =>
          b.includes(
            color
          )
      );
    }


    function addReason(
      list,
      reason
    ) {

      if (
        !list.includes(
          reason
        )
      ) {

        list.push(
          reason
        );
      }
    }


    function numberValue(
      value
    ) {

      const result =
        Number(
          value
        );


      return Number.isFinite(
        result
      )
        ? result
        : 0;
    }


    function escapeHtml(
      value
    ) {

      return String(
        value ??
        ""
      )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }


    function hideSections() {

      if (
        homeSection
      ) {
        homeSection.hidden =
          true;
      }


      if (
        productSection
      ) {
        productSection.hidden =
          true;
      }
    }

  }
);
