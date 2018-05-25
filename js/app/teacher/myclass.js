var Myclass = new J.Class({
    init: function(arg) {

        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        this.initYears();
        this.httpClassList();
        this.httpsysData();
    },
    initAvalon: function() {
        this.vm = avalon.define({
            $id: "class-body",
            list: [],
            newclass: {
                className: "",
                gradeId: "",
                schoolId: "",
                subjectId: "",
                beginTime: ""
            },
            schools:[],
            subjects:[],
            grades:[],
            years:[],
            classId:""
           

        })
        avalon.scan();
    },
    initYears:function(){
        var year = new Date().getFullYear();
        var arr = [];
        for(var i=0;i<5;i++){
           arr.push({key:year-i});
        }
        this.vm.years = arr;

    },
    bindEvent: function() {
        var self = this;
        $(".class-body").on("click", ".user-icon", function() {
            var id = $(this).attr("classid");
            //班级信息存储本地，创建课程是用           
             var classObj = self.getClass(id);
             store.set("myclass",classObj);
            J.goPage("lessoncenter.html",{classid:id});
        });
        $(".class-body").on("click", ".add-icon", function() {
            var id = $(this).attr("classid");
            //班级信息存储本地，创建课程是用           
             var classObj = self.getClass(id);
             store.set("myclass",classObj);
            J.goPage("studentlist.html",{classid:id});
        });
        $(".lesson_step_tab").on("click", "li", function() {
            var href = $(this).attr("data-href");
            J.goPage(href);
        });
        $(".addcbtn").on("click", function() {
            self.httpaddClass();
        });
        $(".updatecbtn").on("click", function() {
            self.httpUpdateClass();
        });

        $(".class-body").on("click", ".ctitle", function() {
            var classid = $(this).attr("classid");
            
            $('#myModal2').modal('show');
            self.httpGetClassInfo(classid);
        });

        
    },
    getClass:function(id){
        var list = this.vm.list.$model;
        var obj = null;
        for(var i=0;i<list.length;i++){
            if(id === list[i].classId+""){
                obj = list[i];
                break;
            }
        }
        return obj;
    },
    httpClassList: function() {
        var self = this;
        J.ajax({ url: "/class/myClassList", type: 'GET' }, null, function(data) {
            self.vm.list = [];
            self.vm.list = data.classList;
            $("body").show();
        });
    },
    httpaddClass: function() {
        var self = this;
        var vform = new J.Vform({
            id: "newclass_form",
            rowq: ".jrow"
        });
        var validRs = vform.validate();
        if (!validRs) {
            return;
        }
        var _tempData = this.vm.newclass;
        var params = {
            className: _tempData.className+"",
            gradeId: _tempData.gradeId+"",
            schoolId:_tempData.schoolId+"",
            subjectId: _tempData.subjectId+"",
            beginTime: _tempData.beginTime+""
        }
        J.ajax({ url: "/class/addMyClass", type: 'POST' }, params, function(data) {
            J.alert({
                type: "success",
                msg: "添加成功",
                confirmFn: function() {
                    $('#myModal').modal('hide');
                    self.httpClassList();
                }
            });

        });
    },
    httpUpdateClass: function() {
        var self = this;
        var vform = new J.Vform({
            id: "updateform",
            rowq: ".jrow"
        });
        var validRs = vform.validate();
        if (!validRs) {
            return;
        }
        var _tempData = this.vm.newclass;
        var params = {
            className: _tempData.className+"",
            classId: self.vm.classId+""
            
        }
        J.ajax({ url: "/class/addMyClass", type: 'POST' }, params, function(data) {
            J.alert({
                type: "success",
                msg: "修改成功",
                confirmFn: function() {
                    $('#myModal').modal('hide');
                    self.httpClassList();
                }
            });

        });
    },
    httpsysData:function(){
        var self = this;
        J.getsysData("['schools','subjects','grades']", function(data) {
            self.vm.schools = data.schools;
            self.vm.subjects = data.subjects;
            self.vm.grades = data.grades;
        });
    },
    httpGetClassInfo:function(classId){
        var self = this;
        J.ajax({ url: "/class/getClassInfo", type: 'GET' }, {classId:classId}, function(data) {
        self.vm.newclass.className= data.className;
        self.vm.classId = data.classId;

        });
    },
     


});
 var f = new Myclass();
