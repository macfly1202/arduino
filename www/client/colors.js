
var defaultMaxLength = 256;
var stepTimeMS = 20;
var maxV = 10;
var minBrightness = 0;
var maxBrightness = 255;
var middleBrightness = (minBrightness + maxBrightness) / 2;

var i;

var fontSize = 15;

var randomWalkOptions = {
  initialValue: middleBrightness,
  maxAcceleration: 0.5,
  maxVelocity: maxV,
  minPosition: minBrightness,
  maxPosition: maxBrightness
};

function sineWalkOptions(period, initialRandomness, incrementalRandomness) {
  return {
    period: period,
    initialRandomness: initialRandomness,
    incrementalRandomness: incrementalRandomness,
    minPosition: minBrightness,
    maxPosition: maxBrightness
  };
}

function colorWalkParams(sineFreq, color) {
  if (sineFreq && sineFreq.length && sineFreq.length == 2) {
    color = sineFreq[1];
    sineFreq = sineFreq[0];
  }
  return {
    sineWalk: sineWalkOptions(sineFreq, true),
    randomWalk: randomWalkOptions,
    randomSineWalk: {
      halfPeriod: 50,
      minPosition: minBrightness,
      maxPosition: maxBrightness
    },
    constantWalk: { value: 100 },
    color: color,
    maxLength: defaultMaxLength
  }
}

var colors =
    [[250, '#F00'], [200, '#0F0'], [150, '#00F']]
        .map(colorWalkParams)
        .map(function(params) {
          return new ColorWalks(params);
        });

function stepColor() {

  colors.forEach(function(color) { color.step(); });
  widgets.map(function(widget) { widget.update(); });

}

var paused = false;
var timeout = null;

var widgets = [];

window.runColorDisplay = function() {

  Math.seedrandom(3);

  var standardOpts = {
    colors: colors,
    fontSize: fontSize,
    minBrightness: minBrightness,
    maxBrightness: maxBrightness,
    maxLength: defaultMaxLength
  };

  widgets.push(new Sliders(standardOpts).addNumLines());
  widgets.push(new Paths(standardOpts).addPaths());
  widgets.push(new Trail(standardOpts).addColorTrail());
  widgets.push(new Pixels(standardOpts).addPixelCircles());

  function colorLoop() {
    stepColor();
    timeout = setTimeout(colorLoop, stepTimeMS);
  }

  function handleStartOrPause() {
    if (paused) {
      $('#pause-button').attr('value', 'Resume');
      clearTimeout(timeout);
    } else {
      $('#pause-button').attr('value', 'Pause');
      colorLoop();
    }
  }

  function togglePaused() {
    paused = !paused;
    handleStartOrPause();
  }

  d3.selectAll('#pause-button')
      .on('click', togglePaused);

  d3.selectAll('#step-button')
      .on('click', function(d) {
        paused = true;
        handleStartOrPause();
        stepColor();
      });

  d3.select('body')
      .on('keydown', function(d) {
        var keyId = d3.event.keyIdentifier;
        var keyCode = d3.event.keyCode;
        if (keyId == 'Right') {
          stepColor();
          paused = true;
          handleStartOrPause();
        }
        if (keyCode == 32) {
          togglePaused();
        }
      });

  handleStartOrPause();

};

