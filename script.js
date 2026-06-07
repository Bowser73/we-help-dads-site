/* =========================================================
   We Help Dads / Dedicated Dads — script.js
   Hero sky animation (stars, shooting stars, fireflies),
   mobile nav, scroll reveal. Performance + accessibility aware.
   ========================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // Close menu after tapping a link (mobile)
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero sky canvas ---------- */
  var canvas = document.getElementById("skyCanvas");
  if (!canvas || prefersReduced) return; // honor reduced-motion: leave static gradient sky

  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var stars = [], fireflies = [], shooting = null;
  var running = true;

  function size() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildScene();
  }

  function buildScene() {
    // Density scales with screen area but is capped for performance.
    var area = W * H;
    var starCount = Math.min(220, Math.round(area / 6500));
    stars = [];
    for (var i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.85,
        r: Math.random() * 1.3 + 0.3,
        base: Math.random() * 0.5 + 0.4,
        tw: Math.random() * 0.02 + 0.004,   // twinkle speed
        phase: Math.random() * Math.PI * 2
      });
    }
    var flyCount = Math.min(18, Math.round(area / 90000));
    fireflies = [];
    for (var j = 0; j < flyCount; j++) {
      fireflies.push({
        x: Math.random() * W,
        y: H * 0.45 + Math.random() * H * 0.5,
        r: Math.random() * 1.6 + 0.8,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.6 + 0.2,
        ta: Math.random() * 0.01 + 0.003,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function spawnShooting() {
    // Start near the top, travel diagonally down-right.
    var startX = Math.random() * W * 0.7;
    var startY = Math.random() * H * 0.35;
    var len = 140 + Math.random() * 120;
    shooting = {
      x: startX, y: startY,
      vx: 6 + Math.random() * 3,
      vy: 2.4 + Math.random() * 1.6,
      life: 0, max: 60 + Math.random() * 25,
      len: len
    };
  }

  var t = 0, lastShoot = 0;
  function frame(now) {
    if (!running) return;
    t += 1;
    ctx.clearRect(0, 0, W, H);

    // Stars
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.phase += s.tw;
      var alpha = s.base + Math.sin(s.phase) * 0.35;
      if (alpha < 0) alpha = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220,232,255," + alpha.toFixed(3) + ")";
      ctx.fill();
    }

    // Fireflies (soft glowing particles, lower portion)
    for (var j = 0; j < fireflies.length; j++) {
      var f = fireflies[j];
      f.x += f.vx; f.y += f.vy; f.phase += f.ta;
      if (f.x < -10) f.x = W + 10; if (f.x > W + 10) f.x = -10;
      if (f.y < H * 0.4) f.vy = Math.abs(f.vy); if (f.y > H + 10) f.vy = -Math.abs(f.vy);
      var a = f.a + Math.sin(f.phase) * 0.25;
      if (a < 0) a = 0;
      var grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6);
      grad.addColorStop(0, "rgba(170,210,255," + a.toFixed(3) + ")");
      grad.addColorStop(1, "rgba(170,210,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shooting star (occasional)
    if (!shooting && t - lastShoot > 240 && Math.random() < 0.012) {
      spawnShooting();
      lastShoot = t;
    }
    if (shooting) {
      shooting.x += shooting.vx;
      shooting.y += shooting.vy;
      shooting.life += 1;
      var p = shooting.life / shooting.max;
      var fade = p < 0.2 ? p / 0.2 : (1 - p) / 0.8 + 0.0;
      if (fade < 0) fade = 0;
      var tailX = shooting.x - shooting.vx * (shooting.len / 8);
      var tailY = shooting.y - shooting.vy * (shooting.len / 8);
      var g = ctx.createLinearGradient(shooting.x, shooting.y, tailX, tailY);
      g.addColorStop(0, "rgba(255,255,255," + (0.9 * fade).toFixed(3) + ")");
      g.addColorStop(1, "rgba(127,178,255,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(shooting.x, shooting.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      if (shooting.life >= shooting.max || shooting.x > W + 50 || shooting.y > H + 50) {
        shooting = null;
      }
    }

    requestAnimationFrame(frame);
  }

  // Pause animation when the hero is offscreen / tab hidden (saves battery)
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  var heroEl = document.getElementById("hero");
  if (heroEl && "IntersectionObserver" in window) {
    var heroIO = new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      var wasRunning = running;
      running = visible && !document.hidden;
      if (running && !wasRunning) requestAnimationFrame(frame);
    }, { threshold: 0.02 });
    heroIO.observe(heroEl);
  }

  // Debounced resize
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(size, 180);
  });

  size();
  requestAnimationFrame(frame);
})();
