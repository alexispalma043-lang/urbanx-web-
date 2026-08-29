// @ts-nocheck

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

    const COMPARE_KEY =
      "sixteen_comparador";

    if (
      !firebase.apps.length
    ) {
      firebase.initializeApp(
        firebaseConfig
      );
    }

    const db =
      firebase.firestore();

    const $ =
      id =>
        document.getElementById(id);

    const loading =
      $("compareLoading");
    const empty =
      $("compareEmpty");
    const shell =
      $("compareShell");
    const countTitle =
      $("compareCountTitle");
    const grid =
      $("compareProductGrid");
    const tableBody =
      $("compareTableBody");
    const clearBtn =
      $("compareClearBtn");
    const note =
      $("compareNote");
    const toast =
      $("compareToast");

    let selectedIds =
      readSelectedIds();

    let products =
      [];

    let toastTimer =
      null;

    loadProducts();


    async function loadProducts() {

      if (
        selectedIds.length === 0
      ) {
        showEmpty();
        return;
      }

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

        const all =
          [];

        snapshot.forEach(
          function (doc) {

            const data =
              doc.data();

            all.push({
              firestoreId: doc.id,
              codigo: normalizeCode(
                data.codigo ||
                doc.id
              ),
              nombre: data.nombre ||
                "Producto SIXTEEN",
              categoria: data.categoria ||
                "SIXTEEN",
              precio: num(
                data.precio
              ),
              precioAnterior: num(
                data.precioAnterior
              ),
              stock: Math.max(
                0,
                num(
                  data.stock
                )
              ),
              color: data.color || "",
              tallas: Array.isArray(
                data.tallas
              )
                ? data.tallas
                : [],
              imagen: data.imagen || "",
              descripcion:
                data.descripcion || "",
              detalles:
                data.detalles || "",
              materiales:
                data.materiales || "",
              nuevo:
                data.nuevo === true,
              destacado:
                data.destacado === true,
              urbanx3d:
                data.urbanx3d === true
            });
          }
        );

        products =
          selectedIds
            .map(
              id =>
                all.find(
                  product =>
                    product.codigo === id
                )
            )
            .filter(Boolean);

        const validIds =
          products.map(
            product =>
              product.codigo
          );

        if (
          validIds.length !==
          selectedIds.length
        ) {

          selectedIds =
            validIds;

          saveSelectedIds(
            validIds
          );
        }

        if (
          products.length === 0
        ) {
          showEmpty();
          return;
        }

        render();

      } catch (error) {

        console.error(
          "Comparador SIXTEEN:",
          error
        );

        loading.hidden = true;
        empty.hidden = false;

        empty.querySelector(
          "h2"
        ).textContent =
          "No fue posible cargar el comparador";

        empty.querySelector(
          "p"
        ).textContent =
          "Actualiza la página o vuelve a la tienda e inténtalo nuevamente.";
      }
    }


    function render() {

      loading.hidden = true;
      empty.hidden = true;
      shell.hidden = false;

      countTitle.textContent =
        products.length === 1
          ? "1 producto seleccionado"
          : `${products.length} productos seleccionados`;

      renderCards();
      renderTable();

      note.textContent =
        products.length < 2
          ? "Agrega al menos un producto más para aprovechar la comparación."
          : "Los datos se muestran directamente desde el catálogo activo de SIXTEEN.";
    }


    function renderCards() {

      grid.innerHTML = "";

      grid.style.gridTemplateColumns =
        `repeat(${Math.max(
          1,
          products.length
        )}, minmax(0, 1fr))`;

      products.forEach(
        function (product) {

          const card =
            document.createElement(
              "article"
            );

          card.className =
            "compare-card";

          const image =
            product.imagen
              ? `
                <img
                  src="${attr(
                    product.imagen
                  )}"
                  alt="${attr(
                    product.nombre
                  )}"
                  onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='grid';
                  "
                >

                <div
                  class="compare-card-placeholder"
                  style="display:none;"
                >
                  XVI
                </div>
              `
              : `
                <div class="compare-card-placeholder">
                  XVI
                </div>
              `;

          const badge =
            product.stock <= 0
              ? "AGOTADO"
              : (
                  product.nuevo
                    ? "NUEVO"
                    : ""
                );

          card.innerHTML = `
            <div class="compare-card-image">

              ${
                badge
                  ? `
                    <span class="compare-card-badge">
                      ${escapeHtml(
                        badge
                      )}
                    </span>
                  `
                  : ""
              }

              ${image}

              <button
                type="button"
                class="compare-card-remove"
                data-remove-id="${attr(
                  product.codigo
                )}"
                aria-label="Quitar ${attr(
                  product.nombre
                )}"
              >
                ×
              </button>

            </div>


            <div class="compare-card-body">

              <p class="compare-card-category">
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

              <strong class="compare-card-price">
                $${product.precio.toFixed(2)}
              </strong>

              <p class="compare-card-code">
                ${escapeHtml(
                  product.codigo
                )}
              </p>

              <a
                href="./producto.html?id=${encodeURIComponent(
                  product.codigo
                )}"
                class="compare-card-open"
              >
                VER PRODUCTO
              </a>

            </div>
          `;

          grid.appendChild(card);
        }
      );
    }


    function renderTable() {

      const rows = [
        {
          label: "PRECIO",
          render: product =>
            `<strong>$${product.precio.toFixed(2)}</strong>`
        },
        {
          label: "CATEGORÍA",
          render: product =>
            escapeHtml(
              product.categoria
            )
        },
        {
          label: "COLOR",
          render: product =>
            escapeHtml(
              product.color ||
              "No especificado"
            )
        },
        {
          label: "TALLAS",
          render: product =>
            product.tallas.length
              ? escapeHtml(
                  product.tallas.join(
                    " · "
                  )
                )
              : "No aplica"
        },
        {
          label: "DISPONIBILIDAD",
          render: product =>
            product.stock > 0
              ? `<span class="compare-stock-ok">Disponible · ${product.stock} unidades</span>`
              : `<span class="compare-stock-out">Agotado</span>`
        },
        {
          label: "NUEVO",
          render: product =>
            product.nuevo
              ? `<span class="compare-value-yes">SÍ</span>`
              : `<span class="compare-value-no">NO</span>`
        },
        {
          label: "DESTACADO",
          render: product =>
            product.destacado
              ? `<span class="compare-value-yes">SÍ</span>`
              : `<span class="compare-value-no">NO</span>`
        },
        {
          label: "SIXTEEN 3D",
          render: product =>
            product.urbanx3d
              ? `<span class="compare-value-yes">DISPONIBLE</span>`
              : `<span class="compare-value-no">NO DISPONIBLE</span>`
        },
        {
          label: "MATERIALES",
          render: product =>
            escapeHtml(
              product.materiales ||
              "No especificado"
            )
        },
        {
          label: "DESCRIPCIÓN",
          render: product =>
            escapeHtml(
              product.descripcion ||
              "Sin descripción."
            )
        }
      ];

      tableBody.innerHTML = "";

      rows.forEach(
        function (row) {

          const tr =
            document.createElement(
              "tr"
            );

          const th =
            document.createElement(
              "th"
            );

          th.scope = "row";
          th.textContent = row.label;

          tr.appendChild(th);

          products.forEach(
            function (product) {

              const td =
                document.createElement(
                  "td"
                );

              td.innerHTML =
                row.render(product);

              tr.appendChild(td);
            }
          );

          tableBody.appendChild(tr);
        }
      );
    }


    grid.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            "[data-remove-id]"
          );

        if (!button) {
          return;
        }

        const id =
          normalizeCode(
            button.dataset.removeId
          );

        selectedIds =
          selectedIds.filter(
            item =>
              item !== id
          );

        products =
          products.filter(
            product =>
              product.codigo !== id
          );

        saveSelectedIds(
          selectedIds
        );

        showToast(
          "Producto eliminado del comparador."
        );

        if (
          products.length === 0
        ) {
          showEmpty();
          return;
        }

        render();
      }
    );


    clearBtn.addEventListener(
      "click",
      function () {

        selectedIds = [];
        products = [];

        saveSelectedIds([]);

        showToast(
          "Comparador limpiado."
        );

        showEmpty();
      }
    );


    function showEmpty() {

      loading.hidden = true;
      shell.hidden = true;
      empty.hidden = false;
    }


    function readSelectedIds() {

      try {

        const raw =
          localStorage.getItem(
            COMPARE_KEY
          );

        if (!raw) {
          return [];
        }

        const parsed =
          JSON.parse(raw);

        if (
          !Array.isArray(parsed)
        ) {
          return [];
        }

        return parsed
          .map(
            function (item) {

              return normalizeCode(
                typeof item ===
                "string"
                  ? item
                  : (
                      item?.id ||
                      item?.codigo
                    )
              );
            }
          )
          .filter(Boolean)
          .slice(0, 3);

      } catch (error) {

        console.warn(
          "Comparador storage:",
          error
        );

        return [];
      }
    }


    function saveSelectedIds(ids) {

      const entries =
        ids.map(
          function (id) {

            const product =
              products.find(
                item =>
                  item.codigo === id
              );

            return {
              id: id,
              nombre:
                product?.nombre ||
                id
            };
          }
        );

      localStorage.setItem(
        COMPARE_KEY,
        JSON.stringify(entries)
      );
    }


    function normalizeCode(value) {

      return String(value || "")
        .trim()
        .toUpperCase();
    }


    function num(value) {

      const result =
        Number(value);

      return Number.isFinite(result)
        ? result
        : 0;
    }


    function escapeHtml(value) {

      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }


    function attr(value) {

      return escapeHtml(value);
    }


    function showToast(message) {

      clearTimeout(
        toastTimer
      );

      toast.textContent =
        message;

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
          2200
        );
    }

  }
);
