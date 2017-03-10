var xmlDoc;
var scoreJSON = { tempo: 0, measures: [] };

window.onload = function() {
  xmlDoc=loadXMLDoc("drum_test.xml");
  console.log(xmlDoc);
  var part = xmlDoc.getElementsByTagName("part")[0];
  console.log(part);
  scoreJSON.tempo = xmlDoc.getElementsByTagName("sound")[0].getAttribute("tempo");
  for (var m in part.children) {
    var measure = part.children[m];
    var measureJSON;
    try {
      measureJSON = { nr: measure.getAttribute("number"), width: measure.getAttribute("width"), notes: [] };
      for (var n in measure.children) {
        var note = measure.children[n];
        if (note.tagName == "note") {
          var instrument = "";
          var duration = 0;        
          var defaultX = parseInt(note.getAttribute("default-x"));
          var defaultY = 0;
          var stemUp = false;
          if (isNaN(defaultX)) defaultX = 0;
          try {
            instrument = note.getElementsByTagName("instrument")[0].id;
          } catch (e) {}
          try {
            duration = note.getElementsByTagName("duration")[0].textContent;
          } catch (e) {}
          try {
            defaultY = parseInt(note.getElementsByTagName("stem")[0].getAttribute("default-y"));
            if (note.getElementsByTagName("stem")[0].textContent == "up") stemUp = true;
          } catch (e) {}
          measureJSON.notes[measureJSON.notes.length] = {instrument: instrument, duration: duration, x: defaultX, y: defaultY, stem: stemUp};
        }
      }
      scoreJSON.measures[scoreJSON.measures.length] = measureJSON;
    } catch (e) {}
  }
  console.log(scoreJSON);
  musicWork();
  audioEventListener();

}

function loadXMLDoc(dname) {
    if (window.XMLHttpRequest)
    {
        xhttp=new XMLHttpRequest();
    }
    else
    {
        xhttp=new ActiveXObject("Microsoft.XMLDOM");
    }

    xhttp.open("GET",dname,false);
    xhttp.send();
    return xhttp.responseXML;
}

/* ======================================= */
/*      WORKER TEST PROGRAMME              */
/* ======================================= */
var musicWorker;

function musicStart() {
  musicWorker.postMessage({
    startstop : "start"
  });
}

function musicStop() {
  musicWorker.postMessage({
    startstop : "stop"
  });
}

function musicPause() {
  musicWorker.postMessage({
    startstop : "pause"
  });
}
function musicWork() {
  musicWorker = new Worker("./javascript/worker-notes.js");

  musicWorker.postMessage({
    startstop : "notes",
    score: scoreJSON
  });

  musicWorker.onmessage = function (event) {
    //console.log(event.data);
    if (event.data.status == "playing") {
      var note = event.data.notes;
      if (note.instrument != ""){
        var audioFile = "media/notes/" + note.instrument.toLowerCase() + ".m4a";
        audio = new Audio(audioFile);
        audio.play();
      } 
    } else if (event.data.status == "update") {
      $("#divNotes .imgNotes").remove();
      updateNotes(event.data.upper, 0);
      updateNotes(event.data.lower, 220);
    } else if (event.data.status == "cursor") {
      $('#cursor').css("left",50+event.data.position * 50 + "px");
    }
  }
}

function updateNotes(measure, offset) {
  var position = 2;
  for (var i=0 ; i<measure.notes.length; i++) {
    var img = document.createElement("img");
    img.setAttribute("class", "imgNotes");
    img.setAttribute("id", "notes" + (i));
    if (measure.notes[i].stem) {
      img.style.top = (offset + 58 - measure.notes[i].y*2.5) + "px"; 
    } else {
      img.style.top = (offset + 58-100-81 - measure.notes[i].y*2.5) + "px"; 
    }
    img.style.left = position*50 + "px";
    img.style.height = "96px";
    position += parseInt(measure.notes[i].duration);
    switch (measure.notes[i].duration) {
      case "1" :
        img.setAttribute("src", "media/note_large_one_eighth.png");
        break;
      case "2" :
        img.setAttribute("src", "media/note_large_one_quarter.png");
        break;
      case "4" :
        img.setAttribute("src", "media/note_large_one_half.png");
        break;
      case "8" :
        img.setAttribute("src", "media/note_large_one_one.png");
    }
    $("#divNotes").append(img);
  }
}

/* ======================================= */
/*      WORKER TEST PROGRAMME              */
/* ======================================= */
var worker = new Array();
function doWork(nr) {
  var r = $('#rythm').val();
  r = (1000 * 60) / r;
  console.log("r=" + r);
  worker[nr] = new Worker("./javascript/worker-demo.js");

  var b = parseInt(r * 4 / $('#beat' + nr).val());
  worker[nr].postMessage({
    startstop : "start",
    beat: b,
    instrument: nr
  });

  worker[nr].onmessage = function (event) {
    var volume = $('#rngBeat' + nr).val() / 100.0;
    var audio
    if (event.data.instrument == 1) audio = new Audio('media/drum_kick_02.wav');
    else audio = new Audio('media/drum_cymbal_02.wav');
    audio.volume = volume;
    audio.play();
  }

}

function stopWork(nr) {
  worker[nr].postMessage({
    startstop : "stop",
  });
}

function changeWork(nr) {
  var b = $('#beat' + nr).val();

  worker[nr].postMessage({
    startstop : "reset",
    beat: b
  });
}


/* ======================================= */
/*      AUDIO CONTROLS                     */
/* ======================================= */
function playAudio() {
  var audio = document.getElementById("audio-player");
  if (audio.paused) {
    audio.play();
    document.getElementById("sound_img").src = "media/control_pause.png";
  } else {
    audio.pause();
    document.getElementById("sound_img").src = "media/control_play.png";
  }
}

function audioSpeedChange(change) {
  document.getElementById('audio-player').playbackRate += change;
  document.getElementById('lbl_speed').textContent = document.getElementById('audio-player').playbackRate;
}

function audioEventListener() {
  var audio = document.getElementById('audio-player');
  audio.addEventListener('timeupdate',function(){
    var currentTime_sec = Math.floor(audio.currentTime);
    var currentTime_msec = Math.floor((audio.currentTime-currentTime_sec)*1000);
    document.getElementById('lbl_time').textContent = currentTime_sec + "s  " + currentTime_msec;
  },false);
}

function audioSetTime() {
  var newTime = document.getElementById('in_setTime').value;
  var audio = document.getElementById('audio-player');
  audio.currentTime = newTime;
}

