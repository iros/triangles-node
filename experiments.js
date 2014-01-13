/* global Raphael,_,$,d3 */
(function() {


  var t = [];
  var container = $("#elements"), width = 300, height = 300;

  var display = {
    width: 300,
    height: 300,
    cols: 3,
    rows: 3
  };

  var options = {
    num: Utils.randomBetween(5,25),
    easing: 0.9,
    delay: 1000,
    maxSide: Math.floor(Utils.randomBetween(30,160)),
    minSide: Math.floor(Utils.randomBetween(5,10)),
    minOpacity: 0.1,
    maxOpacity: 0.4,
    lines: true,
    lineColor: "rgb(255,255,255)",
    distanceFromCenter: 0
  };

  

  var gui = new dat.GUI();

  var h = gui.addFolder( "Animation" );
  
  var clear = function() {
    for(var i in t) {
      t[i].setOpts(options);
      t[i].stopPainting();
      //t[i].clearCanvas();
      t[i].fastClear();
    }
  };

  var makeAll = function() {
    clear();
    container.empty();
    for(var i = 0; i < Math.floor(display.cols); i++) {
      var row = $("<div>").addClass("row").appendTo(container);
      for(var j = 0; j < Math.floor(display.rows); j++) {
        var d = $("<div>").addClass("col").appendTo(row);
        var triangles = new Triangles(
          new Raphael(d[0], display.width, display.height),
          display.width,
          display.height,
          options
        );

        triangles.paint();
        t.push(triangles);
      }
    }
  }

  var repaint = function() {
    clear();
    for(var i in t) {
      t[i].paint();
    }
  };

  h.add(options, "num", 5, 100, 1).step(1).onChange(makeAll);
  h.add(options, "easing", 0.0, 1.0, 0.1).step(0.1).onChange(makeAll);
  h.add(options, "delay", 100,1000,100).step(100).onChange(makeAll);
  h.add(options, "maxSide", 10, Math.floor(Math.min(width,height)/2), 10).step(1).onChange(makeAll);
  h.add(options, "minSide", 5, Math.floor(Math.min(width,height)/2), 10).step(1).onChange(makeAll);
  h.add(options, "minOpacity", 0.0, 1.0).step(0.1).onChange(makeAll);
  h.add(options, "maxOpacity", 0.0, 1.0).step(0.1).onChange(makeAll);
  h.add(options, "distanceFromCenter", 0, Math.min(display.height, display.width)/2).step(10).onChange(makeAll);

  
  h.add(options, "lines", true, false).onChange(makeAll);
  h.addColor(options, "lineColor").onChange(makeAll);

  h.open();

  var d = gui.addFolder("Dimensions");

  d.add(display, "width", 50, 500, 25).step(25).onChange(makeAll);
  d.add(display, "height", 50, 500, 25).step(25).onChange(makeAll);
  d.add(display, "cols", 1, 10).step(1).onChange(makeAll);
  d.add(display, "rows", 1, 10).step(1).onChange(makeAll);

  d.open();
  makeAll();
  
}());