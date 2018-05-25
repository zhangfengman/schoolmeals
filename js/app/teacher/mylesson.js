var MyLesson = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        
        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        this.httpgetCourseList();
        this.httpsysData();
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "mylesson",
            courseList: [],
            courseId: "",
            course: {
                grade_id: "",
                subject_id: "",
                name: "",
                intro: ""
            },
            query:{
                gradeId:"",
                subjectId:""
            },
            subjects:[],
            grades:[],
            mode:"add",
            add:function(){
                self.vm.mode = "add";
            },
            search:function(){
                self.httpgetCourseList();
            }
        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;
        $(".class-body").on("click", ".btn-mini", function(event) {
            var target = event.target;
            var op = $(target).attr("data-op");
            //console.log(op);
            var courseId = $(this).attr("courseid");
            if ("add" === op) {
                J.goPage("editlesson.html", { courseid: courseId, classid: self.classId });
            } else if ("update" === op) {
                J.goPage("editlesson.html", { courseid: courseId, classid: self.classId });
            } else if ("del" === op) {
                self.httpDeleteCourse(courseId);
            } else if ("copy" === op) {
                self.vm.mode = "update";
                self.showCopy(courseId);
               
                //self.httpCopyCourse(courseId);
            } else if ("release" === op) {
                J.goPage("releaselesson.html", { courseid: courseId });
            } else if ("comment" === op) {
                //J.goPage("coursescore.html",{courseid:courseId});
            }else if ("edit" === op) {
                self.vm.mode="edit";
                self.showCopy(courseId);
            }
        });
        $(".class-body").on("click", ".q-title", function(event) {
            var courseId = $(this).attr("courseid");
            var obj = self.getObj(courseId);
            store.set("_mycourse",obj);
            J.goPage("coursedetail.html", { courseid: courseId });

        })
        $(".cbtn").on("click", function() {
            

            if(self.vm.mode === "add"){
                self.httpAddCourse();
            }else if(self.vm.mode === "update"){
                self.httpCopyCourse();
            }else if(self.vm.mode === "edit"){
                self.httpAddCourse();
            }
            
        });
    },
    getObj:function(courseId){
        var list = this.vm.courseList;
        var obj =  null;
        for(var i=0;i<list.length;i++){
            if(courseId == list[i].courseId){
                obj = list[i];
                break;
            }
        }
        return  obj;
    },
    //获取课程列表
    httpgetCourseList: function() {
        var self = this;
        var param = {
            pageIndex: 0,
            pageNumber: 10
        }
        if(self.vm.query.gradeId){
            param["gradeId"] = self.vm.query.gradeId
        }
        if(self.vm.query.subjectId){
            param["subjectId"] = self.vm.query.subjectId
        }
        J.ajax({ url: "/course/getCourseList", type: 'GET' }, param, function(data) {
            $("body").show();
            self.vm.courseList = [];
            self.vm.courseList = data.courseList;
        });
    },
    //添加课程
    httpAddCourse: function() {
        
        var self = this;
        var param = self.vm.course.$model;
        var vform = new J.Vform({
            id: "newlesson_form",
            rowq: ".jrow"
        });
        var validRs = vform.validate();
        if (!validRs) {
            return;
        }
        var myclass = store.get("myclass");
        param.grade_id = myclass.gradeId;
        param.subject_id = myclass.subjectId;
        var url = "/course/addCourse";

        if(self.vm.mode =="edit"){
            param.courseId = self.vm.courseId;
            url = "/course/updateCourseBaseInfo";
        }
        J.ajax({ url: url, type: 'POST' }, param, function(data) {
            $('#myModal').modal('hide');
            self.httpgetCourseList();
        });
    },
    //添加课程
    httpDeleteCourse: function(courseId) {
        var self = this;
        J.ajax({ url: "/course/deleteCourse", type: 'GET' }, { courseId: courseId }, function(data) {
            self.httpgetCourseList();
        });
    },
    showCopy:function(courseId){
        
        var list  = this.vm.courseList.$model;
        var params = {
            courseId: courseId,
            name:"",
            intro:""
        }
        for(var i=0;i<list.length;i++){
            if(list[i].courseId == courseId){
                params.name = list[i].name;
                params.intro = list[i].intro;
                break;
            }
        }
        this.vm.course.name = params.name;
        this.vm.course.intro = params.intro;
        this.vm.courseId = params.courseId;
        var myclass = store.get("myclass");
        this.vm.course.grade_id = myclass.gradeId;
        this.vm.course.subject_id = myclass.subjectId;
        $('#myModal').modal('show');

    },
    httpCopyCourse: function() {
        var self = this;
        var params = self.vm.course;
        params['courseId'] = self.vm.courseId
        J.ajax({ url: "/course/copyCourse", type: 'POST' }, params, function(data) {
            $('#myModal').modal('hide');
            self.httpgetCourseList();
        });
    },
    httpsysData:function(){
        var self = this;
        J.getsysData("['schools','subjects','grades']", function(data) {
            self.vm.schools = data.schools;
            self.vm.subjects = data.subjects;
            self.vm.grades = data.grades;
        });
    }


});
var f = new MyLesson();
