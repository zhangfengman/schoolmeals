var StudentList = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.courseId = "";
        this.sourceType = "";
        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        this.httpGetStudentList();
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "statiticscontroller",
            studentList: [],
            type:"1",
            account: {
                classId: self.classId,
                parentAccount: "",
                parentName: "",
                parentPassword: "",
                studentAccount: "",
                studentName: "",
                studentPassword: ""
            },
            report:function(el){
                J.goPage("courseStatistics.html",{classid:self.classId,sid:el.studentUserId})
            }

        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;
        $("#confirmBtn").on("click", function() {
            self.httpEditStudent();
        });
        $(".lesson_step_tab").on("click", "li", function() {
            var href = $(this).attr("data-href");
            if (href) {
                J.goPage(href, { classid: self.classId });
            }
        });
    },
    httpGetStudentList: function() {
        var self = this;
        var params = {
            classId: self.classId
        }
        J.ajax({ url: "/class/getStudentList", type: 'GET' }, params, function(data) {
            $("body").show();
            self.vm.studentList = [];
            self.vm.studentList = data.studentList;
        });
    },
    httpEditStudent: function() {
        var self = this;
        var params = self.vm.account.$model;

        J.ajax({ url: "/class/editStudent", type: 'POST' }, params, function(data) {
            //1成功、2学生账号已存在，重新输入 3家长账号已存在，重新输入、4参数不合法
            if (data.status === 1) {
                $('#myModal').modal('hide');
                self.httpGetStudentList();
            } else if (data.status === 2) {
                J.alert("学生账号已存在，重新输入");
            } else if (data.status === 3) {
                J.alert("家长账号已存在，重新输入");
            }
        });
    }

});
var f = new StudentList();
