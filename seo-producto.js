// @ts-nocheck
(function () {
  "use strict";

  const SITE =
    "https://alexispalma043-lang.github.io/urbanx-web-/";

  let currentProduct =
    null;

  function meta(
    selector,
    value
  ) {
    const node =
      document.querySelector(
        selector
      );

    if (node) {
      node.setAttribute(
        "content",
        value
      );
    }
  }

  function safeImage(value) {
    const image =
      String(
        value ||
        ""
      ).trim();

    if (
      /^https:\/\//i.test(
        image
      )
    ) {
      return image;
    }

    return (
      SITE +
      "assets/og-sixteen.png"
    );
  }

  function stockTotal(product) {
    try {
      if (
        window.SIXTEEN_VARIANTS
          ?.totalStock
      ) {
        return Math.max(
          0,
          Number(
            window
              .SIXTEEN_VARIANTS
              .totalStock(
                product
              )
          ) ||
          0
        );
      }
    } catch (_) {}

    return Math.max(
      0,
      Number(
        product?.stock ||
        0
      ) ||
      0
    );
  }

  function schemaNode() {
    return document
      .getElementById(
        "productStructuredData"
      );
  }

  function readSchema() {
    const node =
      schemaNode();

    if (!node) {
      return null;
    }

    try {
      return JSON.parse(
        node.textContent ||
        "{}"
      );
    } catch (_) {
      return {};
    }
  }

  function writeSchema(data) {
    const node =
      schemaNode();

    if (!node) {
      return;
    }

    node.textContent =
      JSON.stringify(data);
  }

  function updateProduct(product) {
    if (!product) {
      return;
    }

    const code =
      String(
        product.codigo ||
        ""
      )
        .trim()
        .toUpperCase();

    if (!code) {
      return;
    }

    currentProduct =
      product;

    const name =
      String(
        product.nombre ||
        "Producto SIXTEEN"
      ).trim();

    const category =
      String(
        product.categoria ||
        "Urban Luxury"
      ).trim();

    const description =
      String(
        product.descripcion ||
        `${name} de SIXTEEN Urban Luxury. Moda urbana premium en Ecuador.`
      )
        .replace(
          /\s+/g,
          " "
        )
        .trim()
        .slice(
          0,
          160
        );

    const image =
      safeImage(
        product.imagen
      );

    const url =
      SITE +
      "producto.html?id=" +
      encodeURIComponent(
        code
      );

    const price =
      Math.max(
        0,
        Number(
          product.precio ||
          0
        ) ||
        0
      );

    const stock =
      stockTotal(
        product
      );

    const title =
      name +
      " | SIXTEEN Urban Luxury";

    document.title =
      title;

    meta(
      'meta[name="description"]',
      description
    );

    meta(
      'meta[name="robots"]',
      "index,follow,max-image-preview:large"
    );

    meta(
      'meta[property="og:title"]',
      title
    );

    meta(
      'meta[property="og:description"]',
      description
    );

    meta(
      'meta[property="og:image"]',
      image
    );

    meta(
      'meta[property="og:url"]',
      url
    );

    meta(
      'meta[name="twitter:title"]',
      title
    );

    meta(
      'meta[name="twitter:description"]',
      description
    );

    meta(
      'meta[name="twitter:image"]',
      image
    );

    const canonical =
      document.querySelector(
        'link[rel="canonical"]'
      );

    if (canonical) {
      canonical.href =
        url;
    }

    writeSchema({
      "@context":
        "https://schema.org",

      "@type":
        "Product",

      "name":
        name,

      "sku":
        code,

      "category":
        category,

      "brand":
        {
          "@type":
            "Brand",
          "name":
            "SIXTEEN"
        },

      "description":
        description,

      "image":
        [image],

      "url":
        url,

      "offers":
        {
          "@type":
            "Offer",

          "url":
            url,

          "priceCurrency":
            "USD",

          "price":
            price.toFixed(2),

          "availability":
            stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",

          "itemCondition":
            "https://schema.org/NewCondition",

          "seller":
            {
              "@type":
                "Organization",
              "name":
                "SIXTEEN Urban Luxury"
            }
        }
    });
  }

  function updateRating(
    total,
    average
  ) {
    if (!currentProduct) {
      return;
    }

    const schema =
      readSchema();

    if (
      !schema ||
      schema["@type"] !==
        "Product"
    ) {
      return;
    }

    const count =
      Math.max(
        0,
        Math.round(
          Number(total) ||
          0
        )
      );

    const rating =
      Math.max(
        0,
        Math.min(
          5,
          Number(average) ||
          0
        )
      );

    if (
      count > 0 &&
      rating > 0
    ) {
      schema.aggregateRating =
        {
          "@type":
            "AggregateRating",

          "ratingValue":
            rating.toFixed(1),

          "reviewCount":
            count,

          "bestRating":
            "5",

          "worstRating":
            "1"
        };
    } else {
      delete schema
        .aggregateRating;
    }

    writeSchema(
      schema
    );
  }

  window.SIXTEEN_SEO =
    {
      updateProduct,
      updateRating
    };
})();
