var Login = new J.Class({
    init: function(arg) {
        this.vm = null;
        this.bindEvent();
        this.initAvalon();
        this.httpCaptcha();
    },
    initAvalon: function() {
        this.vm = avalon.define({
            $id: "block_login",
            data: {
                account: "",
                password: "",
                captchaCode: "",
                captchaToken: ""
            },
            captcha: {
                img: ""
            }
        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;
        $(".reg_btn").on("click", function() {
            self.httpLogin();
        });
        $(".refresh").on("click", function() {
            self.httpCaptcha();
        });
        $(document).on("keydown", function(event) {
            if (event.keyCode == 13) {
                self.httpLogin();
            }
        })
    },
    httpCaptcha: function() {
        var self = this;
        console.log("2:" + new Date())
        J.ajax({ url: "/captcha/getCaptcha", type: "GET" }, null, function(data) {
            self.vm.captcha.img = "data:image/png;base64," + data.captcha.img;
            self.vm.data.captchaToken = data.captcha.token;
        });
    },
    httpLogin: function() {
        var self = this;
        var vform = new J.Vform({
            id: "login_form",
            rowq: ".form_row"
        });
        var validRs = vform.validate();
        if (!validRs) {
            return;
        }

        J.ajax({ url: "/user/login", type: "POST" }, this.vm.data.$model, function(data) {
            //2账号或密码错误、3
            if (data.status === 1) {
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
            } else if (data.status === 2) {
                J.alert({
                    msg: "账号或密码错误",
                    confirmFn: function() {
                        self.httpCaptcha();
                    }
                });
            } else if (data.status === 3) {
                J.alert({
                    msg: "验证码错误",
                    confirmFn: function() {
                        self.httpCaptcha();
                    }
                });

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
var f = new Login();
