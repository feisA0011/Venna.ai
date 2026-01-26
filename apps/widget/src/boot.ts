const scriptTag = document.currentScript as HTMLScriptElement | null;
const venueId = scriptTag?.dataset.venueId ?? "";
const apiBase = scriptTag?.dataset.apiBase ?? "";

const loadUi = () => {
  if (document.getElementById("venna-widget-ui")) return;
  const script = document.createElement("script");
  script.id = "venna-widget-ui";
  script.src = `${apiBase}/widget/ui.js`;
  script.defer = true;
  script.dataset.venueId = venueId;
  script.dataset.apiBase = apiBase;
  document.body.appendChild(script);
};

const attachIntent = () => {
  const intentEvents: (keyof HTMLElementEventMap)[] = ["click", "mouseover"];
  intentEvents.forEach((event) => {
    window.addEventListener(event, loadUi, { once: true, passive: true });
  });
};

attachIntent();
