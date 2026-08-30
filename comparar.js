// @ts-nocheck

document.addEventListener("DOMContentLoaded", function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBFLPbBQPZy4ILeBRZ_kELi7KizlR1hgJo",
    authDomain: "urbanx-92e74.firebaseapp.com",
    projectId: "urbanx-92e74",
    storageBucket: "urbanx-92e74.firebasestorage.app",
    messagingSenderId: "830520272633",
    appId: "1:830520272633:web:ce7f2bf7abc8f86fec6428"
  };

  const COMPARE_KEY = "sixteen_comparador";
  const MAX_COMPARE = 3;

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const db = firebase.firestore();
  const $ = id => document.getElementById(id);

  const loading = $("compareLoading");
  const empty = $("compareEmpty");
  const errorBox = $("compareError");
  const shell = $("compareShell");
  const countTitle = $("compareCountTitle");
  const limitText = $("compareLimitText");
  const grid = $("compareProductGrid");
  const tableHead = $("compareTableHead");
  const tableBody = $("compareTableBody");
  const clearBtn = $("compareClearBtn");
  const retryBtn = $("compareRetryBtn");
  const note = $("compareNote");
  const toast = $("compareToast");
  const menuBtn = $("compareMenuBtn");
  const nav = $("compareNav");
  const clearModal = $("compareClearModal");
  const clearCancel = $("compareClearCancel");
  const clearConfirm = $("compareClearConfirm");

  let selectedIds = readSelectedIds();
  let products = [];
  let toastTimer = null;
  let clearModalPreviousFocus = null;

  initMenu();
  initModal();
  loadProducts();

  async function loadProducts() {
    selectedIds = readSelectedIds();

    if (selectedIds.length === 0) {
      showEmpty();
      return;
    }

    showLoading();

    try {
      const found = new Map();

      const snapshot = await db
        .collection("productos")
        .where("codigo", "in", selectedIds)
        .get();

      snapshot.forEach(function (doc) {
        const product = normalizeProduct(doc);
        if (product && product.estado === "Activo") {
          found.set(product.codigo, product);
        }
      });

      const missing = selectedIds.filter(id => !found.has(id));

      if (missing.length) {
        const fallbackDocs = await Promise.all(
          missing.map(id => db.collection("productos").doc(id).get())
        );

        fallbackDocs.forEach(function (doc) {
          if (!doc.exists) return;
          const product = normalizeProduct(doc);
          if (product && product.estado === "Activo") {
            found.set(product.codigo, product);
          }
        });
      }

      products = selectedIds
        .map(id => found.get(id))
        .filter(Boolean);

      const validIds = products.map(product => product.codigo);
      const removedCount = selectedIds.length - validIds.length;

      selectedIds = validIds;
      saveSelectedIds(validIds);

      if (removedCount > 0) {
        showToast(
          removedCount === 1
            ? "Se retiró un producto que ya no está disponible."
            : `Se retiraron ${removedCount} productos que ya no están disponibles.`
        );
      }

      if (products.length === 0) {
        showEmpty();
        return;
      }

      render();
    } catch (error) {
      console.error("Comparador SIXTEEN:", error);
      showError();
    }
  }

  function normalizeProduct(doc) {
    const data = doc.data() || {};
    const codigo = normalizeCode(data.codigo || doc.id);

    if (!codigo) return null;

    const raw = {
      ...data,
      codigo,
      stock: Math.max(0, num(data.stock)),
      variantes: Array.isArray(data.variantes) ? data.variantes : []
    };

    const variantsApi = window.SIXTEEN_VARIANTS;
    const hasVariants = Boolean(
      variantsApi && variantsApi.hasVariants(raw)
    );

    const stock = hasVariants
      ? variantsApi.totalStock(raw)
      : Math.max(0, num(data.stock));

    const colors = hasVariants
      ? variantsApi.colors(raw, true)
      : legacyColors(data.color);

    const sizes = hasVariants
      ? variantsApi.sizes(raw, "", true)
      : uniqueStrings(data.tallas);

    const variantCount = hasVariants
      ? variantsApi.variants(raw).length
      : 0;

    return {
      firestoreId: doc.id,
      codigo,
      estado: String(data.estado || ""),
      nombre: String(data.nombre || "Producto SIXTEEN"),
      categoria: String(data.categoria || "SIXTEEN"),
      precio: num(data.precio),
      precioAnterior: num(data.precioAnterior),
      stock,
      colors,
      sizes,
      variantCount,
      imagen: safeImageUrl(data.imagen),
      descripcion: String(data.descripcion || ""),
      detalles: String(data.detalles || ""),
      materiales: String(data.materiales || ""),
      nuevo: data.nuevo === true,
      destacado: data.destacado === true,
      urbanx3d: data.urbanx3d === true
    };
  }

  function render() {
    loading.hidden = true;
    loading.setAttribute("aria-busy", "false");
    empty.hidden = true;
    errorBox.hidden = true;
    shell.hidden = false;

    countTitle.textContent = products.length === 1
      ? "1 producto seleccionado"
      : `${products.length} productos seleccionados`;

    limitText.textContent = `${products.length} / ${MAX_COMPARE} productos`;

    renderCards();
    renderTable();

    note.textContent = products.length < 2
      ? "Agrega al menos un producto más para aprovechar la comparación."
      : "Los datos se consultan directamente desde el catálogo activo de SIXTEEN.";
  }

  function renderCards() {
    grid.replaceChildren();
    grid.style.gridTemplateColumns = `repeat(${Math.max(1, products.length)}, minmax(0, 1fr))`;

    products.forEach(function (product) {
      const card = document.createElement("article");
      card.className = "compare-card";

      const imageWrap = document.createElement("div");
      imageWrap.className = "compare-card-image";

      const badgeText = product.stock <= 0
        ? "AGOTADO"
        : (product.nuevo ? "NUEVO" : "");

      if (badgeText) {
        const badge = document.createElement("span");
        badge.className = "compare-card-badge";
        badge.textContent = badgeText;
        imageWrap.appendChild(badge);
      }

      if (product.imagen) {
        const img = document.createElement("img");
        img.src = product.imagen;
        img.alt = product.nombre;
        img.loading = "lazy";
        img.decoding = "async";

        img.addEventListener("error", function () {
          img.remove();
          imageWrap.insertBefore(createPlaceholder(), imageWrap.querySelector(".compare-card-remove"));
        }, { once: true });

        imageWrap.appendChild(img);
      } else {
        imageWrap.appendChild(createPlaceholder());
      }

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "compare-card-remove";
      removeBtn.dataset.removeId = product.codigo;
      removeBtn.setAttribute("aria-label", `Quitar ${product.nombre} del comparador`);
      removeBtn.textContent = "×";
      imageWrap.appendChild(removeBtn);

      const body = document.createElement("div");
      body.className = "compare-card-body";

      const category = document.createElement("p");
      category.className = "compare-card-category";
      category.textContent = product.categoria.toUpperCase();

      const title = document.createElement("h3");
      title.textContent = product.nombre;

      const priceWrap = document.createElement("div");
      priceWrap.className = "compare-card-prices";

      const price = document.createElement("strong");
      price.className = "compare-card-price";
      price.textContent = money(product.precio);
      priceWrap.appendChild(price);

      if (hasPreviousPrice(product)) {
        const oldPrice = document.createElement("span");
        oldPrice.className = "compare-card-old-price";
        oldPrice.textContent = money(product.precioAnterior);
        priceWrap.appendChild(oldPrice);
      }

      const code = document.createElement("p");
      code.className = "compare-card-code";
      code.textContent = product.codigo;

      const open = document.createElement("a");
      open.className = "compare-card-open";
      open.href = `./producto.html?id=${encodeURIComponent(product.codigo)}`;
      open.textContent = product.stock > 0 ? "VER PRODUCTO" : "VER DETALLES";

      body.append(category, title, priceWrap, code, open);
      card.append(imageWrap, body);
      grid.appendChild(card);
    });
  }

  function renderTable() {
    tableHead.replaceChildren();
    tableBody.replaceChildren();

    const headRow = document.createElement("tr");
    const featureHead = document.createElement("th");
    featureHead.scope = "col";
    featureHead.textContent = "CARACTERÍSTICA";
    headRow.appendChild(featureHead);

    products.forEach(function (product) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = product.nombre;
      headRow.appendChild(th);
    });

    tableHead.appendChild(headRow);

    const rows = [
      {
        label: "PRECIO",
        value: p => ({ text: money(p.precio), className: "compare-strong" })
      },
      {
        label: "PRECIO ANTERIOR",
        value: p => ({ text: hasPreviousPrice(p) ? money(p.precioAnterior) : "No aplica" })
      },
      {
        label: "AHORRO",
        value: p => ({
          text: hasPreviousPrice(p) ? savingText(p) : "No aplica",
          className: hasPreviousPrice(p) ? "compare-value-yes" : "compare-value-no"
        })
      },
      {
        label: "CATEGORÍA",
        value: p => ({ text: p.categoria })
      },
      {
        label: "COLORES",
        value: p => ({ text: p.colors.length ? p.colors.join(" · ") : "No especificado" })
      },
      {
        label: "TALLAS",
        value: p => ({ text: p.sizes.length ? p.sizes.join(" · ") : "No aplica" })
      },
      {
        label: "VARIANTES",
        value: p => ({ text: p.variantCount > 0 ? `${p.variantCount} disponibles en catálogo` : "Producto sin variantes" })
      },
      {
        label: "DISPONIBILIDAD",
        value: p => ({
          text: p.stock > 0 ? `Disponible · ${p.stock} unidades` : "Agotado",
          className: p.stock > 0 ? "compare-stock-ok" : "compare-stock-out"
        })
      },
      {
        label: "NUEVO",
        value: p => ({ text: p.nuevo ? "SÍ" : "NO", className: p.nuevo ? "compare-value-yes" : "compare-value-no" })
      },
      {
        label: "DESTACADO",
        value: p => ({ text: p.destacado ? "SÍ" : "NO", className: p.destacado ? "compare-value-yes" : "compare-value-no" })
      },
      {
        label: "SIXTEEN EXPERIENCE 3D",
        value: p => ({ text: p.urbanx3d ? "DISPONIBLE" : "NO DISPONIBLE", className: p.urbanx3d ? "compare-value-yes" : "compare-value-no" })
      },
      {
        label: "MATERIALES",
        value: p => ({ text: p.materiales || "No especificado" })
      },
      {
        label: "DETALLES",
        value: p => ({ text: p.detalles || "Sin detalles adicionales." })
      },
      {
        label: "DESCRIPCIÓN",
        value: p => ({ text: p.descripcion || "Sin descripción." })
      }
    ];

    rows.forEach(function (row) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = row.label;
      tr.appendChild(th);

      products.forEach(function (product) {
        const td = document.createElement("td");
        const result = row.value(product);
        td.textContent = result.text;
        if (result.className) td.classList.add(result.className);
        tr.appendChild(td);
      });

      tableBody.appendChild(tr);
    });
  }

  grid.addEventListener("click", function (event) {
    const button = event.target.closest("[data-remove-id]");
    if (!button) return;

    const id = normalizeCode(button.dataset.removeId);
    selectedIds = selectedIds.filter(item => item !== id);
    products = products.filter(product => product.codigo !== id);
    saveSelectedIds(selectedIds);
    showToast("Producto eliminado del comparador.");

    if (products.length === 0) {
      showEmpty();
      return;
    }

    render();
  });

  clearBtn.addEventListener("click", openClearModal);
  retryBtn.addEventListener("click", loadProducts);

  function showLoading() {
    loading.hidden = false;
    loading.setAttribute("aria-busy", "true");
    empty.hidden = true;
    errorBox.hidden = true;
    shell.hidden = true;
  }

  function showEmpty() {
    loading.hidden = true;
    loading.setAttribute("aria-busy", "false");
    errorBox.hidden = true;
    shell.hidden = true;
    empty.hidden = false;
  }

  function showError() {
    loading.hidden = true;
    loading.setAttribute("aria-busy", "false");
    empty.hidden = true;
    shell.hidden = true;
    errorBox.hidden = false;
  }

  function readSelectedIds() {
    try {
      const raw = localStorage.getItem(COMPARE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      const unique = [];

      parsed.forEach(function (item) {
        const id = normalizeCode(
          typeof item === "string"
            ? item
            : (item?.id || item?.codigo)
        );

        if (id && !unique.includes(id) && unique.length < MAX_COMPARE) {
          unique.push(id);
        }
      });

      return unique;
    } catch (error) {
      console.warn("Comparador storage:", error);
      return [];
    }
  }

  function saveSelectedIds(ids) {
    try {
      const entries = ids
        .map(function (id) {
          const product = products.find(item => item.codigo === id);
          return { id, nombre: product?.nombre || id };
        })
        .slice(0, MAX_COMPARE);

      localStorage.setItem(COMPARE_KEY, JSON.stringify(entries));

      window.dispatchEvent(new CustomEvent("sixteen:compare-changed", {
        detail: { items: entries }
      }));

      return true;
    } catch (error) {
      console.warn("Comparador · no se pudo guardar:", error);
      showToast("No fue posible guardar el comparador en este navegador.");
      return false;
    }
  }

  function initMenu() {
    if (!menuBtn || !nav) return;

    menuBtn.addEventListener("click", function () {
      const open = !nav.classList.contains("activo");
      nav.classList.toggle("activo", open);
      menuBtn.classList.toggle("activo", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    nav.addEventListener("click", function (event) {
      if (!event.target.closest("a")) return;
      nav.classList.remove("activo");
      menuBtn.classList.remove("activo");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Abrir menú");
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 650) {
        nav.classList.remove("activo");
        menuBtn.classList.remove("activo");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Abrir menú");
      }
    });
  }

  function initModal() {
    if (!clearModal || !clearCancel || !clearConfirm) return;

    clearCancel.addEventListener("click", closeClearModal);
    clearConfirm.addEventListener("click", function () {
      selectedIds = [];
      products = [];
      saveSelectedIds([]);
      closeClearModal();
      showToast("Comparador limpiado.");
      showEmpty();
    });

    clearModal.addEventListener("click", function (event) {
      if (event.target.matches("[data-close-clear-modal]")) {
        closeClearModal();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (clearModal.hidden) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeClearModal();
        return;
      }

      if (event.key === "Tab") {
        trapModalFocus(event);
      }
    });
  }

  function openClearModal() {
    if (!products.length) return;
    clearModalPreviousFocus = document.activeElement;
    clearModal.hidden = false;
    document.body.classList.add("compare-modal-open");
    clearCancel.focus();
  }

  function closeClearModal() {
    clearModal.hidden = true;
    document.body.classList.remove("compare-modal-open");
    if (clearModalPreviousFocus && typeof clearModalPreviousFocus.focus === "function") {
      clearModalPreviousFocus.focus();
    }
  }

  function trapModalFocus(event) {
    const focusable = Array.from(
      clearModal.querySelectorAll("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")
    ).filter(el => !el.hidden);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function createPlaceholder() {
    const placeholder = document.createElement("div");
    placeholder.className = "compare-card-placeholder";
    placeholder.textContent = "XVI";
    return placeholder;
  }

  function legacyColors(value) {
    return uniqueStrings(
      String(value || "")
        .split(/\||,|;/g)
        .map(item => item.trim())
    );
  }

  function uniqueStrings(values) {
    const out = [];
    (Array.isArray(values) ? values : []).forEach(function (value) {
      const text = String(value || "").trim();
      if (text && !out.includes(text)) out.push(text);
    });
    return out;
  }

  function safeImageUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(raw)) return raw;

    try {
      const url = new URL(raw, window.location.href);
      if (url.protocol === "https:") return url.href;
      if (url.origin === window.location.origin && ["http:", "https:"].includes(url.protocol)) {
        return url.href;
      }
    } catch (_) {}

    return "";
  }

  function hasPreviousPrice(product) {
    return product.precioAnterior > product.precio && product.precio > 0;
  }

  function savingText(product) {
    const amount = Math.max(0, product.precioAnterior - product.precio);
    const percent = product.precioAnterior > 0
      ? Math.round((amount / product.precioAnterior) * 100)
      : 0;
    return `${money(amount)} · ${percent}%`;
  }

  function money(value) {
    return `$${num(value).toFixed(2)}`;
  }

  function normalizeCode(value) {
    return String(value || "").trim().toUpperCase();
  }

  function num(value) {
    const result = Number(value);
    return Number.isFinite(result) ? result : 0;
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("activo");

    toastTimer = setTimeout(function () {
      toast.classList.remove("activo");
    }, 2600);
  }
});
