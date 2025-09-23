Jede Datei ist so aufgebaut:

- 1. Zeile: 3 ganze positive Zahlen n, m und k.
	n: Anzahl der Klausuren.
	m: Gesamtanzahl an Aufgaben.
	k: Anzahl an Aufgaben für welche eine gute Anordnung gefunden werden soll.
- Folgende n Zeilen: Abstufungen der alten Klausuren. Jede Zeile beschreibt eine Klausur und hat die Form a_1 < a_2 < ..., wobei jedes a_i eine Aufgabe beschreibt. Eine Klausur hat mindestens 2 und maximal m Aufgaben.
- Die Aufgaben werden durch die ersten m Buchstaben des Alphabets von A, B, ... bezeichnet.
- Die letzte Zeile enthält die k Aufgaben, für die eine gute Anordnung gefunden werden soll.

Die Datei schwierigkeiten0.txt entspricht dem Beispiel aus der Aufgabenstellung.

Hier eine Bespieleingabe:

2 5 3
B < A < D < E
C < D < E
A E C

In diesem Beispiel gibt es zwei alte Klausuren mit fünf verschiedenen Aufgaben: A, B, C, D und E. Es soll für drei der Aufgaben eine neue Anordnung gefunden werden. In der 2. Zeile steht die Schwierigkeitsabstufung der ersten Altklausur. B ist leichter als A ist leichter als D ist leichter als E. In der 3. Zeile die Abstufung der 2. Altklausur. Hier ist C leichter als D und D leichter als E. Die letzte Zeile gibt an, dass für die Aufgaben A, E und C eine neue Anordnung gefunden werden soll.