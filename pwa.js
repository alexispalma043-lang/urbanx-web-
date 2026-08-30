// @ts-nocheck
(function () {
  "use strict";

  let promptEvent = null;
  let timer = null;

  function status(message, persistent = false) {
    let notice =
      document.getElementById(
        "sixteenPwaStatus"
      );

    if (!notice) {
      notice =
        document.createElement(
          "div"
        );

      notice.id =
        "sixteenPwaStatus";

      notice.className =
        "pwa-status-toast";

      notice.setAttribute(
        "aria-live",
        "polite"
      );

      document.body
        .appendChild(
          notice
        );
    }

    clearTimeout(timer);

    notice.textContent =
      message;

    notice.classList.add(
      "activo"
    );

    if (!persistent) {
      timer =
        setTimeout(
          () =>
            notice.classList
              .remove(
                "activo"
              ),
          3000
        );
    }
  }

  function showInstall() {
    if (
      document.getElementById(
        "sixteenInstallBtn"
      )
    ) {
      return;
    }

    const actions =
      document.querySelector(
        ".header-actions"
      );

    if (!actions) {
      return;
    }

    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.id =
      "sixteenInstallBtn";

    button.className =
      "pwa-install-btn";

    button.setAttribute(
      "aria-label",
      "Instalar SIXTEEN como aplicación"
    );

    const icon =
      document.createElement(
        "span"
      );

    icon.setAttribute(
      "aria-hidden",
      "true"
    );

    icon.textContent =
      "↓";

    const label =
      document.createElement(
        "span"
      );

    label.className =
      "pwa-install-label";

    label.textContent =
      "APP";

    button.append(
      icon,
      label
    );

    button.addEventListener(
      "click",
      async () => {
        if (!promptEvent) {
          return;
        }

        promptEvent.prompt();

        await promptEvent
          .userChoice;

        promptEvent = null;
        button.remove();
      }
    );

    actions.insertBefore(
      button,
      actions.firstChild
    );
  }

  async function registerServiceWorker() {
    if (
      !(
        "serviceWorker" in
        navigator
      )
    ) {
      return;
    }

    try {
      const registration =
        await navigator
          .serviceWorker
          .register(
            "./sw.js",
            {
              scope: "./"
            }
          );

      // GitHub Pages puede mantener una pestaña abierta durante horas.
      // La comprobación manual reduce el tiempo hasta detectar una versión nueva.
      registration
        .update()
        .catch(() => {});

      registration
        .addEventListener(
          "updatefound",
          () => {
            const worker =
              registration
                .installing;

            if (!worker) {
              return;
            }

            worker.addEventListener(
              "statechange",
              () => {
                if (
                  worker.state ===
                    "installed" &&
                  navigator
                    .serviceWorker
                    .controller
                ) {
                  status(
                    "Nueva versión de SIXTEEN disponible · recarga para actualizar.",
                    true
                  );
                }
              }
            );
          }
        );
    } catch (error) {
      console.warn(
        "SIXTEEN PWA:",
        error
      );
    }
  }

  window.addEventListener(
    "load",
    registerServiceWorker
  );

  window.addEventListener(
    "beforeinstallprompt",
    event => {
      event.preventDefault();
      promptEvent = event;
      showInstall();
    }
  );

  window.addEventListener(
    "appinstalled",
    () => {
      promptEvent = null;

      document
        .getElementById(
          "sixteenInstallBtn"
        )
        ?.remove();

      status(
        "SIXTEEN se instaló correctamente."
      );
    }
  );

  window.addEventListener(
    "offline",
    () =>
      status(
        "Sin conexión · usando contenido disponible."
      )
  );

  window.addEventListener(
    "online",
    () =>
      status(
        "Conexión restablecida."
      )
  );
})();
