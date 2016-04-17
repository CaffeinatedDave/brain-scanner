var ws;
var currentPhase = 0;
var locked = false;

var phrases = [
  "Simplicity is the ultimate sophistication",
  "Creativity has no fear of failure",
  "Beauty is the ultimate defence against complexity",
  "This world is but a canvas to our imagination",
  "Inspiration is the seed Design but the flower",
  "You cant depend on your eyes when your imagination is out of focus",
  "Every great design begins with an even better story",
  "Never make for the result make for the act of making",
  "People ignore design that ignores people",
  "ideas usually come not from writing but in the midst of living"
];

function connectSocket() {
  if ( window.location.protocol == "https:" ) {
    window.ws = new WebSocket('wss://' + window.location.host + window.location.pathname);
  } else {
    window.ws = new WebSocket('ws://' + window.location.host + window.location.pathname);
  }

  window.ws.onopen = function() {
    $('#reconnectButton').hide();
  };
  window.ws.onclose = function() {
    // reconnect? 
    setTimeout(function(){connectSocket();}, 1000); 
  };
  window.ws.onmessage = function(m) {
    processMsg(m.data);
  };
}

function processMsg(m) {
  j = JSON.parse(m);
  switch(j.message) {
    case "version":
      if (j.version != window.version) {
        window.location.reload();
      }
      break;
    case "update":
      $("#debugScore").html(j.brains);
      if (!window.locked) {
        window.locked = true;
        score = j.brains;
        phase = window.currentPhase;
        if (score >= 80 && phase == 4) {
          phase5();
        } else if (score >= 70 && phase == 3) {
          phase4();
        } else if (score >= 60 && phase == 2) {
          phase3();
        } else if (score >= 50 && phase == 1) {
          phase2();
        } else if (score >= 1 && phase == 0) {
          phase1();
        } else if (score == -1) {
          reset();
        } else {
          window.locked = false;
        }
      }
      break;
    default:
      console.log("Can't process " + j.message + " type...");
  }
}

function getLetter() {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function unlock(phase) {
  window.locked = false;
  window.currentPhase = phase;
}

function phase1() {
  $("#focus").fadeIn(3000);
  unlock(1);
}

function phase2() {
  $(".innerLetters").html("")

  for (i = 1; i <= 30; i++) {
    var html = $.parseHTML('<p><img src="img/' + (Math.floor(Math.random() * 7) + 1) + '.gif"/></p>');
    $("#inner" + i ).append(html);
  }

  var phrase = window.phrases[Math.floor(Math.random() * window.phrases.length)].toUpperCase();
  var words = phrase.split(" ");
  newLetters = [];
  
  padding = 23;

  if (words.length > 10) {
    padding = 18;
  }

  for (i = 0; i < words.length; i++) { 
    // Prepend the words with letters
    var garbage = padding + (Math.floor(Math.random() * 12) - 6)
    for (j = 0; j < garbage; j++) {
      var html = $.parseHTML('<p class="garbage">' + getLetter() + '</p>');
      newLetters.push(html);
    }

    // Add our letters... 
    for (j = 0; j < words[i].length; j++) {
      var html = $.parseHTML('<p class="phrasing">' + words[i][j] + '</p>');
      newLetters.push(html);
    }
  }

  while (newLetters.length < 330) {
    var html = $.parseHTML('<p class="garbage">' + getLetter() + '</p>');
    newLetters.push(html);
    var html = $.parseHTML('<p class="garbage">' + getLetter() + '</p>');
    newLetters.unshift(html);
  }

  var count = 0;
  for (i = 0; i < newLetters.length; i++) {
     $("#inner" + ((count % 30) + 1) ).append(newLetters[i]);
     count++; 
  }

  $("#idle, #focus").fadeOut(3000, function(){
    $("#letters").fadeIn(500);
    $(".phase0").animate({"padding-top": "250px"}, 3000);
  });
  setTimeout(function(){unlock(2)}, 8000);
}

function phase3() {
  $(".phase0").animate({"padding-top": "125px"}, 3000);
  $(".phase1").animate({"padding-top": "125px"}, 6000);
  if (window.debug) {
    setTimeout(function(){unlock(3);}, 8000);
  }
}

function phase4() {
  $(".phase0, .phase1").animate({"padding-top": "0px"}, 3000);
  $(".phase2").animate({"padding-top": "0px"}, 6000);
  setTimeout(function(){unlock(4);}, 8000);
}

function phase5() {
  $(".garbage").addClass("fadeout");
  $(".phrasing").addClass("glow");
  setTimeout(function(){unlock(5);}, 30000);
}

function reset() {
  $("#letters").fadeOut(500, function(){
    $("#idle").fadeIn(3000);
    $(".innerLetters").css({"padding-top": "400px"});
    setTimeout(function(){unlock(0);}, 4000);
  });
}
