
window.triggerFileUpload = () => {
 let fileInput = document.getElementById('fileUpload')
 fileInput.value = null
 fileInput.click()
}
document.getElementById('fileUpload').addEventListener('change', function (event) {
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
   //erstelle die Lösung
   let [MessageLength, codeTable, outer] = main(diameters, message)
   //Stoppe die Zeitmessung
   let runtime = (Date.now() - startTime) / 1000
   //gebe das Ergebnis aus
   let result = `Runtime: ${runtime}s\nPearllengths in mm: ${diameters}\nMessagelength in mm: ${MessageLength}\nSolution Data: ${outer + codeTable}`
   document.getElementById("result").textContent = result
  }
  reader.readAsText(event.target.files[0])
 }
})
//funktion um die Durchmesserdaten zu konvertieren
function compactPearls(diameters) {
 //sortiere die Durchmesser
 diameters.sort((a, b) => a - b)
 let pearlAmount = []
 let pearlSize = []
 let lastSize = 0
 //gehe durch jeden Durchmesser durch und speichere dir
 //wie viele von der jeweiligen größe existieren
 for (let i = 0; i < diameters.length; i++) {
  if (lastSize == diameters[i]) {
   pearlAmount[pearlAmount.length - 1]++
  } else {
   lastSize = diameters[i]
   pearlSize.push(lastSize)
   pearlAmount.push(1)
  }
 }
 return [pearlAmount, pearlSize]
}
//funktion um k erstmals zu bestimmen
function heuristic([pearlAmount, pearlSize], message) {
 //erstell die Liste mit den Codewortlängen
 let len = pearlSize[pearlSize.length - 1] + 1
 let wordLens = Array(len).fill(0)
 wordLens[0] = 1
 //gehe durch alle Codewortlängen durch, bis es genügend verschiedene Codewörter einer Länge gibt
 let k = 0
 while (wordLens[k % len] < message.length) {
  for (let i = 0; i < pearlAmount.length; i++) {
   wordLens[(k + pearlSize[i]) % len] += wordLens[k % len] * pearlAmount[i]
  }
  wordLens[k % len] = 0
  k++
 }
 return k
}
//funktion um den Baum zu bearbeiten
function grow(outer, changeInd, [pearlAmount, pearlSize], inner, amount = 1) {
 inner[changeInd] += amount
 outer[changeInd] -= amount
 for (let i = 0; i < pearlSize.length; i++) {
  while (outer.length <= changeInd + pearlSize[i]) {
   outer.push(0)
   inner.push(0)
  }
  outer[changeInd + pearlSize[i]] += amount * pearlAmount[i]
 }
 while (outer[outer.length - 1] == 0) {
  outer.pop()
  inner.pop()
 }
}
//funktion um schnell einen Baum für gleiche Zeichenhäufigkeiten zu konstruieren
function fastEqualTree(pearls, treeSize, diameters) {
 let outer = [1]
 let inner = [0]
 //berechne die Anzahl an inneren Knoten
 let innerSum = Math.ceil((treeSize - 1) / (diameters.length - 1))
 let ind = 0
 //füge so viele Knoten in den Baum ein
 for (let i = 0; i < innerSum; i++) {
  while (outer[ind] == 0) {
   ind++
  }
  grow(outer, ind, pearls, inner)
 }
 return [outer, inner]
}
function optimiseEqualTree([outer, inner], [pearlAmount, pearlSize], treeSize) {
 //Zähle die Blätter des Baums
 let outerSum = 0
 for (let i = 0; i < outer.length; i++) {
  outerSum += outer[i]
 }
 //berechne wie viel besser ein Baum mit mehr inneren Knoten wäre
 let destructed = [...outer]
 while (outerSum > treeSize) {
  destructed[destructed.length - 1]--
  outerSum--
  while (destructed[destructed.length - 1] == 0) {
   destructed.pop()
  }
 }
 let minInd
 for (let i = 0; i < outer.length; i++) {
  if (outer[i] > 0) {
   minInd = i
   break
  }
 }
 let dif = minInd
 for (let i = 0; i < pearlSize.length; i++) {
  dif -= Math.max(0, destructed.length - 1 - minInd - pearlSize[i])
  if (destructed.length - 1 - minInd - pearlSize[i] > 0) {
   destructed[destructed.length - 1] -= pearlAmount[i]
  }
  while (destructed[destructed.length - 1] == 0) {
   destructed.pop()
  }
 }
 //falls es besser wäre, füge einen inneren Knoten ein
 if (dif < 0) {
  grow(outer, minInd, [pearlAmount, pearlSize], inner)
 }
 //gebe zurück, ob optimiert wurde
 return dif < 0
}
//funktion um die erwartbare Tiefe eines Baums zu berechnen
function getAverageDepth(pearls, treeSize, diameters) {
 //erstelle einen otimalen Baum für gleiche Wahhrscheinlichkeiten
 let tree = fastEqualTree(pearls, treeSize, diameters)
 while (optimiseEqualTree(tree, pearls, treeSize)) { }
 //berechne die durchschnittliche Tiefe
 let [compact, hidden] = tree
 let ind = 0
 let sum = 0
 for (let i = 0; i < treeSize; i++) {
  while (compact[ind] == 0) {
   ind++
  }
  sum += ind
  compact[ind]--
 }
 return (sum / treeSize)
}
//funktion um die länge des codierten Texts zu ermitteln
function encodedLength(outer, [charAmount, charSize, charDepth, charDetail]) {
 outer = [...outer]
 charAmount = [...charAmount]
 let score = 0
 let charInd = 0
 let treeInd = 0
 while (charAmount[charAmount.length - 1] > 0) {
  while (outer[treeInd] == 0) {
   treeInd++
  }
  while (charAmount[charInd] == 0) {
   charInd++
  }
  let change = Math.min(outer[treeInd], charAmount[charInd])
  score += treeInd * charSize[charInd] * change
  outer[treeInd] -= change
  charAmount[charInd] -= change
 }
 return score
}
//funktion um zu ermiteln wie häufig es welches zeichen es gibt
//und wie viele Zeichen mit der Häufigkeit existieren
function getChars(pearls, message, d) {
 //ermittle wie häufig jedes Zeichen vorkommt
 let chars = {}
 for (let i = 0; i < message.length; i++) {
  chars[message.codePointAt(i)] = chars[message.codePointAt(i)] + 1 || 1
 }
 chars = Object.entries(chars)
 for (let i = 0; i < chars.length; i++) {
  chars[i][0] = String.fromCodePoint(chars[i][0])
 }
 //ermittle welche Zeichen die gleiche Häufigkeit haben
 chars.sort((a, b) => b[1] - a[1])
 let charAmount = []
 let charFrequency = []
 let lastFrequency = 0
 for (let i = 0; i < chars.length; i++) {
  if (lastFrequency == chars[i][1]) {
   charAmount[charAmount.length - 1]++
  } else {
   lastFrequency = chars[i][1]
   charFrequency.push(lastFrequency)
   charAmount.push(1)
  }
 }
 //füge die zu erwartende Distanz zur Tiefe des Baums hinzu
 let charDepth = []
 for (let i = 0; i < charFrequency.length; i++) {
  charDepth.push(getAverageDepth(pearls, charFrequency[i], d))
 }
 return [charAmount, charFrequency, charDepth, chars]
}
//funktion um einen Baum für ungleiche Häufigkeiten zu konstruieren
function greedyTree(pearls, [charAmount, charFrequency, charDepth, charDetail], message, diameters) {
 let upperLimit = getAverageDepth(pearls, message.length, diameters)
 let outer = [1]
 let assigned = [0]
 let inner = [0]
 let ind = 0
 //weise jede Zeichenhäufigkeit einer Tiefe zu
 let unassigned = 0
 for (let i = 0; i < charDepth.length; i++) {
  unassigned += charAmount[i]
  //solange der Pointer zu klein ist, erhöhe ihn
  while (upperLimit - (ind + charDepth[i]) > 0.5) {
   while (outer[ind] > assigned[ind]) {
    grow(outer, ind, pearls, inner, outer[ind] - assigned[ind])
   }
   while (assigned.length < inner.length) {
    assigned.push(0)
   }
   ind++
  }
  //füge die bisher unzugewiesenen Zeichen
  while (ind < outer.length && unassigned > 0) {
   let change = Math.min(unassigned, outer[ind] - assigned[ind])
   assigned[ind] += change
   unassigned -= change
   if (outer[ind] - assigned[ind] == 0) {
    ind++
   }
  }
 }
 //nähere die Anzahl an Blättern der Anzahl an verschiedenen Zeichen an
 adaptOuterSum([outer, inner], pearls, diameters, charDetail)
 return outer
}
//funktion um die Anzahl an Blättern der Anzahl an Zeichen anzugleichen
function adaptOuterSum([outer, inner], pearls, diameters, charDetail) {
 let outerSum = 0
 for (let i = 0; i < outer.length; i++) {
  outerSum += outer[i]
 }
 //berechne wie stark die Abweichung ist
 let offSet = Math.floor((outerSum - charDetail.length) / (diameters.length - 1))
 let ind = () => inner.length - 1 - (offSet < 0 ? 0 : pearls[1][pearls[1].length - 1])
 //korrigiere die Abweichung
 while (offSet != 0) {
  let neg = offSet < 0 ? 1 : -1
  let change = Math.min(Math.abs(offSet), neg > 0 ? outer[ind()] : inner[ind()])
  grow(outer, ind(), pearls, inner, neg * change)
  offSet += neg * change
 }
}
//funktion um die Codetabelle mithilfe der Blattdaten zu erstellen
function decompress(charDetail, diameters, outer) {
 let sum = 0
 for (let i = 0; i < outer.length; i++) {
  sum += outer[i]
  outer[i] -= Math.max(0, sum - charDetail.length)
  sum -= Math.max(0, sum - charDetail.length)
 }
 while (outer[outer.length - 1] == 0) {
  outer.pop()
 }
 let table = ""
 //sortiere die Zeichen absteigend nach Größe
 charDetail.sort((a, b) => b[1] - a[1])
 let charInd = 0
 //initialisiere die Liste in der die inneren Knoten der jeweiligen Tiefen gespeichert werden
 let inner = []
 for (let i = 0; i < outer.length; i++) {
  inner.push([])
 }
 inner[0].push("")
 for (let i = 0; i < outer.length; i++) {
  //füge die Codewörter für alle Zeichen dieser Tiefe hinzu
  for (let j = 0; j < outer[i]; j++) {
   table += `\n${charDetail[charInd][0]}: [${inner[i].pop()}]`
   charInd++
  }
  //Verlängere die anderen Blätter der Tiefe um die verschiedenen Perlen
  while (inner[i].length > 0) {
   let old = inner[i].pop()
   for (let j = 0; j < diameters.length; j++) {
    if (i + diameters[j] < outer.length) {
     inner[i + diameters[j]].push(old.length == 0 ? j + "" : `${old},${j}`)
    }
   }
  }
 }
 //gebe die Codetabelle zurück
 return table
}
//funktion um die Codierung für einen Text zu berechnen
function main(diamters, message) {
 //komprimiere die Perlendaten
 let pearls = compactPearls(diamters)
 //ermittle die maximale Perlengröße und entferne zu große Perlen
 let pearlLimit = heuristic(pearls, message)
 while (diamters[diamters.length - 1] > pearlLimit) {
  diamters.pop()
 }
 while (pearls[1][pearls[1].length - 1] > pearlLimit) {
  pearls[1].pop()
  pearls[0].pop()
 }
 //berechne die zusammengefassten Daten der Zeichen und deren Tiefe
 let chars = getChars(pearls, message, diamters)
 //füge die Zeichen in einen Baum ein
 let outer = greedyTree(pearls, chars, message, diamters)
 //berechne die länge des codierten Texts und dessen Codetabelle
 return [encodedLength(outer, chars), decompress(chars[3], diamters, outer), outer]
}