const loadRemoteScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-remote-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Script load failed.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.remoteSrc = src;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error("Script load failed.")), { once: true });
    document.head.appendChild(script);
  });

const bootSoftNavigationObserver = () => {
  if (!("PerformanceObserver" in window)) {
    return;
  }

  const supported = PerformanceObserver.supportedEntryTypes?.includes("soft-navigation");
  document.documentElement.dataset.softNavigation = supported ? "supported" : "unavailable";
  if (!supported) {
    return;
  }

  const observer = new PerformanceObserver((list) => {
    if (list.getEntries().length > 0) {
      document.documentElement.dataset.softNavigation = "observed";
    }
  });

  observer.observe({ type: "soft-navigation", buffered: true });
};

const bootWebamp = () => {
  const launcher = document.querySelector("[data-webamp-launcher]");
  const panel = document.querySelector("[data-webamp-panel]");
  if (!launcher || !panel) {
    return;
  }

  const closeButtons = panel.querySelectorAll("[data-webamp-close]");
  const pipButton = panel.querySelector("[data-webamp-pip]");
  const status = panel.querySelector("[data-webamp-status]");
  const stage = panel.querySelector("[data-webamp-stage]");
  const webampScript = "https://cdn.jsdelivr.net/npm/webamp@1.5.0/built/webamp.bundle.min.js";
  let webampReady = null;
  let pipWindow = null;
  const stageHome = stage.parentElement;

  const syncPipLabel = () => {
    if (!pipButton) {
      return;
    }
    pipButton.textContent = pipWindow && !pipWindow.closed ? "Return to Page" : "Mini Window";
  };

  const setOpen = (open) => {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("has-webamp-open", open);
  };

  const openDock = () => {
    setOpen(true);
  };

  const closeDock = () => {
    setOpen(false);
  };

  const returnStageHome = () => {
    if (!stageHome.contains(stage)) {
      stageHome.appendChild(stage);
    }
  };

  const copyStyleSheets = (targetDocument) => {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        if (sheet.href) {
          const link = targetDocument.createElement("link");
          link.rel = "stylesheet";
          link.href = sheet.href;
          targetDocument.head.appendChild(link);
          return;
        }

        const style = targetDocument.createElement("style");
        style.textContent = Array.from(sheet.cssRules || [])
          .map((rule) => rule.cssText)
          .join("\n");
        targetDocument.head.appendChild(style);
      } catch {
        // Ignore cross-origin stylesheets that cannot be read.
      }
    });
  };

  const openPictureInPicture = async () => {
    if (!("documentPictureInPicture" in window)) {
      status.textContent = "Document Picture-in-Picture is not supported in this browser.";
      return;
    }

    await ensureWebamp();

    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
      return;
    }

    pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 430,
      height: 420,
      preferInitialWindowPlacement: true,
    });

    syncPipLabel();
    pipWindow.document.title = "Listening Desk";
    copyStyleSheets(pipWindow.document);

    const style = pipWindow.document.createElement("style");
    style.textContent = `
      body { margin: 0; padding: 0.8rem; background: #eef2f6; color: #16212d; font: 14px/1.5 Inter, system-ui, sans-serif; }
      .pip-shell { display: grid; gap: 0.75rem; }
      .pip-meta { display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
      .pip-meta h1 { margin: 0; font-size: 1rem; }
      .pip-meta p { margin: 0.15rem 0 0; color: #62707e; font-size: 0.88rem; }
      .pip-link { color: #183a61; font-weight: 600; text-decoration: none; }
      .pip-stage { min-height: 18rem; }
    `;
    pipWindow.document.head.appendChild(style);

    const shell = pipWindow.document.createElement("div");
    shell.className = "pip-shell";
    shell.innerHTML = `
      <div class="pip-meta">
        <div>
          <h1>Listening Desk</h1>
          <p>RadioTEDU-inspired mini window.</p>
        </div>
        <a class="pip-link" href="${window.location.href}" target="_blank" rel="noopener noreferrer">Open page</a>
      </div>
    `;

    const pipStage = pipWindow.document.createElement("div");
    pipStage.className = "pip-stage";
    shell.appendChild(pipStage);
    pipWindow.document.body.appendChild(shell);
    pipStage.appendChild(stage);
    status.textContent = "Mini window is open. Close it to return the player to the page.";

    pipWindow.addEventListener(
      "pagehide",
      () => {
        returnStageHome();
        pipWindow = null;
        syncPipLabel();
        status.textContent = "Mini window closed. The listening desk is back on the page.";
      },
      { once: true },
    );
  };

  const ensureWebamp = async () => {
    if (webampReady) {
      return webampReady;
    }

    status.textContent = "Loading Webamp…";
    webampReady = loadRemoteScript(webampScript)
      .then(async () => {
        if (!window.Webamp) {
          throw new Error("Webamp is unavailable right now.");
        }

        if (typeof window.Webamp.browserIsSupported === "function" && !window.Webamp.browserIsSupported()) {
          throw new Error("This browser does not support Webamp.");
        }

        const webamp = new window.Webamp({
          zIndex: 1400,
          enableDoubleSizeMode: false,
          initialSkin: {
            url: "https://cdn.jsdelivr.net/npm/webamp@1.5.0/skins/base-2.91.wsz",
          },
        });

        await webamp.renderWhenReady(stage);
        status.textContent = "Webamp is ready. Use the player menu to open local files or add your own listening setup.";
        return webamp;
      })
      .catch((error) => {
        status.textContent = error.message || "Webamp could not be loaded.";
        throw error;
      });

    return webampReady;
  };

  launcher.addEventListener("click", async () => {
    openDock();
    try {
      await ensureWebamp();
    } catch {
      // Keep the dock open so the status message remains visible.
    }
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeDock);
  });

  pipButton?.addEventListener("click", async () => {
    try {
      await openPictureInPicture();
    } catch {
      status.textContent = "Mini window could not be opened right now.";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      closeDock();
    }
  });

  syncPipLabel();
};

document.addEventListener("DOMContentLoaded", () => {
  bootSoftNavigationObserver();
  bootWebamp();
});
