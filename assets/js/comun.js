/* =========================================================
   Aquella vez — componentes comunes (ejercicios, glosario…)
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- utilidades ---------- */
  const sinTildes = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const limpiar = (s) => (s || "").toLowerCase().replace(/[.,;:¿?¡!«»"“”]/g, "").replace(/\s+/g, " ").trim();
  /** Compara respuesta con una o varias soluciones (separadas por |).
   *  Devuelve "bien", "casi" (solo faltan/sobran tildes) o "mal". */
  function comparar(resp, soluciones) {
    const r = limpiar(resp);
    const sols = String(soluciones).split("|").map(limpiar);
    if (sols.includes(r)) return "bien";
    if (sols.map(sinTildes).includes(sinTildes(r)) && r) return "casi";
    return "mal";
  }
  const barajar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const leer = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

  window.AV = { $, $$, comparar, limpiar, sinTildes, barajar, guardar, leer };

  /* ---------- botones de acción comunes ---------- */
  function acciones(cont, alComprobar, alReiniciar) {
    const div = document.createElement("div");
    div.className = "acciones";
    div.innerHTML = '<button type="button" class="btn">Comprobar</button>' +
      '<button type="button" class="btn sec">Reiniciar</button>' +
      '<span class="resultado" aria-live="polite"></span>';
    cont.appendChild(div);
    const res = div.querySelector(".resultado");
    div.children[0].addEventListener("click", () => {
      const [ok, total, extra] = alComprobar();
      res.className = "resultado " + (ok === total ? "bien" : "mal");
      res.textContent = (ok === total ? "¡Perfecto! " : "") + ok + " / " + total + (extra ? " · " + extra : "");
    });
    div.children[1].addEventListener("click", () => { alReiniciar(); res.textContent = ""; });
  }

  /* ---------- Verdadero / Falso ---------- */
  function initVF(cont) {
    const clave = cont.dataset.clave.split(",");
    const items = $$("li", cont);
    items.forEach((li) => {
      const b = document.createElement("div");
      b.className = "vf-botones";
      b.innerHTML = '<button type="button" aria-pressed="false" data-v="V" aria-label="Verdadero">V</button><button type="button" aria-pressed="false" data-v="F" aria-label="Falso">F</button>';
      li.appendChild(b);
      b.addEventListener("click", (e) => {
        const btn = e.target.closest("button"); if (!btn) return;
        $$("button", b).forEach((x) => x.setAttribute("aria-pressed", x === btn));
        li.dataset.r = btn.dataset.v; li.classList.remove("bien", "mal");
      });
    });
    acciones(cont, () => {
      let ok = 0;
      items.forEach((li, i) => { const bien = li.dataset.r === clave[i]; li.classList.toggle("bien", bien); li.classList.toggle("mal", !bien); if (bien) ok++; });
      return [ok, items.length];
    }, () => items.forEach((li) => { li.classList.remove("bien", "mal"); delete li.dataset.r; $$("button", li).forEach((x) => x.setAttribute("aria-pressed", "false")); }));
  }

  /* ---------- Completar escribiendo ---------- */
  function initCompletar(cont) {
    const huecos = $$("input.hueco", cont);
    huecos.forEach((h) => {
      h.setAttribute("autocomplete", "off"); h.setAttribute("autocapitalize", "off"); h.setAttribute("spellcheck", "false");
      const largo = Math.max(...h.dataset.a.split("|").map((s) => s.length));
      h.style.width = (largo + 3) + "ch";
      h.addEventListener("input", () => h.classList.remove("bien", "mal", "casi"));
    });
    acciones(cont, () => {
      let ok = 0, casi = 0;
      huecos.forEach((h) => { const r = comparar(h.value, h.dataset.a); h.classList.remove("bien", "mal", "casi"); h.classList.add(r); if (r === "bien") ok++; if (r === "casi") casi++; h.title = r === "mal" ? "Solución: " + h.dataset.a.split("|")[0] : ""; });
      return [ok, huecos.length, casi ? "revisa las tildes (naranja)" : ""];
    }, () => huecos.forEach((h) => { h.value = ""; h.classList.remove("bien", "mal", "casi"); }));
  }

  /* ---------- Banco de palabras (tocar palabra → hueco) ---------- */
  function initBanco(cont) {
    const libre = cont.hasAttribute("data-libre");
    const palabras = cont.dataset.palabras.split("—").map((s) => s.trim());
    const banco = $(".banco", cont);
    const huecos = $$("button.hueco", cont);
    let sel = null;
    const fichas = (libre ? palabras : barajar(palabras)).map((p) => {
      const f = document.createElement("button");
      f.type = "button"; f.className = "ficha"; f.textContent = p;
      banco.appendChild(f); return f;
    });
    const marcarSel = (h) => { huecos.forEach((x) => x.classList.toggle("sel", x === h)); sel = h; };
    const siguienteVacio = () => huecos.find((h) => !h.textContent) || null;
    marcarSel(siguienteVacio());
    fichas.forEach((f) => f.addEventListener("click", () => {
      const destino = sel && !sel.textContent ? sel : siguienteVacio();
      if (!destino) return;
      destino.textContent = f.textContent; destino._ficha = f; f.classList.add("usada");
      destino.classList.remove("bien", "mal");
      marcarSel(siguienteVacio());
    }));
    huecos.forEach((h) => h.addEventListener("click", () => {
      if (h.textContent) { h._ficha.classList.remove("usada"); h.textContent = ""; h._ficha = null; h.classList.remove("bien", "mal"); }
      marcarSel(h);
    }));
    acciones(cont, () => {
      if (libre) {
        const llenos = huecos.filter((h) => h.textContent).length;
        huecos.forEach((h) => { h.classList.toggle("bien", !!h.textContent); h.classList.toggle("mal", !h.textContent); });
        return [llenos, huecos.length, llenos === huecos.length ? "hay varias respuestas posibles: compara con tu profesor" : "faltan huecos"];
      }
      let ok = 0;
      huecos.forEach((h) => { const r = comparar(h.textContent, h.dataset.a) === "bien"; h.classList.toggle("bien", r); h.classList.toggle("mal", !r); if (r) ok++; });
      return [ok, huecos.length];
    }, () => { huecos.forEach((h) => { h.textContent = ""; h._ficha = null; h.classList.remove("bien", "mal"); }); fichas.forEach((f) => f.classList.remove("usada")); marcarSel(huecos[0]); });
  }

  /* ---------- Unir (desplegables) ---------- */
  function initUnir(cont) {
    const sels = $$("select.unir", cont);
    const letras = cont.dataset.letras.split(",");
    sels.forEach((s) => { s.innerHTML = '<option value="">—</option>' + letras.map((l) => `<option>${l}</option>`).join(""); s.addEventListener("change", () => s.closest("li").classList.remove("bien", "mal")); });
    acciones(cont, () => {
      let ok = 0;
      sels.forEach((s) => { const li = s.closest("li"); const b = s.value === s.dataset.a; li.classList.toggle("bien", b); li.classList.toggle("mal", !b); if (b) ok++; });
      return [ok, sels.length];
    }, () => sels.forEach((s) => { s.value = ""; s.closest("li").classList.remove("bien", "mal"); }));
  }

  /* ---------- Ordenar palabras ---------- */
  const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  function initOrdenar(cont) {
    const items = $$("li[data-fichas]", cont);
    items.forEach((li) => {
      const fichas = li.dataset.fichas.split("|");
      li.innerHTML = '<div class="fila-ord"><div class="zona" aria-label="Tu frase"></div></div><div class="fichas"></div><div class="sol oculto"></div>';
      const zona = $(".zona", li), caja = $(".fichas", li);
      barajar(fichas).forEach((t) => {
        const f = document.createElement("button"); f.type = "button"; f.className = "ficha"; f.textContent = t;
        f.addEventListener("click", () => {
          (f.parentElement === caja ? zona : caja).appendChild(f);
          li.classList.remove("bien", "mal"); $(".sol", li).classList.add("oculto");
          actualizarMayus(zona);
        });
        caja.appendChild(f);
      });
    });
    function actualizarMayus(zona) {
      $$(".ficha", zona).forEach((f, i) => { const t = f.textContent; f.textContent = i === 0 ? mayus(t) : (f.dataset.nombre ? t : t.charAt(0).toLowerCase() + t.slice(1)); });
    }
    // nombres propios conservan su mayúscula
    $$(".ficha", cont).forEach((f) => { if (/^[A-ZÁÉÍÓÚÑ]/.test(f.textContent)) f.dataset.nombre = "1"; });
    acciones(cont, () => {
      let ok = 0;
      items.forEach((li) => {
        const frase = $$(".zona .ficha", li).map((f) => f.textContent).join(" ");
        const validas = li.dataset.ok.split(";");
        const b = validas.some((v) => limpiar(v) === limpiar(frase));
        li.classList.toggle("bien", b); li.classList.toggle("mal", !b);
        const sol = $(".sol", li);
        if (!b) { sol.textContent = "Solución: " + validas[0]; sol.classList.remove("oculto"); }
        else { sol.textContent = mayus(frase) + "."; sol.classList.remove("oculto"); }
        if (b) ok++;
      });
      return [ok, items.length];
    }, () => items.forEach((li) => { const caja = $(".fichas", li); $$(".zona .ficha", li).forEach((f) => caja.appendChild(f)); li.classList.remove("bien", "mal"); $(".sol", li).classList.add("oculto"); $$(".ficha", li).forEach((f) => { if (!f.dataset.nombre) f.textContent = f.textContent.charAt(0).toLowerCase() + f.textContent.slice(1); }); }));
  }

  /* ---------- Respuestas libres (se guardan en el navegador) ---------- */
  function initLibres() {
    $$("textarea.libre, .cuaderno textarea").forEach((t) => {
      const k = "av:" + t.dataset.id;
      const v = leer(k); if (v) t.value = v;
      t.addEventListener("input", () => guardar(k, t.value));
    });
    $$("[data-modelo]").forEach((el) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "btn-link"; b.textContent = "Ver respuesta modelo";
      const m = document.createElement("div"); m.className = "modelo oculto"; m.textContent = el.dataset.modelo;
      el.after(b, m);
      b.addEventListener("click", () => { m.classList.toggle("oculto"); b.textContent = m.classList.contains("oculto") ? "Ver respuesta modelo" : "Ocultar respuesta"; });
    });
  }

  /* ---------- Diálogos ---------- */
  /** Convierte "{vi|vi_a}" en una palabra tocable con traducción. */
  function marcar(txt) {
    return txt.replace(/\{([^|}]+)\|([^}]+)\}/g, (_, f, k) => `<span class="ind" tabindex="0" role="button" data-k="${k}">${f}</span>`);
  }
  const PERSONAJES = { L: ["Luis", "luis", "izq"], N: ["Natalia", "natalia", "der"], A: ["Alicia", "alicia", "izq"] };
  function lineaHTML(l, ladoNatalia) {
    const [nombre, clase, lado0] = PERSONAJES[l[0]];
    const lado = l[0] === "N" ? ladoNatalia : lado0;
    return `<div class="linea ${clase} ${lado}"><span class="avatar" aria-hidden="true">${nombre[0]}</span><div class="burbuja"><span class="quien">${nombre}</span>${marcar(l[1])}</div></div>`;
  }
  window.AV.dialogo = function (cont, lineas) {
    cont.innerHTML = lineas.map((l) => lineaHTML(l, "der")).join("");
  };
  /** Diálogo dividido en escenas, con navegación y opción "ver todo". */
  window.AV.dialogoEscenas = function (cont, escenas) {
    let i = 0, todo = false;
    cont.innerHTML = '<div class="escenas-cuerpo"></div><div class="escenas-nav"><button type="button" class="btn sec ant">‹ Anterior</button><div class="puntos" role="tablist"></div><button type="button" class="btn sig">Siguiente ›</button></div><p style="text-align:center;margin-top:10px"><button type="button" class="btn-link todo">Ver el diálogo completo</button></p>';
    const cuerpo = $(".escenas-cuerpo", cont), puntos = $(".puntos", cont);
    escenas.forEach((e, k) => { const b = document.createElement("button"); b.type = "button"; b.textContent = k + 1; b.setAttribute("aria-label", "Escena " + (k + 1)); b.onclick = () => ir(k); puntos.appendChild(b); });
    const escenaHTML = (e, k) => `<h3 class="escena-titulo">Escena ${k + 1} · ${e.titulo}</h3><div class="dialogo">${e.lineas.map((l) => lineaHTML(l, "der")).join("")}</div>`;
    function pintar() {
      cuerpo.innerHTML = todo ? escenas.map(escenaHTML).join('<hr style="border:0;border-top:1px dashed var(--linea);margin:18px 0">') : escenaHTML(escenas[i], i);
      $(".escenas-nav", cont).classList.toggle("oculto", todo);
      $$("button", puntos).forEach((b, k) => b.classList.toggle("activo", k === i));
      $(".ant", cont).disabled = i === 0; $(".ant", cont).style.opacity = i === 0 ? .4 : 1;
      $(".sig", cont).textContent = i === escenas.length - 1 ? "Ejercicios ›" : "Siguiente ›";
      $(".todo", cont).textContent = todo ? "Ver por escenas" : "Ver el diálogo completo";
    }
    function ir(k) { i = k; pintar(); cont.scrollIntoView({ behavior: "smooth", block: "start" }); }
    $(".ant", cont).onclick = () => i > 0 && ir(i - 1);
    $(".sig", cont).onclick = () => { if (i < escenas.length - 1) ir(i + 1); else { const d = cont.dataset.despues; if (d) document.getElementById(d).scrollIntoView({ behavior: "smooth" }); } };
    $(".todo", cont).onclick = () => { todo = !todo; pintar(); };
    pintar();
  };

  /* ---------- Traducciones emergentes ---------- */
  function initGlosario() {
    const G = window.GLOSARIO_U1 || {};
    /* Idiomas que se muestran (versión rusa). Los datos ya incluyen en, it y sr
       para futuras versiones: basta con poner, p. ej., ["en"] o window.AV_IDIOMAS. */
    const IDIOMAS = window.AV_IDIOMAS || ["ru"];
    let pop = null, actual = null, fijado = false, tCerrar = null;
    const puedeHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const PERS = { "yo": "1.ª persona singular (yo)", "tú": "2.ª persona singular (tú)", "él/ella": "3.ª persona singular (él / ella)", "ellas": "3.ª persona plural (ellas)" };

    function cerrar() {
      if (pop) pop.remove(); pop = null;
      if (actual) actual.classList.remove("abierta");
      actual = null; fijado = false;
    }
    function abrir(el, fijar) {
      const d = G[el.dataset.k]; if (!d) return;
      if (actual === el) { if (fijar) fijado = true; return; }
      cerrar();
      actual = el; fijado = !!fijar; el.classList.add("abierta");
      pop = document.createElement("div");
      pop.className = "traduccion"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Traducción de " + el.textContent);
      pop.innerHTML = `<button class="cerrar" type="button" aria-label="Cerrar">×</button>
        <div class="forma">${el.textContent}</div>
        <div class="gram">Pretérito indefinido de <b>${d.inf}</b> · ${PERS[d.per] || d.per}${d.irr ? " · irregular" : ""}</div>
        <dl>${IDIOMAS.filter((l) => d[l]).map((l) => `<dt>${l.toUpperCase()}</dt><dd lang="${l}">${d[l]}</dd>`).join("")}</dl>`;
      document.body.appendChild(pop);
      pop.querySelector(".cerrar").addEventListener("click", (e) => { e.stopPropagation(); cerrar(); el.focus(); });
      pop.addEventListener("mouseenter", () => clearTimeout(tCerrar));
      pop.addEventListener("mouseleave", () => { if (!fijado) tCerrar = setTimeout(cerrar, 250); });
      colocar();
    }
    function colocar() {
      if (!pop || !actual) return;
      if (window.innerWidth <= 560) return; // en móvil se muestra como hoja inferior (CSS)
      const r = actual.getBoundingClientRect(), p = pop.getBoundingClientRect();
      let x = r.left + r.width / 2 - p.width / 2;
      x = Math.max(12, Math.min(x, window.innerWidth - p.width - 12));
      let y = r.bottom + 8;
      if (y + p.height > window.innerHeight - 8) y = r.top - p.height - 8;
      pop.style.left = x + "px"; pop.style.top = Math.max(8, y) + "px";
    }
    document.addEventListener("click", (e) => {
      const el = e.target.closest(".ind");
      if (el) { e.preventDefault(); if (actual === el && fijado) cerrar(); else abrir(el, true); return; }
      if (pop && !pop.contains(e.target)) cerrar();
    });
    document.addEventListener("keydown", (e) => {
      const el = e.target.closest && e.target.closest(".ind");
      if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); actual === el ? cerrar() : abrir(el, true); }
      if (e.key === "Escape") cerrar();
    });
    if (puedeHover) {
      document.addEventListener("mouseover", (e) => {
        const el = e.target.closest(".ind"); if (!el) return;
        clearTimeout(tCerrar); if (!fijado || actual !== el) { if (fijado) return; abrir(el, false); }
      });
      document.addEventListener("mouseout", (e) => {
        const el = e.target.closest(".ind"); if (!el || fijado) return;
        if (pop && e.relatedTarget && pop.contains(e.relatedTarget)) return;
        tCerrar = setTimeout(cerrar, 250);
      });
    }
    window.addEventListener("scroll", () => { if (window.innerWidth > 560) { fijado ? colocar() : cerrar(); } }, { passive: true });
    window.addEventListener("resize", colocar);
  }

  /* ---------- Ampliar imágenes ---------- */
  function initLightbox() {
    $$(".ampliable").forEach((f) => f.addEventListener("click", () => {
      const img = $("img", f);
      const lb = document.createElement("div"); lb.className = "lightbox";
      lb.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
      lb.addEventListener("click", () => lb.remove());
      document.body.appendChild(lb);
    }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { const lb = $(".lightbox"); if (lb) lb.remove(); } });
  }

  /* ---------- Chip de sección activa ---------- */
  function initChips() {
    const chips = $$(".chips a"); if (!chips.length || !("IntersectionObserver" in window)) return;
    const mapa = new Map(chips.map((c) => [c.getAttribute("href").slice(1), c]));
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { chips.forEach((c) => c.classList.remove("activo")); const c = mapa.get(en.target.id); if (c) { c.classList.add("activo"); c.scrollIntoView({ block: "nearest", inline: "center" }); } } });
    }, { rootMargin: "-40% 0px -55% 0px" });
    mapa.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".ej-vf").forEach(initVF);
    $$(".ej-completar").forEach(initCompletar);
    $$(".ej-banco").forEach(initBanco);
    $$(".ej-unir").forEach(initUnir);
    $$(".ej-ordenar").forEach(initOrdenar);
    initLibres(); initGlosario(); initLightbox(); initChips();
  });
})();
