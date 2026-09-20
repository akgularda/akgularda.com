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

const bootMenuToggle = () => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.getElementById("site-menu");
  if (!toggle || !menu) {
    return;
  }
  document.body.classList.add("js");
  const label = toggle.querySelector("[data-menu-label]");
  const setOpen = (open) => {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (label) {
      label.textContent = open ? "Close" : "Menu";
    }
  };
  toggle.addEventListener("click", () => {
    setOpen(!document.body.classList.contains("menu-open"));
  });
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setOpen(false);
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
      setOpen(false);
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  bootSoftNavigationObserver();
  bootMenuToggle();
});
