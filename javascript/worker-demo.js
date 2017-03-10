var myVar;
var myBeat = 100;
var counter = 0;
var myInstrument = 1;

self.onmessage = function(event) {
  console.log(event.data);
  myBeat = event.data.beat;
  myInstrument = event.data.instrument;

  switch(event.data.startstop) {
    case "start" :
      console.log("Starting Interval");
      myVar = setInterval(myTimer ,myBeat);
      break;
    case "stop" :
      console.log("Stopping Interval");
      clearInterval(myVar);
      break;
    default:
        clearInterval(myVar);
        myVar = setInterval(myTimer ,myBeat);
  }
};

function myTimer() {
    this.postMessage({ instrument: myInstrument});
}