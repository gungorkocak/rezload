var ImageResizer = function (file, options) {
  this.setFile(file);

  this.image = new Image();

  this.options = options;

  this.versions = [];

  this._canvas = document.createElement("canvas");
  this._canvas.id = "imageResizer";
  // this._canvas.style.visibility = "hidden";
  this._context = this._canvas.getContext("2d");

  this._resizingCanvas = document.createElement("canvas");
  this._resizingContext = this._resizingCanvas.getContext("2d");
}

ImageResizer.prototype.setFile = function (file) {
  if(typeof(file) === "object" && file.type.match("image.*")) {
    this.file = file;

    var lastDotIndex = file.name.lastIndexOf(".");
    this.fileName = file.name.substring(0, lastDotIndex);
    this.fileExtension = file.name.substring(lastDotIndex).slice(1);

    this.file.version = "original";
  }
  else {
    throw new Error("File is not an image");
  }
}

ImageResizer.prototype.prepare = function (next) {
  this.image.onload = (function () {
    this.options.maxWidth = this.image.width;
    this.options.maxHeight = this.image.height;

    this._canvas.width = this.image.width;
    this._canvas.height = this.image.height;

    this._context.drawImage(this.image, 0, 0, this.image.width, this.image.height);

    next(null, this.image);
  }).bind(this);

  this.image.src = URL.createObjectURL(this.file);
}

ImageResizer.prototype.resize = function (next, results) {
  var resizer = (function (version, next) {
    var canvas = document.createElement('canvas');
    canvas.width = version.width;
    canvas.height = version.height;

    canvas.getContext('2d').drawImage(this._canvas, 0, 0, version.width, version.height);

    canvas.toBlob(function (blob) {
      blob.version = version.width + 'x' + version.height
      blob.name = this.fileName + '_' + blob.version + '.' + this.fileExtension;
      blob.lastModifiedDate = new Date();

      return next(null, blob);
    }.bind(this), this.file.type);
  }).bind(this);

  var resizeFinished = (function (err, files) {
    if(err) return next(new Error("Problem with resizing images"));

    return next(null, files);
  }).bind(this);

  async.mapSeries(this.options.versions, resizer, resizeFinished);
}

ImageResizer.prototype.perform = function (next) {
  async.auto({
    prepare: this.prepare.bind(this),
    resize:  ['prepare', this.resize.bind(this)]
  },
  (function (err, results) {
    URL.revokeObjectURL(this.image.src);

    if(err) return next(err);

    results.resize.unshift(this.file);
    return next(null, results.resize);
  }).bind(this));
}
