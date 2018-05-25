var QuestionChoose = new J.Class({
    init: function(arg) {
        this.vm = null;
        this.pageIndex = 1;
        this.pageNumber = 10;
        this.initAvalon();
        this.bindEvent();
        this.initTree();
        //this.httpQuestionList();
        this.initPage();


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
        var tree = new J.JTree({type:"1",func:function(tagId){
            self.vm.query.questionTagId = tagId;
            self.httpQuestionList();
        }});

    },
    initAvalon: function() {
        this.vm = avalon.define({
            $id: "questionchoose",
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
            chooseList: [],
            questionTagList: []

        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;
         //年级
        $("#gradeSelect").on("change",function(){
            self.vm.query.gradeId = $(this).val();
            self.chapter.setGrade(self.vm.query.gradeId);
            self.getCourseChapter();
        });
        $("#subjectId").on("change", function() {
            self.vm.query.subjectId = $(this).val();
            self.chapter.setSubject(self.vm.query.subjectId);
            self.getCourseChapter();
            
        });
        $(".tag").on("click", "li", function() {
            $(this).addClass("current").siblings().removeClass("current");
            self.vm.query.questionTagId = $(this).attr("id");
            self.httpQuestionList();
        });

        $("#question_type").on("click", "li", function() {
             if( $(this).hasClass("current")){
                return;
            }
            var type = $(this).attr("data-questiontype");
            self.vm.query.questionType = type;
            $(this).addClass("current").siblings().removeClass("current");
            self.pageIndex = 1;
            self.httpQuestionList();
        });
        $("#question_level").on("click", "li", function() {
            var level = $(this).attr("data-questionlevel");
            self.vm.query.questionLevel = level;
            $(this).addClass("current").siblings().removeClass("current");
            self.httpQuestionList();
        });
        $(".question-list").on("click", ".answerbtn", function() {

           var obj =  $(this).parents(".question").find(".answer");
           if(obj.css("display") =="block"){
            obj.hide();
           }else{
             obj.show();
           }
          
        });

        $(".question-list").on("click", ".add_question", function() {
            var qid = $(this).attr("qid");
            var qtype = $(this).attr("qtype");
            self.addQuestion(qtype, parseInt(qid));
        });

        $(".choose-list").on("click", ".del_question", function() {
            var unique = $(this).attr("unique");
            self.delQuestion(unique);
        });
        $(".add_confirm").on("click", function() {
            index = parent.layer.getFrameIndex(window.name); //获取窗口索引
            parent.layer.close(index);
            store.set("chooselist", JSON.stringify(self.vm.chooseList.$model));
        });
    },
    getQuestion: function(qtype, qid) {
        var list = this.vm.questionList;
        var rsObj = {};
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (item.type === qtype && qtype === "1" && item.choiceQuestion.choiceQuestionId === qid) {
                rsObj = item;

                rsObj['contentType'] = "1";
                rsObj['contentId'] = item.choiceQuestion.choiceQuestionId;
                rsObj['questionBaseScore'] = 0;
                rsObj['questionTotalScore'] = 0;

                rsObj['unique'] = qtype + "_" + item.choiceQuestion.choiceQuestionId;
                break;
            } else if (item.type === qtype && qtype === "2" && item.fillingQuestion.fillingQuestionId === qid) {
                rsObj = item;
                rsObj['questionBaseScore'] = 0;
                rsObj['questionTotalScore'] = 0;

                rsObj['contentType'] = "1";
                rsObj['contentId'] = item.fillingQuestion.fillingQuestionId;

                rsObj['unique'] = qtype + "_" + item.fillingQuestion.fillingQuestionId;
                break;
            } else if (item.type === qtype && qtype === "3" && item.subjectiveQuestion.subjectiveQuestionId === qid) {
                rsObj = item;
                rsObj['questionBaseScore'] = 0;
                rsObj['questionTotalScore'] = 0;

                rsObj['contentType'] = "1";
                rsObj['contentId'] = item.subjectiveQuestion.subjectiveQuestionId;

                rsObj['unique'] = qtype + "_" + item.subjectiveQuestion.subjectiveQuestionId;
                break;
            } else if (item.type === qtype && qtype === "4" && item.unionQuestion.unionMainQuestionId === qid) {
                rsObj = item;
                rsObj['questionBaseScore'] = 0;
                rsObj['questionTotalScore'] = 0;
                rsObj['contentType'] = "1";
                rsObj['contentId'] = item.unionQuestion.unionMainQuestionId;

                rsObj['unique'] = qtype + "_" + item.unionQuestion.unionMainQuestionId;
                break;
            }
        }
        return rsObj;
    },
    delQuestion: function(unique) {
        var list = this.vm.chooseList;
        for (var i = 0; i < list.length; i++) {
            if (unique === list[i].unique) {
                list.splice(i, 1);
                break;
            }
        }
    },
    addQuestion: function(qtype, qid) {
        var item = this.getQuestion(qtype, qid);
        if (!this.checkRepeat(item)) {
            this.vm.chooseList.push(item);
        }

    },
    checkRepeat: function(item) {
        var list = this.vm.chooseList;
        var flag = false;
        for (var i = 0; i < list.length; i++) {
            if (item.unique === list[i].unique) {
                flag = true;
                break;
            }
        }
        return flag;

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

            self.chapter.setParamData({subjectId:self.vm.query.subjectId,gradeId:self.vm.query.gradeId});
            self.getCourseChapter();
        });
    },
    httpQuestionList: function() {
        var self = this;
        //var params = self.vm.query.$model;
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

        if (queryObj.courseChapterId) {
            params["courseChapterId"] = queryObj.courseChapterId;
        }
        if (queryObj.gradeId) {
            params["gradeId"] = queryObj.gradeId;
        }

        if (queryObj.subjectId) {
            params["subjectId"] = queryObj.subjectId;
        }
        if (queryObj.questionTagId) {
            params["questionTagId"] = queryObj.questionTagId;
        }else{
            self.vm.questionList = [];
            return;
        }

        J.ajax({ url: "/question/getQuestionList", type: 'POST' }, params, function(data) {
            $("body").show();
            self.page.refresh(data.count);
            //console.table(data.questionList); 
            self.vm.questionList = [];
            self.vm.questionList = data.questionList;
            J.setPoster();
        });
    },
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
    }
});
var f = new QuestionChoose();
