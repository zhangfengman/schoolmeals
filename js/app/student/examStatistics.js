var CourseStatistics = new J.Class({
    init: function (arg) {
        this.classTestPaperId = J.getQueryString("classTestPaperId");
        this.vm = null;
        //this.questionId='';
        this.initAvalon();
        this.bindEvent();
        this.httpsysData();
        this.httpGetTypes();
        this.httpGetTestPaperList();
        this.httpGetScoreList();
    },
    initAvalon: function () {
        var self = this;
        this.vm = avalon.define({
            $id: "courseStatistics",
            analyzeList: {
                answerCount:'',
                studentCount:'',
                rightCount:'',
                errorCount:'',
                answerPercent:'',
                rightPercent:'',
                errorPercent:'',
                errorStudentNameList:'',
                rightStudentNameList:[],
                unAnswerStudentNameList:[],
                answerContentStudentNameList:[]
            },
            subjects: [],
            grades: [],
            courseList: [],
            chapterList: [],
            studentList: [],
            children: [],
            query: {
                courseId: "",
                chapterId: "",
                sourceId: "",
                segmentType: "",
                typeId: "",
                gradeId: "",
                subjectId: ""
            },
            studentUserName: '',
            testPaperQuestionScore: '',
            testPaperAnswerScore: '',
            types: [],
            data: [],
            exam: {
                title: "",
                requireUseTime: 0,
                subTitle: "",
                testPaperTypeName: "",
                subjectName: "",
                testPaperId: 0,
                classTestPaperId: 0
            },
            moduleList: [],
            analysis: function(item) {
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
                }else if (item.type === "3") {
                    qid = item.subjectiveQuestion.subjectiveQuestionId;
                }
                self.httpAnalyze(qid, item.type, function() {
                    var html = $(".slide_down").html();
                    layer.tips(html, '#analyze_btn_'+qid, {
                        tips: [3, "#666363"],
                        time: 0
                    });
                })
            },
        })
        avalon.scan();
    },
    bindEvent: function () {
        var self = this;
        /*$("#courseselect").on("change", function() {
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
         });*/
        $("#queryBtn").on("click", function () {
            self.httpChapterSegmentContent();
        });
        /*得分排名中学生选中操作*/
        $(".score_sort_list").on("click", ".score_active", function () {
            $(this).addClass("highlight_color").parent().siblings().children().removeClass("highlight_color");
            var studentUserId = $(this).parent().attr("studentUserId");
            self.httpChapterSegmentContent(studentUserId, function () {
                //self.createUpload();
                self.fillAnswer();
            });
        });

       /* $(".exam_detail_wrap").on("click", ".analyze_btn", function () {
            if($(this).siblings(".slide_down").css("display")=="none"){
                $(".slide_down").slideUp();
                $(this).siblings(".slide_down").slideDown();
            }else {
                $(this).siblings(".slide_down").slideUp();
            }
            var questionId = $(this).val();
            self.httpAnalyze(questionId);
        })*/

        $(".statistic_main").on("mouseout",".analyze_btn",function(){
            layer.closeAll();
            self.vm.isshow = false;
        });
    },
    httpGetTypes: function () {
        var self = this;
        J.ajax({url: "/testPaper/getMyTheacherTestPaperTypeList", type: "GET"}, null, function (dataList) {
            self.vm.types = dataList.testPaperTypeList;
        })
    },
    httpsysData: function () {
        var self = this;
        J.getsysData("[subjects','grades']", function (data) {
            self.vm.subjects = data.subjects;
            self.vm.grades = data.grades;
        });
    },
    httpGetTestPaperList: function () {
        var self = this;
        var param = {
            classId: self.classId,
            testPaperTypeId: self.classTestPaperId,
            pageIndex: 0,
            pageNumber: 10
        }
        J.ajax({url: "/examination/getClassTestPaperList", type: 'GET'}, param, function (data) {
            self.vm.courseList = data.courseList;
        });
    },
    httpGetScoreList: function () {
        var self = this;
        var param = {
            classTestPaperId: self.classTestPaperId,
            //classTestPaperId: 5,
        };
        J.ajax({url: "/markScore/scoreRanked", type: 'GET'}, param, function (data) {
            self.vm.studentList = data.studentScoreList;
            if (data.studentScoreList.length > 0) {
                var studentUserId = data.studentScoreList[0].studentUserId;
                self.httpChapterSegmentContent(studentUserId, function () {
                    self.fillAnswer();
                });
            }
        });
    },
    httpChapterSegmentContent: function (studentUserId, callback) {
        
        var self = this;
        var params = {
            typeId: self.vm.query.typeId,
            gradeId: self.vm.query.gradeId,
            subjectId: self.vm.query.subjectId,
            studentUserId:studentUserId,
            classTestPaperId:self.classTestPaperId
            //测试
            //studentUserId: 8,
            ///classTestPaperId: 8
        };
        J.ajax({url: "/examination/report", type: "GET"}, params, function (data) {
            $("body").show();
            var exam = self.vm.exam;
            exam.title = data.title;
            exam.subTitle = data.subTitle;
            exam.classTestPaperId = data.classTestPaperId;
            self.vm.studentUserName = data.studentName;
            self.vm.testPaperQuestionScore = data.testPaperQuestionScore;
            self.vm.testPaperAnswerScore = data.testPaperAnswerScore;
            if(data.status === "2"){
                J.alert("未完成阅卷");
                history.go(-1);
                return;
            }
            

            self.vm.moduleList = [];
            for (var i = 0; i < data.testPaperModuleList.length; i++) {
                var item = data.testPaperModuleList[i];
                var qustionList = item.qustionList;
                for (var j = 0; j < qustionList.length; j++) {
                    var quesItem = qustionList[j];
                    if (quesItem.type === "2" && quesItem.fillingQuestion) {
                        //填空题
                        var fillingQ = quesItem.fillingQuestion;
                        fillingQ.fillingOpts = [];
                        for (var k = 0; k < fillingQ.filingCount; k++) {
                            fillingQ.fillingOpts.push({val: ""});
                        }
                    }
                    //组合题小题处理  组合题下有填空题，也需要处理  2017年1月8日19:52
                    if (quesItem.type === "4" && quesItem.unionQuestion) {
                        var unionMainQuestionId = quesItem.unionQuestion.unionMainQuestionId;
                        var miniList = self.dowithUnion(unionMainQuestionId, data.testPaperModuleList);
                        quesItem.unionQuestion["questionList"] = miniList;
                    }
                }

                self.vm.moduleList.push(item);
            }
            J.setPoster();
            if (callback) {
                callback();
            }
        });
    },
    //设置答案 选择题 和 填空
    fillAnswer: function () {
        var list = this.vm.moduleList;
        for (var i = 0; i < list.length; i++) {
            var questionList = list[i].qustionList;
            for (var j = 0; j < questionList.length; j++) {
                var ques = questionList[j];
                var type = ques.type;
                if (ques.type === '1') {
                    var qid = ques.choiceQuestion.choiceQuestionId;
                    var choiceQuestionType = ques.choiceQuestion.choiceQuestionType;
                    var obj = $("#query_item_" + qid + "_" + type);
                    var answerContent = ques.studentAnswer.answerContent;
                    //单选
                    if (choiceQuestionType + "" === "1") {
                        obj.find("input[type='radio']").each(function () {
                            if (this.value === answerContent) {
                                this.checked = true;
                            }
                        });
                    } else if (choiceQuestionType + "" === "2") { //多选
                        var ansList = answerContent.split("|");
                        obj.find("input[type='checkbox']").each(function () {
                            for (var k = 0; k < ansList.length; k++) {
                                if (this.value === ansList[k]) {
                                    this.checked = true;
                                }
                            }
                        });
                    }
                } else if (ques.type + "" === '2' && ques.fillingQuestion) {
                    var qid = ques.fillingQuestion.fillingQuestionId;
                    var obj = $("#query_item_" + qid + "_" + type);
                    var answerContent = ques.studentAnswer.answerContent;
                    var ansList = answerContent.split("|");
                    obj.find(".filling_text").each(function (index, el) {
                        $(this).val(ansList[index]);
                    });
                }
            }
        }

    },
    dowithUnion: function (unionMainQuestionId, list) {
        var miniList = [];
        for (var k = 0; k < list.length; k++) {
            var quesItem = list[k];
            var qustionList = quesItem.qustionList;
            for (var j = 0; j < qustionList.length; j++) {
                var secondItem = qustionList[j];
                if (secondItem.type === "1" && unionMainQuestionId === secondItem.choiceQuestion.unionMainQuestionId) {
                    secondItem['questionType'] = secondItem.type;
                    miniList.push(secondItem);
                    qustionList.splice(j, 1);
                    j--;
                } else if (secondItem.type === "2" && secondItem.fillingQuestion && unionMainQuestionId === secondItem.fillingQuestion.unionMainQuestionId) {
                    secondItem['questionType'] = secondItem.type;

                    //填空题
                    var fillingQ = secondItem.fillingQuestion;
                    fillingQ.fillingOpts = [];
                    for (var k = 0; k < fillingQ.filingCount; k++) {
                        fillingQ.fillingOpts.push({val: ""});
                    }
                    miniList.push(secondItem);
                    qustionList.splice(j, 1);
                    j--;
                } else if (secondItem.type === "3" && unionMainQuestionId === secondItem.subjectiveQuestion.unionMainQuestionId) {
                    secondItem['questionType'] = secondItem.type;
                    miniList.push(secondItem);
                    qustionList.splice(j, 1);
                    j--;
                }
            }
        }
        return miniList;
    },
    httpAnalyze: function (questionId,questionType,func) {
        var self = this;
        var params = {
            classId: self.classId,
            questionId: questionId,
            questionType: questionType,
            //sourceId: 14,
            sourceId: self.classTestPaperId,
            sourceType: 2

        };
        J.ajax({url: "/markScore/questionReport", type: "GET"}, params, function (dataList) {
            /*for(var i in dataList){
                self.vm.analyzeList[i]=dataList[i];
            };*/
            self.vm.analyzeList.answerContentStudentNameList = [];
            self.vm.analyzeList.errorStudentNameList  = [];
            self.vm.analyzeList.rightStudentNameList = [];
            self.vm.analyzeList.unAnswerStudentNameList = [];

            self.vm.analyzeList.answerCount=dataList.answerCount;
            self.vm.analyzeList.studentCount=dataList.studentCount;
            self.vm.analyzeList.rightCount=dataList.rightCount;
            self.vm.analyzeList.errorCount=dataList.errorCount;
            self.vm.analyzeList.answerPercent=dataList.answerPercent;
            self.vm.analyzeList.rightPercent=dataList.rightPercent;
            self.vm.analyzeList.errorPercent=dataList.errorPercent;
            self.vm.analyzeList.answerContentStudentNameList=dataList.answerContentStudentNameList;
            self.vm.analyzeList.errorStudentNameList=dataList.errorStudentNameList;
            self.vm.analyzeList.rightStudentNameList=dataList.rightStudentNameList;
            self.vm.analyzeList.unAnswerStudentNameList=dataList.unAnswerStudentNameList;
            func && func();
        })
    },
});
var f = new CourseStatistics();
