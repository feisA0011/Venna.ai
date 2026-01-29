"use strict";
(() => {
  // src/boot.ts
  var bootScriptTag = document.currentScript;
  var bootVenueId = bootScriptTag?.dataset.venueId ?? "";
  var bootApiBase = bootScriptTag?.dataset.apiBase ?? "";
  var widgetBase = new URL(bootScriptTag.src).origin;
  var loadUi = () => {
    if (document.getElementById("venna-widget-ui")) return;
    const script = document.createElement("script");
    script.id = "venna-widget-ui";
    script.src = `${widgetBase}/ui.js`;
    script.defer = true;
    script.dataset.venueId = bootVenueId;
    script.dataset.apiBase = bootApiBase;
    document.body.appendChild(script);
  };
  var attachIntent = () => {
    const intentEvents = ["click", "mouseover"];
    intentEvents.forEach((event) => {
      window.addEventListener(event, loadUi, { once: true, passive: true });
    });
  };
  attachIntent();
})();
//# sourceMappingURL=boot.js.map
