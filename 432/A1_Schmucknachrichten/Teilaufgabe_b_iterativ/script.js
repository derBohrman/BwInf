function triggerFileUpload() {
 const fileInput = document.getElementById("fileUpload")
 fileInput.value = null
 fileInput.click()
}
//funktion um eine Datei Hochzuladen
document.getElementById("fileUpload").addEventListener("change", function (event) {
 if (event.target.files[0]) {
  let reader = new FileReader()
  reader.onload = function (e) {
   //Speichere die zweite Zeile als Durchmesser und die dritte als Eingabetext
   let [, diameters, message] = e.target.result.replace(/\r/g, "").split("\n")
   //konvertiere die Durchmesser von einem String zu einer Liste an Zahlen
   diameters = diameters.split(" ")
   for (let i = 0; i < diameters.length; i++) {
    diameters[i] = +diameters[i]
   }
   //Starte die Zeitmessung
   let startTime = Date.now()
   //erstelle den Baum
   let [MessageLength, codeTable] = main(diameters, message)
   //Stoppe die Zeitmessung
   let runtime = (Date.now() - startTime) / 1000
   //gebe das Ergebnis aus
   let result = `Runtime: ${runtime}s\nPearllengths in mm: ${diameters}\nMessagelength in mm: ${MessageLength + codeTable}`
   document.getElementById("result").textContent = result
  }
  reader.readAsText(event.target.files[0])
 }
})
//funktion um zu vergleichen welcher Knoten als kleiner gewertet wird
function smaller(a, b) {
 if (a[1] != b[1]) {
  return a[1] < b[1]
 } else {
  return b[0][1] < a[0][1]
 }
}
//funktion um einen Knoten dem Heap zuzufügen
function heapInsert(node, heap) {
 heap.push(node)
 let current = heap.length - 1
 while (current > 0) {
  let parent = (current - 1) >> 1
  if (smaller(heap[parent], heap[current])) {
   break
  }
  [heap[current], heap[parent]] = [heap[parent], heap[current]]
  current = parent
 }
}
//funktion um den kleinsten Knoten des Heaps auszulesen
function heapPopMin(heap) {
 //falls der heap fast leer ist, gebe direkt etwas zurück
 if (!heap.length) {
  return
 }
 if (heap.length === 1) {
  return heap.pop()
 }
 ///erstze den kleinsten Knoten durch den letzten
 let node = heap[0]
 heap[0] = heap.pop()
 let current = 0
 //solange ein Kind kleiner ist, muss mit diesem getauscht werden
 while (true) {
  let left = 2 * current + 1
  let right = 2 * current + 2
  let smallest = current
  if (left < heap.length && smaller(heap[left], heap[smallest])) {
   smallest = left
  }
  if (right < heap.length && smaller(heap[right], heap[smallest])) {
   smallest = right
  }
  if (smallest === current) {
   break
  }
  [heap[current], heap[smallest]] = [heap[smallest], heap[current]]
  current = smallest
 }
 return node
}
//funktion um den ersten Baum zu berechnen
function startTree(diameters, chars) {
 //erstelle den Wurzelknoten
 let depth = 0
 let root = [depth, 0]
 let nodes = [root]
 let growingNode = root
 //füge immer bei dem tiefsten Knoten weitere Kinder ein
 while (chars.length > 0) {
  for (let i = 0; i < diameters.length - 1 && chars.length > 0; i++) {
   growingNode.push([depth + diameters[i], ...chars.pop()])
   nodes.push(growingNode[i + 2])
  }
  depth += diameters[growingNode.length - 2]
  if (chars.length == 1) {
   growingNode.push([depth, ...chars.pop()])
   nodes.push(growingNode[growingNode.length - 1])
  } else if (chars.length > 0) {
   growingNode.push([depth, 0])
   nodes.push(growingNode[growingNode.length - 1])
   growingNode = growingNode[growingNode.length - 1]
  }
 }
 return [root, nodes]
}
//aktualisiere die Werte für den Baum
function updateTree(diameters, root, nodes) {
 //setze alle Gewichte erstmal auf unberechnet
 let score = 0
 for (let i = 1; i < nodes.length; i++) {
  if (typeof nodes[i][2] !== "string") {
   nodes[i][1] = 0
  }
 }
 let stack = [root]
 //solange noch nicht alle Knoten aktualisiert sind
 while (stack.length > 0) {
  //schaue, ob schon alle Kinder aktualisiert sind
  let node = stack.pop()
  let childsUpdated = 1
  for (let i = 2; i < node.length; i++) {
   childsUpdated *= node[i][1]
   node[i][0] = node[0] + diameters[i - 2]
  }
  //falls die Kinder aktualisiert sind, wird das eigene Gewicht aktualisiert
  if (childsUpdated) {
   let sum = 0
   for (let i = 2; i < node.length; i++) {
    sum += node[i][1]
    if (typeof node[i][2] === "string") {
     score += node[i][0] * node[i][1]
    }
   }
   node[1] = sum
   //falls die Kinder noch nicht aktualisiert sind, müssen diese noch aktualisiert werden
  } else {
   stack.push(node)
   for (let i = 2; i < node.length; i++) {
    if (!node[i][1]) {
     stack.push(node[i])
    }
   }
  }
 }
 //gebe die codierte Textlänge aus
 return score
}
//funktion um den Baum umzustrukuturieren
function rearrange(root, nodes, diameters) {
 //zerlege den Baum
 for (let i = 0; i < nodes.length; i++) {
  if (typeof nodes[i][2] !== "string") {
   nodes[i].splice(2)
  }
 }
 //sortiere die Knoten nach Gewicht
 nodes.sort((a, b) => b[1] - a[1])
 let heap = []
 //füge alle möglichen Kinderplätze in den heap ein
 for (let i = 0; i < diameters.length; i++) {
  heapInsert([root, diameters[i]], heap)
 }
 //füge jeden Knoten in den Baum ein
 for (let i = 0; i < nodes.length; i++) {
  if (nodes[i] != root) {
   let [parent, depth] = heapPopMin(heap)
   nodes[i][0] = depth
   parent.push(nodes[i])
   //falls der Knoten ein innerer Knoten ist, dass entstehen neue Kinderplätze
   if (typeof nodes[i][2] !== "string") {
    for (let j = 0; j < diameters.length; j++) {
     heapInsert([nodes[i], depth + diameters[j]], heap)
    }
   }
  }
 }
 //aktualisiere die Gewichte
 return updateTree(diameters, root, nodes)
}
//erstelle die Codetabelle
function createCodeTable(root) {
 let table = ""
 let stack = [[root, []]]
 //solange noch nicht alle Zeichen einen Code bekommen haben
 while (stack.length > 0) {
  let [node, code] = stack.pop()
  //falls es ein Blattknoten ist, füge das Codewort in die Tabelle ein
  if (typeof node[2] === "string") {
   table += `\n${node[2]}: [${code}]`
  }
  //falls es ein innerer Knoten ist, müssen Codewörter für alle Kinder erstellt werden
  for (let i = 2; i < node.length; i++) {
   stack.push([node[i], [...code, i - 2]])
  }
 }
 return table
}
//funktion um eine Codierung mithilfe von der Restrukturierung von Bäumen zu ermitteln
function main(diameters, message) {
 //sortiere die Durchmesser
 diameters.sort((a, b) => a - b)
 //Zähle die Zeichenhäufigkeiten
 let chars = {}
 for (let i = 0; i < message.length; i++) {
  chars[message.codePointAt(i)] = chars[message.codePointAt(i)] + 1 || 1
 }
 chars = Object.entries(chars)
 for (let i = 0; i < chars.length; i++) {
  chars[i][0] = String.fromCodePoint(chars[i][0])
  chars[i].reverse()
 }
 chars.sort((a, b) => b[0] - a[0])
 //erstelle einen ersten Baum
 let [root, nodes] = startTree(diameters, [...chars])
 let last = Number.POSITIVE_INFINITY
 //verbessere den Baum solange, bis er nicht besser wird
 let recent = updateTree(diameters, root, nodes)
 while (recent < last) {
  last = recent
  recent = rearrange(root, nodes, diameters)
 }
 //gebe die Codetbelle und die Textlänge des codierten Texts zurück
 return [last, createCodeTable(root)]
}