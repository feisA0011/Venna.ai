type VennaThemeOptions = {
  accent?: string;
  background?: string;
  foreground?: string;
  glassAlpha?: number;
  radius?: number;
};

declare global {
  interface Window {
    VennaWidget?: {
      init: (options: VennaThemeOptions) => void;
    };
  }
}

const scriptTag = document.currentScript as HTMLScriptElement | null;
const venueId = scriptTag?.dataset.venueId ?? "";
const apiBase = scriptTag?.dataset.apiBase ?? "";

const state = {
  open: false,
  token: "",
  theme: {
    accent: "#fe1541",
    background: "rgba(255,255,255,0.16)",
    foreground: "#111111",
    glassAlpha: 0.16,
    radius: 18
  }
};

const ensureToken = async () => {
  if (state.token || !apiBase) return;
  const response = await fetch(`${apiBase}/api/widget/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ venueId })
  });
  if (!response.ok) return;
  const data = (await response.json()) as { token: string };
  state.token = data.token;
};

const createShadowRoot = () => {
  const host = document.createElement("div");
  host.id = "venna-widget";
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });
  return { root, host };
};

const { root, host } = createShadowRoot();

const applyTheme = (options: VennaThemeOptions) => {
  state.theme = {
    accent: options.accent ?? state.theme.accent,
    background: options.background ?? state.theme.background,
    foreground: options.foreground ?? state.theme.foreground,
    glassAlpha: options.glassAlpha ?? state.theme.glassAlpha,
    radius: options.radius ?? state.theme.radius
  };
  host.style.setProperty("--venna-accent", state.theme.accent);
  host.style.setProperty("--venna-bg", state.theme.background);
  host.style.setProperty("--venna-fg", state.theme.foreground);
  host.style.setProperty("--venna-glass-alpha", String(state.theme.glassAlpha));
  host.style.setProperty("--venna-radius", `${state.theme.radius}px`);
};

window.VennaWidget = {
  init: (options: VennaThemeOptions) => applyTheme(options)
};

applyTheme({});

const style = document.createElement("style");
style.textContent = `
  :host {
    --venna-accent: #fe1541;
    --venna-bg: rgba(255,255,255,0.16);
    --venna-fg: #111111;
    --venna-glass-alpha: 0.16;
    --venna-radius: 18px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .venna-root {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
  }

  .venna-orb {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background:
      radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.95), rgba(255,255,255,0) 60%),
      radial-gradient(80% 80% at 70% 80%, rgba(0,0,0,0.3), rgba(0,0,0,0) 60%),
      radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 55%),
      color-mix(in srgb, var(--venna-accent) 18%, transparent);
    border: 1px solid rgba(255,255,255,0.22);
    box-shadow:
      0 12px 32px rgba(15,15,15,0.22),
      inset 0 -6px 12px rgba(0,0,0,0.15),
      inset 0 6px 14px rgba(255,255,255,0.35);
    backdrop-filter: blur(10px) saturate(160%);
    display: grid;
    place-items: center;
    cursor: pointer;
    position: relative;
    transform: translateZ(0);
    transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;
    will-change: transform;
  }

  .venna-orb__shine {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(120% 120% at 20% 18%, rgba(255,255,255,0.75), rgba(255,255,255,0) 40%);
    mask-image: radial-gradient(circle at 30% 20%, black 0%, transparent 65%);
    opacity: 0.7;
    pointer-events: none;
  }

  .venna-orb__label {
    font-size: 11px;
    color: var(--venna-fg);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .venna-orb::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    width: 70px;
    height: 14px;
    background: radial-gradient(closest-side, rgba(0,0,0,0.25), transparent 70%);
    transform: translateX(-50%);
    filter: blur(6px);
    opacity: 0.6;
    pointer-events: none;
  }

  .venna-orb:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow:
      0 16px 34px rgba(15,15,15,0.25),
      inset 0 -4px 12px rgba(0,0,0,0.15),
      inset 0 6px 18px rgba(255,255,255,0.4);
  }

  .venna-orb:active {
    transform: translateY(-1px) scale(0.98);
  }

  .venna-chat {
    position: absolute;
    bottom: 78px;
    right: 0;
    width: 320px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: calc(var(--venna-radius) + 4px);
    box-shadow:
      0 18px 40px rgba(0,0,0,0.18),
      inset 0 1px 0 rgba(255,255,255,0.25);
    backdrop-filter: blur(14px) saturate(160%);
    color: var(--venna-fg);
    display: flex;
    flex-direction: column;
    opacity: 0;
    transform: translateY(16px) scale(0.98);
    pointer-events: none;
    transition: opacity 240ms ease, transform 240ms ease;
    will-change: transform;
  }

  .venna-chat.is-open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  .venna-chat__header {
    padding: 14px 18px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    border-bottom: 1px solid rgba(255,255,255,0.18);
    background: radial-gradient(150% 120% at 20% 0%, rgba(255,255,255,0.28), rgba(255,255,255,0));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .venna-chat__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: rgba(17,17,17,0.7);
  }

  .venna-chat__status::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--venna-accent);
    box-shadow: 0 0 6px color-mix(in srgb, var(--venna-accent) 65%, transparent);
  }

  .venna-chat__close {
    border: none;
    background: transparent;
    color: var(--venna-fg);
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 999px;
  }

  .venna-chat__messages {
    padding: 14px 18px 4px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 260px;
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .venna-msg {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .venna-msg--assistant {
    align-items: flex-start;
  }

  .venna-msg--user {
    align-items: flex-end;
  }

  .venna-msg__bubble {
    padding: 8px 12px;
    font-size: 12px;
    border-radius: calc(var(--venna-radius) - 6px);
    border: 1px solid rgba(255,255,255,0.22);
    box-shadow: 0 6px 14px rgba(0,0,0,0.08);
    backdrop-filter: blur(10px) saturate(150%);
    background:
      radial-gradient(120% 120% at 20% 20%, rgba(255,255,255,0.55), rgba(255,255,255,0.15) 55%),
      rgba(255,255,255,0.2);
    color: var(--venna-fg);
  }

  .venna-msg--user .venna-msg__bubble {
    background:
      radial-gradient(120% 120% at 20% 20%, rgba(255,255,255,0.4), rgba(255,255,255,0.12) 55%),
      color-mix(in srgb, var(--venna-accent) 10%, rgba(0,0,0,0.08));
    color: var(--venna-fg);
  }

  .venna-msg__enter {
    animation: venna-msg-in 200ms ease-out;
  }

  @keyframes venna-msg-in {
    from {
      opacity: 0;
      transform: translateY(8px);
      filter: blur(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  }

  .venna-typing {
    align-self: flex-start;
    display: inline-flex;
    gap: 6px;
    padding: 8px 12px;
    border-radius: calc(var(--venna-radius) - 6px);
    background: rgba(255,255,255,0.25);
    border: 1px solid rgba(255,255,255,0.22);
    backdrop-filter: blur(10px) saturate(150%);
  }

  .venna-typing span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(17,17,17,0.6);
    animation: venna-typing 1.2s infinite ease-in-out;
  }

  .venna-typing span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .venna-typing span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes venna-typing {
    0%, 100% {
      transform: translateY(0);
      opacity: 0.5;
    }
    50% {
      transform: translateY(-3px);
      opacity: 1;
    }
  }

  .venna-inputbar {
    display: flex;
    gap: 8px;
    padding: 12px 14px 14px;
    border-top: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(12px) saturate(160%);
  }

  .venna-input {
    flex: 1;
    border: none;
    background: rgba(255,255,255,0.2);
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--venna-fg);
    outline: none;
  }

  .venna-input:focus {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--venna-accent) 50%, transparent);
  }

  .venna-send {
    border: none;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background:
      radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.9), rgba(255,255,255,0) 60%),
      radial-gradient(80% 80% at 70% 80%, rgba(0,0,0,0.25), rgba(0,0,0,0) 60%),
      color-mix(in srgb, var(--venna-accent) 60%, transparent);
    border: 1px solid rgba(255,255,255,0.22);
    box-shadow: 0 8px 20px rgba(0,0,0,0.18);
    cursor: pointer;
    transition: transform 200ms ease, box-shadow 200ms ease;
  }

  .venna-send:hover {
    box-shadow: 0 10px 22px color-mix(in srgb, var(--venna-accent) 35%, rgba(0,0,0,0.18));
    transform: translateY(-1px);
  }

  .venna-send:active {
    transform: scale(0.96);
  }

  .venna-send:focus-visible,
  .venna-chat__close:focus-visible,
  .venna-orb:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--venna-accent) 50%, transparent);
    outline-offset: 2px;
  }

  @supports (view-transition-name: venna-widget) {
    .venna-chat {
      view-transition-name: venna-widget;
    }

    .venna-msg__enter {
      view-transition-name: venna-message;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .venna-orb,
    .venna-chat,
    .venna-msg__enter,
    .venna-typing span,
    .venna-send {
      transition: none;
      animation: none;
    }
  }
`;
root.appendChild(style);

const wrapper = document.createElement("div");
wrapper.className = "venna-root";

const orb = document.createElement("button");
orb.type = "button";
orb.className = "venna-orb";
orb.setAttribute("aria-label", "Open Venna chat");

const orbShine = document.createElement("span");
orbShine.className = "venna-orb__shine";

const orbLabel = document.createElement("span");
orbLabel.className = "venna-orb__label";
orbLabel.textContent = "Venna";

orb.appendChild(orbShine);
orb.appendChild(orbLabel);

const panel = document.createElement("div");
panel.className = "venna-chat";

const header = document.createElement("div");
header.className = "venna-chat__header";

const headerTitle = document.createElement("div");
headerTitle.textContent = "Venue";

const status = document.createElement("div");
status.className = "venna-chat__status";
status.textContent = "Online";

const closeButton = document.createElement("button");
closeButton.className = "venna-chat__close";
closeButton.setAttribute("aria-label", "Close chat");
closeButton.textContent = "×";

const headerLeft = document.createElement("div");
headerLeft.style.display = "flex";
headerLeft.style.flexDirection = "column";
headerLeft.style.gap = "4px";
headerLeft.appendChild(headerTitle);
headerLeft.appendChild(status);

header.appendChild(headerLeft);
header.appendChild(closeButton);

const messages = document.createElement("div");
messages.className = "venna-chat__messages";

const typing = document.createElement("div");
typing.className = "venna-typing";
typing.setAttribute("aria-hidden", "true");
for (let i = 0; i < 3; i += 1) {
  typing.appendChild(document.createElement("span"));
}

const inputRow = document.createElement("div");
inputRow.className = "venna-inputbar";

const input = document.createElement("textarea");
input.className = "venna-input";
input.rows = 1;
input.placeholder = "Ask about hours, menu, policies...";

const send = document.createElement("button");
send.className = "venna-send";
send.setAttribute("aria-label", "Send message");

inputRow.appendChild(input);
inputRow.appendChild(send);

panel.appendChild(header);
panel.appendChild(messages);
panel.appendChild(typing);
panel.appendChild(inputRow);

wrapper.appendChild(orb);
wrapper.appendChild(panel);
root.appendChild(wrapper);

typing.style.display = "none";

const isNearBottom = () => {
  const threshold = 36;
  return messages.scrollHeight - messages.scrollTop - messages.clientHeight < threshold;
};

const appendMessage = (content: string, type: "user" | "assistant") => {
  const shouldScroll = isNearBottom();
  const wrapperEl = document.createElement("div");
  wrapperEl.className = `venna-msg venna-msg--${type}`;

  const bubble = document.createElement("div");
  bubble.className = "venna-msg__bubble venna-msg__enter";
  bubble.textContent = content;

  wrapperEl.appendChild(bubble);
  messages.appendChild(wrapperEl);

  if (shouldScroll) {
    messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
  }
};

const showTyping = (visible: boolean) => {
  typing.style.display = visible ? "inline-flex" : "none";
};

const togglePanel = () => {
  const nextOpen = !state.open;
  const runToggle = () => {
    state.open = nextOpen;
    panel.classList.toggle("is-open", state.open);
    if (state.open) {
      ensureToken().catch(() => undefined);
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(runToggle);
  } else {
    runToggle();
  }
};

orb.addEventListener("click", togglePanel);
closeButton.addEventListener("click", togglePanel);

const sendQuestion = async () => {
  const question = input.value.trim();
  if (!question) return;
  appendMessage(question, "user");
  input.value = "";
  showTyping(true);
  await ensureToken();
  const response = await fetch(`${apiBase}/api/widget/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Venna-Token": state.token
    },
    body: JSON.stringify({ venueId, question })
  });
  showTyping(false);
  if (!response.ok) {
    appendMessage("We could not reach the venue right now.", "assistant");
    return;
  }
  const data = (await response.json()) as { answer: string; confidence: number };
  appendMessage(data.answer, "assistant");
  if (data.confidence < 0.7) {
    appendMessage("I'll ask staff to confirm.", "assistant");
  }
};

send.addEventListener("click", () => {
  sendQuestion().catch(() => undefined);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendQuestion().catch(() => undefined);
  }
});
