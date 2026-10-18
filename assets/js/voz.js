/* =========================================================
   Aquella vez — voz en español
   Usa solo voces de español de Estados Unidos (es-US) y elige la de mejor calidad que
   ofrece el dispositivo (voces neuronales "Natural"/"Online" de
   Microsoft, voces de Google, voces "Premium/Mejorada" de Apple…)
   y descarta las voces robóticas (eSpeak, compactas).
   ========================================================= */
(function () {
  "use strict";
  const sintesis = window.speechSynthesis;
  let voces = [];
  let elegida = null;
  const CLAVE = "av:voz";

  function puntuar(v) {
    const n = v.name.toLowerCase();
    let p = 0;
    if (/natural|neural|online/.test(n)) p += 60;            // Edge / Windows 11: voces neuronales
    if (/premium|enhanced|mejorada|siri/.test(n)) p += 50;   // Apple: voces de alta calidad
    if (/google/.test(n)) p += 40;                            // Chrome / Android
    if (/(paloma|alonso|m[oó]nica|paulina|marisol|jorge|juan|diego|isabela|elvira|dalia|helena|laura|alvaro|álvaro|jimena|tomas|tomás|elena)/.test(n)) p += 10;
    if (/espeak|compact|compacta|robot/.test(n)) p -= 100;
    if (!v.localService) p += 5;                              // las voces en la nube suelen sonar mejor
    return p;
  }

  function cargar() {
    if (!sintesis) return [];
    voces = sintesis.getVoices().filter((v) => /^es[-_]us$/i.test(v.lang)); // solo español de Estados Unidos
    voces.sort((a, b) => puntuar(b) - puntuar(a));
    let guardada = null;
    try { guardada = localStorage.getItem(CLAVE); } catch (e) {}
    elegida = voces.find((v) => v.name === guardada) || voces[0] || null;
    document.dispatchEvent(new CustomEvent("av:voces"));
    return voces;
  }
  if (sintesis) {
    cargar();
    if (typeof sintesis.addEventListener === "function") sintesis.addEventListener("voiceschanged", cargar);
    else sintesis.onvoiceschanged = cargar;
  }

  /** ¿Hay una voz española de calidad aceptable? */
  function disponible() { return !!(elegida && puntuar(elegida) > -50); }

  function hablar(texto, lento) {
    return new Promise((res) => {
      if (!disponible()) return res(false);
      sintesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.voice = elegida; u.lang = elegida.lang;
      u.rate = lento ? 0.62 : 0.92; u.pitch = 1;
      u.onend = () => res(true); u.onerror = () => res(false);
      // Chrome a veces se queda "pausado": un pequeño retraso lo evita
      setTimeout(() => sintesis.speak(u), 40);
    });
  }

  window.AVVoz = {
    hablar, disponible, cargar,
    lista: () => voces,
    actual: () => elegida,
    elegir: (nombre) => { elegida = voces.find((v) => v.name === nombre) || elegida; try { localStorage.setItem(CLAVE, nombre); } catch (e) {} },
    calidad: (v) => puntuar(v || elegida || { name: "", lang: "" })
  };
})();
