 API = window.location.protocol + "//" + window.location.host + "";
 UESERVERURL = API;
 IMG_PATH = "/res/imgs/";
 API_NOLOGIN_LIST = ["/captcha/getCaptcha", "/user/login", "/user/register"];
 MODE = "dev"; //mock dev prd
 //非mock模式 添加项目名称
 if (MODE !== "mock") {
     API = API + "/shufan";
     if (typeof(RAP) !== "undefined") {
         RAP.setMode(0);
     }
 }
 (function() {
     var J = {
         $namespace: function(name) {
             if (!name) {
                 return window;
             }

             nsArr = name.split(".");
             var ns = window;

             for (i = 0, l = nsArr.length; i < l; i++) {
                 var n = nsArr[i];
                 ns[n] = ns[n] || {};
                 ns = ns[n];
             }

             return ns;
         },
         $package: function(ns, func) {
             var target;
             if (typeof ns == "function") {
                 func = ns;
                 target = window;
             } else if (typeof ns == "string") {
                 target = this.$namespace(ns);
             } else if (typeof ns == "object") {
                 target = ns;
             }
             func.call(target, this);
         },
         extend: function(destination, source) {
             for (var n in source) {
                 if (source.hasOwnProperty(n)) {
                     destination[n] = source[n];
                 }
             }
             return destination;
         },
         bind: function(func, context, var_args) {
             var slice = [].slice;
             var a = slice.call(arguments, 2);
             return function() {
                 return func.apply(context, a.concat(slice.call(arguments)));
             };
         },
         Class: function() {
             var length = arguments.length;
             var option = arguments[length - 1];
             option.init = option.init || function() {};

             if (length === 2) {
                 var superClass = arguments[0].extend;

                 var tempClass = function() {};
                 tempClass.prototype = superClass.prototype;

                 var subClass = function() {
                     return new subClass.prototype._init(arguments);
                 }

                 subClass.superClass = superClass.prototype;
                 subClass.callSuper = function(context, func) {
                     var slice = Array.prototype.slice;
                     var a = slice.call(arguments, 2);
                     var func = subClass.superClass[func];

                     if (func) {
                         func.apply(context, a.concat(slice.call(arguments)));
                     }
                 };
                 subClass.prototype = new tempClass();
                 subClass.prototype.constructor = subClass;

                 J.extend(subClass.prototype, option);

                 subClass.prototype._init = function(args) {
                     this.init.apply(this, args);
                 };
                 subClass.prototype._init.prototype = subClass.prototype;
                 return subClass;

             } else if (length === 1) {
                 var newClass = function() {
                     return new newClass.prototype._init(arguments);
                 }
                 newClass.prototype = option;
                 newClass.prototype._init = function(arg) {
                     this.init.apply(this, arg);
                 };
                 newClass.prototype.constructor = newClass;
                 newClass.prototype._init.prototype = newClass.prototype;
                 return newClass;
             }
         },
         // Convert pseudo array object to real array
         toArray: function(pseudoArrayObj) {
             var arr = [],
                 i, l;
             try {
                 return arr.slice.call(pseudoArrayObj);
             } catch (e) {
                 arr = [];
                 for (i = 0, l = pseudoArrayObj.length; i < l; ++i) {
                     arr[i] = pseudoArrayObj[i];
                 }
                 return arr;
             }
         },
         indexOf: function(arr, elem) {
             var $T = J.type;
             //数组或类数组对象
             if (arr.length) {
                 return [].indexOf.call(arr, elem);
             } else if ($T.isObject(arr)) {
                 for (var i in arr) {
                     if (arr.hasOwnProperty(i) && arr[i] === elem) {
                         return i;
                     }
                 }
             }
         },
         every: function(arr, callback) {
             if (arr.length) {
                 return [].every.call(arr, callback);
             } else if ($T.isObject(arr)) {
                 var flag = true;
                 this.each(arr, function(e, i, arr) {
                     if (!callback(e, i, arr)) flag = false;
                 });
                 return flag;
             }
         },
         some: function(arr, callback) {
             if (arr.length) {
                 return [].some.call(arr, callback);
             } else if ($T.isObject(arr)) {
                 var flag = false;
                 this.each(arr, function(e, i, arr) {
                     if (callback(e, i, arr)) flag = true;
                 });
                 return flag;
             }
         },
         each: function(arr, callback) {
             var $T = J.type;
             if (arr.length) {
                 return [].forEach.call(arr, callback);
             } else if ($T.isObject(arr)) {
                 for (var i in arr) {
                     if (arr.hasOwnProperty(i))
                         if (callback.call(arr[i], arr[i], i, arr) === false) return;
                 }
             }
         },
         map: function(arr, callback) {
             var $T = J.type;
             if (arr.length) {
                 [].map.call(arr, callback);
             } else if ($T.isObject(arr)) {
                 for (var i in arr) {
                     if (arr.hasOwnProperty(i))
                         arr[i] = callback.call(arr[i], arr[i], i, arr);
                 }
             }
         },
         filter: function(arr, callback) {
             var $T = J.type;
             if (arr.length) {
                 return [].filter.call(arr, callback);
             } else if ($T.isObject(arr)) {
                 var newObj = {};
                 this.each(arr, function(e, i) {
                     if (callback(e, i)) {
                         newObj[i] = e;
                     }
                 });
                 return newObj;
             }
         },
         isEmptyObject: function(obj) {
             for (var n in obj) {
                 return false;
             }
             return true;
         },
         random: function(min, max) {
             return Math.floor(Math.random() * (max - min + 1) + min);
         },
         $default: function(value, defaultValue) {
             if (typeof value === 'undefined') {
                 return defaultValue;
             }
             return value;
         },
         isObject: function(o) {
             return o && (o.constructor === Object || Object.prototype.toString.call(o) === "[object Object]");
         },
         isString: function(o) {
             return (o === "" || o) && (o.constructor === String);
         },
         isNumber: function(o) {
             return (o === 0 || o) && o.constructor === Number;
         },
         isArray: function(o) {
             return o && (o.constructor === Array || Object.prototype.toString.call(o) === "[object Array]");
         },
         loadjs: function(src, func) {
             func = func || function() {};
             //判断这个js文件存在直接执行回调  
             var scripts = document.getElementsByTagName('script');
             for (i in scripts)
                 if (scripts[i].src == src)
                     return func();
             if (typeof func != 'function') {
                 return false;
             }
             var script = document.createElement('script');
             script.type = 'text/javascript';
             script.src = src;
             var head = document.getElementsByTagName('head').item(0);
             head.appendChild(script);
             script.onload = function() {
                 func();
             }
         },
         loadtpl: function(path, func) {
             J.ajax({ url: path, dataType: "text" }, null, function(data) {
                 $("body").append(data);
                 func && func();
             });
         },
         loadcss: function() {
             J.ajax({ url: path, dataType: "text" }, null, function(data) {

             });
         },
         //{tpl:"",css:"",jspath:""}
         loadModel: function() {

         },
         loadImg: function(path, func) {
             var img = new Image();
             img.src = path;
             img.crossOrigin = 'anonymous';
             img.onload = function() {
                 func(img);
             }

         },
         getWindowSize: function() {
             return ["Height", "Width"].map(function(name) {
                 return window["inner" + name] ||
                     document.compatMode === "CSS1Compat" && document.documentElement["client" + name] || document.body["client" + name];
             });
         },
         //ajax 公用 封装
         ajax: function(params, data, success, error) {
             var t = new Date().getTime();
             if (params.url.indexOf("?") >= 0) {
                 t = "&_t=" + t;
             } else {
                 t = "?_t=" + t;
             }
             if (params.str) {
                 data = JSON.stringify(data);
             }
             var dataType = "json";
             if (params && params.dataType) {
                 dataType = params.dataType;
             }
             var url = API + params.url + t;
             if (params && params.dataType === "text") {
                 url = params.url;
             }
             var _data = data;
             var contentType = "application/x-www-form-urlencoded; charset=UTF-8";
             if (params.bodyType && params.bodyType === "raw") {
                 _data = JSON.stringify(data);
                 contentType = "application/json; charset=utf-8";
             }
             $.ajax({
                 type: params.type ? params.type : "GET",
                 url: url,
                 data: _data,
                 dataType: dataType,
                 timeout: 120000,
                 async: params.async == false ? params.async : true,
                 contentType: contentType,
                 beforeSend: function(request) {
                     if (API_NOLOGIN_LIST.indexOf(params.url) < 0) {
                         var user = store.get('user');
                         if (!user) {
                             J.goLogin();
                             return;
                         }
                         request.setRequestHeader("accessToken", user.accessToken);
                     }

                 },
                 success: function(data, error, xhr) {
                     var originalDate = new Date(xhr.getResponseHeader("Date"));
                     if (data) {
                         data.stime = originalDate;
                     }
                     // 0成功 
                     //1上行
                     //2接口已停用 
                     //3accesstoken失效 
                     //4接口不允许调用 
                     //90发送的请求数据长度太长 
                     //91未知的服务器错误
                     var errorData = {
                         "1": "参数不合法",
                         "2": "接口已停用",
                         "3": "accesstoken失效 ",
                         "4": "接口不允许调用 ",
                         "90": "发送的请求数据长度太长 ",
                         "91": "未知的服务器错误",
                         "93":"服务器内部错误"
                     }
                     if (data.errorCode+"" === "0") {
                         success && success(data);
                     } else {
                         J.alert(errorData[data.errorCode]);
                     }
                 },
                 error: function(data) {
                     error && error(data)
                 },
                 complete: function() {}
             });
         },
         log: function(msg) {
             if (window.console && console.log) {
                 console.log(msg);
             }
         },
         serializeArrayToObj: function(array) {
             var ors = {};
             if (J.isArray(array)) {
                 for (var i = 0; i < array.length; i++) {
                     var item = array[i];
                     ors[item.name] = item.value;
                 }
             }
             return ors;
         },
         format: function(template, context) {
             var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;
             return template.replace(tokenReg, function(word, slash1, token, slash2) {
                 if (slash1 || slash2) {
                     return word.replace('\\', '');
                 }
                 var variables = token.replace(/\s/g, '').split('.');
                 var currentObject = context;
                 var i, length, variable;
                 for (i = 0, length = variables.length; i < length; ++i) {
                     variable = variables[i];
                     currentObject = currentObject[variable];
                     if (currentObject === undefined || currentObject === null) return '';
                 }
                 return currentObject;
             })
         },
         getQueryString: function(name) {
             var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
             var r = window.location.search.substr(1).match(reg);
             if (r != null) return unescape(r[2]);
             return null;
         },
         goPage: function(url, params) {

             var paramsStr = [];
             for (var key in params) {
                 paramsStr.push(key + "=" + params[key]);
             }
             if (url.indexOf("?") < 0 && paramsStr.length > 0) {
                 url += "?"
             }
             window.location.href = url + paramsStr.join("&");
         },
         goLogin: function(url) {
             store.remove("user");
             if (self != top) {
                 top.window.location.href = window.location.protocol + "//" + window.location.host;
             } else {
                 window.location.href = window.location.protocol + "//" + window.location.host;
             }
         },
         //获取章节数据
         getCourseChapter: function(params, func) {
             var obj = null;
             if (params.courseId) {
                 obj = { courseId: params.courseId }
             }
             if (params.subjectId) {
                 obj = {
                     gradeId: params.gradeId,
                     subjectId: params.subjectId
                 }
             }
             J.ajax({ url: "/courseChapter/getList", type: 'GET' }, params, function(data) {
                 //没有节点时,设置一个根节点数据
                 if (data.courseChapterList.length === 0) {
                     data.courseChapterList = [{
                         courseChapterId: 0,
                         name: "根节点"
                     }];
                 }
                 func && func(data);
             });
         },
         //获取标签
         getTagList: function(params, func) {
             var obj = null;
             obj = { type: params.type }
             if (params.subjectId) {

                 obj["gradeId"] = params.gradeId;
                 obj["subjectId"] = params.subjectId;

             }
             J.ajax({ url: "/tag/getList", type: 'GET' }, params, function(data) {
                 //没有节点时,设置一个根节点数据
                 if (data.tagList.length === 0) {
                     data.tagList = [{
                         tagId: 0,
                         name: "根节点"
                     }];
                 }
                 func && func(data);
             });
         },
         //获取树
         getTreeList: function(params, func) {
             var obj = null;
             //1试题、2资源、3试卷 4 任务
             obj = { type: params.type }
             
             J.ajax({ url: "/tag/getList", type: 'GET' }, params, function(data) {
                 //没有节点时,设置一个根节点数据
                 if (data.tagList.length === 0) {
                     data.tagList = [{
                         tagId: 0,
                         name: "根节点"
                     }];
                 }
                 func && func(data);
             });
         },
         /*获取下拉选项数据
          *  fields = "['schools','subjects','grades']"
          */
         getsysData: function(fields, func) {
             J.ajax({ url: "/sysData/options?fields=" + fields, type: 'GET' }, null, function(data) {
                 func && func(data);
             });
         },
         getWindowSize: function() {
             return ["Height", "Width"].map(function(name) {
                 return window["inner" + name] ||
                     document.compatMode === "CSS1Compat" && document.documentElement["client" + name] || document.body["client" + name];
             });
         },
         //检测字符串内容
         checkContent: function(str) {
             var imgRegex = /^http:\/\/[\s\S]+[.png|.PNG|.gif|.GIF|.jpg|.JPG|.jpeg|.JPEG|.bmp|.BMP]$/;
             var audioRegex = /^http:\/\/[\s\S]+[.mp3]$/;
             var videoRegex = /^http:\/\/[\s\S]+[.mp4]$/;
             //字符串
             //网址
             if (imgRegex.test(str)) {
                var html =  "<img class='componentImg' src='"+str+"'/>";
                return { type: "img", val: str,html:html };
             } else if (audioRegex.test(str)) {
                 var html =  "<audio src='"+str+"'></audio>";
                 return { type: "audio", val: str,html:html };
             } else if (videoRegex.test(str)) {
                 var html =  "<video  src='"+str+"'></video >";
                 return { type: "video", val: str,html:html };
             } else {
                 return { type: "text", val: str,html:str };
             }
         },
         getRedDot: function(type, func) {
             J.ajax({ url: "/class/redDot/getNum?type=" + type, type: 'GET' }, null, function(data) {
                 func && func(data.newAskCount);
             });
         },
         getMsgDot: function(func) {
             J.ajax({ url: "/annunciate/readCount", type: 'GET' }, null, function(data) {
                 func && func(data.count);
             });
         },
         getUser: function() {
             return store.get("user");
         },
         showAudio: function(video) {

             var domStr = "";
             if (video.ext === "mp4") {
                 domStr = '<div class="video_layer_mask"><div class="video_layer"> <div class="headt"><div class="close"></div></div><video src="' + video.path + '" controls="controls" style="">您的浏览器不支持 video 标签。</video></div></div>';
             } else if (video.ext === "mp3") {
                 domStr = '<div class="video_layer_mask"><div class="video_layer"> <div class="headt"><div class="close"></div></div><audio src="' + video.path + '" controls="controls" style="">您的浏览器不支持 audio 标签。</audio></div></div>';
             } else if (['jpg', 'gif', 'png'].indexOf(video.ext) >= 0) {
                 domStr = '<img  src="' + video.path + '" />';
             }
             if (video.ext === "mp4" ||video.ext === "mp3" ) {
                 $("body").append(domStr);
                 $(".video_layer .close").one("click", function() {
                     $(".video_layer_mask").remove();
                 })
             } else {
                 layer.open({
                     shade: 0,
                     type: 1,
                     title: "预览",
                     area: ['600px', '400px'],
                     content: "<div class='preview_video'>" + domStr + "</div>",
                     end: function() {

                     }
                 });
             }



         },
         clone:function(obj) {
             var o, i, j, k;
             if (typeof(obj) != "object" || obj === null) return obj;
             if (obj instanceof(Array)) {
                 o = [];
                 i = 0;
                 j = obj.length;
                 for (; i < j; i++) {
                     if (typeof(obj[i]) == "object" && obj[i] != null) {
                         o[i] = arguments.callee(obj[i]);
                     } else {
                         o[i] = obj[i];
                     }
                 }
             } else {
                 o = {};
                 for (i in obj) {
                     if (typeof(obj[i]) == "object" && obj[i] != null) {
                         o[i] = arguments.callee(obj[i]);
                     } else {
                         o[i] = obj[i];
                     }
                 }
             }
             return o;
         },
         exp:function(url,params){
            var html = [];
            var id = "form_"+new Date().getTime();
            var allurl = API + url;
            html.push('<form class="hide-form" id="'+id+'" action="'+allurl+'" method="GET">');
            for(key in params){
                html.push('<input name="'+key+'" value="'+params[key]+'">');
            }
            html.push('</form>');
            $('body').append(html.join(''));
            $("#"+id).submit();    
         },
         imp:function(url,func){
             var user = store.get('user');
             if (!user) {
                 J.goLogin();
                 return;
             }
             
            $(".dropz").dropzone({
                 url: API+url,
                 acceptedFiles: ".xls,.xlsx",
                 headers:{"accessToken":user.accessToken},
                 //paramName:"",
                 success: function(file, data) {

                    func && func(data);
                 }
            });
         },
          toTime: function(time) {
            var h = 0,
                m = 0,
                s = 0,
                _h = '00',
                _m = '00',
                _s = '00';
            h = Math.floor(time / 3600);
            time = Math.floor(time % 3600);
            m = Math.floor(time / 60);
            s = Math.floor(time % 60);
            _s = s < 10 ? '0' + s : s + '';
            _m = m < 10 ? '0' + m : m + '';
            _h = h < 10 ? '0' + h : h + '';
            if(_h == "00" && _m == "00"){
                return  _s + "秒";
            }else if(_h == "00"){
                return _m + "分" + _s + "秒";
            }else{
                return _h + "小时" + _m + "分" + _s + "秒";
            }
           
        },
        setPoster:function(){
            var img = UESERVERURL+"/images/poster.png";
            $("video").each(function(){
                var src = $(this).attr("src");
                if(src && src.indexOf(".mp4") <= 0){
                    $(this).attr("poster",img)
                }
            });
            $("audio").each(function(){
                var src = $(this).attr("src");
                if(src && src.indexOf(".mp3") <= 0){
                    $(this).attr("poster",img);
                }
            });
        }

     }
     window.J = J;
 })();


 J.$package(function(J) {
     var Vform = new J.Class({
         init: function(args) {
             args = args || {};
             if (!args.id) {
                 J.log("form id未指定");
             }
             this.formID = args.id;
             this.rowq = args.rowq || "jrow"
             this.bindEvent();
         },
         bindEvent: function() {
             var self = this;
             $("#" + this.formID + " input[data-verify],select[data-verify],textarea[data-verify]").on("blur", function() {
                 var ors = self._func(this);
                 if (ors.flag) {
                     ors.parent.removeClass("jerror");
                     ors.parent.find(".jtips").html("");
                 } else if (!ors.parent.hasClass("jerror")) {
                     ors.parent.addClass("jerror");
                     ors.parent.find(".jtips").html(ors.msg);
                 } else {
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
                     if (val != "" && val != null) {
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
                     var reg = /^[0-9a-zA-Z]*$/;
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
                     if (val.length >= 6) {
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
             var cancleV = otarget.data("canclev") ? otarget.data("canclev") : otarget.attr("data-canclev");

             if (_validate) {
                 var msg = otarget.data("msg") ? otarget.data("msg") : otarget.attr("data-msg");
                 var orow = otarget.parents(this.rowq);
                 if (!msg) {
                     msg = orow.find(".jlabel").text().replace(/[:|：]/, "");
                 }
                 if (typeof(cancleV) == "undefined" || cancleV === "false") {
                     ors = this.caseType(_validate, otarget.val(), msg);
                 } else {
                     ors = { flag: true, msg: "" };
                 }
                 ors["target"] = otarget;
                 ors["parent"] = orow;

                 return ors;
             }
         },
         setError: function(ors, msg) {
             if (ors[0].tagName === "SELECT") {
                 ors = ors.parent();
             }
             if (ors.siblings(".jtips").length === 0) {
                 ors.after("<div class='jtips'>" + msg + "</div>");
             } else {
                 ors.siblings(".jtips").text(msg);
             }
         },
         validate: function() {
             var self = this;
             var array = [];
             //input
             $("#" + this.formID).find("input[data-verify],select[data-verify],textarea[data-verify]").each(function() {
                 var ors = self._func(this);
                 if (!ors.flag) {
                     ors.parent.addClass("jerror");
                     $(this).focus();
                     //ors.parent.find(".jtips").html(ors.msg);
                     self.setError($(this), ors.msg);
                     //return false;
                 }
                 array.push(ors);
             });
             var rsflag = true;
             for (var i = 0; i < array.length; i++) {
                 if (!array[i].flag) {
                     rsflag = false;
                     return;
                 }
             }
             return rsflag;
         },
         showError: function(target, msg) {
             var otarget = target;
             var orow = otarget.parents(this.rowq);
             orow.addClass("jerror");
             //otarget.siblings(".jtips").html(msg);
             this.setError(otarget, msg);
         },
         hideError: function(target) {
             var otarget = target;
             var orow = otarget.parents(this.rowq);
             orow.removeClass("jerror");
             //otarget.siblings(".jtips").html("");
             //this.setError(otarget, msg);
         }

     })

     J.Vform = J.Vform || {};
     J.Vform = Vform;
 });

 /**
 模拟下拉菜单
 参数 {
     type:go 超链接跳转页面、select 选中值  默认go 
     defaultval:0  默认选中  type=‘select’ 需要指定此参数
     containerID:  容器id  type=‘select’ 需要指定此参数
     onchange: 选中触发事件 type=‘select’ 需要指定此参数

 }
 **/
 J.$package(function(J) {
     var TYPE_GO = "go";
     var TYPE_SELECt = "select";
     var DDmenu = new J.Class({
         init: function(args) {
             this.type = args.type || "go";
             if (TYPE_SELECt === this.type) {
                 if (!args.defaultval) {
                     J.log("ddmenu 需要参数 defaultval");
                 }
                 this.defaultval = args.defaultval;
                 if (!args.containerID) {
                     J.log("ddmenu 需要参数 containerID");
                 }
                 this.containerID = args.containerID;
                 this.onchange = args.onchange || function() {};
                 this.setDefault(this.defaultval);
             }
             this.bindEvent();
         },
         bindEvent: function() {
             var self = this;
             var ocontainer = $("#" + this.containerID);
             ocontainer.on("click", "li a", function() {
                 var sval = $(this).attr("data-id");
                 var stext = $(this).text();
                 ocontainer.find(".menu").attr("data-val", sval);
                 ocontainer.find(".menu span").text(stext);
                 if (self.onchange) {
                     self.onchange.call(self, sval, stext);
                 }
             });
         },
         //设置默认值
         setDefault: function(val) {
             var ocontainer = $("#" + this.containerID);
             ocontainer.find("li a").each(function() {
                 if ($(this).attr("data-id") === val) {
                     ocontainer.find(".menu").attr("data-val", val);
                     ocontainer.find(".menu span").text($(this).text());
                 }
             })
         }


     })

     J.DDmenu = J.DDmenu || {};
     J.DDmenu = DDmenu;
 });

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
                 $(".jcmsshade").css("opacity", opacity);
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
             if ((config.type === "success" || config.type === "failed" || config.type === "warning") && config.title) {
                 ahtml.push('<div class="jtitle">' + config.title + '</div>');
             }
             ahtml.push('<div class="jtext">' + config.msg + '</div> ');
             ahtml.push('</div>');
             ahtml.push('</div>');
             ahtml.push('<div class="jicons close"></div>');
             ahtml.push('<div class="jbtn-group">');
             if (config.type === "confirm" || config.type === "warning") {
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
