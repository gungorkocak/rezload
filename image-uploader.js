var ImageUploader = function (aws, bucket) {
  this.AWS = AWS,
  this.bucket = bucket,
  this.partSize = 10 * 1024 * 512,
  this.queueSize = 1;
}

ImageUploader.prototype.upload = function (file, onprogress, done) {
  var uploader =
    new this.AWS.S3.ManagedUpload({
      partSize: this.partSize,
      queueSize: this.queueSize,
      params: {Bucket: this.bucket, Key: file.name, Body: file}
    });

  uploader.on('httpUploadProgress', function(event) {
    file.progress = (event.loaded / event.total) * 100;

    if(typeof(onprogress) === 'function') onprogress.call(this, file, event);
  });

  uploader.send(done);
}
