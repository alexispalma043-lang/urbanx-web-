// @ts-nocheck

document.addEventListener("DOMContentLoaded", function () {
  const config = window.SIXTEEN_STORE_CONFIG || {};
  const $ = id => document.getElementById(id);

  function value(key, fallback = "") {
    return String(config[key] || fallback || "").trim();
  }

  function setText(id, text) {
    const node = $(id);
    if (node) node.textContent = text;
  }

  function setLink(id, href, text = "") {
    const node = $(id);
    if (!node) return;

    const cleanHref = String(href || "").trim();

    if (!cleanHref) {
      node.hidden = true;
      return;
    }

    node.hidden = false;
    node.href = cleanHref;
    if (text) node.textContent = text;
  }

  setText("legalMarca", value("brand", "SIXTEEN Urban Luxury"));
  setText("legalNombreComercial", value("commercialName", "SIXTEEN"));
  setText("legalNombreResponsable", value("legalName", value("brand", "SIXTEEN Urban Luxury")));
  setText("legalRuc", value("ruc", "Dato por registrar antes de publicación"));

  const domicilio = [value("address"), value("city"), value("country")]
    .filter(Boolean)
    .join(", ");

  setText("legalDomicilio", domicilio || value("country", "Ecuador"));
  setText("legalActualizado", value("policiesUpdated"));

  const email = value("supportEmail");
  setText("supportEmailText", email || "Correo de soporte por configurar");
  setText("privacyEmailText", email || "Correo de privacidad por configurar");
  setLink("supportEmailLink", email ? "mailto:" + email : "", email);
  setLink("privacyEmailLink", email ? "mailto:" + email : "", email);

  const phone = value("phone");
  setText("supportPhoneText", phone || "No publicado");
  setLink(
    "supportPhoneLink",
    phone ? "tel:" + phone.replace(/[^\d+]/g, "") : "",
    phone
  );

  const whatsapp = value("whatsapp").replace(/[^\d]/g, "");
  setLink(
    "supportWhatsappLink",
    whatsapp ? "https://wa.me/" + whatsapp : "",
    "WHATSAPP"
  );

  setLink("supportInstagramLink", value("instagram"), "INSTAGRAM");
  setLink("supportFacebookLink", value("facebook"), "FACEBOOK");
  setLink("supportTiktokLink", value("tiktok"), "TIKTOK");

  setText(
    "supportHoursText",
    value("supportHours", "Horario de atención por configurar")
  );

  document.querySelectorAll("[data-faq-button]").forEach(function (button) {
    button.addEventListener("click", function () {
      const item = button.closest(".faq-item");
      if (!item) return;

      const open = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");

      const answer = item.querySelector(".faq-answer");
      if (answer) answer.hidden = !open;
    });
  });
});
