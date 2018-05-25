var CourseDetailStudent = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.courseId = J.getQueryString("courseid");
        this.chapterId = J.getQueryString("chapterid");
        this.segmentType = J.getQueryString("sourcetype");
        this.ccsid = J.getQueryString("ccsid");
        this.segmentId = J.getQueryString("segmentid");
        this.vm = null;
        var self = this;
        /*
        this.httpChapterSegmentContent(function() {
            self.fillAnswer();
            self.createUpload();
        });*/

        this.httpTaskDetail(function() {
            self.fillAnswer();
            self.createUpload();
            self.createRichText();
        });

        this.initAvalon();
        this.bindVideoEvent();
        this.bindEvent();

    },
    bindVideoEvent: function() {
        var self = this;
        $(".course_detail_body").on("focus", ".subject_text", function() {

            var attr = $(this).attr("id");
            console.log(attr);
            self.curInput = attr;
            $("#uploadAudio").trigger("click");

        });
    },
    bindEvent: function() {
        var self = this;
        $(".course_detail_body").on("click", ".q_submit", function() {
            var contentList = self.vm.detail.contentList;
            var item = $(this).parents(".query_item");
            var type = item.attr("type");
            var qid = item.attr("qid");
            var array = [];
            if (type !== "3") {

                var opts = $("#query_item_" + qid + "_" + type).find("input");
                opts.each(function() {
                    if ((this.type === "checkbox" || this.type === "radio") && this.checked) {
                        array.push(this.value);
                    } else if (this.type === "text") {
                        array.push(this.value);
                    }

                });
            } else {
                //var val = $("#query_item_" + qid + "_" + type).find(".subject_text").val();
                var val = UE.getEditor("container_"+qid).getContent();
                array.push(val);
            }

            var params = {
                questionType: type,
                questionId: qid,
                answerContent: array.join("|"),
                segmentId: self.segmentId
            }
            var _this = $(this);
            
            self.httpAnswerQuestion(params, function(data) {
                _this.remove();
                $("#query_item_" + qid + "_" + type).find(".btn_angly").show();
                $("#query_item_" + qid + "_" + type).find(".btn_look").show();
                var result = "";
                if (data.type === "1") {

                    result = data.rightOptions.replace("|", " ");

                } else if (data.type === "2") {
                    for (var i = 0; i < data.rightFilingList.length; i++) {
                        result += data.rightFilingList[i].value;
                    }
                } else if (data.type === "3") {
                    var typeObj = J.checkContent(data.rightContent);
                    result = typeObj.html;
                }
                item.find(".resultc").html(result);
            });
        });

        $(".course_detail_body").on("mouseout", ".btn_angly", function() {
            layer.closeAll();
            self.vm.isshow = false;
        });
    },
    createUpload: function() {
        var self = this;
        self.upload = new J.Upload({
            browseButton: "uploadAudio",
            container: "uploadAudioContainer",
            complete: function(files) {
                var path = files.pop().path;
                $("#" + self.curInput).val(path);
            }
        });
    },
    initAvalon: function() {
        var self = this;
        var myCourse = store.get("mycourse");
        this.vm = avalon.define({
            $id: "courseDetailStudent",
            mycourse: myCourse,
            cacheList: [], //备份问题列表 解析正确答案
            detail: {
                endTime: "",
                name: "",
                request: "",
                startTime: "",
                timeBound: 45,
                remainTime: 0,
                viewTime: "",
                contentList: [],
                segmentModuleList: []
            },
            segmentId: "",
            isshow: false,
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
            ask: function() {
                self.showAsk();
            },
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
                } else if (item.type === "3") {
                    qid = item.subjectiveQuestion.subjectiveQuestionId;
                }
                self.httpAnalyze(qid, item.type, function() {
                    var html = $(".slide_down").html();
                    layer.tips(html, '#btn_angly_' + qid, {
                        tips: [3, "#666363"],
                        time: 0
                    });
                })
            },
            look: function(item) {
                item.toggle = !item.toggle;
            }

        })
        avalon.scan();
    },
    timing: function() {
        var self = this;
        self._time = setInterval(function() {
            if (self.vm.detail.remainTime > 0) {
                self.vm.detail.remainTime -= 1;
                //console.log(self.vm.detail.remainTime);
                self.vm.detail.viewTime = J.toTime(self.vm.detail.remainTime);
            } else {
                clearInterval(self._time);
            }
        }, 1000);
    },
    createRichText:function(){
        $(".ueditor").each(function(){
            var id = $(this).attr("id");
            UE.getEditor(id, {initialFrameWidth: 400,
                initialFrameHeight: 140});
        });
    },
    showAsk: function() {
        var self = this;
        layer.open({
            type: 1,
            title: '提问',
            area: ['600px', '500px'],
            content: '<script  id="container_ask" name="container_ask" class="ueditor" type="text/plain"></script>',
            //btn: ['清除', '保存'],
            btn: ['提问'],
            zIndex:500,
            yes: function() {
                var val = UE.getEditor("container_ask").getContent();
                self.httpSend(self.vm.segmentId, val, function() {
                    layer.closeAll();
                });
            }
        });
       
        $("#container_ask").show();
        setTimeout(function() {
            UE.delEditor('container_ask');
            UE.getEditor("container_ask", {
                initialFrameWidth: 600,
                initialFrameHeight: 250
            });
        }, 300);


    },
    //设置答案 选择题 和 填空
    fillAnswer: function() {
        var cacheList = this.vm.cacheList.$model;
        for (var t = 0; t < cacheList.length; t++) {
            var list = cacheList[t].contentList;

            for (var i = 0; i < list.length; i++) {
                if (list[i].contentType === "1") {
                    var ques = list[i].question;
                    var type = ques.type;

                    if (ques.type === '1') {
                        var qid = ques.choiceQuestion.choiceQuestionId;
                        var choiceQuestionType = ques.choiceQuestion.choiceQuestionType;
                        var obj = $("#query_item_" + qid + "_" + type);
                        if (ques.studentAnswer) {
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
                        }


                    } else if (ques.type + "" === '2') {
                        var qid = ques.fillingQuestion.fillingQuestionId;
                        var obj = $("#query_item_" + qid + "_" + type);
                        if (ques.studentAnswer) {
                            var answerContent = ques.studentAnswer.answerContent;
                            var ansList = answerContent.split("|");
                            obj.find(".filling_text").each(function(index, el) {
                                $(this).val(ansList[index]);
                            });
                        }

                    }
                }


            }
        }

    },
    httpChapterSegmentContent: function(callback) {
        var self = this;
        var params = {
            classId: self.classId,
            courseChapterId: self.chapterId,
            segmentType: self.segmentType,
        };
        J.ajax({ url: "/class/course/student/learn", type: "POST" }, params, function(data) {
            $("body").show();
            self.vm.cacheList = J.clone(data.contentList);
            self.vm.segmentId = data.courseChapterSegmentId;

            self.vm.detail.startTime = data.startTime;
            self.vm.detail.endTime = data.endTime;
            self.vm.detail.name = data.name;
            self.vm.detail.request = data.request;
            self.vm.detail.timeBound = data.timeBound;
            self.vm.detail.remainTime = data.timeBound * 60;
            self.vm.detail.userName = data.userName;
            self.vm.detail.contentList = [];
            self.timing();
            for (var i = 0; i < data.contentList.length; i++) {
                var item = data.contentList[i];

                var question = item.question;
                if (item.contentType === "1" && question.type === "2") {
                    //填空题  
                    var fillingQ = question.fillingQuestion;
                    fillingQ.fillingOpts = [];
                    for (var k = 0; k < fillingQ.filingCount; k++) {
                        fillingQ.fillingOpts.push({ val: "" });
                    }
                }
            }

            for (var i = 0; i < data.contentList.length; i++) {
                var item = data.contentList[i];

                var question = item.question;

                if (item.contentType) {
                    //组合题小题处理
                    if (item.contentType === "1" && item.question.type === "4") {
                        var miniList = [];
                        var unionMainQuestionId = item.question.unionQuestion.unionMainQuestionId;
                        for (var k = 0; k < data.contentList.length; k++) {
                            if (data.contentList[k].contentType === "1") {
                                var secondItem = data.contentList[k].question;
                                if (secondItem.type === "1" && unionMainQuestionId === secondItem.choiceQuestion.unionMainQuestionId) {
                                    secondItem['questionType'] = secondItem.type;




                                    miniList.push(secondItem);
                                    data.contentList.splice(k, 1);
                                    k--;
                                } else if (secondItem.type === "2" && unionMainQuestionId === secondItem.fillingQuestion.unionMainQuestionId) {
                                    secondItem['questionType'] = secondItem.type;
                                    //填空题  
                                    /*var fillingQ = secondItem.fillingQuestion;
                                    fillingQ.fillingOpts = [];
                                    for (var k = 0; k < fillingQ.filingCount; k++) {
                                        fillingQ.fillingOpts.push({ val: "" });
                                    }*/
                                    miniList.push(secondItem);
                                    data.contentList.splice(k, 1);
                                    k--;
                                } else if (secondItem.type === "3" && unionMainQuestionId === secondItem.subjectiveQuestion.unionMainQuestionId) {
                                    secondItem['questionType'] = secondItem.type;
                                    miniList.push(secondItem);
                                    data.contentList.splice(k, 1);
                                    k--;
                                }
                            }
                        }


                        item.question.unionQuestion["questionList"] = miniList;
                    }
                    item['toggle'] = false;
                    self.vm.detail.contentList.push(item);
                }
            }
            J.setPoster();
            //self.vm.detail = data;
            setTimeout(function() {
                callback && callback();
            }, 300)
        });
    },
    httpAnswerQuestion: function(params, func) {
        var self = this;
        var params = {
            courseChapterId: parseInt(self.chapterId),
            segmentType: parseInt(self.segmentType),
            questionType: parseInt(params.questionType),
            questionId: parseInt(params.questionId),
            answerContent: params.answerContent,
            segmentId: params.segmentId
        };

        J.ajax({ url: "/class/course/answerQuestion", type: "POST", bodyType: "raw" }, params, function(data) {
            //1成功、2试题不存在，提交失败、3试题重复提交，提交失败
            if (data.status === 2) {
                J.alert("试题不存在");
            } else if (data.status === 3) {
                J.alert("试题重复提交");
            } else {
                J.alert({
                    type: "success",
                    msg: "答题成功",
                    confirmFn: function() {
                        func && func(data);
                    }
                });

            }


        });
    },
    httpSend: function(courseChapterId, content, func) {
        var self = this;

        var params = {
            courseChapterSegmentId: courseChapterId,
            content: content
        };
        if (!params.content) {
            return;
        }
        J.ajax({ url: "/ask/course/send", type: 'GET' }, params, function(data) {

            func && func();
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
            func && func(dataList);
        })
    },
    httpTaskDetail: function(callback) {
        var self = this;
        var params = {
            classId: self.classId,
            courseChapterId: self.chapterId,
            segmentType: self.segmentType,

            segmentId: this.segmentId //任务id
        };
        J.ajax({ url: "/class/course/student/learn", type: "GET" }, params, function(data) {
            self.vm.cacheList = J.clone(data.segmentModuleList);
            self.vm.segmentId = data.courseChapterSegmentId;

            self.vm.detail.startTime = data.startTime;
            self.vm.detail.endTime = data.endTime;
            self.vm.detail.name = data.name;
            self.vm.detail.request = data.request;
            self.vm.detail.timeBound = data.timeBound;
            self.vm.detail.remainTime = data.timeBound * 60;
            self.vm.detail.userName = data.userName;
            self.vm.detail.segmentModuleList = [];
            self.timing();
            for (var t = 0; t < data.segmentModuleList.length; t++) {
                var module = data.segmentModuleList[t];
                for (var i = 0; i < module.contentList.length; i++) {
                    var item = module.contentList[i];

                    var question = item.question;
                    if (item.contentType === "1" && question.type === "2") {
                        //填空题  
                        var fillingQ = question.fillingQuestion;
                        fillingQ.fillingOpts = [];
                        for (var k = 0; k < fillingQ.filingCount; k++) {
                            fillingQ.fillingOpts.push({ val: "" });
                        }
                    }
                }
            }

            for (var i = 0; i < data.segmentModuleList.length; i++) {
                var item = data.segmentModuleList[i];
                var qustionList = item.contentList;

                for (var j = 0; j < qustionList.length; j++) {
                    if (qustionList[j].contentType == "1") {
                        var quesItem = qustionList[j].question;
                        quesItem['toggle'] = false;
                        //组合题小题处理
                        if (quesItem.type === "4") {
                            var unionMainQuestionId = quesItem.unionQuestion.unionMainQuestionId;
                            var miniList = self.dowithUnion(unionMainQuestionId, data.segmentModuleList);
                            quesItem.unionQuestion["questionList"] = miniList;
                        }
                    }
                }

                self.vm.detail.segmentModuleList.push(item);
            }
            self.setQuestionNo(self.vm.detail.segmentModuleList);

            J.setPoster();
            //self.vm.detail = data;
            setTimeout(function() {
                callback && callback();
            }, 300)

        });
    },
    setQuestionNo:function(list){
        var mylist = list.$model;
        
        for(var i=0;i<mylist.length;i++){
            var contentList = mylist[i].contentList;
            var num = 0;
            for(var j=0;j<contentList.length;j++){
                var contentItem = contentList[j];
                if(contentItem.contentType =="1"){
                    //富文本 不需要题号
                    if(contentItem.questionType =="4" && !contentItem.question.unionQuestion){

                    }else{
                        contentItem["no"] = ++num;
                    }
                }
            }   
        }
        
        this.vm.detail.segmentModuleList = mylist;
    },
    dowithUnion: function(unionMainQuestionId, list) {
        var miniList = [];
        for (var k = 0; k < list.length; k++) {
            var quesItem = list[k];
            var qustionList = quesItem.contentList;
            for (var j = 0; j < qustionList.length; j++) {
                if (qustionList[j].contentType == "1") {
                    var secondItem = qustionList[j].question;
                    if (secondItem.type === "1" && unionMainQuestionId === secondItem.choiceQuestion.unionMainQuestionId) {
                        secondItem['questionType'] = secondItem.type;
                        secondItem['toggle'] = false;
                        miniList.push(secondItem);
                        qustionList.splice(j, 1);
                        j--;
                    } else if (secondItem.type === "2" && unionMainQuestionId === secondItem.fillingQuestion.unionMainQuestionId) {
                        secondItem['questionType'] = secondItem.type;
                        secondItem['toggle'] = false;
                        miniList.push(secondItem);
                        qustionList.splice(j, 1);
                        j--;
                    } else if (secondItem.type === "3" && unionMainQuestionId === secondItem.subjectiveQuestion.unionMainQuestionId) {
                        secondItem['questionType'] = secondItem.type;
                        secondItem['toggle'] = false;
                        miniList.push(secondItem);
                        qustionList.splice(j, 1);
                        j--;
                    }
                }
            }
        }
        return miniList;
    },

});
var f = new CourseDetailStudent();
