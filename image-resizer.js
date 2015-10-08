var ImageResizer = function (file, options) {
  this.setFile(file);

  this.file = file;

  this.options = options;

  this.versions = [];
}

ImageResizer.prototype.setFile = function (file) {
  if(typeof(file) === "object" && file.type.match("image.*")) {
    this.file = file;
  }
  else {
    throw new Error("File is not an image");
  }
}

ImageResizer.prototype.onready = function (callback) {
  this._canvas = document.createElement("canvas");
  this._canvas.id = "imageResizer";
  this._canvas.style.visibility = "hidden";
  this._context = this._canvas.getContext("2d");

  this._resizingCanvas = document.createElement("canvas");
  this._resizingContext = this._resizingCanvas.getContext("2d");

  this.image = new Image();

  this.image.onload = (function () {
    this.options.maxWidth = this.image.width;
    this.options.maxHeight = this.image.height;

    this._canvas.width = this.image.width;
    this._canvas.height = this.image.height;

    callback.call(this);
  }).bind(this);

  this.image.src = URL.createObjectURL(this.file);
}

ImageResizer.prototype.resize = function (next) {
  var resizer = (function (version, next) {
    this._resizingCanvas.width = version.width;
    this._resizingCanvas.height = version.height;

    this._resizingContext.drawImage(this._resizingCanvas, 0, 0);

    this._resizingCanvas.toBlob(function (blob) {
      return next(null, blob);
    });
  }).bind(this);

  var resizeFinished = (function (err, files) {
    if(err) return next(new Error("Problem with resizing images"));

    this.versions = files;

    return next(null, this.versions);
  }).bind(this);

  async.mapSeries(this.options.versions, resizer, resizeFinished);
}

ImageResizer.test = function (selector) {
  var imageres =
    new ImageResizer($(selector)[0].files[0], {
      versions: {
        "medium": {
          width: 512,
          height: 512
        },
        "small": {
          width: 128,
          height: 128
        }
      }
    });

  imageres.onready(function () {
    imageres.resize(function (err, files) {
      console.log("returned resized files:", files);
    });
  });
}
