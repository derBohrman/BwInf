//Öffne den Datei-Upload-Dialog
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
   let [m, n, ...lines] = e.target.result.replace(/\r/g, "").split("\n")
   let [figuren, names] = [[], []]
   for (let i = 0; i < +n; i++) {
    [names[i], ...figuren[i]] = [...lines[i].split(" "), []]
    for (let j = 0; j < 16; j++) {
     figuren[i][2][figuren[i][1].charCodeAt(j) - 65] = j
    }
    figuren[i] = [+figuren[i][0], figuren[i][2]]
   }
   let startTime = Date.now()
   let durations = main(+m, figuren, names)
   let runtime = (Date.now() - startTime) / 1000
   let result = `Runtime: ${runtime}s${durations}`
   document.getElementById("result").textContent = result
  }
  reader.readAsText(event.target.files[0])
 }
})
//Male den DAG
async function draw(n, m, dag, solutions, figuren) {
 let edgeNum = []
 for (let i = 0; i < dag.length; i++) {
  let [edge, x, y] = dag[i]
  if (!edgeNum[x]) {
   edgeNum[x] = []
  }
  if (!edgeNum[x][y]) {
   edgeNum[x][y] = Array(n).fill(0)
  }
  for (let j = 0; j < edge.length; j++) {
   edgeNum[x][y][edge[j][2]]++
  }
 }
 let maxEdge = 0
 for (let i = 0; i < edgeNum.length; i++) {
  for (let j = 0; edgeNum[i] && j < edgeNum[i].length; j++) {
   for (let l = 0; edgeNum[i][j] && l < edgeNum[i][j].length; l++) {
    maxEdge = Math.max(maxEdge, edgeNum[i][j][l])
   }
  }
 }
 let dark = window.matchMedia("(prefers-color-scheme: dark)").matches
 let xsize = (window.innerWidth / m / 1.2)
 let ysize = (window.innerHeight / n / 1.2)
 let obj = document.getElementById("myCanvas")
 let textRef = document.getElementById("text")
 let svgRef = document.getElementById("svg")
 let pngRef = document.getElementById("png")
 let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
 svg.setAttribute("width", xsize * (m + 0.5))
 svg.setAttribute("height", ysize * (n - 0.5))
 svg.style.background = dark ? "black" : "white"
 maxEdge = Math.max(maxEdge, 3)
 for (let i = 0; i < edgeNum.length; i++) {
  for (let j = 0; edgeNum[i] && j < edgeNum[i].length; j++) {
   for (let l = 0; edgeNum[i][j] && l < edgeNum[i][j].length; l++) {
    if (edgeNum[i][j][l]) {
     let [x1, y1, x2, y2] = [i, j, i + figuren[l][0], l]
     let line = document.createElementNS("http://www.w3.org/2000/svg", "line")
     line.setAttribute("x1", xsize * (x1 + 0.25))
     line.setAttribute("y1", ysize * (y1 + 0.25))
     if (i == 0) {
      line.setAttribute("y1", ysize * ((n - 1) * 0.5 + 0.25))
     }
     line.setAttribute("x2", xsize * (x2 + 0.25))
     line.setAttribute("y2", ysize * (y2 + 0.25))
     line.setAttribute("stroke", dark ? "white" : "black")
     line.setAttribute("stroke-opacity", Math.max(edgeNum[i][j][l] / maxEdge, 0.1))
     svg.appendChild(line)
    }
   }
  }
 }
 let col = [
  [255, 0, 255],
  [255, 255, 0],
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 0],
 ]
 for (let i = 0; i < 5; i++) {
  let lastx = 0
  let lasty = (n - 1) * 0.5
  for (let j = 0; j < solutions[i].length; j++) {
   let line = document.createElementNS("http://www.w3.org/2000/svg", "line")
   line.setAttribute("x1", xsize * (lastx + 0.25))
   line.setAttribute("y1", ysize * (lasty + 0.25) + (i + 1) * ysize * n / 300)
    ;[lastx, lasty] = solutions[i][j]
   line.setAttribute("x2", xsize * (lastx + 0.25))
   line.setAttribute("y2", ysize * (lasty + 0.25) + (i + 1) * ysize * n / 300)
   line.setAttribute("stroke", `rgb(${col[i][0]} ${col[i][1]} ${col[i][2]})`)
   svg.appendChild(line)
  }
 }
 let svgData = new XMLSerializer().serializeToString(svg)
 obj.data = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData)
 svgRef.href = URL.createObjectURL(new Blob([svgData], { type: "image/svg+xml" }))
 let img = new Image()
 img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData)
 img.onload = () => {
  let c = document.createElement("canvas")
  c.width = svg.getAttribute("width")
  c.height = svg.getAttribute("height")
  c.getContext("2d").drawImage(img, 0, 0)
  pngRef.href = c.toDataURL("image/png")
 }
 if (dag.length == n) {
  obj.data = ""
  textRef.textContent = ""
  svgRef.textContent = ""
  pngRef.textContent = ""
 } else {
  textRef.textContent = "Download Image as:"
  svgRef.textContent = "SVG"
  pngRef.textContent = "PNG"
 }
}
//Erstelle die Textausgabe
function makeReadable(solutions, figuren, names, optimal, allCombsNum) {
 let headers = [
  `most distinct Figures (pink${optimal ? "" : ", maybe not Optimal"}):`,
  "most Figures (yellow):",
  "least Figures (blue):",
  "longest Distance (green):",
  "shortest Distance (red):",
 ]
 let units = [
  " distinct Figures",
  " Figures",
  " Figures",
  "m",
  "m",
 ]
 let out = `\n\nDistinct solutions: ${allCombsNum}`
 for (let i = 0; i < solutions.length; i++) {
  out += `\n\n${headers[i]}\n${solutions[i][1] + units[i]}\n`
  let solu = solutions[i][0]
  for (let j = 0; j < solu.length; j++) {
   out += (j ? "→" : "") + names[solu[j][1]]
  }
  let pos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  out += "\n" + posToAlph(pos)
  for (let j = 0; j < solu.length; j++) {
   pos = playFigur(pos, figuren[solu[j][1]][1])
   out += "\n" + posToAlph(pos)
  }
 }
 return out
}
//Prüfe, ob die Liste einen Eintrag hat
function con(connections) {
 for (let i = 0; i < connections.length; i++) {
  if (connections[i]) {
   return 1
  }
 }
 return 0
}
//Erstelle Anfangsgraphen mit Knoten, die zeitlich passen
function allOpt(m, figuren) {
 let n = figuren.length
 let nodes = []
 for (let i = 0; i <= m; i++) {
  nodes[i] = []
  for (let j = 0; j < n; j++) {
   nodes[i][j] = [[], []]
  }
 }
 nodes[0] = [[[], []]]
 let time = 0
 let childTime = l => figuren[l][0] + time
 let getNode = l => nodes[childTime(l)][l]
 let addChilds = (i, j) => {
  for (let l = 0; l < n; l++) {
   if (childTime(l) <= m) {
    nodes[i][j][1][l] = getNode(l)
    getNode(l)[0][j] = nodes[i][j]
   }
  }
 }
 addChilds(0, 0)
 for (let i = 1; i < m; i++) {
  time++
  for (let j = 0; j < n; j++) {
   if (con(nodes[i][j][0])) {
    addChilds(i, j)
   }
  }
 }
 return nodes
}
//Lösche gerichtete Kanten zu einer Position
function clearDir(node, dir, pos) {
 for (let i = 0; i < node[dir].length; i++) {
  if (node[dir][i]) {
   node[dir][i][0][1 - dir][pos] = 0
  }
 }
 node[dir].length = 0
}
//Vereine zwei Positionslisten (parent[ind] ∪ list2)
function unionList(parent, list2, ind) {
 let list1 = parent[ind]
 if (list2 == undefined || list1 == list2) {
  return
 }
 if (list1 == undefined) {
  if (typeof list2 == "number") {
   parent[ind] = list2
  } else {
   parent[ind] = [...list2]
  }
  return
 }
 if (typeof list1 == "number") {
  parent[ind] = []
  parent[ind][list1] = 1
  list1 = parent[ind]
 }
 if (typeof list2 == "number") {
  list1[list2] = 1
  return
 }
 for (let i = 0; i < list2.length; i++) {
  list1[i] |= list2[i]
 }
}
//Berechne, wie sich Positionen nach dem Tanz der Figur verändern
function playList(parent, conv, ind) {
 let list = parent[ind]
 if (list == undefined) {
  return
 }
 if (typeof list == "number") {
  parent[ind] = conv[list]
  return
 }
 parent[ind] = []
 for (let i = 0; i < list.length; i++) {
  parent[ind][conv[i]] = list[i]
 }
}
//Schnittmenge zweier Positionslisten (Positionen, die beide erreichen)
function interList(list1, list2) {
 if (list1 == undefined || list2 == undefined) {
  return undefined
 }
 if (typeof list1 == "number" && typeof list2 == "number") {
  return list1 == list2 ? list1 : undefined
 }
 if (typeof list1 == "number") {
  return list2[list1] ? list1 : undefined
 }
 if (typeof list2 == "number") {
  return list1[list2] ? list2 : undefined
 }
 let sum = 0
 let out = []
 for (let i = 0; i < list1.length; i++) {
  if (list1[i] && list2[i]) {
   sum++
   out[i] = 1
  }
 }
 if (!sum) {
  return undefined
 } else if (sum == 1) {
  return out.length - 1
 }
 return out
}
//Bestimme für eine Person, welche Positionen erreichbar sind
function filter(figuren, nodes, person) {
 let m = nodes.length - 1
 let n = figuren.length
 nodes[0][0][2] = person
 for (let i = 1; i <= m; i++) {
  for (let j = 0; j < n; j++) {
   let node = nodes[i][j]
   for (let l = 0; l < node[0].length; l++) {
    if (node[0][l]) {
     unionList(node, node[0][l][0][2], 2)
    }
   }
   playList(node, figuren[j][1], 2)
  }
 }
 for (let i = 0; i < n; i++) {
  nodes[m][i][3] = interList(person, nodes[m][i][2])
 }
 for (let i = m; i > 0; i--) {
  for (let j = 0; j < n; j++) {
   let node = nodes[i][j]
   playList(node, figuren[j][2], 3)
   for (let l = 0; l < node[0].length; l++) {
    if (node[0][l]) {
     unionList(node[0][l][0], interList(node[0][l][0][2], node[3]), 3)
    }
   }
  }
 }
 for (let i = 0; i <= m; i++) {
  for (let j = 0; j < nodes[i].length; j++) {
   let node = nodes[i][j]
   if (node[3] == undefined) {
    clearDir(node, 0, j)
    clearDir(node, 1, j)
   } else {
    for (let l = 0; l < node[1].length; l++) {
     if (node[1][l]) {
      let inter = interList(node[2], node[1][l][0][3])
      if (inter == undefined) {
       node[1][l][0][0][j] = 0
       node[1][l] = 0
      } else {
       node[1][l][1][person] = inter
      }
     }
    }
   }
   node.length = 2
  }
 }
}
//Berechne die Umkehrabbildung einer Permutation
function convBack(conv) {
 let out = []
 for (let i = 0; i < 16; i++) {
  out[conv[i]] = i
 }
 return out
}
//Erweitere Kantenstruktur um Speicher für Referenzen
function extendEdges(nodes) {
 for (let i = 0; i < nodes.length; i++) {
  for (let j = 0; j < nodes[i].length; j++) {
   let node = nodes[i][j]
   for (let l = 0; l < node[1].length; l++) {
    if (node[1][l]) {
     let keys = []
     node[1][l][0][j] = [node[1][l][0][j], keys]
     node[1][l] = [node[1][l], keys]
    }
   }
  }
 }
}
//Simuliere den Tanz einer Figur auf einer Positionsliste
function playFigur(pos, conv) {
 let out = []
 for (let i = 0; i < 16; i++) {
  out[i] = conv[pos[i]]
 }
 return out
}
//Bestimme Teilbaum, der in der nächsten Figur noch vorkommen könnte
function passesTree(tree, edge, ind = 0) {
 if (tree[0] == -1) {
  for (let i = 1; i < tree.length; i++) {
   let isNum = typeof edge[16 - i] == "number"
   if ((isNum && edge[16 - i] != tree[i]) || (!isNum && !edge[16 - i][tree[i]])) {
    return []
   }
  }
  return [...tree]
 }
 if (typeof edge[ind] == "number") {
  if (tree[edge[ind] + 1]) {
   let child = passesTree(tree[edge[ind] + 1], edge, ind + 1)
   if (child[0] == -1) {
    child.push(edge[ind])
    return child
   }
   let out = [tree[0]]
   out[edge[ind] + 1] = child
   return out
  }
  return []
 }
 let treeCopy = []
 treeCopy[0] = 0
 for (let i = 1; i < tree.length; i++) {
  if (tree[i] && edge[ind][i - 1]) {
   let child = passesTree(tree[i], edge, ind + 1)
   if (child[0]) {
    treeCopy[i] = child
    treeCopy[0]++
   }
  }
 }
 if (treeCopy[0] == 1 && treeCopy[treeCopy.length - 1][0] == -1) {
  treeCopy[treeCopy.length - 1].push(treeCopy.length - 2)
  return treeCopy[treeCopy.length - 1]
 }
 return treeCopy
}
//Wende die Figurrotation auf einen Baum an
function playTree(tree, conv) {
 if (tree[0] == -1) {
  for (let i = 1; i < tree.length; i++) {
   tree[i] = conv[tree[i]]
  }
  return
 }
 let treeCopy = [...tree]
 tree.length = 1
 for (let i = 1; i < treeCopy.length; i++) {
  if (treeCopy[i]) {
   playTree(treeCopy[i], conv)
   tree[conv[i - 1] + 1] = treeCopy[i]
  }
 }
}
//Vereinigung zweier (Teil-)Bäume
function unionTree(tree1, tree2) {
 if (!tree2[0]) {
  return
 }
 if (!tree1[0]) {
  for (let i = 0; i < tree2.length; i++) {
   tree1[i] = tree2[i]
  }
  return
 }
 if (tree1[0] == -1 && tree2[0] == -1) {
  for (let i = tree1.length - 1; i > 0; i--) {
   if (tree1[i] != tree2[i]) {
    let tree1c = [...tree1]
    tree1.length = 1
    tree1[0] = 1
    let head = tree1
    for (let j = tree1c.length - 1; j > i; j--) {
     head[0] = 1
     let newHead = []
     head[tree1c[j] + 1] = newHead
     head = newHead
    }
    head[0] = 2
    let ind1 = tree1c[i] + 1
    let ind2 = tree2[i] + 1
    tree1c.length = i
    tree2.length = i
    head[ind1] = tree1c
    head[ind2] = tree2
    return
   }
  }
  return
 }
 if (tree1[0] == -1) {
  let tree = [...tree1]
  tree1.length = 1
  tree1[0] = 1
  tree1[tree.pop() + 1] = tree
 }
 if (tree2[0] == -1) {
  let tree = [...tree2]
  tree2.length = 1
  tree2[0] = 1
  tree2[tree.pop() + 1] = tree
 }
 for (let i = 1; i < tree2.length; i++) {
  if (tree2[i]) {
   if (tree1[i]) {
    unionTree(tree1[i], tree2[i])
   } else {
    tree1[i] = tree2[i]
   }
  }
 }
}
//Schnittmenge zweier (Teil-)Bäume
function interTree(tree1, tree2, ind = 0) {
 if (tree1[0] == -1 && tree2[0] == -1) {
  for (let i = 16 - ind; i > 0; i--) {
   if (tree1[i] != tree2[i]) {
    return []
   }
  }
  return tree1.slice(0, 17 - ind)
 }
 if (tree1[0] == -1) {
  if (tree2[tree1[16 - ind] + 1]) {
   let out = interTree(tree1, tree2[tree1[16 - ind] + 1], ind + 1)
   if (out[0] == -1) {
    out.push(tree1[16 - ind])
   }
   return out
  }
  return []
 }
 if (tree2[0] == -1) {
  if (tree1[tree2[16 - ind] + 1]) {
   let out = interTree(tree2, tree1[tree2[16 - ind] + 1], ind + 1)
   if (out[0] == -1) {
    out.push(tree2[16 - ind])
   }
   return out
  }
  return []
 }
 let tree = []
 tree[0] = 0
 for (let i = 1; i < Math.min(tree1.length, tree2.length); i++) {
  if (tree1[i] && tree2[i]) {
   let child = interTree(tree1[i], tree2[i], ind + 1)
   if (child[0]) {
    tree[i] = child
    tree[0]++
   }
  }
 }
 if (tree[0] == 1 && tree[tree.length - 1][0] == -1) {
  tree[tree.length - 1].push(tree.length - 2)
  return tree[tree.length - 1]
 }
 return tree
}
//Berechne alle möglichen Positionskombinationen für alle Knoten
function brute(figuren, nodes) {
 let m = nodes.length - 1
 for (let i = 0; i <= m; i++) {
  for (let j = 0; j < nodes[i].length; j++) {
   nodes[i][j][2] = []
   nodes[i][j][3] = []
  }
 }
 nodes[0][0][2] = [-1, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
 for (let i = 1; i <= m; i++) {
  for (let j = 0; j < nodes[i].length; j++) {
   let node = nodes[i][j]
   for (let l = 0; l < node[0].length; l++) {
    if (node[0][l]) {
     unionTree(node[2], passesTree(node[0][l][0][2], node[0][l][1]))
    }
   }
   playTree(node[2], figuren[j][1])
  }
 }
 for (let i = 0; i < nodes[m].length; i++) {
  nodes[m][i][3] = [-1, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
 }
 for (let i = m; i >= 0; i--) {
  for (let j = 0; j < nodes[i].length; j++) {
   let node = nodes[i][j]
   playTree(node[3], figuren[j][2])
   for (let l = 0; l < node[0].length; l++) {
    if (node[0][l]) {
     unionTree(node[0][l][0][3], interTree(node[0][l][0][2], node[3]))
    }
   }
  }
 }
}
//Konvertiere Positions-String zu Positionsliste und wende Permutation an
function convertStr(pos, conv) {
 pos = pos.split(",")
 for (let i = 0; i < 16; i++) {
  pos[i] = +pos[i]
 }
 return playFigur(pos, conv) + ""
}
//Lese alle möglichen Pfade aus einem Baum aus
function treeToList(tree, path = []) {
 if (tree[0] == -1) {
  for (let i = tree.length - 1; i > 0; i--) {
   path.push(tree[i])
  }
  return [path]
 }
 let dump = []
 for (let i = 1; i < tree.length; i++) {
  if (tree[i]) {
   if (tree[i] === true) {
    dump.push([...path, i - 1])
   } else {
    dump.push(...treeToList(tree[i], [...path, i - 1]))
   }
  }
 }
 return dump
}
//Konvertiere den Graphen in einen DAG
function convertGraph(figuren, nodes) {
 let m = nodes.length - 1
 let n = figuren.length
 for (let i = 0; i < nodes.length; i++) {
  for (let j = 0; j < nodes[i].length; j++) {
   let node = nodes[i][j]
   node[2] = new Map()
   node[3] = treeToList(node[3])
   for (let l = 0; l < node[3].length; l++) {
    node[3][l] += ""
    node[2][node[3][l]] = []
   }
   node[3] = new Set(node[3])
  }
 }
 let dag = []
 for (let i = 0; i <= m; i++) {
  for (let j = 0; j < nodes[i].length; j++) {
   let node = nodes[i][j]
   node[3] = [...node[3]]
   for (let l = 0; l < node[3].length; l++) {
    let id = node[3][l]
    let newNode = node[2][id]
    let edges = []
    newNode.push(edges, i, j)
    id = convertStr(id, figuren[j][1])
    for (let y = 0; y < node[1].length; y++) {
     if (node[1][y] && node[1][y][0][3].has(id)) {
      edges.push(node[1][y][0][2][id])
     }
    }
    if (i == m || edges.length) {
     dag.push(newNode)
    }
   }
  }
 }
 return dag
}
//Ergänze Figuren um Gewichte/Metriken für Optimierungsziele
function addWeights(figuren) {
 for (let i = 0; i < figuren.length; i++) {
  let dis = 0
  for (let j = 0; j < 16; j++) {
   dis += Math.abs(figuren[i][2][j] - j)
  }
  figuren[i].push([- 1, 1, - dis, dis])
 }
}
//Berechne den minimalen Pfad für ein gegebenes Optimierungsziel
function minPath(dag, figuren, goal) {
 for (let i = 0; i < dag.length; i++) {
  dag[i].push(1 / 0, [])
 }
 dag[0][3] = 0
 dag[0][4] = []
 for (let i = 0; i < dag.length; i++) {
  for (let j = 0; j < dag[i][0].length; j++) {
   let node = dag[i][0][j]
   let newSum = dag[i][3] + figuren[node[2]][3][goal]
   if (newSum < node[3]) {
    node[3] = newSum
    node[4] = [...dag[i][4], [node[1], node[2]]]
   }
  }
 }
 let best = 1 / 0
 let bestPath = []
 for (let i = dag.length - figuren.length; i < dag.length; i++) {
  if (dag[i][3] < best) {
   best = dag[i][3]
   bestPath = dag[i][4]
  }
 }
 for (let i = 0; i < dag.length; i++) {
  dag[i].splice(-2, 2)
 }
 return [bestPath, best]
}
//Heuristische Berechnung: maximieren unterschiedlicher Figuren (Annäherung)
function heurMaxDistinct(n, dag) {
 for (let i = 0; i < dag.length; i++) {
  dag[i].push(0, new Set([]), [])
 }
 dag[0][5] = []
 for (let i = 0; i < dag.length; i++) {
  for (let j = 0; j < dag[i][0].length; j++) {
   let node = dag[i][0][j]
   let newSum = dag[i][3] + 1 - dag[i][4].has(node[2])
   if (newSum > node[3]) {
    node[3] = newSum
    node[4] = new Set(dag[i][4])
    node[4].add(node[2])
    node[5] = [...dag[i][5], [node[1], node[2]]]
   }
  }
 }
 let best = 0
 let bestPath = []
 for (let i = dag.length - n; i < dag.length; i++) {
  if (dag[i][3] > best) {
   best = dag[i][3]
   bestPath = dag[i][5]
  }
 }
 for (let i = 0; i < dag.length; i++) {
  dag[i].length = 3
 }
 return [bestPath, best]
}
//Zähle die Anzahl verschiedener Pfade im DAG
function getCombsAmount(dag) {
 for (let i = 0; i < dag.length; i++) {
  dag[i][3] = 0
 }
 dag[0][3] = 1
 let sum = 0
 for (let i = 0; i < dag.length; i++) {
  for (let j = 0; j < dag[i][0].length; j++) {
   dag[i][0][j][3] += dag[i][3]
  }
  if (!dag[i][0].length) {
   sum += dag[i][3]
  }
  dag[i].pop()
 }
 return sum
}
//Berechne die optimale Lösung für das erste Optimierungsziel (exakt)
function maxDistinct(dag, figuren) {
 for (let i = 0; i < dag.length; i++) {
  dag[i][3] = []
 }
 dag[0][3] = [[]]
 let allCombs = []
 for (let i = 0; i < dag.length; i++) {
  for (let j = 0; j < dag[i][0].length; j++) {
   for (let l = 0; l < dag[i][3].length; l++) {
    dag[i][0][j][3].push([...dag[i][3][l], dag[i][0][j][2]])
   }
  }
  if (!dag[i][0].length) {
   allCombs.push(...dag[i][3])
  }
  dag[i].pop()
 }
 let bestNum = 0
 let bestPath = []
 for (let i = 0; i < allCombs.length; i++) {
  let compressed = new Set(allCombs[i])
  if (compressed.size > bestNum) {
   bestNum = compressed.size
   bestPath = allCombs[i]
  }
 }
 let sum = 0
 for (let i = 0; i < bestPath.length; i++) {
  sum += figuren[bestPath[i]][0]
  bestPath[i] = [sum, bestPath[i]]
 }
 return [bestPath, bestNum]
}
//Konvertiere Positionsarray in Buchstabenfolge (A–P)
function posToAlph(pos) {
 let out = ""
 for (let i = 0; i < 16; i++) {
  out += String.fromCharCode(pos[i] + 65)
 }
 return out
}
//Berechne alle Optimierungsziele und formatiere die lesbare Ausgabe
function main(m, figuren, names) {
 let n = figuren.length
 let durations = []
 for (let i = 0; i < n; i++) {
  durations[i] = figuren[i][0]
 }
 for (let i = 0; i < n; i++) {
  figuren[i].push(convBack(figuren[i][1]))
 }
 let nodes = allOpt(m, figuren)
 extendEdges(nodes)
 for (let i = 0; i < 16; i++) {
  filter(figuren, nodes, i)
 }
 brute(figuren, nodes)
 let dag = convertGraph(figuren, nodes)
 addWeights(figuren)
 let allCombsNum = getCombsAmount(dag)
 let isOptimal = allCombsNum < 10 ** 5
 let solutions = isOptimal ? [maxDistinct(dag, figuren)] : [heurMaxDistinct(n, dag)]
 for (let i = 0; i < 4; i++) {
  solutions.push(minPath(dag, figuren, i))
 }
 let solPaths = []
 for (let i = 0; i < 5; i++) {
  solPaths.push(solutions[i][0])
  if (i & 1) {
   solutions[i][1] *= -1
  }
 }
 draw(n, m, dag, solPaths, figuren)
 return dag.length == n ? "\nKeine Lösung!" : makeReadable(solutions, figuren, names, isOptimal, allCombsNum)
}