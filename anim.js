// Sincronizar las letras con la canción
var audio = document.querySelector("audio");
var lyrics = document.querySelector("#lyrics");

// Array de objetos que contiene cada línea y su tiempo de aparición en segundos
var lyricsData = [
  { text: "Las aves han dejado sus árboles", time: 10 },
  { text: "La luz se pone sobre mí", time: 13 },
  { text: "Puedo sentirte allí acostada sola", time: 16 },
  { text: "Llegamos aquí por el camino difícil", time: 22 },
  { text: "Todas esas palabras que intercambiamos", time: 24 },
  { text: "¿Acaso esas cosas maravillosas se rompen?", time: 28 },
  { text: "Porque en mi corazón y en mi mente", time: 33 },
  { text: "Nunca me retractare de las cosas que dije", time: 36 },
  { text: "Tan alto...", time: 38 },
  { text: "Las siento derrumbarse", time: 40 },
  { text: "Ella dijo:en mi corazon y en mi cabeza" , time: 43 },
  { text: "Dime por qué esto tiene que terminar", time: 46 },
  { text: "Oh, no", time: 49 },
  { text: "Oh, no", time: 52 },
  { text: "No pude salvarnos", time: 56 },
  { text: "Mi Atlántida", time: 59 },
  { text: "Caemos", time: 61 },
  { text: "Construimos esta ciudad en terreno inestable", time: 64 },
  { text: "No pude salvarnos", time: 67 },
  { text: "Mi Atlántida", time: 69 },
  { text: "Oh, no", time: 71 },
  { text: "La construimos para derrumbarla", time: 75 },
  { text: "Ahora todas las aves han huido", time: 90 },
  { text: "El dolor sólo me deja asustado", time: 93 },
  { text: "Perdiendo todo lo que siempre conocí", time: 96 },
  { text: "Todo se ha vuelto demaciado", time: 102 },
  { text: "Tal vez no estoy hecho para el amor", time: 105},
  { text: "Si supiera que podría alcanzarte, iría", time: 109 },
  { text: "Estás en mi corazón y en mi cabeza...", time: 112 },
];

// Animar las letras
function updateLyrics() {
  var time = Math.floor(audio.currentTime);
  var currentLine = lyricsData.find(
    (line) => time >= line.time && time < line.time + 4
  );

  if (currentLine) {
    // Calcula la opacidad basada en el tiempo en la línea actual
    var fadeInDuration = 0.1; // Duración del efecto de aparición en segundos
    var opacity = Math.min(1, (time - currentLine.time) / fadeInDuration);

    // Aplica el efecto de aparición
    lyrics.style.opacity = opacity;
    lyrics.innerHTML = currentLine.text;
  } else {
    // Restablece la opacidad y el contenido si no hay una línea actual
    lyrics.style.opacity = 0;
    lyrics.innerHTML = "";
  }
}

setInterval(updateLyrics, 1000);

//funcion titulo
// Función para ocultar el título después de 216 segundos
function ocultarTitulo() {
  var titulo = document.querySelector(".titulo");
  titulo.style.animation =
    "fadeOut 3s ease-in-out forwards"; /* Duración y función de temporización de la desaparición */
  setTimeout(function () {
    titulo.style.display = "none";
  }, 3000); // Espera 3 segundos antes de ocultar completamente
}

// Llama a la función después de 216 segundos (216,000 milisegundos)
setTimeout(ocultarTitulo, 216000);