var EditLesson = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.courseId = J.getQueryString("courseid");
        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        this.getCourseChapter();
        this.initChapter();


    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "editlesson",
            courseChapterList: [],
            content: {
                startTime: "",
                endTime: "",
                name: "",
                request: "",
                timeBound: "",
                courseChapterSegmentType: "1", //课程环节类型。1课前、2课堂、3课后
                courseChapterId: "",
                //contentList: [],
                segmentList: []
            },
            chooseList: [],
            fullscreen: function(video) {
                J.showAudio(video.$model);
            },
            addTask:function(){
                store.remove("chooselist");
                var ll = layer.open({
                    type: 2,
                    title: "选择任务",
                    shade: 0.8,
                    area: ['800px', '600px'],
                    content: 'taskchoose.html', //iframe的url,
                    end: function() {
                        var chooseList = store.get("chooselist");
                        chooseList = JSON.parse(chooseList);

                        for (var i = 0; i < chooseList.length; i++) {
                            var temp = chooseList[i];
                            self.vm.content.segmentList.push({segmentId:temp.segmentId,name:temp.name});
                        }
                    }
                });
                layer.full(ll);
            },
            del:function(num){
                self.vm.content.segmentList.splice(num, 1);
            },
            preview:function(segmentId){
                var ll = layer.open({
                    type: 2,
                    title: "预览",
                    shade: 0.8,
                    area: ['800px', '600px'],
                    content: 'task_view.html?segmentId='+segmentId, //iframe的url,
                    end: function() {
                        var chooseList = store.get("chooselist");
                        chooseList = JSON.parse(chooseList);
                        for (var i = 0; i < chooseList.length; i++) {
                            self.vm.chooseList.push({ contentType: "1", question: chooseList[i] });
                        }
                    }
                });
                layer.full(ll);
            }
        })
        avalon.scan();
    },

    initChapter: function() {
        var self = this;
        this.chapter = new J.Chapter({
            type: "manage",
            courseId: this.courseId,
            update: function() {
                self.getCourseChapter();
            },
            change: function(pid, id) {
                self.vm.content.courseChapterId = id;
                self.httpSegmentContent();
            }
        });
    },
    bindEvent: function() {
        var self = this;
        $(".block-c").on("click", function() {
            J.goPage("editlesson.html");
        });
        $("#savebtn").on("click", function() {
            self.httpEditContent();
        });
        $("#addquestion").on("click", function() {
            store.remove("chooselist");
            var ll = layer.open({
                type: 2,
                title: "题库选择",
                shade: 0.8,
                area: ['800px', '600px'],
                content: 'questionschoose.html', //iframe的url,
                end: function() {
                    var chooseList = store.get("chooselist");
                    chooseList = JSON.parse(chooseList);

                    for (var i = 0; i < chooseList.length; i++) {
                        self.vm.chooseList.push({ contentType: "1", question: chooseList[i] });
                    }
                }
            });
            layer.full(ll);
        });
        $("#addvideo").on("click", function() {
            store.remove("chooseVediolist");
            var ll = layer.open({
                type: 2,
                title: "媒体选择",
                shade: 0.8,
                area: ['800px', '600px'],
                content: 'audiochoose.html', //iframe的url,
                end: function() {
                    var chooseList = store.get("chooseVediolist");
                    chooseList = JSON.parse(chooseList);

                    for (var i = 0; i < chooseList.length; i++) {
                        self.vm.chooseList.push({ contentType: "2", video: chooseList[i] });
                    }
                }
            });
            layer.full(ll);
        });

        $(".chooselist").on("click", ".del_question", function() {
            var unique = $(this).attr("unique");
            self.delQuestion(parseInt(unique));
        });
        $("#segmentType").on("change", function() {
            self.vm.content.courseChapterSegmentType = $(this).val();
            self.httpSegmentContent();
        });
        $(".chooselist").on("keyup", ".q_score", function() {
            this.value = this.value.replace(/[^\d]/g, '');
        });



    },
    delQuestion: function(unique) {
        var list = this.vm.chooseList;
        for (var i = 0; i < list.length; i++) {
            if (unique === i) {
                this.vm.chooseList.splice(i, 1);
                break;
            }
        }
    },
    getContentItem: function(data) {
        var questionObj = data.question;
        var item = {
            contentType: data.contentType,
            contentId: "",
        }

        //试题
        if (data.contentType === "1") {

            item.questionType = questionObj.type;
            if (questionObj.type === "1") {
                item['contentId'] = questionObj.choiceQuestion.choiceQuestionId;
                item.questionBaseScore = parseInt(questionObj.choiceQuestion.questionBaseScore);
                item.questionTotalScore = parseInt(questionObj.choiceQuestion.questionTotalScore);

            } else if (questionObj.type === "2") {
                item['contentId'] = questionObj.fillingQuestion.fillingQuestionId;
                item.questionBaseScore = parseInt(questionObj.fillingQuestion.questionBaseScore);
                item.questionTotalScore = parseInt(questionObj.fillingQuestion.questionTotalScore);

            } else if (questionObj.type === "3") {
                item['contentId'] = questionObj.subjectiveQuestion.subjectiveQuestionId;
                item.questionBaseScore = parseInt(questionObj.subjectiveQuestion.questionBaseScore);
                item.questionTotalScore = parseInt(questionObj.subjectiveQuestion.questionTotalScore);

            } else if (questionObj.type === "4") {
                item['contentId'] = questionObj.unionQuestion.unionMainQuestionId;
            }
        } else {
            item['contentId'] = data.video.videoId;
        }

        return item;
    },
    getUnionItem: function(data) {
        var questionObj = data;
        var item = {
            contentType: "1",
            contentId: "",

            questionType: questionObj.questionType
        }

        if (questionObj.questionType === "1") {
            item['contentId'] = questionObj.choiceQuestion.choiceQuestionId;
            item['questionBaseScore'] = parseInt(questionObj.choiceQuestion.questionBaseScore);
            item['questionTotalScore'] = parseInt(questionObj.choiceQuestion.questionTotalScore);
        } else if (questionObj.questionType === "2") {
            item['contentId'] = questionObj.fillingQuestion.fillingQuestionId;
            item['questionBaseScore'] = parseInt(questionObj.fillingQuestion.questionBaseScore);
            item['questionTotalScore'] = parseInt(questionObj.fillingQuestion.questionTotalScore);

        } else if (questionObj.questionType === "3") {
            item['contentId'] = questionObj.subjectiveQuestion.subjectiveQuestionId;
            item['questionBaseScore'] = parseInt(questionObj.subjectiveQuestion.questionBaseScore);
            item['questionTotalScore'] = parseInt(questionObj.subjectiveQuestion.questionTotalScore);
        } else if (questionObj.questionType === "4") {
            item['contentId'] = questionObj.unionQuestion.unionMainQuestionId;
        }

        return item;
    },
    checkScore: function() {
        var flag = true;
        $(".q_score").each(function() {
            if (this.value == "" || this.value == 0) {
                flag = false;
                return;
            }
        });
        return flag;
    },
    //
    httpEditContent: function() {
        var self = this;
        var params = self.vm.content.$model;
        var chooseList = self.vm.chooseList.$model;
        if (!params.courseChapterId) {
            J.alert("请选中章节");
            return;
        }
        var vform = new J.Vform({
            id: "editlesson",
            rowq: ".jrow"
        });

        var validRs = vform.validate();
        if (!validRs) {
            return;
        }
        //开始时间小于结束时间 控制
        if (Date.parse(params.startTime) > Date.parse(params.endTime)) {
            J.alert("开始时间应该小于结束时间");
            return;
        }
        //判断基础分和题面分
        if (!self.checkScore()) {
            J.alert("请录入分值");
            return;
        }

        /*
        for (var i = 0; i < chooseList.length; i++) {
            params.contentList.push(this.getContentItem(chooseList[i]));
            //小题当成普通题
            if (chooseList[i].contentType === "1" && chooseList[i].question.type === "4") {
                var unionList = chooseList[i].question.unionQuestion.questionList;
                for (var k = 0; k < unionList.length; k++) {
                    params.contentList.push(this.getUnionItem(unionList[k]));
                }
            }
        }
        */

        J.ajax({ url: "/course/editCourseChapterSegmentContent", type: 'POST', bodyType: 'raw' }, params, function(data) {
            J.goPage("mylesson.html", { classid: self.classId });
        });
    },

    getCourseChapter: function() {
        var self = this;
        var params = { courseId: this.courseId };
        J.getCourseChapter(params, function(data) {
            self.vm.courseChapterList = [];
            self.vm.courseChapterList = data.courseChapterList;
            self.chapter.setData(data.courseChapterList);

            //初始化章节值
            if (data.courseChapterList.length > 0) {
                if (data.courseChapterList[0].childList && data.courseChapterList[0].childList.length > 0) {
                    self.vm.content.courseChapterId = data.courseChapterList[0].childList[0].courseChapterId;
                    self.chapter.checked(data.courseChapterList[0].courseChapterId, self.vm.content.courseChapterId);
                }
            }
            self.httpSegmentContent();
            $("body").show();
        });
    },

    //
    httpSegmentContent: function() {

        var self = this;
        if (!self.vm.content.courseChapterId) {
            return;
        }
        this.httpGetSegmentList();
        return ;
        var params = {
            courseChapterId: self.vm.content.courseChapterId,
            segmentType: self.vm.content.courseChapterSegmentType
        }
        J.ajax({ url: "/course/getChapterSegmentContent", type: 'POST' }, params, function(data) {
            if (data.name) {
                self.vm.content.startTime = data.startTime;
                self.vm.content.endTime = data.endTime;
                self.vm.content.name = data.name;
                self.vm.content.request = data.request;
                self.vm.content.timeBound = data.timeBound;
            } else {
                self.vm.content.startTime = "";
                self.vm.content.endTime = "";
                self.vm.content.name = "";
                self.vm.content.request = "";
                self.vm.content.timeBound = "";
            }
            self.vm.chooseList = [];
            if (!data.contentList) {
                return;
            }
            for (var i = 0; i < data.contentList.length; i++) {
                var item = data.contentList[i];
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
                                } else if (secondItem.type === "2" && unionMainQuestionId === secondItem.fillingQuestion.unionMainQuestionId) {
                                    secondItem['questionType'] = secondItem.type;
                                    miniList.push(secondItem);
                                    data.contentList.splice(k, 1);
                                } else if (secondItem.type === "3" && unionMainQuestionId === secondItem.subjectiveQuestion.unionMainQuestionId) {
                                    secondItem['questionType'] = secondItem.type;
                                    miniList.push(secondItem);
                                    data.contentList.splice(k, 1);
                                }
                            }
                        }

                        item.question.unionQuestion["questionList"] = miniList;
                    }
                    self.vm.chooseList.push(item);
                }
            }

        });
    },
    httpGetSegmentList: function() {
        var self = this;
        var params = {
            //courseId:""
            courseChapterId: self.vm.content.courseChapterId,
            segmentType: self.vm.content.courseChapterSegmentType
        }
        J.ajax({ url: "/course/getSegmentList", type: 'POST' }, params, function(data) {
            
            if (data.name) {
                self.vm.content.startTime = data.startTime;
                self.vm.content.endTime = data.endTime;
                self.vm.content.name = data.name;
                self.vm.content.request = data.request;
                self.vm.content.timeBound = data.timeBound;
            } else {
                self.vm.content.startTime = "";
                self.vm.content.endTime = "";
                self.vm.content.name = "";
                self.vm.content.request = "";
                self.vm.content.timeBound = "";
            }
            self.vm.content.segmentList = [];
            if(data.segmentList){
                self.vm.content.segmentList = data.segmentList;
            }
            
        })
    }



});
var f = new EditLesson();
