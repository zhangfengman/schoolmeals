var QuestionManage = new J.Class({
    init: function(arg) {
        this.vm = null;
        this.pageIndex = 1;
        this.pageNumber = 0;
        this.initAvalon();
        this.bindEvent();

        this.initTree();
        
        this.initPage();
        var self = this;
        this.upload = new J.Upload({
            browseButton: "uploadAudio",
            container: "uploadAudioContainer",
            complete: function(files) {
                
                console.table(files);
                for(var k=0;k<files.length;k++){
                    var name = files[k].name.split("_")[1];
                    files[k]["name"] = name; 
                    //files[k]["courseChapterId"] = self.vm.query.courseChapterId;
                    files[k]["videoTagId"] = self.vm.query.videoTagId;
                }               
                
                self.httpBatchInsert(files);
            },
            before:function(){
                if(self.vm.query.videoTagId == ""){
                    J.alert("请先添加标签");
                    return false;
                }else{
                    return true;
                }

            }
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
                self.httpVideoList();
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;
    },
    initTree: function() {
        var self = this;
        var tree = new J.JTree({type:"2",func:function(tagId){
            self.vm.query.videoTagId = tagId;
            self.httpVideoList();
        }});
    },
    initChapter: function() {
        var self = this;
        self.chapter = new J.Tag({
            type: "manage",
            data:{type:"2",gradeId:"",subjectId:""}, //1试题、2资源、3测试
            update: function() {
                self.getCourseChapter();
            },
            change: function(pid, id) {

                self.vm.query.videoTagId = id;
                self.httpVideoList();
            }
        });

    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "audiomanage",
            grades: [],
            subjects: [],
            courseChapterList: [],
            query: {
                courseChapterId:"",
                gradeId: "", // 年级id    number 
                questionType: 1, //    试题类型：1选择题、2填空题、3主观题4组合题 number  
                questionLevel: 1, //  难度级别。1一级、2二级、3三级、4四级、5级 number  
                videoTagId: "", // 试题标签id  number  
                subjectId: ""
            },
            videoList: [],
            preview: function(id) {

                self.showAudio(id);
            },
            del: function(id) {
                self.httpDeleteAudio(id);
            },
            questionTagList: [],
            tag: { name: "" }
           

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
        

    },
    getVideoById: function(id) {
        var list = this.vm.videoList.$model;
        var rs = null;
        for (var i = 0; i < list.length; i++) {
            if (id === list[i].videoId) {
                rs = list[i];
                break;
            }
        }
        return rs;
    },
    showAudio: function(id) {
        var video = this.getVideoById(id);
         J.showAudio(video);
    },
    getCourseChapter: function() {
        var self = this;
         var self = this;
        var params = { type:"2",gradeId: this.vm.query.gradeId, subjectId: this.vm.query.subjectId };
        J.getTagList(params, function(data) {
            self.vm.courseChapterList =[];
            self.vm.courseChapterList = data.tagList;
            self.chapter.setData(data.tagList);
            
            //初始化
            if (data.tagList.length > 0) {
                
                self.vm.query.videoTagId = data.tagList[0].tagId;
                self.chapter.checked(data.tagList[0].tagId);
                self.httpVideoList();
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
    httpVideoList: function() {
        var self = this;
        var queryObj = self.vm.query.$model;
        var params = {};
        params["pageIndex"] = this.pageIndex;
        params["pageNumber"] = this.pageNumber;

       
        if (queryObj.gradeId) {
            params["gradeId"] = queryObj.gradeId;
        }

        if (queryObj.subjectId) {
            params["subjectId"] = queryObj.subjectId;
        }
        if (queryObj.videoTagId) {
            params["videoTagId"] = queryObj.videoTagId;
        }
        J.ajax({ url: "/video/selectByUserId", type: 'POST' }, params, function(data) {
            $("body").show();
            self.page.refresh(data.count, self.pageIndex);
            //console.table(data.questionList); 
            self.vm.videoList = [];
            self.vm.videoList = data.videoList;

        });
    },
    httpBatchInsert: function(files) {
        var self = this;
        J.ajax({ url: "/video/batchInsert", type: 'POST', bodyType: "raw" }, files, function(data) {
            self.httpVideoList();
        });
    },

    httpDeleteAudio: function(id) {
        var self = this;
        var params = {
            courseChapterVideoId: id,
        }
        J.ajax({ url: "/video/deleteCourseChapterVideo", type: 'POST', bodyType: "raw" }, params, function(data) {

            self.httpVideoList();

        });
    },

    httpGetTagList: function() {
        var self = this;
        var params = {
            gradeId: self.vm.query.gradeId,
            subjectId: self.vm.query.subjectId
        }
        J.ajax({ url: "/video/getTagList", type: 'GET' }, params, function(data) {

            self.vm.questionTagList = [];
            self.vm.questionTagList = data.questionTagList;
            //初始化参数
            if (data.questionTagList.length > 0) {
                self.vm.query.videoTagId = data.questionTagList[0].tagId;
            }

        });
    },

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
        J.ajax({ url: "/video/addTag", type: 'GET' }, params, function(data) {
           
            $("#myModalTag").modal("hide");
            self.httpGetTagList();


        });
    }



});
var f = new QuestionManage();
