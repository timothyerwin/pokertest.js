var path = require('path');

var poker = require('./games/poker');

console.log("let the games begin!");

var tournament = new poker.tournament();

var pokerfile = new poker.file(path.join(__dirname + '/poker.txt'));

var start = Date.now();

tournament.play(pokerfile.deals, function(err) {
  var end = Date.now();
  console.log(err ? err : "tournament complete.", (end - start), "ms");
});
