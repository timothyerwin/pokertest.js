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

var lookup = {
  values: {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "T": 10,
    "J": 11,
    "Q": 12,
    "K": 13,
    "A": 14
  },
  suits: ["D", "H", "S", "C"]
};

function Hand(hand) {
  var self = this;

  //hand = "5D 4D 6D 7D 8D";

  self.hand = hand;
  self.cards = hand.split(" ");

  self.hasValues = function(combo) {

  };

  self.getValues = function() {
    var c = self.cards;

    return c[0][0] + c[1][0] + c[2][0] + c[3][0] + c[4][0];
  };

  self.getSuits = function() {
    var c = self.cards;

    return c[0][1] + c[1][1] + c[2][1] + c[3][1] + c[4][1];
  };

  self.isFlush = function() {
    var suits = lookup.suits;

    for (var i = 0; i < suits.length; i++) {
      var s = suits[i];
      
      var match = self.getSuits() === Array(6).join(s);

      if (match) return true;
    }

    return false;
  };

  return self;
}

function Player(name, hand) {
  return {
    name: name,
    hand: new Hand(hand)
  };
}

var games = [];

function play(data) {
  var deals = data.toString().split("\n");

  for (var i = 0; i < deals.length; i++) {
    var deal = deals[i];

    if (deal.length === 0)
      continue;

    var player1 = new Player("player1", deal.substr(0, 14));
    var player2 = new Player("player2", deal.substr(15, 14));

    var result = decide(player1, player2);

    games.push(result);
  }
}

function decide(p1, p2) {
  console.log(p1.hand.getSuits() + " : " + p2.hand.getValues());
}
