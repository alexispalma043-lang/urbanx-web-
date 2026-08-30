// @ts-nocheck

(function () {
  "use strict";

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

    function setLink(id, href, text = "", allowedProtocols = ["https:"]) {
      const node = $(id);
      if (!node) return false;

      const cleanHref = String(href || "").trim();
      if (!cleanHref) {
        node.hidden = true;
        node.removeAttribute("href");
        return false;
      }

      let protocol = "";
      try {
        protocol = new URL(cleanHref, window.location.href).protocol;
      } catch (_) {
        node.hidden = true;
        node.removeAttribute("href");
        return false;
      }

      if (!allowedProtocols.includes(protocol)) {
        node.hidden = true;
        node.removeAttribute("href");
        return false;
      }

      node.hidden = false;
      node.href = cleanHref;
      if (text) node.textContent = text;
      return true;
    }

    setText("legalNombreComercial", value("commercialName", "SIXTEEN"));
    setText("legalNombreResponsable", value("legalName", "Dato legal pendiente de completar"));
    setText("legalRuc", value("ruc", "Dato legal pendiente de completar"));

    const domicilio = [value("address"), value("city"), value("country")]
      .filter(Boolean)
      .join(", ");

    setText(
      "legalDomicilio",
      domicilio && (value("address") || value("city"))
        ? domicilio
        : `${value("country", "Ecuador")} · domicilio legal pendiente de completar`
    );
    setText("legalActualizado", value("policiesUpdated", "Fecha pendiente de actualización"));

    const email = value("supportEmail");
    setText("supportEmailText", email || "Correo de soporte por configurar");
    setText("privacyEmailText", email || "Correo de privacidad por configurar");
    setText("legalEmailText", email || "Dato legal pendiente de completar");

    const emailOk = setLink(
      "supportEmailLink",
      email ? "mailto:" + email : "",
      email,
      ["mailto:"]
    );
    setLink(
      "privacyEmailLink",
      email ? "mailto:" + email : "",
      email,
      ["mailto:"]
    );

    const emailFallback = $("supportEmailFallback");
    if (emailFallback) emailFallback.hidden = emailOk;

    const phone = value("phone");
    setText("supportPhoneText", phone || "No publicado");
    setText("legalPhoneText", phone || "Dato legal pendiente de completar");
    setLink(
      "supportPhoneLink",
      phone ? "tel:" + phone.replace(/[^\d+]/g, "") : "",
      phone,
      ["tel:"]
    );

    const whatsapp = value("whatsapp").replace(/[^\d]/g, "");
    setLink(
      "supportWhatsappLink",
      whatsapp ? "https://wa.me/" + whatsapp : "",
      "WHATSAPP",
      ["https:"]
    );

    setLink("supportInstagramLink", value("instagram"), "INSTAGRAM", ["https:"]);
    setLink("supportFacebookLink", value("facebook"), "FACEBOOK", ["https:"]);
    setLink("supportTiktokLink", value("tiktok"), "TIKTOK", ["https:"]);

    setText(
      "supportHoursText",
      value("supportHours", "Horario de atención por configurar")
    );

    const faqButtons = Array.from(document.querySelectorAll("[data-faq-button]"));

    function closeFaq(button) {
      const item = button.closest(".faq-item");
      const answer = item?.querySelector(".faq-answer");
      item?.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      if (answer) answer.hidden = true;
    }

    function openFaq(button) {
      faqButtons.forEach(other => {
        if (other !== button) closeFaq(other);
      });

      const item = button.closest(".faq-item");
      const answer = item?.querySelector(".faq-answer");
      item?.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      if (answer) answer.hidden = false;
    }

    faqButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const expanded = button.getAttribute("aria-expanded") === "true";
        if (expanded) closeFaq(button);
        else openFaq(button);
      });
    });

    const hash = String(window.location.hash || "");
    if (hash.startsWith("#faq-") && !hash.endsWith("-button")) {
      const answer = document.querySelector(hash);
      const buttonId = answer?.getAttribute("aria-labelledby");
      const button = buttonId ? document.getElementById(buttonId) : null;
      if (button) {
        openFaq(button);
        requestAnimationFrame(() => button.scrollIntoView({ block: "center" }));
      }
    }
  });
})();
