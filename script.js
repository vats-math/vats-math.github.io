// ==========================================================================
// Sharanya Vats — Portfolio Script
// ==========================================================================

(function () {
  "use strict";

  var root = document.documentElement;
  var toggleBtn = document.getElementById("theme-toggle");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) { /* storage may be blocked; fall back below */ }

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      if (toggleBtn) {
        toggleBtn.textContent = "\uD83C\uDF1A"; // 🌚 new moon face -> click to go light
        toggleBtn.setAttribute("aria-label", "Switch to light mode");
        toggleBtn.setAttribute("aria-pressed", "true");
      }
    } else {
      root.setAttribute("data-theme", "light");
      if (toggleBtn) {
        toggleBtn.textContent = "\uD83C\uDF1D"; // 🌝 full moon face -> click to go dark
        toggleBtn.setAttribute("aria-label", "Switch to dark mode");
        toggleBtn.setAttribute("aria-pressed", "false");
      }
    }
  }

  var initial = stored || (prefersDark.matches ? "dark" : "light");
  applyTheme(initial);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) { /* ignore if storage unavailable */ }
    });
  }

  // Keep in sync with system changes if the user hasn't chosen manually
  prefersDark.addEventListener("change", function (e) {
    if (!stored) applyTheme(e.matches ? "dark" : "light");
  });

  // ---------------- Mobile nav ----------------
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { navLinks.classList.remove("open"); });
    });
  }

  // ---------------- Scroll reveal ----------------
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  // ---------------- Starfield ----------------
  var canvas = document.getElementById("starfield");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var stars = [];
  var W, H, DPR;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = document.documentElement.scrollHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seedStars();
  }

  function seedStars() {
    var density = 0.00009; // stars per pixel
    var count = Math.min(260, Math.floor(W * H * density));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.1 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8
      });
    }
  }

  var t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var base = root.getAttribute("data-theme") === "dark" ? 0.85 : 0.12;
    ctx.fillStyle = getComputedStyle(root).getPropertyValue("--star").trim() || "#ffffff";

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twinkle = reduceMotion ? 1 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase);
      ctx.globalAlpha = base * twinkle;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    t += 16;
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
})();
