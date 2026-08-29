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


    if (
      !firebase.apps.length
    ) {
      firebase.initializeApp(
        firebaseConfig
      );
    }


    const auth =
      firebase.auth();

    const db =
      firebase.firestore();

    const $ =
      id =>
        document.getElementById(
          id
        );


    const loading =
      $("trackLoading");

    const login =
      $("trackLogin");

    const shell =
      $("trackShell");

    const empty =
      $("trackEmpty");

    const orderSelect =
      $("trackOrderSelect");

    const orderCard =
      $("trackOrderCard");

    const orderNumber =
      $("trackOrderNumber");

    const orderDate =
      $("trackOrderDate");

    const currentStatus =
      $("trackCurrentStatus");

    const cancelled =
      $("trackCancelled");

    const total =
      $("trackTotal");

    const payment =
      $("trackPayment");

    const province =
      $("trackProvince");

    const city =
      $("trackCity");

    const address =
      $("trackAddress");

    const productsCount =
      $("trackProductsCount");

    const productsList =
      $("trackProductsList");

    const toast =
      $("trackToast");


    let orders =
      [];

    let unsubscribe =
      null;

    let toastTimer =
      null;


    const queryOrder =
      String(
        new URLSearchParams(
          window.location.search
        ).get("pedido") ||
        ""
      ).trim();


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


        if (!user) {

          loading.hidden =
            true;

          login.hidden =
            false;

          shell.hidden =
            true;

          return;
        }


        login.hidden =
          true;

        shell.hidden =
          false;


        listenOrders(
          user.uid
        );
      }
    );


    function listenOrders(
      uid
    ) {

      unsubscribe =
        db
          .collection("pedidos")
          .where(
            "clienteUid",
            "==",
            uid
          )
          .onSnapshot(
            function (snapshot) {

              orders =
                [];


              snapshot.forEach(
                function (doc) {

                  orders.push({
                    id:
                      doc.id,
                    ...doc.data()
                  });
                }
              );


              orders.sort(
                function (a, b) {

                  return (
                    millis(
                      b.creadoEn
                    )
                    -
                    millis(
                      a.creadoEn
                    )
                  );
                }
              );


              loading.hidden =
                true;


              renderSelect();


              if (
                !orders.length
              ) {

                empty.hidden =
                  false;

                orderCard.hidden =
                  true;

                return;
              }


              empty.hidden =
                true;


              const preferred =
                findPreferredOrder();


              if (preferred) {

                orderSelect.value =
                  preferred.id;


                renderOrder(
                  preferred
                );

              } else {

                orderSelect.value =
                  orders[0].id;


                renderOrder(
                  orders[0]
                );
              }

            },
            function (error) {

              console.error(
                "Seguimiento:",
                error
              );


              loading.hidden =
                true;


              showToast(
                "No fue posible cargar tus pedidos."
              );
            }
          );
    }


    function renderSelect() {

      orderSelect.innerHTML =
        "";


      orders.forEach(
        function (order) {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            order.id;


          option.textContent =
            (
              order.numero ||
              order.id
            )
            +
            " · "
            +
            (
              order.estado ||
              "Pendiente"
            );


          orderSelect.appendChild(
            option
          );
        }
      );
    }


    function findPreferredOrder() {

      if (!queryOrder) {
        return null;
      }


      return (
        orders.find(
          function (order) {

            return (
              order.id ===
              queryOrder
            );
          }
        )
        ||
        orders.find(
          function (order) {

            return (
              String(
                order.numero ||
                ""
              )
                .trim()
                .toLowerCase()
              ===
              queryOrder
                .toLowerCase()
            );
          }
        )
        ||
        null
      );
    }


    orderSelect.addEventListener(
      "change",
      function () {

        const order =
          orders.find(
            item =>
              item.id ===
              orderSelect.value
          );


        if (order) {

          renderOrder(
            order
          );
        }
      }
    );


    function renderOrder(
      order
    ) {

      orderCard.hidden =
        false;


      orderNumber.textContent =
        order.numero ||
        order.id;


      orderDate.textContent =
        formatDate(
          order.creadoEn
        );


      const status =
        order.estado ||
        "Pendiente";


      currentStatus.textContent =
        status;


      renderTimeline(
        status
      );


      total.textContent =
        money(
          order.resumen?.total
        );


      payment.textContent =
        paymentName(
          order.pago?.metodo ||
          order.metodoPago
        );


      province.textContent =
        order.entrega?.provincia ||
        "-";


      city.textContent =
        order.entrega?.ciudad ||
        "-";


      address.textContent =
        [
          order.entrega?.direccion,
          order.entrega?.referencia
        ]
          .filter(Boolean)
          .join(
            " · "
          ) ||
        "-";


      renderProducts(
        order.productos
      );
    }


    function renderTimeline(
      status
    ) {

      const cancel =
        status ===
        "Cancelado";


      cancelled.hidden =
        !cancel;


      const currentIndex =
        stages.indexOf(
          status
        );


      document
        .querySelectorAll(
          ".track-step"
        )
        .forEach(
          function (
            step,
            index
          ) {

            step.classList.remove(
              "completo",
              "actual"
            );


            if (cancel) {

              if (
                index ===
                0
              ) {

                step.classList.add(
                  "completo"
                );
              }


              return;
            }


            if (
              currentIndex >=
              0
            ) {

              if (
                index <
                currentIndex
              ) {

                step.classList.add(
                  "completo"
                );
              }


              if (
                index ===
                currentIndex
              ) {

                step.classList.add(
                  "actual"
                );
              }
            }
          }
        );


      document
        .querySelectorAll(
          ".track-line"
        )
        .forEach(
          function (
            line,
            index
          ) {

            line.classList.toggle(
              "completo",
              !cancel &&
              currentIndex >
              index
            );
          }
        );
    }


    function renderProducts(
      items
    ) {

      const products =
        Array.isArray(
          items
        )
          ? items
          : [];


      productsCount.textContent =
        products.length +
        (
          products.length ===
          1
            ? " PRODUCTO"
            : " PRODUCTOS"
        );


      productsList.innerHTML =
        "";


      if (
        !products.length
      ) {

        productsList.innerHTML =
          "<p>Sin productos registrados.</p>";

        return;
      }


      products.forEach(
        function (item) {

          const qty =
            Math.max(
              1,
              Math.floor(
                num(
                  item.cantidad
                )
              )
            );


          const price =
            Math.max(
              0,
              num(
                item.precioUnitario ??
                item.precio
              )
            );


          const row =
            document.createElement(
              "div"
            );


          row.className =
            "track-product-row";


          row.innerHTML = `
            <div>
              <strong>
                ${escapeHtml(
                  item.nombre ||
                  item.codigo ||
                  "Producto"
                )}
              </strong>

              <small>
                ${escapeHtml(
                  [
                    item.codigo,
                    item.talla,
                    item.color
                  ]
                    .filter(Boolean)
                    .join(" · ")
                )}
              </small>
            </div>

            <span>
              × ${qty}
            </span>

            <span>
              ${money(
                price *
                qty
              )}
            </span>
          `;


          productsList.appendChild(
            row
          );
        }
      );
    }


    function paymentName(
      method
    ) {

      return ({
        transferencia:
          "Transferencia",
        tarjeta:
          "Tarjeta",
        efectivo:
          "Contra entrega"
      })[method] ||
      method ||
      "No especificado";
    }


    function money(
      value
    ) {

      return (
        "$" +
        num(
          value
        ).toFixed(
          2
        )
      );
    }


    function num(
      value
    ) {

      const n =
        Number(
          value
        );


      return Number.isFinite(
        n
      )
        ? n
        : 0;
    }


    function millis(
      value
    ) {

      if (
        value &&
        typeof value.toMillis ===
        "function"
      ) {

        return value.toMillis();
      }


      if (
        value &&
        typeof value.toDate ===
        "function"
      ) {

        return value
          .toDate()
          .getTime();
      }


      const date =
        new Date(
          value ||
          0
        );


      return Number.isNaN(
        date.getTime()
      )
        ? 0
        : date.getTime();
    }


    function formatDate(
      value
    ) {

      let date =
        null;


      if (
        value &&
        typeof value.toDate ===
        "function"
      ) {

        date =
          value.toDate();

      } else if (value) {

        date =
          new Date(
            value
          );
      }


      if (
        !date ||
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "-";
      }


      return date.toLocaleString(
        "es-EC",
        {
          year:
            "numeric",
          month:
            "short",
          day:
            "2-digit",
          hour:
            "2-digit",
          minute:
            "2-digit"
        }
      );
    }


    function escapeHtml(
      value
    ) {

      return String(
        value ??
        ""
      )
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        )
        .replace(
          /"/g,
          "&quot;"
        )
        .replace(
          /'/g,
          "&#039;"
        );
    }


    function showToast(
      message
    ) {

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
          2500
        );
    }


    function stop() {

      if (
        unsubscribe
      ) {

        unsubscribe();

        unsubscribe =
          null;
      }
    }


    window.addEventListener(
      "beforeunload",
      stop
    );

  }
);
