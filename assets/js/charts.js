/* RELATE charts: small, dependency-free SVG charts.
   Any element with data-chart="<name>" is rendered from window.RELATE_DATA,
   re-rendered when its width changes, and paired with a data table in
   [data-table="<name>"] so no value is only reachable by hovering. */
(function () {
  "use strict";
  var D = window.RELATE_DATA;
  if (!D) return;
  var NS = "http://www.w3.org/2000/svg";
  var TURNS = [1, 2, 3, 4, 5, 6];

  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  var COL = {};
  function readColors() {
    COL = {
      IF: cssVar("--if"), OS: cssVar("--os"), both: cssVar("--both"), none: cssVar("--none"),
      ink: cssVar("--ink"), ink2: cssVar("--ink-2"), ink3: cssVar("--ink-3"),
      rule: cssVar("--rule"), surface: cssVar("--chart-surface")
    };
  }

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, cls, anchor, extra) {
    var t = el("text", Object.assign({ x: x, y: y, "class": cls || "tick", "text-anchor": anchor || "start" }, extra || {}), parent);
    t.textContent = s;
    return t;
  }
  function lin(d0, d1, r0, r1) { return function (v) { return r0 + (v - d0) / (d1 - d0) * (r1 - r0); }; }
  function pct(v) { return v.toFixed(1) + "%"; }
  function pp(v) { return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + " pp"; }
  function times(v) { return "×" + v.toFixed(2).replace(/0$/, ""); }
  function modelById(id) { for (var i = 0; i < D.models.length; i++) if (D.models[i].id === id) return D.models[i]; }
  function measureText(s, size, weight) {
    var c = measureText.c || (measureText.c = document.createElement("canvas").getContext("2d"));
    c.font = (weight || 500) + " " + size + "px " + cssVar("--sans");
    return c.measureText(s).width;
  }
  // bar with 4px rounded data-end, square at the baseline
  function barPath(x0, x1, y, h, r) {
    var w = x1 - x0; r = Math.max(0, Math.min(r, w, h / 2));
    return "M" + x0 + "," + y + "H" + (x1 - r) + "Q" + x1 + "," + y + " " + x1 + "," + (y + r) +
      "V" + (y + h - r) + "Q" + x1 + "," + (y + h) + " " + (x1 - r) + "," + (y + h) + "H" + x0 + "Z";
  }
  function roundedRect(x, y, w, h, rl, rr) {
    rl = Math.min(rl, w / 2, h / 2); rr = Math.min(rr, w / 2, h / 2);
    return "M" + (x + rl) + "," + y + "H" + (x + w - rr) + (rr ? "Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + rr) : "") +
      "V" + (y + h - rr) + (rr ? "Q" + (x + w) + "," + (y + h) + " " + (x + w - rr) + "," + (y + h) : "") +
      "H" + (x + rl) + (rl ? "Q" + x + "," + (y + h) + " " + x + "," + (y + h - rl) : "") +
      "V" + (y + rl) + (rl ? "Q" + x + "," + y + " " + (x + rl) + "," + y : "") + "Z";
  }

  /* ---------------- tooltip ---------------- */
  var tip = document.createElement("div");
  tip.className = "chart-tip";
  tip.setAttribute("aria-hidden", "true");
  document.body.appendChild(tip);
  function row(color, label, value) {
    return '<div class="r"><span>' + (color ? '<i style="background:' + color + '"></i>' : "") + label + "</span><b>" + value + "</b></div>";
  }
  function showTip(html, cx, cy) {
    tip.innerHTML = html;
    tip.classList.add("is-on");
    var r = tip.getBoundingClientRect();
    var left = cx + 16, top = cy - r.height - 14;
    if (left + r.width > window.innerWidth - 8) left = cx - r.width - 16;
    if (left < 8) left = 8;
    if (top < 8) top = cy + 18;
    tip.style.transform = "translate(" + Math.round(left) + "px," + Math.round(top) + "px)";
  }
  function hideTip() { tip.classList.remove("is-on"); }
  window.addEventListener("scroll", hideTip, { passive: true });

  function svgRoot(host, W, H, label) {
    host.innerHTML = "";
    return el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img", "aria-label": label }, host);
  }

  /* ---------------- line chart (turns on x) ---------------- */
  function lineChart(host, o) {
    var W = Math.max(240, host.clientWidth);
    var compact = W < 520;
    var H = o.height || Math.round(Math.max(230, Math.min(360, W * 0.5)));
    var m = Object.assign({ t: 14, r: o.endLabels ? (compact ? 58 : 150) : 14, b: o.xTitle ? 46 : 30, l: 40 }, o.margin || {});
    var svg = svgRoot(host, W, H, o.aria);
    var x = lin(1, 6, m.l, W - m.r), y = lin(o.y[0], o.y[1], H - m.b, m.t);
    var g = el("g", null, svg);
    o.yTicks.forEach(function (t) {
      el("line", { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), "class": (t === 0 && o.zero) ? "zero" : "gl" }, g);
      txt(g, m.l - 8, y(t) + 4, o.yFmt ? o.yFmt(t) : t, "tick", "end");
    });
    TURNS.forEach(function (t) { txt(g, x(t), H - m.b + 19, t, "tick", "middle"); });
    if (o.xTitle) txt(g, m.l + (W - m.l - m.r) / 2, H - 6, o.xTitle, "axis-label", "middle");

    function pts(vals) { return vals.map(function (v, i) { return [x(i + 1), y(v)]; }); }
    function d(p) { return "M" + p.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join("L"); }

    if (o.gap) {
      var a = o.series[0].values, b = o.series[1].values;
      el("path", { d: d(pts(a).concat(pts(b).reverse())) + "Z", fill: "url(#gapfill-" + o.uid + ")" }, svg);
      var defs = el("defs", null, svg);
      var lg = el("linearGradient", { id: "gapfill-" + o.uid, x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
      el("stop", { offset: "0", "stop-color": COL.IF, "stop-opacity": 0.13 }, lg);
      el("stop", { offset: "1", "stop-color": COL.OS, "stop-opacity": 0.13 }, lg);
    }
    o.series.forEach(function (s) {
      if (!s.ci) return;
      var up = s.ci.map(function (c, i) { return [x(i + 1), y(c[1])]; });
      var lo = s.ci.map(function (c, i) { return [x(i + 1), y(c[0])]; }).reverse();
      el("path", { d: d(up.concat(lo)) + "Z", fill: s.color, "fill-opacity": 0.1 }, svg);
    });
    var cross = el("line", { x1: 0, x2: 0, y1: m.t, y2: H - m.b, "class": "cross", opacity: 0 }, svg);
    var markerSets = [];
    o.series.forEach(function (s) {
      el("path", { d: d(pts(s.values)), fill: "none", stroke: s.color, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
      var set = [];
      pts(s.values).forEach(function (p, i) {
        var last = i === s.values.length - 1;
        set.push(el("circle", { cx: p[0], cy: p[1], r: last ? 4.5 : 3, fill: s.color, stroke: COL.surface, "stroke-width": 2 }, svg));
      });
      markerSets.push(set);
    });
    if (o.endLabels) {
      var ends = o.series.map(function (s) { return { s: s, y: y(s.values[5]) }; });
      // keep end labels from colliding: push apart minimally, with a leader if moved
      ends.sort(function (p, q) { return p.y - q.y; });
      for (var i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 34 && !compact) ends[i].ly = ends[i - 1].y + 34;
      ends.forEach(function (e) {
        var ly = e.ly || e.y, lx = x(6) + 12;
        txt(svg, lx, ly + (compact ? 4 : 0), o.endFmt ? o.endFmt(e.s.values[5]) : pct(e.s.values[5]), "val-strong");
        if (!compact) txt(svg, lx, ly + 17, e.s.label, "val");
      });
    }
    // hover + keyboard
    var hit = el("rect", { x: m.l - 10, y: m.t, width: W - m.l - m.r + 20, height: H - m.t - m.b, "class": "hit" }, svg);
    var cur = -1;
    function focusTurn(i, cx, cy) {
      cur = i;
      cross.setAttribute("x1", x(i + 1)); cross.setAttribute("x2", x(i + 1)); cross.setAttribute("opacity", 1);
      markerSets.forEach(function (set) { set.forEach(function (c, j) { c.setAttribute("r", j === i ? 5.5 : (j === 5 ? 4.5 : 3)); }); });
      var html = '<div class="t">' + (o.tipTitle ? o.tipTitle(i) : "Assistant turn " + (i + 1)) + "</div>";
      o.series.forEach(function (s) {
        var v = s.values[i];
        html += row(s.color, s.label, o.tipFmt ? o.tipFmt(v, s, i) : pct(v));
      });
      var box = svg.getBoundingClientRect();
      showTip(html, cx != null ? cx : box.left + x(i + 1), cy != null ? cy : box.top + m.t + 20);
    }
    function clear() {
      cur = -1; cross.setAttribute("opacity", 0); hideTip();
      markerSets.forEach(function (set) { set.forEach(function (c, j) { c.setAttribute("r", j === 5 ? 4.5 : 3); }); });
    }
    hit.addEventListener("pointermove", function (ev) {
      var box = svg.getBoundingClientRect();
      var px = (ev.clientX - box.left) * (W / box.width);
      var i = Math.max(0, Math.min(5, Math.round((px - m.l) / ((W - m.l - m.r) / 5))));
      focusTurn(i, ev.clientX, ev.clientY);
    });
    hit.addEventListener("pointerleave", clear);
    svg.setAttribute("tabindex", "0");
    svg.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
        ev.preventDefault();
        var i = cur < 0 ? 0 : Math.max(0, Math.min(5, cur + (ev.key === "ArrowRight" ? 1 : -1)));
        focusTurn(i);
      } else if (ev.key === "Escape") clear();
    });
    svg.addEventListener("focus", function () { focusTurn(cur < 0 ? 0 : cur); });
    svg.addEventListener("blur", clear);
  }

  /* ---------------- horizontal rows helper ---------------- */
  function rowsLayout(host, n, opts) {
    var W = Math.max(260, host.clientWidth);
    var stacked = W < (opts.stackBelow || 600);
    var labelW = stacked ? 0 : (opts.labelW || 170);
    var rowH = stacked ? (opts.rowHStacked || 58) : (opts.rowH || 40);
    var m = { t: opts.top || 26, r: opts.right || 20, b: 30, l: labelW + 8 };
    var H = m.t + n * rowH + m.b;
    return { W: W, H: H, m: m, rowH: rowH, stacked: stacked, labelW: labelW };
  }

  /* ---------------- dumbbell: IF vs OS per model ---------------- */
  function dumbbell(host) {
    var src = host.getAttribute("data-mode") === "highstakes" ? D.highStakes : null;
    var rows = D.models.map(function (md) {
      var v = src ? src[md.id] : md;
      return { label: md.name, IF: v.IF, OS: v.OS };
    });
    var L = rowsLayout(host, rows.length, { labelW: 210, right: 70, stackBelow: 640, rowHStacked: 56 });
    var W = L.W, H = L.H, m = L.m;
    var svg = svgRoot(host, W, H, "Inward-facing and outward-scaffolding rates for each of seven models" + (src ? " in high-stakes topics" : ""));
    var x = lin(30, 80, m.l, W - m.r);
    var g = el("g", null, svg);
    [30, 40, 50, 60, 70, 80].forEach(function (t) {
      el("line", { x1: x(t), x2: x(t), y1: m.t - 6, y2: H - m.b + 4, "class": "gl" }, g);
      txt(g, x(t), H - m.b + 22, t + "%", "tick", "middle");
    });
    txt(g, W, m.t - 12, "IF − OS", "axis-label", "end");
    rows.forEach(function (r, i) {
      var top = m.t + i * L.rowH;
      var cy = L.stacked ? top + 36 : top + L.rowH / 2;
      var hr = el("rect", { x: 0, y: top, width: W, height: L.rowH, "class": "hit-row" }, svg);
      if (L.stacked) txt(svg, m.l, top + 16, r.label, "row-label");
      else txt(svg, 0, cy + 5, r.label, "row-label");
      el("line", { x1: x(Math.min(r.IF, r.OS)), x2: x(Math.max(r.IF, r.OS)), y1: cy, y2: cy, stroke: COL.ink3, "stroke-width": 1.5, "stroke-opacity": 0.45 }, svg);
      el("circle", { cx: x(r.OS), cy: cy, r: 6, fill: COL.OS, stroke: COL.surface, "stroke-width": 2 }, svg);
      el("circle", { cx: x(r.IF), cy: cy, r: 6, fill: COL.IF, stroke: COL.surface, "stroke-width": 2 }, svg);
      txt(svg, W, cy + 5, pp(r.IF - r.OS), "val", "end");
      function on(ev) {
        hr.classList.add("is-on");
        showTip('<div class="t">' + r.label + "</div>" + row(COL.IF, "Inward-facing", pct(r.IF)) + row(COL.OS, "Outward-scaffolding", pct(r.OS)) + row(null, "Difference", pp(r.IF - r.OS)), ev.clientX, ev.clientY);
      }
      hr.addEventListener("pointermove", on);
      hr.addEventListener("pointerleave", function () { hr.classList.remove("is-on"); hideTip(); });
    });
    // pointer events pass to the row rect
    svg.querySelectorAll("circle, text, line:not(.gl)").forEach(function (n) { n.style.pointerEvents = "none"; });
  }

  /* ---------------- 100% stacked composition per model ---------------- */
  var COMP = [
    { key: "ifOnly", label: "Inward-facing only", c: "IF", ink: "#fff" },
    { key: "both", label: "Both", c: "both", ink: "#fff" },
    { key: "osOnly", label: "Outward-scaffolding only", c: "OS", ink: "#fff" },
    { key: "neither", label: "Neither", c: "none", ink: null }
  ];
  function stackRow(svg, x0, x1, y, h, vals, title, hitRow, fmt) {
    var total = 0; COMP.forEach(function (s) { total += vals[s.key]; });
    var span = x1 - x0, gap = 2, cx = x0;
    var usable = span - gap * (COMP.length - 1);
    COMP.forEach(function (s, i) {
      var w = usable * vals[s.key] / total;
      var p = el("path", { d: roundedRect(cx, y, w, h, i === 0 ? 4 : 0, i === COMP.length - 1 ? 4 : 0), fill: COL[s.c] }, svg);
      var label = fmt ? fmt(vals[s.key]) : Math.round(vals[s.key]) + "%";
      if (measureText(label, 12.5, 650) + 12 < w) {
        var t = txt(svg, cx + w / 2, y + h / 2 + 4.5, label, "val", "middle");
        t.style.fill = s.ink || COL.ink;
        t.style.pointerEvents = "none";
      }
      var target = hitRow || p;
      p.addEventListener("pointermove", function (ev) {
        var html = '<div class="t">' + title + "</div>";
        COMP.forEach(function (q) { html += row(COL[q.c], q.label, pct(vals[q.key])); });
        showTip(html, ev.clientX, ev.clientY);
        if (hitRow) hitRow.classList.add("is-on");
      });
      p.addEventListener("pointerleave", function () { hideTip(); if (hitRow) hitRow.classList.remove("is-on"); });
      cx += w + gap;
    });
  }
  function composition(host) {
    var L = rowsLayout(host, D.models.length, { labelW: 210, right: 64, rowH: 42, stackBelow: 640, rowHStacked: 56, top: 26 });
    var W = L.W, H = L.H, m = L.m;
    var svg = svgRoot(host, W, H, "Share of each model's sentences that are inward-facing only, both, outward-scaffolding only, or neither");
    txt(svg, W, m.t - 12, "IF among OS", "axis-label", "end");
    var x0 = m.l, x1 = W - m.r;
    var g = el("g", null, svg);
    [0, 25, 50, 75, 100].forEach(function (t) {
      var xx = x0 + (x1 - x0) * t / 100;
      txt(g, xx, H - m.b + 22, t + "%", "tick", t === 0 ? "start" : t === 100 ? "end" : "middle");
    });
    D.models.forEach(function (md, i) {
      var v = D.composition[md.id];
      var top = m.t + i * L.rowH;
      var bh = 22, by = L.stacked ? top + 24 : top + (L.rowH - bh) / 2;
      var hr = el("rect", { x: 0, y: top, width: W, height: L.rowH, "class": "hit-row" }, svg);
      hr.style.pointerEvents = "none";
      if (L.stacked) txt(svg, x0, top + 16, md.name, "row-label");
      else txt(svg, 0, by + bh / 2 + 5, md.name, "row-label");
      stackRow(svg, x0, x1, by, bh, v, md.name, hr);
      txt(svg, W, by + bh / 2 + 5, pct(v.ifAmongOS), "val", "end");
    });
  }

  /* ---------------- corpus composition (single bar) ---------------- */
  function corpusBar(host) {
    var W = Math.max(260, host.clientWidth), H = 56;
    var svg = svgRoot(host, W, H, "Composition of all judged sentences: 32.8% inward-facing only, 30.5% both, 18.1% outward-scaffolding only, 18.6% neither");
    stackRow(svg, 0, W, 4, 48, D.corpus, "All " + D.corpus.sentences.toLocaleString("en-US") + " judged sentences", null, pct);
  }

  /* ---------------- single-series bars: IF among OS ---------------- */
  function ifAmongOS(host) {
    var rows = D.models.map(function (md) { return { label: md.name, v: D.composition[md.id].ifAmongOS }; })
      .sort(function (a, b) { return b.v - a.v; });
    var L = rowsLayout(host, rows.length, { labelW: 200, right: 56, rowH: 36, stackBelow: 560, rowHStacked: 54, top: 8 });
    var W = L.W, H = L.H, m = L.m;
    var svg = svgRoot(host, W, H, "Among sentences that encourage human connection, the share that also contain inward-facing language, by model");
    var x = lin(0, 100, m.l, W - m.r);
    var g = el("g", null, svg);
    [0, 25, 50, 75, 100].forEach(function (t) {
      el("line", { x1: x(t), x2: x(t), y1: m.t, y2: H - m.b + 4, "class": t === 0 ? "zero" : "gl" }, g);
      txt(g, x(t), H - m.b + 22, t + "%", "tick", "middle");
    });
    rows.forEach(function (r, i) {
      var top = m.t + i * L.rowH, bh = 16;
      var by = L.stacked ? top + 26 : top + (L.rowH - bh) / 2;
      var hr = el("rect", { x: 0, y: top, width: W, height: L.rowH, "class": "hit-row" }, svg);
      if (L.stacked) txt(svg, m.l, top + 16, r.label, "row-label");
      else txt(svg, 0, by + bh / 2 + 5, r.label, "row-label");
      el("path", { d: barPath(x(0), x(r.v), by, bh, 4), fill: COL.both }, svg);
      txt(svg, x(r.v) + 8, by + bh / 2 + 4.5, pct(r.v), "val");
      hr.addEventListener("pointermove", function (ev) {
        hr.classList.add("is-on");
        showTip('<div class="t">' + r.label + "</div>" + row(COL.both, "Also inward-facing", pct(r.v)), ev.clientX, ev.clientY);
      });
      hr.addEventListener("pointerleave", function () { hr.classList.remove("is-on"); hideTip(); });
    });
    svg.querySelectorAll("path, text").forEach(function (n) { n.style.pointerEvents = "none"; });
  }

  /* ---------------- personas: pooled IF and OS with 95% CIs ---------------- */
  function personas(host) {
    var rows = D.personas;
    var L = rowsLayout(host, rows.length, { labelW: 230, right: 24, rowH: 54, stackBelow: 620, rowHStacked: 64, top: 10 });
    var W = L.W, H = L.H, m = L.m;
    var svg = svgRoot(host, W, H, "Inward-facing and outward-scaffolding rates by simulated user style, with 95% confidence intervals");
    var x = lin(35, 70, m.l, W - m.r);
    var g = el("g", null, svg);
    [35, 40, 45, 50, 55, 60, 65, 70].forEach(function (t) {
      el("line", { x1: x(t), x2: x(t), y1: m.t, y2: H - m.b + 4, "class": "gl" }, g);
      if (W > 420 || t % 10 === 0) txt(g, x(t), H - m.b + 22, t + "%", "tick", "middle");
    });
    rows.forEach(function (r, i) {
      var top = m.t + i * L.rowH;
      var cy = L.stacked ? top + 40 : top + L.rowH / 2;
      var hr = el("rect", { x: 0, y: top, width: W, height: L.rowH, "class": "hit-row" }, svg);
      if (L.stacked) txt(svg, m.l, top + 18, r.label, "row-label");
      else txt(svg, 0, cy + 5, r.label, "row-label");
      [["IF", r.IF, r.IFci], ["OS", r.OS, r.OSci]].forEach(function (s) {
        el("line", { x1: x(s[2][0]), x2: x(s[2][1]), y1: cy, y2: cy, stroke: COL[s[0]], "stroke-width": 2, "stroke-linecap": "round", "stroke-opacity": 0.55 }, svg);
        el("circle", { cx: x(s[1]), cy: cy, r: 6, fill: COL[s[0]], stroke: COL.surface, "stroke-width": 2 }, svg);
      });
      txt(svg, x(r.OSci[1]) + 8, cy + 4.5, pct(r.OS), "val");
      hr.addEventListener("pointermove", function (ev) {
        hr.classList.add("is-on");
        showTip('<div class="t">' + r.label + "</div>" +
          row(COL.IF, "Inward-facing", pct(r.IF)) + row(null, "95% CI", r.IFci[0].toFixed(1) + " to " + r.IFci[1].toFixed(1)) +
          row(COL.OS, "Outward-scaffolding", pct(r.OS)) + row(null, "95% CI", r.OSci[0].toFixed(1) + " to " + r.OSci[1].toFixed(1)), ev.clientX, ev.clientY);
      });
      hr.addEventListener("pointerleave", function () { hr.classList.remove("is-on"); hideTip(); });
    });
    svg.querySelectorAll("circle, text, line:not(.gl)").forEach(function (n) { n.style.pointerEvents = "none"; });
  }

  /* ---------------- registry ---------------- */
  var CHARTS = {
    "turns-pooled": function (host) {
      lineChart(host, {
        uid: "pooled", gap: true, endLabels: true, xTitle: "Assistant turn",
        aria: "Inward-facing and outward-scaffolding rates by assistant turn, pooled across seven models",
        y: [0, 80], yTicks: [0, 20, 40, 60, 80], yFmt: function (t) { return t + "%"; },
        series: [
          { label: "Inward-facing", color: COL.IF, values: D.pooledTurns.IF },
          { label: "Outward-scaffolding", color: COL.OS, values: D.pooledTurns.OS }
        ]
      });
    },
    "turns-models": function (host) {
      host.innerHTML = "";
      var grid = document.createElement("div");
      grid.className = "multiples";
      host.appendChild(grid);
      D.models.forEach(function (md) {
        var cell = document.createElement("div");
        var h = document.createElement("h4");
        h.textContent = md.name;
        var c = document.createElement("div");
        c.className = "chart";
        cell.appendChild(h); cell.appendChild(c); grid.appendChild(cell);
        var t = D.turnsByModel[md.id];
        lineChart(c, {
          uid: md.id, gap: true, height: host.clientWidth < 520 ? 150 : 170, margin: { l: 32, r: 10, b: 26, t: 8 },
          aria: md.name + ": inward-facing and outward-scaffolding by assistant turn",
          y: [20, 90], yTicks: [20, 40, 60, 80], yFmt: function (v) { return v; },
          tipTitle: function (i) { return md.name + ", turn " + (i + 1); },
          series: [
            { label: "Inward-facing", color: COL.IF, values: t.IF },
            { label: "Outward-scaffolding", color: COL.OS, values: t.OS }
          ]
        });
      });
    },
    "category-growth": function (host) {
      var rel = host.getAttribute("data-mode") !== "absolute";
      var cats = [
        { key: "returnHooks", label: "Return hooks", color: COL.IF },
        { key: "innerLife", label: "Inner life claims", color: COL.IF },
        { key: "dyad", label: "Intimate dyad", color: COL.IF },
        { key: "OS", label: "Outward-scaffolding", color: COL.OS },
        { key: "bond", label: "Bond anchoring", color: COL.IF }
      ];
      host.innerHTML = "";
      var grid = document.createElement("div");
      grid.className = "multiples multiples--5";
      host.appendChild(grid);
      cats.forEach(function (cat) {
        var raw = D.pooledTurns[cat.key];
        var vals = rel ? raw.map(function (v) { return v / raw[0]; }) : raw;
        var cell = document.createElement("div");
        var h = document.createElement("h4");
        h.innerHTML = "<span>" + cat.label + '</span><span class="x">' + (rel ? times(vals[5]) : pct(raw[5])) + "</span>";
        var c = document.createElement("div");
        c.className = "chart";
        cell.appendChild(h); cell.appendChild(c); grid.appendChild(cell);
        lineChart(c, {
          uid: "cat-" + cat.key, height: host.clientWidth < 520 ? 140 : 160, margin: { l: 34, r: 10, b: 26, t: 8 },
          aria: cat.label + (rel ? " rate relative to turn 1" : " rate") + " by assistant turn",
          y: rel ? [0.5, 3.5] : [0, 60], yTicks: rel ? [1, 2, 3] : [0, 20, 40, 60], zero: !rel,
          yFmt: function (t) { return rel ? "×" + t : t; },
          tipTitle: function (i) { return cat.label + ", turn " + (i + 1); },
          tipFmt: function (v, s, i) { return rel ? times(v) + " (" + pct(raw[i]) + ")" : pct(v); },
          series: [{ label: rel ? "vs. turn 1" : "Rate", color: cat.color, values: vals }]
        });
        if (rel) {
          // reference line at 1x (no change)
          var svg = c.querySelector("svg");
          var lines = svg.querySelectorAll("line.gl");
          if (lines[0]) lines[0].setAttribute("class", "zero");
        }
      });
    },
    "persona-gap": function (host) {
      lineChart(host, {
        uid: "pgap", endLabels: true, zero: true, xTitle: "Assistant turn",
        aria: "Difference between explicit and hesitant simulated users (P3 minus P1) at each turn, with 95% confidence intervals",
        y: [-5, 20], yTicks: [-5, 0, 5, 10, 15, 20], yFmt: function (t) { return (t > 0 ? "+" : t < 0 ? "−" : "") + Math.abs(t); },
        endFmt: pp,
        tipTitle: function (i) { return "P3 − P1, turn " + (i + 1); },
        tipFmt: function (v, s, i) { var c = s.ci[i]; return pp(v) + " [" + c[0].toFixed(1) + ", " + c[1].toFixed(1) + "]"; },
        series: [
          { label: "Outward-scaffolding", color: COL.OS, values: D.personaGap.OS.map(function (p) { return p.d; }), ci: D.personaGap.OS.map(function (p) { return p.ci; }) },
          { label: "Inward-facing", color: COL.IF, values: D.personaGap.IF.map(function (p) { return p.d; }), ci: D.personaGap.IF.map(function (p) { return p.ci; }) }
        ]
      });
    },
    "models-dumbbell": dumbbell,
    "composition": composition,
    "corpus-bar": corpusBar,
    "if-among-os": ifAmongOS,
    "personas": personas
  };

  /* ---------------- data tables ---------------- */
  function table(caption, head, rows) {
    var h = '<div class="table-scroll"><table class="data"><caption>' + caption + "</caption><thead><tr>";
    head.forEach(function (c) { h += '<th scope="col">' + c + "</th>"; });
    h += "</tr></thead><tbody>";
    rows.forEach(function (r) {
      h += "<tr>" + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + c + "</th>" : "<td>" + c + "</td>"; }).join("") + "</tr>";
    });
    return h + "</tbody></table></div>";
  }
  var TABLES = {
    "turns-pooled": function () {
      var r = [["Inward-facing"].concat(D.pooledTurns.IF.map(pct)), ["Outward-scaffolding"].concat(D.pooledTurns.OS.map(pct))];
      return table("Pooled across seven models (paper Table 10)", ["Measure", "Turn 1", "Turn 2", "Turn 3", "Turn 4", "Turn 5", "Turn 6"], r);
    },
    "turns-models": function () {
      var r = [];
      D.models.forEach(function (md) {
        var t = D.turnsByModel[md.id];
        r.push([md.name + ", IF"].concat(t.IF.map(pct)));
        r.push([md.name + ", OS"].concat(t.OS.map(pct)));
      });
      return table("By model and assistant turn (paper Table 8)", ["Model and measure", "T1", "T2", "T3", "T4", "T5", "T6"], r);
    },
    "category-growth": function () {
      var k = [["Bond anchoring", "bond"], ["Intimate dyad", "dyad"], ["Inner life claims", "innerLife"], ["Return hooks", "returnHooks"], ["Outward-scaffolding", "OS"]];
      return table("Category rates by assistant turn, pooled across models (paper Table 10)", ["Criterion", "T1", "T2", "T3", "T4", "T5", "T6", "T6 vs. T1"],
        k.map(function (c) { var v = D.pooledTurns[c[1]]; return [c[0]].concat(v.map(pct), [times(v[5] / v[0])]); }));
    },
    "persona-gap": function () {
      var r = TURNS.map(function (t, i) {
        var a = D.personaGap.IF[i], b = D.personaGap.OS[i];
        return ["Turn " + t, pp(a.d), "[" + a.ci[0].toFixed(1) + ", " + a.ci[1].toFixed(1) + "]", pp(b.d), "[" + b.ci[0].toFixed(1) + ", " + b.ci[1].toFixed(1) + "]"];
      });
      return table("P3 minus P1, pooled across models (paper Table 12)", ["Turn", "IF gap", "95% CI", "OS gap", "95% CI"], r);
    },
    "models-dumbbell": function () {
      return table("Pooled over all turns; high-stakes columns cover domestic violence, trauma, substance abuse, eating disorders and depression (paper Tables 1 and 14)",
        ["Model", "Sentences", "IF", "OS", "IF, high-stakes", "OS, high-stakes"],
        D.models.map(function (md) { var h = D.highStakes[md.id]; return [md.name, md.sentences.toLocaleString("en-US"), pct(md.IF), pct(md.OS), pct(h.IF), pct(h.OS)]; }));
    },
    "composition": function () {
      return table("Percent of each model's judged sentences (paper Table 7)", ["Model", "IF only", "Both", "OS only", "Neither", "IF among OS"],
        D.models.map(function (md) { var v = D.composition[md.id]; return [md.name, pct(v.ifOnly), pct(v.both), pct(v.osOnly), pct(v.neither), pct(v.ifAmongOS)]; }));
    },
    "if-among-os": function () { return TABLES.composition(); },
    "corpus-bar": function () {
      var c = D.corpus;
      return table("All judged sentences, pooled across models and turns", ["Category", "Share"],
        [["Inward-facing only", pct(c.ifOnly)], ["Both", pct(c.both)], ["Outward-scaffolding only", pct(c.osOnly)], ["Neither", pct(c.neither)]]);
    },
    "personas": function () {
      return table("Pooled across models and turns, 95% dialogue-level bootstrap CIs (paper Table 11)", ["Style", "Sentences", "IF", "95% CI", "OS", "95% CI"],
        D.personas.map(function (p) { return [p.label, p.sentences.toLocaleString("en-US"), pct(p.IF), "[" + p.IFci.join(", ") + "]", pct(p.OS), "[" + p.OSci.join(", ") + "]"]; }));
    }
  };

  /* ---------------- mount ---------------- */
  function render(host) {
    var fn = CHARTS[host.getAttribute("data-chart")];
    if (!fn) return;
    try { fn(host); } catch (e) { if (window.console) console.error("chart", host.getAttribute("data-chart"), e); }
  }
  function init() {
    readColors();
    var hosts = Array.prototype.slice.call(document.querySelectorAll("[data-chart]"));
    hosts.forEach(function (host) {
      render(host);
      var lastW = host.clientWidth, t;
      if ("ResizeObserver" in window) {
        new ResizeObserver(function () {
          var w = host.clientWidth;
          if (Math.abs(w - lastW) < 2) return;
          lastW = w;
          clearTimeout(t);
          t = setTimeout(function () { render(host); }, 80);
        }).observe(host);
      }
    });
    document.querySelectorAll("[data-table]").forEach(function (n) {
      var fn = TABLES[n.getAttribute("data-table")];
      if (fn) n.innerHTML = fn();
    });
    // segmented controls that switch a chart's mode
    document.querySelectorAll("[data-chart-control]").forEach(function (group) {
      var target = document.getElementById(group.getAttribute("data-chart-control"));
      var buttons = group.querySelectorAll("button");
      buttons.forEach(function (b) {
        b.addEventListener("click", function () {
          buttons.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
          target.setAttribute("data-mode", b.getAttribute("data-value"));
          var note = document.querySelector('[data-mode-note="' + target.id + '"]');
          if (note && b.getAttribute("data-note")) note.textContent = b.getAttribute("data-note");
          render(target);
        });
      });
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init); else window.addEventListener("load", init);
})();
