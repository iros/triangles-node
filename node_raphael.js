/*
Some fixes to node_raphael required that I use this here.
*/

(function() {
  var SVG, fs, jsdom, vm;

  fs = require('fs');

  vm = require('vm');

  jsdom = require('jsdom');

  SVG = (function() {

    function SVG() {
      var code, filename;


      filename = require.resolve('./raphael-1.4.7/raphael');

      code = fs.readFileSync(filename);
      this._script = vm.createScript(code, filename);
    }

    SVG.prototype._raphael = function(win, doc, nav) {
      var ctx;
      ctx = {
        module: {},
        window: win,
        document: doc,
        navigator: nav,
        console: console
      };

      this._script.runInNewContext(ctx);
      ctx.Raphael.__ctx = ctx;
      return ctx.Raphael; //.module.exports;
    };

    SVG.prototype.generate = function(width, height, callback) {
      var doc, nav, paper, win, _ref;
      win = jsdom.createWindow(jsdom.dom);
      doc = win.document = jsdom.jsdom("<html><body></body></html>");
      nav = win.navigator;
      doc.implementation.addFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
      paper = this._raphael(win, doc, nav)(0, 0, width || 42, height || 42);
      if (typeof callback === "function") callback(paper);
      return ((_ref = doc.body.firstChild) != null ? _ref.outerHTML : void 0) || "";
    };

    return SVG;

  })();

  module.exports = new SVG();

  module.exports.SVG = SVG;

}).call(this);
