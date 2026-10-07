/* Lins-Wise Accountants Inc. — front-end only. Nothing is stored. */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var WA_NUMBER = "27799176461";               // 079 917 6461 in international format
  var FORM_EMAIL = "ssmagubane97@gmail.com";  // FormSubmit delivers enquiries here
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + FORM_EMAIL;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function waLink(text) { return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text); }

  /* ---------- WhatsApp links ---------- */
  var defaultWa = waLink("Hi Lins-Wise, I'd like a free quotation for my business.");
  $$(".js-wa").forEach(function (a) { a.href = defaultWa; });

  /* ---------- Year and month ---------- */
  var now = new Date();
  var year = $("#year");
  if (year) year.textContent = now.getFullYear();
  var monthName = now.toLocaleString("en-ZA", { month: "long" });
  $$(".js-month").forEach(function (el) { el.textContent = monthName; });

  /* ---------- Header: glass on scroll ---------- */
  var header = $(".site-header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 24); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  var toggle = $(".nav-toggle");
  var nav = $("#site-nav");
  function closeNav() { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- Current section in nav ---------- */
  var navLinks = $$('.site-nav ul a[href^="#"]');
  if ("IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) { l.removeAttribute("aria-current"); });
        if (byId[entry.target.id]) byId[entry.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------- Hero: the month, handled ---------- */
  var month = $(".month");
  if (month) {
    var items = $$(".month-list li", month);
    var ring = $(".month-ring", month);
    var pct = $(".ring-pct", month);
    var done = 0;
    function setProgress(n) {
      var p = n / items.length;
      ring.style.setProperty("--p", p);
      pct.textContent = Math.round(p * 100) + "%";
    }
    function tickNext() {
      if (done >= items.length) { month.classList.add("is-complete"); return; }
      items[done].classList.add("is-done");
      done++;
      setProgress(done);
      setTimeout(tickNext, 650);
    }
    if (reduceMotion) {
      items.forEach(function (li) { li.classList.add("is-done"); });
      setProgress(items.length);
      month.classList.add("is-complete");
    } else {
      setTimeout(tickNext, 1500);
    }
  }

  /* ---------- Bento tiles: pointer glow ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    $$(".tile").forEach(function (tile) {
      tile.addEventListener("pointermove", function (e) {
        var r = tile.getBoundingClientRect();
        tile.style.setProperty("--mx", (e.clientX - r.left) + "px");
        tile.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Service dialogs ---------- */
  var serviceSelect = $("#f-service");
  var pkgSelect = $("#f-package");
  $$("[data-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dlg = document.getElementById(btn.getAttribute("data-open"));
      if (dlg && typeof dlg.showModal === "function") dlg.showModal();
    });
  });
  $$("dialog.sheet").forEach(function (dlg) {
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); }); // click outside
    $$(".js-close", dlg).forEach(function (b) { b.addEventListener("click", function () { dlg.close(); }); });
    $$("[data-service-pick]", dlg).forEach(function (a) {
      a.addEventListener("click", function () {
        if (serviceSelect) serviceSelect.value = a.getAttribute("data-service-pick");
        dlg.close();
      });
    });
  });

  /* ---------- Pricing tabs ---------- */
  var tablist = $(".plan-tabs");
  if (tablist) {
    var tabs = $$('[role="tab"]', tablist);

    function moveIndicator(tab) {
      tablist.style.setProperty("--x", tab.offsetLeft + "px");
      tablist.style.setProperty("--y", tab.offsetTop + "px");
      tablist.style.setProperty("--w", tab.offsetWidth + "px");
      tablist.style.setProperty("--h", tab.offsetHeight + "px");
    }

    function countUp(el) {
      var target = Number(el.getAttribute("data-value"));
      if (reduceMotion || !target) { el.textContent = target.toLocaleString("en-US"); return; }
      var start = performance.now(), dur = 700, from = Math.round(target * 0.6);
      function frame(t) {
        var k = Math.min(1, (t - start) / dur);
        var eased = 1 - Math.pow(1 - k, 3);
        var v = Math.round((from + (target - from) * eased) / 10) * 10;
        el.textContent = v.toLocaleString("en-US");
        if (k < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        panel.hidden = !on;
        if (on) { var num = $(".num", panel); if (num) countUp(num); }
      });
      moveIndicator(tab);
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });

    var current = function () { return $('[role="tab"][aria-selected="true"]', tablist); };
    moveIndicator(current());
    window.addEventListener("resize", function () { moveIndicator(current()); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveIndicator(current()); });
  }

  /* "Get a quote for X" pre-selects the package in the form */
  $$("[data-pkg-pick]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (pkgSelect) pkgSelect.value = a.getAttribute("data-pkg-pick");
    });
  });

  /* ---------- Quote form ---------- */
  var form = $("#quote-form");
  if (!form) return;
  var statusBox = $(".form-status", form);
  var submitBtn = $('button[type="submit"]', form);
  var submitLabel = $(".btn-label", submitBtn);

  var rules = {
    "f-name": function (v) { return v.trim().length >= 2 ? "" : "Enter your name."; },
    "f-email": function (v) {
      if (!v.trim()) return "Enter your email address.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter an email address like name@business.co.za.";
    },
    "f-phone": function (v) {
      var digits = v.replace(/[^\d]/g, "");
      if (!digits) return "Enter a phone or WhatsApp number.";
      return digits.length >= 9 && digits.length <= 15 ? "" : "Enter a number like 082 123 4567.";
    }
  };

  function validateField(id) {
    var input = document.getElementById(id);
    var err = document.getElementById(id + "-err");
    var msg = rules[id](input.value);
    if (msg) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", id + "-err");
      err.textContent = msg;
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      err.textContent = "";
    }
    return !msg;
  }

  Object.keys(rules).forEach(function (id) {
    var input = document.getElementById(id);
    input.addEventListener("blur", function () { if (input.value) validateField(id); });
    input.addEventListener("input", function () { if (input.getAttribute("aria-invalid") === "true") validateField(id); });
  });

  function collect() {
    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });
    return data;
  }

  function summaryText(d) {
    return [
      "Hi Lins-Wise, I'd like a free quotation.",
      "",
      "Name: " + (d.Name || ""),
      d.Business ? "Business: " + d.Business : null,
      "Email: " + (d.email || ""),
      "Phone: " + (d.Phone || ""),
      "Service: " + (d.Service || ""),
      "Package: " + (d.Package || ""),
      d.Message ? "\n" + d.Message : null
    ].filter(function (l) { return l !== null; }).join("\n");
  }

  function showStatus(kind, html) {
    statusBox.className = "form-status is-" + kind;
    statusBox.innerHTML = html;
    statusBox.focus();
  }

  function setSending(on) {
    submitBtn.disabled = on;
    submitLabel.textContent = on ? "Sending your request…" : "Send my request";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusBox.className = "form-status";
    statusBox.innerHTML = "";

    var ok = ["f-name", "f-email", "f-phone"].map(validateField).every(Boolean);
    if (!ok) {
      var firstBad = $('[aria-invalid="true"]', form);
      if (firstBad) firstBad.focus();
      return;
    }

    var data = collect();
    if (data._honey) return; // bot

    setSending(true);

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(Object.assign({}, data, { _replyto: data.email }))
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, body: j }; });
      })
      .then(function (r) {
        var success = r.ok && (r.body.success === true || r.body.success === "true");
        if (!success) throw new Error((r.body && r.body.message) || "Request failed");
        form.reset();
        showStatus("success",
          "<strong>Request sent.</strong>" +
          "We'll be in touch soon with your quotation. For anything urgent, WhatsApp or call 079 917 6461.");
      })
      .catch(function () {
        var text = summaryText(data);
        var mail = "mailto:" + FORM_EMAIL +
          "?subject=" + encodeURIComponent("Quotation request from " + (data.Name || "the website")) +
          "&body=" + encodeURIComponent(text);
        showStatus("error",
          "<strong>Your request didn't go through.</strong>" +
          "Check your internet connection and try again, or send the same details another way:" +
          '<span class="status-actions">' +
            '<a href="' + waLink(text) + '" target="_blank" rel="noopener">Send by WhatsApp</a>' +
            '<a href="' + mail + '">Send by email</a>' +
          "</span>");
      })
      .then(function () { setSending(false); });
  });
})();
