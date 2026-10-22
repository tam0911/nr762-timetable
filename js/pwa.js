const INSTALL_DISMISS_KEY = "nr762-install-dismissed";

function isIos() {
  const ua = navigator.userAgent;
  const classic = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return classic || iPadOS;
}

function isStandalone() {
  return window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
}

function isAppEntry() {
  const path = location.pathname;
  return path.endsWith("/") || path.endsWith("/index.html");
}

function readDismissed() {
  try {
    return localStorage.getItem(INSTALL_DISMISS_KEY) === "1";
  } catch (error) {
    return false;
  }
}

function writeDismissed() {
  try {
    localStorage.setItem(INSTALL_DISMISS_KEY, "1");
  } catch (error) {
    /* Private mode can block storage; the hint can show again next visit. */
  }
}

function shareChip() {
  const chip = document.createElement("span");
  chip.className = "share-chip";
  chip.setAttribute("aria-hidden", "true");
  chip.innerHTML =
    '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M12 16V4M8 8l4-4 4 4"/><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/></svg>';
  return chip;
}

function syncHintPadding() {
  const aside = document.getElementById("install-hint");
  if (!aside) {
    document.body.style.paddingBottom = "";
    return;
  }
  const covered = window.innerHeight - aside.getBoundingClientRect().top;
  document.body.style.paddingBottom = `${Math.ceil(covered + 16)}px`;
}

function removeHint() {
  document.getElementById("install-hint")?.remove();
  document.body.classList.remove("has-install-hint");
  document.body.style.paddingBottom = "";
}

function mountHint(title, textNode, actionLabel, onAction) {
  if (document.getElementById("install-hint") || readDismissed() || isStandalone()) return;

  const aside = document.createElement("aside");
  aside.id = "install-hint";
  aside.className = "install-hint";

  const heading = document.createElement("p");
  heading.className = "install-hint-title";
  heading.textContent = title;

  const actions = document.createElement("div");
  actions.className = "install-hint-actions";
  const action = document.createElement("button");
  action.type = "button";
  action.className = "install-hint-action";
  action.textContent = actionLabel;
  action.addEventListener("click", onAction);
  actions.append(action);

  aside.append(heading, textNode, actions);
  document.body.append(aside);
  document.body.classList.add("has-install-hint");
  syncHintPadding();
}

function showIosHint() {
  const text = document.createElement("p");
  text.className = "install-hint-text";
  text.append(
    "在 Safari 點",
    shareChip(),
    "分享，再選「加入主畫面」。之後可以從主畫面開啟，離線都可以查班次。"
  );
  mountHint("加到主畫面", text, "知道了", () => {
    writeDismissed();
    removeHint();
  });
}

function showAndroidHint(promptEvent) {
  const text = document.createElement("p");
  text.className = "install-hint-text";
  text.textContent = "安裝到主畫面後，可以像 App 一樣開啟，離線都可以查班次。";
  mountHint("安裝豫豐巴士", text, "安裝", async () => {
    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") writeDismissed();
    removeHint();
  });
}

function setupInstallHint() {
  if (!isAppEntry() || isStandalone() || readDismissed()) return;
  window.addEventListener("resize", () => requestAnimationFrame(syncHintPadding));
  if (isIos()) showIosHint();

  window.addEventListener("beforeinstallprompt", (event) => {
    if (isIos() || isStandalone() || readDismissed() || !isAppEntry()) return;
    event.preventDefault();
    showAndroidHint(event);
  });
  window.addEventListener("appinstalled", () => {
    writeDismissed();
    removeHint();
  });
}

function setupNetworkStatus() {
  const main = document.querySelector("main");
  if (!main) return;
  const status = document.createElement("p");
  status.className = "net-status";
  status.setAttribute("role", "status");
  status.hidden = true;
  main.prepend(status);

  let documentFromCache = false;
  const render = () => {
    const offline = !navigator.onLine || documentFromCache;
    status.hidden = !offline;
    status.textContent = offline ? "離線模式，顯示上次儲存的班次" : "";
  };
  window.addEventListener("online", render);
  window.addEventListener("offline", render);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (!event.data || typeof event.data.fromCache !== "boolean") return;
      documentFromCache = event.data.fromCache;
      render();
    });
    navigator.serviceWorker.ready
      .then((registration) => registration.active?.postMessage("net-status"))
      .catch(() => {});
  }
  render();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !isAppEntry()) return;
  navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {
    /* Registration fails on hosts without sw.js; the page still works online. */
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (isStandalone()) document.documentElement.classList.add("is-standalone");
  setupNetworkStatus();
  setupInstallHint();
  registerServiceWorker();
});
