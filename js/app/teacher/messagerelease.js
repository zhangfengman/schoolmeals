var MessageRelease = new J.Class({
    init: function(arg) {
        this.type = J.getQueryString("type");
        this.initAvalon();
        this.httpMyClassList();

    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "messagerelease",
            classList: [],
            studentList: [],
            classId: '',
            chooseList: [],
            message: {
                type: self.type,
                content: "",
                names: "",
                classStudentVos: [
                    // { classSubjectId: '' }
                ]
            },
            count:0,
            publishType: function(type) {
                self.vm.message.type = type;
            },
            publish: function(type) {
                self.httpPublish();
            },
            getStudent: function(classId) {
                self.vm.classId = classId;
                var obj = $("#class_" + classId).addClass("cur").siblings().removeClass("cur");
                if (self.vm.message.type === "2") {
                    self.httpGetStudentList(classId);
                }

            },
            check: function(el) {
                var checked = $("#" + el.studentUserId)[0].checked;
                var chooseList = self.vm.chooseList;
                var flag = false;
                for (var i = 0; i < chooseList.length; i++) {
                    if (chooseList[i].studentUserId == el.studentUserId) {
                        flag = true;
                        break;
                    }
                }
                if (checked && !flag) {
                    chooseList.push(el);
                } else if (!checked && flag) {
                    for (var i = 0; i < chooseList.length; i++) {
                        if (chooseList[i].studentUserId == el.studentUserId) {
                            chooseList.splice(i, 1);
                        }
                    }
                }

                var nameList = [];
                for (var i = 0; i < chooseList.length; i++) {
                    nameList.push(chooseList[i].studentName);
                }
                self.vm.message.names = nameList.join(",");
            },
            total:function(){
                var leng =  self.vm.message.content.length;
                if(leng > 300){
                    leng = 300;
                    self.vm.message.content = self.vm.message.content.substr(0,300);
                }
                self.vm.count = leng;
            }

        })
        avalon.scan();
    },

    //获取教师班级列表
    httpMyClassList: function() {
        var self = this;
        var param = {
            pageIndex: 0,
            pageNumber: 10
        }
        J.ajax({ url: "/class/myClassList", type: 'GET' }, param, function(data) {
            $("body").show();
            self.vm.classList = data.classList;
            if (data.classList.length > 0) {
                self.vm.classId = data.classList[0].classId;
            }

        });
    },
    httpGetStudentList: function(classId) {
        var self = this;
        var params = {
            classId: classId
        }
        J.ajax({ url: "/class/getStudentList", type: 'GET' }, params, function(data) {
            $("body").show();
            self.vm.studentList = [];
            self.vm.studentList = data.studentList;
        });
    },
    httpPublish: function() {
        var self = this;
        var type = self.vm.message.type;
        var param = {
            type: type,
            content: self.vm.message.content,
            classStudentVos: []
        };
        if(!self.able){
            self.able = true;
            if (type === "1") {
                param.classStudentVos.push({ classSubjectId: self.vm.classId });
            } else if (type === "2") {
                var chooseList = self.vm.chooseList;
                var userList = [];
                for (var i = 0; i < chooseList.length; i++) {
                    userList.push(parseInt(chooseList[i].studentUserId));
                }
                param.classStudentVos.push({ classSubjectId: self.vm.classId, userList: userList });

            }

            J.ajax({ url: "/annunciate/publish", type: 'POST', bodyType: "raw" }, param, function(data) {
                self.able = false;
                J.alert({
                    type: "success",
                    msg: "发布成功",
                    confirmFn: function() {
                        J.goPage("messagecenter.html");
                    }
                });
            });
        }
    }
});
var f = new MessageRelease();
