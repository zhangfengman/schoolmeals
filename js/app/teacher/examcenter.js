var ExamCenter = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.initAvalon();
        this.bindEvent();
        this.httpTestPaperList();
    },
    initAvalon: function() {
        var self = this;
        var myclass = store.get("myclass");
        this.vm = avalon.define({
            $id: "examcenter",
            myclass:myclass,
            examinationList: [],
            edit: function(id) {
                J.goPage("examrelease.html", { paperid: id });
            },
            del: function(id) {
                self.httpDeleteClassTestPaper(id);
            },
            markscore: function(id) {
                J.goPage("coursescore.html", { testpaperid: id,sourcetype:2});
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
    bindEvent: function() {
        var self = this;
        $(".class-body").on("click", ".user-icon", function() {
            J.goPage("lessoncenter.html");
        });
        $(".lesson_step_tab").on("click", "li", function() {
            var href = $(this).attr("data-href");
            if (href) {
                J.goPage(href, { classid: self.classId });
            }

        });

    },
    httpTestPaperList: function() {
        var self = this;
        var params = {
            classId: self.classId
        };
        J.ajax({ url: "/examination/getClassTestPaperList", type: 'POST' }, params, function(data) {
            $('#myModal').modal('hide');
            $("body").show();
            self.vm.examinationList = [];
            //处理状态
            for (var i = 0; i < data.examinationList.length; i++) {
                var item = data.examinationList[i];
                var curTime =  moment(data.stime);
                var startTime = moment(item.startTime,"YYYY-MM-DD HH:mm:ss");
                var endTime = moment(item.endTime,"YYYY-MM-DD HH:mm:ss");
                if(curTime.isBefore(startTime)){
                    //不可修改
                    item["flag"] = 0;
                }else if(curTime.isBetween(startTime,endTime)){
                    item["flag"] = 1;
                }else if(curTime.isAfter(endTime)){
                    //完成
                    item["flag"] = 2;
                }
            }
            self.vm.examinationList = data.examinationList;

        });
    }
});
var f = new ExamCenter();
