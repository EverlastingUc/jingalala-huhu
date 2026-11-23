(() => {
  const body = document.body;
  const themeButton = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("ink-theme");
  if (savedTheme !== "light") body.classList.add("dark");
  const updateThemeLabel = () => {
    if (!themeButton) return;
    themeButton.setAttribute("aria-label", body.classList.contains("dark") ? "Switch to light mode" : "Switch to dark mode");
  };
  updateThemeLabel();
  themeButton?.addEventListener("click", () => {
    body.classList.toggle("dark");
    localStorage.setItem("ink-theme", body.classList.contains("dark") ? "dark" : "light");
    updateThemeLabel();
  });
  const menuButton = document.getElementById("menuToggle");
  const nav = document.querySelector(".main-nav");
  menuButton?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "×" : "☰";
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    if (menuButton) menuButton.textContent = "☰";
  }));
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const bar = document.getElementById("progressBar");
  const updateProgress = () => {
    if (!bar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
})();