var QuestionManage = new J.Class({
    init: function(arg) {

        this.query = store.get("queryq");
        this.qid = J.getQueryString("qid"); 
        this.vm = null;
        this.UEs = {};
        this.pageIndex = 1;
        this.pageNumber = 2;
        //修改数据
        this.editData = null;
        this.initAvalon();
        
        this.setStatus();
        this.bindEvent();
        this.bindVideoEvent();
        this.bindOptionEvent();
        
        
        //当前录入的input
        this.curInput = "";
        var self = this;
        this.upload = new J.Upload({
            browseButton: "uploadAudio",
            container: "uploadAudioContainer",
            complete: function(files) {
                var path = files.pop().path;
                //console.log(path);               
                self.vm.question[self.curInput] = path;
            },
            before: function() {
                if (self.curInput != "") {
                    return true;
                } else {
                    J.alert("需要光标放入录入框里");
                    return false;
                }
            }
        });
        if (this.qtype) {
            self.checkedQuestionType(this.qtype);
        }
    },
    //增加 不显示标签树
    setStatus:function(){
        if(!this.qid){
            $("#treeDemo").css("display","none");

            this.setInitData();
        }else{
            this.initTree();
            this.httpGetQuestion();
        }
    },
    initTree: function() {
        var self = this;
        var tagId = "";
        
        var tree = new J.JTree({type:"1",tagId:tagId,func:function(tagId){
             
             self.query.questionTagId = tagId;
        }});

    },
    initPage: function() {
        var self = this;
        var page = new J.Page({
            cid: "paging",
            total: 0,
            change: function(pageData) {
                self.pageIndex = pageData.curPage;
                self.pageNumber = pageData.pageSize;
                self.httpQuestionList();
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;
    },

    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "questionmanage",
            grades: [],
            subjects: [],
            courseChapterList: [],
            query: {
                courseChapterId: "", //   章节id    number  
                gradeId: "", // 年级id    number 

                questionType: 1, //    试题类型：1选择题、2填空题、3主观题4组合题 number  
                questionLevel: "", //  难度级别。1一级、2二级、3三级、4四级、5级 number  
                questionTagId: "", // 试题标签id  number  
                subjectId: ""
            },
            questionList: [],
            question: {
                questionType: "1",
                choiceQuestionId: "",
                mainContent: "",
                rightContent: "",
                level: "1",
                optionsContent: [],
                placerightContent: "",
                placemainContent: ""
            },
            option: {
                option: "",
                content: ""
            },

            questionTagList: [],
            tag: { name: "" },

        })
        avalon.scan();
    },
    setInitData: function() {
        var self = this;
        self.vm.question.questionType = "1";
        self.vm.question.choiceQuestionId = "";
        self.vm.question.mainContent = "";
        self.vm.question.rightContent = "";
        self.vm.question.level = "1";
        self.vm.question.optionsContent = [];
        self.vm.option.option = "";
        self.vm.option.content = "";
        self.setQuestionType("1");

        self.createUEditor("container_main");
    },
    createUEditor: function(id) {
        this.UEs[id] = UE.getEditor(id);

    },
    getContent: function(id) {
        return UE.getEditor(id).getContent();
    },
    bindEvent: function() {
        var self = this;


        $("#question_type_checkbox li").on("click", function() {
            if(self.qid){
                return;
            }
            var type = $(this).attr("data-questiontype");
            self.setQuestionType(type);

        });
        $("#question_level_checkbox li").on("click", function() {
            self.vm.question.level = $(this).attr("data-questionlevel");
            $(this).addClass("checked").siblings().removeClass("checked");
        });
        $("#addquestion").on("click", function() {

            self.httpEditQuestion();
        });
        $(".question-list").on("click", ".answerbtn", function() {
            var obj = $(this).parents(".question").find(".answer");
            if (obj.css("display") == "block") {
                obj.hide();
            } else {
                obj.show();
            }
        });

    },
    bindVideoEvent: function() {
        var self = this;
        $(".videoInput").on("focus", function() {
            var attr = $(this).attr("ms-duplex");
            self.curInput = attr.replace("@question.", "");

        });
    },
    //添加试题 选择试题类型  对应 placehodler 处理
    setQuestionType: function(type) {
        var self = this;
        self.vm.question.placerightContent = "";
        self.vm.question.placemainContent = "";
        self.vm.question.questionType = type;
        var ueanswerId = 'container_answer';
        var ueId = 'container_main';
        if (type === "1" || type === "2") {

            if (type == "2") {

                self.vm.question.placerightContent = "多选正确答案用|隔开.如A|B";
            }
            $("#" + ueId).show();
            setTimeout(function() {
                self.createUEditor(ueId);
            }, 500);
        } else if (type == '3') {
            if (self.UEs[ueanswerId]) {
                UE.getEditor(ueanswerId).destroy();
                $("#" + ueanswerId).hide();
            }
            self.vm.question.placemainContent = '空格用"_"代替';
            //填空题 题面不是富文本
            if (self.UEs[ueId]) {
                UE.getEditor(ueId).destroy();
                $("#" + ueId).hide();
            }
        } else if (type == '4') {
            $("#" + ueanswerId).show();
            setTimeout(function() {
                self.createUEditor(ueanswerId);
            }, 500);

            $("#" + ueId).show();
            setTimeout(function() {
                self.createUEditor(ueId);
            }, 500);

        } else if (type == '5') {
            $("#container_richText").show();
            setTimeout(function() {
                self.createUEditor("container_richText");
            }, 500);
        }



        $(this).addClass("checked").siblings().removeClass("checked");
        $("#question_type_checkbox li").each(function() {
            if (type == $(this).attr("data-questiontype")) {
                $(this).addClass("checked");
            } else {
                $(this).removeClass("checked")
            }
        });
    },
    //添加试题 选择试题类型  对应 placehodler 处理
    setQuestionTypeForEdit: function(qtype) {
        //1选择题、2填空题、3主观题、4组合题、5富文本。必填
        var self = this;
        var changeData = ["1","1", "3", "4", "5"];
        var type = changeData[qtype];
        var editData = this.editData;
        self.vm.question.questionType = type;
        var ueanswerId = 'container_answer';
        var ueId = 'container_main';
        if (type === "1" || type === "2") {

            $("#" + ueId).show();
            setTimeout(function() {
                self.createUEditor(ueId);
                setTimeout(function() {
                    UE.getEditor(ueId).setContent(editData.mainContent);
                },500);
            }, 500);
            
            self.vm.question.optionsContent =editData.optionsContent;
            self.vm.question.rightContent =editData.rightOptions;

        } else if (type == '3') {
            
            self.vm.question.mainContent = editData.mainContent;
            var strArray = [];
            for(var k=0;k<editData.rightFilingList.length;k++){
                strArray.push(editData.rightFilingList[k].value);
            }
            self.vm.question.rightContent =strArray.join("|");


            
        } else if (type == '4') {
            $("#" + ueanswerId).show();
            setTimeout(function() {
                self.createUEditor(ueanswerId);
                 setTimeout(function() {
                    UE.getEditor(ueanswerId).setContent(editData.rightContent);
                },500);
                
            }, 500);
            

            $("#" + ueId).show();
            setTimeout(function() {
                self.createUEditor(ueId);
                setTimeout(function() {
                    UE.getEditor(ueId).setContent(editData.mainContent);
                },500);
                
            }, 500);

        } else if (type == '5') {
            $("#container_richText").show();
            setTimeout(function() {
                self.createUEditor("container_richText");
                 setTimeout(function() {
                    UE.getEditor("container_richText").setContent(editData.mainContent);
                },500);
            }, 500);
        }



        $(this).addClass("checked").siblings().removeClass("checked");
        $("#question_type_checkbox li").each(function() {
            if (type == $(this).attr("data-questiontype")) {
                $(this).addClass("checked");
            } else {
                $(this).removeClass("checked")
            }
        });
    },
    checkedQuestionType: function(type) {
        //添加的类型  和查询使用的类型 相差1
        var changeData = ["0","1", "3", "4", "5"];

        var self = this;
        self.vm.query.questionType = changeData[type];
        self.pageIndex = 1;
        $("#question_type_checkbox li").each(function() {
            var _type = $(this).attr("data-questiontype");
            if (changeData[type] === _type) {
                $(this).addClass("checked").siblings().removeClass("checked");
            }
        });
    },
    //选中等级
    checkedLevel:function(level){
        this.vm.question.level = level;
        $("#question_level_checkbox li").each(function(){
            var _level = $(this).attr("data-questionlevel");
            if(_level === level){
                $(this).addClass("current").siblings().removeClass("current");
            }
            
        });
    },
    //绑定添加选项事件
    bindOptionEvent: function() {
        var self = this;
        $(".mulselect").on("change", function() {
            var selectedObj = $(".mulselect option:selected");
            self.vm.option.option = selectedObj.val();;
            self.vm.option.content = selectedObj.text();
        });
        $(".select_del").on("click", function() {
            var selectedObj = $(".mulselect option:selected");
            if (selectedObj.length === 0) {
                J.alert("请选中编辑的项");
                return;
            }
            var val = selectedObj.val();
            var newOpt = self.vm.option.$model;
            var flag = false;
            for (var i = 0; i < self.vm.question.optionsContent.length; i++) {
                if (val === self.vm.question.optionsContent[i].option) {
                    self.vm.question.optionsContent.splice(i, 1);
                    flag = true;
                    break;
                }
            }
            self.vm.option.option = "";
            self.vm.option.content = "";
            selectedObj.remove();
        });
        $(".select_confirm").on("click", function() {
            var newOpt = self.vm.option.$model;
            var flag = false;
            for (var i = 0; i < self.vm.question.optionsContent.length; i++) {
                if (newOpt.option === self.vm.question.optionsContent[i].option) {
                    self.vm.question.optionsContent[i].content = newOpt.content;
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                self.vm.question.optionsContent.push(newOpt);
            }

        });
    },



    httpEditQuestion: function() {
        var self = this;
        var question = self.vm.question.$model;
        var url = "/question/editChoiceQuestion";
        var queryObj = self.query;
        var obj = {
            tagId: queryObj.questionTagId,
            mainContent: question.mainContent,
            rightOptions: question.rightContent,
            level: parseInt(question.level),
            optionsContent: question.optionsContent
        }

        if ("1" === question.questionType || "2" === question.questionType) {


            question.mainContent = self.getContent("container_main");
            obj.mainContent = question.mainContent;
            if(self.qid){
                obj["choiceQuestionId"]= self.qid;
            }
            if (!question.mainContent) {
                J.alert("题面不能为空");
                return;
            }
            if (question.optionsContent.length === 0) {
                J.alert("选项不能为空");
                return;
            }
            if (!question.rightContent) {
                J.alert("正确答案不能为空");
                return;
            }
            if ("2" === question.questionType) {
                if (question.rightContent.indexOf("|") < 0) {
                    J.alert("多选题，正确答案格式不对");
                    return;
                }
            }

        } else if ("3" === question.questionType) {
            url = "/question/editFillingQuestion";

            if (!question.mainContent) {
                J.alert("题面不能为空");
                return;
            }
            if (!question.rightContent) {
                J.alert("答案不能为空");
                return;
            }
            //验证填空题 填空位置
            var spacenum = question.mainContent.split("_").length - 1;
            var valArray = question.rightContent.split("|");

            if (question.mainContent.indexOf("_") < 0) {
                J.alert("填空题格式不对");
                return;
            }
            if (question.rightContent.indexOf("|") < 0 && spacenum > 1) {
                J.alert("填空题答案不对");
                return;
            }
            if (valArray.length != spacenum) {
                J.alert("填空题 填空位置和答案不匹配");
                return;
            }
            var rightFilings = [];
            for (var i = 0; i < valArray.length; i++) {
                rightFilings.push({
                    "key": i + 1,
                    "value": valArray[i]
                });
            }
            obj = {

                tagId: queryObj.questionTagId,
                mainContent: question.mainContent,
                rightFilings: rightFilings,
                level: parseInt(question.level)
            }
            if(self.qid){
                obj["fillingQuestionId"]= self.qid;
            }
              
        } else if ("4" === question.questionType) {
            question.mainContent = self.getContent("container_main");
            if (!question.mainContent) {
                J.alert("题面不能为空");
                return;
            }
            question.rightContent = self.getContent("container_answer");
            if (!question.rightContent) {
                J.alert("答案不能为空");
                return;
            }
            url = "/question/editSubjectiveQuestion";
            obj = {

                tagId: queryObj.questionTagId,
                mainContent: question.mainContent,
                rightContent: question.rightContent,
                level: parseInt(question.level)
            }
            if(self.qid){
                obj["subjectiveQuestionId"]= self.qid;
            }
        } else if("5" === question.questionType){
            url = "/question/editUnionQuestion";
            obj = {
                tagId: queryObj.questionTagId,
                mainContent: self.getContent("container_richText")
            }
            if(self.qid){
                obj["unionMainQuestionId"]= self.qid;
            }
        }

        if (!self.isable) {
            self.isable = true;
            J.ajax({ url: url, type: 'POST', bodyType: "raw" }, obj, function(data) {
                self.isable = false;
                if(data.resultCode == 1 || data.resultCode == 0){
                    J.goPage("questionsmange.html", { type: question.questionType });
                }else{
                    J.alert("试题已被使用，无法修改");
                }
                
            });
        }

    },
    httpGetQuestion:function(){
        var self = this;
        
        var questionType = this.query.questionType;
        var url ="";
        var params ={};
        if(questionType =="1"){
            url = "/question/getOneChoiceQuestion";
            params ={"choiceQuestionId":this.qid};
        }else if(questionType =="3"){
            url = "/question/getOneSubjectiveQuestion";
            params ={"subjectiveQuestionId":this.qid};
        }else if(questionType =="2"){
            url = "/question/getOneFillingQuestion";
            params ={"fillingQuestionId":this.qid};
        }else{
            url = "/question/getOneUnionQuestion";
            params ={"unionMainQuestionId":this.qid};
        }
        
        J.ajax({ url: url, type: 'GET'}, params, function(data) {
           
            self.editData = data;
            
            self.checkedLevel(data.level);
            self.setQuestionTypeForEdit(questionType);
            


        });
    }




});
var f = new QuestionManage();
