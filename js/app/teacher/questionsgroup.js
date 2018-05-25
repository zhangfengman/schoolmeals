var QuestionGroup = new J.Class({
    init: function(arg) {
        this.vm = null;
        this.UEs = {};
        this.query = store.get("queryq");
        this.qid = J.getQueryString("qid");
        this.initAvalon();



        if (this.qid) {
            this.initTree();
            this.httpGetQuestion();
        } else {
            $("#treeDemo").css("display", "none");
            this.initUEditor();
        }


        this.bindEvent();
        this.bindVideoEvent();
        this.bindOptionEvent();
        var self = this;
        this.upload = new J.Upload({
            browseButton: "uploadAudio",
            container: "uploadAudioContainer",
            complete: function(files) {
                var path = files.pop().path;
                var list = self.vm.questionList;
                if (self.curInput === "mainContent") {
                    self.vm.mainContent = path;
                } else {
                    var attrs = self.curInput.split("_");
                    for (var i = 0; i < list.length; i++) {
                        if (i == attrs[0]) {
                            list[i].question[attrs[1]] = path;
                        }
                    }

                }

            }
        });

    },
    initTree: function() {
        var self = this;
        var tagId = "";

        var tree = new J.JTree({
            type: "1",
            tagId: tagId,
            func: function(tagId) {

                self.query.questionTagId = tagId;
            }
        });

    },
    initUEditor: function() {
        this.createUEditor("container_main");
        this.createUEditor("container_0");

    },
    createUEditor: function(id) {
        this.UEs[id] = UE.getEditor(id);
    },
    getContent: function(id) {
        return UE.getEditor(id).getContent();
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "questiongroup",
            mainContent: "",
            questionList: [{
                question: {

                    questionId: "",
                    mainContent: "",
                    rightContent: "",
                    level: 1,
                    optionsContent: [],
                    option: "",
                    content: "",
                    placerightContent: "",
                    placemainContent: ""
                },
                toggle: true,
                questionType: "1"
            }]
        });
        avalon.scan();
    },
    bindVideoEvent: function() {
        var self = this;
        $(".question_add").on("focus", ".videoInput", function() {

            var attr = $(this).attr("id");
            console.log(attr);
            self.curInput = attr;

        });
    },
    bindEvent: function() {
        var self = this;
        $(".add_question_btn").on("click", function() {
            self.addQuestion();
        });
        $(".questionlist").on("click", ".question_delete", function() {
            self.removeQuestion(this);

        });
        $(".questionlist").on("click", ".question_type_checkbox li", function() {
            //var type = $(this).attr("data-questiontype");
            var type = $(this).attr("data-questiontype");
            var num = $(this).parents(".question_item").attr("itemid");
            self.vm.questionList[num].questionType = type;
            self.vm.questionList[num].question.placerightContent = "";
            self.vm.questionList[num].question.placemainContent = "";
            var ueanswerId = 'container_answer_' + num;
            var ueId = 'container_' + num;
            if (type === "1" || type === "2") {
                self.vm.questionList[num].toggle = true;
                if (type == "2") {

                    self.vm.questionList[num].question.placerightContent = "多选正确答案用|隔开.如A|B";
                }
                $("#" + ueId).show();
                setTimeout(function() {
                    self.createUEditor(ueId);
                }, 500);
            } else {

                self.vm.questionList[num].toggle = false;



                //主观题 答案 富文本
                if (type == "4") {
                    $("#" + ueanswerId).show();
                    setTimeout(function() {
                        self.createUEditor(ueanswerId);
                    }, 500);


                    $("#" + ueId).show();
                    setTimeout(function() {
                        self.createUEditor(ueId);
                    }, 500);

                } else {
                    if (self.UEs[ueanswerId]) {
                        UE.getEditor(ueanswerId).destroy();
                        $("#" + ueanswerId).hide();
                    }
                    self.vm.questionList[num].question.placemainContent = '空格用"_"代替';
                    //填空题 题面不是富文本
                    if (self.UEs[ueId]) {
                        UE.getEditor(ueId).destroy();
                        $("#" + ueId).hide();
                    }

                }


            }
            $(this).addClass("checked").siblings().removeClass("checked");
        });
        $(".questionlist").on("click", ".question_level_checkbox li", function() {
            var level = $(this).attr("data-questionlevel");
            var num = $(this).parents(".question_item").attr("itemid");
            self.vm.questionList[num].question.level = level;
            $(this).addClass("checked").siblings().removeClass("checked");
        });


        $("#savebtn").on("click", function() {

            self.httpEditUnionQuestion();
        });
    },
    //绑定添加选项事件
    bindOptionEvent: function() {
        var self = this;
        $(".questionlist").on("change", ".mulselect", function() {
            var item = $(this).parents(".question_item");
            var num = item.attr("itemid");
            var selectedObj = item.find("option:selected");
            var curItem = self.vm.questionList[num].question;
            curItem.option = selectedObj.val();;
            curItem.content = selectedObj.text();
        });
        $(".questionlist").on("click", ".select_del", function() {
            var selectedObj = $(this).parents(".question_item").find("option:selected");
            var option = "";
            if (selectedObj.length === 0) {
                J.alert("请选中编辑的项");
                return;
            } else {
                option = selectedObj.val();
            }
            var num = $(this).parents(".question_item").attr("itemid");
            var curItem = self.vm.questionList[num].question;
            for (var i = 0; i < curItem.optionsContent.length; i++) {
                if (option === curItem.optionsContent[i].option) {
                    curItem.optionsContent.splice(i, 1);
                    break;
                }
            }

        });
        $(".questionlist").on("click", ".select_confirm", function() {
            var num = $(this).parents(".question_item").attr("itemid");
            var curItem = self.vm.questionList[num].question;
            var flag = false;
            for (var i = 0; i < curItem.optionsContent.length; i++) {
                if (curItem.option === curItem.optionsContent[i].option) {
                    curItem.optionsContent[i].content = curItem.content;
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                curItem.optionsContent.push({
                    option: curItem.option,
                    content: curItem.content
                });
            }

        });
    },
    addQuestion: function() {
        this.vm.questionList.push(this.getObj());
        this.createUEditor("container_" + (this.vm.questionList.length - 1));
    },
    removeQuestion: function(_this) {
        var item = $(_this).parents(".question_item");
        var num = item.attr("itemid");
        this.vm.questionList.splice(num, 1);
        item.remove();
    },
    getObj: function(type) {
        var commonObj = {
            question: {
                questionId: "",
                mainContent: "",
                rightContent: "",
                level: 1,
                optionsContent: [],
                option: "",
                content: "",
                placerightContent: "",
                placemainContent: ""
            },
            toggle: true,
            questionType: "1"
        };
        return commonObj;
    },
    httpEditUnionQuestion: function() {
        var self = this;
        var list = self.vm.questionList;
        var flag = true;
        var paramList = [];
        //

        //获取主题面
        self.vm.mainContent = self.getContent("container_main");
        if (self.vm.mainContent == "") {
            J.alert("主题面不能为空");
            flag = false;
            return;
        }
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var question = item.question;
            if (item.questionType != "3") {
                question.mainContent = self.getContent("container_" + i);

            }

            if (question.mainContent == "") {
                J.alert("题面不能为空");
                flag = false;
                break;
            }
            if (item.questionType == "4") {
                question.rightContent = self.getContent("container_answer_" + i);
            }
            if (question.rightContent == "") {
                J.alert("正确答案不能为空");
                flag = false;
                break;
            }
            if (item.questionType === "1" || item.questionType === "2") {
                if (question.optionsContent.length == 0) {
                    J.alert("选项不能为空");
                    flag = false;
                    break;
                }

                if ("2" === item.questionType) {
                    if (item.question.rightContent.indexOf("|") < 0) {
                        J.alert("多选题，正确答案格式不对");
                        flag = false;
                        break;
                    }
                }
                paramList.push({
                    questionType: "1",
                    choiceQuestion: {
                        mainContent: question.mainContent,
                        rightOptions: question.rightContent,
                        level: parseInt(question.level),
                        optionsContent: question.optionsContent
                    }
                });
            } else if (item.questionType === "3") {

                var spacenum = question.mainContent.split("_").length - 1;
                var valArray = question.rightContent.split("|");

                if (question.mainContent.indexOf("_") < 0) {
                    J.alert("填空题格式不对");
                    flag = false;
                    break;
                }
                if (question.rightContent.indexOf("|") < 0 && spacenum > 1) {
                    J.alert("填空题答案不对");
                    flag = false;
                    break;
                }
                if (valArray.length != spacenum) {
                    J.alert("填空题 填空位置和答案不匹配");
                    flag = false;
                    break;
                }

                var rightFilings = [];
                for (var k = 0; k < valArray.length; k++) {
                    rightFilings.push({
                        "key": k + 1,
                        "value": valArray[k]
                    });
                }
                paramList.push({
                    questionType: "2",
                    fillingQuestion: {
                        level: parseInt(question.level),
                        mainContent: question.mainContent,
                        rightFilings: rightFilings
                    }
                });
            } else if (item.questionType === "4") {



                paramList.push({
                    questionType: "3",
                    subjectiveQuestion: {
                        level: parseInt(question.level),
                        mainContent: question.mainContent,
                        rightContent: question.rightContent
                    }
                });
            }
        }
        if (!flag) {
            return;
        }
        var questionGroup = {

            tagId: self.query.questionTagId,
            mainContent: self.vm.mainContent,
            questionList: paramList
        }
        if (this.qid) {
            questionGroup['unionMainQuestionId'] = this.qid;
        }
        J.ajax({ url: "/question/editUnionQuestion", type: 'POST', bodyType: 'raw' }, questionGroup, function(data) {
            
            if (data.resultCode == 1 || data.resultCode == 0) {
                J.goPage("questionsmange.html", { type: 5 });
            } else {
                J.alert("试题已被使用，无法修改");
            }
        });
    },
    checkedQuestionType: function(num, type) {

        //添加的类型  和查询使用的类型 相差1
        var changeData = ["0", "1", "3", "4", "5"];
        var self = this;
        $(".question_item").each(function() {
            var itemid = $(this).attr("itemid");
            if (itemid == num) {
                $(this).find(".question_type_checkbox li").each(function() {
                    var _type = $(this).attr("data-questiontype");
                    if (changeData[type] === _type) {
                        $(this).addClass("checked").siblings().removeClass("checked");
                    }
                });
            }
        });

    },
    //选中等级
    checkedLevel: function(num, level) {
        $(".question_item").each(function() {
            var itemid = $(this).attr("itemid");
            if (itemid == num) {
                $(this).find(".question_level_checkbox li").each(function() {
                    var _level = $(this).attr("data-questionlevel");
                    if (_level === level) {
                        $(this).addClass("current").siblings().removeClass("current");
                    }

                });
            }
        });

    },
    setQuestionTypeForEdit: function(num, item) {
        var self = this;
        var changeData = ["1", "1", "3", "4", "4", "5"];
        var qtype = item.questionType;
        var type = changeData[qtype];
        self.vm.questionList[num].questionType = type;
        self.vm.questionList[num].question.placerightContent = "";
        self.vm.questionList[num].question.placemainContent = "";
        var ueanswerId = 'container_answer_' + num;
        var ueId = 'container_' + num;

        if (type === "1" || type === "2") {
            self.vm.questionList[num].toggle = true;

            $("#" + ueId).show();
            self.createUEditor(ueId);
            (function(id, content) {
                setTimeout(function() {
                    UE.getEditor(id).setContent(content);
                }, 500);
            })(ueId, item.question.mainContent);
            self.vm.questionList[num].question.optionsContent = item.question.optionsContent;
            self.vm.questionList[num].question.rightContent = item.question.rightContent;
        } else {

            self.vm.questionList[num].toggle = false;
            //主观题 答案 富文本
            if (type == "4") {
                $("#" + ueanswerId).show();
                self.createUEditor(ueanswerId);
                (function(id, content) {
                    setTimeout(function() {
                        UE.getEditor(id).setContent(content);
                    }, 500);

                })(ueanswerId, item.question.rightContent);



                $("#" + ueId).show();
                self.createUEditor(ueId);
                (function(id, content) {
                    setTimeout(function() {
                        UE.getEditor(id).setContent(content);
                    }, 500);
                })(ueId, item.question.mainContent);

            } else {


                self.vm.questionList[num].question.mainContent = item.question.mainContent;

                self.vm.questionList[num].question.rightContent = item.question.rightContent

            }


        }
        //$(this).addClass("checked").siblings().removeClass("checked");
    },
    httpGetQuestion: function() {
        var self = this;

        var questionType = this.query.questionType;
        var url = "/question/getOneUnionQuestion";
        var params = { "unionMainQuestionId": this.qid };


        J.ajax({ url: url, type: 'GET' }, params, function(data) {

            self.editData = data;
            self.vm.questionList = [];

            setTimeout(function() {
                self.createUEditor("container_main");
                setTimeout(function() {
                    UE.getEditor("container_main").setContent(data.mainContent);
                }, 500);
            }, 500);

            for (var k = 0; k < data.questionList.length; k++) {
                var obj = self.getObj();
                var item = data.questionList[k];
                debugger;


                obj.questionType = item.questionType;
                if (item.questionType == "1") {
                    obj.question.mainContent = item.choiceQuestion.mainContent;
                    obj.question.optionsContent = item.choiceQuestion.optionsContent;
                    obj.question.rightContent = item.choiceQuestion.rightOptions;
                    obj.question.level = item.choiceQuestion.level;
                } else if (item.questionType == "2") {
                    obj.question.mainContent = item.fillingQuestion.mainContent;
                    var strArray = [];
                    for (var k2 = 0; k2 < item.fillingQuestion.rightFilingList.length; k2++) {
                        strArray.push(item.fillingQuestion.rightFilingList[k2].value);
                    }
                    obj.question.rightContent = strArray.join("|");
                    obj.question.level = item.fillingQuestion.level;
                } else if (item.questionType == "3") {
                    obj.question.mainContent = item.subjectiveQuestion.mainContent;
                    obj.question.rightContent = item.subjectiveQuestion.rightContent;
                    obj.question.level = item.subjectiveQuestion.level;
                }
                self.vm.questionList.push(obj);
                self.setQuestionTypeForEdit(k, obj);
                self.checkedQuestionType(k, item.questionType);
                self.checkedLevel(k, obj.question.level);
            }

        });
    }



});
var f = new QuestionGroup();