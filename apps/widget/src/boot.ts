const bootScriptTag = document.currentScript as HTMLScriptElement;
const bootVenueId = bootScriptTag?.dataset.venueId ?? "";
const bootApiBase = bootScriptTag?.dataset.apiBase ?? "";
const widgetBase = new URL(bootScriptTag.src).origin; // Get the widget server URL

const loadUi = () => {
  if (document.getElementById("venna-widget-ui")) return;

  const script = document.createElement("script");
  script.id = "venna-widget-ui";
  script.src = `${widgetBase}/ui.js`; // Load from widget server, not API
  script.defer = true;
  script.dataset.venueId = bootVenueId;
  script.dataset.apiBase = bootApiBase;
  document.body.appendChild(script);
};

const attachIntent = () => {
  const intentEvents = ["click", "mouseover"];
  intentEvents.forEach((event) => {
    window.addEventListener(event, loadUi, { once: true, passive: true });
  });
};

attachIntent();
