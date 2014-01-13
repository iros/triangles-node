(function() {

  var Utils = {};

  Utils.randomBetween = function(lower,upper) {
    return (Math.random() * (upper - lower)) + lower;
  };

  if (typeof module !== "undefined") {
    module.exports = Utils;
  } else {
    window.Utils = Utils;
  }
}());