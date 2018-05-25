var ClassManage = new J.Class({
    init: function(arg) {

        this.vm = null;
        this.pageIndex = 1;
        this.pageNumber = 0;
        this.initAvalon();
        this.initPage();
        this.httpClassList();

    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "classcontroller",
            list: [],
            searchkey: "",
            searchFunc: function() {

                self.httpClassList();
            },
            exportFunc: function() {
                var param = self.getParam();
                J.exp("/class/export", param);
            },
            del: function(cid) {
                new J.alert({
                    type: "confirm",
                    msg: "确定要删除？",
                    confirmFn: function() {
                        self.httpDel(cid);
                    }
                });
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
                self.httpClassList();
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;
    },
    getParam: function(param) {

        var type = "";
        var searchkey = this.vm.searchkey;
        if (!param) {
            param = {};
        }
        if (searchkey) {
            searchkey = searchkey.replace(/\s/g, "");
            if ((/\d/).test(searchkey)) {
                type = "1";
            } else {
                type = "2";
            }
        }
        if (type == "1") {
            param['classSubjectId'] = searchkey;
        } else if (type == '2') {
            param['name'] = searchkey;
        }
        return param;
    },
    httpClassList: function() {
        var self = this;

        var searchkey = self.vm.searchkey;
        if (searchkey) {
            searchkey = searchkey.replace(/\s/g, "");
            if ((/\d/).test(searchkey)) {
                type = "1";
            } else {
                type = "2";
            }
        }

        var param = {
            pageIndex: 1,
            pageNumber: 10
        };
        param["pageIndex"] = this.pageIndex;
        param["pageNumber"] = this.pageNumber;
        param = self.getParam(param);
        J.ajax({ url: "/class/getClassList", type: 'GET' }, param, function(data) {
            self.page.refresh(data.count, self.pageIndex);
            self.vm.list = [];
            self.vm.list = data.classList;
            $("body").show();
        });
    },
    httpDel: function(cid) {
        var self = this;
        J.ajax({ url: "/class/delete", type: 'GET' }, { classId: cid }, function(data) {
            self.httpClassList();
        });
    }


});
var f = new ClassManage();
