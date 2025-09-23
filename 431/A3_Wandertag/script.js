const c = document.getElementById("myCanvas")
const ctx = c.getContext("2d")
c.height = window.innerHeight*0.9
c.width = window.innerWidth*0.9
//Lese Eingabe aus
let input = (prompt("Wandertag")|| "0").split(/[\s\n]+/)
let vals = []
//Wandle String in Zahlen um und filtere ungültige Zahlen raus
for(let i = 0;i<input.length;i++){
 let maybe = Number(input[i])|| 0
 if(maybe.toString() == input[i]){
  vals.push(maybe)
 }
}
//Wenn die Eingabe keine Teilnehmer enthielt, stoppe das Programm
if(!(vals.length>2&&(vals.length-1)%2 == 0)){
 throw new Error("Ungültige Eingabe")
}
const size = (vals.length-1)>>2
//klasse für alle mindest oder maximallängen aller Personen
class point {
 constructor(pos,person){
  this.pos = pos
  this.person = person
 }
}
let score = 0
//klasse einer person
class person{
 constructor(line){
  this.start = Number(line[0]<line[1]?line[0]:line[1])
  this.stop = Number(line[0]<line[1]?line[1]:line[0])
  this.count = 0
  this.lines = Array(3).fill(false)
 }
 //funktion um die Teilnahme eines Teilnehmers potentiell zu ändern
 change(path){
  this.lines[path] = !this.lines[path]
  const dif = (this.lines[path]<<1)-1
  this.count += dif
  if(this.lines[path] == this.count){
   score += dif
  }
 }
}
//klasse mit allen punkten der position
class batch{
 constructor(pos){
 this.pos = pos
 this.persons = []
 this.bigger = []
 this.smaller = []
 this.neither = []
 }
 iter(list,path){
  for(let i = 0;i<list.length;i++){
   list[i].change(path)
  }
 }
 //funktion um alle zu ändern
 all(path){
  this.iter(this.persons,path)
 }
 //funktion wenn diese position nur überflogen wird
 pass(path){
  this.iter(this.bigger,path)
  this.iter(this.smaller,path)
 }
 //funktion falls diese position in richtung einer größeren verlassen wird
 next(path){
  this.iter(this.smaller,path)
  this.iter(this.neither,path)
 }
 //funktion falls diese position in richtung einer kleineren verlassen wird
 before(path){
  this.iter(this.bigger,path)
  this.iter(this.neither,path)
 }
}
let points= []
let persons = []
//Formatiere die Werte als personen
while(vals.length>1){
 let line = vals.splice(-2,2)
 let ref = new person(line)
 persons.push(ref)
 points.push(new point(Number(line[0]),ref))
 points.push(new point(Number(line[1]),ref))
}
//sortiere die punkte und gruppiere sie
points.sort((a,b)=>a.pos-b.pos)
let startPos = points[0].pos
let batches = [new batch(startPos)]
for(let i = 0;i<points.length;i++){
 if(startPos != points[i].pos){
  startPos = points[i].pos
  batches.push(new batch(startPos))
 }
 batches[batches.length-1].persons.push(points[i].person)
}
//funktion um die anzahl der gruppen zu minimieren
function minimize(a,b,cond,attr){
 for(let i = 0;i<batches.length-1;i++){
  let equal = true
  for(let j = 0;j<batches[i+b].persons.length;j++){
   if(cond(attr(batches[i+b].persons[j]),batches[i+a].pos)){
    equal = false
   }
  }
  if(equal){
   batches[i+a].persons.push(...batches[i+b].persons)
   batches.splice(i+b,1)
   i-=b
  }
 }
}
//wenn die nächstkleinere position eine Teilmenge der eigenen an Teilnehmer ist,
//werden alle personen referenzen kopiert und die kleinere position gelöscht
minimize(1,0,(a,b)=>a<b,a=>a.stop)
//wenn die nächstgrößere position eine Teilmenge der eigenen an Teilnehmer ist,
//werden alle personen referenzen kopiert und die größere position gelöscht
minimize(0,1,(a,b)=>a>b,a=>a.start)
//Merke dir welche Teilnehmer nicht mehr Teilnehmen wenn ich von x nach 0 springe
let jumps = Array(batches.length)
let notStart = batches[0].pos
for(let i = 0;i<batches.length;i++){
 jumps[i] = []
 let pos = batches[i].pos
 for(let j = 0;j<persons.length;j++){
  let start = persons[j].start
  let stop = persons[j].stop
  if((start<=pos&&pos<=stop&&start>notStart)||(start<=notStart&&stop<pos)){
   jumps[i].push(persons[j])
  }
 }
}
//Lösche alle duplikate die es an Personen referenzen in den gruppen gibt
for(let i = 0;i<batches.length;i++){
 batches[i].persons = [...new Set(batches[i].persons)]
}
//Kategorisiere alle personen in einer gruppe
for(let i = 0;i<batches.length-1;i++){
 for(let j = 0;j<batches[i].persons.length;j++){
  if(batches[i].persons[j].stop>=batches[i+1].pos){
   //alle die auch bei größeren positionen laufen
   batches[i].bigger.push(batches[i].persons[j])
  }else{
   //alle die nur bei dieser position laufen
   batches[i].neither.push(batches[i].persons[j])
  }
 }
}
batches[batches.length-1].neither = [...batches[batches.length-1].persons]
for(let i = batches.length-1;i>0;i--){
 for(let j = 0;j<batches[i].neither.length;j++){
  if(batches[i].neither[j].start<=batches[i-1].pos){
   //alle die bei einer kleineren position laufen
   batches[i].smaller.push(batches[i].neither[j])
   batches[i].neither.splice(j,1)
   j -= 1
  }
 }
}
//klasse für jede organisierte strecke
class path{
 constructor(id){
  this.batchPos = 0
  this.id = id
  this.moveTo  = pos => this.move(pos-this.batchPos)
  batches[0].all(this.id)
 }
 //funktion um zur position 0 zu springen
 jump(){
  for(let i = 0;i<jumps[this.batchPos].length;i++){
   jumps[this.batchPos][i].change(this.id)
  }
  this.batchPos = 0
 }
 //funktion um sich um eine bestimmte distanz zu bewegen
 move(dis){
  let newPos = this.batchPos+dis
  if(dis>0){
   batches[this.batchPos].next(this.id)
   for(let i = 1;i<dis;i++){
    batches[this.batchPos+i].pass(this.id)
   }
   batches[newPos].before(this.id)
  }else if(dis<0){
   batches[this.batchPos].before(this.id)
   for(let i = -1;i>dis;i--){
    batches[this.batchPos+i].pass(this.id)
   }
   batches[newPos].next(this.id)
  }
  this.batchPos = newPos
 }
 //funktion um sich um eins vorwärts zu bewegen
 step(){
  batches[this.batchPos].next(this.id)
  this.batchPos++
  batches[this.batchPos].before(this.id)
 }
}
let paths = [new path(0),new path(1),new path(2)]
let highscore = score
let bestConfig = [0,0,0]
//Probiere alle streckenkombinationen durch
for(let i = 0;i<batches.length-1;i++){
 paths[0].step()
 paths[1].jump()
 for(let j = 0;j<=i;j++){
  paths[2].jump()
  for(let l = 0;l<=j;l++){
   //merke dir die beste kombination
   if(highscore<score){
    highscore = score
    bestConfig = [i+1,j,l]
   }
   paths[2].step()
  }
  paths[1].step()
 }
}
//Formatiere das ergtebnis
let out = highscore + " Teilnehmer"
for(let i = 0;i<3;i++){
 bestConfig[i] = batches[bestConfig[i]].pos
 out += "\n"+bestConfig[i] + "m"
}
//gebe die lösung in die console aus
console.log(out)
let max = 0
//funktion um ein Säulendiagramm anhand einer liste zu malen
function draw(list,r,g,b){
 for(let i = 0;i<list.length;i++){
  max = Math.max(max,list[i])
 }
 mulx = c.width/list.length
 muly = c.height/max
 for(let i = 0;i<list.length;i++){
  ctx.fillStyle = `rgb(${255*r} ${255*g} ${255*b})`
  ctx.fillRect(mulx*i,c.height-list[i]*muly,mulx,list[i]*muly)
 }
}
let total = Array(points[points.length-1].pos+1)
let pathSum = [...total]
let last = 0
let pathLast = [0,0,0]
let pointPos = 0
let pathPointPos = [0,0,0]
//setze die Daten der personen zurück
for(let i = 0;i<persons.length;i++){
 persons[i].count = 0
 persons[i].lines = Array(3).fill(false)
}
//Für jede mögliche position
for(let i = 0;i<total.length;i++){
 //kopiere die werte der letzten position
 total[i] = last
 pathSum[i] = [...pathLast]
 //für alle verlassenen Teilnehmer
 for(let j = pointPos-1;j>-1&&points[j].pos==i-1;j--){
  let chosen = points[j].person
  //reduziere sie vom ergebnis
  if(chosen.stop == i-1&&chosen.count == 1){
   total[i]--
   chosen.count--
   for(let l = 0;l<3;l++){
    if(chosen.lines[l]){
     chosen.lines[l] = false
     pathSum[i][l]--
    }
   }
  }
 }
 //für alle neuen Teilnehmer
 for(;pointPos<points.length&&points[pointPos].pos==i;pointPos++){
  let chosen = points[pointPos].person
  //füge sie zum ergebnis zu
  if(chosen.start == i&&chosen.count == 0){
   total[i]++
   chosen.count++
   let tick = false
   for(let j = 0;j<3;j++){
    if(((chosen.start<=bestConfig[j]&&bestConfig[j]<=chosen.stop)||tick)&&!chosen.lines[j]){
     chosen.lines[j] = true
     pathSum[i][j]++
     tick =true
    }
   }
  }
 }
 pathLast = pathSum[i]
 last = total[i]
}
//male das Diagramm für alle positionen
draw(total,0,0,0)
//male die Diagramme für die einzelnen Strecken über das gesammtdiagramm
pathTotal = [[],[],[]]
for(let i = 0;i<pathSum.length;i++){
 pathTotal[0][i] = pathSum[i][0]
 pathTotal[1][i] = pathSum[i][1]
 pathTotal[2][i] = pathSum[i][2]
}
draw(pathTotal[2],1,0,0)
draw(pathTotal[1],0,1,0)
draw(pathTotal[0],0,0,1)