// @ts-nocheck

// ==========================================================
// SIXTEEN ADMIN · PASO 15
// ANALÍTICA COMERCIAL + COMPORTAMIENTO DE CLIENTES
// ==========================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const $ =
      id =>
        document.getElementById(
          id
        );


    const periodoSelect =
      $("analiticaPeriodo");

    const exportBtn =
      $("exportarAnaliticaBtn");

    const ventasPeriodo =
      $("analiticaVentasPeriodo");

    const pedidosValidosEl =
      $("analiticaPedidosValidos");

    const ticketPromedioEl =
      $("analiticaTicketPromedio");

    const recompraEl =
      $("analiticaRecompra");

    const recompraMetaEl =
      $("analiticaRecompraMeta");

    const cancelacionEl =
      $("analiticaCancelacion");

    const cancelacionMetaEl =
      $("analiticaCancelacionMeta");

    const cuponUsoEl =
      $("analiticaCuponUso");

    const cuponMetaEl =
      $("analiticaCuponMeta");

    const periodoTextoEl =
      $("analiticaPeriodoTexto");

    const insightsEl =
      $("analiticaInsights");

    const segmentosEl =
      $("analiticaSegmentos");

    const diasChart =
      $("analiticaDiasChart");

    const categoriasChart =
      $("analiticaCategoriasChart");

    const horasChart =
      $("analiticaHorasChart");

    const tallasEl =
      $("analiticaTallas");

    const coloresEl =
      $("analiticaColores");

    const provinciasBody =
      $("analiticaProvinciasBody");

    const cuponesBody =
      $("analiticaCuponesBody");


    const VALID_STATES =
      new Set([
        "Confirmado",
        "En preparación",
        "Enviado",
        "Entregado"
      ]);


    const DAY_NAMES = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado"
    ];


    let ultimoResumen =
      null;


    periodoSelect
      ?.addEventListener(
        "change",
        render
      );


    exportBtn
      ?.addEventListener(
        "click",
        exportCsv
      );


    window.addEventListener(
      "sixteen:admin-data-updated",
      render
    );


    // Render inicial por si dashboard.js ya recibió datos.
    setTimeout(
      render,
      150
    );


    // ======================================================
    // RENDER PRINCIPAL
    // ======================================================

    function render() {

      const source =
        window
          .SIXTEEN_ADMIN_ANALYTICS_SOURCE;


      if (!source) {
        return;
      }


      const pedidos =
        source.getPedidos?.() ||
        [];

      const clientes =
        source.getClientes?.() ||
        [];


      const period =
        getPeriodConfig();


      const pedidosPeriodo =
        filterByPeriod(
          pedidos,
          period
        );


      const validos =
        pedidosPeriodo.filter(
          pedido =>
            VALID_STATES.has(
              pedido.estado
            )
        );


      const cancelados =
        pedidosPeriodo.filter(
          pedido =>
            pedido.estado ===
            "Cancelado"
        );


      const ventas =
        validos.reduce(
          (sum, pedido) =>
            sum +
            positive(
              pedido.resumen?.total
            ),
          0
        );


      const ticket =
        validos.length
          ? ventas /
            validos.length
          : 0;


      const customerStats =
        buildCustomerPeriodStats(
          validos
        );


      const customersWithPurchase =
        customerStats.size;


      const returningCustomers =
        [
          ...customerStats.values()
        ]
          .filter(
            item =>
              item.orders >=
              2
          )
          .length;


      const repeatRate =
        customersWithPurchase
          ? (
              returningCustomers /
              customersWithPurchase
            ) *
            100
          : 0;


      const cancellationRate =
        pedidosPeriodo.length
          ? (
              cancelados.length /
              pedidosPeriodo.length
            ) *
            100
          : 0;


      const couponOrders =
        validos.filter(
          pedido =>
            couponCode(
              pedido
            )
        );


      const couponRate =
        validos.length
          ? (
              couponOrders.length /
              validos.length
            ) *
            100
          : 0;


      setText(
        ventasPeriodo,
        money(
          ventas
        )
      );


      setText(
        pedidosValidosEl,
        String(
          validos.length
        )
      );


      setText(
        ticketPromedioEl,
        money(
          ticket
        )
      );


      setText(
        recompraEl,
        percent(
          repeatRate
        )
      );


      setText(
        recompraMetaEl,
        `${returningCustomers} ${
          returningCustomers === 1
            ? "cliente recurrente"
            : "clientes recurrentes"
        }`
      );


      setText(
        cancelacionEl,
        percent(
          cancellationRate
        )
      );


      setText(
        cancelacionMetaEl,
        `${cancelados.length} ${
          cancelados.length === 1
            ? "pedido cancelado"
            : "pedidos cancelados"
        }`
      );


      setText(
        cuponUsoEl,
        percent(
          couponRate
        )
      );


      setText(
        cuponMetaEl,
        `${couponOrders.length} ${
          couponOrders.length === 1
            ? "compra con cupón"
            : "compras con cupón"
        }`
      );


      setText(
        periodoTextoEl,
        period.label
      );


      const categoryData =
        buildCategoryData(
          validos
        );


      const dayData =
        buildDayData(
          validos
        );


      const hourData =
        buildHourData(
          validos
        );


      const sizeData =
        buildItemAttributeData(
          validos,
          "talla"
        );


      const colorData =
        buildColorData(
          validos
        );


      const provinceData =
        buildProvinceData(
          validos
        );


      const couponData =
        buildCouponData(
          validos
        );


      renderSegments(
        clientes
      );


      renderBars(
        diasChart,
        dayData,
        item =>
          item.name,
        item =>
          `${item.orders} ${item.orders === 1 ? "pedido" : "pedidos"}`,
        item =>
          item.orders
      );


      renderBars(
        categoriasChart,
        categoryData.slice(
          0,
          7
        ),
        item =>
          item.name,
        item =>
          `${item.units} uds · ${money(item.revenue)}`,
        item =>
          item.revenue
      );


      renderBars(
        horasChart,
        hourData,
        item =>
          item.name,
        item =>
          `${item.orders} ${item.orders === 1 ? "pedido" : "pedidos"}`,
        item =>
          item.orders
      );


      renderTagRanking(
        tallasEl,
        sizeData,
        "Sin tallas registradas."
      );


      renderTagRanking(
        coloresEl,
        colorData,
        "Sin colores registrados."
      );


      renderProvinces(
        provinceData
      );


      renderCoupons(
        couponData
      );


      renderInsights({
        validos:
          validos,

        ventas:
          ventas,

        ticket:
          ticket,

        repeatRate:
          repeatRate,

        cancellationRate:
          cancellationRate,

        couponRate:
          couponRate,

        categoryData:
          categoryData,

        dayData:
          dayData,

        hourData:
          hourData,

        provinceData:
          provinceData,

        couponData:
          couponData
      });


      ultimoResumen = {
        period:
          period,

        pedidosPeriodo:
          pedidosPeriodo,

        validos:
          validos,

        ventas:
          ventas,

        ticket:
          ticket,

        repeatRate:
          repeatRate,

        cancellationRate:
          cancellationRate,

        couponRate:
          couponRate,

        categoryData:
          categoryData,

        dayData:
          dayData,

        hourData:
          hourData,

        sizeData:
          sizeData,

        colorData:
          colorData,

        provinceData:
          provinceData,

        couponData:
          couponData
      };
    }


    // ======================================================
    // PERIODO
    // ======================================================

    function getPeriodConfig() {

      const raw =
        periodoSelect?.value ||
        "90";


      if (
        raw ===
        "all"
      ) {

        return {
          days:
            null,
          label:
            "Todo el historial"
        };
      }


      const days =
        Math.max(
          1,
          Math.floor(
            numberValue(
              raw
            )
          )
        );


      return {
        days:
          days,
        label:
          `Últimos ${days} días`
      };
    }


    function filterByPeriod(
      orders,
      period
    ) {

      if (
        !period.days
      ) {
        return orders.slice();
      }


      const now =
        new Date();


      const from =
        new Date(
          now
        );


      from.setDate(
        from.getDate() -
        period.days
      );


      from.setHours(
        0,
        0,
        0,
        0
      );


      return orders.filter(
        function (order) {

          const date =
            toDate(
              order.creadoEn
            );


          return (
            date &&
            date >=
            from &&
            date <=
            now
          );
        }
      );
    }


    // ======================================================
    // CLIENTES EN PERIODO
    // ======================================================

    function buildCustomerPeriodStats(
      orders
    ) {

      const map =
        new Map();


      orders.forEach(
        function (order) {

          const key =
            customerKey(
              order
            );


          if (
            !map.has(
              key
            )
          ) {

            map.set(
              key,
              {
                orders:
                  0,
                revenue:
                  0
              }
            );
          }


          const item =
            map.get(
              key
            );


          item.orders +=
            1;


          item.revenue +=
            positive(
              order.resumen?.total
            );
        }
      );


      return map;
    }


    // ======================================================
    // SEGMENTACIÓN RFM SIMPLIFICADA
    // ======================================================

    function renderSegments(
      clients
    ) {

      if (!segmentosEl) {
        return;
      }


      const purchaseClients =
        clients.filter(
          client =>
            numberValue(
              client.comprasValidas
            ) >
            0
        );


      const averageSpend =
        purchaseClients.length
          ? purchaseClients.reduce(
              (sum, client) =>
                sum +
                positive(
                  client.totalComprado
                ),
              0
            ) /
            purchaseClients.length
          : 0;


      const vipThreshold =
        Math.max(
          200,
          averageSpend *
          2
        );


      let nuevos =
        0;

      let recurrentes =
        0;

      let vip =
        0;

      let inactivos =
        0;


      const now =
        Date.now();


      purchaseClients.forEach(
        function (client) {

          const purchases =
            numberValue(
              client.comprasValidas
            );


          const spend =
            positive(
              client.totalComprado
            );


          const lastValid =
            (
              Array.isArray(
                client.pedidos
              )
                ? client.pedidos
                : []
            )
              .find(
                order =>
                  VALID_STATES.has(
                    order.estado
                  )
              );


          const lastMs =
            timestampMs(
              lastValid?.creadoEn
            );


          const daysInactive =
            lastMs
              ? (
                  now -
                  lastMs
                ) /
                86400000
              : 0;


          if (
            daysInactive >
            90
          ) {

            inactivos +=
              1;

            return;
          }


          if (
            purchases >=
            3
            ||
            spend >=
            vipThreshold
          ) {

            vip +=
              1;

            return;
          }


          if (
            purchases >=
            2
          ) {

            recurrentes +=
              1;

            return;
          }


          nuevos +=
            1;
        }
      );


      const segments = [
        {
          name:
            "Nuevos",
          value:
            nuevos,
          detail:
            "1 compra válida"
        },
        {
          name:
            "Recurrentes",
          value:
            recurrentes,
          detail:
            "2 compras válidas"
        },
        {
          name:
            "VIP",
          value:
            vip,
          detail:
            "3+ compras o alto gasto"
        },
        {
          name:
            "Inactivos",
          value:
            inactivos,
          detail:
            "90+ días sin compra"
        }
      ];


      segmentosEl.innerHTML =
        "";


      segments.forEach(
        function (segment) {

          const card =
            document.createElement(
              "article"
            );


          card.innerHTML = `
            <span>
              ${escapeHtml(
                segment.name
              )}
            </span>

            <strong>
              ${segment.value}
            </strong>

            <small>
              ${escapeHtml(
                segment.detail
              )}
            </small>
          `;


          segmentosEl.appendChild(
            card
          );
        }
      );
    }


    // ======================================================
    // CATEGORÍAS
    // ======================================================

    function buildCategoryData(
      orders
    ) {

      const map =
        new Map();


      orders.forEach(
        function (order) {

          orderItems(
            order
          )
            .forEach(
              function (item) {

                const name =
                  String(
                    item.categoria ||
                    "Sin categoría"
                  )
                    .trim() ||
                  "Sin categoría";


                if (
                  !map.has(
                    name
                  )
                ) {

                  map.set(
                    name,
                    {
                      name:
                        name,
                      units:
                        0,
                      revenue:
                        0
                    }
                  );
                }


                const row =
                  map.get(
                    name
                  );


                const qty =
                  Math.max(
                    1,
                    Math.floor(
                      numberValue(
                        item.cantidad
                      ) ||
                      1
                    )
                  );


                const price =
                  positive(
                    item.precioUnitario ??
                    item.precio
                  );


                row.units +=
                  qty;


                row.revenue +=
                  price *
                  qty;
              }
            );
        }
      );


      return [
        ...map.values()
      ]
        .sort(
          (a, b) =>
            b.revenue -
            a.revenue
        );
    }


    // ======================================================
    // DÍAS / HORAS
    // ======================================================

    function buildDayData(
      orders
    ) {

      const values =
        DAY_NAMES.map(
          name => ({
            name:
              name,
            orders:
              0
          })
        );


      orders.forEach(
        function (order) {

          const date =
            toDate(
              order.creadoEn
            );


          if (!date) {
            return;
          }


          values[
            date.getDay()
          ].orders +=
            1;
        }
      );


      return values;
    }


    function buildHourData(
      orders
    ) {

      const ranges = [
        {
          name:
            "Madrugada · 00–05",
          min:
            0,
          max:
            5,
          orders:
            0
        },
        {
          name:
            "Mañana · 06–11",
          min:
            6,
          max:
            11,
          orders:
            0
        },
        {
          name:
            "Tarde · 12–17",
          min:
            12,
          max:
            17,
          orders:
            0
        },
        {
          name:
            "Noche · 18–23",
          min:
            18,
          max:
            23,
          orders:
            0
        }
      ];


      orders.forEach(
        function (order) {

          const date =
            toDate(
              order.creadoEn
            );


          if (!date) {
            return;
          }


          const hour =
            date.getHours();


          const range =
            ranges.find(
              item =>
                hour >=
                item.min &&
                hour <=
                item.max
            );


          if (range) {

            range.orders +=
              1;
          }
        }
      );


      return ranges;
    }


    // ======================================================
    // TALLAS / COLORES
    // ======================================================

    function buildItemAttributeData(
      orders,
      field
    ) {

      const map =
        new Map();


      orders.forEach(
        function (order) {

          orderItems(
            order
          )
            .forEach(
              function (item) {

                const value =
                  String(
                    item[field] ||
                    ""
                  ).trim();


                if (!value) {
                  return;
                }


                const qty =
                  Math.max(
                    1,
                    Math.floor(
                      numberValue(
                        item.cantidad
                      ) ||
                      1
                    )
                  );


                map.set(
                  value,
                  (
                    map.get(
                      value
                    ) ||
                    0
                  ) +
                  qty
                );
              }
            );
        }
      );


      return [
        ...map.entries()
      ]
        .map(
          ([name, units]) => ({
            name:
              name,
            units:
              units
          })
        )
        .sort(
          (a, b) =>
            b.units -
            a.units
        )
        .slice(
          0,
          10
        );
    }


    function buildColorData(
      orders
    ) {

      const map =
        new Map();


      orders.forEach(
        function (order) {

          orderItems(
            order
          )
            .forEach(
              function (item) {

                const values =
                  String(
                    item.color ||
                    ""
                  )
                    .split(
                      /[/,;|]+/
                    )
                    .map(
                      value =>
                        value.trim()
                    )
                    .filter(Boolean);


                const qty =
                  Math.max(
                    1,
                    Math.floor(
                      numberValue(
                        item.cantidad
                      ) ||
                      1
                    )
                  );


                values.forEach(
                  function (value) {

                    map.set(
                      value,
                      (
                        map.get(
                          value
                        ) ||
                        0
                      ) +
                      qty
                    );
                  }
                );
              }
            );
        }
      );


      return [
        ...map.entries()
      ]
        .map(
          ([name, units]) => ({
            name:
              name,
            units:
              units
          })
        )
        .sort(
          (a, b) =>
            b.units -
            a.units
        )
        .slice(
          0,
          10
        );
    }


    // ======================================================
    // PROVINCIAS
    // ======================================================

    function buildProvinceData(
      orders
    ) {

      const map =
        new Map();


      orders.forEach(
        function (order) {

          const name =
            String(
              order.entrega?.provincia ||
              "Sin provincia"
            )
              .trim() ||
            "Sin provincia";


          if (
            !map.has(
              name
            )
          ) {

            map.set(
              name,
              {
                name:
                  name,
                orders:
                  0,
                revenue:
                  0
              }
            );
          }


          const row =
            map.get(
              name
            );


          row.orders +=
            1;


          row.revenue +=
            positive(
              order.resumen?.total
            );
        }
      );


      return [
        ...map.values()
      ]
        .sort(
          (a, b) =>
            b.revenue -
            a.revenue
        );
    }


    // ======================================================
    // CUPONES
    // ======================================================

    function buildCouponData(
      orders
    ) {

      const map =
        new Map();


      orders.forEach(
        function (order) {

          const code =
            couponCode(
              order
            );


          if (!code) {
            return;
          }


          if (
            !map.has(
              code
            )
          ) {

            map.set(
              code,
              {
                code:
                  code,
                uses:
                  0,
                discount:
                  0,
                revenue:
                  0
              }
            );
          }


          const row =
            map.get(
              code
            );


          row.uses +=
            1;


          row.discount +=
            positive(
              order.resumen?.descuento
            );


          row.revenue +=
            positive(
              order.resumen?.total
            );
        }
      );


      return [
        ...map.values()
      ]
        .sort(
          (a, b) =>
            b.revenue -
            a.revenue
        );
    }


    // ======================================================
    // BARRAS
    // ======================================================

    function renderBars(
      container,
      rows,
      labelFn,
      metaFn,
      valueFn
    ) {

      if (!container) {
        return;
      }


      const max =
        Math.max(
          1,
          ...rows.map(
            row =>
              positive(
                valueFn(
                  row
                )
              )
          )
        );


      container.innerHTML =
        "";


      if (
        !rows.length ||
        rows.every(
          row =>
            positive(
              valueFn(
                row
              )
            ) ===
            0
        )
      ) {

        container.innerHTML = `
          <p class="analitica-empty">
            Sin datos suficientes en este periodo.
          </p>
        `;

        return;
      }


      rows.forEach(
        function (row) {

          const value =
            positive(
              valueFn(
                row
              )
            );


          const width =
            value > 0
              ? Math.max(
                  3,
                  (
                    value /
                    max
                  ) *
                  100
                )
              : 0;


          const node =
            document.createElement(
              "div"
            );


          node.className =
            "analitica-bar-row";


          node.innerHTML = `
            <div class="analitica-bar-head">

              <span>
                ${escapeHtml(
                  labelFn(
                    row
                  )
                )}
              </span>

              <strong>
                ${escapeHtml(
                  metaFn(
                    row
                  )
                )}
              </strong>

            </div>

            <div class="analitica-bar-track">

              <span
                style="width:${width.toFixed(2)}%"
              ></span>

            </div>
          `;


          container.appendChild(
            node
          );
        }
      );
    }


    // ======================================================
    // TAG RANKING
    // ======================================================

    function renderTagRanking(
      container,
      rows,
      emptyText
    ) {

      if (!container) {
        return;
      }


      container.innerHTML =
        "";


      if (!rows.length) {

        container.innerHTML = `
          <p class="analitica-empty">
            ${escapeHtml(
              emptyText
            )}
          </p>
        `;

        return;
      }


      rows.forEach(
        function (row, index) {

          const node =
            document.createElement(
              "article"
            );


          node.innerHTML = `
            <span>
              ${String(
                index + 1
              ).padStart(
                2,
                "0"
              )}
            </span>

            <strong>
              ${escapeHtml(
                row.name
              )}
            </strong>

            <small>
              ${row.units} uds
            </small>
          `;


          container.appendChild(
            node
          );
        }
      );
    }


    // ======================================================
    // TABLAS
    // ======================================================

    function renderProvinces(
      rows
    ) {

      if (!provinciasBody) {
        return;
      }


      if (!rows.length) {

        provinciasBody.innerHTML = `
          <tr>
            <td colspan="4">
              Sin datos.
            </td>
          </tr>
        `;

        return;
      }


      provinciasBody.innerHTML =
        rows
          .slice(
            0,
            8
          )
          .map(
            function (row, index) {

              return `
                <tr>
                  <td>
                    ${index + 1}
                  </td>
                  <td>
                    ${escapeHtml(
                      row.name
                    )}
                  </td>
                  <td>
                    ${row.orders}
                  </td>
                  <td>
                    ${money(
                      row.revenue
                    )}
                  </td>
                </tr>
              `;
            }
          )
          .join("");
    }


    function renderCoupons(
      rows
    ) {

      if (!cuponesBody) {
        return;
      }


      if (!rows.length) {

        cuponesBody.innerHTML = `
          <tr>
            <td colspan="4">
              Sin uso de cupones en este periodo.
            </td>
          </tr>
        `;

        return;
      }


      cuponesBody.innerHTML =
        rows
          .slice(
            0,
            8
          )
          .map(
            function (row) {

              return `
                <tr>
                  <td>
                    <strong>
                      ${escapeHtml(
                        row.code
                      )}
                    </strong>
                  </td>
                  <td>
                    ${row.uses}
                  </td>
                  <td>
                    ${money(
                      row.discount
                    )}
                  </td>
                  <td>
                    ${money(
                      row.revenue
                    )}
                  </td>
                </tr>
              `;
            }
          )
          .join("");
    }


    // ======================================================
    // INSIGHTS AUTOMÁTICOS
    // ======================================================

    function renderInsights(
      data
    ) {

      if (!insightsEl) {
        return;
      }


      const insights =
        [];


      const topCategory =
        data.categoryData[0];


      if (topCategory) {

        insights.push({
          label:
            "CATEGORÍA LÍDER",
          value:
            topCategory.name,
          meta:
            `${topCategory.units} uds · ${money(topCategory.revenue)}`
        });
      }


      const bestDay =
        data.dayData
          .slice()
          .sort(
            (a, b) =>
              b.orders -
              a.orders
          )[0];


      if (
        bestDay &&
        bestDay.orders >
        0
      ) {

        insights.push({
          label:
            "MEJOR DÍA",
          value:
            bestDay.name,
          meta:
            `${bestDay.orders} ${
              bestDay.orders === 1
                ? "pedido"
                : "pedidos"
            }`
        });
      }


      const bestHour =
        data.hourData
          .slice()
          .sort(
            (a, b) =>
              b.orders -
              a.orders
          )[0];


      if (
        bestHour &&
        bestHour.orders >
        0
      ) {

        insights.push({
          label:
            "HORARIO FUERTE",
          value:
            bestHour.name,
          meta:
            `${bestHour.orders} compras`
        });
      }


      const topProvince =
        data.provinceData[0];


      if (topProvince) {

        insights.push({
          label:
            "MERCADO PRINCIPAL",
          value:
            topProvince.name,
          meta:
            `${money(topProvince.revenue)} en ventas`
        });
      }


      if (
        data.validos.length
      ) {

        insights.push({
          label:
            "RECOMPRA",
          value:
            percent(
              data.repeatRate
            ),
          meta:
            data.repeatRate >=
            30
              ? "Buena recurrencia de clientes"
              : "Oportunidad para aumentar recompra"
        });


        insights.push({
          label:
            "CUPONES",
          value:
            percent(
              data.couponRate
            ),
          meta:
            data.couponRate >
            0
              ? "Compras válidas que usaron promoción"
              : "Sin uso de promociones en el periodo"
        });
      }


      if (!insights.length) {

        insightsEl.innerHTML = `
          <article>
            <span>SIN DATOS</span>
            <strong>
              Aún no hay suficientes compras para generar hallazgos.
            </strong>
          </article>
        `;

        return;
      }


      insightsEl.innerHTML =
        insights
          .slice(
            0,
            6
          )
          .map(
            item => `
              <article>

                <span>
                  ${escapeHtml(
                    item.label
                  )}
                </span>

                <strong>
                  ${escapeHtml(
                    item.value
                  )}
                </strong>

                <small>
                  ${escapeHtml(
                    item.meta
                  )}
                </small>

              </article>
            `
          )
          .join("");
    }


    // ======================================================
    // EXPORTAR CSV
    // ======================================================

    function exportCsv() {

      if (!ultimoResumen) {

        alert(
          "Aún no hay datos de analítica para exportar."
        );

        return;
      }


      const r =
        ultimoResumen;


      const rows = [
        [
          "SIXTEEN ANALITICA COMERCIAL"
        ],
        [
          "Periodo",
          r.period.label
        ],
        [
          "Ventas",
          r.ventas.toFixed(2)
        ],
        [
          "Pedidos validos",
          r.validos.length
        ],
        [
          "Ticket promedio",
          r.ticket.toFixed(2)
        ],
        [
          "Tasa recompra",
          r.repeatRate.toFixed(2) + "%"
        ],
        [
          "Tasa cancelacion",
          r.cancellationRate.toFixed(2) + "%"
        ],
        [
          "Uso cupones",
          r.couponRate.toFixed(2) + "%"
        ],
        [],
        [
          "CATEGORIAS"
        ],
        [
          "Categoria",
          "Unidades",
          "Ventas"
        ]
      ];


      r.categoryData.forEach(
        item => rows.push([
          item.name,
          item.units,
          item.revenue.toFixed(2)
        ])
      );


      rows.push(
        [],
        [
          "PROVINCIAS"
        ],
        [
          "Provincia",
          "Pedidos",
          "Ventas"
        ]
      );


      r.provinceData.forEach(
        item => rows.push([
          item.name,
          item.orders,
          item.revenue.toFixed(2)
        ])
      );


      rows.push(
        [],
        [
          "CUPONES"
        ],
        [
          "Cupon",
          "Usos",
          "Descuento",
          "Ventas"
        ]
      );


      r.couponData.forEach(
        item => rows.push([
          item.code,
          item.uses,
          item.discount.toFixed(2),
          item.revenue.toFixed(2)
        ])
      );


      rows.push(
        [],
        [
          "TALLAS"
        ],
        [
          "Talla",
          "Unidades"
        ]
      );


      r.sizeData.forEach(
        item => rows.push([
          item.name,
          item.units
        ])
      );


      rows.push(
        [],
        [
          "COLORES"
        ],
        [
          "Color",
          "Unidades"
        ]
      );


      r.colorData.forEach(
        item => rows.push([
          item.name,
          item.units
        ])
      );


      const content =
        rows
          .map(
            row =>
              row
                .map(
                  csvEscape
                )
                .join(",")
          )
          .join(
            "\r\n"
          );


      const blob =
        new Blob(
          [
            "\uFEFF" +
            content
          ],
          {
            type:
              "text/csv;charset=utf-8;"
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
        "sixteen-analitica-" +
        fileDate() +
        ".csv";


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();


      URL.revokeObjectURL(
        url
      );
    }


    // ======================================================
    // HELPERS
    // ======================================================

    function orderItems(
      order
    ) {

      return Array.isArray(
        order.productos
      )
        ? order.productos
        : [];
    }


    function couponCode(
      order
    ) {

      return String(
        order.resumen?.cupon ||
        order.cupon?.codigo ||
        order.cupon ||
        ""
      )
        .trim()
        .toUpperCase();
    }


    function customerKey(
      order
    ) {

      const client =
        order.cliente ||
        {};


      return String(
        order.clienteUid ||
        client.uid ||
        client.email ||
        client.identificacion ||
        client.telefono ||
        (
          (
            client.nombres ||
            ""
          ) +
          "|" +
          (
            client.apellidos ||
            ""
          )
        ) ||
        order.id ||
        Math.random()
      )
        .trim()
        .toLowerCase();
    }


    function toDate(
      value
    ) {

      if (!value) {
        return null;
      }


      if (
        typeof value.toDate ===
        "function"
      ) {

        const date =
          value.toDate();


        return Number.isNaN(
          date.getTime()
        )
          ? null
          : date;
      }


      const date =
        new Date(
          value
        );


      return Number.isNaN(
        date.getTime()
      )
        ? null
        : date;
    }


    function timestampMs(
      value
    ) {

      const date =
        toDate(
          value
        );


      return date
        ? date.getTime()
        : 0;
    }


    function numberValue(
      value
    ) {

      const result =
        Number(
          value
        );


      return Number.isFinite(
        result
      )
        ? result
        : 0;
    }


    function positive(
      value
    ) {

      return Math.max(
        0,
        numberValue(
          value
        )
      );
    }


    function money(
      value
    ) {

      return (
        "$" +
        positive(
          value
        ).toFixed(
          2
        )
      );
    }


    function percent(
      value
    ) {

      return (
        numberValue(
          value
        ).toFixed(
          1
        ) +
        "%"
      );
    }


    function setText(
      node,
      value
    ) {

      if (node) {

        node.textContent =
          value;
      }
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


    function csvEscape(
      value
    ) {

      const text =
        String(
          value ??
          ""
        );


      return (
        '"' +
        text.replace(
          /"/g,
          '""'
        ) +
        '"'
      );
    }


    function fileDate() {

      const date =
        new Date();


      return [
        date.getFullYear(),
        String(
          date.getMonth() +
          1
        ).padStart(
          2,
          "0"
        ),
        String(
          date.getDate()
        ).padStart(
          2,
          "0"
        )
      ]
        .join("-");
    }

  }
);
