var path = require('path');
var poker = require('./games/poker');

console.log("let the games begin!");

var tournament = new poker.tournament();

var pokerfile = new poker.file(path.join(__dirname + '/poker.txt'));

tournament.play(pokerfile.deals, function(err) {
  console.log(err ? err : "tournament complete.");
});
