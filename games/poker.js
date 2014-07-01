var fs = require('fs');

var poker = {};

module.exports = poker;

poker.deal = function(deal) {
  this.hands = [];

  for (var i = 0; i < deal.replace(/ /g, "").trim().length / 10; i++) {
    this.hands.push(new poker.hand(deal.substr(i * 15, 14)));
  }
};

poker.file = function(file) {
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

poker.tournament = function() {
  this.games = [];
};

poker.tournament.prototype.play = function(deals, next) {
  if (!deals)
    return;

  for (var i = 0; i < deals.length; i++) {
    var deal = deals[i];

    if (!(deal instanceof poker.deal))
      throw "deals must be of type poker.deal";

    game = new poker.game(deal);

    var result = game.play();

    this.games.push(result);
  }

  if (next) next();
};

poker.player = function(name, hand) {
  return {
    name: name,
    hand: ((hand instanceof poker.hand) ? hand : new poker.hand(hand))
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

  if (!hand)
    throw ("invalid hand");

  self.hand = hand;
  self.cards = hand.split(" ");

  if (self.cards.length != 5)
    throw ("insufficient cards for a hand");
};

poker.hand.prototype.hasValues = function(combo) {

};

poker.hand.prototype.sortValues = function(desc) {
  var values = this.getValues();

  var numeric = values.replace(/\D/g, '').split('').sort().join('');
  var alpha = values.replace(/[0-9]/g, '').split('').sort(function(a, b) {
    a = poker.lookup.values[a];
    b = poker.lookup.values[b];

    return a - b;

  }).join('');

  var sorted = numeric + alpha;

  return desc ? sorted.split('').reverse().join('') : sorted;
};

poker.hand.prototype.getValues = function() {
  var c = this.cards;

  return c[0][0] + c[1][0] + c[2][0] + c[3][0] + c[4][0];
};

poker.hand.prototype.getSuits = function() {
  var c = this.cards;

  return c[0][1] + c[1][1] + c[2][1] + c[3][1] + c[4][1];
};

poker.hand.prototype.isFlush = function() {
  var suits = lookup.suits;

  for (var i = 0; i < suits.length; i++) {
    var s = suits[i];

    var match = this.getSuits() === Array(6).join(s);

    if (match) return true;
  }

  return false;
};

poker.game = function(deal) {
  if (!(deal instanceof poker.deal))
    throw "deal must be of type poker.deal";

  if (deal.hands.length < 2)
    throw "insufficient hands";

  this.players = [];

  for (var i = 0; i < deal.hands.length; i++) {
    this.players.push(new poker.player("player " + i.toString(), deal.hands[i]));
  }
};

poker.game.prototype.play = function() {

  var scores = [];

  for (var i = 0; i < this.players.length; i++) {
    var player = this.players[i];

    var score = this.rank(player);

    scores.push(score);

    console.log(player.hand.sortValues());
  }
};

poker.game.prototype.rank = function(player) {
  var rank = null;

  for (var i = 0; i < poker.rankers.length; i++) {
    var ranker = poker.rankers[i];

    var scores = ranker.execute(player.hand);

    rank = new poker.rank(player, ranker.type, scores);
  }

  return rank;
};

poker.rank = function(player, type, scores) {
  this.type = type;
  this.player = player;
  this.scores = scores;
};

poker.ranker = function(type, f) {
  this.type = type;
  this.execute = f;
};

poker.rankers = [
  new poker.ranker("High Card", function(hand) {

  }),
  new poker.ranker("One Pair", function(hand) {

  }),
  new poker.ranker("Two Pairs", function(hand) {

  }),
  new poker.ranker("Three of a Kind", function(hand) {

  }),
  new poker.ranker("Straight", function(hand) {

  }),
  new poker.ranker("Flush", function(hand) {

  }),
  new poker.ranker("Full House", function(hand) {

  }),
  new poker.ranker("Four of a Kind", function(hand) {

  }),
  new poker.ranker("Straight Flush", function(hand) {

  }),
  new poker.ranker("Royal Flush", function(hand) {

  })
];
