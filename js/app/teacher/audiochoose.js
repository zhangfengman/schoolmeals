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
       /*  this.upload = new J.Upload({
            browseButton: "uploadAudio",
            container: "uploadAudioContainer",
            complete: function(files) {
                self.httpBatchInsert(files);
            }
        });
*/
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
    initChapter: function() {
        var self = this;

        self.chapter = new J.Tag({
            type: "manage",
            data: { type: "2", gradeId: "", subjectId: "" }, //1试题、2资源、3测试
            update: function() {
                self.getCourseChapter();
            },
            change: function(pid, id) {
                self.vm.query.videoTagId = id;
                self.httpVideoList();
            }
        });
    },
    initTree: function() {
        var self = this;
        var tree = new J.JTree({type:"2",func:function(tagId){
            self.vm.query.videoTagId = tagId;
            self.httpVideoList();
        }});

    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "audiomanage",
            grades: [],
            subjects: [],
            courseChapterList: [],
            query: {
                courseChapterId: "", //   章节id    number  
                gradeId: "", // 年级id    number 


                videoTagId: "", // 试题标签id  number  
                subjectId: ""
            },
            videoList: [],
            choose: function(id) {
                self.addAudio(id);
            },
            chooseList: [],
            del: function(id) {
                self.delAudio(id);
            },
            confirm: function() {
                index = parent.layer.getFrameIndex(window.name); //获取窗口索引
                parent.layer.close(index);
                store.set("chooseVediolist", JSON.stringify(self.vm.chooseList.$model));
            },
            questionTagList: [],

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
            self.vm.query.videoTagId = $(this).attr("id");
            $(this).addClass("current").siblings().removeClass("current");
            self.pageIndex = 1;
            self.httpVideoList();
        });

    },
    addAudio: function(id) {
        var item = this.getVideoById(id);
        if (!this.checkRepeat(item)) {
            this.vm.chooseList.push(item);
        }

    },
    delAudio: function(id) {
        var list = this.vm.chooseList;

        for (var i = 0; i < list.length; i++) {
            if (id === list[i].videoId) {
                list.splice(i, 1);
                break;
            }
        }

    },
    checkRepeat: function(item) {
        var list = this.vm.chooseList;
        var flag = false;
        for (var i = 0; i < list.length; i++) {
            if (item.videoId === list[i].videoId) {
                flag = true;
                break;
            }
        }
        return flag;

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
        var domStr = "";
        if (video.ext === "mp4") {
            domStr = '<video src="' + video.path + '" controls="controls">您的浏览器不支持 video 标签。</video>';
        } else if (video.ext === "mp3") {
            domStr = '<audio  src="' + video.path + '" controls="controls">您的浏览器不支持 audio  标签。</audio>';
        } else if (['jpg', 'gif', 'png'].indexOf(video.ext) >= 0) {
            domStr = '<img  src="' + video.path + '" />';
        }
        layer.open({
            shade: 0,
            type: 1,
            title: "预览",
            area: ['600px', '400px'],
            content: "<div class='preview_video'>" + domStr + "</div>",
            end: function() {

            }
        });
    },
    getCourseChapter: function() {
        var self = this;


        var self = this;
        var params = { type: "2", gradeId: this.vm.query.gradeId, subjectId: this.vm.query.subjectId };
        J.getTagList(params, function(data) {
            self.vm.courseChapterList = [];
            self.vm.courseChapterList = data.tagList;
            self.chapter.setData(data.tagList);

            /*//初始化章节值
            if (data.courseChapterList.length > 0) {
                if (data.courseChapterList[0].childList && data.courseChapterList[0].childList.length > 0) {
                    self.vm.query.courseChapterId = data.courseChapterList[0].childList[0].courseChapterId;
                    self.chapter.checked(data.courseChapterList[0].courseChapterId, self.vm.query.courseChapterId);
                }
            }*/
            self.httpVideoList();
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
            self.getCourseChapter();

        });
    },
    httpVideoList: function() {
        var self = this;
        var queryObj = self.vm.query.$model;
        var params = {};
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
            self.getCourseChapter();

        });
    }




});
var f = new QuestionManage();
