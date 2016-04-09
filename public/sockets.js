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

function reconnectActions() {
  $('.steal').unbind();
  $('.build').unbind();

  $('.steal').click(function() { 
    type = $(this).data('type');
    
    steal = parseInt($('#stealAmount').val());
    if (isNaN(steal)) {
      steal = 100;
    }

    if (camp.resource[type] === undefined) {
      space = 100;
    } else {
      space = camp.resource[type].max - camp.resource[type].amount;
    }

    if (space < steal) {
      steal = space;
    }

    window.ws.send(JSON.stringify({
      action: "steal",
      amount: steal,
      type:   type
    }));
    return false;
  });

  $('.build').click(function() {
    type = $(this).data('type');
    
    cost = server["shop"][type].cost;

    canBuild = true;
    totalcost = {};
    // First pass - check we can afford it... We'll trust the client for now...
    for (var key in cost) {
      if (camp.resource[key].amount < cost[key]) {
        canBuild = false;
      }
    }

    // Second pass - do it!
    if (canBuild) {
      for (var key in cost) {
        camp.resource[key].amount -= parseInt(cost[key]);
      }
      window.ws.send(JSON.stringify({
        action:  "build",
        name:    type,
        message: ""
      }));
    } else {
      addChat({who: "Game", msg: "Not enough local resources"});
    }
  });
}

function setupCamp() {
  camp["resource"] = {};
  camp["resource"]["wood"] = {max: 50000, amount: 0, shown: false};
  camp["buildings"] = {};

  server["resource"] = {};
}


function showMsg(m) {
  j = JSON.parse(m);
  switch(j.message) {
    case "update":
      updateServer(j);
      break;
    case "award":
      updateLocal(j);
      break;
    case "chat":
      addChat(j);
      break;
    default:
      console.log("Can't process " + j.message + " type...");
  }
}

function addChat(j) {
  text = "<p>" + $('<div/>').text(j.who + ": " + j.msg).html() + "</p>";        
  game.messages.unshift(text);
  game.messages = game.messages.slice(0,9);
  
  content = game.messages.slice(0, 9); 
 
  $('#msgs').html(content);
}

function updateServer(j) {
  users = j.usercount;
  $('#userCount').html(users);


  server["resource"] = {};
  for (var key in j.resource) {
    max = j.resource[key].max;
    amount = j.resource[key].amount;
    server["resource"][key] = {name: key, max: parseInt(max), amount: parseInt(amount)};
  }

  server["users"] = [];
  for (var key in j.users) {
    server["users"].push({name: j.users[key].name, donated: j.users[key].donated, stolen: j.users[key].stolen});
  }
  server["users"].sort(function(a, b) {
    if (a.stolen == 0 && b.stolen == 0) {
      return b.donated - a.donated;
    } else if (a.donated == 0 && b.donated == 0) {
      return a.stolen - b.stolen;
    } else if (a.donated == 0) {
      return -1;
    } else if (b.donated == 0) {
      return 1;
    } else {
      return (a.donated / a.stolen) - (b.donated / b.stolen);
    }
  });

  server["shop"] = [];
  for (var key in j.shop) {
    server["shop"][key] = {name: key, cost: j.shop[key]["cost"]};
  }
  
  redrawCamp();
}

function updateLocal(j) {
  if (camp.resource[j.type] === undefined) {
    camp.resource[j.type] = {max: 50000, amount: 0, shown: false};
  }
  camp.resource[j.type].shown = true;
  camp.resource[j.type].amount += parseInt(j.amount);
  if (camp.resource[j.type].amount > camp.resource[j.type].max) {
    camp.resource[j.type].amount = camp.resource[j.type].max;
  }

  redrawCamp();
}

function redrawCamp() {
  for (var key in server["resource"]) {
    r = server["resource"][key]
    if ($('#'+key+"ServerContainer").length == 0) {
      html =  '<div id="'+key+'ServerContainer">';
      html += '  <div class="progress col-sm-8">';
      html += '    <div id="'+key+'ServerBar" class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">';
      html += '      <div>'+key+'</div>';
      html += '    </div>';
      html += '  </div>';
      html += '  <div class="col-sm-4">';
      html += '    <p><span id="'+key+'ServerText"></span>';
      html += '    <button id="'+key+'Steal" type="button" class="btn btn-danger steal" data-type="'+key+'">Steal</button>';
      html += '    </p>';
      html += '  </div>';
      html += '  <div style="clear: both;"></div>';
      html += '</div>';

      $('#server').append(html);
    }

    current = r.amount;
    total = r.max;

    if (r.max == 0) {
      $('#'+key+'ServerContainer').hide();
    } else {
      $('#'+key+'ServerContainer').show();
    }

    $('#'+key+"ServerBar").attr('aria-valuenow', current);
    $('#'+key+"ServerBar").attr('aria-valuemax', total);
      
    $('#'+key+"ServerBar").css('width', (current * 100/total)+'%');
    $('#'+key+"ServerText").html(current + " / " + total);
  }


  for (var key in camp["resource"]) {
    r = camp["resource"][key]
    if (r.shown) {

      if ($('#'+key+"Container").length == 0) {
        html =  '<div id="'+key+'Container">';
