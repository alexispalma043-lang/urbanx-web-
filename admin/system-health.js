// @ts-nocheck
(function () {
  "use strict";

  const ADMIN_APP_NAME =
    "sixteen-admin";

  const BACKUP_META_KEY =
    "sixteen_backup_last_meta_v2";

  const statuses =
    {};

  const $ = id =>
    document.getElementById(id);

  const refs = {
    overall:
      $("systemOverallStatus"),
    refresh:
      $("systemRefreshBtn"),
    copy:
      $("systemCopyBtn"),
    lastCheck:
      $("systemLastCheck"),
    project:
      $("systemProjectLabel")
  };

  const items = {
    network: {
      status:
        $("systemNetworkStatus"),
      detail:
        $("systemNetworkDetail")
    },
    auth: {
      status:
        $("systemAuthStatus"),
      detail:
        $("systemAuthDetail")
    },
    firestore: {
      status:
        $("systemFirestoreStatus"),
      detail:
        $("systemFirestoreDetail")
    },
    cloudinary: {
      status:
        $("systemCloudinaryStatus"),
      detail:
        $("systemCloudinaryDetail")
    },
    email: {
      status:
        $("systemEmailStatus"),
      detail:
        $("systemEmailDetail")
    },
    pwa: {
      status:
        $("systemPwaStatus"),
      detail:
        $("systemPwaDetail")
    },
    experience3d: {
      status:
        $("system3dStatus"),
      detail:
        $("system3dDetail")
    },
    store: {
      status:
        $("systemStoreStatus"),
      detail:
        $("systemStoreDetail")
    },
    backup: {
      status:
        $("systemBackupStatus"),
      detail:
        $("systemBackupDetail")
    }
  };

  if (!refs.overall) {
    return;
  }

  function card(name) {
    return document.querySelector(
      `[data-system-item="${name}"]`
    );
  }

  function setResult(
    name,
    state,
    label,
    detail
  ) {
    const ref =
      items[name];

    if (!ref) {
      return;
    }

    statuses[name] = {
      state,
      label,
      detail
    };

    if (ref.status) {
      ref.status.textContent =
        label;
    }

    if (ref.detail) {
      ref.detail.textContent =
        detail;
    }

    const node =
      card(name);

    if (node) {
      node.classList.remove(
        "ok",
        "warning",
        "error"
      );

      if (
        state === "ok" ||
        state === "warning" ||
        state === "error"
      ) {
        node.classList.add(
          state
        );
      }
    }
  }

  function adminApp() {
    if (
      typeof firebase ===
      "undefined"
    ) {
      return null;
    }

    return (
      firebase.apps.find(
        app =>
          app.name ===
          ADMIN_APP_NAME
      ) ||
      null
    );
  }

  function publicRuntime() {
    return (
      window
        .SIXTEEN_ADMIN_RUNTIME ||
      {}
    );
  }

  function updateOverall() {
    const critical =
      [
        statuses.network,
        statuses.auth,
        statuses.firestore
      ];

    const hasCriticalError =
      critical.some(
        item =>
          item?.state ===
          "error"
      );

    const hasWarning =
      Object.values(statuses)
        .some(
          item =>
            item?.state ===
            "warning"
        );

    if (
      navigator.onLine === false
    ) {
      refs.overall.textContent =
        "OFFLINE";
      refs.overall.classList.add(
        "error"
      );
      return;
    }

    refs.overall.classList.remove(
      "error"
    );

    if (hasCriticalError) {
      refs.overall.textContent =
        "REVISAR";
      refs.overall.classList.add(
        "error"
      );
      return;
    }

    if (hasWarning) {
      refs.overall.textContent =
        "OPERATIVO · AVISOS";
      return;
    }

    refs.overall.textContent =
      "OPERATIVO";
  }

  function checkNetwork() {
    if (navigator.onLine) {
      setResult(
        "network",
        "ok",
        "ONLINE",
        "El navegador informa conexión disponible."
      );
    } else {
      setResult(
        "network",
        "error",
        "OFFLINE",
        "Sin conexión de red detectada."
      );
    }
  }

  async function checkAuthAndFirestore() {
    const app =
      adminApp();

    if (!app) {
      setResult(
        "auth",
        "error",
        "NO DISPONIBLE",
        "La aplicación Firebase administrativa no está inicializada."
      );

      setResult(
        "firestore",
        "error",
        "NO DISPONIBLE",
        "No se puede comprobar Firestore sin la app administrativa."
      );

      return;
    }

    const auth =
      firebase.auth(app);

    const user =
      auth.currentUser;

    if (
      !user ||
      user.isAnonymous
    ) {
      setResult(
        "auth",
        "error",
        "SIN SESIÓN",
        "No existe una sesión administrativa válida."
      );

      setResult(
        "firestore",
        "error",
        "SIN COMPROBAR",
        "Se necesita una sesión administrativa."
      );

      return;
    }

    setResult(
      "auth",
      "ok",
      "AUTENTICADO",
      user.email ||
      "Administrador SIXTEEN"
    );

    try {
      const db =
        firebase.firestore(app);

      await db
        .collection(
          "configuracion_sri"
        )
        .doc(
          "admin_access_check"
        )
        .get({
          source:
            "server"
        });

      setResult(
        "firestore",
        "ok",
        "OPERATIVO",
        "Lectura administrativa verificada directamente en Firestore."
      );
    } catch (error) {
      const code =
        String(
          error?.code ||
          ""
        );

      setResult(
        "firestore",
        "error",
        "REVISAR",
        code.includes(
          "permission-denied"
        )
          ? "Firestore rechazó el permiso administrativo."
          : "No fue posible completar una lectura directa del servidor."
      );
    }
  }

  function checkCloudinary() {
    const runtime =
      publicRuntime();

    const cloud =
      String(
        runtime.cloudinaryCloudName ||
        ""
      ).trim();

    const preset =
      String(
        runtime.cloudinaryUploadPreset ||
        ""
      ).trim();

    if (
      cloud &&
      preset
    ) {
      setResult(
        "cloudinary",
        "ok",
        "CONFIGURADO",
        "Cloud name y upload preset disponibles. No se realiza una carga de prueba."
      );
    } else {
      setResult(
        "cloudinary",
        "error",
        "INCOMPLETO",
        "Falta la configuración necesaria para subir imágenes."
      );
    }
  }

  function checkEmail() {
    const config =
      window
        .SIXTEEN_EMAILJS_CONFIG ||
      {};

    const ready =
      config.enabled === true &&
      String(
        config.publicKey ||
        ""
      ).trim() &&
      String(
        config.serviceId ||
        ""
      ).trim() &&
      String(
        config.templateId ||
        ""
      ).trim();

    if (
      ready &&
      typeof window.emailjs !==
        "undefined"
    ) {
      setResult(
        "email",
        "ok",
        "CONFIGURADO",
        "EmailJS y su SDK están cargados. No se envía un correo de prueba automáticamente."
      );
    } else if (ready) {
      setResult(
        "email",
        "warning",
        "SDK NO CARGADO",
        "La configuración existe, pero EmailJS Browser SDK no está disponible."
      );
    } else {
      setResult(
        "email",
        "warning",
        "NO CONFIGURADO",
        "Los pedidos continúan funcionando, pero no se enviarán correos automáticos."
      );
    }
  }

  async function checkPwa() {
    if (
      !(
        "serviceWorker" in
        navigator
      )
    ) {
      setResult(
        "pwa",
        "warning",
        "NO SOPORTADO",
        "Este navegador no ofrece Service Worker."
      );
      return;
    }

    try {
      const registration =
        await navigator
          .serviceWorker
          .getRegistration();

      if (registration) {
        setResult(
          "pwa",
          "ok",
          "ACTIVA",
          "Service Worker registrado. El panel Admin se mantiene fuera de la caché."
        );
      } else {
        setResult(
          "pwa",
          "warning",
          "SIN REGISTRO",
          "La tienda puede funcionar, pero no se detectó un Service Worker activo en esta página."
        );
      }
    } catch (_) {
      setResult(
        "pwa",
        "warning",
        "SIN COMPROBAR",
        "El navegador no permitió consultar el registro PWA."
      );
    }
  }

  async function check3d() {
    try {
      const url =
        new URL(
          "../../urbanx-3d/index.html",
          window.location.href
        );

      const response =
        await fetch(
          url.href,
          {
            method:
              "GET",
            cache:
              "no-store",
            credentials:
              "omit"
          }
        );

      if (response.ok) {
        setResult(
          "experience3d",
          "ok",
          "DISPONIBLE",
          "El módulo separado SIXTEEN Experience 3D respondió correctamente."
        );
      } else {
        setResult(
          "experience3d",
          "warning",
          "NO DISPONIBLE",
          `El módulo respondió HTTP ${response.status}.`
        );
      }
    } catch (_) {
      setResult(
        "experience3d",
        "warning",
        "SIN COMPROBAR",
        "No fue posible verificar el módulo separado desde esta sesión."
      );
    }
  }

  function checkStore() {
    const config =
      window
        .SIXTEEN_STORE_CONFIG ||
      {};

    const supportReady =
      String(
        config.supportEmail ||
        ""
      ).trim();

    const brandReady =
      String(
        config.commercialName ||
        config.brand ||
        ""
      ).trim();

    const legalFields =
      [
        config.legalName,
        config.ruc,
        config.city,
        config.address
      ];

    const legalReady =
      legalFields.every(
        value =>
          String(
            value ||
            ""
          ).trim()
      );

    if (
      !supportReady ||
      !brandReady
    ) {
      setResult(
        "store",
        "error",
        "INCOMPLETA",
        "Falta información comercial básica o correo de soporte."
      );
      return;
    }

    if (!legalReady) {
      setResult(
        "store",
        "warning",
        "OPERATIVA · LEGAL PENDIENTE",
        "Marca y soporte configurados. Los datos legales oficiales siguen pendientes."
      );
      return;
    }

    setResult(
      "store",
      "ok",
      "COMPLETA",
      "Configuración comercial y datos legales disponibles."
    );
  }

  function checkBackup() {
    try {
      const raw =
        localStorage.getItem(
          BACKUP_META_KEY
        );

      if (!raw) {
        setResult(
          "backup",
          "warning",
          "SIN REGISTRO",
          "Este navegador todavía no registra un respaldo maestro descargado."
        );
        return;
      }

      const meta =
        JSON.parse(raw);

      if (!meta?.generatedAt) {
        throw new Error(
          "Metadata incompleta"
        );
      }

      const date =
        new Date(
          meta.generatedAt
        );

      const ageMs =
        Date.now() -
        date.getTime();

      const days =
        Math.max(
          0,
          Math.floor(
            ageMs /
            86400000
          )
        );

      setResult(
        "backup",
        days <= 7
          ? "ok"
          : "warning",
        days <= 7
          ? "RECIENTE"
          : "ACTUALIZAR",
        `Último respaldo registrado aquí: ${date.toLocaleString("es-EC")} · ${days} día(s).`
      );
    } catch (_) {
      setResult(
        "backup",
        "warning",
        "SIN COMPROBAR",
        "No fue posible leer la metadata local del último respaldo."
      );
    }
  }

  function setProject() {
    if (!refs.project) {
      return;
    }

    refs.project.textContent =
      String(
        publicRuntime()
          .firebaseProject ||
        "No disponible"
      );
  }

  async function run() {
    if (refs.refresh) {
      refs.refresh.disabled =
        true;
      refs.refresh.textContent =
        "REVISANDO...";
    }

    refs.overall.textContent =
      "REVISANDO";
    refs.overall.classList.remove(
      "error"
    );

    checkNetwork();
    checkCloudinary();
    checkEmail();
    checkStore();
    checkBackup();
    setProject();

    await Promise.all([
      checkAuthAndFirestore(),
      checkPwa(),
      check3d()
    ]);

    if (refs.lastCheck) {
      refs.lastCheck.textContent =
        new Date()
          .toLocaleString(
            "es-EC"
          );
    }

    updateOverall();

    if (refs.refresh) {
      refs.refresh.disabled =
        false;
      refs.refresh.textContent =
        "REVISAR SISTEMA";
    }
  }

  function diagnosticText() {
    const lines = [
      "SIXTEEN · DIAGNÓSTICO DEL SISTEMA",
      `Fecha: ${
        refs.lastCheck?.textContent ||
        "-"
      }`,
      `Estado general: ${
        refs.overall?.textContent ||
        "-"
      }`,
      `Proyecto Firebase: ${
        refs.project?.textContent ||
        "-"
      }`,
      ""
    ];

    Object.entries(statuses)
      .forEach(
        ([name, item]) => {
          lines.push(
            `${name.toUpperCase()}: ${item.label} · ${item.detail}`
          );
        }
      );

    lines.push(
      "",
      "El diagnóstico no incluye contraseñas, tokens privados ni claves secretas."
    );

    return lines.join("\n");
  }

  refs.refresh?.addEventListener(
    "click",
    run
  );

  refs.copy?.addEventListener(
    "click",
    async () => {
      try {
        await navigator
          .clipboard
          .writeText(
            diagnosticText()
          );

        refs.copy.textContent =
          "COPIADO";

        setTimeout(
          () => {
            refs.copy.textContent =
              "COPIAR DIAGNÓSTICO";
          },
          1600
        );
      } catch (_) {
        window.prompt(
          "Copia el diagnóstico:",
          diagnosticText()
        );
      }
    }
  );

  window.addEventListener(
    "online",
    run
  );

  window.addEventListener(
    "offline",
    run
  );

  function waitForAdminApp(
    attempt = 0
  ) {
    if (
      adminApp() ||
      attempt >= 20
    ) {
      run();
      return;
    }

    setTimeout(
      () =>
        waitForAdminApp(
          attempt + 1
        ),
      250
    );
  }

  waitForAdminApp();
})();
