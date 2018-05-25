var StatisticsStudent = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.courseId = "";
        this.sourceType = "";
        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        this.httpGetCourseList();
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "statiticscontroller",
            type: 1,
            courseList: [],
            chapterList: [],
            studentList: [],
            childList: [],
            taskList:[],
            query: {
                courseId: "",
                chapterId: "",
                sourceId: "",
                segmentType: "1",
                testPaperId: "",
                segmentId:""
            },
            examinationList: [],
            queryData: function(type) {
                if (type == '1') {
                    self.httpClassReport();
                } else {
                    self.httpTestReport();
                }
            }


        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;
        $("#courseselect").on("change", function() {
            var val = $(this).val();
            self.getCourseChapter(val);
        });
        $("#chapter").on("change", function() {
            var val = $(this).val();
            var list = self.vm.chapterList.$model;
            for (var i = 0; i < list.length; i++) {
                if (list[i].courseChapterId === parseInt(val)) {
                    self.vm.childList = list[i].childList;
                    break;
                }
            }
        });
        $("#segmentTypeS").on("change", function() {
            self.httpGetSegmentList();
        });
        $("#courseChapterS").on("change", function() {
            self.httpGetSegmentList();
        });


        $(".lesson_step_tab").on("click", "li", function() {
            var href = $(this).attr("data-href");
            if (href) {
                J.goPage(href, { classid: self.classId });
            }
        });
        $(".tabs li").on("click", function() {
            var type = $(this).attr("data-type");
            self.vm.type = type;
            self.vm.studentList = [];
            if (type === '2') {
                self.httpTestPaperList();
            }
            $(this).addClass("active").siblings().removeClass("active");
        });
        $("#testPaperId").on("change", function() {
            self.vm.query.testPaperId = $(this).val();
        })

    },
    httpGetCourseList: function() {
        var self = this;
        var param = {
            classId: this.classId,
            pageIndex: 0,
            pageNumber: 10
        }
        J.ajax({ url: "/course/getClassCourseList", type: 'GET' }, param, function(data) {
            self.vm.courseList = data.courseList;
            //获取第一个课程数据
            if (data.courseList.length > 0) {
                self.vm.query.courseId = data.courseList[0].courseId;
                self.getCourseChapter(self.vm.query.courseId);
            }
        });
    },
    getCourseChapter: function(courseId) {
        var self = this;
        var params = { courseId: courseId };
        J.getCourseChapter(params, function(data) {
            self.vm.chapterList = data.courseChapterList;
             
            if (data.courseChapterList.length > 0) {
                self.vm.query.chapterId = data.courseChapterList[0].courseChapterId; 
                self.vm.childList =  data.courseChapterList[0].childList;  
                self.vm.query.sourceId =  data.courseChapterList[0].childList[0].courseChapterId; 
                self.httpGetSegmentList();        
            }
        });
    },
    //
    httpClassReport: function() {
        var self = this;
        var param = {
           classId: self.classId
        };
        var queryObj = self.vm.query;
        if(queryObj.sourceId){
            param['courseChapterId'] = queryObj.sourceId;
        }else{
            return ;
        }
        if(queryObj.segmentType){
            param['segmentType'] = queryObj.segmentType;
        }else{
            return;
        }
        if(queryObj.segmentId){
            param['segmentId'] = queryObj.segmentId;
        }else{
            return;
        }
        
        J.ajax({ url: "/classReport/learning", type: 'POST' }, param, function(data) {
            $("body").show();
            self.vm.studentList = data.studentLearningList;
        });
    },

    httpTestReport: function() {
        var self = this;
        var param = {
            classId: self.classId,
            classTestPaperId: self.vm.query.testPaperId
        }

        J.ajax({ url: "/classReport/classTestPaper", type: 'POST' }, param, function(data) {
            $("body").show();
            self.vm.studentList = [];
            self.vm.studentList = data.studentClassTestPaperList;
        });
    },
    httpTestPaperList: function() {
        var self = this;
        var params = {
            classId: self.classId

        };
        J.ajax({ url: "/examination/getClassTestPaperList", type: 'POST' }, params, function(data) {

            self.vm.examinationList = [];

            self.vm.examinationList = data.examinationList;
            if (data.examinationList.length > 0) {
                self.vm.query.testPaperId = data.examinationList[0].classTestPaperId;
                self.httpTestReport();
            }

        });
    },
    httpGetSegmentList:function(){
         var self = this;
         var params = {
            courseChapterId:self.vm.query.sourceId,
            segmentType:self.vm.query.segmentType
         };
         if(params.courseChapterId =="" || params.segmentType==""){
            return;
         }
         J.ajax({ url: "/course/getSegmentList", type: 'GET' }, params, function(data) {
           
            self.vm.taskList = data.segmentList;
            if(data.segmentList.length>0 && !self.vm.query.segmentId){
                self.vm.query.segmentId = data.segmentList[0].segmentId;
            }
            
        });
    }




});
var f = new StatisticsStudent();
