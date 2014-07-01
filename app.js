var fs = require('fs');
var path = require('path');

var filePath = path.join(__dirname + '/poker.txt');

fs.readFile(filePath, {
  encoding: 'utf-8'
}, function(err, data) {
  if (!err) {
    play(data);
  } else {
    console.log(err);
  }
});

function player(name, hand) {
  return {
    name: name,
    hand: hand,
    cards: hand.split(" ")
  }
}

var games = [];

function play(data) {
  var deals = data.toString().split("\n");

  for (var i = 0; i < deals.length; i++) {
    var deal = deals[i];

    if (deal.length == 0)
      continue;

    var player1 = new player("player1", deal.substr(0, 14));
    var player2 = new player("player2", deal.substr(15, 14));

    var result = decide(player1,player2);

    games.push(result);
  }
}

function decide(p1,p2){
  console.log(p1.cards + "" + " : " + p2.cards+"");
}
