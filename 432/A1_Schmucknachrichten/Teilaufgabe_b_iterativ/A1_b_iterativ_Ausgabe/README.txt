Jede Datei enthält eine Lösung und ist so aufgebaut:

1. Zeile: Die Laufzeit des Programms

2. Zeile: Die Durchmesser der Perlen in mm

3. Zeile: Die Länge der codierten Botschaft

4. Zeile: Die Anzahl an Codewörtern je Codewortlänge

Die nächsten Zeilen: Die Codetabelle. Das erste Zeichen ist immer das codierte Zeichen.
		     In den eckigen Klammern steht, mit welchen Perlen in Welcher Reihenfolge das Zeichen codiert wurde.
		     Die Nummerierungen sind nullbasiert, d. h. die erste Perle hat die Nummer 0.

Hier ein Beispiel:

Runtime: 0.001s
Pearllengths in mm: 1,2,2
Messagelength in mm: 11
d: [0,0]
a: [2]
b: [1]
c: [0,2]

Für die Berechnung wurde 0.001s gebraucht. Das sind 1 ms.

Die codierte Nachricht hat eine länge von 11 mm. Das sind 1,1 cm.

Es gibt drei Codewörter der Länge 2 mm und eines der Länge 3 mm

Es wurden 4 Zeichen codiert.

Das Zeichen "d" wurde mit zweimal der ersten Perle codiert und hat dadurch eine Länge von 2 mm.

Das Zeichen "a" wurde mit der dritten Perle codiert und hat dadurch eine Länge von 2 mm.

Das Zeichen "b" wurde mit der zweiten Perle codiert und hat dadurch eine Länge von 2 mm.

Das Zeichen "c" wurde mit der ersten und dritten Perle codiert und hat somit eine Länge von 3 mm.

Die Datei schmuck12.txt entspricht dem Beispiel.