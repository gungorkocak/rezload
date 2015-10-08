(function ($) {
  var resizer = null;

  $.fn.rezload = function (method, options) {

    var methods = {
      init: function (file, options) {
        resizer = new ImageResizer(file, options);
      },

      resize: function (next) {
        resizer.perform(next);
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
      methods.init(this[0].files[0], options);
    }

    return this;
  }
})(jQuery);
