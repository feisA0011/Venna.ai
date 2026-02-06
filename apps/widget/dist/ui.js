"use strict";(()=>{var _=document.currentScript,C=_?.dataset.venueId??"",f=_?.dataset.apiBase??"",n={open:!1,token:"",conversationId:typeof crypto<"u"&&"randomUUID"in crypto?crypto.randomUUID():`conv_${Date.now()}`,theme:{accent:"#fe1541",background:"rgba(255,255,255,0.16)",foreground:"#111111",glassAlpha:.16,radius:18}},E=async()=>{if(n.token||!f)return;let e=await fetch(`${f}/api/widget/token`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({venueId:C})});if(!e.ok)return;let a=await e.json();n.token=a.token},Y=()=>{let e=document.createElement("div");return e.id="venna-widget",document.body.appendChild(e),{root:e.attachShadow({mode:"open"}),host:e}},{root:T,host:c}=Y(),N=e=>{n.theme={accent:e.accent??n.theme.accent,background:e.background??n.theme.background,foreground:e.foreground??n.theme.foreground,glassAlpha:e.glassAlpha??n.theme.glassAlpha,radius:e.radius??n.theme.radius},c.style.setProperty("--venna-accent",n.theme.accent),c.style.setProperty("--venna-bg",n.theme.background),c.style.setProperty("--venna-fg",n.theme.foreground),c.style.setProperty("--venna-glass-alpha",String(n.theme.glassAlpha)),c.style.setProperty("--venna-radius",`${n.theme.radius}px`)};window.VennaWidget={init:e=>N(e)};N({});var S=document.createElement("style");S.textContent=`
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
`;T.appendChild(S);var b=document.createElement("div");b.className="venna-root";var s=document.createElement("button");s.type="button";s.className="venna-orb";s.setAttribute("aria-label","Open Venna chat");var V=document.createElement("span");V.className="venna-orb__shine";var y=document.createElement("span");y.className="venna-orb__label";y.textContent="Venna";s.appendChild(V);s.appendChild(y);var o=document.createElement("div");o.className="venna-chat";var m=document.createElement("div");m.className="venna-chat__header";var A=document.createElement("div");A.textContent="Venue";var w=document.createElement("div");w.className="venna-chat__status";w.textContent="Online";var l=document.createElement("button");l.className="venna-chat__close";l.setAttribute("aria-label","Close chat");l.textContent="\xD7";var i=document.createElement("div");i.style.display="flex";i.style.flexDirection="column";i.style.gap="4px";i.appendChild(A);i.appendChild(w);m.appendChild(i);m.appendChild(l);var t=document.createElement("div");t.className="venna-chat__messages";var d=document.createElement("div");d.className="venna-typing";d.setAttribute("aria-hidden","true");for(let e=0;e<3;e+=1)d.appendChild(document.createElement("span"));var u=document.createElement("div");u.className="venna-inputbar";var r=document.createElement("textarea");r.className="venna-input";r.rows=1;r.placeholder="Ask about hours, menu, policies...";var v=document.createElement("button");v.className="venna-send";v.setAttribute("aria-label","Send message");u.appendChild(r);u.appendChild(v);o.appendChild(m);o.appendChild(t);o.appendChild(d);o.appendChild(u);b.appendChild(s);b.appendChild(o);T.appendChild(b);d.style.display="none";var L=()=>t.scrollHeight-t.scrollTop-t.clientHeight<36,g=(e,a)=>{let p=L(),h=document.createElement("div");h.className=`venna-msg venna-msg--${a}`;let x=document.createElement("div");x.className="venna-msg__bubble venna-msg__enter",x.textContent=e,h.appendChild(x),t.appendChild(h),p&&t.scrollTo({top:t.scrollHeight,behavior:"smooth"})},k=e=>{d.style.display=e?"inline-flex":"none"},O=()=>{let e=!n.open,a=()=>{n.open=e,o.classList.toggle("is-open",n.open),n.open&&E().catch(()=>{})};document.startViewTransition?document.startViewTransition(a):a()};s.addEventListener("click",O);l.addEventListener("click",O);var I=async()=>{let e=r.value.trim();if(!e)return;g(e,"user"),r.value="",k(!0),await E();let a=await fetch(`${f}/api/widget/answer`,{method:"POST",headers:{"Content-Type":"application/json","X-Venna-Token":n.token},body:JSON.stringify({venueId:C,conversationId:n.conversationId,question:e})});if(k(!1),!a.ok){g("We could not reach the venue right now.","assistant");return}let p=await a.json();g(p.message,"assistant"),p.type==="escalation"&&g("I've escalated this to venue staff.","assistant")};v.addEventListener("click",()=>{I().catch(()=>{})});r.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),I().catch(()=>{}))});})();
