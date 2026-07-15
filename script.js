(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  // Handle dropdown buttons for About and Our Programs
  var dropdownBtns = document.querySelectorAll(".nav__dropdown-btn");
  dropdownBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var isExpanded = btn.getAttribute("aria-expanded") === "true";
      dropdownBtns.forEach(function (otherBtn) {
        if (otherBtn !== btn) {
          otherBtn.setAttribute("aria-expanded", "false");
        }
      });
      btn.setAttribute("aria-expanded", String(!isExpanded));
    });

    btn.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        var menu = btn.nextElementSibling;
        if (menu && menu.classList.contains("nav__dropdown")) {
          var firstLink = menu.querySelector("a");
          if (firstLink) firstLink.focus();
        }
      }
    });
  });

  // Handle Escape key in dropdown menus
  var dropdowns = document.querySelectorAll(".nav__dropdown");
  dropdowns.forEach(function (dropdown) {
    var links = dropdown.querySelectorAll("a");
    links.forEach(function (link) {
      link.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          var btn = link.closest(".nav__item--dropdown").querySelector(".nav__dropdown-btn");
          if (btn) {
            btn.setAttribute("aria-expanded", "false");
            btn.focus();
          }
        }
      });
    });
  });

  // Highlight current page
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  var navLinks = document.querySelectorAll(".nav__menu a");
  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  var revealEls = document.querySelectorAll(".reveal");
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* Lightweight cinematic hero atmosphere */
  var hero = document.getElementById("hero");
  var heroVisual = document.querySelector(".hero__visual");
  var canvas = document.getElementById("skyCanvas");

  if (hero && heroVisual && !prefersReduced) {
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.setProperty("--hero-parallax-x", (x * 12).toFixed(2) + "px");
      heroVisual.style.setProperty("--hero-parallax-y", (y * 8).toFixed(2) + "px");
    });
    hero.addEventListener("pointerleave", function () {
      heroVisual.style.setProperty("--hero-parallax-x", "0px");
      heroVisual.style.setProperty("--hero-parallax-y", "0px");
    });
  }

  if (canvas && hero && !prefersReduced) {
    var context = canvas.getContext("2d");
    var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;
    var stars = [];
    var dust = [];
    var animationRunning = true;
    var resizeTimer;

    function buildAtmosphere() {
      var area = width * height;
      var starCount = Math.min(180, Math.max(70, Math.round(area / 9000)));
      var dustCount = Math.min(34, Math.max(14, Math.round(area / 42000)));
      stars = [];
      dust = [];

      for (var i = 0; i < starCount; i += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.88,
          radius: Math.random() * 1.15 + 0.25,
          alpha: Math.random() * 0.6 + 0.22,
          speed: Math.random() * 0.012 + 0.003,
          phase: Math.random() * Math.PI * 2
        });
      }

      for (var j = 0; j < dustCount; j += 1) {
        dust.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.8 + 0.7,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -(Math.random() * 0.15 + 0.035),
          alpha: Math.random() * 0.28 + 0.09,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function sizeCanvas() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      buildAtmosphere();
    }

    function drawAtmosphere() {
      if (!animationRunning) return;
      context.clearRect(0, 0, width, height);

      stars.forEach(function (star) {
        star.phase += star.speed;
        var alpha = Math.max(0.04, star.alpha + Math.sin(star.phase) * 0.18);
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(225, 241, 255, " + alpha.toFixed(3) + ")";
        context.fill();
      });

      dust.forEach(function (particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.phase += 0.008;
        if (particle.y < -12) particle.y = height + 12;
        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
        var alpha = Math.max(0, particle.alpha + Math.sin(particle.phase) * 0.06);
        var glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 7);
        glow.addColorStop(0, "rgba(241, 207, 132, " + alpha.toFixed(3) + ")");
        glow.addColorStop(1, "rgba(230, 194, 116, 0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * 7, 0, Math.PI * 2);
        context.fill();
      });

      requestAnimationFrame(drawAtmosphere);
    }

    var heroObserver = new IntersectionObserver(function (entries) {
      var shouldRun = entries[0].isIntersecting && !document.hidden;
      var wasRunning = animationRunning;
      animationRunning = shouldRun;
      if (animationRunning && !wasRunning) requestAnimationFrame(drawAtmosphere);
    }, { threshold: 0.02 });

    heroObserver.observe(hero);
    document.addEventListener("visibilitychange", function () {
      var wasRunning = animationRunning;
      animationRunning = !document.hidden && hero.getBoundingClientRect().bottom > 0;
      if (animationRunning && !wasRunning) requestAnimationFrame(drawAtmosphere);
    });
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sizeCanvas, 160);
    });

    sizeCanvas();
    requestAnimationFrame(drawAtmosphere);
  }

})();
