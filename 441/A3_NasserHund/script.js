let vidC = document.getElementById("vidCanvas")
let vidCtx = vidC.getContext("2d")
vidC.width = vidC.height = 0
let framePos, vidLines, vidStart, lastFrame, nextImage, scale, vidLen
let imageData = []
let fps = 30
let margin = 10
function triggerFileUpload() {
 let fileInput = document.getElementById("fileUpload")
 fileInput.value = null
 fileInput.click()
}
document.getElementById("fileUpload").addEventListener("change", function (event) {
 if (event.target.files[0]) {
  let reader = new FileReader()
  reader.onload = function (e) {
   let [k, ...lines] = e.target.result.replace(/\r/g, "").split("\n")
   if (k == "vid") return mainVid(lines)
   k = +k
   let p = []
   for (let i = 0; i < k; i++) {
    let line = lines[i].split(" ")
    p[i] = [[+line[0], +line[1]], [+line[2], +line[3]]]
   }
   let startTime = Date.now()
   let durations = main(k, p, ...readLArr(lines, k))
   let runtime = (Date.now() - startTime) / 1000
   let result = `Runtime: ${runtime}s\nMin dis: ${durations}`
   document.getElementById("result").textContent = result
  }
  reader.readAsText(event.target.files[0])
 }
})
function readLArr(lines, ind, offset = 0) {
 let s = +lines[ind++]
 let nArr = []
 let lArr = []
 for (let i = 0; i < s; i++) {
  nArr[i] = +lines[ind]
  lArr[i] = []
  for (let j = ind + 1; j <= ind + nArr[i]; j++) {
   let line = lines[j].split(" ")
   lArr[i].push([+line[0] + offset, +line[1] + offset])
  }
  ind += nArr[i] + 1
 }
 return [s, nArr, lArr]
}
function o(a, b, c) {
 let t = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1])
 return t == 0 ? 0 : (t > 0 ? 1 : 2)
}
function d(a, b, c) {
 let dabx = b[0] - a[0]
 let daby = b[1] - a[1]
 let dacx = c[0] - a[0]
 let dacy = c[1] - a[1]
 let t = (dabx * dacx + daby * dacy) / (dabx * dabx + daby * daby)
 t = t > 1 ? 1 : (t < 0 ? 0 : t)
 let dx = dacx - t * dabx
 let dy = dacy - t * daby
 return (dx * dx + dy * dy) ** 0.5
}
function minDis(k, p, s, nArr, lArr) {
 let min = -1
 for (let i = 0; i < s; i++) {
  let n = nArr[i]
  let l = lArr[i]
  for (let j = 0; j < k; j++) {
   for (let m = 0; m < n; m++) if (o(p[j][0], p[j][1], l[m]) != o(p[j][0], p[j][1], l[(m + 1) % n]) && o(l[m], l[(m + 1) % n], p[j][0]) != o(l[m], l[(m + 1) % n], p[j][1])) return -2
   for (let q = 0; q < 2; q++) {
    let c = 0;
    for (let m = 0; m < n; m++) c ^= l[m][1] > p[j][q][1] ^ l[(m + 1) % n][1] > p[j][q][1] && ((p[j][q][0] - l[m][0]) * (l[(m + 1) % n][1] - l[m][1]) - (p[j][q][1] - l[m][1]) * (l[(m + 1) % n][0] - l[m][0])) * (l[(m + 1) % n][1] - l[m][1]) < 0
    if (c) return -1
   }
  }
  for (let j = 0; j < k; j++)  for (let m = 0; m < n; m++) {
   let t
   min = ((t = d(p[j][0], p[j][1], l[m])) < min || min < 0 ? t : min)
   min = ((t = d(p[j][0], p[j][1], l[(m + 1) % n])) < min || min < 0 ? t : min)
   min = ((t = d(l[m], l[(m + 1) % n], p[j][0])) < min || min < 0 ? t : min)
   min = ((t = d(l[m], l[(m + 1) % n], p[j][1])) < min || min < 0 ? t : min)
  }
 }
 return min
}
async function draw(p, lArr, dis) {
 let minX = 1 / 0
 let maxX = 0
 let minY = 1 / 0
 let maxY = 0
 for (let i = 0; i < p.length; i++) {
  minX = Math.min(minX, p[i][0][0], p[i][1][0])
  maxX = Math.max(maxX, p[i][0][0], p[i][1][0])
  minY = Math.min(minY, p[i][0][1], p[i][1][1])
  maxY = Math.max(maxY, p[i][0][1], p[i][1][1])
 }
 for (let i = 0; i < lArr.length; i++) {
  for (let j = 0; j < lArr[i].length; j++) {
   minX = Math.min(minX, lArr[i][j][0])
   maxX = Math.max(maxX, lArr[i][j][0])
   minY = Math.min(minY, lArr[i][j][1])
   maxY = Math.max(maxY, lArr[i][j][1])
  }
 }
 let m = maxX - minX
 let n = maxY - minY
 let dark = window.matchMedia("(prefers-color-scheme: dark)").matches
 let size = Math.min((window.innerWidth / (m + 2 * dis) / 1.2), (window.innerHeight / (n + 2 * dis) / 1.2))
 let obj = document.getElementById("myCanvas")
 let textRef = document.getElementById("text")
 let svgRef = document.getElementById("svg")
 let pngRef = document.getElementById("png")
 let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
 svg.setAttribute("width", size * (m + 2 * dis))
 svg.setAttribute("height", size * (n + 2 * dis))
 svg.style.background = dark ? "black" : "white"
 let line = ([[x1, y1], [x2, y2]], col, width) => {
  let l = document.createElementNS("http://www.w3.org/2000/svg", "line")
  l.setAttribute("x1", size * (x1 - minX + dis))
  l.setAttribute("y1", size * (y1 - minY + dis))
  l.setAttribute("x2", size * (x2 - minX + dis))
  l.setAttribute("y2", size * (y2 - minY + dis))
  l.setAttribute("stroke", col)
  l.setAttribute("stroke-width", width * size)
  return l
 }
 let circle = ([x, y], col, width) => {
  let circ = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  circ.setAttribute("cx", size * (x - minX + dis))
  circ.setAttribute("cy", size * (y - minY + dis))
  circ.setAttribute("r", width * size)
  circ.setAttribute("fill", col)
  circ.setAttribute("stroke-width", 0)
  return circ
 }
 for (let i = 0; i < p.length; i++) {
  svg.appendChild(line(p[i], "red", 2 * dis))
  svg.appendChild(circle(p[i][0], "red", dis))
  svg.appendChild(circle(p[i][1], "red", dis))
 }
 for (let i = 0; i < p.length; i++) {
  svg.appendChild(line(p[i], dark ? "white" : "black", 1))
  svg.appendChild(circle(p[i][0], dark ? "white" : "black", 0.5))
  svg.appendChild(circle(p[i][1], dark ? "white" : "black", 0.5))
 }
 for (let i = 0; i < lArr.length; i++) {
  let points = ""
  for (let j = 0; j < lArr[i].length; j++) {
   points += `${size * (lArr[i][j][0] - minX + dis)},${size * (lArr[i][j][1] - minY + dis)} `
  }
  let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
  polygon.setAttribute("points", points)
  polygon.setAttribute("fill", "blue")
  polygon.setAttribute("stroke-width", 0)
  svg.appendChild(polygon)
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
 textRef.textContent = "Download Image as:"
 svgRef.textContent = "SVG"
 pngRef.textContent = "PNG"
}
function main(k, p, s, nArr, lArr) {
 let dis = minDis(k, p, s, nArr, lArr)
 draw(p, lArr, dis)
 return dis
}
async function getImage(frameInd) {
 if (!imageData[frameInd]) {
  let width = 521 + margin
  let height = 393 + margin
  let border = [4, [
   [[0, 0], [0, height]],
   [[0, height], [width, height]],
   [[width, height], [width, 0]],
   [[width, 0], [0, 0]]
  ]]
  let frame = readLArr(vidLines, framePos[frameInd], margin)
  let dis = Math.max(minDis(...border, ...frame), 0)
  imageData[frameInd] = [dis, border, frame]
 }
 let [dis, [k, p], [s, nArr, lArr]] = imageData[frameInd]
 let dark = window.matchMedia("(prefers-color-scheme: dark)").matches
 let c = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(vidC.width, vidC.height) : document.createElement("canvas")
 c.width = vidC.width
 c.height = vidC.height
 let ctx = c.getContext("2d")
 ctx.fillStyle = dark ? "black" : "white"
 ctx.fillRect(0, 0, c.width, c.height)
 let off = xi => {
  let x = [...xi]
  for (let i = 0; i < x.length; i++) x[i] = (x[i] + margin) * scale
  return x
 }
 ctx.strokeStyle = ctx.fillStyle = "red"
 ctx.lineWidth = 2 * scale * dis
 for (let i = 0; i < k; i++) {
  ctx.beginPath()
  ctx.moveTo(...off(p[i][0]))
  ctx.lineTo(...off(p[i][1]))
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(...off(p[i][0]), scale * dis, 0, Math.PI * 2)
  ctx.arc(...off(p[i][1]), scale * dis, 0, Math.PI * 2)
  ctx.fill()
 }
 ctx.strokeStyle = ctx.fillStyle = dark ? "white" : "black"
 ctx.lineWidth = scale
 for (let i = 0; i < k; i++) {
  ctx.beginPath()
  ctx.moveTo(...off(p[i][0]))
  ctx.lineTo(...off(p[i][1]))
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(...off(p[i][0]), scale * 0.5, 0, Math.PI * 2)
  ctx.arc(...off(p[i][1]), scale * 0.5, 0, Math.PI * 2)
  ctx.fill()
 }
 ctx.fillStyle = "blue"
 for (let i = 0; i < s; i++) {
  ctx.beginPath()
  ctx.moveTo(...off(lArr[i][0]))
  for (let j = 1; j < nArr[i]; j++) {
   ctx.lineTo(...off(lArr[i][j]))
  }
  ctx.fill()
 }
 nextImage = c
}
function animate() {
 let frame = ~~((Date.now() - vidStart) / (1000 / fps))
 if (frame >= vidLen) {
  vidStart += (1000 / fps) * (frame - (frame % vidLen))
  frame %= vidLen
 }
 if (frame != lastFrame) {
  if (nextImage) vidCtx.drawImage(nextImage, 0, 0)
  nextImage = 0
  getImage(frame)
 }
 lastFrame = frame
 requestAnimationFrame(animate)
}
async function mainVid([f, ...lines]) {
 vidLen = +f
 framePos = []
 let ind = 0
 for (let i = 0; i < vidLen; i++) {
  framePos[i] = ind
  let s = +lines[ind++]
  for (let j = 0; j < s; j++) ind += +lines[ind] + 1
 }
 vidLines = lines
 let width = 521 + margin
 let height = 393 + margin
 scale = Math.min((window.innerWidth / (width + 2 * margin) / 1.2), (window.innerHeight / (height + 2 * margin) / 1.2))
 vidC.height = scale * (height + 2 * margin)
 vidC.width = scale * (width + 2 * margin)
 lastFrame = -1
 getImage(0)
 vidStart = Date.now()
 requestAnimationFrame(animate)
}