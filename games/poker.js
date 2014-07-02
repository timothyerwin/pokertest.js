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

  var p0 = 0;

  for (var x = 0; x < this.games.length; x++) {
    if (this.games[x].win.player.name == "player 0")
      p0++;
  }

  console.log(p0 + " wins total");

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

poker.array = {
  getDuplicates: function(array) {
    var uniques = {},
      val;
    var dups = {};
    for (var i = 0, len = array.length; i < len; i++) {
      val = array[i];
      if (val in uniques) {
        uniques[val]++;
        dups[val] = uniques[val];
      } else
        uniques[val] = 1;

    }
    return (dups);
  },
  getUnique: function(array) {
    var arr = array,
      i,
      len = arr.length,
      out = [],
      obj = {};

    for (i = 0; i < len; i++)
      obj[arr[i]] = 0;

    for (i in obj)
      out.push(i);

    return out.join('');
  }
};

poker.hand = function(hand) {
  if (!hand)
    throw ("invalid hand");

  this.hand = hand;
  this.cards = hand.split(" ");

  if (this.cards.length != 5)
    throw ("insufficient cards for a hand");
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

poker.hand.prototype.getUniqueValues = function() {
  return poker.array.getUnique(this.sortValues().split(''));

};

poker.hand.prototype.getSuits = function() {
  var c = this.cards;

  return c[0][1] + c[1][1] + c[2][1] + c[3][1] + c[4][1];
};

poker.hand.prototype.isFlush = function() {
  var suits = poker.lookup.suits;

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
  var results = [];

  for (var i = 0; i < this.players.length; i++) {
    var player = this.players[i];

    var rank = this.rank(player);

    results.push(rank);
  }

  return this.decide(results);
};

poker.game.prototype.decide = function(ranks) {
  var scores = [];

  var sort2d = function(i) {
    return function(a, b) {
      return a[i] < b[i];
    };
  };

  for (var i = 0; i < ranks.length; i++) {
    var rank = ranks[i];

    var rankscores = [];

    rankscores.push(rank);
    rankscores = rankscores.concat(rank.scores);

    scores.push(rankscores);
  }

  for (var a = 1; a < 7; a++) {
    var results = scores.sort(sort2d(a));

    if (results[0][a] > results[1][a]) {
      return {
        win: results[0][0],
        lose: results[1][0]
      };
    }
  }
};

poker.game.prototype.isConsecutive = function(sorted) {
  var values = [];

  for (var a = 0; a < sorted.length; a++)
    values.push(poker.lookup.values[sorted[a]]);

  var consecutive = false;

  for (var x = 0; x < values.length - 1; x++) {
    consecutive = (values[x] - values[x + 1] == 1);

    if (!consecutive) break;
  }

  return consecutive;
};

poker.game.prototype.rank = function(player) {
  var rank = null;

  for (var i = poker.rankers.length - 1; i >= 0; i--) {
    var ranker = poker.rankers[i];

    var sorted = player.hand.sortValues(true);
    var duplicates = poker.array.getDuplicates(sorted.split(''));

    var scores = ranker.execute({
      hand: player.hand,
      cache: {
        sorted: sorted,
        sortedArray: sorted.split(''),
        duplicates: duplicates,
        consecutive: this.isConsecutive(sorted),
        flush: player.hand.isFlush()
      }
    });

    if (scores) {
      rank = new poker.rank(player, ranker.type, scores);
      break;
    }
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
  new poker.ranker("High Card", function(data) {
    var values = data.cache.sortedArray;

    var result = [];

    result.push(0);

    for (var i = 0; i < values.length; i++)
      result.push(poker.lookup.values[values[i]]);

    return result;
  }),
  new poker.ranker("One Pair", function(data) {
    var sorted = data.cache.sorted;
    var duplicates = data.cache.duplicates;

    var keys = Object.keys(duplicates);

    if (keys.length == 1 && duplicates[keys[0]] == 2) {
      var result = [];

      var key = keys[0];

      result.push(1);
      result.push(poker.lookup.values[key]);

      var leftover = sorted.split(key).join('').split('');

      for (var i = 0; i < leftover.length; i++)
        result.push(poker.lookup.values[leftover[i]]);

      return result;
    }
  }),
  new poker.ranker("Two Pairs", function(data) {
    var sorted = data.cache.sorted;
    var duplicates = data.cache.duplicates;

    var keys = Object.keys(duplicates);

    if (keys.length == 2 && duplicates[keys[0]] == 2 && duplicates[keys[1]] == 2) {
      var result = [];

      result.push(2);
      result.push(poker.lookup.values[keys[0]]);
      result.push(poker.lookup.values[keys[1]]);

      var leftover = sorted.split(keys[0]).join('').split(keys[1]).join('').split('');

      for (var i = 0; i < leftover.length; i++)
        result.push(poker.lookup.values[leftover[i]]);

      return result;
    }
  }),
  new poker.ranker("Three of a Kind", function(data) {
    var sorted = data.cache.sorted;
    var duplicates = data.cache.duplicates;

    var keys = Object.keys(duplicates);

    if (keys.length == 1 && duplicates[keys[0]] == 3) {
      var result = [];

      result.push(3);
      result.push(poker.lookup.values[keys[0]]);

      var leftover = sorted.split(keys[0]).join('').split('');

      for (var i = 0; i < leftover.length; i++)
        result.push(poker.lookup.values[leftover[i]]);

      return result;
    }
  }),
  new poker.ranker("Straight", function(data) {
    if (data.cache.consecutive) {
      var results = [];

      results.push(4);
      results = results.concat(data.cache.sortedArray);

      return results;
    }
  }),
  new poker.ranker("Flush", function(data) {
    if (data.hand.flush) {
      var results = [];

      results.push(5);

      return results;
    }
  }),
  new poker.ranker("Full House", function(data) {
    var sorted = data.cache.sorted;
    var duplicates = data.cache.duplicates;

    var keys = Object.keys(duplicates);

    if (keys.length == 2 && ((duplicates[keys[0]] == 3 && duplicates[keys[1]] == 2) || (duplicates[keys[0]] == 2 && duplicates[keys[1]] == 3))) {
      var result = [];

      result.push(6);

      if (duplicates[keys[0]] == 3)
        result.push(poker.lookup.values[keys[0]]);
      else
        result.push(poker.lookup.values[keys[1]]);

      return result;
    }
  }),
  new poker.ranker("Four of a Kind", function(data) {
    var sorted = data.cache.sorted;
    var duplicates = data.cache.duplicates;

    var keys = Object.keys(duplicates);

    if (keys.length == 1 && duplicates[keys[0]] == 4) {
      var result = [];

      result.push(7);
      result.push(poker.lookup.values[keys[0]]);

      var leftover = sorted.split(keys[0]).join('').split('');

      for (var i = 0; i < leftover.length; i++)
        result.push(poker.lookup.values[leftover[i]]);

      return result;
    }
  }),
  new poker.ranker("Straight Flush", function(data) {
    if (data.cache.flush && data.consecutive) {
      var result = [];

      result.push(8);
      results = results.concat(data.cache.sortedArray);

      return results;
    }
  }),
  new poker.ranker("Royal Flush", function(data) {
    if (data.cache.flush && data.cache.sorted === "AKQJT") {
      var results = [];

      results.push(9);

      return results;
    }
  })
];
