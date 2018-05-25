var Register = new J.Class({
    init: function(arg) {
        this.times = 60;
        this.interval = 0;
        this.bindEvent();
    },
    bindEvent: function() {
        var self = this;
        //用户协议事件        
        $(".protocol").on("click", function() {
            var _this = $(this);
            if (_this.hasClass("checked")) {
                _this.removeClass("checked");
                $(".reg_btn").addClass("disable");
            } else {
                _this.addClass("checked");
                $(".reg_btn").removeClass("disable");
            }
        });
        //选择身份
        $(".fradio li").on("click", function() {
            $(this).addClass("checked").siblings("li").removeClass("checked");
            $("#role").val($(this).attr("data-role"));
        });
        //获取验证码
        $("#phonecodebtn").on("click", function() {
            var phoneNumber = $("#account").val();
            if (phoneNumber && !$(this).hasClass("disable")) {
                var _this = this;
                $(this).addClass("disable");
                self.httpGetCaptcha(phoneNumber, function() {
                    self.timing(function() {
                        $(_this).removeClass("disable");
                    });
                });
            }
        });
        $(".reg_btn").on("click", function() {
            if (!$(this).hasClass("disable")) {
                self.httpRegister();
            }

        })
    },
    timing: function(endfunc) {
        var self = this;
        var btnObj = $("#phonecodebtn");
        this.interval = setInterval(function() {
            if (self.times <= 0) {
                clearInterval(self.interval);
                btnObj.text("获取验证码");
                endfunc && endfunc();
                return;
            }
            self.times -= 1;
            btnObj.text(self.times + "s");
        }, 1000);
    },
    httpGetCaptcha: function(phoneNumber, func) {
        J.ajax({ url: "/captcha/getPhoneCaptcha", type: 'POST' }, { phoneNumber: phoneNumber }, function(data) {
            func && func();
        });
    },
    httpRegister: function() {
        var self = this;
        var vform = new J.Vform({
            id: "regForm",
            rowq: ".form_row"
        });
        var validRs = vform.validate();
        if (!validRs) {
            return;
        }
        var password = $("#password");
        var passwordConfirm = $("#password_confirm");
        if (password.val() !== passwordConfirm.val()) {
            vform.showError(passwordConfirm, "两次密码不一致");
            return false;
        } else {
            vform.hideError(passwordConfirm);
        }
        var odata = $("#regForm").serializeArray();
        var oparams = J.serializeArrayToObj(odata);
        J.ajax({ url: "/user/register", type: 'POST' }, oparams, function(data) {
            //1注册成功、2手机验证码错误、3账号已存在、4密码弱
            
            if (data.status + "" === "1") {
                J.alert({
                    type: "success",
                    msg: "注册成功",
                    confirmFn: function() {
                        var user = new User();
                        user.accessToken = data.accessToken;
                        store.set('user', user);
                        self.httpUserInfo(function(info) {
                            user.userName = info.name;
                            user.role = info.roleName;
                            user.roleId = info.roleId;
                            user.token = info.token;
                            user.userId = info.userId;
                            store.set('user', user);
                            J.goPage("index.html");
                        });
                        ///J.goPage("login.html");
                    }
                });
            } else if (data.status + "" === "2") {
                J.alert("手机验证码错误");
            } else if (data.status + "" === "3") {
                J.alert("账号已存在");
            } else if (data.status + "" === "4") {
                J.alert("密码弱");
            }
        });
    },
    httpUserInfo: function(func) {
        var self = this;
        J.ajax({
            url: "/user/getLoginUserInfo",
            type: 'GET'
        }, null, function(data) {
            func && func(data);
        });
    }
});
var f = new Register();
