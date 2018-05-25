var CourseDetail = new J.Class({
    init: function(arg) {

        this.courseId = J.getQueryString("courseid");
        this.chapterId = J.getQueryString("chapterid");
        this.segmentId = J.getQueryString("segmentid");
        this.segmentType = J.getQueryString("segmenttype");
        this.vm = null;
        var self = this;
        self.getCourseChapter(this.courseId);

        this.initAvalon();
        this.bindEvent();
        //self.httpSegmentContent("query");

    },
    bindEvent: function() {
        var self = this;
        $(".course_detail_body").on("click", ".sub_btn", function() {
            var contentList = self.vm.detail.contentList;
            var item = $(this).parents(".query_item");
            var type = item.attr("type");
            var array = [];
            if (type !== "3") {

                var opts = item.find("input");
                opts.each(function() {
                    if ((this.type === "checkbox" || this.type === "radio") && this.checked) {
                        array.push(this.value);
                    } else if (this.type === "text" && this.value !== "") {
                        array.push(this.value);
                    }

                });
            } else {
                var val = item.find(".subject_text").val();
                array.push(val);
            }
            var params = {
                questionType: item.attr("type"),
                questionId: item.attr("qid"),
                answerContent: array.join("|")
            }
            self.httpAnswerQuestion(params);
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
            self.vm.query.segmentType = $(this).val();
            self.httpGetSegmentList();
        });
        $("#courseChapterS").on("change", function() {
            self.vm.query.sourceId = $(this).val();
            self.httpGetSegmentList();
        });


        $("#submitBtn").on("click", function() {
            window.history.go(-1);
        });
    },

    initAvalon: function() {
        var self = this;
        var courseInfo = store.get("_mycourse");
        this.vm = avalon.define({
            $id: "courseDetailStudent",
            courseInfo: courseInfo,
            detail: {
                endTime: "",
                name: "",
                request: "",
                startTime: "",
                timeBound: 45,
                teacherName: "",
                contentList: []
            },
            query: {
                courseId: self.courseId,
                chapterId: "",
                sourceId: self.chapterId,
                segmentType: self.segmentType?self.segmentType:"1",
                testPaperId: "",
                segmentId: self.segmentId
            },
            chapterList: [],
            children: [],
            segmentId: "",
            chooseList: [],
            taskList: [],
            ask: function() {
                self.showAsk();
            },
            queryData: function() {
                self.httpSegmentContent("query");
            }
        })
        avalon.scan();
    },

    httpSegmentContent: function(type) {
        var self = this;
        var params = {};
        if (type == "query") {
            params = {
                courseChapterId: self.vm.query.sourceId,
                segmentType: self.vm.query.segmentType,
                segmentId: self.vm.query.segmentId
            }
        } else {
            params = { courseId: self.courseId }
        }


        J.ajax({ url: "/course/getChapterSegmentContent", type: 'POST' }, params, function(data) {
            self.vm.detail.startTime = data.startTime;
            self.vm.detail.endTime = data.endTime;
            self.vm.detail.name = data.name;
            self.vm.detail.request = data.request;
            self.vm.detail.timeBound = data.timeBound;
            self.vm.detail.teacherName = data.teacherName;
            self.vm.chooseList = [];
            if(!data.segmentModuleList){
                return;
            }
            for (var i = 0; i < data.segmentModuleList.length; i++) {
                var item = data.segmentModuleList[i];
                var qustionList = item.contentList;
                for (var j = 0; j < qustionList.length; j++) {
                    if (qustionList[j].contentType == "1") {
                        var quesItem = qustionList[j].question;
                        //组合题小题处理
                        if (quesItem.type === "4") {
                            var unionMainQuestionId = quesItem.unionQuestion.unionMainQuestionId;
                            var miniList = self.dowithUnion(unionMainQuestionId, data.segmentModuleList);
                            quesItem.unionQuestion["questionList"] = miniList;
                        }
                    }
                }
                self.vm.chooseList.push(item);
            }
            self.setQuestionNo(self.vm.chooseList);

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
        
        this.vm.chooseList = mylist;
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
                        miniList.push(secondItem);
                        qustionList.splice(j, 1);
                        j--;
                    } else if (secondItem.type === "2" && unionMainQuestionId === secondItem.fillingQuestion.unionMainQuestionId) {
                        secondItem['questionType'] = secondItem.type;
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
        }
        return miniList;
    },
    httpAnswerQuestion: function(params) {
        var self = this;
        var params = {
            courseChapterId: parseInt(self.chapterId),
            segmentType: parseInt(self.segmentType),
            questionType: parseInt(params.questionType),
            questionId: parseInt(params.questionId),
            answerContent: params.answerContent
        };

        J.ajax({ url: "/class/course/answerQuestion", type: "POST", bodyType: "raw" }, params, function(data) {
            //1成功、2试题不存在，提交失败、3试题重复提交，提交失败
            if (data.status === 2) {
                J.alert("试题不存在");
            } else if (data.status === 3) {
                J.alert("试题重复提交");
            } else {
                J.alert("答题成功");
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
    getCourseChapter: function(courseId) {
        var self = this;
        var params = { courseId: courseId };
        J.getCourseChapter(params, function(data) {
            self.vm.chapterList = data.courseChapterList;
            var list = self.vm.chapterList.$model;
            if (list.length > 0) {
                self.vm.children = list[0].childList;
                self.vm.query.chapterId = list[0].courseChapterId;
                if (list[0].childList.length > 0) {
                    if(!self.chapterId){
                        self.vm.query.sourceId = list[0].childList[0].courseChapterId;
                    }else{
                        self.vm.query.sourceId = self.chapterId;
                    }
                    
                    self.httpGetSegmentList();
                }
            }

        });
    },
    httpGetSegmentList: function() {
        var self = this;
        var params = {
            courseChapterId: self.vm.query.sourceId,
            segmentType: self.vm.query.segmentType
        };
        J.ajax({ url: "/course/getSegmentList", type: 'GET' }, params, function(data) {
            
            self.vm.taskList = [];
            if(data.segmentList){
            self.vm.taskList = data.segmentList;
            if(self.vm.taskList.length >0){
                
                self.vm.query.segmentId = self.vm.taskList[0].segmentId;
                
                
                self.httpSegmentContent("query");
            }}

        });
    }
});
var f = new CourseDetail();
