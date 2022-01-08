var globals = ["document", "window", "d3"],
    globalValues = {};

globals.forEach(function(g) {
  if (g in global) globalValues[g] = global[g];
});

require("./globals");
require("./d3");

module.exports = d3;

globals.forEach(function(g) {
  if (g in globalValues) global[g] = globalValues[g];
  else delete global[g];
});

var d3$1 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

// import './start'
console.log('ggg');
console.log(d3$1);
