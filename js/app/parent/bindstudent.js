var BindStudent = new J.Class({
    init: function(arg) {
        this.vm = null;
        this.page_Index = 1;
        this.page_Number = 0;


        this.initAvalon();
        this.httpMyChildList();

    },
    initPage: function() {
        var self = this;
        var page = new J.Page({
            cid: "paging",
            total: 0,
            change: function(pageData) {
                self.page_Index = pageData.curPage;
                self.page_Number = pageData.pageSize;
                self.httpExamination();
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;





    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "bindstudent",
            token: '',
            childList: [],
            bind: function() {
                self.httpBound();
            },
            unbind: function(id) {
                self.httpUnBound(id);
            },
            report:function(el){
                J.goPage("learningreport.html",{uid:el.studentUserId});
            }
        })

        avalon.scan();
    },

    httpBound: function() {
        var self = this;
        J.ajax({ url: "/parents/bound/student", type: "GET" }, { studentToken: self.vm.token }, function(data) {
            //1成功 2token错误 3学生已经绑定过家长
            if (data.status === "1") {
                J.alert({
                    type: "success",
                    msg: "绑定成功",
                    confirmFn: function() {
                        self.httpMyChildList();
                    }
                });

            } else if (data.status === "2") {
                J.alert("UID码错误");
            } else if (data.status === "3") {
                J.alert("学生已经绑定过家长");
            }

        })
    },
    httpUnBound: function(id) {
        var self = this;
        J.ajax({ url: "/parents/unbundling/student", type: "GET" }, { studentUserId: id }, function(dataList) {
            self.httpMyChildList();

        })
    },



    httpMyChildList: function() {
        var self = this;

        J.ajax({ url: "/parents/myChildList", type: "GET" }, {}, function(data) {
            $("body").show();
            self.vm.childList = data.childList;
        });
    }

});
var f = new BindStudent();
