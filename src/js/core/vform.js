 J.$package(function(J) {
     var Vform = new J.Class({
         init: function(args) {
             args = args || {};
             if (!args.id) {
                 J.log("form id未指定");
             }
             this.formID = args.id;
             this.bindEvent();
         },
         bindEvent: function() {
             var self = this;
             $("#" + this.formID + " input,select,textarea").on("blur", function() {
                 var ors = self._func(this);
                 if (ors.flag) {
                     ors.parent.removeClass("jerror");
                     ors.parent.find(".jtips").html("");
                 } else if (!ors.parent.hasClass("jerror")) {
                     ors.parent.addClass("jerror");
                     ors.parent.find(".jtips").html(ors.msg);                     
                 }else{
                    ors.parent.find(".jtips").html(ors.msg);
                 }
             });

         },
         caseType: function(type, val, lable) {
             var msg = {};
             //字符串最大值
             var max = 0;
             var maVal = type.match(/max\[(\d*)\]/);
             if (maVal) {
                 type = "max";
                 max = maVal[1];
             }
             //整数  最小 最大验证
             var minInt = 0;
             var maxInt = 0;
             var maVal = type.match(/integer\[(-?\d*),(\d*)\]/);
             if (maVal) {
                 type = "integer";
                 minInt = parseInt(maVal[1]);
                 maxInt = parseInt(maVal[2]);
             }
             //整数  最小 最大验证
             switch (type) {
                 //必填
                 case "require":
                     if (val != "") {
                         msg.flag = true;
                     } else {
                         msg.flag = false;
                         msg.msg = "请填写" + lable;
                     }
                     break;
                     //电话号码
                 case "mphone":
                     var obj = this.caseType("require", val, lable);
                     if (!obj.flag) {
                         return obj;
                     }
                     var reg = /^1[3|5|7|8][0-9]\d{8}$/;
                     if (reg.test(val)) {
                         msg.flag = true;
                     } else {
                         msg.flag = false;
                         msg.msg = lable + "格式不正确。";
                     }
                     break;
                 case "max": //验证最大值 max[2] 
                     var obj = this.caseType("require", val, lable);
                     if (!obj.flag) {
                         return obj;
                     }
                     if (val.length <= parseInt(max)) {
                         msg.flag = true;
                     } else {
                         msg.flag = false;
                         msg.msg = lable + "最大不能超过" + max;
                     }
                     break;
                 case "num":
                     var obj = this.caseType("require", val, lable);
                     if (!obj.flag) {
                         return obj;
                     }
                     if (/^[0-9]+\.{0,1}[0-9]{0,2}$/.test(val)) {
                         msg.flag = true;
                     } else {
                         msg.flag = false;
                         msg.msg = lable + "格式不正确。";
                     }
                     break;
                 case "integer":
                     var obj = this.caseType("require", val, lable);
                     if (!obj.flag) {
                         return obj;
                     }
                     if (/^-?[0-9]\d*$/.test(val)) {
                         if (minInt <= parseInt(val) && parseInt(val) <= maxInt) {
                             msg.flag = true;
                         } else {
                             msg.flag = false;
                             msg.msg = lable + "的值必须在" + minInt + "-" + maxInt + "之间";
                         }
                     } else {
                         msg.flag = false;
                         msg.msg = lable + "格式不正确。";
                     }
                     break;
                 case "pwd":
                     var obj = this.caseType("require", val, lable);
                     if (!obj.flag) {
                         return obj;
                     }
                     if (val.length <= 20 || val.length >= 6) {
                         msg.flag = true;
                     } else {
                         msg.flag = false;
                         msg.msg = lable + "格式不正确。";
                     }
                     break;
                 case "mail":
                     var obj = this.caseType("require", val, lable);
                     if (!obj.flag) {
                         return obj;
                     }
                     if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(val)) {
                         msg.flag = true;
                     } else {
                         msg.flag = false;
                         msg.msg = lable + "格式不正确。";
                     }
                     break;
                 case "url":
                     var reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/;
                     var obj = this.caseType("require", val, lable);
                     if (!obj.flag) {
                         return obj;
                     }
                     if (reg.test(val)) {
                         msg.flag = true;
                     } else {
                         msg.flag = false;
                         msg.msg = lable + "格式不正确。";
                     }
                     break;
             }
             return msg;
         },
         _func: function(target) {
             var ors = {
                 flag: true
             };
             var otarget = $(target);
             var _validate = otarget.data("verify") ? otarget.data("verify") : otarget.attr("data-verify");
             if (_validate) {
                 var msg = otarget.data("msg") ? otarget.data("msg") : otarget.attr("data-msg");
                 var orow = otarget.parents(".jrow");
                 if (!msg) {
                     msg = orow.find(".jlabel").text().replace(/[:|：]/, "");
                 }
                 ors = this.caseType(_validate, otarget.val(), msg);
                 ors["target"] = otarget;
                 ors["parent"] = orow;
                 return ors;
             }
         },
         validate: function() {
             var self = this;
             var ors = {};
             //input
             $("#" + this.formID + " input,select,textarea").each(function() {
                 var ors = self._func(this);
                 if (!ors.flag) {
                     ors.parent.addClass("jerror");
                     $(this).focus();
                     ors.parent.find(".jtips").html(ors.msg);
                     return false;
                 }



             });
             return ors;
         }

     })

     J.Vform = J.Vform || {};
     J.Vform = Vform;
 });
