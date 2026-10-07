/* Lins-Wise Accountants Inc. — front-end only. Nothing is stored. */
(function () {
  "use strict";

  var WA_NUMBER = "27799176461";               // 079 917 6461 in international format
  var FORM_EMAIL = "ssmagubane97@gmail.com";  // FormSubmit delivers enquiries here
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + FORM_EMAIL;

  function waLink(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }

  /* ---------- WhatsApp links with a friendly opening line ---------- */
  var defaultWa = waLink("Hi Lins-Wise, I'd like a free quotation for my business.");
  document.querySelectorAll(".js-wa").forEach(function (a) { a.href = defaultWa; });

  /* ---------- Year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  }

  /* ---------- Current section in nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav ul a[href^="#"]'));
  if ("IntersectionObserver" in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ---------- Package chooser ---------- */
  var ledger = document.querySelector(".ledger");
  var pkgs = document.querySelectorAll(".pkg");
  document.querySelectorAll('.chooser input[name="stage"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      ledger.classList.add("has-match");
      var match = null;
      pkgs.forEach(function (p) {
        var on = p.getAttribute("data-pkg") === radio.value;
        p.classList.toggle("is-match", on);
        if (on) match = p;
      });
      // On narrow screens the match may be off-screen: bring it into view.
      if (match && window.matchMedia("(max-width: 1080px)").matches) {
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        match.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    });
  });

  /* ---------- "Quote me for X" pre-selects the package ---------- */
  var pkgSelect = document.getElementById("f-package");
  document.querySelectorAll(".js-pkg").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-pkg-name");
      if (pkgSelect && name) pkgSelect.value = name;
      setTimeout(function () {
        var first = document.getElementById("f-name");
        if (first) first.focus({ preventScroll: true });
      }, 450);
    });
  });

  /* ---------- Quote form ---------- */
  var form = document.getElementById("quote-form");
  if (!form) return;
  var statusBox = form.querySelector(".form-status");
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn.querySelector(".btn-label");

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
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") validateField(id);
    });
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
      var firstBad = form.querySelector('[aria-invalid="true"]');
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
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, body: j }; }); })
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
