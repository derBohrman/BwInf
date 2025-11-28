//Öffne den Datei-Upload Dialog
function triggerFileUpload() {
 let fileInput = document.getElementById("fileUpload")
 fileInput.value = null
 fileInput.click()
}
//Lese die Datei ein und zeige die Laufzeit an
document.getElementById("fileUpload").addEventListener("change", function (event) {
 if (event.target.files[0]) {
  let reader = new FileReader()
  reader.onload = function (e) {
   let tree = e.target.result.replace(/\r/g, "").split("\n")[0].split("")
   for (let i = 0; i < tree.length; i++) {
    tree[i] = +(tree[i] == "(")
   }
   let startTime = Date.now()
   main(parseTree(tree))
   let runtime = (Date.now() - startTime) / 1000
   document.getElementById("result").textContent = `Runtime: ${runtime}s`
  }
  reader.readAsText(event.target.files[0])
 }
})
let gcd = (a, b) => b ? gcd(b, a % b) : a
let lcm = (a, b) => a * b / gcd(a, b)
//Konvertiere den Klammern-String in Eltern- und Kind-Referenzen
function parseTree(tree) {
 let n = tree.length / 2
 let stack = [0]
 let parents = []
 let kids = [[]]
 let node = 0
 for (let i = 0; i < n * 2; i++) {
  if (tree[i]) {
   node++
   kids[node] = []
   kids[stack[stack.length - 1]].push(node)
   parents[node] = stack[stack.length - 1]
   stack.push(node)
  } else {
   stack.pop()
  }
 }
 return [n, parents, kids]
}
//Berechne die X-Positionen der Knoten
function getXPos(kids, parents, width) {
 let xSizes = [[0, width]]
 let xPos = [width / 2]
 let stack = []
 for (let i = 0; i < kids[0].length; i++) {
  stack.push([kids[0][i], i])
 }
 while (stack.length) {
  let [node, kidNum] = stack.pop()
  for (let i = 0; i < kids[node].length; i++) {
   stack.push([kids[node][i], i])
  }
  let par = parents[node]
  let xPar = xSizes[par]
  let boxWidth = (xPar[1] - xPar[0]) / kids[par].length
  xSizes[node] = [xPar[0] + kidNum * boxWidth, xPar[0] + (kidNum + 1) * boxWidth]
  xPos[node] = (xSizes[node][0] + xSizes[node][1]) / 2
 }
 return [xSizes, xPos]
}
//Male den Baum
function drawTree([n, svg, xsize, ysize, depths], xPos, kids, xfunc, yfunc) {
 let centerLines = []
 let borderLines = []
 let circles = []
 for (let i = 1; i <= n; i++) {
  for (let j = 0; j < kids[i].length; j++) {
   let line1 = document.createElementNS("http://www.w3.org/2000/svg", "line")
   line1.setAttribute("x1", xfunc(xsize * (xPos[i] + 0.25) + 10))
   line1.setAttribute("y1", yfunc(ysize * (depths[i] - 0.5) + 10))
   line1.setAttribute("x2", xfunc(xsize * (xPos[kids[i][j]] + 0.25) + 10))
   line1.setAttribute("y2", yfunc(ysize * (depths[kids[i][j]] - 0.5) + 10))
   let line2 = line1.cloneNode(true)
   line1.setAttribute("stroke", "black")
   line2.setAttribute("stroke", "rgb(0 159 227)")
   line2.setAttribute("stroke-width", 5)
   centerLines.push(line1)
   borderLines.push(line2)
  }
  let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  circle.setAttribute("cx", xfunc(xsize * (xPos[i] + 0.25) + 10))
  circle.setAttribute("cy", yfunc(ysize * (depths[i] - 0.5) + 10))
  circle.setAttribute("r", 10)
  circle.setAttribute("fill", "rgb(229 0 125)")
  circle.setAttribute("stroke", "black")
  circle.setAttribute("stroke-width", 2)
  circles.push(circle)
 }
 for (let i = 0; i < n - 1; i++) {
  svg.appendChild(borderLines[i])
 }
 for (let i = 0; i < n - 1; i++) {
  svg.appendChild(centerLines[i])
 }
 for (let i = 0; i < n; i++) {
  svg.appendChild(circles[i])
 }
}
//Erstelle den gelb-weiß Farbverlauf
function defineGradient(svg) {
 let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
 let grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
 grad.id = "grad"
 grad.setAttribute("x1", "0%")
 grad.setAttribute("y1", "0%")
 grad.setAttribute("x2", "100%")
 grad.setAttribute("y2", "0%")
 let left = document.createElementNS("http://www.w3.org/2000/svg", "stop")
 left.setAttribute("offset", "0%")
 left.setAttribute("stop-color", "rgb(255 204 0)")
 let middle = document.createElementNS("http://www.w3.org/2000/svg", "stop")
 middle.setAttribute("offset", "50%")
 middle.setAttribute("stop-color", "white")
 let right = document.createElementNS("http://www.w3.org/2000/svg", "stop")
 right.setAttribute("offset", "100%")
 right.setAttribute("stop-color", "rgb(255 204 0)")
 grad.appendChild(left)
 grad.appendChild(middle)
 grad.appendChild(right)
 defs.appendChild(grad)
 svg.appendChild(defs)
}
//Male die Rechtecke der Knoten
function drawRects([n, svg, xsize, ysize, depths], width, height, widths, xfunc, yfunc) {
 defineGradient(svg)
 for (let i = 1; i <= n; i++) {
  let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  rect.setAttribute("x", xsize * (xfunc(i) + 0.25) + 10)
  rect.setAttribute("y", ysize * (yfunc(i) - 0.75) + 10)
  rect.setAttribute("width", xsize * (width / widths[i]))
  rect.setAttribute("height", ysize * (height - depths[i] + 1))
  rect.setAttribute("fill", "url(#grad)")
  rect.setAttribute("stroke", "black")
  svg.appendChild(rect)
 }
}
//Male die Bäume und ggf. die Rechtecke und zeige sie an
function drawResult(n, parents, kids, turns, widths, depths) {
 let height = Math.max(...depths)
 let width = 1
 for (let i = 0; i < widths.length; i++) {
  width = lcm(height, widths[i])
 }
 let [xSizes, xPos] = getXPos(kids, parents, width)
 let dark = window.matchMedia("(prefers-color-scheme: dark)").matches
 let xsize, ysize
 if (window.innerWidth < window.innerHeight) {
  xsize = (window.innerWidth / width / 1.2)
  ysize = xsize * width / (height * 2)
 } else {
  ysize = (window.innerHeight / height / 2.4)
  xsize = ysize * height / (width * 0.5)
 }
 let obj = document.getElementById("myCanvas")
 let textRef = document.getElementById("text")
 let svgRef = document.getElementById("svg")
 let pngRef = document.getElementById("png")
 textRef.textContent = "Download Image as:"
 svgRef.textContent = "SVG"
 pngRef.textContent = "PNG"
 let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
 let cwidth = xsize * (width + 0.5) + 20
 let cheight = ysize * (height - 0.25) * 2 + 20
 svg.setAttribute("width", cwidth)
 svg.setAttribute("height", cheight)
 svg.style.background = dark ? "black" : "white"
 let drawData = [n, svg, xsize, ysize, depths]
 if (turns) {
  drawRects(drawData, width, height, widths, i => xSizes[i][0], i => depths[i])
  drawRects(drawData, width, height, widths, i => width - xSizes[i][0] - (width / widths[i]), i => height)
 }
 drawTree(drawData, xPos, kids, x => x, y => y)
 drawTree(drawData, xPos, kids, x => cwidth - x, y => cheight - y)
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
}
//Ermittle, ob der Baum drehfreudig ist
function turnable(n, parents, kids) {
 let widths = [1]
 let leafWidths = []
 let depths = [0]
 let leafDepths = []
 for (let i = 1; i <= n; i++) {
  let width = widths[parents[i]] * kids[parents[i]].length
  let depth = depths[parents[i]] + 1
  widths.push(width)
  depths.push(depth)
  if (!kids[i].length) {
   leafWidths.push(width)
   leafDepths.push(depth)
  }
 }
 let turns = 1
 for (let i = 0; i < leafWidths.length; i++) {
  turns &= leafWidths[i] == leafWidths[leafWidths.length - i - 1]
  turns &= leafDepths[i] == leafDepths[0]
 }
 return [turns, widths, depths]
}
//Ermittle, ob der Baum drehfreudig ist und visualisiere das Ergebnis
function main([n, parents, kids]) {
 let [turns, widths, depths] = turnable(n, parents, kids)
 drawResult(n, parents, kids, turns, widths, depths)
}