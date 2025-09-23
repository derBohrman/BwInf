const c = document.getElementById("myCanvas")
const ctx = c.getContext("2d")
let mulx, muly, i, ball = 0
//definiere was ein punkt ist
class point {
    constructor(x, y) {
        this.x = x
        this.y = y
        //funktion zum messen der distanz zwischen zwei punkten
        this.dis = point => Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2))
    }
    draw(rgb, point) {
        ctx.beginPath()
        ctx.strokeStyle = rgb
        ctx.moveTo((this.x + 2 * ball) * mulx, c.height - (this.y + 2 * ball) * muly)
        ctx.lineTo((point.x + 2 * ball) * mulx, c.height - (point.y + 2 * ball) * muly)
        ctx.stroke()
    }
}
//definiere was eine linie ist
class line {
    constructor(a, b) {
        this.a = a.x < b.x ? a : b
        this.b = a.x < b.x ? b : a
        this.length = this.a.dis(this.b)
        this.dif = new point(this.b.x - this.a.x, this.b.y - this.a.y)
        this.gradient = this.dif.y / this.dif.x
        this.yIntercept = (-this.a.x) * this.gradient + this.a.y
        this.touch = point => ~~((this.length - (point.dis(this.a) + point.dis(this.b))) * Math.pow(10, 10)) == 0
        this.draw = rgb => this.a.draw(rgb, this.b)
        this.middle = new point((this.a.x + this.b.x) / 2, (this.a.y + this.b.y) / 2)
        if (this.a.x == this.b.x && this.a.y == this.b.y) {
            return this.a
        }
    }
    //funktion zum errschaffen einer Parallelen
    parallel(dis) {
        let prop = dis / this.length
        let xdif = this.dif.x * prop
        let ydif = this.dif.y * prop
        let a = new point(this.a.x + ydif, this.a.y - xdif)
        let b = new point(this.b.x + ydif, this.b.y - xdif)
        return new line(a, b)
    }
    //funktion um die linie um 90° zu drehen
    flip() {
        let xdif = this.dif.x / 2
        let ydif = this.dif.y / 2
        let a = new point(this.middle.x + ydif, this.middle.y - xdif)
        let b = new point(this.middle.x - ydif, this.middle.y + xdif)
        return new line(a, b)
    }
    //funktion um den Schnittpunkt mit einer anderen linie zu finden
    crossPoint(line) {
        if (this.gradient == line.gradient) {
            return false
        } else if (Math.abs(this.gradient) + Math.abs(line.gradient) == Number.POSITIVE_INFINITY) {
            let toggle = Math.abs(line.gradient) == Number.POSITIVE_INFINITY
            let x = toggle ? line.a.x : this.a.x
            let y = toggle ? x * this.gradient + this.yIntercept : x * line.gradient + line.yIntercept
            return new point(x, y)
        } else {
            let x = (line.yIntercept - this.yIntercept) / (this.gradient - line.gradient)
            let y = this.gradient * x + this.yIntercept
            return new point(x, y)
        }
    }
    //funktion zum überprüfen, ob sich zwei linien kreuzen
    cross(line) {
        let point = this.crossPoint(line)
        return point === false ? false : this.touch(point) && line.touch(point)
    }
}
//Lese Eingabe aus
let input = (prompt("Krocket") || "0").split(/[\s\n]+/)
let vals = []
//Wandle String in Zahlen um und filtere ungültige Zeichen raus
for (let i = 0; i < input.length; i++) {
    let maybe = Number(input[i]) || 0
    if (maybe.toString() == input[i]) {
        vals.push(maybe)
    }
}
//Wenn die Eingabe kein Krocket Feld war, dann stoppe das Programm
if (!(vals.length > 2 && (vals.length - 2) % 4 == 0)) {
    throw new Error("Ungultige Eingabe")
}
const size = (vals.length - 2) >> 2
let hoops = Array(size)
ball = vals[1]
//Formatiere die Werte als Linien
for (let i = size - 1; i > -1; i--) {
    let cut = vals.splice(-4, 4)
    hoops[i] = new line(new point(cut[0], cut[1]), new point(cut[2], cut[3]))
}
//finde die größten Werte für breite und höhe
let maxx = hoops[0].b.x
let maxy = Math.max(hoops[0].a.y, hoops[0].b.y)
for (let i = 1; i < size; i++) {
    maxx = Math.max(maxx, hoops[i].b.x)
    maxy = Math.max(maxy, hoops[i].a.y, hoops[i].b.y)
}
//passe die Skalierung der Linien so an,
//dass alles innerhalb des Bildschirms gezeichnet werden können
c.height = window.innerHeight * 0.9
c.width = window.innerWidth * 0.9
mulx = c.width / (maxx + 4 * ball)
muly = c.height / (maxy + 4 * ball)
//male alle Linien
for (let i = 0; i < size; i++) {
    hoops[i].draw("rgb(0 0 0)")
}
//Merke dir das Erste und Letzte Tor
let enter = hoops[0]
let out = hoops[size - 1]
//Merke dir Linien,
//die zusammen mit dem Ersten und Letzten Tor ein Viereck bilden würden
let allSides = Array(2)
let swap = enter.a.dis(out.a) + enter.b.dis(out.b) < enter.a.dis(out.b) + enter.b.dis(out.a)
allSides[0] = swap ? new line(enter.a, out.a) : new line(enter.a, out.b)
allSides[1] = swap ? new line(enter.b, out.b) : new line(enter.b, out.a)
//Wenn die Seiten Parallel zum Ersten Tor sind, ist es nicht in einem Schlag lösbar
if (allSides[0].gradient == enter.gradient) {
    enter.draw("rgb(255 0 0)")
    throw new Error("Nicht machbar wegen position des Tores 1")
}
//Funktion um eine Seite so zu bewegen, dass die Seite durch den Punkt geht
let connected = false
function crop(end, side, other) {
    let outPoint = out.crossPoint(side)
    let inverse = enter.crossPoint(other)
    let potential = new line(new line(outPoint, end).crossPoint(enter), outPoint)
    if (potential.cross(other)) {
        potential = new line(new line(inverse, end).crossPoint(out), inverse)
        connected = true
    }
    return potential
}
//funktion um zu Testen, ob es möglich ist,
//mit einem 0 Großen ball in einem Schlag durch alle Tore zu Schießen
let garbage = []
function moveSide(hoop, sides) {
    //Zähle wie häufig das Tor die Seiten kreuzt
    let crosses = 2
    if (sides[0] instanceof line) {
        crosses -= 1 - sides[0].cross(hoop)
    }
    if (sides[1] instanceof line) {
        crosses -= 1 - sides[1].cross(hoop)
    }
    //Wenn nur eine Seite Gekreuzt wird,
    //wird die andere Seite zu dem Pfosten zwischen den Beiden Seiten bewegt
    if (crosses == 1) {
        let change = +sides[0].cross(hoop)
        let crossPoint = sides[change].crossPoint(hoop)
        let end = hoop.a.dis(crossPoint) < hoop.b.dis(crossPoint) ? hoop.a : hoop.b
        return [crop(end, sides[change], sides[1 - change]), sides[1 - change]]
        //Wenn keine Seite Gekreuzt wird, wird überprüft ob das Tor sich zwischen den Seiten befindet
    } else if (crosses == 0) {
        let a = sides[0].crossPoint(hoop)
        let b = sides[1].crossPoint(hoop)
        //Wenn das Tor sich innerhalb befindet, werden die Seiten zu den Pfosten bewegt
        if (!(new line(hoop.a, a).touch(b) || new line(hoop.a, b).touch(a))) {
            let c = hoop.a.dis(a) < hoop.b.dis(a) ? hoop.a : hoop.b
            let d = hoop.a.dis(a) < hoop.b.dis(a) ? hoop.b : hoop.a
            let out = [crop(c, sides[0], sides[1])]
            out.push(crop(d, sides[1], out[0]))
            if (!connected) {
                out.push(crop(d, sides[1], sides[0]))
                out.push(crop(c, sides[0], out[2]))
            }
            return out
            //Wenn das Tor sich außerhalb befindet, bedeutet es, dass es für solche seiten unmöglich ist
        } else {
            garbage.push(...sides, hoop)
            return []
        }
    }
    return sides
}
//teste alle Tore vom Ersten zum Letzten und merke dir, wo sich die Seiten zum Schluss befanden
let sides = [...allSides]
for (let i = 1; i < hoops.length - 1; i++) {
    for (let j = 0; j < sides.length; j += 2) {
        sides.splice(j, 2, ...moveSide(hoops[i], sides.slice(j, 2)))
    }
}
let sidePot = [...sides]
//teste alle Tore vom Letzten zum Ersten und merke dir, wo sich die Seiten zum Schluss befanden
let save = enter
enter = out
out = save
sides = [...allSides]
connected = false
for (let i = hoops.length - 2; i > 0; i--) {
    sides = moveSide(hoops[i], sides)
    for (let j = 0; j < sides.length; j += 2) {
        sides.splice(j, 2, ...moveSide(hoops[i], sides.slice(j, 2)))
    }
}
sidePot.push(...sides)
//Überprüfe ob es überhaupt möglich ist mit einem 0 Großen ball durchzuschießen
if (sidePot.length == 0) {
    garbage[0].draw("rgb(0 0 255)")
    garbage[1].draw("rgb(0 0 255)")
    garbage[2].draw("rgb(255 0 0)")
    throw new Error("Nicht machbar wegen anordnung der Tore")
}
//Erschaffe linien, Parallel zum ersten und letzten Tor
let para = Array(2)
let border = Array(2)
let enterPara = enter.parallel(ball / 2)
if (!(new line(enterPara.middle, out.middle).cross(enter))) {
    enterPara = enter.parallel(-ball / 2)
}
let outPara = out.parallel(ball / 2)
let testLine = new line(outPara.middle, enterPara.middle)
if (testLine instanceof point || !testLine.cross(out)) {
    outPara = out.parallel(-ball / 2)
}
sidePot.push(enter.flip().parallel(-ball / 2))
//function um zu überprüfen, ob der Ball zwischen den Parallelen durchgeschossen werden könnte
function check() {
    border[0] = new line(para[0].crossPoint(enterPara), para[0].crossPoint(outPara))
    border[1] = new line(para[1].crossPoint(enterPara), para[1].crossPoint(outPara))
    for (let i = 0; i < size; i++) {
        if (!hoops[i].cross(border[0]) || !hoops[i].cross(border[1])) {
            return false
        }
    }
    return true
}
//Teste für jede seite, ob der Ball durchgeschossen werden könnte
let ballPass = false
for (let i = 0; i < sidePot.length; i++) {
    if (sidePot[i] instanceof line) {
        para[0] = sidePot[i]
        para[1] = sidePot[i].parallel(ball)
        if (check()) {
            ballPass = true
            break
        }
        para[1] = sidePot[i].parallel(-ball)
        if (check()) {
            ballPass = true
            break
        }
    }
}
//Wenn der Ball nirgends durchpasst, dann melde das
if (!ballPass) {
    sidePot[0].draw("rgb(255 0 0)")
    sidePot[1].draw("rgb(255 0 0)")
    throw new Error(`Nicht machbar wegen breite des Balls`)
}
//Teste ob die Tore in der richtigen reihenfolge passiert werden
let a = hoops[0].crossPoint(border[0])
let b = (hoops[1] || hoops[0]).crossPoint(border[0])
for (let i = 2; i < size; i++) {
    if (hoops[i].cross(new line(a, b))) {
        hoops[i].draw("rgb(255 0 0)")
        border[0].draw("rgb(255 255 0)")
        border[1].draw("rgb(255 255 0)")
        throw new Error(`Nicht machbar wegen reihenfolge des Tores ${i + 1}`)
    }
    b = border[0].crossPoint(hoops[i])
}
//Berechne die Schusslinie
let center = border[0].parallel(ball / 2)
if (new line(center.middle, border[1].middle).cross(border[0])) {
    center = border[0].parallel(-ball / 2)
}
//Berechne den Abschusswinkel
let winkel = Math.atan(center.gradient) * (180 / Math.PI)
if (center.crossPoint(enter).x < center.crossPoint(out).x) {
    winkel = winkel < 0 ? winkel + 180 : winkel - 180
}
save = enter
enter = new line(border[0].crossPoint(out), border[1].crossPoint(out))
out = new line(border[0].crossPoint(save), border[1].crossPoint(save))
//Berechne Abschusspunkt
let punkt = outPara.crossPoint(center)
//Gebe alle werte auf zwei Nachkommastellen gerundet aus
let round = val => Math.round(val * 100) / 100
console.log(`Abschusspunkt: (${round(punkt.x)}|${round(punkt.y)}) Winkel: ${round(winkel)}\u00B0`)
//Zeichne den Schuss
border[0] = new line(border[0].crossPoint(enter), border[0].crossPoint(out))
border[1] = new line(border[1].crossPoint(enter), border[1].crossPoint(out))
if (border[0] instanceof line) {
    border[0].draw("rgb(0 255 0)")
}
if (border[1] instanceof line) {
    border[1].draw("rgb(0 255 0)")
}
enterPara.crossPoint(center).draw("rgb(0 155 0)", outPara.crossPoint(center))