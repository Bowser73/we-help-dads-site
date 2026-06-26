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

  var launcher = document.getElementById("branchLauncher");
  var panel = document.getElementById("branchPanel");
  var close = document.getElementById("branchClose");
  var teaser = document.getElementById("branchTeaser");
  var answer = document.getElementById("branchAnswer");
  var action = document.getElementById("branchAction");
  var topicButtons = document.querySelectorAll("[data-branch-topic]");

  var topics = {
    "class": {
      message: "The Our Programs section introduces Influence, Prepare, Help, and how to ask about the next cohort.",
      label: "View Our Programs",
      href: "#program"
    },
    "contact": {
      message: "Jeff can answer questions about classes, support, referrals, and the best next step.",
      label: "Call Jeff",
      href: "tel:+13176787507",
      facebook: true
    },
    "refer": {
      message: "Families, churches, schools, agencies, and community partners are welcome to refer a father.",
      label: "Refer a dad",
      href: "mailto:Jeffreyhutter1@gmail.com?subject=Refer%20a%20Dad"
    },
    "support": {
      message: "Donation options are still being finalized. You can review how future gifts will support the mission.",
      label: "View donation information",
      href: "#donate"
    }
  };

  function setHelperOpen(open) {
    if (!launcher || !panel) return;
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (teaser) teaser.hidden = open;
    if (open && close) close.focus();
    if (!open) launcher.focus();
  }

  if (launcher && panel) {
    launcher.addEventListener("click", function () {
      setHelperOpen(panel.hidden);
    });
  }
  if (close) close.addEventListener("click", function () { setHelperOpen(false); });

  topicButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var topic = topics[button.getAttribute("data-branch-topic")];
      if (!topic || !answer || !action) return;
      answer.querySelector("p").textContent = topic.message;
      action.textContent = topic.label;
      action.setAttribute("href", topic.href);
      action.hidden = false;
      var existingFacebook = answer.querySelector(".branch-facebook-link");
      if (existingFacebook) existingFacebook.remove();
      if (topic.facebook) {
        var facebookLink = document.createElement("a");
        facebookLink.className = "branch-facebook-link";
        facebookLink.href = "https://www.facebook.com/WeHelpDads/";
        facebookLink.target = "_blank";
        facebookLink.rel = "noopener noreferrer";
        facebookLink.textContent = "Facebook";
        answer.appendChild(facebookLink);
      }
      topicButtons.forEach(function (item) { item.classList.remove("is-selected"); });
      button.classList.add("is-selected");
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && panel && !panel.hidden) setHelperOpen(false);
  });
})();
