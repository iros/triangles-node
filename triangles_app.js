
var Triangles = require("./triangles");
var Utils = require("./utils");
var d3 = require("d3");
var jsdom = require("jsdom");
var fs = require("fs");
var nRaphael = require("./node_raphael");
var Q = require("q");
var svg2png = require("svg2png");

var config = {
  
  // width of each rect.
  width: 600,

  // height of each rect.
  height: 600,

  // how many files to generate
  howmany: 10,

  // where to put them
  output: "./output/",

  // should files be converted to png? it's slow!
  convert: true
};

var options = {

  // number of triangles
  num: Utils.randomBetween(5,25),

  // speed of painting
  easing: 0,
  delay: 0,

  // max size of a triangle size
  maxSide: Math.floor(Utils.randomBetween(30,160)),

  // max size of a triangle size
  minSide: Math.floor(Utils.randomBetween(5,10)),

  // color opacity minimum
  minOpacity: 0.1,

  // color opacity maximum
  maxOpacity: 0.4,

  // should lines be drawn?
  lines: true,

  // color of lines
  lineColor: "rgb(255,255,255)",

  // -- internal. vary for more or less distance between triangles.
  distanceFromCenter: 0
};

var generated = 0;

while (generated <  config.howmany) {

  var svg = nRaphael.generate(config.width, config.height, function(paper) {
    
    var triangles = new Triangles(
      paper,
      config.width,
      config.height,
      options);


    var getPainting = Q.defer();
    triangles.paint(null, getPainting);
    getPainting.promise.then(function() {
      var fileName = config.output + "test" + (new Date()).getTime();
      var svgfilepath = fileName + ".svg";
      var pngfilepath = fileName + ".png";
      fs.writeFile(svgfilepath, paper.canvas.parentNode.innerHTML, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file was saved", svgfilepath);

            if (config.convert) {
              svg2png(svgfilepath, pngfilepath, function (err) {
                console.log(err);
              });
            }
        }
      });
    });
  });

  generated++;  
}
