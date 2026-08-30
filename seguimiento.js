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

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const db = firebase.firestore();
    const $ = id => document.getElementById(id);

    const loading = $("trackLoading");
    const login = $("trackLogin");
    const errorView = $("trackError");
    const retryBtn = $("trackRetryBtn");
    const shell = $("trackShell");
    const selectorCard = $("trackSelectorCard");
    const empty = $("trackEmpty");
    const orderSelect = $("trackOrderSelect");
    const realtimeStatus = $("trackRealtimeStatus");
    const orderCard = $("trackOrderCard");
    const orderNumber = $("trackOrderNumber");
    const orderDate = $("trackOrderDate");
    const currentStatus = $("trackCurrentStatus");
    const cancelled = $("trackCancelled");
    const total = $("trackTotal");
    const payment = $("trackPayment");
    const paymentStatus = $("trackPaymentStatus");
    const deliveryMethod = $("trackDeliveryMethod");
    const province = $("trackProvince");
    const city = $("trackCity");
    const address = $("trackAddress");
    const productsCount = $("trackProductsCount");
    const productsList = $("trackProductsList");
    const toast = $("trackToast");

    let orders = [];
    let unsubscribe = null;
    let toastTimer = null;
    let activeUid = "";
    let selectedOrderId = "";
    let userSelectedOrder = false;
    let queryResolved = false;
    let queryWarningShown = false;

    const queryOrder = String(
      new URLSearchParams(window.location.search).get("pedido") || ""
    ).trim();

    queryResolved = !queryOrder;

    const stages = [
      "Pendiente",
      "Confirmado",
      "En preparación",
      "Enviado",
      "Entregado"
    ];

    auth.onAuthStateChanged(
      function (user) {
        stop();

        activeUid = user?.uid || "";
        selectedOrderId = "";
        userSelectedOrder = false;
        queryResolved = !queryOrder;
        queryWarningShown = false;

        loading.hidden = false;
        login.hidden = true;
        errorView.hidden = true;
        shell.hidden = true;
        orderCard.hidden = true;
        empty.hidden = true;

        if (!user) {
          loading.hidden = true;
          login.hidden = false;
          return;
        }

        listenOrders(user.uid);
      }
    );

    function listenOrders(uid) {
      if (!uid) {
        return;
      }

      unsubscribe = db
        .collection("pedidos")
        .where("clienteUid", "==", uid)
        .onSnapshot(
          function (snapshot) {
            orders = [];

            snapshot.forEach(
              function (doc) {
                orders.push({
                  id: doc.id,
                  ...doc.data()
                });
              }
            );

            orders.sort(
              function (a, b) {
                return millis(b.creadoEn) - millis(a.creadoEn);
              }
            );

            loading.hidden = true;
            errorView.hidden = true;
            shell.hidden = false;

            realtimeStatus.textContent =
              snapshot.metadata?.fromCache
                ? "VISTA LOCAL · SIN CONEXIÓN CONFIRMADA"
                : "ACTUALIZACIÓN EN TIEMPO REAL";

            renderSelect();

            if (!orders.length) {
              selectorCard.hidden = true;
              empty.hidden = false;
              orderCard.hidden = true;
              selectedOrderId = "";
              return;
            }

            selectorCard.hidden = false;
            empty.hidden = true;

            const selectedStillExists = orders.find(
              item => item.id === selectedOrderId
            );

            let chosen = null;

            if (userSelectedOrder && selectedStillExists) {
              chosen = selectedStillExists;
            } else if (!queryResolved && queryOrder) {
              const preferred = findPreferredOrder();

              if (preferred) {
                chosen = preferred;
                queryResolved = true;
              } else if (snapshot.metadata?.fromCache) {
                chosen = selectedStillExists || orders[0];
              } else {
                queryResolved = true;
                chosen = orders[0];

                if (!queryWarningShown) {
                  queryWarningShown = true;
                  showToast(
                    "Ese pedido no está vinculado a tu sesión. Mostramos tu pedido más reciente."
                  );
                }
              }
            } else if (selectedStillExists) {
              chosen = selectedStillExists;
            } else {
              chosen = orders[0];
            }

            selectedOrderId = chosen.id;
            orderSelect.value = chosen.id;
            renderOrder(chosen);
          },
          function (error) {
            console.error("Seguimiento:", error);

            loading.hidden = true;
            login.hidden = true;
            shell.hidden = true;
            errorView.hidden = false;

            showToast("No fue posible cargar tus pedidos.");
          }
        );
    }

    function renderSelect() {
      orderSelect.replaceChildren();

      orders.forEach(
        function (order) {
          const option = document.createElement("option");
          option.value = order.id;
          option.textContent =
            (order.numero || order.id)
            + " · "
            + (order.estado || "Pendiente");

          orderSelect.appendChild(option);
        }
      );
    }

    function findPreferredOrder() {
      if (!queryOrder) {
        return null;
      }

      const normalized = queryOrder.toLowerCase();

      return (
        orders.find(order => order.id === queryOrder)
        || orders.find(
          order => String(order.numero || "").trim().toLowerCase() === normalized
        )
        || null
      );
    }

    orderSelect.addEventListener(
      "change",
      function () {
        const order = orders.find(
          item => item.id === orderSelect.value
        );

        if (!order) {
          return;
        }

        selectedOrderId = order.id;
        userSelectedOrder = true;
        queryResolved = true;

        renderOrder(order);
        updateOrderUrl(order.id);
      }
    );

    retryBtn?.addEventListener(
      "click",
      function () {
        if (!activeUid) {
          return;
        }

        stop();
        errorView.hidden = true;
        shell.hidden = true;
        loading.hidden = false;
        listenOrders(activeUid);
      }
    );

    function renderOrder(order) {
      orderCard.hidden = false;

      orderNumber.textContent = order.numero || order.id;
      orderDate.textContent = formatDate(order.creadoEn);

      const status = order.estado || "Pendiente";
      currentStatus.textContent = status;
      renderTimeline(status);

      total.textContent = money(order.resumen?.total);

      payment.textContent =
        cleanText(order.pago?.nombre)
        || paymentName(order.pago?.metodo || order.metodoPago);

      paymentStatus.textContent =
        cleanText(order.estadoPago)
        || cleanText(order.pago?.estado)
        || "Pendiente";

      deliveryMethod.textContent = deliveryName(order.entrega?.metodo);
      province.textContent = cleanText(order.entrega?.provincia) || "-";
      city.textContent = cleanText(order.entrega?.ciudad) || "-";

      address.textContent =
        [
          cleanText(order.entrega?.direccion),
          cleanText(order.entrega?.referencia)
        ]
          .filter(Boolean)
          .join(" · ")
        || "-";

      renderProducts(order.productos);
    }

    function renderTimeline(status) {
      const cancel = status === "Cancelado";
      cancelled.hidden = !cancel;
      const currentIndex = stages.indexOf(status);

      document
        .querySelectorAll(".track-step")
        .forEach(
          function (step, index) {
            step.classList.remove("completo", "actual");
            step.removeAttribute("aria-current");

            if (cancel) {
              if (index === 0) {
                step.classList.add("completo");
              }
              return;
            }

            if (currentIndex >= 0) {
              if (index < currentIndex) {
                step.classList.add("completo");
              }

              if (index === currentIndex) {
                step.classList.add("actual");
                step.setAttribute("aria-current", "step");
              }
            }
          }
        );

      document
        .querySelectorAll(".track-line")
        .forEach(
          function (line, index) {
            line.classList.toggle(
              "completo",
              !cancel && currentIndex > index
            );
          }
        );
    }

    function renderProducts(items) {
      const products = Array.isArray(items) ? items : [];

      productsCount.textContent =
        products.length
        + (products.length === 1 ? " PRODUCTO" : " PRODUCTOS");

      productsList.replaceChildren();

      if (!products.length) {
        const message = document.createElement("p");
        message.className = "track-products-empty";
        message.textContent = "Sin productos registrados.";
        productsList.appendChild(message);
        return;
      }

      products.forEach(
        function (item) {
          const qty = Math.max(1, Math.floor(num(item.cantidad)));
          const price = Math.max(0, num(item.precioUnitario ?? item.precio));

          const row = document.createElement("div");
          row.className = "track-product-row";

          const info = document.createElement("div");
          const name = document.createElement(item.codigo ? "a" : "strong");

          if (item.codigo) {
            name.href =
              "./producto.html?id="
              + encodeURIComponent(String(item.codigo));
            name.className = "track-product-link";
          }

          name.textContent =
            cleanText(item.nombre)
            || cleanText(item.codigo)
            || "Producto";

          const detail = document.createElement("small");
          detail.textContent =
            [item.codigo, item.talla, item.color]
              .map(cleanText)
              .filter(Boolean)
              .join(" · ");

          const quantity = document.createElement("span");
          quantity.textContent = "× " + qty;

          const lineTotal = document.createElement("span");
          lineTotal.textContent = money(price * qty);

          info.appendChild(name);
          info.appendChild(detail);
          row.appendChild(info);
          row.appendChild(quantity);
          row.appendChild(lineTotal);
          productsList.appendChild(row);
        }
      );
    }

    function paymentName(method) {
      return ({
        transferencia: "Transferencia bancaria",
        qr: "Pago QR",
        tarjeta: "Tarjeta de crédito / débito",
        efectivo: "Pago contra entrega"
      })[method] || cleanText(method) || "No especificado";
    }

    function deliveryName(method) {
      return ({
        domicilio: "Envío a domicilio",
        retiro: "Retiro en tienda"
      })[method] || cleanText(method) || "No especificado";
    }

    function updateOrderUrl(id) {
      if (!id || !window.history?.replaceState) {
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.set("pedido", id);
      window.history.replaceState({}, "", url);
    }

    function money(value) {
      return "$" + num(value).toFixed(2);
    }

    function num(value) {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }

    function cleanText(value) {
      return String(value ?? "").trim();
    }

    function millis(value) {
      if (value && typeof value.toMillis === "function") {
        return value.toMillis();
      }

      if (value && typeof value.toDate === "function") {
        return value.toDate().getTime();
      }

      const date = new Date(value || 0);
      return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    }

    function formatDate(value) {
      let date = null;

      if (value && typeof value.toDate === "function") {
        date = value.toDate();
      } else if (value) {
        date = new Date(value);
      }

      if (!date || Number.isNaN(date.getTime())) {
        return "-";
      }

      return date.toLocaleString(
        "es-EC",
        {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }
      );
    }

    function showToast(message) {
      clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.add("activo");

      toastTimer = setTimeout(
        function () {
          toast.classList.remove("activo");
        },
        3200
      );
    }

    function stop() {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    }

    window.addEventListener("beforeunload", stop);
  }
);
