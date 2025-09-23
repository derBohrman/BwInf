//Lese die Eingabe aus
let input = (prompt("grabmal.txt") || "0").split(/[\s\n]+/)
let cuboid = []
//Wandle String in Zahlen um und filtere ungültige Zahlen raus
for (let i = 0; i < input.length; i++) {
  let maybe = Number(input[i]) || 0
  if (maybe != 0) {
    cuboid.push(maybe)
  }
}
//Wenn die Eingabe kein Grabmal war, dann stoppe das Programm
if (cuboid.length < 2) {
  throw new Error("Kein Grabmal")
}
const size = cuboid.length
//Alle Türen sind geschlossen
let open = Array(size).fill(false)
open[0] = true
//Keine Position wurde erreicht
let reached = [...open]
let time = 0
//Finde den Quader mit dem minimalen Intervall
let minIntervall = cuboid[1]
for (let i = 2; i < size; i++) {
  minIntervall = Math.min(minIntervall, cuboid[i])
}
let nextMove = minIntervall
//Solange das Grabmal nicht erreicht wurde
while (!reached[size - 1]) {
  //Springe zum nächsten Zeitpunkt bei dem sich ein Quader bewegt
  time += nextMove
  nextMove = minIntervall
  //Teste für jeden Quader ob er sich bewegt
  for (let i = 1; i < size; i++) {
    if (time % cuboid[i] == 0) {
      open[i] = !open[i]
      reached[i] = false
      //Wenn die position von links erreichbar ist,
      //sind alle positionen rechts davon bis zum nächsten geschlossenen Quader erreichbar
      if (reached[i - 1]) {
        for (let j = i; j < size && open[j] && !reached[j]; j++) {
          reached[j] = true
        }
        //Wenn die position von rechts erreichbar ist,
        //sind alle positionen links davon bis zum nächsten geschlossenen Quader erreichbar
      } else if (reached[i + 1]) {
        for (let j = i; j > 0 && open[j]; j--) {
          reached[j] = true
        }
      }
      //Wenn sich der Quader nicht bewegt, messe seine Zeit bis zur nächsten bewegung
    } else {
      nextMove = Math.min(nextMove, cuboid[i] - time % cuboid[i])
    }
  }
}
//Merke dir den Weg den du bei rückwärtslaufender Zeit nimmst hast
let way = Array(size)
//Vom Grabmal aus wuden nur die positionen erreicht,
//die man direkt vom Grabmal aus erreichen kann
reached = Array(size).fill(false)
for (let i = size - 1; i > 0 && open[i]; i--) {
  reached[i] = true
  way[i] = [time, i]
}
nextMove = 1
//Solange der weg nicht zurück gefunden wurde
while (!reached[1]) {
  //Springe zum nächsten Zeitpunkt in der Zeit zurück bei dem sich ein Quader bewegt
  time -= nextMove
  nextMove = minIntervall
  //Teste für jeden Quader ob er sich bewegt
  for (let i = size - 1; i > 0; i--) {
    if ((time + 1) % cuboid[i] == 0) {
      open[i] = !open[i]
      reached[i] = false
      //wenn die position nun erreichbar und offen ist
      //suche nach einer direkt erreichbaren position mit den wenigsten weg anweisungen
      if ((reached[i - 1] || reached[i + 1]) && open[i]) {
        let origin = reached[i - 1] ? way[i - 1] : way[i + 1]
        for (let j = i - 1; j < size && reached[j]; j--) {
          if (origin.length > way[j].length) {
            origin = way[j]
          }
        }
        for (let j = i + 1; j < size && reached[j]; j++) {
          if (origin.length > way[j].length) {
            origin = way[j]
          }
        }
        //Alle direkt erreichbaren positionen sind nun erreichbar
        //und haben eine minimale anzahl an weg anweisungen
        reached[i] = true
        way[i] = [...origin, time, i]
        for (let j = i - 1; j > 0 && open[j]; j--) {
          if (!reached[j] || origin.length < way[j].length) {
            reached[j] = true
            way[j] = [...origin, time, j]
          }
        }
        for (let j = i + 1; j < size && open[j]; j++) {
          if (!reached[j] || origin.length < way[j].length) {
            reached[j] = true
            way[j] = [...origin, time, j]
          }
        }
      }
      //Wenn sich der Quader nicht bewegt, messe seine Zeit bis zur nächsten bewegung
    } else {
      nextMove = Math.min(nextMove, (time + 1) % cuboid[i])
    }
  }
}
//Wandle die daten über den kürzesten weg zum Anfang in Anweisungen zum erreichen des Ziels um
//und gebe diese über die console aus
way[1].push(0)
let out = "W"
for (let i = way[1].length - 3; i > 1; i -= 2) {
  out += `arte ${way[1][i] - way[1][i + 2]} Minuten, laufe in den Abschnitt ${way[1][i - 1]},\nw`
}
console.log(`${out}arte ${way[1][0] - way[1][2]} Minuten, laufe zum Grabmal.`)