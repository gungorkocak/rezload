(function ($) {
  var rezload = null;

  $.fn.rezload = function (method, options) {
    var plugin = this;

    var methods = {
      init: function (file, options) {
        rezload = new Rezload(file, options);
      },

      resize: function (next) {
        rezload.resizer.perform(next);
      },

      perform: function (next) {
        rezload.addListener('onprogress', function (file) {
          plugin.trigger("onprogress", file);
        });

        rezload.addListener('done', function (err, file, response) {
          plugin.trigger("uploaddone", [err, file, response]);
        });

        rezload.perform(next);
      }
    };

    if(!this.is("input[type='file']"))
      throw new Error("Elements other than input[type='file'] is not supported");

    if(typeof(method) === "string") {
      var next = options;
      methods[method](next);
    }
    else {
      options = method;

      this.on('change', function() {
        methods.init(this.files[0], options);
      });
    }

    return this;
  }
})(jQuery);
