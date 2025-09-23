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
   //Speichere die zweite Zeile als Durchmesser und die dritte als Eingabetext
   let [, diameters, message] = e.target.result.replace(/\r/g, "").split("\n")
   //konvertiere die Durchmesser von einem String zu einer Liste an Zahlen
   diameters = diameters.split(" ")
   for (let i = 0; i < diameters.length; i++) {
    diameters[i] = +diameters[i]
   }
   //Starte die Zeitmessung
   let startTime = Date.now()
   //erstelle den Huffman-Baum
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
//funktion um eine Liste mithilfe von Bucketsort aufsteigend zu sortieren
function bucketSort(list) {
 //finde das größte Element der Liste
 let highest = list[0][0]
 for (let i = 1; i < list.length; i++) {
  highest = Math.max(highest, list[i][0])
 }
 //erstelle die Buckets
 let buckets = []
 for (let i = 0; i <= highest; i++) {
  buckets.push([])
 }
 //Füge jedes Listenelement in den dazugehörigen Bucket ein
 for (let i = 0; i < list.length; i++) {
  buckets[list[i][0]].push(list[i])
 }
 //konvertiere die verschachtelte Liste in eine eindimensionale Liste
 let out = []
 for (let i = 0; i < buckets.length; i++) {
  out.push(...buckets[i])
 }
 return out
}
//funktion um die Summe der Längen aller Zeichen dieses Teilbaums zu ermitteln
function encodedLength(tree, diameters, depth = 0) {
 //falls es ein Blattknoten ist gebe die für dieses Zeichen benötigte länge zurück
 if (typeof tree[1] === "string") {
  return depth * tree[0]
 }
 //Andernfalls gibst du die Summe der benötigten längen deiner Nachkommen zurück
 let sum = 0
 for (let i = 1; i < tree.length; i++) {
  sum += encodedLength(tree[i], diameters, depth + diameters[tree.length - i - 1])
 }
 return sum
}
//funktion um die Codetabelle für alle Zeichen dieses Teilbaums zu erstellen
function createCodeTable(tree, code = "") {
 //falls es ein Blattknoten ist gebe den Code für dieses Zeichen zurück
 if (typeof tree[1] === "string") {
  return `\n${tree[1]}: [${code.slice(0, -1)}]`
 }
 //Andernfalls gebe die Codes für alle deine Nachkommen zurück
 let out = ""
 for (let i = 1; i < tree.length; i++) {
  out += createCodeTable(tree[i], code + (tree.length - i - 1) + ",")
 }
 return out
}
//funktion um den optimalen Huffman-Baum zu konstruieren
function main(diameters, message) {
 //Zähle wie häufig jedes Zeichen im Text vorkommt
 let chars = {}
 for (let i = 0; i < message.length; i++) {
  chars[message.codePointAt(i)] = chars[message.codePointAt(i)] + 1 || 1
 }
 chars = Object.entries(chars)
 for (let i = 0; i < chars.length; i++) {
  chars[i][0] = String.fromCodePoint(chars[i][0])
  chars[i].reverse()
 }
 //berechne die Anazhl an inneren knoten
 let innerNodeAmount = Math.ceil((chars.length - 1) / (diameters.length - 1))
 //berechne wie viele Zeichen für diese Menge an inneren Knoten fehlen
 let emptyLeafes = innerNodeAmount * (diameters.length - 1) + 1 - chars.length
 //sortiere die Zeichenhäufigkeiten
 let leafes = bucketSort(chars)
 let roots = []
 let leafInd = 0
 let rootInd = 0
 const inf = Number.POSITIVE_INFINITY
 //erstelle jeden inneren Knoten
 for (let i = 0; i < innerNodeAmount; i++) {
  //erstelle einen neuen Wurzelknoten
  let newNode = [0]
  //füge für jede gegebene Perle ein Kind in den neuen Wurzelknoten ein
  for (let j = emptyLeafes; j < diameters.length; j++) {
   //wähle den kleinsten noch nicht verwendeten Teilbaum aus
   if ((roots[rootInd]||[inf])[0] > (leafes[leafInd]||[inf])[0]) {
    //füge den kleineren Teilbaum als Kind ein und verschiebe den Blattpointer
    newNode.push(leafes[leafInd])
    newNode[0] += leafes[leafInd][0]
    leafInd++
   } else {
    //füge den kleineren Teilbaum als Kind ein und verschiebe den Wurzelpointer
    newNode.push(roots[rootInd])
    newNode[0] += roots[rootInd][0]
    rootInd++
   }
   emptyLeafes = 0
  }
  roots[i] = newNode
 }
 let resultTree = roots[innerNodeAmount - 1]
 //gebe die Länge des codierten Texts und die dazugehörige Codetabelle zurück
 return [encodedLength(resultTree, diameters), createCodeTable(resultTree)]
}