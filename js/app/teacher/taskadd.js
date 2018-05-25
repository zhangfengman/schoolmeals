var TaskAdd = new J.Class({
    init: function(arg) {
        "use strict";
        this.vm = null;
        this.pageIndex = 1;
        this.pageNumber = 2;
        this.tagId = J.getQueryString("tagid");
        this.segmentId = J.getQueryString("segmentId");
        this.initAvalon();
        this.bindEvent();
        if (this.segmentId != null) {
            this.httpReadTask();
        }


    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "taskAdd",
            task: {
                segmentTagId: self.tagId, //任务标签id
                name: "",
                segmentId: "",
                type: "1",
                segmentModuleList: [{
                        title: "",
                        contentList: [
                            /*
                            {
                                contentId: "129", //内容id。试题时question_id、视频是video_id
                                contentType: "2", //1试题、2视频/音频
                                questionBaseScore: 0,
                                questionTotalScore: 0,
                                questionType: "" //1选择题、2填空题、3主观题、4组合题
                            },
                            {
                                contentId: "172", //内容id。试题时question_id、视频是video_id
                                contentType: "1", //1试题、2视频/音频
                                questionBaseScore: 2,
                                questionTotalScore: 2,
                                questionType: "1" //1选择题、2填空题、3主观题、4组合题
                            },{
                                contentId: "114", //内容id。试题时question_id、视频是video_id
                                contentType: "1", //1试题、2视频/音频
                                questionBaseScore: 2,
                                questionTotalScore: 2,
                                questionType: "2" //1选择题、2填空题、3主观题、4组合题
                            },{
                                contentId: "75", //内容id。试题时question_id、视频是video_id
                                contentType: "1", //1试题、2视频/音频
                                questionBaseScore: 2,
                                questionTotalScore: 2,
                                questionType: "3" //1选择题、2填空题、3主观题、4组合题
                            },{
                                contentId: "82", //内容id。试题时question_id、视频是video_id
                                contentType: "1", //1试题、2视频/音频
                                questionBaseScore: 2,
                                questionTotalScore: 2,
                                questionType: "4" //1选择题、2填空题、3主观题、4组合题
                            }*/
                        ]
                    }

                ]
            },
            chooseType: function(type) {
                self.vm.task.type = type;
                self.vm.task.segmentModuleList = [{
                    title: "",
                    contentList: []
                }];
            },
            addAudio: function(qid) {
                var ll = layer.open({
                    type: 2,
                    title: "媒体选择",
                    shade: 0.8,
                    area: ['800px', '600px'],
                    content: 'audiochoose.html', //iframe的url,
                    end: function() {
                        var chooseList = store.get("chooseVediolist");

                        chooseList = JSON.parse(chooseList);

                        self.addMedia(qid, chooseList);
                    }
                });
                layer.full(ll);
            },
            addTypeQuestion: function() {
                var item = {
                    title: "",
                    contentList: []
                };
                self.vm.task.segmentModuleList.push(item);
            },
            chooseQuestion: function(qid) {
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
                        self.addQue(qid, chooseList);
                    }
                });
                layer.full(ll);
            },
            save: function() {
                self.httpAddTask();
            },
            delquestion: function(index, num) {

                self.vm.task.segmentModuleList[index].contentList.splice(num, 1);
            },
            delTypeQuestion: function(index) {
                if (index > 0) {
                    self.vm.task.segmentModuleList.splice(index, 1);
                }
            },
            fullscreen: function(video) {
                J.showAudio(video.$model);
            }
        });
        avalon.scan();
    },

    bindEvent: function() {
        var self = this;
    },
    addMedia: function(qid, audioList) {
        for (var i = 0; i < audioList.length; i++) {
            var item = audioList[i];

            var obj = {

                contentId: item.videoId, //内容id。试题时question_id、视频是video_id
                contentType: "2", //1试题、2视频/音频
                questionBaseScore: 0,
                questionTotalScore: 0,
                questionType: "", //1选择题、2填空题、3主观题、4组合题,
                video: { name: item.name }
            }

            this.vm.task.segmentModuleList[qid].contentList.push(obj);

        }
    },
    addQue: function(qid, chooseList) {
        
        for (var i = 0; i < chooseList.length; i++) {
            var item = chooseList[i];

            

            var obj = {
                    contentId: item.contentId, //内容id。试题时question_id、视频是video_id
                    contentType: "1", //1试题、2视频/音频
                    questionBaseScore: 0,
                    questionTotalScore: 0,
                    questionType: item.type, //1选择题、2填空题、3主观题、4组合题,
                    question: item
                }
                //处理组合题小题的



            this.vm.task.segmentModuleList[qid].contentList.push(obj);

        }
    },
    selectType: function(type) {
        $(".task-type input").each(function() {
            if (type == $(this).attr("data-tasktype")) {
                this.checked = true;
            } else {
                this.checked = false;
            }
        });
    },

    getContentItem: function(item) {
        var questionObj = item.question;
        if (item.questionType === "1") {
            item['contentId'] = questionObj.choiceQuestion.choiceQuestionId;
            item['questionBaseScore'] = parseInt(questionObj.choiceQuestion.questionBaseScore);
            item['questionTotalScore'] = parseInt(questionObj.choiceQuestion.questionTotalScore);
        } else if (item.questionType === "2") {
            item['contentId'] = questionObj.fillingQuestion.fillingQuestionId;
            item['questionBaseScore'] = parseInt(questionObj.fillingQuestion.questionBaseScore);
            item['questionTotalScore'] = parseInt(questionObj.fillingQuestion.questionTotalScore);

        } else if (item.questionType === "3") {
            item['contentId'] = questionObj.subjectiveQuestion.subjectiveQuestionId;
            item['questionBaseScore'] = parseInt(questionObj.subjectiveQuestion.questionBaseScore);
            item['questionTotalScore'] = parseInt(questionObj.subjectiveQuestion.questionTotalScore);
        } else if (item.questionType === "4") {
            item['contentId'] = questionObj.unionQuestion.unionMainQuestionId;
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

    httpAddTask: function() {

        var params = this.vm.task.$model;

        params = J.clone(params);
        if (params.name == "") {
            J.alert("填写任务名称");
            return;
        }
        debugger;
        var flag = false;
        var list = params.segmentModuleList;
        for (var t = 0; t < list.length; t++) {
            var contentList = list[t].contentList;

            if (contentList.length == 0) {
                J.alert("请添加对应资源");
                flag = true;
                break;
            }
            if (params.type != "1" && list[t].title == "") {
                J.alert("请添加资源名称");
                flag = true;
            }
            var newList = [];
            var tempList = [];
            for (var i = 0; i < contentList.length; i++) {
                newList.push(this.getContentItem(contentList[i]));
                //小题当成普通题
                if (contentList[i].contentType === "1" && contentList[i].question.type === "4") {
                    var unionList = contentList[i].question.unionQuestion.questionList;
                    for (var k = 0; unionList && k < unionList.length; k++) {
                        tempList.push(this.getUnionItem(unionList[k]));
                    }
                }
            }
            list[t].contentList = newList.concat(tempList);
        }
        if (flag) {
            return;
        }


        J.ajax({ url: "/segment/edit", type: 'POST', bodyType: "raw" }, params, function(data) {
            if (data.status == 1) {
                J.goPage("task.html", { "tagId": self.tagId, "type": params.type });
            }
        });

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
    //编辑时返回的json格式和添加数据不同，导致已有的数据没被存上，
    /**
     contentId: "", //内容id。试题时question_id、视频是video_id
     contentType: "1", //1试题、2视频/音频
     questionBaseScore: 0,
     questionTotalScore: 0,
     questionType: "",
    *
    **/

    doWidthData: function(ModuleList) {
        for (var i = 0; i < ModuleList.length; i++) {
            var itemRoot = ModuleList[i];
            var qustionList = itemRoot.contentList;

            for (var j = 0; j < qustionList.length; j++) {
                var item = qustionList[j];
                if (item.contentType == "1") {
                    item['contentId'] = "";
                    var questionObj = qustionList[j].question;
                    item['questionType'] = questionObj.type;

                    if (questionObj.type === "1") {
                        item['contentId'] = questionObj.choiceQuestion.choiceQuestionId;
                        //item.questionBaseScore = parseInt(questionObj.choiceQuestion.questionBaseScore);
                        //item.questionTotalScore = parseInt(questionObj.choiceQuestion.questionTotalScore);

                    } else if (questionObj.type === "2") {
                        item['contentId'] = questionObj.fillingQuestion.fillingQuestionId;
                        //item.questionBaseScore = parseInt(questionObj.fillingQuestion.questionBaseScore);
                       // item.questionTotalScore = parseInt(questionObj.fillingQuestion.questionTotalScore);

                    } else if (questionObj.type === "3") {
                        item['contentId'] = questionObj.subjectiveQuestion.subjectiveQuestionId;
                       // item.questionBaseScore = parseInt(questionObj.subjectiveQuestion.questionBaseScore);
                       // item.questionTotalScore = parseInt(questionObj.subjectiveQuestion.questionTotalScore);

                    } else if (questionObj.type === "4") {
                        item['contentId'] = questionObj.unionQuestion.unionMainQuestionId;
                    }

                } else if (item.contentType == "2") {
                     
                    if(item.video){
                        item['contentId'] = item.video.videoId;
                    };
                    //item['questionType'] = "";
                }
            }

        }
    },
    httpReadTask: function() {
        var self = this;
        J.ajax({ url: "/segment/read", type: 'POST' }, { segmentId: this.segmentId }, function(data) {
            self.vm.task.name = data.name;
            self.vm.task.segmentId = data.segmentId;
            self.vm.task.segmentTagId = data.segmentTagId;
            self.vm.task.segmentModuleList = [];
            //self.vm.task.segmentModuleList = data.segmentModuleList;
            self.vm.task.type = data.type;
            self.selectType(data.type);
            if (data.type != "1") {
                self.doWidthData(data.segmentModuleList);
                
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
                    self.vm.task.segmentModuleList.push(item);
                }
            } else {
                self.vm.task.segmentModuleList = data.segmentModuleList;
            }
            self.setQuestionNo(self.vm.task.segmentModuleList);

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
        this.vm.task.segmentModuleList = mylist;
    }


});
var f = new TaskAdd();
