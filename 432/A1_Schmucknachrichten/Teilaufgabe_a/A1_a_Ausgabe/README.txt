Jede Datei enthält eine Lösung und ist so aufgebaut:

1. Zeile: Die Laufzeit des Programms

2. Zeile: Die Durchmesser der Perlen in mm

3. Zeile: Die Länge der codierten Botschaft

Die nächsten Zeilen: Die Codetabelle. Das erste Zeichen ist immer das codierte Zeichen.
		     In den eckigen Klammern steht, mit welchen Perlen in Welcher Reihenfolge das Zeichen codiert wurde.
		     Die Nummerierungen sind nullbasiert, d. h. die erste Perle hat die Nummer 0.

Hier ein Beispiel:

Runtime: 0.001s
Pearllengths in mm: 1,2,2
Messagelength in mm: 11
c: [2]
a: [1,1]
b: [1,0]
d: [0]

Für die Berechnung wurde 0.001s gebraucht. Das sind 1 ms.

In diesem Beispiel gibt es 3 verschiedene Perlenarten mit den Durchmessern 1 mm, 2 mm und 2 mm.

Die codierte Nachricht hat eine länge von 11 mm. Das sind 1,1 cm.

Es wurden 4 Zeichen codiert.

Das Zeichen "c" wurde mit der dritten Perle codiert und hat dadurch eine Länge von 2 mm.

Das Zeichen "a" wurde mit zweimal der zweiten Perle codiert und hat dadurch eine Länge von 4 mm.

Das Zeichen "b" wurde mit der zweiten und der ersten Perle codiert und hat dadurch eine Länge von 3 mm.

Das Zeichen "d" wurde mit der ersten Perle codiert und hat somit eine Länge von 1 mm.

Die Datei schmuck04.txt entspricht dem Beispiel.