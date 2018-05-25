 /**
  *  loading 插件
  *  支持打开loading 过一段时间自动关闭
  **/
 J.$package(function(J) {
     var Loading = new J.Class({
         init: function(args) {
             this.doc = "<div class='jcmsshade'></div><div class='jcmsloading'></div>";
         },
         bindEvent: function() {},

         show: function() {
             var self = this;
             this.hide();
             $("body").append(this.doc);             
             var times = 0,
                 opacity = "";
             if (arguments.length === 1) {
                 if (J.isNumber(arguments[0])) {
                     times = arguments[0];
                 } else if (J.isString(arguments[0])) {
                     opacity = arguments[0];
                 }
             }
             if (arguments.length === 2) {
                 times = arguments[0];
                 opacity = arguments[1];
             }
             if (times) {
                 setTimeout(function() {
                     self.hide();
                 }, times)
             }
             if (opacity) {
                     $(".jcmsshade").css("opacity",opacity);
              }
         },
         hide: function() {
             $(".jcmsshade").remove();
             $(".jcmsloading").remove();
         }
     })
     J.Loading = J.Loading || {};
     J.Loading = new Loading();
 });
