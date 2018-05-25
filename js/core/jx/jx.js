 API = window.location.protocol + "//" + window.location.host + "";
 IMG_PATH = "/res/imgs/";
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
             //console.log("url:" +baseUrlconmon + params.url + t);
             //console.log("参数:" +JSON.stringify(data));
             $.ajax({
                 type: params.type ? params.type : "GET",
                 url: url,
                 data: data,
                 dataType: dataType,
                 timeout: 120000,
                 async: params.async == false ? params.async : true,
                 contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                 beforeSend: function() {},
                 success: function(data, error, xhr) {
                     var originalDate = new Date(xhr.getResponseHeader("Date"));
                     if (data) {
                         data.stime = originalDate;
                     }
                     success && success(data);
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
         goPage:function(url){
            window.location.href= url;
         }
     }
     window.J = J;
 })();
