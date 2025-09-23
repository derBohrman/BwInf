Jede Datei enthält eine Lösung und ist so aufgebaut:

1. Zeile: die größe der BFS-Limitierung

2. Zeile: Anzahl an Anweisungen

nächsten Zeilen: die Anweisungsfolge

letzten Zeilen: Visualisierungen der Labyrinthe

Hier ein Beispiel:

Runtime: 0s
BFS bound: 1
Instructions: 9
Sequence of instructions:
1: ↓, 2: →, 3: ↓, 4: →, 5: ↑, 6: ↑, 7: →, 8: ↓, 9: ↓
Labyrinths:
╭───┬───────╮
│ ↓ │ →   ↓ │
│   │   ╷   │
│ ↓ │ ↑ │ ↓ │
│   ╵   │   │
│ →   ↑ │   │
╰───────┴───╯
╭───┬───────╮
│ ↓ │ →   ↓ │
│   ╵   ╷   │
│ →   ↑ │ ↓ │
├───────╯   │
│ O         │
╰───────────╯

Für die Berechnung wurde 0.001s gebraucht. Das sind 1 ms.

Es wurde immer nur eine Position pro Distanz geprüft.

Die Awneisungsfolge besteht aus 9 Anweisungen.

Die Anweisungen sind: ↓→↓→↑↑→↓↓

Die Datei labyrinthe0.txt entspricht dem Beispiel.