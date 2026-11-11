(function () {
  "use strict";
  var butang = document.querySelector(".butang-menu");
  var menu = document.getElementById("menu-utama");
  if (!butang || !menu) return;
  function tetap(buka) {
    menu.classList.toggle("buka", buka);
    butang.setAttribute("aria-expanded", buka ? "true" : "false");
    butang.setAttribute("aria-label", buka ? "Tutup menu" : "Buka menu");
  }
  butang.addEventListener("click", function (e) {
    e.stopPropagation();
    tetap(!menu.classList.contains("buka"));
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) tetap(false);
  });
  document.addEventListener("click", function (e) {
    if (!menu.contains(e.target)) tetap(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("buka")) {
      tetap(false);
      butang.focus();
    }
  });
})();
