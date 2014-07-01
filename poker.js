var fs = require('fs');

var poker = {};

module.exports = poker;

poker.deal = function(deal){
  this.player1 = deal.substr(0, 14);
  this.player2 = deal.substr(15, 14);
};

poker.file = function(file){
  this.file = file;
  this.data = fs.readFileSync(file, {
    encoding: 'utf-8'
  });

  this.deals = [];

  var dealdata = this.data.toString().split("\n");

  for (var i = 0; i < dealdata.length; i++) {
    var deal = dealdata[i];

    if (deal.length === 0)
      continue;

    this.deals.push(new poker.deal(deal));
  }
};

poker.tournament = function( ) {
  this.games = [];
};

poker.tournament.prototype.play = function(deals, next) {
  if(!deals)
    return;

  for (var i = 0; i < deals.length; i++) {
    var deal = deals[i];

    if(!(deal instanceof poker.deal))
      throw "deals must be of type poker.deal";

    game = new poker.game(deal);

    var result = game.play();

    this.games.push(result);
  }

  if(next) next();
};

poker.player = function(name, hand) {
  return {
    name: name,
    hand: new poker.hand(hand)
  };
};

poker.lookup = {
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

poker.hand = function(hand) {
  var self = this;

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
};

poker.game = function(deal) {
  if(!(deal instanceof poker.deal))
    throw "deal must be of type poker.deal";

  this.player1 = new poker.player("player1", deal.player1);
  this.player2 = new poker.player("player2", deal.player2);
};

poker.game.prototype.play = function() {
  console.log(this.player1.hand.getSuits() + " : " + this.player2.hand.getValues());

  return this.player1;
};
