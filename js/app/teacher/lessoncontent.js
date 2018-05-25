var StudentLessonContent = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.courseId = J.getQueryString("courseid");
        this.chapterId = J.getQueryString("chapterid");
        this.pId = J.getQueryString("pid");
        this.segmentType ="1";
        this.vm = null;
        this.bindEvent();
        this.httpSegmentIndex(1);
        this.initAvalon();
        this.pageIndex = 1;
        this.pageNumber = 0;
        this.refreshRedDot();
        this.initPage();
        this.createUpload();
    },
    refreshRedDot: function() {
        J.getRedDot(2, function(num) {
            if (num > 0) {
                $(".questions_count").text(num).show();;
            } else {
                $(".questions_count").hide();
            }

        });
        if (window.frames.length != parent.frames.length) {
            top.refreshRedDot();
        }
    },
    createUpload: function() {
        var self = this;
        self.upload = new J.Upload({
            browseButton: "uploadAudio",
            container: "uploadAudioContainer",
            complete: function(files) {
                var val = files.pop().path;               
                $("#"+self.curQskId).val(val).attr("readonly","readonly");
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
                self.httpQuestionList();
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;
    },
    initAvalon: function() {
        var self = this;
        var myCourse = store.get("mycourse");
        this.vm = avalon.define({
            $id: "lessonContent",
            mycourse: myCourse,
            curIndex: 1, //默认显示第一个
            data: {
                name: "",
                startTime: "",
                endTime: "",
                flag: "",
                courseChapterSegmentId: ""
            },
            query: {
                courseChapterSegmentId: "",
                isResponse: "-1"
            },
            askList: [],
            segmentList: [],
            answer: function(courseChapterId, askId) {
                var content = $("#" +courseChapterId+"_"+askId).val();
                self.httpSend(courseChapterId, askId, content);
            },
            switch: function(val) {
                self.vm.query.isResponse = val;
                self.httpRequestList();
            },
            queryQuestion: function() {
                self.httpRequestList();
            },
            detail: function(data) {
                
                J.goPage("coursedetail.html", { courseid: self.courseId,segmentid:self.vm.data.courseChapterSegmentId,chapterid:self.chapterId,segmenttype:self.segmentType});
            },
            lock:function(data,status){
                self.httpLock(data,status);
            },
            score:function(segmentId){
                J.goPage("coursescore.html", {
                    classid: self.classId,
                    courseid: self.courseId,
                    sourcetype: "1",
                    pid: self.pId,
                    chapterid: self.chapterId,
                    segmentid:segmentId,
                    segmenttype:self.segmentType
                })
            },
            report:function(segmentId){
                J.goPage("../student/courseStatistics.html", {
                    classid: self.classId,
                    courseid: self.courseId,
                    sourcetype: self.vm.curIndex,
                    chapterid: self.chapterId,
                    pid: self.pId,
                    ccsid: self.vm.data.courseChapterSegmentId,
                    segmentid:segmentId
                });
            }
        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;
        $(".lesson_step_tab li").on("click", function() {
            var tab = $(this).attr("data-tab");
            self.vm.curIndex = tab;
            $(this).addClass("active").siblings().removeClass("active");
            if (window.frames.length != parent.frames.length) {
                top.refreshRedDot();
            }
            if (tab !== "4") {

                self.segmentType = tab;
                self.httpSegmentIndex(tab);
            } else {
                self.httpSegmentList();
            }
        });
        $(".lesson_step_operate_report").on("click", function() {
            //J.goPage("classstatistics.html", { classid: self.classId, courseid: self.courseId, sourcetype: self.vm.curIndex })
            J.goPage("../student/courseStatistics.html", {
                classid: self.classId,
                courseid: self.courseId,
                sourcetype: self.vm.curIndex,
                chapterid: self.chapterId,
                pid: self.pId,
                ccsid: self.vm.data.courseChapterSegmentId
            });
        });
        $(".lesson_step_operate_score").on("click", function() {
            J.goPage("coursescore.html", {
                classid: self.classId,
                courseid: self.courseId,
                sourcetype: "1",
                pid: self.pId,
                chapterid: self.chapterId
            })
        });

         $(".lesson_main").on("click", ".question_answer_avatar", function() {
            var sid = $(this).attr("sid");
            var askid = $(this).attr("askid");
            self.curQskId =sid+"_"+askid;
            $("#uploadAudio").trigger("click");
        });

         $("#changeData").on("change",function(){
            self.vm.query.courseChapterSegmentId = $(this).val();
             self.httpRequestList();
         });


    },
    httpSegmentIndex: function(segmentType) {
        var self = this;
        var params = {
            classId: self.classId,
            courseChapterId: this.chapterId,
            segmentType: segmentType
        }
        J.ajax({ url: "/class/course/segment/index", type: "GET" }, params, function(data) {
            $("body").show();
           
            if (data.courseChapterSegmentId) {
                self.vm.data.courseChapterSegmentId = data.courseChapterSegmentId;
                self.vm.data.name = data.name;
                self.vm.data.startTime = data.startTime;
                self.vm.data.endTime = data.endTime;
                self.vm.data.status = data.status;
                self.vm.data.courseChapterSegmentId = data.courseChapterSegmentId;

                var now = new Date().getTime();
                var curTime = moment(data.stime);
                var startTime = moment(data.startTime, "YYYY-MM-DD HH:mm:ss");
                var endTime = moment(data.endTime, "YYYY-MM-DD HH:mm:ss");

                if (curTime.isBefore(startTime)) {
                    flag = 0;
                } else if (curTime.isBetween(startTime, endTime)) {
                    flag = 1;
                } else if (curTime.isAfter(endTime)) {
                    flag = 2;
                }
               

                self.vm.data.flag = flag;
                self.vm.segmentList = data.segmentList;
            } else {
                self.vm.data.name = "";
                self.vm.data.startTime = "";
                self.vm.data.endTime = "";
            }

        });
    },
    httpRequestList: function() {
        var self = this;
        var params = self.vm.query.$model;
        params["pageIndex"] = this.pageIndex;
        params["pageNumber"] = this.pageNumber;
        J.ajax({ url: "/ask/course/getAskList", type: 'GET' }, params, function(data) {
            $("body").show();
            self.page.refresh(0);
            self.refreshRedDot();
            self.vm.askList = [];
            self.vm.askList = data.askList;
        });
    },
    httpSend: function(courseChapterId, askId, content) {
        var self = this;

        var params = {
            courseChapterId: courseChapterId,
            askId: askId,
            content: content
        };
        if (!params.content) {
            return;
        }
        J.ajax({ url: "/ask/course/send", type: 'GET' }, params, function(data) {
            self.httpRequestList();

        });
    },


    httpSegmentList: function() {
        var self = this;
        var params = {
            courseChapterId: self.chapterId
        };
        J.ajax({ url: "/course/getChapterSegmentList", type: 'GET' }, params, function(data) {
            self.vm.segmentList = data.courseChapterSegmentList;
            if (data.courseChapterSegmentList.length > 0) {
                self.vm.query.courseChapterSegmentId = data.courseChapterSegmentList[0].courseChapterSegmentId;
                self.httpRequestList();
            }
        });
    },
    httpLock: function(data,status) {
        var self = this;
        var params = {
            classCourseChapterSegmentId: data.courseChapterSegmentId,
            status:status
        };
        J.ajax({ url: "/class/course/updateSegmentStatus", type: 'GET' }, params, function(data) {
           self.httpSegmentIndex(self.segmentType);
        });
    }
    


});
var f = new StudentLessonContent();
