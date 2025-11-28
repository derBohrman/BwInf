//Öffne den Datei-Upload Dialog
function triggerFileUpload() {
 let fileInput = document.getElementById("fileUpload")
 fileInput.value = null
 fileInput.click()
}
//Lese die Datei ein und zeige das Ergebnis an
document.getElementById("fileUpload").addEventListener("change", function (event) {
 if (event.target.files[0]) {
  let reader = new FileReader()
  reader.onload = function (e) {
   let [z, ...lines] = e.target.result.replace(/\r/g, "").split("\n")
   let g = +lines[+z]
   let gerichte = lines.slice(+z + 1, +z + 1 + g)
   for (let i = 0; i < g; i++) gerichte[i] = gerichte[i].split(" ").slice(0, 3)
   let startTime = Date.now()
   let best = main(gerConv(gerichte))
   let runtime = (Date.now() - startTime) / 1000
   let result = `Runtime: ${runtime}s\n${prepBest(best)}`
   document.getElementById("result").textContent = result
  }
  reader.readAsText(event.target.files[0])
 }
})
//Lese alle Gerichte ein und ermittle alle Zutaten
function gerConv(gerichte) {
 let g = gerichte.length
 let zutaten = new Set()
 for (let i = 0; i < g; i++) for (let j = 0; j < 3; j++) zutaten.add(gerichte[i][j])
 zutaten = [...zutaten]
 let z = zutaten.length
 let conv = new Map()
 for (let i = 0; i < z; i++) conv[zutaten[i]] = i
 let kochbar = new Set()
 let essen = []
 let perm = [[0, 1, 2], [2, 1, 0], [0, 2, 1], [1, 2, 0], [1, 0, 2], [2, 0, 1]]
 for (let i = 0; i < g; i++) {
  for (let j = 0; j < 3; j++) gerichte[i][j] = conv[gerichte[i][j]]
  gerichte[i] = eSort(gerichte[i])
  let ger = gerichte[i]
  kochbar.add(gId(ger, z))
  for (let j = 0; j < 6; j++) {
   let per = perm[j]
   essen.push([ger[per[0]], ger[per[1]], ger[per[2]]])
  }
 }
 return [g, zutaten, essen, [kochbar, z]]
}
//Erstelle die Ausgabe
function prepBest([[unique, seq], zutaten, kochbar, path]) {
 let z = i => zutaten[seq[i]]
 let maxLen = 0
 for (let i = 1; i <= 12; i++) maxLen = Math.max(maxLen, z(i).length)
 for (let i = 1; i <= 12; i++) while (maxLen > z(i).length) (zutaten[seq[i]] += " ")
 let out = "cultivation plan:\n    "
 for (let i = 1; i <= 3; i++) {
  for (let j = 1; j < i; j++) out += ` ${z(9 + i)}`
  for (let j = i; j <= 9; j += 3) out += ` ${z(j)} ${z(j)} ${z(j)}`
  for (let j = 1; j <= 4 - i; j++) out += ` ${z(9 + i)}`
  out += i < 3 ? "\n    " : ""
 }
 out += "\nbin: "
 let bin = getBin(seq, kochbar)
 for (let i = 1; i <= 12; i++) {
  out += bin[i - 1]
  if (i != 12) for (let j = 0; j < z(i).length; j++) out += " "
 }
 out += "\nbinSum: " + unique
 out += "\nPath:" + path
 return out
}
//Sortiere die Zutaten eines Gerichts
function eSort([a, b, c]) {
 if (a > b) [a, b] = [b, a]
 if (a > c) [a, c] = [c, a]
 if (b > c) [b, c] = [c, b]
 return [a, b, c]
}
//Berechne die ID eines Gerichts
let gId = ([a, b, c], z) => a + b * z + c * z ** 2
//Berechne die ID eines Essen
let eId = (e, z) => gId(eSort(e), z)
//Berechne, wie viele verschiedene Gerichte gekocht werden können
function seqUnique(seq, [kochbar, z], skip = 0) {
 let essen = [, seq[skip], seq[1 + skip]]
 let gerichte = []
 let len = seq.length - skip
 for (let i = 2; i < len || (len == 12 && i < len + 2); i++) {
  essen = [essen[1], essen[2], seq[i % 12 + skip]]
  gerichte.push(eId(essen, z))
 }
 gerichte = [...new Set(gerichte)]
 let sum = 0
 for (let i = 0; i < gerichte.length; i++) sum += kochbar.has(gerichte[i])
 return sum
}
//Ermittle alle Paare von Essen, mit denen man potenziell 01, 1, 11 oder 111 ergänzen könnte
function getPairs(es, kochbar) {
 let e = es.length
 let pairs = [[], [], [], []]
 let cond = [
  (i, j) => es[i][2] == es[j][0],
  (i, j) => es[i][1] == es[j][0] && es[i][2] == es[j][1],
  (i, j) => cond[0](i, j) && seqUnique([...es[i], es[j][1], es[j][2]], kochbar) == 3,
  (i, j) => seqUnique([...es[i], ...es[j]], kochbar) == 4
 ]
 for (let i = 0; i < e; i++) {
  for (let j = 0; j < 4; j++) pairs[j][i] = []
  for (let j = 0; j < i - i % 6; j++) for (let l = 0; l < 4; l++) if (cond[l](i, j)) {
   pairs[l][i].push(j)
   pairs[l][j ^ 1].push(i ^ 1)
  }
 }
 return pairs
}
//Füge neue Essen hinzu, sodass nur neue Einsen erzeugt werden
function add1s(seqs, seq, [essen, edges, kochbar], len, repeat, prevUnique = -2) {
 let unique = seqUnique(seq, kochbar, 1)
 if (unique - prevUnique < len) return
 if (unique >= seqs[0]) {
  if (unique > seqs[0]) {
   seqs.length = 1
   seqs[0] = unique
  }
  seqs.push(seq)
 }
 if (seq.length > 13 - len || (prevUnique > -2 && !repeat)) return
 let next = edges[len][seq[0]]
 for (let i = 0; i < next.length; i++) {
  add1s(seqs, [next[i], ...seq.slice(1), ...essen[next[i]].slice(3 - len, 3)], [essen, edges, kochbar], len, repeat, unique)
 }
}
//Füge neue Essen hinzu, sodass auch Nullen entstehen
function add0s(seqs, seq, [essen, edges, kochbar], len) {
 let prevUnique = seqUnique(seq, kochbar, 1)
 if (prevUnique == seqs[0]) seqs.push(seq)
 if (seq.length > 12 - len) return
 let next = edges[0][seq[0]]
 if (len == 2) {
  next = []
  for (let i = 0; i < essen.length; i++) next[i] = i
 }
 for (let i = 0; i < next.length; i++) {
  let newSeq = [next[i], ...seq.slice(1), ...essen[next[i]].slice(2 - len, 3)]
  let unique = seqUnique(newSeq, kochbar, 1)
  if (unique == prevUnique + 1 && seqUnique(newSeq.slice(0, -1), kochbar, 1) == prevUnique) {
   if (unique > seqs[0]) {
    seqs.length = 1
    seqs[0] = unique
   }
   seqs.push(newSeq)
  }
 }
}
//Füge das nächste Essen hinzu
function add(bin, len, seqs, data, repeat = 1) {
 let newSeqs = [seqs[0]]
 if (bin == 1) {
  for (let i = 1; i < seqs.length; i++) add1s(newSeqs, seqs[i], data, len, repeat)
 } else {
  for (let i = 1; i < seqs.length; i++) add0s(newSeqs, seqs[i], data, len)
 }
 return newSeqs
}
//Ermittle die lexikografisch größten Anbaupläne aus unfertigen Anbauplänen
function lexMax(seqs, data) {
 let oldUnique = 0
 while (seqs[0] > oldUnique) {
  oldUnique = seqs[0]
  for (let i = 3; i > 0; i--) seqs = add(1, i, seqs, data)
  let prevUnique = seqs[0]
  seqs = add(0, 1, seqs, data)
  if (prevUnique == seqs[0]) seqs = add(0, 2, seqs, data)
 }
 for (let i = 1; i < seqs.length; i++) seqs[i].push(...Array(13 - seqs[i].length).fill(0))
 return seqs
}
//Ermittle den Anfang der lexikografisch größtmöglichen Lösung, die kleiner als die Obergrenze ist
function patternMax(seqs, bin, data) {
 let ind = 1
 let repeats = 0
 while (seqs[1].length - 3 < bin.length && repeats < 3) {
  ind = seqs[1].length - 3
  if (bin[ind]) {
   seqs = add(1, 1 + (bin[ind + 1] || 0) + ((bin[ind + 2] || 0) && (bin[ind + 1] || 0)) - repeats, seqs, data, 0)
  } else {
   seqs = add(0, 1 + (!bin[ind + 1] && ind + 1 < bin.length), seqs, data, 0)
  }
  repeats = ind == seqs[1].length - 3 ? repeats + 1 : 0
 }
 return seqs
}
//Berechne den Binary-String eines Anbauplans
function getBin(seq, kochbar) {
 let bin = []
 let prevUnique = 0
 let es = [seq[1], seq[2], seq[3]]
 for (let i = 0; i < 12; i++) {
  prevUnique += bin[i] = +(seqUnique(es, kochbar) > prevUnique)
  es.push(seq[(i + 3) % 12 + 1])
 }
 return bin
}
//Prüfe, ob im Binary-String drei aufeinanderfolgende Nullen vorkommen
function is000(bin) {
 let streak = 0
 for (let i = 0; i < bin.length; i++) if ((streak = streak * !bin[i] + !bin[i]) == 3 && i < 10) return 1
}
//Zähle die Anzahl der Einsen im Binary-String
function binSum(bin) {
 let sum = 0
 for (let i = 0; i < bin.length; i++) sum += bin[i]
 return sum
}
//Teste, ob dieser Binary-String erfüllbar und besser wäre
function testBin(bin, sum) {
 if (is000(bin)) return
 let len = bin.length
 bin[11] = 0
 let streak1 = 0
 while (bin[streak1]) streak1++
 let streak0 = 1 + (!bin[streak1 + 1] && streak1 + 1 < len)
 for (let i = 0; i < 11 - len; i++) bin[len + i] = +(i % (streak1 + streak0) < streak1)
 if (binSum(bin) <= sum) return
 bin.length = len
 return bin
}
//Ermittle die nächstkleinere Möglichkeit für einen besseren Anbauplan
function nextBin(bin, bestSum) {
 for (let i = 11; i > 0; i--) if (bin[i]) {
  let res = testBin([...bin.slice(0, i), 0], bestSum)
  if (res) return res
 }
}
//Erstelle alle möglichen Anbaupläne für das erste Essen
function startSeqs(essen) {
 let seqs = [1]
 for (let i = 0; i < essen.length; i++) seqs[i + 1] = [i, ...essen[i]]
 return seqs
}
//Ermittle den optimalen Anbauplan
function main([g, zutaten, essen, kochbar]) {
 //Ermittle die lexikografisch größte Lösung
 let edges = getPairs(essen, kochbar)
 let edgeSum = 0
 for (let i = 0; i < edges[0].length; i++) edgeSum += edges[0][i].length
 let data = [essen, edges, kochbar]
 let addE = i => (essen[i * 6] || [0, 0, 0])
 let seqOpt = [Math.min(4, essen.length / 6), [0, ...addE(0), ...addE(1), ...addE(2), ...addE(3)]]
 let seqs = edgeSum ? lexMax(startSeqs(essen), data) : seqOpt
 let bin = getBin(seqs[1], kochbar)
 let path = `\n${bin} binSum: ${seqs[0]} Pattern: 1,1,1,1,1,1,1,1,1,1,1,1`
 let newBin
 let bestSeqs = seqs
 //Suche nach besseren Anbauplänen, bis keine Verbesserung mehr möglich ist
 while (seqs[0] < 10 && seqs[0] < g && (newBin = nextBin(bin, bestSeqs[0]))) {
  seqs = patternMax(startSeqs(essen), newBin, data)
  if (seqs[1].length - 3 < newBin.length) {
   let prevUnique = seqs[0]
   seqs = add(0, 1, seqs, data)
   if (prevUnique == seqs[0]) seqs = add(0, 2, seqs, data)
  }
  seqs = lexMax(seqs, data)
  bin = getBin(seqs[1], kochbar)
  if (seqs[0] > bestSeqs[0]) bestSeqs = seqs
  path += `\n${bin} binSum: ${seqs[0]} Pattern: ${newBin}`
 }
 return [bestSeqs, zutaten, kochbar, path]
}