/* =========================================================
   Aquella vez — motor del test de unidad (estilo Duolingo)
   Uso: AVTest.iniciar({ id, titulo, ejercicios: [...] })
   Tipos: elegir · escuchar-elegir · ordenar · escuchar-ordenar · escribir · parejas
   ========================================================= */
(function () {
  "use strict";
  const { comparar, limpiar, barajar, guardar, leer } = window.AV;

  /* ---------- sonidos (sintetizados, limpios) ---------- */
  let ctx = null;
  function nota(f, t0, dur, tipo = "sine", vol = 0.16) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, ctx.currentTime + t0);
    g.gain.setValueAtTime(0.0001, ctx.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + dur);
    o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + dur + 0.05);
  }
  function sonido(tipo) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      if (tipo === "ok") { nota(880, 0, .18, "sine", .14); nota(1318.5, .09, .32, "sine", .14); nota(1318.5, .09, .25, "triangle", .05); }
      if (tipo === "no") { nota(311, 0, .2, "triangle", .14); nota(233, .12, .32, "triangle", .14); }
      if (tipo === "fin") { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nota(f, i * .11, .45, "sine", .13)); nota(1568, .46, .7, "triangle", .05); }
      if (tipo === "clic") nota(660, 0, .05, "sine", .05);
    } catch (e) {}
  }

  /* ---------- iconos ---------- */
  const IC = {
    corazon: '<svg viewBox="0 0 24 24" fill="#ff4b4b"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.6 3 5 6.6 5c2 0 3.4 1.1 4.2 2.3h2.4C14 6.1 15.4 5 17.4 5 21 5 23.1 8.6 21.6 11.8 19.5 16.4 12 21 12 21z"/><path d="M7 8.2c-1 .2-1.8 1-2 2" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".6"/></svg>',
    altavoz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="#58cc02" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    no: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff4b4b" stroke-width="3.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  const ELOGIOS = ["¡Excelente!", "¡Muy bien!", "¡Correcto!", "¡Genial!", "¡Perfecto!", "¡Fantástico!", "¡Eso es!"];
  const TIPOS = { "elegir": "Elige la respuesta correcta", "escuchar-elegir": "Escucha", "ordenar": "Ordena la frase", "escuchar-ordenar": "Escucha y ordena", "escribir": "Escribe", "parejas": "Une las parejas" };
  const esAudio = (e) => e.tipo.startsWith("escuchar");
  const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  /** "___" en el texto se convierte en un hueco visual */
  const conHueco = (s) => esc(s).replace(/_{3,}/g, '<span class="t-hueco"></span>');

  let E = null; // estado

  function iniciar(cfg) {
    cerrar(true);
    const capa = document.createElement("div");
    capa.className = "t-capa"; capa.setAttribute("role", "dialog"); capa.setAttribute("aria-modal", "true"); capa.setAttribute("aria-label", cfg.titulo);
    capa.innerHTML = `
      <header class="t-cab">
        <button class="t-cerrar" type="button" aria-label="Salir del test">×</button>
        <div class="t-progreso" role="progressbar" aria-valuemin="0" aria-valuemax="100"><div class="t-barra"></div></div>
        <div class="t-vidas" aria-label="Corazones">${IC.corazon}<span>5</span></div>
      </header>
      <main class="t-cuerpo"></main>
      <footer class="t-pie"><div class="t-pie-in"><div class="t-msg"><span class="ico"></span><div><h4></h4><p></p></div></div><button class="t-btn" type="button">Empezar</button></div></footer>`;
    document.body.appendChild(capa); document.body.classList.add("t-abierto");
    E = { cfg, capa, cuerpo: capa.querySelector(".t-cuerpo"), pie: capa.querySelector(".t-pie"), btn: capa.querySelector(".t-btn") };
    capa.querySelector(".t-cerrar").onclick = () => { if (E.fase === "fin" || E.fase === "inicio" || confirm("¿Seguro que quieres salir? Perderás el progreso de este test.")) cerrar(); };
    E.btn.onclick = accionBoton;
    capa.addEventListener("keydown", teclado);
    pantallaInicio();
  }

  function cerrar(silencioso) {
    if (window.speechSynthesis) speechSynthesis.cancel();
    const c = document.querySelector(".t-capa"); if (c) c.remove();
    document.body.classList.remove("t-abierto");
    if (!silencioso && E) { const b = document.getElementById("empezar-test"); if (b) b.focus(); }
    E = null;
  }

  /* ---------- pantalla de inicio (con elección de voz) ---------- */
  function pantallaInicio() {
    E.fase = "inicio";
    pieNeutro("Empezar", false);
    E.capa.querySelector(".t-vidas").style.visibility = "hidden";
    const pintar = () => {
      const voces = AVVoz.lista(), hay = AVVoz.disponible();
      const opciones = voces.map((v) => `<option value="${esc(v.name)}" ${AVVoz.actual() && v.name === AVVoz.actual().name ? "selected" : ""}>${esc(v.name)} (${v.lang})</option>`).join("");
      E.cuerpo.innerHTML = `<div class="t-pantalla">
        <img class="zorro salta" src="assets/img/zorro.webp" alt="">
        <h2>${esc(E.cfg.titulo)}</h2>
        <p>${E.cfg.ejercicios.length} ejercicios · 5 corazones. Si fallas, el ejercicio vuelve al final.</p>
        <div class="t-voz">
          ${hay ? `<label for="t-voz-sel">🔊 Voz (español de Estados Unidos)</label>
          <div class="fila"><select id="t-voz-sel">${opciones}</select><button type="button" id="t-voz-probar">Probar</button></div>
          <small>Hemos elegido la voz de español de Estados Unidos de mejor calidad de tu dispositivo. Las voces «Natural», «Online», «Google» o «Mejorada» suenan mejor.</small>`
          : `<label>🔇 Audio no disponible</label><small>Tu dispositivo no tiene una voz de español de Estados Unidos, así que omitiremos los ejercicios de audio. En Chrome, Edge o Safari actualizados sí está disponible.</small>`}
        </div></div>`;
      const sel = E.cuerpo.querySelector("#t-voz-sel");
      if (sel) {
        sel.onchange = () => AVVoz.elegir(sel.value);
        E.cuerpo.querySelector("#t-voz-probar").onclick = () => AVVoz.hablar("Hola, soy tu voz para el test de Aquella vez.");
      }
    };
    pintar();
    const rep = () => { if (E && E.fase === "inicio") pintar(); };
    document.addEventListener("av:voces", rep, { once: true });
  }

  function empezar() {
    const audio = AVVoz.disponible();
    E.cola = E.cfg.ejercicios.filter((e) => audio || !esAudio(e)).map((e, i) => ({ ...e, _id: i }));
    E.total = E.cola.length; E.hechos = 0; E.vidas = 5; E.racha = 0; E.aciertosPrimera = 0;
    E.fallados = new Set(); E.t0 = Date.now(); E.errores = [];
    E.capa.querySelector(".t-vidas").style.visibility = "";
    actualizarCab();
    siguiente();
  }

  function actualizarCab() {
    const p = Math.round((E.hechos / E.total) * 100);
    E.capa.querySelector(".t-barra").style.width = p + "%";
    E.capa.querySelector(".t-progreso").setAttribute("aria-valuenow", p);
    E.capa.querySelector(".t-vidas span").textContent = E.vidas;
  }

  function pieNeutro(texto, deshabilitado) {
    E.pie.className = "t-pie";
    E.pie.querySelector("h4").textContent = ""; E.pie.querySelector("p").textContent = ""; E.pie.querySelector(".ico").innerHTML = "";
    E.btn.textContent = texto; E.btn.disabled = !!deshabilitado;
  }
  const listo = (si) => { E.btn.disabled = !si; };

  /* ---------- flujo ---------- */
  function siguiente() {
    if (!E.cola.length) return fin(true);
    E.actual = E.cola.shift();
    E.fase = "respondiendo";
    E.respuesta = null;
    pieNeutro("Comprobar", true);
    pintarEjercicio(E.actual);
    E.cuerpo.scrollTop = 0;
  }

  function accionBoton() {
    sonido("clic");
    if (E.fase === "inicio") return empezar();
    if (E.fase === "respondiendo" && !E.btn.disabled) return comprobar();
    if (E.fase === "corregido") { if (E.vidas <= 0) return fin(false); return siguiente(); }
    if (E.fase === "fin") return cerrar();
  }

  function comprobar() {
    const ej = E.actual;
    const r = E.evaluar(); // { ok, casi, solucion }
    E.fase = "corregido";
    if (window.speechSynthesis) speechSynthesis.cancel();
    E.cuerpo.querySelectorAll("button, input").forEach((b) => { if (!b.classList.contains("t-altavoz")) b.disabled = true; });
    if (r.ok) {
      sonido("ok"); E.hechos++; E.racha++;
      if (!E.fallados.has(ej._id)) E.aciertosPrimera++;
      E.pie.className = "t-pie ok";
      E.pie.querySelector(".ico").innerHTML = IC.ok;
      E.pie.querySelector("h4").textContent = r.casi ? "¡Casi perfecto!" : ELOGIOS[Math.floor(Math.random() * ELOGIOS.length)];
      E.pie.querySelector("p").textContent = r.casi ? "Atención a la tilde: " + r.solucion : (ej.nota || "");
      if (E.racha === 3 || E.racha === 5 || E.racha === 8 || E.racha === 12) mostrarRacha(E.racha);
      // los ejercicios de audio se repiten al acertar, como refuerzo
    } else {
      sonido("no"); E.vidas--; E.racha = 0;
      E.fallados.add(ej._id); E.errores.push(ej);
      E.cola.push(ej); // vuelve al final
      const v = E.capa.querySelector(".t-vidas"); v.classList.remove("pierde"); void v.offsetWidth; v.classList.add("pierde");
      E.pie.className = "t-pie no";
      E.pie.querySelector(".ico").innerHTML = IC.no;
      E.pie.querySelector("h4").textContent = "Solución correcta:";
      E.pie.querySelector("p").textContent = r.solucion + (ej.nota ? " — " + ej.nota : "");
    }
    E.btn.textContent = "Continuar"; E.btn.disabled = false;
    actualizarCab();
    E.btn.focus({ preventScroll: true });
  }

  function mostrarRacha(n) {
    const d = document.createElement("div"); d.className = "t-racha"; d.textContent = "🔥 ¡" + n + " seguidas!";
    E.capa.appendChild(d); setTimeout(() => d.remove(), 1700);
  }

  function fin(completo) {
    E.fase = "fin";
    if (window.speechSynthesis) speechSynthesis.cancel();
    const seg = Math.round((Date.now() - E.t0) / 1000);
    const precision = Math.round((E.aciertosPrimera / E.total) * 100);
    const xp = completo ? 10 + E.aciertosPrimera * 2 + (E.vidas === 5 ? 5 : 0) : E.hechos;
    if (completo) { const prev = parseInt(leer("av:test:" + E.cfg.id) || "0", 10); if (precision > prev) guardar("av:test:" + E.cfg.id, String(precision)); const m = document.getElementById("mejor-test"); if (m) m.textContent = "Mejor resultado: " + Math.max(prev, precision) + "%"; }
    const repasar = [...new Map(E.errores.map((e) => [e._id, e])).values()].slice(0, 6);
    E.capa.querySelector(".t-barra").style.width = (completo ? 100 : Math.round(E.hechos / E.total * 100)) + "%";
    E.cuerpo.innerHTML = `<div class="t-pantalla">
      <img class="zorro ${completo ? "salta" : ""}" src="assets/img/zorro.webp" alt="">
      <h2 class="${completo ? "oro" : ""}">${completo ? (precision >= 90 ? "¡Unidad dominada!" : "¡Test completado!") : "¡Te quedaste sin corazones!"}</h2>
      <p>${completo ? (precision >= 90 ? "Natalia y Luis estarían orgullosos." : "Buen trabajo. Repasa los puntos difíciles y vuelve a intentarlo.") : "No pasa nada: repasa la unidad y vuelve a intentarlo."}</p>
      <div class="t-stats">
        <div class="t-stat xp"><b>XP total</b><span>${xp}</span></div>
        <div class="t-stat pr"><b>${completo ? "Precisión" : "Progreso"}</b><span>${completo ? precision : Math.round(E.hechos / E.total * 100)}%</span></div>
        <div class="t-stat ti"><b>Tiempo</b><span>${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")}</span></div>
      </div>
      ${repasar.length ? `<div class="t-voz t-repaso"><label>Para repasar</label><ul>${repasar.map((e) => `<li>${esc(e.repaso || e.enunciado)}</li>`).join("")}</ul></div>` : ""}
      <button type="button" class="t-btn sec" id="t-otra">Repetir el test</button>
    </div>`;
    E.cuerpo.querySelector("#t-otra").onclick = () => iniciar(E.cfg);
    pieNeutro("Terminar", false);
    if (completo) sonido("fin");
  }

  /* ---------- teclado ---------- */
  function teclado(e) {
    if (!E) return;
    if (e.key === "Escape") { E.capa.querySelector(".t-cerrar").click(); return; }
    if (e.key === "Enter" && !(e.target.tagName === "BUTTON" && e.target !== E.btn) && !e.target.closest("select")) {
      if (!E.btn.disabled) { e.preventDefault(); accionBoton(); }
      return;
    }
    if (E.fase === "respondiendo" && /^[1-9]$/.test(e.key) && e.target.tagName !== "INPUT") {
      const ops = E.cuerpo.querySelectorAll(".t-opciones .t-op");
      const b = ops[parseInt(e.key, 10) - 1]; if (b) b.click();
    }
  }

  /* ---------- pintar ejercicios ---------- */
  function cabecera(ej) {
    return `<div class="t-tipo">${TIPOS[ej.tipo] || ""}</div><h2 class="t-enunciado">${conHueco(ej.enunciado)}</h2>`;
  }
  function bloqueAudio(ej) {
    setTimeout(() => reproducir(ej.audio, false), 350);
    return `<div class="t-audio">
      <button type="button" class="t-altavoz" data-lento="0" aria-label="Escuchar">${IC.altavoz}</button>
      <button type="button" class="t-altavoz lento" data-lento="1" aria-label="Escuchar despacio" title="Despacio">🐢</button>
    </div>`;
  }
  async function reproducir(texto, lento) {
    if (!E) return;
    const b = E.cuerpo.querySelector(`.t-altavoz[data-lento="${lento ? 1 : 0}"]`);
    if (b) b.classList.add("sonando");
    await AVVoz.hablar(texto, lento);
    if (b) b.classList.remove("sonando");
  }
  function enlazarAudio(ej) {
    E.cuerpo.querySelectorAll(".t-altavoz").forEach((b) => b.onclick = () => reproducir(ej.audio, b.dataset.lento === "1"));
    const s = E.cuerpo.querySelector(".t-sin-audio");
    if (s) s.onclick = () => { // saltar sin penalización
      speechSynthesis.cancel();
      E.cola = E.cola.filter((x) => !esAudio(x));
      E.total = Math.max(1, E.hechos + E.cola.length);
      actualizarCab(); siguiente();
    };
  }
  const botonSinAudio = '<button type="button" class="t-sin-audio">No puedo escuchar ahora</button>';

  function pintarEjercicio(ej) {
    const f = { elegir: pElegir, "escuchar-elegir": pElegir, ordenar: pOrdenar, "escuchar-ordenar": pOrdenar, escribir: pEscribir, parejas: pParejas }[ej.tipo];
    f(ej);
    if (esAudio(ej)) enlazarAudio(ej);
  }

  function fraseCaja(ej) {
    if (!ej.frase) return "";
    return `<div class="t-frase-caja"><img src="${ej.imagen || "assets/img/zorro.webp"}" alt=""><div class="t-bocadillo">${conHueco(ej.frase)}</div></div>`;
  }

  function pElegir(ej) {
    const ops = ej.barajar === false ? ej.opciones.slice() : barajar(ej.opciones);
    const correcta = ej.opciones[ej.correcta];
    const dos = ops.length === 2 || ops.every((o) => o.length < 16);
    E.cuerpo.innerHTML = `<div class="t-ej">${cabecera(ej)}${esAudio(ej) ? bloqueAudio(ej) : ""}${fraseCaja(ej)}
      <div class="t-opciones ${dos ? "dos" : ""}">${ops.map((o, i) => `<button type="button" class="t-op"><span class="k">${i + 1}</span><span>${esc(o)}</span></button>`).join("")}</div>
      ${esAudio(ej) ? botonSinAudio : ""}</div>`;
    const botones = [...E.cuerpo.querySelectorAll(".t-op")];
    botones.forEach((b, i) => b.onclick = () => {
      if (E.fase !== "respondiendo") return;
      botones.forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); E.respuesta = ops[i]; listo(true);
      if (ej.leerOpcion) AVVoz.hablar(ops[i]);
    });
    E.evaluar = () => {
      const ok = E.respuesta === correcta;
      botones.forEach((b, i) => { if (ops[i] === correcta) b.classList.add("ok"); else if (b.classList.contains("sel")) b.classList.add("no"); });
      return { ok, solucion: ej.solucion || correcta };
    };
  }

  function pOrdenar(ej) {
    const fichas = barajar([...ej.fichas, ...(ej.distractores || [])]);
    E.cuerpo.innerHTML = `<div class="t-ej">${cabecera(ej)}${esAudio(ej) ? bloqueAudio(ej) : ""}${fraseCaja(ej)}
      <div class="t-respuesta" aria-label="Tu respuesta"></div>
      <div class="t-banco">${fichas.map((t, i) => `<button type="button" class="t-ficha" data-i="${i}">${esc(t)}</button>`).join("")}</div>
      ${esAudio(ej) ? botonSinAudio : ""}</div>`;
    const zona = E.cuerpo.querySelector(".t-respuesta");
    const elegidas = [];
    E.cuerpo.querySelectorAll(".t-banco .t-ficha").forEach((orig) => orig.onclick = () => {
      if (E.fase !== "respondiendo" || orig.classList.contains("vacia")) return;
      sonido("clic");
      const copia = document.createElement("button"); copia.type = "button"; copia.className = "t-ficha"; copia.textContent = orig.textContent;
      copia.onclick = () => { if (E.fase !== "respondiendo") return; copia.remove(); orig.classList.remove("vacia"); elegidas.splice(elegidas.indexOf(copia), 1); listo(elegidas.length > 0); };
      zona.appendChild(copia); elegidas.push(copia); orig.classList.add("vacia"); listo(true);
    });
    E.evaluar = () => {
      const frase = [...zona.querySelectorAll(".t-ficha")].map((b) => b.textContent).join(" ");
      const validas = [ej.fichas.join(" "), ...(ej.alternativas || [])];
      const ok = validas.some((v) => limpiar(v) === limpiar(frase));
      return { ok, solucion: ej.solucion || mayus(ej.fichas.join(" ")) + (ej.fin || ".") };
    };
  }

  function pEscribir(ej) {
    E.cuerpo.innerHTML = `<div class="t-ej">${cabecera(ej)}${fraseCaja(ej)}
      <input class="t-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escribe aquí" aria-label="Tu respuesta">
      <div class="t-tildes" aria-label="Letras especiales">${["á", "é", "í", "ó", "ú", "ñ"].map((l) => `<button type="button" tabindex="-1">${l}</button>`).join("")}</div></div>`;
    const inp = E.cuerpo.querySelector(".t-input");
    inp.oninput = () => listo(inp.value.trim().length > 0);
    E.cuerpo.querySelectorAll(".t-tildes button").forEach((b) => {
      b.onmousedown = (e) => e.preventDefault();
      b.onclick = () => { const s = inp.selectionStart ?? inp.value.length, f = inp.selectionEnd ?? s; inp.value = inp.value.slice(0, s) + b.textContent + inp.value.slice(f); inp.focus(); inp.setSelectionRange(s + 1, s + 1); listo(true); };
    });
    setTimeout(() => { if (window.matchMedia("(pointer: fine)").matches) inp.focus(); }, 60);
    E.evaluar = () => {
      const r = comparar(inp.value, ej.respuesta);
      return { ok: r !== "mal", casi: r === "casi", solucion: ej.solucion || ej.respuesta.split("|")[0] };
    };
  }

  function pParejas(ej) {
    const izq = barajar(ej.pares.map((p, i) => ({ t: p[0], i })));
    const der = barajar(ej.pares.map((p, i) => ({ t: p[1], i })));
    E.cuerpo.innerHTML = `<div class="t-ej">${cabecera(ej)}
      <div class="t-parejas"><div class="col">${izq.map((o) => `<button type="button" class="t-op" data-i="${o.i}" data-l="i">${esc(o.t)}</button>`).join("")}</div>
      <div class="col">${der.map((o) => `<button type="button" class="t-op" data-i="${o.i}" data-l="d">${esc(o.t)}</button>`).join("")}</div></div></div>`;
    let sel = null, hechos = 0, fallos = 0;
    E.cuerpo.querySelectorAll(".t-parejas .t-op").forEach((b) => b.onclick = () => {
      if (E.fase !== "respondiendo") return;
      if (!sel || sel.dataset.l === b.dataset.l) { if (sel) sel.classList.remove("sel"); sel = b; b.classList.add("sel"); if (ej.leer && b.dataset.l === "d") AVVoz.hablar(b.textContent); return; }
      const a = sel; sel = null; a.classList.remove("sel");
      if (a.dataset.i === b.dataset.i) {
        sonido("clic"); [a, b].forEach((x) => { x.classList.add("ok"); setTimeout(() => { x.classList.remove("ok"); x.classList.add("hecho"); }, 350); });
        hechos++;
        if (hechos === ej.pares.length) { E.respuesta = true; listo(true); setTimeout(() => { if (E && E.fase === "respondiendo") comprobar(); }, 450); }
      } else {
        fallos++; [a, b].forEach((x) => { x.classList.add("no", "sacude"); setTimeout(() => x.classList.remove("no", "sacude"), 450); });
      }
    });
    E.evaluar = () => ({ ok: true, solucion: "", casi: false });
  }

  window.AVTest = { iniciar, cerrar };
})();
