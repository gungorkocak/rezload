var Rezload = function (file, options) {
  this.resizer = new ImageResizer(file, options);
  this.uploader = new ImageUploader(options.AWS, options.bucket);

  this.eventHandler = new EventEmitter2();
}

Rezload.prototype.resize = function (next) {
  this.resizer.perform(next);
}

Rezload.prototype.perform = function (next) {
  this.resize(function (err, files) {
    if(err) return next(err);

    var uploadFile = function (file, next) {
      var onprogress = function (file) {
        this.eventHandler.emit("onprogress", file);
      }.bind(this);

      var done = function (err, response) {
        this.eventHandler.emit("done", err, file, response);

        next(err, response);
      }.bind(this);

      this.uploader.upload(file, onprogress, done);
    }.bind(this);

    async.mapSeries(files, uploadFile, next);
  }.bind(this));
}

Rezload.prototype.addListener = function (eventName, event) {
  this.eventHandler.addListener(eventName, event);
}
