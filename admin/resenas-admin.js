// @ts-nocheck
(function () {
  "use strict";

  const ADMIN_APP_NAME = "sixteen-admin";

  const $ = id =>
    document.getElementById(id);

  let db = null;
  let auth = null;

  let products = [];
  let reviews = [];
  let loading = false;

  const body = $("resenasAdminBody");
  const searchInput = $("resenasAdminBuscar");
  const ratingFilter = $("resenasAdminFiltroRating");
  const catalogFilter = $("resenasAdminFiltroCatalogo");
  const clearBtn = $("limpiarFiltrosResenasBtn");
  const refreshBtn = $("actualizarResenasAdminBtn");
  const resultText = $("resenasAdminResultadoTexto");
  const statusEl = $("resenasAdminEstado");
  const badgeEl = $("resenasPendientesBadge");

  if (!body) {
    return;
  }

  function initFirebase() {
    if (typeof firebase === "undefined") {
      setStatus("FIREBASE NO DISPONIBLE", true);
      return false;
    }

    const app =
      firebase.apps.find(
        app =>
          app.name ===
          ADMIN_APP_NAME
      );

    if (!app) {
      // dashboard.js crea la app antes que este módulo.
      setStatus("ESPERANDO SESIÓN", false);
      return false;
    }

    auth = firebase.auth(app);
    db = firebase.firestore(app);
    return true;
  }

  function setStatus(text, error = false) {
    if (!statusEl) return;

    statusEl.textContent = text;
    statusEl.classList.toggle("error", error);
  }

  function setLoadingState() {
    body.replaceChildren();

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.textContent = "Cargando reseñas desde Firestore...";

    row.appendChild(cell);
    body.appendChild(row);

    if (resultText) {
      resultText.textContent = "Cargando reseñas...";
    }
  }

  function tsMs(value) {
    if (!value) return 0;

    if (typeof value.toDate === "function") {
      try {
        return value.toDate().getTime();
      } catch (_) {
        return 0;
      }
    }

    if (typeof value.seconds === "number") {
      return value.seconds * 1000;
    }

    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function dateText(value) {
    const ms = tsMs(value);

    if (!ms) return "Sin fecha";

    try {
      return new Date(ms).toLocaleString(
        "es-EC",
        {
          dateStyle: "medium",
          timeStyle: "short"
        }
      );
    } catch (_) {
      return new Date(ms).toLocaleString("es-EC");
    }
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  async function mapWithConcurrency(items, limit, worker) {
    const result = new Array(items.length);
    let index = 0;

    async function run() {
      while (index < items.length) {
        const current = index++;
        result[current] = await worker(items[current], current);
      }
    }

    await Promise.all(
      Array.from(
        { length: Math.min(limit, Math.max(items.length, 1)) },
        run
      )
    );

    return result;
  }

  async function loadReviews() {
    if (loading) return;

    if (!db && !initFirebase()) {
      setTimeout(loadReviews, 250);
      return;
    }

    const user = auth?.currentUser;

    if (!user) {
      setStatus("SIN SESIÓN", true);
      return;
    }

    loading = true;
    setStatus("SINCRONIZANDO");
    setLoadingState();

    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = "ACTUALIZANDO...";
    }

    try {
      const productSnapshot =
        await db
          .collection("productos")
          .get({ source: "server" });

      products = [];

      productSnapshot.forEach(doc => {
        const data = doc.data() || {};

        products.push({
          id: doc.id,
          codigo:
            String(
              data.codigo ||
              doc.id
            )
              .trim()
              .toUpperCase(),
          nombre:
            String(
              data.nombre ||
              "Producto SIXTEEN"
            ),
          categoria:
            String(
              data.categoria ||
              ""
            ),
          estado:
            String(
              data.estado ||
              "Activo"
            )
        });
      });

      const groups =
        await mapWithConcurrency(
          products,
          6,
          async product => {
            try {
              const snapshot =
                await db
                  .collection("resenas")
                  .doc(product.codigo)
                  .collection("items")
                  .get({ source: "server" });

              const rows = [];

              snapshot.forEach(doc => {
                rows.push({
                  id: doc.id,
                  productoId:
                    product.id,
                  productoCodigo:
                    product.codigo,
                  productoNombre:
                    product.nombre,
                  productoCategoria:
                    product.categoria,
                  productoEstado:
                    product.estado,
                  ...doc.data()
                });
              });

              return rows;
            } catch (error) {
              console.warn(
                "Reseñas · producto " +
                product.codigo,
                error
              );
              return [];
            }
          }
        );

      reviews =
        groups
          .flat()
          .sort(
            (a, b) =>
              tsMs(
                b.actualizadoEn ||
                b.creadoEn
              ) -
              tsMs(
                a.actualizadoEn ||
                a.creadoEn
              )
          );

      updateKpis();
      render();
      setStatus("ACTUALIZADO");

      setTimeout(
        () => setStatus("FIRESTORE"),
        1500
      );
    } catch (error) {
      console.error(
        "Administración de reseñas:",
        error
      );

      reviews = [];
      updateKpis();
      renderError(
        error?.message ||
        "No fue posible leer las reseñas."
      );
      setStatus("REVISAR CONEXIÓN", true);
    } finally {
      loading = false;

      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.textContent = "ACTUALIZAR";
      }
    }
  }

  function updateKpis() {
    const total = reviews.length;

    const sum =
      reviews.reduce(
        (acc, item) =>
          acc +
          Math.max(
            1,
            Math.min(
              5,
              Math.round(
                Number(
                  item.calificacion ||
                  0
                )
              )
            )
          ),
        0
      );

    const avg =
      total
        ? sum / total
        : 0;

    const five =
      reviews.filter(
        item =>
          Number(item.calificacion) === 5
      ).length;

    const low =
      reviews.filter(
        item =>
          Number(item.calificacion) <= 2
      ).length;

    const map = {
      resenasAdminKpiTotal:
        total,
      resenasAdminKpiPromedio:
        avg.toFixed(1),
      resenasAdminKpiCinco:
        five,
      resenasAdminKpiBajas:
        low
    };

    Object.entries(map)
      .forEach(([id, value]) => {
        const el = $(id);
        if (el) el.textContent = String(value);
      });

    if (badgeEl) {
      badgeEl.textContent = String(low);
      badgeEl.classList.toggle(
        "vacio",
        low === 0
      );
      badgeEl.title =
        low
          ? `${low} reseña(s) de 1–2 estrellas para revisar`
          : "No hay reseñas de 1–2 estrellas";
    }
  }

  function filteredReviews() {
    const q = normalize(
      searchInput?.value
    );

    const rating =
      Number(
        ratingFilter?.value ||
        0
      );

    const catalog =
      String(
        catalogFilter?.value ||
        ""
      );

    return reviews.filter(item => {
      if (
        rating &&
        Number(
          item.calificacion
        ) !== rating
      ) {
        return false;
      }

      if (
        catalog &&
        String(
          item.productoEstado ||
          "Activo"
        ) !== catalog
      ) {
        return false;
      }

      if (!q) return true;

      const haystack = normalize(
        [
          item.productoCodigo,
          item.productoNombre,
          item.productoCategoria,
          item.usuarioNombre,
          item.comentario
        ]
          .filter(Boolean)
          .join(" ")
      );

      return haystack.includes(q);
    });
  }

  function render() {
    const list = filteredReviews();

    body.replaceChildren();

    if (resultText) {
      resultText.textContent =
        `Mostrando ${list.length} de ${reviews.length} reseñas.`;
    }

    if (!list.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");

      cell.colSpan = 6;
      cell.textContent =
        reviews.length
          ? "No hay reseñas que coincidan con los filtros."
          : "Todavía no existen reseñas publicadas.";

      row.appendChild(cell);
      body.appendChild(row);
      return;
    }

    list.forEach(review => {
      const row = document.createElement("tr");

      const productCell = document.createElement("td");
      const productBox = document.createElement("div");
      productBox.className = "resena-admin-product";

      const productName = document.createElement("strong");
      productName.textContent =
        review.productoNombre ||
        review.productoCodigo ||
        "Producto SIXTEEN";

      const productMeta = document.createElement("small");
      productMeta.textContent =
        [
          review.productoCodigo,
          review.productoEstado
        ]
          .filter(Boolean)
          .join(" · ");

      productBox.append(
        productName,
        productMeta
      );
      productCell.appendChild(productBox);

      const clientCell = document.createElement("td");
      const clientBox = document.createElement("div");
      clientBox.className = "resena-admin-client";

      const clientName = document.createElement("strong");
      clientName.textContent =
        review.usuarioNombre ||
        "Cliente SIXTEEN";

      const clientId = document.createElement("small");
      clientId.textContent =
        review.usuarioUid
          ? "UID: " +
            String(review.usuarioUid).slice(0, 10) +
            "…"
          : "Sin UID";

      clientBox.append(
        clientName,
        clientId
      );
      clientCell.appendChild(clientBox);

      const ratingCell = document.createElement("td");
      const stars = document.createElement("span");
      stars.className = "resena-admin-stars";

      const rating =
        Math.max(
          1,
          Math.min(
            5,
            Math.round(
              Number(
                review.calificacion ||
                0
              )
            )
          )
        );

      stars.textContent =
        "★".repeat(rating) +
        "☆".repeat(5 - rating);

      ratingCell.appendChild(stars);

      const commentCell = document.createElement("td");
      const comment = document.createElement("div");
      comment.className = "resena-admin-comment";
      comment.textContent =
        String(
          review.comentario ||
          ""
        );
      commentCell.appendChild(comment);

      const dateCell = document.createElement("td");
      dateCell.className = "resena-admin-date";
      dateCell.textContent =
        dateText(
          review.actualizadoEn ||
          review.creadoEn
        );

      const actionsCell = document.createElement("td");
      const actions = document.createElement("div");
      actions.className = "resena-admin-actions";

      const productLink = document.createElement("a");
      productLink.href =
        "../producto.html?id=" +
        encodeURIComponent(
          review.productoCodigo ||
          ""
        );
      productLink.target = "_blank";
      productLink.rel = "noopener noreferrer";
      productLink.textContent = "VER PRODUCTO";

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "danger";
      deleteBtn.textContent = "ELIMINAR";
      deleteBtn.addEventListener(
        "click",
        () =>
          deleteReview(
            review,
            deleteBtn
          )
      );

      actions.append(
        productLink,
        deleteBtn
      );
      actionsCell.appendChild(actions);

      row.append(
        productCell,
        clientCell,
        ratingCell,
        commentCell,
        dateCell,
        actionsCell
      );

      body.appendChild(row);
    });
  }

  function renderError(message) {
    body.replaceChildren();

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.textContent =
      "No fue posible cargar las reseñas.";

    row.appendChild(cell);
    body.appendChild(row);

    if (resultText) {
      resultText.textContent =
        message;
    }
  }

  async function deleteReview(review, button) {
    const product =
      review.productoNombre ||
      review.productoCodigo ||
      "este producto";

    const client =
      review.usuarioNombre ||
      "Cliente SIXTEEN";

    const confirmed =
      window.confirm(
        `¿Eliminar la reseña de ${client} en ${product}?\n\nEsta acción borra la reseña de Firestore y no se puede deshacer.`
      );

    if (!confirmed) {
      return;
    }

    button.disabled = true;
    button.textContent = "ELIMINANDO...";

    try {
      await db
        .collection("resenas")
        .doc(
          String(
            review.productoCodigo ||
            ""
          )
            .trim()
            .toUpperCase()
        )
        .collection("items")
        .doc(review.id)
        .delete();

      reviews =
        reviews.filter(
          item =>
            !(
              item.id === review.id &&
              item.productoCodigo ===
                review.productoCodigo
            )
        );

      updateKpis();
      render();
      setStatus("RESEÑA ELIMINADA");

      setTimeout(
        () => setStatus("FIRESTORE"),
        1500
      );
    } catch (error) {
      console.error(
        "Eliminar reseña:",
        error
      );

      alert(
        "No fue posible eliminar la reseña. Revisa la sesión administrativa y las reglas de Firestore."
      );

      button.disabled = false;
      button.textContent = "ELIMINAR";
    }
  }

  searchInput?.addEventListener(
    "input",
    render
  );

  ratingFilter?.addEventListener(
    "change",
    render
  );

  catalogFilter?.addEventListener(
    "change",
    render
  );

  clearBtn?.addEventListener(
    "click",
    () => {
      if (searchInput) {
        searchInput.value = "";
      }

      if (ratingFilter) {
        ratingFilter.value = "";
      }

      if (catalogFilter) {
        catalogFilter.value = "";
      }

      render();
    }
  );

  refreshBtn?.addEventListener(
    "click",
    loadReviews
  );

  function start() {
    if (!initFirebase()) {
      setTimeout(start, 250);
      return;
    }

    auth.onAuthStateChanged(user => {
      if (user) {
        loadReviews();
      } else {
        reviews = [];
        updateKpis();
        render();
        setStatus("SIN SESIÓN", true);
      }
    });
  }

  start();
})();
