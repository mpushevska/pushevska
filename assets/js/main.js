// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
const setMenu = (open) => {
  toggle?.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("is-open", open);
};
toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
nav?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

// Language switch keeps the current section (#services etc.)
document.querySelector(".btn--lang")?.addEventListener("click", (e) => {
  if (location.hash) e.currentTarget.href = e.currentTarget.getAttribute("href").split("#")[0] + location.hash;
});

// Homepage: highlight the menu item of the section in view
const links = [...document.querySelectorAll(".site-nav [data-section]")];
const sections = links.map((a) => document.getElementById(a.dataset.section)).filter(Boolean);
if (sections.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.dataset.section === en.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => io.observe(s));
  // back at the top → nothing active
  addEventListener("scroll", () => { if (scrollY < innerHeight * 0.4) links.forEach((a) => a.classList.remove("is-active")); }, { passive: true });
}

// Contact form: pre-select a service from ?service=slug
const select = document.getElementById("service-select");
if (select) {
  const wanted = new URLSearchParams(location.search).get("service");
  if (wanted && select.querySelector(`option[value="${CSS.escape(wanted)}"]`)) select.value = wanted;
}

// Smoke pictograms: snap 2×2 tiles to the background grid, animate in when visible
const tiles = [...document.querySelectorAll(".smoke-tile")];
if (tiles.length) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 860px)");
  const place = () => {
    const bs = getComputedStyle(document.body).backgroundSize.split(",")[0].trim().split(/\s+/);
    const cw = parseFloat(bs[0]), ch = parseFloat(bs[1]);
    const originX = mobile.matches ? 0 : Math.max(0, (innerWidth - 1920) / 2);
    tiles.forEach((t) => {
      const box = t.parentElement.getBoundingClientRect();
      const secTop = box.top + scrollY, secLeft = box.left + scrollX;
      const col = mobile.matches ? t.dataset.mCol : t.dataset.col;
      const row = mobile.matches ? t.dataset.mRow : t.dataset.row;
      if (col === undefined || row === undefined) { t.classList.remove("is-placed"); return; }
      const startRow = Math.ceil(secTop / ch - 0.01);
      const x = originX + Number(col) * cw, y = (startRow + Number(row)) * ch;
      Object.assign(t.style, { left: x - secLeft + "px", top: y - secTop + "px", width: 2 * cw + 1 + "px", height: 2 * ch + 1 + "px" });
      t.classList.add("is-placed");
    });
  };
  place();
  addEventListener("resize", place);
  document.fonts?.ready.then(place);
  addEventListener("load", place);
  if (!reduce && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-smoke");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const i = tiles.indexOf(en.target);
        setTimeout(() => en.target.classList.add("is-in"), i * 220);
        io.unobserve(en.target);
      });
    }, { threshold: 0.4 });
    tiles.forEach((t) => io.observe(t));
  }
}
