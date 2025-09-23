//Lese Eingabe aus
let input = (prompt("Schwierigkeiten") || "0").split("")
let compare = {}
let test = []
//letter speichert ob die das letzte Zeichen ein Buchstabe war
//splitter speichert ob in dieser Zeile schon ein kleiner als Zeichen war
let letter, splitter = false
//Filtere alle Zahlen raus
for (let i = 0; i < input.length; i++) {
    if ((input[i] || 0) != 0 && (Number(input[i]) || 0) == 0) {
        //Wenn ein Buchstabe ins System eingefügt wird
        if (input[i] != "<") {
            //Und eine Neue Zeile Anfängt
            if (letter && splitter) {
                //Speichere die verhältnisse der Zeile in der Hashmap
                for (let j = 0; j < test.length - 1; j++) {
                    for (let l = j + 1; l < test.length; l++) {
                        compare[test[j] + test[l]] = compare[test[j] + test[l]] + 1 || 1
                    }
                }
                splitter = false
                test = []
            }
            test.push(input[i])
            letter = true
        } else {
            splitter = true
            letter = false
        }
    }
}
//Funktion um die Buchstaben des letzten Tests nach schwirigkeit zu sortieren
function sort(list) {
    //Wenn die liste nicht mehr sortiert werden kann, dann gebe sie zurück
    if (list.length <= 1) {
        return list[0] || " "
    }
    let smalInd = 0
    let smalNum = Number.POSITIVE_INFINITY
    let smalRef = []
    //Vergleiche jeden Buchstaben (i) mit jeden Buchsteben (j)
    for (let i = 0; i < list.length; i++) {
        let bigger = 0
        let ref = []
        for (let j = 0; j < list.length; j++) {
            //Wenn i>j ist dann merke dir das
            if ((compare[list[i] + list[j]] || 0) < (compare[list[j] + list[i]] || 0)) {
                bigger++
                ref.push(list[j])
            }
        }
        //Merke dir den Buchstaben, bei dem es die wenigsten konflikte gibt,
        //wenn es das kleinste ist
        if (bigger < smalNum) {
            smalNum = bigger
            smalInd = i
            smalRef = ref
        }
    }
    //Wenn es konflikte gibt dann speichere das in der Hashmap
    if (smalNum > 0) {
        for (let i = 0; i < smalRef.length; i++) {
            compare[list[smalInd] + " "] = compare[list[smalInd] + " "] || ""
            compare[smalRef[i] + "<"] = compare[smalRef[i] + "<"] || ""
            compare[list[smalInd] + " "] += smalRef[i] + ","
            compare[smalRef[i] + "<"] += list[smalInd] + ","
        }
    }
    //rufe diese Funktion für die restliche liste auf
    return [list.splice(smalInd, 1), ...sort(list)]
}
let sorted = sort(test)
let out = ""
//Funktion um alle Konflikte eines Buchstaben aufzulisten
function add(ref) {
    if (compare[ref] !== undefined) {
        out += `(${compare[ref].slice(0, -1)})`
    }
}
//Gehe durch jeden Buchsteben und notiere die Konflikte für jeden Buchstaben
for (let i = 0; i < sorted.length - 1; i++) {
    add(sorted[i] + " ")
    out += sorted[i]
    add(sorted[i] + "<")
    //Wenn der Folgende Buchstabe mit dem eigenen getauscht werden könnte,
    //dann trenne sie mit einem '='. Andernfalls mit einem '<'
    if (compare[sorted[i] + sorted[i + 1]] == compare[sorted[i + 1] + sorted[i]]) {
        out += " = "
    } else {
        out += " < "
    }
}
//füge die konfliktstellen des letzten Buchstabens hinzu
add(sorted[sorted.length - 1] + " ")
out += sorted[sorted.length - 1]
add(sorted[sorted.length - 1] + "<")
//Gebe das ergebnis in die console aus
console.log(out)