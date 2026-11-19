/* DrepaForce — interactions */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* En-tête */
  const top = $(".top");
  const onScroll = () => top.classList.toggle("scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  const btn = $(".menu-btn"), nav = $("#nav");
  const setMenu = open => {
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    nav.classList.toggle("open", open);
  };
  btn.addEventListener("click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"));
  $$("a", nav).forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  /* 1 · La goutte qui se remplit */
  const liquid = $(".liquid");
  if (liquid) {
    const hero = $(".hero");
    // niveau du liquide (en unités SVG : plus petit = plus plein)
    const levelEl = $(".level", liquid);
    const NS = "http://www.w3.org/2000/svg";
    const FULL = 22, START = 40;
    let level = START;
    const setLevel = (to, dur) => {
      const from = level; level = to;
      if (reduced) { levelEl.style.transform = `translateY(${to}px)`; return; }
      levelEl.animate([{ transform: `translateY(${from}px)` }, { transform: `translateY(${to}px)` }],
        { duration: dur, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" });
    };
    level = 104; setLevel(START, 2000);

    // une gouttelette tombe par la pointe, puis une onde à la surface
    const ripples = $(".ripples", liquid), droplets = $(".droplets", liquid);
    const drip = () => {
      if (reduced) return;
      const x = 50 + (Math.random() * 6 - 3);
      const d = document.createElementNS(NS, "path");
      d.setAttribute("d", "M0 -3.2C0 -3.2 -2 -.6 -2 .6a2 1.7 0 0 0 4 0C2 -.6 0 -3.2 0 -3.2Z");
      d.setAttribute("fill", "#D20211");
      droplets.appendChild(d);
      const surface = level + 1;
      d.animate([{ transform: `translate(${x}px,-14px) scale(.6)`, opacity: 0 },
                 { transform: `translate(${x}px,-6px) scale(1)`, opacity: 1, offset: .15 },
                 { transform: `translate(${x}px,${surface}px) scale(1,1.25)`, opacity: 1 }],
        { duration: 900, easing: "cubic-bezier(.55,0,.9,.4)" }).onfinish = () => {
        d.remove();
        for (let i = 0; i < 2; i++) {
          const r = document.createElementNS(NS, "ellipse");
          r.setAttribute("rx", 1); r.setAttribute("ry", .18);
          r.setAttribute("fill", "none"); r.setAttribute("stroke", "#fff"); r.setAttribute("stroke-width", "1.4");
          r.setAttribute("vector-effect", "non-scaling-stroke");
          ripples.appendChild(r);
          const s = 14 + i * 6;
          const a = r.animate([{ transform: `translate(${x}px,${surface}px) scale(.1)`, opacity: .9 },
                               { transform: `translate(${x}px,${surface}px) scale(${s})`, opacity: 0 }],
            { duration: 1100, delay: i * 160, easing: "ease-out", fill: "both" });
          a.onfinish = () => r.remove();
        }
      };
    };
    // goutte automatique, régulière et discrète
    setTimeout(() => { drip(); setInterval(drip, 4200); }, 2300);

    // au clic : une goutte, et la goutte se remplit un peu plus
    const give = () => {
      drip();
      setTimeout(() => setLevel(level <= FULL ? START : Math.max(FULL, level - 4.5), level <= FULL ? 1600 : 700), 850);
    };
    liquid.addEventListener("click", give);
    liquid.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); give(); } });

    // la goutte penche légèrement vers le curseur
    hero.addEventListener("pointermove", e => {
      if (reduced || e.pointerType !== "mouse") return;
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      liquid.style.setProperty("--tilt", (px * 8).toFixed(2) + "deg");
      liquid.style.setProperty("--tx", (px * 14).toFixed(1) + "px");
      liquid.style.setProperty("--ty", (py * 10).toFixed(1) + "px");
    });
    hero.addEventListener("pointerleave", () => {
      ["--tilt", "--tx", "--ty"].forEach(p => liquid.style.removeProperty(p));
    });
  }

  /* Points et halo qui suivent le curseur, sur tout le site */
  const glow = $(".cursor-glow");
  if (glow && matchMedia("(hover: hover)").matches) {
    const darks = $$(".band, .cta");
    let x = -999, y = -999, queued = false;
    const paint = () => {
      queued = false;
      // sur grand écran la page est agrandie (zoom) : on ramène la position à l'échelle
      const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
      glow.style.setProperty("--mx", x / z + "px");
      glow.style.setProperty("--my", y / z + "px");
      glow.classList.toggle("dark", darks.some(d => { const r = d.getBoundingClientRect(); return y >= r.top && y <= r.bottom; }));
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
    addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      glow.classList.add("on");
      queue();
    }, { passive: true });
    addEventListener("scroll", queue, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => glow.classList.remove("on"));
  }


  /* Apparition douce */
  const items = $$(".reveal");
  items.forEach(el => {
    const i = [...el.parentElement.children].indexOf(el);
    if (!el.classList.contains("drops")) el.style.transitionDelay = Math.min(i, 4) * 0.08 + "s";
  });
  const obs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
  }), { threshold: 0.2 });
  items.forEach(el => obs.observe(el));

  /* 3 · Téléphone qui suit le défilement */
  const steps = $$(".story-step");
  const img = $(".story-img");
  const dots = $$(".story-dots li");
  if (steps.length && img) {
    const line = $(".story-line");
    const notif = $(".notif"), notifText = $(".notif-text"), notifIcon = $(".notif-icon");
    const show = step => {
      const idx = steps.indexOf(step);
      steps.forEach((s, i) => { s.classList.toggle("is-active", s === step); dots[i] && dots[i].classList.toggle("on", s === step); });
      line && line.style.setProperty("--prog", idx / (steps.length - 1));
      const src = step.dataset.screen;
      if (img.getAttribute("src") === src) return;
      img.classList.add("swap");
      setTimeout(() => { img.src = src; img.classList.remove("swap"); }, 220);
      // la notification change avec l'étape
      if (notif) {
        notifText.textContent = step.dataset.notif;
        notifIcon.textContent = step.dataset.icon;
        notif.classList.add("again"); void notif.offsetWidth; notif.classList.remove("again");
      }
    };
    // étape active = la dernière dont le haut a passé le milieu de l'écran
    let current = steps[0];
    const pick = () => {
      let next = steps[0];
      steps.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.55) next = s; });
      if (next !== current) { current = next; show(next); }
    };
    addEventListener("scroll", pick, { passive: true });
    pick();
    // cliquer sur une étape y amène directement
    const go = s => { current = s; show(s); s.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); };
    steps.forEach(s => {
      s.addEventListener("click", () => go(s));
      s.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(s); } });
    });
  }

  /* Pour qui : « Je suis … » */
  const whoTabs = $$(".who-tabs [role=tab]");
  const pickWho = (tab, focus) => {
    whoTabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  };
  whoTabs.forEach((t, i) => {
    t.addEventListener("click", () => pickWho(t));
    t.addEventListener("keydown", e => {
      const n = whoTabs.length;
      const j = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : -1;
      if (j >= 0) { e.preventDefault(); pickWho(whoTabs[j], true); }
    });
  });

  /* 4 · Couper le réseau */
  const net = $(".net"), band = $(".band");
  if (net && band) {
    const text = $(".net-text", net), swap = $(".band-swap", band);
    net.addEventListener("click", () => {
      const online = net.getAttribute("aria-checked") !== "true";
      net.setAttribute("aria-checked", online);
      band.dataset.online = online;
      text.textContent = online ? "Couper le réseau" : "Rétablir le réseau";
      swap.textContent = online ? "L'application, non." : "Tout fonctionne encore.";
    });
  }
})();
