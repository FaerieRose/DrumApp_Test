var myScore;
var measureCount = 0;
var measureNr = 1;
var myVar;
var myTempo = 125;

self.onmessage = function(event) {
  console.log(event.data);

  switch(event.data.startstop) {
    case "notes" : 
      myScore = event.data.score;
      myTempo = (1000 * 60) / (2 * parseInt(event.data.score.tempo));
      console.log(myScore);
      this.postMessage({ status: "received"});
      this.postMessage({ status: "started"});
      updateScreen(myScore.measures[0], myScore.measures[1]);
      break;
    case "start" :
      myVar = setInterval(playScore ,myTempo);
      break;
    case "pause" :
      clearInterval(myVar);
      break;
    case "stop" :
      measureCount = 0;
      measureNr = 1;
      updateScreen(myScore.measures[0], myScore.measures[1]);
      this.postMessage({ status: "cursor", position: measureNr });
      clearInterval(myVar);
      break;
    default:
      clearInterval(myVar);
      myVar = setInterval(myTimer ,myTempo);
  }
};

function myTimer() {
  this.postMessage({ instrument: "myInstrument"});
}

function playScore() {
  this.postMessage({ status: "cursor", position: measureNr });
  for (var i=0 ; i<myScore.measures[measureCount].notes.length ; i++ ) {
    if (measureNr - sumNotes(myScore.measures[measureCount].notes, i) == 0) {
      this.postMessage({ status: "playing", notes: myScore.measures[measureCount].notes[i] });
    }

  }
  measureNr++;
  if (measureNr > 8) {
    measureNr = 1;
    measureCount++;
    if (measureCount < myScore.measures.length - 2) {
      updateScreen(myScore.measures[measureCount], myScore.measures[measureCount+1]);
    }
    if (measureCount == myScore.measures.length) {
      this.postMessage({ status: "finished"});
      clearInterval(myVar);
    }
  }
}

function sumNotes(notes, pos) {
  var total = 1;
  for (var i=0 ; i<pos ; i++) {
    total += parseInt(notes[i].duration);
  }
  return total;
}

function updateScreen(measureUpper, measureLower) {
    this.postMessage({ status: "update", upper: measureUpper, lower: measureLower});
}