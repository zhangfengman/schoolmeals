var StudentLessonIndex = new J.Class({
    init: function (arg) {
        this.classId = J.getQueryString("classid");
        this.courseId = J.getQueryString("courseid");
        this.vm = null;
        
        this.initAvalon();
        this.httpIndex();
        var self = this;
        var chapter = new J.Chapter({type:"view",change:function(pid,id){
            J.goPage("lessoncontent.html",{classid:self.classId,courseid:self.courseId,chapterid:id,pid:pid});
        }});
    },
    initAvalon: function () {
        var myCourse = store.get("mycourse");
        this.vm = avalon.define({
            $id: "lessonIndex",
            mycourse:myCourse,
            data: {
                intro: "",
                userName: "",
                createTime: "",
                courseChapterList:"",
                name:"",
            },
            courseChapterList:[],
        })
        avalon.scan();
    },
    httpIndex: function () {
        var self = this;
        J.ajax({url: "/class/course/index?classId="+this.classId+"&courseId="+this.courseId, type: "GET"}, null, function (data) {
            $("body").show();
            self.vm.data.intro = data.intro;
            self.vm.data.userName = data.userName;
            self.vm.data.createTime = data.createTime;
            self.vm.courseChapterList = data.courseChapterList;

        });
    }
});
var f = new StudentLessonIndex();
