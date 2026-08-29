// @ts-nocheck
(function () {
  "use strict";

  if (
    typeof Element !== "undefined"
    &&
    typeof Element.prototype.scrollIntoView !== "function"
  ) {
    Element.prototype.scrollIntoView = function (options) {
      const rect = this.getBoundingClientRect();
      const currentY =
        window.pageYOffset ??
        document.documentElement.scrollTop ??
        document.body.scrollTop ??
        0;

      const block =
        typeof options === "object"
          ? String(options.block || "start")
          : "start";

      let top = rect.top + currentY;

      if (block === "center") {
        top -= Math.max(0, (window.innerHeight - rect.height) / 2);
      } else if (block === "end") {
        top -= Math.max(0, window.innerHeight - rect.height);
      }

      const behavior =
        typeof options === "object"
          ? String(options.behavior || "auto")
          : "auto";

      if (typeof window.scrollTo === "function") {
        try {
          window.scrollTo({
            top: Math.max(0, top),
            left: 0,
            behavior
          });
          return;
        } catch (_) {
          window.scrollTo(0, Math.max(0, top));
          return;
        }
      }

      document.documentElement.scrollTop = Math.max(0, top);
      document.body.scrollTop = Math.max(0, top);
    };
  }

  window.SIXTEEN_SCROLL_TO = function (target, options = {}) {
    const element =
      typeof target === "string"
        ? document.getElementById(target)
        : target;

    if (!element) return false;

    if (typeof element.scrollIntoView === "function") {
      element.scrollIntoView({
        behavior: options.behavior || "smooth",
        block: options.block || "start"
      });
      return true;
    }

    const rect = element.getBoundingClientRect();
    const y =
      rect.top
      +
      (
        window.pageYOffset
        ??
        document.documentElement.scrollTop
        ??
        0
      )
      -
      Number(options.offset || 0);

    if (typeof window.scrollTo === "function") {
      try {
        window.scrollTo({
          top: Math.max(0, y),
          behavior: options.behavior || "smooth"
        });
      } catch (_) {
        window.scrollTo(0, Math.max(0, y));
      }
      return true;
    }

    document.documentElement.scrollTop = Math.max(0, y);
    document.body.scrollTop = Math.max(0, y);
    return true;
  };
})();
