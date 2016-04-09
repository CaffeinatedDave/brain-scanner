var ws;

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
    case "50":
      start();
      break;
    case "60":
      phase1();
      break;
    case "70":
      phase2();
      break;
    case "80":
      phase3();
      break;
    case "0":
      reset();
      break;
    default:
      console.log("Can't process " + j.message + " type...");
  }
}

function getLetter() {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function start() {
  var phrase = "THIS IS A MESSAGE THAT YOU CAN DECIDE ON LATER";

  var words = phrase.split(" ");
  var count = 0;
  $(".innerLetters").html("")

  for (i = 0; i < words.length; i++) { 
    // Prepend the words with letters
    var garbage = 20 + (Math.floor(Math.random() * 12) - 6)
    for (j = 0; j < garbage; j++) {
      var html = $.parseHTML('<p class="garbage">' + getLetter() + '</p>');
      $("#inner" + ((count % 24) + 1) ).append(html);
      count++;
    }

    // Add our letters... 
    for (j = 0; j < words[i].length; j++) {
      var html = $.parseHTML('<p class="phrasing">' + words[i][j] + '</p>');
      $("#inner" + ((count % 24) + 1) ).append(html);
      count++;
    }
  }

  while (count < 252) {
    var html = $.parseHTML('<p class="garbage">' + getLetter() + '</p>');
    $("#inner" + ((count % 24) + 1) ).append(html);
    count++;
  }

  $("#debug").hide();
  $("#idle").fadeOut(3000, function(){
    $("#letters").fadeIn(500);
    $(".phase0").animate({"padding-top": "250px"}, 3000);
  });
  setTimeout(function(){phase1();}, 10000);
}

function phase1() {
  $(".phase0").animate({"padding-top": "125px"}, 3000);
  $(".phase1").animate({"padding-top": "125px"}, 6000);
  setTimeout(function(){phase2();}, 8000);
}

function phase2() {
  $(".phase0").animate({"padding-top": "0px"}, 3000);
  $(".phase1").animate({"padding-top": "0px"}, 6000);
  $(".phase2").animate({"padding-top": "0px"}, 9000);
  setTimeout(function(){phase3();}, 10000);
}

function phase3() {
  $(".garbage").addClass("fadeout");
  $(".phrasing").addClass("glow");
  setTimeout(function(){reset();}, 30000);
}

function reset() {
  $("#letters").fadeOut(500, function(){
    $("#idle").fadeIn(3000);
    $(".innerLetters").css({"padding-top": "400px"});
    $("#debug").show();
  });
  
}
