var LessonCenterStudent = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.vm = null;
        this.pageIndex = 0;
        this.pageNumber = 10;
        this.count = 0;
        this.bindEvent();
        this.initAvalon();
        this.httpGetCourseList();
    },
    initAvalon: function() {
        var myclass = store.get("myclass");
        this.vm = avalon.define({
            $id: "LessonCenterStudent",
            myclass:myclass,
            list: [],
            course:{
                grade_id:"",
                subject_id:"",
                name:"",
                intro:""
            }
        })
        avalon.scan();
    },
    bindEvent: function() {
        var self=this;
        $(".lesson_step_tab").on("click", "li", function() {
            var href = $(this).attr("data-href");
            J.goPage(href,{classid:self.classId});
        });
         $("#lessonList").on("click", ".class", function() {
             var courseid = $(this).attr("courseid");
             var course = self.getCourse(courseid); 
             store.set("mycourse",course);
             J.goPage("lessonindex.html",{classid:self.classId,courseid:courseid});
         });
        
    },
     getCourse:function(courseid){
        var list = this.vm.list.$model;
        var obj = null;
        for(var i=0;i<list.length;i++){
            if(courseid === list[i].courseId+""){
                obj = list[i];
                break;
            }
        }
        return obj;
    },
    httpGetCourseList: function() {
        var self = this;
        var param = {
            classId: this.classId,
            pageIndex: 0,
            pageNumber: 10
        }
        J.ajax({ url: "/course/getClassCourseList", type: 'GET' }, param, function(data) {
            if (window.frames.length != parent.frames.length) {
                top.refreshRedDot();
            }
            
            $("body").show();
            self.vm.list = data.courseList;
        });
    },

});
var f = new LessonCenterStudent();
