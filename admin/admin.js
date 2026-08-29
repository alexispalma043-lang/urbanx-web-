// ==========================================
// SIXTEEN ADMIN
// FIREBASE AUTHENTICATION
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {
// ======================================
    // CONFIGURACIÓN FIREBASE
    // ======================================

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


    // ======================================
    // COMPROBAR FIREBASE SDK
    // ======================================

    if (
      typeof firebase ===
      "undefined"
    ) {

      alert(
        "ERROR: Firebase SDK no se cargó."
      );

      return;

    }


    // ======================================
    // INICIAR FIREBASE · SESIÓN ADMIN AISLADA
    // ======================================
    //
    // El sitio público y el panel administrativo usan el
    // mismo proyecto Firebase, pero NO comparten la misma
    // sesión de Auth en el navegador.
    //
    // Esto evita que una sesión iniciada como cliente sea
    // tomada accidentalmente por el panel de administración.
    // ======================================

    const ADMIN_APP_NAME =
      "sixteen-admin";


    let adminApp =
      firebase.apps.find(
        function (app) {

          return app.name ===
            ADMIN_APP_NAME;
        }
      );


    if (!adminApp) {

      adminApp =
        firebase.initializeApp(
          firebaseConfig,
          ADMIN_APP_NAME
        );
    }


    const auth =
      firebase.auth(
        adminApp
      );


    auth.useDeviceLanguage();
// ======================================
    // ELEMENTOS
    // ======================================

    const formulario =
      document.getElementById(
        "adminLoginForm"
      );

    const correo =
      document.getElementById(
        "adminUsuario"
      );

    const password =
      document.getElementById(
        "adminPassword"
      );

    const boton =
      document.getElementById(
        "adminLoginBtn"
      );

    const mensaje =
      document.getElementById(
        "adminLoginMensaje"
      );

    const verPassword =
      document.getElementById(
        "mostrarPasswordBtn"
      );

    const recordar =
      document.getElementById(
        "recordarSesion"
      );

    const recuperarPasswordBtn =
      document.getElementById(
        "recuperarPasswordBtn"
      );


    // ======================================
    // COMPROBAR FORMULARIO
    // ======================================

    if (
      !formulario ||
      !correo ||
      !password ||
      !boton ||
      !mensaje
    ) {

      alert(
        "ERROR: faltan elementos en login.html."
      );

      return;

    }


    // ======================================
    // MENSAJE
    // ======================================

    function mostrarMensaje(
      texto,
      correcto = false
    ) {

      mensaje.textContent =
        texto || "";


      mensaje.classList.remove(
        "ok"
      );


      if (correcto) {

        mensaje.classList.add(
          "ok"
        );

      }

    }


    // ======================================
    // MOSTRAR / OCULTAR CONTRASEÑA
    // ======================================

    if (verPassword) {

      verPassword.addEventListener(
        "click",
        function () {

          if (
            password.type ===
            "password"
          ) {

            password.type =
              "text";

            verPassword.textContent =
              "OCULTAR";

          } else {

            password.type =
              "password";

            verPassword.textContent =
              "VER";

          }

        }
      );

    }


    // ======================================
    // LOGIN
    // ======================================

    formulario.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();


        const email =
          correo.value
            .trim()
            .toLowerCase();


        const clave =
          password.value;


        if (!email) {

          mostrarMensaje(
            "Ingresa tu correo electrónico."
          );

          correo.focus();

          return;

        }


        if (!clave) {

          mostrarMensaje(
            "Ingresa tu contraseña."
          );

          password.focus();

          return;

        }


        // ==================================
        // PROCESANDO
        // ==================================

        mostrarMensaje(
          "Conectando con Firebase..."
        );


        boton.disabled =
          true;


        boton.innerHTML = `
          VERIFICANDO...
          <span>•••</span>
        `;


        try {

          // =================================
          // PERSISTENCIA
          // =================================

          const persistencia =
            recordar &&
            recordar.checked

              ? firebase.auth
                  .Auth
                  .Persistence
                  .LOCAL

              : firebase.auth
                  .Auth
                  .Persistence
                  .SESSION;


          await auth.setPersistence(
            persistencia
          );


          // =================================
          // AUTENTICACIÓN
          // =================================

          const resultado =
            await auth
              .signInWithEmailAndPassword(
                email,
                clave
              );


          if (
            !resultado ||
            !resultado.user
          ) {

            throw new Error(
              "No se pudo crear la sesión."
            );

          }


          // =================================
          // LOGIN CORRECTO
          // =================================

          mostrarMensaje(
            "Acceso correcto. Abriendo panel...",
            true
          );


          setTimeout(
            function () {

              window.location.href =
                "dashboard.html";

            },

            700
          );


        } catch (error) {

          console.error(
            "Firebase Login:",
            error
          );


          mostrarMensaje(
            obtenerMensajeFirebase(
              error
            )
          );


          restaurarBoton();

        }

      }
    );


    // ======================================
    // RECUPERAR CONTRASEÑA
    // ======================================

    if (
      recuperarPasswordBtn
    ) {

      recuperarPasswordBtn.addEventListener(
        "click",
        async function () {

          mostrarMensaje("");


          const email =
            correo.value
              .trim()
              .toLowerCase();


          if (!email) {

            mostrarMensaje(
              "Primero escribe tu correo electrónico."
            );

            correo.focus();

            return;

          }


          recuperarPasswordBtn.disabled =
            true;


          recuperarPasswordBtn.textContent =
            "ENVIANDO...";


          try {

            await auth
              .sendPasswordResetEmail(
                email
              );


            mostrarMensaje(
              "Correo de recuperación enviado. Revisa tu bandeja de entrada y spam.",
              true
            );


          } catch (error) {

            console.error(
              "Firebase Recovery:",
              error
            );


            mostrarMensaje(
              obtenerMensajeFirebase(
                error
              )
            );


          } finally {

            recuperarPasswordBtn.disabled =
              false;


            recuperarPasswordBtn.textContent =
              "¿OLVIDASTE TU CONTRASEÑA?";

          }

        }
      );

    }


    // ======================================
    // MENSAJES FIREBASE
    // ======================================

    function obtenerMensajeFirebase(
      error
    ) {

      const codigo =
        error &&
        error.code
          ? error.code
          : "";


      switch (codigo) {

        case "auth/invalid-credential":

          return "Correo o contraseña incorrectos.";


        case "auth/wrong-password":

          return "Correo o contraseña incorrectos.";


        case "auth/user-not-found":

          return "Correo o contraseña incorrectos.";


        case "auth/invalid-email":

          return "El correo electrónico no es válido.";


        case "auth/user-disabled":

          return "Esta cuenta está deshabilitada.";


        case "auth/too-many-requests":

          return "Demasiados intentos. Espera unos minutos.";


        case "auth/network-request-failed":

          return "No fue posible conectar con Firebase.";


        case "auth/operation-not-allowed":

          return "El acceso por correo y contraseña no está habilitado.";


        case "auth/unauthorized-domain":

          return "Este dominio no está autorizado en Firebase.";


        default:

          return (
            error.message ||
            "No se pudo iniciar sesión."
          );

      }

    }


    // ======================================
    // RESTAURAR BOTÓN
    // ======================================

    function restaurarBoton() {

      boton.disabled =
        false;


      boton.innerHTML = `
        INGRESAR AL PANEL
        <span>→</span>
      `;

    }

  }
);