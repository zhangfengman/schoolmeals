var examCenterManage = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.bindEvent();
        this.initAvalon();
        this.httpTestPaperList();
    },
    bindEvent: function() {
        var self = this;
        $(".releaseexambtn").on("click", function() {
            J.goPage("examrelease.html");
        });
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "examcentermanage",
            examinationList: [],
            edit: function(id) {
                J.goPage("examrelease.html", { paperid: id });
            },
            del: function(id) {
                self.httpDeleteClassTestPaper(id);
            },
            markscore: function(id) {
                J.goPage("coursescore.html", { testpaperid: id, sourcetype: 2 });
            },
            goToStatistics: function(id) {
                J.goPage("../student/examStatistics.html", { classTestPaperId: id });
            },
            detail:function(item){
                J.goPage("examdetail.html", { paperid: item.testPaperId });
            }

        })
        avalon.scan();
    },
    httpTestPaperList: function() {
        var self = this;
        J.ajax({ url: "/examination/getClassTestPaperList", type: 'POST' }, null, function(data) {
            self.vm.examinationList = [];

            //处理状态
            for (var i = 0; i < data.examinationList.length; i++) {
                var item = data.examinationList[i];
                var curTime = moment(data.stime);
                var startTime = moment(item.startTime, "YYYY-MM-DD HH:mm:ss");
                var endTime = moment(item.endTime, "YYYY-MM-DD HH:mm:ss");
                if (curTime.isBefore(startTime)) {
                    //不可修改
                    item["flag"] = 0;
                } else if (curTime.isBetween(startTime, endTime)) {
                    item["flag"] = 1;
                } else if (curTime.isAfter(endTime)) {
                    //完成
                    item["flag"] = 2;
                }
            }
            self.vm.examinationList = data.examinationList;
            $("body").show();
        });
    },
    httpDeleteClassTestPaper: function(id) {
        var self = this;
        var params = {
            classTestPaperId: id
        };
        J.ajax({ url: "/examination/deleteClassTestPaper", type: 'POST' }, params, function(data) {
            self.httpTestPaperList();

        });
    }

});
var f = new examCenterManage();
