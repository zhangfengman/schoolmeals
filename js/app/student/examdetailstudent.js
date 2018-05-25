var ExamDetailStudent = new J.Class({
    init: function(arg) {
        this.testpaperid = J.getQueryString("testpaperid");

        this.vm = null;


        this.initAvalon();
        var self = this;
        this.httpJoin(function() {
            self.fillAnswer();
            self.kzExam();
            self.countdown();
            self.createRichText();
        });
        this.bindEvent();
        this.bindVideoEvent();
        self.createUpload();
        
    },
    initAvalon: function() {
        this.vm = avalon.define({
            $id: "examDetail",
            moduleList: [],
            exam: {
                title: "",
                requireUseTime: 0,
                subTitle: "",
                testPaperTypeName: "",
                subjectName: "",
                testPaperId: 0,
                classTestPaperId: 0,
                //1已开始，2未开始 ，3已结束，4已交卷
                classTestPaperStatus: "",
                remainTime: 0,
                timing: 0,
            }

        })
        avalon.scan();
    },
    createUpload: function() {
        var self = this;

        self.upload = new J.Upload({
            browseButton: "uploadAudio",
            container: "uploadAudioContainer",
            complete: function(files) {
                var val = files.pop().path;
                $("#" + self.curInput).val(val);
                //主观题提交答案
                var obj = $("#" + self.curInput).parents(".query_item");
                var qid = obj.attr("qid");
                var type = obj.attr("type");
                self.httpAnswerQuestion({ qid: qid, type: type, answers: val });
            }
        });

    },
    createRichText:function(){
        var self = this;
        $(".ueditor").each(function(){
            var id = $(this).attr("id");
            if(id){
                UE.getEditor(id, {initialFrameWidth: 400,
                initialFrameHeight: 140});
                
                UE.getEditor(id).addListener('blur',function(editor,event){
            
                    var obj = $("#" + this.key).parents(".query_item");
                    var val = UE.getEditor(this.key).getContent();
                    var qid = obj.attr("qid");
                    var type = obj.attr("type");
                    self.httpAnswerQuestion({ qid: qid, type: type, answers: val });
                });
            }
        });
        setTimeout(function(){
            self.filling_Edit();
        },500);
    },
    filling_Edit:function(){
        var self = this;
        $(".ueditor").each(function(){
            var id = $(this).attr("id");
            if(id){
                
                
                var answerDiv = id.replace("container_","answer_");
                var anserStr = $("#"+answerDiv).html();
                if(anserStr){

                    UE.getEditor(id).setContent(anserStr);
                }
                
                
            }
        });
    },
    bindVideoEvent: function() {
        var self = this;

        $("#lesson_main").on("focus", ".subject_text", function() {
            if (self.vm.exam.classTestPaperStatus === "1") {
                var attr = $(this).attr("id");
                self.curInput = attr;
                $("#uploadAudio").trigger("click");
            }

        });
    },
    bindEvent: function() {
        var self = this;
        //填空题
        $(".statistic_main").on("blur", ".filling_text", function(evt) {
            var status = self.vm.exam.classTestPaperStatus;
            if (status === "1") {
                var obj = $(this).parents(".query_item");
                var qid = obj.attr("qid");
                var type = obj.attr("type");
                var ans = [];
                obj.find(".filling_text").each(function() {
                    ans.push(this.value);
                });
                self.httpAnswerQuestion({ qid: qid, type: type, answers: ans.join("|") });
            } else {
                evt.preventDefault();
            }

        });

        //选择题
        $(".statistic_main").on("click", "input[type='radio']", function(evt) {
            var status = self.vm.exam.classTestPaperStatus;
            if (status === "1") {
                var obj = $(this).parents(".query_item");
                var qid = obj.attr("qid");
                var type = obj.attr("type");
                var ans = [];
                obj.find("input").each(function() {
                    if (this.checked) {
                        ans.push(this.value);
                    }

                });
                self.httpAnswerQuestion({ qid: qid, type: type, answers: ans.join("|") });
            } else {
                evt.preventDefault();
            }
        });
        $(".statistic_main").on("click", "input[type='checkbox']", function(evt) {
            var status = self.vm.exam.classTestPaperStatus;
            if (status === "1") {
                var obj = $(this).parents(".query_item");
                var qid = obj.attr("qid");
                var type = obj.attr("type");
                var ans = [];
                obj.find("input").each(function() {
                    if (this.checked) {
                        ans.push(this.value);
                    }
                });
                self.httpAnswerQuestion({ qid: qid, type: type, answers: ans.join("|") });
            } else {
                evt.preventDefault();
            }
        });

        $("#submitBtn").on("click", function() {
            self.httpSubmit();
        });

    },
    commonFAnswer: function(ques) {
      
        var type = ques.type;

        if (ques.type === '1') {
            var qid = ques.choiceQuestion.choiceQuestionId;
            var choiceQuestionType = ques.choiceQuestion.choiceQuestionType;
            var obj = $("#query_item_" + qid + "_" + type);

            var answerContent = ques.studentAnswer.answerContent;
            //单选
            if (choiceQuestionType + "" === "1") {
                obj.find("input[type='radio']").each(function() {
                    if (this.value === answerContent) {
                        this.checked = true;
                    }
                });
            } else if (choiceQuestionType + "" === "2") { //多选
                var ansList = answerContent.split("|");
                obj.find("input[type='checkbox']").each(function() {
                    for (var k = 0; k < ansList.length; k++) {
                        if (this.value === ansList[k]) {
                            this.checked = true;
                        }
                    }
                });
            }
        } else if (ques.type + "" === '2') {
            var qid = ques.fillingQuestion.fillingQuestionId;
            var obj = $("#query_item_" + qid + "_" + type);
            var answerContent = ques.studentAnswer.answerContent;
            var ansList = answerContent.split("|");
            obj.find(".filling_text").each(function(index, el) {
                $(this).val(ansList[index]);
            });
        }
    },
    //设置答案 选择题 和 填空
    fillAnswer: function() {
        var list = this.vm.moduleList;
        for (var i = 0; i < list.length; i++) {
            var questionList = list[i].qustionList;
            for (var j = 0; j < questionList.length; j++) {
                var ques = questionList[j];
                //组合题
                if (ques.type + "" == "4") {
                    var qlist = ques.unionQuestion.questionList;
                    for (var k = 0; k < qlist.length; k++) {
                        var subQues = qlist[k];
                        if (subQues.studentAnswer) {
                            this.commonFAnswer(subQues);
                        }
                        
                    }
                } else {
                    if (ques.studentAnswer) {
                        this.commonFAnswer(ques);
                    }
                    

                }
            }
        }

    },
    kzExam: function() {
        var status = this.vm.exam.classTestPaperStatus;
        $("input[type='text']").each(function() {
            if (status + "" !== "1") {
                $(this).attr("readonly", true);
            }
        });

    },
    countdown: function() {
        var self = this;
        self._time = setInterval(function() {
            if (self.vm.exam.remainTime > 0) {
                self.vm.exam.remainTime -= 1;
                //console.log(self.vm.exam.remainTime);
                self.vm.exam.timing = J.toTime(self.vm.exam.remainTime);
            } else {
                clearInterval(self._time);
            }
        }, 1000);
    },
    dowithUnion: function(unionMainQuestionId, list) {
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
                } else if (secondItem.type === "2" && unionMainQuestionId === secondItem.fillingQuestion.unionMainQuestionId) {
                    secondItem['questionType'] = secondItem.type;

                    //填空题  
                    var fillingQ = secondItem.fillingQuestion;
                    fillingQ.fillingOpts = [];
                    for (var k = 0; k < fillingQ.filingCount; k++) {
                        fillingQ.fillingOpts.push({ val: "" });
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
   
    httpJoin: function(callback) {
        var self = this;
        var params = {
            classTestPaperId: self.testpaperid,
        }
        J.ajax({ url: "/examination/student/join", type: "GET" }, params, function(data) {
            //1已开始，2未开始 ，3已结束，4已交卷
            $("body").show();
            var exam = self.vm.exam;
            exam.title = data.title;
            exam.requireUseTime = data.requireUseTime;
            exam.subTitle = data.subTitle;
            exam.testPaperTypeName = data.testPaperTypeName;
            exam.subjectName = data.subjectName;
            exam.testPaperId = data.testPaperId;
            exam.classTestPaperId = data.classTestPaperId;
            exam.classTestPaperStatus = data.classTestPaperStatus;
            exam.remainTime = data.remainTime;
            exam.timing = J.toTime(exam.remainTime);
            //
            self.vm.moduleList = [];
            for (var i = 0; i < data.testPaperModuleList.length; i++) {
                var item = data.testPaperModuleList[i];
                var qustionList = item.qustionList;
                for (var j = 0; j < qustionList.length; j++) {
                    var quesItem = qustionList[j];
                    if (quesItem.type === "2") {
                        //填空题  
                        var fillingQ = quesItem.fillingQuestion;
                        fillingQ.fillingOpts = [];
                        for (var k = 0; k < fillingQ.filingCount; k++) {
                            fillingQ.fillingOpts.push({ val: "" });
                        }
                    }
                    //组合题小题处理  组合题下有填空题，也需要处理  2017年1月8日11:51:17
                    if (quesItem.type === "4") {
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

    httpAnswerQuestion: function(args) {
        var self = this;
        var params = {
            answerContent: args.answers,
            classTestPaperId: self.testpaperid,
            questionId: args.qid,
            questionType: args.type
        }
        J.ajax({ url: "/examination/student/answerQuestion", type: "POST" }, params, function(dataList) {


        });
    },
    httpSubmit: function() {
        var self = this;
        var params = {
            classTestPaperId: self.testpaperid
        }
        J.ajax({ url: "/examination/student/submit", type: "GET" }, params, function(data) {
            if (data.status === "2") {
                J.alert("已交过卷");

            } else if (data.status === "1") {
                
                 new J.alert({
                        type: "success",
                        msg: "交卷成功",
                        confirmFn: function() {
                           J.goPage("myexam.html");
                        }
                    });
                
            }
        });
    }

});
var f = new ExamDetailStudent();
