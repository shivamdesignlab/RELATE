/* RELATE site interactions: header, menu, reply demo, rubric tabs, BibTeX copy, portraits. */
(function () {
  "use strict";

  /* Header: solid background once the page scrolls */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 24); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  var menuBtn = document.querySelector(".menu-btn");
  if (menuBtn && header) {
    var closeMenu = function () { header.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); };
    menuBtn.addEventListener("click", function () {
      var open = !header.classList.contains("is-open");
      header.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    header.querySelectorAll(".nav-links a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) closeMenu(); });
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Opening film: loops continuously; a keyboard-only control can pause it;
     it rests when scrolled off screen and stays still for reduced motion */
  var video = document.querySelector(".intro-media");
  var toggle = document.querySelector("[data-video-toggle]");
  if (video && toggle) {
    var userPaused = false;
    var setState = function (paused) {
      toggle.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-label", paused ? "Play background video" : "Pause background video");
    };
    var tryPlay = function () {
      var p = video.play();
      if (p && p.catch) p.catch(function () { setState(true); });
    };
    if (reduceMotion) { video.removeAttribute("autoplay"); video.pause(); userPaused = true; }
    setState(video.paused);
    video.addEventListener("play", function () { setState(false); });
    video.addEventListener("pause", function () { setState(true); });
    toggle.addEventListener("click", function () {
      if (video.paused) { userPaused = false; tryPlay(); }
      else { userPaused = true; video.pause(); }
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { if (!userPaused && video.paused) tryPlay(); }
          else if (!video.paused) { video.pause(); setState(true); }
        });
      }, { threshold: 0.15 }).observe(video);
    }
  }

  /* Tabs: shared by the reply demo and the rubric explorer */
  function tabs(list) {
    var buttons = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(btn, focus) {
      buttons.forEach(function (b) {
        var on = b === btn;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(b.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
        var extra = b.getAttribute("data-also");
        if (extra) document.querySelectorAll(extra).forEach(function (n) { n.hidden = !on; });
      });
      if (focus) btn.focus();
    }
    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () { select(b); });
      b.addEventListener("keydown", function (e) {
        var k = e.key, next = null;
        if (k === "ArrowRight" || k === "ArrowDown") next = buttons[(i + 1) % buttons.length];
        else if (k === "ArrowLeft" || k === "ArrowUp") next = buttons[(i - 1 + buttons.length) % buttons.length];
        else if (k === "Home") next = buttons[0];
        else if (k === "End") next = buttons[buttons.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
    var initial = buttons.filter(function (b) { return b.getAttribute("aria-selected") === "true"; })[0] || buttons[0];
    if (initial) select(initial);
  }
  document.querySelectorAll('[role="tablist"]').forEach(tabs);

  /* Copy BibTeX */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = document.getElementById(btn.getAttribute("data-copy"));
      if (!src) return;
      var text = src.textContent.trim();
      var done = function () {
        var label = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = label; }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
      } else { fallback(text); done(); }
    });
  });
  function fallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* Dot tallies in the taxonomy derivation ("count:classes,count:classes") */
  document.querySelectorAll("[data-dots]").forEach(function (box) {
    box.getAttribute("data-dots").split(",").forEach(function (part) {
      var bits = part.split(":"), n = parseInt(bits[0], 10);
      for (var i = 0; i < n; i++) {
        var d = document.createElement("span");
        d.className = bits[1];
        box.appendChild(d);
      }
    });
  });

  /* Portraits: show a watercolor tile with initials until a photo is added */
  document.querySelectorAll(".portrait").forEach(function (p) {
    var img = p.querySelector("img");
    function empty() { p.classList.add("is-empty"); if (img) img.remove(); }
    if (!img) { empty(); return; }
    if (img.complete && img.naturalWidth === 0) empty();
    else img.addEventListener("error", empty);
  });
})();
