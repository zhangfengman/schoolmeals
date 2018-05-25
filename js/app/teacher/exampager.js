var ExamPager = new J.Class({
    init: function(arg) {

        var ischoose = J.getQueryString("ischoose");
        if (ischoose) {
            this.isChoose = true;
        } else {
            this.isChoose = false;
        }
        this.vm = null;
        this.pageIndex = 1;
        this.pageNumber = 0;
        this.initAvalon();
       
        this.bindEvent();
        this.initTree();
        this.initPage();

        this.httpGetTypes();

    },
    bindEvent: function() {
        var self = this;
        $(".btn-border").on("click", function() {
            if(self.vm.query.testPaperTagId == ""){
                J.alert("请先添加标签");
                return;
            }
            J.goPage("exampageredit.html",{tagid:self.vm.query.testPaperTagId});
        });

        $(".addTag").on("click", function() {
            self.httpAddTag();
        })
        $("#gradeSelect").on("change", function() {
            self.vm.query.gradeId = $(this).val();
            self.chapter.setGrade(self.vm.query.gradeId);
            self.getCourseChapter();
        })
        $("#subjectSelect").on("change", function() {
            self.vm.query.subjectId = $(this).val();
            self.chapter.setSubject(self.vm.query.subjectId);
            self.getCourseChapter();
        });


        $(".tag").on("click", "li", function() {
            self.vm.query.testPaperTagId = $(this).attr("id");
            $(this).addClass("current").siblings().removeClass("current");
            self.pageIndex = 1;
            self.httpPaperList();
        });

    },
    initTree: function() {
        var self = this;
        var tree = new J.JTree({type:"3",func:function(tagId){
            self.vm.query.testPaperTagId = tagId;
            self.httpPaperList();
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
                self.httpPaperList();
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;
    },
    initChapter: function() {
        var self = this;
        self.chapter = new J.Tag({
            type: "manage",
            data: { type: "3", gradeId: "", subjectId: "" }, //1试题、2资源、3测试
            update: function() {
                self.getCourseChapter();
            },
            change: function(pid, id) {
                self.vm.query.testPaperTagId = id;
                self.httpPaperList();
            }
        });
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "exampager",
            grades: [],
            subjects: [],
            tags: [],
            testPaperTypeList: [],
            testPaperList: [],
            isChoose: self.isChoose,
            query: {
                testPaperTypeId: "",
                testPaperTagId: "",
                gradeId: "",
                subjectId: ""
            },
            tag: {
                name: ""
            },
            courseChapterList: [],
            detail: function(id) {
                J.goPage("examdetail.html", { paperid: id });
            },
            edit: function(id) {
                J.goPage("exampageredit.html", { paperid: id });
            },
            copy: function(id) {
                J.goPage("exampageredit.html", { paperid: id, iscopy: 1,tagid:self.vm.query.testPaperTagId });
            },
            add: function(index) {
                var layerIndex = parent.layer.getFrameIndex(window.name); //获取窗口索引
                parent.layer.close(layerIndex);
                store.set("exampager", JSON.stringify(self.vm.testPaperList[index].$model));
            },
            del: function(id) {
                J.alert({
                    msg: "确定删除测试？",
                    cancleFn: function() {},
                    confirmFn: function() {
                        self.httpDelete(id);
                    },
                });
            }

        })
        avalon.scan();
    },

    getCourseChapter: function() {
        var self = this;
        var params = { type: "3", gradeId: this.vm.query.gradeId, subjectId: this.vm.query.subjectId };
        J.getTagList(params, function(data) {
            self.vm.courseChapterList = [];
            self.vm.courseChapterList = data.tagList;
            self.chapter.setData(data.tagList);

            //初始化
            if (data.tagList.length > 0) {
                
                self.vm.query.testPaperTagId = data.tagList[0].tagId;
                self.chapter.checked(data.tagList[0].tagId);
                self.httpPaperList();
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
    httpGetTags: function() {
        var self = this;
        var query = self.vm.query;
        var params = {
            gradeId: "",
            subjectId: ""
        }
        if (query.gradeId !== "") {
            params.gradeId = query.gradeId;
        } else {
            return;
        }
        if (query.subjectId !== "") {
            params.subjectId = query.subjectId;
        } else {
            return;
        }

        J.ajax({ url: "/testPaper/getTagList", type: 'GET' }, params, function(data) {
            self.vm.tags = [];
            self.vm.tags = data.questionTagList;
            //初始化参数
            if (data.questionTagList.length > 0) {
                self.vm.query.testPaperTagId = data.questionTagList[0].tagId;
            }
        });
    },
    httpGetTypes: function() {
        var self = this;
        J.ajax({ url: "/testPaper/getTypes", type: 'GET' }, null, function(data) {

            self.vm.testPaperTypeList = data.testPaperTypeList;
            //初始化参数
            if (data.testPaperTypeList.length > 0) {
                self.vm.query.testPaperTypeId = data.testPaperTypeList[0].testPaperTypeId;
            }
        });
    },

    httpPaperList: function() {
        var self = this;
        if(self.vm.query.testPaperTagId == 0 ){
           self.vm.testPaperList = [];
           return ;
        }
        if(!self.vm.query.testPaperTagId){
            return ;
        }
        var params = {
            classId: self.classId,
            testPaperTagId:self.vm.query.testPaperTagId
        }
        params["pageIndex"] = this.pageIndex;
        params["pageNumber"] = this.pageNumber;
        J.ajax({ url: "/testPaper/getTestPapertList", type: 'GET' }, params, function(data) {
            $("body").show();
            self.vm.testPaperList = [];

            self.vm.testPaperList = data.testPaperList;
            self.page.refresh(data.count, self.pageIndex);
        });
    },
    httpAddTag: function() {
        var self = this;
        var params = self.vm.tag;
        var query = self.vm.query.$model;
        params['gradeId'] = query.gradeId;
        params['subjectId'] = query.subjectId;
        J.ajax({ url: "/testPaper/addTag", type: 'POST' }, params, function(data) {
            $('#myModal').modal('hide');
            self.httpGetTags();
        });
    },
    httpDelete: function(id) {
        var self = this;
        var params = {
            testPaperId: id
        };
        J.ajax({ url: "/testPaper/delete", type: 'POST' }, params, function(data) {
            if (data.status == "1") {
                self.httpPaperList();
            } else if (data.status == "2") {
                J.alert("测试已发布，不能删除");
            }

        });
    }


});
var f = new ExamPager();
