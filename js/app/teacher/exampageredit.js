var ExamPagerEdit = new J.Class({
    init: function(arg) {
        this.paperId = J.getQueryString("paperid");
        this.iscopy = J.getQueryString("iscopy");
        this.tagId = J.getQueryString("tagid");
        this.vm = null;
        this.pageIndex = 1;
        this.pageNumber = 0;
        this.lock = false;
        this.initAvalon();
        this.initPage();
        this.bindEvent();
        this.httpsysData();
        this.httpGetTypes();
        if (this.paperId) {
            this.httpQuery();
        } else {
            $("body").show();
        }


    },
    bindEvent: function() {
        var self = this;
        $(".create_exam").on("click", function() {
            self.httpEdit();
        });


    },
    initPage: function() {
        var self = this;
        var page = new J.Page({
            cid: "paging",
            total: 0,
            change: function(pageData) {
                self.pageIndex = pageData.curPage;
                self.pageNumber = pageData.pageSize;
                self.httpPaperList();
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "exampageredit",
            grades: [],
            subjects: [],
            testPaperTypeList: [],
            testPaperList: [{
                title: "",
                qustionList: []
            }],
            examPager: {
                gradeId: "",
                requireUseTime: 90,
                subTitle: "",
                subjectId: "",
                title: "",
                testPaperTagId:self.tagId,
                testPaperTypeName: "",
                testPaperModuleList: []
            },

            addQuestion: function(qid) {

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
                            self.vm.testPaperList[qid].qustionList.push(chooseList[i]);
                        }

                    }
                });
                layer.full(ll);
            },
            addTypeQuestion: function() {
                self.vm.testPaperList.push({
                    title: "",
                    qustionList: []
                });
            },
            delTypeQuestion: function(index) {
                if (index > 0) {
                    self.vm.testPaperList.splice(index, 1);
                }


            },
            delquestion: function(index, num) {
                var list = self.vm.testPaperList.$model;
                self.vm.testPaperList[index].qustionList.splice(num, 1);
            }


        })
        avalon.scan();
    },
    httpsysData: function() {
        var self = this;
        J.getsysData("[subjects','grades']", function(data) {
            self.vm.subjects = data.subjects;
            self.vm.grades = data.grades;
        });
    },
    httpGetTypes: function() {
        var self = this;
        J.ajax({ url: "/testPaper/getTypes", type: 'GET' }, null, function(data) {

            self.vm.testPaperTypeList = data.testPaperTypeList;
        });
    },
    getContentItem: function(data) {
        var questionObj = data;
        var item = {
                "questionId": 0,
                "questionTotalScore": 0,
                "questionType": 1
            }
            //试题
        item.questionType = questionObj.type;
        if (questionObj.type === "1") {
            item['questionId'] = questionObj.choiceQuestion.choiceQuestionId;
            item['questionTotalScore'] = questionObj.choiceQuestion.questionTotalScore;
        } else if (questionObj.type === "2") {
            item['questionId'] = questionObj.fillingQuestion.fillingQuestionId;
            item['questionTotalScore'] = questionObj.fillingQuestion.questionTotalScore;
        } else if (questionObj.type === "3") {
            item['questionId'] = questionObj.subjectiveQuestion.subjectiveQuestionId;
            item['questionTotalScore'] = questionObj.subjectiveQuestion.questionTotalScore;
        } else if (questionObj.type === "4") {
            item['questionId'] = questionObj.unionQuestion.unionMainQuestionId;
            item['questionTotalScore'] = questionObj.unionQuestion.questionTotalScore;
        }
        item.questionType = parseInt(item.questionType);
        return item;
    },

    getUnionItem: function(data) {
        var questionObj = data;
        var item = {
            "questionId": 0,
            "questionTotalScore": 0,
            "questionType": questionObj.questionType
        }

        if (questionObj.questionType === "1") {
            item['questionId'] = questionObj.choiceQuestion.choiceQuestionId;
            item['questionTotalScore'] = questionObj.choiceQuestion.questionTotalScore;

        } else if (questionObj.questionType === "2") {
            item['questionId'] = questionObj.fillingQuestion.fillingQuestionId;
            item['questionTotalScore'] = questionObj.fillingQuestion.questionTotalScore;

        } else if (questionObj.questionType === "3") {
            item['questionId'] = questionObj.subjectiveQuestion.subjectiveQuestionId;
            item['questionTotalScore'] = questionObj.subjectiveQuestion.questionTotalScore;
        } else if (questionObj.questionType === "4") {
            item['questionId'] = questionObj.unionQuestion.unionMainQuestionId;
            item['questionTotalScore'] = questionObj.unionQuestion.questionTotalScore;
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
     checkTitle: function() {
        var flag = true;
        $(".q_question_t").each(function() {
            if (this.value == "" || this.value == 0) {
                flag = false;
                return;
            }
        });
        return flag;
    },
    httpEdit: function() {
        var self = this;
        var params = self.vm.examPager.$model;
        //复制时，不传id
        if (self.iscopy === "1") {
            params["testPaperId"] = "";
        }

        var vform = new J.Vform({
            id: "exam_form",
            rowq: ".jrow"
        });
        var validRs = vform.validate();
        if (!validRs) {
            return;
        }

         //判断基础分和题面分
        if(!self.checkScore()){
            J.alert("请录入分值");
            return;
        }
         //判断标题
        if(!self.checkTitle()){
            J.alert("请录入试题类型名称");
            return;
        }


        //试题置空
        params.testPaperModuleList = [];
        var testPaperList = self.vm.testPaperList.$model;
        for (var i = 0; i < testPaperList.length; i++) {
            var list = testPaperList[i].qustionList;
            var newList = [];
            for (var k = 0; k < list.length; k++) {
                newList.push(this.getContentItem(list[k]));
                //小题当成普通题
                if (list[k].type === "4") {
                    var unionList = list[k].unionQuestion.questionList;
                    //富文本题判断
                    if(unionList){
                        for (var j = 0 ; j < unionList.length; j++) {
                            newList.push(this.getUnionItem(unionList[j]));
                        }
                    }
                    
                }
            }
            params.testPaperModuleList.push({
                title: testPaperList[i].title,
                qustionList: newList,
            });
        }
       
        if(this.lock){
            return;
        }
        this.lock = true;
        J.ajax({ url: "/testPaper/edit", type: 'POST', bodyType: "raw" }, params, function(data) {
            self.lock = false;
            if(data.status == "1"){
                J.goPage("exampager.html");
            }else if(data.status == "2"){
                J.alert("已开始不能修改");
            }          

        });
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
    httpQuery: function() {
        var self = this;
        var params = {
            testPaperId: self.paperId
        };
        J.ajax({ url: "/testPaper/read", type: 'POST' }, params, function(data) {
            $("body").show();
            self.vm.examPager = data;
            self.vm.testPaperList = [];
            for (var i = 0; i < data.testPaperModuleList.length; i++) {
                var item = data.testPaperModuleList[i];
                var qustionList = item.qustionList;
                for (var j = 0; j < qustionList.length; j++) {
                    var quesItem = qustionList[j];
                    //组合题小题处理
                    if (quesItem.type === "4") {
                        var unionMainQuestionId = quesItem.unionQuestion.unionMainQuestionId;
                        var miniList = self.dowithUnion(unionMainQuestionId, data.testPaperModuleList);
                        quesItem.unionQuestion["questionList"] = miniList;
                    }
                }
                self.vm.testPaperList.push(item);
                $("body").show();
            }
        });
    }


});
var f = new ExamPagerEdit();
