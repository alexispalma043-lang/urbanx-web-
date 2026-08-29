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

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();
  const FieldValue = firebase.firestore.FieldValue;

  const $ = (id) => document.getElementById(id);

  const loading = $("loading");
  const authShell = $("authShell");
  const customerShell = $("customerShell");
  const guestNote = $("guestNote");

  const tabLogin = $("tabLogin");
  const tabRegistro = $("tabRegistro");
  const loginForm = $("loginForm");
  const registerForm = $("registerForm");
  const authMessage = $("authMessage");

  const loginEmail = $("loginEmail");
  const loginPassword = $("loginPassword");
  const loginBtn = $("loginBtn");
  const resetBtn = $("resetBtn");

  const regNombres = $("regNombres");
  const regApellidos = $("regApellidos");
  const regEmail = $("regEmail");
  const regPassword = $("regPassword");
  const regPassword2 = $("regPassword2");
  const registerBtn = $("registerBtn");

  const welcomeName = $("welcomeName");
  const welcomeEmail = $("welcomeEmail");
  const logoutBtn = $("logoutBtn");
  const logoutHeaderBtn = $("logoutHeaderBtn");

  const kpiPedidos = $("kpiPedidos");
  const kpiCompras = $("kpiCompras");
  const kpiTotal = $("kpiTotal");
  const kpiPendientes = $("kpiPendientes");

  const profileForm = $("profileForm");
  const profileNombres = $("profileNombres");
  const profileApellidos = $("profileApellidos");
  const profileId = $("profileId");
  const profileTelefono = $("profileTelefono");
  const profileEmail = $("profileEmail");
  const profileProvincia = $("profileProvincia");
  const profileCiudad = $("profileCiudad");
  const profileDireccion = $("profileDireccion");
  const profileReferencia = $("profileReferencia");
  const profileMessage = $("profileMessage");
  const saveProfileBtn = $("saveProfileBtn");

  const ordersFilter = $("ordersFilter");
  const ordersList = $("ordersList");

  const comprobantesSection = $("comprobantesSection");
  const comprobantesList = $("comprobantesList");
  const comprobantesTipoFiltro = $("comprobantesTipoFiltro");
  const comprobantesEstadoFiltro = $("comprobantesEstadoFiltro");
  const comprobantesAutorizadosCount = $("comprobantesAutorizadosCount");

  const favoritesCount = $("favoritesCount");
  const favoritesList = $("favoritesList");

  const notificationsSection = $("notificationsSection");
  const notificationsCoverBtn = $("notificationsCoverBtn");
  const notificationsBadge = $("notificationsBadge");
  const notificationsUnreadLabel = $("notificationsUnreadLabel");
  const markAllNotificationsBtn = $("markAllNotificationsBtn");
  const notificationsList = $("notificationsList");

  const orderModal = $("orderModal");
  const closeOrderModal = $("closeOrderModal");
  const modalOrderNumber = $("modalOrderNumber");
  const modalOrderDate = $("modalOrderDate");
  const modalOrderStatus = $("modalOrderStatus");
  const modalOrderPayment = $("modalOrderPayment");
  const modalOrderTotal = $("modalOrderTotal");
  const modalProducts = $("modalProducts");
  const modalAddress = $("modalAddress");
  const modalTrackingLink = $("modalTrackingLink");
  const toast = $("toast");

  let currentUser = null;
  let currentProfile = null;
  let orders = [];
  let comprobantes = [];
  let favorites = [];
  let notifications = [];
  let unsubscribeOrders = null;
  let unsubscribeComprobantes = null;
  let unsubscribeFavorites = null;
  let unsubscribeNotifications = null;
  let toastTimer = null;

  const VALID_SALE_STATES = new Set([
    "Confirmado", "En preparación", "Enviado", "Entregado"
  ]);

  function showView(view) {

    loading.hidden =
      view !== "loading";

    authShell.hidden =
      view !== "auth";

    customerShell.hidden =
      view !== "customer";

    logoutHeaderBtn.hidden =
      view !== "customer";
  }

  auth.onAuthStateChanged(async function (user) {
    currentUser = user || null;
    stopOrders();
    stopComprobantes();
    stopFavorites();
    stopNotifications();

    document.body.classList.toggle(
      "is-authenticated",
      Boolean(
        user &&
        !user.isAnonymous
      )
    );

    showView("loading");

    if (!user || user.isAnonymous) {
      guestNote.hidden = !user?.isAnonymous;
      showTab("login");
      showView("auth");
      return;
    }

    try {
      await loadProfile(user);
      renderUser(user);
      listenOrders(user.uid);
      listenComprobantes(user.uid);
      listenFavorites(user.uid);
      listenNotifications(user.uid);

      showView("customer");

    } catch (error) {
      console.error("Cuenta:", error);

      showView("customer");

      showToast(
        "No fue posible cargar todos los datos."
      );
    }
  });

  tabLogin.addEventListener("click", () => showTab("login"));
  tabRegistro.addEventListener("click", () => showTab("register"));

  function showTab(tab) {
    const login = tab === "login";
    tabLogin.classList.toggle("activo", login);
    tabRegistro.classList.toggle("activo", !login);
    loginForm.classList.toggle("activo", login);
    registerForm.classList.toggle("activo", !login);
    setMessage(authMessage, "");
  }

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    loginBtn.disabled = true;
    loginBtn.textContent = "INGRESANDO...";
    setMessage(authMessage, "Verificando credenciales...", true);

    try {
      await auth.signInWithEmailAndPassword(
        normalizeEmail(loginEmail.value),
        loginPassword.value
      );
      setMessage(authMessage, "Sesión iniciada.", true);
    } catch (error) {
      console.error("Login:", error);
      setMessage(authMessage, authError(error), false);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "INICIAR SESIÓN";
    }
  });

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const names = clean(regNombres.value);
    const surnames = clean(regApellidos.value);
    const email = normalizeEmail(regEmail.value);
    const password = regPassword.value;

    if (password !== regPassword2.value) {
      setMessage(authMessage, "Las contraseñas no coinciden.", false);
      return;
    }

    if (password.length < 6) {
      setMessage(authMessage, "La contraseña debe tener al menos 6 caracteres.", false);
      return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = "CREANDO...";
    setMessage(authMessage, "Creando tu cuenta SIXTEEN...", true);

    try {
      let user = auth.currentUser;

      if (user && user.isAnonymous) {
        const credential = firebase.auth.EmailAuthProvider.credential(email, password);
        const result = await user.linkWithCredential(credential);
        user = result.user;
      } else {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        user = result.user;
      }

      await user.updateProfile({
        displayName: `${names} ${surnames}`.trim()
      });

      await db.collection("cuentas").doc(user.uid).set({
        uid: user.uid,
        nombres: names,
        apellidos: surnames,
        email: email,
        identificacion: "",
        telefono: "",
        provincia: "",
        ciudad: "",
        direccion: "",
        referencia: "",
        activo: true,
        creadoEn: FieldValue.serverTimestamp(),
        actualizadoEn: FieldValue.serverTimestamp()
      }, { merge: true });

      setMessage(authMessage, "Cuenta creada correctamente.", true);
      showToast("Bienvenido a SIXTEEN.");

    } catch (error) {
      console.error("Registro:", error);
      setMessage(authMessage, authError(error), false);
    } finally {
      registerBtn.disabled = false;
      registerBtn.textContent = "CREAR MI CUENTA";
    }
  });

  resetBtn.addEventListener("click", async function () {
    const email = normalizeEmail(loginEmail.value);

    if (!email) {
      setMessage(authMessage, "Escribe primero tu correo electrónico.", false);
      loginEmail.focus();
      return;
    }

    resetBtn.disabled = true;
    resetBtn.textContent = "ENVIANDO...";

    try {
      await auth.sendPasswordResetEmail(email);
      setMessage(authMessage, "Te enviamos un correo para restablecer tu contraseña.", true);
    } catch (error) {
      setMessage(authMessage, authError(error), false);
    } finally {
      resetBtn.disabled = false;
      resetBtn.textContent = "¿OLVIDASTE TU CONTRASEÑA?";
    }
  });

  async function loadProfile(user) {
    const ref = db.collection("cuentas").doc(user.uid);
    const snapshot = await ref.get();

    if (snapshot.exists) {
      currentProfile = { uid: user.uid, ...snapshot.data() };
    } else {
      const split = splitName(user.displayName);
      currentProfile = {
        uid: user.uid,
        nombres: split.nombres,
        apellidos: split.apellidos,
        email: user.email || "",
        identificacion: "",
        telefono: "",
        provincia: "",
        ciudad: "",
        direccion: "",
        referencia: ""
      };

      await ref.set({
        ...currentProfile,
        activo: true,
        creadoEn: FieldValue.serverTimestamp(),
        actualizadoEn: FieldValue.serverTimestamp()
      }, { merge: true });
    }

    renderProfile();
  }

  function renderUser(user) {
    const name = currentProfile?.nombres || splitName(user.displayName).nombres || "Cliente";
    welcomeName.textContent = `Hola, ${name}`;
    welcomeEmail.textContent = user.email || "-";
  }

  function renderProfile() {
    if (!currentProfile) return;

    profileNombres.value = currentProfile.nombres || "";
    profileApellidos.value = currentProfile.apellidos || "";
    profileId.value = currentProfile.identificacion || "";
    profileTelefono.value = currentProfile.telefono || "";
    profileEmail.value = currentUser?.email || currentProfile.email || "";
    profileProvincia.value = currentProfile.provincia || "";
    profileCiudad.value = currentProfile.ciudad || "";
    profileDireccion.value = currentProfile.direccion || "";
    profileReferencia.value = currentProfile.referencia || "";
  }

  profileForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!currentUser || currentUser.isAnonymous) return;

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = "GUARDANDO...";
    setMessage(profileMessage, "Actualizando perfil...", true);

    try {
      const data = {
        uid: currentUser.uid,
        nombres: clean(profileNombres.value),
        apellidos: clean(profileApellidos.value),
        email: currentUser.email || "",
        identificacion: profileId.value.replace(/\D/g, "").slice(0, 13),
        telefono: profileTelefono.value.replace(/\D/g, "").slice(0, 15),
        provincia: profileProvincia.value || "",
        ciudad: clean(profileCiudad.value),
        direccion: clean(profileDireccion.value),
        referencia: clean(profileReferencia.value),
        activo: true,
        actualizadoEn: FieldValue.serverTimestamp()
      };

      await db.collection("cuentas").doc(currentUser.uid).set(data, { merge: true });
      await currentUser.updateProfile({
        displayName: `${data.nombres} ${data.apellidos}`.trim()
      });

      currentProfile = { ...currentProfile, ...data };
      renderUser(currentUser);
      setMessage(profileMessage, "Datos guardados correctamente.", true);
      showToast("Perfil actualizado.");
    } catch (error) {
      console.error("Perfil:", error);
      setMessage(profileMessage, error.message || "No fue posible guardar tus datos.", false);
    } finally {
      saveProfileBtn.disabled = false;
      saveProfileBtn.textContent = "GUARDAR CAMBIOS";
    }
  });

  profileTelefono.addEventListener("input", function () {
    profileTelefono.value = profileTelefono.value.replace(/\D/g, "").slice(0, 15);
  });

  profileId.addEventListener("input", function () {
    profileId.value = profileId.value.replace(/\D/g, "").slice(0, 13);
  });

  function listenOrders(uid) {
    stopOrders();

    unsubscribeOrders = db.collection("pedidos")
      .where("clienteUid", "==", uid)
      .onSnapshot(function (snapshot) {
        orders = [];
        snapshot.forEach(function (doc) {
          orders.push({ id: doc.id, ...doc.data() });
        });

        orders.sort((a, b) => dateMillis(b.creadoEn) - dateMillis(a.creadoEn));
        renderKPIs();
        renderOrders();
      }, function (error) {
        console.error("Pedidos cliente:", error);
        ordersList.innerHTML = `
          <div class="empty">
            <strong>NO FUE POSIBLE CARGAR TUS PEDIDOS. REVISA LAS REGLAS DE FIRESTORE DEL PASO 6.</strong>
          </div>
        `;
      });
  }

  function stopOrders() {
    if (unsubscribeOrders) {
      unsubscribeOrders();
      unsubscribeOrders = null;
    }
  }


  // ======================================================
  // PASO 16F5B · MIS COMPROBANTES
  // ======================================================

  function stopComprobantes() {
    if (
      unsubscribeComprobantes
    ) {
      unsubscribeComprobantes();
      unsubscribeComprobantes =
        null;
    }
  }

  function listenComprobantes(
    uid
  ) {
    stopComprobantes();

    unsubscribeComprobantes =
      db
        .collection(
          "facturacion"
        )
        .where(
          "clienteUid",
          "==",
          uid
        )
        .onSnapshot(
          function (
            snapshot
          ) {
            comprobantes = [];

            snapshot.forEach(
              function (
                doc
              ) {
                comprobantes.push({
                  id:
                    doc.id,
                  ...doc.data()
                });
              }
            );

            comprobantes.sort(
              (
                a,
                b
              ) =>
                dateMillis(
                  b.creadoEn
                )
                -
                dateMillis(
                  a.creadoEn
                )
            );

            renderComprobantes();
          },
          function (
            error
          ) {
            console.error(
              "Comprobantes cliente:",
              error
            );

            if (
              comprobantesList
            ) {
              comprobantesList.innerHTML = `
                <div class="empty">
                  <strong>
                    NO FUE POSIBLE CARGAR TUS COMPROBANTES.
                    REVISA LAS REGLAS DE FIRESTORE.
                  </strong>
                </div>
              `;
            }
          }
        );
  }

  function comprobanteTipoNombre(
    type
  ) {
    const map = {
      FACTURA:
        "Factura",
      NOTA_CREDITO:
        "Nota de crédito",
      NOTA_DEBITO:
        "Nota de débito",
      GUIA_REMISION:
        "Guía de remisión",
      RETENCION:
        "Comprobante de retención"
    };

    return map[
      String(
        type ||
        ""
      )
    ]
    ||
    "Comprobante";
  }

  function comprobanteEstadoClase(
    state
  ) {
    return String(
      state ||
      ""
    )
      .toLowerCase()
      .replace(
        /_/g,
        "-"
      );
  }

  function renderComprobantes() {
    if (
      !comprobantesList
    ) {
      return;
    }

    const type =
      String(
        comprobantesTipoFiltro
          ?.value
        ||
        ""
      );

    const state =
      String(
        comprobantesEstadoFiltro
          ?.value
        ||
        ""
      );

    const visible =
      comprobantes.filter(
        item =>
          (
            !type
            ||
            item.tipoDocumento ===
            type
          )
          &&
          (
            !state
            ||
            item.estado ===
            state
          )
      );

    const authorized =
      comprobantes.filter(
        item =>
          item.estado ===
          "AUTORIZADO"
      ).length;

    if (
      comprobantesAutorizadosCount
    ) {
      comprobantesAutorizadosCount.textContent =
        String(
          authorized
        );
    }

    if (
      !visible.length
    ) {
      comprobantesList.innerHTML = `
        <div class="empty">
          <div>
            <strong>
              TODAVÍA NO HAY COMPROBANTES EN ESTA VISTA.
            </strong>
            <p>
              Tus facturas y demás documentos aparecerán aquí
              cuando SIXTEEN los genere.
            </p>
          </div>
        </div>
      `;
      return;
    }

    comprobantesList.innerHTML =
      "";

    visible.forEach(
      function (
        item
      ) {
        const authorized =
          item.estado ===
          "AUTORIZADO";

        const row =
          document.createElement(
            "article"
          );

        row.className =
          "comprobante-item";

        row.innerHTML = `
          <div>
            <span class="comprobante-label">
              ${escapeHtml(comprobanteTipoNombre(item.tipoDocumento))}
            </span>

            <strong>
              ${escapeHtml(item.numero || item.id || "Comprobante")}
            </strong>

            <small>
              ${escapeHtml(item.fechaEmision || formatDate(item.creadoEn) || "—")}
            </small>
          </div>

          <div>
            <span class="comprobante-label">
              ESTADO
            </span>

            <span class="comprobante-state ${escapeAttr(comprobanteEstadoClase(item.estado))}">
              ${escapeHtml(item.estado || "En proceso")}
            </span>
          </div>

          <div>
            <span class="comprobante-label">
              ${
                item.tipoDocumento === "GUIA_REMISION"
                  ? "PEDIDO"
                  : item.tipoDocumento === "RETENCION"
                    ? "TOTAL RETENIDO"
                    : "TOTAL"
              }
            </span>

            <strong>
              ${
                item.tipoDocumento === "GUIA_REMISION"
                  ? escapeHtml(item.pedidoNumero || item.pedidoId || "—")
                  : money(
                      item.totales?.totalRetenido
                      ??
                      item.totales?.importeTotal
                    )
              }
            </strong>
          </div>

          <div class="comprobante-actions">
            <button
              type="button"
              class="primary"
              data-comprobante-ride="${escapeAttr(item.id)}"
              ${authorized ? "" : "disabled"}
            >
              RIDE
            </button>

            <button
              type="button"
              data-comprobante-xml="${escapeAttr(item.id)}"
              ${authorized ? "" : "disabled"}
            >
              XML
            </button>
          </div>
        `;

        comprobantesList.appendChild(
          row
        );
      }
    );
  }

  function comprobantePorId(
    id
  ) {
    return comprobantes.find(
      item =>
        item.id ===
        id
    )
    ||
    null;
  }

  function descargarTexto(
    filename,
    content,
    mime
  ) {
    const blob =
      new Blob(
        [
          String(
            content ||
            ""
          )
        ],
        {
          type:
            mime
            ||
            "text/plain;charset=utf-8"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      filename;

    document.body.appendChild(
      link
    );

    link.click();
    link.remove();

    setTimeout(
      function () {
        URL.revokeObjectURL(
          url
        );
      },
      1000
    );
  }

  function abrirRideCliente(
    item
  ) {
    if (
      !item
      ||
      item.estado !==
      "AUTORIZADO"
    ) {
      showToast(
        "El RIDE estará disponible cuando el SRI autorice el comprobante."
      );
      return;
    }

    if (
      !window.SIXTEEN_RIDE
    ) {
      showToast(
        "No fue posible cargar el RIDE."
      );
      return;
    }

    const opened =
      window.SIXTEEN_RIDE.open(
        item
      );

    if (!opened) {
      showToast(
        "Permite ventanas emergentes para abrir el RIDE."
      );
    }
  }

  function descargarXmlCliente(
    item
  ) {
    if (
      !item
      ||
      item.estado !==
      "AUTORIZADO"
    ) {
      showToast(
        "El XML estará disponible cuando el SRI autorice el comprobante."
      );
      return;
    }

    const xml =
      item.xmlAutorizado
      ||
      item.xmlFirmado
      ||
      item.xmlSinFirma
      ||
      "";

    if (!xml) {
      showToast(
        "El comprobante no tiene XML disponible."
      );
      return;
    }

    const safeNumber =
      String(
        item.numero
        ||
        item.id
        ||
        "comprobante"
      )
        .replace(
          /[^0-9A-Za-z_-]+/g,
          "_"
        );

    descargarTexto(
      "SIXTEEN_"
      +
      safeNumber
      +
      ".xml",
      xml,
      "application/xml;charset=utf-8"
    );
  }

  comprobantesTipoFiltro
    ?.addEventListener(
      "change",
      renderComprobantes
    );

  comprobantesEstadoFiltro
    ?.addEventListener(
      "change",
      renderComprobantes
    );

  comprobantesList
    ?.addEventListener(
      "click",
      function (
        event
      ) {
        const rideBtn =
          event.target.closest(
            "button[data-comprobante-ride]"
          );

        if (rideBtn) {
          abrirRideCliente(
            comprobantePorId(
              rideBtn.dataset
                .comprobanteRide
            )
          );
          return;
        }

        const xmlBtn =
          event.target.closest(
            "button[data-comprobante-xml]"
          );

        if (xmlBtn) {
          descargarXmlCliente(
            comprobantePorId(
              xmlBtn.dataset
                .comprobanteXml
            )
          );
        }
      }
    );


  ordersFilter.addEventListener("change", renderOrders);

  function renderKPIs() {
    const valid = orders.filter(order => VALID_SALE_STATES.has(order.estado));
    const pending = orders.filter(order => (order.estado || "Pendiente") === "Pendiente").length;
    const total = valid.reduce((sum, order) => sum + Math.max(0, num(order.resumen?.total)), 0);

    kpiPedidos.textContent = orders.length;
    kpiCompras.textContent = valid.length;
    kpiTotal.textContent = money(total);
    kpiPendientes.textContent = pending;
  }

  function renderOrders() {
    const filter = ordersFilter.value;
    const visible = orders.filter(order => !filter || (order.estado || "Pendiente") === filter);

    if (!visible.length) {
      ordersList.innerHTML = `
        <div class="empty">
          <div>
            <strong>NO HAY PEDIDOS EN ESTA VISTA.</strong>
            <p><a href="./index.html">VOLVER A LA TIENDA</a></p>
          </div>
        </div>
      `;
      return;
    }

    ordersList.innerHTML = "";

    visible.forEach(function (order) {
      const payment = normalizePayment(order);
      const row = document.createElement("article");
      row.className = "order-item";

      row.innerHTML = `
        <div>
          <strong class="order-number">${escapeHtml(order.numero || order.id || "Pedido")}</strong>
          <small class="order-date">${escapeHtml(formatDate(order.creadoEn))}</small>
        </div>

        <div>
          <span class="label">ESTADO</span>
          <span class="status ${statusClass(order.estado)}">${escapeHtml(order.estado || "Pendiente")}</span>
        </div>

        <div>
          <span class="label">PAGO</span>
          <span class="value">${escapeHtml(paymentName(payment.metodo))}</span>
        </div>

        <div>
          <span class="label">TOTAL</span>
          <span class="value">${money(order.resumen?.total)}</span>
        </div>

        <button type="button" class="view-btn" data-order="${escapeAttr(order.id)}">VER</button>
      `;

      ordersList.appendChild(row);
    });
  }

  ordersList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-order]");
    if (!button) return;
    openOrder(button.dataset.order);
  });

  function openOrder(id) {
    const order = orders.find(item => item.id === id);
    if (!order) return;

    const payment = normalizePayment(order);
    modalOrderNumber.textContent = order.numero || order.id || "Pedido";
    modalOrderDate.textContent = formatDate(order.creadoEn);
    modalOrderStatus.textContent = order.estado || "Pendiente";
    modalOrderPayment.textContent = paymentName(payment.metodo);
    modalOrderTotal.textContent = money(order.resumen?.total);

    const products = Array.isArray(order.productos) ? order.productos : [];
    modalProducts.innerHTML = "";

    if (!products.length) {
      modalProducts.innerHTML = "<p>Sin productos registrados.</p>";
    } else {
      products.forEach(function (item) {
        const qty = Math.max(1, Math.floor(num(item.cantidad)));
        const price = Math.max(0, num(item.precioUnitario ?? item.precio));
        const row = document.createElement("div");
        row.className = "product-row";
        row.innerHTML = `
          <div>
            <strong>${escapeHtml(item.nombre || item.codigo || "Producto")}</strong>
            <small>${escapeHtml([item.codigo, item.talla, item.color].filter(Boolean).join(" · "))}</small>
          </div>
          <span>× ${qty}</span>
          <span>${money(price * qty)}</span>
        `;
        modalProducts.appendChild(row);
      });
    }

    const delivery = order.entrega || {};
    modalAddress.textContent = [
      delivery.direccion,
      delivery.referencia,
      delivery.ciudad,
      delivery.provincia
    ].filter(Boolean).join(" · ") || "Sin dirección registrada.";


    if (
      modalTrackingLink
    ) {

      modalTrackingLink.href =
        "./seguimiento.html?pedido=" +
        encodeURIComponent(
          order.id ||
          order.numero ||
          ""
        );
    }


    orderModal.classList.add("activo");
    orderModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    orderModal.classList.remove("activo");
    orderModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  closeOrderModal.addEventListener("click", closeModal);
  orderModal.addEventListener("click", event => {
    if (event.target === orderModal) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && orderModal.classList.contains("activo")) closeModal();
  });

  // ======================================================
  // NOTIFICACIONES
  // ======================================================

  notificationsCoverBtn
    ?.addEventListener(
      "click",
      function () {

        notificationsSection
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start"
          });
      }
    );


  function listenNotifications(
    uid
  ) {

    stopNotifications();


    unsubscribeNotifications =
      db
        .collection("notificaciones")
        .doc(uid)
        .collection("items")
        .onSnapshot(
          function (snapshot) {

            const items =
              [];


            snapshot.forEach(
              function (doc) {

                items.push({
                  id:
                    doc.id,
                  ...doc.data()
                });
              }
            );


            items.sort(
              function (a, b) {

                return (
                  dateMillis(
                    b.creadoEn
                  )
                  -
                  dateMillis(
                    a.creadoEn
                  )
                );
              }
            );


            notifications =
              items;


            renderNotifications();

          },
          function (error) {

            console.error(
              "Notificaciones:",
              error
            );


            notificationsList.innerHTML = `
              <div class="empty notifications-empty">

                <div class="empty-icon">
                  !
                </div>

                <strong>
                  NO FUE POSIBLE CARGAR LAS NOTIFICACIONES.
                  REVISA LAS REGLAS DE FIRESTORE DEL PASO 9.
                </strong>

              </div>
            `;
          }
        );
  }


  function stopNotifications() {

    if (
      unsubscribeNotifications
    ) {

      unsubscribeNotifications();

      unsubscribeNotifications =
        null;
    }
  }


  function renderNotifications() {

    const unread =
      notifications.filter(
        function (item) {

          return item.leida !== true;
        }
      ).length;


    notificationsUnreadLabel.textContent =
      unread +
      (
        unread === 1
          ? " SIN LEER"
          : " SIN LEER"
      );


    notificationsBadge.textContent =
      unread;


    notificationsBadge.hidden =
      unread === 0;


    markAllNotificationsBtn.disabled =
      unread === 0;


    if (
      !notifications.length
    ) {

      notificationsList.innerHTML = `
        <div class="empty notifications-empty">

          <div class="empty-icon">
            ◌
          </div>

          <strong>
            TODAVÍA NO TIENES NOTIFICACIONES.
          </strong>

        </div>
      `;

      return;
    }


    notificationsList.innerHTML =
      "";


    notifications.forEach(
      function (item) {

        const row =
          document.createElement(
            "article"
          );


        const noLeida =
          item.leida !==
          true;


        row.className =
          "notification-item" +
          (
            noLeida
              ? " no-leida"
              : ""
          );


        const icono =
          iconoNotificacion(
            item.tipo,
            item.estado
          );


        row.innerHTML = `
          <div class="notification-icon">
            ${escapeHtml(
              icono
            )}
          </div>


          <div class="notification-content">

            <div class="notification-title-row">

              <h4>
                ${escapeHtml(
                  item.titulo ||
                  "Actualización SIXTEEN"
                )}
              </h4>

              ${
                noLeida
                  ? `
                    <span class="notification-new">
                      NUEVO
                    </span>
                  `
                  : ""
              }

            </div>


            <p>
              ${escapeHtml(
                item.mensaje ||
                ""
              )}
            </p>


            <small>
              ${
                escapeHtml(
                  item.pedidoNumero ||
                  ""
                )
              }
              ${
                item.pedidoNumero
                  ? " · "
                  : ""
              }
              ${escapeHtml(
                formatDate(
                  item.creadoEn
                )
              )}
            </small>

          </div>


          <div class="notification-actions">

            ${
              item.pedidoId
                ? `
                  <button
                    type="button"
                    class="notification-view-btn"
                    data-notification-order="${escapeAttr(
                      item.pedidoId
                    )}"
                  >
                    VER PEDIDO
                  </button>
                `
                : ""
            }

            ${
              noLeida
                ? `
                  <button
                    type="button"
                    class="notification-read-btn"
                    data-notification-read="${escapeAttr(
                      item.id
                    )}"
                  >
                    MARCAR LEÍDO
                  </button>
                `
                : ""
            }

          </div>
        `;


        notificationsList.appendChild(
          row
        );
      }
    );
  }


  notificationsList
    ?.addEventListener(
      "click",
      async function (event) {

        const readButton =
          event.target.closest(
            "button[data-notification-read]"
          );


        if (
          readButton
        ) {

          await markNotificationRead(
            readButton.dataset
              .notificationRead,
            readButton
          );

          return;
        }


        const orderButton =
          event.target.closest(
            "button[data-notification-order]"
          );


        if (
          orderButton
        ) {

          const orderId =
            orderButton.dataset
              .notificationOrder;


          const notification =
            notifications.find(
              function (item) {

                return (
                  item.pedidoId ===
                  orderId &&
                  item.leida !==
                  true
                );
              }
            );


          if (
            notification
          ) {

            markNotificationRead(
              notification.id
            );
          }


          openOrder(
            orderId
          );
        }
      }
    );


  async function markNotificationRead(
    notificationId,
    button = null
  ) {

    if (
      !currentUser ||
      currentUser.isAnonymous ||
      !notificationId
    ) {
      return;
    }


    if (button) {
      button.disabled =
        true;
    }


    try {

      await db
        .collection("notificaciones")
        .doc(
          currentUser.uid
        )
        .collection("items")
        .doc(
          notificationId
        )
        .update({
          leida:
            true,

          leidaEn:
            FieldValue
              .serverTimestamp()
        });

    } catch (error) {

      console.error(
        "Marcar notificación:",
        error
      );


      if (button) {
        button.disabled =
          false;
      }


      showToast(
        "No fue posible actualizar la notificación."
      );
    }
  }


  markAllNotificationsBtn
    ?.addEventListener(
      "click",
      async function () {

        if (
          !currentUser ||
          currentUser.isAnonymous
        ) {
          return;
        }


        const unread =
          notifications.filter(
            function (item) {

              return item.leida !==
                true;
            }
          );


        if (!unread.length) {
          return;
        }


        markAllNotificationsBtn.disabled =
          true;


        markAllNotificationsBtn.textContent =
          "ACTUALIZANDO...";


        try {

          const batch =
            db.batch();


          unread.forEach(
            function (item) {

              const ref =
                db
                  .collection("notificaciones")
                  .doc(
                    currentUser.uid
                  )
                  .collection("items")
                  .doc(
                    item.id
                  );


              batch.update(
                ref,
                {
                  leida:
                    true,

                  leidaEn:
                    FieldValue
                      .serverTimestamp()
                }
              );
            }
          );


          await batch.commit();


          showToast(
            "Notificaciones marcadas como leídas."
          );

        } catch (error) {

          console.error(
            "Marcar todas:",
            error
          );


          showToast(
            "No fue posible actualizar las notificaciones."
          );

        } finally {

          markAllNotificationsBtn.textContent =
            "MARCAR TODO LEÍDO";
        }
      }
    );


  function iconoNotificacion(
    tipo,
    estado
  ) {

    if (
      tipo ===
      "pedido_creado"
    ) {
      return "✓";
    }


    const mapa = {

      "Confirmado":
        "✓",

      "En preparación":
        "◐",

      "Enviado":
        "→",

      "Entregado":
        "◆",

      "Cancelado":
        "×"
    };


    return (
      mapa[
        estado
      ] ||
      "S"
    );
  }


  // ======================================================
  // FAVORITOS
  // ======================================================

  function listenFavorites(uid) {

    stopFavorites();


    unsubscribeFavorites =
      db
        .collection("favoritos")
        .doc(uid)
        .collection("items")
        .onSnapshot(
          function (snapshot) {

            const items =
              [];


            snapshot.forEach(
              function (doc) {

                items.push({
                  id:
                    doc.id,
                  ...doc.data()
                });
              }
            );


            items.sort(
              function (a, b) {

                return (
                  dateMillis(
                    b.agregadoEn
                  ) -
                  dateMillis(
                    a.agregadoEn
                  )
                );
              }
            );


            favorites =
              items;


            renderFavorites();

          },
          function (error) {

            console.error(
              "Favoritos cuenta:",
              error
            );


            favoritesList.innerHTML = `
              <div class="empty favorites-empty">
                <div class="empty-icon">
                  !
                </div>
                <strong>
                  NO FUE POSIBLE CARGAR TUS FAVORITOS.
                  REVISA LAS REGLAS DE FIRESTORE DEL PASO 7.
                </strong>
              </div>
            `;
          }
        );
  }


  function stopFavorites() {

    if (
      unsubscribeFavorites
    ) {

      unsubscribeFavorites();

      unsubscribeFavorites =
        null;
    }
  }


  function renderFavorites() {

    const total =
      favorites.length;


    favoritesCount.textContent =
      total +
      (
        total === 1
          ? " FAVORITO"
          : " FAVORITOS"
      );


    if (!total) {

      favoritesList.innerHTML = `
        <div class="empty favorites-empty">
          <div class="empty-icon">
            ♡
          </div>

          <strong>
            TODAVÍA NO HAS GUARDADO PRODUCTOS.
          </strong>

          <p>
            <a href="./index.html#productos">
              EXPLORAR PRODUCTOS
            </a>
          </p>
        </div>
      `;

      return;
    }


    favoritesList.innerHTML =
      "";


    favorites.forEach(
      function (item) {

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "favorite-product-card";


        const imagen =
          item.imagen

            ? `
              <img
                src="${escapeAttr(
                  item.imagen
                )}"
                alt="${escapeAttr(
                  item.nombre ||
                  item.codigo ||
                  "Producto SIXTEEN"
                )}"
                loading="lazy"
                onerror="
                  this.style.display='none';
                  this.nextElementSibling.style.display='grid';
                "
              >

              <div
                class="favorite-image-fallback"
                style="display:none;"
              >
                XVI
              </div>
            `

            : `
              <div class="favorite-image-fallback">
                XVI
              </div>
            `;


        card.innerHTML = `
          <div class="favorite-product-image">

            ${imagen}

            <button
              type="button"
              class="favorite-remove-btn"
              data-remove-favorite="${escapeAttr(
                item.id ||
                item.codigo ||
                ""
              )}"
              aria-label="Eliminar de favoritos"
            >
              ♥
            </button>

          </div>


          <div class="favorite-product-content">

            <p>
              ${escapeHtml(
                String(
                  item.categoria ||
                  "SIXTEEN"
                ).toUpperCase()
              )}
            </p>

            <h4>
              ${escapeHtml(
                item.nombre ||
                item.codigo ||
                "Producto SIXTEEN"
              )}
            </h4>


            <div class="favorite-product-meta">

              <span>
                ${escapeHtml(
                  item.color ||
                  "SIXTEEN Collection"
                )}
              </span>

              <strong>
                ${money(
                  item.precio
                )}
              </strong>

            </div>


            <a
              href="./producto.html?id=${encodeURIComponent(
                item.codigo ||
                item.id ||
                ""
              )}"
              class="favorite-view-link"
            >
              VER PRODUCTO
            </a>

          </div>
        `;


        favoritesList.appendChild(
          card
        );
      }
    );
  }


  favoritesList.addEventListener(
    "click",
    async function (event) {

      const button =
        event.target.closest(
          "button[data-remove-favorite]"
        );


      if (
        !button ||
        !currentUser ||
        currentUser.isAnonymous
      ) {
        return;
      }


      const codigo =
        String(
          button.dataset
            .removeFavorite ||
          ""
        )
          .trim()
          .toUpperCase();


      if (!codigo) {
        return;
      }


      button.disabled =
        true;


      try {

        await db
          .collection("favoritos")
          .doc(
            currentUser.uid
          )
          .collection("items")
          .doc(
            codigo
          )
          .delete();


        showToast(
          "Producto eliminado de favoritos."
        );

      } catch (error) {

        console.error(
          "Eliminar favorito:",
          error
        );


        button.disabled =
          false;


        showToast(
          "No fue posible eliminar el favorito."
        );
      }
    }
  );


  logoutBtn.addEventListener("click", logout);
  logoutHeaderBtn.addEventListener("click", logout);

  async function logout() {
    try {
      stopOrders();
      stopFavorites();
      stopNotifications();
      await auth.signOut();
      showToast("Sesión cerrada.");
    } catch (error) {
      console.error(error);
    }
  }

  function setMessage(element, text, ok = false) {
    element.textContent = text || "";
    element.className = "message";
    if (text && ok) element.classList.add("ok");
  }

  function authError(error) {
    const map = {
      "auth/invalid-email": "El correo ingresado no es válido.",
      "auth/user-not-found": "No existe una cuenta con ese correo.",
      "auth/wrong-password": "La contraseña no es correcta.",
      "auth/invalid-credential": "Correo o contraseña incorrectos.",
      "auth/email-already-in-use": "Ese correo ya está registrado. Inicia sesión.",
      "auth/weak-password": "La contraseña es demasiado débil.",
      "auth/operation-not-allowed": "Debes habilitar Email/Password en Firebase Authentication.",
      "auth/too-many-requests": "Demasiados intentos. Intenta nuevamente más tarde.",
      "auth/network-request-failed": "No fue posible conectar con Firebase.",
      "auth/credential-already-in-use": "Ese correo ya pertenece a otra cuenta. Inicia sesión."
    };
    return map[error?.code] || error?.message || "No fue posible completar la operación.";
  }

  function showToast(text) {
    clearTimeout(toastTimer);
    toast.textContent = text;
    toast.classList.add("activo");
    toastTimer = setTimeout(() => toast.classList.remove("activo"), 2800);
  }

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function splitName(value) {
    const parts = clean(value).split(/\s+/).filter(Boolean);
    if (!parts.length) return { nombres: "", apellidos: "" };
    if (parts.length === 1) return { nombres: parts[0], apellidos: "" };
    return {
      nombres: parts.slice(0, -1).join(" "),
      apellidos: parts[parts.length - 1]
    };
  }

  function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function money(value) {
    return "$" + num(value).toFixed(2);
  }

  function dateMillis(value) {
    if (value && typeof value.toMillis === "function") return value.toMillis();
    if (value && typeof value.toDate === "function") return value.toDate().getTime();
    const date = new Date(value || 0);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  function formatDate(value) {
    let date = null;
    if (value && typeof value.toDate === "function") date = value.toDate();
    else if (value) date = new Date(value);
    if (!date || Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("es-EC", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function normalizePayment(order) {
    const payment = order?.pago || {};
    return {
      metodo: payment.metodo || order.metodoPago || "",
      estado: payment.estado || order.estadoPago || ""
    };
  }

  function paymentName(method) {
    return ({
      transferencia: "Transferencia",
      qr: "Pago QR",
      tarjeta: "Tarjeta",
      efectivo: "Contra entrega"
    })[method] || method || "No especificado";
  }

  function statusClass(status) {
    return String(status || "Pendiente")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

});
