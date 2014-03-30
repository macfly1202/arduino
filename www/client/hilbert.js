
function setPixel(imageData, x, y, r, g, b, a) {
  index = (x + y * imageData.width) * 4;
  imageData.data[index+0] = r;
  imageData.data[index+1] = g;
  imageData.data[index+2] = b;
  imageData.data[index+3] = a;
}

getInterpolatedBitNumbers = function(d) {
  var p = new Point();
  var s = 1;
  while (d > 0) {
    p = p.add(new Point(Math.floor(d/4)&1, Math.floor(d/2)&1, d&1).mult(s));
    s *= 2;
    d = Math.floor(d/8);
  }
  return p;
};

Template.hilbert.rendered = function() {
  var canvas = $('canvas')[0];

  var c = canvas.getContext('2d');

//  debug = true;

  var width = 64;
  var height = 64;

  var blockWidth = canvas.width / width;
  var blockHeight = canvas.height / height;

  var imageData = c.createImageData(canvas.width, canvas.height);

  var scalingFactor = 256*256*256/width/height;

  log("scaling factor: " + scalingFactor);

  for (var d = 0; d < width*height; d++) {
    debug = false;
    var p = d2xy(d);
    var x = p.x;
    var y = p.y;
//    debug = true;
    var scaledD = d * scalingFactor;
    var p = getInterpolatedBitNumbers(scaledD);//.mult(scalingFactor);
    log(x+','+y+':\t'+ d +"\t"+ p.pp());

    for (var px = blockWidth*x; px < blockWidth*(x+1); px++) {
      for (var py = blockHeight*y; py < blockHeight*(y+1); py++) {
        setPixel(imageData, px, py, p.x, p.y, p.z, 255);
      }
    }
  }

  c.putImageData(imageData, 0, 0);

  $('#hilbert').on('mousemove', function(e) {
    var blockX = e.offsetX / blockWidth;
    var blockY = e.offsetY / blockHeight;
    var d = xy2d(blockX, blockY);
    var scaledD = d*scalingFactor;
    var p = getInterpolatedBitNumbers(scaledD);
    var color = rgbString(p.x, p.y, p.z);
    $('#color').css('background-color', color);
    $('#color-label').html(rgbHexString(p.x, p.y, p.z) + " (" + p.pp() + ")");
    //console.log(e.offsetX+','+ e.offsetY);
  });
};
