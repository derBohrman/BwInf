function triggerFileUpload() {
 let fileInput = document.getElementById("fileUpload")
 fileInput.value = null
 fileInput.click()
}
//funktion um eine Datei Hochzuladen
document.getElementById("fileUpload").addEventListener("change", function (event) {
 if (event.target.files[0]) {
  let reader = new FileReader()
  reader.onload = function (e) {
   //lese die Eingabedaten aus und konvertiere sie in das Systemeigene Format
   let [width, height, labyrinths] = convertInput(e.target.result.replace(/\r/g, "").split("\n"))
   //lese die BFS-Limitierung aus
   let bound = +document.getElementById("bound").value || 1
   //starte die Zeitmessung
   let startTime = Date.now()
   //berechne einen annähernd optimalen Weg
   let [message, way] = main(width, height, labyrinths, bound)
   //Stoppe die Zeitmessung
   let runtime = (Date.now() - startTime) / 1000
   let mappedSteps = Array(labyrinths.length).fill(Array(width * height).fill(" "))
   //falls ein Ergebnis zurückgegeben wurde, visualisiere es
   if (message.length == 0) {
    let instructions
    [mappedSteps, instructions] = visualiseSteps(width, height, labyrinths, way)
    message = `Instructions: ${way.length - 1}\nSequence of instructions:${instructions}`
   }
   //gebe die annähernde Lösung und eine Visualisierung des Labyrinths aus
   let visualLabyrinths = visualiseLabyrinths(width, height, labyrinths, mappedSteps)
   document.getElementById("result").textContent = `Runtime: ${runtime}s\nBFS bound: ${bound}\n${message}\nLabyrinths:${visualLabyrinths}`
  }
  reader.readAsText(event.target.files[0])
 }
})
//funktion um mehrere Zeilen mit Binärdaten auf einmal auszulesen
function readLines(readStart, amount, text) {
 let result = []
 for (let i = readStart; i < readStart + amount; i++) {
  let line = text[i].split(" ")
  while (line[line.length - 1] == "") {
   line.pop()
  }
  for (let j = 0; j < line.length; j++) {
   line[j] = !+line[j]
  }
  result.push(line)
 }
 return result
}
//funktion um aus den wänden und böden die Daten für jede Position auszulesen
function convertLabyrinth(width, height, labyrinth, holes) {
 let [walls, floors] = labyrinth
 labyrinth = new Uint8ClampedArray(width * height)
 for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
   let tile = 0
   tile |= (floors[y - 1] || [])[x]
   tile |= (walls[y] || [])[x] << 1
   tile |= (floors[y] || [])[x] << 2
   tile |= (walls[y] || [])[x - 1] << 3
   labyrinth[x + y * width] = tile
  }
 }
 //falls Gruben ausgewählt wurden, füge sie auch ins Labyrinth ein
 if (document.getElementById("holes").checked) {
  for (let i = 0; i < holes.length; i++) {
   labyrinth[holes[i][0] + holes[i][1] * width] |= 16
  }
 }
 return labyrinth
}
//funktion um den Text in Labyrinthe zu konvertieren
function convertInput(text) {
 text[0] = text[0].split(" ")
 let [width, height] = [+text[0][0], +text[0][1]]
 let labyrinths = []
 let readInd = 1
 //lese alle Labyrinthe aus
 while (readInd + 2 * height <= text.length) {
  let labyrinth = []
  //lese Wändedaten und Bodendaten aus
  labyrinth.push(readLines(readInd, height, text))
  labyrinth.push(readLines(readInd + height, height - 1, text))
  //lese die Grubendaten aus
  let holeAmount = +text[readInd + 2 * height - 1]
  readInd += 2 * height
  let holes = []
  for (let i = readInd; i < readInd + holeAmount; i++) {
   text[i] = text[i].split(" ")
   holes.push([+text[i][0], +text[i][1]])
  }
  readInd += holeAmount
  //konvertiere die Daten ins Systemeigene Format
  labyrinths.push(convertLabyrinth(width, height, labyrinth, holes))
 }
 return [width, height, labyrinths]
}
//funktion um die bewegungen im Labyrinth zu visualisieren
function visualiseSteps(width, height, labyrinths, way) {
 let instructions = "\n"
 let lastReturn = 0
 let arrows = ["↑", "→", "↓", "←"]
 //anfangs sind keine Bewegungen aufgezeichnet
 let mappedSteps = []
 for (let i = 0; i < labyrinths.length; i++) {
  mappedSteps.push(Array(width * height).fill(" "))
 }
 //für jede bewegung
 for (let i = 0; i < way.length - 1; i++) {
  //ermittle in welche richtung gegangen wurde
  for (let direction = 0; direction < 4; direction++) {
   let same = true
   for (let l = 0; l < labyrinths.length; l++) {
    let position = move(width, height, labyrinths[l], direction, way[i][l])
    if (position != way[i + 1][l]) {
     same = false
    }
   }
   if (same) {
    //füge Pfeil in die Anweisungsfolge ein
    if (instructions.length - lastReturn > 150) {
     lastReturn = instructions.length
     instructions += "\n"
    }
    instructions += `${i + 1}: ${arrows[direction]}` + (i + 2 == way.length ? "" : ", ")
    //füge Pfeil in die visualisierung ein
    for (let l = 0; l < labyrinths.length; l++) {
     if (way[i][l] != width * height - 1) {
      mappedSteps[l][way[i][l]] = arrows[direction]
     }
    }
    break
   }
  }
 }
 return [mappedSteps, instructions]
}
//funktion um das Labyrinthe zu malen
function visualiseLabyrinths(width, height, labyrinths, mappedSteps) {
 let junctions = [" ", "╵", "╶", "╰", "╷", "│", "╭", "├", "╴", "╯", "─", "┴", "╮", "┤", "┬", "┼"]
 let visualisation = ""
 //für jedes Labyrinth
 for (let i = 0; i < labyrinths.length; i++) {
  let labyrinth = labyrinths[i]
  let path = mappedSteps[i]
  //für jede Höhe
  for (let y = 0; y <= height; y++) {
   let separator = "\n"
   let row = "\n"
   //für jede Breite
   for (let x = 0; x <= width; x++) {
    //ermittle in welche Richtungen Linien gezogen werden müssen
    let connections = 15
    connections ^= x < width && x && y ? (labyrinth[x - 1 + (y - 1) * width] >> 1) & 1 : !y
    connections ^= x < width ? (labyrinth[x + (y - 1) * width] >> 1) & 2 : 2
    connections ^= y < height ? (labyrinth[x + y * width] >> 1) & 4 : 4
    connections ^= x ? (labyrinth[x - 1 + y * width] << 3) & 8 : 8
    //zeichne diese Linien ein
    separator += junctions[connections] + (x < width ? connections & 2 ? "───" : "   " : "")
    row += (connections & 4 ? "│" : " ") + (x < width ? labyrinth[x + y * width] & 16 ? " O " : ` ${path[x + y * width]} ` : "")
   }
   visualisation += separator + (y == height ? "" : row)
  }
 }
 return visualisation
}
//funktion um zu ermitteln, wo die Person nach einer Bewegung landet
function move(width, height, labyrinth, direction, position, forward = true) {
 let changes = [[0, -1], [1, 0], [0, 1], [-1, 0]]
 //falls in die Richtung gegangen werden darf und die Position nicht das Ziel ist
 if (labyrinth[position] & (1 << direction) && (position != height * width - 1 || !forward)) {
  //bewege die Person
  position += changes[direction][0] + changes[direction][1] * width
  //falls dort eine Grube ist, gehe zum Start
  if (labyrinth[position] & 16) {
   if (!forward) {
    position -= changes[direction][0] + changes[direction][1] * width
   } else {
    position = 0
   }
  }
 }
 return position
}
//funktion um alle in einer Anweisung erreichbaren Positionen zu ermitteln
function reachablePositions(width, height, labyrinths, positions) {
 let reachedPositions = []
 //für jede Richtung
 for (let direction = 0; direction < 4; direction++) {
  let movedTo = []
  let changed = false
  //für jedes Labyrinth, bewege die Person
  for (let j = 0; j < labyrinths.length; j++) {
   let newPosistion = move(width, height, labyrinths[j], direction, positions[j])
   movedTo.push(newPosistion)
   if (newPosistion != positions[j]) {
    changed = true
   }
  }
  //überprüfe, ob die neue Positionenkombination verschieden zu eingegebenen ist
  if (changed) {
   reachedPositions.push(movedTo)
  }
 }
 return reachedPositions
}
//funktion um die Distanzen in einem Labyrinth zu erfassen
function singleBFS(width, height, labyrinth) {
 let distances = Array(labyrinth.length).fill(Number.POSITIVE_INFINITY)
 let distance = 0
 let oldPositions = [width * height - 1]
 distances[oldPositions] = distance
 //solange noch nicht alles erfasst wurde
 while (oldPositions.length > 0) {
  distance++
  let newPositions = []
  //erfasse alle Positionen dieser Distanz
  for (let i = 0; i < oldPositions.length; i++) {
   for (let direction = 0; direction < 4; direction++) {
    let position = move(width, height, labyrinth, direction, oldPositions[i], false)
    if (distances[position] > distance) {
     distances[position] = distance
     newPositions.push(position)
    }
   }
  }
  oldPositions = newPositions
 }
 return distances
}
//funktion um mehrere Labyrinthe auf einmal zu lösen
function multipleBFS(width, height, labyrinths, distances, bound) {
 //heuristik um zu bestimmen, wie gut eine Position ist
 let heuristic = (heurPos) => {
  let sum = 0
  for (let i = 0; i < labyrinths.length; i++) {
   sum += distances[i][heurPos[i]]
  }
  return sum
 }
 let ways = {}
 let archive = []
 let oldPositions = [Array(labyrinths.length).fill(0)]
 ways[oldPositions[0] + ""] = oldPositions[0]
 let goal = Array(labyrinths.length).fill(width * height - 1) + ""
 //solange das Ziel nicht erreicht wurde
 while (!ways[goal]) {
  //eliminiere die schlechtesten Positionen
  oldPositions.sort((a, b) => heuristic(a) - heuristic(b))
  while (oldPositions.length > bound) {
   archive.push(oldPositions.pop())
  }
  //gehe alle Positionen durch, und ermittle neue erreichbare Positionen
  let newPositions = []
  for (let i = 0; i < oldPositions.length; i++) {
   let reachable = reachablePositions(width, height, labyrinths, oldPositions[i])
   for (let j = 0; j < reachable.length; j++) {
    let poition = reachable[j]
    if (!ways[poition + ""]) {
     ways[poition + ""] = oldPositions[i]
     newPositions.push(poition)
    }
   }
  }
  oldPositions = newPositions
  //falls nicht genügend Positionen zur Auswahl stehen, füge elimierte Positionen hinzu
  if (!oldPositions.length && archive.length) {
   oldPositions.push(archive.pop())
  }
 }
 let position = Array(labyrinths.length).fill(width * height - 1)
 let way = []
 let repeat = true
 //solange das Backtracking nicht am Start angekommen ist
 while (repeat) {
  //speichere wo du warst
  way.push(position)
  //gehe den Weg weiter zurück
  position = ways[position + ""]
  repeat = false
  //überprüfe, ob die Startposition erreicht wurde
  for (let i = 0; i < labyrinths.length; i++) {
   repeat |= position[i]
  }
 }
 way.push(position)
 return way.reverse()
}
//funktion um ein annäherndes optimales Ergebnis zu ermitteln
function main(width, height, labyrinths, bound) {
 let distances = []
 //berechne die Distanzen innerhalb der einzelnen Labyrinthe
 for (let i = 0; i < labyrinths.length; i++) {
  distances.push(singleBFS(width, height, labyrinths[i]))
  if (distances[i][0] == Number.POSITIVE_INFINITY) {
   return [`Nicht Lösbar, da Labyrinth ${i + 1} nicht Lösbar ist`]
  }
 }
 //berechne das Ergebnis
 return ["", multipleBFS(width, height, labyrinths, distances, bound)]
}