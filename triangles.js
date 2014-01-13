(function(Q, d3, _, Utils){

  // var colors = [
  //   "#67889e", "#39425a", "#4b2728",
  //   "#453b41", "#3b463b", "#645f3c",
  //   "#d7ca20"
  // ];

  // var colors = ["red", "yellow", "blue"]

  var Triangles = function(paper, width, height, options) {
    
    options = options || {};

    // dims
    this.width = width;
    this.height = height;
    this.center = { x : this.width / 2, y : this.height / 2 };
    this.colors = options.colors ?
      options.colors :
      d3.scale.category20b().range();

    this._triangles = [];
    this._lines = [];
    this._triangle = null;
    this._paintingTimeouts = [];
    this._clearingTimeout = null;

    this.paper = paper;

    this._sides = ["N","W","E","S"];

    this.scale_domain = [1,10];
    this.scale = d3.scale.linear()
      .domain(this.scale_domain);
    
    this.setOpts(options);
  };

  Triangles.prototype.setOpts = function(options) {

    _.defaults(this, options, {
      num: 100,
      easing: 0.9,
      delay: 1000,
      maxSide: 10,
      minSide: 5,
      lines: false,
      lineColor: "#fff",
      minOpacity: 0.1,
      maxOpacity: 0.4,
      distanceFromCenter: 0
    });

    this.scale.range([
      this.colors[Math.floor(Math.random() * this.colors.length)],
      this.colors[Math.floor(Math.random() * this.colors.length)]
    ]);
  };

  Triangles.prototype.paint = function(center, def) {
    center = center || {
      x : this.width / 2, y : this.height / 2
    };

    this.paintTriangle(center, null, def);
  };

  Triangles.prototype.paintTriangle = function(center, previousCenter, def) {
    var self = this;

    self.delay = self.delay * self.easing;
    if (self.delay < 50) {
      self.easing = self.easing * 1.1;
    }
    if (self.delay > 300) {
      self.easing = self.easing * 0.9;
    }

    self._paintingTimeout = setTimeout(function() {
      var bounds = {
        x : Math.max(0,center.x  - Utils.randomBetween(self.minSide, self.maxSide)),
        y : Math.max(0,center.y  - Utils.randomBetween(self.minSide, self.maxSide)),
        x2 : Math.max(0,center.x + Utils.randomBetween(self.minSide, self.maxSide)),
        y2 : Math.max(0,center.y + Utils.randomBetween(self.minSide, self.maxSide))
      };
      
      var colorIndex = Math.floor(Math.random() * self.colors.length);
      var points = self._makeTriangle(bounds);

      var triangle = self.paper.path(
        self._pathifyTriangle(points)
      ).attr({
        fill: self.scale(colorIndex),
        opacity: Utils.randomBetween(self.minOpacity, self.maxOpacity),
        //opacity: 0, <- no triangles!
        stroke: "none"
      });
      self._triangles.push(triangle);

      // draw lines
      if (previousCenter && self.lines) {
        var line = self.paper.path(
          self._pathifyLine(previousCenter, center)
        ).attr({
          fill: "none",
          //opacity: (Math.random() * 0.4) + 0.1,
          //stroke: self.scale(colorIndex)
          stroke: self.lineColor
        });

        self._lines.push(line);
      }

      if (self._triangles.length > self.num) {
        self.stopPainting();
        if (def) def.resolve("hi");
      } else {
        // center
        var c = points[Math.floor(Utils.randomBetween(0,3))];
        // distancefrom
        
        var t = [1,-1][_.random(0,1)];

        c.x = Math.max(0, Math.min(self.width, c.x + t * self.distanceFromCenter));
        c.y = Math.max(0,Math.min(self.height, c.y + t * self.distanceFromCenter));

        self.paintTriangle(c, center, def);
      }
    }, self.delay);

    self._paintingTimeouts.push(self._paintingTimeout);
  };

  Triangles.prototype.inBounds = function(point) {
    return ((point.x >= 0 && point.x <= this.paper.width) &&
           (point.y >= 0 && point.y <= this.paper.height));
  };

  Triangles.prototype.stopPainting = function() {
    var self = this;

    // stop painting
    for(var j = 0; j < self._paintingTimeouts.length; j++) {
      clearTimeout(self._paintingTimeouts[j]);
      self._paintingTimeouts[j] = null;
    }
    self._paintingTimeouts = _.compact(self._paintingTimeouts);
  };

  Triangles.prototype._pathifyTriangle = function(points) {

    return "M" + points[0].x + " " + points[0].y + "L" +
        points[1].x + " " + points[1].y + "L" +
        points[2].x + " " + points[2].y + "L" +
        points[0].x + " " + points[0].y + "Z";
  };

  Triangles.prototype._pathifyLine = function(p1, p2) {
    return "M" + p1.x + " " + p1.y + "L" +
      p2.x + " " + p2.y + "Z";
  };

  Triangles.prototype.findTriangleCenter = function(points) {
    var minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
    for(var i = 0; i < points.length; i++) {
      if (points[i].x < minX) minX = points[i].x;
      if (points[i].x > maxX) maxX = points[i].x;
      if (points[i].y < minY) minY = points[i].y;
      if (points[i].y > maxY) maxY = points[i].y;
    }

    return { x : (maxX - minX) / 2 + minX, y : (maxY - minY) / 2 + minY };
  };


  Triangles.prototype.fastClear = function() {
    var self = this;
    clearTimeout(self._paintingTimeout);
    for(var i = 0; i < self._paintingTimeouts.length; i++) {
      clearTimeout(self._paintingTimeout[i]);
    }
    self.paper.clear();
    self._triangles = [];
    self._lines = [];
    return this;
  };

  Triangles.prototype.clearCanvas = function(def) {
    var self = this;

    var total = self._triangles.length,
      processed = 0;

    function clearTriangle(i) {
      self._clearingTimeout = setTimeout(function() {

        // stop painting
        self.stopPainting();

        var t = self._triangles[i];
        var l = self._lines[i];

        if (t) {
          t.animate({ opacity : 0 }, 50, "linear", function() {
            t.remove();
            processed++;
            self._triangles[i] = null;

            if (l && self.lines) {
              l.animate({ opacity: 0}, 50, "linear", function() {
                l.remove();
                self._lines[i] = null;
              });

              if (processed + 1 >= total) {
                self._lines = _.compact(self._lines);
              }
            }

            if (processed + 1 >= total) {
              clearTimeout(self._clearingTimeout);
              self.paintTriangle(self.center, null, def);
              self._triangles = _.compact(self._triangles);
            }
          });

          
        } else {
          processed++;
          if (processed+1 >= total) {
            self.paper.clear();
            clearTimeout(self._clearingTimeout);
            self.paintTriangle(self.center, null, def);
            self._triangles = _.compact(self._triangles);
            self._lines = _.compact(self._lines);
          }
        }
        clearTriangle(i+1);
      }, self.delay / 20);
    }

    clearTriangle(0);
  };

  Triangles.prototype._makeTriangle =  function() {

    var sides = ["N","W","E","S"];

    return function(bounds) {

      // we need to pick three points. To do that, 
      // we're going to pick 3 out of the four sides.
      var s = [], side;
      while (s.length < 3) {
        side = Math.round(Math.random() * 3);
        if (s.indexOf(side) === -1) {
          s.push(side);
        }
      }

      // triangle points.
      var points = [];

      // now, for each point, generate a random value.
      // fix the value of which ever axis we're looking at.
      s.forEach(function(side_index) {

        var point = { x : 0, y : 0 };
        side = sides[side_index];

        var fix;
        switch (side) {
          case "N":
            point.y = bounds.y;
            fix = "y";
            break;
          case "S":
            point.y = bounds.y2;
            fix = "y";
            break;
          case "W":
            point.x = bounds.x;
            fix = "x";
            break;
          case "E":
            point.x = bounds.x2;
            fix = "x";
            break;
        }

        if (fix === "y") {
          point.x = Math.round(Math.random() * (bounds.x2 - bounds.x)) + bounds.x;
        }
        else if (fix === "x") {
          point.y = Math.round(Math.random() * (bounds.y2 - bounds.y)) + bounds.y;
        }
        
        points.push(point);
      });

      return points;
    };
  }();

  if (typeof module !== "undefined") {
    module.exports = Triangles;
  } else {
    window.Triangles = Triangles;
  }
}(typeof window !== "undefined" ? window.Q : require('q'),
  typeof window !== "undefined" ? window.d3 : require('d3'),
  typeof window !== "undefined" ? window._ : require('underscore'),
  typeof window !== "undefined" ? window.Utils : require('./utils')));