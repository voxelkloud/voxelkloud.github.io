// Renders the side-by-side page from the packed capture. Every panel reads the
// SAME index into the same timestamp list, so a scrub shows five renderers at
// one millisecond rather than five renderers at whatever frame each happened to
// have handy.
"use strict";

// Editorial identity for each arm: what it IS, not just what it is called. The
// first version of this page labelled the rows "potree" and "instanced" and the
// obvious questions came straight back — is that potree-core, and whose is the
// instanced one.
// Two callers: the single-file build inlines `DATA` above this script, and the
// hosted build fetches `data.json` beside the page. Same code, and the split
// build is the one that matters for a web page — 240 frames as real files load
// on demand and get cached, where one 7 MB document is paid for in full before
// anything appears.
function run(DATA) {
var INFO = {
  compute: {
    label: "compute", colour: "#4FD1C5", engine: "WebGPU",
    tag: "default", tagClass: "is-default",
    desc: "Compute-shader rasteriser: depth pre-pass with atomicMin, colour accumulation with atomicAdd, fullscreen resolve.",
  },
  points: {
    label: "points", colour: "#7AA2F7", engine: "WebGL 2",
    tag: "fallback", tagClass: "",
    desc: "gl_PointSize in a single drawArrays over one vertex arena. Takes over where WebGPU is unavailable.",
  },
  potree: {
    label: "Potree 1.8", colour: "#C0CAF5", engine: "WebGL 2",
    tag: "original viewer", tagClass: "",
    desc: "Potree as Markus Schütz ships it: the full viewer, with its own render loop and node selection.",
  },
  "potree-core": {
    label: "potree-core", colour: "#BB9AF7", engine: "WebGL 2",
    tag: "npm module", tagClass: "",
    desc: "Potree repackaged as an npm module, no GUI, embedded in a three scene of ours. minNodePixelSize 30.",
  },
};
var VK = ["compute", "points"];
var PT = ["potree", "potree-core"];

var byName = {};
DATA.variants.forEach(function (v) { byName[v.name] = v; });
var present = function (list) { return list.filter(function (n) { return byName[n]; }); };
var ALL = present(VK).concat(present(PT));
var TIMES = DATA.times;
var idx = Math.min(3, TIMES.length - 1);

var WORD = { 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six" };
var N = WORD[ALL.length] || String(ALL.length);

function fmt(n) { return n === null || n === undefined ? "—" : n.toLocaleString("en-US"); }
function ms(n) { return n === null || n === undefined ? "—" : n < 10000 ? n + " ms" : (n / 1000).toFixed(1) + " s"; }

// ---- run conditions -------------------------------------------------------
(function () {
  var v = DATA.variants[0];
  var bits = [
    ["dataset", v.dataset], ["budget", fmt(v.budget) + " pts"],
    ["viewport", v.viewport.width + "x" + v.viewport.height],
    ["network", v.profile + " (2.5 MB/s, cache off)"],
    ["window", v.windowSeconds + " s"], ["camera", "identical across all " + N.toLowerCase() + " arms"],
  ];
  document.getElementById("sub").innerHTML =
    N + " rasterisers loading <b>the same camera</b>, on the same dataset, in " +
    "the same window. Drag the slider: every panel jumps to the same millisecond.";
  document.getElementById("eb-panels").textContent =
    "the same millisecond across all " + N.toLowerCase();
  document.getElementById("cond").innerHTML = bits.map(function (b) {
    return "<span><b>" + b[0] + "</b> " + b[1] + "</span>";
  }).join("");
})();

// ---- who is who -----------------------------------------------------------
(function () {
  function card(title, note, names) {
    var lis = names.map(function (n) {
      var i = INFO[n];
      return '<li><span class="tag ' + i.tagClass + '">' + i.tag + "</span>" +
             '<span><code style="color:' + i.colour + '">' + i.label + "</code> " +
             '<span class="d">&middot; ' + i.engine + " &mdash; " + i.desc + "</span></span></li>";
    }).join("");
    return '<div class="card"><h3>' + title + "</h3>" +
           "<p>" + note + '</p><ul class="modes">' + lis + "</ul></div>";
  }
  document.getElementById("who").innerHTML =
    card("voxelkloud", "This library. One viewer, more than one rasteriser; it picks in this order and falls through to the next when the previous one is unavailable.", present(VK)) +
    card("Potree", "The reference we measure against. Two distributions of the same engine, and they do not behave alike.", present(PT));
})();

// ---- panels ---------------------------------------------------------------
function panels(id, names) {
  document.getElementById(id).innerHTML = names.map(function (n) {
    var i = INFO[n];
    var fam = VK.indexOf(n) >= 0 ? "vk" : "pt";
    return '<article class="panel" data-v="' + n + '">' +
      '<div class="panel-fam ' + fam + '">' + (fam === "vk" ? "voxelkloud" : "Potree") + "</div>" +
      '<div class="panel-hd"><span class="dot" style="background:' + i.colour + '"></span>' +
      '<span class="nm">' + i.label + '</span><span class="eg">' + i.engine + "</span></div>" +
      '<img class="shot" alt="' + i.label + '" data-shot="' + n + '">' +
      '<div class="readout">' +
      '<div><div class="k">fps</div><div class="v" data-f="fps">—</div></div>' +
      '<div><div class="k">points on GPU</div><div class="v" data-f="resident">—</div></div>' +
      '<div><div class="k">nodes</div><div class="v" data-f="nodes">—</div></div>' +
      "</div></article>";
  }).join("");
}
panels("grid-all", ALL);
(function () {
  var g = document.getElementById("grid-all");
  g.style.gridTemplateColumns = "repeat(" + ALL.length + ",minmax(0,1fr))";
  g.style.minWidth = ALL.length * 205 + "px";
})();

// ---- scrubber -------------------------------------------------------------
var rng = document.getElementById("rng");
rng.max = String(TIMES.length - 1);
rng.value = String(idx);
// Ticks READ OFF the ladder rather than hardcoded. The old labels were written
// for a hand-picked, non-linear set of stops and no longer sat above the stop
// they named once the ladder became uniform.
(function () {
  var last = TIMES[TIMES.length - 1];
  var marks = [];
  for (var sec = 0; sec * 1000 <= last; sec += 5) marks.push(sec + " s");
  document.getElementById("ticks").innerHTML =
    marks.map(function (t) { return "<span>" + t + "</span>"; }).join("");
})();

function paint() {
  var t = TIMES[idx];
  document.getElementById("tnow").textContent = t < 10000 ? (t / 1000).toFixed(2) + " s" : (t / 1000).toFixed(1) + " s";
  ALL.forEach(function (n) {
    var s = byName[n].shots[idx];
    var p = document.querySelector('.panel[data-v="' + n + '"]');
    if (!p) return;
    // A stop with no recorded frame is NOT an empty picture. The Potree arm has
    // nothing before 1571 ms, and drawing black there would read as "it rendered
    // nothing yet" when the truth is that the capture had not started sampling.
    p.classList.toggle("nodata", !s);
    if (!s) {
      p.querySelector("[data-shot]").removeAttribute("src");
      p.querySelector('[data-f="fps"]').textContent = "—";
      p.querySelector('[data-f="resident"]').textContent = "—";
      p.querySelector('[data-f="nodes"]').textContent = "—";
      return;
    }
    // `jpg` is a data URI in the single-file build and a relative path in the
    // hosted one; the element does not care which.
    p.querySelector("[data-shot]").src = s.jpg;
    p.querySelector('[data-f="fps"]').textContent = s.fps === null || s.fps === undefined ? "—" : Math.round(s.fps);
    // `resident` is what is ON THE GPU and drawable, not what the selector
    // asked for. The two are routinely confused; the Potree arms do not report
    // it at all, because the probe reads our own structures.
    p.querySelector('[data-f="resident"]').textContent = s.resident ? fmt(s.resident) : "—";
    p.querySelector('[data-f="nodes"]').textContent = s.nodes ? fmt(s.nodes) : "—";
  });
  drawChart();
}
rng.addEventListener("input", function () { idx = Number(rng.value); paint(); });

// ---- chart ----------------------------------------------------------------
var cv = document.getElementById("chart");
function drawChart() {
  var dpr = Math.min(devicePixelRatio || 1, 2);
  var w = cv.clientWidth, h = cv.clientHeight;
  cv.width = w * dpr; cv.height = h * dpr;
  var g = cv.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  var L = 46, R = 12, T = 10, B = 26;
  // Log on BOTH axes. The curves cover two orders of magnitude and everything
  // that separates them happens in the first two seconds; linear axes flatten
  // all five onto the same line exactly where the differences live.
  var x0 = Math.log(300), x1 = Math.log(30000);
  var y0 = Math.log(0.3), y1 = Math.log(100);
  var X = function (t) { return L + (Math.log(Math.max(t, 300)) - x0) / (x1 - x0) * (w - L - R); };
  var Y = function (d) { return T + (y1 - Math.log(Math.max(d, 0.3))) / (y1 - y0) * (h - T - B); };

  g.strokeStyle = "#252D38"; g.fillStyle = "#7E8A9B";
  g.font = '10px "IBM Plex Mono", monospace'; g.lineWidth = 1;
  [100, 30, 10, 3, 1].forEach(function (d) {
    var y = Y(d);
    g.beginPath(); g.moveTo(L, y); g.lineTo(w - R, y); g.stroke();
    g.textAlign = "right"; g.fillText(d + "%", L - 7, y + 3);
  });
  g.textAlign = "center";
  [[500, "0,5 s"], [1000, "1 s"], [3000, "3 s"], [10000, "10 s"], [30000, "30 s"]].forEach(function (p) {
    g.fillText(p[1], X(p[0]), h - 9);
  });

  ALL.forEach(function (n) {
    var c = byName[n].curve || [];
    if (!c.length) return;
    g.strokeStyle = INFO[n].colour; g.lineWidth = 2;
    g.beginPath();
    c.forEach(function (p, i) { var fn = i ? "lineTo" : "moveTo"; g[fn](X(p[0]), Y(p[1])); });
    g.stroke();
  });

  var tx = X(TIMES[idx]);
  g.strokeStyle = "#E4E9F0"; g.lineWidth = 1; g.setLineDash([3, 3]);
  g.beginPath(); g.moveTo(tx, T); g.lineTo(tx, h - B); g.stroke();
  g.setLineDash([]);
}
addEventListener("resize", drawChart);

document.getElementById("legend").innerHTML = ALL.map(function (n) {
  return '<span><span class="dot" style="background:' + INFO[n].colour + '"></span>' + INFO[n].label + "</span>";
}).join("");

// ---- table ----------------------------------------------------------------
(function () {
  var cols = [
    ["first ink", "firstInkMs", ms, "min"],
    ["half way", "halfWayMs", ms, "min"],
    ["settled", "settledMs", ms, "min"],
    ["median fps", "fpsMedian", function (v) { return v === null || v === undefined ? "—" : v.toFixed(1); }, "max"],
    ["points on GPU", "residentFinal", fmt, null],
    ["nodes", "nodesFinal", fmt, null],
  ];
  var best = {};
  cols.forEach(function (c) {
    if (!c[3]) return;
    var vals = ALL.map(function (n) { return byName[n][c[1]]; }).filter(function (v) { return typeof v === "number"; });
    if (vals.length) best[c[1]] = c[3] === "min" ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
  });
  var head = "<thead><tr><th>arm</th>" + cols.map(function (c) { return "<th>" + c[0] + "</th>"; }).join("") + "</tr></thead>";
  var body = ALL.map(function (n) {
    var v = byName[n];
    return "<tr><td><span class=\"dot\" style=\"display:inline-block;margin-right:7px;background:" + INFO[n].colour + '"></span>' + INFO[n].label + "</td>" +
      cols.map(function (c) {
        var val = v[c[1]];
        var cls = val === null || val === undefined || val === 0 ? "na" : (best[c[1]] === val ? "best" : "");
        // 24 fps is not a slow frame, it is a different experience. Flagged
        // rather than left to be read off as one more number in a column.
        if (c[1] === "fpsMedian" && typeof val === "number" && val < 50) cls = "bad";
        var txt = (val === 0 && (c[1] === "residentFinal" || c[1] === "nodesFinal")) ? "—" : c[2](val);
        return '<td class="' + cls + '">' + txt + "</td>";
      }).join("") + "</tr>";
  }).join("");
  document.getElementById("tbl").innerHTML = head + "<tbody>" + body + "</tbody>";
})();

// ---- caveats --------------------------------------------------------------
document.getElementById("notes").innerHTML = [
  ["Distance is measured against each arm's OWN final frame, never against another's.",
   "Comparing one rasteriser's pixels to another's would measure visual character rather than convergence: compute is smooth by construction and points is grainy, and neither of those is lateness."],
  ["\u201CPoints on GPU\u201D is not what the LOD asked for.",
   "The selector picks far more; this column counts what was resident and drawable. The two are routinely confused, including by the visible-point counter itself."],
  ["The Potree arms report no residency.",
   "The probe reads this library's own structures, so those cells are left empty rather than zero. Their frames and their timings are comparable; their point counts are not."],
  ["\u201CSettled\u201D is asymptotic and separates almost nobody.",
   "It is a sanity check, not a podium. What actually separates them is half way: the moment the scene stops looking wrong."],
  ["A frame rate below vsync belongs to the renderer; one that lands on exactly 30.0 or 50.0 does not.",
   "A number that round is missed vsync, or CPU contention on the machine, and both have passed for a regression here more than once."],
].map(function (p) { return '<div class="note"><b>' + p[0] + "</b><p>" + p[1] + "</p></div>"; }).join("");

paint();
}

if (typeof DATA !== "undefined" && DATA !== null) {
  run(DATA);
} else {
  fetch("./data.json")
    .then(function (r) { return r.json(); })
    .then(run)
    .catch(function (e) {
      document.body.innerHTML =
        '<p style="padding:40px;font-family:monospace;color:#E06C75">' +
        "could not load data.json: " + String(e) + "</p>";
    });
}
