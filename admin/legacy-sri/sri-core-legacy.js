// @ts-nocheck

(function (root, factory) {

  const api = factory();

  if (
    typeof module !== "undefined"
    &&
    module.exports
  ) {
    module.exports = api;
  }

  if (root) {
    root.SIXTEEN_SRI = api;
  }

})(
  typeof window !== "undefined"
    ? window
    : globalThis,

  function () {

    "use strict";

    const DOCUMENTOS = {
      FACTURA: "01",
      NOTA_CREDITO: "04",
      NOTA_DEBITO: "05",
      GUIA_REMISION: "06",
      RETENCION: "07"
    };

    const IVA_CODES = {
      0: "0",
      12: "2",
      14: "3",
      15: "4",
      5: "5"
    };

    const PAYMENT_CODES = {
      efectivo: "01",
      contra_entrega: "01",
      retiro: "01",
      tarjeta_debito: "16",
      tarjeta: "19",
      tarjeta_credito: "19",
      transferencia: "20",
      qr: "20"
    };

    function text(value) {
      return String(
        value ?? ""
      ).trim();
    }

    function number(value) {
      const n = Number(value);
      return Number.isFinite(n)
        ? n
        : 0;
    }

    function money(value) {
      return Math.round(
        (
          number(value)
          +
          Number.EPSILON
        )
        *
        100
      )
      /
      100;
    }

    function decimal(value, digits = 2) {
      return number(value)
        .toFixed(digits);
    }

    function pad(value, length) {
      return String(value ?? "")
        .replace(/\D/g, "")
        .padStart(
          length,
          "0"
        )
        .slice(
          -length
        );
    }

    function xmlEscape(value) {
      return text(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    }

    function modulo11(base48) {

      const digits =
        String(base48)
          .replace(/\D/g, "");

      if (digits.length !== 48) {
        throw new Error(
          "La base de la clave de acceso debe tener 48 dígitos."
        );
      }

      let factor = 2;
      let sum = 0;

      for (
        let i = digits.length - 1;
        i >= 0;
        i--
      ) {

        sum +=
          Number(
            digits[i]
          )
          *
          factor;

        factor++;

        if (factor > 7) {
          factor = 2;
        }
      }

      const result =
        11
        -
        (
          sum %
          11
        );

      if (result === 11) {
        return 0;
      }

      if (result === 10) {
        return 1;
      }

      return result;
    }

    function dateParts(value = new Date()) {

      const date =
        value instanceof Date
          ? value
          : new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        throw new Error(
          "Fecha de emisión inválida."
        );
      }

      const dd =
        String(
          date.getDate()
        )
          .padStart(
            2,
            "0"
          );

      const mm =
        String(
          date.getMonth() +
          1
        )
          .padStart(
            2,
            "0"
          );

      const yyyy =
        String(
          date.getFullYear()
        );

      return {
        access:
          dd + mm + yyyy,

        xml:
          dd + "/" + mm + "/" + yyyy,

        iso:
          yyyy + "-" + mm + "-" + dd
      };
    }

    function claveAcceso(options) {

      const fecha =
        text(
          options.fecha
        )
        ||
        dateParts(
          options.fechaDate ||
          new Date()
        ).access;

      const codDoc =
        pad(
          options.codDoc ||
          DOCUMENTOS.FACTURA,
          2
        );

      const ruc =
        pad(
          options.ruc,
          13
        );

      const ambiente =
        String(
          options.ambiente ||
          "1"
        );

      const estab =
        pad(
          options.estab,
          3
        );

      const ptoEmi =
        pad(
          options.ptoEmi,
          3
        );

      const secuencial =
        pad(
          options.secuencial,
          9
        );

      const codigoNumerico =
        pad(
          options.codigoNumerico,
          8
        );

      const tipoEmision =
        String(
          options.tipoEmision ||
          "1"
        );

      const base48 =
        fecha
        +
        codDoc
        +
        ruc
        +
        ambiente
        +
        estab
        +
        ptoEmi
        +
        secuencial
        +
        codigoNumerico
        +
        tipoEmision;

      if (
        !/^\d{48}$/.test(
          base48
        )
      ) {
        throw new Error(
          "No fue posible construir los 48 dígitos base de la clave de acceso."
        );
      }

      return (
        base48
        +
        modulo11(
          base48
        )
      );
    }

    function tipoIdentificacion(
      identificacion
    ) {

      const id =
        text(
          identificacion
        );

      if (
        !id
        ||
        id ===
        "9999999999999"
      ) {
        return {
          code: "07",
          id: "9999999999999",
          label: "CONSUMIDOR FINAL"
        };
      }

      if (
        /^\d{13}$/.test(
          id
        )
      ) {
        return {
          code: "04",
          id,
          label: "RUC"
        };
      }

      if (
        /^\d{10}$/.test(
          id
        )
      ) {
        return {
          code: "05",
          id,
          label: "CÉDULA"
        };
      }

      return {
        code: "06",
        id,
        label: "PASAPORTE"
      };
    }

    function paymentCode(method) {

      const key =
        text(
          method
        )
          .toLowerCase()
          .replace(/\s+/g, "_");

      return (
        PAYMENT_CODES[key]
        ||
        "20"
      );
    }

    function ivaCode(rate) {

      const key =
        money(
          rate
        );

      return (
        IVA_CODES[key]
        ||
        "4"
      );
    }

    function numericCode() {

      if (
        typeof crypto !==
        "undefined"
        &&
        crypto.getRandomValues
      ) {

        const data =
          new Uint32Array(
            1
          );

        crypto.getRandomValues(
          data
        );

        return String(
          data[0] %
          100000000
        )
          .padStart(
            8,
            "0"
          );
      }

      return String(
        Math.floor(
          Math.random()
          *
          100000000
        )
      )
        .padStart(
          8,
          "0"
        );
    }

    function normalizeProducts(
      order,
      productsCatalog = [],
      config = {}
    ) {

      const items =
        Array.isArray(
          order?.productos
        )
          ? order.productos
          : [];

      const orderSummary =
        order?.resumen ||
        {};

      const totalDiscountGross =
        Math.max(
          0,
          number(
            orderSummary.descuento
          )
        );

      const merchandiseGross =
        items.reduce(
          (
            sum,
            item
          ) =>
            sum
            +
            (
              number(
                item.precio
              )
              *
              Math.max(
                1,
                number(
                  item.cantidad
                )
              )
            ),
          0
        );

      const includesTax =
        config.preciosIncluyenIva !==
        false;

      const defaultRate =
        number(
          config.ivaDefault
          ||
          15
        );

      const result = [];

      let allocatedGross =
        0;

      items.forEach(
        function (
          item,
          index
        ) {

          const code =
            text(
              item.codigo ||
              item.id
            )
              .toUpperCase();

          const product =
            productsCatalog.find(
              p =>
                text(
                  p.codigo
                )
                  .toUpperCase()
                ===
                code
            )
            ||
            {};

          const rate =
            number(
              product.ivaTarifa ??
              defaultRate
            );

          const qty =
            Math.max(
              1,
              number(
                item.cantidad
              )
            );

          const unitGross =
            money(
              item.precio
            );

          const grossBeforeDiscount =
            money(
              unitGross
              *
              qty
            );

          let grossDiscount = 0;

          if (
            totalDiscountGross > 0
            &&
            merchandiseGross > 0
          ) {

            if (
              index ===
              items.length - 1
            ) {

              grossDiscount =
                money(
                  totalDiscountGross
                  -
                  allocatedGross
                );

            } else {

              grossDiscount =
                money(
                  totalDiscountGross
                  *
                  (
                    grossBeforeDiscount
                    /
                    merchandiseGross
                  )
                );

              allocatedGross =
                money(
                  allocatedGross
                  +
                  grossDiscount
                );
            }
          }

          const divisor =
            includesTax
              ? (
                  1
                  +
                  (
                    rate /
                    100
                  )
                )
              : 1;

          const unitBase =
            money(
              unitGross
              /
              divisor
            );

          const discountBase =
            money(
              grossDiscount
              /
              divisor
            );

          const baseBeforeDiscount =
            money(
              unitBase
              *
              qty
            );

          const baseTaxable =
            money(
              Math.max(
                0,
                baseBeforeDiscount
                -
                discountBase
              )
            );

          const tax =
            money(
              baseTaxable
              *
              (
                rate /
                100
              )
            );

          result.push({
            codigoPrincipal:
              code ||
              "ITEM",

            descripcion:
              text(
                item.nombre ||
                product.nombre ||
                "Producto SIXTEEN"
              ),

            cantidad:
              qty,

            precioUnitario:
              unitBase,

            descuento:
              discountBase,

            precioTotalSinImpuesto:
              baseTaxable,

            ivaTarifa:
              rate,

            ivaCodigo:
              ivaCode(
                rate
              ),

            iva:
              tax,

            color:
              text(
                item.color
              ),

            talla:
              text(
                item.talla
              ),

            varianteId:
              text(
                item.varianteId
              )
          });
        }
      );

      const shippingGross =
        Math.max(
          0,
          number(
            orderSummary.envio
          )
        );

      if (
        shippingGross > 0
        &&
        config.facturarEnvio !==
        false
      ) {

        const rate =
          number(
            config.ivaEnvio ??
            defaultRate
          );

        const divisor =
          includesTax
            ? (
                1
                +
                (
                  rate /
                  100
                )
              )
            : 1;

        const base =
          money(
            shippingGross
            /
            divisor
          );

        result.push({
          codigoPrincipal:
            "ENVIO",

          descripcion:
            "Servicio de envío",

          cantidad:
            1,

          precioUnitario:
            base,

          descuento:
            0,

          precioTotalSinImpuesto:
            base,

          ivaTarifa:
            rate,

          ivaCodigo:
            ivaCode(
              rate
            ),

          iva:
            money(
              base
              *
              (
                rate /
                100
              )
            ),

          color: "",
          talla: "",
          varianteId: ""
        });
      }

      return result;
    }

    function totals(
      details
    ) {

      const totalSinImpuestos =
        money(
          details.reduce(
            (
              sum,
              item
            ) =>
              sum
              +
              number(
                item.precioTotalSinImpuesto
              ),
            0
          )
        );

      const totalDescuento =
        money(
          details.reduce(
            (
              sum,
              item
            ) =>
              sum
              +
              number(
                item.descuento
              ),
            0
          )
        );

      const taxesMap =
        new Map();

      details.forEach(
        function (item) {

          const key =
            item.ivaCodigo
            +
            "|"
            +
            item.ivaTarifa;

          if (
            !taxesMap.has(
              key
            )
          ) {

            taxesMap.set(
              key,
              {
                codigo: "2",
                codigoPorcentaje:
                  item.ivaCodigo,
                tarifa:
                  money(
                    item.ivaTarifa
                  ),
                baseImponible:
                  0,
                valor:
                  0
              }
            );
          }

          const group =
            taxesMap.get(
              key
            );

          group.baseImponible =
            money(
              group.baseImponible
              +
              number(
                item.precioTotalSinImpuesto
              )
            );

          group.valor =
            money(
              group.valor
              +
              number(
                item.iva
              )
            );
        }
      );

      const taxes =
        Array.from(
          taxesMap.values()
        );

      const totalIva =
        money(
          taxes.reduce(
            (
              sum,
              item
            ) =>
              sum
              +
              number(
                item.valor
              ),
            0
          )
        );

      const importeTotal =
        money(
          totalSinImpuestos
          +
          totalIva
        );

      return {
        totalSinImpuestos,
        totalDescuento,
        taxes,
        totalIva,
        importeTotal
      };
    }

    function buildInvoice(
      order,
      productsCatalog,
      config,
      sequence,
      codeNumeric
    ) {

      const now =
        new Date();

      const dates =
        dateParts(
          now
        );

      const buyer =
        tipoIdentificacion(
          order?.cliente
            ?.identificacion
        );

      const details =
        normalizeProducts(
          order,
          productsCatalog,
          config
        );

      if (!details.length) {
        throw new Error(
          "El pedido no contiene productos facturables."
        );
      }

      const sum =
        totals(
          details
        );

      const sequential =
        pad(
          sequence,
          9
        );

      const numeric =
        pad(
          codeNumeric ||
          numericCode(),
          8
        );

      const accessKey =
        claveAcceso({
          fecha:
            dates.access,

          codDoc:
            DOCUMENTOS.FACTURA,

          ruc:
            config.ruc,

          ambiente:
            config.ambiente,

          estab:
            config.estab,

          ptoEmi:
            config.ptoEmi,

          secuencial:
            sequential,

          codigoNumerico:
            numeric,

          tipoEmision:
            "1"
        });

      const client =
        order?.cliente ||
        {};

      const delivery =
        order?.entrega ||
        {};

      const payment =
        order?.pago ||
        {};

      const fullName =
        [
          client.nombres,
          client.apellidos
        ]
          .filter(Boolean)
          .join(" ")
          .trim();

      return {
        tipoDocumento:
          "FACTURA",

        codDoc:
          DOCUMENTOS.FACTURA,

        versionXml:
          "2.1.0",

        fechaEmision:
          dates.xml,

        fechaIso:
          dates.iso,

        ambiente:
          String(
            config.ambiente ||
            "1"
          ),

        tipoEmision:
          "1",

        estab:
          pad(
            config.estab,
            3
          ),

        ptoEmi:
          pad(
            config.ptoEmi,
            3
          ),

        secuencial:
          sequential,

        numero:
          pad(
            config.estab,
            3
          )
          +
          "-"
          +
          pad(
            config.ptoEmi,
            3
          )
          +
          "-"
          +
          sequential,

        codigoNumerico:
          numeric,

        claveAcceso:
          accessKey,

        emisor:
          {
            razonSocial:
              text(
                config.razonSocial
              ),

            nombreComercial:
              text(
                config.nombreComercial
              ),

            ruc:
              pad(
                config.ruc,
                13
              ),

            dirMatriz:
              text(
                config.dirMatriz
              ),

            dirEstablecimiento:
              text(
                config.dirEstablecimiento ||
                config.dirMatriz
              ),

            obligadoContabilidad:
              config.obligadoContabilidad
                ? "SI"
                : "NO",

            contribuyenteEspecial:
              text(
                config.contribuyenteEspecial
              ),

            regimen:
              text(
                config.regimen
              )
          },

        comprador:
          {
            tipoIdentificacion:
              buyer.code,

            identificacion:
              buyer.id,

            razonSocial:
              buyer.code ===
              "07"
                ? "CONSUMIDOR FINAL"
                : (
                    fullName ||
                    "CONSUMIDOR"
                  ),

            email:
              text(
                client.email
              ),

            telefono:
              text(
                client.telefono
              ),

            direccion:
              text(
                delivery.direccion
              ),

            ciudad:
              text(
                delivery.ciudad
              ),

            provincia:
              text(
                delivery.provincia
              )
          },

        detalles:
          details,

        totales:
          sum,

        pago:
          {
            metodo:
              text(
                payment.metodo
                ||
                order?.metodoPago
              ),

            formaPago:
              paymentCode(
                payment.metodo
                ||
                order?.metodoPago
              ),

            total:
              sum.importeTotal
          },

        pedido:
          {
            id:
              text(
                order?.id
              ),

            numero:
              text(
                order?.numero
              )
          }
      };
    }


    function buildCreditNote(
      sourceInvoice,
      config,
      sequence,
      motivo,
      emissionDate,
      codeNumeric
    ) {

      if (
        !sourceInvoice
        ||
        text(
          sourceInvoice.codDoc
        )
        !==
        DOCUMENTOS.FACTURA
      ) {
        throw new Error(
          "La nota de crédito debe modificar una factura."
        );
      }

      const reason =
        text(
          motivo
        );

      if (
        !reason
        ||
        reason.length >
        300
      ) {
        throw new Error(
          "Ingresa un motivo de hasta 300 caracteres."
        );
      }

      const emission =
        emissionDate
          ? new Date(
              String(
                emissionDate
              )
              +
              "T12:00:00"
            )
          : new Date();

      const dates =
        dateParts(
          emission
        );

      const sourceDetails =
        Array.isArray(
          sourceInvoice.detalles
        )
          ? sourceInvoice.detalles
          : [];

      if (
        !sourceDetails.length
      ) {
        throw new Error(
          "La factura de sustento no contiene detalles."
        );
      }

      const details =
        sourceDetails.map(
          item => ({
            codigoPrincipal:
              text(
                item.codigoPrincipal
                ||
                item.codigoInterno
              )
              ||
              "ITEM",

            descripcion:
              text(
                item.descripcion
              )
              ||
              "Producto SIXTEEN",

            cantidad:
              number(
                item.cantidad
              ),

            precioUnitario:
              number(
                item.precioUnitario
              ),

            descuento:
              number(
                item.descuento
              ),

            precioTotalSinImpuesto:
              number(
                item.precioTotalSinImpuesto
              ),

            ivaTarifa:
              number(
                item.ivaTarifa
              ),

            ivaCodigo:
              text(
                item.ivaCodigo
              )
              ||
              ivaCode(
                item.ivaTarifa
              ),

            iva:
              number(
                item.iva
              ),

            color:
              text(
                item.color
              ),

            talla:
              text(
                item.talla
              ),

            varianteId:
              text(
                item.varianteId
              )
          })
        );

      const sum =
        totals(
          details
        );

      const sequential =
        pad(
          sequence,
          9
        );

      const numeric =
        pad(
          codeNumeric
          ||
          numericCode(),
          8
        );

      const accessKey =
        claveAcceso({
          fecha:
            dates.access,

          codDoc:
            DOCUMENTOS.NOTA_CREDITO,

          ruc:
            config.ruc,

          ambiente:
            config.ambiente,

          estab:
            config.estab,

          ptoEmi:
            config.ptoEmi,

          secuencial:
            sequential,

          codigoNumerico:
            numeric,

          tipoEmision:
            "1"
        });

      return {
        tipoDocumento:
          "NOTA_CREDITO",

        codDoc:
          DOCUMENTOS.NOTA_CREDITO,

        versionXml:
          "1.1.0",

        fechaEmision:
          dates.xml,

        fechaIso:
          dates.iso,

        ambiente:
          String(
            config.ambiente
            ||
            "1"
          ),

        tipoEmision:
          "1",

        estab:
          pad(
            config.estab,
            3
          ),

        ptoEmi:
          pad(
            config.ptoEmi,
            3
          ),

        secuencial:
          sequential,

        numero:
          pad(
            config.estab,
            3
          )
          +
          "-"
          +
          pad(
            config.ptoEmi,
            3
          )
          +
          "-"
          +
          sequential,

        codigoNumerico:
          numeric,

        claveAcceso:
          accessKey,

        emisor:
          {
            razonSocial:
              text(
                config.razonSocial
              ),

            nombreComercial:
              text(
                config.nombreComercial
              ),

            ruc:
              pad(
                config.ruc,
                13
              ),

            dirMatriz:
              text(
                config.dirMatriz
              ),

            dirEstablecimiento:
              text(
                config.dirEstablecimiento
                ||
                config.dirMatriz
              ),

            obligadoContabilidad:
              config.obligadoContabilidad
                ? "SI"
                : "NO",

            contribuyenteEspecial:
              text(
                config.contribuyenteEspecial
              ),

            regimen:
              text(
                config.regimen
              )
          },

        comprador:
          {
            tipoIdentificacion:
              text(
                sourceInvoice.comprador
                  ?.tipoIdentificacion
              )
              ||
              tipoIdentificacion(
                sourceInvoice.comprador
                  ?.identificacion
              ).code,

            identificacion:
              text(
                sourceInvoice.comprador
                  ?.identificacion
              )
              ||
              "9999999999999",

            razonSocial:
              text(
                sourceInvoice.comprador
                  ?.razonSocial
              )
              ||
              "CONSUMIDOR FINAL",

            email:
              text(
                sourceInvoice.comprador
                  ?.email
              ),

            telefono:
              text(
                sourceInvoice.comprador
                  ?.telefono
              ),

            direccion:
              text(
                sourceInvoice.comprador
                  ?.direccion
              )
          },

        detalles:
          details,

        totales:
          sum,

        motivo:
          reason,

        documentoSustento:
          {
            id:
              text(
                sourceInvoice.id
              ),

            codDoc:
              DOCUMENTOS.FACTURA,

            numero:
              text(
                sourceInvoice.numero
              ),

            fechaEmision:
              text(
                sourceInvoice.fechaEmision
              ),

            fechaIso:
              text(
                sourceInvoice.fechaIso
              ),

            autorizacion:
              text(
                sourceInvoice.numeroAutorizacion
                ||
                sourceInvoice.autorizacion
              ),

            estado:
              text(
                sourceInvoice.estado
              )
          },

        pedido:
          {
            id:
              text(
                sourceInvoice.pedidoId
                ||
                sourceInvoice.pedido
                  ?.id
              ),

            numero:
              text(
                sourceInvoice.pedidoNumero
                ||
                sourceInvoice.pedido
                  ?.numero
              )
          }
      };
    }



    function buildCreditNotePartial(
      sourceInvoice,
      selections,
      config,
      sequence,
      motivo,
      emissionDate,
      codeNumeric
    ) {

      const sourceDetails =
        Array.isArray(
          sourceInvoice?.detalles
        )
          ? sourceInvoice.detalles
          : [];

      if (
        !sourceDetails.length
      ) {
        throw new Error(
          "La factura de sustento no contiene detalles."
        );
      }

      const selected =
        Array.isArray(
          selections
        )
          ? selections
          : [];

      if (
        !selected.length
      ) {
        throw new Error(
          "Selecciona al menos un producto o servicio."
        );
      }

      const used =
        new Set();

      const partialDetails =
        selected.map(
          selection => {

            const index =
              Math.floor(
                number(
                  selection?.index
                )
              );

            if (
              index < 0
              ||
              index >=
              sourceDetails.length
              ||
              used.has(
                index
              )
            ) {
              throw new Error(
                "La selección de productos de la nota de crédito no es válida."
              );
            }

            used.add(
              index
            );

            const source =
              sourceDetails[index];

            const originalQty =
              number(
                source.cantidad
              );

            const selectedQty =
              number(
                selection.cantidad
              );

            if (
              originalQty <= 0
              ||
              selectedQty <= 0
              ||
              selectedQty >
              originalQty +
              0.000001
            ) {
              throw new Error(
                "La cantidad a acreditar supera la cantidad de la factura."
              );
            }

            const ratio =
              selectedQty /
              originalQty;

            return {
              ...source,

              cantidad:
                selectedQty,

              descuento:
                money(
                  number(
                    source.descuento
                  )
                  *
                  ratio
                ),

              precioTotalSinImpuesto:
                money(
                  number(
                    source.precioTotalSinImpuesto
                  )
                  *
                  ratio
                ),

              iva:
                money(
                  number(
                    source.iva
                  )
                  *
                  ratio
                ),

              sourceLineIndex:
                index,

              cantidadOriginal:
                originalQty,

              proporcion:
                ratio
            };
          }
        );

      const partialInvoice =
        {
          ...sourceInvoice,
          detalles:
            partialDetails
        };

      const note =
        buildCreditNote(
          partialInvoice,
          config,
          sequence,
          motivo,
          emissionDate,
          codeNumeric
        );

      note.detalles =
        note.detalles.map(
          (
            detail,
            index
          ) => ({
            ...detail,

            sourceLineIndex:
              partialDetails[index]
                .sourceLineIndex,

            cantidadOriginal:
              partialDetails[index]
                .cantidadOriginal,

            proporcion:
              partialDetails[index]
                .proporcion
          })
        );

      const isTotal =
        partialDetails.length ===
        sourceDetails.length
        &&
        partialDetails.every(
          detail =>
            Math.abs(
              detail.cantidad
              -
              detail.cantidadOriginal
            )
            <
            0.000001
        );

      note.tipoAjuste =
        isTotal
          ? "TOTAL"
          : "PARCIAL";

      note.documentoSustento =
        {
          ...note.documentoSustento,

          totalOriginal:
            money(
              sourceInvoice
                ?.totales
                ?.importeTotal
            )
        };

      return note;
    }



    function buildCreditNoteXml(
      note
    ) {

      const e =
        xmlEscape;

      const specialTaxpayer =
        note.emisor
          .contribuyenteEspecial
          ?
          (
            "<contribuyenteEspecial>"
            +
            e(
              note.emisor
                .contribuyenteEspecial
            )
            +
            "</contribuyenteEspecial>"
          )
          :
          "";

      const totalTaxes =
        note.totales
          .taxes
          .map(
            tax =>
              [
                "<totalImpuesto>",
                "<codigo>2</codigo>",
                "<codigoPorcentaje>",
                e(
                  tax.codigoPorcentaje
                ),
                "</codigoPorcentaje>",
                "<baseImponible>",
                decimal(
                  tax.baseImponible
                ),
                "</baseImponible>",
                "<valor>",
                decimal(
                  tax.valor
                ),
                "</valor>",
                "</totalImpuesto>"
              ].join("")
          )
          .join("");

      const details =
        note.detalles
          .map(
            item => {

              const variantInfo =
                [
                  item.color
                    ?
                    (
                      '<detAdicional nombre="Color" valor="'
                      +
                      e(
                        item.color
                      )
                      +
                      '"/>'
                    )
                    :
                    "",

                  item.talla
                    ?
                    (
                      '<detAdicional nombre="Talla" valor="'
                      +
                      e(
                        item.talla
                      )
                      +
                      '"/>'
                    )
                    :
                    ""
                ]
                  .filter(Boolean)
                  .join("");

              const additional =
                variantInfo
                  ?
                  (
                    "<detallesAdicionales>"
                    +
                    variantInfo
                    +
                    "</detallesAdicionales>"
                  )
                  :
                  "";

              return [
                "<detalle>",
                "<codigoInterno>",
                e(
                  item.codigoPrincipal
                ),
                "</codigoInterno>",
                "<descripcion>",
                e(
                  item.descripcion
                ),
                "</descripcion>",
                "<cantidad>",
                decimal(
                  item.cantidad,
                  6
                ),
                "</cantidad>",
                "<precioUnitario>",
                decimal(
                  item.precioUnitario,
                  6
                ),
                "</precioUnitario>",
                "<descuento>",
                decimal(
                  item.descuento
                ),
                "</descuento>",
                "<precioTotalSinImpuesto>",
                decimal(
                  item.precioTotalSinImpuesto
                ),
                "</precioTotalSinImpuesto>",
                additional,
                "<impuestos>",
                "<impuesto>",
                "<codigo>2</codigo>",
                "<codigoPorcentaje>",
                e(
                  item.ivaCodigo
                ),
                "</codigoPorcentaje>",
                "<tarifa>",
                decimal(
                  item.ivaTarifa
                ),
                "</tarifa>",
                "<baseImponible>",
                decimal(
                  item.precioTotalSinImpuesto
                ),
                "</baseImponible>",
                "<valor>",
                decimal(
                  item.iva
                ),
                "</valor>",
                "</impuesto>",
                "</impuestos>",
                "</detalle>"
              ].join("");
            }
          )
          .join("");

      const additionalInfo =
        [
          note.comprador.email
            ?
            (
              '<campoAdicional nombre="Email">'
              +
              e(
                note.comprador.email
              )
              +
              "</campoAdicional>"
            )
            :
            "",

          note.pedido.numero
            ?
            (
              '<campoAdicional nombre="Pedido SIXTEEN">'
              +
              e(
                note.pedido.numero
              )
              +
              "</campoAdicional>"
            )
            :
            ""
        ]
          .filter(Boolean)
          .join("");

      return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<notaCredito id="comprobante" version="',
        e(
          note.versionXml
        ),
        '">',
        "<infoTributaria>",
        "<ambiente>",
        e(
          note.ambiente
        ),
        "</ambiente>",
        "<tipoEmision>1</tipoEmision>",
        "<razonSocial>",
        e(
          note.emisor
            .razonSocial
        ),
        "</razonSocial>",
        note.emisor
          .nombreComercial
          ?
          (
            "<nombreComercial>"
            +
            e(
              note.emisor
                .nombreComercial
            )
            +
            "</nombreComercial>"
          )
          :
          "",
        "<ruc>",
        e(
          note.emisor.ruc
        ),
        "</ruc>",
        "<claveAcceso>",
        e(
          note.claveAcceso
        ),
        "</claveAcceso>",
        "<codDoc>04</codDoc>",
        "<estab>",
        e(
          note.estab
        ),
        "</estab>",
        "<ptoEmi>",
        e(
          note.ptoEmi
        ),
        "</ptoEmi>",
        "<secuencial>",
        e(
          note.secuencial
        ),
        "</secuencial>",
        "<dirMatriz>",
        e(
          note.emisor
            .dirMatriz
        ),
        "</dirMatriz>",
        "</infoTributaria>",
        "<infoNotaCredito>",
        "<fechaEmision>",
        e(
          note.fechaEmision
        ),
        "</fechaEmision>",
        note.emisor
          .dirEstablecimiento
          ?
          (
            "<dirEstablecimiento>"
            +
            e(
              note.emisor
                .dirEstablecimiento
            )
            +
            "</dirEstablecimiento>"
          )
          :
          "",
        "<tipoIdentificacionComprador>",
        e(
          note.comprador
            .tipoIdentificacion
        ),
        "</tipoIdentificacionComprador>",
        "<razonSocialComprador>",
        e(
          note.comprador
            .razonSocial
        ),
        "</razonSocialComprador>",
        "<identificacionComprador>",
        e(
          note.comprador
            .identificacion
        ),
        "</identificacionComprador>",
        specialTaxpayer,
        "<obligadoContabilidad>",
        e(
          note.emisor
            .obligadoContabilidad
        ),
        "</obligadoContabilidad>",
        "<codDocModificado>01</codDocModificado>",
        "<numDocModificado>",
        e(
          note.documentoSustento
            .numero
        ),
        "</numDocModificado>",
        "<fechaEmisionDocSustento>",
        e(
          note.documentoSustento
            .fechaEmision
        ),
        "</fechaEmisionDocSustento>",
        "<totalSinImpuestos>",
        decimal(
          note.totales
            .totalSinImpuestos
        ),
        "</totalSinImpuestos>",
        "<valorModificacion>",
        decimal(
          note.totales
            .importeTotal
        ),
        "</valorModificacion>",
        "<moneda>DOLAR</moneda>",
        "<totalConImpuestos>",
        totalTaxes,
        "</totalConImpuestos>",
        "<motivo>",
        e(
          note.motivo
        ),
        "</motivo>",
        "</infoNotaCredito>",
        "<detalles>",
        details,
        "</detalles>",
        additionalInfo
          ?
          (
            "<infoAdicional>"
            +
            additionalInfo
            +
            "</infoAdicional>"
          )
          :
          "",
        "</notaCredito>"
      ].join("");
    }

    function validateConfig(
      config
    ) {

      const errors = [];

      if (
        !text(
          config.razonSocial
        )
      ) {
        errors.push(
          "Razón social"
        );
      }

      if (
        !/^\d{13}$/.test(
          text(
            config.ruc
          )
        )
      ) {
        errors.push(
          "RUC de 13 dígitos"
        );
      }

      if (
        !text(
          config.dirMatriz
        )
      ) {
        errors.push(
          "Dirección matriz"
        );
      }

      if (
        !/^\d{3}$/.test(
          text(
            config.estab
          )
        )
      ) {
        errors.push(
          "Establecimiento de 3 dígitos"
        );
      }

      if (
        !/^\d{3}$/.test(
          text(
            config.ptoEmi
          )
        )
      ) {
        errors.push(
          "Punto de emisión de 3 dígitos"
        );
      }

      if (
        !["1", "2"].includes(
          String(
            config.ambiente
          )
        )
      ) {
        errors.push(
          "Ambiente SRI"
        );
      }

      return errors;
    }


    function buildDebitNote(
      sourceInvoice,
      config,
      sequence,
      reason,
      baseValue,
      ivaTarifa,
      emissionDate,
      codeNumeric
    ) {

      if (
        !sourceInvoice
        ||
        text(
          sourceInvoice.codDoc
        )
        !==
        DOCUMENTOS.FACTURA
      ) {
        throw new Error(
          "La nota de débito debe modificar una factura."
        );
      }

      const debitReason =
        text(
          reason
        );

      if (
        !debitReason
        ||
        debitReason.length >
        300
      ) {
        throw new Error(
          "Ingresa un motivo de hasta 300 caracteres."
        );
      }

      const base =
        money(
          baseValue
        );

      if (
        base <= 0
      ) {
        throw new Error(
          "El valor base de la nota de débito debe ser mayor a cero."
        );
      }

      const rate =
        number(
          ivaTarifa
        );

      if (
        !Object.prototype.hasOwnProperty.call(
          IVA_CODES,
          rate
        )
      ) {
        throw new Error(
          "La tarifa de IVA seleccionada no está soportada."
        );
      }

      const emission =
        emissionDate
          ? new Date(
              String(
                emissionDate
              )
              +
              "T12:00:00"
            )
          : new Date();

      const dates =
        dateParts(
          emission
        );

      const sequential =
        pad(
          sequence,
          9
        );

      const numeric =
        pad(
          codeNumeric
          ||
          numericCode(),
          8
        );

      const taxValue =
        money(
          base
          *
          rate
          /
          100
        );

      const total =
        money(
          base
          +
          taxValue
        );

      const accessKey =
        claveAcceso({
          fecha:
            dates.access,

          codDoc:
            DOCUMENTOS.NOTA_DEBITO,

          ruc:
            config.ruc,

          ambiente:
            config.ambiente,

          estab:
            config.estab,

          ptoEmi:
            config.ptoEmi,

          secuencial:
            sequential,

          codigoNumerico:
            numeric,

          tipoEmision:
            "1"
        });

      const sourcePaymentMethod =
        text(
          sourceInvoice
            ?.pago
            ?.metodo
          ||
          sourceInvoice
            ?.metodoPago
        );

      const sourcePaymentCode =
        text(
          sourceInvoice
            ?.pago
            ?.formaPago
        )
        ||
        paymentCode(
          sourcePaymentMethod
        )
        ||
        "01";

      return {
        tipoDocumento:
          "NOTA_DEBITO",

        codDoc:
          DOCUMENTOS.NOTA_DEBITO,

        versionXml:
          "1.0.0",

        fechaEmision:
          dates.xml,

        fechaIso:
          dates.iso,

        ambiente:
          String(
            config.ambiente
            ||
            "1"
          ),

        tipoEmision:
          "1",

        estab:
          pad(
            config.estab,
            3
          ),

        ptoEmi:
          pad(
            config.ptoEmi,
            3
          ),

        secuencial:
          sequential,

        numero:
          pad(
            config.estab,
            3
          )
          +
          "-"
          +
          pad(
            config.ptoEmi,
            3
          )
          +
          "-"
          +
          sequential,

        codigoNumerico:
          numeric,

        claveAcceso:
          accessKey,

        emisor:
          {
            razonSocial:
              text(
                config.razonSocial
              ),

            nombreComercial:
              text(
                config.nombreComercial
              ),

            ruc:
              pad(
                config.ruc,
                13
              ),

            dirMatriz:
              text(
                config.dirMatriz
              ),

            dirEstablecimiento:
              text(
                config.dirEstablecimiento
                ||
                config.dirMatriz
              ),

            obligadoContabilidad:
              config.obligadoContabilidad
                ? "SI"
                : "NO",

            contribuyenteEspecial:
              text(
                config.contribuyenteEspecial
              ),

            regimen:
              text(
                config.regimen
              )
          },

        comprador:
          {
            tipoIdentificacion:
              text(
                sourceInvoice.comprador
                  ?.tipoIdentificacion
              )
              ||
              tipoIdentificacion(
                sourceInvoice.comprador
                  ?.identificacion
              ).code,

            identificacion:
              text(
                sourceInvoice.comprador
                  ?.identificacion
              )
              ||
              "9999999999999",

            razonSocial:
              text(
                sourceInvoice.comprador
                  ?.razonSocial
              )
              ||
              "CONSUMIDOR FINAL",

            email:
              text(
                sourceInvoice.comprador
                  ?.email
              ),

            telefono:
              text(
                sourceInvoice.comprador
                  ?.telefono
              ),

            direccion:
              text(
                sourceInvoice.comprador
                  ?.direccion
              )
          },

        documentoSustento:
          {
            id:
              text(
                sourceInvoice.id
              ),

            codDoc:
              DOCUMENTOS.FACTURA,

            numero:
              text(
                sourceInvoice.numero
              ),

            fechaEmision:
              text(
                sourceInvoice.fechaEmision
              ),

            fechaIso:
              text(
                sourceInvoice.fechaIso
              ),

            autorizacion:
              text(
                sourceInvoice.numeroAutorizacion
                ||
                sourceInvoice.autorizacion
              ),

            estado:
              text(
                sourceInvoice.estado
              )
          },

        motivos:
          [
            {
              razon:
                debitReason,

              valor:
                base
            }
          ],

        impuestos:
          [
            {
              codigo:
                "2",

              codigoPorcentaje:
                ivaCode(
                  rate
                ),

              tarifa:
                rate,

              baseImponible:
                base,

              valor:
                taxValue
            }
          ],

        totales:
          {
            totalSinImpuestos:
              base,

            totalDescuento:
              0,

            taxes:
              [
                {
                  codigo:
                    "2",

                  codigoPorcentaje:
                    ivaCode(
                      rate
                    ),

                  tarifa:
                    rate,

                  baseImponible:
                    base,

                  valor:
                    taxValue
                }
              ],

            totalIva:
              taxValue,

            importeTotal:
              total
          },

        pago:
          {
            metodo:
              sourcePaymentMethod,

            formaPago:
              sourcePaymentCode,

            total:
              total
          },

        pedido:
          {
            id:
              text(
                sourceInvoice.pedidoId
                ||
                sourceInvoice.pedido
                  ?.id
              ),

            numero:
              text(
                sourceInvoice.pedidoNumero
                ||
                sourceInvoice.pedido
                  ?.numero
              )
          }
      };
    }


    function buildDebitNoteXml(
      note
    ) {

      const e =
        xmlEscape;

      const specialTaxpayer =
        note.emisor
          .contribuyenteEspecial
          ?
          (
            "<contribuyenteEspecial>"
            +
            e(
              note.emisor
                .contribuyenteEspecial
            )
            +
            "</contribuyenteEspecial>"
          )
          :
          "";

      const taxes =
        (note.impuestos || [])
          .map(
            tax =>
              [
                "<impuesto>",
                "<codigo>",
                e(
                  tax.codigo
                ),
                "</codigo>",
                "<codigoPorcentaje>",
                e(
                  tax.codigoPorcentaje
                ),
                "</codigoPorcentaje>",
                "<tarifa>",
                decimal(
                  tax.tarifa
                ),
                "</tarifa>",
                "<baseImponible>",
                decimal(
                  tax.baseImponible
                ),
                "</baseImponible>",
                "<valor>",
                decimal(
                  tax.valor
                ),
                "</valor>",
                "</impuesto>"
              ].join("")
          )
          .join("");

      const reasons =
        (note.motivos || [])
          .map(
            item =>
              [
                "<motivo>",
                "<razon>",
                e(
                  item.razon
                ),
                "</razon>",
                "<valor>",
                decimal(
                  item.valor
                ),
                "</valor>",
                "</motivo>"
              ].join("")
          )
          .join("");

      const additional =
        [
          note.comprador.email
            ?
            (
              '<campoAdicional nombre="Email">'
              +
              e(
                note.comprador.email
              )
              +
              "</campoAdicional>"
            )
            :
            "",

          note.comprador.direccion
            ?
            (
              '<campoAdicional nombre="Dirección">'
              +
              e(
                note.comprador.direccion
              )
              +
              "</campoAdicional>"
            )
            :
            "",

          note.comprador.telefono
            ?
            (
              '<campoAdicional nombre="Teléfono">'
              +
              e(
                note.comprador.telefono
              )
              +
              "</campoAdicional>"
            )
            :
            ""
        ]
          .filter(Boolean)
          .join("");

      return [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<notaDebito version="',
        e(
          note.versionXml
        ),
        '" id="comprobante">',
        "<infoTributaria>",
        "<ambiente>",
        e(
          note.ambiente
        ),
        "</ambiente>",
        "<tipoEmision>1</tipoEmision>",
        "<razonSocial>",
        e(
          note.emisor
            .razonSocial
        ),
        "</razonSocial>",
        note.emisor
          .nombreComercial
          ?
          (
            "<nombreComercial>"
            +
            e(
              note.emisor
                .nombreComercial
            )
            +
            "</nombreComercial>"
          )
          :
          "",
        "<ruc>",
        e(
          note.emisor.ruc
        ),
        "</ruc>",
        "<claveAcceso>",
        e(
          note.claveAcceso
        ),
        "</claveAcceso>",
        "<codDoc>05</codDoc>",
        "<estab>",
        e(
          note.estab
        ),
        "</estab>",
        "<ptoEmi>",
        e(
          note.ptoEmi
        ),
        "</ptoEmi>",
        "<secuencial>",
        e(
          note.secuencial
        ),
        "</secuencial>",
        "<dirMatriz>",
        e(
          note.emisor
            .dirMatriz
        ),
        "</dirMatriz>",
        "</infoTributaria>",
        "<infoNotaDebito>",
        "<fechaEmision>",
        e(
          note.fechaEmision
        ),
        "</fechaEmision>",
        note.emisor
          .dirEstablecimiento
          ?
          (
            "<dirEstablecimiento>"
            +
            e(
              note.emisor
                .dirEstablecimiento
            )
            +
            "</dirEstablecimiento>"
          )
          :
          "",
        "<tipoIdentificacionComprador>",
        e(
          note.comprador
            .tipoIdentificacion
        ),
        "</tipoIdentificacionComprador>",
        "<razonSocialComprador>",
        e(
          note.comprador
            .razonSocial
        ),
        "</razonSocialComprador>",
        "<identificacionComprador>",
        e(
          note.comprador
            .identificacion
        ),
        "</identificacionComprador>",
        specialTaxpayer,
        "<obligadoContabilidad>",
        e(
          note.emisor
            .obligadoContabilidad
        ),
        "</obligadoContabilidad>",
        "<codDocModificado>01</codDocModificado>",
        "<numDocModificado>",
        e(
          note.documentoSustento
            .numero
        ),
        "</numDocModificado>",
        "<fechaEmisionDocSustento>",
        e(
          note.documentoSustento
            .fechaEmision
        ),
        "</fechaEmisionDocSustento>",
        "<totalSinImpuestos>",
        decimal(
          note.totales
            .totalSinImpuestos
        ),
        "</totalSinImpuestos>",
        "<impuestos>",
        taxes,
        "</impuestos>",
        "<valorTotal>",
        decimal(
          note.totales
            .importeTotal
        ),
        "</valorTotal>",
        "<pagos>",
        "<pago>",
        "<formaPago>",
        e(
          note.pago
            .formaPago
        ),
        "</formaPago>",
        "<total>",
        decimal(
          note.pago
            .total
        ),
        "</total>",
        "</pago>",
        "</pagos>",
        "</infoNotaDebito>",
        "<motivos>",
        reasons,
        "</motivos>",
        additional
          ?
          (
            "<infoAdicional>"
            +
            additional
            +
            "</infoAdicional>"
          )
          :
          "",
        "</notaDebito>"
      ].join("");
    }




    function buildGuideRemision(
      order,
      productsCatalog,
      config,
      sequence,
      transport,
      invoiceSupport,
      codeNumeric
    ) {

      const cfg =
        config ||
        {};

      const shipping =
        transport ||
        {};

      const client =
        order?.cliente ||
        {};

      const delivery =
        order?.entrega ||
        {};

      const details =
        normalizeProducts(
          order,
          productsCatalog,
          cfg
        )
          .map(
            item => ({
              codigoInterno:
                text(
                  item.codigoPrincipal
                ),

              descripcion:
                text(
                  item.descripcion
                )
                ||
                "Producto SIXTEEN",

              cantidad:
                number(
                  item.cantidad
                ),

              color:
                text(
                  item.color
                ),

              talla:
                text(
                  item.talla
                )
            })
          );

      if (
        !details.length
      ) {
        throw new Error(
          "El pedido no contiene productos para la guía de remisión."
        );
      }

      const departure =
        text(
          shipping.dirPartida
        );

      const carrierName =
        text(
          shipping.razonSocialTransportista
        );

      const carrierId =
        text(
          shipping.identificacionTransportista
        );

      const plate =
        text(
          shipping.placa
        )
          .toUpperCase()
          .replace(
            /\s+/g,
            ""
          );

      const startIso =
        text(
          shipping.fechaIniTransporte
        );

      const endIso =
        text(
          shipping.fechaFinTransporte
        );

      const destination =
        text(
          shipping.dirDestinatario
          ||
          [
            delivery.provincia,
            delivery.ciudad,
            delivery.direccion
          ]
            .filter(Boolean)
            .join(
              " · "
            )
        );

      const reason =
        text(
          shipping.motivoTraslado
          ||
          "VENTA"
        );

      if (!departure) {
        throw new Error(
          "Ingresa la dirección de partida."
        );
      }

      if (!carrierName) {
        throw new Error(
          "Ingresa la razón social o nombre del transportista."
        );
      }

      if (!carrierId) {
        throw new Error(
          "Ingresa la identificación del transportista."
        );
      }

      if (!plate) {
        throw new Error(
          "Ingresa la placa del vehículo."
        );
      }

      if (
        !startIso
        ||
        !endIso
      ) {
        throw new Error(
          "Ingresa las fechas de inicio y fin del transporte."
        );
      }

      if (
        new Date(
          endIso +
          "T12:00:00"
        )
        <
        new Date(
          startIso +
          "T12:00:00"
        )
      ) {
        throw new Error(
          "La fecha fin del transporte no puede ser anterior a la fecha inicial."
        );
      }

      if (!destination) {
        throw new Error(
          "Ingresa la dirección del destinatario."
        );
      }

      if (!reason) {
        throw new Error(
          "Ingresa el motivo del traslado."
        );
      }

      const recipientName =
        [
          client.nombres,
          client.apellidos
        ]
          .filter(Boolean)
          .join(" ")
          .trim()
        ||
        text(
          shipping.razonSocialDestinatario
        )
        ||
        "DESTINATARIO";

      const recipientId =
        text(
          client.identificacion
          ||
          shipping.identificacionDestinatario
        );

      if (!recipientId) {
        throw new Error(
          "El destinatario necesita identificación."
        );
      }

      const startDate =
        dateParts(
          new Date(
            startIso +
            "T12:00:00"
          )
        );

      const endDate =
        dateParts(
          new Date(
            endIso +
            "T12:00:00"
          )
        );

      const emission =
        dateParts(
          new Date()
        );

      const sequential =
        pad(
          sequence,
          9
        );

      const numeric =
        pad(
          codeNumeric
          ||
          numericCode(),
          8
        );

      const accessKey =
        claveAcceso({
          fecha:
            emission.access,

          codDoc:
            DOCUMENTOS.GUIA_REMISION,

          ruc:
            cfg.ruc,

          ambiente:
            cfg.ambiente,

          estab:
            cfg.estab,

          ptoEmi:
            cfg.ptoEmi,

          secuencial:
            sequential,

          codigoNumerico:
            numeric,

          tipoEmision:
            "1"
        });

      const carrierType =
        tipoIdentificacion(
          carrierId
        );

      const support =
        invoiceSupport
        &&
        text(
          invoiceSupport.numero
        )
          ? {
              codDocSustento:
                "01",

              numDocSustento:
                text(
                  invoiceSupport.numero
                ),

              numAutDocSustento:
                text(
                  invoiceSupport.numeroAutorizacion
                  ||
                  invoiceSupport.autorizacion
                  ||
                  invoiceSupport.claveAcceso
                ),

              fechaEmisionDocSustento:
                text(
                  invoiceSupport.fechaEmision
                )
            }
          : null;

      return {
        tipoDocumento:
          "GUIA_REMISION",

        codDoc:
          DOCUMENTOS.GUIA_REMISION,

        versionXml:
          "1.0.0",

        fechaEmision:
          emission.xml,

        fechaIso:
          emission.iso,

        ambiente:
          String(
            cfg.ambiente
            ||
            "1"
          ),

        tipoEmision:
          "1",

        estab:
          pad(
            cfg.estab,
            3
          ),

        ptoEmi:
          pad(
            cfg.ptoEmi,
            3
          ),

        secuencial:
          sequential,

        numero:
          pad(
            cfg.estab,
            3
          )
          +
          "-"
          +
          pad(
            cfg.ptoEmi,
            3
          )
          +
          "-"
          +
          sequential,

        codigoNumerico:
          numeric,

        claveAcceso:
          accessKey,

        emisor: {
          razonSocial:
            text(
              cfg.razonSocial
            ),

          nombreComercial:
            text(
              cfg.nombreComercial
            ),

          ruc:
            pad(
              cfg.ruc,
              13
            ),

          dirMatriz:
            text(
              cfg.dirMatriz
            ),

          dirEstablecimiento:
            text(
              cfg.dirEstablecimiento
              ||
              cfg.dirMatriz
            ),

          obligadoContabilidad:
            cfg.obligadoContabilidad
              ? "SI"
              : "NO",

          contribuyenteEspecial:
            text(
              cfg.contribuyenteEspecial
            )
        },

        transporte: {
          dirPartida:
            departure,

          razonSocialTransportista:
            carrierName,

          tipoIdentificacionTransportista:
            carrierType.code,

          identificacionTransportista:
            carrierType.id,

          fechaIniTransporte:
            startDate.xml,

          fechaFinTransporte:
            endDate.xml,

          placa:
            plate,

          ruta:
            text(
              shipping.ruta
            )
        },

        destinatario: {
          identificacion:
            recipientId,

          razonSocial:
            recipientName,

          direccion:
            destination,

          motivoTraslado:
            reason,

          codEstabDestino:
            text(
              shipping.codEstabDestino
            ),

          documentoSustento:
            support,

          detalles:
            details
        },

        pedido: {
          id:
            text(
              order?.id
            ),

          numero:
            text(
              order?.numero
            )
        },

        comprador: {
          identificacion:
            recipientId,

          razonSocial:
            recipientName,

          email:
            text(
              client.email
            )
        },

        detalles:
          details,

        totales: {
          totalSinImpuestos: 0,
          totalDescuento: 0,
          taxes: [],
          totalIva: 0,
          importeTotal: 0
        }
      };
    }


    function buildGuideRemisionXml(
      guide
    ) {

      const e =
        xmlEscape;

      const support =
        guide.destinatario
          ?.documentoSustento;

      const supportXml =
        support
        &&
        support.numDocSustento
          ? [
              "<codDocSustento>",
              e(
                support.codDocSustento
                ||
                "01"
              ),
              "</codDocSustento>",
              "<numDocSustento>",
              e(
                support.numDocSustento
              ),
              "</numDocSustento>",
              support.numAutDocSustento
                ? (
                    "<numAutDocSustento>"
                    +
                    e(
                      support.numAutDocSustento
                    )
                    +
                    "</numAutDocSustento>"
                  )
                : "",
              support.fechaEmisionDocSustento
                ? (
                    "<fechaEmisionDocSustento>"
                    +
                    e(
                      support.fechaEmisionDocSustento
                    )
                    +
                    "</fechaEmisionDocSustento>"
                  )
                : ""
            ]
              .join("")
          : "";

      const details =
        (guide.destinatario
          ?.detalles
          ||
          [])
          .map(
            item => {

              const extras =
                [
                  item.color
                    ? (
                        '<detAdicional nombre="Color" valor="'
                        +
                        e(
                          item.color
                        )
                        +
                        '"/>'
                      )
                    : "",

                  item.talla
                    ? (
                        '<detAdicional nombre="Talla" valor="'
                        +
                        e(
                          item.talla
                        )
                        +
                        '"/>'
                      )
                    : ""
                ]
                  .filter(Boolean)
                  .join("");

              return [
                "<detalle>",
                item.codigoInterno
                  ? (
                      "<codigoInterno>"
                      +
                      e(
                        item.codigoInterno
                      )
                      +
                      "</codigoInterno>"
                    )
                  : "",
                "<descripcion>",
                e(
                  item.descripcion
                ),
                "</descripcion>",
                "<cantidad>",
                decimal(
                  item.cantidad,
                  6
                ),
                "</cantidad>",
                extras
                  ? (
                      "<detallesAdicionales>"
                      +
                      extras
                      +
                      "</detallesAdicionales>"
                    )
                  : "",
                "</detalle>"
              ].join("");
            }
          )
          .join("");

      const additional =
        guide.comprador
          ?.email
          ? (
              '<infoAdicional>'
              +
              '<campoAdicional nombre="E-MAIL">'
              +
              e(
                guide.comprador.email
              )
              +
              '</campoAdicional>'
              +
              '</infoAdicional>'
            )
          : "";

      return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<guiaRemision id="comprobante" version="',
        e(
          guide.versionXml
        ),
        '">',
        "<infoTributaria>",
        "<ambiente>",
        e(
          guide.ambiente
        ),
        "</ambiente>",
        "<tipoEmision>1</tipoEmision>",
        "<razonSocial>",
        e(
          guide.emisor
            .razonSocial
        ),
        "</razonSocial>",
        guide.emisor
          .nombreComercial
          ? (
              "<nombreComercial>"
              +
              e(
                guide.emisor
                  .nombreComercial
              )
              +
              "</nombreComercial>"
            )
          : "",
        "<ruc>",
        e(
          guide.emisor.ruc
        ),
        "</ruc>",
        "<claveAcceso>",
        e(
          guide.claveAcceso
        ),
        "</claveAcceso>",
        "<codDoc>06</codDoc>",
        "<estab>",
        e(
          guide.estab
        ),
        "</estab>",
        "<ptoEmi>",
        e(
          guide.ptoEmi
        ),
        "</ptoEmi>",
        "<secuencial>",
        e(
          guide.secuencial
        ),
        "</secuencial>",
        "<dirMatriz>",
        e(
          guide.emisor
            .dirMatriz
        ),
        "</dirMatriz>",
        "</infoTributaria>",
        "<infoGuiaRemision>",
        guide.emisor
          .dirEstablecimiento
          ? (
              "<dirEstablecimiento>"
              +
              e(
                guide.emisor
                  .dirEstablecimiento
              )
              +
              "</dirEstablecimiento>"
            )
          : "",
        "<dirPartida>",
        e(
          guide.transporte
            .dirPartida
        ),
        "</dirPartida>",
        "<razonSocialTransportista>",
        e(
          guide.transporte
            .razonSocialTransportista
        ),
        "</razonSocialTransportista>",
        "<tipoIdentificacionTransportista>",
        e(
          guide.transporte
            .tipoIdentificacionTransportista
        ),
        "</tipoIdentificacionTransportista>",
        "<rucTransportista>",
        e(
          guide.transporte
            .identificacionTransportista
        ),
        "</rucTransportista>",
        guide.emisor
          .obligadoContabilidad
          ? (
              "<obligadoContabilidad>"
              +
              e(
                guide.emisor
                  .obligadoContabilidad
              )
              +
              "</obligadoContabilidad>"
            )
          : "",
        guide.emisor
          .contribuyenteEspecial
          ? (
              "<contribuyenteEspecial>"
              +
              e(
                guide.emisor
                  .contribuyenteEspecial
              )
              +
              "</contribuyenteEspecial>"
            )
          : "",
        "<fechaIniTransporte>",
        e(
          guide.transporte
            .fechaIniTransporte
        ),
        "</fechaIniTransporte>",
        "<fechaFinTransporte>",
        e(
          guide.transporte
            .fechaFinTransporte
        ),
        "</fechaFinTransporte>",
        "<placa>",
        e(
          guide.transporte
            .placa
        ),
        "</placa>",
        "</infoGuiaRemision>",
        "<destinatarios>",
        "<destinatario>",
        "<identificacionDestinatario>",
        e(
          guide.destinatario
            .identificacion
        ),
        "</identificacionDestinatario>",
        "<razonSocialDestinatario>",
        e(
          guide.destinatario
            .razonSocial
        ),
        "</razonSocialDestinatario>",
        "<dirDestinatario>",
        e(
          guide.destinatario
            .direccion
        ),
        "</dirDestinatario>",
        "<motivoTraslado>",
        e(
          guide.destinatario
            .motivoTraslado
        ),
        "</motivoTraslado>",
        guide.destinatario
          .codEstabDestino
          ? (
              "<codEstabDestino>"
              +
              e(
                pad(
                  guide.destinatario
                    .codEstabDestino,
                  3
                )
              )
              +
              "</codEstabDestino>"
            )
          : "",
        guide.transporte
          .ruta
          ? (
              "<ruta>"
              +
              e(
                guide.transporte.ruta
              )
              +
              "</ruta>"
            )
          : "",
        supportXml,
        "<detalles>",
        details,
        "</detalles>",
        "</destinatario>",
        "</destinatarios>",
        additional,
        "</guiaRemision>"
      ].join("");
    }




    function retentionIvaCode(
      percent
    ) {

      const map = {
        0: "7",
        10: "9",
        20: "10",
        30: "1",
        50: "11",
        70: "2",
        100: "3"
      };

      return map[
        number(
          percent
        )
      ]
      ||
      "";
    }


    function buildRetention(
      config,
      sequence,
      data,
      codeNumeric
    ) {

      const input =
        data ||
        {};

      const subject =
        input.sujetoRetenido
        ||
        {};

      const support =
        input.documentoSustento
        ||
        {};

      const retentions =
        Array.isArray(
          input.retenciones
        )
          ? input.retenciones
          : [];

      if (
        !retentions.length
      ) {
        throw new Error(
          "Agrega al menos una retención."
        );
      }

      const subjectName =
        text(
          subject.razonSocial
        );

      const subjectId =
        text(
          subject.identificacion
        );

      if (!subjectName) {
        throw new Error(
          "Ingresa la razón social del sujeto retenido."
        );
      }

      if (!subjectId) {
        throw new Error(
          "Ingresa la identificación del sujeto retenido."
        );
      }

      const idType =
        tipoIdentificacion(
          subjectId
        );

      const fiscalPeriod =
        text(
          input.periodoFiscal
        );

      if (
        !/^(0[1-9]|1[0-2])\/\d{4}$/.test(
          fiscalPeriod
        )
      ) {
        throw new Error(
          "El período fiscal debe tener formato MM/AAAA."
        );
      }

      const supportCode =
        text(
          support.codSustento
        );

      const supportDocCode =
        text(
          support.codDocSustento
        );

      const supportNumber =
        text(
          support.numDocSustento
        )
          .replace(
            /\D/g,
            ""
          );

      const supportDateIso =
        text(
          support.fechaEmisionIso
        );

      if (
        !/^\d{2,3}$/.test(
          supportCode
        )
      ) {
        throw new Error(
          "El código de sustento debe tener 2 o 3 dígitos."
        );
      }

      if (
        !/^\d{2,3}$/.test(
          supportDocCode
        )
      ) {
        throw new Error(
          "El código del documento de sustento debe tener 2 o 3 dígitos."
        );
      }

      if (
        !supportNumber
        ||
        supportNumber.length >
        15
      ) {
        throw new Error(
          "Ingresa el número del documento de sustento."
        );
      }

      if (!supportDateIso) {
        throw new Error(
          "Ingresa la fecha del documento de sustento."
        );
      }

      const supportDate =
        dateParts(
          new Date(
            supportDateIso
            +
            "T12:00:00"
          )
        );

      const registerIso =
        text(
          support.fechaRegistroContableIso
        );

      const registerDate =
        registerIso
          ? dateParts(
              new Date(
                registerIso
                +
                "T12:00:00"
              )
            )
          : null;

      const baseWithoutTax =
        money(
          support.totalSinImpuestos
        );

      const totalPurchase =
        money(
          support.importeTotal
        );

      if (
        baseWithoutTax < 0
        ||
        totalPurchase <= 0
      ) {
        throw new Error(
          "Revisa los valores del documento de sustento."
        );
      }

      const ivaRate =
        number(
          support.ivaTarifa
        );

      if (
        !Object.prototype.hasOwnProperty.call(
          IVA_CODES,
          ivaRate
        )
      ) {
        throw new Error(
          "La tarifa IVA del documento de sustento no está soportada."
        );
      }

      const taxValue =
        money(
          support.valorIva != null
            ? support.valorIva
            : (
                baseWithoutTax
                *
                ivaRate
                /
                100
              )
        );

      const normalizedRetentions =
        retentions.map(
          (
            line,
            index
          ) => {

            const taxCode =
              text(
                line.codigo
              );

            const percentage =
              number(
                line.porcentajeRetener
              );

            const base =
              money(
                line.baseImponible
              );

            let code =
              text(
                line.codigoRetencion
              );

            if (
              taxCode === "2"
              &&
              !code
            ) {
              code =
                retentionIvaCode(
                  percentage
                );
            }

            if (
              ![
                "1",
                "2",
                "6"
              ].includes(
                taxCode
              )
            ) {
              throw new Error(
                "La línea "
                +
                (
                  index + 1
                )
                +
                " tiene un impuesto a retener no válido."
              );
            }

            if (
              !code
              ||
              code.length >
              5
            ) {
              throw new Error(
                "La línea "
                +
                (
                  index + 1
                )
                +
                " necesita un código de retención válido."
              );
            }

            if (
              base <= 0
            ) {
              throw new Error(
                "La base imponible de la línea "
                +
                (
                  index + 1
                )
                +
                " debe ser mayor a cero."
              );
            }

            if (
              percentage < 0
              ||
              percentage >
              100
            ) {
              throw new Error(
                "El porcentaje de la línea "
                +
                (
                  index + 1
                )
                +
                " no es válido."
              );
            }

            return {
              codigo:
                taxCode,

              codigoRetencion:
                code,

              baseImponible:
                base,

              porcentajeRetener:
                percentage,

              valorRetenido:
                money(
                  base
                  *
                  percentage
                  /
                  100
                )
            };
          }
        );

      const totalRetained =
        money(
          normalizedRetentions.reduce(
            (
              sum,
              item
            ) =>
              sum
              +
              item.valorRetenido,
            0
          )
        );

      const emissionIso =
        text(
          input.fechaEmisionIso
        )
        ||
        dateParts(
          new Date()
        ).iso;

      const emission =
        dateParts(
          new Date(
            emissionIso
            +
            "T12:00:00"
          )
        );

      const sequential =
        pad(
          sequence,
          9
        );

      const numeric =
        pad(
          codeNumeric
          ||
          numericCode(),
          8
        );

      const accessKey =
        claveAcceso({
          fecha:
            emission.access,

          codDoc:
            DOCUMENTOS.RETENCION,

          ruc:
            config.ruc,

          ambiente:
            config.ambiente,

          estab:
            config.estab,

          ptoEmi:
            config.ptoEmi,

          secuencial:
            sequential,

          codigoNumerico:
            numeric,

          tipoEmision:
            "1"
        });

      const paymentForm =
        text(
          support.formaPago
        )
        ||
        "01";

      return {
        tipoDocumento:
          "RETENCION",

        codDoc:
          DOCUMENTOS.RETENCION,

        versionXml:
          "2.0.0",

        fechaEmision:
          emission.xml,

        fechaIso:
          emission.iso,

        ambiente:
          String(
            config.ambiente
            ||
            "1"
          ),

        tipoEmision:
          "1",

        estab:
          pad(
            config.estab,
            3
          ),

        ptoEmi:
          pad(
            config.ptoEmi,
            3
          ),

        secuencial:
          sequential,

        numero:
          pad(
            config.estab,
            3
          )
          +
          "-"
          +
          pad(
            config.ptoEmi,
            3
          )
          +
          "-"
          +
          sequential,

        codigoNumerico:
          numeric,

        claveAcceso:
          accessKey,

        emisor: {
          razonSocial:
            text(
              config.razonSocial
            ),

          nombreComercial:
            text(
              config.nombreComercial
            ),

          ruc:
            pad(
              config.ruc,
              13
            ),

          dirMatriz:
            text(
              config.dirMatriz
            ),

          dirEstablecimiento:
            text(
              config.dirEstablecimiento
              ||
              config.dirMatriz
            ),

          obligadoContabilidad:
            config.obligadoContabilidad
              ? "SI"
              : "NO",

          contribuyenteEspecial:
            text(
              config.contribuyenteEspecial
            )
        },

        sujetoRetenido: {
          tipoIdentificacion:
            idType.code,

          razonSocial:
            subjectName,

          identificacion:
            idType.id,

          parteRel:
            text(
              subject.parteRel
            )
            ===
            "SI"
              ? "SI"
              : "NO",

          tipoSujetoRetenido:
            text(
              subject.tipoSujetoRetenido
            )
        },

        periodoFiscal:
          fiscalPeriod,

        docsSustento: [
          {
            codSustento:
              supportCode,

            codDocSustento:
              supportDocCode,

            numDocSustento:
              supportNumber,

            fechaEmisionDocSustento:
              supportDate.xml,

            fechaRegistroContable:
              registerDate
                ? registerDate.xml
                : "",

            numAutDocSustento:
              text(
                support.numAutDocSustento
              )
                .replace(
                  /\D/g,
                  ""
                ),

            pagoLocExt:
              "01",

            totalSinImpuestos:
              baseWithoutTax,

            importeTotal:
              totalPurchase,

            impuestosDocSustento: [
              {
                codImpuestoDocSustento:
                  "2",

                codigoPorcentaje:
                  ivaCode(
                    ivaRate
                  ),

                baseImponible:
                  baseWithoutTax,

                tarifa:
                  ivaRate,

                valorImpuesto:
                  taxValue
              }
            ],

            retenciones:
              normalizedRetentions,

            pagos: [
              {
                formaPago:
                  paymentForm,

                total:
                  totalPurchase
              }
            ]
          }
        ],

        retenciones:
          normalizedRetentions,

        documentoSustento: {
          codSustento:
            supportCode,

          codDocSustento:
            supportDocCode,

          numero:
            supportNumber,

          fechaEmision:
            supportDate.xml,

          autorizacion:
            text(
              support.numAutDocSustento
            ),

          totalSinImpuestos:
            baseWithoutTax,

          importeTotal:
            totalPurchase,

          ivaTarifa:
            ivaRate,

          valorIva:
            taxValue
        },

        comprador: {
          razonSocial:
            subjectName,

          identificacion:
            idType.id,

          email:
            text(
              subject.email
            )
        },

        detalles:
          normalizedRetentions.map(
            line => ({
              codigoInterno:
                line.codigoRetencion,

              descripcion:
                (
                  line.codigo === "1"
                    ? "Retención Renta"
                    : line.codigo === "2"
                      ? "Retención IVA"
                      : "Retención ISD"
                )
                +
                " · "
                +
                line.porcentajeRetener
                +
                "%",

              cantidad: 1,

              precioUnitario:
                line.valorRetenido,

              descuento: 0,

              precioTotalSinImpuesto:
                line.valorRetenido
            })
          ),

        totales: {
          totalSinImpuestos:
            baseWithoutTax,

          totalDescuento: 0,

          taxes: [],

          totalIva:
            taxValue,

          importeTotal:
            totalRetained,

          totalRetenido:
            totalRetained,

          importeDocumentoSustento:
            totalPurchase
        }
      };
    }


    function buildRetentionXml(
      retention
    ) {

      const e =
        xmlEscape;

      const emitter =
        retention.emisor;

      const subject =
        retention.sujetoRetenido;

      const docs =
        (retention.docsSustento || [])
          .map(
            doc => {

              const taxes =
                (doc.impuestosDocSustento || [])
                  .map(
                    tax =>
                      [
                        "<impuestoDocSustento>",
                        "<codImpuestoDocSustento>",
                        e(
                          tax.codImpuestoDocSustento
                        ),
                        "</codImpuestoDocSustento>",
                        "<codigoPorcentaje>",
                        e(
                          tax.codigoPorcentaje
                        ),
                        "</codigoPorcentaje>",
                        "<baseImponible>",
                        decimal(
                          tax.baseImponible
                        ),
                        "</baseImponible>",
                        "<tarifa>",
                        decimal(
                          tax.tarifa
                        ),
                        "</tarifa>",
                        "<valorImpuesto>",
                        decimal(
                          tax.valorImpuesto
                        ),
                        "</valorImpuesto>",
                        "</impuestoDocSustento>"
                      ].join("")
                  )
                  .join("");

              const retained =
                (doc.retenciones || [])
                  .map(
                    line =>
                      [
                        "<retencion>",
                        "<codigo>",
                        e(
                          line.codigo
                        ),
                        "</codigo>",
                        "<codigoRetencion>",
                        e(
                          line.codigoRetencion
                        ),
                        "</codigoRetencion>",
                        "<baseImponible>",
                        decimal(
                          line.baseImponible
                        ),
                        "</baseImponible>",
                        "<porcentajeRetener>",
                        decimal(
                          line.porcentajeRetener
                        ),
                        "</porcentajeRetener>",
                        "<valorRetenido>",
                        decimal(
                          line.valorRetenido
                        ),
                        "</valorRetenido>",
                        "</retencion>"
                      ].join("")
                  )
                  .join("");

              const payments =
                (doc.pagos || [])
                  .map(
                    payment =>
                      [
                        "<pago>",
                        "<formaPago>",
                        e(
                          payment.formaPago
                        ),
                        "</formaPago>",
                        "<total>",
                        decimal(
                          payment.total
                        ),
                        "</total>",
                        "</pago>"
                      ].join("")
                  )
                  .join("");

              return [
                "<docSustento>",
                "<codSustento>",
                e(
                  doc.codSustento
                ),
                "</codSustento>",
                "<codDocSustento>",
                e(
                  doc.codDocSustento
                ),
                "</codDocSustento>",
                "<numDocSustento>",
                e(
                  doc.numDocSustento
                ),
                "</numDocSustento>",
                "<fechaEmisionDocSustento>",
                e(
                  doc.fechaEmisionDocSustento
                ),
                "</fechaEmisionDocSustento>",
                doc.fechaRegistroContable
                  ? (
                      "<fechaRegistroContable>"
                      +
                      e(
                        doc.fechaRegistroContable
                      )
                      +
                      "</fechaRegistroContable>"
                    )
                  : "",
                doc.numAutDocSustento
                  ? (
                      "<numAutDocSustento>"
                      +
                      e(
                        doc.numAutDocSustento
                      )
                      +
                      "</numAutDocSustento>"
                    )
                  : "",
                "<pagoLocExt>01</pagoLocExt>",
                "<totalSinImpuestos>",
                decimal(
                  doc.totalSinImpuestos
                ),
                "</totalSinImpuestos>",
                "<importeTotal>",
                decimal(
                  doc.importeTotal
                ),
                "</importeTotal>",
                "<impuestosDocSustento>",
                taxes,
                "</impuestosDocSustento>",
                "<retenciones>",
                retained,
                "</retenciones>",
                "<pagos>",
                payments,
                "</pagos>",
                "</docSustento>"
              ].join("");
            }
          )
          .join("");

      const additional =
        retention.comprador
          ?.email
          ? (
              "<infoAdicional>"
              +
              '<campoAdicional nombre="Email">'
              +
              e(
                retention.comprador.email
              )
              +
              "</campoAdicional>"
              +
              "</infoAdicional>"
            )
          : "";

      return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<comprobanteRetencion id="comprobante" version="2.0.0">',
        "<infoTributaria>",
        "<ambiente>",
        e(
          retention.ambiente
        ),
        "</ambiente>",
        "<tipoEmision>1</tipoEmision>",
        "<razonSocial>",
        e(
          emitter.razonSocial
        ),
        "</razonSocial>",
        emitter.nombreComercial
          ? (
              "<nombreComercial>"
              +
              e(
                emitter.nombreComercial
              )
              +
              "</nombreComercial>"
            )
          : "",
        "<ruc>",
        e(
          emitter.ruc
        ),
        "</ruc>",
        "<claveAcceso>",
        e(
          retention.claveAcceso
        ),
        "</claveAcceso>",
        "<codDoc>07</codDoc>",
        "<estab>",
        e(
          retention.estab
        ),
        "</estab>",
        "<ptoEmi>",
        e(
          retention.ptoEmi
        ),
        "</ptoEmi>",
        "<secuencial>",
        e(
          retention.secuencial
        ),
        "</secuencial>",
        "<dirMatriz>",
        e(
          emitter.dirMatriz
        ),
        "</dirMatriz>",
        "</infoTributaria>",
        "<infoCompRetencion>",
        "<fechaEmision>",
        e(
          retention.fechaEmision
        ),
        "</fechaEmision>",
        emitter.dirEstablecimiento
          ? (
              "<dirEstablecimiento>"
              +
              e(
                emitter.dirEstablecimiento
              )
              +
              "</dirEstablecimiento>"
            )
          : "",
        emitter.contribuyenteEspecial
          ? (
              "<contribuyenteEspecial>"
              +
              e(
                emitter.contribuyenteEspecial
              )
              +
              "</contribuyenteEspecial>"
            )
          : "",
        emitter.obligadoContabilidad
          ? (
              "<obligadoContabilidad>"
              +
              e(
                emitter.obligadoContabilidad
              )
              +
              "</obligadoContabilidad>"
            )
          : "",
        "<tipoIdentificacionSujetoRetenido>",
        e(
          subject.tipoIdentificacion
        ),
        "</tipoIdentificacionSujetoRetenido>",
        subject.tipoIdentificacion === "06"
        &&
        subject.tipoSujetoRetenido
          ? (
              "<tipoSujetoRetenido>"
              +
              e(
                subject.tipoSujetoRetenido
              )
              +
              "</tipoSujetoRetenido>"
            )
          : "",
        "<parteRel>",
        e(
          subject.parteRel
        ),
        "</parteRel>",
        "<razonSocialSujetoRetenido>",
        e(
          subject.razonSocial
        ),
        "</razonSocialSujetoRetenido>",
        "<identificacionSujetoRetenido>",
        e(
          subject.identificacion
        ),
        "</identificacionSujetoRetenido>",
        "<periodoFiscal>",
        e(
          retention.periodoFiscal
        ),
        "</periodoFiscal>",
        "</infoCompRetencion>",
        "<docsSustento>",
        docs,
        "</docsSustento>",
        additional,
        "</comprobanteRetencion>"
      ].join("");
    }



    function buildXml(
      invoice
    ) {

      const e =
        xmlEscape;

      const infoContribuyenteEspecial =
        invoice.emisor
          .contribuyenteEspecial
          ?
          (
            "<contribuyenteEspecial>"
            +
            e(
              invoice.emisor
                .contribuyenteEspecial
            )
            +
            "</contribuyenteEspecial>"
          )
          :
          "";

      const regimenField =
        invoice.emisor
          .regimen
          ?
          (
            '<campoAdicional nombre="Regimen">'
            +
            e(
              invoice.emisor
                .regimen
            )
            +
            "</campoAdicional>"
          )
          :
          "";

      const totalTaxes =
        invoice.totales
          .taxes
          .map(
            tax =>
              [
                "<totalImpuesto>",
                "<codigo>2</codigo>",
                "<codigoPorcentaje>",
                e(
                  tax.codigoPorcentaje
                ),
                "</codigoPorcentaje>",
                "<baseImponible>",
                decimal(
                  tax.baseImponible
                ),
                "</baseImponible>",
                "<valor>",
                decimal(
                  tax.valor
                ),
                "</valor>",
                "</totalImpuesto>"
              ].join("")
          )
          .join("");

      const details =
        invoice.detalles
          .map(
            item => {

              const variantInfo =
                [
                  item.color
                    ?
                    (
                      '<detAdicional nombre="Color" valor="'
                      +
                      e(
                        item.color
                      )
                      +
                      '"/>'
                    )
                    :
                    "",

                  item.talla
                    ?
                    (
                      '<detAdicional nombre="Talla" valor="'
                      +
                      e(
                        item.talla
                      )
                      +
                      '"/>'
                    )
                    :
                    ""
                ]
                  .filter(Boolean)
                  .join("");

              const additional =
                variantInfo
                  ?
                  (
                    "<detallesAdicionales>"
                    +
                    variantInfo
                    +
                    "</detallesAdicionales>"
                  )
                  :
                  "";

              return [
                "<detalle>",
                "<codigoPrincipal>",
                e(
                  item.codigoPrincipal
                ),
                "</codigoPrincipal>",
                "<descripcion>",
                e(
                  item.descripcion
                ),
                "</descripcion>",
                "<cantidad>",
                decimal(
                  item.cantidad,
                  6
                ),
                "</cantidad>",
                "<precioUnitario>",
                decimal(
                  item.precioUnitario,
                  6
                ),
                "</precioUnitario>",
                "<descuento>",
                decimal(
                  item.descuento
                ),
                "</descuento>",
                "<precioTotalSinImpuesto>",
                decimal(
                  item.precioTotalSinImpuesto
                ),
                "</precioTotalSinImpuesto>",
                additional,
                "<impuestos>",
                "<impuesto>",
                "<codigo>2</codigo>",
                "<codigoPorcentaje>",
                e(
                  item.ivaCodigo
                ),
                "</codigoPorcentaje>",
                "<tarifa>",
                decimal(
                  item.ivaTarifa
                ),
                "</tarifa>",
                "<baseImponible>",
                decimal(
                  item.precioTotalSinImpuesto
                ),
                "</baseImponible>",
                "<valor>",
                decimal(
                  item.iva
                ),
                "</valor>",
                "</impuesto>",
                "</impuestos>",
                "</detalle>"
              ].join("");
            }
          )
          .join("");

      const extras = [
        invoice.comprador.email
          ?
          (
            '<campoAdicional nombre="Email">'
            +
            e(
              invoice.comprador.email
            )
            +
            "</campoAdicional>"
          )
          :
          "",

        invoice.comprador.telefono
          ?
          (
            '<campoAdicional nombre="Telefono">'
            +
            e(
              invoice.comprador.telefono
            )
            +
            "</campoAdicional>"
          )
          :
          "",

        invoice.comprador.direccion
          ?
          (
            '<campoAdicional nombre="Direccion">'
            +
            e(
              invoice.comprador.direccion
            )
            +
            "</campoAdicional>"
          )
          :
          "",

        invoice.pedido.numero
          ?
          (
            '<campoAdicional nombre="Pedido SIXTEEN">'
            +
            e(
              invoice.pedido.numero
            )
            +
            "</campoAdicional>"
          )
          :
          "",

        regimenField
      ]
        .filter(Boolean)
        .join("");

      return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<factura id="comprobante" version="',
        e(
          invoice.versionXml
        ),
        '">',
        "<infoTributaria>",
        "<ambiente>",
        e(
          invoice.ambiente
        ),
        "</ambiente>",
        "<tipoEmision>1</tipoEmision>",
        "<razonSocial>",
        e(
          invoice.emisor
            .razonSocial
        ),
        "</razonSocial>",
        invoice.emisor
          .nombreComercial
          ?
          (
            "<nombreComercial>"
            +
            e(
              invoice.emisor
                .nombreComercial
            )
            +
            "</nombreComercial>"
          )
          :
          "",
        "<ruc>",
        e(
          invoice.emisor.ruc
        ),
        "</ruc>",
        "<claveAcceso>",
        e(
          invoice.claveAcceso
        ),
        "</claveAcceso>",
        "<codDoc>01</codDoc>",
        "<estab>",
        e(
          invoice.estab
        ),
        "</estab>",
        "<ptoEmi>",
        e(
          invoice.ptoEmi
        ),
        "</ptoEmi>",
        "<secuencial>",
        e(
          invoice.secuencial
        ),
        "</secuencial>",
        "<dirMatriz>",
        e(
          invoice.emisor
            .dirMatriz
        ),
        "</dirMatriz>",
        "</infoTributaria>",
        "<infoFactura>",
        "<fechaEmision>",
        e(
          invoice.fechaEmision
        ),
        "</fechaEmision>",
        "<dirEstablecimiento>",
        e(
          invoice.emisor
            .dirEstablecimiento
        ),
        "</dirEstablecimiento>",
        infoContribuyenteEspecial,
        "<obligadoContabilidad>",
        e(
          invoice.emisor
            .obligadoContabilidad
        ),
        "</obligadoContabilidad>",
        "<tipoIdentificacionComprador>",
        e(
          invoice.comprador
            .tipoIdentificacion
        ),
        "</tipoIdentificacionComprador>",
        "<razonSocialComprador>",
        e(
          invoice.comprador
            .razonSocial
        ),
        "</razonSocialComprador>",
        "<identificacionComprador>",
        e(
          invoice.comprador
            .identificacion
        ),
        "</identificacionComprador>",
        "<totalSinImpuestos>",
        decimal(
          invoice.totales
            .totalSinImpuestos
        ),
        "</totalSinImpuestos>",
        "<totalDescuento>",
        decimal(
          invoice.totales
            .totalDescuento
        ),
        "</totalDescuento>",
        "<totalConImpuestos>",
        totalTaxes,
        "</totalConImpuestos>",
        "<propina>0.00</propina>",
        "<importeTotal>",
        decimal(
          invoice.totales
            .importeTotal
        ),
        "</importeTotal>",
        "<moneda>DOLAR</moneda>",
        "<pagos>",
        "<pago>",
        "<formaPago>",
        e(
          invoice.pago
            .formaPago
        ),
        "</formaPago>",
        "<total>",
        decimal(
          invoice.pago.total
        ),
        "</total>",
        "</pago>",
        "</pagos>",
        "</infoFactura>",
        "<detalles>",
        details,
        "</detalles>",
        extras
          ?
          (
            "<infoAdicional>"
            +
            extras
            +
            "</infoAdicional>"
          )
          :
          "",
        "</factura>"
      ].join("");
    }

    return {
      DOCUMENTOS,
      IVA_CODES,
      PAYMENT_CODES,
      money,
      decimal,
      pad,
      xmlEscape,
      modulo11,
      dateParts,
      claveAcceso,
      tipoIdentificacion,
      paymentCode,
      ivaCode,
      numericCode,
      normalizeProducts,
      totals,
      buildInvoice,
      buildCreditNote,
      buildCreditNotePartial,
      buildCreditNoteXml,
      buildDebitNote,
      buildDebitNoteXml,
      buildGuideRemision,
      buildGuideRemisionXml,
      retentionIvaCode,
      buildRetention,
      buildRetentionXml,
      validateConfig,
      buildXml
    };
  }
);
