#Bibliotheken für das Dialogfeld
import tkinter as tk
import re

def main():
    #definiere die buchtsaben, die gezählt werden sollen
    letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "ä", "ö", "ü", "ß"]
    #öffne das Dialogfeld auf halber Bildschirmgröße
    window = tk.Tk()
    window.title("A1")
    width = window.winfo_screenwidth() >> 1
    height = window.winfo_screenheight() >> 1
    window.geometry("%dx%d" % (width, height))
    #Füge ein Textfeld hinzu
    inputfield = tk.Text(window, font=("Arial", 15, ""))
    inputfield.pack(expand=True, fill=tk.BOTH)
    #funktion um den Text zu markieren
    def analyse(event):
        #setze den Text zurück
        inputfield.edit_modified(False)
        for tag in inputfield.tag_names():
            inputfield.tag_delete(tag)
        #deklariere die Farben, die die Buchstaben haben sollen
        inputfield.tag_config("playerOne", foreground="#e30613")
        inputfield.tag_config("playerTwo", foreground="#009ee4")
        inputfield.tag_config("colision", background="red")
        #Standartisiere die Eingabe auf nur Kleinbuchstaben
        text = inputfield.get("1.0", "end-1c")
        text = text.lower()
        textLetters = re.sub(r"[^a-zA-Zäöüß]", "", text)
        #Setze die Positionen der Spieler auf ihre jeweiligen Startfelder
        playerOnePositions = [0]
        playerTwoPositions = [1]
        #Merke dir jede Position, bei der der erste Spieler vorbeikommt
        i = 0
        while i < len(textLetters):
            i += letters.index(textLetters[i]) + 1
            playerOnePositions.append(i)
        #Merke dir jede Position, bei der der zweite Spieler vorbeikommt
        i = 1
        while i < len(textLetters):
            i += letters.index(textLetters[i]) + 1
            playerTwoPositions.append(i)
        #gehe an den anfang des Texts
        letterIndex = 0
        letter = 0
        line = 1
        #für jeden Buchstaben
        for i in range(len(text)):
            #Falls dieser für die Färbung relevant ist
            if text[i] in letters:
                #falls beide Spieler auf derselben Position landen, dann hinterlege diese Rot
                if letterIndex in playerTwoPositions and letterIndex in playerOnePositions:
                    inputfield.tag_add("colision", f"{line}.{letter}", f"{line}.{letter+1}")
                #Wenn nur Spieler eins drauf landet, färbe es Rot
                elif letterIndex in playerOnePositions:
                    inputfield.tag_add("playerOne", f"{line}.{letter}", f"{line}.{letter+1}")
                #Wenn nur Spieler zwei drauf landet, färbe es Blau
                elif letterIndex in playerTwoPositions:
                    inputfield.tag_add("playerTwo", f"{line}.{letter}", f"{line}.{letter+1}")
                #Ein weiterer Buchstabe wurde gefärbt
                letterIndex += 1
            #Die zu überprüfende stelle ist jetzt eins weiter. Entweder in der nächsten Stelle oder Zeile
            if text[i] != "\n":
                letter += 1
            if text[i] == "\n":
                letter = 0
                line += 1
    #Bei änderung des Texts bemale es neu
    inputfield.bind("<<Modified>>", analyse)
    window.mainloop()
#Führe den gesamten code aus
if __name__ == "__main__":
    main()