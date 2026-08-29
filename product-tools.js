// @ts-nocheck

(function () {

  const COMPARE_KEY = "sixteen_comparador";
  const RECENT_KEY = "sixteen_vistos_recientemente";
  const MAX_COMPARE = 3;
  const MAX_RECENT = 8;

  let toastTimer = null;


  function readArray(key) {

    try {

      const raw =
        localStorage.getItem(key);

      if (!raw) {
        return [];
      }

      const parsed =
        JSON.parse(raw);

      return Array.isArray(parsed)
        ? parsed
        : [];

    } catch (error) {

      console.warn(
        "SIXTEEN Product Tools · storage:",
        error
      );

      return [];
    }
  }


  function saveArray(key, value) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;

    } catch (error) {

      console.warn(
        "SIXTEEN Product Tools · guardar:",
        error
      );

      return false;
    }
  }


  function normalizeCode(value) {

    return String(value || "")
      .trim()
      .toUpperCase();
  }


  function numberValue(value) {

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


  function getCompareItems() {

    return readArray(COMPARE_KEY)
      .map(
        function (item) {

          if (
            typeof item ===
            "string"
          ) {

            return {
              id: normalizeCode(item),
              nombre: normalizeCode(item)
            };
          }

          return {
            id: normalizeCode(
              item?.id ||
              item?.codigo
            ),
            nombre: String(
              item?.nombre ||
              item?.id ||
              item?.codigo ||
              ""
            )
          };
        }
      )
      .filter(
        item =>
          Boolean(item.id)
      )
      .slice(0, MAX_COMPARE);
  }


  function saveCompareItems(items) {

    const clean =
      items
        .map(
          function (item) {

            return {
              id: normalizeCode(
                item?.id ||
                item?.codigo
              ),
              nombre: String(
                item?.nombre ||
                item?.id ||
                item?.codigo ||
                ""
              )
            };
          }
        )
        .filter(
          item =>
            Boolean(item.id)
        )
        .slice(0, MAX_COMPARE);

    saveArray(
      COMPARE_KEY,
      clean
    );

    refreshCompareUI();

    window.dispatchEvent(
      new CustomEvent(
        "sixteen:compare-changed",
        {
          detail: {
            items: clean
          }
        }
      )
    );

    return clean;
  }


  function isCompared(id) {

    const code =
      normalizeCode(id);

    return getCompareItems()
      .some(
        item =>
          item.id === code
      );
  }


  function toggleCompare(id, name) {

    const code =
      normalizeCode(id);

    if (!code) {
      return false;
    }

    const items =
      getCompareItems();

    const index =
      items.findIndex(
        item =>
          item.id === code
      );

    if (
      index >= 0
    ) {

      items.splice(index, 1);

      saveCompareItems(items);

      showToast(
        "Producto eliminado del comparador."
      );

      return false;
    }

    if (
      items.length >=
      MAX_COMPARE
    ) {

      showToast(
        "Puedes comparar hasta 3 productos."
      );

      return false;
    }

    items.push({
      id: code,
      nombre: String(
        name ||
        code
      )
    });

    saveCompareItems(items);

    showToast(
      "Producto agregado al comparador."
    );

    return true;
  }


  function clearCompare() {

    saveCompareItems([]);

    showToast(
      "Comparador limpiado."
    );
  }


  function refreshCompareButtons() {

    const selected =
      new Set(
        getCompareItems()
          .map(
            item =>
              item.id
          )
      );

    document
      .querySelectorAll(
        "[data-compare-id]"
      )
      .forEach(
        function (button) {

          const id =
            normalizeCode(
              button.dataset.compareId
            );

          const active =
            selected.has(id);

          button.classList.toggle(
            "activo",
            active
          );

          button.setAttribute(
            "aria-pressed",
            active
              ? "true"
              : "false"
          );

          const label =
            button.querySelector(
              "[data-compare-label]"
            );

          if (label) {

            label.textContent =
              active
                ? "EN COMPARADOR"
                : "COMPARAR";
          }
        }
      );
  }


  function ensureDock() {

    if (
      document.getElementById(
        "sixteenCompareDock"
      )
    ) {
      return;
    }

    const dock =
      document.createElement(
        "aside"
      );

    dock.id =
      "sixteenCompareDock";

    dock.className =
      "sixteen-compare-dock";

    dock.hidden =
      true;

    dock.innerHTML = `
      <div class="sixteen-compare-dock-copy">

        <span>
          COMPARADOR
        </span>

        <strong id="sixteenCompareDockCount">
          0 / ${MAX_COMPARE}
        </strong>

      </div>


      <div
        class="sixteen-compare-dock-items"
        id="sixteenCompareDockItems"
      >
      </div>


      <div class="sixteen-compare-dock-actions">

        <button
          type="button"
          id="sixteenCompareClear"
        >
          LIMPIAR
        </button>

        <a href="./comparar.html">
          COMPARAR AHORA
        </a>

      </div>
    `;

    document.body.appendChild(dock);

    dock
      .querySelector(
        "#sixteenCompareClear"
      )
      ?.addEventListener(
        "click",
        clearCompare
      );
  }


  function refreshDock() {

    ensureDock();

    const dock =
      document.getElementById(
        "sixteenCompareDock"
      );

    const count =
      document.getElementById(
        "sixteenCompareDockCount"
      );

    const itemsContainer =
      document.getElementById(
        "sixteenCompareDockItems"
      );

    if (
      !dock ||
      !count ||
      !itemsContainer
    ) {
      return;
    }

    const items =
      getCompareItems();

    dock.hidden =
      items.length === 0;

    count.textContent =
      `${items.length} / ${MAX_COMPARE}`;

    itemsContainer.innerHTML =
      "";

    items.forEach(
      function (item) {

        const chip =
          document.createElement(
            "button"
          );

        chip.type =
          "button";

        chip.className =
          "sixteen-compare-chip";

        chip.dataset.removeCompareId =
          item.id;

        chip.title =
          "Quitar del comparador";

        chip.innerHTML = `
          <span>
            ${escapeHtml(
              item.nombre ||
              item.id
            )}
          </span>

          <b>
            ×
          </b>
        `;

        itemsContainer.appendChild(
          chip
        );
      }
    );
  }


  function refreshCompareUI() {

    refreshCompareButtons();
    refreshDock();
  }


  function getRecentItems() {

    return readArray(RECENT_KEY)
      .map(
        function (item) {

          return {
            codigo:
              normalizeCode(
                item?.codigo ||
                item?.id
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
              numberValue(
                item?.precio
              ),

            color:
              String(
                item?.color ||
                ""
              ),

            imagen:
              String(
                item?.imagen ||
                ""
              ),

            stock:
              Math.max(
                0,
                numberValue(
                  item?.stock
                )
              ),

            nuevo:
              item?.nuevo === true,

            vistoEn:
              numberValue(
                item?.vistoEn
              )
          };
        }
      )
      .filter(
        item =>
          Boolean(item.codigo)
      )
      .slice(0, MAX_RECENT);
  }


  function rememberViewed(product) {

    const code =
      normalizeCode(
        product?.codigo ||
        product?.id
      );

    if (!code) {
      return;
    }

    const current =
      getRecentItems()
        .filter(
          item =>
            item.codigo !== code
        );

    current.unshift({
      codigo: code,
      nombre: String(
        product?.nombre ||
        "Producto SIXTEEN"
      ),
      categoria: String(
        product?.categoria ||
        "SIXTEEN"
      ),
      precio: numberValue(
        product?.precio
      ),
      color: String(
        product?.color ||
        ""
      ),
      imagen: String(
        product?.imagen ||
        ""
      ),
      stock: Math.max(
        0,
        numberValue(
          product?.stock
        )
      ),
      nuevo: product?.nuevo === true,
      vistoEn: Date.now()
    });

    saveArray(
      RECENT_KEY,
      current.slice(
        0,
        MAX_RECENT
      )
    );
  }


  function renderRecent(
    container,
    excludeId,
    limit = 4
  ) {

    if (!container) {
      return;
    }

    const exclude =
      normalizeCode(excludeId);

    const items =
      getRecentItems()
        .filter(
          item =>
            item.codigo !== exclude
        )
        .slice(
          0,
          Math.max(
            1,
            limit
          )
        );

    const section =
      container.closest(
        "[data-recent-section]"
      );

    container.innerHTML =
      "";

    if (
      items.length === 0
    ) {

      if (section) {
        section.hidden = true;
      }

      return;
    }

    if (section) {
      section.hidden = false;
    }

    items.forEach(
      function (item) {

        const card =
          document.createElement(
            "article"
          );

        card.className =
          "producto-card producto-card-reciente";

        const image =
          item.imagen
            ? `
              <img
                src="${escapeHtml(
                  item.imagen
                )}"
                alt="${escapeHtml(
                  item.nombre
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
          item.stock <= 0
            ? `
              <span class="producto-badge">
                AGOTADO
              </span>
            `
            : (
                item.nuevo
                  ? `
                    <span class="producto-badge">
                      NUEVO
                    </span>
                  `
                  : ""
              );

        card.innerHTML = `
          <div class="producto-imagen">

            ${badge}

            ${image}

          </div>


          <div class="producto-contenido">

            <div class="producto-top">

              <div>

                <p class="producto-categoria">
                  ${escapeHtml(
                    item.categoria.toUpperCase()
                  )}
                </p>

                <h3>
                  ${escapeHtml(
                    item.nombre
                  )}
                </h3>

              </div>

              <span class="producto-precio">
                $${item.precio.toFixed(2)}
              </span>

            </div>


            <p class="producto-color">
              ${escapeHtml(
                item.color ||
                "SIXTEEN Collection"
              )}
            </p>


            <button
              class="comparar-btn-card"
              type="button"
              data-compare-id="${escapeHtml(
                item.codigo
              )}"
              data-compare-name="${escapeHtml(
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
              data-recent-open="${escapeHtml(
                item.codigo
              )}"
            >
              VER PRODUCTO
            </button>

          </div>
        `;

        container.appendChild(
          card
        );
      }
    );

    refreshCompareUI();
  }


  function ensureToast() {

    let toast =
      document.getElementById(
        "sixteenProductToolsToast"
      );

    if (toast) {
      return toast;
    }

    toast =
      document.createElement(
        "div"
      );

    toast.id =
      "sixteenProductToolsToast";

    toast.className =
      "sixteen-product-tools-toast";

    toast.setAttribute(
      "aria-live",
      "polite"
    );

    document.body.appendChild(toast);

    return toast;
  }


  function showToast(message) {

    const toast =
      ensureToast();

    clearTimeout(
      toastTimer
    );

    toast.textContent =
      String(message || "");

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


  function handleDocumentClick(event) {

    const compareButton =
      event.target.closest(
        "[data-compare-id]"
      );

    if (compareButton) {

      event.preventDefault();
      event.stopPropagation();

      toggleCompare(
        compareButton.dataset.compareId,
        compareButton.dataset.compareName ||
        compareButton.dataset.compareId
      );

      return;
    }

    const removeChip =
      event.target.closest(
        "[data-remove-compare-id]"
      );

    if (removeChip) {

      event.preventDefault();

      const id =
        normalizeCode(
          removeChip.dataset.removeCompareId
        );

      const next =
        getCompareItems()
          .filter(
            item =>
              item.id !== id
          );

      saveCompareItems(next);

      return;
    }

    const recentOpen =
      event.target.closest(
        "[data-recent-open]"
      );

    if (recentOpen) {

      const id =
        normalizeCode(
          recentOpen.dataset.recentOpen
        );

      if (id) {

        window.location.href =
          "./producto.html?id=" +
          encodeURIComponent(id);
      }
    }
  }


  function init() {

    ensureDock();
    refreshCompareUI();

    document.addEventListener(
      "click",
      handleDocumentClick
    );

    window.addEventListener(
      "storage",
      function (event) {

        if (
          event.key ===
          COMPARE_KEY
        ) {

          refreshCompareUI();
        }
      }
    );
  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );

  } else {

    init();
  }


  window.SIXTEEN_PRODUCT_TOOLS = {
    compareKey: COMPARE_KEY,
    recentKey: RECENT_KEY,
    maxCompare: MAX_COMPARE,
    getCompareItems,
    toggleCompare,
    clearCompare,
    isCompared,
    refresh: refreshCompareUI,
    rememberViewed,
    getRecentItems,
    renderRecent
  };

})();
