var CourseStatistics = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.courseId = J.getQueryString("courseid");
        this.chapterId = J.getQueryString("chapterid");
        this.sourcetype = J.getQueryString("sourcetype");
        this.pId = J.getQueryString("pid");
        this.ccsid = J.getQueryString("ccsid");
        this.segmentId = J.getQueryString("segmentid");
        //班级查看统计
        this.studentId = J.getQueryString("sid");
        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        if (this.studentId) {
            this.vm.query.studentUserId = this.studentId;
            this.httpClassReport();
            this.httpChapterSegmentContent();
            //隐藏查询条件和分析按钮
            $(".analyze_btn").hide();
            $(".search").hide();
        } else {
            this.httpGetCourseList();
        }


    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "courseStatistics",
            courseList: [],
            chapterList: [],
            studentList: [],
            children: [],
            subjects: [],
            grades: [],
            query: {
                courseId: "",
                chapterId: "",
                sourceId: "",
                segmentType: self.sourcetype,
                studentUserId: "",
                segmentId:self.segmentId
            },
            answerList: [],
            segmentModuleList:[],
            name: '',
            score: '',
            scoreTotal: '',
            isshow: false,
            taskList:[],
            analyzeList: {
                answerCount: '',
                studentCount: '',
                rightCount: '',
                errorCount: '',
                answerPercent: '',
                rightPercent: '',
                errorPercent: '',
                errorStudentNameList: '',
                rightStudentNameList: [],
                unAnswerStudentNameList: [],
                answerContentStudentNameList: []
            },
            func: function(item) {
                var qid = "";
                if (!self.vm.isshow) {
                    self.vm.isshow = true;
                } else {
                    layer.closeAll();
                    self.vm.isshow = false;
                    return;
                }

                item = item.$model;
                if (item.type === "1") {
                    qid = item.choiceQuestion.choiceQuestionId;
                } else if (item.type === "2") {
                    qid = item.fillingQuestion.fillingQuestionId;
                } else if (item.type === "3") {
                    qid = item.subjectiveQuestion.subjectiveQuestionId;
                }
                self.httpAnalyze(qid, item.type, function() {
                    var html = $(".slide_down").html();
                    layer.tips(html, '#analyze_btn_' + qid, {
                        tips: [3, "#666363"],
                        time: 0
                    });
                })

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
                    self.vm.children = list[i].childList;
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

        
        $("#queryBtn").on("click", function() {
            self.httpChapterSegmentContent();
        });
        /*得分排名中学生选中操作*/
        $(".score_sort_list").on("click", ".score_active", function() {
            $(this).addClass("highlight_color").parent().siblings().children().removeClass("highlight_color");
            var studentUserId = $(this).parent().attr("studentUserId");
            self.vm.query.studentUserId = studentUserId;
            self.httpChapterSegmentContent();
        });

        $(".lesson_main").on("mouseout", ".analyze_btn", function() {
            layer.closeAll();
            self.vm.isshow = false;
        });

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
            var courseId = self.vm.query.courseId;
            if (data.courseList.length > 0) {
                self.vm.query.courseId = courseId ? courseId : data.courseList[0].courseId;
                self.getCourseChapter(self.vm.query.courseId);
            }
        });
    },
    getCourseChapter: function(courseId) {
        var self = this;
        var params = { courseId: courseId };
        J.getCourseChapter(params, function(data) {
            self.vm.chapterList = data.courseChapterList;

            self.vm.query.chapterId = self.pId;
            var list = self.vm.chapterList.$model;
            for (var i = 0; i < list.length; i++) {
                if (list[i].courseChapterId == self.pId) {
                    self.vm.children = list[i].childList;
                    break;
                }
            }

            self.vm.query.sourceId = self.chapterId;
            self.httpGetSegmentList();

            self.httpClassReport();

        });
    },
    httpClassReport: function() {
        var self = this;
        var param = {
            courseChapterId: self.vm.query.sourceId,
            segmentType: self.sourcetype,
        }
        if(self.studentId){
             param = {
                classId: this.classId
            }
        }
        J.ajax({ url: "/markScore/scoreRanked", type: 'GET' }, param, function(data) {

            self.vm.studentList = data.studentScoreList;
            if (data.studentScoreList.length > 0 && !self.studentId) {
                self.vm.query.studentUserId = data.studentScoreList[0].studentUserId;
                self.httpChapterSegmentContent();
            }
        });
    },
    httpChapterSegmentContent: function() {
        var self = this;
        var params = {
            classId: this.classId,
            courseChapterId: self.vm.query.sourceId,
            segmentType: self.vm.query.segmentType,
            studentUserId: self.vm.query.studentUserId,
        };
        if(self.studentId){
            params = {
                classId: this.classId,           
                studentUserId: self.vm.query.studentUserId,
            };
        }
        if (!self.vm.query.studentUserId) {
            return;
        }
        J.ajax({ url: "/class/course/segment/readStudentAnswer", type: "GET" }, params, function(data) {
            
            $("body").show();
            self.vm.segmentModuleList = [];
            self.vm.segmentModuleList = data.segmentModuleList;
            self.vm.name = data.studentName;
            self.vm.score = data.acquireScoreCount;
            self.vm.scoreTotal = data.questionScoreCount;
            J.setPoster();
        });
    },
    httpAnalyze: function(questionId, questionType, func) {

        var self = this;
        var params = {
            classId: this.classId,
            questionType: questionType,
            questionId: questionId,
            sourceId: self.ccsid,
            sourceType: 1

        };
        J.ajax({ url: "/markScore/questionReport", type: "GET" }, params, function(dataList) {
            /*for(var i in dataList){
                self.vm.analyzeList[i]=dataList[i];
            };*/
            self.vm.analyzeList.answerContentStudentNameList = [];
            self.vm.analyzeList.errorStudentNameList = [];
            self.vm.analyzeList.rightStudentNameList = [];
            self.vm.analyzeList.unAnswerStudentNameList = [];

            self.vm.analyzeList.answerCount = dataList.answerCount;
            self.vm.analyzeList.studentCount = dataList.studentCount;
            self.vm.analyzeList.rightCount = dataList.rightCount;
            self.vm.analyzeList.errorCount = dataList.errorCount;
            self.vm.analyzeList.answerPercent = dataList.answerPercent;
            self.vm.analyzeList.rightPercent = dataList.rightPercent;
            self.vm.analyzeList.errorPercent = dataList.errorPercent;
            self.vm.analyzeList.answerContentStudentNameList = dataList.answerContentStudentNameList;
            self.vm.analyzeList.errorStudentNameList = dataList.errorStudentNameList;
            self.vm.analyzeList.rightStudentNameList = dataList.rightStudentNameList;
            self.vm.analyzeList.unAnswerStudentNameList = dataList.unAnswerStudentNameList;
            func && func();
        })
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
var f = new CourseStatistics();
