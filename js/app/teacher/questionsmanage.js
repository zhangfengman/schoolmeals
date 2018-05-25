var QuestionManage = new J.Class({
    init: function(arg) {
        this.qtype = J.getQueryString("type");
        this.vm = null;
        this.UEs = {};
        this.pageIndex = 1;
        this.pageNumber = 2;
        this.initAvalon();
        this.bindEvent();
        this.bindVideoEvent();
        this.bindOptionEvent();
        this.initTree();
        this.initPage();
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
    initChapter: function() {
        var self = this;
        self.chapter = new J.Tag({
            type: "manage",
            data: { type: "1", gradeId: "", subjectId: "" }, //1试题、2资源、3测试
            update: function() {
                self.getCourseChapter();
            },
            change: function(pid, id) {
                self.vm.query.questionTagId = id;
                self.httpQuestionList();
            }
        });
    },
    initTree: function() {
        var self = this;
        var tagId = "";
        //添加试题后，初始化查询条件
        if (this.qtype) {
           var queryq = store.get("queryq");
           self.vm.query.questionLevel = queryq.questionLevel;
           //self.vm.query.questionType = queryq.questionType;
           tagId = queryq.questionTagId;
        }
        var tree = new J.JTree({type:"1",tagId:tagId,func:function(tagId){
            self.vm.query.questionTagId = tagId;
            self.httpQuestionList();
        }});

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
            toggle: true,
            questionTagList: [],
            tag: { name: "" },
            addq: function() {
                
                if (self.vm.query.questionTagId == "") {
                    J.alert("请先添加标签");
                    return;
                }
                
                store.set("queryq", self.vm.query.$model);
                J.goPage("questionsadd.html");

            },
            edit:function(id,type){
                store.set("queryq", self.vm.query.$model);
                if(type =="4"){
                    J.goPage("questionsgroup.html",{qid:id});
                }else{
                    J.goPage("questionsadd.html",{qid:id});
                }
                
            },
            del:function(id,type){
               
                new J.alert({
                        type: "confirm",
                        msg: "确定要删除此题？",
                        confirmFn: function() {
                            self.httpDelQuestion(id,type);
                        }
                    });
            }
        })
        avalon.scan();
    },
    createUEditor: function(id) {
       this.UEs[id] = UE.getEditor(id);

    },
    getContent: function(id) {
        return UE.getEditor(id).getContent();
    },
    bindEvent: function() {
        var self = this;
        //年级
        $("#gradeSelect").on("change", function() {
            self.vm.query.gradeId = $(this).val();
            self.chapter.setGrade(self.vm.query.gradeId);
            self.getCourseChapter();
        });
        //科目
        $("#subjectId").on("change", function() {
            self.vm.query.subjectId = $(this).val();
            self.chapter.setSubject(self.vm.query.subjectId);
            self.getCourseChapter();
        });

        $("#question_type").on("click", "li", function() {
            if ($(this).hasClass("current")) {
                return;
            }
            var type = $(this).attr("data-questiontype");
            self.vm.query.questionType = type;
            self.pageIndex = 1;
            $(this).addClass("current").siblings().removeClass("current");
            self.httpQuestionList();
        });
        $("#question_level").on("click", "li", function() {
            var level = $(this).attr("data-questionlevel");
            self.vm.query.questionLevel = level;
            $(this).addClass("current").siblings().removeClass("current");
            self.pageIndex = 1;
            self.httpQuestionList();
        });
        $("#addquestionbtn").on("click", function() {
            if (self.vm.query.questionTagId == "") {
                J.alert("请先添加标签");
                return;
            }
            store.set("queryq", self.vm.query.$model);
            J.goPage("questionsgroup.html");
        });
        $("#question_type_checkbox li").on("click", function() {
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
            self.vm.toggle = true;
            if (type == "2") {

                self.vm.question.placerightContent = "多选正确答案用|隔开.如A|B";
            }
            $("#" + ueId).show();
            setTimeout(function() {
                self.createUEditor(ueId);
            }, 500);
        } else {
            self.vm.toggle = false;

            if (type == '4') {
                $("#" + ueanswerId).show();
                setTimeout(function() {
                    self.createUEditor(ueanswerId);
                }, 500);

                $("#" + ueId).show();
                setTimeout(function() {
                    self.createUEditor(ueId);
                }, 500);
            }else {
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
            }
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
        var changeData = ["0", "1", "1", "2", "3", "4"];

        var self = this;
        self.vm.query.questionType = changeData[type];
        self.pageIndex = 1;
        $("#question_type li").each(function() {
            var _type = $(this).attr("data-questiontype");
            if (changeData[type] === _type) {
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
    getCourseChapter: function() {
        var self = this;
        var params = { type: "1", gradeId: this.vm.query.gradeId, subjectId: this.vm.query.subjectId };
        J.getTagList(params, function(data) {
            self.vm.courseChapterList = [];
            self.vm.courseChapterList = data.tagList;
            self.chapter.setData(data.tagList);

            //初始化
            if (data.tagList.length > 0) {
                self.vm.query.questionTagId = data.tagList[0].tagId;
                self.chapter.checked(data.tagList[0].tagId);
                self.httpQuestionList();
            }
            $("body").show();
        });
    },
    httpsysData: function() {
        var self = this;
        J.getsysData("[subjects','grades']", function(data) {
            self.vm.subjects = data.subjects;
            self.vm.grades = data.grades;
            //初始化默认值
            if (data.subjects.length > 0) {
                self.vm.query.subjectId = data.subjects[0].id;
            }
            if (data.grades.length > 0) {
                self.vm.query.gradeId = data.grades[0].id;
            }
            self.chapter.setParamData({ subjectId: self.vm.query.subjectId, gradeId: self.vm.query.gradeId });
            //self.httpGetTagList();
            self.getCourseChapter();
        });
    },
    httpQuestionList: function() {
        var self = this;
        var queryObj = self.vm.query.$model;
        var params = {
                questionType: queryObj.questionType,
            }
            //组合题 查询时不需要级别
        if (params.questionType !== "4") {
            params['questionLevel'] = queryObj.questionLevel;
        }
        params["pageIndex"] = this.pageIndex;
        params["pageNumber"] = this.pageNumber;

        if (queryObj.gradeId) {
            params["gradeId"] = queryObj.gradeId;
        }

        if (queryObj.subjectId) {
            params["subjectId"] = queryObj.subjectId;
        }
        if (queryObj.questionTagId) {
            params["questionTagId"] = queryObj.questionTagId;
        } else {
            self.vm.questionList = [];
            return;
        }

        J.ajax({ url: "/question/getQuestionList", type: 'POST' }, params, function(data) {
            $("body").show();
            self.page.refresh(data.count, self.pageIndex);
            //console.table(data.questionList); 
            self.vm.questionList = [];
            self.vm.questionList = data.questionList;
            J.setPoster();

        });
    },
    httpEditQuestion: function() {
        var self = this;
        var question = self.vm.question.$model;
        var url = "/question/editChoiceQuestion";

        var queryObj = self.vm.query;
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
        }
        if (!self.isable) {
            self.isable = true;
            J.ajax({ url: url, type: 'POST', bodyType: "raw" }, obj, function(data) {
                self.isable = false;
                $('#myModal').modal('hide');
                self.checkedQuestionType(question.questionType);
                self.httpQuestionList();
            });
        }

    },
    //老的标签 接口
    httpGetTagList: function() {
        var self = this;
        var params = {
            gradeId: self.vm.query.gradeId,
            subjectId: self.vm.query.subjectId
        }
        J.ajax({ url: "/question/getTagList", type: 'GET' }, params, function(data) {
            self.vm.questionTagList = [];
            self.vm.questionTagList = data.questionTagList;
            //初始化参数
            if (data.questionTagList.length > 0) {
                self.vm.query.questionTagId = data.questionTagList[0].tagId;
            }
           

        });
    },
    //老的标签 接口
    httpAddTag: function() {
        var self = this;
        var name = self.vm.tag.name;
        if (!name) {
            return;
        }
        var params = {
            name: name,
            gradeId: self.vm.query.gradeId,
            subjectId: self.vm.query.subjectId
        }
        J.ajax({ url: "/question/addTag", type: 'GET' }, params, function(data) {
            self.vm.questionTagList = [];
            self.vm.questionTagList = data.questionTagList;
            $("#myModalTag").modal("hide");
            self.httpGetTagList();


        });
    },
    httpDelQuestion:function(id,type){
        var self = this;
        var params ={
            questionId:id,
            questionType:type
        };
        J.ajax({ url: "/question/delete", type: 'POST' }, params, function(data) {
            
            if(data.resultCode == "1"){
                J.alert("删除成功");
                self.httpQuestionList();
            }else{
                J.alert("试题已被使用，无法删除");
            }

        });
    }



});
var f = new QuestionManage();
