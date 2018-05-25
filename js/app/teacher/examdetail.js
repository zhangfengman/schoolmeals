var ExamDetail = new J.Class({
    init: function(arg) {
        this.paperId = J.getQueryString("paperid");

        this.vm = null;
        this.bindEvent();
        this.initAvalon();
        var self = this;
        this.httpQuery();
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
                classTestPaperId: 0
            }

        })
        avalon.scan();
    },

    bindEvent: function() {
        var self = this;
        $("#submitBtn").on("click", function() {
            window.history.go(-1);
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

    httpQuery: function() {
        var self = this;
        var params = {
            testPaperId: self.paperId
        };
        J.ajax({ url: "/testPaper/read", type: 'POST' }, params, function(data) {
            $("body").show();

            var exam = self.vm.exam;
            exam.title = data.title;
            exam.requireUseTime = data.requireUseTime;
            exam.subTitle = data.subTitle;
            exam.testPaperTypeName = data.testPaperTypeName;
            exam.subjectName = data.subjectName;
            exam.testPaperId = data.testPaperId;
            exam.classTestPaperId = data.classTestPaperId;
            self.vm.moduleList = [];
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
                self.vm.moduleList.push(item);
                $("body").show();
            }
        });
    },




});
var f = new ExamDetail();
