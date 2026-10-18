/* Test de la Unidad 1 — Aquella vez */
window.TEST_U1 = {
  id: "u1",
  titulo: "Test de la Unidad 1",
  ejercicios: [
    { tipo: "elegir", enunciado: "Completa la frase.", frase: "A Natalia ___ leer novelas románticas.", imagen: "assets/img/u1/natalia.webp",
      opciones: ["le encanta", "le encantan", "me encanta", "les encanta"], correcta: 0,
      nota: "encantar + infinitivo → singular.", repaso: "le encanta + infinitivo / le encantan + plural" },

    { tipo: "escuchar-elegir", enunciado: "¿Qué oyes?", audio: "Ayer Luis armó el cubo en pocos minutos.",
      opciones: ["Ayer Luis armó el cubo en pocos minutos.", "Ayer Luis arma el cubo en pocos minutos.", "Ayer Luis armé el cubo en pocos minutos."], correcta: 0,
      repaso: "armar → armó (él, pretérito indefinido)" },

    { tipo: "parejas", enunciado: "Une cada infinitivo con su forma «yo» en pretérito indefinido.",
      pares: [["soñar", "soñé"], ["ver", "vi"], ["hacer", "hice"], ["traer", "traje"], ["llegar", "llegué"]] },

    { tipo: "ordenar", enunciado: "Escribe la frase en español.", frase: "Natalia dreamed about a ghost train.",
      fichas: ["Natalia", "soñó", "con", "un", "tren", "fantasma"], distractores: ["sueña", "soñé", "de"],
      repaso: "soñar con algo → Natalia soñó con un tren fantasma." },

    { tipo: "escribir", enunciado: "Escribe el verbo en pretérito indefinido.", frase: "Esta mañana (yo) ___ algunas notas. (escribir)", imagen: "assets/img/u1/mujer-rosa.webp",
      respuesta: "escribí", repaso: "escribir → escribí (yo)" },

    { tipo: "elegir", enunciado: "¿Cuál es la frase correcta?",
      opciones: ["La mujer de rosa nunca olvida sus sueños.", "La mujer de rosa nunca no olvida sus sueños.", "La mujer de rosa no nunca olvida sus sueños."], correcta: 0,
      nota: "Con «nunca» antes del verbo, el verbo va en forma afirmativa.", repaso: "nunca + verbo afirmativo" },

    { tipo: "escuchar-ordenar", enunciado: "Toca lo que oyes.", audio: "Normalmente me despierto temprano.",
      fichas: ["Normalmente", "me", "despierto", "temprano"], distractores: ["se", "despierta", "tarde"],
      repaso: "despertarse → me despierto" },

    { tipo: "elegir", enunciado: "¿Verdadero o falso?", frase: "Alicia nunca viajó en el tren fantasma.", imagen: "assets/img/u1/alicia-natalia.webp", barajar: false,
      opciones: ["Verdadero", "Falso"], correcta: 1,
      nota: "Alicia dice: «Yo también viajé en ese tren una vez».", repaso: "Diálogo B: Alicia viajó en el tren hace muchos años." },

    { tipo: "ordenar", enunciado: "Ordena la frase.", frase: "Marcos llega tarde muy pocas veces (10%).",
      fichas: ["Marcos", "rara vez", "llega", "tarde"], alternativas: ["Rara vez Marcos llega tarde", "Marcos llega tarde rara vez"],
      repaso: "rara vez = 10%" },

    { tipo: "elegir", enunciado: "Completa la frase.", frase: "A los dos ___ los lugares tranquilos.", imagen: "assets/img/u1/luis.webp",
      opciones: ["les gustan", "les gusta", "nos gusta", "le gustan"], correcta: 0,
      nota: "a ellos → les; los lugares (plural) → gustan.", repaso: "les gustan + plural" },

    { tipo: "escuchar-elegir", enunciado: "¿Qué oyes?", audio: "Me encanta leer novelas románticas.",
      opciones: ["Me encanta leer novelas románticas.", "Me encantan las novelas románticas.", "Te encanta leer novelas románticas."], correcta: 0,
      repaso: "me encanta + infinitivo" },

    { tipo: "elegir", enunciado: "Elige el verbo correcto.", frase: "La matrioshka ___ un secreto.", imagen: "assets/img/u1/matrioshka-cubo.webp",
      opciones: ["guardó", "guardé", "guardaste", "guardaron"], correcta: 0,
      repaso: "guardar → guardó (ella)" },

    { tipo: "parejas", enunciado: "Une cada adverbio con su frecuencia.",
      pares: [["siempre", "100%"], ["normalmente", "80%"], ["a veces", "40%"], ["rara vez", "10%"], ["nunca", "0%"]] },

    { tipo: "escribir", enunciado: "Escribe el verbo en pretérito indefinido.", frase: "—¿___ miedo, Alicia? (tener, tú)", imagen: "assets/img/u1/natalia.webp",
      respuesta: "tuviste", solucion: "¿Tuviste miedo?", repaso: "tener → tuve, tuviste, tuvo (irregular)" },

    { tipo: "elegir", enunciado: "¿Por qué Brasil no forma parte de Hispanoamérica?",
      opciones: ["Porque en Brasil predomina el portugués.", "Porque Brasil no está en América.", "Porque en Brasil se habla francés y criollo."], correcta: 0,
      repaso: "Hispanoamérica = países americanos de habla española" },

    { tipo: "escuchar-ordenar", enunciado: "Toca lo que oyes.", audio: "Cuando tomaste el libro, el destino cambió.",
      fichas: ["Cuando", "tomaste", "el", "libro,", "el", "destino", "cambió."], distractores: ["tomé", "cambia"],
      solucion: "Cuando tomaste el libro, el destino cambió.", repaso: "tomar → tomaste (tú); cambiar → cambió (él)" },

    { tipo: "escribir", enunciado: "Completa con el pretérito indefinido de «ver».", frase: "Ayer (yo) ___ algo extraño en las cartas.", imagen: "assets/img/u1/alicia-natalia.webp",
      respuesta: "vi", repaso: "ver → vi, viste, vio (sin tilde)" },

    { tipo: "elegir", enunciado: "Completa la frase.", frase: "Sofía vive en el ___, en un lugar tranquilo y frío.", imagen: "assets/img/u1/sofia.webp",
      opciones: ["norte", "sur", "mar", "desierto"], correcta: 0, repaso: "Sección C: Sofía vive en el norte." }
  ]
};
