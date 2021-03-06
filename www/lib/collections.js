
Colors = new Meteor.Collection("colors");
Paused = new Meteor.Collection("paused");
Walks = new Meteor.Collection("walks");
BlendWeights = new Meteor.Collection("blend_weights");

FrameIdxs = new Meteor.Collection("frame_idxs");
Frames = new Meteor.Collection("frames");

Speeds = new Meteor.Collection("speeds");

LastInvalidationIdxs = new Meteor.Collection("last_invalidation_idxs");

id = "abcd";
getColorRecord = function() {
  return Colors.findOne({_id: id});
};

getSpeed = function() {
  var speedObj = Speeds.findOne({_id:id});
  if (speedObj) return speedObj.speed;
  else {
    return 30;
  }
};

getFrameIdx = function() {
  var frameIdxObj = FrameIdxs.findOne({_id:id});
  if (frameIdxObj) {
    return frameIdxObj.idx;
  }
  return 0;
};

getLastInvalidationIdx = function() {
  var lastInvalidationIdxObj = LastInvalidationIdxs.findOne({_id:id});
  if (lastInvalidationIdxObj) {
    return lastInvalidationIdxObj.idx;
  }
  return 0;
};

isPaused = function() {
  return !!(Paused.findOne({_id: id}) || {}).paused;
};

togglePaused = function() {
  var paused = isPaused();
  console.log("togglePaused from " + paused + " to " + !paused);
  Paused.update({_id:id}, {_id:id, paused: !paused});
};
