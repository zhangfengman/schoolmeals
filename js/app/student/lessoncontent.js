var StudentLessonContent = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.courseId = J.getQueryString("courseid");
        this.chapterId = J.getQueryString("chapterid");
        this.pId = J.getQueryString("pid");
        this.vm = null;
        this.httpSegmentIndex(1);
        this.initAvalon();
        this.bindEvent();
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
    createUpload: function() {
        var self = this;
        self.upload = new J.Upload({
            browseButton: "uploadAudio",
            container: "uploadAudioContainer",
            complete: function(files) {
                var val = files.pop().path;
                $("#" + self.curQskId).val(val).attr("readonly", "readonly");
            }
        });

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
                status: "",
                courseChapterSegmentId: ""
            },
            query: {
                classId: self.classId,
                courseChapterSegmentId: self.chapterId,
                isResponse: "-1"

            },
            askList: [],
            segmentList: [],
            answer: function(courseChapterId, askId) {
                var content = $("#" + courseChapterId + "_" + askId).val();
                self.httpSend(courseChapterId, askId, content);
            },

            switch: function(val) {
                self.vm.query.isResponse = val;
                self.httpRequestList();
            },
            detail: function() {
                J.goPage("../teacher/coursedetail.html", { courseid: self.courseId,segmentid:self.vm.data.courseChapterSegmentId,chapterid:self.chapterId,segmenttype:self.vm.curIndex});
            },
            search: function() {
                self.httpRequestList();
            },
            study: function(segmentId) {
                J.goPage("courseDetailStudent.html", {
                    classid: self.classId,
                    courseid: self.courseId,
                    chapterid: self.chapterId,
                    sourcetype: self.vm.curIndex,
                    ccsid: self.vm.data.courseChapterSegmentId,
                    segmentid:segmentId,
                    segmenttype:self.vm.curIndex
                });
            },
            report: function(segmentId) {
                J.goPage("courseStatistics.html", {
                    classid: self.classId,
                    courseid: self.courseId,
                    sourcetype: self.vm.curIndex,
                    chapterid: self.chapterId,
                    pid: self.pId,
                    ccsid: self.vm.data.courseChapterSegmentId
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

                self.httpSegmentIndex(tab);
            } else {
                //self.httpRequestList();
                self.httpSegmentList(self.classId);
            }
        });
        $(".lesson_step_list").on("click", ".lesson_statistics", function() {
            J.goPage("courseStatistics.html", {
                classid: self.classId,
                courseid: self.courseId,
                sourcetype: self.vm.curIndex,
                chapterid: self.chapterId,
                pid: self.pId,
                ccsid: self.vm.data.courseChapterSegmentId
            });
        });
        $(".lesson_step_list").on("click", ".study", function() {
            J.goPage("courseDetailStudent.html", {
                classid: self.classId,
                courseid: self.courseId,
                chapterid: self.chapterId,
                sourcetype: self.vm.curIndex,
                ccsid: self.vm.data.courseChapterSegmentId
            });
        });

        $(".lesson_main").on("click", ".question_answer_avatar", function() {
            var sid = $(this).attr("sid");
            var askid = $(this).attr("askid");
            self.curQskId = sid + "_" + askid;
            $("#uploadAudio").trigger("click");
        });
        $("#changeData").on("change", function() {
            self.vm.query.courseChapterSegmentId = $(this).val();
            self.httpRequestList();
        });

    },
    httpSegmentIndex: function(segmentType) {
        var self = this;
        var params = {
            classId: this.classId,
            courseChapterId: this.chapterId,
            segmentType: segmentType
        }
        J.ajax({ url: "/class/course/segment/index", type: "POST" }, params, function(data) {
            $("body").show();
            if (data.courseChapterSegmentId) {
                self.vm.data.courseChapterSegmentId = data.courseChapterSegmentId;
                self.vm.data.name = data.name;
                self.vm.data.startTime = data.startTime;
                self.vm.data.endTime = data.endTime;
                self.vm.data.status = data.status;

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
        if (!params.classId) {
            return;
        }
        if (!params.courseChapterSegmentId) {
            return;
        }
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
    httpSegmentList: function(classId) {
        var self = this;
        J.ajax({ url: "/ask/getMyAskSegmentList", type: 'GET' }, { classId: classId }, function(data) {
            self.vm.segmentList = [];
            self.vm.segmentList = data.courseChapterSegmentList;
            if (data.courseChapterSegmentList.length > 0) {
                self.vm.query.courseChapterSegmentId = data.courseChapterSegmentList[0].courseChapterSegmentId;
                self.httpRequestList();
            }

        });
    },
});
var f = new StudentLessonContent();
