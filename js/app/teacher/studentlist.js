var StudentList = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.courseId = "";
        this.sourceType = "";
        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        this.httpGetStudentList();
        this.createDropzone();
    },
    initAvalon: function() {
        var self = this;
        var myclass = store.get("myclass");
        this.vm = avalon.define({
            $id: "statiticscontroller",
            myclass: myclass,
            studentList: [],
            type:"1",
            account: {
                classId: self.classId,
                parentAccount: "",
                parentName: "",
                parentPassword: "",
                studentAccount: "",
                studentName: "",
                studentPassword: "",
                studentUserId: ""
            },
            edit: function(index) {
                self.vm.type ="2";
                $("#studentPassword").attr("data-canclev", "true");
                $("#studentAccount").attr("readonly","true");
                var obj = self.vm.studentList.$model[index];
                self.vm.account.studentAccount = obj.studentAccount;
                self.vm.account.studentName = obj.studentName;
                if (obj.parentAccount) {
                    self.vm.account.parentAccount = obj.parentAccount;
                }
                if (obj.parentName) {
                    self.vm.account.parentName = obj.parentName;
                }
                self.vm.account.studentUserId = obj.studentUserId;
                self.vm.account.studentPassword = "";
                self.vm.account.parentPassword = "";
                $('#myModal').modal('show');
            },
            add: function(index) {
                self.vm.type ="1";
                self.vm.account = {
                    classId: self.classId,
                    parentAccount: "",
                    parentName: "",
                    parentPassword: "",
                    studentAccount: "",
                    studentName: "",
                    studentPassword: ""
                };
                $("#studentAccount").removeAttr("readonly");
                $("#studentPassword").attr("data-canclev", "false");
                $('#myModal').modal('show');
            },
            exp:function(){
                J.exp("/user/downLoadExcelModel4BatchAddUser",{})
            },
            report:function(el){
                J.goPage("../student/courseStatistics.html",{classid:self.classId,sid:el.studentUserId})
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
    createDropzone: function() {
        var self = this;
        J.imp("/user/batchAddUser?classId="+self.classId, function(data) {
            if(data.status == "1"){
                new J.alert({
                        type: "success",
                        msg: "导入成功!",
                        confirmFn: function() {
                             self.httpGetStudentList();
                        }
                    });
            }else{
                new J.alert({
                        type: "failed",
                        msg: data.message,
                        confirmFn: function() {
                            
                        }
                    });
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
        var vform = new J.Vform({
            id: "newaccount_form",
            rowq: ".jrow"
        });
        var validRs = vform.validate();
        if (!validRs) {
            return;
        }
        J.ajax({ url: "/class/editStudent", type: 'POST' }, params, function(data) {
            //1成功、2学生账号已存在，重新输入 3家长账号已存在，重新输入、4参数不合法
            if (data.status + "" === "1") {
                $('#myModal').modal('hide');
                self.httpGetStudentList();
            } else if (data.status + "" === "2") {
                J.alert("学生账号已存在，重新输入");
            } else if (data.status + "" === "3") {
                J.alert("家长账号已存在，重新输入");
            }
        });
    }

});
var f = new StudentList();
