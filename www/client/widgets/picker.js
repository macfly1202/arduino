
setPixel = function(imageData, x, y, r, g, b, a) {
  index = (x + y * imageData.width) * 4;
  imageData.data[index+0] = r;
  imageData.data[index+1] = g;
  imageData.data[index+2] = b;
  imageData.data[index+3] = a;
};

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

Picker = function(options) {

  var $el = $(options.selector);
  var $elem = $el.find('div.color-picker');
  var $canvas = $el.find('canvas.color-picker');
  var $pickers = $el.find('.color-picker');

  var $thumbnails = options.$thumbnails || $el.find('.color-thumbnails');

  var colorClickFn = options.colorClickFn || identity;

  var canvas = $canvas[0];
  this.canvas = canvas;

  var $colorPreview = $thumbnails.find('.color-preview');
  var $colorPreviewThumb = $colorPreview.find('.color-thumbnail');
  var $colorPreviewLabel = $colorPreview.find('.color-label');

  var canvasWidth = options.width || options.height || 250;
  var canvasHeight = options.height || options.width || 250;
  $canvas.attr('width', canvasWidth);
  $canvas.attr('height', canvasHeight);
  $elem.css('width', canvasWidth);
  $elem.css('height', canvasHeight);

  this.setBlocks = function(blocks) {
    this.blocks = blocks;
    this.width = blocks;
    this.height = blocks;

    this.blockWidth = canvasWidth / this.width;
    this.blockHeight = canvasHeight / this.height;

    this.scalingFactor = 256*256*256/this.width/this.height;
    $elem.css('background-image', 'url(/img/hilbert-' + blocks + '.png)');
  };

  this.setBlocks(options.blocks || 512);

  var minPadding = 5;
  var thumbnailSize = $colorPreviewThumb.width();
  var pickerSize = $elem.width();
  var maxNumThumbnails = Math.floor(pickerSize / (thumbnailSize + minPadding));
  var maxNumClickedThumbnails = maxNumThumbnails - 1;
  var optimalPadding = (pickerSize - (thumbnailSize * maxNumThumbnails)) / maxNumClickedThumbnails;

  var d$thumbnails = d3.selectAll(options.selector).selectAll('.color-thumbnails');

  var clickedThumbnails =
      ($.cookie('clicked-colors') || '')
          .split(',')
          .filter(acc('length'))
          .map(rgbFromHex)
          .slice(0, maxNumClickedThumbnails)
      ;

  function updateThumbnails() {

    $.cookie('clicked-colors', clickedThumbnails.map(rgbHexString).join(','));

    d$thumbnails
        .selectAll('.clicked-color')
        .data(clickedThumbnails)
        .enter()
        .append('div')
        .attr('class', 'clicked-color color-thumbnail-container')
        .style('margin-left', optimalPadding+'px')
        .on('click', colorClickFn)
    ;

    d$thumbnails
        .selectAll('.clicked-color')
        .selectAll('.color-thumbnail')
        .data(arr)
        .enter()
        .append('div')
        .attr('class', 'color-thumbnail')
    ;

    d$thumbnails
        .selectAll('.clicked-color')
        .selectAll('.color-thumbnail')
        .style('background-color', rgbString);

    d$thumbnails
        .selectAll('.clicked-color')
        .selectAll('.color-label')
        .data(arr)
        .enter()
        .append('div')
        .attr('class', 'color-label')
    ;

    d$thumbnails
        .selectAll('.clicked-color')
        .selectAll('.color-label')
        .text(rgbHexString)
    ;
  }

  updateThumbnails();

  var lastMouseBlockX = null;
  var lastMouseBlockY = null;

  this.getColorForBlock = function(blockX, blockY, fromMouse) {
    if (this.blocks == 64 || this.blocks == 4096) {
      var t = blockX;
      blockX = blockY;
      blockY = t;
    }
    var d = xy2d(blockX, blockY);
    var scaledD = d * this.scalingFactor;
    var p = d2xyz(scaledD);

    if (fromMouse && (lastMouseBlockX != blockX || lastMouseBlockY != blockY)) {
      log("(%d,%d), d: %d, rgb: (%s)", blockX, blockY, d, p.pp());
      lastMouseBlockX = blockX;
      lastMouseBlockY = blockY;
    }
    return p;
  }

  this.getColorForMouseEvent = function(e) {
    var blockX = Math.floor(e.offsetX / this.blockWidth);
    var blockY = Math.floor(e.offsetY / this.blockHeight);
    if (0 <= blockX && blockX < this.width && 0 <= blockY && blockY < this.height) {
      return this.getColorForBlock(blockX, blockY, true);
    }
  }

  $pickers.on('mousemove', function(e) {
    var p = this.getColorForMouseEvent(e);
    if (!p) return;
    var color = rgbString(p.rgb);
    $colorPreviewThumb.css('background-color', color);
    $colorPreviewLabel.html(rgbHexString(p.rgb) + " (" + p.pp() + ")");
  }.bind(this));

  $pickers.on('click', function(e) {
    var p = this.getColorForMouseEvent(e);
    if (!p) return;
    var str = rgbString(p.x, p.y, p.z);
    console.log("got color: " + str);

    clickedThumbnails = Utils.unshiftAndSlice(clickedThumbnails, p.rgb, maxNumClickedThumbnails);
    updateThumbnails();

    colorClickFn(p.rgb);
  }.bind(this));


  this.drawHilbertPicker = function() {
    var c = canvas.getContext('2d');

    var imageData = c.createImageData(canvas.width, canvas.height);

    console.log("drawing..");
    for (var d = 0; d < this.width*this.height; d++) {
      if (d % 100000 == 0) {
        console.log("\t%d of %d..", d, this.width*this.height);
      }
      var xy = d2xy(d);
      var x = xy.x;
      var y = xy.y;
      var color = getColorForBlock(x, y);

      for (var px = Math.floor(canvas.width * x / this.width); px < Math.floor(canvas.width * (x+1) / this.width); px++) {
        for (var py = Math.floor(canvas.height * y / this.height); py < Math.floor(canvas.height * (y+1) / this.height); py++) {
          setPixel(imageData, px, py, color.x, color.y, color.z, 255);
        }
      }
    }
    console.log("done");
    c.putImageData(imageData, 0, 0);
  };

  var drawnYet = false;

  this.updateDraw = function(draw) {
    if (draw) {
      $elem.hide();
      if (!drawnYet) {
        this.drawHilbertPicker();
        drawnYet = true;
      }
    } else {
      $canvas.hide();
    }
  };

  this.updateDraw(options.draw);

};
