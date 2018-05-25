var ExamCenterList = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.bindEvent();
        this.initAvalon();
        this.http();

    },
    initAvalon: function() {
        this.vm = avalon.define({
            $id: "examCenter",
            data: {
                name: "",
                startTime: "",
                endTime: "",
                flag: "",
                finishCount: "",
                totalCount: ""
            },
            goToStatistics: function(id) {
                J.goPage("examStatistics.html", { classTestPaperId: id });
            },
            startExam: function(id) {
                J.goPage("examDetailStudent.html", { testpaperid: id });
            },
            detail:function(item){
                J.goPage("../teacher/examdetail.html", { paperid: item.testPaperId });
            }
        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;
        $(".class-body").on("click", ".user-icon", function() {
            J.goPage("lessoncenterStudent.html");
        });
        $(".lesson_step_tab").on("click", "li", function() {
            var href = $(this).attr("data-href");
            if (href) {
                J.goPage(href,{classid:self.classId});
            }
        });
        $(".lesson_step_list").on("click", ".lesson_statistics", function() {
            J.goPage("courseStatistics.html");
        })
    },
    http: function() {
        var self = this;
        var params = {
            classId: self.classId
        }
        J.ajax({ url: "/examination/getClassTestPaperList", type: "POST" }, params, function(data) {
            $("body").show();
            self.vm.data = [];
            //处理状态
            for (var i = 0; i < data.examinationList.length; i++) {
                var item = data.examinationList[i];
                var curTime = new Date().getTime();
                if (curTime - Date.parse(item.startTime) < 0) {
                    //不可修改
                    item["flag"] = 0;
                } else if ((curTime - Date.parse(item.startTime)) > 0 && (curTime - Date.parse(item.endTime)) < 0) {
                    item["flag"] = 1;
                } else {
                    //完成
                    item["flag"] = 2;
                }
            }
            self.vm.data = data.examinationList;
        });
    }
});
var f = new ExamCenterList();
