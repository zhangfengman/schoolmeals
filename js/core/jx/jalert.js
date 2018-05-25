 /**
  *  alert 插件
  *  type:success  failed warning msg confirm  默认msg
  **/
 J.$package(function(J) {
     var Jalert = new J.Class({
         init: function(param) {
             this.config = {
                 msg: "",
                 cancleText: "取消",
                 confirmText: "确定",
                 cancleFn: function() {},
                 confirmFn: function() {},
                 type: "msg"
             };
             if (param && J.isObject(param)) {
                 for (key in param) {
                     this.config[key] = param[key];
                 }
             }
             if (param && J.isString(param)) {
                 this.config.type = "msg";
                 this.config.msg = param;
             }
             var html = this.getHtml();
             this.obj = $(html);             
             $("body").append(this.obj);
             this.bindEvent();
         },
         bindEvent: function() {
             var self = this;
             $(".jmsg .cancle").bind("click", function() {
                 self.remove();
                 self.config.cancleFn.call(self);
             });
             $(".jmsg .confirm").bind("click", function() {
                 self.remove();
                 self.config.confirmFn.call(self);
             });
             $(".jmsg .close").bind("click", function() {
                 self.remove();
             });
         },
         remove: function() {
             this.obj.remove();
             
         },
         getHtml: function() {
             var ahtml = [];
             var config = this.config;
             var typeCls = "";
             ahtml.push('<div class="jmask"></div>');
             ahtml.push('<div class="jmsg jmsg_' + config.type + '">');
             ahtml.push('<div class="content">');
             ahtml.push('<div class="cell first-cell" >');
             ahtml.push('<div class="jicons jicon_type"></div>');
             ahtml.push('</div>            ');
             ahtml.push('<div class="cell second-cell">');
             if((config.type === "success" || config.type === "failed" || config.type === "warning") && config.title){
                ahtml.push('<div class="jtitle">'+config.title+'</div>');   
             }             
             ahtml.push('<div class="jtext">' + config.msg + '</div> ');
             ahtml.push('</div>');
             ahtml.push('</div>');
             ahtml.push('<div class="jicons close"></div>');
             ahtml.push('<div class="jbtn-group">');
             if (config.type === "confirm" || config.type === "warning" ) {
                 ahtml.push('<div class="cancle">' + config.cancleText + '</div>');
             }
             ahtml.push('<div class="confirm ">' + config.confirmText + '</div>');
             ahtml.push('</div>');
             ahtml.push('</div>');
             return ahtml.join("");
         }


     })
     J.alert = J.alert || {};
     J.alert = Jalert;
 });
