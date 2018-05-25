var AccountManage = new J.Class({
    init: function(arg) {

        this.vm = null;
        this.pageIndex = 1;
        this.pageNumber = 0;
        this.account = null;

        this.bindEvent();
        this.initAvalon();
        this.initPage();
        this.httpUserList();
        this.httpGetRoleList();
        this.httpsysData();
        this.createDropzone();
    },
    bindEvent: function() {
        var self = this;
        $("#province").bind("change", function() {
            var code = $("#province").val();
            self.httpArea(code, function(data) {
                self.vm.cityList = data.areaList;
            });
        });
        $("#city").bind("change", function() {
            var code = $("#city").val();
            self.httpArea(code, function(data) {
                self.vm.districtList = data.areaList;
            });
        });
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "accountController",
            type: "1",
            list: [],
            query: {
                account: "",
                name: "",
                schoolId: "",
                roleId: ""
            },
            account: {
                account: "",
                name: "",
                password: "",
                roleId: 1
            },
            schools: [],
            roleList: [],
            searchFunc: function() {
                self.httpUserList();
            },
            exportFunc: function() {
                var param = self.getParam();
                J.exp("/user/export", param);
            },

            show: function() {
                $("#myModal").modal('show');
                self.vm.type = "1";
                self.vm.account.account = "";
                self.vm.account.password = "";
                self.vm.account.name = "";
                self.vm.account.roleId = "";
            },
            add: function() {
                self.httpAddUser();
            },
            edit: function(obj) {
                self.removeError();
                self.vm.type = "2";
                self.account = obj.$model;
                self.vm.account.account = self.account.account;
                self.vm.account.password = "";
                self.vm.account.name = self.account.name;
                self.vm.account.roleId = self.account.roleId;
                $("#myModal").modal('show');
            },
            update: function(obj, status) {
                if (status == "-1") {
                    new J.alert({
                        type: "confirm",
                        msg: "确定要删除此账号？",
                        confirmFn: function() {
                            self.httpUpdateStatus(obj.userId, status);
                        }
                    });
                } else {
                    self.httpUpdateStatus(obj.userId, status);
                }

            }
        })
        avalon.scan();
    },
    initPage: function() {
        var self = this;
        var page = new J.Page({
            cid: "paging",
            total: 0,
            change: function(pageData) {
                self.pageIndex = pageData.curPage;
                self.pageNumber = pageData.pageSize;
                self.httpUserList();
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;
    },
    createDropzone: function() {
        var self = this;
        J.imp("/user/batchAddUser", function(data) {
            if (data.status == "1") {
                new J.alert({
                    type: "success",
                    msg: "导入成功!",
                    confirmFn: function() {
                        self.httpUserList();
                    }
                });
            } else {
                new J.alert({
                    type: "failed",
                    msg: data.message,
                    confirmFn: function() {

                    }
                });
            }


        });
    },
    removeError: function() {
        $(".jerror").removeClass("jerror");
        $(".jtips").remove();
    },
    getParam: function() {
        var obj = this.vm.query.$model;
        var param = {};
        if (obj.schoolId) {
            param["schoolId"] = obj.schoolId;
        }
        if (obj.name) {
            param["name"] = obj.name;
        }
        if (obj.account) {
            param["account"] = obj.account;
        }
        if (obj.roleId) {
            param["roleId"] = obj.roleId;
        }

        return param;
    },

    httpUserList: function() {
        var self = this;
        var param = this.getParam();
        param["pageIndex"] = this.pageIndex;
        param["pageNumber"] = this.pageNumber;

        J.ajax({ url: "/user/getUserList", type: 'GET' }, param, function(data) {
            self.page.refresh(data.count, self.pageIndex);
            self.vm.list = [];
            self.vm.list = data.userList;
            $("body").show();
        });
    },
    httpUpdateStatus: function(userId, status) {
        var self = this;
        var param = {
            status: status,
            userId: userId
        }

        J.ajax({ url: "/user/updateStatus", type: 'GET' }, param, function(data) {
            self.httpUserList();
        });
    },
    httpArea: function(cid, func) {
        J.ajax({ url: "/area/getAreaList", type: 'GET' }, { parentAreaId: cid }, function(data) {
            func && func(data);
        });
    },
    httpAddUser: function() {
        var self = this;
        var vform = new J.Vform({
            id: "newaccount_form",
            rowq: ".jrow"
        });
        var validRs = vform.validate();
        if (!validRs) {
            return;
        }
        var param = self.vm.account.$model;
        var url = "/user/addUser";
        //修改
        if (self.vm.type == "2") {
            param["userId"] = self.account.userId;
            url = "/user/updateUser";
        }

        J.ajax({ url: url, type: 'POST' }, param, function(data) {
            if (self.vm.type == "1") {
                if (data.status == "1") {
                    new J.alert({
                        type: "success",
                        msg: "账号添加成功",
                        confirmFn: function() {
                            $("#myModal").modal("hide");
                            self.httpUserList();
                        }
                    });
                } else if (data.status == "2") {
                    J.alert("账号已存在，添加失败");
                }
            } else if (self.vm.type == "2") {
                $("#myModal").modal("hide");
                self.httpUserList();
            }

        });

    },
    httpGetRoleList: function() {
        var self = this;
        J.ajax({ url: "/sysRole/getRoleList", type: 'GET' }, null, function(data) {
            self.vm.roleList = [];
            self.vm.roleList = data.roleList;
        });

    },
    httpsysData: function() {
        var self = this;
        J.getsysData("['schools']", function(data) {
            self.vm.schools = data.schools;

        });
    }





});
var f = new AccountManage();
