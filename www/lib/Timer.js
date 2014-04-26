
Timer = function() {
  var startTime = null;
  var prevTime = null;
  var numTimings = 0;

  this.justCrossedSecondBoundary = false;

  this.clear = function() {
    startTime = null;
    prevTime = null;
    numTimings = 0;
  };
  this.clear();

  this.checkpoint = function() {
    var curTime = new Date().getTime();
    this.justCrossedSecondBoundary = prevTime && (Math.floor(curTime / 1000) > Math.floor(prevTime / 1000));
    numTimings++;
    if (!startTime) {
      startTime = curTime;
    }
    prevTime = curTime;
    return prevTime;
  };

  this.rate = function() {
    return ((prevTime - startTime) / numTimings).toFixed(2);
  };

  this.fps = function() {
    return (numTimings * 1000 / (prevTime - startTime)).toFixed(2);
  };

  this.toString = function() {
    return this.rate() + " (" + this.fps() + " fps, " + (prevTime - startTime) + "/" + numTimings + ")";
  };
};
