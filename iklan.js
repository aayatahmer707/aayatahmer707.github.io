(function () {
  "use strict";
  var tetapan = {
    penerbit: "",
    slot: { atas: "", tengah: "", bawah: "" }
  };
  if (!tetapan.penerbit) return;
  var skrip = document.createElement("script");
  skrip.async = true;
  skrip.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(tetapan.penerbit);
  skrip.crossOrigin = "anonymous";
  document.head.appendChild(skrip);
  Array.prototype.forEach.call(document.querySelectorAll("[data-iklan]"), function (bekas) {
    var kod = tetapan.slot[bekas.getAttribute("data-iklan")];
    if (!kod) return;
    var label = document.createElement("span");
    label.className = "iklan-label";
    label.textContent = "Iklan";
    var unit = document.createElement("ins");
    unit.className = "adsbygoogle";
    unit.style.display = "block";
    unit.setAttribute("data-ad-client", tetapan.penerbit);
    unit.setAttribute("data-ad-slot", kod);
    unit.setAttribute("data-ad-format", "auto");
    unit.setAttribute("data-full-width-responsive", "true");
    bekas.appendChild(label);
    bekas.appendChild(unit);
    bekas.hidden = false;
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  });
})();
