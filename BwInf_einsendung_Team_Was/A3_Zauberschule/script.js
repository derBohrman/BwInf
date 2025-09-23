let bild = document.getElementById("bild")
let context = bild.getContext("2d")
let eingabe = prompt("Zauberschule") //Dialogfeld für die eingabe
let array2 = []
let teil = []
let bpos = []
let zweites_Stockwerk = []
array = eingabe.split(" ") //Eingabe wird in einzelne Felder geteilt
let höhe = array.shift() //die Höhe wird sich gemerkt
let breite = array.shift() //die Breite wird sich gemerkt
for (let x = 0; x < höhe * 2 + 1; x++) { //Felder werden in einer zweidimensionalen Liste gespeichert
    array2 = []
    teil = array[x].split("")
    for (let y = 0; y < breite; y++) {
        if (array[x][y] == " " || array[x][y] == "") {
        } else if (array[x][y] == "A") { //der Stelle A wird der Wert 0 gegeben
            array2.push(0)
        } else if (array[x][y] == "B") { //die Stelle B wird sich gemerkt und zu einem leeren Feld gemacht
            bpos.push(x)
            bpos.push(y)
            array2.push(".")
        } else {
            array2.push(array[x][y])
        }
    }
    zweites_Stockwerk.push(array2)
}
let erstes_Stockwerk = []
for (let zähler = 0; zähler < höhe; zähler++) { // die Zauberschule wird in zwei Stockwerke aufgeteilt
    erstes_Stockwerk.push(zweites_Stockwerk.shift())
}
zweites_Stockwerk.shift()
let zähler = 0
while (erstes_Stockwerk[bpos[0]][bpos[1]] == ".") { //die Felder werden mit der Zeit die es breucht um zu dem Feld zu kommen markiert
    zähler++
    for (let x = 0; x < höhe; x++) {
        for (let y = 0; y < breite; y++) {
            if (zähler == erstes_Stockwerk[x][y] + 1) { //erstes Stockwerk 
                if (erstes_Stockwerk[x + 1][y] == ".") { //Über dem eigenen Feld
                    erstes_Stockwerk[x + 1][y] = zähler
                }
                if (erstes_Stockwerk[x - 1][y] == ".") {//Unter dem eigenen Feld
                    erstes_Stockwerk[x - 1][y] = zähler
                }
                if (erstes_Stockwerk[x][y + 1] == ".") {//Rechts neben dem eigenen Feld
                    erstes_Stockwerk[x][y + 1] = zähler
                }
                if (erstes_Stockwerk[x][y - 1] == ".") {//Links neben dem eigenen Feld
                    erstes_Stockwerk[x][y - 1] = zähler
                }
            }
            if (zähler == zweites_Stockwerk[x][y] + 1) {//zweites Stockwerk
                if (zweites_Stockwerk[x + 1][y] == ".") {//Über dem eigenen Feld
                    zweites_Stockwerk[x + 1][y] = zähler
                }
                if (zweites_Stockwerk[x - 1][y] == ".") {//Unter dem eigenen Feld
                    zweites_Stockwerk[x - 1][y] = zähler
                }
                if (zweites_Stockwerk[x][y + 1] == ".") {//Rechts neben dem eigenen Feld
                    zweites_Stockwerk[x][y + 1] = zähler
                }
                if (zweites_Stockwerk[x][y - 1] == ".") {//Links neben dem eigenen Feld
                    zweites_Stockwerk[x][y - 1] = zähler
                }
            }
            if (zähler == erstes_Stockwerk[x][y] + 3) { //erstes zu zweites Stockwerk Stockwerkwechsel
                if (zweites_Stockwerk[x][y] == ".") {
                    zweites_Stockwerk[x][y] = zähler
                }
            }
            if (zähler == zweites_Stockwerk[x][y] + 3) { //zweites zu erstes Stockwerk Stockwerkwechsel
                if (erstes_Stockwerk[x][y] == ".") {
                    erstes_Stockwerk[x][y] = zähler
                }
            }
        }
    }
}
bpos.push(true) //starte auf dem ersten Stockwerk
let wert = erstes_Stockwerk[bpos[0]][bpos[1]]
console.log("Man braucht", wert, "sekunden um von A nach B zu kommen.") //schreibe in die console wie lange es braucht um von A nach B zu kommen
erstes_Stockwerk[bpos[0]][bpos[1]] = "B"
while (wert != 0) {//den weg zurückverfolgen
    if (bpos[2]) { //erstes Stockwerk
        if (erstes_Stockwerk[bpos[0] + 1][bpos[1]] == wert - 1) {//Über dem aktuellen Feld
            erstes_Stockwerk[bpos[0] + 1][bpos[1]] = "^"
            bpos[0]++
            wert--
        }
        if (erstes_Stockwerk[bpos[0] - 1][bpos[1]] == wert - 1) {//Unter dem aktuellen Feld
            erstes_Stockwerk[bpos[0] - 1][bpos[1]] = "v"
            bpos[0]--
            wert--
        }
        if (erstes_Stockwerk[bpos[0]][bpos[1] + 1] == wert - 1) {//Rechts neben dem aktuellen Feld
            erstes_Stockwerk[bpos[0]][bpos[1] + 1] = "<"
            bpos[1]++
            wert--
        }
        if (erstes_Stockwerk[bpos[0]][bpos[1] - 1] == wert - 1) {//Links neben dem aktuellen Feld
            erstes_Stockwerk[bpos[0]][bpos[1] - 1] = ">"
            bpos[1]--
            wert--
        }
        if (zweites_Stockwerk[bpos[0]][bpos[1]] == wert - 3) {//zum zweiten Stockwerk wechseln
            zweites_Stockwerk[bpos[0]][bpos[1]] = "!"
            bpos[2] = false
            wert = wert - 3
        }
    } else {//zweites Stockwerk
        if (zweites_Stockwerk[bpos[0] + 1][bpos[1]] == wert - 1) {//Über dem eignenen Feld
            zweites_Stockwerk[bpos[0] + 1][bpos[1]] = "^"
            bpos[0]++
            wert--
        }
        if (zweites_Stockwerk[bpos[0] - 1][bpos[1]] == wert - 1) {//Unter dem eigenen Feld
            zweites_Stockwerk[bpos[0] - 1][bpos[1]] = "v"
            bpos[0]--
            wert--
        }
        if (zweites_Stockwerk[bpos[0]][bpos[1] + 1] == wert - 1) {//rechts neben dem aktuellen Feld
            zweites_Stockwerk[bpos[0]][bpos[1] + 1] = "<"
            bpos[1]++
            wert--
        }
        if (zweites_Stockwerk[bpos[0]][bpos[1] - 1] == wert - 1) {//links neben dem aktuellen Feld
            zweites_Stockwerk[bpos[0]][bpos[1] - 1] = ">"
            bpos[1]--
            wert--
        }
        if (erstes_Stockwerk[bpos[0]][bpos[1]] == wert - 3) {// zum ersten Stockwerk wechseln
            erstes_Stockwerk[bpos[0]][bpos[1]] = "!"
            bpos[2] = true
            wert = wert - 3
        }
    }
}
var table = document.createElement("table") //erstelle Tabelle
var thead = document.createElement("thead")
var headerRow = document.createElement("tr")
for (let x of erstes_Stockwerk) {//gib das erste Stockwerk in die Tabelle ein
    var row1 = document.createElement("tr")
    for (let y of x) {
        var cell1 = document.createElement("td")
        if (y > 0) {// alle zahlen werden durch leere Felder ersetzt
            cell1.textContent = "."
        } else {
            cell1.textContent = y
        }
        row1.appendChild(cell1)
    }
    table.appendChild(row1)
}
var row1 = document.createElement("tr")
var cell1 = document.createElement("td")
cell1.textContent = '\u{B}'
row1.appendChild(cell1)
table.appendChild(row1)
for (let x of zweites_Stockwerk) {//gib das zweite Stockwerk ein
    var row1 = document.createElement("tr")
    for (let y of x) {
        var cell1 = document.createElement("td")
        if (y > 0) {// alle zahlen werden durch leere Felder ersetzt
            cell1.textContent = "."
        } else {
            cell1.textContent = y
        }
        row1.appendChild(cell1)
    }
    table.appendChild(row1)
}
document.body.appendChild(table)// füge die Tabelle dem dokument hinzu