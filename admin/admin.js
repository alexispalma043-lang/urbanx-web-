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


    const db =
      firebase.firestore(
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

            verPassword.setAttribute(
              "aria-pressed",
              "true"
            );

            verPassword.setAttribute(
              "aria-label",
              "Ocultar contraseña"
            );

          } else {

            password.type =
              "password";

            verPassword.textContent =
              "VER";

            verPassword.setAttribute(
              "aria-pressed",
              "false"
            );

            verPassword.setAttribute(
              "aria-label",
              "Mostrar contraseña"
            );

          }

        }
      );

    }


    // ======================================
    // VERIFICAR PERMISO ADMINISTRATIVO
    // ======================================
    // La autorización real sigue estando en las reglas de
    // Firestore. Esta lectura no depende de un UID duplicado
    // en el frontend: si la cuenta no es administradora,
    // Firestore responde permission-denied.

    async function verificarAccesoAdmin() {

      try {

        await db
          .collection("configuracion_sri")
          .doc("admin_access_check")
          .get({ source: "server" });

        return true;

      } catch (error) {

        if (
          error &&
          error.code === "permission-denied"
        ) {

          return false;
        }

        throw error;
      }
    }


    // ======================================
    // MENSAJES DE REDIRECCIÓN
    // ======================================

    const parametros =
      new URLSearchParams(
        window.location.search
      );

    if (parametros.has("denied")) {
      mostrarMensaje(
        "La cuenta autenticada no tiene permisos de administrador."
      );
    } else if (parametros.has("logout")) {
      mostrarMensaje(
        "Sesión administrativa cerrada correctamente.",
        true
      );
    } else if (parametros.has("session")) {
      mostrarMensaje(
        "Tu sesión administrativa terminó. Inicia sesión nuevamente."
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
          // AUTORIZACIÓN ADMINISTRATIVA
          // =================================

          mostrarMensaje(
            "Verificando permisos administrativos..."
          );

          const autorizado =
            await verificarAccesoAdmin();

          if (!autorizado) {

            await auth.signOut();

            mostrarMensaje(
              "La cuenta es válida, pero no tiene permisos de administrador."
            );

            restaurarBoton();
            return;
          }


          // =================================
          // LOGIN CORRECTO
          // =================================

          mostrarMensaje(
            "Acceso administrativo verificado. Abriendo panel...",
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


        case "permission-denied":

          return "La cuenta no tiene permisos administrativos.";


        case "unavailable":

          return "No fue posible verificar los permisos. Revisa tu conexión e inténtalo nuevamente.";


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

// PASO 29 · mensaje de cierre automático por inactividad.
document.addEventListener("DOMContentLoaded",function(){
  try{
    if(new URLSearchParams(window.location.search).get("motivo")==="inactividad"){
      const el=document.getElementById("loginMensaje");
      if(el)el.textContent="La sesión administrativa se cerró por 60 minutos de inactividad.";
    }
  }catch(_){}
});
