
var widgets = [];

var defaultMaxLength = 256;
var stepTimeMS = 2000;
var maxV = 10;
var minBrightness = 0;
var maxBrightness = 255;
var middleBrightness = (minBrightness + maxBrightness) / 2;

var i;

var fontSize = 15;

Meteor.startup(function () {

  Math.seedrandom(3);

  var standardOpts = {
    fontSize: fontSize,
    minBrightness: minBrightness,
    maxBrightness: maxBrightness,
    maxLength: defaultMaxLength
  };

  var sliders = null;

  Deps.autorun(function() {
    var c = getColorRecord();
    if (c) {
      var colors = [c[0], c[1], c[2]];
      standardOpts.colors = colors;
      sliders = new Sliders(standardOpts).addNumLines();
      sliders.update(colors);
    }
  });

  d3.selectAll('#pause-button')
      .on('click', togglePaused);

  d3.selectAll('#step-button')
      .on('click', function(d) {
        Paused.update({_id: id}, {$set: {step: true, paused: true}});
      });

  d3.select('body')
      .on('keydown', function(d) {
        var keyId = d3.event.keyIdentifier;
        var keyCode = d3.event.keyCode;
        if (keyId == 'Right') {
          Paused.update({_id: id}, {$set: {step: true, paused: true}});
        }
        if (keyCode == 32) {
          togglePaused();
          d3.event.preventDefault();
        }
      });

});
