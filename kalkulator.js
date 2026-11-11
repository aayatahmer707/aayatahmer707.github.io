(function (akar) {
  "use strict";

  var METRIK = [0.1, 0.106, 0.112, 0.118, 0.125, 0.132, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.212, 0.224, 0.236, 0.25, 0.265, 0.28, 0.3, 0.315, 0.335, 0.355, 0.375, 0.4, 0.425, 0.45, 0.475, 0.5, 0.53, 0.56, 0.6, 0.63, 0.67, 0.71, 0.75, 0.8, 0.85, 0.9, 0.95, 1, 1.06, 1.12, 1.18, 1.25, 1.32, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.12, 2.24, 2.36, 2.5, 2.65, 2.8, 3, 3.15];
  var SWG = { 8: 4.064, 9: 3.658, 10: 3.251, 11: 2.946, 12: 2.642, 13: 2.337, 14: 2.032, 15: 1.829, 16: 1.626, 17: 1.422, 18: 1.219, 19: 1.016, 20: 0.914, 21: 0.813, 22: 0.711, 23: 0.61, 24: 0.559, 25: 0.508, 26: 0.4572, 27: 0.4166, 28: 0.3759, 29: 0.3454, 30: 0.315, 31: 0.2946, 32: 0.2743, 33: 0.254, 34: 0.2337, 35: 0.2134, 36: 0.193, 37: 0.1727, 38: 0.1524, 39: 0.1321, 40: 0.1219, 41: 0.1118, 42: 0.1016 };
  var RHO = 0.017241;
  var KETUMPATAN = 8.9;
  var UNJURAN = 10;

  function luas(d) { return Math.PI * d * d / 4; }
  function diameter(a) { return Math.sqrt(4 * a / Math.PI); }
  function fpb(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function awg(n) { return 0.127 * Math.pow(92, (36 - n) / 39); }
  function t(x, n) { return Number(x).toFixed(n); }
  function sah(x) { return typeof x === "number" && isFinite(x) && x > 0; }
  function bulat(x) { return Math.abs(x - Math.round(x)) < 1e-9; }

  function saizAtas(d) {
    for (var i = 0; i < METRIK.length; i++) { if (METRIK[i] >= d - 1e-9) return METRIK[i]; }
    return null;
  }
  function saizBawah(d) {
    var hasil = null;
    for (var i = 0; i < METRIK.length; i++) { if (METRIK[i] <= d + 1e-9) hasil = METRIK[i]; }
    return hasil;
  }
  function saizHampir(d) {
    var hasil = METRIK[0];
    for (var i = 1; i < METRIK.length; i++) { if (Math.abs(luas(METRIK[i]) - luas(d)) < Math.abs(luas(hasil) - luas(d))) hasil = METRIK[i]; }
    return hasil;
  }
  function swgHampir(d) {
    var nombor = 8;
    for (var k in SWG) { if (Math.abs(SWG[k] - d) < Math.abs(SWG[nombor] - d)) nombor = Number(k); }
    return nombor;
  }
  function awgHampir(d) {
    var nombor = 1;
    for (var n = 1; n <= 44; n++) { if (Math.abs(awg(n) - d) < Math.abs(awg(nombor) - d)) nombor = n; }
    return nombor;
  }
  function tolok(d) {
    var s = swgHampir(d), a = awgHampir(d);
    return "SWG " + s + " (" + t(SWG[s], 3) + " mm), AWG " + a + " (" + t(awg(a), 3) + " mm)";
  }

  function belitan(m) {
    var amaran = [];
    var V = m.voltan, f = m.frekuensi, S = m.alur, P = m.kutub, D = m.diameter, L = m.panjang;
    var lapisan = m.lapisan === 2 ? 2 : 1, a = m.laluan || 1, B = m.fluks, J = m.ketumpatanArus, n = m.lembar || 1;
    var hs = sah(m.kedalaman) ? m.kedalaman : 0.16 * D;
    var isianSasaran = sah(m.isian) ? m.isian : 0.4;
    if (!sah(V) || !sah(f) || !sah(D) || !sah(L) || !sah(B) || !sah(J)) return { ralat: "Isi semua medan wajib dengan nombor yang lebih besar daripada sifar." };
    if (!sah(P) || !bulat(P) || P % 2 !== 0) return { ralat: "Bilangan kutub mestilah nombor genap seperti 2, 4, 6 atau 8." };
    if (!sah(S) || !bulat(S) || S % 3 !== 0) return { ralat: "Bilangan alur bagi belitan tiga fasa mestilah gandaan 3." };
    if (!bulat(a) || a < 1 || !bulat(n) || n < 1) return { ralat: "Laluan selari dan bilangan lembar mestilah nombor bulat bermula daripada 1." };
    if (lapisan === 1 && S % 6 !== 0) return { ralat: "Belitan satu lapis memerlukan bilangan alur gandaan 6." };
    var arus = m.sumberArus === "kuasa" ? m.kuasa * 1000 / (Math.sqrt(3) * V * (m.kecekapan / 100) * m.faktorKuasa) : m.arus;
    if (!sah(arus)) return { ralat: "Masukkan arus plat nama, atau kuasa bersama kecekapan dan faktor kuasa." };

    var tau = S / P, q = S / (3 * P), z = S / fpb(S, 3 * P);
    var kd = 0.5 / (z * Math.sin(Math.PI / (6 * z)));
    var y = sah(m.rentang) ? Math.round(m.rentang) : Math.max(1, Math.round(lapisan === 2 ? tau * 5 / 6 : tau));
    if (y >= 2 * tau) return { ralat: "Rentang gegelung terlalu besar berbanding pic kutub." };
    var kp = lapisan === 1 ? 1 : Math.sin(Math.PI / 2 * y / tau), kw = kp * kd;
    var Vf = m.sambungan === "delta" ? V : V / Math.sqrt(3);
    var tauM = Math.PI * D / P, luasKutub = tauM * L * 1e-6;
    var fluks = B * luasKutub;
    var N = Vf / (4.44 * f * fluks * kw);
    var zsTepat = 6 * N * a / S;
    var zs = lapisan === 1 ? Math.max(1, Math.round(zsTepat)) : Math.max(2, 2 * Math.round(zsTepat / 2));
    var lilitanGegelung = lapisan === 1 ? zs : zs / 2;
    var gegelung = lapisan === 1 ? S / 2 : S;
    var Ns = zs * S / (6 * a);
    var Bs = Vf / (4.44 * f * Ns * kw * luasKutub);
    var If = m.sambungan === "delta" ? arus / Math.sqrt(3) : arus;
    var Ic = If / a;
    var luasPerlu = Ic / J;
    var dPerlu = diameter(luasPerlu / n);
    var d = saizAtas(dPerlu);
    if (d === null) return { ralat: "Arus terlalu besar untuk dawai bulat tunggal. Tambah bilangan lembar atau laluan selari." };
    var dJ = d, dMuat = null;
    if (sah(m.luasAlur)) {
      dMuat = saizBawah(diameter(isianSasaran * m.luasAlur / (zs * n)));
      if (dMuat === null) return { ralat: "Alur terlalu kecil untuk bilangan konduktor ini. Semak luas alur dan ketumpatan fluks." };
      if (dMuat < d) d = dMuat;
    }
    var Js = Ic / (n * luas(d));
    var mlt = 2 * L + 4 * UNJURAN + Math.PI * y * Math.PI * (D + hs) / S;
    var jumlahLilitan = zs * S / 2;
    var panjang = jumlahLilitan * mlt / 1000 * n;
    var berat = panjang * luas(d) * KETUMPATAN / 1000;
    var r20 = RHO * (Ns * mlt / 1000) / (n * luas(d) * a);
    var r75 = r20 * 310 / 255;
    var kehilangan = 3 * If * If * r75;
    var isian = sah(m.luasAlur) ? zs * n * luas(d) / m.luasAlur : null;

    if (!bulat(q)) amaran.push("Alur per kutub per fasa bukan nombor bulat (q = " + t(q, 2) + "). Belitan pecahan memerlukan susunan kumpulan khas.");
    if (P % a !== 0) amaran.push("Bilangan laluan selari biasanya pembahagi bilangan kutub.");
    if (lapisan === 2 && y > tau) amaran.push("Rentang gegelung melebihi pic kutub. Rentang biasanya sama atau lebih pendek daripada pic kutub.");
    if (Math.abs(zs - zsTepat) / zsTepat > 0.05) amaran.push("Pembundaran konduktor per alur mengubah fluks lebih daripada 5%. Cuba ubah laluan selari atau jenis lapisan.");
    if (Bs > 0.65) amaran.push("Ketumpatan fluks purata melebihi 0.65 T. Teras mungkin tepu dan arus tanpa beban menjadi tinggi.");
    if (Bs < 0.3) amaran.push("Ketumpatan fluks purata di bawah 0.30 T. Motor mungkin kurang tork berbanding saiz terasnya.");
    if (Js > 8) amaran.push("Ketumpatan arus melebihi 8 A/mm². Belitan berisiko panas; semak saiz alur, arus dan kelas penebat.");
    if (isian !== null && isian > 0.45) amaran.push("Faktor isian melebihi 0.45. Gegelung sukar dimasukkan dengan tangan.");
    if (dMuat !== null && dMuat < dJ) amaran.push("Saiz dawai dihadkan oleh ruang alur, bukan oleh ketumpatan arus yang dipilih.");

    var butiran = [
      ["Laju segerak", t(120 * f / P, 0) + " psm"],
      ["Pic kutub", t(tau, 2) + " alur (" + t(tauM, 1) + " mm)"],
      ["Alur per kutub per fasa (q)", t(q, 2)],
      [lapisan === 1 ? "Rentang purata gegelung" : "Rentang gegelung", y + " alur (alur 1 ke " + (y + 1) + ")"],
      ["Faktor pic (kp)", t(kp, 4)],
      ["Faktor agihan (kd)", t(kd, 4)],
      ["Faktor belitan (kw)", t(kw, 4)],
      ["Voltan fasa", t(Vf, 1) + " V"],
      ["Fluks per kutub", t(Bs * luasKutub * 1000, 3) + " mWb"],
      ["Lilitan per fasa (kiraan)", t(N, 1)],
      ["Lilitan per fasa (selepas pembundaran)", t(Ns, 1)],
      ["Konduktor per alur", String(zs)],
      ["Lilitan per gegelung", String(lilitanGegelung)],
      ["Bilangan gegelung", String(gegelung)],
      ["Ketumpatan fluks purata sebenar", t(Bs, 3) + " T (puncak " + t(Bs * Math.PI / 2, 3) + " T)"],
      ["Arus fasa", t(If, 2) + " A"],
      ["Luas kuprum diperlukan", t(luasPerlu, 3) + " mm²"],
      ["Diameter kiraan", t(dPerlu, 3) + " mm"],
      ["Saiz dawai dicadangkan", n + " × " + t(d, 3) + " mm"],
      ["Tolok terdekat", tolok(d)],
      ["Ketumpatan arus sebenar", t(Js, 2) + " A/mm²"]
    ];
    if (isian !== null) butiran.push(["Faktor isian alur", t(isian, 3)]);
    butiran.push(["Panjang purata satu lilitan", t(mlt, 0) + " mm"]);
    butiran.push(["Jumlah panjang dawai", t(panjang, 0) + " m"]);
    butiran.push(["Berat kuprum", t(berat, 2) + " kg"]);
    butiran.push(["Rintangan fasa pada 20 °C", t(r20, 3) + " Ω"]);
    butiran.push(["Rintangan fasa pada 75 °C", t(r75, 3) + " Ω"]);
    butiran.push(["Kehilangan kuprum stator pada 75 °C", t(kehilangan, 0) + " W"]);
    var Ba = null;
    if (sah(m.lilitanAsal)) {
      var Na = m.lilitanAsal * (gegelung / 3) / a;
      Ba = Vf / (4.44 * f * Na * kw * luasKutub);
      butiran.push(["Ketumpatan fluks bagi data asal", t(Ba, 3) + " T"]);
      if (Ba > 0.65 || Ba < 0.3) amaran.push("Data asal memberi ketumpatan fluks di luar julat lazim 0.30 hingga 0.65 T. Semak ukuran teras, sambungan dan bilangan laluan selari.");
    }
    return {
      utama: [["Lilitan per gegelung", String(lilitanGegelung)], ["Saiz dawai", n + " × " + t(d, 2) + " mm"], ["Berat kuprum", t(berat, 2) + " kg"], ["Faktor belitan", t(kw, 3)]],
      butiran: butiran, amaran: amaran,
      nombor: { tau: tau, q: q, y: y, kp: kp, kd: kd, kw: kw, Vf: Vf, tauM: tauM, fluks: fluks, N: N, zsTepat: zsTepat, zs: zs, lilitanGegelung: lilitanGegelung, gegelung: gegelung, Ns: Ns, Bs: Bs, arus: arus, If: If, luasPerlu: luasPerlu, dPerlu: dPerlu, dJ: dJ, dMuat: dMuat, d: d, Js: Js, isian: isian, mlt: mlt, panjang: panjang, berat: berat, r20: r20, r75: r75, kehilangan: kehilangan, Ba: Ba }
    };
  }

  function setara(m) {
    var d1 = m.diameter, n1 = m.lembar || 1;
    if (!sah(d1) || !bulat(n1) || n1 < 1) return { ralat: "Masukkan diameter dawai asal dan bilangan lembar." };
    var jumlah = n1 * luas(d1), baris = [], nombor = [];
    for (var n = 1; n <= 6; n++) {
      var tepat = diameter(jumlah / n);
      if (tepat < METRIK[0] || tepat > METRIK[METRIK.length - 1] * 1.03) continue;
      var pilih = saizHampir(tepat);
      var beza = (n * luas(pilih) - jumlah) / jumlah * 100;
      baris.push([String(n), t(tepat, 3), t(pilih, 3), t(n * luas(pilih), 3), (beza >= 0 ? "+" : "−") + t(Math.abs(beza), 1) + "%"]);
      nombor.push({ n: n, tepat: tepat, pilih: pilih, beza: beza });
    }
    if (!baris.length) return { ralat: "Saiz di luar julat jadual dawai." };
    return {
      utama: [["Luas kuprum asal", t(jumlah, 3) + " mm²"], ["Tolok terdekat", "SWG " + swgHampir(d1)]],
      butiran: [["Dawai asal", n1 + " × " + t(d1, 3) + " mm"], ["Jumlah luas keratan", t(jumlah, 3) + " mm²"], ["Tolok terdekat bagi satu lembar", tolok(d1)]],
      jadual: { kepala: ["Bilangan lembar", "Diameter tepat (mm)", "Saiz piawai (mm)", "Jumlah luas (mm²)", "Beza luas"], baris: baris },
      amaran: ["Pilih gabungan dengan beza luas dalam lingkungan ±3%. Luas yang lebih kecil menaikkan suhu belitan."],
      nombor: { jumlah: jumlah, baris: nombor }
    };
  }

  function tukar(m) {
    var V1 = m.voltanAsal, V2 = m.voltanBaharu, f1 = m.frekuensiAsal, f2 = m.frekuensiBaharu, N1 = m.lilitan, d1 = m.diameter, n = m.lembar || 1;
    if (!sah(V1) || !sah(V2) || !sah(f1) || !sah(f2) || !sah(N1) || !sah(d1) || !bulat(n) || n < 1) return { ralat: "Isi semua medan dengan nombor yang lebih besar daripada sifar." };
    var tepat = N1 * (V2 / V1) * (f1 / f2);
    var N2 = Math.max(1, Math.round(tepat));
    var bezaFluks = (tepat / N2 - 1) * 100;
    var luasBaharu = luas(d1) * N1 / tepat;
    var dTepat = diameter(luasBaharu);
    var d2 = saizHampir(dTepat);
    var bezaLuas = (luas(d2) - luasBaharu) / luasBaharu * 100;
    var amaran = [];
    var nisbah = V2 / V1;
    if (Math.abs(nisbah - 1 / Math.sqrt(3)) < 0.02 || Math.abs(nisbah - Math.sqrt(3)) < 0.05) amaran.push("Nisbah voltan hampir √3. Motor dengan enam terminal boleh ditukar antara sambungan bintang dan delta tanpa dililit semula.");
    if (Math.abs(nisbah - 0.5) < 0.02 || Math.abs(nisbah - 2) < 0.05) amaran.push("Nisbah voltan hampir 2. Belitan dengan dua litar setiap fasa boleh ditukar antara sambungan siri dan selari tanpa dililit semula.");
    if (Math.abs(bezaFluks) > 3) amaran.push("Pembundaran lilitan mengubah fluks lebih daripada 3%.");
    if (Math.abs(bezaLuas) > 4) amaran.push("Saiz piawai terdekat berbeza lebih daripada 4% daripada luas yang dikira. Pertimbangkan dawai selari.");
    var butiran = [
      ["Lilitan per gegelung (kiraan)", t(tepat, 2)],
      ["Lilitan per gegelung baharu", String(N2)],
      ["Perubahan fluks akibat pembundaran", (bezaFluks >= 0 ? "+" : "−") + t(Math.abs(bezaFluks), 1) + "%"],
      ["Luas dawai baharu setiap lembar", t(luasBaharu, 3) + " mm²"],
      ["Diameter kiraan", t(dTepat, 3) + " mm"],
      ["Saiz piawai terdekat", n + " × " + t(d2, 3) + " mm (" + (bezaLuas >= 0 ? "+" : "−") + t(Math.abs(bezaLuas), 1) + "% luas)"],
      ["Tolok terdekat", tolok(d2)]
    ];
    if (Math.abs(f2 - f1) > 1e-9) {
      butiran.push(["Perubahan laju segerak", (f2 > f1 ? "+" : "−") + t(Math.abs(f2 / f1 - 1) * 100, 1) + "%"]);
      butiran.push(["Anggaran kuasa baharu", t(f2 / f1 * 100, 0) + "% daripada kuasa asal"]);
    }
    return {
      utama: [["Lilitan baharu", String(N2)], ["Saiz dawai baharu", n + " × " + t(d2, 2) + " mm"]],
      butiran: butiran, amaran: amaran,
      nombor: { tepat: tepat, N2: N2, bezaFluks: bezaFluks, luasBaharu: luasBaharu, dTepat: dTepat, d2: d2, bezaLuas: bezaLuas }
    };
  }

  function berat(m) {
    var d = m.diameter, n = m.lembar || 1, N = m.lilitan, g = m.gegelung, mlt = m.mlt;
    var lebihan = typeof m.lebihan === "number" && isFinite(m.lebihan) && m.lebihan >= 0 ? m.lebihan : 10;
    if (!sah(d) || !sah(N) || !sah(g) || !sah(mlt) || !bulat(n) || n < 1) return { ralat: "Isi semua medan dengan nombor yang lebih besar daripada sifar." };
    var panjang = N * g * mlt / 1000 * n;
    var kgPerMeter = luas(d) * KETUMPATAN / 1000;
    var kg = panjang * kgPerMeter;
    var rGegelung = RHO * (N * mlt / 1000) / (n * luas(d));
    return {
      utama: [["Jumlah panjang", t(panjang, 0) + " m"], ["Berat kuprum", t(kg, 2) + " kg"], ["Berat untuk dibeli", t(kg * (1 + lebihan / 100), 2) + " kg"]],
      butiran: [
        ["Luas keratan satu lembar", t(luas(d), 4) + " mm²"],
        ["Jumlah panjang dawai", t(panjang, 1) + " m"],
        ["Berat kuprum bersih", t(kg, 3) + " kg"],
        ["Berat termasuk lebihan " + t(lebihan, 0) + "%", t(kg * (1 + lebihan / 100), 3) + " kg"],
        ["Berat setiap 100 m", t(kgPerMeter * 100, 3) + " kg"],
        ["Panjang setiap 1 kg", t(1 / kgPerMeter, 0) + " m"],
        ["Rintangan satu gegelung pada 20 °C", t(rGegelung, 3) + " Ω"],
        ["Tolok terdekat", tolok(d)]
      ],
      amaran: [],
      nombor: { panjang: panjang, kg: kg, kgPerMeter: kgPerMeter, rGegelung: rGegelung }
    };
  }

  function pengubah(m) {
    var f = m.frekuensi, lebar = m.lebar, tindanan = m.tindanan, B = m.fluks, V1 = m.voltanPrimer, V2 = m.voltanSekunder, VA = m.kuasa, J = m.ketumpatanArus;
    var kt = sah(m.faktorTindanan) ? m.faktorTindanan : 0.9;
    var eta = sah(m.kecekapan) ? m.kecekapan / 100 : 0.9;
    var pampasan = typeof m.pampasan === "number" && isFinite(m.pampasan) && m.pampasan >= 0 ? m.pampasan : 5;
    if (!sah(f) || !sah(lebar) || !sah(tindanan) || !sah(B) || !sah(V1) || !sah(V2) || !sah(VA) || !sah(J)) return { ralat: "Isi semua medan dengan nombor yang lebih besar daripada sifar." };
    var A = lebar * tindanan * kt / 100;
    var tpv = 1 / (4.44 * f * B * A * 1e-4);
    var N1 = Math.round(V1 * tpv);
    var N2 = Math.round(V2 * tpv * (1 + pampasan / 100));
    var I2 = VA / V2, I1 = VA / (eta * V1);
    var d1 = saizAtas(diameter(I1 / J)), d2 = saizAtas(diameter(I2 / J));
    if (d1 === null || d2 === null) return { ralat: "Arus terlalu besar untuk dawai bulat tunggal dalam jadual." };
    var kapasiti = Math.pow(A / 1.152, 2);
    var amaran = [];
    if (VA > kapasiti * 1.1) amaran.push("Kuasa yang diminta melebihi anggaran kapasiti teras ini. Gunakan teras yang lebih besar.");
    if (B > 1.3) amaran.push("Ketumpatan fluks melebihi 1.3 T. Laminasi biasa mungkin tepu dan teras menjadi panas.");
    return {
      utama: [["Lilitan per volt", t(tpv, 2)], ["Lilitan primer", String(N1)], ["Lilitan sekunder", String(N2)]],
      butiran: [
        ["Luas bersih teras", t(A, 2) + " cm²"],
        ["Lilitan per volt", t(tpv, 3)],
        ["Lilitan primer", String(N1)],
        ["Lilitan sekunder termasuk pampasan " + t(pampasan, 0) + "%", String(N2)],
        ["Arus primer", t(I1, 3) + " A"],
        ["Arus sekunder", t(I2, 3) + " A"],
        ["Dawai primer", t(d1, 3) + " mm, " + tolok(d1)],
        ["Dawai sekunder", t(d2, 3) + " mm, " + tolok(d2)],
        ["Anggaran kapasiti teras", t(kapasiti, 0) + " VA"]
      ],
      amaran: amaran,
      nombor: { A: A, tpv: tpv, N1: N1, N2: N2, I1: I1, I2: I2, d1: d1, d2: d2, kapasiti: kapasiti }
    };
  }

  var KIRA = { belitan: belitan, setara: setara, tukar: tukar, berat: berat, pengubah: pengubah };
  var enjin = { kira: KIRA, metrik: METRIK, swg: SWG, awg: awg, luas: luas, saizHampir: saizHampir, swgHampir: swgHampir, awgHampir: awgHampir };

  if (typeof module !== "undefined" && module.exports) { module.exports = enjin; return; }
  akar.KalkulatorLilitan = enjin;

  function unsur(nama, kelas, teks) {
    var e = document.createElement(nama);
    if (kelas) e.className = kelas;
    if (teks !== undefined) e.textContent = teks;
    return e;
  }

  function baca(borang) {
    var m = {};
    Array.prototype.forEach.call(borang.elements, function (medan) {
      if (!medan.name) return;
      if (medan.tagName === "SELECT") { m[medan.name] = medan.dataset.jenis === "nombor" ? Number(medan.value) : medan.value; return; }
      var nilai = medan.value.trim().replace(",", ".");
      m[medan.name] = nilai === "" ? NaN : Number(nilai);
    });
    return m;
  }

  function papar(bekas, hasil) {
    bekas.textContent = "";
    if (hasil.ralat) { bekas.appendChild(unsur("p", "ralat", hasil.ralat)); return; }
    var kad = unsur("div", "kad-hasil");
    hasil.utama.forEach(function (b) {
      var k = unsur("div", "kad-nilai");
      k.appendChild(unsur("span", "kad-label", b[0]));
      k.appendChild(unsur("strong", "", b[1]));
      kad.appendChild(k);
    });
    bekas.appendChild(kad);
    if (hasil.amaran.length) {
      var senarai = unsur("ul", "amaran");
      hasil.amaran.forEach(function (a) { senarai.appendChild(unsur("li", "", a)); });
      bekas.appendChild(senarai);
    }
    if (hasil.jadual) {
      var pembalut = unsur("div", "tatal");
      var jadual = unsur("table", "jadual-data");
      var kepala = unsur("tr");
      hasil.jadual.kepala.forEach(function (h) { var th = unsur("th", "", h); th.scope = "col"; kepala.appendChild(th); });
      var thead = unsur("thead"); thead.appendChild(kepala); jadual.appendChild(thead);
      var tb = unsur("tbody");
      hasil.jadual.baris.forEach(function (b) { var tr = unsur("tr"); b.forEach(function (c) { tr.appendChild(unsur("td", "", c)); }); tb.appendChild(tr); });
      jadual.appendChild(tb); pembalut.appendChild(jadual); bekas.appendChild(pembalut);
    }
    var butiran = unsur("table", "jadual-hasil");
    var badan = unsur("tbody");
    hasil.butiran.forEach(function (b) {
      var tr = unsur("tr"), th = unsur("th", "", b[0]);
      th.scope = "row"; tr.appendChild(th); tr.appendChild(unsur("td", "", b[1])); badan.appendChild(tr);
    });
    butiran.appendChild(badan); bekas.appendChild(butiran);
  }

  function mula() {
    var tab = Array.prototype.slice.call(document.querySelectorAll("[data-tab]"));
    var panel = Array.prototype.slice.call(document.querySelectorAll("[data-panel]"));
    function pilih(nama) {
      tab.forEach(function (b) { var aktif = b.dataset.tab === nama; b.setAttribute("aria-selected", aktif ? "true" : "false"); b.tabIndex = aktif ? 0 : -1; });
      panel.forEach(function (p) { p.hidden = p.dataset.panel !== nama; });
    }
    tab.forEach(function (b, i) {
      b.addEventListener("click", function () { pilih(b.dataset.tab); });
      b.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        var seterusnya = tab[(i + (e.key === "ArrowRight" ? 1 : tab.length - 1)) % tab.length];
        pilih(seterusnya.dataset.tab); seterusnya.focus();
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("form[data-kira]"), function (borang) {
      var bekas = document.getElementById(borang.dataset.hasil);
      function jalan() { papar(bekas, KIRA[borang.dataset.kira](baca(borang))); }
      function bersyarat() {
        Array.prototype.forEach.call(borang.querySelectorAll("[data-jika]"), function (e) {
          var syarat = e.dataset.jika.split("=");
          e.hidden = borang.elements[syarat[0]].value !== syarat[1];
        });
      }
      borang.addEventListener("submit", function (e) { e.preventDefault(); jalan(); bekas.scrollIntoView({ block: "nearest", behavior: "smooth" }); });
      borang.addEventListener("input", function () { bersyarat(); jalan(); });
      borang.addEventListener("reset", function () { setTimeout(function () { bersyarat(); jalan(); }, 0); });
      bersyarat(); jalan();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mula); else mula();
})(typeof window !== "undefined" ? window : this);
