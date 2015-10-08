var ImageResizer = function (file, options) {
  this.file = file;

  this.options = options;

  this.versions = [];
}

ImageResizer.prototype.onready = function (callback) {
  this._canvas = document.createElement("canvas");
  this._canvas.id = "imageResizer";
  this._canvas.style.visibility = "hidden";
  this._context = this._canvas.getContext("2d");

  document.body.appendChild(this._canvas);

  this._resizingCanvas = document.createElement("canvas");
  this._resizingContext = this._resizingCanvas.getContext("2d");

  this.image = new Image();

  this.image.onload = (function () {
    this.options.maxWidth = this.image.width;
    this.options.maxHeight = this.image.height;

    this._canvas.width = this.image.width;
    this._canvas.height = this.image.height;

    console.log("image size is:", this.image.width, this.image.height);
    callback.call(this);
  }).bind(this);

  this.image.src = URL.createObjectURL(this.file);
}

ImageResizer.prototype.resize = function (callback) {
  var versions = this.options.versions;

  for(var key in versions) {
    console.log("Getting a versions for", versions[key]);

    this._resizingCanvas.width = versions[key].width;
    this._resizingCanvas.height = versions[key].height;

    this._resizingContext.drawImage(this._resizingCanvas, 0, 0);

    this._resizingCanvas.toBlob(function (blob) {
      console.log("resized image blob is:", blob);
    });
  }
}

ImageResizer.test = function (selector) {
  var imageres =
    new ImageResizer($(selector)[0].files[0], {
      versions: {
        "medium": {
          width: 512,
          height: 512
        }
      }
    });

  imageres.onready(function () {
    imageres.resize();
  });
}
